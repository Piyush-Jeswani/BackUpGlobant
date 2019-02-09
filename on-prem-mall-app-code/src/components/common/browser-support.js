(function BrowserSupport(d, h, w, n) {
  /* globals DocumentTouch */
  'use strict';

  // Feature tests (steal required tests from Modernizr etc):
  w.supports = {
    'touch' : ('ontouchstart' in w) || w.DocumentTouch && d instanceof DocumentTouch,
    'pushState' : !!history.pushState,
    'formvalidation' : hasProperties(['checkValidity'],'form')
  };

  var ua = n.userAgent;
  var newCssClasses = ' ';
  var browserString = ua.match(/edge/i) ? 'edge' : ua.match(/Trident|firefox|chrome|safari/i)[0];

  // Feature test CSS classes:
  for (var featureTestName in w.supports) newCssClasses += (w.supports[featureTestName] ? ' ' : ' no-') + featureTestName;

  // Browser detection CSS classes:
  newCssClasses += browserString === 'Trident'
    ? (' ie ie' + ua.match(/rv\:.?11\.0/) ? 11 : ua.substr(ua.indexOf('MSIE')+5, 2).replace('.',''))
    : ' ' + browserString.toLowerCase();

  h.className = h.className.replace('no-js','js') + newCssClasses;

  // UserAgent and Platform hooks:
  h.setAttribute('ua', n.userAgent);
  h.setAttribute('os', n.platform);

  function hasProperties(properties, tagName) {
    var isStyle = !!!tagName;
    tagName = tagName || 'div';
    var el = d.createElement(tagName);
    for (var prop in properties) {
      if ((isStyle ? el.style[properties[prop]] : el[properties[prop]]) !== undefined) return true;
    }
    return false;
  }

})(document, document.documentElement, window, navigator);
