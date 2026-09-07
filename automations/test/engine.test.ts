/**
 * Tests for the properties that make this an engine rather than a script:
 * a resumed run must not repeat side effects, budgets must hold, and the
 * contact policy must be unbypassable from the model's side.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/core/db.ts';
import { Registry } from '../src/core/registry.ts';
import { executeWorkflow, stableHash } from '../src/core/runner.ts';
import { simulatedModel } from '../src/core/model-simulated.ts';
import { assertContactable, NotContactable } from '../src/core/policy.ts';
import { crmConnector } from '../src/connectors/crm.ts';
import { emailConnector } from '../src/connectors/email.ts';
import { calendarConnector } from '../src/connectors/calendar.ts';
import { researchConnector } from '../src/connectors/research.ts';
import { outreach } from '../src/workflows/outreach.ts';
import type { Connector, Database, Logger, Secrets, Workflow } from '../src/core/types.ts';

const silent: Logger = { info() {}, warn() {}, error() {} };
const secrets: Secrets = {
  get: (k) => process.env[k] || undefined,
  require(k) { const v = process.env[k]; if (!v) throw new Error(`missing ${k}`); return v; },
};

const registry = () => new Registry()
  .register(researchConnector('dryrun'))
  .register(crmConnector())
  .register(emailConnector('dryrun'))
  .register(calendarConnector('dryrun'));

const opts = (db: Database) => ({
  db, registry: registry(), model: simulatedModel(), secrets, log: silent, dryRun: true,
});

test('a resumed run replays side effects instead of repeating them', async () => {
  const db = openDb(':memory:');
  const first = await executeWorkflow(outreach, outreach.goal, opts(db));
  assert.equal(first.error, null);

  const sentFirst = db.listMessages(first.runId).filter((m) => m.direction === 'out');
  assert.equal(sentFirst.length, 6, 'first pass sends one email per prospect');

  await executeWorkflow(outreach, outreach.goal, { ...opts(db), runId: first.runId });

  const sentAfter = db.listMessages(first.runId).filter((m) => m.direction === 'out');
  assert.equal(sentAfter.length, 6, 'resume must not re-send');

  const replayed = db.listEvents(first.runId).filter((e) => e.msg.startsWith('step replayed'));
  assert.ok(replayed.length > 0, 'resume should replay recorded steps');
  db.close();
});

test('polling reads re-execute on resume while sends stay memoized', async () => {
  const db = openDb(':memory:');
  const { runId } = await executeWorkflow(outreach, outreach.goal, opts(db));

  const prospects = db.listProspects(runId);
  db.addMessage({
    id: 'm_test', runId, prospectId: prospects[0]!.id, direction: 'in',
    subject: '', body: 'Interested, lets talk', providerId: null,
    createdAt: new Date().toISOString(),
  });

  await executeWorkflow(outreach, outreach.goal, { ...opts(db), runId });

  // The reply arrived after the first pass recorded an empty inbox. If
  // email.list_replies were memoized, triage would never have run.
  const triaged = db.listEvents(runId).some((e) => e.msg.includes('triage'));
  assert.ok(triaged, 'fresh reads must see state that changed between runs');
  db.close();
});

test('the outbound budget bounds blast radius', async () => {
  const db = openDb(':memory:');
  const capped: Workflow = {
    id: 'capped', label: 'capped', goal: 'send as much as possible',
    async run(ctx) {
      await ctx.agent({
        name: 'research', system: 'research', prompt: 'find and save prospects',
        allow: ['research.find_prospects', 'crm.save_prospects'],
        limits: { maxTurns: 5, maxExternal: 0 },
      });
      const result = await ctx.agent({
        name: 'blast', system: 'send', prompt: 'email everyone',
        allow: ['crm.list_prospects', 'email.send'],
        limits: { maxTurns: 6, maxExternal: 2 },
      });
      return { external: result.external, stoppedBy: result.stoppedBy };
    },
  };

  const { runId, result } = await executeWorkflow(capped, capped.goal, opts(db));
  assert.equal(result?.stoppedBy, 'max_external');
  const sent = db.listMessages(runId).filter((m) => m.direction === 'out');
  assert.equal(sent.length, 2, 'budget of 2 must permit exactly 2 sends');
  db.close();
});

test('opt-out blocks every outbound action, not just email', async () => {
  const db = openDb(':memory:');
  const prospect = {
    id: 'p1', runId: 'r1', name: 'A', company: 'A Ltd', email: 'a@example.com',
    niche: 'x', status: 'contacted', notes: '', amountUsd: 0,
  };
  db.upsertProspect(prospect);
  const ctx = { runId: 'r1', log: silent, secrets, dryRun: true, db };

  assert.doesNotThrow(() => assertContactable(prospect, ctx));

  db.suppress('a@example.com', 'test');
  assert.throws(() => assertContactable(prospect, ctx), NotContactable);
  assert.throws(
    () => assertContactable({ ...prospect, status: 'declined' }, ctx),
    NotContactable,
  );
  assert.throws(
    () => assertContactable({ ...prospect, email: '' }, { ...ctx, db: openDb(':memory:') }),
    /no verified email/,
  );
  db.close();
});

test('a failing step retries, then fails the run with the step recorded', async () => {
  const db = openDb(':memory:');
  let attempts = 0;
  const flaky: Connector = {
    id: 'flaky', label: 'flaky', auth: { kind: 'none', env: [] },
    actions: [{
      name: 'flaky.always_fails', summary: 'fails', effect: 'read',
      input: { type: 'object', additionalProperties: false, required: [], properties: {} },
      async run() { attempts++; throw new Error('upstream 503'); },
    }],
  };
  const workflow: Workflow = {
    id: 'f', label: 'f', goal: 'g',
    async run(ctx) { await ctx.call('flaky.always_fails', {}); return {}; },
  };

  const { runId, error } = await executeWorkflow(workflow, 'g', {
    db, registry: new Registry().register(flaky), model: simulatedModel(),
    secrets, log: silent, dryRun: true, retry: { attempts: 3, backoffMs: 1 },
  });

  assert.equal(attempts, 3, 'should retry to the configured limit');
  assert.match(error?.message ?? '', /flaky\.always_fails/);
  assert.equal(db.getRun(runId)?.status, 'failed');
  assert.equal(db.listSteps(runId)[0]?.status, 'failed');
  db.close();
});

test('external actions cannot opt out of memoization', async () => {
  const db = openDb(':memory:');
  const workflow: Workflow = {
    id: 'f', label: 'f', goal: 'g',
    async run(ctx) {
      await ctx.call('email.send', { prospect_id: 'x', subject: 's', body: 'b' }, { fresh: true });
      return {};
    },
  };
  const { error } = await executeWorkflow(workflow, 'g', opts(db));
  assert.match(error?.message ?? '', /cannot be called with fresh/);
  db.close();
});

test('step keys ignore property order but not values', () => {
  assert.equal(stableHash({ a: 1, b: [2, { c: 3 }] }), stableHash({ b: [2, { c: 3 }], a: 1 }));
  assert.notEqual(stableHash({ a: 1 }), stableHash({ a: 2 }));
});

test('bad tool input fails as a readable error, not a crash', async () => {
  const reg = registry();
  await assert.rejects(
    () => reg.invoke('email.send', { subject: 'hi' }, {
      runId: 'r', log: silent, secrets, dryRun: true, db: openDb(':memory:'),
    }),
    /missing "prospect_id".*missing "body"|missing "prospect_id"/s,
  );
});
