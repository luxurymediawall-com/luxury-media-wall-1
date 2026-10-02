/* ==========================================================================
   LUXURY MEDIA WALL — Silk Blend backdrop
   The page's ground: a silky linear gradient that sways behind everything,
   with the film grain and a light veil layered over it in CSS. The same
   gradient is painted again inside the footer, where it is blended over the
   ink rather than replacing it, so the pale type there keeps its contrast.

   Recreated from the 21st.dev "Silk Blend" parameters - white, sky blue,
   ultramarine and iris along a 32deg line. The angle sways with
   sin(spin * 0.6) * 24 * amt, which is exactly 0 on the first frame, so
   nothing snaps when the motion starts, and no value is rounded, which is
   what would make the sway visibly step.

   Canvas rather than CSS because a CSS gradient cannot be re-derived per
   frame without the browser re-parsing it. Reduced motion paints one frame
   and stops; so does a hidden tab.
   ========================================================================== */
(function () {
  'use strict';

  const canvases = Array.prototype.slice.call(document.querySelectorAll('canvas.silk'));
  if (!canvases.length) return;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Palette and geometry, exactly as the gradient was specified. */
  const STOPS = [
    { pos: .18, hex: '#FFFFFF' },
    { pos: .57, hex: '#78B8F9' },
    { pos: .64, hex: '#5667FF' },
    { pos: 1,   hex: '#4D2FF9' }
  ];
  const ANGLE = 32;        /* degrees */
  const SPEED = 1;         /* ph = t * 1.00 */
  const AMOUNT = .3;       /* motionAmount 30% */
  const DIR = 1;           /* motionReverse false */

  /* Each canvas carries its own box: the fixed one fills the window, the
     footer one fills the footer. */
  const layers = canvases.map((canvas) => ({
    canvas,
    ctx: canvas.getContext('2d'),
    fixed: canvas.classList.contains('silk--fixed'),
    w: 0, h: 0
  })).filter((l) => l.ctx);
  if (!layers.length) return;

  let raf = 0, started = 0;

  function size(layer) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const box = layer.fixed
      ? { width: window.innerWidth, height: window.innerHeight }
      : layer.canvas.parentNode.getBoundingClientRect();
    layer.w = Math.max(1, box.width);
    layer.h = Math.max(1, box.height);
    layer.canvas.width = Math.round(layer.w * dpr);
    layer.canvas.height = Math.round(layer.h * dpr);
    layer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* The gradient line for an angle, measured the way CSS measures it: 0deg
     points up, and the line runs corner to corner so the end stops are
     never cut short. */
  function paint(layer, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    const cx = layer.w / 2;
    const cy = layer.h / 2;
    const len = Math.abs(layer.w * Math.cos(rad)) + Math.abs(layer.h * Math.sin(rad));
    const dx = Math.cos(rad) * len / 2;
    const dy = Math.sin(rad) * len / 2;

    const g = layer.ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    STOPS.forEach((s) => g.addColorStop(s.pos, s.hex));
    layer.ctx.fillStyle = g;
    layer.ctx.fillRect(0, 0, layer.w, layer.h);
  }

  const paintAll = (angleDeg) => layers.forEach((l) => paint(l, angleDeg));

  function frame(now) {
    if (!started) started = now;
    const t = (now - started) / 1000;
    const ph = t * SPEED;
    const spin = ph * DIR;
    /* sin(0) is 0, so the first frame is the gradient at rest. */
    paintAll(ANGLE + Math.sin(spin * .6) * 24 * AMOUNT);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || REDUCED || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function measure() {
    layers.forEach(size);
    paintAll(ANGLE);
  }

  measure();
  start();

  window.addEventListener('resize', measure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { started = 0; start(); }
  });
  /* The footer's height settles once its own images and type have landed. */
  window.addEventListener('load', measure);
}());
