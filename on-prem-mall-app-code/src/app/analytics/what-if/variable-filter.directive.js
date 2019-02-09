(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('variableFilter', variableFilter);

    variableFilter.$inject = [
      '$timeout',
      '$filter'
    ];

    function variableFilter($timeout, $filter) {
      return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
          filterModel: '=',
        },
        link: function(scope, element, attrs, ngModel) {
          var prefixSymbol = scope.filterModel.prefixSymbol;
          var suffixSymbol = scope.filterModel.suffixSymbol;
          var precision = scope.filterModel.precision;
          var isCurrency =  scope.filterModel.isCurrency;

          ngModel.$parsers.push( function(val) {
            var realValue = Number(val.replace(/[^0-9\.-]+/g, ''));
            ngModel.$setViewValue( formatValue(realValue) );
            ngModel.$render();
            return realValue;
          });

          ngModel.$formatters.push( function(val) {
            return formatValue(val);
          });

          function formatValue(val) {
            if(val === Infinity) {
              //definitely and illegal operation
              return '-';
            }

            if(isCurrency === true) {
              return !isNaN(val) ? $filter('formatCurrency')(val, prefixSymbol) : null;
            }
            else if (suffixSymbol !== null) {
              return !isNaN(val) ? $filter('formatNumber')(val, precision) + suffixSymbol : null;
            }
            else {
              return $filter('formatNumber')(val, precision);
            }
          }

          function onEnterKey(keyEvent) {
            if (keyEvent.keyCode === 13) {
              element.blur();
            }
          }

          element.bind('keyup', onEnterKey);

          scope.$on('$destroy', function() {
            element.unbind('keyup', onEnterKey);
          });

        }
      };
    }

})();
