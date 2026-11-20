/* NOCTURNE — reusable view components (return HTML strings) */
N.c = (() => {
  const { esc, price, pad, records } = N.utils;
  const { cover } = N;
  const D = N.data;

  const icon = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
    arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5M11 6l-6 6 6 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17l9-10"/></svg>'
  };

  const disc = (p, cls = '') => `<span class="disc ${cls}" style="${cover.labelVars(p)}" aria-hidden="true"><span class="disc__label"><i></i></span></span>`;

  /** Sleeve + vinyl that slides out on hover */
  const sleeve = (p, { vinyl = true, cls = '', label = true } = {}) =>
    `<span class="sleeve ${cls}">${vinyl ? disc(p) : ''}<span class="sleeve__art">${cover.svg(p, { label })}</span></span>`;

  const favBtn = (p, cls = '') => {
    const on = N.store.isFav(p.id);
    return `<button class="fav-btn ${cls}" data-action="toggle-fav" data-id="${p.id}" data-fav-id="${p.id}" aria-pressed="${on}" aria-label="${on ? 'Убрать из избранного' : 'В избранное'}: ${esc(p.title)}">${icon.heart}</button>`;
  };

  const availability = p => {
    const n = N.store.available(p.id);
    if (!n) return `<span class="avail avail--out">Нет в наличии</span>`;
    if (n === 1) return `<span class="avail avail--last">Последний экземпляр</span>`;
    return `<span class="avail">В наличии · ${n} шт.</span>`;
  };

  const addBtn = (p, { label = 'В корзину', cls = '' } = {}) => {
    const n = N.store.available(p.id);
    if (!n) return `<button class="btn btn--ghost ${cls}" disabled>Продано</button>`;
    return `<button class="btn ${cls}" data-action="add-to-cart" data-id="${p.id}">${icon.bag}<span>${label}</span></button>`;
  };

  const cond = code => `<abbr class="cond" title="${esc(D.conditions[code].name + ' — ' + D.conditions[code].text)}">${esc(code)}</abbr>`;

  const isNew = p => (Date.parse('2026-11-20') - Date.parse(p.added)) / 864e5 <= 14;

  /** Editorial product card */
  const card = (p, i = 0, { size = '', showIndex = true } = {}) => {
    const out = !N.store.available(p.id);
    return `<article class="card ${size} ${out ? 'is-out' : ''}" data-reveal style="--i:${i % 8}">
      <a class="card__media" href="#/release/${p.id}" aria-label="${esc(p.artistName)} — ${esc(p.title)}">
        ${sleeve(p)}
        ${isNew(p) ? '<span class="tag tag--new">New</span>' : ''}
        ${out ? '<span class="tag tag--out">Sold out</span>' : ''}
      </a>
      <div class="card__actions">${favBtn(p)}${out ? '' : `<button class="quick-add" data-action="add-to-cart" data-id="${p.id}" aria-label="Добавить в корзину: ${esc(p.title)}">${icon.plus}</button>`}</div>
      <div class="card__body">
        ${showIndex ? `<span class="card__index mono">${pad(i + 1)}</span>` : ''}
        <h3 class="card__title"><a href="#/release/${p.id}">${esc(p.title)}</a></h3>
        <p class="card__artist">${esc(p.artistName)}</p>
        <p class="card__meta mono"><span>${esc(p.format)}</span><span>${p.year}</span><span>${cond(p.media)}</span><b>${price(p.price)}</b></p>
      </div>
    </article>`;
  };

  /** Ledger row (list view) */
  const row = (p, i = 0) => {
    const n = N.store.available(p.id);
    return `<article class="row ${n ? '' : 'is-out'}" data-reveal style="--i:${i % 8}">
      <span class="row__no mono">${pad(i + 1, 3)}</span>
      <a class="row__cover" href="#/release/${p.id}" tabindex="-1" aria-hidden="true">${sleeve(p, { vinyl: false, label: false })}</a>
      <div class="row__main"><a class="row__title" href="#/release/${p.id}">${esc(p.title)}</a><span class="row__artist">${esc(p.artistName)}</span></div>
      <span class="row__cell mono">${esc(p.genreName)}</span>
      <span class="row__cell mono">${p.year}</span>
      <span class="row__cell mono">${esc(p.format)} · ${cond(p.media)}/${cond(p.sleeve)}</span>
      <b class="row__price">${price(p.price)}</b>
      <div class="row__actions">${favBtn(p)}${n ? `<button class="quick-add" data-action="add-to-cart" data-id="${p.id}" aria-label="В корзину: ${esc(p.title)}">${icon.plus}</button>` : '<span class="mono muted">sold</span>'}</div>
    </article>`;
  };

  const sectionHead = (no, title, { link, linkText = 'Смотреть все', sub = '' } = {}) => `
    <header class="sec-head" data-reveal>
      <span class="sec-head__no mono">${no}</span>
      <h2 class="sec-head__title">${title}</h2>
      ${sub ? `<p class="sec-head__sub">${sub}</p>` : ''}
      ${link ? `<a class="link-arrow" href="${link}">${linkText} ${icon.arrow}</a>` : ''}
    </header>`;

  const rail = (items, { id = '' } = {}) => `
    <div class="rail" ${id ? `id="${id}"` : ''}>
      <div class="rail__track" data-rail>${items.map((p, i) => card(p, i)).join('')}</div>
      <div class="rail__nav">
        <button class="icon-btn icon-btn--line" data-action="rail-prev" aria-label="Назад">${icon.arrowL}</button>
        <div class="rail__progress"><i></i></div>
        <button class="icon-btn icon-btn--line" data-action="rail-next" aria-label="Вперёд">${icon.arrow}</button>
      </div>
    </div>`;

  const qty = (id, q, max) => `
    <div class="qty" role="group" aria-label="Количество">
      <button data-action="qty-dec" data-id="${id}" aria-label="Меньше" ${q <= 1 ? 'data-remove="1"' : ''}>${icon.minus}</button>
      <output aria-live="polite">${q}</output>
      <button data-action="qty-inc" data-id="${id}" aria-label="Больше" ${q >= max ? 'disabled' : ''}>${icon.plus}</button>
    </div>`;

  const empty = ({ title, text, cta = 'В каталог', href = '#/catalog' }) => `
    <div class="empty" data-reveal>
      <div class="empty__disc" aria-hidden="true"><span class="disc disc--spin"><span class="disc__label"><i></i></span></span></div>
      <h2 class="empty__title">${title}</h2>
      <p class="empty__text">${text}</p>
      <a class="btn" href="${href}">${cta}</a>
    </div>`;

  const marquee = (items, { cls = '' } = {}) => {
    const inner = items.map(t => `<span>${t}</span><i aria-hidden="true">✺</i>`).join('');
    return `<div class="marquee ${cls}" aria-hidden="true"><div class="marquee__track">${inner}${inner}</div></div>`;
  };

  const cartLine = (l, { compact = false } = {}) => {
    const p = l.product, max = N.store.available(p.id);
    return `<li class="line ${compact ? 'line--compact' : ''}" data-line="${p.id}">
      <a class="line__cover" href="#/release/${p.id}">${sleeve(p, { vinyl: false, label: false })}</a>
      <div class="line__info">
        <a class="line__title" href="#/release/${p.id}">${esc(p.title)}</a>
        <span class="line__artist">${esc(p.artistName)}</span>
        <span class="line__meta mono">${esc(p.format)} · ${p.year} · ${cond(p.media)}</span>
      </div>
      <div class="line__qty">${qty(p.id, l.qty, max)}${l.qty >= max ? `<small class="mono muted">макс. ${max}</small>` : ''}</div>
      <b class="line__price">${price(p.price * l.qty)}</b>
      <button class="line__remove" data-action="remove-from-cart" data-id="${p.id}" aria-label="Удалить ${esc(p.title)}">${icon.close}</button>
    </li>`;
  };

  const shippingMeter = () => {
    const sub = N.store.subtotal(), free = N.store.FREE_SHIPPING;
    const pct = Math.min(100, sub / free * 100);
    const left = free - sub;
    return `<div class="ship-meter"><p class="mono">${left > 0 ? `До бесплатной доставки — ${price(left)}` : 'Доставка бесплатно ✓'}</p><div class="ship-meter__bar"><i style="width:${pct}%"></i></div></div>`;
  };

  return { icon, disc, sleeve, favBtn, availability, addBtn, cond, card, row, sectionHead, rail, qty, empty, marquee, cartLine, shippingMeter, isNew, records };
})();
