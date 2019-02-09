(function() {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('trafficContributionTableWidget', trafficContributionTableWidget);

  function trafficContributionTableWidget() {
    return {
      templateUrl: 'components/widgets/table-widget/traffic-contribution-table-widget/traffic-contribution-table-widget.partial.html',
      scope: {
        orgId:                  '=',
        siteId:                 '=?',
        site:                   '=',
        zoneId:                 '=',
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
        hideExportIcon:         '=',
        onExportClick:          '&',
        exportIsDisabled:       '=?',
        summaryKey:             '@',
        widgetIcon:             '=',
        filterType:             '@',
        zoneFilterQuery:        '=',
        activeFilterQuery:      '=',
        activeSortType:         '=?',
        language:               '=',
        kpi:                    '@',
        childProperty:          '=?',
        comparisonColumnIndex:  '=?',
        sortType:               '=?',
        isLoading:              '=?',
        setSelectedWidget:      '&',
        orgMetrics:             '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: trafficContributionTableWidgetController,
      controllerAs: 'trafficTableWidget',
      bindToController: true
    };
  }


  trafficContributionTableWidgetController.$inject = [
    '$scope',
    '$rootScope',
    'requestManager',
    '$q',
    'apiUrl',
    'SiteResource',
    '$filter',
    'utils',
    'LocalizationService',
    '$translate',
    'ObjectUtils',
    'comparisonsHelper',
    'metricConstants'
  ];

  function trafficContributionTableWidgetController(
    $scope,
    $rootScope,
    requestManager,
    $q,
    apiUrl,
    SiteResource,
    $filter,
    utils,
    LocalizationService,
    $translate,
    ObjectUtils,
    comparisonsHelper,
    metricConstants
  ) {
    var trafficTableWidget = this;
    var currentUser = trafficTableWidget.currentUser;
    var currentOrganization = trafficTableWidget.currentOrganization;
    var localMetricConstants;

    trafficTableWidget.items = [];
    trafficTableWidget.itemIds = [];
    trafficTableWidget.itemTypes = [];
    trafficTableWidget.isLoading = false;
    trafficTableWidget.requestFailed = false;
    trafficTableWidget.showAllItems = false;

    trafficTableWidget.orderBy = orderBy;
    trafficTableWidget.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
    trafficTableWidget.compareRangeIsPriorYear = compareRangeIsPriorYear;
    trafficTableWidget.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
    trafficTableWidget.displayPercentageChangeLabelfortrafficContribution = displayPercentageChangeLabelfortrafficContribution;

    trafficTableWidget.compare1Period = {
      start: trafficTableWidget.compareRange1Start,
      end: trafficTableWidget.compareRange1End
    };

    trafficTableWidget.compare2Period = {
      start: trafficTableWidget.compareRange2Start,
      end: trafficTableWidget.compareRange2End
    };

    activate();

    function activate() {
      setMetricsConstants();
      setTrafficDisplayName();

      if(!ObjectUtils.isNullOrUndefined(trafficTableWidget.activeSortType)) {
        trafficTableWidget.sortType = trafficTableWidget.activeSortType;
      }

      $scope.$watchGroup([
        'trafficTableWidget.orgId',
        'trafficTableWidget.siteId',
        'trafficTableWidget.dateRangeStart',
        'trafficTableWidget.dateRangeEnd'
      ], fetchData);

      $scope.$watch('trafficTableWidget.filterItems', function() {
        trafficTableWidget.zoneFilterQuery = trafficTableWidget.filterItems;
      });

      if(!ObjectUtils.isNullOrUndefined(trafficTableWidget.activeFilterQuery)) {
        trafficTableWidget.filterItems = trafficTableWidget.activeFilterQuery;
      }
      if($rootScope.pdf) loadForPdfComplete();
    }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations 
   */
    function setMetricsConstants() {
      localMetricConstants = angular.copy(metricConstants);

      if(!_.isUndefined(trafficTableWidget.orgMetrics)) {
        localMetricConstants.metrics = trafficTableWidget.orgMetrics;
      }
    }

    function setTrafficDisplayName() {
      var traffic = _.findWhere(localMetricConstants.metrics, {value: 'traffic'});
      
      if(!_.isUndefined(traffic)) {
        $scope.trafficDisplayName = traffic.displayName
      }
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      trafficTableWidget.loadRun = 0;
      trafficTableWidget.isLoading = true;
      $scope.$watch('trafficTableWidget.isLoading',
        function () {
          if (!trafficTableWidget.isLoading && trafficTableWidget.loadRun < 1) {
            $rootScope.pdfExportsLoaded += 1;
            trafficTableWidget.loadRun += 1;
          }
        }
      );
    }

    function fetchSite() {
      return SiteResource.get({
        orgId: trafficTableWidget.orgId,
        siteId: trafficTableWidget.siteId
      }).$promise;
    }

    function fetchData() {
    trafficTableWidget.isLoading = true;

      if (!angular.isDefined(trafficTableWidget.site)) {
        fetchSite().then(function(site) {

          var items = [];
          trafficTableWidget.siteZones = site.zones;

          for (var i = 0; i < site.zones.length; i++) {
            var zone = site.zones[i];
            if(zone.type===trafficTableWidget.filterType || (!angular.isDefined(trafficTableWidget.filterType) && zone.type !== 'TotalProp')) {
              items.push(zone.id);
              trafficTableWidget.itemTypes[zone.id] = zone.type;
            } else if(trafficTableWidget.filterType === 'Others' && zone.type !== 'Entrance' && zone.type !== 'TenantCommon' && zone.type !== 'TotalProp') {
              items.push(zone.id);
              trafficTableWidget.itemTypes[zone.id] = zone.type;
            }
          }

          trafficTableWidget.itemIds = items;

          $q.all([
            fetchReportData(items),
            fetchComparisonData(items, trafficTableWidget.compare1Period),
            fetchComparisonData(items, trafficTableWidget.compare2Period)
          ])
            .then(updateScopeWithResponseData)
            .then(function() {
              if(ObjectUtils.isNullOrUndefined(trafficTableWidget.sortType)) {
                trafficTableWidget.sortType = '-traffic';
              }
            })
            .catch(showError);

        });

      } else {
        trafficTableWidget.siteId = trafficTableWidget.site.site_id;

        var items = [];
        trafficTableWidget.siteZones = trafficTableWidget.site.zones;

        for (var i = 0; i < trafficTableWidget.site.zones.length; i++) {
          var zone = trafficTableWidget.site.zones[i];

          if( zone.type === trafficTableWidget.filterType || (!angular.isDefined(trafficTableWidget.filterType) && zone.type !== 'TotalProp')) {
            items.push(zone.id);
            trafficTableWidget.itemTypes[zone.id] = zone.type;
          } else if(trafficTableWidget.filterType === 'Others' && zone.type !== 'Entrance' && zone.type !== 'TenantCommon' && zone.type !== 'TotalProp') {
            items.push(zone.id);
            trafficTableWidget.itemTypes[zone.id] = zone.type;
          }
        }

        trafficTableWidget.itemIds = items;

        $q.all([
          fetchReportData(items),
          fetchComparisonData(items, trafficTableWidget.compare1Period),
          fetchComparisonData(items, trafficTableWidget.compare2Period)
        ])
          .then(updateScopeWithResponseData)
          .then(function() {
            if(ObjectUtils.isNullOrUndefined(trafficTableWidget.sortType)) {
              trafficTableWidget.sortType = '-traffic';
            }
          })
          .catch(showError);

      }

    }

    function fetchReportData(zones) {
      var requestParams = {
        orgId:           trafficTableWidget.orgId,
        siteId:          trafficTableWidget.siteId,
        zoneId:          zones,
        reportStartDate: utils.getDateStringForRequest(trafficTableWidget.dateRangeStart),
        reportEndDate:   utils.getDateStringForRequest(trafficTableWidget.dateRangeEnd),
        countType:       'enters'
      };

      if (angular.isDefined(trafficTableWidget.operatingHours)) {
        requestParams.operatingHours = trafficTableWidget.operatingHours;
      }

      return requestManager.get(apiUrl + '/kpis/traffic', { params: requestParams });
    }

    function fetchComparisonData(zones, range) {
      var requestParams = {
        orgId:           trafficTableWidget.orgId,
        siteId:          trafficTableWidget.siteId,
        zoneId:          zones,
        reportStartDate: utils.getDateStringForRequest(range.start),
        reportEndDate:   utils.getDateStringForRequest(range.end),
        countType:       'enters'
      };

      if (angular.isDefined(trafficTableWidget.operatingHours)) {
        requestParams.operatingHours = trafficTableWidget.operatingHours;
      }

      return requestManager.get(apiUrl + '/kpis/traffic', { params: requestParams });
    }

    function responseNotValid(responses) {
      return ObjectUtils.isNullOrUndefinedOrEmpty(responses) ||
        ObjectUtils.isNullOrUndefined(responses[0]) ||
        ObjectUtils.isNullOrUndefined(responses[0].result);
    }

    function updateScopeWithResponseData(responses) {
      if (responseNotValid(responses)) {
        trafficTableWidget.items = [];
        trafficTableWidget.isLoading = false;
        return;
      }

      var reportData = responses[0];
      var comparisonData1 = responses[1];
      var comparisonData2 = responses[2];

      var items = trafficTableWidget.itemIds.map(function(zoneId) {
        var traffic = calculateAggregateTraffic(zoneId, reportData.result);
        var trafficCompare1 = calculateAggregateTraffic(zoneId, comparisonData1.result);
        var trafficCompare2 = calculateAggregateTraffic(zoneId, comparisonData2.result);

        var totals = [];
        totals.push(trafficCompare1);
        totals.push(trafficCompare2);

        var comparisons = [];
        comparisons.push(comparisonsHelper.getComparisonData(traffic, trafficCompare1, true));
        comparisons.push(comparisonsHelper.getComparisonData(traffic, trafficCompare2, true));

        return {
          id: zoneId,
          type: trafficTableWidget.itemTypes[zoneId],
          name: getZoneNameById(zoneId),
          traffic: traffic,
          totals: totals,
          comparisons: comparisons
        };
      });

      items.sort(function(itemA, itemB) {
        return String(itemA.id).localeCompare(itemB.id);
      });

      items.forEach(function(item, index) {
        item.number = index + 1;
      });

      if(!ObjectUtils.isNullOrUndefined(trafficTableWidget.activeSortType)) {
        items = $filter('orderBy')(items, trafficTableWidget.activeSortType);
      }

      trafficTableWidget.items = items;
      trafficTableWidget.isLoading = false;
    }

    function displayPercentageChangeLabelfortrafficContribution(value, format) {
      
      if(value > 0) {
        value = '+' + $filter('formatNumber')(value, 1, format);
      } else if(value === '0.0%'){
        value = $filter('formatNumber')(value, 1, format);
      }
      else {
        value = $filter('formatNumber')(value, 1, format);
      }
      return value;
    }

    function calculateAggregateTraffic(zoneId, resultItems) {
      var itemsForZone = resultItems.filter(function(item) {
        return item.zone_id === zoneId;
      });

      return itemsForZone.reduce(function(aggregateValue, item) {
        return aggregateValue + parseInt(item.total_traffic);
      }, 0);
    }

    function getZoneNameById(zoneId) {
      var found = $filter('filter')(trafficTableWidget.siteZones, {id: zoneId}, true);
      var name;

      if(trafficTableWidget.orgId === 6255) {
        if(found[0].name.substring(0,1)==='x') {
          name = found[0].name.substring(1);
        } else {
          name = found[0].name;
        }
      } else {
        name = found[0].name;
      }

      return name;
    }

    function showError() {
      trafficTableWidget.requestFailed = true;
      trafficTableWidget.isLoading = false;
    }

    function orderBy(column, index, childProperty) {
      trafficTableWidget.childProperty = childProperty;
      trafficTableWidget.comparisonColumnIndex = index;
      if (trafficTableWidget.sortType === '-' + column) {
        trafficTableWidget.sortType = column;
      } else {
        trafficTableWidget.sortType = '-' + column;
      }
    }

    function compareRangeIsPriorPeriod(comparePeriodType) {
      return comparePeriodType === 'prior_period';
    }

    function compareRangeIsPriorYear(comparePeriodType) {
      return comparePeriodType === 'prior_year';
    }
  }
})();
