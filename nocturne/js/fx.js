/* NOCTURNE — motion layer: intro, custom cursor, scroll progress, split headings, scroll-reactive marquee */
N.fx = (() => {
  const { qs, qsa, reducedMotion } = N.utils;
  const fine = () => matchMedia('(pointer:fine)').matches;

  /* ---------- intro (once per session) ---------- */
  const intro = () => {
    let seen = false;
    try { seen = sessionStorage.getItem('nocturne:intro') === '1'; sessionStorage.setItem('nocturne:intro', '1'); } catch { seen = true; }
    if (seen || reducedMotion()) return Promise.resolve();
    const root = document.documentElement;
    root.classList.add('is-intro');
    const el = document.createElement('div');
    el.className = 'intro';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<div class="intro__disc"><span class="disc disc--spin"><span class="disc__label"><i></i></span><span class="disc__sheen"></span></span></div>
      <p class="intro__word">${'NOCTURNE'.split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</p>
      <p class="intro__meta mono"><span>Независимый магазин винила</span><span class="intro__count">000</span></p>`;
    document.body.appendChild(el);
    const count = qs('.intro__count', el);
    return new Promise(res => {
      const t0 = performance.now(), D = 1300;
      const step = t => {
        const k = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - k, 3);
        count.textContent = String(Math.round(e * 100)).padStart(3, '0');
        if (k < 1) return requestAnimationFrame(step);
        el.classList.add('is-out');
        root.classList.remove('is-intro');
        setTimeout(() => { el.remove(); }, 1000);
        res();
      };
      requestAnimationFrame(step);
    });
  };

  /* ---------- custom cursor ---------- */
  const cursor = () => {
    if (!fine() || reducedMotion()) return;
    const c = document.createElement('div');
    c.className = 'cursor'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor__ring"><b class="cursor__label"></b></span><span class="cursor__dot"></span>';
    document.body.appendChild(c);
    document.documentElement.classList.add('has-cursor');
    const ring = qs('.cursor__ring', c), dot = qs('.cursor__dot', c), label = qs('.cursor__label', c);
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, shown = false;
    const rules = [
      ['[data-rail] .card__media', 'Открыть'], ['[data-rail]', 'Тянуть'],
      ['.card__media, .feat__media, .colitem__media, .newpage__lead, .weekly__card, .edit__pick', 'Открыть'],
      ['.genre-row', 'Смотреть'], ['.colrow__link, .nextcol', 'Войти'], ['.pdp__deck', '◐'], ['.hero__deck', '33⅓']
    ];
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; c.classList.add('is-on'); }
      const t = e.target;
      let lab = '';
      for (const [sel, l] of rules) if (t.closest?.(sel)) { lab = l; break; }
      if (lab === 'Открыть' && t.closest('[data-rail]') && t.closest('.card__actions')) lab = '';
      c.classList.toggle('has-label', !!lab);
      if (lab) label.textContent = lab;
      c.classList.toggle('is-link', !lab && !!t.closest?.('a, button, input, select, label, [role=tab]'));
    }, { passive: true });
    addEventListener('pointerdown', () => c.classList.add('is-down'));
    addEventListener('pointerup', () => c.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => { c.classList.remove('is-on'); shown = false; });
    const loop = () => {
      rx += (x - rx) * .2; ry += (y - ry) * .2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  };

  /* ---------- scroll progress + marquee velocity ---------- */
  const scroll = () => {
    const bar = document.createElement('div');
    bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
    qs('#siteHeader').appendChild(bar);
    let last = scrollY, vel = 0;
    const tick = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      const d = scrollY - last; last = scrollY;
      vel += (d - vel) * .15;
      if (!reducedMotion()) qsa('.marquee__track').forEach(t => {
        const a = t.getAnimations()[0];
        if (a) a.playbackRate = 1 + Math.min(6, Math.abs(vel) * .25) * (vel < -0.5 ? -1 : 1);
        t.style.setProperty('--skew', `${Math.max(-8, Math.min(8, vel * -.3))}deg`);
      });
      requestAnimationFrame(tick);
    };
    tick();
  };

  /* ---------- split headings into words for masked reveal ---------- */
  const SPLIT = '.page-title, .cat__title, .sec-head__title, .colhero__title, .weekly__title, .news__title, .edit__title, .order__title, .notfound h1, .pdp__title, .artist-band__name, .visit__addr';
  const split = root => {
    if (reducedMotion()) return;
    qsa(SPLIT, root).forEach(el => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      let i = 0;
      const walk = node => {
        [...node.childNodes].forEach(n => {
          if (n.nodeType === 3) {
            const parts = n.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach(p => {
              if (!p) return;
              if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span'); w.className = 'w';
              const inner = document.createElement('span'); inner.textContent = p; inner.style.setProperty('--w', i++);
              w.appendChild(inner); frag.appendChild(w);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1 && !/^(SUP|BR|SVG)$/.test(n.tagName)) walk(n);
        });
      };
      walk(el);
      el.classList.add('split');
      if (!el.closest('[data-reveal]')) el.setAttribute('data-reveal', '');
    });
  };

  /* ---------- magnetic buttons ---------- */
  const magnetic = () => {
    if (!fine() || reducedMotion()) return;
    document.addEventListener('pointermove', e => {
      const b = e.target.closest?.('.btn--accent, .btn--paper, .icon-btn--line');
      qsa('.is-magnet').forEach(m => { if (m !== b) { m.classList.remove('is-magnet'); m.style.translate = ''; } });
      if (!b || b.disabled) return;
      const r = b.getBoundingClientRect();
      b.classList.add('is-magnet');
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`;
    }, { passive: true });
  };

  return { intro, cursor, scroll, split, magnetic };
})();
