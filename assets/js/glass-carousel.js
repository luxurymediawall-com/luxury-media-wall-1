/* ==========================================================================
   LUXURY MEDIA WALL — Glass carousel
   An endless row of project photographs drawn on one WebGL canvas and seen
   through a liquid-glass lens: the row is rendered into a texture, then a
   full-screen shader bends, disperses and rings the middle of the frame.

   Ported from a React + three.js + GSAP component. The lens shader is the
   original, unchanged. three.js only ever drew textured quads here and GSAP
   only tweened numbers, so neither library is carried: the page keeps its
   zero runtime dependencies.

   Without WebGL the markup falls back to a plain scrolling strip, which the
   CSS shows whenever the canvas is not running.
   ========================================================================== */
(function () {
  'use strict';

  const root = document.querySelector('#glass');
  const canvas = document.querySelector('#glassCanvas');
  const strip = document.querySelector('#glassStrip');
  const titleEl = document.querySelector('#glassTitle');
  const countEl = document.querySelector('#glassCount');
  const hintEl = document.querySelector('#glassHint');
  if (!root || !canvas || typeof PROJECTS === 'undefined' || !PROJECTS.length) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = PROJECTS.map((p) => ({ src: p.img + '-900.jpg', title: p.title, alt: p.alt }));
  const N = items.length;

  /* The fallback strip is real markup, not a placeholder: if the canvas
     never starts, this is the gallery. */
  strip.innerHTML = items.map((it, i) => `
    <li><img src="${it.src}" alt="${(it.alt || it.title).replace(/"/g, '&quot;')}"
             loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" draggable="false"></li>
  `).join('');

  const pad = (n) => String(n).padStart(2, '0');
  const setLabel = (i) => {
    if (titleEl) titleEl.textContent = items[i].title;
    if (countEl) countEl.textContent = pad(i + 1) + ' / ' + pad(N);
  };
  setLabel(0);

  const gl = canvas.getContext('webgl', { alpha: false, antialias: true });
  if (!gl) return;                       /* CSS keeps the strip visible */

  /* ------------------------------------------------------------ shaders */
  const PANEL_VERT = `
attribute vec2 a_pos;
uniform vec4 u_rect;           /* centre.xy, half size.xy, all in clip space */
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(u_rect.xy + a_pos * u_rect.zw, 0.0, 1.0);
}`;

  const PANEL_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
varying vec2 v_uv;
void main() { gl_FragColor = texture2D(u_tex, vec2(v_uv.x, 1.0 - v_uv.y)); }`;

  const LENS_VERT = `
attribute vec2 a_pos;
varying vec2 vUv;
void main() { vUv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

  /* The original lens, unchanged apart from dropping the unused square
     shape branch: one disc of glass over the middle of the frame, with
     chromatic dispersion at its rim, a nova glow, a shimmering blue ring
     and a fine rim line. */
  const LENS_FRAG = `
#define PI 3.14159265
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uCenter;
uniform float uSizeX, uSizeY, uAspect, uZoom, uDispersion, uGlow, uWhiteGlow;
uniform float uNovaSize, uBlueRing, uRingRadius, uRingWidth;
uniform float uShimmer, uShimmerFreq, uShimmerSpeed, uShimmerDepth, uTime;
uniform float uRimStart, uRimTangential, uRimFreq1, uRimFreq2;
uniform vec3 uBlueColor;
uniform float uRimLine, uRimLinePos, uRimLineWidth, uRotation;

const int MAX_SAMPLES = 16;

vec3 discLens(vec2 center, float aspectCorrect, out float outA) {
  vec2 p = (vUv - center);
  p.x *= aspectCorrect;
  float ca = cos(uRotation), sa = sin(uRotation);
  p = mat2(ca, -sa, sa, ca) * p;
  vec2 halfSize = vec2(uSizeX, uSizeY);
  float dist = length(p / halfSize);
  outA = 0.0;
  if (dist > 1.0) return vec3(0.0);

  float nd = clamp(dist, 0.0, 1.0);
  vec2 offset = vUv - center;
  vec2 radialDir = normalize(offset + 1e-6);
  vec2 tangentDir = vec2(-radialDir.y, radialDir.x);
  float angle = atan(p.y, p.x);

  float pull = uZoom * 0.30 * (nd * nd);
  float rimStrength = smoothstep(uRimStart, 1.0, nd);
  float fluidWave = sin(angle * uRimFreq1) * 0.55 + sin(angle * uRimFreq2) * 0.25;
  float rScreen = (uSizeX + uSizeY) * 0.5;
  vec2 rimOff = tangentDir * fluidWave * rimStrength * rScreen * uRimTangential;
  vec2 baseUV = center + offset * (1.0 - pull) + rimOff;

  float rimMask = smoothstep(0.55, 1.0, nd);
  vec2 dispDir = offset * uDispersion * 0.004 * rimMask;
  vec3 col = vec3(0.0);
  vec3 caW = vec3(0.0);
  for (int i = 0; i < MAX_SAMPLES; i++) {
    float t = float(i) / float(MAX_SAMPLES - 1);
    vec3 s = texture2D(uTex, baseUV + dispDir * (t - 0.5)).rgb;
    vec3 w = vec3(
      exp(-pow((t - 0.00) / 0.38, 2.0)),
      exp(-pow((t - 0.50) / 0.38, 2.0)),
      exp(-pow((t - 1.00) / 0.38, 2.0))
    );
    col += s * w;
    caW += w;
  }
  col /= max(caW, vec3(0.001));
  col *= mix(0.91, 1.0, smoothstep(0.0, 0.38, nd));

  float r2 = nd * nd * 0.25;
  float gs = max(uNovaSize * uGlow * 0.003, 0.004);
  float nova = exp(-r2 / gs) + exp(-r2 / (gs * 7.0)) * 0.18;
  nova *= uWhiteGlow * (uGlow / 17.0) * 1.15;
  col += vec3(nova);

  float dC = nd * 0.5;
  float tR = clamp(uRingRadius, 0.1, 0.49);
  float rW = max(uRingWidth, 0.003);
  float ring = exp(-pow((dC - tR) / rW, 2.0));
  ring *= uBlueRing * (uGlow / 17.0) * 1.8;
  if (uShimmer > 0.5) ring *= sin(angle * uShimmerFreq + uTime * uShimmerSpeed) * uShimmerDepth + (1.0 - uShimmerDepth);
  float ringAura = exp(-pow((dC - tR) / (rW * 6.0), 2.0)) * 0.28 * uBlueRing * (uGlow / 17.0);
  col += uBlueColor * (ring + ringAura);
  col += vec3(exp(-pow((dC - uRimLinePos) / max(uRimLineWidth, 0.0001), 2.0)) * uRimLine);

  outA = smoothstep(1.0, 0.93, dist);
  return col;
}

void main() {
  vec3 outc = texture2D(uTex, vUv).rgb;
  float a = 0.0;
  vec3 c = discLens(uCenter, uAspect, a);
  gl_FragColor = vec4(mix(outc, c, a), 1.0);
}`;

  function build(vs, fs) {
    const make = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
      return sh;
    };
    const p = gl.createProgram();
    const v = make(gl.VERTEX_SHADER, vs);
    const f = make(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  let panelProg, lensProg;
  try {
    panelProg = build(PANEL_VERT, PANEL_FRAG);
    lensProg = build(LENS_VERT, LENS_FRAG);
  } catch (e) { return; }          /* CSS keeps the strip visible */

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const bindQuad = (prog) => {
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  };

  const uPanel = {
    rect: gl.getUniformLocation(panelProg, 'u_rect'),
    tex: gl.getUniformLocation(panelProg, 'u_tex')
  };
  const U = {};
  ['uTex', 'uRes', 'uCenter', 'uSizeX', 'uSizeY', 'uAspect', 'uZoom', 'uDispersion',
   'uGlow', 'uWhiteGlow', 'uNovaSize', 'uBlueRing', 'uRingRadius', 'uRingWidth',
   'uShimmer', 'uShimmerFreq', 'uShimmerSpeed', 'uShimmerDepth', 'uTime', 'uRimStart',
   'uRimTangential', 'uRimFreq1', 'uRimFreq2', 'uBlueColor', 'uRimLine', 'uRimLinePos',
   'uRimLineWidth', 'uRotation'].forEach((n) => { U[n] = gl.getUniformLocation(lensProg, n); });

  /* The original lens settings. */
  const LENS = {
    sizeX: .565, sizeY: 1, posX: .5, posY: .5, rotation: 65, zoom: 0,
    dispersion: 11, glow: 4.2, whiteGlow: .24, novaSize: 12, blueRing: 6,
    ringRadius: .49, ringWidth: .014, shimmerFreq: 12, shimmerSpeed: 3.5,
    shimmerDepth: .12, rimStart: .578, rimTangential: .6, rimFreq1: 2, rimFreq2: 1,
    blue: [0, 157 / 255, 1], rimLine: 1.4, rimLinePos: .488, rimLineWidth: .003
  };

  /* ---------------------------------------------------------- the photos */
  const sources = items.map(() => ({ tex: null, aspect: 3 / 4 }));
  let loaded = 0;
  /* Nineteen photographs is megabytes of texture. They are fetched only
     once the gallery is near the screen; until then the strip below the
     canvas is what a visitor sees, and it lazy-loads its own images. */
  function loadTextures() {
    items.forEach((it, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        sources[i].tex = tex;
        sources[i].aspect = img.naturalWidth / Math.max(img.naturalHeight, 1);
        measure();
        if (++loaded === 1) { root.classList.add('is-live'); scroll = target = centerFor(0); }
      };
      img.src = it.src;
  });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { io.disconnect(); loadTextures(); }
    }, { rootMargin: '700px 0px' });
    io.observe(root);
  } else {
    loadTextures();
  }

  /* ------------------------------------------------------------- layout */
  const GAP = 12;
  const REPEATS = 4;
  let W = 1, H = 1, dpr = 1, panelH = 420;
  let offsets = [], totalW = 0;

  function measure() {
    offsets = [];
    let acc = 0;
    for (let i = 0; i < N; i++) { offsets.push(acc); acc += sources[i].aspect * panelH + GAP; }
    totalW = acc;
  }

  const slotCentre = (i) => offsets[i] + (sources[i].aspect * panelH + GAP) / 2 - GAP / 2;

  function centerFor(idx) {
    const loop = Math.floor(idx / N);
    const s = ((idx % N) + N) % N;
    return slotCentre(s) + loop * totalW;
  }

  function nearest(value) {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < N; i++) {
      const c = slotCentre(i);
      const k = Math.round((value - c) / totalW);
      const d = Math.abs(c + k * totalW - value);
      if (d < bestDist) { bestDist = d; best = i + k * N; }
    }
    return best;
  }
  const centreIndex = (value) => ((nearest(value) % N) + N) % N;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, canvas.clientWidth);
    H = Math.max(1, canvas.clientHeight);
    const w = Math.round(W * dpr), h = Math.round(H * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    panelH = Math.max(120, Math.min(420, Math.round(H * .62)));
    measure();
    makeTarget(w, h);
  }

  /* The row is drawn here first, then read back as the lens's texture. */
  let fbo = null, fboTex = null, fboW = 0, fboH = 0;
  function makeTarget(w, h) {
    if (fboW === w && fboH === h) return;
    if (fboTex) gl.deleteTexture(fboTex);
    if (fbo) gl.deleteFramebuffer(fbo);
    fboW = w; fboH = h;
    fboTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fboTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /* --------------------------------------------------------- the motion */
  let scroll = 0, target = 0, velocity = 0, prev = 0, energy = 0;
  let lastInput = 0, snapped = true, touched = false;
  let focusOn = false, focusIdx = -1, focusScale = 1, lensFx = 1;
  const drop = new Array(N * REPEATS).fill(0);
  const tweens = [];

  const easeOut3 = (t) => 1 - Math.pow(1 - t, 3);
  const easeOut4 = (t) => 1 - Math.pow(1 - t, 4);

  function tween(set, from, to, dur, delay, ease, done) {
    tweens.push({ set, from, to, dur: REDUCED ? 1 : dur, delay: REDUCED ? 0 : delay, ease, start: performance.now(), done });
  }
  function runTweens(now) {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const t = tweens[i];
      const at = (now - t.start - t.delay) / t.dur;
      if (at < 0) continue;
      const k = at >= 1 ? 1 : t.ease(at);
      t.set(t.from + (t.to - t.from) * k);
      if (at >= 1) { tweens.splice(i, 1); if (t.done) t.done(); }
    }
  }

  let rects = [];               /* what is on screen, for hit testing */
  let centred = null;

  function layout() {
    rects = [];
    centred = null;
    let bestDist = Infinity;
    const half = W / 2;
    const shrink = 1 - .25 * energy;

    for (let rep = 0; rep < REPEATS; rep++) {
      for (let i = 0; i < N; i++) {
        const poolIdx = rep * N + i;
        let x = slotCentre(i) - scroll;
        x = ((x % totalW) + totalW) % totalW;
        x += (rep - Math.floor(REPEATS / 2)) * totalW;
        if (x > half + totalW) x -= totalW * REPEATS;

        const h = panelH * shrink;
        const w = sources[i].aspect * panelH * shrink;
        if (x < -half - w || x > half + w) continue;

        const focused = focusOn && focusIdx === poolIdx;
        const d = drop[poolIdx] || 0;
        const dw = focused ? w * focusScale : w;
        const dh = focused ? h * focusScale : h;
        const y = focused ? 0 : -d * H * 1.4;

        rects.push({ poolIdx, srcIndex: i, x, y, w: dw, h: dh });
        if (Math.abs(x) < bestDist) { bestDist = Math.abs(x); centred = { poolIdx, srcIndex: i }; }
      }
    }
  }

  function drawRow() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, fboW, fboH);
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(panelProg);
    bindQuad(panelProg);
    gl.uniform1i(uPanel.tex, 0);
    gl.activeTexture(gl.TEXTURE0);
    for (const r of rects) {
      const tex = sources[r.srcIndex].tex;
      if (!tex) continue;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform4f(uPanel.rect, (2 * r.x) / W, (2 * r.y) / H, r.w / W, r.h / H);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  function drawLens(now) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(lensProg);
    bindQuad(lensProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fboTex);
    gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform2f(U.uCenter, LENS.posX, LENS.posY);
    gl.uniform1f(U.uSizeX, LENS.sizeX);
    gl.uniform1f(U.uSizeY, LENS.sizeY);
    gl.uniform1f(U.uAspect, W / H);
    gl.uniform1f(U.uGlow, LENS.glow);
    gl.uniform1f(U.uWhiteGlow, LENS.whiteGlow);
    gl.uniform1f(U.uNovaSize, LENS.novaSize);
    gl.uniform1f(U.uRingRadius, LENS.ringRadius);
    gl.uniform1f(U.uRingWidth, LENS.ringWidth);
    gl.uniform1f(U.uShimmer, REDUCED ? 0 : 1);
    gl.uniform1f(U.uShimmerFreq, LENS.shimmerFreq);
    gl.uniform1f(U.uShimmerSpeed, LENS.shimmerSpeed);
    gl.uniform1f(U.uShimmerDepth, LENS.shimmerDepth);
    gl.uniform1f(U.uTime, now * .001);
    gl.uniform1f(U.uRimStart, LENS.rimStart);
    gl.uniform1f(U.uRimFreq1, LENS.rimFreq1);
    gl.uniform1f(U.uRimFreq2, LENS.rimFreq2);
    gl.uniform3f(U.uBlueColor, LENS.blue[0], LENS.blue[1], LENS.blue[2]);
    gl.uniform1f(U.uRimLinePos, LENS.rimLinePos);
    gl.uniform1f(U.uRimLineWidth, LENS.rimLineWidth);
    gl.uniform1f(U.uRotation, LENS.rotation * Math.PI / 180);
    /* These are the ones that fade away while a photograph is held open. */
    gl.uniform1f(U.uDispersion, LENS.dispersion * lensFx);
    gl.uniform1f(U.uBlueRing, LENS.blueRing * lensFx);
    gl.uniform1f(U.uRimLine, LENS.rimLine * lensFx);
    gl.uniform1f(U.uZoom, LENS.zoom * lensFx);
    gl.uniform1f(U.uRimTangential, LENS.rimTangential * lensFx);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  /* ------------------------------------------------------------- input */
  const hit = (px, py) => {
    const x = px - W / 2, y = H / 2 - py;
    for (const r of rects) {
      if (x >= r.x - r.w / 2 && x <= r.x + r.w / 2 && y >= r.y - r.h / 2 && y <= r.y + r.h / 2) return r;
    }
    return null;
  };
  const local = (e) => {
    const b = canvas.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };

  let dragging = false, dragId = null, dragLast = 0, dragDist = 0, dragVel = 0, dragAt = 0, dragType = 'mouse';
  let suppressClick = false;

  canvas.addEventListener('pointerdown', (e) => {
    if (focusOn) return;
    dragging = true; dragId = e.pointerId; dragType = e.pointerType || 'mouse';
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* best effort */ }
    dragLast = local(e).x; dragDist = 0; dragVel = 0; dragAt = performance.now();
    velocity = 0; touched = true; snapped = false; lastInput = dragAt;
    root.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (dragging && e.pointerId === dragId) {
      const dx = p.x - dragLast;
      dragLast = p.x;
      dragDist += Math.abs(dx);
      target -= dx * (dragType === 'mouse' ? 1.6 : 1);
      dragVel = dragVel * .6 + -dx * .4;
      dragAt = performance.now();
      lastInput = dragAt;
      snapped = false;
    }
    if (e.pointerType === 'mouse' && hintEl) {
      hintEl.style.transform = `translate(${p.x}px, ${p.y}px)`;
      root.classList.toggle('is-over', !focusOn && !!hit(p.x, p.y));
    }
  });

  const endDrag = (e) => {
    if (!dragging || (e && dragId !== null && e.pointerId !== dragId)) return;
    dragging = false;
    try { canvas.releasePointerCapture(dragId); } catch (err) { /* already gone */ }
    dragId = null;
    velocity = performance.now() - dragAt > 90 ? 0 : dragVel;
    suppressClick = dragDist > (dragType === 'mouse' ? 6 : 12);
    lastInput = performance.now();
    snapped = false;
    root.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', () => root.classList.remove('is-over'));

  /* Sideways wheels and trackpad swipes move the row; a plain vertical
     wheel is left alone so the page still scrolls through the section. */
  canvas.addEventListener('wheel', (e) => {
    if (focusOn || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    target += e.deltaX * 1.4;
    touched = true; snapped = false; lastInput = performance.now();
  }, { passive: false });

  canvas.addEventListener('click', (e) => {
    if (suppressClick) { suppressClick = false; return; }
    if (focusOn) { closeFocus(); return; }
    const p = local(e);
    const r = hit(p.x, p.y);
    if (!r) return;
    if (centred && r.poolIdx === centred.poolIdx) { openFocus(); return; }
    touched = true; velocity = 0;
    target = centerFor(nearest(scroll + r.x));
    snapped = true;
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape') closeFocus();
  });

  function step(dir) {
    if (focusOn) return;
    touched = true; velocity = 0;
    target = centerFor(nearest(scroll) + dir);
    snapped = true; lastInput = performance.now();
  }

  /* Holding one open: it grows, the rest fall away in rings from it, and
     the glass clears so the photograph is seen plainly. */
  function openFocus() {
    if (focusOn || !centred) return;
    focusOn = true;
    focusIdx = centred.poolIdx;
    target = centerFor(nearest(scroll));
    root.classList.add('is-focused');
    tween((v) => { lensFx = v; }, lensFx, 0, 850, 0, easeOut3);
    tween((v) => { focusScale = v; }, focusScale, 1.18, 900, 0, easeOut3);
    const here = rects.find((r) => r.poolIdx === focusIdx);
    rects.filter((r) => r.poolIdx !== focusIdx)
      .map((r) => ({ r, d: Math.abs(r.x - (here ? here.x : 0)) }))
      .sort((a, b) => a.d - b.d)
      .forEach((o, rank) => tween((v) => { drop[o.r.poolIdx] = v; }, drop[o.r.poolIdx], 1, 700, rank * 60, easeOut4));
  }

  function closeFocus() {
    if (!focusOn) return;
    root.classList.remove('is-focused');
    tween((v) => { lensFx = v; }, lensFx, 1, 680, 0, easeOut3);
    tween((v) => { focusScale = v; }, focusScale, 1, 765, 0, easeOut3, () => { focusOn = false; focusIdx = -1; });
    const here = rects.find((r) => r.poolIdx === focusIdx);
    rects.filter((r) => (drop[r.poolIdx] || 0) > 0)
      .map((r) => ({ r, d: Math.abs(r.x - (here ? here.x : 0)) }))
      .sort((a, b) => b.d - a.d)
      .forEach((o, rank) => tween((v) => { drop[o.r.poolIdx] = v; }, drop[o.r.poolIdx], 0, 595, rank * 42, easeOut4));
  }

  const closeBtn = document.querySelector('#glassClose');
  if (closeBtn) closeBtn.addEventListener('click', closeFocus);

  /* -------------------------------------------------------- the ticking */
  let raf = 0, onScreen = true, last = -1;

  function frame(now) {
    raf = 0;
    if (!onScreen || document.hidden) return;
    runTweens(now);

    if (!dragging) {
      target += velocity;
      velocity *= .865;
      if (Math.abs(velocity) < .05) velocity = 0;
      if (!snapped && !focusOn && now - lastInput > 120) { target = centerFor(nearest(scroll)); snapped = true; }
    }
    const follow = dragging && dragType !== 'mouse' ? .22 : (snapped ? .05 : .09);
    scroll += (target - scroll) * follow;

    const i = centreIndex(scroll);
    if (i !== last) { last = i; setLabel(i); }

    const speed = Math.abs(scroll - prev);
    prev = scroll;
    const norm = Math.min(1, speed / 60);
    energy += (norm - energy) * (norm > energy ? .25 : .06);

    layout();
    drawRow();
    drawLens(now);
    raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); };

  resize();
  scroll = target = centerFor(0);
  window.addEventListener('resize', () => { resize(); if (!touched) scroll = target = centerFor(0); start(); });
  document.addEventListener('visibilitychange', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { onScreen = entries[0].isIntersecting; start(); }, { threshold: .05 }).observe(root);
  }
  start();
}());
