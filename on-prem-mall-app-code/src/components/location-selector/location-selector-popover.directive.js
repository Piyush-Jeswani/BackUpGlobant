(function() {
  'use strict';

  angular.module('shopperTrak.locationSelector')
    .directive('locationSelectorPopover', locationSelectorPopoverDirective);

  function locationSelectorPopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        locations: '=',
        onLocationClick: '&',
        locationIsSelected: '&',
        selectableLocationTypes: '=',
        selectedLocationsOnClick: '&',
        showSelectAllButton: '=',
        selectButtonVisibility: '='
      },
      controller: LocationSelectorPopoverController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  LocationSelectorPopoverController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'LocationSelectorPopoverControllerBase'
  ];

  function LocationSelectorPopoverController(
    $injector,
    $scope,
    $element,
    LocationSelectorPopoverControllerBase
  ) {
    $injector.invoke(LocationSelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'locationSelectorTemplateUrl': 'components/location-selector/location-selector-popover.partial.html'
    });
  }
})();
