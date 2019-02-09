(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('heatmap', heatmap);

  function heatmap() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/heatmap/heatmap.partial.html',
      scope: {
        activeLocation: '=',
        floorNum: '=floor',
        kpi:'=?',
        formatValue: '&valueFormat',
        handleClick: '&onClick',
        highlightedLocation: '=',
        isClickable: '&clickable',
        legendLabel: '@',
        locations: '=',
        language: '=',
        // An object of key-value pairs, where keys are locationIds
        // and values are the values to display.
        values: '='
      },
      link: linkHeatmap,
      bindToController: true,
      controller: HeatmapController,
      controllerAs: 'vm'
    };

    function linkHeatmap(scope, element, attrs) {
      attrs.$set('class', 'heatmap');
    }
  }

  HeatmapController.$inject = [
    '$scope',
    'resourceUtils',
    'heatmapColors',
    'renderableLocationTypes'
  ];

  function HeatmapController(
    $scope,
    resourceUtils,
    heatmapColors,
    renderableLocationTypes
  ) {
    var vm = this;

    vm.colors = heatmapColors.steps;
    vm.floorDropdownIsOpen = false;

    vm.clearHighlight = clearHighlight;
    vm.getColor = getColor;
    vm.getValue = getValue;
    vm.hasValue = hasValue;
    vm.highlightLocation = highlightLocation;
    vm.isHighlighted = isHighlighted;
    vm.shouldBeRendered = shouldBeRendered;

    vm.closeFloorDropdown = closeFloorDropdown;
    vm.floorIsSelected = floorIsSelected;
    vm.getNavigableFloors = getNavigableFloors;
    vm.setFloorNumAndCloseDropdown = setFloorNumAndCloseDropdown;
    vm.toggleFloorDropdown = toggleFloorDropdown;
    vm.getFloorsForDropdown = getFloorsForDropdown;

    activate();
    function activate() {
      $scope.$watchGroup([
        'vm.activeLocation',
        'vm.locations'
      ], function() {
        if (!vm.floorNum && vm.activeLocation) {
          vm.floorNum = vm.activeLocation.floor || 1;
        }
      });

      // Use memoization to ensure that a reference to the same object is
      // returned for each location. Otherwise, when used in a template, an
      // infinite $digest loop can occur.
      vm.getGeometry =  _.memoize(parseGeometry, function(location) {
        return location.location_id;
      });

      vm.navigableFloors = getFloorsForDropdown(vm.locations);

      if (!vm.floorNum && !vm.activeLocation) {
        vm.floorNum = vm.navigableFloors[0];
      }
    }

    function getFloorsForDropdown(locations) {
      var floors = _.difference(_.uniq(_.pluck(locations, 'floor')), [null, undefined]);
      floors.sort();
      return floors;
    }

    function clearHighlight() {
      vm.highlightedLocation = undefined;
    }

    function getColor(location) {
      if (location === vm.activeLocation) {
        return heatmapColors.activeLocation;
      } else {
        var value = getValue(location);
        return hasValue(location) ? translateValueToColor(value) : heatmapColors.valuelessLocation;
      }
    }

    function getValue(location) {
      return vm.values[location.location_id];
    }

    function highlightLocation(location) {
      vm.highlightedLocation = location;
    }

    function isHighlighted(location) {
      return location === vm.highlightedLocation;
    }

    function shouldBeRendered(location) {
      return resourceUtils.locationHasGeometry(location) &&
             (vm.getNavigableFloors().length === 0 || location.floor === vm.floorNum) &&
             renderableLocationTypes.indexOf(location.location_type) >= 0;
    }

    function closeFloorDropdown() {
      vm.floorDropdownIsOpen = false;
    }

    function floorIsSelected(floor) {
      return vm.floorNum === floor;
    }

    function getNavigableFloors() {
      // Return a cached value if last call was made with same parameters
      if (getNavigableFloors.lastLocations !== vm.locations) {
        getNavigableFloors.locations = vm.locations;
        getNavigableFloors.navigableFloors = vm.navigableFloors;
      }
      return getNavigableFloors.navigableFloors;
    }

    function toggleFloorDropdown() {
      vm.floorDropdownIsOpen = !vm.floorDropdownIsOpen;
    }

    function setFloorNumAndCloseDropdown(floorNum) {
      closeFloorDropdown();
      vm.floorNum = floorNum;
      $scope.$emit('floorSelected', {floorNum:floorNum, kpi:vm.kpi}); //just so parent component can track floor selection for pdf export
    }

    function hasValue(location) {
      return vm.values[location.location_id] !== undefined;
    }

    function parseGeometry(location) {
      return {
        type: location.geometry.type,
        coordinates: location.geometry.coordinates
      };
    }

    function getLargestValue() {
      // Return a cached value if last call was made with same parameters
      if (
        getLargestValue.lastLocations !== vm.locations &&
        getLargestValue.lastValues !== vm.values
      ) {
        getLargestValue.lastLocations = vm.locations;
        getLargestValue.lastValues = vm.values;

        getLargestValue.lastLargestValue = vm.locations
          .filter(hasValue)
          .reduce(function(largestValue, location) {
            return Math.max(vm.values[location.location_id], largestValue);
          }, 0);
      }
      // Ensure that undefined is never returned
      return getLargestValue.lastLargestValue ? getLargestValue.lastLargestValue : 0;
    }

    function translateValueToColor(value) {
      var colorIndex = Math.min(
        vm.colors.length - 1,
        Math.floor(value / getLargestValue() * vm.colors.length)
      );
      return vm.colors[colorIndex];
    }
  }
})();
