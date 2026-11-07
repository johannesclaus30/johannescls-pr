/* The scene, project spotlight, and navigation always share one mode. */
(() => {
  if (document.body.dataset.page !== 'home') return;
  const copy = {
    it: {
      period: 'AFTER HOURS / THE DEVELOPER',
      word: 'Logic.<br>With a little magic.',
      switchLabel: 'Let the light in',
      invitation: 'Step into the daylight',
      destination: 'day', icon: '☀',
      label: 'Explore my work / Development',
      title: 'View IT Portfolio',
      description: 'Systems, websites, and mobile applications.',
      href: 'it.html'
    },
    creative: {
      period: 'DAYLIGHT / THE DESIGNER',
      word: 'Color.<br>With something to say.',
      switchLabel: 'See the after-hours side',
      invitation: 'Stay up for the night shift',
      destination: 'night', icon: '☾',
      label: 'Explore my work / Visual design',
      title: 'View Creative Portfolio',
      description: 'Visual identities, publication materials, and more.',
      href: 'creative.html'
    }
  };
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  let entrance;
  function sync(animate = false) {
    const state = copy[root.dataset.mode] || copy.it;
    setText('[data-scene-period]', state.period);
    const word = document.querySelector('[data-scene-word]');
    if (word) word.innerHTML = state.word;
    setText('[data-scene-switch-label]', state.switchLabel);
    setText('.home-switch-icon', state.icon);
    setText('[data-spotlight-label]', state.label);
    setText('[data-spotlight-title]', state.title);
    setText('[data-spotlight-description]', state.description);
    const spotlight = document.querySelector('[data-home-spotlight]');
    if (spotlight) spotlight.href = state.href;
    document.querySelectorAll('[data-other-mode]').forEach(button => {
      button.setAttribute('aria-label', `Switch to ${state.destination} mode`);
      if (!button.querySelector('[data-scene-switch-label]')) {
        button.innerHTML = `${state.invitation} <span aria-hidden="true">↗</span>`;
      }
    });
    entrance?.cancel();
    const title = document.querySelector('[data-hero-title]');
    if (animate && motionEnabled() && title?.animate) {
      entrance = title.animate([
        { opacity: .25, translate: '0 12px' },
        { opacity: 1, translate: '0 0' }
      ], { duration: 520, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }
  document.querySelectorAll('[data-other-mode]').forEach(button => {
    button.addEventListener('click', () => setMode(root.dataset.mode === 'it' ? 'creative' : 'it', true));
  });
  document.addEventListener('portfolio-mode-change', () => sync(true));
  document.addEventListener('portfolio-motion-change', () => {
    if (!motionEnabled()) entrance?.cancel();
  });
  sync();
})();

/* Explore each discipline without pretending skills are percentage scores. */
(() => {
  const studio = document.querySelector('[data-skill-studio]');
  if (!studio) return;
  const tabs = [...studio.querySelectorAll('[data-skill-tab]')];
  const panels = [...studio.querySelectorAll('[data-skill-panel]')];
  let entrance;
  studio.dataset.enhanced = 'true';
  studio.querySelector('.skill-tabs').setAttribute('role', 'tablist');
  tabs.forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', 'skill-panel-' + tab.dataset.skillTab);
  });
  panels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
    panel.tabIndex = 0;
  });
  function select(index, focus = false, animate = true) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (focus) tabs[index].focus();
    entrance?.cancel();
    const panel = panels[index];
    if (animate && motionEnabled() && panel.animate) {
      entrance = panel.animate([
        { opacity: .35, translate: '0 12px' }, { opacity: 1, translate: '0 0' }
      ], { duration: 400, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
    });
  });
  document.addEventListener('portfolio-motion-change', () => {
    if (!motionEnabled()) entrance?.cancel();
  });
  select(0, false, false);
})();
