/* NOCTURNE — 404 */
N.pages.notFound = {
  id: 'notfound', nav: '', title: 'Страница не найдена',
  render: () => `<section class="notfound">
    <p class="notfound__code" aria-hidden="true">4<span class="disc disc--spin"><span class="disc__label"><i></i></span></span>4</p>
    <h1>Игла соскочила с дорожки</h1>
    <p class="muted">Такой страницы нет — возможно, пластинку уже продали или ссылка устарела.</p>
    <div class="order__cta"><a class="btn btn--accent" href="#/catalog">В каталог</a><a class="btn btn--ghost" href="#/">На главную</a></div>
  </section>`
};
