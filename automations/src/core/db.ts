/**
 * SQLite implementation of the Database contract, using node:sqlite (built in
 * on Node 22.6+, so the slice has no native dependency).
 *
 * The schema is written the way the Postgres one will be: string ids, ISO
 * timestamps, JSON columns for payloads. Porting is a driver swap, not a
 * redesign.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  Database, Json, OutboundMessage, Prospect, RunRecord, StepRecord, Usage,
} from './types.ts';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  workflow TEXT NOT NULL,
  goal TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  error TEXT,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS steps (
  run_id TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  output_json TEXT,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  PRIMARY KEY (run_id, key)
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  level TEXT NOT NULL,
  msg TEXT NOT NULL,
  data_json TEXT
);
CREATE INDEX IF NOT EXISTS events_run ON events(run_id, id);
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  niche TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  amount_usd REAL NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  prospect_id TEXT NOT NULL,
  direction TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  provider_id TEXT,
  created_at TEXT NOT NULL
);
/* Suppression list. Checked before every send; survives across runs.
   Required for CAN-SPAM opt-out and simple decency. */
CREATE TABLE IF NOT EXISTS suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const now = () => new Date().toISOString();

export function openDb(path: string): Database {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);

  const toRun = (r: any): RunRecord => ({
    id: r.id, workflow: r.workflow, goal: r.goal, status: r.status,
    startedAt: r.started_at, finishedAt: r.finished_at, error: r.error,
    inputTokens: r.input_tokens, outputTokens: r.output_tokens, costUsd: r.cost_usd,
  });
  const toStep = (r: any): StepRecord => ({
    runId: r.run_id, key: r.key, name: r.name, status: r.status,
    output: r.output_json ? JSON.parse(r.output_json) : null,
    error: r.error, attempts: r.attempts,
  });
  const toProspect = (r: any): Prospect => ({
    id: r.id, runId: r.run_id, name: r.name, company: r.company, email: r.email,
    niche: r.niche, status: r.status, notes: r.notes, amountUsd: r.amount_usd,
  });

  return {
    createRun(r) {
      db.prepare(
        `INSERT INTO runs (id, workflow, goal, status, started_at) VALUES (?,?,?,?,?)`,
      ).run(r.id, r.workflow, r.goal, r.status, r.startedAt);
    },
    finishRun(id, status, error = null) {
      db.prepare(`UPDATE runs SET status=?, finished_at=?, error=? WHERE id=?`)
        .run(status, now(), error, id);
    },
    setUsage(runId, usage: Usage, costUsd) {
      db.prepare(
        `UPDATE runs SET input_tokens=?, output_tokens=?, cost_usd=? WHERE id=?`,
      ).run(usage.inputTokens, usage.outputTokens, costUsd, runId);
    },
    getRun(id) {
      const r = db.prepare(`SELECT * FROM runs WHERE id=?`).get(id);
      return r ? toRun(r) : null;
    },
    listRuns(limit) {
      return db.prepare(`SELECT * FROM runs ORDER BY started_at DESC LIMIT ?`)
        .all(limit).map(toRun);
    },
    getStep(runId, key) {
      const r = db.prepare(`SELECT * FROM steps WHERE run_id=? AND key=?`).get(runId, key);
      return r ? toStep(r) : null;
    },
    startStep(runId, key, name) {
      db.prepare(
        `INSERT INTO steps (run_id, key, name, status, attempts, started_at)
         VALUES (?,?,?,'running',1,?)
         ON CONFLICT(run_id, key) DO UPDATE SET
           status='running', attempts = steps.attempts + 1, error=NULL`,
      ).run(runId, key, name, now());
    },
    finishStep(runId, key, status, output, error) {
      db.prepare(
        `UPDATE steps SET status=?, output_json=?, error=?, finished_at=? WHERE run_id=? AND key=?`,
      ).run(status, JSON.stringify(output ?? null), error, now(), runId, key);
    },
    listSteps(runId) {
      return db.prepare(`SELECT * FROM steps WHERE run_id=? ORDER BY started_at, rowid`)
        .all(runId).map(toStep);
    },
    event(runId, level, msg, data) {
      db.prepare(`INSERT INTO events (run_id, ts, level, msg, data_json) VALUES (?,?,?,?,?)`)
        .run(runId, now(), level, msg, data ? JSON.stringify(data) : null);
    },
    listEvents(runId) {
      return db.prepare(`SELECT ts, level, msg, data_json FROM events WHERE run_id=? ORDER BY id`)
        .all(runId).map((r: any) => ({
          ts: r.ts, level: r.level, msg: r.msg,
          data: (r.data_json ? JSON.parse(r.data_json) : {}) as Json,
        }));
    },
    upsertProspect(p) {
      db.prepare(
        `INSERT INTO prospects (id, run_id, name, company, email, niche, status, notes, amount_usd, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET
           status=excluded.status, notes=excluded.notes,
           amount_usd=excluded.amount_usd, updated_at=excluded.updated_at`,
      ).run(p.id, p.runId, p.name, p.company, p.email, p.niche, p.status, p.notes, p.amountUsd, now());
    },
    getProspect(id) {
      const r = db.prepare(`SELECT * FROM prospects WHERE id=?`).get(id);
      return r ? toProspect(r) : null;
    },
    listProspects(runId) {
      const rows = runId
        ? db.prepare(`SELECT * FROM prospects WHERE run_id=? ORDER BY rowid`).all(runId)
        : db.prepare(`SELECT * FROM prospects ORDER BY rowid`).all();
      return rows.map(toProspect);
    },
    addMessage(m: OutboundMessage) {
      db.prepare(
        `INSERT INTO messages (id, run_id, prospect_id, direction, subject, body, provider_id, created_at)
         VALUES (?,?,?,?,?,?,?,?)`,
      ).run(m.id, m.runId, m.prospectId, m.direction, m.subject, m.body, m.providerId, m.createdAt);
    },
    listMessages(runId) {
      return db.prepare(`SELECT * FROM messages WHERE run_id=? ORDER BY created_at`)
        .all(runId).map((r: any) => ({
          id: r.id, runId: r.run_id, prospectId: r.prospect_id, direction: r.direction,
          subject: r.subject, body: r.body, providerId: r.provider_id, createdAt: r.created_at,
        }));
    },
    suppress(email, reason) {
      db.prepare(
        `INSERT INTO suppressions (email, reason, created_at) VALUES (?,?,?)
         ON CONFLICT(email) DO NOTHING`,
      ).run(email.toLowerCase(), reason, now());
    },
    isSuppressed(email) {
      return !!db.prepare(`SELECT 1 FROM suppressions WHERE email=?`).get(email.toLowerCase());
    },
    close() { db.close(); },
  };
}
