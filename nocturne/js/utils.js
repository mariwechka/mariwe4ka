/* NOCTURNE — shared helpers. Everything lives under window.N */
window.N = window.N || {};

N.utils = (() => {
  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const price = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

  const plural = (n, [one, few, many]) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  };
  const records = n => `${n} ${plural(n, ['пластинка', 'пластинки', 'пластинок'])}`;

  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = typeof seed === 'number' ? seed : hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  const pad = (n, l = 2) => String(n).padStart(l, '0');

  const norm = s => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

  const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

  const parseQuery = str => {
    const out = {};
    new URLSearchParams(str || '').forEach((v, k) => { out[k] = v; });
    return out;
  };
  const buildQuery = obj => {
    const p = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length)) p.set(k, Array.isArray(v) ? v.join(',') : v); });
    const s = p.toString();
    return s ? '?' + s : '';
  };

  const highlight = (text, q) => {
    const safe = esc(text);
    if (!q) return safe;
    const idx = norm(text).indexOf(norm(q));
    if (idx < 0 || norm(text).length !== text.length) {
      // fallback: case-insensitive direct match
      const i = text.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0) return safe;
      return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
    }
    return esc(text.slice(0, idx)) + '<mark>' + esc(text.slice(idx, idx + q.length)) + '</mark>' + esc(text.slice(idx + q.length));
  };

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const storage = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* private mode — keep in memory */ } }
  };

  const formatDate = iso => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return { esc, price, plural, records, hash, rng, pad, norm, debounce, qs, qsa, parseQuery, buildQuery, highlight, reducedMotion, storage, formatDate };
})();
