# Architecture

```
            ┌───────────── web/ (SPA, vanilla JS) ─────────────┐
            │  REST + Server-Sent Events (live activity)        │
            └──────────────────────┬───────────────────────────┘
                                   │
   Telegram ◄──► integrations ◄── api.py (FastAPI) ──► agents.py ──► sources.py ──► Freelancer API, Remote OK API,
   Gmail API ◄──►                  │                     │                         RSS (FL.ru, Freelancehunt, WWR, discovered feeds),
                                   │                     ├──► llm.py ──► Anthropic (Claude) / OpenAI-compatible   t.me/s public channels,
                                   │                     │                                                        OpenStreetMap (Nominatim/Overpass)
                                   ▼                     ▼
                        worker.py (supervisor loop) ── core.py ── SQLite (WAL) + Fernet vault
```

## Why this stack (deviation from the suggested one)
The brief suggested Next.js + PostgreSQL/pgvector + Redis + Celery. For a single owner running the app on her own
computer, that is five services to install, keep alive and back up. The chosen stack keeps the same responsibilities in
one Python process:

| Suggested | Used | Why |
|---|---|---|
| PostgreSQL + Redis | **SQLite (WAL mode)** | zero setup, one file to back up (`VACUUM INTO`), safe for 1 writer + readers; volumes here are thousands of rows, not millions |
| Celery + beat | **`tasks` table + supervisor thread** | persistent queue with dedupe keys, retries, backoff and crash recovery; no broker to run |
| pgvector semantic search | **multilingual concept lexicon** (EN/RU/UK/AZ/TR/DE) + LLM for writing | deterministic, free, explainable; `shortcut:` noted in code — swap in embeddings if recall proves poor |
| Next.js + shadcn + Recharts | **vanilla JS SPA + hand-written SVG charts** | no Node toolchain on the owner's machine; one `start.sh`/`start.bat` |
| Playwright form automation | **owner's own visible browser** for registrations | major platforms forbid automated sign-up and use CAPTCHA/KYC; we prepare everything and open the page |

Moving to PostgreSQL later is contained: all SQL goes through `core.q/q1/x/n`.

## Data model (core.SCHEMA)
`platforms` (registry + score + ops matrix) · `accounts` (per-platform account state, generated profile) ·
`opportunities` (jobs, score, reasons, risks, matched projects) · `proposals` (one per opportunity — UNIQUE) ·
`leads` (CRM, 13 stages, deal card JSON) · `messages` (in/out, intent) · `approvals` (owner decisions, dedupe key) ·
`ledger` (expenses / potential / actual revenue, multi-currency) · `services` (gig listings) · `tasks` (queue) ·
`activity` (audit log + live feed) · `vault` (encrypted secrets & generated passwords) · `llm_cache` · `settings`.

## Control flow
1. `worker.schedule_periodic()` enqueues due jobs (intervals in Settings) with dedupe keys.
2. `worker.run_one()` atomically claims a task, checks pauses, runs the handler, retries with `30·2^n` s backoff (5 tries),
   defers 1 h when the AI provider is unavailable/budget-capped.
3. Agents call `core.guard(agent, action, cost)` before any external action → `allow` / `approval` / `deny`.
   Approvals land in the `approvals` table, the UI and Telegram (inline buttons).
4. `core.log(..., level)` writes the audit trail; `important`/`critical` also go to Telegram.

## Autonomy modes (core.guard)
| action | manual | smart | full |
|---|---|---|---|
| send_proposal (where API allows), routine reply | approval | allow | allow |
| cold outreach, follow-up, non-routine reply | approval | approval | allow (daily caps) |
| registration submit, accept order, final terms, payment, identity | approval | approval | approval |
| any spend > approved limits (default 0) | approval | approval | approval |
| anything during Emergency Stop / agent paused | deny | deny | deny |

## Running 24/7
Local: the process must be running (launcher / autostart). Server: `docker compose up -d` (restart policy = watchdog,
volume = persistence). The supervisor's heartbeat is exposed at `/health`. No server is purchased automatically.
