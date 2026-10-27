from pathlib import Path
from html import escape
ROOT = Path(__file__).resolve().parent.parent
# These are deliberately fictional gallery samples. Replace with actual work.
visuals = {
'dashboard': '<div class="art-object dashboard"><div class="mock-nav"><b>pulse.</b><span>Overview ↗</span></div><div class="dashboard-body"><div><small>A CLEARER PICTURE</small><strong>↗</strong><small>Sample data</small></div><div class="chart"><i style="--bar:35%"></i><i style="--bar:60%"></i><i style="--bar:45%"></i><i style="--bar:80%"></i><i style="--bar:95%"></i></div></div></div>',
'web': '<div class="art-object web-mock"><small>A LITTLE SPACE TO FOCUS</small><strong>Make room<br>for good ideas.</strong><span class="mock-button">Find your flow ↗</span></div>',
'mobile': '<div class="art-object phone"><small>GOOD MORNING, CITY.</small><strong>Your next<br>little adventure.</strong><div class="phone-map"></div><span class="mock-button">Explore ↗</span></div>',
'system': '<div class="art-object terminal"><div class="terminal-top">● ● ● &nbsp; city-system / concept</div><code>&gt; connect the dots<br>✓ organize the information<br>✓ make the flow clear<br>&gt; ready for what’s next_</code></div>',
'brand': '<div class="art-object brand-poster"><small>A FICTIONAL COFFEE BRAND</small><strong>slow<br>mornings.</strong><span>A LITTLE PAUSE. A BETTER DAY.</span></div>',
'identity': '<div class="art-object identity"><strong>fern.</strong><p>A little room to grow.</p><div class="swatches"><i></i><i></i><i></i></div></div>',
'editorial': '<div class="art-object editorial"><small>THE CITY EDITION / 001</small><strong>Between<br>the<br>blocks.</strong><div class="editorial-block"></div></div>',
'poster': '<div class="art-object poster"><small>AN IMAGINARY CREATIVE FESTIVAL</small><strong>MAKE<br>SOME<br>NOISE.</strong><span>✳ ↗</span></div>',
'photo': '<div class="art-object photo-frame"><div class="photo-scene"></div><span>STREET STORIES / ILLUSTRATED PLACEHOLDER</span></div>',
'motion': '<div class="art-object motion-frame"><small>STORYBOARD / FRAME 001</small><strong>A day.<br>A thousand stories.</strong><div class="motion-track"></div></div>'
}
projects = {
'it': [
('web', 'Web experiences', [
('Clarity, at a glance.', 'Dashboard / UI concept', 'dashboard', 'A dashboard concept that explores how visual hierarchy can make complex information easier to scan. All chart values are illustrative.', 'Start with the decisions a person needs to make. Group related information and use contrast to give the most important signals a clear place.'),
('Less friction. More flow.', 'Landing page / Front-end concept', 'web', 'A focused landing-page mockup built around a simple question: what can be removed so the next step feels obvious?', 'Use a strong type hierarchy, comfortable spacing, and a single primary action. Carry the same clarity through responsive layouts and keyboard interactions.')]),
('apps', 'Apps & interfaces', [
('A pocket-sized city.', 'Mobile app / UX concept', 'mobile', 'A fictional city-exploration app concept for discovering small adventures nearby. This is a static visual mockup, not a functioning location service.', 'Organize the experience around discovery, place details, and a clear next step. Keep controls within easy reach and show useful information at a glance.')]),
('systems', 'Systems & experiments', [
('Behind the interface.', 'System workflow / Concept', 'system', 'A placeholder for future technical work: application architecture, database projects, and experiments that connect an interface to the logic behind it.', 'Document the problem, the information flow, the implementation choices, and the lessons learned. Replace this concept with a real technical case study when ready.')])
],
'creative': [
('identity', 'Brands & identities', [
('A brand with a softer side.', 'Fictional brand / Identity concept', 'brand', 'Slow Mornings is a fictional coffee brand centered on taking an unhurried moment. An exploration of type, tone, and warmth.', 'Build the visual language from a feeling. Pair an expressive serif with a restrained palette and carry the same welcoming voice across print and social touchpoints.'),
('Room to grow.', 'Fictional brand / Visual system', 'identity', 'Fern is a fictional botanical lifestyle identity. This sample explores how a simple wordmark and a natural palette can create a consistent visual world.', 'Define the tone first, then establish a wordmark, colors, and a flexible composition system that can work across small and large formats.')]),
('editorial', 'Editorial & posters', [
('Between the blocks.', 'Magazine cover / Editorial concept', 'editorial', 'A fictional city magazine cover exploring the relationship between strong typography, pacing, and visual storytelling.', 'Create a clear entry point with a bold headline. Balance the type with geometric imagery and leave room for the story to breathe.'),
('Make some noise.', 'Event poster / Typography concept', 'poster', 'A poster for an imaginary creative festival. This is a sample direction rather than publicity for an actual event.', 'Use compressed, energetic typography and a warm color palette to make the message readable from a distance. Keep supporting details secondary.')]),
('stories', 'Photography & motion', [
('Stories at street level.', 'Photo series / Illustrated placeholder', 'photo', 'A gallery placeholder for future photography. The image is an abstract illustration, not an original photograph or a documented event.', 'Curate a series around a clear narrative: place, people, details, and a closing image. Replace this illustration with selected photographs and captions.'),
('A day. A thousand stories.', 'Motion / Storyboard concept', 'motion', 'A static storyboard concept for a short visual story. The mock timeline suggests pacing; no video is attached yet.', 'Establish a beginning, a shift, and a final beat. Use a consistent visual language across frames, then pair the sequence with intentional movement and sound.')])
]}
for mode, groups in projects.items():
    creative = mode == 'creative'
    other = 'it' if creative else 'creative'
    title = 'The day shift.' if creative else 'The night shift.'
    headline = 'A little<br><em>outside the lines.</em>' if creative else 'Ideas that<br><em>stay up late.</em>'
    intro = 'Visual identities, editorial experiments, and stories worth a second look. Welcome to the creative side of the street.' if creative else 'Web experiences, mobile ideas, and the systems behind the screen. Welcome to the technical side of the street.'
    count = sum(len(items) for _, _, items in groups)
    buttons = '<button data-filter="all" aria-pressed="true">All work</button>' + ''.join(f'<button data-filter="{key}" aria-pressed="false">{escape(label)}</button>' for key,label,_ in groups)
    sections = []
    for group_index, (key, label, items) in enumerate(groups, 1):
        cards = []
        for name, kind, art, description, approach in items:
            attrs = ' '.join(f'data-{k}="{escape(v, quote=True)}"' for k,v in [('title',name),('type',kind),('description',description),('approach',approach)])
            cards.append(f'<button class="project-card reveal" data-project {attrs} aria-label="Read about {escape(name)}"><div class="project-art art-{art}" aria-hidden="true"><span class="mock-label">CONCEPT / NOT CLIENT WORK</span>{visuals[art]}</div><div class="project-info"><div><h3>{escape(name)}</h3><p>{escape(kind)}</p></div><span class="project-arrow">↗</span></div></button>')
        sections.append(f'<section class="section gallery-section" data-category="{key}" aria-labelledby="heading-{key}"><div class="gallery-section-heading"><h2 id="heading-{key}">{escape(label)}</h2><span>0{group_index} / {len(items):02} CONCEPTS</span></div><div class="gallery-grid">{"".join(cards)}</div></section>')
    page = f'''<!doctype html>
<html lang="en" data-mode="{mode}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="{'#f5f0e6' if creative else '#101820'}"><meta name="description" content="Johannes Claus — {'creative' if creative else 'IT'} gallery. Illustrative concepts organized by discipline."><title>{title} — Johannes Claus</title><link rel="icon" href="favicon.svg"><link rel="stylesheet" href="styles.css"><script defer src="script.js"></script></head>
<body data-page="{mode}"><a class="skip" href="#main">Skip to content</a><div class="reading-progress" aria-hidden="true"></div><header class="header"><a class="wordmark" href="index.html" aria-label="Johannes Claus home">jc<span>✳</span></a><nav aria-label="Main navigation"><a href="index.html#experience">My story</a><a href="it.html" {'aria-current="page"' if not creative else ''}>IT work ↗</a><a href="creative.html" {'aria-current="page"' if creative else ''}>Creative work ↗</a><a href="index.html#contact">Say hello</a></nav><span class="header-note">A DIFFERENT SIDE OF THE SAME MIND.</span></header>
<main id="main"><section class="section gallery-hero" id="top"><div class="gallery-top"><a class="back-link" href="index.html">← Back to my story</a><a class="gallery-switch" href="{other}.html">{'☾ Visit the night shift' if creative else '☀ Visit the day shift'} ↗</a></div><h1>{headline}</h1><div class="gallery-intro"><div><span class="eyebrow">{'DAYLIGHT / THE CREATIVE GALLERY' if creative else 'AFTER HOURS / THE IT GALLERY'}</span><p>{intro}</p></div><span class="gallery-stamp">IDEAS IN<br>PROGRESS ✳</span></div><p class="gallery-disclaimer">These are illustrative mock projects, ready for my actual work. No client work or project outcomes are claimed.</p></section>
<div class="gallery-toolbar"><span>TAKE A DIFFERENT ROUTE</span><div class="filter-buttons" role="group" aria-label="Filter work by category">{buttons}</div><span id="filter-status" role="status" aria-live="polite">{count} concepts shown</span></div>
{''.join(sections)}
<section class="section gallery-end"><span class="eyebrow">THERE'S MORE ON THE OTHER SIDE.</span><h2>Change the <em>scenery.</em></h2><p>Same person. A different perspective.</p><a class="button primary" href="{other}.html">Explore the {'IT' if creative else 'creative'} gallery ↗</a></section></main>
<footer><a class="wordmark" href="index.html">jc<span>✳</span></a><span>© <span data-year>2026</span> Johannes Claus</span><span>MADE WITH LOGIC & A LITTLE CITY MAGIC.</span><a href="#top">Uptown ↑</a></footer>
<dialog id="project-dialog" aria-labelledby="dialog-title"><button class="dialog-close" aria-label="Close project details">×</button><span class="eyebrow" id="dialog-tag"></span><h2 id="dialog-title"></h2><p id="dialog-description"></p><h3>The direction</h3><p id="dialog-approach"></p><p class="dialog-note">Illustrative concept / placeholder. This is not a claim of completed client work.</p></dialog>
</body></html>'''
    (ROOT / f'{mode}.html').write_text(page, encoding='utf-8')
print('Generated it.html and creative.html.')
