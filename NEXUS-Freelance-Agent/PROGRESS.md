# PROGRESS

_Last updated: 2026-11-25 (session 1)_

## Status by stage
| # | Stage | State | Verified how |
|---|---|---|---|
| 1 | Environment analysis | ✅ | Linux container, Python 3.13, Node 22, Playwright+Chromium; probed which job sources are reachable |
| 2 | Architecture, DB, docs | ✅ | `ARCHITECTURE.md`; stack deviation justified there |
| 3 | Knowledge base | ✅ | crawled all 15 project pages + about/services of mariwechka.org (Cloudflare challenge passed by a normal headless browser) → `data/knowledge_base.json` |
| 4 | UI (14 sections, RU/EN, mobile) | ✅ | Playwright screenshots of every page, 0 JS errors; no horizontal scroll at 390 px |
| 5 | MVP flow: real job → score → portfolio match → proposal → notification | ✅ | live run: 234 real jobs from 5 sources; test `test_end_to_end_…` |
| 6 | Integrations: Anthropic, Telegram, Gmail | ⚙️ code done, tested with mocks | needs your keys (no keys exist in this environment) |
| 7 | Platform discovery & scoring | ✅ | 28 platforms checked live: 20 active, 7 bot-protected, Хабр Фриланс detected as closed |
| 8 | Job adapters, filtering | ✅ | Freelancer API, Remote OK API, FL.ru/Freelancehunt/WWR RSS, Telegram channels, generic RSS |
| 9 | Registration | ✅ semi-automatic | vault password + approval + browser; tests for duplicates/flow |
| 10 | Profiles & services | ✅ | generation + price clamp to approved rates (test) |
| 11 | Proposals | ✅ | AI path (mocked in tests), rule-based skeleton on demand, A/B, safety validation |
| 12 | Negotiation | ✅ | intent → stage → deal card; scam alert; opt-out (tests + UI click-through) |
| 13 | CRM | ✅ | kanban drag/drop, merge, notes/tags, deal card actions |
| 14 | Autonomy & background | ✅ | modes, guard, pauses, emergency stop, queue recovery (tests) |
| 15 | Analytics & finance | ✅ | snapshot, boosts, A/B, ledger, limits |
| 16 | Testing | ✅ 23 tests green | see `TESTING.md` |
| 17 | Launch | ✅ | `start.sh` verified from a clean venv; `start.bat`, `NEXUS.command`, shortcuts, Docker |

## Works right now (no keys)
Platform checks, job discovery from 5 live sources, scoring with explanations, scam flags, business-lead search
(OpenStreetMap; verified live in Baku), website audits, CRM, manual-message negotiation (rule-based intent), skeleton
drafts, all UI.

## Needs your setup
- `ANTHROPIC_API_KEY` → personalised proposals, profiles, services, pitches, negotiation replies.
- `TELEGRAM_BOT_TOKEN` + `/start <code>` → notifications and remote control.
- Gmail OAuth client → email agent (inbox routing, sending approved emails, sign-up confirmations).
- `BRAVE_API_KEY` (optional) → discovering new platforms on the web.
- Missing data (Portfolio page): country, languages + levels, approved price ranges, legal name (only for KYC platforms).

## Known limitations
- No platform allows fully automated sign-up or (for the ones we can search) automated bidding without an approved app →
  registration and sending are owner-confirmed by design.
- Freelancer.com bidding API needs an OAuth app approval from Freelancer; not implemented until you have an account.
- Concept lexicon instead of embeddings: good precision on titles, may miss unusual wording (`shortcut:` comment in code).
- Gmail and Telegram were tested with mocks only (no credentials here). Anthropic calls tested with mocks only.
- `api` and `worker` in separate processes both reset `running` tasks on start — run one combined process (default) or start worker first.
- FX rates are static defaults (Settings → fx_to_usd).

## Next
1. Add your keys, answer missing data, run a day in Manual mode, review proposal quality.
2. Add Telegram channels with design orders (Settings → telegram_channels).
3. When you have a Freelancer.com account: register an OAuth app → implement API bidding in `sources`/`agents`.
4. Tune scoring weights from real reply data (Analytics already computes per-platform reply rates).
