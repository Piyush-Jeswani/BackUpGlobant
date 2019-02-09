(function () {
  'use strict';

angular.module('shopperTrak')
.directive('decimalValidator', function () {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element.bind('keypress', function (event) {
        var inputVal = event.target.value;
        var decimalCheck = '';
        if(inputVal.length > 3){
          decimalCheck = inputVal.split('.');
        }else return;
        decimalCheck[1] = decimalCheck[1].slice(0,1);
        var outpulVal = decimalCheck[0] + '.' + decimalCheck[1];
        if(decimalCheck[1]){
          event.preventDefault();    
          return outpulVal;     
        }   
      });
    }
  };
});
})();


