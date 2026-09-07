/**
 * The workflow from the video, as a definition.
 *
 * Stages are separate agent calls rather than one long-running agent on
 * purpose: each stage gets only the tools it needs and its own budget, and
 * each is independently replayable. "Research" cannot send email even if the
 * model decides it would like to.
 *
 * Reply triage is written to be re-entered. In production a webhook wakes the
 * run; here `cli reply` records an inbound message and `cli resume` continues
 * the same run, replaying earlier stages from the record instead of redoing
 * them.
 */
import type { Json, Prospect, RunContext, Workflow } from '../core/types.ts';

const VOICE = `
You write like a competent freelancer, not a marketer. Rules:
- Reference the specific problem in the prospect's notes. If the notes do not
  support a claim, do not make it.
- Never invent facts about their business, mutual connections, or past contact.
- Under 120 words, one ask, no pressure tactics or fake scarcity.
- If a prospect has no verified email address, skip them and say so. Never guess
  an address.
`.trim();

export const outreach: Workflow = {
  id: 'outreach',
  label: 'Research -> cold outreach -> reply triage -> booking',
  goal:
    'Find small businesses running a manual process I could automate, send a '
    + 'short personal email to each, and book intro calls with anyone interested.',

  async run(ctx: RunContext): Promise<Json> {
    // Stage 1 — research. No outbound tools, so maxExternal is 0 by design.
    const research = await ctx.agent({
      name: 'research',
      system: `You research prospects for a one-person automation studio.\n${VOICE}`,
      prompt:
        `${ctx.goal}\n\n`
        + 'First pick one narrow niche where manual quoting, intake, or follow-up is '
        + 'common and the job value is high enough to justify a build. Find prospects '
        + 'in it, then save them to the pipeline. Explain your niche choice in one line.',
      allow: ['research.find_prospects', 'crm.save_prospects'],
      limits: { maxTurns: 6, maxExternal: 0 },
    });

    // Stage 2 — outreach, budgeted. maxExternal is the blast radius: if the
    // agent misbehaves, this is the number that bounds the damage.
    const sending = await ctx.agent({
      name: 'outreach',
      system: `You write cold outreach for a one-person automation studio.\n${VOICE}`,
      prompt:
        'Read the pipeline, then send one email per prospect with status "new". '
        + 'Each email must be specific to that prospect\'s notes. Do not contact '
        + 'anyone twice.',
      allow: ['crm.list_prospects', 'email.send'],
      limits: { maxTurns: 10, maxExternal: 6 },
    });

    // Stage 3 — triage. fresh: true because on a resumed run we need today's
    // replies, not the empty result recorded on the first pass.
    const inbox = await ctx.call<{ count: number }>('email.list_replies', {}, { fresh: true });

    let triageText = 'no replies yet';
    if (inbox.count > 0) {
      const triage = await ctx.agent({
        name: 'triage',
        system:
          'You triage replies to cold outreach. Classify each as interested, '
          + `objection, or not interested, then act on it.\n${VOICE}\n`
          + 'Anyone who asks to stop must be marked declined and never emailed again.',
        prompt:
          'Read the replies. For anyone interested, book an intro call at a sensible '
          + 'time in the next few working days and update their status. For an '
          + 'objection, reply once addressing it honestly — do not argue. For a '
          + 'refusal, mark them declined and send nothing.',
        allow: ['email.list_replies', 'calendar.book', 'email.send', 'crm.update_prospect'],
        limits: { maxTurns: 10, maxExternal: 6 },
      });
      triageText = triage.text;
    }

    // Stage 4 — the summary is computed from the pipeline, not asked of the
    // model. Numbers a customer sees should never be generated text.
    const prospects: Prospect[] = ctx.db.listProspects(ctx.runId);
    const by = (status: string) => prospects.filter((p) => p.status === status).length;
    const revenue = prospects.reduce((sum, p) => sum + p.amountUsd, 0);

    return {
      niche: research.text.slice(0, 200),
      prospects: prospects.length,
      contacted: by('contacted'),
      booked: by('booked'),
      declined: by('declined'),
      revenueUsd: revenue,
      outreachStoppedBy: sending.stoppedBy,
      triage: triageText.slice(0, 200),
    };
  },
};
