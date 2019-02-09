(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('entranceContributionWidget', entranceContributionWidget);

  function entranceContributionWidget() {
    return {
      templateUrl: 'components/widgets/entrance-contribution-widget/entrance-contribution-widget.partial.html',
      scope: {
        orgId:                  '=',
        siteId:                 '=',
        zoneId:                 '=?',
        dateRangeStart:         '=',
        dateRangeEnd:           '=',
        compareRange1Start:     '=',
        compareRange1End:       '=',
        compareRange1Type:      '=',
        compareRange2Start:     '=',
        compareRange2End:       '=',
        compareRange2Type:      '=',
        currentOrganization:    '=',
        currentUser:            '=',
        firstDayOfWeekSetting:  '=',
        operatingHours:         '=',
        language:               '=',
        hideExportIcon:         '=',
        onExportClick:          '&',
        exportIsDisabled:       '=?',
        summaryKey:             '@',
        sortType:               '=?',
        filterQuery:            '=?',
        activeSortType:         '=?',
        activeFilterQuery:      '=?',
        siteZones:              '=?',
        setSelectedWidget:      '&',
        isLoading:              '=?',
        orgMetrics:             '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: EntranceContributionWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  EntranceContributionWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    'requestManager',
    '$q',
    'apiUrl',
    'SiteResource',
    '$filter',
    'LocalizationService',
    'ObjectUtils',
    'utils',
    'metricConstants'
  ];

  function EntranceContributionWidgetController(
    $scope,
    $rootScope,
    $state,
    requestManager,
    $q,
    apiUrl,
    SiteResource,
    $filter,
    LocalizationService,
    ObjectUtils,
    utils,
    metricConstants
  ) {
    var vm = this; // 'vm' stands for 'view model'
    var localMetricConstants;

    vm.entranceItems = [];
    vm.isLoading = false;
    vm.requestFailed = false;
    vm.showAllEntrances = true;
    vm.displayPercentageChangeLabel = displayPercentageChangeLabel;
    vm.calculateTrafficChange = calculateTrafficChange;

    vm.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
    vm.compareRangeIsPriorYear = compareRangeIsPriorYear;

    vm.getEntranceHref = getEntranceHref;

    vm.orderBy = orderBy;
    vm.chartOptions = {
      donut: true,
      labelOffset: 40,
      labelDirection: 'explode',
      chartPadding: 100,
      donutWidth: 40,
      labelOverflow: false
    };
    vm.chartData = {
      series: [],
      labels: []
    };
    vm.sortType = '-traffic';

    activate();

    function activate() {
     
      setMetricsConstants();
      setTrafficDisplayName();
     
      $scope.$watchGroup([
        'vm.orgId',
        'vm.siteId',
        'vm.dateRangeStart',
        'vm.dateRangeEnd'
      ], fetchData);

      $scope.$watch('vm.filterEntrances', function() {
        vm.filterQuery = vm.filterEntrances;
      });

      if(vm.activeFilterQuery !== undefined) {
        vm.filterEntrances = vm.activeFilterQuery;
      }

      if(vm.activeSortType !== undefined) {
        vm.sortType = vm.activeSortType;
      }

      vm.compare1Period = {
        start: vm.compareRange1Start,
        end: vm.compareRange1End
      };

      vm.compare2Period = {
        start: vm.compareRange2Start,
        end: vm.compareRange2End
      };
      if($rootScope.pdf) loadForPdfComplete();
      setNumberFormatName();
    }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations 
   */
  function setMetricsConstants() {
    localMetricConstants = angular.copy(metricConstants);

    if(!_.isUndefined(vm.orgMetrics)) {
      localMetricConstants.metrics = vm.orgMetrics;
    }
  }

    function setTrafficDisplayName() {
      var traffic = _.findWhere(localMetricConstants.metrics, {value: 'traffic'});
      
      if(!_.isUndefined(traffic)) {
        vm.trafficDisplayName = traffic.displayName
      }
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      vm.loadRun = 0;
      vm.isLoading = true;
      $scope.$watch('vm.isLoading',
        function () {
          if (!vm.isLoading && vm.loadRun < 1) {
            $rootScope.pdfExportsLoaded += 1;
            vm.loadRun += 1;
          }
        }
      );
    }

    function setNumberFormatName() {
      var currentUser = vm.currentUser;
      var currentOrganization = vm.currentOrganization;
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
    }

    function fetchData() {
      var selectedZoneId;
      vm.isLoading = true;

      fetchSite().then(function (site) {

        if (angular.isDefined(vm.zoneId)) {
          selectedZoneId = vm.zoneId;
        } else {
          selectedZoneId = site.total_property_zone_id;
          vm.zoneId = selectedZoneId;
        }

        vm.siteZones = site.zones;

          $q.all([
            fetchReportData(selectedZoneId),
            fetchComparisonData(selectedZoneId),
            fetchComparisonYearData(selectedZoneId),
            fetchTmpData()
          ])
            .then(updateScopeWithResponseData)
            .catch(showError);

      });
    }

    function fetchSite() {
      return SiteResource.get({
        orgId: vm.orgId,
        siteId: vm.siteId
      }).$promise;
    }

    function getEntranceHref(entrance) {
      var params = $state.params;
      params.entranceId = entrance.id;
      params.zoneId = entrance.zoneId;
      return $state.href('analytics.organization.site.entrance', params);
    }

    function fetchReportData(selectedZoneId) {
      var requestParams = {
        orgId:           vm.orgId,
        siteId:          vm.siteId,
        zoneId:          selectedZoneId,
        reportStartDate: utils.getDateStringForRequest(vm.dateRangeStart),
        reportEndDate:   utils.getDateStringForRequest(vm.dateRangeEnd),
        groupBy:         'aggregate',
        countType:       'enters'
      };

      if (angular.isDefined(vm.operatingHours)) {
        requestParams.operatingHours = vm.operatingHours;
      }

      return requestManager.get(apiUrl + '/kpis/traffic/entrances', { params: requestParams });
    }

    function fetchComparisonData(selectedZoneId) {
      var requestParams = {
        orgId:           vm.orgId,
        siteId:          vm.siteId,
        zoneId:          selectedZoneId,
        reportStartDate: utils.getDateStringForRequest(vm.compareRange1Start),
        reportEndDate:   utils.getDateStringForRequest(vm.compareRange1End),
        groupBy:         'aggregate',
        countType:       'enters'
      };

      if (angular.isDefined(vm.operatingHours)) {
        requestParams.operatingHours = vm.operatingHours;
      }

      return requestManager.get(apiUrl + '/kpis/traffic/entrances', { params: requestParams });
    }

    function fetchComparisonYearData(selectedZoneId) {
      var requestParams = {
        orgId:           vm.orgId,
        siteId:          vm.siteId,
        zoneId:          selectedZoneId,
        reportStartDate: utils.getDateStringForRequest(vm.compareRange2Start),
        reportEndDate:   utils.getDateStringForRequest(vm.compareRange2End),
        groupBy:         'aggregate',
        countType:       'enters'
      };

      if (angular.isDefined(vm.operatingHours)) {
        requestParams.operatingHours = vm.operatingHours;
      }

      return requestManager.get(apiUrl + '/kpis/traffic/entrances', { params: requestParams });
    }

    function dataNotValid(responses) {
      return ObjectUtils.isNullOrUndefinedOrEmpty(responses) || ObjectUtils.isNullOrUndefined(responses[0] || ObjectUtils.isNullOrUndefinedOrEmpty(responses[0].result));
    }

    function clearDataAndSetNoData() {
      vm.isLoading = false;
      vm.chartHasData = true;
      vm.totalTraffic = 0;
      vm.totalTrafficCompare = 0;
      vm.totalTrafficYearCompare = 0;
      vm.entranceItems = [];
      vm.chartData = [];
    }

    function updateScopeWithResponseData(responses) {
      if (dataNotValid(responses)) {
        return clearDataAndSetNoData();
      }

      var reportData = responses[0];
      var comparisonData = responses[1];
      var comparisonYearData = responses[2];

      var monitorPointIds = getUniqueMonitorPointIds(reportData.result.concat(comparisonData.result));

      var entranceItems = monitorPointIds.map(function(monitorPointId) {

        var traffic = calculateAggregateTraffic(monitorPointId, reportData.result);
        var trafficCompare = calculateAggregateTraffic(monitorPointId, comparisonData.result);
        var trafficYearCompare = calculateAggregateTraffic(monitorPointId, comparisonYearData.result);

        var change = calculateTrafficChange(trafficCompare,traffic);
        var changeYear = calculateTrafficChange(trafficYearCompare,traffic);

        return {
          id: monitorPointId,
          name: vm.tmpData[monitorPointId],
          traffic: traffic,
          trafficCompare: trafficCompare,
          trafficYearCompare: trafficYearCompare,
          change: change,
          changeYear: changeYear,
          zoneId: vm.zoneId
        };
      });

      entranceItems.sort(function(itemA, itemB) {
        return String(itemA.id).localeCompare(itemB.id);
      });

      entranceItems.forEach(function(item, index) {
        item.number = index + 1;
      });

      vm.totalTraffic = entranceItems.reduce(function(total, item) {
        return total + item.traffic;
      }, 0);

      vm.totalTrafficCompare = entranceItems.reduce(function(totalCompare, item) {
        return totalCompare + item.trafficCompare;
      }, 0);

      vm.totalTrafficYearCompare = entranceItems.reduce(function(totalYearCompare, item) {
        return totalYearCompare + item.trafficYearCompare;
      }, 0);

      if(vm.activeSortType !== undefined) {
        var desc;
        if(vm.activeSortType.substring(0,1)==='-') {
          desc = true;
        } else {
          desc = false;
        }
        entranceItems = $filter('orderBy')(entranceItems, vm.activeSortType, desc);
      }

      vm.entranceItems = entranceItems;
      vm.chartData = transformEntranceItemsToChartData(entranceItems, vm.totalTraffic);
      vm.isLoading = false;
    }

    function transformEntranceItemsToChartData(entranceItems, totalTraffic) {
      var chartData = {
        series: [],
        labels: []
      };

      entranceItems.forEach(function(entranceItem) {
        chartData.labels.push('Entrance ' + entranceItem.number + ': ' + Math.round(entranceItem.traffic / totalTraffic * 100) + '%');
        chartData.series.push(entranceItem.traffic);
      });

      return chartData;
    }

    function getUniqueMonitorPointIds(resultItems) {
      return resultItems.reduce(function(monitorPointIds, item) {
        if (monitorPointIds.indexOf(item.monitor_point_id) < 0) {
          monitorPointIds.push(item.monitor_point_id);
        }
        return monitorPointIds;
      }, []);
    }

    function calculateAggregateTraffic(monitorPointId, resultItems) {
      var itemsForMonitorPoint = resultItems.filter(function(item) {
        return item.monitor_point_id === monitorPointId;
      });

      return itemsForMonitorPoint.reduce(function(aggregateValue, item) {
        return aggregateValue + parseInt(item.total_traffic);
      }, 0);
    }

    function fetchTmpData() {
      var deferred = $q.defer();
      vm.tmpData = [];
      angular.forEach(vm.siteZones, function(zone) {
        angular.forEach(zone.tmps, function(tmp) {
          if(tmp.name !== null && tmp.name !== undefined && tmp.name.length > 0) {
            vm.tmpData[tmp.id] = tmp.name;
          }
        });
      });

      deferred.resolve();

      return vm.tmpData;
    }

    function displayPercentageChangeLabel(value, format) {
      
      if(value > 0) {
        value = '+' + $filter('formatNumber')(value, 1, format) + '%';
      } else {
        value = $filter('formatNumber')(value, 1, format) + '%';
      }
      return value;
    }

    function calculateTrafficChange(current, compare) {
      var change;
      if(current > 0) {
        change = compare / current * 100;
        change = (100 - change) * -1;
      } else if(current === 0 && compare > current) {
        change = 0; // most of the times, when current is null data is not available
      } else if(compare === 0 && current === 0) {
        change = 0;
      } else {
        change = -100;
      }
      return change;
    }

    function showError() {
      vm.requestFailed = true;
      vm.isLoading = false;
    }

    function orderBy(column) {
      if(vm.sortType === '-'+column) {
        vm.sortType = '+'+column;
      } else {
        vm.sortType = '-'+column;
      }

    }

    function compareRangeIsPriorPeriod(comparePeriodType) {
      if(comparePeriodType === 'prior_period') {
        return true;
      } else {
        return false;
      }
    }

    function compareRangeIsPriorYear(comparePeriodType) {
      if(comparePeriodType === 'prior_year') {
        return true;
      } else {
        return false;
      }
    }

  }
})();
