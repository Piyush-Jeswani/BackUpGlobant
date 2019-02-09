(function () {
  'use strict';
  angular.module('shopperTrak').directive('ngRepeatEndWatch', function () {
    return function (scope, element, attrs) {
      if (scope.$last) {
        scope.$emit('onRepeatLast', element, attrs);
      }
    };
  });
})();
