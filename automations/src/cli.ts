#!/usr/bin/env node --experimental-strip-types
/**
 * Operator surface. In the platform build this is the API the dashboard calls;
 * here it is a CLI so the whole thing is inspectable without a UI.
 *
 *   cli run <workflow> [--simulate] [--live] [--reset] [--goal "..."]
 *   cli runs                       list recent runs
 *   cli show <runId>               execution log, steps, pipeline
 *   cli reply <prospectId> "text"  record an inbound reply (webhook stand-in)
 *   cli resume <runId>             continue a run; finished steps replay
 *   cli doctor                     what is configured and what is missing
 */
import { randomUUID } from 'node:crypto';
import { rmSync } from 'node:fs';
import { openDb } from './core/db.ts';
import { Registry } from './core/registry.ts';
import { executeWorkflow } from './core/runner.ts';
import { simulatedModel } from './core/model-simulated.ts';
import { anthropicModel } from './core/model-anthropic.ts';
import { knownModels, priceOf } from './core/pricing.ts';
import { crmConnector } from './connectors/crm.ts';
import { emailConnector } from './connectors/email.ts';
import { calendarConnector } from './connectors/calendar.ts';
import { researchConnector } from './connectors/research.ts';
import { outreach } from './workflows/outreach.ts';
import type { Database, Logger, ModelClient, Secrets, Workflow } from './core/types.ts';

const DB_PATH = process.env.AUTOMATIONS_DB ?? '.data/automations.db';
const WORKFLOWS: Record<string, Workflow> = { [outreach.id]: outreach };

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};

const secrets: Secrets = {
  get: (k) => process.env[k] || undefined,
  require(k) {
    const v = process.env[k];
    if (!v) throw new Error(`missing required secret ${k} (see automations/.env.example)`);
    return v;
  },
};

const logger: Logger = {
  info: (m) => console.log(`  ${c.dim('·')} ${m}`),
  warn: (m) => console.log(`  ${c.yellow('!')} ${m}`),
  error: (m) => console.log(`  ${c.red('x')} ${m}`),
};

function buildRegistry(): Registry {
  return new Registry()
    .register(researchConnector(process.env.RESEARCH_DRIVER ?? 'dryrun'))
    .register(crmConnector())
    .register(emailConnector(process.env.EMAIL_DRIVER ?? 'dryrun'))
    .register(calendarConnector(process.env.CALENDAR_DRIVER ?? 'dryrun'));
}

async function pickModel(live: boolean): Promise<ModelClient> {
  if (!live) return simulatedModel();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('--live needs ANTHROPIC_API_KEY; use --simulate to run without one');
  return anthropicModel({ apiKey, model: process.env.MODEL ?? 'claude-opus-5', webSearch: true });
}

// --- commands ---------------------------------------------------------

async function cmdRun(args: string[], db: Database): Promise<number> {
  const id = args[0] ?? 'outreach';
  const workflow = WORKFLOWS[id];
  if (!workflow) {
    console.error(`unknown workflow "${id}". known: ${Object.keys(WORKFLOWS).join(', ')}`);
    return 1;
  }
  const live = args.includes('--live');
  const goalIdx = args.indexOf('--goal');
  const goal = goalIdx >= 0 ? args[goalIdx + 1] ?? workflow.goal : workflow.goal;

  const model = await pickModel(live);
  console.log(c.bold(`\n${workflow.label}`));
  console.log(c.dim(`model: ${model.id}   mode: ${live ? 'LIVE' : 'simulated'}   db: ${DB_PATH}\n`));

  const { runId, result, error } = await executeWorkflow(workflow, goal, {
    db, registry: buildRegistry(), model, secrets, log: logger,
    // A live run still dry-runs sends unless --send is passed. Getting this
    // wrong is the difference between a test and 14 real emails.
    dryRun: !args.includes('--send'),
  });

  if (error) {
    console.log(`\n${c.red('run failed')}: ${error.message}`);
    console.log(c.dim(`resume with: npm run cli --prefix automations -- resume ${runId}`));
  } else {
    console.log(`\n${c.green('run ok')} ${c.dim(runId)}`);
    console.log(JSON.stringify(result, null, 2));
  }
  printCost(db, runId);
  return error ? 1 : 0;
}

async function cmdResume(args: string[], db: Database): Promise<number> {
  const runId = args[0];
  if (!runId) { console.error('usage: resume <runId>'); return 1; }
  const record = db.getRun(runId);
  if (!record) { console.error(`no run "${runId}"`); return 1; }
  const workflow = WORKFLOWS[record.workflow];
  if (!workflow) { console.error(`workflow "${record.workflow}" no longer exists`); return 1; }

  const model = await pickModel(args.includes('--live'));
  console.log(c.bold(`\nresuming ${runId}`));
  console.log(c.dim('completed steps replay from the record; only new work runs\n'));

  const { result, error } = await executeWorkflow(workflow, record.goal, {
    db, registry: buildRegistry(), model, secrets, log: logger,
    dryRun: !args.includes('--send'), runId,
  });
  if (error) { console.log(`\n${c.red('run failed')}: ${error.message}`); }
  else {
    console.log(`\n${c.green('run ok')}`);
    console.log(JSON.stringify(result, null, 2));
  }
  printCost(db, runId);
  return error ? 1 : 0;
}

function cmdRuns(db: Database): number {
  const runs = db.listRuns(20);
  if (!runs.length) { console.log('no runs yet'); return 0; }
  console.log(c.bold('\nrun          workflow   status   tokens in/out   cost     started'));
  for (const r of runs) {
    const status = r.status === 'ok' ? c.green(r.status.padEnd(8))
      : r.status === 'failed' ? c.red(r.status.padEnd(8)) : c.yellow(r.status.padEnd(8));
    console.log(
      `${r.id.padEnd(13)}${r.workflow.padEnd(11)}${status}`
      + `${`${r.inputTokens}/${r.outputTokens}`.padEnd(16)}`
      + `$${r.costUsd.toFixed(4).padEnd(9)}${c.dim(r.startedAt.slice(0, 19))}`,
    );
  }
  return 0;
}

function cmdShow(args: string[], db: Database): number {
  const runId = args[0];
  if (!runId) { console.error('usage: show <runId>'); return 1; }
  const run = db.getRun(runId);
  if (!run) { console.error(`no run "${runId}"`); return 1; }

  console.log(c.bold(`\n${run.id}  ${run.workflow}  ${run.status}`));
  console.log(c.dim(`goal: ${run.goal}`));

  console.log(c.bold('\nexecution log'));
  for (const e of db.listEvents(runId)) {
    const mark = e.level === 'error' ? c.red('x') : e.level === 'warn' ? c.yellow('!') : c.green('*');
    console.log(`  ${mark} ${c.dim(e.ts.slice(11, 19))} ${e.msg}`);
  }

  console.log(c.bold('\nsteps'));
  for (const s of db.listSteps(runId)) {
    const mark = s.status === 'ok' ? c.green('ok  ') : s.status === 'failed' ? c.red('fail') : c.yellow('run ');
    console.log(`  ${mark} ${s.name.padEnd(26)} ${c.dim(s.key)}${s.attempts > 1 ? c.yellow(` (${s.attempts} attempts)`) : ''}`);
  }

  const prospects = db.listProspects(runId);
  if (prospects.length) {
    console.log(c.bold('\npipeline'));
    for (const p of prospects) {
      const amount = p.amountUsd ? ` $${p.amountUsd}` : '';
      console.log(`  ${p.status.padEnd(10)} ${p.company.padEnd(26)} ${c.dim(p.email)}${amount}`);
    }
  }

  const messages = db.listMessages(runId);
  if (messages.length) {
    console.log(c.bold('\nmessages'));
    for (const m of messages) {
      const arrow = m.direction === 'out' ? '->' : '<-';
      console.log(`  ${arrow} ${c.dim(m.createdAt.slice(11, 19))} ${m.subject || '(reply)'}`);
    }
  }
  printCost(db, runId);
  return 0;
}

/** Stand-in for an inbound-email webhook. */
function cmdReply(args: string[], db: Database): number {
  const [prospectId, ...rest] = args;
  const body = rest.join(' ');
  if (!prospectId || !body) { console.error('usage: reply <prospectId> "message"'); return 1; }
  const prospect = db.getProspect(prospectId);
  if (!prospect) { console.error(`no prospect "${prospectId}"`); return 1; }

  db.addMessage({
    id: `m_${randomUUID().slice(0, 8)}`, runId: prospect.runId, prospectId,
    direction: 'in', subject: '', body, providerId: null,
    createdAt: new Date().toISOString(),
  });
  db.upsertProspect({ ...prospect, status: 'replied' });
  // Honour opt-outs at the point of receipt, not at send time only.
  if (/\bstop\b|\bunsubscribe\b|remove me/i.test(body)) {
    db.suppress(prospect.email, 'replied STOP');
    db.upsertProspect({ ...prospect, status: 'declined' });
    console.log(`${c.yellow('opt-out recorded')} for ${prospect.email}; suppressed permanently`);
    return 0;
  }
  console.log(`reply recorded from ${prospect.company}. resume the run to triage it:`);
  console.log(c.dim(`  npm run cli --prefix automations -- resume ${prospect.runId}`));
  return 0;
}

function cmdDoctor(): number {
  const registry = buildRegistry();
  console.log(c.bold('\nconnectors'));
  for (const conn of registry.connectors) {
    const missing = conn.auth.env.filter((k) => !process.env[k]);
    const mark = missing.length === 0 ? c.green('ready') : c.yellow('needs config');
    console.log(`  ${mark.padEnd(22)} ${conn.label.padEnd(20)} ${c.dim(conn.actions.map((a) => a.name).join(', '))}`);
    if (missing.length) console.log(`${' '.repeat(4)}${c.dim(`missing: ${missing.join(', ')}`)}`);
  }
  console.log(c.bold('\nmodel'));
  console.log(process.env.ANTHROPIC_API_KEY
    ? `  ${c.green('ready')} live runs available (${process.env.MODEL ?? 'claude-opus-5'})`
    : `  ${c.yellow('simulated only')} set ANTHROPIC_API_KEY for --live`);
  console.log(c.dim(`  priced models: ${knownModels().join(', ')}`));
  console.log(c.bold('\nsafety defaults'));
  console.log(`  sends are dry-run unless ${c.bold('--send')} is passed`);
  console.log('  outreach stage capped at 6 outbound actions per run');
  return 0;
}

function printCost(db: Database, runId: string): void {
  const run = db.getRun(runId);
  if (!run) return;
  const cost = run.costUsd > 0 ? `$${run.costUsd.toFixed(4)}` : '$0 (simulated)';
  console.log(c.dim(`\ntokens ${run.inputTokens} in / ${run.outputTokens} out   cost ${cost}`));
}

// --- entry ------------------------------------------------------------

async function main(): Promise<number> {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') {
    console.log(`
${c.bold('automations')} — durable agent workflows

  run <workflow> [--live] [--send] [--reset] [--goal "..."]
  runs
  show <runId>
  reply <prospectId> "message"
  resume <runId> [--live] [--send]
  doctor

Defaults are safe: simulated model, dry-run sends. --live uses Claude,
--send actually delivers.
`.trim());
    return 0;
  }

  if (args.includes('--reset')) {
    rmSync(DB_PATH, { force: true });
    rmSync(`${DB_PATH}-wal`, { force: true });
    rmSync(`${DB_PATH}-shm`, { force: true });
  }
  if (command === 'doctor') return cmdDoctor();

  const db = openDb(DB_PATH);
  try {
    switch (command) {
      case 'run': return await cmdRun(args, db);
      case 'resume': return await cmdResume(args, db);
      case 'runs': return cmdRuns(db);
      case 'show': return cmdShow(args, db);
      case 'reply': return cmdReply(args, db);
      default:
        console.error(`unknown command "${command}"`);
        return 1;
    }
  } finally {
    db.close();
  }
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(c.red(`\n${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
