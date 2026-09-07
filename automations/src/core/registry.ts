/**
 * The connector registry.
 *
 * One action definition serves three consumers: the agent (as a Claude tool),
 * workflow code (as ctx.call), and — in the platform build — the visual
 * builder (as a node). Adding a connector never means touching the agent.
 */
import type { Action, ActionContext, Connector, Json, ToolDef } from './types.ts';

export class UnknownAction extends Error {
  constructor(name: string) {
    super(`unknown action "${name}"`);
    this.name = 'UnknownAction';
  }
}

export class Registry {
  readonly connectors: Connector[] = [];
  private readonly actions = new Map<string, Action>();

  register(connector: Connector): this {
    this.connectors.push(connector);
    for (const action of connector.actions) {
      if (this.actions.has(action.name)) {
        throw new Error(`duplicate action "${action.name}"`);
      }
      if (!action.name.startsWith(`${connector.id}.`)) {
        throw new Error(`action "${action.name}" must be namespaced under "${connector.id}."`);
      }
      this.actions.set(action.name, action);
    }
    return this;
  }

  get(name: string): Action {
    const action = this.actions.get(name);
    if (!action) throw new UnknownAction(name);
    return action;
  }

  has(name: string): boolean {
    return this.actions.has(name);
  }

  names(): string[] {
    return [...this.actions.keys()].sort();
  }

  /**
   * Claude tool definitions for a subset of actions. Callers pass an explicit
   * allow-list: an agent step should only ever see the tools it needs.
   * Tool names use "__" because the API rejects dots.
   */
  toolDefs(allow: string[]): ToolDef[] {
    return allow.map((name) => {
      const action = this.get(name);
      return {
        name: toolName(name),
        description: action.summary,
        input_schema: action.input,
      };
    });
  }

  invoke(name: string, input: Json, ctx: ActionContext): Promise<unknown> {
    const action = this.get(name);
    const problems = validate(action.input, input);
    if (problems.length) {
      return Promise.reject(new Error(`invalid input for ${name}: ${problems.join('; ')}`));
    }
    return action.run(input, ctx);
  }
}

export const toolName = (actionName: string) => actionName.replace(/\./g, '__');
export const actionName = (tool: string) => tool.replace(/__/g, '.');

/**
 * Minimal JSON Schema check: required keys and top-level types. The model is
 * told the schema and usually respects it, but a bad tool call must fail as a
 * clean, model-readable error rather than a crash inside a connector.
 */
export function validate(schema: Json, value: Json): string[] {
  const problems: string[] = [];
  const required = (schema.required as string[] | undefined) ?? [];
  const properties = (schema.properties as Record<string, Json> | undefined) ?? {};

  for (const key of required) {
    if (value[key] === undefined || value[key] === null) problems.push(`missing "${key}"`);
  }
  for (const [key, spec] of Object.entries(properties)) {
    const v = value[key];
    if (v === undefined || v === null) continue;
    const expected = spec.type as string | undefined;
    if (!expected) continue;
    const actual = Array.isArray(v) ? 'array' : typeof v;
    const ok = expected === 'integer' ? Number.isInteger(v) : actual === expected;
    if (!ok) problems.push(`"${key}" should be ${expected}, got ${actual}`);
  }
  return problems;
}
