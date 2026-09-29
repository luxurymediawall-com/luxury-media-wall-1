/* ==========================================================================
   LUXURY MEDIA WALL — Behaviour
   Vanilla ES2019+. No framework, no build step, no external libraries.
   Everything is progressive: if a browser lacks a feature the content still
   reads, it simply animates less.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- utils */
  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- IMAGEKIT */
  /* Single choke point for every image URL on the page.
     ImageKit off  ->  'assets/img/project-01-marble-halo-900.jpg'  (unchanged)
     ImageKit on   ->  '<endpoint>/media-wall/project-01-marble-halo.jpg?tr=w-900,q-auto,f-auto'
     The width baked into the local file name becomes the ImageKit w- value,
     so the responsive behaviour is identical either way. */
  const IK = (typeof IMAGEKIT !== 'undefined') ? IMAGEKIT : {};
  const ikEndpoint = (IK.urlEndpoint || '').replace(/\/+$/, '');
  const ikDir = IK.folder ? '/' + String(IK.folder).replace(/^\/+|\/+$/g, '') : '';
  const ikTr = IK.transform || 'q-auto,f-auto';
  const ikLocalOnly = IK.localOnly || [];
  /* An exact base name, or a trailing * for a whole family ('showcase-*'). */
  const isLocalOnly = (base) => ikLocalOnly.some((n) =>
    n.slice(-1) === '*' ? base.indexOf(n.slice(0, -1)) === 0 : n === base);

  function asset(path) {
    if (!ikEndpoint) return path;
    /* Absolute URLs (the hero is hard-coded) and anything outside our media
       folders pass straight through untouched. */
    const local = String(path).match(/^assets\/(?:img|video)\/(.+)$/);
    if (!local) return path;
    /* SVG stays local and stays vector. ImageKit rasterises it to WebP, which
       comes out both larger and softer than the 2 KB source file. */
    if (/\.svg$/i.test(path)) return path;

    const name = local[1];
    const sized = name.match(/^(.+)-(\d+)\.(jpe?g|png)$/i);
    if (sized) {
      /* Not in the ImageKit library yet - serve the local derivative rather
         than a CDN URL that would 404. See IMAGEKIT.localOnly. */
      if (isLocalOnly(sized[1])) return path;
      return `${ikEndpoint}${ikDir}/${sized[1]}.${sized[3]}?tr=w-${sized[2]},${ikTr}`;
    }
    /* No size suffix — video. Plain CDN delivery with no `tr=` so it does not
       consume video-processing credits; ImageKit still optimises the file. */
    /* A video not yet uploaded to the ImageKit library is served from
       assets/video rather than rewritten to a CDN URL that would 404. */
    if (isLocalOnly(name.replace(/\.[^.]+$/, ''))) return path;
    return `${ikEndpoint}${ikDir}/${name}`;
  }

  /* Build a responsive srcset from an image base path */
  const srcset = (base) =>
    `${asset(base + '-480.jpg')} 480w, ${asset(base + '-900.jpg')} 900w, ${asset(base + '-1400.jpg')} 1400w`;

  /* Grid cards never render wider than ~400 CSS px (the shell caps at 1320px),
     so 900w already gives a high-DPI phone well over 2x. Offering 1400w here
     would make 3x devices pull a desktop-sized file for a thumbnail. */
  const srcsetCard = (base) =>
    `${asset(base + '-480.jpg')} 480w, ${asset(base + '-900.jpg')} 900w`;
  const CARD_SIZES = '(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 400px';

  /* ImageKit's AI upscaler, then a plain resize. Used for the before-shots,
     whose masters are only 1084x1451 - requesting more pixels from those
     just stretches them. e-upscale is the FIRST step of the chain, so it
     runs once on the whole image and is cached, and every srcset width is
     cut from that single result:

         ?tr=e-upscale:w-1400,q-auto,f-auto
             \_ once, cached _/ \_ resize _/

     Falls back to the plain local derivative when ImageKit is off or the
     image has not been uploaded there yet. */
  function upscaledUrl(base, width) {
    const name = String(base).replace(/^assets\/img\//, '');
    if (!ikEndpoint || isLocalOnly(name)) return asset(`${base}-${width}.jpg`);
    return `${ikEndpoint}${ikDir}/${name}.jpg?tr=e-upscale:w-${width},${ikTr}`;
  }
  const srcsetUpscaled = (base) =>
    [480, 900, 1400].map((w) => `${upscaledUrl(base, w)} ${w}w`).join(', ');

  /* Escape values that end up inside markup */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  /* ================================================================ ICONS */
  const ICONS = {
    arrow: '<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.7a16 16 0 0 0 6 6l1.1-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.3 6.8.8-5 4.7 1.3 6.8L12 17.3 6 20.6l1.3-6.8-5-4.7 6.8-.8z"/></svg>',
    grip: '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M8 0L2 6l6 6z"/></svg>',
    gripR: '<svg viewBox="0 0 8 12" aria-hidden="true"><path d="M0 0l6 6-6 6z"/></svg>',

    /* Minimal line icons for the services grid */
    svc: {
      wall:    '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="4" width="26" height="24"/><rect x="8" y="9" width="16" height="10"/><path d="M8 24h16"/></svg>',
      unit:    '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="13"/><rect x="6" y="23" width="20" height="5"/><path d="M16 19v4"/></svg>',
      stone:   '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24"/><path d="M4 13c5 2 9-3 12 0s7 4 12 1M4 21c6 1 8-2 11 0s9 2 13-1"/></svg>',
      fluted:  '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 4v24M11 4v24M16 4v24M21 4v24M26 4v24"/><path d="M3 4h26M3 28h26"/></svg>',
      led:     '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="8" width="22" height="6" rx="1"/><path d="M8 18v3M13 18v5M19 18v5M24 18v3M3 27h26"/></svg>',
      storage: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="4" width="24" height="24"/><path d="M16 4v24M4 16h24"/><path d="M12 10h2M18 10h2M12 22h2M18 22h2"/></svg>'
    }
  };

  /* ============================================== 1. HEADER + NAVIGATION */
  function initHeader() {
    const header = $('#header');
    const burger = $('#burger');
    const drawer = $('#drawer');
    if (!header) return;

    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      /* Hide on the way down, bring it back the moment the user scrolls up */
      if (!drawer.classList.contains('is-open')) {
        header.classList.toggle('is-hidden', y > 600 && y > lastY + 6);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    /* Mobile drawer */
    const setDrawer = (open) => {
      drawer.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
      if (open) header.classList.remove('is-hidden');
      /* Stagger the links in */
      $$('.drawer__link', drawer).forEach((el, i) => {
        el.style.transitionDelay = open ? `${140 + i * 60}ms` : '0ms';
      });
    };

    burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
    $$('.drawer__link, .drawer a', drawer).forEach((a) =>
      a.addEventListener('click', () => setDrawer(false))
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
    });

    /* Highlight the section currently in view */
    const links = $$('.nav__link[href^="#"]');
    const targets = links
      .map((l) => ({ link: l, sec: $(l.getAttribute('href')) }))
      .filter((t) => t.sec);

    if ('IntersectionObserver' in window && targets.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => l.classList.remove('is-active'));
          const match = targets.find((t) => t.sec === entry.target);
          if (match) match.link.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach((t) => spy.observe(t.sec));
    }
  }

  /* ======================================================= 2. HERO FILM */
  /* The hero is the 1920x1080 film alone, looping muted behind the headline.

     The source is set at boot (not after load) because there is no photo to
     fall back on - the dark hero ground shows for the moment before the
     first frame, then the film fades up. With reduced motion or data saver
     it stops on its opening frame rather than playing. It pauses whenever
     the hero is scrolled out of view.                                     */
  function initHeroVideo() {
    const media = $('#heroMedia');
    const video = $('#heroVideo');
    const src = (typeof MEDIA !== 'undefined') && MEDIA.heroVideo;
    if (!media || !video || !src) return;

    const conn = navigator.connection || {};
    const still = REDUCED || conn.saveData === true || /2g/.test(conn.effectiveType || '');

    const reveal = () => media.classList.add('is-live');
    video.addEventListener('playing', reveal, { once: true });

    if (still) {
      video.autoplay = false;
      video.removeAttribute('autoplay');
      video.preload = 'metadata';
      video.addEventListener('loadeddata', reveal, { once: true });
      video.src = asset(src) + '#t=0.1';
      return;
    }

    video.src = asset(src);
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      /* Autoplay refused (Low Power Mode): show the paused first frame. */
      if (video.readyState >= 2) reveal();
      else video.addEventListener('loadeddata', reveal, { once: true });
    });

    /* No point decoding 1080p frames nobody can see. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) video.play().catch(() => {});
        else video.pause();
      }).observe(media);
    }
  }

  /* The scroll opening. CSS pins the first screen; here the film is clipped
     open, scaled down and faded across the section's scroll, the headline
     clears early so type never sits over a half-open window, and the
     photographs below travel against the scroll.

     Ported from a React component built on Framer Motion and Lenis. Framer
     only mapped scroll position onto a handful of values - that is the
     arithmetic below - and Lenis only smoothed the wheel, which is the
     browser's own job, so neither library is carried. Reduced motion leaves
     every value alone and the hero reads as the plain film it was. */
  function initHeroScroll() {
    const hero = $('#home');
    if (!hero || !hero.classList.contains('hero--scroll') || REDUCED) return;

    const media = $('#heroMedia');
    const inner = $('.hero__inner', hero);
    const strip = $('.hero__strip', hero);
    const cue = $('.scroll-cue', hero);
    const shots = $$('.hero__px', hero);
    if (!media) return;

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    let span = 1;
    let top = 0;
    let ticking = false;

    function frame() {
      ticking = false;
      const p = clamp01((window.scrollY - top) / span);

      /* The window opens over the first half, so the film reaches full
         bleed well before it starts to leave. */
      const open = clamp01(p / .5);
      const c1 = 25 - 25 * open;
      const c2 = 75 + 25 * open;
      media.style.clipPath =
        `polygon(${c1}% ${c1}%, ${c2}% ${c1}%, ${c2}% ${c2}%, ${c1}% ${c2}%)`;
      media.style.transform = `scale(${(1.16 - .16 * open).toFixed(4)})`;
      media.style.opacity = (1 - clamp01((p - .62) / .3)).toFixed(3);

      const out = clamp01(p / .34);
      const fade = (1 - out).toFixed(3);
      if (inner) {
        inner.style.opacity = fade;
        inner.style.transform = `translateY(${(-40 * out).toFixed(1)}px)`;
      }
      if (strip) strip.style.opacity = fade;
      if (cue) cue.style.opacity = fade;

      const vh = window.innerHeight;
      shots.forEach((img) => {
        const r = img.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const pr = clamp01((vh - r.top) / (vh + r.height));
        const from = Number(img.dataset.start) || 0;
        const to = Number(img.dataset.end) || 0;
        const y = from + (to - from) * pr;
        /* Each one shrinks and clears as it leaves, rather than cutting. */
        const late = clamp01((pr - .75) / .25);
        img.style.transform = `translateY(${y.toFixed(1)}px) scale(${(1 - .15 * late).toFixed(3)})`;
        img.style.opacity = (1 - late).toFixed(3);
      });
    }

    function measure() {
      top = hero.getBoundingClientRect().top + window.scrollY;
      span = Math.max(1, hero.offsetHeight - window.innerHeight);
      frame();
    }

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    /* A photograph that lands late changes how tall the section is. */
    $$('img', hero).forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });
  }
  /* ====================================================== 3. RENDER: HERO */
  function renderContactBits() {
    $$('[data-wa]').forEach((el) => {
      el.href = waLink(el.dataset.wa || '');
    });
    $$('[data-phone-link]').forEach((el) => { el.href = 'tel:' + CONTACT.phoneDial; });
    $$('[data-phone-text]').forEach((el) => { el.textContent = CONTACT.phoneDisplay; });

    /* Second line. If phoneDial2 is blank, every element carrying it is
       removed, so clearing the config cleanly removes the number sitewide. */
    const has2 = Boolean(CONTACT.phoneDial2);
    $$('[data-phone2]').forEach((el) => {
      if (!has2) { el.remove(); return; }
      if (el.hasAttribute('data-phone2-link')) el.href = 'tel:' + CONTACT.phoneDial2;
      if (el.hasAttribute('data-phone2-wa')) el.href = CONTACT.whatsapp2;
    });
    if (has2) $$('[data-phone2-text]').forEach((el) => { el.textContent = CONTACT.phoneDisplay2; });
    const year = $('#year');
    if (year) year.textContent = new Date().getFullYear();
  }


  /* ===================================================== 5. PROJECT MODAL */
  let lastFocused = null;
  let modalOpen = false;

  function openModal(index, fromHistory) {
    const p = PROJECTS[index];
    const modal = $('#modal');
    if (!p || !modal) return;

    lastFocused = document.activeElement;

    $('#modalImg').src = asset(p.img + '-900.jpg');
    $('#modalImg').srcset = srcset(p.img);
    $('#modalImg').alt = p.alt;
    $('#modalBadge').innerHTML = `Project <i>${p.n}</i> / ${String(PROJECTS.length).padStart(2, '0')}`;
    $('#modalTitle').textContent = p.title;
    $('#modalIntro').textContent = p.short;
    $('#modalLocation').textContent = p.location;
    $('#modalMaterials').textContent = p.materials;
    $('#modalStyle').textContent = p.style;
    $('#modalLighting').textContent = p.lighting;
    $('#modalFeatures').innerHTML = p.features.map((f) => `<li>${esc(f)}</li>`).join('');
    /* Tell the share buttons which project is currently open */
    const shareBtns = [$('#modalShare'), $('#modalShareWa')];
    shareBtns.forEach((b) => { if (b) b.dataset.index = String(index); });

    $('#modalWa').href = waLink(
      `Hello Luxury Media Wall, I would like a design similar to Project ${p.n} — ${p.title}. Could you send me a quote?`
    );

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    modalOpen = true;
    $('#modalClose').focus();

    /* A project needs its own address before it is worth sharing. Pushing a
       history entry also means the phone's back gesture closes the modal
       instead of leaving the whole site. */
    if (!fromHistory) {
      try {
        history.pushState({ mwProject: index }, '', '#project-' + p.n);
      } catch (e) { /* file:// blocks pushState — sharing still works */ }
    }
  }

  function closeModal(fromHistory) {
    if (!modalOpen) return;
    const modal = $('#modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
    modalOpen = false;
    if (lastFocused) lastFocused.focus();

    if (!fromHistory && history.state && history.state.mwProject != null) {
      try { history.back(); } catch (e) { /* ignore */ }
    }
  }

  /* ------------------------------------------------------------ SHARING */
  /* navigator.share opens the real OS share sheet on a phone (WhatsApp,
     Messages, Mail). Desktop browsers mostly lack it, so we fall back to
     copying the link. Both paths are wrapped because share() rejects with
     AbortError whenever the user simply dismisses the sheet. */
  async function shareLink(btn, title, text, url) {
    const done = (label) => {
      const original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = label;
      setTimeout(() => { btn.textContent = btn.dataset.label; }, 2200);
    };

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;   /* user cancelled */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      done('Link copied');
    } catch (e) {
      /* Clipboard needs a secure context; select the URL so it can be copied */
      window.prompt('Copy this link:', url);
    }
  }

  const shareUrl = (hash) => location.origin + location.pathname + (hash || '');

  function initShare() {
    /* Share the whole site */
    const site = $('#shareSite');
    if (site) {
      site.addEventListener('click', () => shareLink(
        site,
        'Luxury Media Wall',
        'Bespoke media walls and luxury TV walls in Dubai.',
        shareUrl()
      ));
    }
    const siteWa = $('#shareSiteWa');
    if (siteWa) {
      siteWa.addEventListener('click', () => {
        const msg = 'Luxury Media Wall — bespoke media walls in Dubai: ' + shareUrl();
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }

    /* Share the open project */
    const proj = $('#modalShare');
    if (proj) {
      proj.addEventListener('click', () => {
        const i = Number(proj.dataset.index || 0);
        const p = PROJECTS[i];
        if (!p) return;
        shareLink(proj, p.title + ' — Luxury Media Wall', p.short, shareUrl('#project-' + p.n));
      });
    }
    const projWa = $('#modalShareWa');
    if (projWa) {
      projWa.addEventListener('click', () => {
        const i = Number(projWa.dataset.index || 0);
        const p = PROJECTS[i];
        if (!p) return;
        const msg = `${p.title} — Luxury Media Wall\n${shareUrl('#project-' + p.n)}`;
        window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }

    /* Back / forward moves between the page and an open project */
    window.addEventListener('popstate', (e) => {
      const idx = e.state && e.state.mwProject;
      if (idx != null && !modalOpen) openModal(idx, true);
      else if (idx == null && modalOpen) closeModal(true);
    });

    /* Resolve "#project-07" to a project index, or -1 */
    const indexFromHash = (hash) => {
      const m = String(hash).match(/^#project-(\d{1,2})$/);
      if (!m) return -1;
      return PROJECTS.findIndex((p) => p.n === m[1].padStart(2, '0'));
    };

    /* Someone arrived on a shared link — open that project */
    const initial = indexFromHash(location.hash);
    if (initial >= 0) setTimeout(() => openModal(initial, true), 350);

    /* A project link pasted into the address bar while the site is already
       open only changes the fragment — no reload, so boot never re-runs. */
    window.addEventListener('hashchange', () => {
      const i = indexFromHash(location.hash);
      if (i >= 0 && !modalOpen) openModal(i, true);
    });
  }

  function initModal() {
    const modal = $('#modal');
    if (!modal) return;

    $('#modalClose').addEventListener('click', closeModal);
    $('.modal__backdrop', modal).addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') { closeModal(); return; }

      /* Keep the keyboard inside the dialog while it is open */
      if (e.key === 'Tab') {
        const focusables = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
          .filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================= 6. BEFORE / AFTER SLIDER */
  function renderTransforms() {
    const wrap = $('#baGrid');
    if (!wrap) return;

    wrap.innerHTML = TRANSFORMS.map((t, i) => `
      <article class="ba-card" data-reveal style="--reveal-delay:${i * 110}ms">
        <div class="ba-stage" style="--pos:50%"
             role="slider" tabindex="0"
             aria-label="Before and after: ${esc(t.title)}"
             aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
             aria-valuetext="50% revealed">
          <!-- Full 480/900/1400 sets, not srcsetCard: the slider runs up to
               92vw on a phone, so the 900w thumbnail cap left it short of
               pixels on any sharp screen. The before-shots also go through
               the AI upscaler, because their masters are only 1084px wide. -->
          <img class="ba-before" src="${upscaledUrl(t.before, 900)}"
               srcset="${srcsetUpscaled(t.before)}"
               sizes="${CARD_SIZES}"
               alt="${esc(t.beforeAlt)}" loading="lazy" decoding="async">
          <img class="ba-stage__after" src="${asset(t.after + `-900.jpg`)}"
               srcset="${srcset(t.after)}"
               sizes="${CARD_SIZES}"
               alt="${esc(t.afterAlt)}" loading="lazy" decoding="async">
          <span class="ba-stage__label ba-stage__label--before">Before</span>
          <span class="ba-stage__label ba-stage__label--after">After</span>
          <span class="ba-stage__handle">
            <span class="ba-stage__grip">${ICONS.grip}${ICONS.gripR}</span>
          </span>
        </div>
        <div class="ba-card__body">
          <h3>${esc(t.title)}</h3>
          <p>${esc(t.text)}</p>
        </div>
      </article>
    `).join('');

    $$('.ba-stage', wrap).forEach(bindSlider);
  }

  function bindSlider(stage) {
    let dragging = false;

    const set = (pct) => {
      const v = Math.max(0, Math.min(100, pct));
      stage.style.setProperty('--pos', v + '%');
      stage.setAttribute('aria-valuenow', Math.round(v));
      stage.setAttribute('aria-valuetext', Math.round(v) + '% revealed');
    };

    const fromEvent = (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      set((x / rect.width) * 100);
    };

    /* Pointer events cover mouse, pen and touch in one path */
    const down = (e) => {
      dragging = true;
      stage.setPointerCapture && e.pointerId != null && stage.setPointerCapture(e.pointerId);
      fromEvent(e);
    };
    const move = (e) => {
      if (!dragging) return;
      if (e.cancelable) e.preventDefault();
      fromEvent(e);
    };
    const up = () => { dragging = false; };

    if (window.PointerEvent) {
      stage.addEventListener('pointerdown', down);
      stage.addEventListener('pointermove', move);
      stage.addEventListener('pointerup', up);
      stage.addEventListener('pointercancel', up);
    } else {
      stage.addEventListener('mousedown', down);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
      stage.addEventListener('touchstart', down, { passive: true });
      stage.addEventListener('touchmove', move, { passive: false });
      stage.addEventListener('touchend', up);
    }

    /* Hovering alone nudges the reveal — feels alive without a drag */
    stage.addEventListener('mousemove', (e) => { if (!dragging && window.matchMedia('(hover:hover)').matches) fromEvent(e); });

    stage.addEventListener('keydown', (e) => {
      const cur = parseFloat(stage.style.getPropertyValue('--pos')) || 50;
      const step = e.shiftKey ? 10 : 4;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); set(cur - step); }
      if (e.key === 'ArrowRight') { e.preventDefault(); set(cur + step); }
      if (e.key === 'Home')       { e.preventDefault(); set(0); }
      if (e.key === 'End')        { e.preventDefault(); set(100); }
    });
  }


  /* =================================================== 8. RENDER: PROCESS */
  /* The process as a pinned horizontal run. The section is given a height of
     one screen plus the distance the track overflows, so the scroll that
     happens while it is stuck maps one-to-one onto the sideways slide.

     Below 720px, with reduced motion, or when the track already fits, the
     pin is dropped and the same markup reads as a plain vertical list. */
  function initJourney() {
    const section = $('#process');
    const track = $('#journeyTrack');
    const list = $('#journeyItems');
    if (!section || !track || !list || typeof PROCESS === 'undefined') return;

    list.innerHTML = PROCESS.map((s, i) => `
      <li class="journey__item journey__item--${i % 2 ? 'down' : 'up'}">
        <span class="journey__marker" aria-hidden="true">
          <span class="journey__dot"></span><span class="journey__stem"></span>
        </span>
        <div class="journey__copy">
          <span class="journey__num">${esc(s.n)}</span>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </div>
      </li>
    `).join('');

    const items = $$('.journey__item', list);
    let span = 0;          /* how far the track has to travel */
    let pinned = false;
    let ticking = false;

    /* A stage lights up once it has crossed most of the screen. */
    function reveal() {
      items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const passed = pinned
          ? r.left < window.innerWidth * .78
          : r.top < window.innerHeight * .85;
        el.classList.toggle('is-live', passed);
      });
    }

    function frame() {
      ticking = false;
      if (pinned && span > 0) {
        const p = Math.min(Math.max(-section.getBoundingClientRect().top / span, 0), 1);
        track.style.transform = `translate3d(${(-p * span).toFixed(1)}px, 0, 0)`;
      }
      reveal();
    }

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    };

    function measure() {
      /* Measured with the track back at zero, or the transform counts twice. */
      track.style.transform = '';
      pinned = window.innerWidth > 720 && !REDUCED;
      if (pinned) {
        section.classList.add('is-pinned');
        span = Math.max(0, track.scrollWidth - window.innerWidth);
        pinned = span > 0;
      }
      section.classList.toggle('is-pinned', pinned);
      section.style.height = pinned ? (window.innerHeight + span) + 'px' : '';
      frame();
    }

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    /* A photograph that lands late changes how wide the track is. */
    $$('img', track).forEach((img) => {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    });
  }

  /* ============================================== 10. RENDER: WALL GUIDE */
  /* Wall types we have not photographed on site yet are rendered through
     ImageKit's AI edit. The edit is the FIRST step of the chain and every
     srcset width is resized from that one result:

         ?tr=w-1400,e-edit-prompt-<prompt>:w-900
                    \__ generated once, cached __/  \__ plain resize __/

     Running the prompt separately per width would generate a different room
     for each entry in the srcset, and the picture would change as the
     browser switched sources. */
  function editedUrl(base, prompt, width) {
    if (!ikEndpoint) return `assets/img/${base}-${width}.jpg`;   /* local fallback */
    return `${ikEndpoint}${ikDir}/${base}.jpg` +
           `?tr=w-1400,e-edit-prompt-${encodeURIComponent(prompt)}:w-${width},${ikTr}`;
  }

  function guideSources(item) {
    if (item.edit) {
      const { base, prompt } = item.edit;
      return {
        src: editedUrl(base, prompt, 900),
        srcset: [480, 900, 1400].map((w) => `${editedUrl(base, prompt, w)} ${w}w`).join(', ')
      };
    }
    return { src: asset(item.img + '-900.jpg'), srcset: srcset(item.img) };
  }

  function renderWallGuide() {
    const grid = $('#wallGuide');
    if (!grid || typeof WALL_GUIDE === 'undefined') return;

    grid.innerHTML = WALL_GUIDE.map((g, i) => {
      const s = guideSources(g);
      return `
      <article class="guide__item" data-reveal style="--reveal-delay:${(i % 2) * 90}ms">
        <div class="guide__media">
          <img src="${s.src}" srcset="${s.srcset}"
               sizes="(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 620px"
               loading="lazy" decoding="async" alt="${esc(g.alt || g.title)}">
        </div>
        <div class="guide__body">
          <h3 class="guide__title">${esc(g.title)}</h3>
          <p class="guide__text" id="guideText${i}">${esc(g.text)}</p>
          <button class="guide__more" type="button" aria-expanded="false" aria-controls="guideText${i}">
            <span>Read more</span>
          </button>
          <a class="guide__cta" href="${waLink(
            `Hello Luxury Media Wall, I am interested in a ${g.title}. Could you advise on my room?`
          )}" target="_blank" rel="noopener">
            Ask about this wall
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </article>`;
    }).join('');

    /* Delegated so it survives a re-render, and harmless on desktop where
       the button is display:none and can never be clicked. */
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.guide__more');
      if (!btn) return;
      const item = btn.closest('.guide__item');
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('span').textContent = open ? 'Show less' : 'Read more';
    });

    /* Eight wall types ran 4,483px on a phone - a fifth of the whole page,
       and the single biggest reason the scroll felt endless. Three are shown
       and the rest are one tap away. Desktop lays them two-across and shows
       every one, where the button is display:none. */
    if (WALL_GUIDE.length <= 3) return;
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'guide__all';
    all.setAttribute('aria-controls', 'wallGuide');
    all.setAttribute('aria-expanded', 'false');
    all.textContent = `Show all ${WALL_GUIDE.length} wall types`;
    all.addEventListener('click', () => {
      const open = grid.classList.toggle('is-expanded');
      all.setAttribute('aria-expanded', String(open));
      all.textContent = open ? 'Show fewer' : `Show all ${WALL_GUIDE.length} wall types`;
    });
    grid.insertAdjacentElement('afterend', all);
  }

  /* ============================================== 11. RENDER: TESTIMONIALS */
  function renderQuotes() {
    const grid = $('#quotesGrid');
    if (!grid) return;
    grid.innerHTML = TESTIMONIALS.map((q, i) => `
      <figure class="quote" data-reveal style="--reveal-delay:${(i % 3) * 110}ms">
        <span class="quote__mark" aria-hidden="true">&ldquo;</span>
        <div class="quote__stars" aria-label="Five out of five stars">${ICONS.star.repeat(5)}</div>
        <blockquote><p>${esc(q.text)}</p></blockquote>
        <figcaption class="quote__by">
          <b>${esc(q.by)}</b><span>${esc(q.meta)}</span>
        </figcaption>
      </figure>
    `).join('');

    /* Nine reviews stacked in a single mobile column would undo the page
       length work, so phones get the first three and a button for the rest.
       Desktop lays them out three-across and shows every one, where the
       button is display:none and unreachable. */
    if (TESTIMONIALS.length <= 3) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quotes__more';
    btn.setAttribute('aria-controls', 'quotesGrid');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = `Read all ${TESTIMONIALS.length} reviews`;
    btn.addEventListener('click', () => {
      const open = grid.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show fewer reviews' : `Read all ${TESTIMONIALS.length} reviews`;
    });
    grid.insertAdjacentElement('afterend', btn);
  }

  /* =============================================== 12. WALL CONFIGURATOR */
  function initConfigurator() {
    const stage = $('#cfgStage');
    if (!stage) return;

    initLoopFilm('#cfgFilm');

    const title   = $('#cfgMatchTitle');
    const spec    = $('#cfgMatchSpec');
    const openBtn = $('#cfgMatchOpen');

    let matched = 0;

    const wanted = () => $$('[data-toggle]')
      .filter((b) => b.getAttribute('aria-pressed') === 'true')
      .map((b) => b.dataset.toggle);

    const FEATURE_LABEL = {
      led: 'LED lighting', cabinet: 'floating cabinet', tall: 'tall storage',
      fire: 'fireplace', shelves: 'open shelving'
    };

    /* Score every completed project against the selected features: each
       requested feature present adds, each one missing subtracts. Highest
       score wins. */
    const ALL_FEATURES = ['led', 'cabinet', 'tall', 'fire', 'shelves'];

    function bestMatch() {
      const want = wanted();
      const wantsFire = want.indexOf('fire') > -1;

      /* A fireplace is binary and visually dominant — showing one when the
         toggle is off reads as a bug, so it filters rather than scores. */
      let pool = DESIGN_TRAITS.filter((t) => (t.has.indexOf('fire') > -1) === wantsFire);
      if (!pool.length) pool = DESIGN_TRAITS;

      let best = pool[0], bestScore = -Infinity;
      pool.forEach((t) => {
        let s = 0;
        ALL_FEATURES.forEach((f) => {
          const asked = want.indexOf(f) > -1;
          const present = t.has.indexOf(f) > -1;
          if (asked && present) s += 1;
          else if (asked && !present) s -= 1.5;
          else if (!asked && present) s -= 0.4;   /* extras are a mild mismatch */
        });
        if (s > bestScore) { bestScore = s; best = t; }
      });
      return best;
    }

    function update() {
      const t = bestMatch();
      const p = PROJECTS[t.p];
      if (!p) return;
      matched = t.p;

      title.textContent = p.title;
      const want = wanted();
      spec.textContent = want.length
        ? p.location + ' — ' + want.map((f) => FEATURE_LABEL[f]).join(', ')
        : p.location;
      openBtn.setAttribute('aria-label', 'View the full specification for ' + p.title);
    }

    $$('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
        update();
      });
    });

    openBtn.addEventListener('click', () => openModal(matched));

    update();
  }

  /* A muted, looping film (the configurator showcase and the Why Choose Us
     panel).
     Nothing downloads until the film is ~400px away; it then
     plays muted on a loop and pauses whenever it is off screen. With reduced
     motion it stays on its opening frame with controls instead. */
  function initLoopFilm(sel) {
    const video = $(sel);
    if (!video) return;

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      if (REDUCED) {
        video.controls = true;
        video.preload = 'metadata';
        video.src = asset(video.dataset.src) + '#t=0.1';
        return;
      }
      video.src = asset(video.dataset.src);
    };

    if (!('IntersectionObserver' in window)) {
      attach();
      if (!REDUCED) video.play().catch(() => {});
      return;
    }
    new IntersectionObserver((entries) => {
      const e = entries[0];
      if (e.isIntersecting) {
        attach();
        if (!REDUCED) video.play().catch(() => {});
      } else if (attached) {
        video.pause();
      }
    }, { rootMargin: '400px 0px' }).observe(video);
  }

  /* ========================================================== 13. THE FILM */
  /* The studio film, a 16:9 H.264 file from assets/video.

     Nothing is downloaded until the frame is ~600px from the viewport: the
     source is attached then, with a #t= fragment so the browser paints the
     film's own opening shot as its poster. A visitor who never scrolls this
     far costs nothing, and the frame is never a black rectangle.

     Sound plays on the first press, because a click is a user gesture that
     browsers accept for unmuted playback. If a browser still refuses, it
     falls back to muted rather than doing nothing. */
  function initFilm() {
    const frame = $('#videoFrame');
    const video = $('#filmVideo');
    const btn = $('#videoPlay');
    if (!frame || !video || !btn) return;

    const loader = $('#videoLoader');
    const showLoader = (on) => { if (loader) loader.classList.toggle('is-on', on); };

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      video.src = asset(video.dataset.src) + '#t=0.1';
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { attach(); io.disconnect(); }
      }, { rootMargin: '600px 0px' });
      io.observe(frame);
    } else {
      attach();
    }

    btn.addEventListener('click', () => {
      attach();
      video.controls = true;
      frame.classList.add('is-playing');
      /* Only show the loader if it is still not ready after a moment -
         flashing a spinner for 100ms is worse than showing nothing. */
      if (video.readyState < 3) {
        setTimeout(() => { if (video.readyState < 3) showLoader(true); }, 250);
      }
      const p = video.play();
      if (p && p.catch) p.catch(() => { video.muted = true; video.play(); });
    });

    ['playing', 'canplay', 'error'].forEach((ev) =>
      video.addEventListener(ev, () => showLoader(false))
    );
    ['waiting', 'stalled'].forEach((ev) =>
      video.addEventListener(ev, () => {
        if (frame.classList.contains('is-playing')) showLoader(true);
      })
    );

    /* Back to the poster state, parked on the opening shot, ready to replay. */
    video.addEventListener('ended', () => {
      frame.classList.remove('is-playing');
      video.controls = false;
      video.currentTime = 0.1;
      showLoader(false);
    });
  }

  /* ==================================================== 14. ENQUIRY FORM */
  function initForm() {
    const form = $('#enquiryForm');
    if (!form) return;

    /* Populate the media-wall type dropdown from config */
    const select = $('#wallType', form);
    if (select) {
      select.innerHTML = '<option value="" disabled selected>Select a type</option>' +
        WALL_TYPES.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
    }

    const showError = (field, on) => {
      field.closest('.field').classList.toggle('has-error', on);
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const required = $$('[required]', form);
      let ok = true;
      required.forEach((f) => {
        const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        showError(f, bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;

      const v = (id) => (($(`#${id}`, form) || {}).value || '').trim();

      /* No backend required: the enquiry is handed straight to WhatsApp,
         fully formatted, so nothing is lost between the form and the studio. */
      const lines = [
        'New media wall enquiry',
        '',
        `Name: ${v('fName')}`,
        `Phone: ${v('fPhone')}`,
        `Email: ${v('fEmail')}`,
        `Location: ${v('fLocation')}`,
        `Media wall type: ${v('wallType')}`,
        `Approximate wall size: ${v('fSize')}`,
        '',
        `Message: ${v('fMessage') || '—'}`
      ];

      window.open(waLink(lines.join('\n')), '_blank', 'noopener');

      const status = $('#formStatus', form);
      status.classList.add('is-shown');
      status.textContent =
        `Thank you ${v('fName')} — WhatsApp is opening with your enquiry ready to send. ` +
        `If it did not open, message us directly on ${CONTACT.phoneDisplay}.`;
      status.focus();
      form.reset();
    });

    /* Clear the error state as soon as the field is corrected */
    form.addEventListener('input', (e) => {
      if (e.target.closest('.field.has-error')) showError(e.target, false);
    });
  }

  /* ==================================================== 15. SCROLL REVEAL */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || REDUCED) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* Split headings into words so they can rise line by line */
  function initWordReveal() {
    $$('.reveal-words').forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w, i) => `<span class="word" style="--i:${i}"><i>${esc(w)}</i></span>`)
        .join(' ');
      el.setAttribute('data-reveal', 'fade');
    });
  }

  /* ================================================ 16. FLOATING WHATSAPP */
  function initFloat() {
    const el = $('#waFloat');
    if (!el) return;
    const show = () => el.classList.toggle('is-in', window.scrollY > 520);
    show();
    window.addEventListener('scroll', show, { passive: true });
  }

  /* ============================================ 17. STATIC MEDIA -> IK */
  /* The images written directly into index.html. Only elements tagged
     data-ik are rewritten, and every one of them is lazy-loaded, so nothing
     has started downloading yet and no request is wasted.

     The hero image is deliberately NOT tagged: it is preloaded in <head> and
     rewriting it at runtime would fetch it twice. Once your ImageKit endpoint
     is live, hard-code the hero <img> and its <link rel="preload"> instead. */
  function rewriteStaticMedia() {
    if (!ikEndpoint) return;

    $$('img[data-ik]').forEach((img) => {
      const src = img.getAttribute('src');
      const set = img.getAttribute('srcset');
      if (src) img.setAttribute('src', asset(src));
      if (set) {
        img.setAttribute('srcset', set.split(',').map((part) => {
          const bits = part.trim().split(/\s+/);
          return asset(bits[0]) + (bits[1] ? ' ' + bits[1] : '');
        }).join(', '));
      }
    });

    $$('video[data-ik][poster]').forEach((v) => {
      v.setAttribute('poster', asset(v.getAttribute('poster')));
    });
  }

  /* ====================================================== 18. SIGNATURE */
  /* Injects the pre-computed outline. pathLength="1" lets the CSS animate
     the dash without ever measuring the path in JavaScript. */
  function renderSignature() {
    const host = $('#signature');
    if (!host || typeof SIGNATURE === 'undefined') return;

    host.innerHTML =
      `<svg viewBox="${SIGNATURE.viewBox}" role="img" aria-label="${esc(SIGNATURE.text)}">` +
        `<path d="${SIGNATURE.d}" pathLength="1"/>` +
      `</svg>`;

    /* Reuse the shared scroll observer rather than adding a second one */
    host.setAttribute('data-reveal', 'fade');
  }

  /* =============================================== 18b. SERVICES COVERFLOW */
  /* A continuous-position coverflow: unlike the featured carousel, this one
     is not snapped to slots. Position is a fractional card index, a drag
     moves it by a fraction of a card, and a flick carries.

     Transforms are written straight to the DOM every frame. Nothing about
     the intermediate numbers belongs in a re-render. */
  function initCoverFlow(cfg) {
    const frame   = $(cfg.frame);
    const ring    = $(cfg.ring);
    const caption = $(cfg.caption);
    const dotsBox = $(cfg.dots);
    const items   = cfg.items;
    if (!frame || !items || !items.length) return;

    const count = items.length;

    /* Geometry. Card width drives pitch, depth and perspective, so it is the
       only thing measured. */
    const ROTATE = 44;      /* degrees the first neighbour tilts */
    const DEPTH = 0.6;      /* how far it recedes, as a fraction of card width */
    const FALLOFF = 0.56;   /* below 1, the rake eases off as cards travel out */
    const FADE = 0.1;       /* opacity lost per step from the centre */
    const GAP = 0.05;       /* space between cards, as a fraction of width */

    let pos = 0;            /* fractional card index at the centre */
    let target = 0;         /* where the current settle is headed */
    let width = 0;
    let raf = null;
    let drag = null;
    let selected = 0;

    /* The caller owns what a card and a caption look like; everything below
       this point is the ring maths, which is identical for both carousels. */
    ring.innerHTML = items.map((item, i) => `
      <div class="cflow__card" role="group" aria-roledescription="slide"
           aria-label="${i + 1} of ${count}">${cfg.card(item, i)}</div>
    `).join('');

    dotsBox.innerHTML = items.map((item, i) =>
      `<button type="button" class="cflow__dot" data-go="${i}"
               aria-label="Show ${esc(cfg.dotLabel(item))}"></button>`
    ).join('');

    const cards = $$('.cflow__card', ring);
    const dots = $$('.cflow__dot', dotsBox);

    const indexAt = (p) => ((Math.round(p) % count) + count) % count;

    function paint() {
      if (!width) return;
      const pitch = width * (1 + GAP);

      cards.forEach((card, i) => {
        /* Fold the distance into the shorter way round the ring. This is the
           entire looping mechanism - no cloned nodes, no DOM shuffling. */
        let offset = i - pos;
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;

        const distance = Math.abs(offset);
        /* Tilt and recession both ease off with distance: doubling the
           distance adds only about half again as much of each. A linear ramp
           folds the second card shut; this keeps it readable. */
        const ramp = Math.pow(distance, FALLOFF);
        /* Capped short of edge-on so a far card never turns its back. */
        const tilt = Math.min(ROTATE * ramp, 82) * Math.sign(offset);

        card.style.transform =
          `translateX(calc(-50% + ${offset * pitch}px)) ` +
          `translateZ(${-DEPTH * width * ramp}px) rotateY(${-tilt}deg)`;

        /* A card is teleported across the ring at exactly half a turn out, so
           it has to have faded by then or the jump is visible. */
        const edge = Math.min(1, Math.max(0, count / 2 - distance));
        card.style.opacity = String(Math.max(0, 1 - FADE * distance) * edge);
        card.style.zIndex = String(100 - Math.round(distance));
      });
    }

    function renderCaption() {
      caption.innerHTML = cfg.caption_(items[selected], selected);
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === selected)));
    }

    function select(i) {
      if (i === selected) return;
      selected = i;
      renderCaption();
    }

    function settle(to) {
      if (raf !== null) cancelAnimationFrame(raf);
      target = to;
      select(indexAt(to));

      if (REDUCED) { pos = to; paint(); raf = null; return; }

      const step = () => {
        const remaining = target - pos;
        if (Math.abs(remaining) < 0.0004) { pos = target; paint(); raf = null; return; }
        /* Exponential ease-out rather than a spring: no overshoot wanted. */
        pos += remaining * 0.16;
        paint();
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    /* Take the shorter way round rather than unwinding the whole ring. */
    const goTo = (i) => settle(i + Math.round((target - i) / count) * count);
    const nudge = (by) => settle(Math.round(target) + by);

    /* ---- drag ---------------------------------------------------------- */
    frame.addEventListener('pointerdown', (e) => {
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      frame.setPointerCapture(e.pointerId);
      target = pos;
      drag = { id: e.pointerId, x: e.clientX, pos: pos, v: 0, t: performance.now() };
    });

    frame.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const pitch = width * (1 + GAP);
      if (!pitch) return;
      const now = performance.now();
      const previous = pos;
      pos = drag.pos - (e.clientX - drag.x) / pitch;
      /* Cards per second, for the throw. */
      drag.v = ((pos - previous) / Math.max(now - drag.t, 1)) * 1000;
      drag.t = now;
      select(indexAt(pos));
      paint();
    });

    const endDrag = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const v = drag.v;
      drag = null;
      /* Let a flick carry, but never more than two cards. */
      const carried = Math.max(-2, Math.min(2, v * 0.18));
      settle(Math.round(pos + carried));
    };
    frame.addEventListener('pointerup', endDrag);
    frame.addEventListener('pointercancel', endDrag);

    frame.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
    });

    $(cfg.prev).addEventListener('click', () => nudge(-1));
    $(cfg.next).addEventListener('click', () => nudge(1));
    dotsBox.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-go]');
      if (dot) goTo(Number(dot.dataset.go));
    });

    /* ---- measure -------------------------------------------------------- */
    const measure = () => {
      const w = cards[0] && cards[0].offsetWidth;
      if (!w) return;
      width = w;
      paint();
    };
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(frame);
    else window.addEventListener('resize', measure);

    renderCaption();
  }

  /* --- the two carousels that ride on it -------------------------------- */
  function initServicesFlow() {
    if (typeof SERVICES === 'undefined') return;
    initCoverFlow({
      frame: '#servicesFrame', ring: '#servicesRing',
      caption: '#servicesCaption', dots: '#servicesDots',
      prev: '#servicesPrev', next: '#servicesNext',
      items: SERVICES,
      dotLabel: (s) => s.title,
      card: (s) => `
        <img src="${asset(s.img + '-900.jpg')}" srcset="${srcset(s.img)}"
             sizes="(max-width: 720px) 68vw, 360px"
             style="object-position:${s.focus || '50% 50%'}"
             draggable="false" loading="lazy" decoding="async" alt="${esc(s.alt || s.title)}">`,
      caption_: (s) => `
        <span class="cflow__label">${esc(s.label || '')}</span>
        <span class="cflow__title">${esc(s.title)}</span>
        <p class="cflow__text">${esc(s.text)}</p>
        <a class="cflow__cta" href="${waLink(
          `Hello Luxury Media Wall, I would like to enquire about ${s.title}.`
        )}" target="_blank" rel="noopener">${esc(s.cta || 'Enquire')}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>`
    });
  }


  /* ======================================================== 20. SHOWCASE */
  /* Deals every photograph into the drifting corridor behind the studio
     statement. Each card runs the same animation; spacing them evenly by
     animation-delay across one cycle is what turns twelve independent
     loops into a single continuous stream.

     A NEGATIVE delay is the important part: it starts each card partway
     through its path rather than making the reader wait for the queue to
     fill, so the corridor is already populated on the first frame. */
  function renderShowcase() {
    const inner = $('#showcaseInner');
    if (!inner || typeof SHOWCASE === 'undefined' || !SHOWCASE.length) return;

    /* Reduced motion: the CSS hides the stage, so building twelve image
       elements that will never be seen is wasted bandwidth. */
    if (REDUCED) return;

    const dur = (typeof SHOWCASE_SECONDS === 'number' ? SHOWCASE_SECONDS : 22);
    const step = dur / SHOWCASE.length;
    inner.style.setProperty('--showcase-dur', dur + 's');

    inner.innerHTML = SHOWCASE.map((s, i) => `
      <div class="showcase__card"
           style="animation-name:${i % 2 ? 'showcaseL' : 'showcaseR'};
                  animation-delay:-${(i * step).toFixed(2)}s">
        <img src="${asset(s.img + '-480.jpg')}"
             srcset="${srcsetCard(s.img)}" sizes="20vw"
             loading="lazy" decoding="async" alt="${esc(s.alt || '')}">
      </div>
    `).join('');
  }
  /* ================================================ 18b. MATERIALS MORPH */
  /* The materials gallery. Each sample dissolves into the next through an
     fbm noise field in one WebGL pass: every pixel gets a threshold from the
     noise, progress sweeps past those thresholds, and the threshold is
     biased by the brightness of the INCOMING photograph - so its lit areas
     burn through first instead of the whole frame fading uniformly.

     Ported from a React component to plain JS; the shader is unchanged,
     React only ever held the index. If WebGL is missing, or the textures
     cannot be uploaded, the same photographs cross-fade instead - a gallery
     without the effect beats a black rectangle. */
  const MORPH_VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

  const MORPH_FRAG = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

/* The drift below pushes UVs past the edge of the photograph, and
   CLAMP_TO_EDGE answers that by smearing the last row of pixels into long
   streaks. Reflecting keeps real picture there. Done in the shader because
   MIRRORED_REPEAT is illegal on the non-power-of-two sizes photos come in. */
vec2 mirror(vec2 uv) { return 1.0 - abs(1.0 - mod(uv, 2.0)); }

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  /* Widen the sweep by one edge at each end, so progress 0 and 1 are fully
     one photograph or the other rather than already half dissolved. */
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;
  noise = smoothstep(0.0, 2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise);

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  /* Both frames slide, by different amounts and in opposite directions, so
     the tatters have parallax against each other. */
  vec2 fromUV = coverUV(v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction), u_fromAspect);
  vec2 toUV = coverUV(v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction), u_toAspect);

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}`;

  /* Quintic in-out: the dissolve starts and ends still, and hurries the middle. */
  const easeInOutQuint = (t) => {
    const x = Math.min(Math.max(t, 0), 1);
    return x < .5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2;
  };

  function initMaterialsMorph() {
    const root = $('#materialsMorph');
    const canvas = $('#materialsCanvas');
    const plain = $('#materialsPlain');
    const thumbs = $('#materialsThumbs');
    const caption = $('#materialsCaption');
    if (!root || !canvas || typeof MATERIALS === 'undefined' || !MATERIALS.length) return;

    const items = MATERIALS;
    const total = items.length;
    let active = 0;
    let autoTimer = null;
    let paused = false;

    /* ---- strip, caption, fallback frames ---- */
    thumbs.innerHTML = items.map((m, i) => `
      <li>
        <button type="button" class="morph__thumb" data-go="${i}"
                aria-current="${i === 0}" aria-label="Show ${esc(m.name)}">
          <img src="${asset(m.img + '-480.jpg')}" alt="" loading="lazy" decoding="async" draggable="false">
        </button>
      </li>
    `).join('');

    plain.innerHTML = items.map((m, i) => `
      <img src="${asset(m.img + '-1400.jpg')}" alt="${esc(m.name)} sample"
           class="${i === 0 ? 'is-on' : ''}" loading="${i ? 'lazy' : 'eager'}" decoding="async" draggable="false">
    `).join('');
    const plainFrames = $$('img', plain);
    const thumbBtns = $$('.morph__thumb', thumbs);

    function paint(i) {
      const m = items[i];
      if (caption) {
        caption.innerHTML = `
          <span class="cflow__label">${esc(m.use)}</span>
          <span class="cflow__title">${esc(m.name)}</span>
          <p class="cflow__text">${esc(m.desc)}</p>
          <a class="cflow__cta" href="${waLink(
            `Hello Luxury Media Wall, I am interested in a media wall in ${m.name}.`
          )}" target="_blank" rel="noopener">Enquire about ${esc(m.name)}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>`;
      }
      thumbBtns.forEach((b, n) => b.setAttribute('aria-current', String(n === i)));
      plainFrames.forEach((img, n) => img.classList.toggle('is-on', n === i));
      const t = thumbBtns[i];
      if (t && thumbs.scrollWidth > thumbs.clientWidth) {
        thumbs.scrollTo({ left: t.offsetLeft - (thumbs.clientWidth - t.offsetWidth) / 2, behavior: REDUCED ? 'auto' : 'smooth' });
      }
    }

    /* A transition is requested here and consumed by the render loop. */
    let request = null;
    function go(next) {
      const wrapped = ((next % total) + total) % total;
      if (wrapped === active) return;
      request = { from: active, to: wrapped };
      active = wrapped;
      paint(active);
    }

    /* ---- controls ---- */
    const prev = $('#materialsPrev');
    const next = $('#materialsNext');
    if (prev) prev.addEventListener('click', () => { go(active - 1); restart(); });
    if (next) next.addEventListener('click', () => { go(active + 1); restart(); });
    thumbs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-go]');
      if (b) { go(Number(b.dataset.go)); restart(); }
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); restart(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); restart(); }
    });

    let swipeFrom = null;
    root.addEventListener('pointerdown', (e) => { swipeFrom = e.clientX; });
    root.addEventListener('pointerup', (e) => {
      const from = swipeFrom;
      swipeFrom = null;
      if (from === null) return;
      const dx = e.clientX - from;
      if (Math.abs(dx) > 48) { go(active + (dx < 0 ? 1 : -1)); restart(); }
    });

    /* ---- autoplay: never while hidden, hovered, focused or off screen ---- */
    function restart() {
      clearInterval(autoTimer);
      autoTimer = null;
      if (REDUCED || paused || document.hidden) return;
      autoTimer = setInterval(() => go(active + 1), 5200);
    }
    const hold = (on) => { paused = on; restart(); };
    root.addEventListener('mouseenter', () => hold(true));
    root.addEventListener('mouseleave', () => hold(false));
    root.addEventListener('focusin', () => hold(true));
    root.addEventListener('focusout', () => hold(false));
    document.addEventListener('visibilitychange', restart);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => hold(!entries[0].isIntersecting), { threshold: .15 }).observe(root);
    } else {
      restart();
    }

    paint(0);

    /* ---- WebGL ---- */
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
    const fallBack = () => { root.classList.add('is-plain'); };
    if (!gl) { fallBack(); return; }

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        throw new Error('shader compile failed');
      }
      return sh;
    };

    let program;
    try {
      const vert = compile(gl.VERTEX_SHADER, MORPH_VERT);
      const frag = compile(gl.FRAGMENT_SHADER, MORPH_FRAG);
      program = gl.createProgram();
      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);
      /* The shaders belong to the program once attached; drop our handles so
         they are freed with it. */
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('program link failed');
    } catch (err) { fallBack(); return; }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {};
    ['from', 'to', 'progress', 'resolution', 'fromAspect', 'toAspect', 'scale', 'direction', 'edge', 'drift']
      .forEach((n) => { uniforms[n] = gl.getUniformLocation(program, 'u_' + n); });

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const textures = items.map(() => null);
    const aspects = items.map(() => 1);
    let running = false;
    let refused = 0;
    let raf = 0;
    let from = 0, to = 0, progress = 1, startedAt = 0, direction = 1;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (!w || !h || (canvas.width === w && canvas.height === h)) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    /* Until every photograph is in, `from` or `to` can point at a hole.
       Showing the nearest texture that does exist beats binding null. */
    const pick = (i) => textures[i] || textures.find((t) => t) || null;

    function draw() {
      if (request) {
        const r = request;
        request = null;
        from = r.from;
        to = r.to;
        progress = 0;
        startedAt = performance.now();
        /* Direction follows the shortest way round, so the wrap from the last
           sample to the first drifts forward like every other step. */
        direction = (((r.to - r.from + total) % total) * 2 <= total) ? 1 : -1;
      }

      if (progress < 1) {
        const span = REDUCED ? 0 : 1500;
        progress = span === 0 ? 1 : easeInOutQuint((performance.now() - startedAt) / span);
      }

      const fromTex = pick(from);
      const toTex = pick(to);
      if (!fromTex || !toTex) return;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fromTex);
      gl.uniform1i(uniforms.from, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, toTex);
      gl.uniform1i(uniforms.to, 1);

      gl.uniform1f(uniforms.progress, progress);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.fromAspect, aspects[from] || 1);
      gl.uniform1f(uniforms.toAspect, aspects[to] || 1);
      gl.uniform1f(uniforms.scale, 3.5);
      gl.uniform1f(uniforms.direction, direction);
      gl.uniform1f(uniforms.edge, .15);
      gl.uniform1f(uniforms.drift, .5);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function frame() {
      draw();
      raf = requestAnimationFrame(frame);
    }

    /* Each photograph is uploaded the moment it arrives and the loop starts
       on the first one, rather than waiting for the slowest. */
    items.forEach((m, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        /* Photographs are not powers of two, so mipmaps and repeat are both
           off the table in WebGL1: clamp and linear are the only legal pair. */
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        textures[i] = tex;
        aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1);
        if (!running) {
          running = true;
          resize();
          root.classList.add('is-live');
          raf = requestAnimationFrame(frame);
        }
      };
      /* One broken photograph costs one sample, not the effect; only when
         none of them load is there nothing to shade. */
      img.onerror = () => { refused += 1; if (refused === total) fallBack(); };
      img.src = asset(m.img + '-1400.jpg');
    });

    window.addEventListener('resize', resize);
    /* A restored context has nothing in it, so the only honest answer is to
       stop shading and show the photographs plainly. */
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(raf); fallBack(); });
  }

  /* ======================================================= 19. COVERFLOW */
  /* Featured-work carousel. The centre card opens the same project modal
     the grid uses, so a project's detail lives in exactly one place.

     Slot assignment is the whole trick: rather than moving cards, each one
     is told which of five slots it currently occupies and CSS animates the
     difference. Wrapping the offset means the strip is a true loop with no
     jump at the seam. */
  function initCoverflow() {
    const stage = $('#coverflowStage');
    const dotsBox = $('#coverflowDots');
    if (!stage || typeof PROJECTS === 'undefined' || !PROJECTS.length) return;

    const total = PROJECTS.length;
    let index = 0;
    let timer = null;

    stage.innerHTML = PROJECTS.map((p, i) => `
      <button type="button" class="coverflow__card" data-slide="${i}" data-pos="off"
              aria-label="Project ${p.n}: ${esc(p.title)}">
        <!-- The full 480/900/1400 set, not srcsetCard: this is a large
             feature card, not a thumbnail, and the centre one is also
             scaled up by the 3D transform. Capping at 900w left a retina
             phone rendering a 440px card from a 900px file. -->
        <img src="${asset(p.img + '-900.jpg')}" srcset="${srcset(p.img)}"
             sizes="(max-width: 640px) 90vw, 560px"
             loading="lazy" decoding="async" alt="${esc(p.alt)}">
        <span class="coverflow__veil"></span>
        <span class="coverflow__num">${p.n} <i>/</i> ${String(total).padStart(2, '0')}</span>
        <span class="coverflow__body">
          <span class="coverflow__title">${esc(p.title)}</span>
          <span class="coverflow__rule"></span>
          <span class="coverflow__desc">${esc(p.short)}</span>
          <span class="coverflow__cta">View Project
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7-7 7m7-7H3"/></svg>
          </span>
        </span>
      </button>
    `).join('');

    dotsBox.innerHTML = PROJECTS.map((p, i) =>
      `<button type="button" class="coverflow__dot" data-go="${i}"
               aria-label="Show project ${p.n}"></button>`
    ).join('');

    const cards = $$('.coverflow__card', stage);
    const dots = $$('.coverflow__dot', dotsBox);

    function paint() {
      cards.forEach((card, i) => {
        /* Distance from the centre, wrapped so index 0 sits next to the
           last card rather than the whole strip sliding back. */
        let d = (i - index + total) % total;
        if (d > total / 2) d -= total;

        const pos = d === 0 ? 'c'
                  : d === 1 ? 'r1' : d === 2 ? 'r2'
                  : d === -1 ? 'l1' : d === -2 ? 'l2'
                  : 'off';
        card.dataset.pos = pos;
        /* Only the front card is a tab stop; the others are reachable by
           the arrows and dots, which are labelled. */
        card.tabIndex = pos === 'c' ? 0 : -1;
        card.setAttribute('aria-hidden', pos === 'off' ? 'true' : 'false');
      });
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
    }

    const go = (i) => { index = (i + total) % total; paint(); };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    /* Autoplay restarts on every interaction, so a deliberate move is never
       cut short by a tick that was already queued. */
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const play = () => {
      stop();
      if (REDUCED) return;
      timer = setInterval(() => { if (!document.hidden) next(); }, 5000);
    };
    const nudge = (fn) => { fn(); play(); };

    stage.addEventListener('click', (e) => {
      const card = e.target.closest('.coverflow__card');
      if (!card) return;
      const i = Number(card.dataset.slide);
      /* A side card steps into the middle; the middle one opens up. */
      if (i === index) openModal(i);
      else nudge(() => go(i));
    });

    dotsBox.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-go]');
      if (dot) nudge(() => go(Number(dot.dataset.go)));
    });

    $('#coverflowNext').addEventListener('click', () => nudge(next));
    $('#coverflowPrev').addEventListener('click', () => nudge(prev));

    /* Hover pause is a pointer affordance only - a finger that brushed the
       strip while scrolling would otherwise stop it for good. */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      stage.addEventListener('mouseenter', stop);
      stage.addEventListener('mouseleave', play);
    }

    /* Arrow keys, but only while the carousel is actually on screen, so
       they do not hijack the rest of the page. */
    let inView = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        inView = entries[0].isIntersecting;
      }, { threshold: 0.35 }).observe(stage);
    }
    document.addEventListener('keydown', (e) => {
      if (!inView || modalOpen) return;
      if (e.key === 'ArrowLeft') nudge(prev);
      if (e.key === 'ArrowRight') nudge(next);
    });

    /* Swipe. The vertical guard keeps a diagonal scroll from being read as
       a horizontal flick. */
    let sx = 0, sy = 0;
    stage.addEventListener('touchstart', (e) => {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) nudge(() => (dx < 0 ? next() : prev()));
    }, { passive: true });

    paint();
    play();
  }

  /* ========================================================= 19. MARQUEE */
  function initMarquee() {
    const track = $('#marqueeTrack');
    if (!track) return;
    /* Duplicate the group so the -50% loop is seamless */
    track.appendChild(track.firstElementChild.cloneNode(true));
  }

  /* ============================================================ 18. BOOT */
  function boot() {
    rewriteStaticMedia();
    renderContactBits();
    renderTransforms();
    initServicesFlow();
    initJourney();
    renderShowcase();
    initMaterialsMorph();
    renderWallGuide();
    renderQuotes();
    renderSignature();

    initHeader();
    initHeroVideo();
    initHeroScroll();
    initModal();
    initShare();
    initConfigurator();
    initLoopFilm('#whyVideo');
    initFilm();
    initForm();
    initCoverflow();
    initMarquee();
    initFloat();

    initWordReveal();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
