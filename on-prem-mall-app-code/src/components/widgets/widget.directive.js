(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('widget', widget);

  function widget() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/widgets/widget.partial.html',
    };
  }
})();
