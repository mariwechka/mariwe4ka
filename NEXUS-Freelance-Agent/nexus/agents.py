"""The NEXUS agents. Each public function is one agent task; the worker schedules them, the API triggers them on demand.
Every external action passes core.guard(); every third-party text passes knowledge.untrusted()."""
import json, random, re, time
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from . import core, knowledge as K, llm, sources, integrations as I

STAGES = ["", "Found", "Analyzed", "Proposal prepared", "Proposal sent", "Waiting for reply", "Reply received", "Negotiation",
          "Terms", "Awaiting owner", "Order accepted", "In progress", "Completed", "Rejected"]


def J(v, default=None):
    try:
        return json.loads(v) if isinstance(v, str) else (v if v is not None else default)
    except ValueError:
        return default


# ============ Supervisor helpers ============
def emergency_stop():
    core.put("emergency_stop", True)
    n = core.n("UPDATE tasks SET status='cancelled' WHERE status='queued' AND kind IN ('business_pitch','followups')")
    core.log("supervisor", f"EMERGENCY STOP — external actions halted, {n} queued sends cancelled", "critical")


def seed_platforms():
    for p in sources.SEED_PLATFORMS:
        core.x("""INSERT OR IGNORE INTO platforms(slug,name,url,region,kind,api,automation,registration,notes,data)
                  VALUES(?,?,?,?,?,?,?,?,?,?)""", p["slug"], p["name"], p["url"], p["region"], p["kind"],
               p["ops"]["search"], json.dumps(p["ops"]), p["ops"]["register"], p["notes"],
               json.dumps({k: p[k] for k in ("relevance", "commission", "bid_cost", "reputation", "adapter")}))
    for ch in core.get("telegram_channels"):
        core.x("INSERT OR IGNORE INTO platforms(slug,name,url,region,kind,api,automation,data,discovered_by) VALUES(?,?,?,?,?,?,?,?,?)",
               "tg:" + ch, "Telegram @" + ch, "https://t.me/s/" + ch, "telegram", "telegram-channel", "feed",
               json.dumps({o: "manual" for o in sources.OPS} | {"search": "feed"}),
               json.dumps({"relevance": 6, "commission": 0, "reputation": 5, "adapter": "telegram"}), "owner")


# ============ Platform Discovery ============
FREELANCE_WORDS = ["freelance", "freelancer", "фриланс", "заказ", "hire", "projects", "proje", "serbest", "sifariş", "auftr", "gig"]
SEARCH_QUERIES = ["freelance marketplace for designers", "биржа фриланса для дизайнеров", "freelance platform web designers Europe",
                  "serbest çalışan platformu tasarımcı", "frilans platforması Azərbaycan", "freelance marketplace Asia designers",
                  "remote design jobs board", "сайт заказов для веб-дизайнеров"]


def platform_score(p, recent_jobs):
    d = J(p["data"], {})
    opsd = J(p["automation"], {})
    if p["status"] in ("closed", "unreachable"):
        return 0, "unavailable"
    s = d.get("relevance", 5) * 4 + d.get("reputation", 5) * 2
    s += max(0, 10 * (1 - (d.get("commission") or 0) / 25))
    s += 10 if opsd.get("search") in ("api", "feed") else 4
    s += min(20, recent_jobs)
    s = int(max(0, min(100, s)))
    if p["status"] == "suspicious":
        return min(s, 20), "suspicious"
    return s, "recommended" if s >= 70 else "promising" if s >= 50 else "low"


def check_platform(p):
    data = J(p["data"], {})
    try:
        r = httpx.get(p["url"], headers=sources.UA, timeout=20, follow_redirects=True)
        text = r.text[:200000].lower()
        status = "active" if r.status_code < 400 else ("protected" if r.status_code in (401, 403, 429) else "unreachable")
        if any(w in text for w in ["закрылся", "has closed", "service is closed", "больше не работает"]):
            status = "closed"
        if not str(r.url).startswith("https://"):
            status = "suspicious"
        soup = BeautifulSoup(r.text, "html.parser")
        feed = soup.find("link", attrs={"type": re.compile("rss|atom")})
        if feed and feed.get("href") and not data.get("feed_url"):
            data["feed_url"] = httpx.URL(str(r.url)).join(feed["href"]).__str__()
        try:  # robots.txt tells us whether generic crawling is allowed at all
            rb = httpx.get(httpx.URL(str(r.url)).join("/robots.txt"), headers=sources.UA, timeout=10).text
            data["robots_disallow_all"] = bool(re.search(r"user-agent:\s*\*\s*\n(?:.*\n)*?disallow:\s*/\s*\n", rb.lower()))
        except httpx.HTTPError:
            pass
    except httpx.HTTPError as e:
        status, data["last_error"] = "unreachable", str(e)[:200]
    n = core.q1("SELECT count(*) n FROM opportunities WHERE platform_slug=? AND score>=50 AND created>?", p["slug"], core.now() - 7 * 86400)["n"]
    p = {**p, "status": status, "data": json.dumps(data)}
    score, cat = platform_score(p, n)
    core.x("UPDATE platforms SET status=?, data=?, score=?, category=?, last_checked=? WHERE slug=?",
           status, json.dumps(data), score, cat, core.now(), p["slug"])
    return status, score


def search_web(query):
    """Allowed search APIs only (Brave Search API). Without a key, discovery re-checks known platforms only."""
    key = core.secret("BRAVE_API_KEY")
    if not key:
        return []
    r = httpx.get("https://api.search.brave.com/res/v1/web/search", params={"q": query, "count": 10},
                  headers={"X-Subscription-Token": key, "Accept": "application/json"}, timeout=20)
    r.raise_for_status()
    return [(x["url"], x.get("title", ""), x.get("description", "")) for x in r.json().get("web", {}).get("results", [])]


def platform_discovery():
    seed_platforms()
    known = {urlparse(p["url"]).netloc.replace("www.", "") for p in core.q("SELECT url FROM platforms")}
    added = 0
    for qy in SEARCH_QUERIES:
        try:
            results = search_web(qy)
        except httpx.HTTPError as e:
            core.log("platform_discovery", f"Search API error: {e}", "info")
            break
        for url, title, desc in results:
            host = urlparse(url).netloc.replace("www.", "")
            blob = f"{title} {desc}".lower()
            if host in known or not any(w in blob for w in FREELANCE_WORDS):
                continue
            known.add(host)
            core.x("INSERT OR IGNORE INTO platforms(slug,name,url,region,kind,automation,data,discovered_by,notes) VALUES(?,?,?,?,?,?,?,?,?)",
                   host, title[:60] or host, f"https://{host}", "?", "candidate", json.dumps({o: "manual" for o in sources.OPS}),
                   json.dumps({"relevance": min(10, 3 + 2 * len(K.concepts(blob))), "reputation": 4, "commission": None}),
                   "search", desc[:300])
            added += 1
    checked = 0
    for p in core.q("SELECT * FROM platforms WHERE paused=0 AND (last_checked IS NULL OR last_checked<?)", core.now() - 20 * 3600):
        check_platform(p)
        checked += 1
    core.log("platform_discovery", f"Checked {checked} platforms, discovered {added} new candidates"
             + ("" if core.secret("BRAVE_API_KEY") else " (add BRAVE_API_KEY to search the web for new platforms)"))
    return {"checked": checked, "added": added}


# ============ Lead Scoring ============
def score_opportunity(o):
    text = f"{o['title']}\n{o.get('description') or ''}\n{' '.join(J(o.get('skills'), []) or [])}"
    head = f"{o['title']} {(o.get('description') or '')[:400]}"
    cats = K.concepts(text)
    neg = K.negatives(head)
    reasons, risks = [], []
    title_cats = K.concepts(o["title"])
    # the title says what the client is buying; the body alone is weak evidence
    fit = (20 if title_cats else 0) + (min(15, 4 * len(cats) + sum(cats.values())) if cats else 0)
    if cats:
        reasons.append(f"+{fit} skill fit: {', '.join(cats)}" + ("" if title_cats else " (body only)"))
    else:
        reasons.append("+0 no design/web need detected")
    if neg:
        fit = max(0, fit - 25)
        reasons.append(f"−25 outside profile ({', '.join(neg[:3])})")
    matched = K.match_projects(text)
    port = 0 if not matched or not cats else (15 if len(matched) >= 2 else 10)
    if port:
        reasons.append(f"+{port} portfolio match: {', '.join(matched)}")
    amount = o.get("budget_max") or o.get("budget_min")
    usd = core.to_usd(amount, o.get("currency")) if amount else None
    if o.get("kind") == "job":
        bud = 12 if usd else 6
        reasons.append(f"+{bud} employment role" + (f" (~{usd:,.0f} USD/yr)" if usd else ""))
    elif usd is None:
        bud = 5
        reasons.append("+5 budget not stated")
    else:
        bud = 0 if usd < 30 else 5 if usd < 100 else 10 if usd < 300 else 15 if usd < 1000 else 20
        reasons.append(f"+{bud} budget ≈ {usd:,.0f} USD")
    age_h = (core.now() - (o.get("published") or core.now())) / 3600
    rec = 10 if age_h < 24 else 6 if age_h < 72 else 3 if age_h < 168 else 0
    reasons.append(f"+{rec} posted {age_h:.0f}h ago")
    bids = o.get("competitors")
    comp = 3 if bids is None else 8 if bids < 10 else 5 if bids < 30 else 2 if bids < 60 else 0
    reasons.append(f"+{comp} competition: {'unknown' if bids is None else f'{bids} bids'}")
    longterm = 5 if re.search(r"long[- ]term|ongoing|monthly|постоянн|долгосроч|на постоянку", text, re.I) else 0
    if longterm:
        reasons.append("+5 long-term potential")
    s = fit + port + bud + rec + comp + longterm
    for f in K.scam_flags(text):
        s -= 25
        risks.append(f)
    if K.injection_flag(text):
        s -= 15
        risks.append("Contains instructions aimed at AI tools (prompt injection)")
    if b := core.get("platform_boost").get(o.get("platform_slug")):
        s += b
        reasons.append(f"{b:+d} platform history (Analytics)")
    pref = core.get("proposals")
    if set(cats) & set(pref["excluded_categories"]):
        s = min(s, 30)
        reasons.append("capped: excluded category")
    elif set(cats) & set(pref["priority_categories"]):
        s += 5
        reasons.append("+5 priority category")
    if risks:
        reasons += [f"risk: {r}" for r in risks]
    s = int(max(0, min(100, s)))
    reasons.append("AI-free heuristic score — a ranking aid, not a probability of winning")
    return s, reasons, risks, list(cats), matched


def tier(score):
    t = core.get("thresholds")
    return "high" if score >= t["high"] else "good" if score >= t["good"] else "review" if score >= t["review"] else "low"


# ============ Job Discovery ============
def job_discovery(slug):
    p = core.q1("SELECT * FROM platforms WHERE slug=?", slug)
    if not p or p["paused"]:
        return {"skipped": True}
    data = J(p["data"], {})
    try:
        jobs = sources.fetch(slug, data)
        data["errors"] = 0
    except Exception as e:
        data["errors"] = data.get("errors", 0) + 1
        data["last_error"] = str(e)[:300]
        core.x("UPDATE platforms SET data=? WHERE slug=?", json.dumps(data), slug)
        if data["errors"] >= 3:
            core.x("UPDATE platforms SET paused=1 WHERE slug=?", slug)
            core.log("security", f"{p['name']}: paused after 3 consecutive errors ({data['last_error'][:120]})", "important")
        raise
    new, top = 0, []
    for j in jobs:
        if not j.get("external_id") or not j.get("title"):
            continue
        j["platform_slug"] = slug
        s, reasons, risks, cats, matched = score_opportunity(j)
        try:
            oid = core.x("""INSERT INTO opportunities(platform_slug,external_id,url,title,description,budget_min,budget_max,currency,published,
                client,competitors,skills,score,score_reasons,categories,matched_projects,risks,language,kind,created)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", slug, j["external_id"], j.get("url"), j["title"], j.get("description"),
                         j.get("budget_min"), j.get("budget_max"), j.get("currency"), j.get("published"), j.get("client"), j.get("competitors"),
                         json.dumps(j.get("skills") or []), s, json.dumps(reasons, ensure_ascii=False), json.dumps(cats), json.dumps(matched),
                         json.dumps(risks), j.get("language") or K.language(j["title"] + " " + (j.get("description") or "")), j.get("kind", "gig"), core.now())
        except Exception:  # duplicate (platform, external_id) — already known
            continue
        new += 1
        if risks:
            core.log("security", f"Suspicious post skipped: {j['title'][:80]} — {risks[0]}", "info", opportunity_id=oid)
        elif s >= core.get("proposals")["min_score"]:
            top.append((s, oid, j["title"]))
    # expire stale posts (feeds drop closed ones; anything >14 days is treated as closed)
    core.x("UPDATE opportunities SET status='expired' WHERE platform_slug=? AND status='new' AND published<?", slug, core.now() - 14 * 86400)
    data["last_fetch"], data["last_count"] = core.now(), len(jobs)
    core.x("UPDATE platforms SET data=? WHERE slug=?", json.dumps(data), slug)
    top.sort(reverse=True)
    for s, oid, title in top[:5]:
        core.enqueue("proposal_draft", {"opportunity_id": oid}, f"proposal:{oid}")
    core.log("job_discovery", f"{p['name']}: {len(jobs)} posts, {new} new, {len(top)} above threshold")
    if top:  # one digest per run instead of one ping per job
        core.log("lead_scoring", f"{len(top)} promising job(s) on {p['name']} — proposals being prepared:\n"
                 + "\n".join(f"[{s}] {t[:90]}" for s, _, t in top[:3]), "important", opportunity_ids=[o for _, o, _ in top])
    return {"fetched": len(jobs), "new": new, "top": len(top)}


# ============ Proposal ============
PROPOSAL_SCHEMA = {"type": "object", "additionalProperties": False,
                   "required": ["language", "subject", "body", "idea", "price_note"],
                   "properties": {"language": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"},
                                  "idea": {"type": "string"}, "price_note": {"type": "string"}}}

VARIANTS = {"A": "Structure: 1) one line restating the client's actual problem in their words, 2) how you'd solve it, 3) one relevant project, 4) a short question. Under 120 words.",
            "B": "Structure: open with one concrete idea for their project, then a 3-step mini plan, the most relevant project as proof, and an easy next step. Under 150 words."}


def _kb_context(slugs):
    kb = K.owner_profile()
    projects = [K.project(s) for s in slugs if K.project(s)]
    return json.dumps({"owner": kb["owner"], "skills": kb["skills"], "tools": kb["tools"], "services": kb["services"],
                       "process": kb["process"], "relevant_projects": projects, "honesty_rules": kb["honesty_rules"],
                       "owner_answers": kb["owner_answers"], "approved_rates_usd": kb["approved_rates"]}, ensure_ascii=False)


LANG_NAMES = {"ru": "Russian", "en": "English", "uk": "Ukrainian", "az": "Azerbaijani", "tr": "Turkish", "de": "German"}


def compose_rule_based(o, matched, lang):
    """Used when no AI provider is configured: built from the post's detected needs and real project facts, never a fixed text."""
    p = K.project(matched[0]) if matched else None
    cats = J(o.get("categories"), []) or list(K.concepts(o["title"] + " " + (o.get("description") or "")))
    ru = lang in ("ru", "uk")
    need = {"web": ("сайт", "website"), "landing": ("лендинг", "landing page"), "ecommerce": ("интернет-магазин", "online store"),
            "uiux": ("интерфейс", "interface"), "branding": ("айдентику", "brand identity"), "presentation": ("презентацию", "presentation"),
            "graphic": ("графику", "graphics"), "3d": ("3D-визуализацию", "3D visualisation"), "redesign": ("редизайн", "redesign"),
            "animation": ("анимацию", "animation")}
    what = ", ".join(need[c][0 if ru else 1] for c in cats[:2] if c in need) or ("дизайн" if ru else "design")
    title = o["title"].strip().rstrip(".")[:90]
    if ru:
        lines = [f"Здравствуйте! Прочитала задачу «{title}» — могу сделать {what} под ваши цели."]
        if p:
            lines.append(f"Близкий пример — {p['name']}: {p['description'].rstrip('.')}. Это мой концепт-проект, посмотреть можно здесь: {p['url']}")
        lines.append("Предлагаю начать с короткого брифа: аудитория, сроки, референсы — после этого пришлю направление и оценку.")
        lines.append("Какой срок для вас комфортный?\n— Мари, mariwechka.org")
    else:
        lines = [f"Hi! I read your post “{title}” — I can take on the {what} for it."]
        if p:
            lines.append(f"A close example is {p['name']}: {p['description'].rstrip('.')}. It's a self-initiated concept project: {p['url']}")
        lines.append("I'd start with a short brief (audience, timing, references), then share a direction and an estimate.")
        lines.append("What timeline do you have in mind?\n— Mari, mariwechka.org")
    return {"language": lang, "subject": title, "body": "\n\n".join(lines), "idea": "", "price_note": "Owner sets the price"}


def write_proposal(o, matched, variant, extra=""):
    lang = o.get("language") or K.language(o["title"] + " " + (o.get("description") or ""))
    if lang not in core.get("proposals")["languages"] and lang not in ("uk",):
        lang = "en"
    if not llm.available():
        return compose_rule_based(o, matched, lang), "rule-based"
    prompt = (f"Write a proposal/cover letter in {LANG_NAMES.get(lang, 'English')} from Mari (freelance designer) for this job.\n"
              f"{VARIANTS[variant]}\nAddress the client by name only if the post gives it. No flattery, no long intro, no clichés like "
              f"'I am excited' or 'I came across your post'. Sound like a real person. Mention one concrete idea specific to this job. "
              f"Do not mention any price or rate — Mari discusses budget personally; invite a short chat to scope the work instead. "
              f"Link only to mariwechka.org pages from the knowledge base.\n{extra}\n\nOWNER KNOWLEDGE BASE:\n{_kb_context(matched)}\n\n"
              f"JOB POST (platform {o['platform_slug']}, budget {o.get('budget_min')}-{o.get('budget_max')} {o.get('currency')}):\n"
              + K.untrusted(f"{o['title']}\n\n{o.get('description') or ''}"))
    data = llm.complete_json("proposal", "You write short, specific freelance proposals for a designer.", prompt, PROPOSAL_SCHEMA, 3000)
    problems = llm.unsafe_output(data["body"])
    if problems:
        data = llm.complete_json("proposal", "You write short, specific freelance proposals for a designer.",
                                 prompt + "\n\nYour previous draft was rejected: " + "; ".join(problems) + ". Fix it.", PROPOSAL_SCHEMA, 3000, use_cache=False)
        if llm.unsafe_output(data["body"]):
            raise ValueError("Proposal failed safety validation twice")
    return data, llm.model_for("proposal")


def upsert_lead(**kw):
    """Merge duplicates by email, website or opportunity — history is kept on the surviving record."""
    lead = None
    for key in ("email", "opportunity_id", "website"):
        if kw.get(key):
            lead = core.q1(f"SELECT * FROM leads WHERE {key}=?", kw[key])
            if lead:
                break
    if lead:
        upd = {k: v for k, v in kw.items() if v and not lead.get(k)}
        if kw.get("stage", 0) > lead["stage"] and lead["stage"] < 13:
            upd["stage"] = kw["stage"]
        if upd:
            core.x(f"UPDATE leads SET {', '.join(k + '=?' for k in upd)}, updated=? WHERE id=?", *upd.values(), core.now(), lead["id"])
        return lead["id"]
    cols = list(kw) + ["created", "updated"]
    return core.x(f"INSERT INTO leads({','.join(cols)}) VALUES({','.join('?' * len(cols))})", *kw.values(), core.now(), core.now())


def set_stage(lead_id, stage, note=None):
    core.x("UPDATE leads SET stage=?, updated=? WHERE id=?", stage, core.now(), lead_id)
    if note:
        core.x("UPDATE leads SET notes=notes || ? WHERE id=?", f"\n[{time.strftime('%Y-%m-%d')}] {note}", lead_id)


def proposal_draft(opportunity_id, allow_rule_based=False):
    o = core.q1("SELECT * FROM opportunities WHERE id=?", opportunity_id)
    if not o or core.q1("SELECT 1 FROM proposals WHERE opportunity_id=?", opportunity_id):
        return {"skipped": "exists"}
    if not llm.available() and not allow_rule_based:
        # background drafts must be genuinely personalised; skeletons only when the owner asks for one
        raise llm.LLMUnavailable("No AI provider configured — open the job and click 'Draft proposal' for a skeleton")
    matched = J(o["matched_projects"], [])
    variant = "A" if opportunity_id % 2 else "B"  # A/B split; each client only ever gets one proposal
    data, model = write_proposal(o, matched, variant)
    lead_id = upsert_lead(name=o.get("client") or o["title"][:60], company=o.get("client"), source="platform", platform_slug=o["platform_slug"],
                          opportunity_id=o["id"], stage=3, website=None)
    pid = core.x("INSERT INTO proposals(opportunity_id,lead_id,channel,language,subject,body,variant,status,model,created) VALUES(?,?,?,?,?,?,?,?,?,?)",
                 o["id"], lead_id, "platform", data["language"], data["subject"], data["body"], variant, "manual", model, core.now())
    core.x("UPDATE opportunities SET status='proposal_ready' WHERE id=?", o["id"])
    core.log("proposal", f"Proposal ready [{o['score']}] {o['title'][:80]} — send it on {o['platform_slug']}: {o['url']}", "info",
             proposal_id=pid, opportunity_id=o["id"])
    return {"proposal_id": pid}


def proposal_mark_sent(pid):
    p = core.q1("SELECT * FROM proposals WHERE id=?", pid)
    if not p or p["status"] == "sent":
        return False  # duplicate protection: a proposal is sent once
    core.x("UPDATE proposals SET status='sent', sent_at=? WHERE id=?", core.now(), pid)
    if p["lead_id"]:
        set_stage(p["lead_id"], 5, "Proposal sent")
        core.x("UPDATE leads SET last_contact=? WHERE id=?", core.now(), p["lead_id"])
    if p["opportunity_id"]:
        core.x("UPDATE opportunities SET status='applied' WHERE id=?", p["opportunity_id"])
    return True


def sends_today(channel="email"):
    return core.q1("SELECT count(*) n FROM proposals WHERE channel=? AND status='sent' AND sent_at>?", channel, core.now() - 86400)["n"]


def send_email_action(agent, action, to, subject, body, lead_id=None, proposal_id=None, thread_id=None, in_reply_to=None):
    """Guarded outbound email: sends, asks the owner, or refuses — never silently."""
    if not to or not re.match(r"[^@\s]+@[^@\s]+\.[a-z]{2,}$", to, re.I):
        return "invalid recipient"
    if lead_id and (l := core.q1("SELECT opted_out FROM leads WHERE id=?", lead_id)) and l["opted_out"]:
        return "recipient opted out"
    details = dict(to=to, subject=subject, body=body, lead_id=lead_id, proposal_id=proposal_id, thread_id=thread_id, in_reply_to=in_reply_to)
    decision, reason = core.guard(agent, action)
    cap = core.get("outreach")["max_per_day"] if action in ("cold_outreach", "followup") else core.get("proposals")["max_per_day"]
    if decision == "allow" and sends_today() >= cap:
        decision, reason = "approval", "daily sending limit reached"
    if decision == "allow" and not I.gmail_configured():
        decision, reason = "approval", "Gmail not connected"
    if decision == "deny":
        core.log(agent, f"Blocked: email to {to} — {reason}", "info")
        return "denied"
    if decision == "approval":
        core.request_approval("send_email", f"Send email to {to}: {subject[:70]}", details | {"reason": reason},
                              dedupe_key=f"email:{proposal_id or ''}:{to}:{hash(body) % 10**8}")
        return "awaiting approval"
    return _do_send(details, agent)


def _do_send(d, agent="email"):
    if core.get("emergency_stop"):
        return "denied: emergency stop"
    if d.get("proposal_id") and (p := core.q1("SELECT status FROM proposals WHERE id=?", d["proposal_id"])) and p["status"] == "sent":
        return "already sent"
    r = I.gmail_send(d["to"], d["subject"], d["body"], d.get("thread_id"), d.get("in_reply_to"))
    core.x("INSERT OR IGNORE INTO messages(lead_id,direction,channel,external_id,sender,subject,body,created) VALUES(?,?,?,?,?,?,?,?)",
           d.get("lead_id"), "out", "email", "gmail:" + r.get("id", str(time.time())), "me", d["subject"], d["body"], core.now())
    if d.get("proposal_id"):
        proposal_mark_sent(d["proposal_id"])
    elif d.get("lead_id"):
        core.x("UPDATE leads SET last_contact=?, updated=? WHERE id=?", core.now(), core.now(), d["lead_id"])
    core.log(agent, f"Email sent to {d['to']}: {d['subject'][:60]}")
    return "sent"


# ============ Approvals ============
def resolve_approval(aid, approve, via="ui", edits=None):
    a = core.q1("SELECT * FROM approvals WHERE id=?", aid)
    if not a or a["status"] != "pending":
        return "Already resolved"
    d = J(a["details"], {}) | (edits or {})
    result = "rejected"
    if approve:
        if a["kind"] == "send_email":
            if core.get("emergency_stop"):
                return "Emergency stop is active — lift it first"
            result = _do_send(d)
        elif a["kind"] == "registration":
            core.x("UPDATE accounts SET status='registered', updated=? WHERE platform_slug=?", core.now(), d["slug"])
            core.enqueue("profile_generate", {"slug": d["slug"]}, f"profile:{d['slug']}")
            result = "account marked registered; profile generation queued"
        elif a["kind"] == "deal":
            set_stage(d["lead_id"], 10, "Owner accepted the order")
            if d.get("budget_usd"):
                core.record("revenue_potential", "order", d["budget_usd"], "USD", d.get("platform"), f"lead {d['lead_id']}")
            result = "order accepted"
        else:
            result = "approved"
    else:
        if a["kind"] == "registration":
            core.x("UPDATE accounts SET status='skipped', updated=? WHERE platform_slug=?", core.now(), d["slug"])
        if a["kind"] == "deal":
            set_stage(d["lead_id"], 13, "Owner declined")
    core.x("UPDATE approvals SET status=?, resolved=?, details=? WHERE id=?", "approved" if approve else "rejected", core.now(),
           json.dumps(d | {"result": result, "via": via}, ensure_ascii=False), aid)
    core.log("supervisor", f"Approval #{aid} {'approved' if approve else 'rejected'} via {via}: {result}")
    return result


# ============ Registration ============
def registration_start(slug):
    p = core.q1("SELECT * FROM platforms WHERE slug=?", slug)
    if not p:
        raise LookupError(slug)
    if acc := core.q1("SELECT * FROM accounts WHERE platform_slug=? AND status IN ('registered','awaiting_owner')", slug):
        return {"status": acc["status"], "note": "account already exists — no duplicate created"}
    if p["status"] in ("closed", "unreachable", "suspicious"):
        return {"status": "blocked", "note": f"platform is {p['status']}"}
    email = K.kb()["owner"]["email"]
    core.vault_set(f"pw:{slug}", core.new_password())
    core.x("INSERT OR REPLACE INTO accounts(platform_slug,email,status,cred_ref,updated) VALUES(?,?,?,?,?)", slug, email, "awaiting_owner", f"pw:{slug}", core.now())
    steps = ["Open the sign-up page (button below or 'Open visible browser').", f"Use email {email} and the generated password (Platforms → Reveal password).",
             "Complete CAPTCHA / SMS / identity checks yourself — NEXUS never bypasses them.",
             "If a confirmation email arrives, the Email agent opens the platform's confirmation link automatically (Gmail connected).",
             "Click Approve here when the account works — the Profile agent then prepares your profile texts."]
    core.request_approval("registration", f"Register on {p['name']}", {"slug": slug, "url": p["url"], "email": email, "steps": steps,
                          "why_owner": "Registration needs acceptance of terms and usually CAPTCHA/SMS/ID — legally your action."}, dedupe_key=f"reg:{slug}")
    return {"status": "awaiting_owner"}


# ============ Profile & Services ============
PROFILE_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["headline", "bio", "skills", "categories", "portfolio", "keywords", "faq"],
                  "properties": {"headline": {"type": "string"}, "bio": {"type": "string"}, "skills": {"type": "array", "items": {"type": "string"}},
                                 "categories": {"type": "array", "items": {"type": "string"}}, "keywords": {"type": "array", "items": {"type": "string"}},
                                 "portfolio": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["project", "blurb"],
                                                                          "properties": {"project": {"type": "string"}, "blurb": {"type": "string"}}}},
                                 "faq": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["q", "a"],
                                                                    "properties": {"q": {"type": "string"}, "a": {"type": "string"}}}}}}


def profile_generate(slug, lang=None):
    p = core.q1("SELECT * FROM platforms WHERE slug=?", slug)
    lang = lang or ("ru" if p["region"] in ("RU/CIS", "RU", "UA/CIS") else "tr" if p["region"] == "TR" else "en")
    kb = K.owner_profile()
    if llm.available():
        data = llm.complete_json("profile", "You write freelance marketplace profiles that read naturally and stay strictly factual.",
                                 f"Write Mari's profile for {p['name']} ({p['kind']}, region {p['region']}) in {LANG_NAMES.get(lang, 'English')}. "
                                 f"Adapt tone and keywords to this platform's audience; do not reuse generic text. Headline ≤ 70 chars, bio 120-200 words, "
                                 f"pick the 4-6 most fitting projects. Facts only from the knowledge base.\n\n{_kb_context([x['slug'] for x in kb['projects']])}",
                                 PROFILE_SCHEMA, 6000)
        model = llm.model_for("profile")
    else:
        top = ["veltrix", "nocturne", "aether", "lumera", "solva", "chronos"]
        data = {"headline": "Web & brand designer — sites, identities, interactive presentations" if lang != "ru" else "Веб- и бренд-дизайнер: сайты, айдентика, интерактивные презентации",
                "bio": kb["owner"]["bio_confirmed"], "skills": kb["skills"] + kb["tools"][:8], "categories": [s["name"] for s in kb["services"]],
                "portfolio": [{"project": K.project(s)["name"], "blurb": K.project(s)["description"]} for s in top],
                "keywords": ["web design", "landing page", "brand identity", "UI/UX", "presentation design", "Figma", "3D visualization"], "faq": []}
        model = "rule-based"
    data["language"], data["model"] = lang, model
    core.x("INSERT INTO accounts(platform_slug,status,profile,updated) VALUES(?,?,?,?) ON CONFLICT(platform_slug) DO UPDATE SET profile=excluded.profile, updated=excluded.updated",
           slug, "not_registered", json.dumps(data, ensure_ascii=False), core.now())
    core.log("profile", f"Profile texts ready for {p['name']} ({lang})")
    return data


SERVICE_SCHEMA = {"type": "object", "additionalProperties": False,
                  "required": ["title", "description", "benefits", "scope", "requirements", "faq", "keywords", "cover_idea", "packages"],
                  "properties": {"title": {"type": "string"}, "description": {"type": "string"},
                                 "benefits": {"type": "array", "items": {"type": "string"}}, "scope": {"type": "array", "items": {"type": "string"}},
                                 "requirements": {"type": "array", "items": {"type": "string"}}, "keywords": {"type": "array", "items": {"type": "string"}},
                                 "cover_idea": {"type": "string"},
                                 "faq": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["q", "a"], "properties": {"q": {"type": "string"}, "a": {"type": "string"}}}},
                                 "packages": {"type": "array", "items": {"type": "object", "additionalProperties": False, "required": ["tier", "includes", "days", "price_usd"],
                                                                         "properties": {"tier": {"type": "string"}, "includes": {"type": "array", "items": {"type": "string"}},
                                                                                        "days": {"type": "integer"}, "price_usd": {"type": ["number", "null"]}}}}}}


def service_generate(service_key, slug="fiverr", lang="en"):
    svc = next(s for s in K.kb()["services"] if s["key"] == service_key)
    rates = core.get("approved_rates").get(service_key)
    examples = K.match_projects(svc["name"] + " " + " ".join(svc["includes"]))
    if llm.available():
        data = llm.complete_json("profile", "You write marketplace service listings (gigs) for a designer, factual and specific.",
                                 f"Create a {LANG_NAMES.get(lang, 'English')} service listing for '{svc['name']}' on {slug} with Basic/Standard/Premium packages. "
                                 f"Prices: {'stay within ' + str(rates) + ' USD' if rates else 'set price_usd to null — the owner has not approved rates yet'}. "
                                 f"Never undercut just to win orders.\n\n{_kb_context(examples)}", SERVICE_SCHEMA, 5000)
        model = llm.model_for("profile")
    else:
        data = {"title": svc["name"], "description": svc["pitch"], "benefits": svc["includes"], "scope": svc["includes"], "requirements": ["Brief", "References", "Content/text"],
                "faq": [], "keywords": [svc["name"]], "cover_idea": f"Use the cover of {examples[0] if examples else 'a portfolio project'}",
                "packages": [{"tier": t, "includes": svc["includes"][:i + 2], "days": d, "price_usd": None} for i, (t, d) in enumerate([("Basic", 5), ("Standard", 10), ("Premium", 20)])]}
        model = "rule-based"
    if rates:  # enforce the approved range regardless of what the model proposed
        for pk in data["packages"]:
            if pk.get("price_usd") is not None:
                pk["price_usd"] = max(rates[0], min(rates[1], pk["price_usd"]))
    data["examples"], data["model"] = [K.project(e)["url"] for e in examples], model
    sid = core.x("INSERT INTO services(platform_slug,service_key,language,data,created) VALUES(?,?,?,?,?)", slug, service_key, lang, json.dumps(data, ensure_ascii=False), core.now())
    core.log("profile", f"Service listing drafted: {data['title'][:60]} ({slug}/{lang})")
    return sid


# ============ Business Leads ============
OSM_TAGS = {"cafe": '["amenity"="cafe"]', "restaurant": '["amenity"="restaurant"]', "beauty": '["shop"="beauty"]', "hairdresser": '["shop"="hairdresser"]',
            "hotel": '["tourism"="hotel"]', "photo": '["craft"="photographer"]', "clinic": '["amenity"="clinic"]', "dentist": '["amenity"="dentist"]',
            "architect": '["office"="architect"]', "clothes": '["shop"="clothes"]', "school": '["amenity"="language_school"]'}
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]


def audit_site(url):
    problems, info = [], {}
    try:
        t0 = time.time()
        r = httpx.get(url, headers=sources.UA, timeout=20, follow_redirects=True)
        info["load_s"], info["status"] = round(time.time() - t0, 2), r.status_code
        if r.status_code >= 400:
            return {"problems": [f"Website returns an error (HTTP {r.status_code}) — customers can't open it"], **info}
        h = r.text
        soup = BeautifulSoup(h, "html.parser")
        low = h.lower()
        if not str(r.url).startswith("https://"):
            problems.append("No HTTPS — browsers mark the site 'Not secure'")
        if not soup.find("meta", attrs={"name": "viewport"}):
            problems.append("No mobile viewport — likely not adapted for phones")
        if not soup.title or len(soup.title.get_text(strip=True)) < 5:
            problems.append("Missing page title (hurts search visibility)")
        if not soup.find("meta", attrs={"name": "description"}):
            problems.append("No meta description")
        years = [int(y) for y in re.findall(r"(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d\d)", low)]
        if years and max(years) <= time.gmtime().tm_year - 3:
            problems.append(f"Footer year {max(years)} — site looks unmaintained")
        if re.search(r"jquery[-.]1\.|<table[^>]+width=|\.swf|<font ", low):
            problems.append("Outdated front-end techniques (old jQuery / table layout / Flash)")
        if len(h) > 3_000_000 or info["load_s"] > 4:
            problems.append(f"Slow/heavy page ({info['load_s']}s, {len(h) // 1024} KB HTML)")
        if not re.search(r"book|reserv|запис|брон|rezerv|randevu|termin|order|заказ", low):
            problems.append("No visible online booking/ordering")
        socials = len(re.findall(r"instagram\.com|wa\.me|whatsapp|t\.me/", low))
        if socials and len(soup.find_all("a")) < 15:
            problems.append("Thin site that sends visitors to social media to buy/book")
        info["status"] = r.status_code
    except httpx.HTTPError as e:
        problems.append(f"Website does not open ({type(e).__name__})")
    return {"problems": problems, **info}


PITCH_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["subject", "body", "strategy"],
                "properties": {"subject": {"type": "string"}, "body": {"type": "string"}, "strategy": {"type": "string"}}}


def business_pitch(lead):
    audit = J(lead["audit"], {})
    lang = core.get("outreach").get("language") or "en"
    matched = K.match_projects(" ".join(J(lead["tags"], [])) + " " + (lead["company"] or ""))
    if not llm.available():
        probs = audit.get("problems") or ["no website found"]
        body = (f"Hello {lead['company']} team,\n\nI'm Mari, a web and brand designer. I looked at your online presence and noticed: "
                f"{'; '.join(probs[:2]).lower()}. Fixing this usually makes it easier for new customers to find you and book.\n\n"
                f"If useful, I can sketch a one-screen concept of how your homepage could look — no obligation. "
                f"My work: https://mariwechka.org/\n\nIf this isn't relevant, just reply 'no' and I won't write again.\n\nMari")
        return {"subject": f"An idea for {lead['company']}'s website", "body": body, "strategy": "rule-based: top audit findings"}, "rule-based"
    data = llm.complete_json("business_lead", "You write short, respectful first-contact emails from a freelance designer to a local business.",
                             f"Write a first email in {LANG_NAMES.get(lang, 'English')} to {lead['company']} ({', '.join(J(lead['tags'], []))}). "
                             f"Explain the concrete practical benefit of fixing their specific problems for THIS kind of business. Under 130 words, "
                             f"no hype, offer a small free concept sketch (not free full work), end with a one-line opt-out. Subject ≤ 60 chars. "
                             f"Also return a 1-2 sentence strategy note for the owner.\n\nAUDIT:\n{K.untrusted(json.dumps(audit, ensure_ascii=False))}\n\n"
                             f"KNOWLEDGE BASE:\n{_kb_context(matched)}", PITCH_SCHEMA, 2000)
    if llm.unsafe_output(data["body"]):
        raise ValueError("Pitch failed safety validation")
    return data, llm.model_for("business_lead")


def business_leads(city=None, category=None, limit=15):
    cfg = core.get("outreach")
    city = city or cfg["city"]
    if not city:
        return {"skipped": "set Outreach city in Settings"}
    cats = [category] if category else cfg["categories"]
    g = httpx.get("https://nominatim.openstreetmap.org/search", params={"q": city, "format": "json", "limit": 1},
                  headers=sources.UA, timeout=20).json()
    if not g:
        raise LookupError(f"City not found: {city}")
    s, n, w, e = g[0]["boundingbox"]
    found = 0
    for cat in cats:
        qy = f'[out:json][timeout:25];nwr{OSM_TAGS.get(cat, OSM_TAGS["cafe"])}["name"]({s},{w},{n},{e});out tags center {limit * 3};'
        data = None
        for ep in OVERPASS:
            try:
                data = httpx.post(ep, data={"data": qy}, headers=sources.UA, timeout=40).json()
                break
            except (httpx.HTTPError, ValueError):
                continue
        if data is None:
            raise ConnectionError("All Overpass mirrors failed")
        for el in data.get("elements", []):
            t = el.get("tags", {})
            website = t.get("website") or t.get("contact:website")
            email = (t.get("email") or t.get("contact:email") or "").lower() or None
            if core.q1("SELECT 1 FROM leads WHERE company=? AND source='osm'", t["name"]):
                continue
            audit = audit_site(website) if website else {"problems": ["No website listed — relies on maps/social media"]}
            if website and not audit["problems"]:
                continue  # healthy site: nothing honest to offer
            lid = upsert_lead(company=t["name"], name=t["name"], email=email, website=website, phone=t.get("phone") or t.get("contact:phone"),
                              source="osm", stage=2, tags=json.dumps([cat, city]), audit=json.dumps(audit, ensure_ascii=False))
            found += 1
            if email:
                core.enqueue("business_pitch", {"lead_id": lid}, f"pitch:{lid}")
            if found >= limit:
                break
    core.log("business_lead", f"{city}: {found} businesses with improvable web presence ({', '.join(cats)})")
    return {"found": found}


def business_pitch_task(lead_id):
    lead = core.q1("SELECT * FROM leads WHERE id=?", lead_id)
    if not lead or lead["opted_out"] or core.q1("SELECT 1 FROM proposals WHERE lead_id=? AND channel='email'", lead_id):
        return {"skipped": True}
    data, model = business_pitch(lead)
    pid = core.x("INSERT INTO proposals(lead_id,channel,language,subject,body,variant,status,model,created) VALUES(?,?,?,?,?,?,?,?,?)",
                 lead_id, "email", core.get("outreach").get("language") or "en", data["subject"], data["body"], "pitch", "draft", model, core.now())
    core.x("UPDATE leads SET notes=notes || ? WHERE id=?", "\nStrategy: " + data["strategy"], lead_id)
    set_stage(lead_id, 3)
    return {"result": send_email_action("business_lead", "cold_outreach", lead["email"], data["subject"], data["body"], lead_id, pid)}


def followups():
    days = core.get("outreach")["followup_days"]
    done = 0
    for l in core.q("SELECT * FROM leads WHERE stage=5 AND followups=0 AND opted_out=0 AND email IS NOT NULL AND last_contact<?", core.now() - days * 86400):
        p = core.q1("SELECT * FROM proposals WHERE lead_id=? AND channel='email' AND status='sent'", l["id"])
        if not p:
            continue
        body = ("Hi again — just checking whether my note below reached the right person. If now isn't the time, no problem at all, "
                "I won't follow up again.\n\nMari\n\n> " + p["body"][:600].replace("\n", "\n> ")) if p["language"] != "ru" else \
               ("Здравствуйте! Уточню, дошло ли моё письмо ниже до нужного человека. Если сейчас неактуально — всё в порядке, больше не напишу.\n\nМари\n\n> " + p["body"][:600].replace("\n", "\n> "))
        r = send_email_action("business_lead", "followup", l["email"], "Re: " + p["subject"], body, l["id"])
        core.x("UPDATE leads SET followups=1 WHERE id=?", l["id"])  # one follow-up maximum, even if it waits for approval
        done += r == "sent"
    return {"followups": done}


# ============ Email & Negotiation ============
def platform_for_sender(sender):
    dom = sender.split("@")[-1]
    for p in core.q("SELECT slug,url FROM platforms"):
        host = urlparse(p["url"]).netloc.replace("www.", "")
        if host and dom.endswith(host):
            return p["slug"]
    return None


def email_poll():
    if not I.gmail_configured():
        return {"skipped": "Gmail not connected"}
    msgs = I.gmail_fetch()
    for m in msgs:
        slug = platform_for_sender(m["sender"])
        text = f"{m['subject']}\n{m['body']}"
        if slug:
            acc = core.q1("SELECT * FROM accounts WHERE platform_slug=?", slug)
            if acc and acc["status"] == "awaiting_owner" and re.search(r"confirm|verify|подтверд|активир", text, re.I):
                host = urlparse(core.q1("SELECT url FROM platforms WHERE slug=?", slug)["url"]).netloc.replace("www.", "")
                links = [u for u in re.findall(r"https://[^\s\"'<>]+", m["body"]) if urlparse(u).netloc.replace("www.", "").endswith(host)]
                if links:  # only the platform's own domain — never third-party links from an email
                    httpx.get(links[0], headers=sources.UA, timeout=20, follow_redirects=True)
                    core.log("email", f"Confirmed email for {slug} via its own link", "important")
            core.x("INSERT OR IGNORE INTO messages(direction,channel,external_id,sender,subject,body,intent,created) VALUES(?,?,?,?,?,?,?,?)",
                   "in", "platform-email", "gmail:" + m["id"], m["sender"], m["subject"], m["body"][:4000], "platform_notification", m["ts"])
            continue
        lead = core.q1("SELECT * FROM leads WHERE email=?", m["sender"])
        if not lead:
            continue  # personal mail is never touched or stored
        mid = core.x("INSERT OR IGNORE INTO messages(lead_id,direction,channel,external_id,sender,subject,body,data,created) VALUES(?,?,?,?,?,?,?,?,?)",
                     lead["id"], "in", "email", "gmail:" + m["id"], m["sender"], m["subject"], m["body"],
                     json.dumps({"thread_id": m["thread_id"], "message_id": m["message_id"]}), m["ts"])
        core.enqueue("negotiate", {"message_id": mid}, f"neg:{mid}")
    return {"fetched": len(msgs)}


NEG_SCHEMA = {"type": "object", "additionalProperties": False,
              "required": ["intent", "summary", "budget", "deadline", "requirements", "reply", "owner_needed"],
              "properties": {"intent": {"type": "string", "enum": ["question", "interested", "negotiating_terms", "ready_to_order", "declined", "scam", "other"]},
                             "summary": {"type": "string"}, "budget": {"type": ["string", "null"]}, "deadline": {"type": ["string", "null"]},
                             "requirements": {"type": "array", "items": {"type": "string"}}, "reply": {"type": "string"}, "owner_needed": {"type": "boolean"}}}

PRICE_Q = re.compile(r"price|pricing|\bcost|how much|\brates?\b|\bquote|budget|сколько|стоимост|цен[аыуе]|бюджет|расценк|qiymət|neçəyə|fiyat|ücret|ne kadar", re.I)
INTENT_STAGE = {"question": 6, "interested": 7, "negotiating_terms": 8, "ready_to_order": 9, "declined": 13}


def rule_intent(text):
    t = text.lower()
    if K.scam_flags(t):
        return "scam"
    if re.search(r"not interested|no thanks|не интересн|неактуальн|отпишит|unsubscribe|^no\b", t):
        return "declined"
    if re.search(r"let'?s start|go ahead|you'?re hired|send (the )?invoice|готов[ыа]? (оплат|начат|заказ)|давайте начн|берём|beriyem|başlayalım", t):
        return "ready_to_order"
    if re.search(r"price|cost|how much|budget|deadline|сколько|стоимост|бюджет|срок", t):
        return "negotiating_terms"
    if "?" in t:
        return "question"
    return "interested"


def negotiate(message_id):
    m = core.q1("SELECT * FROM messages WHERE id=?", message_id)
    if not m or m["intent"]:
        return {"skipped": True}
    lead = core.q1("SELECT * FROM leads WHERE id=?", m["lead_id"])
    history = core.q("SELECT direction,subject,body FROM messages WHERE lead_id=? AND id<? ORDER BY id", lead["id"], m["id"])
    prop = core.q1("SELECT * FROM proposals WHERE lead_id=? ORDER BY id LIMIT 1", lead["id"])
    flags = K.scam_flags(m["body"])
    if llm.available() and not flags:
        convo = "\n\n".join(f"[{h['direction']}] {h['subject']}\n{h['body'][:1500]}" for h in history[-10:])
        data = llm.complete_json("negotiation", "You are Mari's pre-sales assistant. You clarify scope, budget, timeline and references; you never commit to final price, deadline or contract.",
                                 f"Classify the client's latest message and draft Mari's reply in the client's language. Do not re-ask anything already answered in the history. "
                                 f"If the client is ready to order, reply that Mari will confirm the final terms personally today. Keep it short and human.\n\n"
                                 f"OUR FIRST PROPOSAL:\n{(prop or {}).get('body', '(none)')}\n\nHISTORY:\n{K.untrusted(convo, 9000)}\n\nLATEST MESSAGE:\n{K.untrusted(m['subject'] + chr(10) + m['body'])}"
                                 f"\n\nKNOWLEDGE BASE:\n{_kb_context(J((core.q1('SELECT matched_projects FROM opportunities WHERE id=?', lead['opportunity_id']) or {}).get('matched_projects'), []) or [])}",
                                 NEG_SCHEMA, 3000, use_cache=False)
        if llm.unsafe_output(data["reply"]):
            data["reply"], data["owner_needed"] = "", True
    else:
        data = {"intent": "scam" if flags else rule_intent(m["subject"] + " " + m["body"]), "summary": m["body"][:200], "budget": None, "deadline": None,
                "requirements": [], "reply": "", "owner_needed": True}
    intent = data["intent"]
    core.x("UPDATE messages SET intent=?, data=? WHERE id=?", intent, json.dumps(J(m["data"], {}) | {"analysis": data}, ensure_ascii=False), m["id"])
    deal = J(lead["deal"], {})
    deal.update({k: data[k] for k in ("budget", "deadline") if data.get(k)})
    deal["requirements"] = sorted(set(deal.get("requirements", []) + data["requirements"]))
    core.x("UPDATE leads SET deal=?, updated=? WHERE id=?", json.dumps(deal, ensure_ascii=False), core.now(), lead["id"])
    who = lead["company"] or lead["name"] or m["sender"]
    if intent == "scam":
        core.log("security", f"Possible scam from {who}: {', '.join(flags) or data['summary'][:100]}", "critical", lead_id=lead["id"])
        return {"intent": intent}
    if intent == "declined":
        core.x("UPDATE leads SET opted_out=1 WHERE id=?", lead["id"])
    if intent in INTENT_STAGE:
        set_stage(lead["id"], max(INTENT_STAGE[intent], 6) if intent != "declined" else 13, f"Client: {data['summary'][:120]}")
    core.log("negotiation", f"Client replied — {who}: {intent}", "important", lead_id=lead["id"])
    if intent == "ready_to_order":
        create_deal_card(lead["id"])
    md = J(m["data"], {})
    if PRICE_Q.search(m["body"] or "") or intent == "negotiating_terms":
        # owner's rule: price talks are hers — the agent only drafts a holding reply, never sends it
        data["owner_needed"] = True
        set_stage(lead["id"], 9, "Client asked about price — owner replies")
        url = (core.q1("SELECT url FROM opportunities WHERE id=?", lead["opportunity_id"]) or {}).get("url") if lead["opportunity_id"] else None
        core.log("negotiation", f"💰 {who} asks about price — please reply yourself.\n«{(m['body'] or '')[:300]}»" + (f"\n{url}" if url else ""),
                 "critical", lead_id=lead["id"])
    if data["owner_needed"]:
        if data["reply"]:
            core.x("UPDATE messages SET data=? WHERE id=?", json.dumps(md | {"analysis": data, "draft_reply": data["reply"]}, ensure_ascii=False), m["id"])
    elif data["reply"] and m["channel"] == "email":
        action = "reply_routine" if intent in ("question", "interested") and not data["owner_needed"] else "reply"
        send_email_action("negotiation", action, m["sender"], "Re: " + (m["subject"] or ""), data["reply"], lead["id"],
                          thread_id=md.get("thread_id"), in_reply_to=md.get("message_id"))
    elif data["reply"]:  # platform chats: draft for the owner to paste
        core.x("UPDATE messages SET data=? WHERE id=?", json.dumps(md | {"analysis": data, "draft_reply": data["reply"]}, ensure_ascii=False), m["id"])
    return {"intent": intent}


def create_deal_card(lead_id):
    lead = core.q1("SELECT * FROM leads WHERE id=?", lead_id)
    deal = J(lead["deal"], {})
    o = core.q1("SELECT * FROM opportunities WHERE id=?", lead["opportunity_id"]) if lead["opportunity_id"] else None
    plat = core.q1("SELECT * FROM platforms WHERE slug=?", lead["platform_slug"]) if lead["platform_slug"] else None
    fee = (J(plat["data"], {}).get("commission") or 0) if plat else 0
    amount = None
    if deal.get("budget") and (m := re.search(r"[\d][\d\s.,]*", str(deal["budget"]))):
        amount = float(re.sub(r"[\s,]", "", m.group()))
    elif o:
        amount = core.to_usd(o["budget_max"] or o["budget_min"], o["currency"])
    card = {"lead_id": lead_id, "client": lead["name"], "company": lead["company"], "platform": lead["platform_slug"], "profile_url": lead["website"],
            "conversation_url": o["url"] if o else None, "project": o["title"] if o else None, "description": (o or {}).get("description", "")[:1500],
            "requirements": deal.get("requirements", []), "budget": deal.get("budget") or amount, "budget_usd": amount, "platform_fee_pct": fee,
            "net_usd": round(amount * (1 - fee / 100), 2) if amount else None, "deadline": deal.get("deadline"),
            "risks": J((o or {}).get("risks"), []) or [], "history": [h["body"][:400] for h in core.q("SELECT body FROM messages WHERE lead_id=? ORDER BY id", lead_id)][-6:],
            "recommendation": "Confirm scope, price and timeline in writing; take an upfront milestone/escrow before starting."}
    core.x("UPDATE leads SET deal=? WHERE id=?", json.dumps(deal | {"card": card}, ensure_ascii=False), lead_id)
    core.request_approval("deal", f"Client ready to order: {lead['company'] or lead['name']}", card, dedupe_key=f"deal:{lead_id}")
    core.log("negotiation", f"🔥 Client is ready to order: {lead['company'] or lead['name']} — budget {card['budget']}", "critical", lead_id=lead_id)


def add_manual_message(lead_id, body, sender="client", channel="platform"):
    """For platforms without a messages API: the owner pastes the client's message; the Negotiation agent handles the rest."""
    mid = core.x("INSERT INTO messages(lead_id,direction,channel,external_id,sender,subject,body,created) VALUES(?,?,?,?,?,?,?,?)",
                 lead_id, "in", channel, f"manual:{lead_id}:{time.time()}", sender, "", body, core.now())
    return negotiate(mid)


# ============ Analytics ============
def analytics_snapshot():
    t = lambda sql, *a: core.q1(sql, *a)["n"]
    sent = t("SELECT count(*) n FROM proposals WHERE status='sent'")
    replied = t("SELECT count(DISTINCT lead_id) n FROM messages WHERE direction='in' AND lead_id IS NOT NULL")
    totals = {"opportunities": t("SELECT count(*) n FROM opportunities"), "high_priority": t("SELECT count(*) n FROM opportunities WHERE score>=?", core.get("thresholds")["high"]),
              "proposals": t("SELECT count(*) n FROM proposals"), "sent": sent, "replies": replied,
              "reply_rate_pct": round(100 * replied / sent, 1) if sent else None, "deals": t("SELECT count(*) n FROM leads WHERE stage>=10 AND stage<13"),
              "platforms_active": t("SELECT count(*) n FROM platforms WHERE status='active'")}
    per_platform = core.q("""SELECT o.platform_slug slug, count(*) total, sum(o.score>=70) relevant, round(avg(o.score),1) avg_score,
        (SELECT count(*) FROM proposals p JOIN opportunities o2 ON o2.id=p.opportunity_id WHERE o2.platform_slug=o.platform_slug AND p.status='sent') sent,
        (SELECT count(DISTINCT m.lead_id) FROM messages m JOIN leads l ON l.id=m.lead_id WHERE l.platform_slug=o.platform_slug AND m.direction='in') replies
        FROM opportunities o GROUP BY o.platform_slug ORDER BY relevant DESC""")
    cats = {}
    for r in core.q("SELECT categories, score FROM opportunities WHERE created>?", core.now() - 30 * 86400):
        for c in J(r["categories"], []):
            cats.setdefault(c, [0, 0])
            cats[c][0] += 1
            cats[c][1] += r["score"] >= 70
    hours = [0] * 24
    for r in core.q("SELECT published FROM opportunities WHERE score>=70 AND published IS NOT NULL"):
        hours[time.gmtime(r["published"]).tm_hour] += 1
    ab = core.q("""SELECT variant, count(*) sent, sum(EXISTS(SELECT 1 FROM messages m WHERE m.lead_id=p.lead_id AND m.direction='in')) replies
                   FROM proposals p WHERE status='sent' GROUP BY variant""")
    days = core.q("""SELECT date(created,'unixepoch') d, count(*) n, sum(score>=70) good FROM opportunities
                     WHERE created>? GROUP BY d ORDER BY d""", core.now() - 30 * 86400)
    stages = {r["stage"]: r["n"] for r in core.q("SELECT stage, count(*) n FROM leads GROUP BY stage")}
    return {"totals": totals, "platforms": per_platform, "categories": cats, "hours_utc": hours, "ab": ab, "daily": days, "funnel": stages}


def finance_snapshot():
    rows = core.q("SELECT * FROM ledger ORDER BY ts DESC LIMIT 500")
    sums = {}
    for r in rows:
        sums.setdefault(r["kind"], {}).setdefault(r["category"], 0)
        sums[r["kind"]][r["category"]] += core.to_usd(r["amount"], r["currency"]) or 0
    exp = sum(v for v in sums.get("expense", {}).values())
    act = sum(v for v in sums.get("revenue_actual", {}).values())
    pot = sum(v for v in sums.get("revenue_potential", {}).values())
    deals = core.q1("SELECT count(*) n FROM leads WHERE stage BETWEEN 10 AND 12")["n"]
    return {"by_kind": sums, "expenses_usd": round(exp, 4), "revenue_actual_usd": round(act, 2), "revenue_potential_usd": round(pot, 2),
            "net_usd": round(act - exp, 2), "cac_usd": round(exp / deals, 2) if deals else None, "ledger": rows[:100],
            "ai_spend_today_usd": round(core.spent_usd("category='ai_api'", core.now() - 86400), 4)}


def rescore_open():
    """Scoring rules and platform boosts change over time — keep open opportunities consistent."""
    for o in core.q("SELECT * FROM opportunities WHERE status IN ('new','proposal_ready')"):
        s, reasons, risks, cats, matched = score_opportunity(o)
        lang = o["language"] if o["platform_slug"] == "freelancer" else K.language(o["title"] + " " + (o["description"] or ""))
        core.x("UPDATE opportunities SET score=?, score_reasons=?, risks=?, categories=?, matched_projects=?, language=? WHERE id=?",
               s, json.dumps(reasons, ensure_ascii=False), json.dumps(risks), json.dumps(cats), json.dumps(matched), lang, o["id"])


def analytics_run():
    rescore_open()
    snap = analytics_snapshot()
    boost = {}
    for p in snap["platforms"]:
        if (p["sent"] or 0) >= 5:  # only adjust with real evidence
            rate = (p["replies"] or 0) / p["sent"]
            boost[p["slug"]] = int(max(-5, min(5, round((rate - 0.1) * 50))))
    core.put("platform_boost", boost)
    insights = []
    if snap["ab"] and len(snap["ab"]) == 2 and all(a["sent"] >= 10 for a in snap["ab"]):
        best = max(snap["ab"], key=lambda a: (a["replies"] or 0) / a["sent"])
        insights.append(f"Variant {best['variant']} gets more replies")
    peak = max(range(24), key=lambda h: snap["hours_utc"][h])
    if snap["hours_utc"][peak]:
        insights.append(f"Most relevant posts appear around {peak}:00 UTC")
    top_cat = sorted(snap["categories"].items(), key=lambda kv: -kv[1][1])[:3]
    if top_cat:
        insights.append("Most demanded: " + ", ".join(f"{c} ({v[1]})" for c, v in top_cat))
    core.put("analytics_insights", {"ts": core.now(), "insights": insights, "boost": boost})
    if core.now() - core.get("last_daily_report") > 20 * 3600:
        core.put("last_daily_report", core.now())
        tt = snap["totals"]
        core.log("analytics", f"Daily report: {tt['opportunities']} jobs total, {tt['high_priority']} high-priority, {tt['proposals']} proposals, "
                 f"{tt['replies']} replies, {tt['deals']} deals. " + " · ".join(insights), "important")
    return {"insights": insights}


# ============ Security / Watchdog ============
def security_run():
    stuck = core.n("UPDATE tasks SET status='queued' WHERE status='running' AND updated<?", core.now() - 900)
    if stuck:
        core.log("security", f"Watchdog re-queued {stuck} stuck tasks", "info")
    old = core.q("SELECT id,title FROM approvals WHERE status='pending' AND created<? AND created>?", core.now() - 2 * 86400, core.now() - 2 * 86400 - 600 * 6)
    for a in old:
        core.log("security", f"Reminder: approval #{a['id']} waiting 2 days — {a['title']}", "important", approval_id=a["id"])
    health = {"ai": llm.available(), "gmail": I.gmail_configured(), "telegram": bool(core.get("telegram").get("chat_id")),
              "search_api": bool(core.secret("BRAVE_API_KEY")), "failing_sources": [p["slug"] for p in core.q("SELECT slug,data FROM platforms") if J(p["data"], {}).get("errors")],
              "ts": core.now()}
    core.put("health", health)
    return health
