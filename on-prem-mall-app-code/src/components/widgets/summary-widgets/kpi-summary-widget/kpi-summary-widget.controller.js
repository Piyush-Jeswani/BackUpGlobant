(function () {
  'use strict';

  angular.module('shopperTrak').controller('KpiSummaryWidgetController', [
    '$scope',
    '$q',
    '$translate',
    '$http',
    'apiUrl',
    'retailOrganizationSummaryData',
    'comparisonsHelper',
    'kpiSummaryWidgetConstants',
    'metricConstants',
    'ObjectUtils',
    '$rootScope',
    'currencyService',
    'SubscriptionsService',
    'currentSalesCategoryService',
    'CompParams',
    function (
      $scope,
      $q,
      $translate,
      $http,
      apiUrl,
      retailOrganizationSummaryData,
      comparisonsHelper,
      constants,
      metricConstants,
      ObjectUtils,
      $rootScope,
      currencyService,
      SubscriptionsService,
      currentSalesCategoryService,
      CompParams
    ) {
      var vm = this;
      var unbindLoadingWatch;
      var tagWatch;
      var localMetricConstants;
      var salesCategoriesWatch;

      vm.allKpisData = [];
      vm.allowedPdfKpis = [];

      activate();

      function activate() {
        if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
          setSalesCategoriesSelection();
        }
        setMetricsConstants();
        setIfExternalLoad();
        setCurrencySymbol();
        configureKpis();
        configureDateRanges();
        $scope.$on('$destroy', onDestroy);

        tagWatch = $scope.$watchCollection('vm.selectedTags', function () {
          configureDateRanges();
        });

        if ($rootScope.pdf) loadForPdfComplete();
      }

      /**
       * Set Sales Category Pull Down Selection and
       * watch the selection for changes.
       *
       */
      function setSalesCategoriesSelection() {
        var selectedSalesCategory;

        if (ObjectUtils.isNullOrUndefined(vm.salesCategories)) {
          selectedSalesCategory = currentSalesCategoryService.readSelection('kpi-summary-widget');

          if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory)) {
            vm.salesCategories = selectedSalesCategory;
          }
        }

        // Watch sales category pull down. When loaded or selection changed set
        // the current sales category service with the selected item in the pull down.
        salesCategoriesWatch = $scope.$watchCollection('vm.salesCategories', function () {
          if ($rootScope.customDashboards && !vm.externalLoad) {
            vm.widgetData = null;
            loadIfNoDataProvided();
            return;
          }

          currentSalesCategoryService.storeSelection('kpi-summary-widget', vm.salesCategories);
        });
      }

      /**
       * Overwrites the metric constants with whatever has been passed in to the directive
       * This is used by the PDF and the custom dashboard and covers the case of users with
       * Access to multiple organizations
       */
      function setMetricsConstants() {
        localMetricConstants = angular.copy(metricConstants);
      }

      function getMetricTitle(kpi, displayName) {
        if (!_.isUndefined(vm.orgMetrics)) {
          var metric = _.findWhere(vm.orgMetrics, { value: kpi.value });
          if (!_.isUndefined(metric)) {
            return metric.displayName;
          }
        }
        return !ObjectUtils.isNullOrUndefinedOrBlank(kpi.title) ? kpi.title : !ObjectUtils.isNullOrUndefinedOrBlank(displayName) ? displayName : kpi.shortTranslationLabel;
      }

      /** Sets a scoped value that indicates if the data is provided for this widget externally
       *  This function simply defaults the value to false if it has not been set.
       *  We needs this as there are some cases where the data for this widget is passed in, and this helps
       *  us to avoid double loads
       *
       **/
      function setIfExternalLoad() {
        if (ObjectUtils.isNullOrUndefined(vm.externalLoad)) {
          vm.externalLoad = false;
        }
      }

      /**
      * Notifies the pdf controller when all widgets have rendered.
      * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
      */
      function loadForPdfComplete() {
        vm.loadRun = 0;
        $scope.$watch('vm.allKpisData',
          function () {
            if (!vm.isLoading && vm.hasData && vm.loadRun < 1) {
              vm.loadRun += 1; //stops this function runing more than once, otherwise the PDF renders before other widgets are ready
              $rootScope.pdfExportsLoaded += 1;
            }
          }
        );
      }

      /** Loads data for the widget if none has been passed in.
       *  Is currently used by custom dashboards and the PDF controller
       *  This should not be called at site level.
       **/
      function loadIfNoDataProvided() {
        if (!ObjectUtils.isNullOrUndefined(vm.widgetData)) {
          return;
        }

        // vm.widgetData might not be ready yet, so we may have explicitly said we're loading externally
        if (vm.externalLoad === true) {
          return;
        }

        vm.isLoading = true;

        $http({
          method: 'GET',
          url: apiUrl + '/organizations/' + vm.orgId
        }).then(function (response) {
          vm.currentOrganization = response.data.result[0];

          vm.widgetDataIsLoading = {};
          vm.widgetData = {};

          getWidgetData(vm.dateRange.start, vm.dateRange.end, 1);
          getWidgetData(vm.compareRange1.start, vm.compareRange1.end, 2);
          getWidgetData(vm.compareRange2.start, vm.compareRange2.end, 3);
        }, function (err) {
          console.error(err);
        });
      }

      function setCurrencySymbol() {
        if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.orgId) && !ObjectUtils.isNullOrUndefined(vm.siteId) && ObjectUtils.isNullOrUndefinedOrBlank(vm.currencySymbol)) {
          currencyService.getCurrencySymbol(vm.orgId, vm.siteId).then(function (data) {
            vm.currencySymbol = data.currencySymbol;
          });
        }
      }

      function configureKpis() {
        var overallDeferred = $q.defer();

        var promises = [];

        vm.allKpisData = [];

        constants.kpis.forEach(function (kpi, key) {
          var deferred = $q.defer();

          promises.push(deferred.promise);

          var metric = _.findWhere(localMetricConstants.metrics, { value: kpi.id });
          var permissionInfo = getPermissionInfo(kpi);
          var hasPermission = _.where(permissionInfo, { hasPermission: true }).length === permissionInfo.length;

          var prefixSymbol = metric.prefixSymbol;

          if (metric.isCurrency && !ObjectUtils.isNullOrUndefinedOrBlank(vm.currencySymbol)) {
            prefixSymbol = vm.currencySymbol;
          }

          vm.allowedPdfKpis.push(kpi.id);

          getPermissionMessage(permissionInfo).then(function (permissionMessage) {

            var kpiData = {
              id: key,
              isLoading: false,
              requestFailed: false,
              hasData: true,
              title: getMetricTitle(metric, metric.displayName),
              api: kpi.apiReturnkey,
              hasPermission: hasPermission,
              permissionName: permissionMessage,
              precision: metric.precision,
              prefixSymbol: prefixSymbol,
              suffixSymbol: metric.suffixSymbol,
              labels: {
                1: {
                  totalsLabel: kpi.totalsLabel,
                  fromLabel: ''
                },
                2: {
                  totalsLabel: kpi.totalsLabel,
                  fromLabel: getFromPreviousPeriodTranskey(vm.compareRange1Type),
                  periodLabel: getPreviousPeriodTranskey(vm.compareRange1Type)
                },
                3: {
                  totalsLabel: kpi.totalsLabel,
                  fromLabel: getFromPreviousYearTranskey(vm.compareRange2Type),
                  periodLabel: getPreviousYearTranskey(vm.compareRange2Type)
                }
              },
              comparisons: {
                current: 1,
                previousPeriod: 2,
                previousYear: 3,
                data: {}
              }
            };

            var kpiDataIndex = _.findLastIndex(vm.allKpisData, {
              id: kpiData.id
            });

            if (ObjectUtils.isNullOrUndefined(kpiDataIndex) || kpiDataIndex < 0) {
              vm.allKpisData.push(kpiData);
            } else {
              vm.allKpisData[kpiDataIndex] = kpiData;
            } deferred.resolve();
          });
        });

        $q.all(promises).then(function () {
          overallDeferred.resolve();
          loadIfNoDataProvided();
        });

        return overallDeferred.promise;
      }

      function configureDateRanges() {
        unbindLoadingWatch = $scope.$watch('vm.isLoading', function (isLoading) {
          if (isLoading === true) {
            return;
          }

          if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData)) {
            return;
          }

          // Fix date range keys
          var previousPeriod = vm.dateRangeKeys.range[vm.dateRangeKeys.previousPeriod];
          var previousYear = vm.dateRangeKeys.range[vm.dateRangeKeys.previousYear];

          var dateRanges = {
            1: { range: vm.dateRange, key: vm.dateRangeKeys.range[vm.dateRangeKeys.current].value },
            2: { range: vm.compareRange1, key: previousPeriod.value },
            3: { range: vm.compareRange2, key: previousYear.value }
          };

          if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData[dateRanges[1].key]) ||
            ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData[dateRanges[1].key].result)) {
            return;
          }

          if (vm.widgetData[dateRanges[1].key].result.length === 0) {
            vm.hasData = false;
          } else {
            vm.hasData = true;
            configureKpis().then(function () {
              for (var i = 1; i < 4; i++) {
                var valueData = vm.widgetData[dateRanges[i].key].result[0];
                if (!_.isUndefined(valueData)) {
                  comparisonsHelper.getValuesForRange(i, vm.widgetData[dateRanges[i].key].result[0], vm.allKpisData, dateRanges[i].range);
                }
              }
            });
          }
        });
      }

      function onDestroy() {
        if (typeof unbindLoadingWatch === 'function') {
          unbindLoadingWatch();
        }

        if (typeof tagWatch === 'function') {
          tagWatch();
        }

        // Remove Sales Category pull down watch on widget destroy.
        if (typeof salesCategoriesWatch === 'function') {
          salesCategoriesWatch();
        }
      }

      function getPermissionMessage(permissionInfo) {
        var deferred = $q.defer();

        var result = '';

        var missingPermissions = _.where(permissionInfo, { hasPermission: false });

        var transkeys = missingPermissions.map(function (missingPermission) {
          return missingPermission.transkey;
        });

        if (transkeys.length === 0) {
          deferred.resolve(result);
        }

        $translate(transkeys).then(function (translations) {

          transkeys.forEach(function (transkey, index) {
            if (index > 0) {
              result += ', ';
            }
            result += translations[transkey];
          }, function () {
            deferred.reject();
          });

          deferred.resolve(result);
        });

        return deferred.promise;
      }

      function getPermissionInfo(kpi) {
        var metric = _.findWhere(localMetricConstants.metrics, { value: kpi.id });

        var permissionResults = [];

        metric.requiredSubscriptions.forEach(function (permission) {

          var permissionResult = {
            name: permission
          };

          if (permission === 'sales') {
            permissionResult.hasPermission = vm.hasSales;
            permissionResult.transkey = 'kpis.shortKpiTitles.tenant_sales';
          }

          if (permission === 'labor') {
            permissionResult.hasPermission = vm.hasLabor;
            permissionResult.transkey = 'kpis.shortKpiTitles.tenant_labor';
          }

          permissionResults.push(permissionResult);
        });

        return permissionResults;
      }

      function getFromPreviousPeriodTranskey(compareRangeType) {
        var transkey = getPreviousPeriodTranskey(compareRangeType);

        return makeTranskeyFrom(transkey);
      }

      function getFromPreviousYearTranskey(compareRangeType) {
        var transkey = getPreviousYearTranskey(compareRangeType);

        return makeTranskeyFrom(transkey);
      }

      function makeTranskeyFrom(transkey) {
        return transkey.replace('common.', 'common.FROM');
      }

      function getPreviousPeriodTranskey(compareRangeType) {
        var transkey = getPeriodTranskey(compareRangeType);

        if (transkey !== '') {
          return transkey;
        }

        return 'common.CUSTOMCOMPARE1';
      }

      function getPreviousYearTranskey(compareRangeType) {
        var transkey = getPeriodTranskey(compareRangeType);

        if (transkey !== '') {
          return transkey;
        }

        return 'common.CUSTOMCOMPARE2';
      }

      function getPeriodTranskey(compareRangeType) {
        if (compareRangeIsPriorPeriod(compareRangeType)) {
          return 'common.PRIORPERIOD';
        }

        if (compareRangeIsPriorYear(compareRangeType)) {
          return 'common.PRIORYEAR';
        }

        return '';
      }

      function compareRangeIsPriorPeriod(comparePeriodType) {
        return comparePeriodType === 'prior_period';
      }

      function compareRangeIsPriorYear(comparePeriodType) {
        return comparePeriodType === 'prior_year';
      }

      function getEndpoint(siteId) {
        // Traffic only
        if (!vm.currentOrganization.subscriptions.sales) {
          return 'kpis/traffic';
        }

        // Org level
        if (ObjectUtils.isNullOrUndefined(siteId)) {
          return 'kpis/report';
        }

        // Site level
        return 'kpis/report';
      }


      function getWidgetData(dateRangeStart, dateRangeEnd, periodKey) {
        const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

        const {
          currentOrganization,
          orgId,
          siteId,
          compStores:comp_site,
          compStoresRange,
          selectedTags,
          operatingHours,
          customTags:customTagId,
          salesCategories
        } = vm;

        vm.dateRangeKeys.range[periodKey].value = dateRangeKey;

        const apiEndpoint = getEndpoint();
        let toSplice = 'traffic';
        if (currentOrganization.subscriptions.sales) {
          toSplice = 'sales';
        }

        vm.widgetData[dateRangeKey] = [];
        vm.widgetDataIsLoading[dateRangeKey] = true;

        _.each(vm.allowedPdfKpis, (kpi, index) => {
          if (kpi === toSplice) {
            vm.allowedPdfKpis.splice(index, 1);
          }
        });

        let sales_category_id;
        if (!_.isUndefined(salesCategories) && salesCategories.length > 0 && _.min(salesCategories.id) > 0) {
          sales_category_id = salesCategories.map( (category) => category.id);
        }

        const params = {
          apiEndpoint,
          orgId,
          siteId,
          comp_site,
          dateRangeStart,
          dateRangeEnd,
          selectedTags,
          operatingHours,
          sales_category_id,
          ...(!apiEndpoint.match(/kpis\/traffic/) ? { kpi:vm.allowedPdfKpis } : {}),
          ...(comp_site === true ? CompParams.getCompDates(compStoresRange) : {}),
          ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {})
        };

        retailOrganizationSummaryData.fetchKpiData(params, true, (data) => {
          vm.widgetData[dateRangeKey] = data;
          vm.widgetDataIsLoading[dateRangeKey] = false;
          vm.isLoading = checkWidgetDataRequests();
        }, (error, status) => {
          console.error('error in kpi data', error, status);
          vm.widgetDataIsLoading[dateRangeKey] = false;
          vm.isLoading = checkWidgetDataRequests();
        });
      }

      function checkWidgetDataRequests() {
        var numLoading = _.filter(vm.widgetDataIsLoading, function (item) {
          return item === true;
        });
        return numLoading.length > 0;
      }

    }]);
})();
