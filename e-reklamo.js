(() => {
  const root = document.querySelector('#e-reklamo-journey');
  if (!root) return;
  const descriptions = [
    'A dedicated place to submit community concerns, bringing the first step of the complaint process online.',
    'Tracking gives people a way to follow the status of concerns they have already submitted, all within the same platform.',
    'By bringing complaint submission and tracking together, E-Reklamo supports community participation and keeps concerns in one place.'
  ];
  const buttons = [...root.querySelectorAll('[data-reklamo-step]')];
  function select(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    root.querySelector('.e-reklamo-step-description').textContent = descriptions[index];
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => select(i)));
  root.querySelector('.e-reklamo-steps').addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus(); select(next);
  });
})();
(() => {
  const root = document.querySelector('#e-reklamo-manual');
  if (!root) return;
  const pages = [...root.querySelectorAll('[data-manual-page]')];
  const book = root.querySelector('.reklamo-manual-book');
  const dialog = document.querySelector('#reklamo-manual-dialog');
  const prev = root.querySelector('[data-manual-prev]');
  const next = root.querySelector('[data-manual-next]');
  const jumps = [...root.querySelectorAll('[data-manual-jump]')];
  let current = 0;
  let animation;
  const canMove = () => document.documentElement.dataset.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  function syncDialog() {
    const copy = document.createElement('div');
    copy.className = pages[current].className;
    const image = pages[current].querySelector('img').cloneNode();
    image.loading = 'eager';
    copy.append(image);
    dialog.querySelector('.reklamo-manual-expanded').replaceChildren(copy);
    dialog.querySelector('#manual-dialog-title').textContent = `E-Reklamo manual — ${pages[current].dataset.title}`;
    dialog.querySelector('[data-manual-zoom-count]').textContent = `${current + 1} / ${pages.length}`;
    dialog.querySelector('[data-manual-zoom-prev]').disabled = current === 0;
    dialog.querySelector('[data-manual-zoom-next]').disabled = current === pages.length - 1;
  }
  function show(index) {
    const target = Math.max(0, Math.min(pages.length - 1, index));
    const direction = target >= current ? 1 : -1;
    animation?.cancel();
    current = target;
    pages.forEach((page, i) => { page.hidden = i !== current; });
    prev.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    root.querySelector('[data-manual-count]').textContent = `${String(current + 1).padStart(2, '0')} / ${pages.length} · ${pages[current].dataset.title}`;
    root.querySelector('.reklamo-manual-progress span').style.transform = `scaleX(${(current + 1) / pages.length})`;
    const active = [...jumps].sort((a, b) => Number(b.dataset.manualJump) - Number(a.dataset.manualJump)).find(button => Number(button.dataset.manualJump) <= current);
    jumps.forEach(button => button.setAttribute('aria-current', String(button === active)));
    if (canMove() && pages[current].animate && !dialog.open) {
      animation = pages[current].animate([{ transform: `rotateY(${direction * -16}deg)`, opacity: .55 }, { transform: 'rotateY(0)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    if (dialog.open) syncDialog();
    // Only the next page is warmed; the full booklet is never preloaded.
    const following = pages[current + 1]?.querySelector('img');
    if (following) following.loading = 'eager';
  }
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  jumps.forEach(button => button.addEventListener('click', () => show(Number(button.dataset.manualJump))));
  function keys(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'Home' ? 0 : event.key === 'End' ? pages.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
  }
  book.addEventListener('keydown', keys);
  dialog.addEventListener('keydown', keys);
  let touch;
  book.addEventListener('touchstart', event => { touch = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
  let swiped = false;
  book.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    swiped = Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3;
    if (swiped) { show(current + (dx < 0 ? 1 : -1)); setTimeout(() => { swiped = false; }, 400); }
    touch = null;
  }, { passive: true });
  pages.forEach(page => page.addEventListener('click', () => {
    if (swiped) return;
    syncDialog(); dialog.showModal();
  }));
  dialog.querySelector('[data-manual-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-manual-zoom-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-manual-zoom-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  document.addEventListener('portfolio-motion-change', () => { if (!canMove()) animation?.cancel(); });
  jumps[0].setAttribute('aria-current', 'true');
})();

/* Ambient motion only runs while its illustration is on screen. */
(() => {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('reklamo-in-view', entry.isIntersecting));
  }, { threshold: .15 });
  document.querySelectorAll('[data-reklamo-ambient]').forEach(element => observer.observe(element));
})();
