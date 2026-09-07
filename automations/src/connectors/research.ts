/**
 * Prospect research.
 *
 * dryrun - fixtures, so the pipeline runs with no keys.
 * serper - real search. Returns businesses, not verified emails: address
 *          discovery is a separate (and legally fussier) problem, so the
 *          action is honest about returning leads without addresses rather
 *          than inventing them.
 */
import type { Connector, Json } from '../core/types.ts';

const FIXTURES = [
  { name: 'Marcus Webb', company: 'Webb Plumbing', email: 'marcus@webbplumbing.example', notes: 'Quotes handled manually; 6 vans.' },
  { name: 'Tanya Morrison', company: 'Morrison Legal', email: 'tanya@morrisonlegal.example', notes: 'Intake and client quotes still manual.' },
  { name: 'Devon Clarke', company: 'Devon Clarke Electric', email: 'devon@clarke-electric.example', notes: 'No booking system on site.' },
  { name: 'Priya Nair', company: 'Nair Dental', email: 'priya@nairdental.example', notes: 'Reception overloaded with callbacks.' },
  { name: 'Jordan Reeves', company: 'Reeves Auto', email: 'jordan@reevesauto.example', notes: 'Paper job cards.' },
  { name: 'Chris Armitage', company: 'Armitage HVAC', email: 'chris@armitagehvac.example', notes: 'Follow-up handled ad hoc.' },
];

export function researchConnector(driver = 'dryrun'): Connector {
  return {
    id: 'research',
    label: 'Prospect research',
    auth: driver === 'serper'
      ? { kind: 'apiKey', env: ['SERPER_API_KEY'] }
      : { kind: 'none', env: [] },
    actions: [
      {
        name: 'research.find_prospects',
        summary:
          'Find small businesses in a niche that plausibly have the manual-process '
          + 'problem you solve. Returns prospects with an id you pass to other tools. '
          + 'Prefer a specific niche and location over a broad one.',
        effect: 'read',
        input: {
          type: 'object',
          additionalProperties: false,
          required: ['niche', 'location', 'limit'],
          properties: {
            niche: { type: 'string', description: 'e.g. "residential plumbing"', 'x-sample': 'home services' },
            location: { type: 'string', description: 'City or region', 'x-sample': 'Lagos' },
            limit: { type: 'integer', description: 'Max prospects, 1-25', 'x-sample': 6 },
          },
        },
        async run(input: Json, ctx) {
          const niche = String(input.niche);
          const location = String(input.location);
          const limit = Math.min(Math.max(Number(input.limit) || 6, 1), 25);

          if (driver === 'serper') {
            const key = ctx.secrets.require('SERPER_API_KEY');
            const res = await fetch('https://google.serper.dev/search', {
              method: 'POST',
              headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: `${niche} ${location}`, num: limit }),
            });
            if (!res.ok) throw new Error(`serper ${res.status}: ${await res.text()}`);
            const data = await res.json() as { organic?: { title: string; link: string; snippet?: string }[] };
            const prospects = (data.organic ?? []).slice(0, limit).map((r, i) => ({
              id: `p_${Date.now().toString(36)}_${i}`,
              name: '', company: r.title, email: '', niche,
              notes: `${r.snippet ?? ''} (${r.link})`.trim(),
            }));
            ctx.log.info(`research: ${prospects.length} leads for "${niche}" in ${location}`);
            return {
              prospects,
              warning: prospects.some((p) => !p.email)
                ? 'Some leads have no verified email. Do not guess addresses; skip or enrich them first.'
                : undefined,
            };
          }

          const prospects = FIXTURES.slice(0, limit).map((f, i) => ({
            id: `p_${ctx.runId}_${i}`, ...f, niche,
          }));
          ctx.log.info(`research(dryrun): ${prospects.length} fixture prospects for "${niche}"`);
          return { prospects };
        },
      },
    ],
  };
}
