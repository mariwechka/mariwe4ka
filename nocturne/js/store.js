/* NOCTURNE — persistent client state (cart, favourites, orders) with pub/sub */
N.store = (() => {
  const KEY = 'nocturne:state:v1';
  const { storage } = N.utils;
  const initial = { cart: [], favs: [], sold: {}, orders: [], subscribed: null };
  let state = Object.assign({}, initial, storage.get(KEY, {}));
  // drop stale ids (data may change between versions)
  state.cart = state.cart.filter(i => N.data.byId[i.id]);
  state.favs = state.favs.filter(id => N.data.byId[id]);

  const subs = new Set();
  const commit = (type, payload) => { storage.set(KEY, state); subs.forEach(fn => fn(type, payload)); };
  const subscribe = fn => { subs.add(fn); return () => subs.delete(fn); };

  // keep tabs in sync
  window.addEventListener('storage', e => { if (e.key === KEY) { state = Object.assign({}, initial, storage.get(KEY, {})); subs.forEach(fn => fn('sync')); } });

  const available = id => Math.max(0, (N.data.byId[id]?.stock || 0) - (state.sold[id] || 0));
  const inCart = id => state.cart.find(i => i.id === id)?.qty || 0;

  /** add to cart; returns {ok, qty, reason} */
  const add = (id, qty = 1) => {
    const max = available(id);
    if (!max) return { ok: false, reason: 'soldout' };
    const line = state.cart.find(i => i.id === id);
    const current = line ? line.qty : 0;
    const next = Math.min(max, current + qty);
    if (next === current) return { ok: false, reason: 'limit', qty: current };
    if (line) line.qty = next; else state.cart.unshift({ id, qty: next });
    commit('cart:add', { id, qty: next });
    return { ok: true, qty: next, capped: next < current + qty };
  };
  const setQty = (id, qty) => {
    const line = state.cart.find(i => i.id === id);
    if (!line) return;
    qty = Math.max(0, Math.min(available(id), qty));
    if (!qty) return remove(id);
    line.qty = qty;
    commit('cart:qty', { id, qty });
  };
  const remove = id => { state.cart = state.cart.filter(i => i.id !== id); commit('cart:remove', { id }); };
  const clearCart = () => { state.cart = []; commit('cart:clear'); };

  const cartLines = () => state.cart.map(i => ({ ...i, product: N.data.byId[i.id] })).filter(l => l.product);
  const cartCount = () => state.cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => cartLines().reduce((s, l) => s + l.qty * l.product.price, 0);

  const FREE_SHIPPING = 7000;
  const shippingOptions = [
    { id: 'courier', name: 'Курьер по городу', note: '1–2 дня, в мягкой коробке с уголками', price: 490 },
    { id: 'pickup-point', name: 'Пункт выдачи', note: '2–5 дней, по всей России', price: 290 },
    { id: 'store', name: 'Самовывоз из магазина', note: 'Лиговский пр., 74 — в тот же день', price: 0 }
  ];
  const shippingPrice = optId => {
    const opt = shippingOptions.find(o => o.id === optId) || shippingOptions[0];
    if (!opt.price) return 0;
    return subtotal() >= FREE_SHIPPING ? 0 : opt.price;
  };

  const isFav = id => state.favs.includes(id);
  const toggleFav = id => {
    const on = !isFav(id);
    state.favs = on ? [id, ...state.favs] : state.favs.filter(x => x !== id);
    commit('fav', { id, on });
    return on;
  };
  const favs = () => state.favs.map(id => N.data.byId[id]).filter(Boolean);

  const placeOrder = details => {
    const lines = cartLines();
    if (!lines.length) return null;
    const ship = shippingPrice(details.shipping);
    const order = {
      no: 'NCT-' + String(Date.now()).slice(-6),
      date: new Date().toISOString(),
      lines: lines.map(l => ({ id: l.id, qty: l.qty, price: l.product.price })),
      subtotal: subtotal(), shipping: ship, total: subtotal() + ship,
      name: details.name, email: details.email, shippingMethod: details.shipping
    };
    lines.forEach(l => { state.sold[l.id] = (state.sold[l.id] || 0) + l.qty; });
    state.orders.unshift(order);
    state.cart = [];
    commit('order', order);
    return order;
  };
  const lastOrder = no => state.orders.find(o => o.no === no);

  const subscribeNewsletter = email => { state.subscribed = email; commit('newsletter', email); };
  const subscribedEmail = () => state.subscribed;

  return { subscribe, available, inCart, add, setQty, remove, clearCart, cartLines, cartCount, subtotal, FREE_SHIPPING, shippingOptions, shippingPrice, isFav, toggleFav, favs, placeOrder, lastOrder, subscribeNewsletter, subscribedEmail };
})();
