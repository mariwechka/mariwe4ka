/* NOCTURNE — home page */
N.pages = N.pages || {};
N.pages.home = (() => {
  const { esc, price, pad, records, qs, qsa, reducedMotion } = N.utils;
  const D = N.data, C = N.c;

  const spinning = ['white-nights-nocturnes', 'tokyo-4am', 'cold-architecture', 'nocturnes-for-a-closed-club'].map(id => D.byId[id]);
  const weekly = D.collectionById['dark-jazz'];

  const hero = () => {
    const p = spinning[0];
    return `
    <section class="hero" aria-label="NOCTURNE">
      <div class="hero__meta mono" data-reveal>
        <span>Vol. 47 — Ноябрь 2026</span><span>Санкт-Петербург</span><span class="hero__rpm">33⅓ RPM</span>
      </div>
      <h1 class="hero__title" aria-label="NOCTURNE">
        <span class="hero__line"><span>NOC</span></span>
        <span class="hero__line hero__line--2"><span>TURNE</span></span>
      </h1>
      <p class="hero__title hero__title--ghost" aria-hidden="true">
        <span class="hero__line"><span>NOC</span></span>
        <span class="hero__line hero__line--2"><span>TURNE</span></span>
      </p>
      <div class="hero__deck" id="heroDeck">
        <div class="deck">
          <div class="deck__sleeve" id="heroSleeve">${C.sleeve(p, { vinyl: false })}</div>
          <div class="deck__platter">
            <span class="disc disc--hero" id="heroDisc" style="${N.cover.labelVars(p)}"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span>
          </div>
          <svg class="deck__arm" viewBox="0 0 120 320" aria-hidden="true"><circle cx="90" cy="30" r="22" fill="#1a1a1a" stroke="#3a3a3a"/><circle cx="90" cy="30" r="8" fill="#8e1b27"/><path d="M90 30 L88 230 L60 290" fill="none" stroke="#c9c2b6" stroke-width="5" stroke-linecap="round"/><rect x="46" y="282" width="26" height="16" rx="2" transform="rotate(28 59 290)" fill="#ece6dc"/></svg>
        </div>
      </div>
      <div class="hero__now" data-reveal>
        <p class="mono muted">Сейчас на проигрывателе</p>
        <div id="heroNow">${nowInfo(p)}</div>
        <div class="hero__picker" role="tablist" aria-label="Выбрать пластинку">
          ${spinning.map((s, i) => `<button role="tab" class="${i ? '' : 'is-active'}" aria-selected="${!i}" data-action="hero-pick" data-i="${i}" aria-label="${esc(s.title)}">${pad(i + 1)}</button>`).join('')}
        </div>
      </div>
      <div class="hero__lead" data-reveal>
        <p class="serif">Независимое пространство для тех, кто воспринимает музыку не как фон, а как часть <em>собственной культуры</em>.</p>
        <div class="hero__cta"><a class="btn btn--accent" href="#/catalog">Каталог ${C.icon.arrow}</a><a class="btn btn--ghost" href="#/collections">Коллекции</a></div>
      </div>
      <a class="hero__scroll mono" href="#home-new" data-action="scroll-to" data-target="home-new"><span></span>Листайте</a>
    </section>
    ${C.marquee(['Новые поступления каждую пятницу', 'Проверено на проигрывателе', 'Оригинальные прессы', 'Доставка в мягкой коробке', 'Жанры: джаз · постпанк · электроника · хип-хоп'])}`;
  };

  const nowInfo = p => `
    <a class="hero__now-title" href="#/release/${p.id}">${esc(p.title)}</a>
    <p class="hero__now-artist">${esc(p.artistName)} · ${p.year}</p>
    <p class="hero__now-price"><b>${price(p.price)}</b> ${C.availability(p)}</p>`;

  const newArrivals = () => {
    const items = [...D.products].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 10);
    return `<section class="sec sec--new" id="home-new">
      ${C.sectionHead('01', 'Новые <em>поступления</em>', { link: '#/new', sub: 'Свежие коробки, разобранные на этой неделе. Каждая пластинка прослушана и оценена вручную.' })}
      ${C.rail(items)}
    </section>`;
  };

  const featured = () => {
    const ids = ['cold-architecture', 'lacquer', 'polar-night-tapes', 'undertow', 'harmattan'];
    const [xl, ...rest] = ids.map(id => D.byId[id]);
    return `<section class="sec sec--featured">
      ${C.sectionHead('02', 'Избранные <em>релизы</em>', { link: '#/catalog?sort=popular', linkText: 'Популярное' })}
      <div class="feat">
        <article class="feat__xl" data-reveal>
          <a class="feat__media" href="#/release/${xl.id}">${C.sleeve(xl)}</a>
          <div class="feat__text">
            <p class="mono muted">${esc(xl.genreName)} · ${xl.year} · ${esc(xl.label)}</p>
            <h3 class="feat__title"><a href="#/release/${xl.id}">${esc(xl.title)}</a></h3>
            <p class="feat__artist">${esc(xl.artistName)}</p>
            <p class="feat__desc">${esc(xl.desc)}</p>
            <div class="feat__buy"><b class="price-lg">${price(xl.price)}</b>${C.addBtn(xl)}${C.favBtn(xl, 'fav-btn--line')}</div>
          </div>
        </article>
        ${rest.map((p, i) => `<div class="feat__item feat__item--${i + 1}">${C.card(p, i + 1)}</div>`).join('')}
      </div>
    </section>`;
  };

  const genres = () => `<section class="sec sec--genres" id="home-genres">
      ${C.sectionHead('03', 'Популярные <em>жанры</em>', { link: '#/catalog', linkText: 'Весь каталог' })}
      <ul class="genres" id="genreList">
        ${D.genres.map((g, i) => {
          const n = D.products.filter(p => p.genre === g.id).length;
          return `<li data-reveal style="--i:${i}"><a class="genre-row" href="#/catalog?genre=${g.id}" data-genre="${g.id}">
            <span class="genre-row__no mono">${pad(i + 1)}</span>
            <span class="genre-row__name">${g.name}</span>
            <span class="genre-row__en serif">${g.en}</span>
            <span class="genre-row__blurb">${g.blurb}</span>
            <span class="genre-row__count mono">${records(n)}</span>
            <span class="genre-row__arrow">${C.icon.arrow}</span></a></li>`;
        }).join('')}
      </ul>
      <div class="genre-preview" id="genrePreview" aria-hidden="true"></div>
    </section>`;

  const weeklyCollection = () => {
    const items = D.products.filter(p => p.collections.includes(weekly.id));
    return `<section class="sec sec--weekly" style="--col:${weekly.color};--col-accent:${weekly.accent}">
      <div class="weekly">
        <div class="weekly__text" data-reveal>
          <p class="mono"><span class="sec-head__no">04</span> Коллекция недели</p>
          <h2 class="weekly__title">${esc(weekly.name)}</h2>
          <p class="weekly__tag serif">${esc(weekly.tagline)}</p>
          <p class="weekly__desc">${esc(weekly.text)}</p>
          <p class="mono muted">Куратор — ${esc(weekly.curator)} · ${records(items.length)}</p>
          <div class="weekly__cta"><a class="btn btn--paper" href="#/collection/${weekly.id}">Открыть коллекцию ${C.icon.arrow}</a></div>
        </div>
        <div class="weekly__stack" data-reveal>
          ${items.slice(0, 5).map((p, i) => `<a class="weekly__card" href="#/release/${p.id}" style="--k:${i}" aria-label="${esc(p.title)}">${C.sleeve(p, { vinyl: false })}<span class="weekly__cap mono">${pad(i + 1)} · ${esc(p.title)}</span></a>`).join('')}
        </div>
      </div>
    </section>`;
  };

  const editorial = () => {
    const E = D.editorial;
    return `<section class="sec sec--editorial">
      <div class="edit">
        <div class="edit__main" data-reveal>
          <p class="mono"><span class="sec-head__no">05</span> ${esc(E.kicker)}</p>
          <h2 class="edit__title">${esc(E.title)}</h2>
          <p class="edit__by mono">Текст — ${esc(E.author)} · 4 мин чтения</p>
          <p class="edit__lead dropcap">${esc(E.lead)}</p>
          <blockquote class="edit__quote serif">«${esc(E.quote)}»</blockquote>
        </div>
        <ol class="edit__list">
          ${E.picks.map(([id, note], i) => { const p = D.byId[id]; return `<li data-reveal style="--i:${i}">
            <a href="#/release/${p.id}" class="edit__pick">
              <span class="edit__no serif">${i + 1}</span>
              <span class="edit__cover">${C.sleeve(p, { vinyl: false, label: false })}</span>
              <span class="edit__info"><b>${esc(p.title)}</b><span>${esc(p.artistName)}</span><em class="serif">${esc(note)}</em></span>
              <span class="edit__price mono">${price(p.price)}</span>
            </a></li>`; }).join('')}
        </ol>
      </div>
    </section>`;
  };

  const story = () => `<section class="sec sec--story">
      <div class="story">
        <p class="mono" data-reveal><span class="sec-head__no">06</span> История магазина</p>
        <p class="story__big" data-reveal>Мы начинали с <em>одной коробки</em> пластинок на блошином рынке. Сегодня это зал на Лиговском, где по пятницам до полуночи играет то, что не найти в стримингах.</p>
        <ol class="timeline">
          ${[['2011', 'Коробка на Удельной', 'Первые сорок пластинок из личной коллекции основателя.'], ['2014', 'Подвал на Лиговском', 'Двенадцать квадратных метров и один проигрыватель.'], ['2018', 'Свой стандарт оценки', 'Каждая пластинка прослушивается до продажи.'], ['2022', 'Ночные сессии', 'Пятничные прослушивания альбомов целиком — до полуночи.'], ['2026', 'Цифровое пространство', 'Тот же магазин — теперь и онлайн.']]
            .map(([y, t, d], i) => `<li data-reveal style="--i:${i}"><span class="timeline__y">${y}</span><b>${t}</b><p>${d}</p></li>`).join('')}
        </ol>
        <div class="stats" data-reveal>
          <div><b data-count="3400">3400</b><span>пластинок в зале</span></div>
          <div><b data-count="38">38</b><span>стран происхождения</span></div>
          <div><b data-count="12000">12000</b><span>слушателей</span></div>
          <div><b>∞</b><span>минут тишины между треками</span></div>
        </div>
        <a class="link-arrow" href="#/about" data-reveal>Подробнее о NOCTURNE ${C.icon.arrow}</a>
      </div>
    </section>`;

  const newsletter = () => {
    const done = N.store.subscribedEmail();
    return `<section class="sec sec--news" id="newsletter">
      <div class="news" data-reveal>
        <p class="mono"><span class="sec-head__no">07</span> Рассылка · раз в две недели</p>
        <h2 class="news__title">Подпишитесь на <em>тишину</em> между треками</h2>
        <p class="news__sub">Новые поступления — за сутки до публикации на сайте, приглашения на ночные сессии и тексты нашей редакции. Без спама, только музыка.</p>
        ${done ? newsDone(done) : `<form class="news__form" id="newsForm" novalidate>
          <label class="sr-only" for="newsEmail">Email</label>
          <input id="newsEmail" name="email" type="email" placeholder="ваш@email.ru" autocomplete="email" required>
          <button class="btn btn--accent" type="submit">Подписаться ${C.icon.arrow}</button>
          <p class="field-error" id="newsError" role="alert"></p>
          <label class="check"><input type="checkbox" name="agree" checked required><span>Согласен получать письма NOCTURNE</span></label>
        </form>`}
      </div>
    </section>`;
  };
  const newsDone = email => `<div class="news__done"><span class="disc disc--spin disc--sm"><span class="disc__label"><i></i></span></span><p>Готово. Первое письмо придёт на <b>${esc(email)}</b> в пятницу.</p></div>`;

  /* ---------- behaviour ---------- */
  const mount = root => {
    const offs = [];
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); offs.push(() => el.removeEventListener(ev, fn, o)); };

    // hero parallax
    const deck = qs('#heroDeck', root);
    if (deck && !reducedMotion() && matchMedia('(pointer:fine)').matches) {
      on(window, 'pointermove', e => {
        const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        deck.style.setProperty('--px', x.toFixed(3)); deck.style.setProperty('--py', y.toFixed(3));
      }, { passive: true });
    }
    // auto-cycle hero record
    let heroI = 0, timer = setInterval(() => !document.hidden && pick((heroI + 1) % spinning.length), 7000);
    offs.push(() => clearInterval(timer));
    const pick = i => {
      heroI = i;
      const p = spinning[i];
      const sleeve = qs('#heroSleeve', root), disc = qs('#heroDisc', root), now = qs('#heroNow', root);
      if (!sleeve) return;
      sleeve.classList.add('is-swap'); disc.classList.add('is-swap');
      setTimeout(() => {
        sleeve.innerHTML = C.sleeve(p, { vinyl: false });
        disc.setAttribute('style', N.cover.labelVars(p));
        now.innerHTML = nowInfo(p);
        sleeve.classList.remove('is-swap'); disc.classList.remove('is-swap');
      }, 350);
      qsa('.hero__picker button', root).forEach((b, k) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-selected', k === i); });
    };
    N.pages.home._pick = i => { clearInterval(timer); timer = setInterval(() => !document.hidden && pick((heroI + 1) % spinning.length), 9000); pick(i); };

    // genre preview following cursor
    const list = qs('#genreList', root), prev = qs('#genrePreview', root);
    if (list && matchMedia('(pointer:fine)').matches) {
      let current = '';
      on(list, 'pointermove', e => {
        const row = e.target.closest('.genre-row');
        if (!row) return;
        if (row.dataset.genre !== current) {
          current = row.dataset.genre;
          const items = D.products.filter(p => p.genre === current).sort((a, b) => b.pop - a.pop).slice(0, 3);
          prev.innerHTML = items.map((p, i) => `<span style="--k:${i}">${C.sleeve(p, { vinyl: false, label: false })}</span>`).join('');
        }
        const r = list.getBoundingClientRect();
        prev.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top + list.offsetTop}px)`;
        prev.classList.add('is-on');
      });
      on(list, 'pointerleave', () => { prev.classList.remove('is-on'); current = ''; });
    }

    // stat counters
    const stats = qsa('[data-count]', root);
    if ('IntersectionObserver' in window && !reducedMotion()) {
      const io = new IntersectionObserver(es => es.forEach(en => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target, to = +el.dataset.count, t0 = performance.now();
        const step = t => { const k = Math.min(1, (t - t0) / 1400); el.textContent = new Intl.NumberFormat('ru-RU').format(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }), { threshold: .6 });
      stats.forEach(s => io.observe(s));
      offs.push(() => io.disconnect());
    } else stats.forEach(s => { s.textContent = new Intl.NumberFormat('ru-RU').format(+s.dataset.count); });

    // newsletter
    const form = qs('#newsForm', root);
    if (form) on(form, 'submit', e => {
      e.preventDefault();
      const email = form.email.value.trim(), err = qs('#newsError', root);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = 'Проверьте адрес — кажется, в нём опечатка.'; form.email.focus(); form.classList.add('has-error'); return; }
      if (!form.agree.checked) { err.textContent = 'Нужно согласие на получение писем.'; return; }
      N.store.subscribeNewsletter(email);
      form.outerHTML = newsDone(email);
      N.ui.toast('Вы подписаны на рассылку NOCTURNE');
    });

    return () => offs.forEach(f => f());
  };

  const onAction = (action, el, e) => {
    if (action === 'hero-pick') N.pages.home._pick(+el.dataset.i);
    if (action === 'scroll-to') { e.preventDefault(); document.getElementById(el.dataset.target)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' }); }
  };

  return { id: 'home', nav: 'home', title: '', render: () => hero() + newArrivals() + featured() + genres() + weeklyCollection() + editorial() + story() + newsletter(), mount, onAction };
})();
