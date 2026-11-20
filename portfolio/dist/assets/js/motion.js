/* Portfolio — motion layer (GSAP + ScrollTrigger + Lenis).
   Everything here is progressive: without these libraries, or with
   prefers-reduced-motion, main.js keeps the site fully usable. */
(() => {
  const { gsap, ScrollTrigger } = window;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const seen = () => { try { sessionStorage.setItem('pf:seen', '1'); } catch (e) { /* private mode */ } };

  if (!gsap || !ScrollTrigger || reduced) { root.classList.remove('is-preload'); seen(); return; }
  gsap.registerPlugin(ScrollTrigger);
  root.classList.add('gsap-on');

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    root.style.scrollBehavior = 'auto';
    // in-page anchors
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.4 });
    });
    $('[data-top]')?.addEventListener('click', e => { e.stopImmediatePropagation(); lenis.scrollTo(0, { duration: 1.6 }); }, true);
    // freeze while the mobile menu is open
    const toggle = $('[data-menu-toggle]');
    if (toggle) new MutationObserver(() => (toggle.getAttribute('aria-expanded') === 'true' ? lenis.stop() : lenis.start())).observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
  }

  /* ---------- preloader → page entrance ---------- */
  const entrance = () => {
    seen();
    const tl = gsap.timeline();
    const top = $('.hero__top'), lead = $('.hero__lead'), cta = $('.hero__cta');
    if (top) tl.add(() => [top, lead, cta].forEach((el, i) => el && setTimeout(() => el.classList.add('in'), 450 + i * 120)));
    $$('.phero [data-rv], .phead [data-rv]').forEach((el, i) => setTimeout(() => el.classList.add('in'), 250 + i * 90));
    ScrollTrigger.refresh();
  };
  const pre = $('.pre');
  if (root.classList.contains('is-preload') && pre) {
    const count = $('.pre__count', pre), state = { v: 0 };
    gsap.timeline({ onComplete: () => { root.classList.remove('is-preload'); entrance(); } })
      .to($$('.pre__name span', pre), { yPercent: -110, y: 0, duration: 0, immediateRender: true })
      .fromTo($$('.pre__name span', pre), { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: 'expo.out' }, 0)
      .to(state, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(state.v)).padStart(3, '0'); } }, 0)
      .to($('.pre__bar i', pre), { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0)
      .to($('.pre__dot', pre), { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 0.9)
      .to($$('.pre__name span', pre), { yPercent: -110, duration: 0.6, stagger: 0.03, ease: 'expo.in' }, 1.65)
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, 1.95);
  } else {
    root.classList.remove('is-preload');
    entrance();
  }

  /* ---------- reveals (batched) ---------- */
  ScrollTrigger.batch('[data-rv]:not(.hero [data-rv]):not(.phero [data-rv]):not(.phead [data-rv])', {
    start: 'top 92%', once: true,
    onEnter: els => els.forEach((el, i) => { el.style.transitionDelay = `${i * 0.08}s`; el.classList.add('in'); })
  });
  ScrollTrigger.batch('[data-split]', { start: 'top 90%', once: true, onEnter: els => els.forEach(el => el.classList.add('in')) });

  /* ---------- hero: scroll-out ---------- */
  const hero = $('.hero');
  if (hero) {
    gsap.to('.hero__name', { yPercent: 38, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__grid, .hero__foot', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: '30% top', end: 'bottom top', scrub: true } });
  }

  /* ---------- word-by-word fill on scroll ---------- */
  $$('[data-fill]').forEach(el => {
    const words = $$('.fw', el);
    gsap.to(words, { opacity: 1, stagger: 0.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: 0.6 } });
    const pills = $$('.pillimg', el);
    pills.forEach(p => gsap.fromTo(p, { scale: 0, rotate: -18 }, { scale: 1, rotate: 0, ease: 'back.out(1.6)', scrollTrigger: { trigger: p, start: 'top 88%', end: 'top 62%', scrub: 0.6 } }));
  });

  /* ---------- horizontal works (desktop) ---------- */
  const hw = $('.hw'), track = $('[data-hscroll]'), bar = $('.hw__bar i');
  if (hw && track) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', () => {
      const dist = () => Math.max(0, track.scrollWidth - track.clientWidth + parseFloat(getComputedStyle(track).paddingRight));
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: hw, pin: '.hw__pin', start: 'top top', end: () => '+=' + dist(), scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => bar && gsap.set(bar, { scaleX: s.progress }) }
      });
      $$('.hcard__img', track).forEach(img => gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.hcard'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
      $$('.hcard__num', track).forEach(n => gsap.fromTo(n, { x: 80 }, { x: -40, ease: 'none', scrollTrigger: { trigger: n.closest('.hcard'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
      return () => gsap.set(track, { x: 0 });
    });
    mm.add('(max-width: 860px)', () => {
      const upd = () => { const m = track.scrollWidth - track.clientWidth; gsap.set(bar, { scaleX: m > 0 ? track.scrollLeft / m : 1 }); };
      track.addEventListener('scroll', upd, { passive: true }); upd();
      return () => track.removeEventListener('scroll', upd);
    });
  }

  /* ---------- band reacts to scroll velocity ---------- */
  const band = $('.band__track');
  if (band) {
    const anim = band.getAnimations()[0];
    let skew = 0;
    ScrollTrigger.create({ trigger: '.band', start: 'top bottom', end: 'bottom top', onUpdate: s => {
      const v = s.getVelocity();
      if (anim) anim.playbackRate = gsap.utils.clamp(-6, 6, 1 + v / 400) || 1;
      skew = gsap.utils.clamp(-10, 10, v / -150);
      gsap.to(band, { skewX: skew, duration: 0.4, overwrite: true });
    } });
    gsap.fromTo('.band', { rotate: -4 }, { rotate: 2, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- outlined numerals drift ---------- */
  $$('.shead[data-num]').forEach(h => gsap.fromTo(h, { '--ny': '40%' }, { '--ny': '-40%', ease: 'none', scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: true } }));

  /* ---------- finale ---------- */
  $$('.finale__orb, .cpage__orb').forEach(o => gsap.fromTo(o, { scale: 0.35, xPercent: 20 }, { scale: 1, xPercent: 0, ease: 'none', scrollTrigger: { trigger: o.parentElement, start: 'top bottom', end: 'center center', scrub: true } }));

  /* ---------- project pages ---------- */
  $$('.phero__img').forEach(el => {
    gsap.fromTo(el, { clipPath: 'inset(14% 12% 0% 12% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 15%', scrub: true } });
    gsap.fromTo($('img', el), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.phero__poster img').forEach(img => gsap.fromTo(img, { rotate: 8, y: 40 }, { rotate: -3, y: -40, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.pblocks .frame:not(.frame--scroll)').forEach(f => {
    gsap.fromTo(f, { clipPath: 'inset(10% 0% 10% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 6px)', ease: 'none', scrollTrigger: { trigger: f, start: 'top 95%', end: 'top 45%', scrub: true } });
    const img = $('img', f);
    if (img) gsap.fromTo(img, { scale: 1.18, yPercent: -4 }, { scale: 1, yPercent: 4, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.phones .phone').forEach((p, i) => gsap.fromTo(p, { y: 60 + i * 50 }, { y: -30 - i * 25, ease: 'none', scrollTrigger: { trigger: p.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.strip').forEach(s => gsap.fromTo(s, { x: 120 }, { x: -60, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.pnext b').forEach(b => gsap.fromTo(b, { xPercent: 20 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.photo__slot').forEach(p => gsap.fromTo(p, { clipPath: 'inset(20% 20% 20% 20% round 200px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', ease: 'none', scrollTrigger: { trigger: p, start: 'top 95%', end: 'top 40%', scrub: true } }));
  $$('.work__media').forEach(m => {
    const img = $('img', m);
    gsap.fromTo(m, { clipPath: 'inset(16% 8% 0% 8% round 22px)' }, { clipPath: 'inset(0% 0% 0% 0% round 4px)', ease: 'none', scrollTrigger: { trigger: m, start: 'top 98%', end: 'top 50%', scrub: true } });
    if (img) gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // count-up for numeric facts like "36", "≈70 KB", "0 KB"
  $$('.facts dt').forEach(dt => {
    const m = dt.textContent.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    const [, pre, num, post] = m, state = { v: 0 };
    ScrollTrigger.create({ trigger: dt, start: 'top 90%', once: true, onEnter: () => gsap.to(state, { v: +num, duration: 1.6, ease: 'power3.out', onUpdate: () => { dt.textContent = pre + Math.round(state.v) + post; } }) });
  });

  /* ---------- pointer effects ---------- */
  if (fine) {
    // 3D tilt for project media
    $$('.hcard__media, .work__media').forEach(m => {
      m.addEventListener('pointermove', e => {
        const r = m.getBoundingClientRect();
        m.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
        m.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -8}deg`);
      });
      m.addEventListener('pointerleave', () => { m.style.setProperty('--rx', '0deg'); m.style.setProperty('--ry', '0deg'); });
    });
    // magnetic elements
    $$('[data-magnet], .pill, .badge, .burger, .logo__mark').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
    // text scramble on hover
    const glyphs = '!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNPQRSTUVWXYZ';
    $$('[data-scramble]').forEach(el => {
      const final = el.textContent;
      let raf = 0;
      (el.closest('a') || el).addEventListener('pointerenter', () => {
        cancelAnimationFrame(raf);
        const t0 = performance.now(), dur = 420;
        const step = t => {
          const k = Math.min(1, (t - t0) / dur), n = Math.floor(final.length * k);
          el.textContent = final.slice(0, n) + [...final.slice(n)].map(c => (c === ' ' ? ' ' : glyphs[Math.floor(Math.random() * glyphs.length)])).join('');
          if (k < 1) raf = requestAnimationFrame(step); else el.textContent = final;
        };
        raf = requestAnimationFrame(step);
      });
    });
  }

  /* ---------- hero: generative dot field ---------- */
  const cv = $('[data-field]');
  if (cv && hero) {
    const ctx = cv.getContext('2d');
    const css = getComputedStyle(root);
    const INK = css.getPropertyValue('--ink').trim() || '#151515';
    const PAPER = css.getPropertyValue('--paper').trim() || '#f1efea';
    const BLUE = css.getPropertyValue('--blue').trim() || '#2a3bff';
    let W = 0, H = 0, dpr = 1, gap = 24, pts = [];
    const mouse = { x: -999, y: -999, tx: -999, ty: -999, on: false };
    const resize = () => {
      const r = hero.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = W < 860 ? 18 : 24;
      pts = [];
      for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) pts.push(x, y);
    };
    resize();
    addEventListener('resize', () => { resize(); ScrollTrigger.refresh(); });
    if (fine) {
      hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.on = true; });
      hero.addEventListener('pointerleave', () => { mouse.on = false; });
    }
    let grow = 0;
    ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onUpdate: s => { grow = s.progress; } });
    const L = 170;
    const draw = t => {
      if (scrollY > H + 50) return; // off-screen: skip work
      t /= 1000;
      if (!mouse.on) { if (fine) { mouse.tx = W * (0.55 + 0.3 * Math.sin(t * 0.4)); mouse.ty = H * (0.5 + 0.25 * Math.sin(t * 0.63)); } else { mouse.tx = mouse.ty = -999; } }
      mouse.x += (mouse.tx - mouse.x) * 0.12; mouse.y += (mouse.ty - mouse.y) * 0.12;
      const mobile = W < 860;
      const cx = W * (mobile ? 0.8 : 0.79) + Math.sin(t * 0.3) * 30, cy = H * (mobile ? 0.24 : 0.4) + Math.cos(t * 0.25) * 24;
      const R = (mobile ? W * 0.3 : Math.min(W, H) * 0.3) * (1 + grow * 0.9);
      const rad = a => R * (1 + 0.07 * Math.sin(3 * a + t * 0.9) + 0.05 * Math.sin(5 * a - t * 1.3) + 0.03 * Math.sin(2 * a + t * 0.5));
      ctx.clearRect(0, 0, W, H);
      // blob
      ctx.beginPath();
      for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2, r = rad(a); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath(); ctx.fillStyle = BLUE; ctx.fill();
      // dots, grouped by colour
      const pInk = new Path2D(), pPaper = new Path2D(), pBlue = new Path2D();
      for (let i = 0; i < pts.length; i += 2) {
        let x = pts[i], y = pts[i + 1];
        const dx = x - mouse.x, dy = y - mouse.y, d = Math.hypot(dx, dy);
        let s = 1.05, lens = 0;
        if (d < L) { lens = 1 - d / L; const push = lens * lens * 28; x += dx / (d || 1) * push; y += dy / (d || 1) * push; s += lens * 2.4; }
        const bx = x - cx, by = y - cy, bd = Math.hypot(bx, by);
        const inside = bd < R * 1.2 && bd < rad(Math.atan2(by, bx));
        if (inside) { const depth = 1 - bd / R; s = 0.6 + depth * 2.6 + lens * 1.5; pPaper.moveTo(x + s, y); pPaper.arc(x, y, s, 0, Math.PI * 2); }
        else if (lens > 0.15) { pBlue.moveTo(x + s, y); pBlue.arc(x, y, s, 0, Math.PI * 2); }
        else { pInk.moveTo(x + s, y); pInk.arc(x, y, s, 0, Math.PI * 2); }
      }
      ctx.globalAlpha = 0.22; ctx.fillStyle = INK; ctx.fill(pInk);
      ctx.globalAlpha = 0.95; ctx.fillStyle = PAPER; ctx.fill(pPaper);
      ctx.globalAlpha = 1; ctx.fillStyle = BLUE; ctx.fill(pBlue);
    };
    gsap.ticker.add(() => draw(performance.now()));
    gsap.fromTo(cv, { opacity: 0 }, { opacity: 1, duration: 1.6, delay: root.classList.contains('is-preload') ? 2.4 : 0.2, ease: 'power2.out' });
  }

  /* ---------- keep measurements right ---------- */
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());
})();
