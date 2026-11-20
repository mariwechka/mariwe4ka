/* NOCTURNE — release page */
N.pages.product = (() => {
  const { esc, price, pad, qs, qsa } = N.utils;
  const D = N.data, C = N.c, S = N.store;
  let p, root, audio;

  const gradeBar = (label, code) => {
    const i = D.conditionOrder.indexOf(code);
    return `<div class="grade"><span class="mono">${label}</span><div class="grade__scale" aria-label="${label}: ${D.conditions[code].name}">${D.conditionOrder.slice().reverse().map((c, k) => `<i class="${3 - k >= i ? 'on' : ''}"></i>`).join('')}</div><b class="mono">${code}</b><small>${D.conditions[code].text}</small></div>`;
  };

  const buyBox = () => {
    const max = S.available(p.id), inCart = S.inCart(p.id);
    if (!max) return `<div class="buy buy--out"><p>Этот экземпляр уже нашёл своего слушателя.</p><div class="buy__row"><button class="btn btn--ghost" disabled>Продано</button>${favBig()}</div><p class="mono muted small">Добавьте в избранное — сообщим, если найдём ещё копию.</p></div>`;
    const left = max - inCart;
    return `<div class="buy" data-buy>
      <div class="buy__row">
        ${max > 1 ? `<div class="qty" role="group" aria-label="Количество">
          <button data-action="pdp-dec" aria-label="Меньше">${C.icon.minus}</button>
          <output id="pdpQtyOut">1</output><input type="hidden" data-buy-qty id="pdpQty" value="1">
          <button data-action="pdp-inc" aria-label="Больше" ${left <= 1 ? 'disabled' : ''}>${C.icon.plus}</button></div>` : ''}
        ${left > 0 ? `<button class="btn btn--accent btn--grow" data-action="add-to-cart" data-id="${p.id}">${C.icon.bag}<span>Добавить в корзину</span></button>`
                  : `<button class="btn btn--grow" data-action="open-cart">${C.icon.check}<span>Уже в корзине</span></button>`}
        ${favBig()}
      </div>
      ${inCart ? `<p class="mono small buy__incart">В корзине: ${inCart} шт. <button class="link-u" data-action="open-cart">Открыть корзину</button></p>` : ''}
    </div>`;
  };
  const favBig = () => { const on = S.isFav(p.id); return `<button class="fav-btn fav-btn--big" data-action="toggle-fav" data-id="${p.id}" data-fav-id="${p.id}" aria-pressed="${on}" aria-label="${on ? 'Убрать из избранного' : 'В избранное'}">${C.icon.heart}<span data-fav-label>${on ? 'В избранном' : 'В избранное'}</span></button>`; };

  const related = () => {
    const byArtist = D.products.filter(x => x.artist === p.artist && x.id !== p.id);
    const score = x => (x.genre === p.genre ? 3 : 0) + x.collections.filter(c => p.collections.includes(c)).length * 2 + (Math.abs(x.year - p.year) < 8 ? 1 : 0) + x.pop / 100;
    const similar = D.products.filter(x => x.artist !== p.artist && x.id !== p.id).sort((a, b) => score(b) - score(a)).slice(0, 8);
    return { byArtist, similar };
  };

  const render = ({ id }) => {
    p = D.byId[id];
    if (!p) return N.pages.notFound.render();
    const a = D.artistById[p.artist], g = D.genreById[p.genre];
    const tl = D.tracklist(p);
    const sides = [...new Set(tl.map(t => t.side))];
    const { byArtist, similar } = related();
    const cols = p.collections.map(c => D.collectionById[c]);
    return `<article class="pdp" style="--pal-bg:${p.cover.pal[0]};--pal-ac:${p.cover.pal[2]}">
      <div class="pdp__glow" aria-hidden="true"></div>
      <div class="pdp__grid">
        <div class="pdp__stage">
          <div class="pdp__deck" id="pdpDeck">
            <span class="disc disc--pdp" id="pdpDisc" style="${N.cover.labelVars(p)}"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span>
            <div class="pdp__sleeve sleeve__art ${C.wear(p)}">${N.cover.svg(p)}</div>
          </div>
          <div class="pdp__controls">
            <button class="chip" data-action="pdp-spin" aria-pressed="false" id="spinBtn"><span class="dot"></span> Поставить на проигрыватель</button>
            <button class="chip" data-action="pdp-crackle" aria-pressed="false" id="crackleBtn">♪ Звук иглы</button>
          </div>
        </div>
        <div class="pdp__info">
          <nav class="crumbs mono" aria-label="Хлебные крошки"><a href="#/catalog">Каталог</a><span>/</span><a href="#/catalog?genre=${g.id}">${g.name}</a><span>/</span><a href="#/catalog?artist=${a.id}">${esc(a.name)}</a></nav>
          <a class="pdp__artist" href="#/catalog?artist=${a.id}">${esc(a.name)}</a>
          <h1 class="pdp__title">${esc(p.title)}</h1>
          <p class="pdp__edition serif">${esc(p.edition)} · ${p.year}</p>
          <div class="pdp__price"><b>${price(p.price)}</b>${C.availability(p)}</div>
          <div id="pdpBuy">${buyBox()}</div>
          <ul class="pdp__perks mono small">
            <li>Отправка за 1–2 дня в жёсткой коробке</li><li>Бесплатная доставка от ${price(S.FREE_SHIPPING)}</li><li>Пластинка прослушана перед продажей</li>
          </ul>
          <dl class="specs">
            <div><dt>Исполнитель</dt><dd><a class="link-u" href="#/catalog?artist=${a.id}">${esc(a.name)}</a></dd></div>
            <div><dt>Жанр</dt><dd><a class="link-u" href="#/catalog?genre=${g.id}">${g.name}</a></dd></div>
            <div><dt>Год выпуска</dt><dd>${p.year}</dd></div>
            <div><dt>Издатель</dt><dd>${esc(p.label)}</dd></div>
            <div><dt>Формат</dt><dd>${esc(p.format)}</dd></div>
            <div><dt>Каталожный №</dt><dd class="mono">${D.catNo(p)}</dd></div>
            <div><dt>Издание</dt><dd>${esc(p.edition)}</dd></div>
            <div><dt>Наличие</dt><dd>${S.available(p.id) ? S.available(p.id) + ' шт.' : 'Нет'}</dd></div>
          </dl>
          <div class="grades">${gradeBar('Пластинка', p.media)}${gradeBar('Конверт', p.sleeve)}<a class="link-u mono small" href="#/about#grading">Как мы оцениваем состояние →</a></div>
          <div class="pdp__desc"><h2 class="mono">Описание</h2><p class="dropcap">${esc(p.desc)}</p></div>
          ${cols.length ? `<div class="pdp__cols"><h2 class="mono">Входит в коллекции</h2>${cols.map(c => `<a class="chip chip--accent" href="#/collection/${c.id}">${esc(c.name)}</a>`).join('')}</div>` : ''}
          <div class="tracks"><h2 class="mono">Треклист</h2>
            ${sides.map(sd => `<div class="tracks__side"><span class="tracks__letter serif">${sd}</span><ol>${tl.filter(t => t.side === sd).map(t => `<li><span class="mono">${sd}${tl.filter(x => x.side === sd).indexOf(t) + 1}</span><span>${esc(t.name)}</span><span class="mono muted">${t.time}</span></li>`).join('')}</ol></div>`).join('')}
          </div>
        </div>
      </div>

      <section class="artist-band" data-reveal>
        <div class="artist-band__text">
          <p class="mono muted">Об исполнителе · ${esc(a.city)}</p>
          <h2 class="artist-band__name">${esc(a.name)}</h2>
          <p class="serif">${esc(a.bio)}</p>
          <a class="link-arrow" href="#/catalog?artist=${a.id}">Все релизы исполнителя ${C.icon.arrow}</a>
        </div>
        <div class="artist-band__list">
          ${byArtist.length ? byArtist.map((x, i) => C.card(x, i, { showIndex: false })).join('') : '<p class="muted">Других релизов этого исполнителя сейчас нет в наличии.</p>'}
        </div>
      </section>

      <section class="sec">
        ${C.sectionHead('↻', 'Похожие <em>альбомы</em>', { link: `#/catalog?genre=${g.id}`, linkText: `Весь ${g.name.toLowerCase()}` })}
        ${C.rail(similar)}
      </section>

      ${(() => { const v = S.viewed(p.id).slice(0, 8); return v.length >= 2 ? `<section class="sec sec--viewed">${C.sectionHead('◷', 'Вы <em>смотрели</em>')}${C.rail(v)}</section>` : ''; })()}

      <div class="buybar" id="buybar">
        <span class="buybar__cover">${C.sleeve(p, { vinyl: false, label: false })}</span>
        <span class="buybar__t"><b>${esc(p.title)}</b><span>${price(p.price)}</span></span>
        ${S.available(p.id) ? `<button class="btn btn--accent btn--sm" data-action="add-to-cart" data-id="${p.id}">${C.icon.bag}<span>В корзину</span></button>` : '<span class="mono muted">Продано</span>'}
      </div>
    </article>`;
  };

  /* --- needle crackle with WebAudio (no files needed) --- */
  const crackle = on => {
    if (!on) { audio?.ctx.close(); audio = null; return; }
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    const ctx = new Ctx(), len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.012; // hiss
      if (Math.random() < 0.0009) { const amp = Math.random() * 0.6; for (let k = 0; k < 40 && i + k < len; k++) d[i + k] += (Math.random() * 2 - 1) * amp * Math.exp(-k / 6); }
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
    const hum = ctx.createOscillator(); hum.frequency.value = 50; const hg = ctx.createGain(); hg.gain.value = 0.004;
    const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 0.6);
    src.connect(lp).connect(g).connect(ctx.destination); hum.connect(hg).connect(ctx.destination);
    src.start(); hum.start();
    audio = { ctx };
    return true;
  };

  const mount = el => {
    root = el;
    if (!p) return;
    S.markViewed(p.id);
    const deck = qs('#pdpDeck', el);
    if (matchMedia('(pointer:fine)').matches && !N.utils.reducedMotion()) {
      const move = e => { const r = deck.getBoundingClientRect(); deck.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5).toFixed(3)); deck.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5).toFixed(3)); };
      deck.addEventListener('pointermove', move);
      deck.addEventListener('pointerleave', () => { deck.style.setProperty('--rx', 0); deck.style.setProperty('--ry', 0); });
    }
    // sticky mobile buybar appears once the main buy box scrolls out
    const bar = qs('#buybar', el), buy = qs('#pdpBuy', el);
    let io;
    if ('IntersectionObserver' in window) { io = new IntersectionObserver(([e]) => bar.classList.toggle('is-on', !e.isIntersecting && e.boundingClientRect.top < 0)); io.observe(buy); }
    return () => { io?.disconnect(); crackle(false); root = null; };
  };

  const onAction = (action, el) => {
    const q = qs('#pdpQty', root), out = qs('#pdpQtyOut', root);
    const left = S.available(p.id) - S.inCart(p.id);
    const setQ = v => { v = Math.max(1, Math.min(left, v)); q.value = v; out.textContent = v; qs('[data-action="pdp-inc"]', root).disabled = v >= left; qs('[data-action="pdp-dec"]', root).disabled = v <= 1; };
    if (action === 'pdp-inc') setQ(+q.value + 1);
    if (action === 'pdp-dec') setQ(+q.value - 1);
    if (action === 'pdp-spin') {
      const on = el.getAttribute('aria-pressed') !== 'true';
      el.setAttribute('aria-pressed', on);
      qs('#pdpDeck', root).classList.toggle('is-playing', on);
      el.lastChild.textContent = on ? ' Снять с проигрывателя' : ' Поставить на проигрыватель';
    }
    if (action === 'pdp-crackle') {
      const on = el.getAttribute('aria-pressed') !== 'true';
      const ok = crackle(on);
      if (on && ok === false) return N.ui.toast('Браузер не поддерживает Web Audio', { tone: 'toast--warn' });
      el.setAttribute('aria-pressed', on);
      if (on && !qs('#pdpDeck', root).classList.contains('is-playing')) qs('#spinBtn', root).click();
    }
  };

  const onStore = type => {
    if (!root || !p) return;
    if (type.startsWith('cart') || type === 'order' || type === 'sync') qs('#pdpBuy', root).innerHTML = buyBox();
  };

  return { id: 'product', nav: 'catalog', title: ({ id }) => D.byId[id] ? `${D.byId[id].artistName} — ${D.byId[id].title}` : 'Не найдено', render, mount, onAction, onStore };
})();
