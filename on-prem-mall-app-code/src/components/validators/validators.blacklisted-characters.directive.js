(function() {
  'use strict';

  angular.module('shopperTrak.validators')
  .directive('blacklistedCharacters', function (){
    return {
      require: 'ngModel',
      restrict:'A',
      link: function(scope, elem, attrs, ngModel) {

        var blacklistRegex = getBlacklistedRegex(attrs.blacklistedCharacters);

        scope.$watch(attrs.blacklistedCharacters, function(){
          blacklistRegex = getBlacklistedRegex(attrs.blacklistedCharacters);
        });

        // For DOM -> model validation
        ngModel.$parsers.unshift(function(value) {
          var valid = isValid(value);
          ngModel.$setValidity('blacklistedCharacters', valid);
          return valid ? value : undefined;
        });

        //For model -> DOM validation
        ngModel.$formatters.unshift(function(value) {
          var valid = isValid(value);
          ngModel.$setValidity('blacklistedCharacters', valid);
          return value;
        });

        function isValid(value) {
          if (_.isString(value)) {
            return !value.match(blacklistRegex)
          }
        }

        function getBlacklistedRegex(value) {
          // Presets:
          switch (value) {
            case 'special': return /[&<>"'\/%#*.()\`]/g; // JS special characters
          }
          if (_.isString(value)) value = value.split('');
          return RegExp('[' + value.join('') + ']', 'g');
        }
      }
    };
  });

})();
