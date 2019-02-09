(function() {
  'use strict';

  angular
    .module('shopperTrak.leaflet')
    .factory('leafletUtils', leafletUtils);

  function leafletUtils() {
    return {
      getBounds: getBounds
    };

    function getBounds(layers) {
      return layers.slice(1).reduce(function(bounds, layer) {
        bounds.extend(layer.getBounds());
        return bounds;
      }, layers[0].getBounds());
    }
  }
})();
