(function() {
  'use strict';

  angular.module('shopperTrak.siteSelector')
    .directive('siteSelectorPopover', siteSelectorPopoverDirective);

  function siteSelectorPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        sites: '=',
        onSiteClick: '&',
        isSelected: '&',
        selectAllSites: '&',
        selectedSitesOnClick: '&',
        showSelectAllButton: '=',
        showCustomerSiteId: '=?',
      },
      controller: siteSelectorPopoverDirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  siteSelectorPopoverDirectiveController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'SelectorPopoverControllerBase'
  ];

  function siteSelectorPopoverDirectiveController(
    $injector,
    $scope,
    $element,
    SelectorPopoverControllerBase
  ) {
    $injector.invoke(SelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'SelectorTemplateUrl': 'components/site-selector/site-selector-popover.partial.html'
    });
  }
})();
