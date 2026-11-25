"""FastAPI app: REST for the UI, Server-Sent Events for live activity, OAuth callback, data export/delete."""
import asyncio, hmac, json, os, shutil, time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from . import core, agents, integrations as I, knowledge as K, llm, worker

J = agents.J
SECRET_NAMES = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "TELEGRAM_BOT_TOKEN", "GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET", "BRAVE_API_KEY", "FREELANCER_TOKEN"]
EDITABLE = set(core.DEFAULTS) - {"platform_boost", "analytics_insights", "health", "last_daily_report", "last_run", "emergency_stop"}


@asynccontextmanager
async def lifespan(app):
    core.init_db()
    agents.seed_platforms()
    stop = worker.start_background() if os.environ.get("NEXUS_WORKER", "1") == "1" else None
    yield
    if stop:
        stop.set()


app = FastAPI(title="NEXUS Freelance Agent", lifespan=lifespan)
TOKEN = os.environ.get("NEXUS_ACCESS_TOKEN")


@app.middleware("http")
async def auth(request: Request, call_next):
    # Local use needs no login (bound to 127.0.0.1). On a server set NEXUS_ACCESS_TOKEN.
    if TOKEN and request.url.path.startswith("/api") and not request.url.path.startswith("/api/gmail/callback"):
        given = request.headers.get("authorization", "").removeprefix("Bearer ") or request.cookies.get("nexus_token", "")
        if not hmac.compare_digest(given, TOKEN):
            return JSONResponse({"detail": "unauthorized"}, 401)
    return await call_next(request)


def rows(sql, *a, jcols=()):
    out = core.q(sql, *a)
    for r in out:
        for c in jcols:
            r[c] = J(r.get(c), r.get(c))
    return out


# ---------- overview ----------
@app.get("/health")
def health():
    hb = core.get("worker_heartbeat") or 0
    return {"ok": True, "worker_alive": core.now() - hb < 60, "db": str(core.DB_PATH.name)}


@app.get("/api/state")
def state():
    return {"mode": core.get("mode"), "emergency_stop": core.get("emergency_stop"), "health": core.get("health"),
            "worker_alive": core.now() - (core.get("worker_heartbeat") or 0) < 60, "ai": llm.available(), "gmail": I.gmail_configured(),
            "telegram": bool(core.get("telegram").get("chat_id")), "pending_approvals": core.q1("SELECT count(*) n FROM approvals WHERE status='pending'")["n"],
            "ui_language": core.get("ui_language"), "missing_data": [m for m in K.kb()["missing_data"] if m["key"] not in K.answers()]}


@app.get("/api/dashboard")
def dashboard():
    a = agents.analytics_snapshot()
    f = agents.finance_snapshot()
    pot = core.q("SELECT budget_min,budget_max,currency FROM opportunities o WHERE status IN ('proposal_ready','applied') AND kind!='job'")
    pipeline_usd = sum(core.to_usd(r["budget_max"] or r["budget_min"], r["currency"]) or 0 for r in pot)
    top = rows("SELECT id,title,score,platform_slug,url,budget_min,budget_max,currency,status FROM opportunities WHERE status IN ('new','proposal_ready') ORDER BY score DESC, id DESC LIMIT 6")
    return {"totals": a["totals"], "funnel": a["funnel"], "daily": a["daily"], "finance": {k: f[k] for k in ("expenses_usd", "revenue_actual_usd", "revenue_potential_usd", "net_usd", "ai_spend_today_usd")},
            "pipeline_usd": round(pipeline_usd), "top": top, "insights": core.get("analytics_insights"),
            "activity": rows("SELECT * FROM activity WHERE level!='debug' ORDER BY id DESC LIMIT 12", jcols=("data",))}


@app.get("/api/activity")
def activity(after: int = 0, limit: int = 100, agent: str = ""):
    return rows("SELECT * FROM activity WHERE id>? AND (?='' OR agent=?) ORDER BY id DESC LIMIT ?", after, agent, agent, limit, jcols=("data",))


@app.get("/api/stream")
async def stream(request: Request):
    async def gen():
        last = (core.q1("SELECT max(id) m FROM activity") or {}).get("m") or 0
        while not await request.is_disconnected():
            new = await asyncio.to_thread(core.q, "SELECT * FROM activity WHERE id>? ORDER BY id LIMIT 50", last)
            for r in new:
                last = r["id"]
                yield f"data: {json.dumps(r, ensure_ascii=False)}\n\n"
            yield ": ping\n\n"
            await asyncio.sleep(2)
    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


# ---------- agents ----------
AGENT_MAIN = {"platform_discovery": ("platform_discovery", {}), "job_discovery": None, "email": ("email_poll", {}), "analytics": ("analytics", {}),
              "security": ("security", {}), "business_lead": ("business_leads", {})}


@app.get("/api/agents")
def agents_status():
    paused = core.get("paused_agents")
    tasks = core.q("SELECT kind,status,count(*) n, max(updated) u FROM tasks GROUP BY kind,status")
    running = core.q("SELECT kind,payload FROM tasks WHERE status='running'")
    out = []
    for a in core.AGENTS:
        kinds = [k for k, v in worker.KIND_AGENT.items() if v == a]
        last = core.q1("SELECT ts,message,level FROM activity WHERE agent=? ORDER BY id DESC LIMIT 1", a)
        errs = core.q1("SELECT count(*) n FROM tasks WHERE kind IN (%s) AND status='failed'" % ",".join("?" * len(kinds)), *kinds)["n"] if kinds else 0
        out.append({"name": a, "paused": a in paused, "running": [json.loads(r["payload"]) | {"kind": r["kind"]} for r in running if r["kind"] in kinds],
                    "queued": sum(t["n"] for t in tasks if t["kind"] in kinds and t["status"] == "queued"),
                    "done": sum(t["n"] for t in tasks if t["kind"] in kinds and t["status"] == "done"), "failed": errs, "last": last,
                    "model": llm.model_for(a) if a in ("proposal", "negotiation", "profile", "business_lead") else "rule-based" if a in ("lead_scoring", "email") else None})
    return {"agents": out, "emergency_stop": core.get("emergency_stop"), "mode": core.get("mode"),
            "approvals": core.q1("SELECT count(*) n FROM approvals WHERE status='pending'")["n"],
            "queue": rows("SELECT id,kind,status,attempts,run_after,last_error FROM tasks WHERE status IN ('queued','running','failed') ORDER BY run_after LIMIT 40")}


@app.post("/api/agents/{name}/{action}")
def agent_action(name: str, action: str):
    if name not in core.AGENTS:
        raise HTTPException(404)
    paused = set(core.get("paused_agents"))
    if action == "pause":
        paused.add(name)
    elif action == "resume":
        paused.discard(name)
    elif action == "run":
        if name == "job_discovery":
            core.put("last_run", core.get("last_run") | {"job_discovery": 0})
        elif m := AGENT_MAIN.get(name):
            core.enqueue(m[0], m[1], m[0])
        else:
            raise HTTPException(400, "This agent runs on events, not on demand")
    core.put("paused_agents", sorted(paused))
    core.log("supervisor", f"Agent {name}: {action}")
    return {"ok": True}


@app.post("/api/emergency-stop")
def estop():
    agents.emergency_stop()
    return {"ok": True}


@app.post("/api/resume")
def resume():
    core.put("emergency_stop", False)
    core.log("supervisor", "Emergency stop lifted", "important")
    return {"ok": True}


# ---------- platforms ----------
@app.get("/api/platforms")
def platforms():
    ps = rows("SELECT p.*, a.status account_status, a.profile FROM platforms p LEFT JOIN accounts a ON a.platform_slug=p.slug ORDER BY p.score DESC, p.name", jcols=("data", "automation", "profile"))
    for p in ps:
        p["jobs_7d"] = core.q1("SELECT count(*) n FROM opportunities WHERE platform_slug=? AND created>?", p["slug"], core.now() - 7 * 86400)["n"]
    return ps


@app.post("/api/platforms")
async def add_platform(req: Request):
    b = await req.json()
    if not str(b.get("url", "")).startswith("https://"):
        raise HTTPException(400, "https URL required")
    slug = b.get("slug") or b["url"].split("//")[1].split("/")[0].replace("www.", "")
    core.x("INSERT OR IGNORE INTO platforms(slug,name,url,region,kind,automation,data,discovered_by) VALUES(?,?,?,?,?,?,?,?)", slug, b.get("name") or slug, b["url"],
           b.get("region", "?"), "custom", json.dumps({}), json.dumps({"relevance": 6, "reputation": 5, "feed_url": b.get("feed_url")}), "owner")
    core.enqueue("platform_discovery", {}, "platform_discovery")
    return {"slug": slug}


@app.post("/api/platforms/{slug}/{action}")
async def platform_action(slug: str, action: str, req: Request):
    p = core.q1("SELECT * FROM platforms WHERE slug=?", slug)
    if not p:
        raise HTTPException(404)
    body = await req.json() if (await req.body()) else {}
    if action in ("pause", "resume"):
        core.x("UPDATE platforms SET paused=? WHERE slug=?", int(action == "pause"), slug)
        if action == "resume":
            d = J(p["data"], {})
            d["errors"] = 0
            core.x("UPDATE platforms SET data=? WHERE slug=?", json.dumps(d), slug)
        return {"ok": True}
    if action == "check":
        return dict(zip(("status", "score"), await asyncio.to_thread(agents.check_platform, p)))
    if action == "fetch":
        return await asyncio.to_thread(agents.job_discovery, slug)
    if action == "register":
        return agents.registration_start(slug)
    if action == "profile":
        core.enqueue("profile_generate", {"slug": slug, "lang": body.get("lang")}, f"profile:{slug}:{body.get('lang')}")
        return {"queued": True}
    if action == "reveal":
        pw = core.vault_get(f"pw:{slug}")
        core.log("security", f"Password for {slug} revealed in UI", "info")
        return {"password": pw}
    if action == "browser":
        # The owner's own visible browser (her cookies, her CAPTCHA/SMS) on the machine running NEXUS.
        import webbrowser
        return {"opened": webbrowser.open(p["url"]), "url": p["url"]}
    raise HTTPException(400)


# ---------- opportunities & proposals ----------
@app.get("/api/opportunities")
def opportunities(min_score: int = 0, status: str = "", platform: str = "", q: str = "", sort: str = "score", limit: int = 200):
    order = {"score": "score DESC", "new": "created DESC", "budget": "coalesce(budget_max,budget_min,0) DESC"}.get(sort, "score DESC")
    return rows(f"""SELECT * FROM opportunities WHERE score>=? AND (?='' OR status=?) AND (?='' OR platform_slug=?)
                AND (?='' OR title LIKE ? OR description LIKE ?) ORDER BY {order} LIMIT ?""",
                min_score, status, status, platform, platform, q, f"%{q}%", f"%{q}%", limit,
                jcols=("skills", "score_reasons", "categories", "matched_projects", "risks"))


@app.post("/api/opportunities/{oid}/{action}")
async def opp_action(oid: int, action: str):
    if action == "propose":
        try:
            return await asyncio.to_thread(agents.proposal_draft, oid, True)
        except llm.LLMUnavailable as e:
            raise HTTPException(409, str(e))
    if action == "dismiss":
        core.x("UPDATE opportunities SET status='dismissed' WHERE id=?", oid)
        return {"ok": True}
    raise HTTPException(400)


@app.get("/api/proposals")
def proposals():
    return rows("""SELECT p.*, o.title, o.url, o.platform_slug, o.score, l.company, l.email FROM proposals p
                   LEFT JOIN opportunities o ON o.id=p.opportunity_id LEFT JOIN leads l ON l.id=p.lead_id ORDER BY p.id DESC LIMIT 300""")


@app.patch("/api/proposals/{pid}")
async def edit_proposal(pid: int, req: Request):
    b = await req.json()
    core.x("UPDATE proposals SET body=coalesce(?,body), subject=coalesce(?,subject) WHERE id=? AND status!='sent'", b.get("body"), b.get("subject"), pid)
    return {"ok": True}


@app.post("/api/proposals/{pid}/{action}")
def proposal_action(pid: int, action: str):
    p = core.q1("SELECT p.*, l.email FROM proposals p LEFT JOIN leads l ON l.id=p.lead_id WHERE p.id=?", pid)
    if not p:
        raise HTTPException(404)
    if action == "sent":
        return {"ok": agents.proposal_mark_sent(pid)}
    if action == "bid":
        return {"result": agents.freelancer_bid(pid)}
    if action == "send":
        return {"result": agents.send_email_action("proposal", "send_proposal", p["email"], p["subject"], p["body"], p["lead_id"], pid)}
    raise HTTPException(400)


# ---------- CRM ----------
@app.get("/api/leads")
def leads():
    return {"stages": agents.STAGES, "leads": rows("""SELECT l.*, (SELECT count(*) FROM messages m WHERE m.lead_id=l.id) msgs,
                 o.title opp_title, o.url opp_url, o.score FROM leads l LEFT JOIN opportunities o ON o.id=l.opportunity_id ORDER BY l.updated DESC""",
                                                  jcols=("tags", "audit", "deal"))}


@app.post("/api/leads")
async def add_lead(req: Request):
    b = await req.json()
    lid = agents.upsert_lead(**{k: b.get(k) for k in ("name", "company", "email", "website", "phone") if b.get(k)}, source="manual", stage=int(b.get("stage", 1)))
    return {"id": lid}


@app.patch("/api/leads/{lid}")
async def edit_lead(lid: int, req: Request):
    b = await req.json()
    if "stage" in b:
        agents.set_stage(lid, int(b["stage"]), "Moved manually")
    for k in ("notes", "name", "company", "email", "website", "phone"):
        if k in b:
            core.x(f"UPDATE leads SET {k}=?, updated=? WHERE id=?", b[k], core.now(), lid)
    if "tags" in b:
        core.x("UPDATE leads SET tags=? WHERE id=?", json.dumps(b["tags"]), lid)
    if b.get("opted_out"):
        core.x("UPDATE leads SET opted_out=1 WHERE id=?", lid)
    return {"ok": True}


@app.post("/api/leads/merge")
async def merge(req: Request):
    b = await req.json()
    keep, drop = int(b["keep"]), int(b["drop"])
    for t in ("messages", "proposals"):
        core.x(f"UPDATE {t} SET lead_id=? WHERE lead_id=?", keep, drop)
    d = core.q1("SELECT * FROM leads WHERE id=?", drop)
    core.x("UPDATE leads SET notes=notes || ? WHERE id=?", f"\n[merged #{drop}] {d['notes']}", keep)
    for k in ("email", "website", "phone", "company", "name", "opportunity_id", "platform_slug"):
        core.x(f"UPDATE leads SET {k}=coalesce({k},?) WHERE id=?", d[k], keep)
    core.x("DELETE FROM leads WHERE id=?", drop)
    return {"ok": True}


@app.get("/api/leads/{lid}")
def lead(lid: int):
    l = rows("SELECT * FROM leads WHERE id=?", lid, jcols=("tags", "audit", "deal"))
    if not l:
        raise HTTPException(404)
    return {"lead": l[0], "messages": rows("SELECT * FROM messages WHERE lead_id=? ORDER BY id", lid, jcols=("data",)),
            "proposals": rows("SELECT * FROM proposals WHERE lead_id=?", lid)}


@app.post("/api/leads/{lid}/message")
async def lead_message(lid: int, req: Request):
    b = await req.json()
    try:
        return await asyncio.to_thread(agents.add_manual_message, lid, b["body"], b.get("sender", "client"))
    except llm.LLMUnavailable as e:
        raise HTTPException(409, str(e))


@app.post("/api/leads/{lid}/deal")
def lead_deal(lid: int):
    agents.create_deal_card(lid)
    return {"ok": True}


@app.get("/api/messages")
def messages():
    return rows("""SELECT m.*, coalesce(l.company,l.name) who, l.stage FROM messages m LEFT JOIN leads l ON l.id=m.lead_id
                   ORDER BY m.id DESC LIMIT 300""", jcols=("data",))


# ---------- approvals ----------
@app.get("/api/approvals")
def approvals(status: str = "pending"):
    return rows("SELECT * FROM approvals WHERE (?='' OR status=?) ORDER BY id DESC LIMIT 200", status, status, jcols=("details",))


@app.post("/api/approvals/{aid}")
async def approve(aid: int, req: Request):
    b = await req.json()
    return {"result": await asyncio.to_thread(agents.resolve_approval, aid, bool(b.get("approve")), "ui", b.get("edits"))}


# ---------- portfolio / services ----------
@app.get("/api/portfolio")
def portfolio():
    return K.owner_profile()


@app.post("/api/owner-answers")
async def owner_answers(req: Request):
    core.put("owner_answers", core.get("owner_answers") | {k: v for k, v in (await req.json()).items() if v not in (None, "")})
    return {"ok": True}


@app.get("/api/services")
def services():
    return rows("SELECT * FROM services ORDER BY id DESC", jcols=("data",))


@app.post("/api/services")
async def gen_service(req: Request):
    b = await req.json()
    core.enqueue("service_generate", b, f"svc:{b['service_key']}:{b.get('slug')}:{b.get('lang')}:{time.time()}")
    return {"queued": True}


@app.patch("/api/services/{sid}")
async def edit_service(sid: int, req: Request):
    b = await req.json()
    core.x("UPDATE services SET status=coalesce(?,status), data=coalesce(?,data) WHERE id=?", b.get("status"), json.dumps(b["data"], ensure_ascii=False) if "data" in b else None, sid)
    return {"ok": True}


# ---------- analytics / finance ----------
@app.get("/api/analytics")
def analytics():
    return agents.analytics_snapshot() | {"insights": core.get("analytics_insights")}


@app.get("/api/finance")
def finance():
    return agents.finance_snapshot() | {"limits": core.get("spend_limits_usd"), "ai_budget": core.get("ai_budget_usd"), "fx": core.get("fx_to_usd")}


@app.post("/api/ledger")
async def ledger(req: Request):
    b = await req.json()
    if b.get("kind") not in ("expense", "revenue_actual", "revenue_potential"):
        raise HTTPException(400)
    core.record(b["kind"], b.get("category", "other"), float(b["amount"]), b.get("currency", "USD"), b.get("platform"), b.get("note", ""))
    return {"ok": True}


# ---------- business leads ----------
@app.post("/api/business/search")
async def business(req: Request):
    b = await req.json()
    core.enqueue("business_leads", b, f"biz:{b.get('city')}:{b.get('category')}:{int(time.time() // 600)}")
    return {"queued": True}


# ---------- settings & secrets ----------
@app.get("/api/settings")
def settings():
    s = {k: v for k, v in core.all_settings().items() if k in EDITABLE}
    return s | {"secrets": {n: bool(core.secret(n)) for n in SECRET_NAMES}, "agents": core.AGENTS}


@app.put("/api/settings")
async def put_settings(req: Request):
    b = await req.json()
    for k, v in b.items():
        if k not in EDITABLE:
            continue
        if k == "mode" and v not in ("manual", "smart", "full"):
            raise HTTPException(400, "bad mode")
        core.put(k, v)
    core.log("supervisor", f"Settings changed: {', '.join(k for k in b if k in EDITABLE)}")
    if "telegram_channels" in b:
        agents.seed_platforms()
    return {"ok": True}


@app.post("/api/secrets")
async def set_secret(req: Request):
    b = await req.json()
    if b.get("name") not in SECRET_NAMES or not b.get("value"):
        raise HTTPException(400)
    core.vault_set(b["name"], b["value"].strip())
    core.log("security", f"Secret {b['name']} updated (encrypted)")
    return {"ok": True}


@app.get("/api/telegram/pair")
def tg_pair():
    me = I.tg("getMe") or {}
    return {"code": I.pair_code(), "bot": (me.get("result") or {}).get("username"), "bound": bool(core.get("telegram").get("chat_id"))}


@app.post("/api/telegram/test")
def tg_test():
    return {"sent": I.notify("Test notification from NEXUS ✅", "critical")}


@app.get("/api/gmail/auth")
def gmail_auth(request: Request):
    if not core.secret("GMAIL_CLIENT_ID"):
        raise HTTPException(400, "Add GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET first")
    return RedirectResponse(I.gmail_auth_url(str(request.url_for("gmail_callback"))))


@app.get("/api/gmail/callback", name="gmail_callback")
def gmail_callback(request: Request, code: str = "", state: str = ""):
    I.gmail_exchange(code, state, str(request.url_for("gmail_callback")))
    return RedirectResponse("/#settings")


# ---------- data rights ----------
@app.get("/api/export")
def export():
    tables = ["settings", "platforms", "accounts", "opportunities", "leads", "proposals", "messages", "approvals", "ledger", "services", "activity"]
    data = {t: core.q(f"SELECT * FROM {t}") for t in tables}
    return JSONResponse(data, headers={"Content-Disposition": "attachment; filename=nexus-export.json"})


@app.post("/api/backup")
def backup():
    dest = core.DATA / "backups"
    dest.mkdir(exist_ok=True)
    f = dest / time.strftime("nexus-%Y%m%d-%H%M%S.db")
    core.db().execute("VACUUM INTO ?", (str(f),))
    for old in sorted(dest.glob("nexus-*.db"))[:-14]:
        old.unlink()
    return {"file": f.name}


@app.post("/api/delete-data")
async def delete_data(req: Request):
    if (await req.json()).get("confirm") != "DELETE":
        raise HTTPException(400, 'Send {"confirm":"DELETE"}')
    for t in ["opportunities", "leads", "proposals", "messages", "approvals", "ledger", "services", "activity", "accounts", "vault", "llm_cache", "tasks"]:
        core.x(f"DELETE FROM {t}")
    core.x("DELETE FROM settings WHERE key='owner_answers'")
    return {"ok": True}


WEB = core.ROOT / "web"
app.mount("/", StaticFiles(directory=WEB, html=True), name="web")
