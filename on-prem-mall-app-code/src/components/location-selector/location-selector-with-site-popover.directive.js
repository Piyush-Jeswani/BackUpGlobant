(function() {
  'use strict';

  angular.module('shopperTrak.locationSelector')
    .directive('locationSelectorWithSitePopover', locationSelectorWithSitePopoverDirective);

  function locationSelectorWithSitePopoverDirective() {
    return {
      restrict: 'A',
      scope: {
        locations: '=',
        onLocationClick: '&',
        locationIsSelected: '&',
        onSiteClick: '&',
        siteIsSelected: '&',
        selectedLocationsOnClick: '&',
        showSelectAllButton: '='
      },
      controller: LocationSelectorWithSitePopoverController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  LocationSelectorWithSitePopoverController.$inject = [
    '$injector',
    '$scope',
    '$element',
    'LocationSelectorPopoverControllerBase'
  ];

  function LocationSelectorWithSitePopoverController(
    $injector,
    $scope,
    $element,
    LocationSelectorPopoverControllerBase
  ) {
    $injector.invoke(LocationSelectorPopoverControllerBase, this, {
      '$scope': $scope,
      '$element': $element,
      'locationSelectorTemplateUrl': 'components/location-selector/location-selector-with-site-popover.partial.html'
    });
  }
})();
