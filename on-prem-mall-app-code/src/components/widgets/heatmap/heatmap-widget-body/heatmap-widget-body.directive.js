(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('heatmapWidgetBody', heatmapWidgetBody);

  function heatmapWidgetBody() {
    return {
      templateUrl: 'components/widgets/heatmap/heatmap-widget-body/heatmap-widget-body.partial.html',
      scope: {
        orgId:           '=orgId',
        siteId:          '=siteId',
        locationId:      '=?locationId',
        // Fetch percentages for these location types only. Must
        // be one of the types supported by the API endpoints.
        locationTypes:   '=locationTypes',
        dateRangeStart:  '=dateRangeStart',
        dateRangeEnd:    '=dateRangeEnd',
        onLocationClick: '=?onLocationClick',
        kpi:             '@',
        language:        '@',
        widgetTitle:     '=?',
        hideLocationList: '=?hideLocationList',
        floorNum:         '=?floor',
        formatValue:     '&valueFormat',
        isLoadingHeatmapValues:  '=?'
      },
      controller: HeatmapWidgetBodyController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  HeatmapWidgetBodyController.$inject = [
    '$scope',
    '$rootScope',
    'LocationResource',
    'multiLocationKPIFetcher',
    'utils'
  ];

  function HeatmapWidgetBodyController(
    $scope,
    $rootScope,
    LocationResource,
    multiLocationKPIFetcher,
    utils
  ) {
    var vm = this;

    vm.isLoadingHeatmapValues = true;
    vm.locationRequestFailed = false;
    vm.heatmapValueRequestFailed = false;

    vm.getCurrentLocation = getCurrentLocation;
    vm.locationHasHeatmapValue = locationHasHeatmapValue;
    vm.isClickable = isClickable;
    vm.heatmapValues = {};

    vm.translationKpi = toUnderscoreCase(vm.kpi);

    activate();

    function activate() {
      if($rootScope.pdf) loadForPdfComplete();
      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId'
      ], function() {
        fetchLocations().then(function(locations) {
          vm.locationRequestFailed = false;
          vm.locations = locations;
        }).catch(function() {
          vm.locationRequestFailed = true;
        });
      });

      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId',
        'vm.locationId',
        'vm.locationTypes',
        'vm.dateRangeStart',
        'vm.dateRangeEnd'
      ], function() {
        vm.isLoadingHeatmapValues = true;
        vm.heatmapValueRequestFailed = false;

        fetchValues().then(function(values) {
          vm.heatmapValues = values;
          vm.isLoadingHeatmapValues = false;
        }).catch(function() {
          vm.heatmapValueRequestFailed = true;
          vm.isLoadingHeatmapValues = false;
        });
      });
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      vm.loadRun = 0;
      $scope.$watch('vm.isLoadingHeatmapValues',
        function () {
          if (!vm.isLoadingHeatmapValues && vm.loadRun < 1) {
            vm.loadRun += 1; //stops this function runing more than once, otherwise the PDF renders before other widgets are ready
            $rootScope.pdfExportsLoaded += 1;
          }
        }
      );
    }

    function fetchLocations() {
      return LocationResource.query({
        orgId: vm.orgId,
        siteId: vm.siteId
      }).$promise;
    }

    function fetchValues() {
      var params = {
        orgId:           vm.orgId,
        siteId:          vm.siteId,
        reportStartDate: utils.getDateStringForRequest(vm.dateRangeStart),
        reportEndDate:   utils.getDateStringForRequest(vm.dateRangeEnd),
        locationType:    vm.locationTypes
      };
      if (vm.locationId) {
        params.locationId = vm.locationId;
      }
      var data = multiLocationKPIFetcher.fetchAggregate(vm.kpi, params);
      return data.promise;
    }

    function getCurrentLocation() {
      return _(vm.locations).findWhere({ location_id: vm.locationId });
    }

    function locationHasHeatmapValue(location) {
      return !!vm.heatmapValues[location.location_id];
    }

    function isClickable() {
      return !!vm.onLocationClick;
    }

    function toUnderscoreCase(string) {
      return string.replace(/([A-Z])/g, function($1){return '_'+$1.toLowerCase();});
    }
  }
})();
