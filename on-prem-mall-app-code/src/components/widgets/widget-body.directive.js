(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('widgetBody', widgetBody);

  function widgetBody() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/widgets/widget-body.partial.html'
    };
  }
})();
