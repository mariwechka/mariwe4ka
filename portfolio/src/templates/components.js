const i18n = require('../i18n');
const { esc, rel, t, img } = require('./helpers');
const { routes, icon } = require('./layout');

/** Project card. Size and tone come from project.card */
const workCard = (p, lang, page, i) => {
  const T = i18n[lang];
  const href = rel(page, routes.project(lang, p.slug));
  const sizes = { xl: '(max-width: 760px) 100vw, 66vw', tall: '(max-width: 760px) 100vw, 34vw', l: '(max-width: 760px) 100vw, 50vw', m: '(max-width: 760px) 100vw, 42vw' };
  return `<article class="work work--${p.card.size}" data-cats="${p.categories.join(' ')}" data-rv style="--tone:${p.card.tone};--i:${i % 4}">
    <a class="work__link" href="${href}" data-cursor="${esc(T.works.view)}">
      <div class="work__media">${img(page, p.cover, `${p.title}: ${t(p.summary, lang)}`, { sizes: sizes[p.card.size] })}<span class="work__shade" aria-hidden="true"></span></div>
      <div class="work__meta">
        <span class="work__no mono">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="work__title">${esc(p.title)}</h3>
        <p class="work__sum">${esc(t(p.summary, lang))}</p>
        <p class="work__cats mono">${p.categories.map(c => `<span>${esc(T.categories[c])}</span>`).join('')}<span>${p.year}</span></p>
      </div>
      <span class="work__go" aria-hidden="true">${icon.arrowUR}</span>
    </a>
  </article>`;
};

/** "Your project could be here" card */
const yoursCard = (lang, page) => {
  const T = i18n[lang].works;
  return `<article class="work work--yours" data-cats="*" data-rv>
    <a class="work__link" href="${rel(page, routes.contact(lang))}" data-cursor="${esc(T.yoursCta)}">
      <div class="yours">
        <span class="yours__plus" aria-hidden="true"></span>
        <h3 class="yours__title">${T.yoursTitle}</h3>
        <p class="yours__text">${T.yoursText}</p>
        <span class="yours__cta mono">${T.yoursCta} ${icon.arrow}</span>
      </div>
    </a>
  </article>`;
};

/** Small abstract glyph per service — pure CSS shapes, different for each */
const glyph = id => `<span class="glyph glyph--${id}" aria-hidden="true"><i></i><i></i><i></i></span>`;

const serviceIds = ['web', 'uiux', 'branding', 'graphic', 'digital', '3d'];

module.exports = { workCard, yoursCard, glyph, serviceIds };
