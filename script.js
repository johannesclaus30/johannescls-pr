/* ============================================================
   @johannescls — Portfolio Engine v2
   ============================================================ */

const root = document.documentElement;
const page = document.body.dataset.page || 'home';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let motionPreference = true;
let mode = 'it';
try {
  mode = localStorage.getItem('jc-mode') || (page === 'creative' ? 'creative' : 'it');
  motionPreference = localStorage.getItem('jc-motion') !== 'off';
} catch {}

/* ---------- Theme ---------- */
function setMode(next) {
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

    if (eyebrow) eyebrow.textContent = isDay ? 'The daylight studio' : 'What I do at night';
    if (title) title.innerHTML = isDay
      ? 'Design is a<br><span class="italic">love letter</span><br><span class="hand">to the world.</span>'
      : 'Building<br><span class="italic">systems</span><br>with soul.';
    if (lead) lead.textContent = isDay
      ? 'Visual identities, publication materials, and stories in color. Created slowly, with intention.'
      : 'Full-stack development, interfaces, and digital products. Clean logic, thoughtful engineering.';
    if (ctaLabel) ctaLabel.textContent = isDay ? 'View My Designs' : 'Explore my IT Portfolio';
    if (cta) cta.href = isDay ? 'creative.html' : 'it.html';
  }

  if (page !== 'credits') {
    try { localStorage.setItem('jc-mode', mode); } catch {}
  }
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
  btn.addEventListener('click', () => setMode(btn.dataset.switch))
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

/* ---------- Reveal on scroll ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

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