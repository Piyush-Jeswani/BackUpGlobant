(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('comparisonWidgetZoneList', comparisonWidgetZoneList);

  function comparisonWidgetZoneList() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/comparison-widget-zone-list.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        zonesToDisplay: '@',
        zoneIds: '=?',
        selectButtonVisibility: '=',
        currentWidgetType: '=',
        selectedAreas: '=?',
        isLoading: '=?',
        setWidgetAreas: '&',
        availableWidgets: '=?',
        language: '=',
        chartData: '='
      },
      bindToController: true,
      controller: ComparisonWidgetZoneListController,
      controllerAs: 'vm'
    };
  }

  ComparisonWidgetZoneListController.$inject = [
    '$scope',
    '$timeout',
    'ZoneResource',
    'ObjectUtils'
  ];

  function ComparisonWidgetZoneListController(
    $scope,
    $timeout,
    ZoneResource,
    ObjectUtils
  ) {
    var vm = this;
    vm.allZones = [];
    vm.selectedZones = [];
    vm.zoneHasData = {};
    vm.addZone = addZone;
    vm.removeZone = removeZone;
    vm.toggleZone = toggleZone;
    vm.removeAllZones = removeAllZones;
    vm.zoneIsSelected = zoneIsSelected;
    vm.getNumberOfSameTypeWidgets = getNumberOfSameTypeWidgets;
    vm.importZones = importZones;
    vm.showSelectAllButton = false;

    activate();

    function activate() {
      if (!vm.zoneIds) {
        vm.zoneIds = [];
      }
      if (!vm.sortedSelectedZones) {
        vm.sortedSelectedZones = [];
      }

      if (vm.zoneIds.length > 0) {
        updateSelectedZones();
      }

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId'
      ], updateZones);

      $scope.$watchCollection('vm.allZones', updateSelectedZones);
      $scope.$watchCollection('vm.zoneIds', updateSelectedZones);
      $scope.$watch('vm.isLoading', checkLocationDataAvailability);
    }

    function checkLocationDataAvailability() {
      vm.zoneHasData[vm.currentWidgetType] = [];
      $timeout(function () {
        _.each(vm.chartData, function (data, key) {
          vm.zoneHasData[vm.currentWidgetType][key] = zoneHasData(data);
        });
      }, 1000);
    }

    function zoneHasData(data) {
      var dataDays = _.filter(data, function (day) {
        return !ObjectUtils.isNullOrUndefined(day.value);
      });
      return dataDays.length > 0;
    }

    function updateZones() {
      getCurrentWidgetType(vm.currentWidgetType);
      vm.allZones = new ZoneResource().query({
        orgId: vm.orgId,
        siteId: vm.siteId
      });
    }

    function addZone(zoneId) {
      if (vm.zoneIds.indexOf(zoneId) < 0) {
        vm.zoneIds.push(zoneId);
      }
    }

    function removeZone(zoneId) {
      var index;
      index = vm.zoneIds.indexOf(zoneId);
      vm.zoneIds.splice(index, 1);
      vm.sortedSelectedZones = vm.sortedSelectedZones.filter(function (zone) {
        return zone.id !== zoneId;
      });
      checkLocationDataAvailability();
    }

    function toggleZone(zoneId) {
      if (zoneIsSelected(zoneId)) {
        removeZone(zoneId);
      } else {
        addZone(zoneId);
      }
      vm.selectedAreas = vm.zoneIds;
    }

    function zoneIsSelected(zoneId) {
      return vm.zoneIds.indexOf(zoneId) >= 0;
    }

    function removeAllZones() {
      vm.zoneIds = [];
      vm.sortedSelectedZones = [];
      vm.selectedAreas = [];
    }

    function updateSelectedZones() {
      vm.selectedZones = getSelectedZones();
      checkLocationDataAvailability();
    }

    function getSelectedZones() {
      if (vm.zoneIds.length !== vm.sortedSelectedZones.length && vm.allZones.length > 0) {
        vm.zoneIds.forEach(function (zoneId) {
          var zoneIdToInt = parseInt(zoneId);
          var zone = _.findWhere(vm.sortedSelectedZones, { id: zoneIdToInt });
          if (typeof zone === 'undefined') {
            var result = vm.allZones.filter(function (zone) {
              return zone.id === zoneIdToInt;
            });

            if (result.length > 0) {
              vm.sortedSelectedZones.push(result[0]);
            }
          }
        });
      }

      if (typeof vm.selectedAreas === 'undefined') {
        vm.selectedAreas = vm.zoneIds;
      }

      return vm.sortedSelectedZones;
    }

    function importZones(copyFrom, copyTo) {
      if (copyFrom !== copyTo) {
        vm.setWidgetAreas({ copyFrom: copyFrom, copyTo: copyTo });
        $timeout(function () {
          vm.sortedSelectedZones = [];
          getSelectedZones();
          loadZones();
        }, 200);
      }
    }

    function loadZones() {
      vm.zoneIds = [];
      vm.sortedSelectedZones = [];
      angular.forEach(vm.selectedAreas, function (area) {
        addZone(area);
      });
    }

    function getCurrentWidgetType(widgetType) {
      angular.forEach(vm.availableWidgets, function (widget) {
        if (widget.type === widgetType) {
          vm.currentWidgetLocations = widget.locationsType;
        }
      });
    }

    function getNumberOfSameTypeWidgets() {
      return vm.availableWidgets.filter(function (widget) {
        if (widget.locationsType === vm.currentWidgetLocations && widget.type !== vm.currentWidgetType) {
          return widget;
        }
      });
    }

  }
})();
