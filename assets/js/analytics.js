/* ===========================================================================
   ANALYTICS AND CONVERSION TRACKING
   ---------------------------------------------------------------------------
   Records the three things that count as an enquiry on this site:

     WhatsApp click  - any element carrying data-wa, or any wa.me link
     Phone click     - any element carrying data-phone-link, or any tel: link
     Enquiry form    - the #enquiryForm submit

   Nothing here runs until ANALYTICS in site-config.js carries an ID. With
   both IDs empty the file loads, finds no configuration and returns: no tag,
   no cookies, no network request, nothing for a visitor to consent to.

   Google Ads counts a conversion only when BOTH adsConversionId and that
   event's label are filled in. A missing label is not an error - the event
   still reaches Google Analytics, it just isn't counted as a conversion.
   =========================================================================== */

(function () {
  'use strict';

  var CFG = (typeof ANALYTICS === 'object' && ANALYTICS) ? ANALYTICS : {};
  var GA  = String(CFG.measurementId   || '').trim();
  var ADS = String(CFG.adsConversionId || '').trim();

  /* Not configured yet. Stay completely silent. */
  if (!GA && !ADS) return;

  var LABELS = CFG.adsLabels || {};

  /* ------------------------------------------------------------ gtag boot */
  /* The pages carry the Google tag in <head>, which loads and configures it
     before this deferred file runs. Booting it a second time would send a
     second page_view for every visit, so only boot when that tag is absent. */
  var gtag;
  if (typeof window.gtag === 'function') {
    gtag = window.gtag;
  } else {
    window.dataLayer = window.dataLayer || [];
    gtag = function () { window.dataLayer.push(arguments); };
    window.gtag = gtag;

    gtag('js', new Date());
    if (GA)  gtag('config', GA);
    if (ADS) gtag('config', ADS);

    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' +
              encodeURIComponent(GA || ADS);
    document.head.appendChild(tag);
  }

  /* --------------------------------------------------------------- record */
  /* Sends one GA4 event, and a Google Ads conversion when a label exists.
     A tel: link navigates away on a phone, so the beacon transport is used
     to make sure the request survives the page leaving. */
  function record(eventName, labelKey, params) {
    var payload = params || {};
    payload.transport_type = 'beacon';

    try { gtag('event', eventName, payload); } catch (e) {}

    var label = String(LABELS[labelKey] || '').trim();
    if (ADS && label) {
      try {
        gtag('event', 'conversion', {
          send_to: ADS + '/' + label,
          transport_type: 'beacon'
        });
      } catch (e) {}
    }
  }

  /* Walks up from the clicked node to find a matching element. The click
     target can be a span inside a button, so closest() is needed; text
     nodes have no closest(), hence the guard. */
  function closestFrom(node, selector) {
    var el = (node && node.nodeType === 1) ? node : (node && node.parentElement);
    return (el && el.closest) ? el.closest(selector) : null;
  }

  /* Which section of the page the enquiry came from, so the reports show
     whether the header button or the footer one actually earns contacts. */
  function placeOf(el) {
    var section = el.closest ? el.closest('section[id], header, footer') : null;
    if (!section) return 'unknown';
    return section.id || section.tagName.toLowerCase();
  }

  /* --------------------------------------------------------------- clicks */
  document.addEventListener('click', function (ev) {
    var wa = closestFrom(ev.target, '[data-wa], a[href*="wa.me"]');
    if (wa) {
      record('whatsapp_click', 'whatsappClick', {
        event_category: 'enquiry',
        event_label: placeOf(wa)
      });
      return;
    }

    var phone = closestFrom(ev.target, '[data-phone-link], a[href^="tel:"]');
    if (phone) {
      record('phone_click', 'phoneClick', {
        event_category: 'enquiry',
        event_label: placeOf(phone)
      });
    }
  }, true);

  /* ---------------------------------------------------------------- forms */
  /* #enquiryForm is a lead and counts as a conversion. #reviewForm is a
     customer leaving a review - worth measuring, never a conversion. */
  document.addEventListener('submit', function (ev) {
    var form = ev.target;
    if (!form || form.nodeType !== 1) return;

    if (form.id === 'enquiryForm') {
      record('enquiry_form_submit', 'enquiryForm', { event_category: 'enquiry' });
    } else if (form.id === 'reviewForm') {
      record('review_submit', null, { event_category: 'engagement' });
    }
  }, true);
})();
