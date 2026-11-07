/* ============================================================
   @johannescls â€” Portfolio Engine v2
   ============================================================ */

const root = document.documentElement;
const page = document.body.dataset.page || 'home';
// Keep sticky tabs and anchor destinations below the actual header at every size.
const navigation = document.querySelector('.nav');
const sectionTabs = document.querySelector('.tab-bar');
function updateNavigationSize() {
  if (navigation) root.style.setProperty('--nav-height', `${navigation.getBoundingClientRect().height}px`);
  root.style.setProperty('--section-tabs-height', `${sectionTabs?.getBoundingClientRect().height || 0}px`);
}
updateNavigationSize();
if ('ResizeObserver' in window) {
  const navigationObserver = new ResizeObserver(updateNavigationSize);
  if (navigation) navigationObserver.observe(navigation);
  if (sectionTabs) navigationObserver.observe(sectionTabs);
} else {
  addEventListener('resize', updateNavigationSize);
}
// Temporary home-page welcome; dismiss once per tab session.
const constructionNotice = document.querySelector('#construction-notice');
if (constructionNotice) {
  let dismissed = false;
  try { dismissed = sessionStorage.getItem('jc-construction-dismissed') === 'yes'; } catch {}
  constructionNotice.addEventListener('close', () => {
    try { sessionStorage.setItem('jc-construction-dismissed', 'yes'); } catch {}
  });
  if (!dismissed) constructionNotice.showModal();
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let motionPreference = true;
let mode = 'it';
try {
  mode = localStorage.getItem('jc-mode') || (page === 'creative' ? 'creative' : 'it');
  motionPreference = localStorage.getItem('jc-motion') !== 'off';
} catch {}

/* ---------- Theme ---------- */
function setMode(next, persist = false) {
  mode = next === 'creative' ? 'creative' : 'it';
  root.dataset.mode = mode;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = mode === 'creative' ? '#fbf7ee' : '#0f1a2e';

  document.querySelectorAll('[data-switch]').forEach(btn =>
    btn.setAttribute('aria-pressed', String(btn.dataset.switch === mode))
  );

  if (page === 'home') {
    const isDay = mode === 'creative';
    const eyebrow = document.querySelector('[data-hero-eyebrow]');
    const title = document.querySelector('[data-hero-title]');
    const lead = document.querySelector('[data-hero-lead]');
    const cta = document.querySelector('[data-hero-cta]');
    const ctaLabel = document.querySelector('[data-hero-cta-label]');

    if (eyebrow) eyebrow.textContent = isDay ? 'The daylight studio' : 'The after-hours workspace';
    if (title) title.innerHTML = isDay
      ? 'Making<br><span class="italic">stories</span><br>in color.'
      : 'Building<br><span class="italic">systems</span><br>with soul.';
    if (lead) lead.textContent = isDay
      ? 'Visual identities, campus campaigns, and stories worth sharing. Made with a developer’s attention to detail.'
      : 'Mobile and web applications, thoughtful interfaces, and the logic that brings them to life. Made with a designer’s eye.';
    if (ctaLabel) ctaLabel.textContent = isDay ? 'Explore creative work' : 'Explore IT work';
    if (cta) cta.href = isDay ? 'creative.html' : 'it.html';
  }

  if (persist) {
    try { localStorage.setItem('jc-mode', mode); } catch {}
  }
  document.dispatchEvent(new Event('portfolio-mode-change'));
}

/* Initialize theme */
if (page === 'home') {
  setMode(mode);
} else if (page === 'creative') {
  setMode('creative');
} else {
  setMode('it');
}

document.querySelectorAll('[data-switch]').forEach(btn =>
  btn.addEventListener('click', () => setMode(btn.dataset.switch, true))
);

/* ---------- Year ---------- */
document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ---------- Motion ---------- */
function motionEnabled() {
  return motionPreference && !reduceMotion.matches;
}
function applyMotion() {
  root.dataset.motion = motionEnabled() ? 'on' : 'off';
  document.dispatchEvent(new Event('portfolio-motion-change'));
  document.querySelectorAll('.motion-toggle').forEach(btn => {
    btn.textContent = motionEnabled() ? 'Motion: on' : 'Motion: off';
    btn.setAttribute('aria-pressed', String(!motionEnabled()));
    btn.disabled = reduceMotion.matches;
  });
}
document.querySelectorAll('.motion-toggle').forEach(btn =>
  btn.addEventListener('click', () => {
    motionPreference = !motionPreference;
    try { localStorage.setItem('jc-motion', motionPreference ? 'on' : 'off'); } catch {}
    applyMotion();
  })
);
reduceMotion.addEventListener('change', applyMotion);
applyMotion();

/* Small ambient accents run only while visible, and pause in background tabs. */
if ('IntersectionObserver' in window) {
  const accents = [...document.querySelectorAll('.booklat-cover-mark, .internship-monogram, .projects-coming-mark, .luminus-hero-spark, .section > .label, .footer > .label')];
  const visible = new Set();
  const syncAccents = () => accents.forEach(el => {
    el.classList.toggle('ambient-active', visible.has(el) && !document.hidden && motionEnabled());
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    syncAccents();
  });
  accents.forEach(el => { el.classList.add('ambient-accent'); observer.observe(el); });
  document.addEventListener('visibilitychange', syncAccents);
  document.addEventListener('portfolio-motion-change', syncAccents);
}

/* ---------- Scroll progress ---------- */
let frame = false;
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

function onScroll() {
  frame = false;
  const h = root.scrollHeight - innerHeight;
  root.style.setProperty('--page-progress', h > 0 ? clamp(scrollY / h) : 0);
}
addEventListener('scroll', () => {
  if (!frame) { frame = true; requestAnimationFrame(onScroll); }
}, { passive: true });
addEventListener('load', onScroll);

/* ---------- Scroll choreography: headings sweep, artwork lands, cards cascade. ---------- */
if ('IntersectionObserver' in window) {
  const activeEntrances = new Set();
  const cardSelector = '.tool-card, .credit-card, .tile-btn, .exp-row, .luminus-pillars > article, .booklat-chapters > button, .booklat-story-grid > article, .internship-map-node, .luminus-resource, .e-reklamo-resource, .e-reklamo-steps > button';
  const targets = [...document.querySelectorAll([
    '.reveal', '.page-hero-inner', '.section-head', cardSelector,
    '.footer > .label', '.footer-cta', '.footer-meta', '.brochure-heading',
    '.luminus-showcase-heading', '.luminus-hero-browser', '.luminus-hero-phone',
    '[data-entrance]', '.booklat-architecture', '.booklat-stack', '.internship-tour-note', '.credential-card', '.recognition-item', '.skill-heading', '.internship-monogram', '.home-scene', '.home-intro-strip > a', '.home-growing-note'
  ].join(', '))];
  const order = new Map();
  targets.forEach(el => {
    const siblings = [...el.parentElement.children].filter(child => child.matches(cardSelector));
    order.set(el, Math.max(0, siblings.indexOf(el)) % 4);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      io.unobserve(el);
      if (!motionEnabled() || !el.animate) return;
      const heading = el.matches('.page-hero-inner, .section-head, .org-head, .luminus-showcase-heading, .footer-cta');
      const artwork = el.matches('.tile-btn, .about-photo, .luminus-hero-browser, .luminus-hero-phone, [data-entrance]');
      const group = el.querySelector(cardSelector) !== null;
      const book = el.dataset.entrance === 'book';
      const frames = book
        ? [{ opacity: 0, translate: '35px 40px', rotate: '-7deg', scale: '.94' }, { opacity: 1, translate: '0 0', rotate: '0deg', scale: '1' }]
        : group
        ? [{ opacity: .6 }, { opacity: 1 }]
        : artwork
          ? [{ opacity: 0, translate: '0 38px', rotate: '-2deg', scale: '.96' }, { opacity: 1, translate: '0 0', rotate: '0deg', scale: '1' }]
          : heading
            ? [{ opacity: 0, translate: '-26px 18px' }, { opacity: 1, translate: '0 0' }]
            : [{ opacity: 0, translate: '0 30px', scale: '.98' }, { opacity: 1, translate: '0 0', scale: '1' }];
      const animation = el.animate(frames, {
        duration: artwork ? 850 : 720,
        delay: el.matches(cardSelector) ? order.get(el) * 65 : 0,
        easing: 'cubic-bezier(.16, 1, .3, 1)',
        fill: 'backwards'
      });
      activeEntrances.add(animation);
      const release = () => activeEntrances.delete(animation);
      animation.addEventListener('finish', release, { once: true });
      animation.addEventListener('cancel', release, { once: true });
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
  targets.forEach(el => io.observe(el));
  document.addEventListener('portfolio-motion-change', () => {
    if (!motionEnabled()) {
      activeEntrances.forEach(animation => animation.cancel());
      activeEntrances.clear();
    }
  });

  /* Active tab for sub-nav */
  const tabs = [...document.querySelectorAll('.tab-bar a[href^="#"]')];
  const sections = [...document.querySelectorAll('[data-section]')];
  if (tabs.length && sections.length) {
    const sio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          tabs.forEach(t => {
            const isActive = t.getAttribute('href') === '#' + e.target.id;
            t.classList.toggle('active', isActive);
            if (isActive) t.setAttribute('aria-current', 'true');
            else t.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => sio.observe(s));
  }
}

/* ---------- Lightbox ---------- */
const lb = document.querySelector('#lightbox');
if (lb) {
  const lbImg = document.querySelector('#lightbox-image');
  const lbTitle = document.querySelector('#lightbox-title');
  const lbDesc = document.querySelector('#lightbox-description');
  const lbCount = document.querySelector('#lightbox-count');
  const cards = [...document.querySelectorAll('[data-image]')];
  let group = [], index = 0;

  function show(i) {
    if (!group.length) return;
    index = (i + group.length) % group.length;
    const c = group[index];
    lbImg.src = c.dataset.image;
    lbImg.alt = c.querySelector('img')?.alt || c.dataset.title || '';
    lbTitle.textContent = c.dataset.title || '';
    lbDesc.textContent = c.dataset.description || '';
    lbCount.textContent = `${String(index+1).padStart(2,'0')} / ${String(group.length).padStart(2,'0')}`;
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      group = cards.filter(c => c.dataset.group === card.dataset.group);
      show(group.indexOf(card));
      lb.showModal();
    });
  });

  lb.querySelector('[data-close]')?.addEventListener('click', () => lb.close());
  lb.querySelector('[data-prev]')?.addEventListener('click', () => show(index - 1));
  lb.querySelector('[data-next]')?.addEventListener('click', () => show(index + 1));

  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  lb.addEventListener('click', e => {
    if (e.target !== lb) return;
    const r = lb.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right ||
        e.clientY < r.top  || e.clientY > r.bottom) lb.close();
  });
}

/* ---------- Polaroid carousel: seamless loop ---------- */
(function initPolaroidCarousel() {
  const wrap = document.querySelector('.hero-polaroids');
  const track = document.querySelector('.polaroid-track');
  if (!wrap || !track) return;

  /* Duplicate the existing children once so the -50% keyframe loops seamlessly */
  const originals = [...track.children];
  originals.forEach(node => {
    const clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach(img => img.setAttribute('alt', ''));
    track.appendChild(clone);
  });

  /* Respect reduced-motion preference */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
  }
})();


/* ---------- Synergy guidelines reader ---------- */
(function initGuidelineReader() {
  const carousel = document.querySelector('.synergy-carousel');
  const gallery = document.querySelector('#synergy-gallery');
  if (!carousel || !gallery) return;
  const pages = [...gallery.querySelectorAll('[data-image]')];
  if (!pages.length) return;
  const slide = carousel.querySelector('.synergy-slide');
  const image = slide.querySelector('img');
  const count = carousel.querySelector('[data-guideline-count]');
  let current = 0;
  let request = 0;
  let animations = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  async function show(next) {
    const direction = next >= current ? 1 : -1;
    current = (next + pages.length) % pages.length;
    const target = current;
    const version = ++request;
    const preload = new Image();
    const preview = pages[target].querySelector('img');
    preload.sizes = image.sizes;
    preload.srcset = preview.srcset;
    preload.src = preview.src;
    try { await preload.decode(); } catch { return; }
    if (version !== request) return;
    animations.forEach(animation => animation.cancel());
    slide.querySelector('.synergy-slide-outgoing')?.remove();
    const outgoing = image.cloneNode();
    outgoing.className = 'synergy-slide-outgoing';
    outgoing.alt = '';
    outgoing.setAttribute('aria-hidden', 'true');
    image.srcset = preview.srcset;
    image.src = preview.src;
    image.alt = pages[current].querySelector('img').alt;
    slide.setAttribute('aria-label', `Enlarge brand guidelines page ${current + 1}`);
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${pages.length}`;
    if (!reducedMotion.matches && image.animate) {
      slide.appendChild(outgoing);
      const timing = { duration: 580, easing: 'cubic-bezier(.22, 1, .36, 1)' };
      animations = [
        outgoing.animate([{ opacity: 1, transform: 'translateX(0) scale(1)' }, { opacity: 0, transform: `translateX(${-direction * 8}%) scale(.98)` }], timing),
        image.animate([{ opacity: 0, transform: `translateX(${direction * 8}%) scale(1.02)` }, { opacity: 1, transform: 'translateX(0) scale(1)' }], timing)
      ];
      Promise.allSettled(animations.map(animation => animation.finished)).then(() => outgoing.remove());
    }
  }
  carousel.querySelector('[data-guideline-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-guideline-next]').addEventListener('click', () => show(current + 1));
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart = null;
  let swiped = false;
  slide.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { touchStart = null; return; }
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiped = false;
  }, { passive: true });
  slide.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped = true;
      show(current + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
  }, { passive: true });
  slide.addEventListener('touchcancel', () => { touchStart = null; });
  slide.addEventListener('click', e => {
    if (swiped) { swiped = false; e.preventDefault(); return; }
    const visible = pages.find(page => page.dataset.image === image.getAttribute('src'));
    visible?.click();
  });
  carousel.querySelector('[data-guideline-all]').addEventListener('click', () => gallery.showModal());
  gallery.querySelector('[data-gallery-close]').addEventListener('click', () => gallery.close());
  gallery.addEventListener('click', e => {
    if (e.target !== gallery) return;
    const bounds = gallery.getBoundingClientRect();
    if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) gallery.close();
  });
})();
