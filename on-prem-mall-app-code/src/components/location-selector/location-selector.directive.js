(function() {
  'use strict';

  angular.module('shopperTrak.locationSelector')
    .directive('locationSelector', locationSelectorDirective);

  function locationSelectorDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/location-selector/location-selector.partial.html',
      scope: {
        locations: '=',
        onLocationClick: '&',
        getLocationHref: '&locationHref',
        locationIsSelected: '&',
        language: '=',
        collapsedLocations: '=',
        selectableLocationTypes: '=',
        selectedLocationsOnClick: '&',
        showSelectAllButton: '='

      },
      controller: LocationSelectorController,
      controllerAs: 'vm',
      bindToController: true,
    };
  }

  LocationSelectorController.$inject = [
    '$scope',
    '$element',
    'LocationResource'
  ];

  function LocationSelectorController() {
    var vm = this;

    vm.filter = '';

    vm.selectLocation = selectLocation;
    vm.selectAll = selectAll;

    function selectLocation(locationId) {
      vm.onLocationClick({
        locationId: locationId
      });
    }

    function selectAll(allLocationsList){
      vm.selectedLocationsOnClick({
        allLocationsList : allLocationsList
      });
    }
  }
})();
