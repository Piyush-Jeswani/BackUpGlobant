(function () {
  'use strict';
  angular.module('shopperTrak').directive('clickIsolate', function () {
    return {
      link: function(scope, elem) {
          elem.on('click', function(e){
              e.stopPropagation();
          });
      }
    };
  });
})();
