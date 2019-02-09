(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('simpleComparisonWidgetBody', simpleComparisonWidgetBody);

  function simpleComparisonWidgetBody() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/comparison-widgets/simple-comparison-widget-body.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationIds: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        currentWidgetType: '@',
        availableWidgets: '=?',
        dateFormatMask: '=',
        numberFormatName: '=',
        selectedAreas: '=?',
        setWidgetAreas: '&',
        kpi: '@',
        selectableLocationTypes: '=',
        selectButtonVisibility: '=',
        isLoading: '=?',
        language: '='
      },
      controller: SimpleComparisonWidgetBodyController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  SimpleComparisonWidgetBodyController.$inject = [
    '$q',
    '$scope',
    '$filter',
    'LocationResource',
    'comparisonWidgetData',
    '$translate',
    'ObjectUtils'
  ];

  function SimpleComparisonWidgetBodyController(
    $q,
    $scope,
    $filter,
    LocationResource,
    comparisonWidgetData,
    $translate,
    ObjectUtils
  ) {
    var vm = this;
    var deferredFetch;

    vm.locations = [];
    vm.locationNames = [];
    vm.data = [];

    vm.formatValue = formatValue;
    activate();

    function activate() {
      loadTranslations();

      if (!angular.isDefined(vm.type)) {
        vm.type = 'interior';
      }

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId'
      ], updateLocations);

      $scope.$watchCollection('vm.locationIds', updateLocations);
      $scope.$watch('vm.locations', updateLocationNames, true);

      deferredFetch = $q.defer();
      deferredFetch.resolve(vm.data);

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId',
        'vm.dateRangeStart',
        'vm.dateRangeEnd'
      ], updateKPIData);
      $scope.$watchCollection('vm.locationIds', updateKPIData);
    }

    function loadTranslations() {
      $translate.use(vm.language);
    }

    function updateLocations() {
      vm.locations = vm.locationIds.map(function (locationId) {
        return LocationResource.get({
          orgId: vm.orgId,
          siteId: vm.siteId,
          locationId: locationId
        });
      });
    }

    function updateLocationNames() {
      vm.locationNames = _(vm.locations).pluck('description');
    }

    function updateKPIData() {
      vm.isLoading = true;
      deferredFetch.reject();
      deferredFetch = $q.defer();

      var newData = fetchKPIData(vm.locationIds);
      var queries = _(newData).pluck('promise');
      $q.all(queries).then(function () {
        deferredFetch.resolve(newData);
      });

      deferredFetch.promise.then(function () {
        vm.data = newData;
        vm.noData = true;
        _.each(vm.data, function(locationData) {
          if(!ObjectUtils.isNullOrUndefinedOrEmpty(locationData) && !allDaysAreUndefined(locationData)) {
            vm.noData = false;
          }
        });
        vm.isLoading = false;
        vm.requestFailed = false;
      });
    }

    function allDaysAreUndefined(locationData) {
      var allUndefined = true;
      _.each(locationData, function(data) {
        if(data.value !== null) {
          allUndefined = false;
        }
      });
      return allUndefined;
    }

    function fetchKPIData(locationIds) {
      return locationIds.map(function (locationId) {
        return comparisonWidgetData.fetchKPI(vm.kpi, {
          orgId: vm.orgId,
          siteId: vm.siteId,
          locationId: locationId,
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
