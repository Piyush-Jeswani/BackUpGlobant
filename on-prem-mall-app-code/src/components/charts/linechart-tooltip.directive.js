(function() {
  'use strict';

  angular.module('shopperTrak.charts')
    .directive('linechartTooltip', linechartTooltip);

  function linechartTooltip() {
    return {
      require: '^linechart',
      restrict: 'E',
      templateUrl: 'components/charts/tooltip.partial.html',
      transclude: true,
      link: linkLinechartTooltip
    };

    function linkLinechartTooltip(scope, element, attrs, chartController) {
      chartController.attachTooltip(scope);
    }
  }
})();
