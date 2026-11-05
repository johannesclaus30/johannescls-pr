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
  function show(index) {
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    screens.forEach((screen, i) => { screen.hidden = i !== index; });
    root.querySelector('[data-booklat-label]').textContent = screens[index].dataset.title.replace(' — ', ' / ');
    root.querySelector('[data-booklat-caption]').textContent = screens[index].dataset.description;
    const image = screens[index].querySelector('img');
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'off' && image.animate) {
      image.getAnimations().forEach(animation => animation.cancel());
      image.animate([{ opacity: .4, transform: 'translateX(10px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 280, easing: 'ease-out' });
    }
  }
  buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));
  root.querySelector('.booklat-chapters').addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus(); show(next);
  });
})();
