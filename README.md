# Johannes Claus — After Hours / Daylight

A personal portfolio bringing together IT projects, creative work, and experience. The site pairs a photographic night/day homepage with dedicated showcases for development and design.

Built with HTML, CSS, and JavaScript. No package manager, backend, or build step is required to view or deploy it.

## Open locally

Open `index.html` in your browser. Photos, artwork, and tool logos are stored locally in `assets/`. Google Fonts and web analytics require an internet connection; fallback fonts work offline.

## Pages

| Page | Content |
| --- | --- |
| `index.html` | Résumé, experience, selected work, and a night/day perspective switch. |
| `it.html` | Development toolkit, LumiNUs capstone project, E-Reklamo team website, and the illustrative Daybook concept. |
| `creative.html` | Creative toolkit and organization-based collections for NU Lipa, SACE Student Council, The Synergy, and YES-O. |
| `nu-lipa.html` | Dedicated NU Lipa Marketing Office gallery and interactive tri-fold brochure. |
| `sace.html` | Dedicated SACE Student Council logo and publication-material gallery. |
| `credits.html` | Photography credits, source links, and artwork disclosures. |

## Creative collections

- **NU Lipa Marketing Office:** ten publication materials with content-based captions, plus a six-panel interactive brochure.
- **SACE Student Council:** organizational logo and five publication materials. A dedicated space is reserved for the brand guidelines currently in progress.
- **The Synergy:** organizational logo and ten brand-guideline pages, presented in a carousel with a “View all” gallery modal.
- **YES-O:** a temporary collection-in-progress section while the work is being compiled.
- **More work:** spaces reserved for additional organization work, school projects, and other creative outputs.

The NU Lipa brochure uses CSS 3D transforms to represent three two-sided panels. Viewers can drag to rotate between front and back, click to unfold or refold, and use a separate button to browse larger page images. Buttons also provide opening, folding, turning, and resetting controls. The viewer keeps a consistent size across fold states.

## Files and folders

```text
assets/
  creative/          Original publication materials and guideline pages
  optimized/         Smaller display images and their generated manifest
  tool-logos/        Local toolkit logos and source notes
  logos/             Organization logos
  photos/            Photography and portraits
  highlights/        Homepage highlight images
  contact_icons/     Contact and social icons
  fonts/             Local font files
  work/              Illustrative SVG project screens and legacy samples
tools/
  Optimize-Images.ps1 Image optimization helper for Windows
  image-plan.json    Original-to-display image mappings and target sizes
  build_site.py      Legacy site generator
  build_galleries.py Legacy gallery generator
```

`styles.css` and `script.js` provide shared layout and interactions. `home-work.css` styles the homepage’s selected-work showcase, led by LumiNUs with NU Lipa and SACE collection previews. Section-specific styling lives in `creative.css`, `nu-lipa.css`, `sace.css`, and `synergy.css`. The brochure has its own `brochure.css` and `brochure.js`.

## Updating artwork

Edit the current HTML files directly. Keep shared collections consistent between `creative.html` and their dedicated pages.

For each gallery tile, update:

- Image `src`: the optimized preview shown in the gallery.
- Image `alt`, `width`, and `height`: a useful description and the preview’s actual dimensions.
- Button `data-image`: the larger display copy used by the image viewer.
- Button `data-title` and `data-description`: the work’s title and context.
- Button `data-group`: the collection used for previous/next navigation.

The layouts preserve the artwork’s proportions. Keep visible collection counts and navigation badges in sync when adding or removing work. Match filename capitalization exactly so paths work on GitHub Pages.

For the brochure, `data-brochure-image` belongs to the interactive paper faces; the separate `data-image` controls supply the larger page viewer. For The Synergy, maintain numeric page order in the gallery because it also supplies the carousel.

Toolkit logos are stored in `assets/tool-logos/`. Update the corresponding image in `it.html` or `creative.html` when replacing one. Source notes are recorded in that folder’s `README.md` and `sources.json`.

## Image performance

Original artwork is preserved. Pages use smaller copies from `assets/optimized/` to avoid downloading multi-megabyte originals for small cards.

The current image plan uses:

- Up to 96 pixels for navigation portraits.
- Up to 320 pixels for raster logos.
- Up to 640 pixels for most gallery previews.
- Up to 1,600 pixels for larger viewer images and brochure panels.

These sizes refer to the longest edge; images are not enlarged beyond their original dimensions. Images include dimensions where available to reserve space while loading. Most below-the-fold artwork uses lazy loading.

To regenerate existing display copies on Windows, run this from the repository root in PowerShell:

```powershell
./tools/Optimize-Images.ps1
```

The helper uses Windows `System.Drawing` and reads `tools/image-plan.json`. It saves display copies and updates `assets/optimized/manifest.json`. For new or renamed artwork, update the plan first, regenerate the images, and then update the HTML paths and dimensions. The helper does not rewrite the HTML automatically.

## IT project concepts

LumiNUs is a team capstone project in partnership with the NU Lipa Alumni Affairs Office (AAO): a centralized mobile and web-based alumni management system with geolocation mapping, virtual alumni identification, and community engagement for institutional tracer studies. Its section uses NU blue (`#32418c`), gold (`#fbd117`), and Poppins, with dedicated styling in `luminus.css`. The section reserves spaces for the system user manual and GitHub repository; links will be added when supplied.

E-Reklamo is a team-built community complaint management website with its own orange styling in `e-reklamo.css` and an actual supplied homepage preview in `assets/tech/E-Reklamo/screens/`. The section uses a full orange background, Poppins typography, and the supplied white wordmark and app icon from `assets/tech/E-Reklamo/logos/`. Dedicated User Manual and GitHub repository spaces are marked coming soon until the resources are supplied.

Daybook is explicitly labeled a mock concept, with illustrative SVG screens and sample data. When replacing them with completed projects, update the screenshots, descriptions, contribution details, and viewer text together. Keep concept disclosures until the content represents actual work.

## Motion and accessibility

The site includes scroll reveals, photographic transitions, playful toolkit hover effects, and brochure folding animations. Toolkit effects respect reduced-motion preferences and the footer’s persistent motion setting. The brochure and guideline reader also include reduced-motion handling.

Image viewers offer previous/next buttons, arrow-key navigation, and Escape to close. Native modal dialogs contain keyboard focus while open. The guideline carousel supports keyboard arrows and touch swipes. Images have descriptive alternative text, while decorative logos beside tool names use empty alternatives.

## Legacy generators

`tools/build_site.py` and `tools/build_galleries.py` are optional generators from earlier versions of the portfolio. They are not the source of truth for the current design and are not required for deployment.

Running them can overwrite directly edited pages and restore outdated sample content. Use the current HTML, CSS, JavaScript, and asset files for ongoing updates unless you deliberately bring the generators up to date.

## Photography and logo sources

See `PHOTO-LICENSES.md` and `credits.html` for photography attribution and source information. The city photography is credited to its photographers and is not presented as Johannes’s original photography.

The creative galleries contain supplied portfolio work; remaining illustrative system screens and legacy sample assets are placeholders. Tool and organization logos identify their respective brands. Toolkit asset source notes are maintained in `assets/tool-logos/`.

## GitHub Pages

Publish the current site files from the repository root:

- All six HTML pages.
- All root-level CSS and JavaScript files, including section styles and the brochure files.
- `favicon.svg` and `.nojekyll`.
- The complete `assets/` folder, including `assets/optimized/` and `assets/tool-logos/`.
- `PHOTO-LICENSES.md` for the accompanying photography notes.

Use the repository’s GitHub Pages configuration to publish the root folder from the deployment branch. No build command is needed. Relative page links and asset paths support a repository subpath.

The existing `portfolio-github-pages.zip` may be older than the current source files. Refresh it before using it for a new upload; updating the site does not automatically rebuild the archive.
