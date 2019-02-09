(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('salesSummaryTableWidget', salesSummaryTableWidget);

  function salesSummaryTableWidget() {
    return {
      templateUrl: 'components/widgets/table-widget/sales-summary-table-widget/sales-summary-table-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=?',
        site: '=',
        zoneId: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        compareRange1Start: '=',
        compareRange1End: '=',
        compareRange1Type: '=',
        compareRange2Start: '=',
        compareRange2End: '=',
        compareRange2Type: '=',
        currentUser: '=',
        currentOrganization: '=',
        firstDayOfWeekSetting: '=',
        hideExportIcon: '=',
        onExportClick: '&',
        exportIsDisabled: '=?',
        summaryKey: '@',
        widgetTitle: '@',
        widgetIcon: '@',
        zoneFilterQuery: '=',
        orderBy: '=?',
        activeSortType: '=',
        activeFilterQuery: '=',
        returnKey: '@',
        returnDataPrecision: '=?',
        language: '=',
        kpi: '@',
        currencySymbol: '=?',
        setSelectedWidget: '&', // Custom Dashboards
        currentView: '=?',
        isLoading: '=?'
      },
      controller: salesSummaryTableWidgetController,
      controllerAs: 'salesSummaryTableWidget',
      bindToController: true
    };
  }


  salesSummaryTableWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$translate',
    '$q',
    '$filter',
    '$state',
    'requestManager',
    'apiUrl',
    'SiteResource',
    'metricConstants',
    'LocalizationService',
    'comparisonsHelper',
    'ObjectUtils',
    'utils'
  ];

  function salesSummaryTableWidgetController(
    $scope,
    $rootScope,
    $translate,
    $q,
    $filter,
    $state,
    requestManager,
    apiUrl,
    SiteResource,
    metricConstants,
    LocalizationService,
    comparisonsHelper,
    ObjectUtils,
    utils
  ) {
    var salesSummaryTableWidget = this;
    var currentUser = this.currentUser;
    var currentOrganization = this.currentOrganization;

    salesSummaryTableWidget.items = [];
    salesSummaryTableWidget.itemIds = [];
    salesSummaryTableWidget.itemTypes = [];
    salesSummaryTableWidget.isLoading = false;
    salesSummaryTableWidget.requestFailed = false;
    salesSummaryTableWidget.showAllItems = false;
    salesSummaryTableWidget.doOrderBy = doOrderBy;
    salesSummaryTableWidget.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
    salesSummaryTableWidget.compareRangeIsPriorYear = compareRangeIsPriorYear;
    salesSummaryTableWidget.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
    salesSummaryTableWidget.sortColumnIndex = 0;
    salesSummaryTableWidget.sortChildColumn = 'value';
    salesSummaryTableWidget.isLoading = true;
    salesSummaryTableWidget.displayPercentageChangeLabelforSalesSummarytable = displayPercentageChangeLabelforSalesSummarytable;

    salesSummaryTableWidget.comparePeriods = [];
    salesSummaryTableWidget.comparePeriods.push({
      start: salesSummaryTableWidget.compareRange1Start,
      end: salesSummaryTableWidget.compareRange1End,
      type: salesSummaryTableWidget.compareRange1Type
    });

    salesSummaryTableWidget.comparePeriods.push({
      start: salesSummaryTableWidget.compareRange2Start,
      end: salesSummaryTableWidget.compareRange2End,
      type: salesSummaryTableWidget.compareRange2Type
    });


    activate();

    salesSummaryTableWidget.currentView = $state.current.name;

    if (!salesSummaryTableWidget.returnDataPrecision) {
      salesSummaryTableWidget.returnDataPrecision = 0;
    }

    function activate() {
      setKpiDisplayName();

      if(ObjectUtils.isNullOrUndefined(salesSummaryTableWidget.currentView)) {
        salesSummaryTableWidget.currentView = $state.current.name;
      }

      $scope.$watchGroup([
        'salesSummaryTableWidget.orgId',
        'salesSummaryTableWidget.siteId',
        'salesSummaryTableWidget.dateRangeStart',
        'salesSummaryTableWidget.dateRangeEnd'
      ], fetchData);

      $scope.$watch('salesSummaryTableWidget.filterItems', function () {
        salesSummaryTableWidget.zoneFilterQuery = salesSummaryTableWidget.filterItems;
      });

      if (salesSummaryTableWidget.activeFilterQuery !== undefined) {
        salesSummaryTableWidget.filterItems = salesSummaryTableWidget.activeFilterQuery;
      }

      if (salesSummaryTableWidget.activeSortType !== undefined) {
        salesSummaryTableWidget.orderBy = salesSummaryTableWidget.activeSortType;
      } else {
        salesSummaryTableWidget.orderBy = '-periodValues';
      }

      if($rootScope.pdf) loadForPdfComplete();
    }

    function setKpiDisplayName() {
      var kpiValue = getKpiKey(salesSummaryTableWidget.kpi);

      if(salesSummaryTableWidget.kpi === 'tenant_sales') {
        kpiValue = ['sales'];
      }

      if(kpiValue.length === 0) {
        return setKpiDisplayNameFromTranslation();
      }

      var metric = _.findWhere(metricConstants.metrics, {value: kpiValue[0]});

      if(_.isUndefined(metric)) {
        return setKpiDisplayNameFromTranslation();
      }

      salesSummaryTableWidget.kpiDisplayName = metric.displayName;
    }

    function setKpiDisplayNameFromTranslation() {
      var transkey = 'kpis.shortKpiTitles.';
        $translate(transkey).then(function(translation) {
          salesSummaryTableWidget.kpiDisplayName = translation;
        });
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      salesSummaryTableWidget.loadRun = 0;
      salesSummaryTableWidget.isLoading = true;
      $scope.$watch('salesSummaryTableWidget.isLoading',
        function () {
          if (!salesSummaryTableWidget.isLoading && salesSummaryTableWidget.loadRun < 1) {
            $rootScope.pdfExportsLoaded += 1;
            salesSummaryTableWidget.loadRun += 1;
          }
        }
      );
    }

    function fetchSite() {
      return SiteResource.get({
        orgId: salesSummaryTableWidget.orgId,
        siteId: salesSummaryTableWidget.siteId
      }).$promise;
    }

    function fetchData() {

      salesSummaryTableWidget.isLoading = true;

      if (!angular.isDefined(salesSummaryTableWidget.site)) {

        fetchSite().then(function (site) {

          var items = [];
          salesSummaryTableWidget.siteZones = site.zones;

          for (var i = 0; i < site.zones.length; i++) {
            var zone = site.zones[i];
            if (zone.type === 'TenantCommon') {
              items.push(zone.id);
              salesSummaryTableWidget.itemTypes[zone.id] = zone.type;
            }
          }

          salesSummaryTableWidget.itemIds = items;

          var promises = [];
          var currentDateRange = {
            start: salesSummaryTableWidget.dateRangeStart,
            end: salesSummaryTableWidget.dateRangeEnd
          };

          promises.push(fetchApiData(items, currentDateRange));

          salesSummaryTableWidget.comparePeriods.forEach(function (range) {
            promises.push(fetchApiData(items, range));
          });

          $q.all(promises).then(updateScopeWithResponseData).catch(showError);
        });

      } else {

        var items = [];

        var siteZones = salesSummaryTableWidget.site.zones;

        for (var i = 0; i < siteZones.length; i++) {
          var zone = siteZones[i];
          if (zone.type === 'TenantCommon') {
            items.push(zone.id);
            salesSummaryTableWidget.itemTypes[zone.id] = zone.type;
          }
        }

        salesSummaryTableWidget.itemIds = items;

        var promises = [];
        var currentDateRange = {
          start: salesSummaryTableWidget.dateRangeStart,
          end: salesSummaryTableWidget.dateRangeEnd
        };

        promises.push(fetchApiData(items, currentDateRange));

        salesSummaryTableWidget.comparePeriods.forEach(function (range) {
          promises.push(fetchApiData(items, range));
        });

        salesSummaryTableWidget.siteId = salesSummaryTableWidget.site.site_id;
        salesSummaryTableWidget.siteZones = siteZones;

        $q.all(promises).then(updateScopeWithResponseData).catch(showError);
      }

    }

    function fetchApiData(zones, range) {
      var requestParams = {
        orgId: salesSummaryTableWidget.orgId,
        siteId: salesSummaryTableWidget.siteId,
        zoneId: zones,
        reportStartDate: utils.getDateStringForRequest(range.start),
        reportEndDate: utils.getDateStringForRequest(range.end),
        groupBy: 'aggregate'
      };

      if(!ObjectUtils.isNullOrUndefined(salesSummaryTableWidget.kpi)) {
        var kpi = getKpiKey(salesSummaryTableWidget.kpi);

        if(kpi.length > 0) {
          requestParams.kpi = kpi;
        }
      }

      return requestManager.get(apiUrl + '/kpis/sales', { params: requestParams });
    }

    function getKpiKey(kpi) {
      var kpiKey = [];

      switch (kpi) {
        case 'tenant_sales':
          break;
        case 'tenant_conversion':
          kpiKey.push('conversion');
          break;
        case 'tenant_ats':
          kpiKey.push('ats');
          break;
        case 'tenant_upt':
          kpiKey.push('upt');
          break;
        case 'tenant_labor':
          kpiKey.push('labor_hours');
          break;
        case 'tenant_star':
          kpiKey.push('star');
          break;
      }

      return kpiKey;
    }

    function updateScopeWithResponseData(responses) {
      salesSummaryTableWidget.selectedMetric = angular.copy(_.findWhere(metricConstants.metrics, {apiReturnkey : salesSummaryTableWidget.returnKey}));
      if(!ObjectUtils.isNullOrUndefined(salesSummaryTableWidget.selectedMetric) &&
        salesSummaryTableWidget.selectedMetric.isCurrency &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(salesSummaryTableWidget.currencySymbol)) {
        salesSummaryTableWidget.selectedMetric.prefixSymbol = salesSummaryTableWidget.currencySymbol;
      }
      var items = salesSummaryTableWidget.itemIds.map(function (zoneId) {
        var periodValues = [];
        responses.forEach(function (response, index) {
          var data = response.result;
          var totalValue = calculateAggregate(zoneId, data);

          if (index === 0) {
            periodValues.push({
              value: totalValue
            });
          } else {
            periodValues.push({
              value: totalValue,
              comparison: comparisonsHelper.getComparisonData(periodValues[0].value, totalValue, true)
            });
          }
        });
        return {
          id: zoneId,
          type: salesSummaryTableWidget.itemTypes[zoneId],
          name: getZoneNameById(zoneId),
          periodValues: periodValues
        };
      });

      salesSummaryTableWidget.totalValue = items.reduce(function (total, item) {
        return total + item.currentValue;
      }, 0);

      salesSummaryTableWidget.totalCompareValue = items.reduce(function (totalCompare, item) {
        return totalCompare + item.compareYearValue;
      }, 0);

      salesSummaryTableWidget.totalYearCompare = items.reduce(function (totalYearCompare, item) {
        return totalYearCompare + item.changeYearCompare;
      }, 0);

      if (salesSummaryTableWidget.activeSortType !== undefined) {
        items = $filter('sortObjectBy')(items, salesSummaryTableWidget.activeSortType);
      }

      salesSummaryTableWidget.items = items;
      salesSummaryTableWidget.isLoading = false;
    }

    function displayPercentageChangeLabelforSalesSummarytable(value, format) {
      
      if(value > 0) {
        value = '+' + $filter('formatNumber')(value, 1, format);
      }else if(value === '0.0%'){
        value = $filter('formatNumber')(value, 1, format);
      } else {
        value = $filter('formatNumber')(value, 1, format);
      }
      return value;
    }

    function calculateAggregate(zoneId, resultItems) {
      var itemsForZone = resultItems.filter(function (item) {
        return item.zone_id === zoneId;
      });

      return itemsForZone.reduce(function (aggregateValue, item) {
        return aggregateValue + Number(item[salesSummaryTableWidget.returnKey]);
      }, 0);
    }


    function getZoneNameById(zoneId) {
      var found = $filter('filter')(salesSummaryTableWidget.siteZones, { id: zoneId }, true);
      var name;

      if (salesSummaryTableWidget.orgId === 6255) {
        if (found[0].name.substring(0, 1) === 'x') {
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
      salesSummaryTableWidget.requestFailed = true;
      salesSummaryTableWidget.isLoading = false;
    }

    function doOrderBy(colIndex, column, childProperty) {
      var previousColumnIndex = salesSummaryTableWidget.sortColumnIndex;
      salesSummaryTableWidget.sortColumnIndex = colIndex;
      salesSummaryTableWidget.sortChildColumn = column;
      salesSummaryTableWidget.childProperty = childProperty;
      if (previousColumnIndex === colIndex && salesSummaryTableWidget.orderBy === '-periodValues') {
        salesSummaryTableWidget.orderBy = '+periodValues';
      } else {
        salesSummaryTableWidget.orderBy = '-periodValues';
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
