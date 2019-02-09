(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .directive('barchartTooltip', barchartTooltip);

  function barchartTooltip() {
    return {
      require: '^barchart',
      restrict: 'E',
      templateUrl: 'components/charts/tooltip.partial.html',
      transclude: true,
      link: linkBarchartTooltip
    };

    function linkBarchartTooltip(scope, element, attrs, chartController) {
      chartController.attachTooltip(scope);
    }
  }
})();
