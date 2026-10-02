/* ==========================================================================
   LUXURY MEDIA WALL — Silk Blend backdrop
   The page's ground: a silky linear gradient that sways behind everything,
   with the film grain and a light veil layered over it in CSS.

   Recreated from the 21st.dev "Silk Blend" parameters - white, sky blue,
   ultramarine and iris along a 32deg line. The angle sways with
   sin(spin * 0.6) * 24 * amt, which is exactly 0 at the first frame, so
   nothing snaps when the motion starts, and no value is rounded, which is
   what would make the sway visibly step.

   Canvas rather than CSS because a CSS gradient cannot be re-derived per
   frame without the browser re-parsing it. Reduced motion paints the first
   frame once and stops.
   ========================================================================== */
(function () {
  'use strict';

  const canvas = document.getElementById('silk');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

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

  let w = 0, h = 0, dpr = 1, raf = 0, started = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* The gradient line for an angle, measured the way CSS measures it: 0deg
     points up, and the line is long enough to cover the box corner to
     corner so the end stops are never cut short. */
  function paint(angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad));
    const dx = Math.cos(rad) * len / 2;
    const dy = Math.sin(rad) * len / 2;

    const g = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
    STOPS.forEach((s) => g.addColorStop(s.pos, s.hex));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(now) {
    if (!started) started = now;
    const t = (now - started) / 1000;
    const ph = t * SPEED;
    const spin = ph * DIR;
    /* sin(0) is 0, so the first frame is the gradient at rest. */
    paint(ANGLE + Math.sin(spin * .6) * 24 * AMOUNT);
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

  size();
  paint(ANGLE);
  if (!REDUCED) start();

  window.addEventListener('resize', () => {
    size();
    paint(ANGLE + (raf ? 0 : 0));
    if (REDUCED) paint(ANGLE);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else { started = 0; start(); }
  });
}());
