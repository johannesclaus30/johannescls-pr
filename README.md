# Johannes Claus — After Hours / Daylight

A complete photographic redesign: four static pages, real New York photographs, scroll-driven transitions, a résumé homepage, an organization-based creative archive, and a focused IT showcase.

## Open
Open index.html directly. No build, package manager, backend, or server is required.
Google Fonts are optional; system fallbacks work offline. Photos and artwork are stored locally in assets/.

## Pages
- index.html — résumé and experience, with a night/day perspective switch.
- creative.html — 28 mock publication materials across NU Lipa, SACE Student Council, The Synergy, and YES-O. Each organization has its own colors, typography, and image-wall arrangement.
- it.html — three clearly labeled mock systems, with two large screens per system and space for the concept.
- credits.html — photo attribution, original source links, license explanation, and mock artwork disclosure.

## Replace the creative mocks
The actual gallery uses ordinary image elements. Replace an image file or change its src in creative.html. Also update the surrounding button's data-image, data-title, data-description, and the image's alt, width, and height.
- data-group keeps lightbox navigation inside one organization.
- Use full-resolution images for data-image and optimized thumbnails for src if needed.
- PNG, JPG, and WebP are suitable for your actual pubmats.
- Remove mock labels only when you insert real work.
- Add more tiles inside the appropriate image-wall container.
- The gallery is designed to show whole publication materials without cropping.

## Replace the IT mocks
Each system has its own section with two images, description, and theme. Replace the screens in it.html and update the concept copy with your actual system's purpose and contribution. Avoid making claims based on the sample dashboard data.

## Optional source generator
tools/build_site.py creates the HTML pages and original SVG mock artwork. It uses only Python's standard library.
Run "python tools/build_site.py" only if you want to regenerate those pages. It overwrites direct edits to the generated HTML and mock SVGs. Edit the generator instead if you use it as your source of truth. It is not required for deployment.

## Motion and accessibility
The homepage has a sticky photographic opening, scroll-linked zoom and typography transitions, and a moving photographic interlude. Section reveals follow normal scrolling; no scroll interception is used.
Reduced-motion settings disable decorative motion. A footer control also lets visitors turn motion off, and the choice persists. The image viewer supports previous/next buttons, left/right arrow keys, Escape, focus trapping, and focus restoration.

## Licenses
See PHOTO-LICENSES.md and credits.html. These are free-to-use licensed photographs, not public-domain claims. Original city photography is credited to its actual photographers. It is not presented as Johannes's work.
Original vector mock pubmats and system screens are placeholders, not official organization materials.

## GitHub Pages
Upload the four HTML files, styles.css, script.js, favicon.svg, .nojekyll, and the complete assets folder to your repository root.
In repository Settings → Pages, use Deploy from a branch, your default branch, and / (root).
The portfolio-github-pages.zip file contains the deployment files and license notes. Extract it before uploading the contents.
All internal links and asset paths are relative and support a GitHub Pages repository subpath.
