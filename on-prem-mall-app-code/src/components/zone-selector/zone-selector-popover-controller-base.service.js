(function() {
  'use strict';

  // This is a common controller for zoneSelectorPopover
  // and zoneSelectorWithSitePopover.

  angular.module('shopperTrak.widgets')
  .value('ZoneSelectorPopoverControllerBase', ZoneSelectorPopoverControllerBase);

  ZoneSelectorPopoverControllerBase.$inject = [
    '$scope',
    '$element',
    '$popover',
    'zoneSelectorTemplateUrl'
  ];

  function ZoneSelectorPopoverControllerBase(
    $scope,
    $element,
    $popover,
    zoneSelectorTemplateUrl
  ) {
    var vm = this;

    vm.filter = '';

    // Keep collapsedZones in memory so that they
    // don't reset every time the popover is closed.
    vm.collapsedZones = [];

    vm.selectZone = selectZone;
    vm.selectAll = selectAll;

    activate();

    function activate() {
      $popover($element, {
        trigger: 'click',
        placement: 'bottom',
        autoClose: true,
        templateUrl: zoneSelectorTemplateUrl,
        scope: $scope
      });
    }

    function selectZone(zoneId) {
      vm.onZoneClick({
        zoneId: zoneId
      });
    }

    function selectAll(allZonesList) {
      vm.selectedZonesOnClick(allZonesList);
    }
  }
})();
