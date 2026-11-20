/* NOCTURNE — generative album covers (SVG). Each release gets a deterministic artwork. */
N.cover = (() => {
  const { rng, esc } = N.utils;
  const S = 600;

  const styles = {
    orbit(r, [bg, fg, ac]) {
      const cx = 200 + r() * 200, cy = 220 + r() * 160;
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const n = 9 + Math.floor(r() * 8);
      for (let i = n; i > 0; i--) s += `<circle cx="${cx}" cy="${cy}" r="${i * (22 + r() * 6)}" fill="none" stroke="${fg}" stroke-opacity="${0.15 + i / n * 0.5}" stroke-width="${i % 3 ? 1 : 2.5}"/>`;
      s += `<circle cx="${cx + 60 - r() * 120}" cy="${cy - 40 + r() * 80}" r="${40 + r() * 40}" fill="${ac}"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="4" fill="${fg}"/>`;
      return s;
    },
    stripes(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      let y = 60 + r() * 80;
      const accentRow = Math.floor(r() * 6);
      for (let i = 0; y < S - 40; i++) {
        const h = 6 + r() * 34;
        s += `<rect x="0" y="${y}" width="${S}" height="${h}" fill="${i === accentRow ? ac : fg}" opacity="${i === accentRow ? 1 : 0.25 + r() * 0.75}"/>`;
        y += h + 8 + r() * 28;
      }
      s += `<rect x="${360 + r() * 120}" y="0" width="${3}" height="${S}" fill="${ac}"/>`;
      return s;
    },
    grid(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const n = 6, g = 70, off = (S - n * g) / 2;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = r();
        const x = off + i * g, y = off + j * g;
        if (v > 0.93) s += `<rect x="${x + 6}" y="${y + 6}" width="${g - 12}" height="${g - 12}" fill="${ac}"/>`;
        else if (v > 0.55) s += `<rect x="${x + 6}" y="${y + 6}" width="${g - 12}" height="${g - 12}" fill="${fg}" opacity="${0.12 + r() * 0.8}"/>`;
        else if (v > 0.35) s += `<circle cx="${x + g / 2}" cy="${y + g / 2}" r="${4 + r() * 22}" fill="none" stroke="${fg}" stroke-width="1.5" opacity=".7"/>`;
      }
      return s;
    },
    type(r, [bg, fg, ac], p) {
      const word = p.title.split(/\s+/).sort((a, b) => b.length - a.length)[0].replace(/[^\p{L}&]/gu, '').toUpperCase();
      const big = p.title.replace(/[^\p{L}]/gu, '')[0].toUpperCase();
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      s += `<text x="${-40 + r() * 40}" y="${520 + r() * 60}" font-family="Unbounded, sans-serif" font-weight="900" font-size="${560}" fill="${fg}" opacity=".95">${esc(big)}</text>`;
      s += `<rect x="0" y="${70 + r() * 60}" width="${S}" height="46" fill="${ac}"/>`;
      s += `<text x="300" y="${0}" font-family="JetBrains Mono, monospace" font-size="20" letter-spacing="10" fill="${bg}" text-anchor="middle" transform="translate(0 ${102 + r() * 0})">${esc(word.slice(0, 18))}</text>`;
      return s;
    },
    sun(r, [bg, fg, ac]) {
      const cy = 300 + r() * 60, rad = 150 + r() * 60;
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      s += `<circle cx="300" cy="${cy}" r="${rad}" fill="${ac}"/>`;
      for (let i = 0; i < 12; i++) {
        const y = cy + i * i * 2.4 + 6;
        if (y > S) break;
        s += `<rect x="0" y="${y}" width="${S}" height="${3 + i * 1.6}" fill="${bg}"/>`;
      }
      s += `<rect x="0" y="${cy + rad - 10}" width="${S}" height="${S}" fill="${bg}"/>`;
      s += `<line x1="40" y1="${cy + rad + 20}" x2="560" y2="${cy + rad + 20}" stroke="${fg}" stroke-width="1.5"/>`;
      return s;
    },
    wave(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const lines = 18, amp = 20 + r() * 40, freq = 0.01 + r() * 0.02, ph = r() * 6;
      const hot = Math.floor(r() * lines);
      for (let l = 0; l < lines; l++) {
        const base = 80 + l * 26;
        let d = '';
        for (let x = 0; x <= S; x += 12) {
          const env = Math.exp(-Math.pow((x - 300) / 160, 2));
          const y = base - env * amp * (1 + Math.sin(l * 0.6 + ph)) * Math.sin(x * freq + l * 0.4 + ph);
          d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
        }
        s += `<path d="${d}" fill="none" stroke="${l === hot ? ac : fg}" stroke-width="${l === hot ? 3 : 1.4}" opacity="${l === hot ? 1 : 0.7}"/>`;
      }
      return s;
    },
    block(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const x = 80 + r() * 160, w = 160 + r() * 200;
      s += `<rect x="${x}" y="${60 + r() * 60}" width="${w}" height="${260 + r() * 120}" fill="${fg}"/>`;
      s += `<rect x="${x - 60 + r() * 40}" y="${300 + r() * 80}" width="${140 + r() * 80}" height="${140 + r() * 60}" fill="${ac}" style="mix-blend-mode:multiply"/>`;
      s += `<line x1="0" y1="${S}" x2="${S}" y2="${r() * 100}" stroke="${fg}" stroke-width="2"/>`;
      s += `<circle cx="${480 - r() * 60}" cy="${120 + r() * 60}" r="18" fill="${ac}"/>`;
      return s;
    },

    halftone(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const fx = 120 + r() * 360, fy = 120 + r() * 360, step = 24;
      for (let y = step / 2; y < S; y += step) for (let x = step / 2; x < S; x += step) {
        const d = Math.hypot(x - fx, y - fy) / 420;
        const rad = Math.max(0, (1 - d) * step * 0.55);
        if (rad > 0.6) s += `<circle cx="${x}" cy="${y}" r="${rad.toFixed(1)}" fill="${fg}"/>`;
      }
      s += `<rect x="${40 + r() * 80}" y="${380 + r() * 80}" width="${180 + r() * 120}" height="18" fill="${ac}"/>`;
      return s;
    },
    ribbon(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      for (let k = 0; k < 3; k++) {
        const y0 = 120 + k * 150 + r() * 40;
        const d = `M-40 ${y0} C ${150 + r() * 100} ${y0 - 200 + r() * 100}, ${300 + r() * 100} ${y0 + 200 - r() * 100}, 640 ${y0 - 40 + r() * 80}`;
        s += `<path d="${d}" fill="none" stroke="${k === 1 ? ac : fg}" stroke-width="${k === 1 ? 46 : 14 + r() * 20}" stroke-linecap="round" opacity="${k === 1 ? 1 : .85}"/>`;
      }
      return s;
    },
    typogrid(r, [bg, fg, ac], p) {
      const word = esc(p.artistName.toUpperCase());
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const rows = 14, hot = 3 + Math.floor(r() * 8);
      for (let i = 0; i < rows; i++) {
        const y = 60 + i * 38, off = -r() * 400;
        s += `<text x="${off}" y="${y}" font-family="Unbounded, sans-serif" font-weight="${i === hot ? 900 : 300}" font-size="30" letter-spacing="2" fill="${i === hot ? ac : fg}" opacity="${i === hot ? 1 : .18 + (i % 3) * .12}">${(word + ' · ').repeat(6)}</text>`;
      }
      return s;
    },
    mesh(r, [bg, fg, ac], p, uid) {
      const g = (id, c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
      let s = `<defs>${g('a' + uid, ac)}${g('b' + uid, fg)}</defs><rect width="${S}" height="${S}" fill="${bg}"/>`;
      s += `<circle cx="${150 + r() * 300}" cy="${150 + r() * 300}" r="${300 + r() * 80}" fill="url(#a${uid})"/>`;
      s += `<circle cx="${100 + r() * 400}" cy="${100 + r() * 400}" r="${180 + r() * 80}" fill="url(#b${uid})" opacity=".55"/>`;
      s += `<circle cx="300" cy="300" r="${120 + r() * 60}" fill="none" stroke="${fg}" stroke-width="1" opacity=".6"/>`;
      s += `<line x1="300" y1="40" x2="300" y2="560" stroke="${fg}" stroke-width="1" opacity=".35"/>`;
      return s;
    },
    moon(r, [bg, fg, ac]) {
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      const n = 7, y = 250 + r() * 100, hot = Math.floor(r() * n);
      for (let i = 0; i < n; i++) {
        const cx = 60 + i * 80, ph = i / (n - 1);
        s += `<circle cx="${cx}" cy="${y}" r="30" fill="${i === hot ? ac : fg}"/>`;
        s += `<circle cx="${cx + (ph - .5) * 64}" cy="${y}" r="30" fill="${bg}"/>`;
        s += `<circle cx="${cx}" cy="${y}" r="30" fill="none" stroke="${fg}" stroke-opacity=".35"/>`;
      }
      s += `<line x1="40" y1="${y + 90}" x2="560" y2="${y + 90}" stroke="${fg}" stroke-opacity=".4"/>`;
      s += `<circle cx="${100 + r() * 400}" cy="${80 + r() * 60}" r="3" fill="${fg}"/><circle cx="${100 + r() * 400}" cy="${480 + r() * 60}" r="2" fill="${fg}"/>`;
      return s;
    },
    split(r, [bg, fg, ac]) {
      const sx = 220 + r() * 160;
      let s = `<rect width="${S}" height="${S}" fill="${bg}"/>`;
      s += `<rect x="${sx}" y="0" width="${S - sx}" height="${S}" fill="${fg}"/>`;
      const cy = 200 + r() * 200;
      s += `<circle cx="${sx}" cy="${cy}" r="${110 + r() * 50}" fill="${ac}"/>`;
      s += `<rect x="${sx - 1}" y="0" width="2" height="${S}" fill="${bg}"/>`;
      for (let i = 0; i < 5; i++) s += `<rect x="40" y="${470 + i * 18}" width="${60 + r() * 120}" height="4" fill="${fg}" opacity=".6"/>`;
      return s;
    }
  };

  /** Returns an SVG string for a release. */
  let uidN = 0;
  const svg = (p, { label = true } = {}) => {
    const r = rng(p.id + ':cover');
    const pal = p.cover.pal;
    const body = (styles[p.cover.style] || styles.orbit)(r, pal, p, 'c' + (++uidN));
    const meta = label ? `<g font-family="JetBrains Mono, monospace" font-size="15" letter-spacing="2" fill="${pal[1]}" opacity=".85"><text x="32" y="44">${esc(p.artistName.toUpperCase().slice(0, 30))}</text><text x="568" y="574" text-anchor="end">${esc(p.title.toUpperCase().slice(0, 30))}</text></g>` : '';
    return `<svg class="cover-svg" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Обложка: ${esc(p.artistName)} — ${esc(p.title)}" preserveAspectRatio="xMidYMid slice">${body}${meta}</svg>`;
  };

  /** CSS custom props for the vinyl centre label */
  const labelVars = p => `--label-bg:${p.cover.pal[2]};--label-fg:${p.cover.pal[1]}`;

  return { svg, labelVars };
})();
