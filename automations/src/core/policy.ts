/**
 * Contact policy, enforced in code rather than in the prompt.
 *
 * A model that has been told to respect opt-outs will usually respect them.
 * "Usually" is not a compliance posture, and the failure is unrecoverable —
 * you cannot un-send. So every action that reaches a person checks here, and
 * the check is a hard error the agent must route around.
 */
import type { ActionContext, Prospect } from './types.ts';

export class NotContactable extends Error {
  readonly prospectId: string;
  constructor(prospectId: string, reason: string) {
    super(reason);
    this.name = 'NotContactable';
    this.prospectId = prospectId;
  }
}

/** Throws unless it is legitimate to contact this prospect right now. */
export function assertContactable(prospect: Prospect, ctx: ActionContext): void {
  if (prospect.status === 'declined') {
    throw new NotContactable(prospect.id,
      `${prospect.company} has declined contact; do not reach out again`);
  }
  if (!prospect.email) {
    throw new NotContactable(prospect.id,
      `prospect "${prospect.id}" has no verified email address; skip it rather than guessing one`);
  }
  if (ctx.db.isSuppressed(prospect.email)) {
    throw new NotContactable(prospect.id,
      `${prospect.email} has opted out; do not contact again`);
  }
}
