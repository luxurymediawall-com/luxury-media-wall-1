/* Builds designs/index.html - the "choose your design" page customers get as
   one link. Every design comes from site-config.js (PROJECTS and ENTRANCES)
   plus the real installation photos listed below, so a design added to the
   homepage only needs this script run again:

     node tools/build-designs.js

   Each card carries a short code (R1, D07, E3) and a WhatsApp button that
   sends that code and name, so the reply already says which wall it is. */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'assets/js/site-config.js'), 'utf8');
const ctx = {};
vm.runInNewContext(src + '\n;this.out = { CONTACT, PROJECTS, ENTRANCES };', ctx);
const { CONTACT, PROJECTS, ENTRANCES } = ctx.out;

/* Photographs of walls our own team built. Kept apart from the design
   collection so nobody mistakes a design for a finished job, or the reverse.
   `late: true` moves a photo to the last section of the page instead. */
const REAL = [
  { late: true, img: 'real-07-walnut-media-wall', title: 'Walnut Media Wall with Lit Shelves',
    text: 'Full-height walnut cabinets with LED-lit open shelves, a backlit TV recess and a floating unit with lit drawers.',
    tags: ['Walnut', 'LED', 'Storage'] },
  { late: true, img: 'real-08-glass-display-media-wall', title: 'Glass Display Media Wall',
    text: 'Dark walnut tall units with smoked-glass display cabinets, LED shelves and a white floating console.',
    tags: ['Walnut', 'LED', 'Glass'] },
  { late: true, img: 'real-09-walnut-media-wall-side', title: 'Walnut Media Wall (Side View)',
    text: 'The same walnut wall from the side, showing the depth of the lit shelving and the full-height cabinets.',
    tags: ['Walnut', 'LED', 'Storage'] },
  { late: true, img: 'real-01-living-media-wall', title: 'Living Room Media Wall',
    text: 'Marble-look TV surround, walnut shelving with lit niches and a long floating console.',
    tags: ['Marble', 'Walnut', 'LED'] },
  { late: true, img: 'real-03-entrance-wood-mosaic', title: 'Entrance Feature Wall',
    text: '3D timber mosaic framed by walnut wall panels and a slim stone-top console.',
    tags: ['Walnut', 'Entrance'] },
  { late: true, img: 'real-05-bedroom-tv-wall', title: 'Bedroom TV Wall',
    text: 'White marble surround, fluted walnut side panel, floating walnut drawers and a vanity with an oval mirror.',
    tags: ['Marble', 'Walnut', 'Fluted', 'Bedroom'] },
  { late: true, img: 'real-02-bedroom-feature-wall', title: 'Bedroom Feature Wall',
    text: 'Fluted walnut headboard panel with built-in lighting and matching side panels.',
    tags: ['Walnut', 'Fluted', 'Bedroom'] },
  { late: true, img: 'real-06-mirror-console', title: 'Entrance Console with Mirrors',
    text: 'Solid wood console with a marble top under three gold-framed oval mirrors.',
    tags: ['Marble', 'Mirror', 'Entrance'] },
  { late: true, img: 'real-04-walk-in-wardrobe', title: 'Walk-in Wardrobe',
    text: 'Walnut joinery with LED-lit shelving, smoked glass and a mirrored door.',
    tags: ['Walnut', 'LED', 'Wardrobe'] }
];

/* Homepage photographs that are not in PROJECTS. 06 and 09 repeat 02 and 08
   from another angle, so they are left out. */
const MORE = [
  { img: 'project-01-marble-halo', title: 'Marble Halo Media Wall',
    short: 'A white marble panel with a recessed LED halo around the TV and a floating console below.',
    tags: ['Marble', 'LED', 'Floating'], style: 'Bright contemporary',
    materials: 'Calacatta-look porcelain / Matt lacquer console / Lit open shelving',
    lighting: 'LED halo behind the screen frame, wash under the floating console' },
  { img: 'project-02-warm-oak', title: 'Warm Oak and Stone Wall',
    short: 'Light stone behind the TV between tall oak cabinets, with lit niches and a low dark console.',
    tags: ['Oak', 'Stone', 'LED'], style: 'Warm modern',
    materials: 'Oak veneer cabinets / Light stone panel / Smoked-glass console',
    lighting: 'Vertical LED lines in the cabinets, lit niches, under-console wash' },
  { img: 'project-03-dark-luxury', title: 'Dark Marble and Brass Wall',
    short: 'Dark marble with an art-deco brass pattern, framed by walnut display cabinets.',
    tags: ['Marble', 'Brass', 'Walnut'], style: 'Dark luxury',
    materials: 'Dark marble with brass inlay / Walnut cabinets / Glass display shelves',
    lighting: 'Warm LED in the display cabinets and along the console' },
  { img: 'project-04-fluted-travertine', title: 'Fluted Travertine Wall',
    short: 'Floor-to-ceiling fluted stone with hidden grazing light and a bronze floating unit.',
    tags: ['Travertine', 'Fluted', 'LED'], style: 'Soft minimal',
    materials: 'Fluted travertine-look panels / Bronze glass floating unit',
    lighting: 'Grazing LED from the ceiling line, halo behind the TV panel' },
  { img: 'project-05-full-height', title: 'Full-Height Oak Media Wall',
    short: 'Marble centre panel with full-height oak storage on one side and a long gloss console.',
    tags: ['Oak', 'Marble', 'Storage'], style: 'Modern family room',
    materials: 'Oak veneer / Marble-look panel / Black gloss console',
    lighting: 'LED under the console and inside the side niche' },
  { img: 'project-07-fireplace', title: 'Marble Fireplace and Glass Display',
    short: 'Marble wall with a linear fire under the TV, dark fluted oak sides and lit glass cabinets.',
    tags: ['Marble', 'Fireplace', 'Fluted'], style: 'Classic contemporary',
    materials: 'Calacatta-look porcelain / Dark fluted oak / Glass display cabinets',
    lighting: 'LED inside the glass cabinets, glow from the linear fire' },
  { img: 'project-08-backlit-onyx', title: 'Backlit Onyx Media Wall',
    short: 'Glowing onyx behind the TV between curved walnut cabinets with gold trim.',
    tags: ['Onyx', 'Walnut', 'Backlit'], style: 'Statement luxury',
    materials: 'Backlit onyx-look panel / Walnut veneer / Gold trim',
    lighting: 'Full backlight behind the onyx, LED in the curved display niches' }
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const base = (img) => img.replace(/^assets\/img\//, '');
const wa = (code, title) => CONTACT.whatsapp + '?text=' + encodeURIComponent(
  `Hi Luxury Media Wall, I like design ${code} - ${title}. ` +
  `Can you make it for my wall? https://luxurymediawall.com/designs/#${code.toLowerCase()}`);

const picture = (img, alt, wide) => {
  const b = '../assets/img/' + base(img);
  return `<img src="${b}-900.jpg" srcset="${b}-480.jpg 480w, ${b}-900.jpg 900w, ${b}-1400.jpg 1400w"
             sizes="(min-width: 1100px) 33vw, (min-width: 700px) 50vw, 100vw"
             loading="lazy" decoding="async" alt="${esc(alt)}"${wide ? ' class="dz__img--wide"' : ''}>`;
};

const filterTags = ['Marble', 'Walnut', 'Oak', 'Fluted', 'Travertine', 'Stone', 'LED', 'Fireplace', 'Mirror'];
const norm = (tags) => [...new Set(tags.flatMap((t) => {
  const o = [t];
  if (/oak/i.test(t) && t !== 'Oak') o.push('Oak');
  if (/ribbed/i.test(t)) o.push('Fluted');
  if (/backlit|led/i.test(t)) o.push('LED');
  if (/onyx|stone|concrete/i.test(t)) o.push('Stone');
  return o;
}))];

const card = ({ code, group, title, text, tags, img, alt, rows, features }) => {
  const t = norm(tags || []);
  const dl = rows.filter(([, v]) => v).map(([k, v]) =>
    `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
  const fl = features && features.length
    ? `<ul class="dz__features">${features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>` : '';
  return `
    <article class="dz__card" id="${code.toLowerCase()}" data-group="${group}" data-tags="${esc(t.join(' '))}">
      <div class="dz__media">
        ${picture(img, alt || title)}
        <span class="dz__code">${code}</span>
      </div>
      <div class="dz__body">
        <h3>${esc(title)}</h3>
        <p>${esc(text)}</p>
        ${t.length ? `<ul class="dz__tags">${t.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
        ${dl || fl ? `<details class="dz__more"><summary>See details</summary>${dl ? `<dl>${dl}</dl>` : ''}${fl}</details>` : ''}
        <a class="btn btn--dark dz__pick" href="${esc(wa(code, title))}" target="_blank" rel="noopener">
          <span>Choose this design</span>
        </a>
      </div>
    </article>`;
};

const realCards = REAL.map((r, i) => card({
  code: 'R' + (i + 1), group: 'real', title: r.title, text: r.text, tags: r.tags,
  img: r.img, rows: [['Type', 'Real installation by our team']], late: r.late
}));
const real = realCards.filter((c, i) => !REAL[i].late);
const realLate = realCards.filter((c, i) => REAL[i].late);

const designs = [
  ...PROJECTS.map((p) => ({ title: p.title, text: p.short, tags: p.tags, img: p.img, alt: p.alt,
    rows: [['Style', p.style], ['Materials', p.materials], ['Lighting', p.lighting]], features: p.features })),
  ...MORE.map((p) => ({ title: p.title, text: p.short, tags: p.tags, img: p.img,
    rows: [['Style', p.style], ['Materials', p.materials], ['Lighting', p.lighting]] }))
].map((d, i) => card({ ...d, code: 'D' + String(i + 1).padStart(2, '0'), group: 'wall' }));

const entrances = ENTRANCES.map((e, i) => card({
  code: 'E' + (i + 1), group: 'entrance', title: e.title, text: e.text,
  tags: ['Mirror', ...(/oak/i.test(e.spec) ? ['Oak'] : []), ...(/marble/i.test(e.spec) ? ['Marble'] : []),
         ...(/fluted/i.test(e.spec) ? ['Fluted'] : []), ...(/led|lit/i.test(e.spec) ? ['LED'] : [])],
  img: e.img, alt: e.alt, rows: [['Finishes', e.spec], ['Best for', e.best]]
}));

const total = realCards.length + designs.length + entrances.length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) - same property as the homepage. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18400415095"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-18400415095');
  gtag('config', 'G-X50L5FXLE8');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- Generated by tools/build-designs.js from site-config.js. Edit the data
     or the script, then run it again - do not edit this file by hand. -->
<title>Choose Your Media Wall Design | Luxury Media Wall Dubai</title>
<meta name="description" content="Browse ${total} media wall, TV wall and entrance designs, each with materials and lighting. Pick the one you like and send it to us on WhatsApp for a free quote in Dubai, Abu Dhabi and Sharjah.">
<meta name="author" content="Luxury Media Wall">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#111111">
<link rel="canonical" href="https://luxurymediawall.com/designs/">

<meta property="og:type" content="website">
<meta property="og:locale" content="en_AE">
<meta property="og:site_name" content="Luxury Media Wall">
<meta property="og:title" content="Choose your media wall design">
<meta property="og:description" content="${total} designs with materials and lighting. Tap the one you like and send it to us on WhatsApp.">
<meta property="og:url" content="https://luxurymediawall.com/designs/">
<meta property="og:image" content="https://luxurymediawall.com/assets/img/real-05-bedroom-tv-wall-1400.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Choose your media wall design">
<meta name="twitter:description" content="${total} designs with materials and lighting. Tap the one you like and send it to us on WhatsApp.">
<meta name="twitter:image" content="https://luxurymediawall.com/assets/img/real-05-bedroom-tv-wall-1400.jpg">

<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23111111'/%3E%3Crect x='6' y='7' width='20' height='13' fill='%23C6A66B'/%3E%3Crect x='8.5' y='9.5' width='15' height='8' fill='%23111111'/%3E%3Crect x='6' y='23' width='20' height='2.5' fill='%238A8176'/%3E%3C/svg%3E">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,600;1,6..96,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="../assets/css/style.css">
<link rel="stylesheet" href="../assets/css/sections.css">
<link rel="stylesheet" href="../assets/css/service.css">
<link rel="stylesheet" href="../assets/css/designs.css">
</head>

<body>
<a class="skip-link" href="#designs-main">Skip to content</a>

<main class="shell svc dz" id="designs-main">

  <a class="svc__back" href="../">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
    Luxury Media Wall
  </a>

  <div class="svc__head">
    <p class="eyebrow mt-8">Design collection</p>
    <h1 class="h1 mt-6">Choose your design</h1>
    <p class="lede svc__intro">
      Browse ${total} designs, then tap <strong>Choose this design</strong> to send it to us on WhatsApp.
      Every wall is made to measure, so we adjust the size, materials and colours to fit your room.
      Free site visit in Dubai, Abu Dhabi and Sharjah.
    </p>
  </div>

  <div class="dz__filters" role="group" aria-label="Filter designs">
    <button type="button" class="dz__chip is-on" data-filter="all" aria-pressed="true">All</button>
    <button type="button" class="dz__chip" data-filter="group:real" aria-pressed="false">Our real projects</button>
    <button type="button" class="dz__chip" data-filter="group:wall" aria-pressed="false">Media walls</button>
    <button type="button" class="dz__chip" data-filter="group:entrance" aria-pressed="false">Entrance &amp; mirrors</button>
    ${filterTags.map((t) => `<button type="button" class="dz__chip" data-filter="tag:${t}" aria-pressed="false">${t}</button>`).join('\n    ')}
  </div>
  <p class="dz__count" aria-live="polite"><span id="dz-count">${total}</span> designs</p>

${real.length ? `  <section class="dz__section" data-section="real">
    <h2>Real projects by our team</h2>
    <p>Photographs of walls we designed, built and installed.</p>
    <div class="dz__grid">${real.join('')}
    </div>
  </section>
` : ''}

  <section class="dz__section" data-section="wall">
    <h2>Media wall &amp; TV wall designs</h2>
    <p>Design ideas we can build for your home. Tap <em>See details</em> for the materials and lighting.</p>
    <div class="dz__grid">${designs.join('')}
    </div>
  </section>

  <section class="dz__section" data-section="entrance">
    <h2>Entrance &amp; mirror designs</h2>
    <p>Hallway joinery, lit mirrors and consoles, made in the same workshop.</p>
    <div class="dz__grid">${entrances.join('')}
    </div>
  </section>

  <section class="dz__section" data-section="real-more">
    <h2>Real projects by our team</h2>
    <p>Photographs of walls we designed, built and installed.</p>
    <div class="dz__grid">${realLate.join('')}
    </div>
  </section>

  <div class="svc__cta">
    <div>
      <h2>Not sure which one?</h2>
      <p>Send us a photo of your wall and its width and height. We reply with 2 or 3 designs that suit it and a price estimate.</p>
    </div>
    <a class="btn btn--dark" href="${esc(CONTACT.whatsapp + '?text=' + encodeURIComponent('Hi Luxury Media Wall, I need help choosing a design for my wall.'))}" target="_blank" rel="noopener">
      <span>WhatsApp ${esc(CONTACT.phoneDisplay)}</span>
    </a>
  </div>

  <nav class="svc__nav" aria-label="Site">
    <a href="../">Home</a>
    <a href="../#projects">Our projects</a>
    <a href="../tv-wall-dubai/">TV walls in Dubai</a>
    <a href="../custom-tv-wall-units/">Custom TV wall units</a>
    <a href="../faq/">FAQ</a>
    <a href="../ar/">العربية</a>
    <a href="tel:${esc(CONTACT.phoneDial)}">${esc(CONTACT.phoneDisplay)}</a>
  </nav>

</main>

<script>
  /* Filter chips: a group filter shows one section, a tag filter shows every
     card carrying that tag. Sections with nothing left in them are hidden. */
  (function () {
    var chips = document.querySelectorAll('.dz__chip');
    var cards = document.querySelectorAll('.dz__card');
    var sections = document.querySelectorAll('.dz__section');
    var count = document.getElementById('dz-count');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-on', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var shown = 0;
        cards.forEach(function (card) {
          var ok = f === 'all' ||
            (f.indexOf('group:') === 0 && card.getAttribute('data-group') === f.slice(6)) ||
            (f.indexOf('tag:') === 0 && (' ' + card.getAttribute('data-tags') + ' ').indexOf(' ' + f.slice(4) + ' ') > -1);
          card.hidden = !ok;
          if (ok) shown++;
        });
        sections.forEach(function (s) {
          s.hidden = !s.querySelector('.dz__card:not([hidden])');
        });
        count.textContent = shown;
      });
    });
  })();
</script>
<script>
  var ANALYTICS = {
    measurementId:   'G-X50L5FXLE8',
    adsConversionId: 'AW-18400415095',
    metaPixelId:     '1425696606360438',
    adsLabels: { whatsappClick: 'AADECIO1zqIdEPeagMZE', phoneClick: 'kHtSCIGPo6MdEPeagMZE', enquiryForm: 'kHtSCIGPo6MdEPeagMZE' }
  };
</script>
<script src="../assets/js/analytics.js" defer></script>
</body>
</html>
`;

fs.mkdirSync(path.join(root, 'designs'), { recursive: true });
fs.writeFileSync(path.join(root, 'designs/index.html'), html);
console.log(`designs/index.html: ${realCards.length} real, ${designs.length} media walls, ${entrances.length} entrances`);
