/* Fold sequence: lift the cover, then open the tucked-in flap. */
document.querySelectorAll('[data-brochure]').forEach(root => {
  const viewer = root.querySelector('.brochure-viewer');
  const scene = root.querySelector('.brochure-scene');
  const open = root.querySelector('[data-brochure-open]');
  const fold = root.querySelector('[data-brochure-fold]');
  const flip = root.querySelector('[data-brochure-flip]');
  const status = root.querySelector('.brochure-status');
  let step = 0, back = false, angle = -16, drag = null, suppressClick = false, folding = false;
  function update() {
    back = Math.cos(angle * Math.PI / 180) < 0;
    viewer.dataset.fold = step;
    viewer.dataset.back = back;
    viewer.style.setProperty('--orbit', `${angle}deg`);
    open.disabled = step === 2;
    fold.disabled = step === 0;
    open.textContent = step === 0 ? 'Open brochure ↗' : step === 1 ? 'Unfold fully ↗' : 'Fully open';
    flip.setAttribute('aria-pressed', String(back));
    status.textContent = `${back ? 'Reverse side' : step === 0 ? 'Front cover' : 'Inside panels'} · ${['Folded', 'Cover open', 'Fully unfolded'][step]}`;
    // Only visible paper faces should participate in keyboard navigation.
    root.querySelectorAll('.brochure-face').forEach(face => {
      const left = face.closest('.brochure-panel--left');
      const right = face.closest('.brochure-panel--right');
      const isBack = face.classList.contains('brochure-face--back');
      let visible;
      if (step === 0) visible = back ? !left && !right && isBack : left && isBack;
      else if (step === 1) visible = left ? isBack === back : right ? !back && isBack : back && isBack;
      else visible = isBack === back;
      face.tabIndex = visible ? 0 : -1;
      face.setAttribute('aria-label', step === 2 || (folding && step > 0) ? 'Fold brochure' : 'Unfold brochure');
      face.setAttribute('aria-hidden', String(!visible));
    });
  }
  open.addEventListener('click', () => { step = Math.min(2, step + 1); update(); });
  fold.addEventListener('click', () => { step = Math.max(0, step - 1); update(); });
  flip.addEventListener('click', () => { angle += 180; update(); });
  root.querySelector('[data-brochure-reset]').addEventListener('click', () => {
    step = 0; back = false; angle = -16; folding = false; update();
  });
  scene.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, angle, active: false };
    suppressClick = false;
  });
  scene.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - drag.y)) {
      drag.active = true;
      scene.setPointerCapture(e.pointerId);
      viewer.classList.add('is-dragging');
    }
    if (!drag.active) return;
    suppressClick = true;
    angle = drag.angle + dx * .55;
    update();
  });
  function endDrag() { drag = null; viewer.classList.remove('is-dragging'); }
  scene.addEventListener('pointerup', endDrag);
  scene.addEventListener('pointercancel', endDrag);
  scene.addEventListener('lostpointercapture', endDrag);
  window.addEventListener('pointerup', endDrag);
  scene.addEventListener('click', e => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
    if (!e.target.closest('.brochure-face')) return;
    if (step === 2) folding = true;
    if (step === 0) folding = false;
    step += folding ? -1 : 1;
    update();
  }, true);
  update();
});
