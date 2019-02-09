// Wrap Chartist in an Angular service to make it possible to mock for testing.
(function() {
  'use strict';
  angular.module('shopperTrak.charts').factory('Chartist', function() {
    return Chartist;
  });
})();
