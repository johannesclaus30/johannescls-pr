/* Screenshot journeys: the original buttons also power the shared zoom viewer. */
document.querySelectorAll('[data-luminus-showcase]').forEach(showcase => {
  const scenes = [...showcase.querySelectorAll('.luminus-scene')];
  const stops = [...showcase.querySelectorAll('[data-scene-select]')];
  const stage = showcase.querySelector('.luminus-playground');
  let current = 0;
  function show(next) {
    current = (next + scenes.length) % scenes.length;
    scenes.forEach((scene, i) => {
      const offset = (i - current + scenes.length) % scenes.length;
      scene.dataset.position = offset === 0 ? 'active' : offset === 1 ? 'next' : offset === scenes.length - 1 ? 'previous' : 'away';
      scene.inert = offset !== 0;
      scene.setAttribute('aria-hidden', String(offset !== 0));
    });
    stops.forEach((stop, i) => stop.setAttribute('aria-pressed', String(i === current)));
    const scene = scenes[current];
    // Upgrade only selected screens. The browser chooses a file for the display's
    // size and pixel density; background cards keep their inexpensive previews.
    const image = scene.querySelector('img');
    if (image.dataset.sceneSrcset && !image.hasAttribute('srcset')) {
      image.sizes = image.dataset.sceneSizes;
      image.srcset = image.dataset.sceneSrcset;
    }
    showcase.querySelector('[data-scene-count]').textContent = `${String(current + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`;
    showcase.querySelector('[data-scene-title]').textContent = scene.dataset.sceneName;
    showcase.querySelector('[data-scene-description]').textContent = scene.dataset.sceneCopy;
  }
  stops.forEach((stop, i) => stop.addEventListener('click', () => show(i)));
  showcase.querySelector('[data-scene-prev]').addEventListener('click', () => show(current - 1));
  showcase.querySelector('[data-scene-next]').addEventListener('click', () => show(current + 1));
  stage.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let start = null;
  let suppressClick = false;
  stage.addEventListener('touchstart', event => {
    start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    suppressClick = false;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      suppressClick = true;
      show(current + (dx < 0 ? 1 : -1));
    }
    start = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { start = null; });
  stage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
  }, true);
  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !motionEnabled()) return;
    const bounds = stage.getBoundingClientRect();
    stage.style.setProperty('--lean-x', `${((event.clientY - bounds.top) / bounds.height - .5) * -5}deg`);
    stage.style.setProperty('--lean-y', `${((event.clientX - bounds.left) / bounds.width - .5) * 7}deg`);
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.setProperty('--lean-x', '0deg');
    stage.style.setProperty('--lean-y', '0deg');
  });
  show(0);
});
