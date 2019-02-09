(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('multipleSelectorPopover', multipleSelectorPopoverDirective);

  function multipleSelectorPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        items: '=',
        orderBy: '=',
        showSelectAllButton: '=',
        selectedItems: '=',
        selectItem: '&?'
      },
      controller: multipleSelectorPopoverController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  multipleSelectorPopoverController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'MultipleSelectorPopoverControllerBase'
  ];

  function multipleSelectorPopoverController(
    $injector,
    $scope,
    $element,
    MultipleSelectorPopoverControllerBase
  ) {
    $injector.invoke(MultipleSelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'multipleSelectorTemplateUrl': 'components/widgets/multiple-selector-widget/multiple-selector-popover.partial.html'
    });
  }
})();
