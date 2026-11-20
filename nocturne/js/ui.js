/* NOCTURNE — global UI: header, cart drawer, search overlay, toasts, reveal, rails */
N.ui = (() => {
  const { qs, qsa, esc, price, highlight, norm, reducedMotion } = N.utils;
  const D = N.data;
  const S = N.store;

  /* ---------- toasts ---------- */
  const toast = (html, { tone = '', timeout = 3200 } = {}) => {
    const box = qs('#toasts');
    const el = document.createElement('div');
    el.className = 'toast ' + tone;
    el.innerHTML = html;
    box.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    setTimeout(() => { el.classList.remove('is-in'); setTimeout(() => el.remove(), 400); }, timeout);
  };

  /* ---------- body lock / overlays ---------- */
  let openLayer = null;
  let lastFocus = null;
  const lock = on => document.documentElement.classList.toggle('is-locked', on);

  const openCart = () => {
    closeAll();
    renderCartDrawer();
    lastFocus = document.activeElement;
    const d = qs('#cartDrawer');
    qs('#scrim').hidden = false;
    requestAnimationFrame(() => { d.classList.add('is-open'); qs('#scrim').classList.add('is-on'); });
    d.setAttribute('aria-hidden', 'false');
    lock(true); openLayer = 'cart';
    setTimeout(() => d.focus(), 50);
  };
  const closeCart = () => {
    const d = qs('#cartDrawer');
    d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true');
    qs('#scrim').classList.remove('is-on');
    setTimeout(() => { if (openLayer !== 'cart') qs('#scrim').hidden = true; }, 350);
    lock(false); openLayer = null;
    lastFocus?.focus?.();
  };

  const toggleMenu = force => {
    const m = qs('#mobileMenu'), b = qs('.burger');
    const on = force ?? !m.classList.contains('is-open');
    m.classList.toggle('is-open', on);
    m.setAttribute('aria-hidden', String(!on));
    b.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('menu-open', on);
    lock(on); openLayer = on ? 'menu' : null;
  };

  /* ---------- search ---------- */
  const searchIndex = D.products.map(p => ({ p, text: norm([p.title, p.artistName, p.genreName, D.genreById[p.genre].en, p.label, p.year, p.format].join(' ')) }));
  let searchSel = -1;

  const runSearch = q => {
    const box = qs('#searchResults');
    const nq = norm(q);
    if (!nq) {
      const popular = [...D.products].sort((a, b) => b.pop - a.pop).slice(0, 6);
      box.innerHTML = `
        <div class="sr-group"><p class="sr-label mono">Часто ищут</p>
          <div class="sr-chips">${['постпанк', 'Kiri Nakamura', 'джаз', '90s', '2LP', 'Blue Fjord'].map(t => `<button class="chip" data-action="search-fill" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div></div>
        <div class="sr-group"><p class="sr-label mono">Популярное сейчас</p><ul class="sr-list">${popular.map(p => srItem(p)).join('')}</ul></div>`;
      searchSel = -1; return;
    }
    const terms = nq.split(' ');
    const hits = searchIndex.filter(x => terms.every(t => x.text.includes(t)))
      .map(x => ({ p: x.p, score: (norm(x.p.title).startsWith(nq) ? 3 : 0) + (norm(x.p.artistName).includes(nq) ? 2 : 0) + x.p.pop / 100 }))
      .sort((a, b) => b.score - a.score).map(x => x.p);
    const arts = D.artists.filter(a => norm(a.name).includes(nq));
    const gens = D.genres.filter(g => norm(g.name).includes(nq) || norm(g.en).includes(nq));
    if (!hits.length && !arts.length && !gens.length) {
      box.innerHTML = `<div class="sr-empty"><p class="sr-empty__big">Тишина.</p><p>По запросу «${esc(q)}» ничего не нашлось. Попробуйте имя исполнителя, жанр или лейбл.</p></div>`;
      searchSel = -1; return;
    }
    box.innerHTML = `
      ${gens.length || arts.length ? `<div class="sr-group"><p class="sr-label mono">Жанры и исполнители</p><div class="sr-chips">
        ${gens.map(g => `<a class="chip chip--accent" href="#/catalog?genre=${g.id}">${highlight(g.name, q)}</a>`).join('')}
        ${arts.map(a => `<a class="chip" href="#/catalog?artist=${a.id}">${highlight(a.name, q)}</a>`).join('')}</div></div>` : ''}
      ${hits.length ? `<div class="sr-group"><p class="sr-label mono">Релизы · ${hits.length}</p><ul class="sr-list">${hits.slice(0, 8).map(p => srItem(p, q)).join('')}</ul>
      ${hits.length > 8 ? `<a class="link-arrow" href="#/catalog?q=${encodeURIComponent(q)}">Все ${hits.length} результатов ${N.c.icon.arrow}</a>` : ''}</div>` : ''}`;
    searchSel = -1;
  };
  const srItem = (p, q = '') => `<li><a class="sr-item" href="#/release/${p.id}">
      <span class="sr-item__cover">${N.c.sleeve(p, { vinyl: false, label: false })}</span>
      <span class="sr-item__text"><b>${highlight(p.title, q)}</b><span>${highlight(p.artistName, q)}</span></span>
      <span class="sr-item__meta mono">${highlight(p.genreName, q)} · ${p.year}</span>
      <span class="sr-item__price">${price(p.price)}</span></a></li>`;

  const openSearch = (q = '') => {
    closeAll();
    const s = qs('#search'), input = qs('#searchInput');
    lastFocus = document.activeElement;
    s.classList.add('is-open'); s.setAttribute('aria-hidden', 'false');
    lock(true); openLayer = 'search';
    input.value = q; runSearch(q);
    setTimeout(() => input.focus(), 60);
  };
  const closeSearch = () => {
    const s = qs('#search');
    s.classList.remove('is-open'); s.setAttribute('aria-hidden', 'true');
    lock(false); openLayer = null;
  };
  const closeAll = () => {
    if (openLayer === 'cart') closeCart();
    if (openLayer === 'search') closeSearch();
    if (openLayer === 'menu') toggleMenu(false);
  };

  /* ---------- cart drawer ---------- */
  const renderCartDrawer = () => {
    const body = qs('#cartDrawerBody');
    const lines = S.cartLines();
    qs('[data-cart-count]').textContent = lines.length ? `(${S.cartCount()})` : '';
    if (!lines.length) {
      body.innerHTML = `<div class="drawer__empty">
        <div class="empty__disc" aria-hidden="true"><span class="disc disc--spin"><span class="disc__label"><i></i></span></span></div>
        <p class="drawer__empty-title">Проигрыватель ждёт</p><p class="muted">В корзине пока пусто.</p>
        <a class="btn" href="#/catalog" data-action="close-cart">Перейти в каталог</a></div>`;
      return;
    }
    body.innerHTML = `
      ${N.c.shippingMeter()}
      <ul class="lines">${lines.map(l => N.c.cartLine(l, { compact: true })).join('')}</ul>
      <div class="drawer__foot">
        <div class="sum-row"><span>Итого</span><b>${price(S.subtotal())}</b></div>
        <p class="mono muted small">Доставка рассчитывается при оформлении</p>
        <a class="btn btn--block btn--accent" href="#/checkout">Оформить заказ ${N.c.icon.arrow}</a>
        <div class="drawer__links"><button class="link-u" data-action="close-cart">Продолжить покупки</button><a class="link-u" href="#/cart">Открыть корзину</a></div>
      </div>`;
  };

  /* ---------- badges & live state ---------- */
  const updateBadges = (bump) => {
    const c = S.cartCount(), f = S.favs().length;
    qsa('[data-badge="cart"]').forEach(b => { b.textContent = c; b.hidden = !c; if (bump === 'cart') { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
    qsa('[data-badge="favs"]').forEach(b => { b.textContent = f; b.hidden = !f; if (bump === 'fav') { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
  };
  const syncFavButtons = () => qsa('[data-fav-id]').forEach(b => {
    const on = S.isFav(b.dataset.favId);
    b.setAttribute('aria-pressed', on);
    const t = D.byId[b.dataset.favId]?.title || '';
    b.setAttribute('aria-label', `${on ? 'Убрать из избранного' : 'В избранное'}: ${t}`);
    const lbl = b.querySelector('[data-fav-label]'); if (lbl) lbl.textContent = on ? 'В избранном' : 'В избранное';
  });

  /* ---------- fly-to-cart animation ---------- */
  const flyToCart = from => {
    if (reducedMotion() || !from) return;
    const targets = qsa('[data-action="open-cart"]').filter(el => el.offsetParent);
    const to = targets[0]; if (!to) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const dot = document.createElement('span');
    dot.className = 'fly-disc';
    dot.style.left = a.left + a.width / 2 - 18 + 'px'; dot.style.top = a.top + a.height / 2 - 18 + 'px';
    document.body.appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 80}px) scale(.8) rotate(180deg)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3) rotate(360deg)`, opacity: .2 }
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => dot.remove();
  };

  /* ---------- reveal on scroll ---------- */
  let io;
  const observeReveals = root => {
    if (!('IntersectionObserver' in window) || reducedMotion()) { qsa('[data-reveal]', root).forEach(el => el.classList.add('is-in')); return; }
    io = io || new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    qsa('[data-reveal]:not(.is-in)', root).forEach(el => io.observe(el));
  };

  /* ---------- rails ---------- */
  const initRails = root => qsa('.rail', root).forEach(rail => {
    const track = qs('[data-rail]', rail), bar = qs('.rail__progress i', rail);
    const upd = () => {
      const max = track.scrollWidth - track.clientWidth;
      const pct = max > 0 ? track.scrollLeft / max : 1;
      const vis = track.clientWidth / track.scrollWidth;
      bar.style.width = Math.max(vis * 100, 8) + '%';
      bar.style.transform = `translateX(${pct * (1 / Math.max(vis, .08) - 1) * 100}%)`;
      qs('[data-action="rail-prev"]', rail).disabled = track.scrollLeft < 4;
      qs('[data-action="rail-next"]', rail).disabled = track.scrollLeft > max - 4;
    };
    track.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    // drag to scroll with mouse
    let down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-drag'); } track.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', () => { down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    upd();
  });
  const railStep = (btn, dir) => {
    const track = qs('[data-rail]', btn.closest('.rail'));
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  /* ---------- header ---------- */
  const setActiveNav = name => {
    qsa('[data-nav]').forEach(a => a.classList.toggle('is-active', a.dataset.nav === name));
    qsa('[data-tab]').forEach(a => a.classList.toggle('is-active', a.dataset.tab === name));
  };
  const initHeader = () => {
    const h = qs('#siteHeader');
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      h.classList.toggle('is-scrolled', y > 20);
      h.classList.toggle('is-hidden', y > 400 && y > lastY + 4 && !openLayer);
      if (y < lastY - 4) h.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  };

  const renderFooter = () => {
    qs('#siteFooter').innerHTML = `
      <div class="footer__top">
        <div class="footer__col footer__col--lead">
          <p class="footer__claim">Музыка — не фон.<br><em>Это часть культуры.</em></p>
          <p class="mono muted">Независимый магазин винила · с 2011</p>
        </div>
        <div class="footer__col"><p class="footer__h mono">Магазин</p><a href="#/catalog">Каталог</a><a href="#/new">Новинки</a><a href="#/collections">Коллекции</a><a href="#/favorites">Избранное</a><a href="#/cart">Корзина</a></div>
        <div class="footer__col"><p class="footer__h mono">Жанры</p>${D.genres.slice(0, 6).map(g => `<a href="#/catalog?genre=${g.id}">${g.name}</a>`).join('')}</div>
        <div class="footer__col"><p class="footer__h mono">NOCTURNE</p><a href="#/about">About</a><a href="#/about#grading">Как мы оцениваем винил</a><a href="#/about#visit">Адрес и часы</a><a href="mailto:hello@nocturne.store">hello@nocturne.store</a></div>
        <div class="footer__col"><p class="footer__h mono">Зал</p><p>Лиговский пр., 74<br>Санкт-Петербург</p><p class="muted">Ежедневно 12:00–22:00<br>Пт–Сб до 00:00</p></div>
      </div>
      <div class="footer__word" aria-hidden="true">NOCTURNE</div>
      <div class="footer__bottom mono"><span>© 2011–2026 NOCTURNE Records</span><span>Сделано для тех, кто слушает альбомы целиком</span><button class="link-u" data-action="to-top">Наверх ↑</button></div>`;
  };

  return { toast, openCart, closeCart, renderCartDrawer, toggleMenu, openSearch, closeSearch, closeAll, runSearch, updateBadges, syncFavButtons, flyToCart, observeReveals, initRails, railStep, setActiveNav, initHeader, renderFooter, get openLayer() { return openLayer; }, set searchSel(v) { searchSel = v; }, get searchSel() { return searchSel; } };
})();
