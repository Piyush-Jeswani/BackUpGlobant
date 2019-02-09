(function() {
  'use strict';

  angular.module('shopperTrak.zoneSelector')
    .directive('zoneSelectorWithSitePopover', zoneSelectorWithSitePopoverDirective);

  function zoneSelectorWithSitePopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        zones: '=',
        onZoneClick: '&',
        zoneIsSelected: '&',
        onSiteClick: '&',
        siteIsSelected: '&',
        selectedZonesOnClick: '&',
        showSelectAllButton: '='
      },
      controller: ZoneSelectorWithSitePopoverController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  ZoneSelectorWithSitePopoverController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'ZoneSelectorPopoverControllerBase'
  ];

  function ZoneSelectorWithSitePopoverController(
    $injector,
    $scope,
    $element,
    ZoneSelectorPopoverControllerBase
  ) {
    $injector.invoke(ZoneSelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'zoneSelectorTemplateUrl': 'components/zone-selector/zone-selector-with-site-popover.partial.html'
    });
  }
})();
