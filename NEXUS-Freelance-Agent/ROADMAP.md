# ROADMAP

## Done (v0.1)
Stages 1–17 of the brief at MVP depth — see `PROGRESS.md` for what is verified.

## Next (needs the owner)
- [ ] Connect Anthropic, Telegram, Gmail; answer missing data; approve price ranges.
- [ ] One week in Manual mode → review proposal quality → switch to Smart Autopilot.
- [ ] Add Telegram order channels; add any local platforms you know (Platforms → Add).

## Next (engineering)
- [ ] Freelancer.com OAuth app → API bidding (the only searched platform with an official bid API).
- [ ] Freelancehunt API (account token) for messages/bids.
- [ ] Embedding-based matching (pgvector or local) if lexicon recall proves low on real data.
- [ ] Auto-generated cover images per service from portfolio images (Playwright screenshots of the live demos).
- [ ] FX rates from a public API instead of static defaults.
- [ ] Weekly analytics digest separate from the daily one.
- [ ] Multi-user mode (accounts, per-user KB/vault) for the SaaS version; PostgreSQL behind `core.q*`.
- [ ] Desktop wrapper (tray icon + autostart) instead of a terminal window.
