(function() {
  'use strict';

  angular.module('shopperTrak.validators')
  .directive('blacklistedValues', function (){
    return {
      require: 'ngModel',
      restrict:'A',
      link: function(scope, elem, attr, ngModel) {

        var blacklist = [];

        scope.$watch(attr.blacklistedValues, function (values) {
            blacklist = values;
        });

        //For DOM -> model validation
        ngModel.$parsers.unshift(function(value) {
          var valid = blacklist.indexOf(value) === -1;
          ngModel.$setValidity('blacklistedValues', valid);
          return valid ? value : undefined;
        });

        //For model -> DOM validation
        ngModel.$formatters.unshift(function(value) {
          ngModel.$setValidity('blacklistedValues', blacklist.indexOf(value) === -1);
          return value;
        });
      }
    };
  });

})();
