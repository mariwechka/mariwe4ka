const path = require('path');
const images = require('../images.json');

const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Relative URL from one output file to another (both relative to dist/) */
const rel = (from, to) => {
  const r = path.posix.relative(path.posix.dirname(from), to);
  return r || path.posix.basename(to);
};

/** Pick a localized value: { ru, en, az } → string */
const t = (v, lang) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.en ?? '') : v);

const plural = (n, forms, lang) => {
  if (lang !== 'ru') return n === 1 ? forms[0] : forms[1];
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
};

/**
 * Responsive <img> with srcset from src/images.json.
 * key: 'slug/name'. Images live in assets/img/works/<slug>/<name>-<w>.webp
 */
const img = (page, key, alt, { sizes = '100vw', eager = false, cls = '' } = {}) => {
  const m = images[key];
  if (!m) throw new Error('Unknown image ' + key);
  const base = rel(page, `assets/img/works/${key}`);
  const srcset = m.sizes.map(w => `${base}-${w}.webp ${w}w`).join(', ');
  return `<img class="${cls}" src="${base}-${m.sizes[0]}.webp" srcset="${srcset}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
};

const imgSize = key => images[key];

module.exports = { esc, rel, t, plural, img, imgSize };
