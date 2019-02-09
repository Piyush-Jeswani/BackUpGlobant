(function () {
  'use strict';

  angular.module('shopperTrak').directive('miSelector', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/mi-selector/mi-selector.partial.html',
      controller: 'miSelectorCtrl as vm',
      bindToController: true,
      scope: {
        controlId: '@',
        items: '=',
        currentItem: '=',
        displayProperty: '@',
        onItemSelection: '=',
        parentDropDownClass: '@',
        placeholderLabel: '<?',
        currentFilterId: '<?',
        selectedDimension: '<?'
      }
    };
  });
})();