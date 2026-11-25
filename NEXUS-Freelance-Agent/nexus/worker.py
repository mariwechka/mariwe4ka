"""Supervisor: persistent task queue + periodic scheduler. Survives restarts (state lives in SQLite), retries with
exponential backoff, never runs the same dedupe_key twice concurrently, and respects pauses/emergency stop."""
import json, threading, time, traceback
from . import core, agents, llm

HANDLERS = {
    "job_discovery": ("job_discovery", lambda p: agents.job_discovery(p["slug"])),
    "platform_discovery": ("platform_discovery", lambda p: agents.platform_discovery()),
    "proposal_draft": ("proposal", lambda p: agents.proposal_draft(p["opportunity_id"])),
    "profile_generate": ("profile", lambda p: agents.profile_generate(p["slug"], p.get("lang"))),
    "service_generate": ("profile", lambda p: agents.service_generate(p["service_key"], p.get("slug", "fiverr"), p.get("lang", "en"))),
    "business_leads": ("business_lead", lambda p: agents.business_leads(p.get("city"), p.get("category"))),
    "business_pitch": ("business_lead", lambda p: agents.business_pitch_task(p["lead_id"])),
    "followups": ("business_lead", lambda p: agents.followups()),
    "email_poll": ("email", lambda p: agents.email_poll()),
    "negotiate": ("negotiation", lambda p: agents.negotiate(p["message_id"])),
    "analytics": ("analytics", lambda p: agents.analytics_run()),
    "security": ("security", lambda p: agents.security_run()),
}
KIND_AGENT = {k: v[0] for k, v in HANDLERS.items()}
MAX_ATTEMPTS = 5


def schedule_periodic():
    iv = core.get("intervals_min")
    last = core.get("last_run")
    due = lambda name: core.now() - last.get(name, 0) >= iv[name] * 60
    if due("job_discovery"):
        for p in core.q("SELECT slug,data FROM platforms WHERE paused=0 AND status NOT IN ('closed','unreachable')"):
            d = json.loads(p["data"] or "{}")
            if d.get("adapter") or d.get("feed_url") or p["slug"].startswith("tg:"):
                core.enqueue("job_discovery", {"slug": p["slug"]}, f"jobs:{p['slug']}")
        last["job_discovery"] = core.now()
    for name, kind in (("platform_discovery", "platform_discovery"), ("email", "email_poll"), ("analytics", "analytics"),
                       ("security", "security"), ("followups", "followups")):
        if due(name):
            core.enqueue(kind, {}, kind)
            last[name] = core.now()
    core.put("last_run", last)


def run_one():
    t = core.q1("SELECT * FROM tasks WHERE status='queued' AND run_after<=? ORDER BY run_after LIMIT 1", core.now())
    if not t:
        return False
    # atomic claim: only one worker can flip queued→running
    if core.n("UPDATE tasks SET status='running', updated=? WHERE id=? AND status='queued'", core.now(), t["id"]) != 1:
        return True
    agent, fn = HANDLERS.get(t["kind"], (None, None))
    if fn is None:
        core.x("UPDATE tasks SET status='failed', last_error='unknown kind' WHERE id=?", t["id"])
        return True
    if agent in core.get("paused_agents"):
        core.x("UPDATE tasks SET status='queued', run_after=? WHERE id=?", core.now() + 300, t["id"])
        return True
    try:
        res = fn(json.loads(t["payload"] or "{}"))
        core.x("UPDATE tasks SET status='done', last_error=?, updated=? WHERE id=?", json.dumps(res, default=str)[:500], core.now(), t["id"])
    except llm.LLMUnavailable as e:
        core.x("UPDATE tasks SET status='queued', run_after=?, last_error=?, updated=? WHERE id=?", core.now() + 3600, str(e), core.now(), t["id"])
        core.log(agent, f"{t['kind']} waiting: {e}", "info")
    except Exception as e:
        n = t["attempts"] + 1
        err = f"{type(e).__name__}: {e}"[:500]
        if n >= MAX_ATTEMPTS:
            core.x("UPDATE tasks SET status='failed', attempts=?, last_error=?, updated=? WHERE id=?", n, err, core.now(), t["id"])
            core.log(agent, f"{t['kind']} failed after {n} attempts: {err}", "important")
        else:
            core.x("UPDATE tasks SET status='queued', attempts=?, run_after=?, last_error=?, updated=? WHERE id=?",
                   n, core.now() + 30 * 2 ** n, err, core.now(), t["id"])
            core.log(agent, f"{t['kind']} error (retry {n}/{MAX_ATTEMPTS - 1}): {err}", "debug", trace=traceback.format_exc()[-800:])
    return True


def loop(stop_event):
    core.init_db()
    agents.seed_platforms()
    core.log("supervisor", "Worker started")
    while not stop_event.is_set():
        try:
            core.put("worker_heartbeat", core.now())
            schedule_periodic()
            while run_one() and not stop_event.is_set():
                pass
        except Exception as e:
            core.log("supervisor", f"Scheduler error: {e}", "important")
        stop_event.wait(5)


def start_background():
    from . import integrations
    stop = threading.Event()
    threading.Thread(target=loop, args=(stop,), daemon=True, name="nexus-worker").start()
    threading.Thread(target=integrations.telegram_loop, args=(stop,), daemon=True, name="nexus-telegram").start()
    return stop
