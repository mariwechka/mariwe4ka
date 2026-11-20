/* NOCTURNE — cart, checkout, order confirmation */
N.pages.cart = (() => {
  const { price, records, qs } = N.utils;
  const C = N.c, S = N.store;

  const body = () => {
    const lines = S.cartLines();
    if (!lines.length) return C.empty({ title: 'Корзина пуста', text: 'Проигрыватель ждёт. Загляните в новинки или коллекции — там точно найдётся что-то для этого вечера.', cta: 'Перейти в каталог' });
    return `<div class="cartpage__grid">
      <div>
        ${C.shippingMeter()}
        <ul class="lines lines--page">${lines.map(l => C.cartLine(l)).join('')}</ul>
        <div class="cartpage__under"><a class="link-arrow" href="#/catalog">${C.icon.arrowL} Продолжить покупки</a><button class="link-u mono" data-action="clear-cart">Очистить корзину</button></div>
      </div>
      <aside class="summary">
        <p class="mono muted">Ваш заказ</p>
        <div class="sum-row"><span>${records(S.cartCount())}</span><span>${price(S.subtotal())}</span></div>
        <div class="sum-row muted"><span>Доставка</span><span>${S.subtotal() >= S.FREE_SHIPPING ? 'Бесплатно' : 'от 290 ₽'}</span></div>
        <div class="sum-row sum-row--total"><span>Итого</span><b>${price(S.subtotal())}</b></div>
        <a class="btn btn--accent btn--block" href="#/checkout">Оформить заказ ${C.icon.arrow}</a>
        <p class="mono small muted">Резерв пластинок — 30 минут после перехода к оформлению.</p>
      </aside>
    </div>`;
  };

  const render = () => `<section class="cartpage">
    <header class="page-head page-head--sm"><p class="mono muted">NOCTURNE / Корзина</p><h1 class="page-title">Корзина<sup class="mono" id="cartSup">${S.cartCount() || ''}</sup></h1></header>
    <div id="cartBody">${body()}</div></section>`;

  const onStore = (type, payload, root) => {
    qs('#cartBody', root).innerHTML = body();
    qs('#cartSup', root).textContent = S.cartCount() || '';
    N.ui.observeReveals(root);
  };
  const onAction = action => {
    if (action === 'clear-cart' && confirm('Удалить все пластинки из корзины?')) S.clearCart();
  };
  return { id: 'cart', nav: 'cart', title: 'Корзина', render, onStore, onAction };
})();

N.pages.checkout = (() => {
  const { price, esc, qs, qsa } = N.utils;
  const C = N.c, S = N.store;
  let ship = 'courier', root;

  const summary = () => {
    const sp = S.shippingPrice(ship);
    return `<p class="mono muted">Ваш заказ</p>
      <ul class="mini-lines">${S.cartLines().map(l => `<li><span class="mini-lines__c">${C.sleeve(l.product, { vinyl: false, label: false })}<i>${l.qty}</i></span><span><b>${esc(l.product.title)}</b><small>${esc(l.product.artistName)}</small></span><span class="mono">${price(l.qty * l.product.price)}</span></li>`).join('')}</ul>
      <div class="sum-row"><span>Пластинки</span><span>${price(S.subtotal())}</span></div>
      <div class="sum-row"><span>Доставка</span><span>${sp ? price(sp) : 'Бесплатно'}</span></div>
      <div class="sum-row sum-row--total"><span>К оплате</span><b>${price(S.subtotal() + sp)}</b></div>
      <a class="link-u mono small" href="#/cart">Изменить корзину</a>`;
  };

  const field = (name, label, { type = 'text', ac = '', ph = '', full = false } = {}) =>
    `<label class="field ${full ? 'field--full' : ''}"><span class="field__l">${label}</span><input class="input" name="${name}" type="${type}" autocomplete="${ac}" placeholder="${ph}" required><span class="field-error" data-err="${name}"></span></label>`;

  const render = () => {
    if (!S.cartLines().length) return `<section class="checkout">${C.empty({ title: 'Нечего оформлять', text: 'Корзина пуста — добавьте пластинки, и мы аккуратно упакуем их для вас.' })}</section>`;
    return `<section class="checkout">
      <header class="page-head page-head--sm"><p class="mono muted"><a class="link-u" href="#/cart">Корзина</a> / Оформление</p><h1 class="page-title">Оформление</h1></header>
      <div class="checkout__grid">
        <form class="checkout__form" id="checkoutForm" novalidate>
          <fieldset><legend><span class="mono">01</span> Контакты</legend>
            <div class="fields">${field('name', 'Имя и фамилия', { ac: 'name', ph: 'Как к вам обращаться' })}${field('phone', 'Телефон', { type: 'tel', ac: 'tel', ph: '+7 900 000-00-00' })}${field('email', 'Email', { type: 'email', ac: 'email', ph: 'для чека и трек-номера', full: true })}</div>
          </fieldset>
          <fieldset><legend><span class="mono">02</span> Доставка</legend>
            <div class="radios">${S.shippingOptions.map(o => `<label class="radio"><input type="radio" name="shipping" value="${o.id}" ${o.id === ship ? 'checked' : ''}><span class="radio__ui"></span><span class="radio__t"><b>${o.name}</b><small>${o.note}</small></span><span class="mono">${o.price ? (S.subtotal() >= S.FREE_SHIPPING ? 'Бесплатно' : price(o.price)) : '0 ₽'}</span></label>`).join('')}</div>
            <div class="fields" id="addrFields">${field('city', 'Город', { ac: 'address-level2', ph: 'Санкт-Петербург' })}${field('address', 'Адрес', { ac: 'street-address', ph: 'Улица, дом, квартира', full: true })}</div>
          </fieldset>
          <fieldset><legend><span class="mono">03</span> Оплата</legend>
            <div class="radios">
              <label class="radio"><input type="radio" name="payment" value="on-delivery" checked><span class="radio__ui"></span><span class="radio__t"><b>При получении</b><small>Картой или наличными курьеру / в пункте выдачи</small></span></label>
              <label class="radio"><input type="radio" name="payment" value="link"><span class="radio__ui"></span><span class="radio__t"><b>Ссылка на оплату</b><small>Пришлём на email после подтверждения наличия</small></span></label>
            </div>
            <label class="field field--full"><span class="field__l">Комментарий к заказу</span><textarea class="input" name="comment" rows="3" placeholder="Например: позвоните за час до доставки"></textarea></label>
          </fieldset>
          <label class="check"><input type="checkbox" name="agree" required><span>Согласен с условиями доставки и обработкой данных</span></label>
          <span class="field-error" data-err="agree"></span>
          <button class="btn btn--accent btn--block btn--lg" type="submit">Подтвердить заказ ${C.icon.arrow}</button>
        </form>
        <aside class="summary summary--sticky" id="checkoutSummary">${summary()}</aside>
      </div>
    </section>`;
  };

  const validators = {
    name: v => v.trim().length >= 2 || 'Укажите имя',
    phone: v => v.replace(/\D/g, '').length >= 10 || 'Нужен номер из 10–11 цифр',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Проверьте email',
    city: v => ship === 'store' || v.trim().length >= 2 || 'Укажите город',
    address: v => ship === 'store' || v.trim().length >= 5 || 'Укажите адрес'
  };

  const mount = el => {
    root = el;
    const form = qs('#checkoutForm', el);
    if (!form) return;
    const showErr = (name, msg) => { const e = qs(`[data-err="${name}"]`, form); if (e) e.textContent = msg || ''; form.elements[name]?.classList?.toggle('is-invalid', !!msg); };
    const toggleAddr = () => { qs('#addrFields', form).hidden = ship === 'store'; };
    toggleAddr();
    form.addEventListener('change', e => {
      if (e.target.name === 'shipping') { ship = e.target.value; toggleAddr(); qs('#checkoutSummary', el).innerHTML = summary(); }
    });
    form.addEventListener('blur', e => { const v = validators[e.target.name]; if (v && e.target.value) { const r = v(e.target.value); showErr(e.target.name, r === true ? '' : r); } }, true);
    form.addEventListener('input', e => { if (e.target.classList.contains('is-invalid')) { const r = validators[e.target.name]?.(e.target.value); if (r === true) showErr(e.target.name, ''); } });
    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      Object.entries(validators).forEach(([n, v]) => { const r = v(form.elements[n].value); showErr(n, r === true ? '' : r); if (r !== true && !firstBad) firstBad = form.elements[n]; });
      if (!form.agree.checked) { showErr('agree', 'Нужно ваше согласие'); firstBad = firstBad || form.agree; } else showErr('agree', '');
      if (firstBad) { firstBad.focus(); return; }
      const order = S.placeOrder({ name: form.name.value.trim(), email: form.email.value.trim(), shipping: ship });
      if (order) N.router.go('#/order/' + order.no);
    });
    return () => { root = null; };
  };

  const onStore = (type, payload, el) => { if (type === 'order') return; const s = qs('#checkoutSummary', el); if (!S.cartLines().length) { el.innerHTML = render(); return; } if (s) s.innerHTML = summary(); };

  return { id: 'checkout', nav: 'cart', title: 'Оформление заказа', render, mount, onStore };
})();

N.pages.order = (() => {
  const { price, esc } = N.utils;
  const D = N.data, C = N.c, S = N.store;
  const render = ({ no }) => {
    const o = S.lastOrder(no);
    if (!o) return N.pages.notFound.render();
    const method = S.shippingOptions.find(x => x.id === o.shippingMethod);
    return `<section class="order">
      <div class="order__disc" aria-hidden="true"><span class="disc disc--spin disc--xl" style="--label-bg:#8e1b27"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span></div>
      <p class="mono muted" data-reveal>Заказ ${esc(o.no)}</p>
      <h1 class="order__title" data-reveal>Спасибо, ${esc(o.name.split(' ')[0])}.<br><em>Пластинки уже пакуют.</em></h1>
      <p class="order__text" data-reveal>Подтверждение отправлено на <b>${esc(o.email)}</b>. ${method ? esc(method.name) + ' — ' + esc(method.note.toLowerCase()) + '.' : ''}</p>
      <ul class="mini-lines order__lines" data-reveal>${o.lines.map(l => { const p = D.byId[l.id]; return `<li><span class="mini-lines__c">${C.sleeve(p, { vinyl: false, label: false })}<i>${l.qty}</i></span><span><b>${esc(p.title)}</b><small>${esc(p.artistName)}</small></span><span class="mono">${price(l.qty * l.price)}</span></li>`; }).join('')}
        <li class="sum-row sum-row--total"><span>Итого</span><b>${price(o.total)}</b></li></ul>
      <div class="order__cta" data-reveal><a class="btn btn--accent" href="#/new">Смотреть новинки ${C.icon.arrow}</a><a class="btn btn--ghost" href="#/">На главную</a></div>
    </section>`;
  };
  return { id: 'order', nav: '', title: 'Заказ оформлен', render };
})();
