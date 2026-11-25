# TESTING

Run: `pip install -r requirements-dev.txt && python -m pytest -q tests` → **23 passed** (2026-11-25).
Tests use a temporary database; network, Telegram, Gmail and the AI provider are faked.

| Spec requirement | Test |
|---|---|
| Duplicate proposals / double send | `test_no_duplicate_proposals_or_sends`, `test_approved_email_send_and_no_resend`, duplicate fetch in `test_end_to_end_…` |
| Lost internet connection | `test_network_errors_retry_with_backoff_then_pause_source` |
| App restart / task recovery | `test_restart_recovers_running_tasks_and_dedupes` |
| Expired authorisation | `test_gmail_expired_auth_raises_critical` |
| AI API unavailable | `test_background_drafts_wait_for_ai_but_manual_skeleton_works`, `test_ai_budget_blocks_calls` |
| Financial limit exceeded | `test_guard_modes_limits_and_emergency_stop` (spend → approval), `test_ai_budget_blocks_calls` |
| Bad AI responses | `test_bad_ai_output_is_rejected` (+ required-field check in `llm.complete_json`) |
| Fraudulent messages / posts | `test_scam_and_injection_detection`, scam part of `test_negotiation_…` |
| Stopping agents | `test_guard_modes_limits_and_emergency_stop`, `test_paused_agent_defers_tasks`, Telegram `/stop` in `test_telegram_binding_…` |
| Manual registration confirmation | `test_manual_registration_flow` |
| Notifications | `test_notification_filtering`, digest in `test_end_to_end_…` |
| CRM | `test_negotiation_ready_to_order_creates_deal_card_and_scam_alert`, `test_declined_client_is_opted_out_and_never_emailed` |
| Secret safety | `test_secrets_encrypted_and_gitignored`, export check in `test_api_smoke` |
| Scoring quality (spec phrases RU/EN) | `test_scoring_ranks_design_needs_above_unrelated`, `test_language_detection` |
| Approved prices | `test_service_prices_stay_in_approved_range` |
| All API endpoints | `test_api_smoke` |

## Live checks (manual, this session)
- Job sources fetched live: Freelancer 87, FL.ru 60, Freelancehunt 50, WWR 32, Remote OK 5 → 234 jobs, 21 scored ≥ 70.
- Platform discovery: 28 checked → 20 active, 7 protected (403/429 to bots), 1 closed (Хабр Фриланс).
- Business leads: Baku cafés via OpenStreetMap → 5 leads, website audit caught an HTTP 522 site.
- UI: every page rendered in Chromium at 1440 px and iPhone 13 (no JS errors, no horizontal scroll);
  click-through: draft proposal → mark sent → CRM card → paste client message → stage moved to "Terms".
- Clean install: `start.sh` created a venv, installed requirements, started UI + worker.

## Bugs found and fixed during testing
- Raw `execute()` calls passed args incorrectly → scheduler crash (fixed with `core.n`).
- Marketing/SEO jobs scored 85 because "brand"/"motion" matched inside other words → word-boundary matching, title weighting, marketing negatives.
- Budget parser took the first number, not "Бюджет:" → keyword-first parsing; PLN/KZT added.
- Turkish detection matched a Latin "I" under IGNORECASE → Russian jobs got English drafts.
- HTTP 522 sites reported as "slow" → now "site returns an error".
- Mobile overflow from grid children `min-width:auto`.

## Not covered
Load testing beyond a few hundred jobs (SQLite is fine far beyond this), real Gmail/Telegram/Anthropic calls (no credentials here),
`docker compose` build/run (no Docker daemon in the build environment), `start.bat` / `NEXUS.command` on real Windows/macOS.
