/* NOCTURNE — tiny hash router with page transitions */
N.router = (() => {
  const { parseQuery, reducedMotion } = N.utils;
  const routes = [];
  let current = null, cleanup = null, first = true;

  const add = (pattern, page) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
    routes.push({ re, keys, page });
  };

  const parse = () => {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [pathAndQuery, anchor] = raw.split('#');
    const [path, qstr] = pathAndQuery.split('?');
    return { path: path || '/', query: parseQuery(qstr), anchor };
  };

  const match = path => {
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) return { page: r.page, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
    }
    return { page: N.pages.notFound, params: {} };
  };

  const render = () => {
    const { path, query, anchor } = parse();
    const { page, params } = match(path);
    const main = document.getElementById('main');
    N.ui.closeAll();

    const swap = () => {
      if (typeof cleanup === 'function') cleanup();
      cleanup = null;
      current = { page, params, query, path };
      const title = typeof page.title === 'function' ? page.title(params, query) : page.title;
      document.title = title ? `${title} — NOCTURNE` : 'NOCTURNE — виниловые пластинки';
      main.innerHTML = page.render(params, query);
      document.body.dataset.page = page.id || 'page';
      N.ui.setActiveNav(page.nav || page.id);
      N.fx.split(main);
      cleanup = page.mount ? page.mount(main, params, query) : null;
      N.ui.observeReveals(main);
      N.ui.initRails(main);
      if (anchor) { const t = document.getElementById(anchor); if (t) setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), 80); }
      else window.scrollTo(0, 0);
      main.classList.remove('is-leaving');
      main.classList.add('is-entering');
      setTimeout(() => main.classList.remove('is-entering'), 700);
      if (!first) main.focus({ preventScroll: true });
      first = false;
    };

    const samePage = current && current.page === page && page !== N.pages.product;
    if (first || reducedMotion()) swap();
    else if (samePage) { main.classList.add('is-leaving'); setTimeout(swap, 180); }
    else curtain(typeof page.title === 'function' ? page.title(params, query) : page.title, swap);
  };

  /** Full-screen wipe between different pages */
  let busy = null;
  const curtain = (label, swap) => {
    const c = document.getElementById('curtain');
    c.querySelector('[data-curtain-label]').textContent = label || 'NOCTURNE';
    clearTimeout(busy);
    c.classList.remove('is-out'); c.classList.add('is-in');
    busy = setTimeout(() => {
      swap();
      c.classList.add('is-out');
      busy = setTimeout(() => c.classList.remove('is-in', 'is-out'), 650);
    }, 420);
  };

  /** Replace query without re-rendering (used by catalog filters) */
  const replaceQuery = qstr => {
    const { path } = parse();
    history.replaceState(null, '', '#' + path + qstr);
    if (current) current.query = parseQuery(qstr.slice(1));
  };

  const start = () => { window.addEventListener('hashchange', render); render(); };
  const go = hash => { if (location.hash === hash) render(); else location.hash = hash; };

  return { add, start, go, replaceQuery, get current() { return current; } };
})();
