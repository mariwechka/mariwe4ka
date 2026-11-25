"""Platform registry (seed knowledge) and job-source adapters.

Each adapter declares which operations are officially supported, which need the owner, and which are forbidden.
Adding a platform = add one entry to SEED_PLATFORMS (and, if it has a feed/API, one fetch function in ADAPTERS)."""
import calendar, html, re, time
import feedparser, httpx
from bs4 import BeautifulSoup

UA = {"User-Agent": "NEXUS-Freelance-Agent/1.0 (+personal job monitor)"}

# Operation support legend: "api" official API, "feed" public RSS/JSON, "manual" owner does it (agent prepares everything),
# "forbidden" ToS forbids automation. Values marked est. are seed estimates the Discovery agent re-checks; edit in Platforms.
OPS = ["search", "details", "register", "login", "profile", "publish_service", "prepare_proposal", "send_proposal", "read_messages", "send_messages", "order_status"]


def ops(**kw):
    base = {o: "manual" for o in OPS}
    base["prepare_proposal"] = "api"  # always done locally by the Proposal agent
    base.update(kw)
    return base


SEED_PLATFORMS = [
    # slug, name, url, region, kind, relevance 0-10, commission %, bid cost, reputation 0-10, ops, adapter, notes
    dict(slug="freelancer", name="Freelancer.com", url="https://www.freelancer.com", region="global", kind="marketplace", relevance=7, commission=10, bid_cost="free bids/month, paid plans", reputation=7,
         ops=ops(search="api", details="api", send_proposal="api (OAuth app needed)"), adapter="freelancer", notes="Official public REST API for project search. Bidding via API requires an approved OAuth app + account."),
    dict(slug="upwork", name="Upwork", url="https://www.upwork.com", region="global", kind="marketplace", relevance=9, commission=10, bid_cost="Connects (paid)", reputation=9,
         ops=ops(send_proposal="forbidden", search="manual"), adapter=None, notes="ToS forbid automated proposals/scraping; API access needs partner approval. ID verification required. Agents prepare proposals for manual sending."),
    dict(slug="fiverr", name="Fiverr", url="https://www.fiverr.com", region="global", kind="gig-marketplace", relevance=9, commission=20, bid_cost="none", reputation=9,
         ops=ops(search="forbidden", send_proposal="forbidden"), adapter=None, notes="Sell gigs (Basic/Standard/Premium). No public seller API; gig texts are generated here and published by the owner."),
    dict(slug="peopleperhour", name="PeoplePerHour", url="https://www.peopleperhour.com", region="UK/EU", kind="marketplace", relevance=8, commission=20, bid_cost="free proposal credits, paid extra", reputation=7, ops=ops(), adapter=None, notes="Offers + hourlies. No public API."),
    dict(slug="guru", name="Guru", url="https://www.guru.com", region="global", kind="marketplace", relevance=6, commission=9, bid_cost="bids (paid plans)", reputation=6, ops=ops(), adapter=None, notes=""),
    dict(slug="contra", name="Contra", url="https://contra.com", region="global", kind="marketplace", relevance=8, commission=0, bid_cost="none", reputation=7, ops=ops(), adapter=None, notes="Commission-free for freelancers; portfolio-first, good fit for designers."),
    dict(slug="kwork", name="Kwork", url="https://kwork.ru", region="RU/CIS", kind="gig-marketplace", relevance=8, commission=20, bid_cost="limited free offers", reputation=7, ops=ops(), adapter=None, notes="Kworks (gigs) + project exchange. Russian-speaking market."),
    dict(slug="flru", name="FL.ru", url="https://www.fl.ru", region="RU/CIS", kind="marketplace", relevance=8, commission=0, bid_cost="PRO account for most responses", reputation=6,
         ops=ops(search="feed", details="feed"), adapter="flru", notes="Public RSS of all projects."),
    dict(slug="freelancehunt", name="Freelancehunt", url="https://freelancehunt.com", region="UA/CIS", kind="marketplace", relevance=7, commission=0, bid_cost="paid bids / plan", reputation=6,
         ops=ops(search="feed", details="feed"), adapter="freelancehunt", notes="Public RSS. Official API exists for account holders."),
    dict(slug="weblancer", name="Weblancer", url="https://www.weblancer.net", region="RU/CIS", kind="marketplace", relevance=6, commission=0, bid_cost="paid plans", reputation=5, ops=ops(), adapter=None, notes="Old RSS URL returns 404."),
    dict(slug="habr", name="Хабр Фриланс", url="https://freelance.habr.com", region="RU", kind="marketplace", relevance=0, commission=0, bid_cost="-", reputation=0, ops=ops(), adapter=None, notes="Service has closed (checked 2026-11-25)."),
    dict(slug="behance", name="Behance", url="https://www.behance.net", region="global", kind="portfolio+jobs", relevance=9, commission=0, bid_cost="none", reputation=9, ops=ops(), adapter=None, notes="Portfolio showcase + hire/jobs. Publish case studies manually; strong inbound channel for designers."),
    dict(slug="dribbble", name="Dribbble", url="https://dribbble.com", region="global", kind="portfolio+jobs", relevance=9, commission=0, bid_cost="Pro for project briefs", reputation=8, ops=ops(), adapter=None, notes="Shots + project briefs (Pro)."),
    dict(slug="toptal", name="Toptal", url="https://www.toptal.com", region="global", kind="vetted-network", relevance=6, commission=0, bid_cost="none", reputation=9, ops=ops(register="manual (screening)"), adapter=None, notes="Multi-stage screening with interviews — owner only."),
    dict(slug="malt", name="Malt", url="https://www.malt.com", region="EU", kind="marketplace", relevance=7, commission=10, bid_cost="none", reputation=8, ops=ops(), adapter=None, notes="FR/DE/ES/NL/BE/UK clients; EU residency often expected."),
    dict(slug="workana", name="Workana", url="https://www.workana.com", region="LatAm", kind="marketplace", relevance=6, commission=20, bid_cost="limited free bids", reputation=6, ops=ops(), adapter=None, notes="Spanish/Portuguese clients."),
    dict(slug="truelancer", name="Truelancer", url="https://www.truelancer.com", region="IN/global", kind="marketplace", relevance=5, commission=10, bid_cost="limited free", reputation=5, ops=ops(), adapter=None, notes="Low budgets typical."),
    dict(slug="twine", name="Twine", url="https://www.twine.net", region="global", kind="marketplace", relevance=7, commission=0, bid_cost="paid plan to pitch", reputation=6, ops=ops(), adapter=None, notes="Creative freelancers."),
    dict(slug="designcrowd", name="DesignCrowd", url="https://www.designcrowd.com", region="global", kind="contests", relevance=5, commission=15, bid_cost="none (spec work)", reputation=6, ops=ops(), adapter=None, notes="Design contests = unpaid spec work unless you win."),
    dict(slug="99designs", name="99designs", url="https://99designs.com", region="global", kind="contests", relevance=6, commission=15, bid_cost="none", reputation=7, ops=ops(), adapter=None, notes="Contests + 1-to-1 projects; owned by Vista."),
    dict(slug="linkedin", name="LinkedIn", url="https://www.linkedin.com", region="global", kind="network", relevance=7, commission=0, bid_cost="Premium optional", reputation=9,
         ops=ops(search="forbidden", send_messages="forbidden", send_proposal="forbidden"), adapter=None, notes="User agreement forbids bots/scraping. Profile texts prepared here; all activity manual."),
    dict(slug="remoteok", name="Remote OK", url="https://remoteok.com", region="global", kind="remote-jobs", relevance=5, commission=0, bid_cost="none", reputation=7,
         ops=ops(search="api", details="api"), adapter="remoteok", notes="Public JSON API (must link back to Remote OK). Mostly full-time roles."),
    dict(slug="weworkremotely", name="We Work Remotely", url="https://weworkremotely.com", region="global", kind="remote-jobs", relevance=5, commission=0, bid_cost="none", reputation=7,
         ops=ops(search="feed", details="feed"), adapter="weworkremotely", notes="Public RSS per category. Mostly full-time roles."),
    # Regional seeds (Turkey / Azerbaijan / CIS) — status verified by the Discovery agent
    dict(slug="bionluk", name="Bionluk", url="https://bionluk.com", region="TR", kind="gig-marketplace", relevance=7, commission=20, bid_cost="?", reputation=6, ops=ops(), adapter=None, notes="Turkish freelance marketplace."),
    dict(slug="armut", name="Armut", url="https://armut.com", region="TR", kind="services", relevance=4, commission=0, bid_cost="paid quotes", reputation=6, ops=ops(), adapter=None, notes="Local services, includes design."),
    dict(slug="bossaz", name="Boss.az", url="https://boss.az", region="AZ", kind="jobs-board", relevance=4, commission=0, bid_cost="none", reputation=6, ops=ops(), adapter=None, notes="Azerbaijani job board (vacancies, some freelance)."),
    dict(slug="youdo", name="YouDo", url="https://youdo.com", region="RU", kind="services", relevance=5, commission=0, bid_cost="paid responses", reputation=6, ops=ops(), adapter=None, notes="Task marketplace incl. design."),
    dict(slug="workzilla", name="Workzilla", url="https://work-zilla.com", region="RU", kind="micro-tasks", relevance=4, commission=0, bid_cost="subscription", reputation=5, ops=ops(), adapter=None, notes="Small tasks, low budgets."),
]

# ---------- helpers ----------
CUR = {"₽": "RUB", "&#8381;": "RUB", "руб": "RUB", "uah": "UAH", "грн": "UAH", "$": "USD", "usd": "USD", "€": "EUR", "eur": "EUR", "azn": "AZN", "₼": "AZN", "₺": "TRY", "tl": "TRY", "£": "GBP", "pln": "PLN", "zł": "PLN", "kzt": "KZT", "₸": "KZT", "gbp": "GBP"}


def parse_budget(text):
    t = html.unescape(text or "")
    unit = r"\s*([\d\s.,]{2,}?)\s*(₽|руб\w*|uah|грн|usd|\$|€|eur|azn|₼|₺|tl\b|£|pln|zł|kzt|₸|gbp)"
    m = (re.search(r"(?:бюджет|budget)[:\s]*" + unit, t, re.I) or re.search(r"- " + unit, t, re.I)
         or re.search(r"(\$|€|£|₼)\s?([\d,.]{2,})", t))
    if not m:
        return None, None
    a, b = m.groups()
    num, cur = (b, a) if a in "$€£₼" else (a, b)
    try:
        val = float(re.sub(r"[\s,]", "", num))
    except ValueError:
        return None, None
    return val, CUR.get(cur.lower(), CUR.get(cur, "USD"))


def _ts(struct):
    return calendar.timegm(struct) if struct else time.time()


def _text(h):
    return BeautifulSoup(h or "", "html.parser").get_text(" ", strip=True)


def get(url, **kw):
    r = httpx.get(url, headers=UA, timeout=25, follow_redirects=True, **kw)
    r.raise_for_status()
    return r


# ---------- adapters: each returns normalized job dicts ----------
def rss(url, kind="gig"):
    feed = feedparser.parse(get(url).content)
    out = []
    for e in feed.entries:
        title = html.unescape(e.get("title", ""))
        amount, cur = parse_budget(title + " " + e.get("summary", ""))
        out.append(dict(external_id=e.get("id") or e.get("link"), url=e.get("link"), title=title, description=_text(e.get("summary", ""))[:5000],
                        budget_min=amount, budget_max=amount, currency=cur, published=_ts(e.get("published_parsed")),
                        skills=[t.get("term") for t in e.get("tags", []) if t.get("term")], kind=kind,
                        competitors=int(e["slash_comments"]) if str(e.get("slash_comments", "")).isdigit() else None))
    return out


def remoteok():
    data = get("https://remoteok.com/api").json()[1:]
    out = []
    for j in data:
        tags = [t.lower() for t in j.get("tags", [])]
        if not ({"design", "designer", "ui", "ux", "web", "frontend", "front end", "brand", "graphic"} & set(tags)):
            continue
        out.append(dict(external_id=str(j["id"]), url=j.get("url"), title=f'{j.get("position")} — {j.get("company")}',
                        description=_text(j.get("description", ""))[:5000], budget_min=j.get("salary_min") or None,
                        budget_max=j.get("salary_max") or None, currency="USD", published=j.get("epoch") or time.time(),
                        client=j.get("company"), skills=j.get("tags", []), kind="job"))
    return out


def weworkremotely():
    return rss("https://weworkremotely.com/categories/remote-design-jobs.rss", "job")


QUERIES = ["website design", "landing page", "logo design", "brand identity", "ui ux design", "presentation design", "web design", "redesign website", "3d interior"]


def freelancer():
    out, seen = [], set()
    for qy in QUERIES:
        d = get("https://www.freelancer.com/api/projects/0.1/projects/active/",
                params={"query": qy, "limit": 20, "full_description": "true", "job_details": "true", "sort_field": "time_updated"}).json()
        for p in d["result"]["projects"]:
            if p["id"] in seen:
                continue
            seen.add(p["id"])
            b = p.get("budget") or {}
            out.append(dict(external_id=str(p["id"]), url=f'https://www.freelancer.com/projects/{p["seo_url"]}', title=p["title"],
                            description=(p.get("description") or p.get("preview_description") or "")[:5000],
                            budget_min=b.get("minimum"), budget_max=b.get("maximum"), currency=p["currency"]["code"],
                            published=p.get("time_submitted") or time.time(), competitors=(p.get("bid_stats") or {}).get("bid_count"),
                            skills=[j["name"] for j in p.get("jobs") or []], client=str(p.get("owner_id")),
                            kind="hourly" if p.get("type") == "hourly" else "gig", language=p.get("language")))
        time.sleep(1)  # be gentle with the public API
    return out


def flru():
    return rss("https://www.fl.ru/rss/all.xml")


def freelancehunt():
    return rss("https://freelancehunt.com/projects.rss")


def telegram_channel(name):
    """Public channel web preview (t.me/s/...) — the same page anyone sees without logging in."""
    soup = BeautifulSoup(get(f"https://t.me/s/{name}").text, "html.parser")
    out = []
    for m in soup.select(".tgme_widget_message[data-post]"):
        t = m.select_one(".tgme_widget_message_text")
        if not t:
            continue
        text = t.get_text("\n", strip=True)
        tm = m.select_one("time[datetime]")
        amount, cur = parse_budget(text)
        out.append(dict(external_id=m["data-post"], url=f'https://t.me/{m["data-post"]}', title=text.split("\n")[0][:140],
                        description=text[:5000], budget_min=amount, budget_max=amount, currency=cur, kind="gig",
                        published=time.mktime(time.strptime(tm["datetime"][:19], "%Y-%m-%dT%H:%M:%S")) if tm else time.time()))
    return out


ADAPTERS = {"freelancer": freelancer, "remoteok": remoteok, "weworkremotely": weworkremotely, "flru": flru, "freelancehunt": freelancehunt}


def fetch(slug, platform_data=None):
    if slug.startswith("tg:"):
        return telegram_channel(slug[3:])
    if slug in ADAPTERS:
        return ADAPTERS[slug]()
    feed = (platform_data or {}).get("feed_url")
    if feed:  # discovered platforms with a public feed use the generic RSS adapter
        return rss(feed)
    raise LookupError(f"No search adapter for {slug}")
