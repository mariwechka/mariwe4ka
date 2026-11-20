const config = require('../config');
const i18n = require('../i18n');
const projects = require('../projects');
const { esc, rel, t, img, plural } = require('./helpers');
const { routes, icon, finale, contactRows, tgUrl } = require('./layout');
const { workCard, yoursCard, glyph, serviceIds } = require('./components');

const nameLetters = () => [...config.name].map((c, i) => `<span class="hero__l" style="--i:${i}">${esc(c)}</span>`).join('');

/* ===================== HOME ===================== */
const home = (lang, page) => {
  const T = i18n[lang];
  return `
  <section class="hero" aria-labelledby="hero-name">
    <div class="wrap hero__in">
      <div class="hero__top mono" data-rv>
        <span>(${T.hero.index}) — ${config.year}</span>
        <span class="hero__role">${T.role}</span>
        <a class="hero__status" href="${rel(page, routes.contact(lang))}"><span class="status ${config.available ? 'is-on' : ''}"></span>${config.available ? T.status.on : T.status.off}</a>
      </div>
      <h1 class="hero__name" id="hero-name" aria-label="${esc(config.name)} — ${T.role}"><span class="hero__word" aria-hidden="true" data-weight>${nameLetters()}</span><span class="hero__dot" aria-hidden="true"></span></h1>
      <div class="hero__grid">
        <p class="hero__lead" data-rv>${T.hero.lead}</p>
        <div class="hero__ticker" aria-label="${esc(T.disciplines.join(', '))}">
          <span class="mono">→</span>
          <span class="ticker" aria-hidden="true">${T.disciplines.map((d, i) => `<b style="--k:${i}">${esc(d)}</b>`).join('')}</span>
        </div>
        <div class="hero__cta" data-rv>
          <a class="btn btn--ink" href="${rel(page, routes.works(lang))}">${T.hero.ctaWorks} ${icon.arrow}</a>
          <a class="btn btn--line" href="${rel(page, routes.contact(lang))}">${T.hero.ctaContact}</a>
        </div>
      </div>
      <div class="hero__foot mono"><span class="hero__hint">${T.hero.hint} ↑</span><a href="#works" class="hero__scroll">${T.hero.scroll} ↓</a></div>
    </div>
  </section>

  <section class="sect" id="works" aria-labelledby="works-title">
    <div class="wrap">
      <header class="shead">
        <span class="shead__no mono">(01)</span>
        <h2 class="shead__title" id="works-title" data-split>${T.home.worksTitle}</h2>
        <p class="shead__sub" data-rv>${T.home.worksSub}</p>
        <a class="link" href="${rel(page, routes.works(lang))}" data-rv>${T.home.allWorks} ${icon.arrow}</a>
      </header>
      <div class="works">${projects.map((p, i) => workCard(p, lang, page, i)).join('')}${yoursCard(lang, page)}</div>
    </div>
  </section>

  <div class="band" aria-hidden="true"><div class="band__track">${[...T.disciplines, ...T.disciplines].map(d => `<span>${esc(d)}</span><i></i>`).join('')}</div></div>

  <section class="sect approach-teaser" aria-labelledby="ap-title">
    <div class="wrap at">
      <span class="shead__no mono">(02) ${T.home.aboutKicker}</span>
      <h2 class="at__text" id="ap-title" data-split>${T.home.aboutText}</h2>
      <a class="link" href="${rel(page, routes.about(lang))}" data-rv>${T.home.aboutLink} ${icon.arrow}</a>
    </div>
  </section>

  <section class="sect" aria-labelledby="sv-title">
    <div class="wrap">
      <header class="shead">
        <span class="shead__no mono">(03)</span>
        <h2 class="shead__title" id="sv-title" data-split>${T.home.servicesTitle}</h2>
        <a class="link" href="${rel(page, routes.services(lang))}" data-rv>${T.home.servicesLink} ${icon.arrow}</a>
      </header>
      <ol class="srows">
        ${serviceIds.map((id, i) => { const s = T.services.list[id]; return `<li data-rv style="--i:${i}"><a class="srow" href="${rel(page, routes.services(lang))}#${id}">
          <span class="srow__no mono">${String(i + 1).padStart(2, '0')}</span>
          <span class="srow__name">${s.name}</span>
          <span class="srow__desc">${s.desc}</span>
          ${glyph(id)}
        </a></li>`; }).join('')}
      </ol>
    </div>
  </section>
  ${finale(lang, page)}`;
};

/* ===================== WORKS ===================== */
const works = (lang, page) => {
  const T = i18n[lang];
  const cats = [...new Set(projects.flatMap(p => p.categories))];
  const count = c => projects.filter(p => !c || p.categories.includes(c)).length;
  return `
  <section class="phead">
    <div class="wrap">
      <p class="mono phead__kick" data-rv>(${String(projects.length).padStart(2, '0')}) ${plural(projects.length, T.works.count, lang)}</p>
      <h1 class="phead__title" data-split>${T.works.title}</h1>
      <p class="phead__intro" data-rv>${T.works.intro}</p>
      <div class="filters" role="group" aria-label="${T.a11y.filter}" data-rv>
        <button class="chip" type="button" data-filter="" aria-pressed="true">${T.works.all}<sup>${count()}</sup></button>
        ${cats.map(c => `<button class="chip" type="button" data-filter="${c}" aria-pressed="false">${T.categories[c]}<sup>${count(c)}</sup></button>`).join('')}
      </div>
    </div>
  </section>
  <section class="sect sect--tight" aria-label="${T.works.title}">
    <div class="wrap">
      <div class="works works--all" data-works>${projects.map((p, i) => workCard(p, lang, page, i)).join('')}${yoursCard(lang, page)}</div>
      <p class="works__empty" data-empty hidden>${T.works.empty}</p>
    </div>
  </section>
  ${finale(lang, page)}`;
};

/* ===================== PROJECT ===================== */
const block = (b, lang, page, p) => {
  const cap = b.caption ? `<figcaption><span class="mono">—</span>${esc(t(b.caption, lang))}</figcaption>` : '';
  switch (b.type) {
    case 'lead': return `<section class="pb pb--lead wrap"><p data-split>${esc(t(b.text, lang))}</p></section>`;
    case 'facts': return `<section class="pb wrap"><dl class="facts">${b.items.map(([n, l]) => `<div data-rv><dt>${esc(n)}</dt><dd>${esc(t(l, lang))}</dd></div>`).join('')}</dl></section>`;
    case 'image': return `<figure class="pb ${b.wide ? 'pb--wide' : 'wrap'}" data-rv><div class="frame">${img(page, b.img, t(b.caption, lang) || p.title, { sizes: '(max-width: 1400px) 100vw, 1400px' })}</div>${cap}</figure>`;
    case 'pair': return `<figure class="pb wrap" data-rv><div class="pair">${b.imgs.map(k => `<div class="frame">${img(page, k, t(b.caption, lang), { sizes: '(max-width: 760px) 100vw, 50vw' })}</div>`).join('')}</div>${cap}</figure>`;
    case 'scroll': return `<figure class="pb wrap" data-rv><div class="frame frame--scroll" tabindex="0" aria-label="${esc(t(b.caption, lang))}"><span class="frame__hint mono">${i18n[lang].project.scrollHint} ↓</span>${img(page, b.img, t(b.caption, lang), { sizes: '(max-width: 1100px) 100vw, 1100px' })}</div>${cap}</figure>`;
    case 'phones': return `<figure class="pb wrap" data-rv><div class="phones">${b.imgs.map((k, i) => `<div class="phone" style="--k:${i}">${img(page, k, t(b.caption, lang), { sizes: '(max-width: 760px) 45vw, 22vw' })}</div>`).join('')}</div>${cap}</figure>`;
    case 'strip': return `<figure class="pb" data-rv><div class="strip" tabindex="0" data-drag aria-label="${esc(t(b.caption, lang))}">${b.imgs.map((k, i) => `<div class="strip__item">${img(page, k, `${p.title} — ${i + 1}/${b.imgs.length}`, { sizes: '(max-width: 760px) 70vw, 30vw' })}<span class="mono">${String(i + 1).padStart(2, '0')} ${i18n[lang].project.of} ${b.imgs.length}</span></div>`).join('')}</div><div class="wrap">${cap}</div></figure>`;
    case 'grid-note': return `<section class="pb wrap gnote"><div class="frame" data-rv>${img(page, b.img, t(b.title, lang), { sizes: '(max-width: 760px) 100vw, 45vw' })}</div><div class="gnote__text" data-rv><h2>${esc(t(b.title, lang))}</h2><p>${esc(t(b.body, lang))}</p></div></section>`;
    case 'quote': return `<section class="pb wrap"><blockquote class="pquote" data-split>${esc(t(b.text, lang))}</blockquote></section>`;
    case 'text': return `<section class="pb wrap ptext"><h2 class="mono" data-rv>${esc(t(b.title, lang))}</h2><p data-rv>${esc(t(b.body, lang))}</p></section>`;
    default: return '';
  }
};

const project = (lang, page, p) => {
  const T = i18n[lang];
  const idx = projects.indexOf(p), next = projects[(idx + 1) % projects.length];
  const meta = `<dl class="pmeta" data-rv>
      <div><dt class="mono">${T.project.type}</dt><dd>${esc(t(p.type, lang))}</dd></div>
      <div><dt class="mono">${T.project.role}</dt><dd>${esc(t(p.role, lang))}</dd></div>
      <div><dt class="mono">${T.project.tools}</dt><dd>${p.tools.map(esc).join(', ')}</dd></div>
      <div><dt class="mono">${T.project.year}</dt><dd>${p.year}</dd></div>
    </dl>`;
  const crumbs = `<p class="mono pcrumbs" data-rv><a href="${rel(page, routes.works(lang))}">← ${T.project.back}</a><span>${p.categories.map(c => T.categories[c]).join(' · ')}</span></p>`;
  let heroHtml;
  if (p.hero === 'type') heroHtml = `
    <section class="phero phero--type"><div class="wrap">${crumbs}
      <h1 class="phero__title phero__title--giant" data-split>${esc(p.title)}</h1>
      <div class="phero__row"><p class="phero__sum" data-rv>${esc(t(p.summary, lang))}</p>${meta}</div></div>
      <div class="phero__img phero__img--offset" data-rv>${img(page, p.cover, p.title, { eager: true, sizes: '(max-width: 760px) 100vw, 80vw' })}</div></section>`;
  else if (p.hero === 'split') heroHtml = `
    <section class="phero phero--split"><div class="wrap phero__split">
      <div>${crumbs}<h1 class="phero__title" data-split>${esc(p.title)}</h1><p class="phero__sum" data-rv>${esc(t(p.summary, lang))}</p>${meta}</div>
      <div class="phero__poster" data-rv>${img(page, p.cover, p.title, { eager: true, sizes: '(max-width: 760px) 100vw, 42vw' })}</div></div></section>`;
  else heroHtml = `
    <section class="phero phero--image"><div class="wrap">${crumbs}
      <h1 class="phero__title" data-split>${esc(p.title)}</h1>
      <div class="phero__row"><p class="phero__sum" data-rv>${esc(t(p.summary, lang))}</p>${meta}</div></div>
      <div class="phero__img" data-rv>${img(page, p.cover, p.title, { eager: true, sizes: '100vw' })}</div></section>`;

  return `${heroHtml}
  <div class="pblocks">${p.blocks.map(b => block(b, lang, page, p)).join('')}</div>
  <a class="pnext" href="${rel(page, routes.project(lang, next.slug))}" style="--tone:${next.card.tone}" data-cursor="${esc(T.works.view)}">
    <span class="wrap pnext__in"><span class="mono">${T.project.next} →</span><b>${esc(next.title)}</b><span class="pnext__sum">${esc(t(next.summary, lang))}</span></span>
  </a>
  ${finale(lang, page)}`;
};

/* ===================== ABOUT ===================== */
const about = (lang, page) => {
  const T = i18n[lang], A = T.about;
  const tools = config.tools;
  return `
  <section class="phead">
    <div class="wrap about-hero">
      <h1 class="phead__title" data-split>${A.title}</h1>
      <figure class="photo" data-rv>
        <div class="photo__slot"><span class="photo__mark" aria-hidden="true">${esc(config.monogram)}</span><span class="mono">${A.photo}</span><small>${A.photoHint}</small></div>
      </figure>
      <div class="about-intro">
        <p class="about-intro__lead" data-rv>${esc(A.intro)}</p>
        <p data-rv>${esc(A.introMore)}</p>
      </div>
    </div>
  </section>
  <section class="sect">
    <div class="wrap">
      <header class="shead"><span class="shead__no mono">(01)</span><h2 class="shead__title" data-split>${A.approachTitle}</h2></header>
      <ol class="principles">${A.approach.map(([h, d], i) => `<li data-rv style="--i:${i}"><span class="principles__no">${i + 1}</span><h3>${h}</h3><p>${d}</p></li>`).join('')}</ol>
    </div>
  </section>
  <section class="sect sect--dark">
    <div class="wrap kit">
      <div data-rv><h2 class="mono kit__h">(02) ${A.skillsTitle}</h2><ul class="tags">${A.skills.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div data-rv><h2 class="mono kit__h">(03) ${A.toolsTitle}</h2><ul class="kit__list">${tools.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
      <div data-rv><h2 class="mono kit__h">(04) ${A.directionsTitle}</h2><ul class="kit__list">${Object.values(T.categories).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
    </div>
  </section>
  ${finale(lang, page)}`;
};

/* ===================== SERVICES ===================== */
const services = (lang, page) => {
  const T = i18n[lang], S = T.services;
  return `
  <section class="phead">
    <div class="wrap">
      <p class="mono phead__kick" data-rv>(0${serviceIds.length})</p>
      <h1 class="phead__title" data-split>${S.title}</h1>
      <p class="phead__intro" data-rv>${S.intro}</p>
    </div>
  </section>
  <section class="sect sect--tight">
    <div class="wrap svc">
      ${serviceIds.map((id, i) => { const s = S.list[id]; return `<article class="svc__item" id="${id}" data-rv>
        <div class="svc__head"><span class="mono">${String(i + 1).padStart(2, '0')}</span>${glyph(id)}</div>
        <h2 class="svc__name">${s.name}</h2>
        <p class="svc__desc">${s.desc}</p>
        <div class="svc__out"><p class="mono">${S.deliverables}</p><ul>${s.items.map(x => `<li>${x}</li>`).join('')}</ul></div>
        <a class="link" href="${rel(page, routes.contact(lang))}?service=${id}">${S.ask} ${icon.arrow}</a>
      </article>`; }).join('')}
    </div>
  </section>
  <section class="sect">
    <div class="wrap">
      <header class="shead"><span class="shead__no mono">→</span><h2 class="shead__title" data-split>${S.processTitle}</h2></header>
      <ol class="steps">${S.process.map(([h, d], i) => `<li data-rv style="--i:${i}"><span class="steps__no mono">${String(i + 1).padStart(2, '0')}</span><h3>${h}</h3><p>${d}</p></li>`).join('')}</ol>
    </div>
  </section>
  ${finale(lang, page)}`;
};

/* ===================== CONTACT ===================== */
const contact = (lang, page) => {
  const T = i18n[lang], C = T.contact;
  return `
  <section class="cpage">
    <div class="cpage__orb" aria-hidden="true"></div>
    <div class="wrap">
      <p class="kicker mono" data-rv><span class="status ${config.available ? 'is-on' : ''}"></span>${config.available ? T.status.on : T.status.off}</p>
      <h1 class="finale__title" data-split>${C.title}</h1>
      <p class="finale__sub" data-rv>${C.sub}</p>
      <div class="crows" data-rv>${contactRows(lang)}</div>
    </div>
  </section>
  <section class="sect">
    <div class="wrap brief">
      <h2 class="shead__title" data-split>${C.formTitle}</h2>
      <form class="brief__form" data-brief data-email="${esc(config.email)}" data-subject="${esc(C.formSubject)}" data-hello="${esc(C.formHello)}" novalidate>
        <fieldset><legend class="mono">${C.formWhat}</legend>
          <div class="chips">${serviceIds.map(id => `<label class="chip chip--check"><input type="checkbox" name="service" value="${esc(T.services.list[id].name)}" data-id="${id}"><span>${T.services.list[id].name}</span></label>`).join('')}</div>
        </fieldset>
        <label class="field"><span class="mono">${C.formAbout}</span><textarea name="about" id="brief-about" rows="4" placeholder="${esc(C.formPlaceholder)}" required></textarea><span class="field__err" data-err hidden>${C.formError}</span></label>
        <label class="field"><span class="mono">${C.formName}</span><input name="name" id="brief-name" type="text" autocomplete="name"></label>
        <div class="brief__foot"><button class="btn btn--ink" type="submit">${icon.mail} ${C.formSend}</button><p class="mono">${C.formNote}</p></div>
      </form>
    </div>
  </section>`;
};

/* ===================== 404 ===================== */
const notFound = (lang, page) => {
  const T = i18n[lang];
  return `<section class="nf"><div class="wrap">
    <p class="nf__code" aria-hidden="true">4<span class="hero__dot"></span>4</p>
    <h1 class="phead__title nf__title">${T.notFound.title}</h1>
    <p class="phead__intro">${T.notFound.text}</p>
    <div class="hero__cta"><a class="btn btn--ink" href="${rel(page, routes.works(lang))}">${T.nav.works} ${icon.arrow}</a><a class="btn btn--line" href="${rel(page, routes.home(lang))}">${T.notFound.home}</a></div>
  </div></section>`;
};

module.exports = { home, works, project, about, services, contact, notFound };
