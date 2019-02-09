(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('simplePerimeterComparisonWidgetBody', simplePerimeterComparisonWidgetBody);

  function simplePerimeterComparisonWidgetBody() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/simple-perimeter-comparison-widget-body.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        zoneIds: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        dateFormatMask: '=',
        numberFormatName: '=',
        currentWidgetType: '@',
        availableWidgets: '=?',
        selectedAreas: '=?',
        setWidgetAreas: '&',
        kpi: '@',
        selectableZoneTypes: '=',
        selectButtonVisibility: '=',
        language: '='
      },
      controller: SimpleComparisonPerimeterWidgetBodyController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  SimpleComparisonPerimeterWidgetBodyController.$inject = [
    '$q',
    '$scope',
    '$filter',
    'ZoneResource',
    'comparisonWidgetData',
    'ObjectUtils'
  ];

  function SimpleComparisonPerimeterWidgetBodyController(
    $q,
    $scope,
    $filter,
    ZoneResource,
    comparisonWidgetData,
    ObjectUtils
  ) {
    var vm = this;
    var deferredFetch;

    vm.zones = [];
    vm.zoneNames = [];
    vm.data = [];

    vm.formatValue = formatValue;
    activate();

    function activate() {

      if (vm.zoneIds === undefined) {
        vm.zoneIds = [];
      }

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId'
      ], updateZones);

      $scope.$watchCollection('vm.zoneIds', updateZones);
      $scope.$watch('vm.zones', updateZoneNames, true);

      deferredFetch = $q.defer();
      deferredFetch.resolve(vm.data);

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId',
        'vm.dateRangeStart',
        'vm.dateRangeEnd'
      ], updateKPIData);
      $scope.$watchCollection('vm.zoneIds', updateKPIData);
    }

    function updateZones() {
      vm.zones = vm.zoneIds.map(function (zoneId) {
        return new ZoneResource().get({
          orgId: vm.orgId,
          siteId: vm.siteId,
          zoneId: zoneId
        });
      });
    }

    function updateZoneNames() {
      vm.zoneNames = _(vm.zones).pluck('name');
    }

    function updateKPIData() {
      vm.isLoading = true;
      deferredFetch.reject();
      deferredFetch = $q.defer();

      var newData = fetchKPIData(vm.zoneIds);
      var queries = _(newData).pluck('promise');
      $q.all(queries).then(function () {
        deferredFetch.resolve(newData);
      });

      deferredFetch.promise.then(function () {
        vm.data = newData;
        vm.noData = true;
        _.each(vm.data, function(zoneData) {
          if(!ObjectUtils.isNullOrUndefinedOrEmpty(zoneData)) {
            vm.noData = false;
          }
        });
        vm.isLoading = false;
        vm.requestFailed = false;
      });
    }

    function fetchKPIData(zoneIds) {
      return zoneIds.map(function (zoneId) {
        return comparisonWidgetData.fetchKPI(vm.kpi, {
          orgId: vm.orgId,
          siteId: vm.siteId,
          zoneId: zoneId,
          dateRangeStart: vm.dateRangeStart,
          dateRangeEnd: vm.dateRangeEnd
        });
      });
    }

    function formatValue(value) {
      return $filter('formatKPI')(value, vm.kpi, false, vm.numberFormatName);
    }

    vm.passWidgetAreas = passWidgetAreas;
    function passWidgetAreas(copyFrom, copyTo) {
      vm.setWidgetAreas({ copyFrom: copyFrom, copyTo: copyTo });
    }

  }
})();
