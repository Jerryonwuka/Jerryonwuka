/**
 * Durable execution.
 *
 * The one rule this enforces: a step body runs at most once per (run, key).
 * Everything a workflow does that touches the outside world goes through
 * step(), so crashing halfway and resuming does not send the same email twice.
 *
 * This is the piece a real deployment swaps for Inngest or Temporal. The
 * RunContext surface stays identical; only this file is replaced.
 */
import { randomUUID } from 'node:crypto';
import type {
  AgentRequest, AgentResult, Database, Json, Logger, ModelClient, RunContext,
  Secrets, Usage, Workflow,
} from './types.ts';
import type { Registry } from './registry.ts';
import { runAgent } from './agent.ts';
import { priceOf } from './pricing.ts';

export interface RetryPolicy {
  attempts: number;
  /** Base delay in ms; doubles each attempt. */
  backoffMs: number;
}

const DEFAULT_RETRY: RetryPolicy = { attempts: 3, backoffMs: 250 };

export class StepFailed extends Error {
  readonly key: string;
  readonly cause: unknown;
  constructor(key: string, cause: unknown) {
    super(`step "${key}" failed: ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = 'StepFailed';
    this.key = key;
    this.cause = cause;
  }
}

export interface RunnerOptions {
  db: Database;
  registry: Registry;
  model: ModelClient;
  secrets: Secrets;
  log: Logger;
  dryRun: boolean;
  retry?: RetryPolicy;
  /** Reuse an existing run id to resume it. */
  runId?: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function executeWorkflow(
  workflow: Workflow,
  goal: string,
  opts: RunnerOptions,
): Promise<{ runId: string; result: Json | null; error: Error | null }> {
  const { db, log } = opts;
  const retry = opts.retry ?? DEFAULT_RETRY;
  const runId = opts.runId ?? `run_${randomUUID().slice(0, 8)}`;
  const resuming = !!opts.runId && !!db.getRun(runId);

  if (!resuming) {
    db.createRun({
      id: runId, workflow: workflow.id, goal, status: 'running',
      startedAt: new Date().toISOString(),
    });
  }
  db.event(runId, 'info', resuming ? 'run resumed' : 'run started', { workflow: workflow.id, goal });

  // Budget counters are per-process; the durable record of what was actually
  // sent lives in the steps table, which is what makes resume safe.
  let external = 0;

  const ctx: RunContext = {
    runId,
    goal,
    log,
    secrets: opts.secrets,
    db,
    dryRun: opts.dryRun,

    async step<T>(key: string, name: string, fn: () => Promise<T>): Promise<T> {
      const existing = db.getStep(runId, key);
      if (existing?.status === 'ok') {
        db.event(runId, 'info', `step replayed: ${name}`, { key });
        return existing.output as T;
      }

      let lastError: unknown;
      for (let attempt = 1; attempt <= retry.attempts; attempt++) {
        db.startStep(runId, key, name);
        try {
          const out = await fn();
          db.finishStep(runId, key, 'ok', out ?? null, null);
          db.event(runId, 'info', `step ok: ${name}`, { key, attempt });
          return out;
        } catch (err) {
          lastError = err;
          const msg = err instanceof Error ? err.message : String(err);
          db.event(runId, 'warn', `step failed: ${name}`, { key, attempt, error: msg });
          if (attempt < retry.attempts) await sleep(retry.backoffMs * 2 ** (attempt - 1));
        }
      }
      const msg = lastError instanceof Error ? lastError.message : String(lastError);
      db.finishStep(runId, key, 'failed', null, msg);
      throw new StepFailed(key, lastError);
    },

    async call<O>(actionName: string, input: Json, o?: { key?: string; fresh?: boolean }): Promise<O> {
      const action = opts.registry.get(actionName);
      if (o?.fresh && action.effect === 'external') {
        throw new Error(
          `${actionName} is an external action and cannot be called with fresh: true — `
          + 'a re-executed send duplicates it',
        );
      }
      const suffix = o?.fresh ? `:${Date.now().toString(36)}` : '';
      const key = o?.key ?? `call:${actionName}:${stableHash(input)}${suffix}`;
      if (action.effect === 'external') external++;
      return ctx.step<O>(key, actionName, () =>
        opts.registry.invoke(actionName, input, {
          runId, log, secrets: opts.secrets, dryRun: opts.dryRun, db,
        }) as Promise<O>);
    },

    async agent(req: AgentRequest): Promise<AgentResult> {
      const result = await runAgent(req, { ctx, model: opts.model, registry: opts.registry });
      external += result.external;
      return result;
    },
  };

  try {
    const result = await workflow.run(ctx);
    recordUsage(db, runId, opts.model.id);
    db.finishRun(runId, 'ok');
    db.event(runId, 'info', 'run finished', { external });
    return { runId, result, error: null };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    recordUsage(db, runId, opts.model.id);
    db.finishRun(runId, 'failed', e.message);
    db.event(runId, 'error', 'run failed', { error: e.message });
    return { runId, result: null, error: e };
  }
}

/**
 * Token totals are derived by summing the recorded model-turn steps rather
 * than incremented as they happen, so a replayed run reports the same numbers
 * instead of counting its own history twice.
 */
function recordUsage(db: Database, runId: string, modelId: string): void {
  const total: Usage = { inputTokens: 0, outputTokens: 0 };
  for (const step of db.listSteps(runId)) {
    const usage = (step.output as { usage?: Usage } | null)?.usage;
    if (!usage) continue;
    total.inputTokens += usage.inputTokens ?? 0;
    total.outputTokens += usage.outputTokens ?? 0;
  }
  db.setUsage(runId, total, priceOf(modelId, total));
}

/**
 * Deterministic key for an action call, so an identical call on resume hits
 * the recorded result instead of firing again. Order-insensitive over keys.
 */
export function stableHash(value: unknown): string {
  const json = JSON.stringify(sortDeep(value));
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') {
    return Object.fromEntries(
      Object.entries(v as Json).sort(([a], [b]) => a.localeCompare(b))
        .map(([k, val]) => [k, sortDeep(val)]),
    );
  }
  return v;
}
