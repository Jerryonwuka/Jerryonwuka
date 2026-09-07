/**
 * The agent loop.
 *
 * Two things make this different from a plain tool-use loop, and both matter
 * more as the platform grows:
 *
 *  1. Every tool call is a durable step. A crash mid-loop resumes without
 *     re-sending anything the agent already sent.
 *  2. The loop is bounded. maxTurns caps token spend; maxExternal caps blast
 *     radius. An agent with a Gmail tool and no send budget is a liability.
 */
import type {
  AgentLimits, AgentRequest, AgentResult, ContentBlock, ModelClient,
  ModelMessage, ModelTurn, RunContext, Usage,
} from './types.ts';
import { actionName, toolName, type Registry } from './registry.ts';

const DEFAULT_LIMITS: AgentLimits = { maxTurns: 12, maxExternal: 25 };

export interface AgentDeps {
  ctx: RunContext;
  model: ModelClient;
  registry: Registry;
}

export async function runAgent(req: AgentRequest, deps: AgentDeps): Promise<AgentResult> {
  const { ctx, model, registry } = deps;
  const limits = { ...DEFAULT_LIMITS, ...req.limits };
  const tools = registry.toolDefs(req.allow);

  const messages: ModelMessage[] = [
    { role: 'user', content: [{ type: 'text', text: req.prompt }] },
  ];

  const usage: Usage = { inputTokens: 0, outputTokens: 0 };
  let external = 0;
  let text = '';
  let stoppedBy: AgentResult['stoppedBy'] = 'end_turn';
  let turn = 0;

  while (turn < limits.maxTurns) {
    turn++;
    // The model turn is itself a durable step: resuming a run replays the
    // trajectory from the record instead of paying for the reasoning twice.
    const reply = await ctx.step<ModelTurn>(
      `agent:${req.name}:turn:${turn}`,
      `${req.name} model turn ${turn}`,
      () => model.complete({ system: req.system, messages, tools, maxTokens: 8000 }),
    );

    usage.inputTokens += reply.usage.inputTokens;
    usage.outputTokens += reply.usage.outputTokens;
    if (reply.text) text = reply.text;

    if (reply.stop === 'refusal') {
      ctx.db.event(ctx.runId, 'warn', 'model declined the request', { agent: req.name });
      stoppedBy = 'refusal';
      text = reply.refusal ?? text;
      break;
    }

    if (reply.toolCalls.length === 0) {
      stoppedBy = 'end_turn';
      break;
    }

    messages.push({
      role: 'assistant',
      content: [
        ...(reply.text ? [{ type: 'text' as const, text: reply.text }] : []),
        ...reply.toolCalls.map((c) => ({
          type: 'tool_use' as const, id: c.id, name: c.name, input: c.input,
        })),
      ],
    });

    const results: ContentBlock[] = [];
    let budgetExhausted = false;

    for (const call of reply.toolCalls) {
      const name = actionName(call.name);

      if (!req.allow.includes(name)) {
        // The model asked for something outside this step's grant. Refusing in
        // the tool result (rather than throwing) lets it correct course.
        results.push({
          type: 'tool_result', toolUseId: call.id, isError: true,
          content: `Tool "${call.name}" is not available to you in this step.`,
        });
        continue;
      }

      const action = registry.get(name);
      if (action.effect === 'external') {
        if (external >= limits.maxExternal) {
          budgetExhausted = true;
          results.push({
            type: 'tool_result', toolUseId: call.id, isError: true,
            content: `Budget of ${limits.maxExternal} outbound actions reached. `
              + 'Stop and summarize what you did.',
          });
          continue;
        }
        external++;
      }

      try {
        // Keyed by tool_use id: stable across a resume of the same trajectory.
        const output = await ctx.step(
          `agent:${req.name}:${call.id}`,
          name,
          () => registry.invoke(name, call.input, {
            runId: ctx.runId, log: ctx.log, secrets: ctx.secrets,
            dryRun: ctx.dryRun, db: ctx.db,
          }),
        );
        results.push({
          type: 'tool_result', toolUseId: call.id, content: JSON.stringify(output ?? null),
        });
      } catch (err) {
        // Tool failures go back to the model as errors, not exceptions: it can
        // often recover (fix an argument, try a different prospect).
        results.push({
          type: 'tool_result', toolUseId: call.id, isError: true,
          content: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // All tool results must land in a single user message; splitting them
    // teaches the model to stop calling tools in parallel.
    messages.push({ role: 'user', content: results });

    if (budgetExhausted) {
      stoppedBy = 'max_external';
      // Give it one turn to summarize, then stop regardless.
      const final = await ctx.step<ModelTurn>(
        `agent:${req.name}:summary`,
        `${req.name} summary turn`,
        () => model.complete({ system: req.system, messages, tools: [], maxTokens: 1000 }),
      );
      usage.inputTokens += final.usage.inputTokens;
      usage.outputTokens += final.usage.outputTokens;
      if (final.text) text = final.text;
      break;
    }
  }

  if (turn >= limits.maxTurns && stoppedBy === 'end_turn') stoppedBy = 'max_turns';

  ctx.db.event(ctx.runId, 'info', `agent finished: ${req.name}`, {
    turns: turn, external, stoppedBy,
    inputTokens: usage.inputTokens, outputTokens: usage.outputTokens,
  });

  return { text, turns: turn, external, usage, stoppedBy };
}

export { toolName };
