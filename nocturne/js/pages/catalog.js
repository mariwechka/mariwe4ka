/* NOCTURNE — catalogue with filters, sorting, search, grid/list views */
N.pages.catalog = (() => {
  const { esc, price, qs, qsa, norm, buildQuery, records, storage, debounce } = N.utils;
  const D = N.data, C = N.c;
  const PAGE = 12;
  const prices = D.products.map(p => p.price);
  const PMIN = Math.floor(Math.min(...prices) / 500) * 500, PMAX = Math.ceil(Math.max(...prices) / 500) * 500;
  const sorts = [['new', 'Сначала новые'], ['popular', 'По популярности'], ['price-asc', 'Цена: по возрастанию'], ['price-desc', 'Цена: по убыванию'], ['year', 'Год выпуска']];

  let state, shown = PAGE;

  const fromQuery = q => ({
    q: q.q || '',
    genre: q.genre ? q.genre.split(',') : [],
    artist: q.artist ? q.artist.split(',') : [],
    cond: q.cond ? q.cond.split(',') : [],
    format: q.format ? q.format.split(',') : [],
    min: q.min ? +q.min : '', max: q.max ? +q.max : '',
    stock: q.stock === '1',
    sort: sorts.some(s => s[0] === q.sort) ? q.sort : 'new'
  });
  const toQuery = s => buildQuery({ q: s.q, genre: s.genre, artist: s.artist, cond: s.cond, format: s.format, min: s.min, max: s.max, stock: s.stock ? 1 : '', sort: s.sort === 'new' ? '' : s.sort });

  const apply = s => {
    const terms = norm(s.q).split(' ').filter(Boolean);
    let list = D.products.filter(p => {
      if (s.genre.length && !s.genre.includes(p.genre)) return false;
      if (s.artist.length && !s.artist.includes(p.artist)) return false;
      if (s.cond.length && !s.cond.includes(p.media)) return false;
      if (s.format.length && !s.format.includes(p.format)) return false;
      if (s.min !== '' && p.price < s.min) return false;
      if (s.max !== '' && p.price > s.max) return false;
      if (s.stock && !N.store.available(p.id)) return false;
      if (terms.length) {
        const hay = norm([p.title, p.artistName, p.genreName, D.genreById[p.genre].en, p.label, p.year].join(' '));
        if (!terms.every(t => hay.includes(t))) return false;
      }
      return true;
    });
    const by = {
      new: (a, b) => b.added.localeCompare(a.added),
      popular: (a, b) => b.pop - a.pop,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      year: (a, b) => b.year - a.year
    }[s.sort];
    // sold-out items sink to the end, but stay visible
    return list.sort((a, b) => (!N.store.available(a.id)) - (!N.store.available(b.id)) || by(a, b));
  };

  const check = (name, value, label, checked, extra = '') => `<label class="check"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}><span>${label}</span>${extra}</label>`;

  const filtersHtml = s => `
    <form class="filters__form" id="filterForm" novalidate>
      <div class="filters__head"><p class="filters__title">Фильтры</p><button type="button" class="icon-btn" data-action="close-filters" aria-label="Закрыть фильтры">${C.icon.close}</button></div>
      <fieldset class="fgroup"><legend>Жанр</legend>
        ${D.genres.map(g => check('genre', g.id, g.name, s.genre.includes(g.id), `<small class="mono">${D.products.filter(p => p.genre === g.id).length}</small>`)).join('')}
      </fieldset>
      <fieldset class="fgroup"><legend>Исполнитель</legend>
        <input class="input input--sm" type="search" placeholder="Найти исполнителя" data-artist-filter aria-label="Найти исполнителя">
        <div class="fgroup__scroll" data-artist-list>
          ${[...D.artists].sort((a, b) => a.name.localeCompare(b.name)).map(a => `<div data-artist-name="${esc(norm(a.name))}">${check('artist', a.id, esc(a.name), s.artist.includes(a.id))}</div>`).join('')}
        </div>
      </fieldset>
      <fieldset class="fgroup"><legend>Цена, ₽</legend>
        <div class="price-range">
          <input class="input input--sm" type="number" name="min" min="${PMIN}" max="${PMAX}" step="100" placeholder="от ${PMIN}" value="${s.min}" aria-label="Цена от">
          <span>—</span>
          <input class="input input--sm" type="number" name="max" min="${PMIN}" max="${PMAX}" step="100" placeholder="до ${PMAX}" value="${s.max}" aria-label="Цена до">
        </div>
        <div class="dual" style="--a:${((s.min || PMIN) - PMIN) / (PMAX - PMIN)};--b:${((s.max || PMAX) - PMIN) / (PMAX - PMIN)}">
          <input type="range" data-range="min" min="${PMIN}" max="${PMAX}" step="100" value="${s.min || PMIN}" aria-label="Минимальная цена">
          <input type="range" data-range="max" min="${PMIN}" max="${PMAX}" step="100" value="${s.max || PMAX}" aria-label="Максимальная цена">
        </div>
      </fieldset>
      <fieldset class="fgroup"><legend>Состояние пластинки</legend>
        ${D.conditionOrder.map(c => check('cond', c, `<b class="mono">${c}</b> ${D.conditions[c].name}`, s.cond.includes(c))).join('')}
      </fieldset>
      <fieldset class="fgroup"><legend>Формат</legend>
        <div class="toggles">${D.formats.map(f => `<label class="toggle"><input type="checkbox" name="format" value="${esc(f)}" ${s.format.includes(f) ? 'checked' : ''}><span>${esc(f)}</span></label>`).join('')}</div>
      </fieldset>
      <fieldset class="fgroup"><legend class="sr-only">Наличие</legend>
        <label class="switch"><input type="checkbox" name="stock" ${s.stock ? 'checked' : ''}><span class="switch__ui"></span><span>Только в наличии</span></label>
      </fieldset>
      <div class="filters__foot">
        <button type="button" class="btn btn--ghost" data-action="reset-filters">Сбросить</button>
        <button type="button" class="btn btn--accent" data-action="close-filters" data-apply>Показать</button>
      </div>
    </form>`;

  const chipsHtml = s => {
    const chips = [];
    if (s.q) chips.push(['q', '', `«${esc(s.q)}»`]);
    s.genre.forEach(v => chips.push(['genre', v, D.genreById[v]?.name || v]));
    s.artist.forEach(v => chips.push(['artist', v, D.artistById[v]?.name || v]));
    s.cond.forEach(v => chips.push(['cond', v, 'Состояние ' + v]));
    s.format.forEach(v => chips.push(['format', v, v]));
    if (s.min !== '' || s.max !== '') chips.push(['price', '', `${s.min || PMIN}–${s.max || PMAX} ₽`]);
    if (s.stock) chips.push(['stock', '', 'В наличии']);
    if (!chips.length) return '';
    return chips.map(([k, v, l]) => `<button class="chip chip--x" data-action="remove-chip" data-k="${k}" data-v="${esc(v)}">${esc(l)} ${C.icon.close}</button>`).join('') +
      `<button class="link-u mono" data-action="reset-filters">Сбросить всё</button>`;
  };

  const view = () => storage.get('nocturne:view', 'grid');

  const resultsHtml = list => {
    if (!list.length) return C.empty({ title: 'Ничего не играет', text: 'По этим фильтрам пластинок нет. Попробуйте ослабить условия или сбросить поиск.', cta: 'Сбросить фильтры', href: '#/catalog' });
    const slice = list.slice(0, shown);
    const body = view() === 'list'
      ? `<div class="ledger"><div class="ledger__head mono"><span>№</span><span></span><span>Релиз</span><span>Жанр</span><span>Год</span><span>Формат / Сост.</span><span>Цена</span><span></span></div>${slice.map((p, i) => C.row(p, i)).join('')}</div>`
      : `<div class="grid grid--stagger">${slice.map((p, i) => C.card(p, i)).join('')}</div>`;
    const more = list.length > shown ? `<div class="more"><p class="mono muted">Показано ${slice.length} из ${list.length}</p><button class="btn btn--ghost" data-action="more">Показать ещё</button></div>` : '';
    return body + more;
  };

  const headTitle = s => {
    if (s.genre.length === 1 && !s.artist.length) { const g = D.genreById[s.genre[0]]; return { t: g.name, sub: g.blurb }; }
    if (s.artist.length === 1 && !s.genre.length) { const a = D.artistById[s.artist[0]]; return { t: a.name, sub: `${a.city}. ${a.bio}` }; }
    if (s.q) return { t: 'Поиск', sub: `Результаты по запросу «${esc(s.q)}».` };
    return { t: 'Каталог', sub: 'Все пластинки магазина. Каждая прослушана, оценена по шкале Goldmine и готова к отправке.' };
  };

  const render = (params, query) => {
    state = fromQuery(query); shown = PAGE;
    const h = headTitle(state);
    return `<section class="cat">
      <header class="cat__head">
        <p class="mono muted" data-reveal>NOCTURNE / Каталог</p>
        <h1 class="cat__title" data-reveal id="catTitle" data-t="${esc(h.t)}">${esc(h.t)}</h1>
        <p class="cat__sub" data-reveal id="catSub">${h.sub}</p>
      </header>
      <nav class="genre-tabs" aria-label="Жанры">
        <a href="#/catalog" class="${!state.genre.length ? 'is-active' : ''}">Все</a>
        ${D.genres.map(g => `<a href="#/catalog?genre=${g.id}" class="${state.genre.length === 1 && state.genre[0] === g.id ? 'is-active' : ''}">${g.name}</a>`).join('')}
      </nav>
      <div class="toolbar" id="toolbar">
        <label class="toolbar__search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>
          <input type="search" id="catSearch" placeholder="Альбом, исполнитель или жанр" value="${esc(state.q)}" aria-label="Поиск в каталоге"></label>
        <span class="toolbar__count mono" id="catCount" aria-live="polite"></span>
        <label class="select"><span class="sr-only">Сортировка</span>
          <select id="catSort">${sorts.map(([v, l]) => `<option value="${v}" ${state.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <div class="viewtoggle" role="group" aria-label="Вид">
          <button data-action="view" data-v="grid" aria-pressed="${view() === 'grid'}" aria-label="Сетка"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/></svg></button>
          <button data-action="view" data-v="list" aria-pressed="${view() === 'list'}" aria-label="Список"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
        <button class="btn btn--ghost btn--sm toolbar__filters" data-action="open-filters">Фильтры <span class="mono" id="filterCount"></span></button>
      </div>
      <div class="cat__layout">
        <aside class="filters" id="filters" aria-label="Фильтры">${filtersHtml(state)}</aside>
        <div class="cat__results">
          <div class="chips" id="catChips"></div>
          <div id="catResults"></div>
        </div>
      </div>
    </section>`;
  };

  const activeCount = s => s.genre.length + s.artist.length + s.cond.length + s.format.length + (s.min !== '' || s.max !== '' ? 1 : 0) + (s.stock ? 1 : 0);

  let root;
  const update = ({ syncForm = false, keepShown = false } = {}) => {
    if (!keepShown) shown = PAGE;
    const list = apply(state);
    N.router.replaceQuery(toQuery(state));
    qs('#catResults', root).innerHTML = resultsHtml(list);
    qs('#catChips', root).innerHTML = chipsHtml(state);
    qs('#catCount', root).textContent = records(list.length);
    const n = activeCount(state);
    qs('#filterCount', root).textContent = n ? `(${n})` : '';
    const apply_ = qs('[data-apply]', root); if (apply_) apply_.textContent = `Показать ${list.length}`;
    const h = headTitle(state);
    const tEl = qs('#catTitle', root); if (tEl.dataset.t !== h.t) { tEl.dataset.t = h.t; tEl.textContent = h.t; } qs('#catSub', root).innerHTML = h.sub;
    qsa('.genre-tabs a', root).forEach(a => {
      const g = new URLSearchParams(a.getAttribute('href').split('?')[1] || '').get('genre');
      a.classList.toggle('is-active', g ? state.genre.length === 1 && state.genre[0] === g : !state.genre.length);
    });
    if (syncForm) { qs('#filters', root).innerHTML = filtersHtml(state); bindForm(); }
    N.ui.observeReveals(qs('#catResults', root));
  };

  const readForm = form => {
    const fd = new FormData(form);
    state.genre = fd.getAll('genre'); state.artist = fd.getAll('artist');
    state.cond = fd.getAll('cond'); state.format = fd.getAll('format');
    state.min = fd.get('min') ? +fd.get('min') : ''; state.max = fd.get('max') ? +fd.get('max') : '';
    if (state.min !== '' && state.max !== '' && state.min > state.max) [state.min, state.max] = [state.max, state.min];
    state.stock = fd.get('stock') === 'on';
  };

  const bindForm = () => {
    const form = qs('#filterForm', root);
    form.addEventListener('change', e => { if (e.target.matches('[data-artist-filter],[data-range]')) return; readForm(form); update(); });
    form.addEventListener('submit', e => e.preventDefault());
    const af = qs('[data-artist-filter]', form);
    af.addEventListener('input', () => { const v = norm(af.value); qsa('[data-artist-name]', form).forEach(el => { el.hidden = v && !el.dataset.artistName.includes(v); }); });
    // dual range ↔ number inputs
    const dual = qs('.dual', form), [rmin, rmax] = qsa('[data-range]', form);
    const syncRange = debounce(() => { readForm(form); update(); }, 180);
    const onRange = e => {
      let a = +rmin.value, b = +rmax.value;
      if (a > b) { if (e.target === rmin) rmin.value = a = b; else rmax.value = b = a; }
      form.min.value = a > PMIN ? a : ''; form.max.value = b < PMAX ? b : '';
      dual.style.setProperty('--a', (a - PMIN) / (PMAX - PMIN)); dual.style.setProperty('--b', (b - PMIN) / (PMAX - PMIN));
      syncRange();
    };
    rmin.addEventListener('input', onRange); rmax.addEventListener('input', onRange);
  };

  const mount = el => {
    root = el;
    bindForm();
    const search = qs('#catSearch', el);
    search.addEventListener('input', debounce(() => { state.q = search.value.trim(); update(); }, 160));
    qs('#catSort', el).addEventListener('change', e => { state.sort = e.target.value; update({ keepShown: true }); });
    update();
    return () => { document.documentElement.classList.remove('is-locked'); document.body.classList.remove('filters-open'); root = null; };
  };

  const toggleFilters = on => {
    const f = qs('#filters', root);
    f.classList.toggle('is-open', on);
    document.documentElement.classList.toggle('is-locked', on);
    document.body.classList.toggle('filters-open', on);
  };

  const onAction = (action, el) => {
    switch (action) {
      case 'view': storage.set('nocturne:view', el.dataset.v); qsa('[data-action="view"]', root).forEach(b => b.setAttribute('aria-pressed', b.dataset.v === el.dataset.v)); update({ keepShown: true }); break;
      case 'more': shown += PAGE; update({ keepShown: true }); break;
      case 'open-filters': toggleFilters(true); break;
      case 'close-filters': toggleFilters(false); break;
      case 'reset-filters': state = fromQuery({ sort: state.sort }); qs('#catSearch', root).value = ''; update({ syncForm: true }); break;
      case 'remove-chip': {
        const { k, v } = el.dataset;
        if (k === 'q') { state.q = ''; qs('#catSearch', root).value = ''; }
        else if (k === 'price') { state.min = ''; state.max = ''; }
        else if (k === 'stock') state.stock = false;
        else state[k] = state[k].filter(x => x !== v);
        update({ syncForm: true });
      }
    }
  };

  const onStore = type => { if (root && (type === 'order' || type === 'sync')) update({ keepShown: true }); };

  return { id: 'catalog', nav: 'catalog', title: (p, q) => q.genre && D.genreById[q.genre] ? D.genreById[q.genre].name : 'Каталог', render, mount, onAction, onStore };
})();
