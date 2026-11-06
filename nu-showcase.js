/* Manual browsing only: no autoplay, timers, or pointer-tracking loops. */
(() => {
  document.querySelectorAll('[data-nu-matchday]').forEach(gallery => {
    const panels = [...gallery.querySelectorAll('[data-match-panel]')];
    const status = gallery.querySelector('[data-match-status]');
    const switcher = gallery.querySelector('[data-match-next]');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let animations = [];
    const cancel = () => { animations.forEach(animation => animation.cancel()); animations = []; };
    function show(index, animate = false) {
      const previous = panels[current];
      const next = (index + panels.length) % panels.length;
      const moving = animate && !reduced.matches && document.documentElement.dataset.motion !== 'off';
      // Retarget from the visible poses so fast clicks never snap the cards back.
      const outgoingPose = moving ? getComputedStyle(previous).transform : 'none';
      const incomingPose = moving ? getComputedStyle(panels[next]).transform : 'none';
      const icon = switcher.querySelector('svg');
      const iconPose = moving ? getComputedStyle(icon).transform : 'none';
      cancel();
      current = next;
      panels.forEach((panel, i) => {
        const front = i === current;
        panel.classList.toggle('is-front', front);
        panel.setAttribute('aria-hidden', String(!front));
        panel.inert = !front;
      });
      const title = panels[current].querySelector('[data-title]').dataset.title;
      status.textContent = `${String(current + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')} — ${title}`;
      if (moving) {
        const timing = { duration: 760, easing: 'linear' };
        animations = [
          previous.animate([
            { transform: outgoingPose, zIndex: 3, easing: 'cubic-bezier(.4,0,.2,1)' },
            { transform: 'translate(14%, -34px) rotate(10deg) rotateY(-9deg) scale(.94)', zIndex: 3, offset: .42 },
            { transform: 'translate(14%, -34px) rotate(10deg) rotateY(-9deg) scale(.94)', zIndex: 1, offset: .43, easing: 'cubic-bezier(.16,1,.3,1)' },
            { transform: 'translate(12px, -12px) rotate(4deg) scale(.96)', zIndex: 1 }
          ], timing),
          panels[current].animate([
            { transform: incomingPose, easing: 'cubic-bezier(.4,0,.2,1)' },
            { transform: 'translate(-5%, -20px) rotate(-4deg) rotateY(5deg) scale(1.015)', offset: .43, easing: 'cubic-bezier(.16,1,.3,1)' },
            { transform: 'translate(0, 3px) rotate(.5deg) scale(1)', offset: .82, easing: 'ease-out' },
            { transform: 'translate(0, 0) rotate(0deg) scale(1)' }
          ], timing),
          icon.animate([{ transform: iconPose }, { transform: 'rotate(180deg)' }], { duration: 760, easing: 'cubic-bezier(.22,1,.36,1)' })
        ];
      }
    }
    gallery.querySelector('.nu-match-cards').classList.add('is-ready');
    switcher.hidden = false;
    switcher.addEventListener('click', () => show(current + 1, true));
    switcher.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault(); show(current + 1, true);
    });
    document.addEventListener('portfolio-motion-change', () => {
      if (document.documentElement.dataset.motion === 'off') cancel();
    });
    show(0);
  });
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
  const studio = archive.querySelector('.nu-cover-studio');
  const deviceChoices = [...archive.querySelectorAll('[data-device-view]')];
  const deviceControls = archive.querySelector('[data-device-controls]');
  function setDevice(view) {
    animation?.cancel();
    studio.dataset.deviceMode = view;
    deviceChoices.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.deviceView === view)));
    archive.querySelectorAll('.nu-device-desktop').forEach(device => { device.hidden = view === 'phone'; });
    archive.querySelectorAll('.nu-device-phone').forEach(device => { device.hidden = view === 'desktop'; });
  }
  deviceChoices.forEach(button => button.addEventListener('click', () => setDevice(button.dataset.deviceView)));
  deviceControls.hidden = false;
  archive.querySelectorAll('[data-phone-cover]').forEach(button => button.addEventListener('click', () => {
    button.closest('[data-cover-panel]').querySelector('[data-image]').click();
  }));
  let following = false;
  archive.querySelectorAll('[data-preview-follow]').forEach(button => button.addEventListener('click', () => {
    following = !following;
    archive.querySelectorAll('[data-preview-follow]').forEach(control => {
      control.setAttribute('aria-pressed', String(following));
      control.textContent = following ? '✓ Following' : '+ Follow';
    });
  }));
  let current = 0;
  let animation;
  setDevice(matchMedia('(max-width: 600px)').matches ? 'phone' : 'both');
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
