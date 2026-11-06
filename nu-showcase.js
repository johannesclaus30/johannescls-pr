/* Manual browsing only: no autoplay, timers, or pointer-tracking loops. */
(() => {
  document.querySelectorAll('[data-nu-matchday]').forEach(gallery => {
    const choices = [...gallery.querySelectorAll('[data-match-select]')];
    const panels = [...gallery.querySelectorAll('[data-match-panel]')];
    const status = gallery.querySelector('[data-match-status]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let animation;
    function show(index) {
      current = (index + choices.length) % choices.length;
      index = current;
      animation?.cancel();
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      panels.forEach((panel, i) => { panel.hidden = i !== index; });
      status.textContent = `${String(index + 1).padStart(2, '0')} / ${String(choices.length).padStart(2, '0')} — ${choices[index].dataset.matchLabel}`;
      if (!reduced.matches && document.documentElement.dataset.motion !== 'off') {
        animation = panels[index].animate([{ opacity: .3, translate: '16px 0' }, { opacity: 1, translate: '0 0' }], { duration: 300, easing: 'ease-out' });
      }
    }
    gallery.querySelector('[data-match-controls]').hidden = false;
    const switcher = gallery.querySelector('[data-match-next]');
    switcher.hidden = false;
    switcher.addEventListener('click', () => show(current + 1));
    choices.forEach((button, i) => button.addEventListener('click', () => show(i)));
    gallery.querySelector('[data-match-controls]').addEventListener('keydown', event => {
      const index = choices.indexOf(document.activeElement);
      if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? choices.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + choices.length) % choices.length;
      choices[next].focus(); show(next);
    });
    document.addEventListener('portfolio-motion-change', () => {
      if (document.documentElement.dataset.motion === 'off') animation?.cancel();
    });
    show(0);
  });
  const printGallery = document.querySelector('[data-nu-print-gallery]');
  if (printGallery) {
    const toggle = printGallery.querySelector('[data-print-toggle]');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const artwork = printGallery.classList.toggle('is-artwork-view');
      toggle.setAttribute('aria-pressed', String(artwork));
      toggle.textContent = artwork ? 'Show display frames ↗' : 'View artwork only ↗';
    });
  }
  const desk = document.querySelector('[data-nu-desk]');
  if (desk) {
    const toggle = desk.querySelector('[data-desk-toggle]');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const stacked = desk.classList.toggle('is-stacked');
      toggle.setAttribute('aria-pressed', String(stacked));
      toggle.textContent = stacked ? 'Spread the flyers ↗' : 'Stack the flyers ↙';
    });
  }
  const archive = document.querySelector('[data-nu-covers]');
  if (!archive) return;
  const buttons = [...archive.querySelectorAll('[data-cover-select]')];
  const panels = [...archive.querySelectorAll('[data-cover-panel]')];
  const status = archive.querySelector('[data-cover-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let animation;
  function show(next) {
    current = (next + panels.length) % panels.length;
    animation?.cancel();
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
    panels.forEach((panel, i) => { panel.hidden = i !== current; });
    status.textContent = `${String(current + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')} — ${buttons[current].dataset.coverLabel}`;
    if (!reduced.matches && document.documentElement.dataset.motion !== 'off') {
      animation = panels[current].animate([{ opacity: .3, translate: '0 12px' }, { opacity: 1, translate: '0 0' }], { duration: 320, easing: 'ease-out' });
    }
  }
  archive.querySelector('[data-cover-controls]').hidden = false;
  buttons.forEach((button, i) => button.addEventListener('click', () => show(i)));
  archive.querySelector('[data-cover-prev]').addEventListener('click', () => show(current - 1));
  archive.querySelector('[data-cover-next]').addEventListener('click', () => show(current + 1));
  archive.querySelector('[data-cover-controls]').addEventListener('keydown', event => {
    const index = buttons.indexOf(document.activeElement);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    show(next);
  });
  document.addEventListener('portfolio-motion-change', () => {
    if (document.documentElement.dataset.motion === 'off') animation?.cancel();
  });
  show(0);
})();
