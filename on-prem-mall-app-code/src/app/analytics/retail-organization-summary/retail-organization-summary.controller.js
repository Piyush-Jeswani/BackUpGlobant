(function () {
  'use strict';
  angular.module('shopperTrak').controller('RetailOrganizationSummaryController', RetailOrganizationSummaryController);

  RetailOrganizationSummaryController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$q',
    '$translate',
    '$timeout',
    'currentOrganization',
    'LocalizationService',
    'retailOrganizationSummaryData',
    'utils',
    'SubscriptionsService',
    'currentUser',
    'sites',
    'ExportService',
    'metricConstants',
    'ObjectUtils',
    'customDashboardService',
    'maxSitesToCache',
    'MallCheckService',
    'widgetConstants',
    'dateRangeService',
    'operatingHoursService',
    'loadingFlagsService',
    'CompParams'
  ];

  function RetailOrganizationSummaryController(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $q,
    $translate,
    $timeout,
    currentOrganization,
    LocalizationService,
    retailOrganizationSummaryData,
    utils,
    SubscriptionsService,
    currentUser,
    sites,
    ExportService,
    metricConstants,
    ObjectUtils,
    customDashboardService,
    maxSitesToCache,
    MallCheckService,
    widgetConstants,
    dateRangeService,
    operatingHoursService,
    loadingFlagsService,
    CompParams
  ) {

    var tempKpiData = {};
    var tempTableData = {};
    var loadingFlagUnbind;

    activate();

    function activate() {
      $rootScope.customDashboards = false;
      if (!dateRangeService.checkDateRangeIsValid($state)) {
        $state.go($state.current.name, dateRangeService.getNewStateDateParams($state, currentUser, currentOrganization));
      }
      initScope();
      loadTranslations();
      configureWatches();

      $scope.operatingHours = operatingHoursService.getOperatingHoursSetting($stateParams, currentOrganization);

      //Should we show filters?
      $scope.showFilter = (MallCheckService.isNotMall($scope.currentOrganization) && MallCheckService.hasTags($scope.currentOrganization));

      if(SubscriptionsService.orgHasSalesCategories(currentOrganization)) {
        configureSalesCategoryWatches();
      }

      LocalizationService.setUser(currentUser);
      LocalizationService.setOrganization(currentOrganization);
      $scope.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);

      LocalizationService.getAllCalendars().then(function () {
        $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
        $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
      });

      if (SubscriptionsService.siteHasSales(currentOrganization)) {
        $scope.orgHasSales = true;
      } else {
        $scope.orgHasSales = false;
      }

      if (SubscriptionsService.siteHasLabor(currentOrganization)) {
        $scope.orgHasLabor = true;
      } else {
        $scope.orgHasLabor = false;
      }

      if (SubscriptionsService.siteHasInterior(currentOrganization)) {
        $scope.orgHasInterior = true;
      } else {
        $scope.orgHasInterior = false;
      }

      $scope.viewData = initializeViewData();
      $scope.viewDataInitialized = true;
      loadOrganizationPerformanceData();
    }

    function initScope() {
      const {
        dateRangeStart,
        dateRangeEnd,
        compareRange1Start,
        compareRange1End,
        compareRange2Start,
        compareRange2End
      } = $stateParams;

      const dateRanges = [
        dateRangeStart,
        dateRangeEnd,
        compareRange1Start,
        compareRange1End,
        compareRange2Start,
        compareRange2End
      ];

      const validDates = _.filter(dateRanges, (date) => date !== undefined);

      const compEndDate = moment.max(validDates);
      const compStartDate = moment.min(validDates);

      $scope.showFilter = false; //hides and shows the filters panel.

      $scope.checkCache = sites.length < maxSitesToCache;

      $scope.compStoresRange = {
        compStartDate,
        compEndDate
      };

      $scope.dateRange = {
        start: dateRangeStart,
        end: dateRangeEnd
      };

      $scope.compareRange1 = {
        start: compareRange1Start,
        end: compareRange1End
      };

      $scope.compareRange2 = {
        start: compareRange2Start,
        end: compareRange2End
      };

      initMetricsToShow();

      $scope.retailStoreSummaryData = {};
      $scope.tableData = {};
      $scope.kpiData = {};
      $scope.viewData = {};
      $scope.isLoading = {};

      initCompareMode();

      $scope.setCompareMode = setCompareMode;
      $scope.orgSites = sites;
      $scope.orgId = currentOrganization.organization_id;
      $scope.currentOrganization = currentOrganization;
      $scope.currentUser = currentUser;
      $scope.userOptions = {};
      $scope.numberFormat = getNumberFormat();
      $scope.setSelectedTagsSites = setSelectedTagsSites;

      $scope.isChartLoading = { requestFailed: false};
      $scope.isTableLoading = { requestFailed: false };
      $scope.kpiFlag = {
        DataLoading: true
      };
      $scope.exportWidget = exportWidget;
      $scope.setSelectedWidget = setSelectedWidget;
      $scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf);
      $scope.setSelectedFilters = setSelectedFilters;
      $scope.selectedTags = [];
      $scope.selectedTagNames = {};

      $scope.$on('goToHourlyDrilldown', goToHourlyDrilldown);
      $scope.$on('page-loaded', setWidgetExported);
    }

    function setSelectedTagsSites(selectedTagsSites) {
      $scope.selectedTagsSites = selectedTagsSites;
    }

    function initMetricsToShow() {
      var metricsToShow = [
        'kpi_summary_widget',
        'power_hours',
        'traffic_per_weekday',
        'retail_store_summary',
        'retail_organization_table'
      ];

      var isSingleDaySelected = dateRangeService.isSingleDaySelected($scope.dateRange.start, $scope.dateRange.end);

      if(!isSingleDaySelected) {
        metricsToShow.splice(2, 0, 'daily_performance_widget');
      }

      $scope.loadingFlags = {};

      _.each(metricsToShow, function(metric) {
        $scope.loadingFlags[metric] = true;
      });

      $scope.metricsToShow = metricsToShow;
    }

    function getPermittedKpis() {
      var kpisPermitted = [];

      var permdMetrics = metricConstants.metrics.filter(function(metric) {
        return SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, $scope.currentOrganization);
      });

      kpisPermitted = _.pluck(permdMetrics, 'value');

      kpisPermitted.push('traffic');

      return kpisPermitted;
    }

    function configureWatches() {
      var unbindFunctions = [];

      unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySettingChange));
      unbindFunctions.push($scope.$on('page-loaded', setWidgetExported));
      loadingFlagUnbind = $scope.$watchCollection('loadingFlags', onLoadingFlagsChange);

      $scope.$on('$destroy', function() {
        _.each(unbindFunctions, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });

        removeLoadingFlagWatch();
      });
    }

    function configureSalesCategoryWatches() {
      var unbindSalesCatWatches = [];

      unbindSalesCatWatches.push($scope.$watchCollection('viewData.kpi_summary_widget.salesCategories.selection', onKpiSummaryWidgetSalesCatChange));
      unbindSalesCatWatches.push($scope.$watchCollection('userOptions.salesCategories.selection', onSummaryWidgetSalesCatChange));

      $scope.$on('$destroy', function() {
        _.each(unbindSalesCatWatches, function(watcher) {
          if(typeof watcher === 'function') {
            watcher();
          }
        });
      });
    }

  /**
   * Handler for the sales category changing on the 5 KPI widget
   * Triggers a load of the 5 KPI widget's data ONLY, and no other widgets
   *
   * @param {object<salesCategory>} newValue - The currently selected sales category
   * @param {object<salesCategory>} oldValue - The previously selected sales category
   *
   */
    function onKpiSummaryWidgetSalesCatChange(newValue, oldValue) {
      if(angular.equals(newValue, oldValue)) {
        return;
      }

      $scope.loadingFlags.kpi_summary_widget = true;

      // Only allow this watch to load the retail store summary, retail org table if this is the first time
      let loadChildWidgetData = false;

      if(ObjectUtils.isNullOrUndefined(oldValue)) {
        loadChildWidgetData = true;
      }

      loadOrganizationPerformanceData(loadChildWidgetData);
    }

  /**
   * Handler for the sales category changing on the last two widgets (retail store summary, retail org table)
   * Triggers a load of the data for the retail store summary and retail org table ONLY, and no other widgets
   *
   * @param {object<salesCategory>} newValue - The currently selected sales category
   * @param {object<salesCategory>} oldValue - The previously selected sales category
   *
   */
    function onSummaryWidgetSalesCatChange(newValue, oldValue) {
      if(angular.equals(newValue, oldValue) || ObjectUtils.isNullOrUndefined(oldValue)) {
        return;
      }
      $scope.loadingFlags.retail_store_summary = true;
      $scope.loadingFlags.retail_organization_table = true;
      loadRetailStoreSummaryAndOrgSummaryData();
    }

    function onFirstDaySettingChange() {
      $scope.firstDayOfWeek = $rootScope.firstDaySetting;
    }

    function onLoadingFlagsChange(loadingFlags) {
      var lazyLoadWidgets = ['retail_store_summary', 'retail_organization_table'];

      var pageLoadingFlags = _.omit(loadingFlags, lazyLoadWidgets);

      loadingFlagsService.onLoadingFlagsChange(pageLoadingFlags, loadingFlagUnbind);
    }

    function removeLoadingFlagWatch() {
      if(angular.isFunction(loadingFlagUnbind)) {
        loadingFlagUnbind();
      }
    }

    function initCompareMode() {
      var isAll = true;

      if($stateParams.compareMode === '0') {
        isAll = false;
      }

      $scope.compareMode = {
        all: isAll,
        stores: !isAll
      };

      if(isAll) {
        $scope.currentCompare = 1;
      } else {
        $scope.currentCompare = 0;
      }
    }

    function setCompareMode(allStores) {
      if($scope.currentCompare === allStores) {
        return;
      }

      const isAll = allStores ? true : false;
      $scope.compareMode = {
        ...$scope.compareMode,
        all: isAll,
        stores: !isAll
      };

      $scope.currentCompare = allStores;
      operatingHoursService.setCompareMode(allStores);
      refreshTags();
    }

  /**
   * Retrieves the data the Organization Summary table
   *
   */
    function loadOrgSummaryTableData() {
      var salesCategories;

      try {
        salesCategories = _.pluck($scope.userOptions.salesCategories.selection, 'id');
      } catch(e) {
        // Do nothing. Rather than check the nested props, just swallow the error
      }

      var promises = [];
      promises.push(getReportData($scope.orgId, $scope.dateRange.start, $scope.dateRange.end, $scope.selectedTags, salesCategories));
      promises.push(getReportData($scope.orgId, $scope.compareRange1.start, $scope.compareRange1.end, $scope.selectedTags, salesCategories));
      promises.push(getReportData($scope.orgId, $scope.compareRange2.start, $scope.compareRange2.end, $scope.selectedTags, salesCategories));

      //reset compfilter counts to avoid old data being shown while new request is being made
      $scope.compareMode.stores && CompParams.resetCompFilterCount();

      $q.all(promises).then( () => {

        $scope.tableData = angular.copy(tempTableData);
        $scope.isTableLoading.requestFailed = false;

        //use compareMode.stores hook to set filter count
        $scope.compareMode.stores && doSitesCount();

        $timeout(function () {
          $scope.loadingFlags['retail_organization_table'] = false;
        });
      }).catch(function (error) {
        $scope.loadingFlags['retail_organization_table'] = false;
        $scope.isTableLoading.requestFailed = true;
        if (error !== 'User cancelled') {
          console.error('error', error);
        }
      });
    }

    function doSitesCount() {
      const {
        dateRangeStart,
        dateRangeEnd
      } = $stateParams;

      const currentPeriodKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

      const filterCount = (($scope.tableData || {})[currentPeriodKey] || []).length || 0;

      CompParams.setCompFilterCount(filterCount);
    }

    function refreshTags() {
      $scope.numTags = _.keys($scope.selectedTags).length + _.keys($scope.selectedCustomTags).length;
      tempKpiData = {};
      $scope.loadingFlags['kpi_summary_widget'] = true;

      $timeout(function () {
        loadOrganizationPerformanceData();
      });
    }

    function loadRetailStoreSummaryData(orgId, dateRangeStart, dateRangeEnd, selectedTags) {
      $scope.loadingFlags['retail_organization_table'] = true;
      $scope.loadingFlags['retail_store_summary'] = true;

      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);
      const comp_site = $scope.compareMode.stores;
      $scope.retailStoreSummaryData[dateRangeKey] = [];

      const {
        operatingHours,
        compStoresRange,
        selectedCustomTags: customTagId,
        userOptions,
      } = $scope;

      const { salesCategories } = userOptions;

      let sales_category_id;
      if (!_.isUndefined(salesCategories) && salesCategories.selection.length > 0 && _.min(salesCategories.selection.id) > 0) {
        sales_category_id = salesCategories.selection.map( (category) => category.id);
      }

      const params = {
        orgId,
        comp_site,
        dateRangeStart,
        dateRangeEnd,
        selectedTags,
        kpi: getPermittedKpis(),
        operatingHours,
        sales_category_id,
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {})
      };

      retailOrganizationSummaryData.fetchReportData(params, $scope.checkCache, (data) => {
        $scope.retailStoreSummaryData[dateRangeKey] = data;
        $scope.isChartLoading.requestFailed = false;
      }, (error) => {
        $scope.isChartLoading.requestFailed = true;
        $scope.loadingFlags['retail_store_summary'] = false;
        if (error !== 'User cancelled') {
          console.error('error', error);
        }
      });
    }

    function getReportData(orgId, dateRangeStart, dateRangeEnd, selectedTags, sales_category_id) {
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);
      const comp_site = $scope.compareMode.stores;
      tempTableData[dateRangeKey] = [];

      const {
        operatingHours,
        compStoresRange,
        selectedCustomTags: customTagId,
      } = $scope;

      const params = {
        orgId,
        comp_site,
        dateRangeStart,
        dateRangeEnd,
        selectedTags,
        kpi: getPermittedKpis(),
        sales_category_id,
        operatingHours,
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {})
      };

      var deferred = $q.defer();

      retailOrganizationSummaryData.fetchReportData(params,  $scope.checkCache, (data) => {
        tempTableData[dateRangeKey] = data;
        deferred.resolve();
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    /** Gets the endpoint based on the current org, current site, and current subscriptions
     *
     *  @returns {string} endpoint - The api endpoint to call
     **/
    function getEndpoint() {

      // Traffic only
      if($scope.orgHasSales === false) {
        return 'kpis/traffic';
      }

      // Org Level Traffic and Sales
      return 'kpis/report';
    }

  /**
   * Retrieves the data for the 5 KPI widget.
   * Once all data is loaded, it will load the data for the Org Summary and Retail Store Summary widget
   *
   * @param {boolean} loadChildWidgetData - Optional. Defaults to true. Specifies if the org summary and Retail Store Summary widgets' data should be loaded after
   */
    function loadOrganizationPerformanceData(loadChildWidgetData = true) {
      $scope.loadingFlags['kpi_summary_widget'] = true;

      let salesCategoryIsSet = (typeof ObjectUtils.getNestedProperty($scope,'viewData.kpi_summary_widget.salesCategories.selection') !== 'undefined');
      if(SubscriptionsService.orgHasSalesCategories(currentOrganization) && !salesCategoryIsSet) {
        // Don't load. Let the Watch trigger it all
        return;
      }

      var apiUrl = getEndpoint();

      var salesDateranges = {
        current: 1,
        previousPeriod: 2,
        previousYear: 3,
        range: {
          1: { value: '' },
          2: { value: '' },
          3: { value: '' }
        }
      };

      $scope.salesDateRanges = salesDateranges;

      var promises = [];

      var apiDateRanges = [$scope.dateRange, $scope.compareRange1, $scope.compareRange2];

      _.each(apiDateRanges, function (range, index) {
        var dRange = salesDateranges.range[index + 1];

        var promise = getKpiData(apiUrl, $scope.orgId, range.start, range.end, $scope.selectedTags, dRange);

        promises.push(promise);
      });

      $q.all(promises)
        .then(function() {
          $scope.loadingFlags['kpi_summary_widget'] = false;
          $scope.kpiFlag.hasError = false;
          $scope.kpiData = angular.copy(tempKpiData);

          if(loadChildWidgetData) {
            loadRetailStoreSummaryAndOrgSummaryData();
          }
        })
        .catch(function(error) {
          if (!ObjectUtils.isNullOrUndefined(error) && error !== 'User cancelled') {
            console.error('error', error);
          }
          $scope.kpiFlag.hasError = true;
          $scope.loadingFlags['kpi_summary_widget'] = false;

          if(loadChildWidgetData) {
            loadRetailStoreSummaryAndOrgSummaryData();
          }
        });
    }

  /**
   * Retrieves the data the Retail Store Summary and Organization Summary widgets
   *
   */
    function loadRetailStoreSummaryAndOrgSummaryData() {
      loadRetailStoreSummaryData($scope.orgId, $scope.dateRange.start, $scope.dateRange.end, $scope.selectedTags);
      loadOrgSummaryTableData();
    }

    // Used to load Each period of data for the 5 kpi widget (kpi_summary_widget)
    function getKpiData(apiEndpoint, orgId, dateRangeStart, dateRangeEnd, selectedTags, range) {
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

      range = (typeof range === 'undefined') ? null : range;

      if (range !== null) {
        range.value = dateRangeKey;
      }

      const comp_site = $scope.compareMode.stores;

      if (typeof tempKpiData[apiEndpoint] === 'undefined') {
        tempKpiData[apiEndpoint] = {};
      }

      tempKpiData[apiEndpoint][dateRangeKey] = [];

      const {
        operatingHours,
        compStoresRange,
        selectedCustomTags: customTagId,
        orgHasSales,
        orgHasLabor
      } = $scope;

      let sales_category_id;
      if (typeof ObjectUtils.getNestedProperty($scope,'viewData.kpi_summary_widget.salesCategories.selection') !== 'undefined') {
        sales_category_id = _.pluck($scope.viewData.kpi_summary_widget.salesCategories.selection, 'id')
      }

      let kpi;
      if(orgHasSales) {
        kpi = ['ats', 'conversion', 'traffic'];

        if(orgHasLabor) {
          kpi.push('star');
        }
      }

      const params = {
        apiEndpoint,
        orgId,
        comp_site,
        dateRangeStart,
        dateRangeEnd,
        selectedTags,
        operatingHours,
        kpi,
        sales_category_id,
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {})
      };

      //just so requests don't fire without custom tags when filters are cached - multiple requests were being made due to multiple instances
      if(!ObjectUtils.isNullOrUndefined($state.activeFilters) && $scope.selectedCustomTags === undefined) {
        return;
      }

      var deferred = $q.defer();

      retailOrganizationSummaryData.fetchKpiData(params, true, function (data) {
        tempKpiData[dateRangeKey] = data;
        deferred.resolve();
      }, function (error, status) {
        if (error !== 'User cancelled') {
          console.error('retail org summary error in kpi data', error, status);
        }
        tempKpiData[dateRangeKey] = false;
        deferred.reject();
      });

      return deferred.promise;
    }

    function loadTranslations() {
      $translate.use($scope.language);
    }

    function getNumberFormat() {
      return LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
    }

    function exportWidget(metricKey, toDashboard) {
      var params = initExportParam(metricKey);

      if (toDashboard) {
        customDashboardService.setSelectedWidget(params);
      } else {
        ExportService.createExportAndStore(params);
      }
    }

    function setWidgetExported(){
      $scope.widgetIsExported = widgetIsExported;
    }

    function widgetIsExported(metricKey, params) {
      const exports = ExportService.getCart();
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)) {
        //if the export cart is empty there is nothing to check so return false (all export buttons can be enabled). 
        return false;
      }

      const dateRangeKey =
        $scope.dateRange.start +
        ' - ' +
        $scope.dateRange.end +
        ' - ' +
        $scope.compareRange1.start +
        ' - ' +
        $scope.compareRange1.end +
        ' - ' +
        $scope.compareRange2.start +
        ' - ' +
        $scope.compareRange2.end;

      const currentOrgExports = `${$scope.orgId}_-1`;

      if (_.isUndefined(exports[currentOrgExports])) {
        //no exports for the current organisation/site in the cart, nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      if(_.isUndefined(exports[currentOrgExports][dateRangeKey])) {
        //no exports for the current date range, widget exports can be enabled
        return false;
      }

      const exportMetrics = _.pluck(exports[currentOrgExports][dateRangeKey].metrics, 'name');

      if (!exportMetrics.includes(metricKey)) {
        //if the widget type is not in the export cart, nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      const paramsToCompare = widgetVariables()[metricKey];
      params = initExportParam(metricKey);

      return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, metricKey, params, paramsToCompare, metricKey === 'daily_performance_widget');
    }

    function setSelectedWidget(title) {
      exportWidget(title, true)
    }

    function scheduleExportCurrentViewToPdf() {
      exportWidget('kpi_summary_widget');
      exportWidget('power_hours');

      var isSingleDaySelected = dateRangeService.isSingleDaySelected($scope.dateRange.start, $scope.dateRange.end);

      if(!isSingleDaySelected) {
        exportWidget('daily_performance_widget');
      }

      exportWidget('traffic_per_weekday');
      exportWidget('retail_store_summary');
      $state.go('pdfexport', {orgId: currentOrganization.organization_id, view: 'schedule'});
      
    }

    function goToHourlyDrilldown(event, data) {
      if (moment($stateParams.compareRange1Start).format('YYYY-MM-DD') === moment($stateParams.compareRange1End).format('YYYY-MM-DD')) {
        $state.go('analytics.organization.hourly', {
          day: data.label,
          compareRange1Start: event.currentScope.compareRange1.start,
          compareRange1End: event.currentScope.compareRange1.end,
          compareRange2Start: event.currentScope.compareRange2.start,
          compareRange2End: event.currentScope.compareRange2.end,
          dateRangeStart: event.currentScope.dateRange.start,
          dateRangeEnd: event.currentScope.dateRange.end
        });
      }
    }

    function getAreaKey() {
      var key = currentOrganization.organization_id+'_-1';
      if($scope.selectedTags.length > 0) {
        key += '_tags_';
        _.each($scope.selectedTags, function(tag) {
          key += tag;
        });
      }
      return key;
    }

    function setSelectedFilters(filters, customTags, customTagDetails) {
      $scope.selectedTags = [];
      $scope.selectedCustomTags = [];
      $scope.selectedTagNames = filters[1];
      $scope.userOptions.filterText = ''; // clear search text when tags are applied

      if( !ObjectUtils.isNullOrUndefinedOrEmptyObject(customTags) ) {
        $scope.selectedCustomTags =  _.keys(_.pick(customTags, function(_selected) {
          return _selected === true;
        }));
      }
      $scope.selectedTagDetails = customTagDetails;

      // Selected Tags
      var selectedTags = filters[0];
      $scope.selectedTags = _.keys(_.pick(selectedTags, function(_selected) {
        return _selected === true;
      }));

      refreshTags();
    }


    function initializeViewData() {
      var configuration = {};

      _.each($scope.metricsToShow, function (metricKey) {
        configuration[metricKey] = initExportParam(metricKey);
      });

      return configuration;
    }

    function getDateRangeType() {
      var dateRangeType = $stateParams.activeShortcut;

      if(_.isUndefined(dateRangeType)) {
        dateRangeType = utils.getDateRangeType($scope.dateRange, currentUser, currentOrganization);
      }

      return dateRangeType;
    }

    function initExportParam(metricKey) {
      var params;     
      params = {
        orgId: currentOrganization.organization_id,
        name: metricKey,
        currentUser: currentUser,
        dateRangeKeys: $scope.salesDateRanges,
        dateRange: { start: $scope.dateRange.start, end: $scope.dateRange.end },
        dateRangeType: getDateRangeType(),
        compare1Range: { start: $scope.compareRange1.start, end: $scope.compareRange1.end },
        compare2Range: { start: $scope.compareRange2.start, end: $scope.compareRange2.end },
        compare1Type: $scope.compareRange1Type,
        compare2Type: $scope.compareRange2Type,
        firstDayOfWeekSetting: $scope.firstDayOfWeek,
        dateRangeShortCut: $state.rangeSelected,
        customRange:  $state.customRange,
        compStores: $scope.compareMode.stores,
        compStoresRange: $scope.compStoresRange,
        tags: $scope.selectedTags,
        dateFormat: $scope.dateFormat,
        numberFormat: $scope.numberFormat,
        language: $scope.language,
        selectedTags: $scope.selectedTags,
        customTags: $scope.selectedCustomTags,
        customTagDetails:$scope.selectedTagDetails,
        orgHasSales: $scope.orgHasSales,
        orgHasLabor: $scope.orgHasLabor,
        selectedCategory: $scope.userOptions.categoryFilter,
        orgHasInterior: $scope.orgHasInterior,
        currencySymbol: _.findWhere(metricConstants.metrics, {isCurrency: true}).prefixSymbol,
        operatingHours: $scope.operatingHours,
        pdfOrientation: 'portrait'
      };

      if(params.dateRangeShortCut === 'custom' && params.customRange === null) {
        params.xDaysBack = moment().diff(params.dateRange.start, 'days');

        if(moment.isMoment(params.dateRange.end)) {
          params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
        }
      }

      if(!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {

        params.siteFilter = $scope.userOptions.filterText;
        params.extremeValues = $scope.viewData[metricKey].extremeValues;
        params.activeKpi = $scope.viewData[metricKey].activeKpi;

        switch (metricKey) {
          case 'kpi_summary_widget':
            if (!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey].salesCategories)) {
              params.salesCategories = $scope.viewData[metricKey].salesCategories.selection;
            }
            break;
          case 'traffic_per_weekday':
            params.selectedMetric = $scope.viewData[metricKey].selectedMetric;
            params.orderTable = $scope.viewData[metricKey].orderTable;
            params.orderReverse = $scope.viewData[metricKey].orderReverse;
            params.showTable = $scope.viewData[metricKey].showTable;
            if (!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey].salesCategories)) {
              params.salesCategories = angular.copy($scope.viewData[metricKey].salesCategories.selection);
            }
            if (!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey].selectedDays)) {
              params.selectedDays = $scope.viewData[metricKey].selectedDays;
              _.each(params.selectedDays, function (day) {
                delete day.transkey;
              });
            }
            break;
          case 'daily_performance_widget':
            if (!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey].selectedDays)) {
              params.selectedDays = $scope.viewData[metricKey].selectedDays;
              _.each(params.selectedDays, function (day) {
                delete day.transkey;
              });
            }
            params.showTable = $scope.viewData[metricKey].showTable;
            params.orderTable = $scope.viewData[metricKey].orderTable;
            params.orderDirection = $scope.viewData[metricKey].orderDirection;

            if (!ObjectUtils.isNullOrUndefined($scope.viewData[metricKey].salesCategories)) {
              params.salesCategories = angular.copy($scope.viewData[metricKey].salesCategories.selection);
            }
            break;
          case 'retail_organization_table':
            if (!ObjectUtils.isNullOrUndefined($scope.userOptions.salesCategories)) {
              params.salesCategories = angular.copy($scope.userOptions.salesCategories.selection);
            }
            params.categories = ObjectUtils.getNestedProperty($scope, 'currentOrganization.portal_settings.sales_categories') || [];
            params.comparisonIndex = $scope.viewData[metricKey].comparisonIndex;
            params.selectedMetrics = _.pluck($scope.viewData[metricKey].selectedMetrics, 'kpi');
            params.selectedCategory = $scope.userOptions.categoryFilter;
            params.filterText = $scope.userOptions.filterText;
            params.mid = $scope.userOptions.mid;
            params.siteCategories = $scope.userOptions.siteCategories;
            params.sites = [];
            delete params.currencySymbol;

            break;
          case 'retail_store_summary':
            if (!ObjectUtils.isNullOrUndefined($scope.userOptions.salesCategories)) {
              params.salesCategories = angular.copy($scope.userOptions.salesCategories.selection);
            }
            params.categories = ObjectUtils.getNestedProperty($scope, 'currentOrganization.portal_settings.sales_categories') || [];
            params.filterText = $scope.userOptions.filterText;
            params.selectedSites = $scope.viewData[metricKey].selectedSites;
            break;
          case 'power_hours':
            params.displayType = getPropFromViewData(metricKey, 'displayType');
            params.pdfOrientation = getPropFromViewData(metricKey, 'pdfOrientation');

            params.isSalesMetricSelected = getPropFromViewData(metricKey, 'isSalesMetricSelected');

            if(params.isSalesMetricSelected === true) {
              params.salesCategories = getPropFromViewData(metricKey, 'salesCategories');
            }

            params.kpi = 'traffic'; //ToDo: Check if this is needed
            break;
        }

      }
      return params;
    }

    /**
     * Safely retrieves properties from the viewData object for a specified widget (metricKey)
     *
     * @param {string} metricKey - The widget key to export
     * @returns {object} The property. This could be an object, string, or number
     */
    function getPropFromViewData(metricKey, propName) {
      if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
        return;
      }

      // If the property we want is an object, we return a copy of it to prevent mutations
      if(angular.isObject($scope.viewData[metricKey][propName])) {
        return angular.copy($scope.viewData[metricKey][propName]);
      }

      return $scope.viewData[metricKey][propName];
    }

    function widgetVariables() {
      return widgetConstants.exportProperties;
    }
  }
})();
