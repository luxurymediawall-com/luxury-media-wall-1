/* ==========================================================================
   WHATSAPP SEND HINT
   --------------------------------------------------------------------------
   A tap on a WhatsApp link only opens the chat with the message typed in;
   the visitor still has to press Send, and many do not. This shows a short
   reminder at the moment they leave for WhatsApp. It never blocks the link.
   Self-contained (styles inline) so every page can load it on its own.
   ========================================================================== */
(function () {
  var TEXT = {
    en: 'WhatsApp is opening — tap Send ➤ and we reply within minutes.',
    ar: 'سيفتح واتساب الآن — اضغط إرسال ➤ وسنرد عليك خلال دقائق.'
  };
  var box = null, timer = null;

  function show() {
    var ar = (document.documentElement.lang || '').indexOf('ar') === 0;
    if (!box) {
      box = document.createElement('div');
      box.setAttribute('role', 'status');
      box.style.cssText =
        'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;' +
        'width:max-content;max-width:calc(100% - 32px);padding:14px 20px;border-radius:12px;' +
        'background:#12100D;color:#F5F2EC;border:1px solid #C6A66B;' +
        'font:500 15px/1.4 Jost,system-ui,sans-serif;text-align:center;' +
        'box-shadow:0 12px 40px rgba(0,0,0,.35);transition:opacity .3s;opacity:0';
      document.body.appendChild(box);
    }
    box.dir = ar ? 'rtl' : 'ltr';
    box.textContent = ar ? TEXT.ar : TEXT.en;
    requestAnimationFrame(function () { box.style.opacity = '1'; });
    clearTimeout(timer);
    timer = setTimeout(function () { box.style.opacity = '0'; }, 7000);
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href*="wa.me"]');
    if (a) show();
  }, true);

  /* The enquiry form opens WhatsApp from script, not from a link. */
  document.addEventListener('enquiry:sent', show);
})();
