(() => {
  const root = document.querySelector('#internship-playground');
  if (!root) return;
  document.addEventListener('portfolio-motion-change', () => {
    if (document.documentElement.dataset.motion === 'off') {
      root.querySelectorAll('.internship-phone').forEach(element => element.getAnimations().forEach(animation => animation.cancel()));
    }
  });
  const roles = {
    student: ['Find your starting point.', 'Browse available internship openings, explore companies, and apply to opportunities that interest you. The student dashboard brings openings and application status into view.'],
    company: ['Make room for fresh talent.', 'Post internship openings for students to discover and apply to. The company dashboard shows posted vacancies and provides access to opening and applicant management.'],
    admin: ['The third side of the platform.', 'Alongside Student and Company accounts, the system includes an Admin account. An Admin screen preview will be added when available.']
  };
  const captions = { login: '00 / A different journey starts with each sign-in.', student: '01 / Discover an opening. Take your first step.', company: '02 / Post an opportunity. Meet your next intern.', admin: '03 / Student. Company. Admin. One platform.' };
  const roleButtons = [...root.querySelectorAll('[data-intern-role]')];
  const viewButtons = [...root.querySelectorAll('[data-intern-view]')];
  let currentRole = 'student';
  function show(view) {
    if (view !== 'login') currentRole = view;
    roleButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.internRole === currentRole)));
    viewButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.internView === view)));
    root.querySelectorAll('[data-intern-screen]').forEach(screen => { screen.hidden = screen.dataset.internScreen !== view; });
    root.querySelector('[data-intern-heading]').textContent = roles[currentRole][0];
    root.querySelector('[data-intern-description]').textContent = roles[currentRole][1];
    root.querySelector('[data-intern-badge]').textContent = view === 'login' ? 'THE FIRST HELLO' : `THE ${view.toUpperCase()} VIEW`;
    root.querySelector('[data-intern-caption]').textContent = captions[view];
    const phone = root.querySelector('.internship-phone');
    phone.getAnimations().forEach(animation => animation.cancel());
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'off' && phone.animate) {
      phone.animate([{ transform: 'translateY(10px) rotate(2deg)', opacity: .5 }, { transform: 'translateY(0) rotate(0)', opacity: 1 }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
  }
  roleButtons.forEach(button => button.addEventListener('click', () => show(button.dataset.internRole)));
  viewButtons.forEach(button => button.addEventListener('click', () => show(button.dataset.internView)));
  root.querySelectorAll('.internship-role-tabs, .internship-screen-controls').forEach(group => {
    group.addEventListener('keydown', event => {
      const buttons = [...group.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[next].focus(); buttons[next].click();
    });
  });
})();
