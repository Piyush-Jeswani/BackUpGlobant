'use strict';

angular.module('shopperTrak').directive('noSpecialCharacters', NoSpecialCharacters);

function NoSpecialCharacters() {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function(scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function(inputValue) {
        if (inputValue === null) {
          return '';
        }

        var replacedString = inputValue.replace(/[^a-zA-Z0-9\@\._-]/g, ''); // will remove all special characters but @ and . and _ and -
        
        if (replacedString !== inputValue) {
          modelCtrl.$setViewValue(replacedString);
          modelCtrl.$render();
        }

        return replacedString;
      });
    }
  }
}
