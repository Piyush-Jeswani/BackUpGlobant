(function() {
  'use strict';

  angular.module('shopperTrak.zoneSelector')
    .directive('zoneSelectorPopover', zoneSelectorPopoverDirective);

  function zoneSelectorPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        zones: '=',
        tmps: '=?',
        onZoneClick: '&',
        zoneIsSelected: '&',
        selectedZonesOnClick: '&',
        showSelectAllButton: '=',
        isCsv: '=?'
      },
      controller: ZoneSelectorPopoverController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  ZoneSelectorPopoverController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'ZoneSelectorPopoverControllerBase'
  ];

  function ZoneSelectorPopoverController(
    $injector,
    $scope,
    $element,
    ZoneSelectorPopoverControllerBase
  ) {
    $injector.invoke(ZoneSelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'zoneSelectorTemplateUrl': 'components/zone-selector/zone-selector-popover.partial.html'
    });
  }
})();
