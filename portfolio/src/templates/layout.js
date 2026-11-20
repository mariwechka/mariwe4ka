const config = require('../config');
const i18n = require('../i18n');
const { esc, rel } = require('./helpers');

const routes = {
  home: l => `${l}/index.html`,
  works: l => `${l}/works.html`,
  about: l => `${l}/about.html`,
  services: l => `${l}/services.html`,
  contact: l => `${l}/contact.html`,
  project: (l, slug) => `${l}/works/${slug}.html`,
  notFound: l => `${l}/404.html`
};

const icon = {
  arrow: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>',
  arrowUR: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  copy: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  check: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17l9-10"/></svg>',
  mail: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
  tg: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/></svg>'
};

const tgUrl = `https://t.me/${config.telegram}`;

/** Language switcher: segmented control with a sliding marker */
const langSwitch = (lang, alt, page, cls = '') => {
  const T = i18n[lang];
  return `<nav class="lang ${cls}" aria-label="${T.nav.lang}">
    ${config.languages.map(l => `<a href="${rel(page, alt[l])}" hreflang="${l}" lang="${l}" data-lang="${l}" ${l === lang ? 'aria-current="true"' : ''} title="${esc(i18n[l].langName)}">${l.toUpperCase()}</a>`).join('')}
    <span class="lang__mark" aria-hidden="true"></span>
  </nav>`;
};

const header = (lang, page, key, alt) => {
  const T = i18n[lang];
  const link = (k, label, n) => `<a href="${rel(page, routes[k](lang))}" ${key === k ? 'aria-current="page"' : ''}><sup>${n}</sup>${label}</a>`;
  return `<header class="hdr" id="hdr">
    <a class="logo" href="${rel(page, routes.home(lang))}" aria-label="${esc(config.name)} — ${T.nav.home}">
      <span class="logo__mark" aria-hidden="true">${esc(config.monogram)}<i></i></span><span class="logo__name">${esc(config.name)}</span>
    </a>
    <nav class="nav" aria-label="${T.nav.menu}">
      ${link('works', T.nav.works, '01')}${link('about', T.nav.about, '02')}${link('services', T.nav.services, '03')}${link('contact', T.nav.contact, '04')}
    </nav>
    ${langSwitch(lang, alt, page)}
    <button class="burger" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle><span class="burger__t">${T.nav.menu}</span><span class="burger__x" aria-hidden="true"><i></i><i></i></span></button>
  </header>
  <div class="menu" id="menu" hidden>
    <nav class="menu__nav" aria-label="${T.nav.menu}">
      ${[['home', T.nav.home], ['works', T.nav.works], ['about', T.nav.about], ['services', T.nav.services], ['contact', T.nav.contact]].map(([k, l], i) => `<a href="${rel(page, routes[k](lang))}" style="--i:${i}" ${key === k ? 'aria-current="page"' : ''}><span class="mono">0${i}</span>${l}</a>`).join('')}
    </nav>
    <div class="menu__foot">
      ${langSwitch(lang, alt, page, 'lang--big')}
      <a class="mono" href="mailto:${config.email}">${config.email}</a>
      <a class="mono" href="${tgUrl}" target="_blank" rel="noopener">@${config.telegram}</a>
    </div>
  </div>`;
};

/** Contact rows with copy buttons — reused in the final CTA and contact page */
const contactRows = lang => {
  const T = i18n[lang].contact;
  return `<div class="crow">
      <span class="crow__label mono">${T.email}</span>
      <a class="crow__value" href="mailto:${config.email}" data-cursor="${esc(T.write)}">${esc(config.email)}</a>
      <div class="crow__actions">
        <button class="pill" type="button" data-copy="${esc(config.email)}">${icon.copy}<span>${T.copy}</span></button>
        <a class="pill pill--solid" href="mailto:${config.email}">${icon.mail}<span>${T.write}</span></a>
      </div>
    </div>
    <div class="crow">
      <span class="crow__label mono">${T.telegram}</span>
      <a class="crow__value" href="${tgUrl}" target="_blank" rel="noopener" data-cursor="Telegram">@${esc(config.telegram)}</a>
      <div class="crow__actions">
        <button class="pill" type="button" data-copy="@${esc(config.telegram)}">${icon.copy}<span>${T.copy}</span></button>
        <a class="pill pill--solid" href="${tgUrl}" target="_blank" rel="noopener">${icon.tg}<span>${T.openTg}</span></a>
      </div>
    </div>`;
};

/** Final call-to-action shown at the end of every page */
const finale = (lang, page, { withTitle = true } = {}) => {
  const T = i18n[lang];
  return `<section class="finale" id="contact" aria-labelledby="finale-title">
    <div class="finale__orb" aria-hidden="true"></div>
    <div class="wrap">
      <p class="kicker mono" data-rv><span class="status ${config.available ? 'is-on' : ''}"></span>${config.available ? T.status.on : T.status.off}</p>
      ${withTitle ? `<h2 class="finale__title" id="finale-title" data-split>${T.contact.title}</h2>` : `<h2 class="sr-only" id="finale-title">${T.nav.contact}</h2>`}
      <p class="finale__sub" data-rv>${T.contact.sub}</p>
      <div class="crows" data-rv>${contactRows(lang)}</div>
    </div>
  </section>`;
};

const footer = (lang, page, alt) => {
  const T = i18n[lang];
  return `<footer class="ftr">
    <div class="wrap ftr__in">
      <span class="mono">© ${config.year} ${esc(config.name)}. ${T.footer.rights}</span>
      <nav class="ftr__nav mono" aria-label="Footer">
        <a href="${rel(page, routes.works(lang))}">${T.nav.works}</a><a href="${rel(page, routes.about(lang))}">${T.nav.about}</a><a href="${rel(page, routes.services(lang))}">${T.nav.services}</a><a href="${rel(page, routes.contact(lang))}">${T.nav.contact}</a>
      </nav>
      <button class="mono ftr__top" type="button" data-top>${T.footer.top} ↑</button>
    </div>
  </footer>`;
};

/**
 * Full HTML document.
 * opts: { lang, page, key, alt: {ru,en,az → path}, title, desc, body, theme, ogImage, jsonld, bodyClass }
 */
const layout = o => {
  const T = i18n[o.lang];
  const url = p => `${config.siteUrl}/${p.replace(/index\.html$/, '')}`;
  const fullTitle = o.key === 'home' ? `${config.name} — ${o.title}` : `${o.title} — ${config.name}`;
  const og = `${config.siteUrl}/assets/img/og-${o.lang}.png`;
  const themeVars = o.theme ? `--p-bg:${o.theme.bg};--p-fg:${o.theme.fg};--p-accent:${o.theme.accent};--p-soft:${o.theme.soft}` : '';
  const ui = { copied: T.contact.copied, copyFail: T.contact.copyFail, view: T.works.view, formError: T.contact.formError };
  return `<!doctype html>
<html lang="${o.lang}">
<head>
<meta charset="utf-8">
${o.base ? `<base href="${o.base}">` : ''}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${url(o.page)}">
${config.languages.map(l => `<link rel="alternate" hreflang="${l}" href="${url(o.alt[l])}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${url(o.alt[config.defaultLanguage])}">
<meta property="og:type" content="${o.key === 'project' ? 'article' : 'website'}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${url(o.page)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:locale" content="${T.locale}">
${config.languages.filter(l => l !== o.lang).map(l => `<meta property="og:locale:alternate" content="${i18n[l].locale}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${o.theme ? o.theme.bg : '#f1efea'}">
<link rel="icon" href="${rel(o.page, 'assets/img/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geologica:wght@200..900&family=Spectral:ital,wght@1,300;1,400&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${rel(o.page, 'assets/css/main.css')}">
${o.jsonld ? `<script type="application/ld+json">${JSON.stringify(o.jsonld)}</script>` : ''}
<script>(function(d){d.classList.add('js');try{localStorage.setItem('pf:lang','${o.lang}');if(sessionStorage.getItem('pf:veil')==='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('is-arriving')}catch(e){}})(document.documentElement)</script>
</head>
<body class="${o.bodyClass || ''} ${o.theme ? 'themed themed--' + o.theme.mode : ''}" style="${themeVars}" data-ui='${esc(JSON.stringify(ui))}'>
<a class="skip" href="#main">${T.nav.skip}</a>
${header(o.lang, o.page, o.key, o.alt)}
<main id="main" tabindex="-1">
${o.body}
</main>
${footer(o.lang, o.page, o.alt)}
<div class="veil" aria-hidden="true"><span class="veil__dot"></span></div>
<div class="toast" role="status" aria-live="polite"></div>
<script src="${rel(o.page, 'assets/js/main.js')}" defer></script>
</body>
</html>`;
};

module.exports = { layout, routes, icon, finale, contactRows, tgUrl };
