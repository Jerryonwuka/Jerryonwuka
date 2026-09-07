/**
 * Core contracts. Everything else in this package is an implementation of
 * something declared here.
 *
 * The shapes are deliberately storage- and engine-agnostic: the slice runs on
 * SQLite and an in-process runner, but a Postgres + Inngest/Temporal backend
 * implements these same interfaces without touching connectors or workflows.
 */

export type Json = Record<string, unknown>;
export type JsonSchema = Record<string, unknown>;

export interface Logger {
  info(msg: string, data?: Json): void;
  warn(msg: string, data?: Json): void;
  error(msg: string, data?: Json): void;
}

/**
 * Secret access. Here it reads process.env; in the multi-tenant build this
 * becomes a per-tenant encrypted vault lookup, and nothing above it changes.
 */
export interface Secrets {
  get(key: string): string | undefined;
  require(key: string): string;
}

export interface ActionContext {
  runId: string;
  log: Logger;
  secrets: Secrets;
  /** When true, side-effecting actions must simulate rather than act. */
  dryRun: boolean;
  db: Database;
}

/**
 * A connector action is the single definition consumed by three things:
 * the agent (as a Claude tool), workflow code (as ctx.call), and the UI
 * (as a node in the builder). Declaring it twice is how these systems rot.
 */
export interface Action<I = any, O = any> {
  /** Namespaced: "email.send". Becomes the tool name given to the model. */
  name: string;
  /** Written for the model, not for docs. This is prompt surface. */
  summary: string;
  input: JsonSchema;
  /**
   * 'read'     - no consequence; safe to retry freely.
   * 'internal' - changes our own state (CRM row, status). Durable, but cheap
   *              and reversible, so it does not consume the run's budget.
   * 'external' - visible outside the system: an email leaves, a call is
   *              booked, money moves. Counted against maxExternal, and the
   *              point an approval gate would intercept.
   */
  effect: 'read' | 'internal' | 'external';
  run(input: I, ctx: ActionContext): Promise<O>;
}

export interface Connector {
  id: string;
  label: string;
  /** Documents what the connector needs; surfaced by `cli doctor`. */
  auth: { kind: 'none' | 'apiKey' | 'oauth2'; env: string[] };
  actions: Action[];
}

// --- Model abstraction -------------------------------------------------

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Json }
  | { type: 'tool_result'; toolUseId: string; content: string; isError?: boolean };

export interface ModelMessage {
  role: 'user' | 'assistant';
  content: ContentBlock[];
}

export interface ToolDef {
  name: string;
  description: string;
  input_schema: JsonSchema;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
}

export interface ModelTurn {
  text: string;
  toolCalls: { id: string; name: string; input: Json }[];
  usage: Usage;
  stop: 'end_turn' | 'tool_use' | 'refusal' | 'max_tokens';
  refusal?: string;
}

export interface ModelClient {
  id: string;
  complete(req: {
    system: string;
    messages: ModelMessage[];
    tools: ToolDef[];
    maxTokens?: number;
  }): Promise<ModelTurn>;
}

// --- Workflow / run contracts -----------------------------------------

export interface AgentLimits {
  /** Hard stop on model turns; prevents a stuck agent burning tokens. */
  maxTurns: number;
  /** Blast radius. Caps externally-visible actions (emails sent, calls booked). */
  maxExternal: number;
}

export interface AgentRequest {
  /** Stable label; used to key the agent's durable steps. */
  name: string;
  system: string;
  prompt: string;
  /** Action names the agent may call. Least privilege, per agent step. */
  allow: string[];
  limits?: Partial<AgentLimits>;
}

export interface AgentResult {
  text: string;
  turns: number;
  external: number;
  usage: Usage;
  stoppedBy: 'end_turn' | 'max_turns' | 'max_external' | 'refusal';
}

export interface RunContext {
  runId: string;
  goal: string;
  log: Logger;
  secrets: Secrets;
  db: Database;
  dryRun: boolean;
  /**
   * Durable step. Executes fn at most once per (run, key): on replay the
   * recorded output is returned without re-running. Every side effect in a
   * workflow must go through this or a resumed run will duplicate it.
   */
  step<T>(key: string, name: string, fn: () => Promise<T>): Promise<T>;
  /**
   * Invoke a connector action as a durable step.
   *
   * `fresh: true` opts out of memoization for polling reads — on a resumed
   * run you want the current inbox, not the empty one you saw yesterday.
   * Only permitted for non-external actions; a fresh send would duplicate.
   */
  call<O = unknown>(action: string, input: Json, opts?: { key?: string; fresh?: boolean }): Promise<O>;
  /** Run a bounded agent loop whose tool calls are themselves durable steps. */
  agent(req: AgentRequest): Promise<AgentResult>;
}

export interface Workflow {
  id: string;
  label: string;
  /** Default goal, overridable per run. */
  goal: string;
  run(ctx: RunContext): Promise<Json>;
}

// --- Storage ----------------------------------------------------------

export interface StepRecord {
  runId: string;
  key: string;
  name: string;
  status: 'running' | 'ok' | 'failed';
  output: unknown;
  error: string | null;
  attempts: number;
}

export interface RunRecord {
  id: string;
  workflow: string;
  goal: string;
  status: 'running' | 'ok' | 'failed';
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface Database {
  createRun(r: Omit<RunRecord, 'finishedAt' | 'error' | 'inputTokens' | 'outputTokens' | 'costUsd'>): void;
  finishRun(id: string, status: 'ok' | 'failed', error?: string | null): void;
  /** Absolute set, not increment: totals are derived from the step record,
   *  so recomputing after a replay cannot double-count. */
  setUsage(runId: string, usage: Usage, costUsd: number): void;
  getRun(id: string): RunRecord | null;
  listRuns(limit: number): RunRecord[];
  getStep(runId: string, key: string): StepRecord | null;
  startStep(runId: string, key: string, name: string): void;
  finishStep(runId: string, key: string, status: 'ok' | 'failed', output: unknown, error: string | null): void;
  listSteps(runId: string): StepRecord[];
  event(runId: string, level: string, msg: string, data?: Json): void;
  listEvents(runId: string): { ts: string; level: string; msg: string; data: Json }[];
  /** Generic record store standing in for the CRM tables. */
  upsertProspect(p: Prospect): void;
  getProspect(id: string): Prospect | null;
  listProspects(runId?: string): Prospect[];
  addMessage(m: OutboundMessage): void;
  listMessages(runId: string): OutboundMessage[];
  /** Opt-out list, checked before every send and persisted across runs. */
  suppress(email: string, reason: string): void;
  isSuppressed(email: string): boolean;
  close(): void;
}

export interface Prospect {
  id: string;
  runId: string;
  name: string;
  company: string;
  email: string;
  niche: string;
  /** new -> contacted -> replied -> booked | objection | declined | paid */
  status: string;
  notes: string;
  amountUsd: number;
}

export interface OutboundMessage {
  id: string;
  runId: string;
  prospectId: string;
  direction: 'out' | 'in';
  subject: string;
  body: string;
  providerId: string | null;
  createdAt: string;
}
