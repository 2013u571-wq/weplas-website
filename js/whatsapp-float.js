/**
 * Unified WhatsApp Floating Button — Injected on every page
 * PC: visible (hover expands panel); Mobile: hidden
 * Config: window.WHATSAPP_NUMBER, window.WHATSAPP_DEFAULT_TEXT
 */
(function() {
  'use strict';

  var DEFAULT_NUMBER = '8618913609266';
  var DEFAULT_TEXT = "Hi, I'm interested in your plastic recycling solution. Please share a proposal and quotation.";

  function getConfig() {
    return {
      number: (typeof window.WHATSAPP_NUMBER !== 'undefined' && window.WHATSAPP_NUMBER) ? String(window.WHATSAPP_NUMBER).replace(/\D/g, '') : DEFAULT_NUMBER,
      text: (typeof window.WHATSAPP_DEFAULT_TEXT !== 'undefined' && window.WHATSAPP_DEFAULT_TEXT) ? window.WHATSAPP_DEFAULT_TEXT : DEFAULT_TEXT
    };
  }

  function buildHref() {
    var c = getConfig();
    return 'https://wa.me/' + c.number + '?text=' + encodeURIComponent(c.text);
  }

  function removeLegacyWhatsAppWidgets() {
    var removed = [];
    var selectors = [
      '.wa-fab',
      '.wa-float',
      '#wa-float',
      '#wa-float-old',
      '.fw-wa-float',
      'a[href*="wa.me"][class*="wa-"]',
      '[aria-label*="WhatsApp"][class*="float"], [aria-label*="whatsapp"][class*="float"]'
    ];

    selectors.forEach(function(sel) {
      try {
        var els = document.querySelectorAll(sel);
        els.forEach(function(el) {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
            removed.push(el);
          }
        });
      } catch (_) {}
    });

    var fixedEls = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
    fixedEls.forEach(function(el) {
      if (el && getComputedStyle(el).position === 'fixed') {
        el.parentNode && el.parentNode.removeChild(el);
        removed.push(el);
      }
    });
  }

  function trackClick() {
    var page = location.pathname || location.path;
    if (typeof gtag === 'function') {
      gtag('event', 'whatsapp_click', { placement: 'floating', page: page });
    }
    if (typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: 'whatsapp_click',
        placement: 'floating',
        page: page
      });
    }
  }

  function createWidget() {
    var href = buildHref();

    var waSvg = '<svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M19.11 17.35c-.27-.14-1.6-.79-1.84-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.18-1.33-.81-.72-1.36-1.6-1.52-1.87-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.97 2.64 1.11 2.82c.14.18 1.91 2.92 4.63 4.09.65.28 1.16.45 1.55.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.02 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.25.59 4.45 1.72 6.39L3 29l6.79-1.78c1.88 1.03 4.01 1.57 6.23 1.57h.01c7.06 0 12.8-5.74 12.8-12.8S23.08 3.2 16.02 3.2zm0 23.3h-.01c-1.98 0-3.92-.53-5.61-1.52l-.4-.23-4.03 1.06 1.08-3.93-.26-.41c-1.08-1.73-1.66-3.73-1.66-5.78 0-6.05 4.92-10.98 10.98-10.98 2.93 0 5.69 1.14 7.76 3.21 2.07 2.07 3.22 4.83 3.22 7.77 0 6.05-4.92 10.98-10.98 10.98z"/></svg>';

    var html = '<div class="wa-float" id="wa-float" aria-label="WhatsApp contact">' +
      '<a class="wa-float__btn" href="' + href + '" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">' +
        '<span class="wa-float__icon" aria-hidden="true">' + waSvg + '</span>' +
      '</a>' +
      '<div class="wa-float__panel" role="dialog" aria-label="Chat with an Engineer">' +
        '<div class="wa-float__title">Chat with an Engineer</div>' +
        '<div class="wa-float__sub">Reply in minutes</div>' +
        '<div class="wa-float__meta"><span class="wa-dot"></span> via WhatsApp • Online</div>' +
        '<a class="wa-float__cta" href="' + href + '" target="_blank" rel="noopener noreferrer">Open WhatsApp</a>' +
      '</div>' +
    '</div>';

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    var el = wrap.firstElementChild;
    document.body.appendChild(el);

    var btn = el.querySelector('.wa-float__btn');
    var cta = el.querySelector('.wa-float__cta');

    function onClick(e) {
      trackClick();
    }

    if (btn) btn.addEventListener('click', onClick);
    if (cta) cta.addEventListener('click', onClick);
  }

  function init() {
    removeLegacyWhatsAppWidgets();
    createWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
