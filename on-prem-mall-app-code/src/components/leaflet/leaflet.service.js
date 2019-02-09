// Wrap Leaflet in an Angular service to make it possible to mock for testing.
(function() {
  'use strict';
  angular.module('shopperTrak.leaflet').factory('leaflet', function() {
    return L;
  });
})();
