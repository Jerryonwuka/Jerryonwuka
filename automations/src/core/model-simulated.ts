/**
 * A deterministic stand-in for the model.
 *
 * This exists for the same reason a payments integration has a test mode: you
 * need to exercise the engine — retries, replay, budgets, logging — without
 * spending tokens or waiting on the network, and CI needs a run it can assert
 * against. It is not a quality signal about the real agent.
 *
 * Strategy: call each unused read tool once, then fan out one write per record
 * the reads returned, then stop. Arguments are filled from the record, falling
 * back to the schema's "x-sample" hint.
 */
import type { Json, ModelClient, ModelMessage, ModelTurn, ToolDef } from './types.ts';

const READ_HINTS = ['find', 'list', 'search', 'get', 'research'];

export function simulatedModel(): ModelClient {
  let counter = 0;
  const nextId = () => `sim_${++counter}`;

  return {
    id: 'simulated',
    async complete({ messages, tools }): Promise<ModelTurn> {
      const used = usedTools(messages);
      const usage = { inputTokens: estimateTokens(messages), outputTokens: 120 };

      const reads = tools.filter((t) => isRead(t.name) && !used.has(t.name));
      if (reads.length > 0) {
        const tool = reads[0]!;
        return {
          text: `Calling ${tool.name} to gather records.`,
          toolCalls: [{ id: nextId(), name: tool.name, input: sampleInput(tool) }],
          usage, stop: 'tool_use',
        };
      }

      const writes = tools.filter((t) => !isRead(t.name) && !used.has(t.name));
      const records = recordsFrom(messages);
      const pending = records.filter((r) => !used.has(writeKey(r)));

      if (writes.length > 0 && pending.length > 0) {
        const tool = writes[0]!;
        const batch = pending.slice(0, 6);

        // A tool taking an array of objects wants one batched call, not one
        // call per record.
        const batchParam = arrayParamOf(tool);
        if (batchParam) {
          return {
            text: `Submitting ${batch.length} record(s) to ${tool.name}.`,
            toolCalls: [{
              id: nextId(), name: tool.name,
              input: { ...sampleInput(tool), [batchParam]: batch },
            }],
            usage, stop: 'tool_use',
          };
        }

        return {
          text: `Acting on ${batch.length} record(s) via ${tool.name}.`,
          toolCalls: batch.map((record) => ({
            id: nextId(), name: tool.name, input: fillFrom(tool, record),
          })),
          usage, stop: 'tool_use',
        };
      }

      return {
        text: `Simulated run complete. ${records.length} record(s) processed.`,
        toolCalls: [], usage, stop: 'end_turn',
      };
    },
  };
}

const isRead = (name: string) => READ_HINTS.some((h) => name.includes(h));
const writeKey = (r: Json) => `record:${String(r.id ?? r.email ?? JSON.stringify(r))}`;

function usedTools(messages: ModelMessage[]): Set<string> {
  const used = new Set<string>();
  for (const m of messages) {
    for (const block of m.content) {
      if (block.type !== 'tool_use') continue;
      used.add(block.name);
      // Track which records a call consumed, so the next turn moves on —
      // whether they were passed singly or as a batch array.
      const input = block.input as Json;
      const id = input.id ?? input.prospect_id;
      if (id) used.add(`record:${String(id)}`);
      for (const value of Object.values(input)) {
        if (!Array.isArray(value)) continue;
        for (const item of value) {
          if (item && typeof item === 'object' && 'id' in item) {
            used.add(`record:${String((item as Json).id)}`);
          }
        }
      }
    }
  }
  return used;
}

/** Name of the first parameter that takes an array of objects, if any. */
function arrayParamOf(tool: ToolDef): string | null {
  for (const [key, spec] of Object.entries(props(tool))) {
    const items = spec.items as Json | undefined;
    if (spec.type === 'array' && items?.type === 'object') return key;
  }
  return null;
}

/** Pull every object carrying an `id` out of prior tool results. */
function recordsFrom(messages: ModelMessage[]): Json[] {
  const out: Json[] = [];
  for (const m of messages) {
    for (const block of m.content) {
      if (block.type !== 'tool_result' || block.isError) continue;
      let parsed: unknown;
      try { parsed = JSON.parse(block.content); } catch { continue; }
      for (const candidate of flatten(parsed)) {
        if (candidate && typeof candidate === 'object' && 'id' in candidate) {
          out.push(candidate as Json);
        }
      }
    }
  }
  return dedupeById(out);
}

function flatten(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (value && typeof value === 'object') {
    const nested = Object.values(value as Json).filter((v) => Array.isArray(v));
    return [value, ...nested.flatMap(flatten)];
  }
  return [];
}

function dedupeById(records: Json[]): Json[] {
  const seen = new Set<string>();
  return records.filter((r) => {
    const key = String(r.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function props(tool: ToolDef): Record<string, Json> {
  return (tool.input_schema.properties as Record<string, Json> | undefined) ?? {};
}

function sampleInput(tool: ToolDef): Json {
  const out: Json = {};
  for (const [key, spec] of Object.entries(props(tool))) {
    const sample = spec['x-sample'] ?? spec.default;
    if (sample !== undefined) out[key] = sample;
  }
  return out;
}

/** Map a record's fields onto a tool's parameters by name, then fill gaps. */
function fillFrom(tool: ToolDef, record: Json): Json {
  const out = sampleInput(tool);
  for (const key of Object.keys(props(tool))) {
    if (record[key] !== undefined) out[key] = record[key];
  }
  if ('prospect_id' in props(tool) && record.id !== undefined) out.prospect_id = record.id;
  return out;
}

function estimateTokens(messages: ModelMessage[]): number {
  const chars = JSON.stringify(messages).length;
  return Math.ceil(chars / 4);
}
