(function() {
  'use strict';

  // This is a common controller for locationSelectorPopover
  // and locationSelectorWithSitePopover.

  angular.module('shopperTrak.widgets')
  .value('LocationSelectorPopoverControllerBase', LocationSelectorPopoverControllerBase);

  LocationSelectorPopoverControllerBase.$inject = [
    '$scope',
    '$element',
    '$popover',
    'locationSelectorTemplateUrl'
  ];

  function LocationSelectorPopoverControllerBase(
    $scope,
    $element,
    $popover,
    locationSelectorTemplateUrl
  ) {
    var vm = this;

    vm.filter = '';

    // Keep collapsedLocations in memory so that they
    // don't reset every time the popover is closed.
    vm.collapsedLocations = [];

    vm.selectLocation = selectLocation;
    vm.selectAll = selectAll;

    activate();

    function activate() {
      $popover($element, {
        trigger: 'click',
        placement: 'bottom',
        autoClose: true,
        templateUrl: locationSelectorTemplateUrl,
        scope: $scope
      });
    }

    function selectLocation(locationId) {
      vm.onLocationClick({
        locationId: locationId
      });
    }

    function selectAll(allLocationsList) {
      vm.selectedLocationsOnClick(allLocationsList);
    }
  }
})();
