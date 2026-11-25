# Agents

All agents share: the knowledge base (`data/knowledge_base.json` + owner answers), long-term memory (SQLite: every job,
proposal, message and decision), the task queue, and `core.guard()`. Status on the **Agent Control** screen is read from
the real queue (`tasks`) and activity log — nothing is animated without a task behind it.

| Agent | Code | Trigger | Does | Needs owner for |
|---|---|---|---|---|
| **Supervisor** | `worker.py`, `core.guard`, `agents.resolve_approval` | always | schedules, claims tasks, retries/backoff, crash recovery, enforces modes, pauses, Emergency Stop, budgets | — |
| **Platform Discovery** | `agents.platform_discovery` | daily | re-checks every platform (reachable, closed, HTTPS, robots.txt, RSS autodiscovery), scores 0–100, categorises; finds new platforms via Brave Search API if a key is set | — |
| **Registration** | `agents.registration_start` | on click | checks for an existing account (no duplicates), generates a strong password into the vault, creates an Approval with steps + link + "open browser" | sign-up itself (terms, CAPTCHA, SMS, ID) |
| **Profile Optimization** | `agents.profile_generate`, `agents.service_generate` | after registration / on click | per-platform, per-language headline, bio, skills, portfolio picks, keywords, FAQ; gig listings with Basic/Standard/Premium clamped to approved rates | publishing (no seller APIs) |
| **Job Discovery** | `agents.job_discovery` | every 20 min per source | fetches Freelancer API, Remote OK API, FL.ru/Freelancehunt/WWR RSS, discovered RSS feeds, public Telegram channels; dedupes; expires stale posts; pauses a source after 3 consecutive errors | — |
| **Lead Scoring** | `agents.score_opportunity` | on every new job | 0–100 with a written explanation: skill fit (title-weighted, multilingual), portfolio match, budget (FX→USD), recency, competition, long-term signals, scam/injection penalties, priority/excluded categories, analytics boost. Not a probability. | — |
| **Proposal** | `agents.proposal_draft`, `write_proposal` | jobs ≥ min score | KB-grounded proposal in the client's language, A/B variant, safety-validated (no foreign links / unconfirmed claims), one per job | sending on platforms (all current platform ToS → manual copy & open) |
| **Business Lead** | `agents.business_leads`, `business_pitch_task`, `followups` | on demand / 12 h | OpenStreetMap businesses by city+category, public contacts only, website audit (HTTPS, mobile viewport, outdated footer, no booking, errors…), tailored pitch with opt-out, one follow-up after N days | sending in manual/smart mode |
| **Negotiation** | `agents.negotiate`, `add_manual_message` | each client message | full-history context, intent (question / interested / terms / ready / declined / scam), extracts budget/deadline/requirements, drafts reply, moves CRM stage, creates deal card when ready | final price, deadline, contract, acceptance |
| **Email** | `agents.email_poll`, `integrations.gmail_*` | every 5 min | Gmail (OAuth): platform notifications, confirms sign-ups only via the platform's own domain, routes client mail to leads; ignores personal mail | connecting Gmail |
| **Notification** | `integrations.notify`, Telegram bot | important/critical events | Telegram messages with approve/reject buttons; commands /dashboard /orders /clients /messages /approvals /stats /pause /resume /stop /settings | pairing the bot |
| **Security** | `agents.security_run`, `knowledge.scam_flags/injection_flag`, `llm.unsafe_output` | every 10 min + inline | watchdog for stuck tasks, failing sources, integration health, approval reminders, scam/injection detection, output validation | — |
| **Analytics** | `agents.analytics_run`, `analytics_snapshot` | every 6 h | rescoring, per-platform reply rates → bounded ±5 score boost (only after ≥5 sends), A/B results, demand by category, best posting hours, daily Telegram report | — (never changes limits, rates, permissions) |

## Models
`claude-opus-5-5` for proposals, negotiation, profiles, pitches (override per agent in Settings → `llm.models`, with a
fallback model). Lead scoring and email routing are rule-based on purpose: free, instant and explainable.
