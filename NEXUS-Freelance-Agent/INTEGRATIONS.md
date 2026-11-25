# Integrations

## Job sources (verified live on 2026-11-25)
| Source | Method | Status | Notes |
|---|---|---|---|
| Freelancer.com | official public REST API `projects/0.1/projects/active` | ✅ works, no key | 9 design queries, 1 s pause between them. Bidding via API needs an approved OAuth app (not set up) → proposals are copied manually |
| Remote OK | public JSON API | ✅ | ToS: link back to Remote OK (we always link to the original post). Mostly full-time roles |
| We Work Remotely | RSS (design category) | ✅ | full-time roles |
| FL.ru | RSS `rss/all.xml` | ✅ | budget parsed from the title ("Бюджет: …") |
| Freelancehunt | RSS `projects.rss` | ✅ | budget parsed from the title ("- 800UAH") |
| Хабр Фриланс | — | ❌ closed | the service has shut down; marked `closed`, score 0 |
| Weblancer | RSS | ❌ 404 | old feed URL gone; platform kept for manual use |
| Telegram channels | public web preview `t.me/s/<channel>` | ✅ adapter | add channel names in Settings → `telegram_channels`; same page anyone sees without login |
| Any discovered platform | generic RSS adapter | ✅ | Discovery agent auto-detects `<link rel=alternate type=rss>` |

Upwork, Fiverr, LinkedIn, PeoplePerHour, Kwork, Contra, Malt, Toptal, Behance, Dribbble, 99designs, DesignCrowd,
Workana, Truelancer, Twine, Guru, Bionluk, Armut, Boss.az, YouDo, Workzilla: no public job feed or ToS forbid
automation → **manual flow**: NEXUS generates profile texts, gig listings and proposals; you publish/send them.
Each platform's operation matrix (search, details, register, login, profile, publish_service, prepare/send proposal,
read/send messages, order_status → `api` / `feed` / `manual` / `forbidden`) is visible on the Platforms page.

Adding a platform: Platforms → "Add platform" (URL + optional RSS) — no code. A platform with an API: add a fetch
function to `sources.ADAPTERS` and an entry to `SEED_PLATFORMS`.

## Business leads
- Nominatim (geocoding) + Overpass API (OpenStreetMap) with 3 mirrors. Only public business tags (name, website, email, phone).
- Website audit is a single GET of the public homepage.

## Anthropic API
Official `anthropic` Python SDK, structured outputs (`output_config.format` JSON schema), server-side refusal fallback
(`server-side-fallback-2026-07-01`) on Opus/Sonnet, `fallback_model` if a model id is unavailable, response cache,
per-call cost written to the ledger, daily/monthly AI budget (default $1 / $20, editable in Finance).
Other providers: set Settings → `llm.provider = "openai"`, `openai_base_url`, `openai_model` (OpenAI, DeepSeek,
Gemini's OpenAI-compatible endpoint, or local Ollama `http://localhost:11434/v1`).

## Gmail (OAuth 2.0)
1. Google Cloud Console → new project → enable **Gmail API**.
2. OAuth consent screen: External, add yourself as test user. Scopes: `gmail.readonly`, `gmail.send` (nothing else).
3. Credentials → OAuth client ID → **Web application** → redirect URI `http://127.0.0.1:8765/api/gmail/callback`.
4. Paste Client ID + Secret in NEXUS → Settings → API keys, then click **Connect Gmail**. The refresh token is stored encrypted.
NEXUS never asks for your Google password, never deletes or modifies mail, and only stores messages from known leads
and platform domains.

## Telegram
1. @BotFather → `/newbot` → copy the token → Settings → `TELEGRAM_BOT_TOKEN`.
2. Settings shows a one-time pairing code. From **@mrwechka** send `/start <code>` to your bot.
   Binding requires both the username and the code; other chats are ignored.

## Brave Search API (optional)
Free tier key → `BRAVE_API_KEY`. Enables discovery of new platforms worldwide (queries in EN/RU/TR/AZ).
Without it, discovery re-checks known platforms and RSS-autodiscovers feeds.
