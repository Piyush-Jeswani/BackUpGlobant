(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('comparisonWidgetLocationList', comparisonWidgetLocationList);

  function comparisonWidgetLocationList() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/comparison-widget-location-list.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        selectableLocationTypes: '=',
        locationsToDisplay: '@',
        locationIds: '=?',
        selectButtonVisibility: '=',
        currentWidgetType: '=',
        selectedAreas: '=?',
        setWidgetAreas: '&',
        availableWidgets: '=?',
        isLoading: '=?',
        language: '=',
        chartData: '='
      },
      bindToController: true,
      controller: ComparisonWidgetLocationListController,
      controllerAs: 'vm'
    };
  }

  ComparisonWidgetLocationListController.$inject = [
    '$scope',
    '$timeout',
    'LocationResource',
    'ObjectUtils'
  ];

  function ComparisonWidgetLocationListController(
    $scope,
    $timeout,
    LocationResource,
    ObjectUtils
  ) {
    var vm = this;
    vm.allLocations = [];
    vm.selectedLocations = [];
    vm.locationHasData = {};
    vm.addLocation = addLocation;
    vm.removeLocation = removeLocation;
    vm.toggleLocation = toggleLocation;
    vm.removeAllLocations = removeAllLocations;
    vm.locationIsSelected = locationIsSelected;
    vm.importLocations = importLocations;
    vm.getNumberOfSameTypeWidgets = getNumberOfSameTypeWidgets;
    vm.showSelectAllButton = false;

    activate();

    function activate() {
      if (!vm.locationIds) {
        vm.locationIds = [];
      }
      if (!vm.sortedSelectedLocations) {
        vm.sortedSelectedLocations = [];
      }

      if (vm.locationIds.length > 0){
        updateSelectedLocations();
      }

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId'
      ], updateLocations);

      $scope.$watchCollection('vm.allLocations', filterLocationsByType);
      $scope.$watchCollection('vm.locationIds', updateSelectedLocations);
      $scope.$watchCollection('vm.allLocations', updateSelectedLocations);
      $scope.$watch('vm.isLoading', checkLocationDataAvailability);
    }

    function checkLocationDataAvailability() {
      vm.locationHasData[vm.currentWidgetType] = [];
      $timeout(function() {
        _.each(vm.chartData, function (data, key) {
          vm.locationHasData[vm.currentWidgetType][key] = locationHasData(data);
        });
      },1000);
    }

    function locationHasData(data) {
      var dataDays = _.filter(data, function(day) {
        return !ObjectUtils.isNullOrUndefined(day.value);
      });
      return dataDays.length > 0;
    }

    function updateLocations() {
      getCurrentWidgetType(vm.currentWidgetType);
      vm.allLocations = LocationResource.query({
        orgId: vm.orgId,
        siteId: vm.siteId
      });
    }

    function addLocation(locationId) {
      if(vm.locationIds.indexOf(locationId) < 0) {
        vm.locationIds.push(locationId);
      }
    }

    function removeLocation(locationId) {
      var index;
      index = vm.locationIds.indexOf(locationId);
      vm.locationIds.splice(index, 1);
      vm.sortedSelectedLocations = vm.sortedSelectedLocations.filter(function(location) {
        return location.location_id !== locationId;
      });
      checkLocationDataAvailability();
    }

    function toggleLocation(locationId) {
      if (locationIsSelected(locationId)) {
        removeLocation(locationId);
      } else {
        addLocation(locationId);
      }
      vm.selectedAreas = vm.locationIds;
    }

    function locationIsSelected(locationId) {
      return vm.locationIds.indexOf(locationId) >= 0;
    }

    function removeAllLocations() {
      vm.locationIds = [];
      vm.sortedSelectedLocations = [];
      vm.selectedAreas = [];
    }

    function updateSelectedLocations() {
      vm.selectedLocations = getSelectedLocations();
      checkLocationDataAvailability();
    }

    function filterLocationsByType() {
      if (vm.selectableLocationTypes !== undefined && vm.selectableLocationTypes.length > 0) {

        vm.locationsToDisplay = angular.copy(vm.selectableLocationTypes);

        // Zones should always be displayed because locations are being
        // grouped by them.
        if (vm.locationsToDisplay.indexOf('Zone') === -1) {
          vm.locationsToDisplay.push('Zone');
        }

        vm.allLocations = vm.allLocations.filter(function(location) {
          if (vm.locationsToDisplay.indexOf(location.location_type) !== -1) {
            return true;
          } else {
            return false;
          }
        });

      }
    }

    function getSelectedLocations() {
      if (vm.locationIds.length !== vm.sortedSelectedLocations.length && vm.allLocations.length > 0) {
        vm.locationIds.forEach(function(locationId) {
          var locationIdToInt = parseInt(locationId),
              result = vm.allLocations.filter(function(location) {
            return location.location_id === locationIdToInt;
          });

          if (result.length > 0 && vm.sortedSelectedLocations.indexOf(result[0]) < 0) {
            vm.sortedSelectedLocations.push(result[0]);
          }
        });
      }

      if(typeof vm.selectedAreas === 'undefined') {
        vm.selectedAreas = vm.locationIds;
      }

      return vm.sortedSelectedLocations;
    }

    function importLocations(copyFrom, copyTo) {
      if(copyFrom !== copyTo) {
        vm.setWidgetAreas({copyFrom: copyFrom, copyTo: copyTo});
        $timeout(function () {
          getSelectedLocations();
          loadLocations();
        }, 0);
      }
    }

    function loadLocations() {
      vm.locationIds = [];
      vm.sortedSelectedLocations = [];
      angular.forEach(vm.selectedAreas, function(area) {
        addLocation(area);
      });
    }

    function getCurrentWidgetType(widgetType) {
      angular.forEach(vm.availableWidgets, function(widget) {
        if(widget.type === widgetType) {
          vm.currentWidgetLocations = widget.locationsType;
        }
      });
    }

    function getNumberOfSameTypeWidgets() {
      return vm.availableWidgets.filter(function(widget){
        if(widget.locationsType === vm.currentWidgetLocations && widget.type !== vm.currentWidgetType) {
          return widget;
        }
      });
    }

  }
})();
