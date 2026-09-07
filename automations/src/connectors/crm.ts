/**
 * The pipeline of record. Backed by our own tables, so these are 'internal'
 * effects: durable and replayable, but they do not consume the run's outbound
 * budget the way a sent email does.
 */
import type { Connector, Json, Prospect } from '../core/types.ts';

export function crmConnector(): Connector {
  return {
    id: 'crm',
    label: 'Pipeline',
    auth: { kind: 'none', env: [] },
    actions: [
      {
        name: 'crm.save_prospects',
        summary: 'Save prospects to the pipeline so later steps and later runs can see them.',
        effect: 'internal',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['prospects'],
          properties: {
            prospects: {
              type: 'array',
              description: 'Prospects from research.find_prospects.',
              items: {
                type: 'object',
                required: ['id', 'company'],
                properties: {
                  id: { type: 'string' }, name: { type: 'string' },
                  company: { type: 'string' }, email: { type: 'string' },
                  niche: { type: 'string' }, notes: { type: 'string' },
                },
              },
            },
          },
        },
        async run(input: Json, ctx) {
          const rows = (input.prospects as Json[]) ?? [];
          let saved = 0;
          for (const row of rows) {
            if (!row.id || !row.company) continue;
            ctx.db.upsertProspect({
              id: String(row.id), runId: ctx.runId,
              name: String(row.name ?? ''), company: String(row.company),
              email: String(row.email ?? ''), niche: String(row.niche ?? ''),
              status: 'new', notes: String(row.notes ?? ''), amountUsd: 0,
            });
            saved++;
          }
          ctx.log.info(`crm: saved ${saved} prospect(s)`);
          return { saved };
        },
      },
      {
        name: 'crm.list_prospects',
        summary: 'List pipeline prospects, optionally filtered by status '
          + '(new, contacted, replied, booked, objection, declined, paid).',
        effect: 'read',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              description: 'Status to filter by, or "any".',
              'x-sample': 'any',
            },
          },
        },
        async run(input: Json, ctx) {
          const status = String(input.status ?? 'any');
          const all = ctx.db.listProspects(ctx.runId);
          const rows = status === 'any' ? all : all.filter((p: Prospect) => p.status === status);
          return { prospects: rows, count: rows.length };
        },
      },
      {
        name: 'crm.update_prospect',
        summary: 'Update a prospect\'s status, notes, or deal amount.',
        effect: 'internal',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['prospect_id', 'status'],
          properties: {
            prospect_id: { type: 'string' },
            status: { type: 'string', 'x-sample': 'contacted' },
            notes: { type: 'string' },
            amount_usd: { type: 'number' },
          },
        },
        async run(input: Json, ctx) {
          const id = String(input.prospect_id);
          const existing = ctx.db.getProspect(id);
          if (!existing) throw new Error(`no prospect "${id}"`);
          const updated: Prospect = {
            ...existing,
            status: String(input.status),
            notes: input.notes !== undefined ? String(input.notes) : existing.notes,
            amountUsd: input.amount_usd !== undefined ? Number(input.amount_usd) : existing.amountUsd,
          };
          ctx.db.upsertProspect(updated);
          return { id, status: updated.status };
        },
      },
    ],
  };
}
