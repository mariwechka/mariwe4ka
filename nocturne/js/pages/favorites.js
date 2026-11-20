/* NOCTURNE — favourites */
N.pages.favorites = (() => {
  const { qs, records, price } = N.utils;
  const C = N.c, S = N.store;
  const body = () => {
    const list = S.favs();
    if (!list.length) return C.empty({ title: 'Здесь пока тихо', text: 'Нажимайте ♡ на обложках — избранные пластинки сохранятся здесь, даже если вы закроете вкладку.', cta: 'Найти что-нибудь' });
    const avail = list.filter(p => S.available(p.id) > S.inCart(p.id));
    return `<div class="favbar"><p class="mono">${records(list.length)} · ${price(list.reduce((s, p) => s + p.price, 0))}</p>
      <div class="favbar__a">${avail.length ? `<button class="btn btn--sm" data-action="fav-all-to-cart">${C.icon.bag}<span>Всё доступное в корзину (${avail.length})</span></button>` : ''}<button class="link-u mono" data-action="fav-clear">Очистить</button></div></div>
      <div class="grid grid--4">${list.map((p, i) => `<div class="favitem">${C.card(p, i)}<button class="favitem__rm mono" data-action="toggle-fav" data-id="${p.id}">Удалить ✕</button></div>`).join('')}</div>`;
  };
  const render = () => `<section class="favpage">
    <header class="page-head"><p class="mono muted">NOCTURNE / Избранное</p><h1 class="page-title">Избранное</h1><p class="page-lead serif">Ваша личная полка. Сохраняется в этом браузере.</p></header>
    <div id="favBody">${body()}</div></section>`;
  const onStore = (type, payload, root) => { if (type === 'fav' || type === 'sync' || type.startsWith('cart') || type === 'order') { qs('#favBody', root).innerHTML = body(); N.ui.observeReveals(root); } };
  const onAction = action => {
    if (action === 'fav-all-to-cart') { const items = S.favs().filter(p => S.available(p.id) > S.inCart(p.id)); items.forEach(p => S.add(p.id, 1)); N.ui.toast(`В корзину добавлено: ${records(items.length)}`); N.ui.openCart(); }
    if (action === 'fav-clear' && confirm('Очистить избранное?')) S.favs().forEach(p => S.toggleFav(p.id));
  };
  return { id: 'favorites', nav: 'favorites', title: 'Избранное', render, onStore, onAction };
})();
