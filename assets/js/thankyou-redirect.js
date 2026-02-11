/**
 * Gangsu – Form submit success: redirect to thank-you page with source info.
 * Usage: After form submission success, call gsRedirectToThankYou(form).
 * Thank-you page reads: product (H1), page (path), form (id or class).
 */
(function () {
  'use strict';

  function getProduct() {
    var h1 = document.querySelector('h1');
    return (h1 && h1.textContent) ? h1.textContent.trim() : '';
  }

  function getFormId(form) {
    if (!form) return '';
    if (form.id) return form.id;
    if (form.className && typeof form.className === 'string') {
      var firstClass = form.className.split(/\s+/).filter(Boolean)[0];
      return firstClass || '';
    }
    return '';
  }

  window.gsRedirectToThankYou = function (form) {
    var product = getProduct();
    var page = typeof location !== 'undefined' && location.pathname ? location.pathname : '';
    var formId = getFormId(form || null);
    var params = new URLSearchParams();
    if (product) params.set('product', product);
    if (page) params.set('page', page);
    if (formId) params.set('form', formId);
    var qs = params.toString();
    var url = '/thank-you/' + (qs ? '?' + qs : '');
    if (typeof location !== 'undefined') location.href = url;
  };
})();
