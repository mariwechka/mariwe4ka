/* NOCTURNE — new arrivals, grouped like a shipping log */
N.pages.newArrivals = (() => {
  const { esc, price, records, formatDate } = N.utils;
  const D = N.data, C = N.c;
  const TODAY = Date.parse('2026-11-20');

  const groups = () => {
    const sorted = [...D.products].sort((a, b) => b.added.localeCompare(a.added));
    const g = [
      { key: 'week', title: 'На этой неделе', sub: 'Коробки, разобранные за последние семь дней', items: [] },
      { key: 'month', title: 'В этом месяце', sub: 'Ноябрьские поступления', items: [] },
      { key: 'autumn', title: 'Этой осенью', sub: 'Сентябрь и октябрь', items: [] },
      { key: 'earlier', title: 'Ранее', sub: 'Всё ещё ждут своего слушателя', items: [] }
    ];
    sorted.forEach(p => {
      const days = (TODAY - Date.parse(p.added)) / 864e5;
      const target = days <= 7 ? g[0] : p.added >= '2026-11-01' ? g[1] : p.added >= '2026-09-01' ? g[2] : g[3];
      target.items.push(p);
    });
    return g.filter(x => x.items.length);
  };

  const render = () => {
    const gs = groups();
    const top = gs[0].items[0];
    return `<section class="newpage">
      <header class="page-head">
        <p class="mono muted" data-reveal>NOCTURNE / Новинки</p>
        <h1 class="page-title" data-reveal>Новинки<sup class="mono">${gs[0].items.length}</sup></h1>
        <p class="page-lead serif" data-reveal>Каждую пятницу мы открываем новые коробки. Здесь — журнал поступлений: что приехало, откуда и когда.</p>
      </header>
      <a class="newpage__lead" href="#/release/${top.id}" data-reveal>
        <span class="newpage__lead-media">${C.sleeve(top)}</span>
        <span class="newpage__lead-text">
          <span class="mono">Самое свежее · ${formatDate(top.added)}</span>
          <b>${esc(top.title)}</b><span class="serif">${esc(top.artistName)}</span>
          <span class="mono">${esc(top.genreName)} · ${esc(top.format)} · ${price(top.price)}</span>
        </span>
      </a>
      ${gs.map((g, gi) => `<section class="log">
        <header class="log__head" data-reveal><span class="mono">${String(gi + 1).padStart(2, '0')}</span><h2>${g.title}</h2><p class="muted">${g.sub} · ${records(g.items.length)}</p></header>
        <div class="grid grid--4">${g.items.map((p, i) => `<div class="log__item">${C.card(p, i)}<span class="log__date mono">${formatDate(p.added)}</span></div>`).join('')}</div>
      </section>`).join('')}
    </section>`;
  };

  return { id: 'new', nav: 'new', title: 'Новинки', render };
})();
