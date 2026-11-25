"use strict";
// ---------- i18n ----------
const T = {
  ru: {dashboard:"Обзор",live:"Активность",agents:"Агенты",platforms:"Площадки",opportunities:"Заказы",clients:"Клиенты",messages:"Сообщения",
    proposals:"Отклики",approvals:"Подтверждения",portfolio:"Портфолио",services:"Услуги",analytics:"Аналитика",finance:"Финансы",settings:"Настройки",
    worker:"Агенты",manual:"Ручной режим",smart:"Smart Autopilot",full:"Full Autopilot",opps:"Заказов",high:"Высокий приоритет",props:"Откликов",
    replies:"Ответов",deals:"Сделок",pipeline:"Потенциал, $",approve:"Подтвердить",reject:"Отклонить",open:"Открыть",copy:"Копировать",
    markSent:"Отмечено как отправлено",propose:"Создать отклик",dismiss:"Скрыть",save:"Сохранить",run:"Запустить",pause:"Пауза",resume:"Продолжить",
    nothing:"Пока пусто",estopOn:"Аварийная остановка активна — нажмите, чтобы снять",missing:"Недостающие данные — ответьте один раз",
    topOpps:"Лучшие заказы",activity:"Последние события",funnel:"Воронка",trend:"Заказы за 30 дней",insights:"Выводы аналитики",
    check:"Проверить",fetch:"Искать заказы",register:"Регистрация",profile:"Профиль",reveal:"Пароль",browser:"Открыть браузер",
    addLead:"Добавить клиента",findBiz:"Найти бизнесы",clientMsg:"Вставить сообщение клиента",dealCard:"Карточка сделки",
    generate:"Сгенерировать",ledgerAdd:"Добавить запись",export:"Экспорт данных",backup:"Резервная копия",del:"Удалить все данные"},
  en: {dashboard:"Dashboard",live:"Live Activity",agents:"Agent Control",platforms:"Platforms",opportunities:"Opportunities",clients:"Clients",messages:"Messages",
    proposals:"Proposals",approvals:"Approvals",portfolio:"Portfolio",services:"Services",analytics:"Analytics",finance:"Finance",settings:"Settings",
    worker:"Agents",manual:"Manual Mode",smart:"Smart Autopilot",full:"Full Autopilot",opps:"Opportunities",high:"High priority",props:"Proposals",
    replies:"Replies",deals:"Deals",pipeline:"Pipeline, $",approve:"Approve",reject:"Reject",open:"Open",copy:"Copy",
    markSent:"Mark as sent",propose:"Draft proposal",dismiss:"Dismiss",save:"Save",run:"Run now",pause:"Pause",resume:"Resume",
    nothing:"Nothing here yet",estopOn:"Emergency stop is active — click to lift",missing:"Missing data — answer once",
    topOpps:"Top opportunities",activity:"Latest events",funnel:"Funnel",trend:"Jobs found, 30 days",insights:"Analytics insights",
    check:"Check",fetch:"Fetch jobs",register:"Register",profile:"Profile",reveal:"Password",browser:"Open browser",
    addLead:"Add client",findBiz:"Find businesses",clientMsg:"Paste client message",dealCard:"Deal card",
    generate:"Generate",ledgerAdd:"Add entry",export:"Export data",backup:"Backup",del:"Delete all data"}};
let LANG = localStorage.getItem("nx_lang") || "ru";
const t = k => (T[LANG] && T[LANG][k]) || T.en[k] || k;

// ---------- utils ----------
const $ = s => document.querySelector(s);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ago = ts => { if (!ts) return "—"; const s = Date.now()/1000 - ts; return s < 60 ? Math.floor(s)+"s" : s < 3600 ? Math.floor(s/60)+"m" : s < 86400 ? Math.floor(s/3600)+"h" : Math.floor(s/86400)+"d"; };
const money = (a, c) => a == null ? "—" : `${Number(a).toLocaleString(undefined,{maximumFractionDigits:0})} ${c||""}`;
const safeUrl = u => /^https?:\/\//i.test(u || "") ? esc(u) : "#";
function toast(msg){ const d = document.createElement("div"); d.textContent = msg; $("#toast").append(d); setTimeout(() => d.remove(), 4500); }
async function api(path, opts = {}){
  const r = await fetch("/api" + path, {headers:{"Content-Type":"application/json"}, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined});
  if (!r.ok){ let m = r.statusText; try { m = (await r.json()).detail || m; } catch(e){} toast("⚠ " + m); throw new Error(m); }
  return r.json();
}
const post = (p, b={}) => api(p, {method:"POST", body:b});
const tier = s => s >= (S.thr?.high ?? 85) ? "high" : s >= (S.thr?.good ?? 70) ? "good" : s >= (S.thr?.review ?? 50) ? "review" : "low";
const ring = s => `<div class="score ${tier(s)}" style="--p:${s}%"><span>${s}</span></div>`;
const copy = txt => navigator.clipboard.writeText(txt).then(() => toast("Copied"));

const I = { // minimal line icons
  dashboard:"M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z", live:"M3 12h4l3-8 4 16 3-8h4", agents:"M12 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM5 16a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 16a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 8v4M12 12l-5 5M12 12l5 5",
  platforms:"M3 5h18v14H3zM3 9h18M8 5v14", opportunities:"M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-5-5", clients:"M3 4h5v16H3zM10 4h5v10h-5zM17 4h4v13h-4z",
  messages:"M4 5h16v11H8l-4 4z", proposals:"M5 3h10l4 4v14H5zM9 12h6M9 16h6M9 8h3", approvals:"M5 12l5 5 9-10", portfolio:"M4 6h16v13H4zM9 6V4h6v2",
  services:"M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z", analytics:"M4 20V10M10 20V4M16 20v-7M22 20H2", finance:"M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", settings:"M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1-2 3.4-.2-.1a1.6 1.6 0 0 0-1.8.1 7 7 0 0 1-1.6.9 1.6 1.6 0 0 0-1 1.5V23H9.2v-.3a1.6 1.6 0 0 0-1-1.5 7 7 0 0 1-1.6-.9 1.6 1.6 0 0 0-1.8-.1l-.2.1-2-3.4.1-.1a1.6 1.6 0 0 0 .3-1.8 7 7 0 0 1 0-1.8 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2-3.4.2.1a1.6 1.6 0 0 0 1.8-.1 7 7 0 0 1 1.6-.9 1.6 1.6 0 0 0 1-1.5V1h3.6v.3a1.6 1.6 0 0 0 1 1.5 7 7 0 0 1 1.6.9 1.6 1.6 0 0 0 1.8.1l.2-.1 2 3.4-.1.1a1.6 1.6 0 0 0-.3 1.8 7 7 0 0 1 0 1.8z"};
const icon = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${I[k]}"/></svg>`;
const PAGES = ["dashboard","live","agents","platforms","opportunities","clients","messages","proposals","approvals","portfolio","services","analytics","finance","settings"];
const S = {state:{}, thr:null};

// ---------- charts ----------
function areaChart(pts, key="n", key2=null, h=170){
  if (!pts.length) return `<div class="empty">${t("nothing")}</div>`;
  if (pts.length === 1) pts = [{...pts[0], d:""}, pts[0]];
  const w = 600, max = Math.max(1, ...pts.map(p => p[key])), step = pts.length > 1 ? w/(pts.length-1) : w;
  const xy = k => pts.map((p,i) => `${(i*step).toFixed(1)},${(h-20-(p[k]||0)/max*(h-40)).toFixed(1)}`);
  const line = xy(key).join(" "), l2 = key2 ? xy(key2).join(" ") : "";
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:${h}px">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".45"/><stop offset="1" stop-color="#3b82f6" stop-opacity="0"/></linearGradient></defs>
    ${[0.25,0.5,0.75].map(f => `<line class="grid" x1="0" x2="${w}" y1="${(h-20)*f}" y2="${(h-20)*f}"/>`).join("")}
    <polygon points="0,${h-20} ${line} ${w},${h-20}" fill="url(#ga)"/><polyline points="${line}" fill="none" stroke="#a78bfa" stroke-width="2"/>
    ${key2 ? `<polyline points="${l2}" fill="none" stroke="#22d3ee" stroke-width="2" stroke-dasharray="4 3"/>` : ""}
    <text x="0" y="${h-4}">${esc(pts[0].d||"")}</text><text x="${w}" y="${h-4}" text-anchor="end">${esc(pts[pts.length-1].d||"")}</text>
    <text x="${w}" y="12" text-anchor="end">max ${max}</text></svg>`;
}
const bars = (items) => { const m = Math.max(1, ...items.map(i => i[1])); return items.map(([l,v,sub]) =>
  `<div class="row between small"><span>${esc(l)}</span><span class="muted">${v}${sub!=null?` · ${sub}`:""}</span></div><div class="bar" style="margin:4px 0 10px"><i style="width:${v/m*100}%"></i></div>`).join(""); };

// ---------- shell ----------
function renderNav(){
  const cur = location.hash.slice(1) || "dashboard";
  $("#nav").innerHTML = PAGES.map(p => `<a href="#${p}" class="${p===cur?"on":""}">${icon(p)}<span>${t(p)}</span>${p==="approvals"&&S.state.pending_approvals?`<span class="badge">${S.state.pending_approvals}</span>`:""}</a>`).join("");
  $("#mode").innerHTML = ["manual","smart","full"].map(m => `<option value="${m}" ${S.state.mode===m?"selected":""}>${t(m)}</option>`).join("");
  $("#estop").classList.toggle("active", !!S.state.emergency_stop);
  $("#estop").textContent = S.state.emergency_stop ? "⏻ STOPPED — RESUME" : "⏻ EMERGENCY STOP";
  const dot = (id, ok) => $(id).className = "dot " + (ok ? "ok" : "bad");
  dot("#d-worker", S.state.worker_alive && !S.state.emergency_stop); dot("#d-ai", S.state.ai); dot("#d-gmail", S.state.gmail); dot("#d-tg", S.state.telegram);
  document.documentElement.lang = LANG;
}
async function refreshState(){ try { S.state = await api("/state"); renderNav(); } catch(e){} }
$("#mode").onchange = async e => {
  const m = e.target.value;
  if (m !== "manual" && !confirm(LANG==="ru" ? `Включить ${t(m)}? Агенты смогут выполнять разрешённые внешние действия без подтверждения.` : `Switch to ${t(m)}? Agents will perform allowed external actions without asking.`)) { e.target.value = S.state.mode; return; }
  await api("/settings", {method:"PUT", body:{mode:m}}); toast(t(m)); refreshState();
};
$("#estop").onclick = async () => { if (S.state.emergency_stop) { await post("/resume"); } else { await post("/emergency-stop"); } refreshState(); };
$("#lang").onclick = () => { LANG = LANG === "ru" ? "en" : "ru"; localStorage.setItem("nx_lang", LANG); route(); };
$("#shade").onclick = closeDrawer;
function openDrawer(html){ $("#drawer").innerHTML = `<div class="row between"><span></span><button class="btn sm ghost" onclick="closeDrawer()">✕</button></div>` + html; $("#drawer").classList.add("open"); $("#shade").classList.add("open"); }
function closeDrawer(){ $("#drawer").classList.remove("open"); $("#shade").classList.remove("open"); }

// ---------- views ----------
const V = {};

V.dashboard = async () => {
  const d = await api("/dashboard"), tt = d.totals, f = d.finance;
  const miss = S.state.missing_data || [];
  const funnel = [3,4,5,6,7,8,9,10,11,12].map(s => [STAGES[s]||s, d.funnel[s]||0]);
  return `
  ${S.state.emergency_stop ? `<div class="card" style="border-color:var(--red);margin-bottom:16px">🛑 ${t("estopOn")}</div>` : ""}
  ${!S.state.ai ? `<div class="card" style="margin-bottom:16px;border-color:rgba(251,191,36,.4)">⚠ ${LANG==="ru"?"AI-ключ не подключён: агенты ищут и оценивают заказы, но персональные отклики не пишутся. Черновик-скелет можно создать кнопкой в «Заказах». Добавьте ANTHROPIC_API_KEY в Настройках.":"No AI key: agents find and score jobs, but no personalised proposals are written. A skeleton draft is available via the button in Opportunities. Add ANTHROPIC_API_KEY in Settings."} <a href="#settings">→</a></div>` : ""}
  <div class="grid g6">
    ${[["opps",tt.opportunities],["high",tt.high_priority],["props",tt.proposals],["replies",tt.replies],["deals",tt.deals],["pipeline",d.pipeline_usd]].map(([k,v]) =>
      `<div class="card kpi"><div class="l">${t(k)}</div><div class="v">${(v??0).toLocaleString()}</div></div>`).join("")}
  </div>
  <div class="grid g3 mt">
    <div class="card" style="grid-column:span 2"><h3>${t("trend")}</h3>${areaChart(d.daily,"n","good")}
      <div class="small muted">— ${LANG==="ru"?"все":"all"} · <span style="color:var(--cyan)">- - ≥70</span></div></div>
    <div class="card"><h3>${t("funnel")}</h3>${bars(funnel)}</div>
  </div>
  <div class="grid g2 mt">
    <div class="card"><h3>${t("topOpps")}</h3><div class="list">${d.top.map(o => `
      <div class="row" style="gap:12px">${ring(o.score)}<div style="min-width:0;flex:1"><div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(o.title)}</div>
      <div class="small muted">${esc(o.platform_slug)} · ${money(o.budget_max||o.budget_min, o.currency)} · <span class="tag ${o.status==="proposal_ready"?"v":""}">${esc(o.status)}</span></div></div>
      <a class="btn sm" href="#opportunities">→</a></div>`).join("") || `<div class="empty">${t("nothing")}</div>`}</div></div>
    <div class="card"><h3>${t("activity")}</h3><div class="feed">${d.activity.map(feedRow).join("")}</div></div>
  </div>
  <div class="grid g3 mt">
    <div class="card"><h3>${t("finance")}</h3>
      <div class="row between"><span class="muted">AI today</span><b>$${f.ai_spend_today_usd}</b></div>
      <div class="row between"><span class="muted">${LANG==="ru"?"Расходы":"Expenses"}</span><b>$${f.expenses_usd}</b></div>
      <div class="row between"><span class="muted">${LANG==="ru"?"Потенциальная выручка":"Potential revenue"}</span><b>$${f.revenue_potential_usd}</b></div>
      <div class="row between"><span class="muted">${LANG==="ru"?"Фактическая выручка":"Actual revenue"}</span><b>$${f.revenue_actual_usd}</b></div></div>
    <div class="card"><h3>${t("insights")}</h3>${(d.insights.insights||[]).map(i => `<div>• ${esc(i)}</div>`).join("") || `<div class="muted">${t("nothing")}</div>`}</div>
    <div class="card"><h3>${t("missing")}</h3>${miss.length ? `<div class="small muted">${miss.length} ${LANG==="ru"?"вопросов":"questions"}</div><a class="btn sm mt" href="#portfolio">→ ${t("portfolio")}</a>` : "✓"}</div>
  </div>`;
};
let STAGES = [];
const feedRow = e => `<div class="e ${e.level}"><span class="muted small">${ago(e.ts)}</span><span class="ag tag b">${esc(e.agent)}</span><span>${esc(e.message)}</span></div>`;

let SSE;
V.live = async () => {
  const rows = await api("/activity?limit=150");
  setTimeout(() => {
    SSE?.close(); SSE = new EventSource("/api/stream");
    SSE.onmessage = m => { const e = JSON.parse(m.data); const f = $("#feed"); if (!f) return SSE.close();
      const flt = $("#flt").value; if (flt && e.agent !== flt) return; if (e.level === "debug" && !$("#dbg").checked) return;
      f.insertAdjacentHTML("afterbegin", feedRow(e)); };
  });
  return `<div class="row mt" style="margin-top:0;margin-bottom:12px"><select id="flt" onchange="route()"><option value="">all agents</option>${(S.agents||[]).map(a=>`<option>${a}</option>`).join("")}</select>
    <label class="row" style="flex-direction:row"><input type="checkbox" id="dbg"> debug</label><span class="chip"><span class="dot ok"></span>live</span></div>
    <div class="card"><div class="feed" id="feed">${rows.filter(e => e.level !== "debug").map(feedRow).join("") || `<div class="empty">${t("nothing")}</div>`}</div></div>`;
};

V.agents = async () => {
  const d = await api("/agents"); S.agents = d.agents.map(a => a.name);
  const others = d.agents.filter(a => a.name !== "supervisor"), cx = 330, cy = 230, R = 180;
  const nodes = others.map((a,i) => ({...a, x: cx + R*Math.cos(i/others.length*2*Math.PI - Math.PI/2), y: cy + R*Math.sin(i/others.length*2*Math.PI - Math.PI/2)}));
  const cls = a => a.paused ? "paused" : a.running.length ? "active" : a.failed ? "err" : "";
  const map = `<svg class="map" viewBox="0 0 660 460"><defs><linearGradient id="gl"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>
    ${nodes.map(n => `<line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" class="${n.running.length?"flow":""}"/>`).join("")}
    <g class="node ${d.emergency_stop?"err":"active"}"><circle cx="${cx}" cy="${cy}" r="46"/><text x="${cx}" y="${cy-2}">SUPERVISOR</text><text class="c" x="${cx}" y="${cy+14}">${esc(d.mode)} · ${d.approvals} ⏳</text></g>
    ${nodes.map(n => `<g class="node ${cls(n)}"><circle cx="${n.x}" cy="${n.y}" r="34"/><text x="${n.x}" y="${n.y-2}">${esc(n.name.replace("_"," ").slice(0,14))}</text>
      <text class="c" x="${n.x}" y="${n.y+12}">${n.running.length ? "▶ "+esc(n.running[0].slug||n.running[0].kind) : `✓${n.done} ${n.queued?"⧗"+n.queued:""} ${n.failed?"✕"+n.failed:""}`}</text></g>`).join("")}</svg>`;
  return `<div class="grid g2"><div class="card">${map}<div class="small muted">● ${LANG==="ru"?"зелёный — выполняет задачу, жёлтый пунктир — на паузе, красный — ошибки. Данные из реальной очереди задач.":"green — running a task, dashed amber — paused, red — failures. Read from the real task queue."}</div></div>
    <div class="card"><h3>Queue</h3><div class="tablewrap"><table><tr><th>#</th><th>task</th><th>status</th><th>when</th><th>error</th></tr>
      ${d.queue.map(q => `<tr><td>${q.id}</td><td>${esc(q.kind)}</td><td><span class="tag ${q.status==="failed"?"r":q.status==="running"?"g":""}">${q.status}</span></td><td class="small">${q.run_after>Date.now()/1000?"in "+ago(2*Date.now()/1000-q.run_after):"now"}</td><td class="small muted">${esc((q.last_error||"").slice(0,80))}</td></tr>`).join("") || `<tr><td colspan=5 class="muted">empty</td></tr>`}</table></div></div></div>
    <div class="grid g3 mt">${d.agents.map(a => `<div class="item"><div class="row between"><h4>${esc(a.name)}</h4><span class="tag ${a.paused?"a":a.running.length?"g":""}">${a.paused?"paused":a.running.length?"running":"idle"}</span></div>
      <div class="small muted">${a.last ? esc(a.last.message.slice(0,120)) + " · " + ago(a.last.ts) : "—"}</div>
      <div class="small muted">done ${a.done} · queued ${a.queued} · failed ${a.failed}${a.model?" · "+esc(a.model):""}</div>
      <div class="row mt"><button class="btn sm" onclick="agentAct('${a.name}','${a.paused?"resume":"pause"}')">${a.paused?t("resume"):t("pause")}</button>
      <button class="btn sm ghost" onclick="agentAct('${a.name}','run')">${t("run")}</button></div></div>`).join("")}</div>`;
};
async function agentAct(n, a){ try { await post(`/agents/${n}/${a}`); toast(`${n}: ${a}`); } catch(e){} route(); }

V.platforms = async () => {
  const ps = await api("/platforms"), cat = S.pcat || "all";
  const cats = ["all","recommended","promising","low","unavailable","suspicious","limited","manual_reg"];
  const filt = p => cat==="all" || p.category===cat || (cat==="limited" && ["manual","forbidden"].includes((p.automation||{}).send_proposal)) || (cat==="manual_reg" && (p.automation||{}).register !== "api");
  return `<div class="tabs">${cats.map(c => `<button class="${c===cat?"on":""}" onclick="S.pcat='${c}';route()">${c} (${ps.filter(p=>c==="all"||p.category===c||(c==="limited"&&["manual","forbidden"].includes((p.automation||{}).send_proposal))||(c==="manual_reg"&&(p.automation||{}).register!=="api")).length})</button>`).join("")}</div>
  <div class="list">${ps.filter(filt).map(p => { const d = p.data||{}, o = p.automation||{}; return `<div class="item"><div class="row" style="gap:14px">${ring(p.score||0)}
    <div style="flex:1;min-width:220px"><h4>${esc(p.name)} <span class="tag">${esc(p.region)}</span> <span class="tag ${p.status==="active"?"g":p.status==="closed"||p.status==="unreachable"?"r":"a"}">${esc(p.status)}</span> ${p.paused?'<span class="tag a">paused</span>':""} ${p.category?`<span class="tag v">${esc(p.category)}</span>`:""}</h4>
    <div class="small muted">${esc(p.kind)} · ${LANG==="ru"?"комиссия":"fee"} ${d.commission ?? "?"}% · ${esc(d.bid_cost||"")} · jobs 7d: ${p.jobs_7d} · ${esc(p.notes||"")}</div>
    <div class="small">${Object.entries(o).map(([k,v]) => `<span class="tag ${String(v).startsWith("api")||v==="feed"?"g":v==="forbidden"?"r":""}" title="${esc(v)}">${k}: ${esc(String(v).split(" ")[0])}</span>`).join("")}</div>
    ${d.last_error?`<div class="small" style="color:var(--red)">${esc(d.last_error.slice(0,140))}</div>`:""}
    ${p.account_status?`<div class="small">account: <span class="tag v">${esc(p.account_status)}</span></div>`:""}</div>
    <div class="row" style="max-width:360px;justify-content:flex-end">
      <button class="btn sm" onclick="pAct('${esc(p.slug)}','check')">${t("check")}</button>
      ${(d.adapter||d.feed_url||p.slug.startsWith("tg:"))?`<button class="btn sm" onclick="pAct('${esc(p.slug)}','fetch')">${t("fetch")}</button>`:""}
      <button class="btn sm" onclick="pAct('${esc(p.slug)}','register')">${t("register")}</button>
      <button class="btn sm" onclick="pAct('${esc(p.slug)}','profile')">${t("profile")}</button>
      ${p.profile&&p.profile.headline?`<button class="btn sm ghost" onclick='showProfile(${JSON.stringify(p.slug)})'>📄</button>`:""}
      ${p.account_status?`<button class="btn sm ghost" onclick="pAct('${esc(p.slug)}','reveal')">${t("reveal")}</button>`:""}
      <button class="btn sm ghost" onclick="pAct('${esc(p.slug)}','${p.paused?"resume":"pause"}')">${p.paused?t("resume"):t("pause")}</button>
      <a class="btn sm ghost" href="${safeUrl(p.url)}" target="_blank" rel="noopener">↗</a></div></div></div>`; }).join("")}</div>
  <div class="card mt"><h3>+ ${LANG==="ru"?"Добавить площадку":"Add platform"}</h3><div class="row">
    <input id="np-name" placeholder="Name"><input id="np-url" placeholder="https://…" style="flex:1"><input id="np-feed" placeholder="RSS feed (optional)" style="flex:1">
    <button class="btn pri" onclick="post('/platforms',{name:$('#np-name').value,url:$('#np-url').value,feed_url:$('#np-feed').value||null}).then(()=>{toast('added');route()})">${t("save")}</button></div></div>`;
};
let PLAT = {};
async function pAct(slug, a){
  try { const r = await post(`/platforms/${encodeURIComponent(slug)}/${a}`);
    if (a === "reveal") return r.password ? (copy(r.password), toast("Password copied to clipboard")) : toast("No password stored");
    toast(`${slug}: ${JSON.stringify(r).slice(0,120)}`); } catch(e){}
  route();
}
async function showProfile(slug){
  const p = (await api("/platforms")).find(x => x.slug === slug).profile;
  openDrawer(`<h2>${esc(slug)} — ${esc(p.headline)}</h2><span class="tag">${esc(p.language)}</span><span class="tag">${esc(p.model)}</span>
    <h3 class="mt">Bio</h3><pre>${esc(p.bio)}</pre><button class="btn sm mt" onclick='copy(${JSON.stringify(p.bio)})'>${t("copy")}</button>
    <h3 class="mt">Skills</h3>${(p.skills||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join("")}
    <h3 class="mt">Portfolio</h3>${(p.portfolio||[]).map(x=>`<div class="item"><b>${esc(x.project)}</b><div class="small">${esc(x.blurb)}</div></div>`).join("")}
    <h3 class="mt">Keywords</h3>${(p.keywords||[]).map(s=>`<span class="tag v">${esc(s)}</span>`).join("")}
    <h3 class="mt">FAQ</h3>${(p.faq||[]).map(f=>`<div class="item"><b>${esc(f.q)}</b><div class="small">${esc(f.a)}</div></div>`).join("")}`);
}

V.opportunities = async () => {
  const f = S.of || (S.of = {min_score:50, status:"", platform:"", q:"", sort:"score"});
  const os = await api(`/opportunities?min_score=${f.min_score}&status=${f.status}&platform=${encodeURIComponent(f.platform)}&q=${encodeURIComponent(f.q)}&sort=${f.sort}`);
  return `<div class="card row" style="margin-bottom:14px">
    <label>min score <input type="range" min="0" max="100" value="${f.min_score}" oninput="this.nextElementSibling.textContent=this.value" onchange="S.of.min_score=this.value;route()"><span>${f.min_score}</span></label>
    <label>status <select onchange="S.of.status=this.value;route()">${["","new","proposal_ready","applied","dismissed","expired"].map(s=>`<option ${s===f.status?"selected":""}>${s}</option>`).join("")}</select></label>
    <label>sort <select onchange="S.of.sort=this.value;route()">${["score","new","budget"].map(s=>`<option ${s===f.sort?"selected":""}>${s}</option>`).join("")}</select></label>
    <label style="flex:1">search <input value="${esc(f.q)}" onchange="S.of.q=this.value;route()" placeholder="logo, сайт, landing…"></label>
    <span class="muted">${os.length}</span></div>
  <div class="list">${os.map(o => `<div class="item"><div class="row" style="gap:14px;align-items:flex-start">${ring(o.score)}
    <div style="flex:1;min-width:0"><h4>${esc(o.title)}</h4>
    <div class="small muted">${esc(o.platform_slug)} · ${money(o.budget_min,o.currency)}${o.budget_max&&o.budget_max!==o.budget_min?" – "+money(o.budget_max,o.currency):""} · ${ago(o.published)} ago · ${o.competitors??"?"} bids · ${esc(o.kind)} · ${esc(o.language||"")}</div>
    <div>${(o.categories||[]).map(c=>`<span class="tag v">${esc(c)}</span>`).join("")}${(o.matched_projects||[]).map(c=>`<span class="tag b">◆ ${esc(c)}</span>`).join("")}${(o.risks||[]).map(c=>`<span class="tag r">⚠ ${esc(c)}</span>`).join("")}<span class="tag">${esc(o.status)}</span></div>
    <details class="small"><summary class="muted">${LANG==="ru"?"Почему такой рейтинг и описание":"Why this score + description"}</summary><ul>${(o.score_reasons||[]).map(r=>`<li>${esc(r)}</li>`).join("")}</ul><pre class="muted">${esc((o.description||"").slice(0,2500))}</pre></details></div>
    <div class="row" style="flex-direction:column;align-items:stretch">
      ${o.status==="new"?`<button class="btn sm pri" onclick="oAct(${o.id},'propose')">${t("propose")}</button>`:`<a class="btn sm" href="#proposals">${t("proposals")}</a>`}
      <a class="btn sm" href="${safeUrl(o.url)}" target="_blank" rel="noopener">${t("open")} ↗</a>
      ${o.status==="new"?`<button class="btn sm ghost" onclick="oAct(${o.id},'dismiss')">${t("dismiss")}</button>`:""}</div></div></div>`).join("") || `<div class="empty">${t("nothing")}</div>`}</div>`;
};
async function oAct(id, a){ try { await post(`/opportunities/${id}/${a}`); toast(a === "propose" ? "Proposal ready" : "ok"); } catch(e){} route(); }

V.proposals = async () => {
  const ps = await api("/proposals");
  return `<div class="list">${ps.map(p => `<div class="item"><div class="row between"><h4>${esc(p.title || p.company || p.subject)}</h4>
    <div><span class="tag ${p.status==="sent"?"g":p.status==="manual"?"a":"v"}">${esc(p.status)}</span><span class="tag">${esc(p.channel)}</span><span class="tag">${esc(p.language)}</span><span class="tag">var ${esc(p.variant)}</span><span class="tag">${esc(p.model)}</span>${p.score!=null?`<span class="tag v">${p.score}</span>`:""}</div></div>
    ${p.channel==="email"?`<div class="small muted">to ${esc(p.email)} · ${esc(p.subject)}</div>`:""}
    <textarea id="pb-${p.id}" ${p.status==="sent"?"readonly":""}>${esc(p.body)}</textarea>
    <div class="row mt">
      <button class="btn sm" onclick="copy($('#pb-${p.id}').value)">${t("copy")}</button>
      ${p.status!=="sent"?`<button class="btn sm" onclick="api('/proposals/${p.id}',{method:'PATCH',body:{body:$('#pb-${p.id}').value}}).then(()=>toast('saved'))">${t("save")}</button>`:""}
      ${p.url?`<a class="btn sm" href="${safeUrl(p.url)}" target="_blank" rel="noopener" onclick="copy($('#pb-${p.id}').value)">${LANG==="ru"?"Копировать и открыть заказ":"Copy & open job"} ↗</a>`:""}
      ${p.status!=="sent"&&p.channel!=="email"?`<button class="btn sm pri" onclick="post('/proposals/${p.id}/sent').then(route)">✓ ${t("markSent")}</button>`:""}
      ${p.status!=="sent"&&p.channel==="email"?`<button class="btn sm pri" onclick="post('/proposals/${p.id}/send').then(r=>{toast(r.result);route()})">✉ Send</button>`:""}
      <span class="small muted">${p.sent_at?"sent "+ago(p.sent_at)+" ago":"created "+ago(p.created)+" ago"}</span></div></div>`).join("") || `<div class="empty">${t("nothing")}</div>`}</div>`;
};

V.clients = async () => {
  const d = await api("/leads"); STAGES = d.stages;
  const q = (S.cq||"").toLowerCase(), L = d.leads.filter(l => !q || JSON.stringify([l.name,l.company,l.email,l.tags,l.notes]).toLowerCase().includes(q));
  setTimeout(bindKanban);
  return `<div class="row" style="margin-bottom:14px"><input placeholder="search…" value="${esc(S.cq||"")}" onchange="S.cq=this.value;route()">
    <button class="btn" onclick="newLead()">+ ${t("addLead")}</button>
    <input id="biz-city" placeholder="${LANG==="ru"?"Город (напр. Баку)":"City (e.g. Baku)"}"><select id="biz-cat">${["cafe","restaurant","beauty","hairdresser","hotel","photo","clinic","dentist","architect","clothes","school"].map(c=>`<option>${c}</option>`).join("")}</select>
    <button class="btn pri" onclick="post('/business/search',{city:$('#biz-city').value,category:$('#biz-cat').value}).then(()=>toast('Business Lead agent started — see Live Activity'))">${t("findBiz")}</button></div>
  <div class="kanban">${STAGES.slice(1).map((s,i) => { const st = i+1, items = L.filter(l => l.stage===st); return `<div class="col" data-stage="${st}"><h5><span>${st}. ${esc(s)}</span><span>${items.length}</span></h5>
    ${items.map(l => `<div class="kc" draggable="true" data-id="${l.id}" onclick="openLead(${l.id})"><b>${esc(l.company||l.name||l.email||"#"+l.id)}</b>
      <div class="small muted">${esc(l.platform_slug||l.source||"")} ${l.score!=null?"· "+l.score:""} ${l.msgs?"· ✉"+l.msgs:""}</div>
      ${(l.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}${(l.audit?.problems||[]).length?`<span class="tag a">${l.audit.problems.length} issues</span>`:""}</div>`).join("")}</div>`; }).join("")}</div>`;
};
function bindKanban(){
  document.querySelectorAll(".kc").forEach(c => c.ondragstart = e => e.dataTransfer.setData("id", c.dataset.id));
  document.querySelectorAll(".col").forEach(col => {
    col.ondragover = e => { e.preventDefault(); col.classList.add("over"); }; col.ondragleave = () => col.classList.remove("over");
    col.ondrop = async e => { e.preventDefault(); col.classList.remove("over"); await api(`/leads/${e.dataTransfer.getData("id")}`, {method:"PATCH", body:{stage:+col.dataset.stage}}); route(); };
  });
}
async function newLead(){
  const company = prompt("Company / name"); if (!company) return;
  const email = prompt("Email (optional)") || null; await post("/leads", {company, name:company, email}); route();
}
async function openLead(id){
  const d = await api(`/leads/${id}`), l = d.lead, card = l.deal?.card;
  openDrawer(`<h2 style="margin-top:0">${esc(l.company||l.name)}</h2>
    <div class="small muted">${esc(l.email||"")} · ${esc(l.phone||"")} · ${l.website?`<a href="${safeUrl(l.website)}" target="_blank" rel="noopener">${esc(l.website)}</a>`:""} · stage ${l.stage} ${esc(STAGES[l.stage]||"")}</div>
    <div class="row mt"><select id="ld-stage">${STAGES.slice(1).map((s,i)=>`<option value="${i+1}" ${i+1===l.stage?"selected":""}>${i+1}. ${esc(s)}</option>`).join("")}</select>
      <button class="btn sm" onclick="api('/leads/${id}',{method:'PATCH',body:{stage:+$('#ld-stage').value}}).then(()=>{openLead(${id});route()})">${t("save")}</button>
      <button class="btn sm" onclick="post('/leads/${id}/deal').then(()=>toast('deal card → Approvals'))">${t("dealCard")}</button>
      <button class="btn sm ghost" onclick="api('/leads/${id}',{method:'PATCH',body:{opted_out:1}}).then(()=>toast('opted out'))">opt-out</button>
      <button class="btn sm ghost" onclick="const k=prompt('Merge INTO which lead id (this one will be removed)?');k&&post('/leads/merge',{keep:+k,drop:${id}}).then(()=>{closeDrawer();route()})">merge</button></div>
    ${l.audit?.problems?.length?`<h3 class="mt">Website audit</h3>${l.audit.problems.map(p=>`<div>• ${esc(p)}</div>`).join("")}`:""}
    ${card?`<h3 class="mt">${t("dealCard")}</h3><pre class="small">${esc(JSON.stringify(card,null,2))}</pre>`:""}
    <h3 class="mt">Tags & notes</h3><input id="ld-tags" value="${esc((l.tags||[]).join(", "))}" style="width:100%"><textarea id="ld-notes" style="min-height:90px">${esc(l.notes||"")}</textarea>
    <button class="btn sm" onclick="api('/leads/${id}',{method:'PATCH',body:{notes:$('#ld-notes').value,tags:$('#ld-tags').value.split(',').map(s=>s.trim()).filter(Boolean)}}).then(()=>toast('saved'))">${t("save")}</button>
    <h3 class="mt">History</h3>${[...d.proposals.map(p=>({direction:"out",body:p.body,created:p.created,intent:"proposal "+p.status})),...d.messages].sort((a,b)=>a.created-b.created).map(m=>`<div class="item" style="margin-bottom:8px;${m.direction==="out"?"border-left:2px solid var(--violet)":""}"><div class="small muted">${m.direction} · ${ago(m.created)} · ${esc(m.intent||"")}</div><pre>${esc((m.body||"").slice(0,1500))}</pre>
      ${m.data?.draft_reply?`<div class="small muted mt">Draft reply:</div><pre>${esc(m.data.draft_reply)}</pre><button class="btn sm" onclick='copy(${JSON.stringify(m.data.draft_reply)})'>${t("copy")}</button>`:""}</div>`).join("")}
    <h3 class="mt">${t("clientMsg")}</h3><div class="small muted">${LANG==="ru"?"Для площадок без API сообщений: вставьте ответ клиента — агент переговоров проанализирует его и подготовит ответ.":"For platforms without a messages API: paste the client's reply; the Negotiation agent analyses it and drafts your answer."}</div>
    <textarea id="ld-msg" style="min-height:90px"></textarea><button class="btn pri sm" onclick="post('/leads/${id}/message',{body:$('#ld-msg').value}).then(r=>{toast('intent: '+r.intent);openLead(${id});route()})">→ Negotiation agent</button>`);
}

V.messages = async () => {
  const ms = await api("/messages");
  return `<div class="list">${ms.map(m => `<div class="item"><div class="row between"><b>${esc(m.who||m.sender)}</b><span><span class="tag ${m.intent==="ready_to_order"?"g":m.intent==="scam"?"r":"v"}">${esc(m.intent||"new")}</span><span class="tag">${esc(m.direction)} · ${esc(m.channel)}</span><span class="small muted">${ago(m.created)}</span></span></div>
    <div class="small muted">${esc(m.subject||"")}</div><pre class="small">${esc((m.body||"").slice(0,600))}</pre>
    ${m.data?.draft_reply?`<div class="small muted mt">Draft reply</div><pre>${esc(m.data.draft_reply)}</pre><button class="btn sm" onclick='copy(${JSON.stringify(m.data.draft_reply)})'>${t("copy")}</button>`:""}
    ${m.lead_id?`<button class="btn sm ghost" onclick="location.hash='clients';setTimeout(()=>openLead(${m.lead_id}),300)">${t("open")}</button>`:""}</div>`).join("") || `<div class="empty">${t("nothing")}</div>`}</div>`;
};

V.approvals = async () => {
  const st = S.ast ?? "pending", as = await api(`/approvals?status=${st}`);
  return `<div class="tabs">${["pending","approved","rejected",""].map(s=>`<button class="${s===st?"on":""}" onclick="S.ast='${s}';route()">${s||"all"}</button>`).join("")}</div>
  <div class="list">${as.map(a => { const d = a.details||{}; return `<div class="item"><div class="row between"><h4>${esc(a.title)}</h4><span><span class="tag v">${esc(a.kind)}</span><span class="tag">${esc(a.status)}</span><span class="small muted">${ago(a.created)}</span></span></div>
    ${a.kind==="send_email"?`<div class="small muted">to ${esc(d.to)} · ${esc(d.reason||"")}</div><input id="as-${a.id}" value="${esc(d.subject)}" style="width:100%;margin:6px 0"><textarea id="ab-${a.id}">${esc(d.body)}</textarea>`:""}
    ${a.kind==="registration"?`<ol>${(d.steps||[]).map(s=>`<li>${esc(s)}</li>`).join("")}</ol><div class="small muted">${esc(d.why_owner||"")}</div>
      <div class="row"><a class="btn sm" href="${safeUrl(d.url)}" target="_blank" rel="noopener">${t("open")} ↗</a><button class="btn sm" onclick="pAct('${esc(d.slug)}','browser')">${t("browser")}</button><button class="btn sm" onclick="pAct('${esc(d.slug)}','reveal')">${t("reveal")}</button></div>`:""}
    ${a.kind==="deal"?dealView(a, d):""}
    ${!["send_email","registration","deal"].includes(a.kind)?`<pre class="small">${esc(JSON.stringify(d,null,2))}</pre>`:""}
    ${a.status==="pending"&&a.kind!=="deal"?`<div class="row mt"><button class="btn pri" onclick="resolve(${a.id},true)">✓ ${t("approve")}</button><button class="btn danger" onclick="resolve(${a.id},false)">✕ ${t("reject")}</button></div>`:""}
    ${d.result?`<div class="small muted">result: ${esc(d.result)}</div>`:""}</div>`; }).join("") || `<div class="empty">${t("nothing")}</div>`}</div>`;
};
function dealView(a, d){
  const kv = [["Client",d.client],["Company",d.company],["Platform",d.platform],["Project",d.project],["Budget",d.budget],["Platform fee",d.platform_fee_pct+"%"],["Net (est.)",d.net_usd!=null?"$"+d.net_usd:"—"],["Deadline",d.deadline],["Requirements",(d.requirements||[]).join("; ")],["Risks",(d.risks||[]).join("; ")||"—"],["Recommendation",d.recommendation]];
  return `<table class="small">${kv.map(([k,v])=>`<tr><th>${k}</th><td>${esc(v??"—")}</td></tr>`).join("")}</table>
    <details class="small"><summary>History</summary>${(d.history||[]).map(h=>`<pre class="item">${esc(h)}</pre>`).join("")}<pre class="muted">${esc(d.description||"")}</pre></details>
    ${a.status==="pending"?`<div class="row mt">
      <button class="btn pri" onclick="resolve(${a.id},true)">✓ ${LANG==="ru"?"Принять заказ":"Accept order"}</button>
      <button class="btn danger" onclick="resolve(${a.id},false)">✕ ${LANG==="ru"?"Отклонить":"Decline"}</button>
      <button class="btn sm" onclick="const v=prompt('New price');v&&resolve(${a.id},true,{budget:v,budget_usd:parseFloat(v)})">${LANG==="ru"?"Изменить стоимость":"Change price"}</button>
      <button class="btn sm" onclick="const v=prompt('New deadline');v&&api('/leads/${d.lead_id}',{method:'PATCH',body:{notes:'Deadline proposed by owner: '+v}}).then(()=>toast('saved to notes'))">${LANG==="ru"?"Изменить сроки":"Change deadline"}</button>
      <button class="btn sm" onclick="location.hash='clients';setTimeout(()=>openLead(${d.lead_id}),300)">${LANG==="ru"?"Ответить самой / запросить информацию":"Reply myself / ask for info"}</button>
      <button class="btn sm" onclick="api('/leads/${d.lead_id}',{method:'PATCH',body:{stage:7}}).then(()=>toast('back to the Negotiation agent'))">${LANG==="ru"?"Передать агенту":"Hand back to agent"}</button>
      ${d.conversation_url?`<a class="btn sm" href="${safeUrl(d.conversation_url)}" target="_blank" rel="noopener">${LANG==="ru"?"Открыть переписку / площадку":"Open conversation / platform"} ↗</a>`:""}</div>`:""}`;
}
async function resolve(id, approve, edits){
  const s = $("#as-"+id), b = $("#ab-"+id);
  if (s && b) edits = {...(edits||{}), subject:s.value, body:b.value};
  const r = await post(`/approvals/${id}`, {approve, edits}); toast(r.result); refreshState(); route();
}

V.portfolio = async () => {
  const k = await api("/portfolio"), miss = k.missing_data, ans = k.owner_answers || {};
  return `<div class="card" style="margin-bottom:16px"><h3>${t("missing")}</h3><div class="grid g2">${miss.map(m=>`<label>${esc(m.question)}<input data-k="${m.key}" class="ans" value="${esc(ans[m.key]||"")}"></label>`).join("")}</div>
    <label class="mt">${LANG==="ru"?"Одобренные цены, USD (JSON), напр. {\"web\":[500,3000],\"branding\":[300,1500]}":"Approved rates, USD (JSON), e.g. {\"web\":[500,3000]}"}<input id="rates" value='${esc(JSON.stringify(k.approved_rates||{}))}'></label>
    <button class="btn pri mt" onclick="saveAnswers()">${t("save")}</button></div>
  <div class="grid g2"><div class="card"><h3>Mari</h3><p>${esc(k.owner.bio_confirmed)}</p><div class="small muted">${esc(k.owner.email)} · ${esc(k.owner.telegram)} · <a href="${k.owner.portfolio}" target="_blank" rel="noopener">mariwechka.org</a></div>
    <h3 class="mt">Skills</h3>${k.skills.map(s=>`<span class="tag v">${esc(s)}</span>`).join("")}<h3 class="mt">Tools</h3>${k.tools.map(s=>`<span class="tag">${esc(s)}</span>`).join("")}
    <h3 class="mt">Honesty rules</h3>${k.honesty_rules.map(s=>`<div class="small">• ${esc(s)}</div>`).join("")}</div>
    <div class="card"><h3>Services</h3>${k.services.map(s=>`<div class="item" style="margin-bottom:8px"><b>${esc(s.name)}</b><div class="small muted">${esc(s.pitch)}</div>${s.includes.map(i=>`<span class="tag">${esc(i)}</span>`).join("")}</div>`).join("")}</div></div>
  <div class="grid g3 mt">${k.projects.map(p=>`<div class="card proj"><img loading="lazy" src="${safeUrl(p.images[0])}" alt="${esc(p.name)}"><div class="b">
    <div class="row between"><h4 style="margin:0">${esc(p.name)}</h4><span class="tag v">${esc(p.category)}</span></div><div class="small muted">${esc(p.project_type)} · ${esc(p.role)}</div>
    <p class="small">${esc(p.description)}</p>${p.technologies.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}
    <details class="small"><summary class="muted">features · audience · fits</summary><ul>${p.features.map(f=>`<li>${esc(f)}</li>`).join("")}</ul><div>👥 ${esc(p.target_audience)}</div><div>${p.fits.map(f=>`<span class="tag b">${esc(f)}</span>`).join("")}</div></details>
    <a class="small" href="${safeUrl(p.url)}" target="_blank" rel="noopener">${esc(p.url)}</a></div></div>`).join("")}</div>`;
};
async function saveAnswers(){
  const b = {}; document.querySelectorAll(".ans").forEach(i => b[i.dataset.k] = i.value);
  await post("/owner-answers", b);
  try { await api("/settings", {method:"PUT", body:{approved_rates: JSON.parse($("#rates").value || "{}")}}); } catch(e){ toast("rates: invalid JSON"); }
  toast("saved"); refreshState();
}

V.services = async () => {
  const [ss, k] = await Promise.all([api("/services"), api("/portfolio")]);
  return `<div class="card row" style="margin-bottom:16px"><select id="sv-k">${k.services.map(s=>`<option value="${s.key}">${esc(s.name)}</option>`).join("")}</select>
    <select id="sv-p">${["fiverr","kwork","peopleperhour","contra","bionluk","freelancer","malt"].map(s=>`<option>${s}</option>`).join("")}</select>
    <select id="sv-l">${["en","ru","az","tr","de"].map(s=>`<option>${s}</option>`).join("")}</select>
    <button class="btn pri" onclick="post('/services',{service_key:$('#sv-k').value,slug:$('#sv-p').value,lang:$('#sv-l').value}).then(()=>{toast('queued — refresh in a few seconds');setTimeout(route,6000)})">${t("generate")}</button>
    <span class="small muted">${LANG==="ru"?"Цены берутся только из одобренных диапазонов (Портфолио → цены).":"Prices only within your approved ranges (Portfolio → rates)."}</span></div>
  <div class="list">${ss.map(s => { const d = s.data; return `<div class="item"><div class="row between"><h4>${esc(d.title)}</h4><span><span class="tag">${esc(s.platform_slug)}</span><span class="tag">${esc(s.language)}</span><span class="tag ${s.status==="published"?"g":"a"}">${esc(s.status)}</span><span class="tag">${esc(d.model)}</span></span></div>
    <pre class="small">${esc(d.description)}</pre><div class="grid g3 mt">${(d.packages||[]).map(p=>`<div class="item"><b>${esc(p.tier)}</b> · ${p.price_usd!=null?"$"+p.price_usd:"price: set approved rates"} · ${p.days}d<ul class="small">${p.includes.map(i=>`<li>${esc(i)}</li>`).join("")}</ul></div>`).join("")}</div>
    <details class="small"><summary>benefits · scope · FAQ · keywords · cover</summary><pre>${esc(JSON.stringify({benefits:d.benefits,scope:d.scope,requirements:d.requirements,faq:d.faq,keywords:d.keywords,cover:d.cover_idea,examples:d.examples},null,2))}</pre></details>
    <div class="row mt"><button class="btn sm" onclick='copy(${JSON.stringify(d.title+"\n\n"+d.description)})'>${t("copy")}</button>
    <button class="btn sm" onclick="api('/services/${s.id}',{method:'PATCH',body:{status:'published'}}).then(route)">✓ published</button></div></div>`; }).join("") || `<div class="empty">${t("nothing")}</div>`}</div>`;
};

V.analytics = async () => {
  const a = await api("/analytics");
  const cats = Object.entries(a.categories).sort((x,y)=>y[1][0]-x[1][0]).map(([c,v])=>[c,v[0],`${v[1]} ≥70`]);
  const hmax = Math.max(1,...a.hours_utc);
  return `<div class="grid g4">${Object.entries(a.totals).map(([k,v])=>`<div class="card kpi"><div class="l">${esc(k.replaceAll("_"," "))}</div><div class="v">${v??"—"}</div></div>`).join("")}</div>
  <div class="grid g2 mt"><div class="card"><h3>${t("trend")}</h3>${areaChart(a.daily,"n","good")}</div>
    <div class="card"><h3>${LANG==="ru"?"Востребованные направления (30 дней)":"Demand by category (30 days)"}</h3>${bars(cats)}</div></div>
  <div class="grid g2 mt"><div class="card"><h3>${LANG==="ru"?"Когда появляются хорошие заказы (UTC)":"When good jobs appear (UTC)"}</h3>
    <svg class="chart" viewBox="0 0 480 120" style="width:100%">${a.hours_utc.map((v,i)=>`<rect x="${i*20+2}" y="${100-v/hmax*90}" width="16" height="${v/hmax*90}" rx="3" fill="url(#gl2)"/><text x="${i*20+10}" y="114" text-anchor="middle">${i%3?"":i}</text>`).join("")}
    <defs><linearGradient id="gl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs></svg></div>
    <div class="card"><h3>A/B</h3><table><tr><th>variant</th><th>sent</th><th>replies</th><th>rate</th></tr>${a.ab.map(r=>`<tr><td>${esc(r.variant)}</td><td>${r.sent}</td><td>${r.replies||0}</td><td>${r.sent?Math.round(100*(r.replies||0)/r.sent)+"%":"—"}</td></tr>`).join("")||`<tr><td colspan=4 class="muted">${LANG==="ru"?"Нет отправленных откликов":"No sent proposals yet"}</td></tr>`}</table>
    <h3 class="mt">${t("insights")}</h3>${(a.insights.insights||[]).map(i=>`<div>• ${esc(i)}</div>`).join("")||"—"}</div></div>
  <div class="card mt"><h3>${t("platforms")}</h3><div class="tablewrap"><table><tr><th>platform</th><th>jobs</th><th>relevant ≥70</th><th>avg score</th><th>sent</th><th>replies</th><th>boost</th></tr>
    ${a.platforms.map(p=>`<tr><td>${esc(p.slug)}</td><td>${p.total}</td><td>${p.relevant}</td><td>${p.avg_score}</td><td>${p.sent}</td><td>${p.replies}</td><td>${(a.insights.boost||{})[p.slug]??0}</td></tr>`).join("")}</table></div></div>`;
};

V.finance = async () => {
  const f = await api("/finance");
  return `<div class="grid g4">${[["Expenses",f.expenses_usd],["Potential revenue",f.revenue_potential_usd],["Actual revenue",f.revenue_actual_usd],["Net profit",f.net_usd]].map(([k,v])=>`<div class="card kpi"><div class="l">${k}, USD</div><div class="v">${v}</div></div>`).join("")}</div>
  <div class="grid g2 mt"><div class="card"><h3>Limits</h3>
    <div class="small muted">${LANG==="ru"?"Расходы на площадки (отклики, подписки). 0 = ничего не тратится автоматически.":"Platform spend (bids, subscriptions). 0 = nothing is spent automatically."}</div>
    <div class="row mt">${["daily","weekly","monthly"].map(k=>`<label>${k}<input type="number" min="0" class="lim" data-k="${k}" value="${f.limits[k]}"></label>`).join("")}</div>
    <div class="small muted mt">AI API budget, USD</div><div class="row">${["daily","monthly"].map(k=>`<label>${k}<input type="number" min="0" step="0.5" class="aib" data-k="${k}" value="${f.ai_budget[k]}"></label>`).join("")}</div>
    <button class="btn pri mt" onclick="saveLimits()">${t("save")}</button>
    <div class="mt small">CAC: ${f.cac_usd!=null?"$"+f.cac_usd:"—"} · AI today: $${f.ai_spend_today_usd}</div></div>
    <div class="card"><h3>${t("ledgerAdd")}</h3><div class="row"><select id="lg-k"><option>expense</option><option>revenue_actual</option><option>revenue_potential</option></select>
      <input id="lg-c" placeholder="category (bid, subscription, server…)"><input id="lg-a" type="number" placeholder="amount" style="width:110px"><select id="lg-cur">${Object.keys(f.fx).map(c=>`<option>${c}</option>`).join("")}</select>
      <input id="lg-p" placeholder="platform"><input id="lg-n" placeholder="note" style="flex:1">
      <button class="btn pri" onclick="post('/ledger',{kind:$('#lg-k').value,category:$('#lg-c').value||'other',amount:$('#lg-a').value,currency:$('#lg-cur').value,platform:$('#lg-p').value,note:$('#lg-n').value}).then(route)">+</button></div>
      <h3 class="mt">By category</h3><pre class="small">${esc(JSON.stringify(f.by_kind,null,2))}</pre></div></div>
  <div class="card mt"><div class="tablewrap"><table><tr><th>when</th><th>kind</th><th>category</th><th>platform</th><th>amount</th><th>note</th></tr>
    ${f.ledger.map(r=>`<tr><td class="small">${ago(r.ts)}</td><td>${esc(r.kind)}</td><td>${esc(r.category)}</td><td>${esc(r.platform||"")}</td><td>${r.amount} ${esc(r.currency)}</td><td class="small muted">${esc(r.note||"")}</td></tr>`).join("")}</table></div></div>`;
};
async function saveLimits(){
  const lim = {}, ai = {}; document.querySelectorAll(".lim").forEach(i => lim[i.dataset.k] = +i.value); document.querySelectorAll(".aib").forEach(i => ai[i.dataset.k] = +i.value);
  await api("/settings", {method:"PUT", body:{spend_limits_usd:lim, ai_budget_usd:ai}}); toast("saved");
}

V.settings = async () => {
  const s = await api("/settings"); let pair = {}; try { pair = await api("/telegram/pair"); } catch(e){}
  const J = (k) => `<label>${k}<textarea class="js" data-k="${k}" style="min-height:${k==="llm"||k==="proposals"?180:90}px;font-family:ui-monospace,monospace;font-size:12px">${esc(JSON.stringify(s[k],null,2))}</textarea></label>`;
  return `<div class="grid g2">
  <div class="card"><h3>API keys (encrypted vault)</h3>${Object.entries(s.secrets).map(([n,ok])=>`<div class="row" style="margin-bottom:8px"><span class="dot ${ok?"ok":"bad"}"></span><code style="width:180px">${n}</code>
    <input type="password" id="sec-${n}" placeholder="${ok?"•••••• (set)":"paste value"}" style="flex:1"><button class="btn sm" onclick="post('/secrets',{name:'${n}',value:$('#sec-${n}').value}).then(()=>{toast('saved');route();refreshState()})">${t("save")}</button></div>`).join("")}
    <div class="small muted">${LANG==="ru"?"Ключи шифруются (Fernet) и никогда не попадают в Git или логи. Можно также задать их в .env.":"Keys are Fernet-encrypted, never in Git or logs. .env also works."}</div></div>
  <div class="card"><h3>Telegram</h3>${pair.bound?"✅ connected":`<ol class="small"><li>${LANG==="ru"?"Создайте бота у @BotFather и вставьте TELEGRAM_BOT_TOKEN слева.":"Create a bot with @BotFather, paste TELEGRAM_BOT_TOKEN."}</li>
    <li>${LANG==="ru"?"Откройте бота":"Open the bot"} ${pair.bot?`<a href="https://t.me/${esc(pair.bot)}" target="_blank" rel="noopener">@${esc(pair.bot)}</a>`:""} ${LANG==="ru"?"с аккаунта @mrwechka и отправьте:":"from @mrwechka and send:"} <code>/start ${esc(pair.code||"")}</code></li></ol>`}
    <button class="btn sm" onclick="post('/telegram/test').then(r=>toast(r.sent?'sent':'not bound'))">Test</button>
    <h3 class="mt">Gmail</h3><div class="small muted">OAuth 2.0 · scopes: gmail.readonly + gmail.send. ${LANG==="ru"?"Пароль Google не нужен.":"No Google password needed."}</div>
    <a class="btn sm mt" href="/api/gmail/auth">${S.state.gmail?"✅ reconnect":"Connect Gmail"}</a>
    <h3 class="mt">Data</h3><div class="row"><a class="btn sm" href="/api/export">${t("export")}</a><button class="btn sm" onclick="post('/backup').then(r=>toast(r.file))">${t("backup")}</button>
    <button class="btn sm danger" onclick="prompt('Type DELETE')==='DELETE'&&post('/delete-data',{confirm:'DELETE'}).then(()=>toast('deleted'))">${t("del")}</button></div></div></div>
  <div class="card mt"><h3>${LANG==="ru"?"Параметры (JSON)":"Parameters (JSON)"}</h3><div class="grid g2">${["thresholds","proposals","outreach","llm","intervals_min","telegram_channels","fx_to_usd","telegram"].map(J).join("")}</div>
    <button class="btn pri mt" onclick="saveJson()">${t("save")}</button></div>`;
};
async function saveJson(){
  const b = {}; try { document.querySelectorAll(".js").forEach(x => b[x.dataset.k] = JSON.parse(x.value)); } catch(e){ return toast("Invalid JSON: " + e.message); }
  await api("/settings", {method:"PUT", body:b}); toast("saved"); loadThr();
}
async function loadThr(){ try { const s = await api("/settings"); S.thr = s.thresholds; S.agents = s.agents; } catch(e){} }

// ---------- router ----------
async function route(){
  const p = PAGES.includes(location.hash.slice(1)) ? location.hash.slice(1) : "dashboard";
  $("#title").textContent = t(p); renderNav(); $("#side").classList.remove("open");
  if (p !== "live") SSE?.close();
  $("#view").innerHTML = `<div class="skeleton"></div><div class="skeleton mt"></div>`;
  try { $("#view").innerHTML = await V[p](); } catch(e){ $("#view").innerHTML = `<div class="empty">⚠ ${esc(e.message)}</div>`; }
}
window.addEventListener("hashchange", route);
(async () => { await Promise.all([refreshState(), loadThr()]); try { STAGES = (await api("/leads")).stages; } catch(e){} route(); setInterval(refreshState, 15000); })();
