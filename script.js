const root = document.documentElement;
const page = document.body.dataset.page;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function setMode(mode, animate = false) {
  if (!['it', 'creative'].includes(mode)) mode = 'it';
  root.dataset.mode = mode;
  document.querySelector('meta[name="theme-color"]').content = mode === 'it' ? '#101820' : '#f5f0e6';
  document.querySelectorAll('[data-switch]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.switch === mode)));
  if (page === 'home') {
    document.querySelector('#hero-word').textContent = mode === 'it' ? 'possibilities.' : 'inspiration.';
    document.querySelector('#hero-description').textContent = mode === 'it' ? 'I’m Johannes. An IT student building for the web, with a creative eye that doesn’t clock out.' : 'I’m Johannes. A designer, visual storyteller, and IT student finding inspiration on every corner.';
    const link = document.querySelector('#hero-work-link');
    link.href = mode === 'it' ? 'it.html' : 'creative.html';
    link.innerHTML = mode === 'it' ? 'Explore my IT work <span>↗</span>' : 'Explore my creative work <span>↗</span>';
    document.querySelector('#city-time').textContent = mode === 'it' ? 'AFTER HOURS / THE IT PERSPECTIVE' : 'DAY SHIFT / THE CREATIVE PERSPECTIVE';
    if (animate) {
      const copy = document.querySelector('.hero-copy');
      copy.classList.remove('mode-enter');
      void copy.offsetWidth;
      copy.classList.add('mode-enter');
    }
  }
  try { localStorage.setItem('jc-portfolio-mode', mode); } catch {}
}
let storedMode;
try { storedMode = localStorage.getItem('jc-portfolio-mode'); } catch {}
setMode(page === 'home' ? storedMode : page);
document.querySelectorAll('[data-switch]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.switch, true)));
document.querySelectorAll('[data-year]').forEach(element => element.textContent = new Date().getFullYear());

// Native scrolling stays in control. Motion follows it, with a reduced-motion fallback.
let frameRequested = false;
function updateScroll() {
  frameRequested = false;
  const maxScroll = root.scrollHeight - innerHeight;
  root.style.setProperty('--page-progress', maxScroll > 0 ? scrollY / maxScroll : 0);
  if (!reducedMotion.matches) {
    root.style.setProperty('--scene-progress', Math.min(1, Math.max(0, scrollY / 800)));
    const ticker = document.querySelector('.ticker>div');
    if (ticker) ticker.style.transform = 'translateX(' + (-Math.min(scrollY * .12, 350)) + 'px)';
  }
}
function requestScrollUpdate() {
  if (!frameRequested) { frameRequested = true; requestAnimationFrame(updateScroll); }
}
addEventListener('scroll', requestScrollUpdate, {passive:true});
addEventListener('resize', requestScrollUpdate);
reducedMotion.addEventListener('change', () => {
  const ticker = document.querySelector('.ticker>div');
  if (ticker) ticker.style.transform = '';
  updateScroll();
});
updateScroll();
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, {threshold:.08});
  document.body.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

// Gallery categories filter whole sections, keeping project groupings intact.
const filters = document.querySelectorAll('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  let visibleCount = 0;
  document.querySelectorAll('[data-category]').forEach(section => {
    section.hidden = category !== 'all' && section.dataset.category !== category;
    if (!section.hidden) {
      visibleCount += section.querySelectorAll('[data-project]').length;
      section.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));
    }
  });
  document.querySelector('#filter-status').textContent = visibleCount + ' concepts shown';
  requestScrollUpdate();
}));
const dialog = document.querySelector('#project-dialog');
if (dialog) {
  document.querySelectorAll('[data-project]').forEach(card => card.addEventListener('click', () => {
    document.querySelector('#dialog-title').textContent = card.dataset.title;
    document.querySelector('#dialog-tag').textContent = card.dataset.type;
    document.querySelector('#dialog-description').textContent = card.dataset.description;
    document.querySelector('#dialog-approach').textContent = card.dataset.approach;
    dialog.showModal();
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if(event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
