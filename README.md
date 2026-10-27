# Johannes Claus — A city of possibilities

A static, three-page portfolio with an illustrated New York-inspired day/night identity. No installation or build is needed for viewing or deployment.

## Pages
- index.html: résumé-led homepage with experience, education, skills, certifications, recognition, and contact details.
- it.html: night-themed gallery, grouped into web experiences, apps/interfaces, and systems.
- creative.html: day-themed gallery, grouped into brands/identities, editorial/posters, and photography/motion.
- styles.css and script.js: shared presentation and interactions.

Open index.html in a browser. Google Fonts load when online; system fallbacks work offline. All illustrations are HTML/CSS, with no remote image dependencies.

## Personal information
The homepage uses the supplied résumé: Johannes Emmanuel A. Claus, NU Lipa studies, work and leadership experience, skills, education, certifications, awards, email, GitHub, and LinkedIn. New York is an aesthetic inspiration; the site identifies Batangas as the actual location.

## Replace the mocks
All ten gallery projects are explicitly labeled concepts or placeholders. They are not presented as actual client work. You can edit the HTML files directly. Alternatively, edit tools/build_galleries.py and run "python tools/build_galleries.py" to regenerate both gallery pages. That optional helper is not needed on GitHub Pages.

Each project button carries data-title, data-type, data-description, and data-approach for the detail dialog. Replace its artwork with your own images using descriptive alt text. Keep category names and filter identifiers aligned.

## Interactions
- Homepage day/night switch remembers the preference.
- Gallery pages always open in their appropriate theme; returning home keeps that theme.
- Category filters show matching gallery sections.
- Project dialogs support keyboard focus and Escape to close.
- Scroll reveals, skyline parallax, a moving taxi, and a reading-progress line follow native scrolling.
- Reduced-motion preferences disable decorative animation and show content immediately.
- The résumé and gallery cards remain readable if JavaScript is unavailable; filters and popups need JavaScript.

## GitHub Pages
Upload these files together at the repository root:
index.html, it.html, creative.html, styles.css, script.js, favicon.svg, and .nojekyll.

In repository Settings → Pages, select Deploy from a branch, choose the default branch and / (root), then save. No package manager, server, or build command is required. Relative asset and page links support a repository subpath or custom domain.

The tools folder is optional and tmp contains local verification artifacts; neither needs uploading.
