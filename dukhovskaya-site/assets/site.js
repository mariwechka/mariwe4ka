import { catalog, formatPrice } from './catalog.js';
import { reviews, telegramUsername } from './config.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function initializeMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const mobile = matchMedia('(max-width: 760px)');

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.header-inner')) setOpen(false);
  });
}

function initializeReveals(reducedMotion) {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('motion');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.13 });

  document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
}

function initializeCardTilt(reducedMotion) {
  if (reducedMotion.matches || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  for (const card of document.querySelectorAll('.direction-card')) {
    card.addEventListener('pointermove', (event) => {
      if (reducedMotion.matches) return;
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty('--tilt-x', `${-y * 7}deg`);
      card.style.setProperty('--tilt-y', `${x * 7}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  }
}

function initializeHero(reducedMotion) {
  const hero = document.querySelector('.hero');
  if (!hero || !('IntersectionObserver' in window) || !('ResizeObserver' in window)) return;

  const canvas = hero.querySelector('.embers');
  const artwork = hero.querySelector('.hero-image img');
  const context = canvas.getContext('2d');
  if (!context) return;

  let width = 0;
  let height = 0;
  let embers = [];
  let frame = 0;
  let lastTime = 0;
  let visible = false;
  let pointerX = 0;
  let pointerY = 0;
  let panX = 0;
  let panY = 0;

  function makeEmber(fromBottom = false) {
    return {
      x: width * (0.3 + Math.random() * 0.7),
      y: height * (fromBottom ? 0.94 + Math.random() * 0.13 : 0.38 + Math.random() * 0.65),
      speed: 6 + Math.random() * 14,
      size: 0.5 + Math.random() * 1.15,
      phase: Math.random() * Math.PI * 2,
      light: 0.24 + Math.random() * 0.52,
    };
  }

  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.7);
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    embers = Array.from({ length: width < 701 ? 20 : 42 }, () => makeEmber());
  }

  function draw(time) {
    const seconds = Math.min((time - (lastTime || time)) / 1000, 0.04);
    lastTime = time;

    const scale = Math.min(1, seconds * 3.4);
    panX += (pointerX - panX) * scale;
    const targetY = pointerY + Math.max(-hero.getBoundingClientRect().top, 0) * 0.035;
    panY += (targetY - panY) * scale;
    artwork.style.setProperty('--pan-x', `${panX.toFixed(2)}px`);
    artwork.style.setProperty('--pan-y', `${panY.toFixed(2)}px`);

    context.clearRect(0, 0, width, height);
    for (let index = 0; index < embers.length; index += 1) {
      const ember = embers[index];
      ember.y -= ember.speed * seconds;
      ember.x += Math.sin(time / 1700 + ember.phase) * seconds * 8;
      if (ember.y < height * 0.25) embers[index] = makeEmber(true);

      const fade = Math.min(1, Math.max(0, (ember.y / height - 0.25) * 4));
      const flicker = 0.68 + Math.sin(time / 550 + ember.phase) * 0.32;
      context.fillStyle = `rgba(255, 179, 104, ${ember.light * fade * flicker})`;
      context.beginPath();
      context.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
      context.fill();
    }
    frame = requestAnimationFrame(draw);
  }

  function refreshAnimation() {
    if (visible && !document.hidden && !reducedMotion.matches) {
      if (!frame) frame = requestAnimationFrame(draw);
      return;
    }

    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (reducedMotion.matches) {
      context.clearRect(0, 0, width, height);
      artwork.style.removeProperty('--pan-x');
      artwork.style.removeProperty('--pan-y');
    }
  }

  resize();
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    refreshAnimation();
  }).observe(hero);
  reducedMotion.addEventListener('change', refreshAnimation);
  document.addEventListener('visibilitychange', refreshAnimation);

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('pointermove', (event) => {
      pointerX = (event.clientX / width - 0.5) * -16;
      pointerY = ((event.clientY - hero.getBoundingClientRect().top) / height - 0.5) * -11;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => {
      pointerX = 0;
      pointerY = 0;
    });
  }
}

function buildCatalogGroup(group, index) {
  const section = element('section', 'catalog-group');
  section.dataset.category = group.category;
  const title = element('h2', '', group.title);
  title.id = `catalog-group-${index}`;
  const mark = element('span', 'catalog-mark', group.mark);
  mark.setAttribute('aria-hidden', 'true');
  title.prepend(mark);
  section.setAttribute('aria-labelledby', title.id);
  section.append(title);

  const rows = element('div', 'catalog-rows');
  for (const [id, name, amount, description] of group.services) {
    const row = element('details', 'catalog-row');
    const summary = element('summary');
    const toggle = element('span', 'catalog-toggle');
    toggle.setAttribute('aria-hidden', 'true');
    summary.append(element('span', 'catalog-name', name), element('span', 'catalog-price', formatPrice(amount)), toggle);
    const detail = element('div', 'catalog-detail');
    detail.append(element('p', '', description));
    if (group.note) detail.append(element('p', 'detail-note', group.note));
    const link = element('a', 'button button-outline', 'Выбрать услугу');
    link.href = `../booking/?service=${encodeURIComponent(id)}`;
    detail.append(link);
    row.append(summary, detail);
    rows.append(row);
  }

  section.append(rows);
  return section;
}

function initializeCatalog() {
  const root = document.querySelector('#catalog-groups');
  if (!root) return;

  const buttons = [...document.querySelectorAll('.catalog-filters button')];
  const status = document.querySelector('#catalog-status');
  const groups = catalog.map(buildCatalogGroup);
  root.append(...groups);

  function syncFilter() {
    const value = new URLSearchParams(location.search).get('category');
    const active = buttons.some((button) => button.dataset.category === value) ? value : 'all';
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.category === active));

    let count = 0;
    for (const group of groups) {
      group.hidden = active !== 'all' && group.dataset.category !== active;
      if (!group.hidden) count += group.querySelectorAll('details').length;
    }
    status.textContent = `Позиций в каталоге: ${count}`;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      const url = new URL(location.href);
      if (button.dataset.category === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', button.dataset.category);
      history.pushState(null, '', url);
      syncFilter();
    });
  }

  window.addEventListener('popstate', syncFilter);
  syncFilter();
}

function initializeReviews() {
  const grid = document.querySelector('#review-grid');
  if (!grid || reviews.length === 0) return;

  for (const review of reviews) {
    const card = element('figure', 'review-card');
    const mark = element('span', 'review-decoration', '✧');
    mark.setAttribute('aria-hidden', 'true');
    const attribution = review.service ? `${review.name} · ${review.service}` : review.name;
    card.append(mark, element('blockquote', '', review.quote), element('figcaption', '', attribution));
    grid.append(card);
  }

  document.querySelector('#reviews-empty').hidden = true;
  grid.hidden = false;
}

function initializeBooking() {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const service = document.querySelector('#booking-service');
  const name = document.querySelector('#booking-name');
  const question = document.querySelector('#booking-message');
  const price = document.querySelector('#booking-price');
  const result = document.querySelector('#booking-result');
  const heading = document.querySelector('#result-title');
  const text = document.querySelector('#result-text');
  const telegram = document.querySelector('#booking-telegram');
  const contactNote = document.querySelector('#booking-contact-note');
  const copy = document.querySelector('#booking-copy');
  const status = document.querySelector('#copy-status');
  const services = new Map();

  for (const group of catalog) {
    const options = document.createElement('optgroup');
    options.label = group.title;
    for (const [id, title, amount] of group.services) {
      services.set(id, { group: group.title, title, amount });
      const option = new Option(`${title} · ${formatPrice(amount)}`, id);
      options.append(option);
    }
    service.append(options);
  }

  const requestedService = new URLSearchParams(location.search).get('service');
  if (services.has(requestedService)) service.value = requestedService;

  function showPrice() {
    const selected = services.get(service.value);
    price.hidden = !selected;
    price.textContent = selected ? `По прайсу — ${formatPrice(selected.amount)}` : '';
  }

  function copyFallback() {
    const selection = window.getSelection();
    if (!selection) return false;

    const range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);
    if (document.execCommand('copy')) {
      selection.removeAllRanges();
      return true;
    }
    return false;
  }

  service.addEventListener('change', showPrice);
  form.addEventListener('input', () => {
    name.setCustomValidity('');
    result.hidden = true;
    status.textContent = '';
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const customer = name.value.trim();
    if (!customer) {
      name.setCustomValidity('Укажите имя.');
      name.reportValidity();
      return;
    }

    const selected = services.get(service.value);
    const draft = [`Здравствуйте! Меня зовут ${customer}.`];
    if (selected) draft.push(`Хочу записаться на услугу «${selected.title}» (${selected.group}, ${formatPrice(selected.amount)} по прайсу).`);
    else draft.push('Хочу обсудить свой запрос и выбрать подходящую услугу.');
    if (question.value.trim()) draft.push('', question.value.trim());

    text.textContent = draft.join('\n');
    if (/^[A-Za-z0-9_]{5,32}$/.test(telegramUsername)) {
      const destination = new URL(`https://t.me/${telegramUsername}`);
      destination.searchParams.set('text', text.textContent);
      // Telegram on iOS requires percent-encoded spaces in draft links.
      destination.search = destination.search.replace(/\+/g, '%20');
      telegram.href = destination.href;
      telegram.hidden = false;
      contactNote.textContent = 'Откройте переписку в Telegram и отправьте сообщение, когда будете готовы.';
    } else {
      contactNote.textContent = 'Контакт для записи пока не указан. Вы можете скопировать сообщение.';
    }

    result.hidden = false;
    heading.focus();
  });

  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text.textContent);
      status.textContent = 'Текст скопирован.';
    } catch {
      const copied = copyFallback();
      status.textContent = copied ? 'Текст скопирован.' : 'Выделите текст и скопируйте его вручную.';
    }
  });

  showPrice();
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
initializeMenu();
initializeReveals(reducedMotion);
initializeCardTilt(reducedMotion);
initializeHero(reducedMotion);
initializeCatalog();
initializeReviews();
initializeBooking();

