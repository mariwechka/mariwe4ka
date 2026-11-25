"""Storage, settings, encrypted vault, activity log and the permission guard shared by all agents."""
import json, os, sqlite3, threading, time, secrets
from pathlib import Path
from cryptography.fernet import Fernet

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("NEXUS_DATA_DIR", ROOT / "data"))
DATA.mkdir(parents=True, exist_ok=True)
DB_PATH = Path(os.environ.get("NEXUS_DB", DATA / "nexus.db"))
KB_PATH = ROOT / "data" / "knowledge_base.json"

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS activity(id INTEGER PRIMARY KEY, ts REAL, agent TEXT, level TEXT, message TEXT, data TEXT);
CREATE TABLE IF NOT EXISTS tasks(id INTEGER PRIMARY KEY, kind TEXT, payload TEXT, dedupe_key TEXT UNIQUE, status TEXT DEFAULT 'queued',
  attempts INTEGER DEFAULT 0, run_after REAL DEFAULT 0, last_error TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS platforms(slug TEXT PRIMARY KEY, name TEXT, url TEXT, region TEXT, kind TEXT, score INTEGER DEFAULT 0,
  category TEXT, status TEXT DEFAULT 'unchecked', automation TEXT, api TEXT, registration TEXT, notes TEXT, data TEXT DEFAULT '{}',
  paused INTEGER DEFAULT 0, last_checked REAL, discovered_by TEXT DEFAULT 'seed');
CREATE TABLE IF NOT EXISTS accounts(platform_slug TEXT PRIMARY KEY, email TEXT, username TEXT, status TEXT, cred_ref TEXT, profile TEXT DEFAULT '{}', updated REAL);
CREATE TABLE IF NOT EXISTS opportunities(id INTEGER PRIMARY KEY, platform_slug TEXT, external_id TEXT, url TEXT, title TEXT, description TEXT,
  budget_min REAL, budget_max REAL, currency TEXT, published REAL, client TEXT, competitors INTEGER, skills TEXT DEFAULT '[]',
  score INTEGER, score_reasons TEXT DEFAULT '[]', categories TEXT DEFAULT '[]', matched_projects TEXT DEFAULT '[]', risks TEXT DEFAULT '[]',
  language TEXT, kind TEXT DEFAULT 'gig', status TEXT DEFAULT 'new', created REAL, UNIQUE(platform_slug, external_id));
CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY, name TEXT, company TEXT, email TEXT, website TEXT, phone TEXT, source TEXT,
  platform_slug TEXT, opportunity_id INTEGER, stage INTEGER DEFAULT 1, tags TEXT DEFAULT '[]', notes TEXT DEFAULT '', audit TEXT DEFAULT '{}',
  deal TEXT DEFAULT '{}', opted_out INTEGER DEFAULT 0, followups INTEGER DEFAULT 0, last_contact REAL, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS proposals(id INTEGER PRIMARY KEY, opportunity_id INTEGER UNIQUE, lead_id INTEGER, channel TEXT, language TEXT,
  subject TEXT, body TEXT, variant TEXT, status TEXT DEFAULT 'draft', model TEXT, sent_at REAL, created REAL);
CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY, lead_id INTEGER, direction TEXT, channel TEXT, external_id TEXT UNIQUE,
  sender TEXT, subject TEXT, body TEXT, intent TEXT, data TEXT DEFAULT '{}', created REAL);
CREATE TABLE IF NOT EXISTS approvals(id INTEGER PRIMARY KEY, kind TEXT, title TEXT, details TEXT, status TEXT DEFAULT 'pending',
  dedupe_key TEXT UNIQUE, created REAL, resolved REAL);
CREATE TABLE IF NOT EXISTS ledger(id INTEGER PRIMARY KEY, ts REAL, kind TEXT, category TEXT, platform TEXT, amount REAL, currency TEXT, note TEXT);
CREATE TABLE IF NOT EXISTS services(id INTEGER PRIMARY KEY, platform_slug TEXT, service_key TEXT, language TEXT, data TEXT, status TEXT DEFAULT 'draft', created REAL);
CREATE TABLE IF NOT EXISTS llm_cache(key TEXT PRIMARY KEY, response TEXT, created REAL);
CREATE TABLE IF NOT EXISTS vault(name TEXT PRIMARY KEY, secret BLOB, updated REAL);
CREATE INDEX IF NOT EXISTS ix_act ON activity(id);
CREATE INDEX IF NOT EXISTS ix_opp_score ON opportunities(score);
"""

AGENTS = ["supervisor", "platform_discovery", "registration", "profile", "job_discovery", "lead_scoring", "proposal",
          "business_lead", "negotiation", "email", "notification", "security", "analytics"]

DEFAULTS = {
    "mode": "manual",                     # manual | smart | full
    "emergency_stop": False,
    "paused_agents": [],
    "ui_language": "ru",
    "currency": "USD",
    "fx_to_usd": {"USD": 1, "EUR": 1.08, "RUB": 0.011, "AZN": 0.59, "UAH": 0.024, "TRY": 0.029, "GBP": 1.27, "INR": 0.012, "PLN": 0.25, "KZT": 0.002, "CAD": 0.72, "AUD": 0.65},
    # Platform/bid/subscription spending. Zero = nothing is ever spent automatically.
    "spend_limits_usd": {"daily": 0, "weekly": 0, "monthly": 0},
    # AI API spending cap (separate so the agents can work at all; edit in Settings).
    "ai_budget_usd": {"daily": 1.0, "monthly": 20.0},
    "thresholds": {"high": 85, "good": 70, "review": 50},
    "proposals": {"max_per_day": 15, "min_score": 70, "min_budget_usd": 0, "max_bid_cost_usd": 0,
                  "priority_categories": [], "excluded_categories": [], "allowed_platforms": [],
                  "languages": ["en", "ru"], "work_hours": [0, 24]},
    "outreach": {"max_per_day": 5, "followup_days": 4, "city": "", "categories": ["cafe", "restaurant", "beauty", "hairdresser"]},
    "llm": {"provider": "anthropic", "default_model": "claude-opus-5-5", "fallback_model": "claude-sonnet-5-5",
            "models": {},                      # per-agent override, e.g. {"profile": "claude-sonnet-5-5"}
            "openai_base_url": "", "openai_model": ""},
    "intervals_min": {"job_discovery": 20, "platform_discovery": 1440, "email": 5, "analytics": 360, "security": 10, "followups": 720},
    "telegram": {"owner_username": "mrwechka", "chat_id": None, "pair_code": None, "min_level": "important"},
    "telegram_channels": [],               # public channels with orders, e.g. ["designer_orders"]
    "owner_answers": {},                   # answers to knowledge_base.missing_data
    "approved_rates": {},                  # e.g. {"web": [500, 3000], "branding": [300, 1500]}
    # state written by agents
    "platform_boost": {}, "analytics_insights": {}, "health": {}, "last_daily_report": 0, "last_run": {},
}

_local = threading.local()


def db() -> sqlite3.Connection:
    c = getattr(_local, "conn", None)
    if c is None:
        c = sqlite3.connect(DB_PATH, timeout=30, isolation_level=None, check_same_thread=False)
        c.row_factory = sqlite3.Row
        c.execute("PRAGMA journal_mode=WAL")
        c.execute("PRAGMA busy_timeout=30000")
        _local.conn = c
    return c


def init_db():
    db().executescript(SCHEMA)
    # crash recovery: anything left 'running' by a dead process goes back to the queue
    db().execute("UPDATE tasks SET status='queued' WHERE status='running'")


def q(sql, *args):
    return [dict(r) for r in db().execute(sql, args).fetchall()]


def q1(sql, *args):
    r = db().execute(sql, args).fetchone()
    return dict(r) if r else None


def x(sql, *args):
    return db().execute(sql, args).lastrowid


def n(sql, *args):
    return db().execute(sql, args).rowcount


def now():
    return time.time()


# ---------- settings ----------
def get(key):
    r = q1("SELECT value FROM settings WHERE key=?", key)
    if r is None:
        return json.loads(json.dumps(DEFAULTS.get(key)))
    v = json.loads(r["value"])
    d = DEFAULTS.get(key)
    if isinstance(d, dict) and isinstance(v, dict):  # new default sub-keys appear after upgrades
        return {**d, **v}
    return v


def put(key, value):
    x("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", key, json.dumps(value))


def all_settings():
    return {k: get(k) for k in DEFAULTS}


# ---------- activity ----------
LEVELS = {"debug": 0, "info": 1, "important": 2, "critical": 3}


def log(agent, message, level="info", **data):
    x("INSERT INTO activity(ts,agent,level,message,data) VALUES(?,?,?,?,?)", now(), agent, level, message,
      json.dumps(data, ensure_ascii=False, default=str))
    if LEVELS.get(level, 1) >= LEVELS["important"]:
        from . import integrations  # late import: integrations depends on core
        integrations.notify(message, level, data)


# ---------- vault ----------
def _fernet():
    key = os.environ.get("NEXUS_MASTER_KEY")
    if not key:
        kf = DATA / "master.key"
        if not kf.exists():
            kf.write_bytes(Fernet.generate_key())
            os.chmod(kf, 0o600)
        key = kf.read_bytes()
    return Fernet(key)


def vault_set(name, value: str):
    x("INSERT INTO vault(name,secret,updated) VALUES(?,?,?) ON CONFLICT(name) DO UPDATE SET secret=excluded.secret, updated=excluded.updated",
      name, _fernet().encrypt(value.encode()), now())


def vault_get(name):
    r = q1("SELECT secret FROM vault WHERE name=?", name)
    return _fernet().decrypt(r["secret"]).decode() if r else None


def secret(name):
    """API keys: environment first, then the encrypted vault (set from the Settings page)."""
    return os.environ.get(name) or vault_get(name)


def new_password():
    return secrets.token_urlsafe(18) + "!7a"


# ---------- tasks ----------
def enqueue(kind, payload=None, dedupe_key=None, delay=0):
    """Idempotent: the same dedupe_key is never queued twice while it is pending."""
    try:
        return x("INSERT INTO tasks(kind,payload,dedupe_key,run_after,created,updated) VALUES(?,?,?,?,?,?)",
                 kind, json.dumps(payload or {}), dedupe_key, now() + delay, now(), now())
    except sqlite3.IntegrityError:
        x("UPDATE tasks SET status='queued', run_after=?, attempts=0 WHERE dedupe_key=? AND status IN ('done','failed','cancelled')",
          now() + delay, dedupe_key)
        return None


# ---------- money ----------
def to_usd(amount, currency):
    if amount is None:
        return None
    return float(amount) * float(get("fx_to_usd").get((currency or "USD").upper(), 0) or 0) or None


def spent_usd(kind_filter, since):
    rows = q(f"SELECT amount,currency FROM ledger WHERE kind='expense' AND {kind_filter} AND ts>=?", since)
    return sum(to_usd(r["amount"], r["currency"]) or 0 for r in rows)


def record(kind, category, amount, currency="USD", platform=None, note=""):
    x("INSERT INTO ledger(ts,kind,category,platform,amount,currency,note) VALUES(?,?,?,?,?,?,?)",
      now(), kind, category, platform, amount, currency, note)


# ---------- guard ----------
# Actions that never run without the owner, whatever the mode.
ALWAYS_OWNER = {"registration_submit", "accept_order", "final_terms", "payment", "identity"}
SMART_ALLOWED = {"send_proposal", "reply_routine"}
FULL_ALLOWED = SMART_ALLOWED | {"cold_outreach", "followup", "reply"}


def guard(agent, action, cost_usd=0.0):
    """Returns ('allow'|'approval'|'deny', reason). Every external action goes through here."""
    if get("emergency_stop"):
        return "deny", "Emergency stop is active"
    if agent in get("paused_agents"):
        return "deny", f"Agent {agent} is paused"
    if cost_usd > 0:
        lim = get("spend_limits_usd")
        day, week, month = now() - 86400, now() - 7 * 86400, now() - 30 * 86400
        flt = "category!='ai_api'"
        if (spent_usd(flt, day) + cost_usd > lim["daily"] or spent_usd(flt, week) + cost_usd > lim["weekly"]
                or spent_usd(flt, month) + cost_usd > lim["monthly"]):
            return "approval", f"Spending {cost_usd:.2f} USD exceeds the approved budget"
    if action in ALWAYS_OWNER:
        return "approval", "Requires the owner by policy"
    mode = get("mode")
    if mode == "full" and action in FULL_ALLOWED:
        return "allow", "Full autopilot"
    if mode == "smart" and action in SMART_ALLOWED:
        return "allow", "Smart autopilot"
    return "approval", f"{mode} mode requires confirmation for {action}"


def request_approval(kind, title, details, dedupe_key=None):
    try:
        aid = x("INSERT INTO approvals(kind,title,details,dedupe_key,created) VALUES(?,?,?,?,?)",
                kind, title, json.dumps(details, ensure_ascii=False, default=str), dedupe_key, now())
    except sqlite3.IntegrityError:
        return None
    log("supervisor", f"Approval needed: {title}", "important", approval_id=aid, kind=kind)
    return aid
