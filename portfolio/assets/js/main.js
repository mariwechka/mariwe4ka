/* Portfolio — client behaviour. No dependencies. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let UI = {};
  try { UI = JSON.parse(document.body.dataset.ui || '{}'); } catch (e) { /* defaults below */ }

  /* ---------- page transitions ---------- */
  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) { /* noop */ } }
  };
  const veilLabel = $('.veil__label');
  if (root.classList.contains('is-arriving')) {
    if (veilLabel) veilLabel.textContent = root.dataset.veil && root.dataset.veil !== '1' ? root.dataset.veil : '';
    store.del('pf:veil');
    setTimeout(() => root.classList.add('is-arrived'), 120);
    setTimeout(() => root.classList.remove('is-arriving', 'is-arrived'), 1100);
  }
  // without the motion engine there is no preloader
  if (!window.gsap) { root.classList.remove('is-preload'); store.set('pf:seen', '1'); }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (/^(mailto:|tel:|#)/.test(href)) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin && location.protocol !== 'file:') return;
    if (url.pathname === location.pathname && url.hash) return;
    if (a.dataset.lang) { try { localStorage.setItem('pf:lang', a.dataset.lang); } catch (err) { /* noop */ } }
    if (reduced) return;
    e.preventDefault();
    // the label of the destination link becomes the word on the curtain
    const label = (a.dataset.veil || a.querySelector('[data-scramble], .hcard__title, .work__title, .yours__title')?.textContent || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 28);
    const short = label.length > 1 && label.length <= 28 && !/^[A-Z]{2}$/.test(label) ? label : '';
    store.set('pf:veil', short || '1');
    if (veilLabel) veilLabel.textContent = short;
    root.classList.add('is-leaving');
    setTimeout(() => { location.href = a.href; }, 720);
  });
  addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('is-leaving', 'is-arriving', 'is-arrived'); });

  /* ---------- header ---------- */
  const hdr = $('#hdr');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-scrolled', y > 10);
    const menuOpen = $('#menu').classList.contains('is-open');
    if (y > 500 && y > lastY + 6 && !menuOpen) hdr.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 500) hdr.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- mobile menu ---------- */
  const menu = $('#menu'), toggle = $('[data-menu-toggle]');
  const setMenu = on => {
    toggle.setAttribute('aria-expanded', String(on));
    if (on) { menu.hidden = false; requestAnimationFrame(() => menu.classList.add('is-open')); document.body.style.overflow = 'hidden'; setTimeout(() => $('a', menu)?.focus(), 300); }
    else { menu.classList.remove('is-open'); document.body.style.overflow = ''; setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 700); }
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); toggle.focus(); } });
  matchMedia('(min-width: 861px)').addEventListener('change', m => { if (m.matches) setMenu(false); });

  /* ---------- toast & copy ---------- */
  const toastEl = $('.toast');
  let toastT;
  const toast = msg => { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2400); };
  const copyText = async text => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove(); return ok;
    }
  };
  document.addEventListener('click', async e => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const ok = await copyText(b.dataset.copy);
    const label = $('span', b), old = label.textContent;
    if (ok) {
      b.classList.add('is-done'); label.textContent = UI.copied || 'Copied';
      toast(`${UI.copied || 'Copied'}: ${b.dataset.copy}`);
      setTimeout(() => { b.classList.remove('is-done'); label.textContent = old; }, 1800);
    } else toast(UI.copyFail || 'Copy failed');
  });

  $('[data-top]')?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ---------- split headings into words ---------- */
  $$('[data-split]').forEach(el => {
    let n = 0;
    const walk = node => [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--w', n++);
          w.appendChild(s); frag.appendChild(w);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
    });
    walk(el);
    el.classList.add('split-on');
  });

  /* ---------- reveal on scroll ----------
     A plain position check (rAF-throttled) instead of IntersectionObserver:
     simpler, and immune to the clipping quirks seen with overflow-x: clip. */
  let pending = $$('[data-rv], [data-split]');
  if (window.gsap && !reduced) { /* motion.js takes over reveals */ }
  else if (reduced) pending.forEach(el => el.classList.add('in'));
  else {
    let queued = false;
    const check = () => {
      queued = false;
      const limit = innerHeight * 0.94;
      pending = pending.filter(el => {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
        return true;
      });
    };
    const onRv = () => { if (pending.length && !queued) { queued = true; requestAnimationFrame(check); } };
    addEventListener('scroll', onRv, { passive: true });
    addEventListener('resize', onRv);
    check();
  }

  /* ---------- hero: variable-weight name ---------- */
  const word = $('[data-weight]');
  if (word && !reduced) {
    const letters = $$('.hero__l', word);
    const dot = $('.hero__dot');
    let px = -9999, py = -9999, active = false, t0 = performance.now();
    if (fine) {
      addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; active = true; }, { passive: true });
      document.addEventListener('pointerleave', () => { active = false; });
    }
    // wait for the intro animation before driving weights
    // once the last letter has risen, hand the letters over to the weight loop
    letters[letters.length - 1].addEventListener('animationend', () => letters.forEach(l => { l.style.animation = 'none'; l.style.transform = 'none'; }), { once: true });
    const loop = t => {
      const rect = word.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const near = active && py > rect.top - 200 && py < rect.bottom + 200;
        letters.forEach((l, i) => {
          let w;
          if (near) {
            const r = l.getBoundingClientRect();
            const d = Math.abs(px - (r.left + r.width / 2)) / rect.width;
            w = 900 - Math.min(1, d * 2.6) * 700;
          } else {
            w = 520 + 330 * (0.5 + 0.5 * Math.sin((t - t0) / 900 - i * 0.55));
          }
          l.style.setProperty('--w', Math.round(w));
        });
        if (dot && near) {
          const dr = dot.getBoundingClientRect();
          const dx = Math.max(-1, Math.min(1, (px - (dr.left + dr.width / 2)) / 400));
          const dy = Math.max(-1, Math.min(1, (py - (dr.top + dr.height / 2)) / 400));
          dot.style.translate = `${dx * 14}px ${dy * 14}px`;
        } else if (dot) dot.style.translate = '0 0';
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- custom cursor ---------- */
  if (fine && !reduced) {
    const c = document.createElement('div');
    c.className = 'cursor is-off'; c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<span class="cursor__ring"></span><span class="cursor__dot"></span><span class="cursor__label"></span>';
    document.body.appendChild(c);
    const label = $('.cursor__label', c);
    let x = 0, y = 0, cx = 0, cy = 0;
    addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY; c.classList.remove('is-off');
      const t = e.target.closest?.('[data-cursor]');
      c.classList.toggle('has-label', !!t);
      if (t) label.textContent = t.dataset.cursor;
      c.classList.toggle('is-link', !t && !!e.target.closest?.('a, button, label, input, textarea'));
    }, { passive: true });
    document.addEventListener('pointerleave', () => c.classList.add('is-off'));
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- works filter ---------- */
  const grid = $('[data-works]');
  if (grid) {
    const btns = $$('[data-filter]'), empty = $('[data-empty]');
    const apply = (cat, push) => {
      let shown = 0;
      $$('.work', grid).forEach(card => {
        const cats = card.dataset.cats.split(' ');
        const on = !cat || cats.includes(cat) || cats.includes('*');
        if (on && !cats.includes('*')) shown++;
        card.classList.toggle('is-hiding', !on);
        if (on && !reduced) { card.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
      });
      btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
      empty.hidden = shown > 0;
      if (push) { const u = new URL(location.href); if (cat) u.searchParams.set('cat', cat); else u.searchParams.delete('cat'); history.replaceState(null, '', u); }
    };
    btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter, true)));
    const initial = new URLSearchParams(location.search).get('cat');
    if (initial && btns.some(b => b.dataset.filter === initial)) apply(initial, false);
  }

  /* ---------- draggable strips ---------- */
  $$('[data-drag]').forEach(s => {
    let down = false, sx = 0, sl = 0, moved = false;
    s.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; s.classList.add('is-drag'); } s.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('keydown', e => { if (e.key === 'ArrowRight') s.scrollBy({ left: 300, behavior: 'smooth' }); if (e.key === 'ArrowLeft') s.scrollBy({ left: -300, behavior: 'smooth' }); });
  });

  /* ---------- brief → mailto ---------- */
  const form = $('[data-brief]');
  if (form) {
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) { const cb = $(`input[data-id="${CSS.escape(pre)}"]`, form); if (cb) cb.checked = true; }
    const about = form.about, err = $('[data-err]', form);
    about.addEventListener('input', () => { if (about.value.trim()) { err.hidden = true; about.closest('.field').classList.remove('has-error'); } });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = about.value.trim();
      if (!text) { err.hidden = false; about.closest('.field').classList.add('has-error'); about.focus(); return; }
      const services = $$('input[name="service"]:checked', form).map(i => i.value);
      const name = form.name.value.trim();
      const subject = `${form.dataset.subject}${services.length ? ': ' + services.join(', ') : ''}`;
      const body = `${form.dataset.hello}\n\n${services.length ? '— ' + services.join('\n— ') + '\n\n' : ''}${text}\n\n${name}`;
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }
})();
