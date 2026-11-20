/**
 * Static site generator — no dependencies.
 *   node build.js        → builds everything into dist/
 * Output: dist/{ru,en,az}/…html, dist/index.html (language redirect), sitemap.xml, robots.txt, assets/
 */
const fs = require('fs');
const path = require('path');
const config = require('./src/config');
const i18n = require('./src/i18n');
const projects = require('./src/projects');
const { layout, routes } = require('./src/templates/layout');
const P = require('./src/templates/pages');
const { t } = require('./src/templates/helpers');

const DIST = path.join(__dirname, 'dist');
fs.rmSync(DIST, { recursive: true, force: true });
const write = (file, html) => { const f = path.join(DIST, file); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
const copyDir = (src, dst) => fs.cpSync(src, dst, { recursive: true });

const pages = [];
const alts = fn => Object.fromEntries(config.languages.map(l => [l, fn(l)]));

const person = lang => ({
  '@context': 'https://schema.org', '@type': 'Person', name: config.name, jobTitle: i18n[lang].role,
  email: `mailto:${config.email}`, url: `${config.siteUrl}/${lang}/`, sameAs: [`https://t.me/${config.telegram}`]
});

for (const lang of config.languages) {
  const T = i18n[lang];
  const simple = [
    ['home', P.home, T.meta.home],
    ['works', P.works, T.meta.works],
    ['about', P.about, T.meta.about],
    ['services', P.services, T.meta.services],
    ['contact', P.contact, T.meta.contact]
  ];
  for (const [key, fn, meta] of simple) {
    const page = routes[key](lang);
    write(page, layout({ lang, page, key, alt: alts(l => routes[key](l)), title: meta.title, desc: meta.desc, body: fn(lang, page), jsonld: key === 'home' ? person(lang) : null, bodyClass: 'page-' + key }));
    pages.push(page);
  }
  for (const p of projects) {
    const page = routes.project(lang, p.slug);
    write(page, layout({ lang, page, key: 'project', alt: alts(l => routes.project(l, p.slug)), title: p.title, desc: t(p.summary, lang), body: P.project(lang, page, p), theme: p.theme, bodyClass: 'page-project',
      jsonld: { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, description: t(p.summary, lang), dateCreated: String(p.year), creator: { '@type': 'Person', name: config.name } } }));
    pages.push(page);
  }
  const nf = routes.notFound(lang);
  write(nf, layout({ lang, page: nf, key: 'notFound', alt: alts(l => routes.notFound(l)), title: T.meta.notFound.title, desc: T.meta.notFound.desc, body: P.notFound(lang, nf), bodyClass: 'page-404' }));
}

// Root 404 for hosting (served at any URL → absolute base)
const d = config.defaultLanguage;
write('404.html', layout({ lang: d, page: '404.html', base: '/', key: 'notFound', alt: alts(l => routes.notFound(l)), title: i18n[d].meta.notFound.title, desc: i18n[d].meta.notFound.desc, body: P.notFound(d, '404.html'), bodyClass: 'page-404' }));

// Root: pick saved language → browser language → default
write('index.html', `<!doctype html><html lang="${d}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${config.name}</title><meta name="description" content="${i18n[d].meta.home.desc}">
<link rel="canonical" href="${config.siteUrl}/${d}/">
${config.languages.map(l => `<link rel="alternate" hreflang="${l}" href="${config.siteUrl}/${l}/">`).join('')}
<script>(function(){var L=${JSON.stringify(config.languages)},s=null;try{s=localStorage.getItem('pf:lang')}catch(e){}
if(L.indexOf(s)<0){s=null;var n=(navigator.languages||[navigator.language||'']);for(var i=0;i<n.length&&!s;i++){var c=String(n[i]).slice(0,2).toLowerCase();if(L.indexOf(c)>-1)s=c;}}
location.replace((s||'${d}')+'/index.html');})();</script>
<meta http-equiv="refresh" content="1;url=${d}/index.html"></head>
<body style="background:#f1efea;font-family:system-ui;padding:40px">${config.languages.map(l => `<a href="${l}/index.html" style="margin-right:16px">${i18n[l].langName}</a>`).join('')}</body></html>`);

// sitemap + robots
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(p => { const u = `${config.siteUrl}/${p.replace(/index\.html$/, '')}`; const rest = p.slice(3); return `<url><loc>${u}</loc>${config.languages.map(l => `<xhtml:link rel="alternate" hreflang="${l}" href="${config.siteUrl}/${(l + '/' + rest).replace(/index\.html$/, '')}"/>`).join('')}</url>`; }).join('\n')}
</urlset>`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

copyDir(path.join(__dirname, 'assets'), path.join(DIST, 'assets'));
console.log(`Built ${pages.length} pages (${config.languages.length} languages) into dist/`);
