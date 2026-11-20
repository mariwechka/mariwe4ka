/* NOCTURNE — bootstrap & global event delegation */
(() => {
  const { qs } = N.utils;
  const S = N.store, UI = N.ui, R = N.router, D = N.data;

  // routes
  R.add('/', N.pages.home);
  R.add('/catalog', N.pages.catalog);
  R.add('/new', N.pages.newArrivals);
  R.add('/collections', N.pages.collections);
  R.add('/collection/:id', N.pages.collection);
  R.add('/release/:id', N.pages.product);
  R.add('/about', N.pages.about);
  R.add('/cart', N.pages.cart);
  R.add('/checkout', N.pages.checkout);
  R.add('/order/:no', N.pages.order);
  R.add('/favorites', N.pages.favorites);

  // store → UI
  S.subscribe((type, payload) => {
    UI.updateBadges(type.startsWith('cart:add') ? 'cart' : type === 'fav' ? 'fav' : null);
    UI.syncFavButtons();
    if (UI.openLayer === 'cart' || type.startsWith('cart') || type === 'order' || type === 'sync') UI.renderCartDrawer();
    const cur = R.current;
    if (cur?.page.onStore) cur.page.onStore(type, payload, qs('#main'));
  });

  // delegated actions
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el) {
      // close menu when a nav link inside it is followed
      if (e.target.closest('#mobileMenu a')) UI.toggleMenu(false);
      if (e.target === qs('#scrim')) UI.closeCart();
      return;
    }
    const id = el.dataset.id;
    const p = id && D.byId[id];
    switch (el.dataset.action) {
      case 'add-to-cart': {
        e.preventDefault();
        const qtyEl = el.closest('[data-buy]')?.querySelector('[data-buy-qty]');
        const n = qtyEl ? +qtyEl.value || 1 : 1;
        const res = S.add(id, n);
        if (res.ok) {
          UI.flyToCart(el);
          UI.toast(`<span class="toast__cover">${N.c.sleeve(p, { vinyl: false, label: false })}</span><span><b>${N.utils.esc(p.title)}</b> в корзине${res.capped ? ' (доступный максимум)' : ''}</span><button class="link-u" data-action="open-cart">Открыть</button>`);
        } else if (res.reason === 'limit') UI.toast(`Больше экземпляров «${N.utils.esc(p.title)}» нет — все ${res.qty} уже в корзине.`, { tone: 'toast--warn' });
        else UI.toast('Эта пластинка уже продана.', { tone: 'toast--warn' });
        break;
      }
      case 'toggle-fav': {
        e.preventDefault();
        const on = S.toggleFav(id);
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
        UI.toast(on ? `«${N.utils.esc(p.title)}» — в избранном. <a class="link-u" href="#/favorites">Смотреть</a>` : `Убрано из избранного`, { timeout: 2400 });
        break;
      }
      case 'remove-from-cart': S.remove(id); break;
      case 'qty-inc': S.setQty(id, S.inCart(id) + 1); break;
      case 'qty-dec': S.setQty(id, S.inCart(id) - 1); break;
      case 'open-cart': e.preventDefault(); UI.openCart(); break;
      case 'close-cart': UI.closeCart(); break;
      case 'open-search': UI.openSearch(); break;
      case 'close-search': UI.closeSearch(); break;
      case 'search-fill': { const i = qs('#searchInput'); i.value = el.dataset.q; UI.runSearch(i.value); i.focus(); break; }
      case 'toggle-menu': UI.toggleMenu(); break;
      case 'rail-prev': UI.railStep(el, -1); break;
      case 'rail-next': UI.railStep(el, 1); break;
      case 'to-top': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      default: {
        const cur = R.current;
        if (cur?.page.onAction) cur.page.onAction(el.dataset.action, el, e);
      }
    }
  });

  // search input
  const sInput = qs('#searchInput');
  sInput.addEventListener('input', () => UI.runSearch(sInput.value));
  sInput.addEventListener('keydown', e => {
    const items = [...document.querySelectorAll('#searchResults .sr-item')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      UI.searchSel = (UI.searchSel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle('is-sel', i === UI.searchSel));
      items[UI.searchSel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (UI.searchSel >= 0 && items[UI.searchSel]) location.hash = items[UI.searchSel].getAttribute('href');
      else if (sInput.value.trim()) R.go('#/catalog?q=' + encodeURIComponent(sInput.value.trim()));
    }
  });
  qs('#search').addEventListener('click', e => { if (e.target.id === 'search' || e.target.classList.contains('search__inner')) UI.closeSearch(); if (e.target.closest('#searchResults a')) UI.closeSearch(); });

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') UI.closeAll();
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (e.key === '/' && !typing) { e.preventDefault(); UI.openSearch(); }
    // focus trap for drawer
    if (e.key === 'Tab' && UI.openLayer === 'cart') {
      const f = [...qs('#cartDrawer').querySelectorAll('a,button:not([disabled]),input')];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  UI.renderFooter();
  UI.initHeader();
  UI.updateBadges();
  R.start();
  UI.observeReveals(qs('#siteFooter'));
})();
