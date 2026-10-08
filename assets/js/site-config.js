/* ==========================================================================
   LUXURY MEDIA WALL — Site configuration
   --------------------------------------------------------------------------
   EVERYTHING you are likely to want to change lives in this one file:
   the phone number, every image path, and all project / material copy.
   Edit here and the whole site updates. No other file needs touching.

   IMAGE NAMING CONVENTION
   Each photograph exists at three widths so the browser only downloads
   what it needs:
       assets/img/<name>-480.jpg    phones
       assets/img/<name>-900.jpg    tablets + gallery cards
       assets/img/<name>-1400.jpg   desktop + project modal
   To swap a photograph, drop in replacements at those three widths keeping
   the same file name. Full-resolution masters are kept in /_masters.
   ========================================================================== */

/* ---------------------------------------------------------------- CONTACT */
/* One number, used by every call-to-action and listed wherever someone goes
   looking for it.

   It used to be two. Local search ties a business together by its name,
   address and phone agreeing wherever they appear; a site carrying two
   numbers guarantees that every directory listing disagrees with half of
   it, which is the opposite of what a citation is for. Blanking the second
   line removes every element carrying it sitewide - see renderContactBits -
   so this is the only place to put one back. */
const CONTACT = {
  phoneDisplay:  '+971 56 718 5313',
  phoneDial:     '+971567185313',
  whatsapp:      'https://wa.me/971567185313',

  phoneDisplay2: '',
  phoneDial2:    '',
  whatsapp2:     '',

  city:          'Dubai',
  country:       'United Arab Emirates',
  email:         'hello@luxurymediawall.com'
};

/* Pre-filled WhatsApp message for a specific project enquiry */
const waLink = (message) =>
  CONTACT.whatsapp + (message ? '?text=' + encodeURIComponent(message) : '');

/* -------------------------------------------------------------- IMAGEKIT */
/* Leave `urlEndpoint` empty and the site serves the local files in
   assets/img exactly as it does now. Fill it in and every image on the page
   is served through ImageKit instead, with automatic AVIF/WebP and
   on-the-fly resizing — no other change needed anywhere.

   urlEndpoint: from ImageKit dashboard → Developer options → API keys,
                looks like  https://ik.imagekit.io/your_imagekit_id
   folder:      the folder you uploaded the images into, or '' for the root.

   The uploaded file names must match the base names used below WITHOUT the
   size suffix, e.g. upload `project-01-marble-halo.jpg` (full resolution) —
   ImageKit generates the 480/900/1400 variants itself. */
const IMAGEKIT = {
  urlEndpoint: 'https://ik.imagekit.io/ojutq4xhq',
  folder:      'media-wall',  // set to '' if you upload to the root folder
  transform:   'q-auto,f-auto',

  /* Photographs that live only in assets/img and have NOT been uploaded to
     the ImageKit library yet. Without this they would be rewritten to a CDN
     URL that does not exist and the card would come back empty.

     A new photo therefore works the moment it is dropped in. Upload it to
     ImageKit later, delete its name from this list, and it moves to the CDN
     with no other change. */
  localOnly: ['showcase-*', 'entry-*', 'service-bathroom', 'service-kitchen-dubai', 'luxury-media-wall-film', 'hero-interior', 'showcase-film', 'why-film',
              'material-calacatta-marble', 'material-calacatta-gold', 'material-travertine',
              'material-charcoal-stone', 'material-oak-fluted', 'material-walnut-fluted',
              'material-white-fluted', 'material-smoked-oak', 'material-brass-walnut',
              'material-microcement', 'material-black-profile']
};

/* ------------------------------------------------------------------ MEDIA */
const MEDIA = {
  heroVideo:  'assets/video/hero-interior.mp4', // 1920x1080, the hero's only background
  reelVideo:  'assets/video/luxury-media-wall-film.mp4' // "Watch the transformation" section
};

/* ------------------------------------------------------------- SHOWCASE */
/* The drifting photograph corridor behind the studio statement. Cards are
   dealt alternately to the left and right lane and travel from far behind
   the page toward the reader, so the whole set passes through the section
   one photograph at a time.

   Order matters: neighbours in this list appear on opposite sides at the
   same moment, so light and dark schemes alternate to keep pairs varied. */
const SHOWCASE = [
  { img: 'assets/img/showcase-fireplace-marble',  alt: 'Book-matched marble media wall with a linear fireplace and walnut display niches' },
  { img: 'assets/img/showcase-black-fluted',      alt: 'Black fluted media wall with brass trim and lit walnut display shelving' },
  { img: 'assets/img/showcase-white-floating',    alt: 'White floating TV unit with lit oak niches overlooking the Dubai coast' },
  { img: 'assets/img/showcase-led-stone',         alt: 'Charcoal stone and walnut slat media wall with linear LED detailing' },
  { img: 'assets/img/showcase-beige-arched',      alt: 'Soft beige TV wall framed by curved cabinets with lit arched niches' },
  { img: 'assets/img/showcase-walnut-display',    alt: 'Walnut media wall with glass display cabinets and a travertine centre panel' },
  { img: 'assets/img/showcase-travertine',        alt: 'Full-height travertine TV wall with a floating walnut unit and LED base' },
  { img: 'assets/img/showcase-stone-black',       alt: 'Split-face stone feature wall with a backlit television and black cabinet' },
  { img: 'assets/img/showcase-panelled-gold',     alt: 'Cream panelled media wall with brass inlays and walnut side cabinets' },
  { img: 'assets/img/showcase-room-divider',      alt: 'Double-sided walnut and travertine TV unit dividing an open-plan penthouse' },
  { img: 'assets/img/showcase-fluted-oak',        alt: 'Light oak fluted media wall with lit niches and a floating oak unit' },
  { img: 'assets/img/showcase-hotel-walnut',      alt: 'Hotel-style walnut media wall with fabric panels and lit glass shelves' },
  { img: 'assets/img/showcase-vertical-garden',   alt: 'Walnut and travertine media wall with an integrated vertical garden' },
  { img: 'assets/img/showcase-asymmetric',        alt: 'Asymmetric media wall in travertine, charcoal and walnut with floating shelves' },
  { img: 'assets/img/showcase-curved-walnut',     alt: 'Curved fluted walnut media wall with a sweeping low cabinet' },
  { img: 'assets/img/showcase-concrete-walnut',   alt: 'Board-formed concrete TV wall with walnut panelling and lit shelving' },
  { img: 'assets/img/showcase-ribbed-oak',        alt: 'Ribbed oak media wall with lit display niches and a white floating unit' },
  { img: 'assets/img/showcase-mirror-travertine', alt: 'Walnut and travertine TV wall framed by bronze mirror panels' },
  { img: 'assets/img/showcase-floating-oak',      alt: 'Oak panelled media wall with floating lit shelves and a long oak unit' }
];

/* One full pass from the far distance to the foreground, in seconds. Scaled
   with the number of photographs so the spacing between cards stays even. */
const SHOWCASE_SECONDS = 34;
/* --------------------------------------------------------------- PROJECTS */
/* Separate projects, one photograph each. DESIGN_TRAITS below refers to
   these by index, so keep the two lists in the same order. */
const PROJECTS = [
  {
    n: '01',
    img: 'assets/img/showcase-fireplace-marble',
    title: 'Marble Fireplace Media Wall',
    short: 'Book-matched Calacatta gold slabs around a flush linear fire, flanked by walnut niches.',
    tags: ['Marble', 'Fireplace', 'Walnut'],
    location: 'Downtown Dubai, UAE',
    materials: 'Book-matched Calacatta gold porcelain / Walnut veneer / Honed grey stone cladding',
    style: 'Classic contemporary',
    lighting: 'Warm LED strips inside each niche, recessed downlights, wash beneath the floating hearth',
    features: [
      '1.8 m linear electric fire with a heat-rated recess',
      'Television recessed flush with the marble face',
      'Four lit display niches in walnut',
      'Floating hearth bench with concealed drawers'
    ],
    alt: 'Book-matched marble media wall with a linear fireplace and walnut display niches'
  },
  {
    n: '02',
    img: 'assets/img/showcase-black-fluted',
    title: 'Black Fluted Media Wall',
    short: 'Matt black flutes framed in brushed brass, beside a floor-to-ceiling lit display unit.',
    tags: ['Fluted', 'Black Oak', 'Brass'],
    location: 'Business Bay, Dubai, UAE',
    materials: 'Black-stained oak flutes / Brushed brass trim / Slate-effect porcelain / Walnut',
    style: 'Dark modern',
    lighting: 'Vertical LED channels in the display frame, glass shelves lit from above',
    features: [
      'Brass-framed fluted panel behind the TV',
      'Tall walnut display unit with glass shelves',
      'Slatted walnut door hiding the AV rack',
      'Low black oak console with push-to-open drawers'
    ],
    alt: 'Black fluted media wall with brass trim and lit walnut display shelving'
  },
  {
    n: '03',
    img: 'assets/img/showcase-white-floating',
    title: 'White Floating TV Unit',
    short: 'A quiet matt white unit with lit oak niches, kept low so the sea view does the talking.',
    tags: ['Minimal', 'White', 'Oak'],
    location: 'Umm Suqeim, Dubai, UAE',
    materials: 'Matt white lacquer / Natural oak veneer / Smooth plaster wall',
    style: 'Soft minimal',
    lighting: 'Backlit television halo, warm LED strips inside the oak niches',
    features: [
      'Wall-hung unit clear of the floor',
      'Two lit open niches in natural oak',
      'Handle-less drawers with soft close',
      'Cables run inside the wall to the TV'
    ],
    alt: 'White floating TV unit with lit oak niches overlooking the Dubai coast'
  },
  {
    n: '04',
    img: 'assets/img/showcase-led-stone',
    title: 'Linear LED Stone Wall',
    short: 'Charcoal stone panels cut by bent LED lines around a walnut-slatted TV recess.',
    tags: ['Stone', 'LED', 'Walnut'],
    location: 'Dubai Marina, UAE',
    materials: 'Charcoal slate-effect panels / Walnut slats / Anthracite lacquer',
    style: 'Contemporary statement',
    lighting: 'Recessed aluminium LED profiles with bent corners, backlit slats, floor wash under the unit',
    features: [
      'Custom-bent LED profiles set into the stone',
      'Walnut slat surround behind the TV',
      'Open lit bays for AV equipment',
      'Scene control on one wall keypad'
    ],
    alt: 'Charcoal stone and walnut slat media wall with linear LED detailing'
  },
  {
    n: '05',
    img: 'assets/img/showcase-beige-arched',
    title: 'Curved Beige Media Wall',
    short: 'Rounded tall cabinets with arched lit niches either side of a lime-plaster TV wall.',
    tags: ['Curved', 'Plaster', 'Oak'],
    location: 'Palm Jumeirah, Dubai, UAE',
    materials: 'Textured lime plaster / Matt cream lacquer / Natural oak / Travertine top',
    style: 'Warm organic',
    lighting: 'Backlit television halo, LED lighting inside each arched niche',
    features: [
      'Two curved tall units with arched display niches',
      'Floating console with rounded ends',
      'Hand-applied plaster feature wall',
      'Concealed storage behind full-height doors'
    ],
    alt: 'Soft beige TV wall framed by curved cabinets with lit arched niches'
  },
  {
    n: '06',
    img: 'assets/img/showcase-walnut-display',
    title: 'Walnut Display Media Wall',
    short: 'Full-width walnut joinery with glass-fronted display cabinets around a travertine TV panel.',
    tags: ['Walnut', 'Travertine', 'Display'],
    location: 'Zabeel, Dubai, UAE',
    materials: 'Walnut veneer / Bronze-framed glass doors / Honed travertine / Brass inlay',
    style: 'Luxury classic',
    lighting: 'LED strips under every shelf, downlights washing the travertine',
    features: [
      'Glass-fronted display cabinets on both sides',
      'Travertine panel set into the joinery',
      'Six-drawer walnut base with brass inlay',
      'Shelf lighting on a separate dimmer'
    ],
    alt: 'Walnut media wall with glass display cabinets and a travertine centre panel'
  },
  {
    n: '07',
    img: 'assets/img/showcase-travertine',
    title: 'Full-Height Travertine Wall',
    short: 'Large-format travertine from floor to ceiling over a floating walnut and stone console.',
    tags: ['Travertine', 'Walnut', 'Villa'],
    location: 'Jumeirah, Dubai, UAE',
    materials: 'Vein-cut travertine slabs / Walnut veneer / Travertine top',
    style: 'Natural minimal',
    lighting: 'Floor wash under the floating console, LED lighting in the open bays',
    features: [
      'Travertine laid in a matched grid to the ceiling',
      'Floating console with a stone top',
      'Three lit open display bays',
      'Television mounted on a flush bracket'
    ],
    alt: 'Full-height travertine TV wall with a floating walnut unit and LED base'
  },
  {
    n: '08',
    img: 'assets/img/showcase-stone-black',
    title: 'Split-Face Stone Media Wall',
    short: 'Rough split-face stone behind a backlit screen, grounded by a matt black cabinet.',
    tags: ['Stone', 'Black', 'Backlit'],
    location: 'Downtown Dubai penthouse, UAE',
    materials: 'Split-face grey stone / Matt black lacquer / Walnut side reveals',
    style: 'Dark luxury',
    lighting: 'Backlit halo behind the TV, LED wash under the cabinet grazing the stone',
    features: [
      'Split-face stone cladding floor to ceiling',
      'Long matt black cabinet with open AV shelves',
      'Walnut reveals on both sides of the wall',
      'Grazing light to bring out the stone texture'
    ],
    alt: 'Split-face stone feature wall with a backlit television and black cabinet'
  },
  {
    n: '09',
    img: 'assets/img/showcase-panelled-gold',
    title: 'Panelled Cream and Brass Wall',
    short: 'Cream panelling with thin brass inlays, a backlit TV frame and walnut side cabinets.',
    tags: ['Panelled', 'Brass', 'Walnut'],
    location: 'Dubai Marina, UAE',
    materials: 'Cream lacquered panels / Brass inlay strips / Walnut veneer / Fluted glass',
    style: 'Art deco modern',
    lighting: 'Backlit TV frame, LED outline to the wall edges, lit glass cabinet tops',
    features: [
      'Geometric panelling with brass inlay',
      'Raised frame around the television',
      'Pair of walnut and cream side cabinets',
      'Floating walnut console with underlight'
    ],
    alt: 'Cream panelled media wall with brass inlays and walnut side cabinets'
  },
  {
    n: '10',
    img: 'assets/img/showcase-room-divider',
    title: 'Double-Sided TV Room Divider',
    short: 'A freestanding walnut and travertine unit that splits living and dining in an open plan.',
    tags: ['Divider', 'Walnut', 'Travertine'],
    location: 'DIFC, Dubai, UAE',
    materials: 'Walnut veneer / Vein-cut travertine / Bronze-tinted glass',
    style: 'Open-plan contemporary',
    lighting: 'LED strips under every shelf, lit TV recess',
    features: [
      'Shelving usable from both sides',
      'Television recessed into the travertine',
      'Deep base drawers for media storage',
      'Power and data brought up through the floor'
    ],
    alt: 'Double-sided walnut and travertine TV unit dividing an open-plan penthouse'
  },
  {
    n: '11',
    img: 'assets/img/showcase-fluted-oak',
    title: 'Light Oak Fluted Media Wall',
    short: 'Pale oak flutes and lit plaster niches over a floating oak console with a travertine base.',
    tags: ['Fluted', 'Oak', 'Niches'],
    location: 'Business Bay, Dubai, UAE',
    materials: 'Natural oak flutes / Lime plaster / Travertine skirting / Oak veneer',
    style: 'Light Scandinavian',
    lighting: 'Vertical LED lines beside the flutes, LED strips inside the niches, floor wash',
    features: [
      'Television framed inside the fluted panel',
      'Two lit wall niches for display',
      'Floating oak console with an open media bay',
      'Travertine band at the base of the wall'
    ],
    alt: 'Light oak fluted media wall with lit niches and a floating oak unit'
  },
  {
    n: '12',
    img: 'assets/img/showcase-hotel-walnut',
    title: 'Hotel-Style Walnut Media Wall',
    short: 'Walnut, woven fabric panels and brass lines, finished like a five-star suite.',
    tags: ['Walnut', 'Fabric', 'Brass'],
    location: 'Downtown Dubai, UAE',
    materials: 'Walnut veneer / Woven fabric wall panels / Brass inlay / Glass shelves',
    style: 'Hotel luxury',
    lighting: 'LED lines above and below the TV panel, lit glass niches, cove lighting',
    features: [
      'Fabric panels above and below the television',
      'Brass-lined walnut frame',
      'Two lit glass display niches',
      'Floating walnut console with fluted front'
    ],
    alt: 'Hotel-style walnut media wall with fabric panels and lit glass shelves'
  },
  {
    n: '13',
    img: 'assets/img/showcase-vertical-garden',
    title: 'Vertical Garden Media Wall',
    short: 'A lit living plant wall beside a travertine TV panel, over a long walnut console.',
    tags: ['Garden', 'Travertine', 'Walnut'],
    location: 'Dubai Hills Estate villa, UAE',
    materials: 'Live planting / Travertine / Walnut slats / Walnut veneer',
    style: 'Biophilic modern',
    lighting: 'Plant-safe LED frame around the garden, backlit walnut slats',
    features: [
      'Framed vertical garden with drip irrigation',
      'Travertine panel behind the television',
      'Walnut slat backdrop across the wall',
      '4 m floating console with open bays'
    ],
    alt: 'Walnut and travertine media wall with an integrated vertical garden'
  },
  {
    n: '14',
    img: 'assets/img/showcase-asymmetric',
    title: 'Asymmetric Stone and Walnut Wall',
    short: 'Offset travertine and charcoal blocks with floating walnut shelves and a long wall-hung unit.',
    tags: ['Asymmetric', 'Travertine', 'Walnut'],
    location: 'Sheikh Zayed Road, Dubai, UAE',
    materials: 'Travertine / Charcoal lacquer / Walnut veneer / Walnut slats',
    style: 'Architectural contemporary',
    lighting: 'Vertical LED joints between blocks, lit floating shelves, floor wash',
    features: [
      'Offset panel layout off the TV centre line',
      'Stack of lit floating walnut shelves',
      'Wall-hung walnut unit with LED underlight',
      'Slatted walnut returns on both walls'
    ],
    alt: 'Asymmetric media wall in travertine, charcoal and walnut with floating shelves'
  },
  {
    n: '15',
    img: 'assets/img/showcase-curved-walnut',
    title: 'Curved Fluted Walnut Wall',
    short: 'A sweeping curved walnut wall with a recessed screen and a matching curved console.',
    tags: ['Curved', 'Walnut', 'Fluted'],
    location: 'Downtown Dubai, UAE',
    materials: 'Curved fluted walnut / Walnut veneer / Lime plaster',
    style: 'Sculptural modern',
    lighting: 'LED strip under the curved wall, lit shelves at both ends of the console',
    features: [
      'Curved wall built on a formed substrate',
      'Television recessed into the flutes',
      'Curved console following the wall line',
      'Open shelving at each end'
    ],
    alt: 'Curved fluted walnut media wall with a sweeping low cabinet'
  },
  {
    n: '16',
    img: 'assets/img/showcase-concrete-walnut',
    title: 'Concrete and Walnut Media Wall',
    short: 'Raw concrete cladding with a tall walnut panel and cast shelving for a loft feel.',
    tags: ['Concrete', 'Walnut', 'Loft'],
    location: 'Palm Jumeirah, Dubai, UAE',
    materials: 'Micro-concrete wall panels / Walnut veneer / Cast concrete shelving',
    style: 'Industrial warm',
    lighting: 'LED strips in every concrete shelf, floor wash under the console',
    features: [
      'Concrete-effect cladding with exposed tie holes',
      'Tall walnut feature panel',
      'Built-in lit concrete shelving column',
      'Floating six-door walnut console'
    ],
    alt: 'Board-formed concrete TV wall with walnut panelling and lit shelving'
  },
  {
    n: '17',
    img: 'assets/img/showcase-ribbed-oak',
    title: 'Ribbed Oak Media Wall',
    short: 'Deep ribbed oak across the whole wall with lit display niches and a white console.',
    tags: ['Ribbed', 'Oak', 'Niches'],
    location: 'Dubai Creek Harbour, UAE',
    materials: 'Solid oak ribs / Oak veneer niches / Matt white lacquer',
    style: 'Warm contemporary',
    lighting: 'LED lines running up the ribs, lit niche shelves',
    features: [
      'Ribbed oak cladding floor to ceiling',
      'Two tall lit display niches',
      'Long white console on an oak plinth',
      'Black steel shelf lines across the wall'
    ],
    alt: 'Ribbed oak media wall with lit display niches and a white floating unit'
  },
  {
    n: '18',
    img: 'assets/img/showcase-mirror-travertine',
    title: 'Mirror and Travertine Media Wall',
    short: 'Walnut and travertine at the centre, framed by bronze mirror panels that widen the room.',
    tags: ['Mirror', 'Travertine', 'Walnut'],
    location: 'Downtown Dubai, UAE',
    materials: 'Bronze mirror / Travertine / Walnut veneer / Brass trims',
    style: 'Modern classic',
    lighting: 'LED strips inside the console bays, chandelier and cove lighting',
    features: [
      'Full-height bronze mirror panels with brass trim',
      'Walnut-framed television surround',
      'Floating console with lit open bays',
      'Travertine panels on both sides of the TV'
    ],
    alt: 'Walnut and travertine TV wall framed by bronze mirror panels'
  },
  {
    n: '19',
    img: 'assets/img/showcase-floating-oak',
    title: 'Floating Oak Shelf Media Wall',
    short: 'Oak panels and lit floating shelves over a 4 m wall-hung oak console.',
    tags: ['Oak', 'Shelving', 'Floating'],
    location: 'Downtown Dubai, UAE',
    materials: 'Natural oak panels / Oak veneer / Venetian plaster / Marble floor',
    style: 'Soft modern',
    lighting: 'LED strips under each floating shelf and under the console',
    features: [
      'Floating oak shelves with hidden fixings',
      'Oak panels behind and beside the TV',
      '4 m wall-hung console with open bays',
      'Venetian plaster to the rest of the wall'
    ],
    alt: 'Oak panelled media wall with floating lit shelves and a long oak unit'
  }
];

/* --------------------------------------------------- BEFORE / AFTER PAIRS */
/* Both sides are now base names (no size suffix) and use the same responsive
   widths as everything else.

   The "before" frames were derived from each finished photograph with
   ImageKit's AI edit (e-edit), so the room, floor, curtains, ceiling detail,
   lighting and camera angle match the "after" exactly — which is what makes
   the slider read as one continuous shot. They are illustrations of the
   starting condition, NOT photographs of the actual site before work began.
   Swap in real survey photos when you have them: same three widths, same
   base-name convention, and nothing else needs changing.                   */
const TRANSFORMS = [
  {
    before: 'assets/img/before-01-plain-wall',
    after:  'assets/img/project-01-marble-halo',
    title:  'Plain Wall to Marble Statement',
    text:   'A blank plastered wall with nothing on it but three downlights, rebuilt as a book-matched marble panel with a floating console and a recessed LED halo.',
    beforeAlt: 'Before: a bare plastered living room wall lit by downlights',
    afterAlt:  'After: a marble media wall with LED halo and floating console'
  },
  {
    before: 'assets/img/before-02-bare-room',
    after:  'assets/img/project-04-fluted-travertine',
    title:  'Bare Wall to Fluted Travertine',
    text:   'An empty wall sitting between two travertine returns, rebuilt as a floor-to-ceiling fluted stone feature with hidden grazing light and a bronze floating unit.',
    beforeAlt: 'Before: an empty plastered wall between travertine returns',
    afterAlt:  'After: a fluted travertine media wall with hidden lighting'
  },
  {
    before: 'assets/img/before-03-empty-wall',
    after:  'assets/img/project-07-fireplace',
    title:  'Empty Wall to Fireplace Feature',
    text:   'A bare wall flanked by dark oak returns, rebuilt as a marble fireplace wall with a linear flame, fluted oak panelling and lit glass display cabinets.',
    beforeAlt: 'Before: a bare plastered wall flanked by dark oak returns',
    afterAlt:  'After: a marble fireplace media wall with fluted oak panelling'
  }
];

/* --------------------------------------------------------------- SERVICES */
/* `flagship: true` renders the dark card. Keep it to one - the whole point is
   that a single card pulls the eye first.
   `img` is a base name; the responsive widths are added automatically.
   `focus` is the object-position for the card crop: these photographs are
   portrait and the card band is landscape, so it decides which slice shows. */
const SERVICES = [
  {
    icon: 'wall', flagship: true,
    label: 'Flagship',
    title: 'Bespoke Media Walls',
    text: 'Measured TV-wall cabinetry, integrated lighting, stone surrounds, concealed storage and finish coordination for the whole room.',
    img: 'assets/img/project-01-marble-halo', focus: '50% 42%',
    cta: 'View media wall service',
    alt: 'Marble media wall with recessed LED halo and floating oak console'
  },
  {
    icon: 'unit',
    label: 'TV Unit Scope',
    title: 'Floating TV Units',
    text: 'Modern floating and fully built-in television units with concealed storage, ventilation and cable routing designed in from the start.',
    img: 'assets/img/project-02-warm-oak', focus: '48% 55%',
    cta: 'View TV unit service',
    alt: 'Warm oak media wall with a long floating television unit'
  },
  {
    icon: 'unit',
    label: 'Kitchen Scope',
    title: 'Kitchen Renovations',
    text: 'Handleless cabinetry, book-matched stone islands and splashbacks, integrated appliances and the concealed lighting that makes a working kitchen feel like part of the living room.',
    img: 'assets/img/service-kitchen-dubai', focus: '50% 50%',
    cta: 'View kitchen service',
    alt: 'Open-plan Dubai kitchen with a book-matched Calacatta marble island, taupe handleless cabinetry and a Burj Al Arab view'
  },
  {
    icon: 'stone',
    label: 'Bathroom Scope',
    title: 'Bathroom Renovations',
    text: 'Large-format stone, floating vanities, backlit mirrors and walk-in showers - set out so the tile joints, the drainage falls and the niche heights all line up before anything is cut.',
    img: 'assets/img/service-bathroom', focus: '50% 50%',
    cta: 'View bathroom service',
    alt: 'Luxury Dubai bathroom with a floating dark marble vanity, backlit mirrors, walk-in shower and a Burj Khalifa view'
  },
  {
    icon: 'storage',
    label: 'Storage Scope',
    title: 'Wardrobes',
    text: 'Sliding or hinged wardrobes, measured interiors, drawers, mirrors, hardware and storage layouts shaped around real wall dimensions.',
    img: 'assets/img/service-wardrobe', focus: '50% 45%',
    cta: 'View wardrobe service',
    alt: 'Walk-in wardrobe in light oak with lit hanging rails, drawers and a full-height mirror'
  },
  {
    icon: 'stone',
    label: 'Stone Scope',
    title: 'Marble & Stone Walls',
    text: 'Luxury marble, porcelain and natural stone finishes, book-matched across the wall and precision-cut around every opening.',
    img: 'assets/img/project-03-dark-luxury', focus: '52% 38%',
    cta: 'View stone service',
    alt: 'Dark brown marble feature wall inlaid with brass linework'
  },
  {
    icon: 'fluted',
    label: 'Panelling Scope',
    title: 'Wood & Fluted Panels',
    text: 'Contemporary veneer, fluted and slatted panelling in any finish, machined to fit the wall rather than cut down on site.',
    img: 'assets/img/project-04-fluted-travertine', focus: '35% 40%',
    cta: 'View panelling service',
    alt: 'Floor-to-ceiling fluted travertine panelling grazed by hidden light'
  },
  {
    icon: 'storage',
    label: 'Joinery Scope',
    title: 'Full-Height Joinery',
    text: 'Full-height wardrobes and custom joinery: measured interiors, drawers, mirrors, hardware and layouts shaped around real wall dimensions.',
    img: 'assets/img/project-05-full-height', focus: '75% 45%',
    cta: 'View joinery service',
    alt: 'Full-height light oak joinery running wall to wall'
  },
  {
    icon: 'led',
    label: 'Lighting Scope',
    title: 'Integrated LED Lighting',
    text: 'Warm ambient and architectural lighting built into the joinery, dimmable and scene-controlled, balanced on site at handover.',
    img: 'assets/img/project-06-minimal-light', focus: '45% 48%',
    cta: 'View lighting service',
    alt: 'Concealed cove and under-console LED lighting on a pale stone wall'
  }
];

/* -------------------------------------------------------------- ENTRANCES */
/* Entrance and hallway joinery: the same trade as a media wall - panelling,
   concealed lighting, a floating unit - at the front door. Each entry is a
   design direction rather than a named project, so the copy describes what
   is built and what it suits, never where it was installed. */
const ENTRANCES = [
  {
    img: 'assets/img/entry-blossom-mirror',
    title: 'Backlit Curved Mirror',
    text: 'A full-height mirror cut in a soft wave and lit from behind, so the glow lands on the plaster rather than on the glass. A blossom branch breaks across the top corner, and a woven bench and round rug keep the floor light underneath.',
    spec: 'Shaped mirror · concealed warm LED · lime plaster · woven bench',
    best: 'A wide entrance where the mirror is the only furniture',
    alt: 'Curved full-height mirror with an LED halo and blossom branches in a hallway'
  },
  {
    img: 'assets/img/entry-lit-mirror-wardrobe',
    title: 'Mirror and Wardrobe Run',
    text: 'A lit mirror panel runs floor to ceiling beside full-height wardrobe doors in the same warm beige, so storage and mirror read as one wall instead of two objects. A slim drawer and a soft stool give somewhere to drop keys and change shoes.',
    spec: 'Matt beige lacquer · LED-framed mirror · brushed brass handles',
    best: 'A narrow corridor entrance that still needs coat storage',
    alt: 'Hallway with a backlit mirror panel beside a full-height beige wardrobe run'
  },
  {
    img: 'assets/img/entry-fluted-oak-console',
    title: 'Fluted Oak Entrance',
    text: 'Oak flutes run wall to wall and carry on around the return, with a black-framed mirror set flush into them. The floating console crosses the mirror line so it appears to continue inside the reflection, and the upholstered bench leaves shoe space beneath.',
    spec: 'Natural oak flutes · black steel frame · floating oak console',
    best: 'A square hall where one material should do all the work',
    alt: 'Fluted oak hallway panelling with a floating console and tall mirror'
  },
  {
    img: 'assets/img/entry-arch-mirror-bench',
    title: 'Arched Mirror with Bench',
    text: 'A round mirror, backlit in warm white, sits between a cushioned bench with drawers below and a slatted oak divider that screens the dining room beyond. Lit niches beside the seat hold the things that otherwise end up on the floor.',
    spec: 'Backlit round mirror · oak slats · bench with drawers · lit niches',
    best: 'An open-plan entrance that needs separating from the living space',
    alt: 'Round backlit mirror with a cushioned bench, storage and a slatted oak divider'
  },
  {
    img: 'assets/img/entry-fluted-arch-gold',
    title: 'Fluted Arch in Brass',
    text: 'A half-round mirror cut into fluted panelling and edged in light, with a dark floating drawer running straight across it. Slim pendants hang in front of the glass, so the reflection doubles them and the arch reads as a full circle.',
    spec: 'Fluted panelling · brass reveals · backlit half-round mirror · floating drawer',
    best: 'A tall entrance hall where the arrival should feel formal',
    alt: 'Half-round backlit mirror set into fluted panelling with a floating drawer unit'
  },
  {
    img: 'assets/img/entry-marble-arch-divider',
    title: 'Marble Arch Divider',
    text: 'An arch cut through to the dining room, framed in book-matched marble and lit around its inner edge. The entrance side stays quiet: fluted panelling, a floating console with a single brass pull, and two globe pendants.',
    spec: 'Backlit marble arch · fluted panels · floating console · brass pull',
    best: 'A flat where the front door opens straight into the dining area',
    alt: 'Arched marble-framed opening between an entrance hall and a dining room'
  },
  {
    img: 'assets/img/entry-lit-mirror-console',
    title: 'Lit Mirror and Console',
    text: 'A full-height mirror edged in warm light, set into the end wall of a narrow hall with a slim console beneath it. Two round stools tuck underneath, so the floor stays clear and the corridor still reads as wide.',
    spec: 'LED-edged mirror · floating console · concealed wardrobe run',
    best: 'A short, narrow hall that needs to look longer',
    alt: 'Full-height mirror edged with warm light above a slim wooden console'
  }
];
/* ---------------------------------------------------------------- PROCESS */
const PROCESS = [
  { n: '01', title: 'Consultation',       text: 'Tell us about your space and requirements. We visit, measure and understand how the room is actually used.' },
  { n: '02', title: 'Design',             text: 'We develop a concept drawn specifically for your room, with elevations and realistic visuals.' },
  { n: '03', title: 'Material Selection', text: 'Choose your marble, wood, stone, lighting and finishes from physical samples, not screenshots.' },
  { n: '04', title: 'Fabrication',        text: 'Your media wall is precision-built in our workshop, dry-assembled and checked before it ever leaves.' },
  { n: '05', title: 'Installation',       text: 'Our team installs everything on site — joinery, stone, lighting, television and cabling.' },
  { n: '06', title: 'Final Reveal',       text: 'Lighting is balanced, surfaces are detailed and your living space becomes a finished statement interior.' }
];

/* -------------------------------------------------------------- MATERIALS */
/* One sample photograph per material, pre-cropped to the 4:5 coverflow card
   (assets/img/material-*-480/900/1400.jpg). Order alternates stone and
   timber so neighbouring cards never look alike.                          */
const MATERIALS = [
  { name: 'Calacatta Marble',        img: 'assets/img/material-calacatta-marble', use: 'TV feature panel',    desc: 'High-gloss Calacatta panel with soft grey veining that brightens the whole room.' },
  { name: 'Natural Oak Fluted',      img: 'assets/img/material-oak-fluted',       use: 'Feature walls',       desc: 'Precision-milled oak flutes that add rhythm and soften the acoustics.' },
  { name: 'Roman Travertine',        img: 'assets/img/material-travertine',       use: 'Full walls',          desc: 'Natural beige travertine with an honest, open pore structure.' },
  { name: 'Walnut Fluted',           img: 'assets/img/material-walnut-fluted',    use: 'Statement panelling', desc: 'Deep walnut slats in a satin finish for a warm, architectural wall.' },
  { name: 'Calacatta Gold',          img: 'assets/img/material-calacatta-gold',   use: 'Full media walls',    desc: 'Warm white slab with gold-toned veining, made for walnut and LED shelving.' },
  { name: 'Smoked Oak Veneer',       img: 'assets/img/material-smoked-oak',       use: 'Cabinet fronts',      desc: 'Dark smoked oak with a deep, open grain and a matt finish.' },
  { name: 'Charcoal Stone',          img: 'assets/img/material-charcoal-stone',   use: 'Dramatic schemes',    desc: 'Matt charcoal stone with a split-face texture that comes alive under grazing light.' },
  { name: 'Matte White Fluted',      img: 'assets/img/material-white-fluted',     use: 'Minimal interiors',   desc: 'Clean white flutes lifted by a concealed LED wash from above.' },
  { name: 'Microcement',             img: 'assets/img/material-microcement',      use: 'Joint-free walls',    desc: 'Seamless light-grey microcement with a smooth, tactile surface.' },
  { name: 'Brass & Walnut',          img: 'assets/img/material-brass-walnut',     use: 'Inlays & reveals',    desc: 'Brushed brass inlay set between dark walnut for a quiet luxury accent.' },
  { name: 'Black Aluminium Profile', img: 'assets/img/material-black-profile',    use: 'Trims & frames',      desc: 'Brushed matt black aluminium with a polished edge for crisp detailing.' }
];

/* ------------------------------------------------- DETAIL GALLERY (CROPS) */
/* Close-up framings of the same craftsmanship, deliberately cropped tight
   so they read as detail shots rather than repeats of the project cards. */
/* NOT CURRENTLY RENDERED. The close-up masonry gallery this fed was replaced
   by the WALL_GUIDE section below. Kept, with its CSS in sections.css, so the
   gallery can be restored as its own section without rebuilding it. */
const DETAILS = [
  { caption: 'Marble veining',      src: 'assets/img/project-01-marble-halo-900.jpg',       pos: '62% 20%', size: '280%', shape: 'tall' },
  { caption: 'LED halo detail',     src: 'assets/img/project-01-marble-halo-900.jpg',       pos: '38% 44%', size: '250%', shape: 'wide' },
  { caption: 'Fluted panel',        src: 'assets/img/project-04-fluted-travertine-900.jpg', pos: '22% 34%', size: '260%', shape: 'tall' },
  { caption: 'Brass inlay',         src: 'assets/img/project-03-dark-luxury-900.jpg',       pos: '56% 36%', size: '260%', shape: 'sq'   },
  { caption: 'Floating cabinet',    src: 'assets/img/project-02-warm-oak-900.jpg',          pos: '44% 74%', size: '240%', shape: 'wide' },
  { caption: 'Wood grain',          src: 'assets/img/project-05-full-height-900.jpg',       pos: '84% 22%', size: '270%', shape: 'tall' },
  { caption: 'Fireplace ribbon',    src: 'assets/img/project-07-fireplace-900.jpg',         pos: '48% 68%', size: '250%', shape: 'wide' },
  { caption: 'Glass display shelf', src: 'assets/img/project-07-fireplace-900.jpg',         pos: '86% 42%', size: '270%', shape: 'tall' },
  { caption: 'Backlit stone',       src: 'assets/img/project-08-backlit-onyx-900.jpg',      pos: '48% 32%', size: '230%', shape: 'sq'   },
  { caption: 'Leather drawer front',src: 'assets/img/project-08-backlit-onyx-900.jpg',      pos: '52% 78%', size: '260%', shape: 'wide' },
  { caption: 'Cable management',    src: 'assets/img/project-06-minimal-light-900.jpg',     pos: '42% 66%', size: '250%', shape: 'tall' },
  { caption: 'Shadow-gap reveal',   src: 'assets/img/project-02-warm-oak-900.jpg',          pos: '70% 34%', size: '280%', shape: 'sq'   }
];

/* ----------------------------------------------------------- CONFIGURATOR */
/* What each completed project actually contains. The configurator scores the
   visitor's selection against this and shows the closest real build, so the
   preview is always a photograph of delivered work rather than a mock-up.
   `p` is the index in PROJECTS. */
const DESIGN_TRAITS = [
  { p: 0,  has: ['led', 'cabinet', 'fire', 'shelves'] },
  { p: 1,  has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 2,  has: ['led', 'cabinet'] },
  { p: 3,  has: ['led', 'cabinet', 'shelves'] },
  { p: 4,  has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 5,  has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 6,  has: ['led', 'cabinet', 'shelves'] },
  { p: 7,  has: ['led', 'cabinet', 'shelves'] },
  { p: 8,  has: ['led', 'cabinet', 'tall'] },
  { p: 9,  has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 10, has: ['led', 'cabinet', 'shelves'] },
  { p: 11, has: ['led', 'cabinet', 'shelves'] },
  { p: 12, has: ['led', 'cabinet'] },
  { p: 13, has: ['led', 'cabinet', 'shelves'] },
  { p: 14, has: ['led', 'cabinet', 'shelves'] },
  { p: 15, has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 16, has: ['led', 'cabinet', 'tall', 'shelves'] },
  { p: 17, has: ['led', 'cabinet', 'tall'] },
  { p: 18, has: ['led', 'cabinet', 'shelves'] }
];

/* --------------------------------------------------------------- QUOTES */
const TESTIMONIALS = [
  {
    text: 'From the first design discussion to the final installation, the entire media wall looks incredibly clean and premium. Every joint lines up.',
    by: 'Dubai Homeowner', meta: 'Downtown Dubai · Marble Media Wall'
  },
  {
    text: 'They measured, drew it properly, and what arrived on site was exactly what we approved. The lighting on the stone is the part everyone comments on.',
    by: 'Villa Owner', meta: 'Al Barari · Fluted Travertine Wall'
  },
  {
    text: 'Our old TV corner was a mess of cables. Now there is not a single wire visible and we have storage we actually use. Worth every dirham.',
    by: 'Apartment Owner', meta: 'Business Bay · Full-Height TV Wall'
  },
  {
    text: 'We were nervous about the fireplace sitting under the screen, but they set out the whole elevation first and showed us the clearances on paper. It has been running all winter without an issue.',
    by: 'Family Home', meta: 'Arabian Ranches · Fireplace Media Wall'
  },
  {
    text: 'The site team arrived when they said they would and left the apartment clean every evening. That sounds like a small thing until you have lived through a fit-out that did not.',
    by: 'Penthouse Owner', meta: 'Dubai Marina · Backlit Onyx Wall'
  },
  {
    text: 'Our living room is narrow so we were worried a full wall unit would close it in. The floating design kept the floor clear and the room genuinely feels bigger than before.',
    by: 'Apartment Owner', meta: 'JVC · Floating TV Unit'
  },
  {
    text: 'They talked us out of the finish we originally asked for and showed us samples under our own evening lighting instead. They were right, and we appreciated being told.',
    by: 'Villa Owner', meta: 'Jumeirah · Venetian Plaster Wall'
  },
  {
    text: 'Two years on there is no movement in any of the joints and the doors still close the way they did on handover. That is the part you only find out about later.',
    by: 'Townhouse Owner', meta: 'Town Square · Wooden Media Wall'
  }
];

/* Enquiry form — media wall types offered in the dropdown */
/* --------------------------------------------------------- WALL GUIDE */
/* The long-form section: one media wall type per entry, each with the
   photograph and the practical specification notes that go with it.

   Two ways to point at a picture:
     img  - a local base path, same convention as everywhere else
     edit - { base, prompt } renders `base` through ImageKit's AI edit for
            wall types we have not photographed on site yet. The edit runs
            once and is cached; every width is resized from that single
            result, so all three srcset entries show the same room.
   Swap an `edit` entry for an `img` one the moment real photography of
   that wall type exists.                                                 */
const WALL_GUIDE = [
  {
    title: 'Marble-Effect Statement Media Wall',
    img: 'assets/img/project-01-marble-halo',
    alt: 'Book-matched marble media wall with a recessed LED halo behind the television',
    text: 'Large-format porcelain gives you the look of a marble slab without the weight, the ' +
          'price or the sealing routine natural stone needs in a humid climate. Book-match the ' +
          'veining across the centre panel and keep the television slightly proud of the surface ' +
          'so the pattern reads around it rather than being cut in half. The wall wants to be at ' +
          'least three metres wide for a full-height joint to look deliberate; below that, a ' +
          'framed central panel usually sits better than a slab that has been squeezed to fit.'
  },
  {
    title: 'Slatted Wood Media Wall',
    img: 'assets/img/project-02-warm-oak',
    alt: 'Warm oak slatted media wall with concealed lighting and a floating cabinet run',
    text: 'Timber slats warm up rooms that are otherwise hard surfaces - porcelain floors, big ' +
          'glazing, painted plaster - and they take the echo out of an open-plan living area at ' +
          'the same time. Real veneer beats printed board here, because the grain has to change ' +
          'across the run or the wall reads as wallpaper at close range. Hold a consistent 10 to ' +
          '12 mm shadow gap between slats: once lighting is grazing down the wall, any drift in ' +
          'that spacing is the first thing the eye catches.'
  },
  {
    title: 'Dark and Moody Media Wall',
    img: 'assets/img/project-03-dark-luxury',
    alt: 'Charcoal media wall with brass inlay detailing and warm concealed lighting',
    text: 'A pale room with a pale television wall can feel oddly unfinished, because the largest ' +
          'object in it has no visual weight. Smoked oak, charcoal lacquer and bronze glass fix ' +
          'that without extra ornament. The trap is lighting: keep concealed strips at 3000K and ' +
          'on a dimmer, since cool white on dark timber turns it grey and flat. Contrast is what ' +
          'makes this scheme work - a dark wall against warm floors and soft furnishings, not a ' +
          'dark wall in a dark room.'
  },
  {
    title: 'Minimalist Floating Media Wall',
    img: 'assets/img/project-06-minimal-light',
    alt: 'Minimal light media wall with a floating cabinet run and fully concealed cabling',
    text: 'The right answer when floor area is tight and the client still wants everything put ' +
          'away. A floating cabinet run keeps the floor line unbroken, which makes a small ' +
          'sitting room read as larger. It only works if the build has somewhere for the ' +
          'services to go: allow at least 100 mm of internal void behind the screen for brackets, ' +
          'sockets and cable routing. Matte lacquer suits this style better than gloss - less ' +
          'reflected glare during the day, and fingerprints do not show on every door.'
  },
  {
    title: 'Fireplace Media Wall',
    img: 'assets/img/project-07-fireplace',
    alt: 'Marble media wall with a linear electric fireplace set below the television',
    text: 'Where a room already wants a central focus, the fire and the screen should be designed ' +
          'as one composition rather than two features sharing a wall. Line up the television ' +
          'width, the fire opening and the cabinet breaks so the whole elevation runs on one set ' +
          'of proportions - a 1.2 m linear fire sits comfortably under a 65-inch screen. Even ' +
          'with an electric unit, take the clearance above the fire from the manufacturer\'s data ' +
          'sheet rather than from the drawing, and design the gap around it.'
  },
  {
    title: 'Fish Tank Media Wall',
    edit: {
      base: 'project-06-minimal-light',
      prompt: 'replace the open shelving with a large built-in aquarium full of water and fish'
    },
    alt: 'Media wall with a large built-in aquarium integrated into the joinery beside the television',
    text: 'A striking wall, but a technical one: it has to be designed around servicing from day ' +
          'one. The tank needs reachable access for filtration, electrics and cleaning, so the ' +
          'joinery should include a maintenance cupboard or a removable panel rather than sealing ' +
          'the aquarium into a display box. Moisture-resistant board, aluminium vent grilles and ' +
          'low-voltage lighting are the sensible specification, because condensation here is a ' +
          'real engineering consideration and not a styling note.'
  },
  {
    title: 'Hidden Door Media Wall',
    edit: {
      base: 'project-05-full-height',
      prompt: 'add a tall flush hidden door in the panelled wall beside the television'
    },
    alt: 'Full-height panelled media wall with a concealed flush door built into the composition',
    text: 'Sometimes there is a store room, a utility space or a second doorway behind the feature ' +
          'wall that the design should not advertise. A concealed door solves it: full-height ' +
          'panelling, a scribed leaf and a consistent 3 mm perimeter gap, so the opening ' +
          'disappears into the rhythm of the wall. Decide the hinge early - it drives everything ' +
          'else. The wrong concealed hinge changes the swing clearance and can push the adjacent ' +
          'shelving out of alignment with the rest of the run.'
  },
  {
    title: 'Venetian Plaster Media Wall',
    edit: {
      base: 'project-09-uae-penthouse',
      prompt: 'make the wall finish warm venetian plaster'
    },
    alt: 'Media wall finished in warm polished Venetian plaster with soft concealed lighting',
    text: 'Some rooms do not need another timber or stone feature - they need texture. Venetian ' +
          'plaster carries enough movement on its own that the joinery can stay quiet, which ' +
          'suits schemes with limited shelving. Ask for sample boards and look at them twice: ' +
          'the same plaster can read almost flat in daylight and far more clouded under 2700K in ' +
          'the evening, and that shift is the entire point of choosing it. The depth comes from ' +
          'the surface, not from complicated joinery.'
  }
];

const WALL_TYPES = [
  'Marble Media Wall',
  'Wooden Media Wall',
  'TV Wall',
  'Floating TV Unit',
  'Fireplace Media Wall',
  'Full-Height Media Wall',
  'Other'
];
