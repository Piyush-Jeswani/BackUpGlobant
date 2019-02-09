(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('locationValuePairs', locationValuePairs);

  function locationValuePairs() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/location-value-pairs/location-value-pairs.partial.html',
      scope: {
        formatValue: '&valueFormat',
        handleClick: '&onClick',
        highlightedLocation: '=',
        isClickable: '&clickable',
        locations: '=',
        values: '='
      },
      bindToController: true,
      controller: LocationValuePairsController,
      controllerAs: 'vm'
    };
  }

  LocationValuePairsController.$inject = [
    'locationTypeColors'
  ];

  function LocationValuePairsController(locationTypeColors) {
    var vm = this;

    vm.clearHighlight = clearHighlight;
    vm.getLocationColor = getLocationColor;
    vm.getValue = getValue;
    vm.highlightLocation = highlightLocation;
    vm.hasValue = hasValue;
    vm.isHighlighted = isHighlighted;

    function clearHighlight() {
      vm.highlightedLocation = undefined;
    }

    function getLocationColor(location) {
      if (locationTypeColors[location.location_type]) {
        return locationTypeColors[location.location_type];
      } else {
        return locationTypeColors['default'];
      }
    }

    function getValue(location) {
      return vm.values[location.location_id];
    }

    function highlightLocation(location) {
      vm.highlightedLocation = location;
    }

    function hasValue(location) {
      return vm.values[location.location_id] !== undefined;
    }

    function isHighlighted(location) {
      return location === vm.highlightedLocation;
    }
  }
})();
