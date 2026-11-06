(() => {
  const root = document.querySelector('#booklat-showcase');
  if (!root) return;
  document.addEventListener('portfolio-motion-change', () => {
    if (document.documentElement.dataset.motion === 'off') {
      root.querySelectorAll('.booklat-screen img').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
    }
  });
  const buttons = [...root.querySelectorAll('[data-booklat-view]')];
  const screens = [...root.querySelectorAll('[data-booklat-screen]')];
  let current = 0;
  const browser = root.querySelector('.booklat-browser');
  const controls = document.createElement('div');
  controls.className = 'booklat-pagination';
  controls.innerHTML = '<button type="button" data-booklat-prev aria-label="Previous screenshot">← Previous chapter</button><span data-booklat-count aria-live="polite" aria-atomic="true"></span><button type="button" data-booklat-next aria-label="Next screenshot">Next chapter →</button>';
  browser.after(controls);
  function show(index) {
    index = (index + screens.length) % screens.length;
    const direction = index < current ? -1 : 1;
    current = index;
    controls.querySelector('[data-booklat-count]').textContent = `${String(index + 1).padStart(2, '0')} / ${String(screens.length).padStart(2, '0')}`;
    root.style.setProperty('--chapter-progress', (index + 1) / screens.length);
    screens.forEach(screen => screen.querySelector('img').getAnimations().forEach(animation => animation.cancel()));
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    screens.forEach((screen, i) => { screen.hidden = i !== index; });
    root.querySelector('[data-booklat-label]').textContent = screens[index].dataset.title.replace(' — ', ' / ');
    root.querySelector('[data-booklat-caption]').textContent = screens[index].dataset.description;
    const image = screens[index].querySelector('img');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'off' && image.animate) {
      image.getAnimations().forEach(animation => animation.cancel());
      image.animate([{ opacity: .4, transform: `translateX(${direction * 18}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 280, easing: 'ease-out' });
    }
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));
  controls.querySelector('[data-booklat-prev]').addEventListener('click', () => show(current - 1));
  controls.querySelector('[data-booklat-next]').addEventListener('click', () => show(current + 1));
  browser.tabIndex = 0;
  browser.setAttribute('role', 'region');
  browser.setAttribute('aria-label', 'Booklat screenshot reader. Use left and right arrows to turn chapters; click a screenshot to enlarge.');
  browser.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let touchStart = null;
  let suppressClickUntil = 0;
  browser.addEventListener('click', event => {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  browser.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  browser.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(current + (dx < 0 ? 1 : -1));
      suppressClickUntil = Date.now() + 400;
    }
    touchStart = null;
  }, { passive: true });
  browser.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  show(0);
  root.querySelector('.booklat-chapters').addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus(); show(next);
  });
})();
