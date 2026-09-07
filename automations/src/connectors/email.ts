/**
 * Outbound email — the only action here that can embarrass you in public, so
 * it carries the compliance machinery rather than trusting the model:
 *
 *  - suppression list checked before every send
 *  - unsubscribe line and postal address appended to the body (CAN-SPAM)
 *  - dryRun short-circuits the provider call
 *
 * Deliverability is infrastructure, not code: send from a subdomain you warmed
 * up, with SPF/DKIM/DMARC set, or this lands in spam no matter how good the copy.
 */
import { randomUUID } from 'node:crypto';
import { assertContactable } from '../core/policy.ts';
import type { Connector, Json } from '../core/types.ts';

export function emailConnector(driver = 'dryrun'): Connector {
  return {
    id: 'email',
    label: 'Email',
    auth: driver === 'resend'
      ? { kind: 'apiKey', env: ['RESEND_API_KEY', 'EMAIL_FROM', 'EMAIL_POSTAL_ADDRESS'] }
      : { kind: 'none', env: [] },
    actions: [
      {
        name: 'email.send',
        summary:
          'Send one email to a prospect. Write specifically about the problem named in '
          + 'their notes — no generic pitches, no invented facts about their business, '
          + 'no fake mutual connections. Under 120 words, one clear ask.',
        effect: 'external',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['prospect_id', 'subject', 'body'],
          properties: {
            prospect_id: { type: 'string' },
            subject: { type: 'string', 'x-sample': 'Quick question about your quoting process' },
            body: {
              type: 'string',
              'x-sample':
                'Hi — I noticed your team still handles quoting by hand. I build small '
                + 'automations that turn that into a same-day reply. Worth a 15-minute call?',
            },
          },
        },
        async run(input: Json, ctx) {
          const prospect = ctx.db.getProspect(String(input.prospect_id));
          if (!prospect) throw new Error(`no prospect "${input.prospect_id}"`);
          assertContactable(prospect, ctx);

          const from = ctx.secrets.get('EMAIL_FROM') ?? 'Automations <dryrun@localhost>';
          const postal = ctx.secrets.get('EMAIL_POSTAL_ADDRESS') ?? '[postal address not configured]';
          const body = `${String(input.body).trim()}\n\n--\n`
            + `Reply STOP and I won't contact you again.\n${postal}`;

          let providerId: string | null = null;
          if (ctx.dryRun || driver === 'dryrun') {
            providerId = `dryrun_${randomUUID().slice(0, 8)}`;
            ctx.log.info(`email(dryrun) -> ${prospect.email}: ${input.subject}`);
          } else if (driver === 'resend') {
            const key = ctx.secrets.require('RESEND_API_KEY');
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ from, to: prospect.email, subject: input.subject, text: body }),
            });
            if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
            providerId = ((await res.json()) as { id?: string }).id ?? null;
            ctx.log.info(`email -> ${prospect.email} (${providerId})`);
          } else {
            throw new Error(`unknown email driver "${driver}"`);
          }

          ctx.db.addMessage({
            id: `m_${randomUUID().slice(0, 8)}`, runId: ctx.runId, prospectId: prospect.id,
            direction: 'out', subject: String(input.subject), body,
            providerId, createdAt: new Date().toISOString(),
          });
          ctx.db.upsertProspect({ ...prospect, status: 'contacted' });
          return { sent: true, to: prospect.email, providerId };
        },
      },
      {
        name: 'email.list_replies',
        summary: 'Read inbound replies that have arrived for this run.',
        effect: 'read',
        input: {
          type: 'object', additionalProperties: false, required: [], properties: {},
        },
        async run(_input: Json, ctx) {
          const replies = ctx.db.listMessages(ctx.runId)
            .filter((m) => m.direction === 'in')
            .map((m) => {
              const p = ctx.db.getProspect(m.prospectId);
              return {
                id: m.prospectId, company: p?.company ?? '', status: p?.status ?? '',
                body: m.body, received_at: m.createdAt,
              };
            });
          return { replies, count: replies.length };
        },
      },
    ],
  };
}
