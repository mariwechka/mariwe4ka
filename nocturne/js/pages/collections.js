/* NOCTURNE — collections index & single collection */
N.pages.collections = (() => {
  const { esc, records } = N.utils;
  const D = N.data, C = N.c;
  const items = c => D.products.filter(p => p.collections.includes(c.id));

  const render = () => `<section class="colpage">
    <header class="page-head">
      <p class="mono muted" data-reveal>NOCTURNE / Коллекции</p>
      <h1 class="page-title" data-reveal>Коллекции</h1>
      <p class="page-lead serif" data-reveal>Не жанры, а настроения. Подборки, которые наши кураторы собирают вручную — как плейлисты, только на виниле.</p>
    </header>
    <ol class="cols">
      ${D.collections.map((c, i) => { const it = items(c); return `<li class="colrow" data-reveal style="--col:${c.color};--col-accent:${c.accent};--i:${i}">
        <a href="#/collection/${c.id}" class="colrow__link">
          <span class="colrow__no mono">${c.no}</span>
          <span class="colrow__name">${esc(c.name)}</span>
          <span class="colrow__tag serif">${esc(c.tagline)}</span>
          <span class="colrow__meta mono">${records(it.length)} · ${esc(c.curator)}</span>
          <span class="colrow__fan" aria-hidden="true">${it.slice(0, 4).map((p, k) => `<span style="--k:${k}">${C.sleeve(p, { vinyl: false, label: false })}</span>`).join('')}</span>
        </a></li>`; }).join('')}
    </ol>
  </section>`;

  return { id: 'collections', nav: 'collections', title: 'Коллекции', render };
})();

N.pages.collection = (() => {
  const { esc, price, records, pad, qs } = N.utils;
  const D = N.data, C = N.c, S = N.store;
  let col;

  const render = ({ id }) => {
    col = D.collectionById[id];
    if (!col) return N.pages.notFound.render();
    const it = D.products.filter(p => p.collections.includes(col.id));
    const total = it.filter(p => S.available(p.id)).reduce((s, p) => s + p.price, 0);
    const idx = D.collections.indexOf(col), next = D.collections[(idx + 1) % D.collections.length];
    return `<section class="colhero" style="--col:${col.color};--col-accent:${col.accent}">
        <div class="colhero__inner">
          <p class="mono" data-reveal><a class="link-u" href="#/collections">Коллекции</a> / ${col.no}</p>
          <h1 class="colhero__title" data-reveal>${esc(col.name)}</h1>
          <p class="colhero__tag serif" data-reveal>${esc(col.tagline)}</p>
          <div class="colhero__row" data-reveal>
            <p class="colhero__text">${esc(col.text)}</p>
            <div class="colhero__side mono">
              <p>Куратор<br><b>${esc(col.curator)}</b></p>
              <p>В подборке<br><b>${records(it.length)}</b></p>
              <button class="btn btn--paper" data-action="add-collection" ${total ? '' : 'disabled'}>${C.icon.bag}<span>Вся коллекция · ${price(total)}</span></button>
            </div>
          </div>
        </div>
        <div class="colhero__disc" aria-hidden="true"><span class="disc disc--spin disc--xl" style="--label-bg:${col.accent};--label-fg:${col.color}"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span></div>
      </section>
      <section class="sec colitems">
        ${it.map((p, i) => `<article class="colitem ${i % 2 ? 'colitem--alt' : ''}" data-reveal>
          <span class="colitem__no serif">${pad(i + 1)}</span>
          <a class="colitem__media" href="#/release/${p.id}">${C.sleeve(p)}</a>
          <div class="colitem__text">
            <p class="mono muted">${esc(p.genreName)} · ${p.year} · ${esc(p.label)}</p>
            <h2 class="colitem__title"><a href="#/release/${p.id}">${esc(p.title)}</a></h2>
            <p class="colitem__artist">${esc(p.artistName)}</p>
            <p class="colitem__desc">${esc(p.desc)}</p>
            <div class="colitem__buy"><b class="price-lg">${price(p.price)}</b>${C.availability(p)}</div>
            <div class="colitem__actions">${C.addBtn(p)}${C.favBtn(p, 'fav-btn--line')}</div>
          </div>
        </article>`).join('')}
      </section>
      <a class="nextcol" href="#/collection/${next.id}" style="--col:${next.color};--col-accent:${next.accent}">
        <span class="mono">Следующая коллекция · ${next.no}</span><b>${esc(next.name)}</b>${C.icon.arrow}
      </a>`;
  };

  const onAction = (action) => {
    if (action !== 'add-collection') return;
    const it = D.products.filter(p => p.collections.includes(col.id) && S.available(p.id) > S.inCart(p.id));
    if (!it.length) return N.ui.toast('Все доступные пластинки коллекции уже в корзине', { tone: 'toast--warn' });
    it.forEach(p => S.add(p.id, 1));
    N.ui.toast(`Добавлено ${records(it.length)} из «${esc(col.name)}»`);
    N.ui.openCart();
  };

  const onStore = (type, payload, root) => {
    if (type === 'order') { const r = N.router.current; if (r) root.innerHTML = render(r.params); N.ui.observeReveals(root); }
  };

  return { id: 'collection', nav: 'collections', title: ({ id }) => D.collectionById[id]?.name || 'Коллекция', render, onAction, onStore };
})();
