"""Telegram bot (owner control + notifications) and Gmail API (OAuth 2.0, minimal scopes)."""
import base64, json, secrets, time
from email.mime.text import MIMEText
from email.utils import parseaddr
import httpx
from . import core

# ======================= Telegram =======================
TG = "https://api.telegram.org/bot{}/{}"


def tg(method, **params):
    token = core.secret("TELEGRAM_BOT_TOKEN")
    if not token:
        return None
    r = httpx.post(TG.format(token, method), json=params, timeout=40)
    return r.json()


def notify(message, level="important", data=None, buttons=None):
    """Notification agent: send to the owner's Telegram if bound and the event is important enough."""
    cfg = core.get("telegram")
    if not cfg.get("chat_id") or core.LEVELS.get(level, 1) < core.LEVELS.get(cfg.get("min_level", "important"), 2):
        return False
    icon = {"critical": "🔴", "important": "🟣"}.get(level, "•")
    aid = (data or {}).get("approval_id")
    if aid and not buttons:
        buttons = [[{"text": "✅ Approve", "callback_data": f"ap:{aid}:1"}, {"text": "✖ Reject", "callback_data": f"ap:{aid}:0"}]]
    try:
        tg("sendMessage", chat_id=cfg["chat_id"], text=f"{icon} {message}"[:4000], disable_web_page_preview=True,
           **({"reply_markup": {"inline_keyboard": buttons}} if buttons else {}))
        return True
    except httpx.HTTPError:
        return False  # notifications must never break the agent that raised them


def pair_code():
    cfg = core.get("telegram")
    if not cfg.get("pair_code"):
        cfg["pair_code"] = secrets.token_hex(3)
        core.put("telegram", cfg)
    return cfg["pair_code"]


def _summary(cmd):
    if cmd == "dashboard":
        s = {k: core.q1(sql)["n"] for k, sql in {
            "opportunities (24h)": "SELECT count(*) n FROM opportunities WHERE created>strftime('%s','now')-86400",
            "high-priority": f"SELECT count(*) n FROM opportunities WHERE score>={core.get('thresholds')['high']} AND status='new'",
            "proposals ready": "SELECT count(*) n FROM proposals WHERE status IN ('draft','manual')",
            "clients in talks": "SELECT count(*) n FROM leads WHERE stage BETWEEN 6 AND 9",
            "pending approvals": "SELECT count(*) n FROM approvals WHERE status='pending'"}.items()}
        return "NEXUS — " + core.get("mode") + (" (EMERGENCY STOP)" if core.get("emergency_stop") else "") + "\n" + \
            "\n".join(f"{k}: {v}" for k, v in s.items())
    if cmd == "orders":
        rows = core.q("SELECT title,score,url FROM opportunities WHERE status='new' ORDER BY score DESC LIMIT 8")
        return "\n\n".join(f"[{r['score']}] {r['title'][:90]}\n{r['url']}" for r in rows) or "No new opportunities."
    if cmd == "clients":
        rows = core.q("SELECT coalesce(company,name) n, stage FROM leads WHERE stage<13 ORDER BY updated DESC LIMIT 10")
        return "\n".join(f"• {r['n']} — stage {r['stage']}" for r in rows) or "No clients yet."
    if cmd == "messages":
        rows = core.q("SELECT sender,subject,intent FROM messages WHERE direction='in' ORDER BY id DESC LIMIT 8")
        return "\n".join(f"• {r['sender']}: {r['subject']} [{r['intent']}]" for r in rows) or "No messages."
    if cmd == "stats":
        from . import agents
        a = agents.analytics_snapshot()
        return "\n".join(f"{k}: {v}" for k, v in a["totals"].items())
    if cmd == "settings":
        return f"Mode: {core.get('mode')}\nAI budget: {core.get('ai_budget_usd')}\nSpend limits: {core.get('spend_limits_usd')}"
    return None


def handle_update(u):
    from . import agents
    cfg = core.get("telegram")
    if cb := u.get("callback_query"):
        if str(cb["message"]["chat"]["id"]) != str(cfg.get("chat_id")):
            return
        parts = cb.get("data", "").split(":")
        if parts[0] == "ap" and len(parts) == 3:
            res = agents.resolve_approval(int(parts[1]), parts[2] == "1", via="telegram")
            tg("answerCallbackQuery", callback_query_id=cb["id"], text=res[:190])
        elif parts[0] == "mode":
            core.put("mode", parts[1])
            tg("answerCallbackQuery", callback_query_id=cb["id"], text=f"Mode: {parts[1]}")
        return
    msg = u.get("message") or {}
    text, chat, user = msg.get("text", ""), msg.get("chat", {}), msg.get("from", {})
    if not text.startswith("/"):
        return
    cmd, _, arg = text[1:].partition(" ")
    cmd = cmd.split("@")[0].lower()
    if cmd == "start":
        # bind only the owner's username AND the one-time code shown in Settings
        if (user.get("username", "").lower() == cfg["owner_username"].lower().lstrip("@") and arg.strip() == cfg.get("pair_code")):
            cfg["chat_id"], cfg["pair_code"] = chat["id"], None
            core.put("telegram", cfg)
            tg("sendMessage", chat_id=chat["id"], text="NEXUS connected. Commands: /dashboard /orders /clients /messages /approvals /stats /pause /resume /stop /settings")
            core.log("notification", "Telegram bound to owner chat", "info")
        else:
            tg("sendMessage", chat_id=chat["id"], text="Send /start <code> with the pairing code from NEXUS → Settings → Telegram.")
        return
    if str(chat.get("id")) != str(cfg.get("chat_id")):
        return  # ignore strangers
    reply, kb = None, None
    if cmd == "approvals":
        rows = core.q("SELECT id,title FROM approvals WHERE status='pending' ORDER BY id DESC LIMIT 10")
        for r in rows:
            tg("sendMessage", chat_id=chat["id"], text=f"#{r['id']} {r['title']}",
               reply_markup={"inline_keyboard": [[{"text": "✅ Approve", "callback_data": f"ap:{r['id']}:1"}, {"text": "✖ Reject", "callback_data": f"ap:{r['id']}:0"}]]})
        reply = None if rows else "Nothing waiting for you."
    elif cmd == "pause":
        core.put("paused_agents", [a for a in core.AGENTS if a not in ("notification", "security", "supervisor")])
        reply = "All working agents paused. /resume to continue."
    elif cmd == "resume":
        core.put("paused_agents", [])
        core.put("emergency_stop", False)
        reply = "Agents resumed."
    elif cmd == "stop":
        agents.emergency_stop()
        reply = "🛑 Emergency stop: no external actions will run. /resume to lift."
    else:
        reply = _summary(cmd)
        if cmd == "settings":
            kb = [[{"text": m, "callback_data": f"mode:{m}"} for m in ("manual", "smart", "full")]]
    if reply:
        tg("sendMessage", chat_id=chat["id"], text=reply[:4000], disable_web_page_preview=True,
           **({"reply_markup": {"inline_keyboard": kb}} if kb else {}))


def telegram_loop(stop_event):
    offset = None
    while not stop_event.is_set():
        if not core.secret("TELEGRAM_BOT_TOKEN"):
            stop_event.wait(30)
            continue
        try:
            r = tg("getUpdates", timeout=25, **({"offset": offset} if offset else {}))
            for u in (r or {}).get("result", []):
                offset = u["update_id"] + 1
                try:
                    handle_update(u)
                except Exception as e:  # one bad update must not kill the bot
                    core.log("notification", f"Telegram update failed: {e}", "debug")
        except httpx.HTTPError:
            stop_event.wait(15)


# ======================= Gmail =======================
SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send"
_token = {"value": None, "exp": 0}


def gmail_configured():
    return bool(core.secret("GMAIL_CLIENT_ID") and core.vault_get("gmail_refresh_token"))


def gmail_auth_url(redirect_uri):
    state = secrets.token_urlsafe(16)
    core.vault_set("gmail_oauth_state", state)
    return "https://accounts.google.com/o/oauth2/v2/auth?" + httpx.QueryParams(
        client_id=core.secret("GMAIL_CLIENT_ID"), redirect_uri=redirect_uri, response_type="code", scope=SCOPES,
        access_type="offline", prompt="consent", state=state, login_hint="marifreelance2758@gmail.com").__str__()


def gmail_exchange(code, state, redirect_uri):
    if not state or state != core.vault_get("gmail_oauth_state"):
        raise PermissionError("OAuth state mismatch")
    r = httpx.post("https://oauth2.googleapis.com/token", data=dict(code=code, client_id=core.secret("GMAIL_CLIENT_ID"),
                   client_secret=core.secret("GMAIL_CLIENT_SECRET"), redirect_uri=redirect_uri, grant_type="authorization_code"), timeout=30)
    r.raise_for_status()
    core.vault_set("gmail_refresh_token", r.json()["refresh_token"])
    core.log("email", "Gmail connected via OAuth", "important")


def _access():
    if _token["value"] and _token["exp"] > time.time() + 60:
        return _token["value"]
    r = httpx.post("https://oauth2.googleapis.com/token", data=dict(client_id=core.secret("GMAIL_CLIENT_ID"),
                   client_secret=core.secret("GMAIL_CLIENT_SECRET"), refresh_token=core.vault_get("gmail_refresh_token"),
                   grant_type="refresh_token"), timeout=30)
    if r.status_code in (400, 401):
        core.log("email", "Gmail authorization expired — reconnect Gmail in Settings", "critical")
    r.raise_for_status()
    _token.update(value=r.json()["access_token"], exp=time.time() + r.json().get("expires_in", 3600))
    return _token["value"]


def _gm(method, path, **kw):
    r = httpx.request(method, "https://gmail.googleapis.com/gmail/v1/users/me/" + path,
                      headers={"Authorization": "Bearer " + _access()}, timeout=30, **kw)
    r.raise_for_status()
    return r.json()


def _body(payload):
    if payload.get("mimeType") == "text/plain" and payload.get("body", {}).get("data"):
        return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", "replace")
    for p in payload.get("parts", []) or []:
        if t := _body(p):
            return t
    if payload.get("body", {}).get("data"):
        from bs4 import BeautifulSoup
        return BeautifulSoup(base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", "replace"), "html.parser").get_text(" ", strip=True)
    return ""


def gmail_fetch(query="newer_than:2d -in:sent -in:chats", limit=30):
    ids = _gm("GET", "messages", params={"q": query, "maxResults": limit}).get("messages", [])
    out = []
    for m in ids:
        if core.q1("SELECT 1 FROM messages WHERE external_id=?", "gmail:" + m["id"]):
            continue
        full = _gm("GET", f"messages/{m['id']}", params={"format": "full"})
        h = {x["name"].lower(): x["value"] for x in full["payload"].get("headers", [])}
        out.append(dict(id=m["id"], thread_id=full.get("threadId"), sender=parseaddr(h.get("from", ""))[1].lower(),
                        sender_name=parseaddr(h.get("from", ""))[0], subject=h.get("subject", ""), message_id=h.get("message-id"),
                        body=_body(full["payload"])[:8000], ts=int(full.get("internalDate", 0)) / 1000))
    return out


def gmail_send(to, subject, body, thread_id=None, in_reply_to=None):
    m = MIMEText(body, "plain", "utf-8")
    m["To"], m["Subject"] = to, subject
    if in_reply_to:
        m["In-Reply-To"] = m["References"] = in_reply_to
    payload = {"raw": base64.urlsafe_b64encode(m.as_bytes()).decode()}
    if thread_id:
        payload["threadId"] = thread_id
    return _gm("POST", "messages/send", json=payload)
