# automations

A durable agent workflow engine. Claude plans and acts through typed
connectors; the engine makes sure that when something crashes, resumes, or
retries, nobody gets emailed twice.

This is the first vertical slice of an automations platform, built so that
generalising it later is additive rather than a rewrite. The workflow it ships
with is the cold-outreach loop: research prospects, send a personal email to
each, triage the replies, book calls.

## Run it

No install, no API key, no credentials — the whole pipeline runs simulated:

```bash
cd automations
npm run demo                     # research -> 6 emails -> pipeline summary
npm run cli -- runs              # every run, with token and cost totals
npm run cli -- show <runId>      # execution log, steps, pipeline, messages
npm test                         # 8 tests covering the engine guarantees
```

Then prove the durability story. Record a reply (standing in for an inbound
webhook) and resume — earlier stages replay from the record instead of
re-sending, and only the new work runs:

```bash
npm run cli -- reply p_<runId>_0 "Yes - interested, can we do a call?"
npm run cli -- reply p_<runId>_1 "STOP - remove me from your list"
npm run cli -- resume <runId>
```

The second prospect is suppressed permanently. The agent will try to book them
anyway; the engine refuses.

## How it fits together

```
workflow  ──► RunContext.agent()  ──►  Claude  ──► tool calls
   │                                              │
   └──► RunContext.call()  ─────────────────►  Registry  ──► Connector actions
                    │                                          (research, crm,
                    ▼                                           email, calendar)
              durable steps  ──►  SQLite: runs, steps, events, pipeline
```

**One action definition, three consumers.** A connector action declares its
name, schema and effect once. That single definition becomes a Claude tool, a
`ctx.call()` a workflow can make directly, and — in the platform build — a node
in the visual builder. Defining a capability twice is how these systems rot.

**Everything durable goes through `ctx.step()`.** A step body runs at most once
per `(run, key)`; on replay the recorded output is returned. Model turns are
steps too, so resuming doesn't re-pay for reasoning already done. Polling reads
opt out with `fresh: true`, which is rejected for anything that reaches a
person.

**Effects are typed, and budgets are enforced in code.**

| effect | meaning | counted against budget |
|---|---|---|
| `read` | no consequence, retry freely | no |
| `internal` | changes our own state (a CRM row) | no |
| `external` | leaves the building: an email, a booking | yes |

Each agent stage gets only the tools it needs and its own `maxExternal`. The
research stage has a budget of zero — it cannot send anything even if the model
decides it would like to.

**Policy is not a prompt.** Opt-outs, missing addresses and declined prospects
are checked in `core/policy.ts` by every outbound action. A model told to
respect opt-outs usually will; "usually" is not a compliance posture, and you
cannot un-send an email.

**Numbers are computed, not generated.** The run summary is derived from the
pipeline tables. Token totals are summed from the step record rather than
incremented, so a replayed run reports the same figures instead of counting its
own history twice.

## Going live

```bash
cp .env.example .env      # fill in what you need
npm run cli -- doctor     # shows what is configured and what is missing
npm run cli -- run outreach --live          # real Claude, sends still dry-run
npm run cli -- run outreach --live --send   # actually delivers
```

Two separate flags on purpose. `--live` uses Claude; `--send` is what turns
simulated sends into real ones. Getting that wrong is the difference between a
test and fourteen real emails.

Drivers are per-connector and set by environment variable, so you can go live
one integration at a time: `EMAIL_DRIVER=resend`, `RESEARCH_DRIVER=serper`,
`CALENDAR_DRIVER=calcom`.

Cost at Claude Opus 5 rates ($5/M in, $25/M out) is roughly $0.30–$2.00 per
full cycle. `runs` reports the actual figure per run.

## Before you send real cold email

- **Deliverability is infrastructure.** Send from a warmed-up subdomain with
  SPF, DKIM and DMARC configured. Without that, good copy still lands in spam.
- **CAN-SPAM** requires a real postal address and a working opt-out in every
  commercial email. `EMAIL_POSTAL_ADDRESS` is appended to every send; set it.
- **GDPR/PECR** are stricter for EU/UK recipients, particularly B2C.
- **Don't scrape LinkedIn.** It violates their terms. The `serper` driver
  returns businesses without verified emails rather than guessing addresses,
  and the agent is instructed to skip prospects it cannot legitimately contact.

## What this deliberately isn't yet

The slice runs one tenant, in one process, on SQLite. The interfaces are the
part designed to survive; these are the known swaps:

| Now | Platform |
|---|---|
| `core/runner.ts`, in-process | Inngest or Temporal — same `RunContext`, different driver |
| SQLite via `node:sqlite` | Postgres + Drizzle; the schema already reads like one |
| `process.env` secrets | Per-tenant encrypted vault behind the same `Secrets` interface |
| CLI | HTTP API + React Flow canvas over the same registry |
| `cli reply` | Inbound email webhook resuming the waiting run |
| Manual `run` | Cron triggers, or Anthropic scheduled deployments |

Nothing above requires touching a connector or a workflow.

## Layout

```
src/core/       types, registry, durable runner, agent loop, policy, pricing
src/connectors/ research, crm, email, calendar — each with dryrun + live driver
src/workflows/  outreach.ts — the pipeline as a definition
test/           engine guarantees: replay, budgets, policy, retries
```

Requires Node 22.6+. TypeScript runs natively via `--experimental-strip-types`,
so there is no build step; the Anthropic SDK is loaded lazily and only needed
for `--live`.
