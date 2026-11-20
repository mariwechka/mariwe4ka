/* NOCTURNE — about (editorial) */
N.pages.about = (() => {
  const { esc } = N.utils;
  const D = N.data, C = N.c;
  const render = () => `<article class="about">
    <header class="about__hero">
      <p class="mono muted" data-reveal>NOCTURNE / About</p>
      <h1 class="about__title" data-reveal><span>Музыка —</span><span>не <em>фон</em>.</span></h1>
      <div class="about__spin" aria-hidden="true"><span class="disc disc--spin disc--xl"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span></div>
    </header>

    <section class="about__manifest">
      <p class="about__lede" data-reveal><span class="dropcap-big">N</span>OCTURNE — независимое пространство для людей, которые воспринимают музыку не просто как фон, а как часть собственной культуры. Мы продаём пластинки, но на самом деле — время: сорок минут, когда вы не листаете ленту, а слушаете альбом от первой до последней дорожки.</p>
      <div class="about__cols" data-reveal>
        <p>Магазин начался в 2011 году с коробки на блошином рынке на Удельной. Основатель, Лёва Ордин, продавал собственную коллекцию, чтобы купить новый проигрыватель — и так и не остановился. Через три года появился подвал на Лиговском, ещё через четыре — собственный стандарт оценки состояния винила.</p>
        <p>Сегодня нас пятеро. Мы ездим по барахолкам, разбираем архивы радиостанций, переписываемся с маленькими лейблами из Лагоса, Берлина и Токио. Каждую пластинку мы ставим на проигрыватель перед тем, как выставить на полку — и честно пишем, как она звучит.</p>
      </div>
      <blockquote class="about__quote serif" data-reveal>«Пластинку нельзя пролистать. Её можно только дослушать — или снять с проигрывателя. В этом её честность.»<cite class="mono">— Лёва Ордин, основатель</cite></blockquote>
    </section>

    <section class="principles">
      <h2 class="sec-head__title" data-reveal>Пять <em>принципов</em></h2>
      <ol>
        ${[['Слушаем каждую', 'Ни одна пластинка не попадает в каталог без прослушивания на нашем проигрывателе.'],
           ['Честная оценка', 'Мы скорее занизим грейд, чем расстроим вас. Шкала Goldmine — без исключений.'],
           ['Контекст важнее хайпа', 'Мы рассказываем, почему запись важна, а не только сколько она стоит.'],
           ['Маленькие лейблы', 'Половина каталога — независимые издатели и тиражи до 500 копий.'],
           ['Бережная доставка', 'Жёсткая коробка, уголки, пластинка отдельно от конверта — чтобы не порвался шов.']]
          .map(([t, d], i) => `<li data-reveal style="--i:${i}"><span class="serif">${i + 1}</span><b>${t}</b><p>${d}</p></li>`).join('')}
      </ol>
    </section>

    <section class="grading" id="grading">
      <div class="grading__head" data-reveal><p class="mono">Справка</p><h2 class="sec-head__title">Как мы оцениваем <em>винил</em></h2><p class="muted">Каждой пластинке присваиваются два грейда: отдельно для самого диска и для конверта.</p></div>
      <div class="grading__table" data-reveal>
        ${D.conditionOrder.map(c => `<div class="grading__row"><b class="mono">${c}</b><span>${D.conditions[c].name}</span><p>${D.conditions[c].text}</p><a class="link-u mono small" href="#/catalog?cond=${encodeURIComponent(c)}">Смотреть ${c} →</a></div>`).join('')}
      </div>
    </section>

    <section class="team">
      <h2 class="sec-head__title" data-reveal>Кто за <em>прилавком</em></h2>
      <div class="team__grid">
        ${[['Лёва Ордин', 'Основатель', 'Постпанк, классика', '#8e1b27'], ['Мира Савчук', 'Закупки', 'Джаз, всё забытое', '#1c2230'], ['Даня Ким', 'Хип-хоп и техно', 'Белые этикетки', '#3a1d2b'], ['Ася Вернер', 'Онлайн и доставка', 'Эксперимент', '#14261f'], ['Гоша', 'Кот магазина', 'Тишина', '#2b2b2b']]
          .map(([n, r, t, c], i) => `<div class="member" data-reveal style="--i:${i};--c:${c}"><span class="member__ph" aria-hidden="true"><span class="serif">${n[0]}</span></span><b>${n}</b><span class="mono muted">${r}</span><span class="serif">Слушает: ${t}</span></div>`).join('')}
      </div>
    </section>

    <section class="visit" id="visit">
      <div class="visit__map" aria-hidden="true">
        <svg viewBox="0 0 400 300"><g stroke="#ece6dc" stroke-opacity=".15" fill="none"><path d="M0 60H400M0 140H400M0 230H400M70 0V300M190 0V300M300 0V300"/><path d="M0 280L400 20" stroke-opacity=".3" stroke-width="10"/></g><circle cx="190" cy="140" r="14" fill="#8e1b27"/><circle cx="190" cy="140" r="34" fill="none" stroke="#8e1b27"><animate attributeName="r" from="14" to="60" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" from="1" to="0" dur="2.4s" repeatCount="indefinite"/></circle></svg>
      </div>
      <div class="visit__text" data-reveal>
        <p class="mono">Приходите слушать</p>
        <h2 class="visit__addr">Лиговский пр., 74<br><em>Санкт-Петербург</em></h2>
        <dl class="specs specs--plain"><div><dt>Пн–Чт, Вс</dt><dd>12:00–22:00</dd></div><div><dt>Пт–Сб</dt><dd>12:00–00:00</dd></div><div><dt>Ночные сессии</dt><dd>Пятница, 21:00</dd></div><div><dt>Почта</dt><dd><a class="link-u" href="mailto:hello@nocturne.store">hello@nocturne.store</a></dd></div></dl>
        <a class="btn btn--accent" href="#/catalog">Смотреть каталог ${C.icon.arrow}</a>
      </div>
    </section>
  </article>`;
  return { id: 'about', nav: 'about', title: 'About', render };
})();
