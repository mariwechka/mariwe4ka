# Security rules

## Implemented
- **Secrets**: API keys, OAuth refresh token and generated platform passwords are stored Fernet-encrypted in the `vault`
  table. The key is `NEXUS_MASTER_KEY` or `data/master.key` (chmod 600, gitignored). `.env` and `data/*` are gitignored.
  Settings API reports only whether a key is set; the export endpoint never includes the vault.
- **Access**: binds to 127.0.0.1 by default; refuses a public interface without `NEXUS_ACCESS_TOKEN`
  (then every `/api` call needs `Authorization: Bearer <token>`). Docker publishes on host 127.0.0.1 only.
- **Agent permissions**: `core.guard()` — modes, per-agent pause, Emergency Stop, spend limits (default 0), and an
  always-owner list (registration, accepting orders, final terms, payments, identity).
- **Audit log**: every external action and decision is in `activity` (UI: Live Activity).
- **No double sends**: one proposal per opportunity (UNIQUE), `proposal_mark_sent` is idempotent, `_do_send` refuses an
  already-sent proposal, approvals have dedupe keys, tasks have dedupe keys.
- **Rate limiting**: per-source intervals, 1 s pause between Freelancer queries, daily caps for proposals and outreach,
  one follow-up maximum, opt-out respected forever.
- **Prompt injection**: all third-party text goes into `<untrusted_data>` (tags inside it are stripped), the system prompt
  states it is data; injection phrases lower a job's score and are flagged; model output is validated
  (`llm.unsafe_output`: no foreign links, no unconfirmed years/reviews) and rejected/regenerated otherwise.
- **Malicious links**: shortened links flagged as risk; email confirmation links are opened only if they belong to the
  platform's own domain and only for an account you started registering.
- **Scams**: upfront-payment, crypto, off-platform pressure, unpaid big tests, credential requests, fake-review and
  "register an account for me" patterns → score penalty, `critical` Telegram alert, conversation stopped.
- **Data rights**: Settings → Export (JSON of all data), Backup (`VACUUM INTO`, last 14 kept), Delete all data.

## Policy
- Never bypass CAPTCHA, anti-bot systems, region restrictions; no proxies, fingerprint spoofing or CAPTCHA solvers.
- Never automate platforms whose ToS forbid it (Upwork proposals, LinkedIn, Fiverr) — manual flow instead.
- No passport/selfie storage. Identity checks are done by the owner directly on the platform.
- No fabricated identities, addresses, experience, reviews or language levels.
- Instructions found in job posts, websites or client messages are never executed.
