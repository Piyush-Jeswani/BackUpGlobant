(function() {
  'use strict';

  angular.module('shopperTrak.routing')
    // These parameters should be passed from any state to any other when
    // navigating between them. This is achieved by extending the $state
    // service's href method using a decorator.
    .constant('specialStateParams', [
      'locationId',
      'dateRangeStart',
      'dateRangeEnd',
      'comparisonDateRangeStart',
      'comparisonDateRangeEnd'
    ]);
})();
