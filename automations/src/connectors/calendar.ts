/**
 * Booking. Cal.com's v1 API; dryrun records the booking locally so the
 * pipeline is exercisable without an account.
 */
import { randomUUID } from 'node:crypto';
import { assertContactable } from '../core/policy.ts';
import type { Connector, Json } from '../core/types.ts';

export function calendarConnector(driver = 'dryrun'): Connector {
  return {
    id: 'calendar',
    label: 'Calendar',
    auth: driver === 'calcom'
      ? { kind: 'apiKey', env: ['CALCOM_API_KEY', 'CALCOM_EVENT_TYPE_ID'] }
      : { kind: 'none', env: [] },
    actions: [
      {
        name: 'calendar.book',
        summary: 'Book an intro call with a prospect who asked for one. '
          + 'Only call this after they have actually agreed to a call.',
        effect: 'external',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['prospect_id', 'starts_at'],
          properties: {
            prospect_id: { type: 'string' },
            starts_at: {
              type: 'string',
              description: 'ISO 8601 start time, UTC.',
              'x-sample': new Date(Date.now() + 86_400_000).toISOString(),
            },
          },
        },
        async run(input: Json, ctx) {
          const prospect = ctx.db.getProspect(String(input.prospect_id));
          if (!prospect) throw new Error(`no prospect "${input.prospect_id}"`);
          // A booking puts a calendar invite in someone's inbox: same bar as a send.
          assertContactable(prospect, ctx);
          const startsAt = String(input.starts_at);
          if (Number.isNaN(Date.parse(startsAt))) {
            throw new Error(`starts_at "${startsAt}" is not a valid ISO 8601 timestamp`);
          }

          let bookingId: string;
          if (ctx.dryRun || driver === 'dryrun') {
            bookingId = `dryrun_${randomUUID().slice(0, 8)}`;
            ctx.log.info(`calendar(dryrun): ${prospect.company} @ ${startsAt}`);
          } else if (driver === 'calcom') {
            const key = ctx.secrets.require('CALCOM_API_KEY');
            const eventTypeId = Number(ctx.secrets.require('CALCOM_EVENT_TYPE_ID'));
            const res = await fetch(`https://api.cal.com/v1/bookings?apiKey=${encodeURIComponent(key)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventTypeId,
                start: startsAt,
                responses: {
                  name: prospect.name || prospect.company,
                  email: prospect.email,
                },
                timeZone: 'UTC',
                language: 'en',
                metadata: { prospectId: prospect.id, runId: ctx.runId },
              }),
            });
            if (!res.ok) throw new Error(`cal.com ${res.status}: ${await res.text()}`);
            bookingId = String(((await res.json()) as { id?: unknown }).id ?? 'unknown');
            ctx.log.info(`calendar: booked ${prospect.company} (${bookingId})`);
          } else {
            throw new Error(`unknown calendar driver "${driver}"`);
          }

          ctx.db.upsertProspect({
            ...prospect, status: 'booked',
            notes: `${prospect.notes}\nCall booked ${startsAt} (${bookingId})`.trim(),
          });
          return { booked: true, bookingId, startsAt };
        },
      },
    ],
  };
}
