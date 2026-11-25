"""Portfolio knowledge base + multilingual concept matching (EN/RU/UK/AZ/TR/DE) + scam/injection checks."""
import json, re
from functools import lru_cache
from . import core

# Concept lexicon: word stems per language. A job "means" a concept if any stem occurs.
# shortcut: stems instead of embeddings; upgrade to an embedding model if recall on real data is poor.
CONCEPTS = {
    "web": ["website", "web site", "web design", "webdesign", "wordpress", "webflow", "tilda", "framer", "frontend", "front-end", "html", "сайт",
            "веб", "вёрстк", "верстк", "лендинг", "тильд", "вебсайт", "sayt", "veb", "web sitesi", "internet sitesi", "webseite", "homepage"],
    "landing": ["landing", "one-page", "one page", "лендинг", "посадочн", "одностранич", "açılış sayfası", "landingpage"],
    "ecommerce": ["e-commerce", "ecommerce", "online store", "online shop", "shopify", "woocommerce", "интернет-магазин", "интернет магазин",
                  "магазин", "onlayn mağaza", "e-ticaret", "online-shop", "catalog", "каталог"],
    "uiux": ["ui/ux", "ui ux", "ux/ui", "user interface", "ux design", "ui design", "figma", "prototype", "wireframe", "mobile app design",
             "интерфейс", "прототип", "юзабилити", "фигм", "дизайн приложения", "arayüz", "benutzeroberfläche", "dashboard design"],
    "branding": ["brand identity", "brand design", "branding", "rebrand", "logo", "visual identity", "brandbook", "brand book", "style guide", "бренд", "логотип", "лого",
                 "фирменн", "айдентик", "брендбук", "логотип", "loqo", "marka", "kimlik", "markenidentität", "corporate identity"],
    "presentation": ["presentation", "pitch deck", "pitch-deck", "slides", "powerpoint", "keynote", "google slides", "презентац", "питч",
                     "слайд", "təqdimat", "sunum", "präsentation"],
    "graphic": ["graphic design", "poster", "flyer", "banner", "packaging", "social media design", "instagram post", "carousel", "brochure",
                "infographic", "графическ", "баннер", "постер", "афиш", "упаковк", "листовк", "буклет", "инфографик", "креатив", "обложк",
                "qrafik", "afiş", "grafik", "verpackung"],
    "3d": ["3d", "interior", "render", "visualization", "visualisation", "blender", "3ds max", "corona", "интерьер", "визуализац",
           "3д", "рендер", "interyer", "iç mimar", "innenarchitekt"],
    "redesign": ["redesign", "revamp", "refresh", "modernize", "update our website", "редизайн", "обновить сайт", "переделать",
                 "обновление сайта", "yenidən dizayn", "yeniden tasarım"],
    "design": ["designer", "дизайнер", "дизайн", "tasarımcı", "dizayner", "designerin", "visual design"],
    "animation": ["animation", "animated", "motion", "gsap", "three.js", "webgl", "interactive", "анимац", "интерактив", "моушн",
                  "animasiya", "animasyon"],
}
# Strong signals the job is outside her profile.
NEGATIVE = ["marketer", "marketing", "lead generation", "growth hack", "social media manager", "seo specialist", "reels editor", "sprite",
            "game art", "pixel art", "маркетолог", "таргетолог", "продвижение", "copywriting", "seo article", "article writing", "data entry", "translation", "транскриб", "статью", "статей", "копирайт",
            "рерайт", "наполнение", "парсинг", "1с", "1c ", "python developer", "java ", "devops", "backend", "smm-менеджер",
            "accountant", "бухгалт", "sales manager", "call center", "оператор", "video editing", "монтаж видео", "voice over",
            "регистрац", "отзыв", "review writing", "telegram bot", "bot development", "чат-бот", "android developer", "ios developer",
            "sre", "data scientist", "machine learning", "product manager", "engineering manager", "director"]

SCAM_PATTERNS = [
    (r"(pay|оплат\w*|внес\w*|перевед\w*).{0,40}(fee|deposit|взнос|депозит|страховк|за доступ|for access)", "Asks the freelancer to pay upfront"),
    (r"(telegram|whatsapp|телеграм|ватсап|вотсап).{0,30}(only|contact me|пишите|писать)", "Pushes communication off-platform early"),
    (r"(crypto|usdt|bitcoin|криптовалют).{0,40}(pay|оплат|send|отправ)", "Crypto payment request"),
    (r"(test task|тестовое задание).{0,60}(unpaid|бесплатн|without pay|без оплат)", "Large unpaid test task"),
    (r"(подтверд\w* регистрац|verify (my|an) account|пройти верификац|kyc for me|register an account for)", "Asks to verify/register accounts for someone (fraud risk)"),
    (r"(отзыв\w*|reviews?).{0,30}(написат|write|leave|оставит)", "Fake reviews request"),
    (r"bit\.ly|tinyurl|goo\.gl|t\.co/|cutt\.ly|is\.gd", "Shortened link"),
    (r"(send|give|пришлит|сообщит).{0,30}(password|пароль|код из смс|sms code|card number|номер карты|cvv)", "Asks for credentials or card data"),
]
INJECTION = re.compile(r"(ignore (all|previous|prior) instructions|system prompt|you are now|disregard .{0,20}instructions|"
                       r"игнорируй .{0,20}инструкц|забудь .{0,20}инструкц|</?untrusted|assistant:|developer mode)", re.I)


@lru_cache(maxsize=1)
def kb():
    return json.loads(core.KB_PATH.read_text(encoding="utf-8"))


def owner_profile():
    """KB merged with the owner's saved answers to missing-data questions."""
    data = dict(kb())
    data["owner_answers"] = core.get("owner_answers")
    data["approved_rates"] = core.get("approved_rates")
    return data


_RX = {c: [re.compile(r"(?<![\w])" + re.escape(s)) for s in stems] for c, stems in CONCEPTS.items()}


def concepts(text):
    t = (text or "").lower()
    hits = {c: sum(1 for rx in rxs if rx.search(t)) for c, rxs in _RX.items()}
    return {c: n for c, n in hits.items() if n}


def negatives(text):
    t = (text or "").lower()
    return [n.strip() for n in NEGATIVE if n in t]


def language(text):
    t = text or ""
    low = t.lower()
    cyr = len(re.findall(r"[а-яёіїєґ]", low))
    lat = len(re.findall(r"[a-z]", low))
    if cyr > lat * 0.5:
        return "uk" if re.search(r"[іїєґ]", low) else "ru"
    # no re.I here: with IGNORECASE a plain "I" would match the Turkish dotless "ı"
    if "ə" in low:
        return "az"
    if len(re.findall(r"[ğışĞŞİ]", t)) >= 2:
        return "tr"
    if re.search(r"[ßäöü]", low) and re.search(r"\b(und|wir|sie|der|die|das|für)\b", low):
        return "de"
    return "en"


CATEGORY_OF_PROJECT = {"websites": {"web", "landing", "ecommerce", "uiux", "animation", "redesign"},
                       "interior": {"3d"}, "presentations": {"presentation", "animation", "graphic"},
                       "brandbooks": {"branding", "graphic", "animation"}}


def match_projects(text, limit=3):
    """Rank real portfolio projects by concept overlap + 'fits' phrase hits."""
    t = (text or "").lower()
    found = set(concepts(t))
    ranked = []
    for p in kb()["projects"]:
        s = 3 * len(found & CATEGORY_OF_PROJECT[p["category"]])
        s += sum(2 for f in p["fits"] if f in t)
        s += sum(1 for tech in p["technologies"] if tech.lower() in t)
        if s:
            ranked.append((s, p["slug"]))
    ranked.sort(reverse=True)
    return [slug for _, slug in ranked[:limit]]


def project(slug):
    return next((p for p in kb()["projects"] if p["slug"] == slug), None)


def scam_flags(text):
    t = (text or "").lower()
    return [label for pat, label in SCAM_PATTERNS if re.search(pat, t)]


def injection_flag(text):
    return bool(INJECTION.search(text or ""))


def untrusted(text, limit=6000):
    """Wrap third-party text so the model treats it as data, never as instructions."""
    clean = re.sub(r"</?untrusted_data[^>]*>", "", text or "", flags=re.I)[:limit]
    return f"<untrusted_data>\n{clean}\n</untrusted_data>"
