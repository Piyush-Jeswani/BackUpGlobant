(function () {
  'use strict';
  angular.module('shopperTrak').controller('OrganizationSummaryController', OrganizationSummaryController);

  OrganizationSummaryController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    'currentOrganization',
    'ExportService',
    'SiteResource',
    'currentUser',
    'LocalizationService',
    'utils',
    'SubscriptionsService',
    'MallCheckService',
    'ObjectUtils',
    'customDashboardService',
    'widgetConstants',
    'dateRangeService',
    'loadingFlagsService'
  ];

  function OrganizationSummaryController(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    currentOrganization,
    ExportService,
    SiteResource,
    currentUser,
    LocalizationService,
    utils,
    SubscriptionsService,
    MallCheckService,
    ObjectUtils,
    customDashboardService,
    widgetConstants,
    dateRangeService,
    loadingFlagsService
  ) {

    var loadingFlagUnbind;
    activate();

    function activate() {
      initScope();
      configureWatches();
      $scope.showPerfWidget = MallCheckService.isNotMall(currentOrganization);

      $scope.metricsToShow = getMetricsToShow();

      setupLocalization(currentOrganization);
      setupSubscriptions();

      getOrganizationSites();
    }

    function initScope() {
      $scope.$stateParams = $stateParams;
      $scope.dateRangesLoaded = dateRangesLoaded();
      $scope.viewData = {};
      $scope.sitePerformanceCurrentView = {};
      $scope.isLoading = {};
  
      $scope.orgId = currentOrganization.organization_id;
      $scope.currentOrganization = currentOrganization;
      $scope.currentUser = currentUser;
      $scope.language = LocalizationService.getCurrentLocaleSetting();
      $scope.exportWidget = exportWidget;
      $scope.setSelectedWidget = setSelectedWidget;
      $scope.compareRangesSet = false;
  
      $scope.vm.salesCategoriesDailyPerf = {
        selection: []
      };
  
      $scope.salesCategoriesTrafficWeekday = {
        selection: []
      };

      $scope.dateRange = {
        start: $stateParams.dateRangeStart,
        end: $stateParams.dateRangeEnd
      };

      $scope.compareRange1 = {
        start: $stateParams.compareRange1Start,
        end: $stateParams.compareRange1End
      };

      $scope.compareRange2 = {
        start: $stateParams.compareRange2Start,
        end: $stateParams.compareRange2End
      };

      $scope.$on('page-loaded', setWidgetExported);
    }

    function configureWatches() {
      var unbindFunctions = [];

      unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySetting));
      unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf));
      unbindFunctions.push($scope.$on('page-loaded', setWidgetExported));

      loadingFlagUnbind = $scope.$watchCollection('loadingFlags', onLoadingFlagsChange);

      var loadWatchArray = [
        'metricsToShow', 
        'dateRangesLoaded', 
        'selectedWeatherMetrics',
        'firstDayOfWeek'
      ];

      unbindFunctions.push($scope.$watchGroup(loadWatchArray, onLoadWatchChange));
  
      $scope.$on('$destroy', function () {
        _.each(unbindFunctions, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
  
        removeLoadingFlagWatch();
      });
    }

    function onLoadingFlagsChange(loadingFlags) {
      loadingFlagsService.onLoadingFlagsChange(loadingFlags, loadingFlagUnbind);
    }
  
    function removeLoadingFlagWatch() {
      if(angular.isFunction(loadingFlagUnbind)) {
        loadingFlagUnbind();
      }
    }

    /* Date range picker sets the first day of week setting
    according to current user, calendar and organisation. */
    function onFirstDaySetting() {
      $scope.firstDayOfWeek = $rootScope.firstDaySetting;
    }

    function onLoadWatchChange() {
      if (viewIsLoaded()) {
        $scope.viewData = initializeViewData();
      }
    }

    function setupLocalization() {
      LocalizationService.setUser(currentUser);
      LocalizationService.setOrganization(currentOrganization);

      $scope.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);

      $scope.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);

      LocalizationService.getAllCalendars().then(function (calendars) {
        LocalizationService.setAllCalendars(calendars.result);
        $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, $scope.currentOrganization);
        $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, $scope.currentOrganization);

        $scope.compareRangesSet = true;
      },
      function () {
        $scope.compareRangesSet = true;
      });
    }

    function setupSubscriptions() {
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
    }

    function dateRangesLoaded() {
      return utils.urlDateParamsLoaded($stateParams);
    }

    function getMetricsToShow() {
      var metrics = ['organization_summary', 'site_performance'];
      if ($scope.showPerfWidget) {
        metrics.push('daily_performance')
      }
      metrics.push('traffic_per_weekday');

      $scope.loadingFlags = {};
      
      _.each(metrics, function(metric) {
        $scope.loadingFlags[metric] = true;
      });

      return metrics;
    }

    function getOrganizationSites() {
      $scope.organizationSites = SiteResource.query({
        orgId: $scope.orgId
      });
    }

    function exportWidget(metricKey, toDashboard) {
      initializeViewData();
      var params = $scope.viewData[metricKey];

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
      if(ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)){
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
      
      const currentOrgExports = `${params.orgId}_-1`;

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
      return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, metricKey, params, paramsToCompare);
    }

    function setSelectedWidget(title) {
      exportWidget(title, true);
    }

    function scheduleExportCurrentViewToPdf() {
      exportWidget('organization_summary');
      exportWidget('site_performance');

      if ($scope.showPerfWidget) {
        exportWidget('daily_performance_widget');
      }

      exportWidget('traffic_per_weekday');
      $state.go('pdfexport', {
        orgId: currentOrganization.organization_id,
        view: 'schedule'
      });
    }

    function getAreaKey() {
      return currentOrganization.organization_id + '_-1';
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
        pageName: 'summary-page',
        orgId: currentOrganization.organization_id,
        dateRangeType: getDateRangeType(),
        dateRange: {
          start: $scope.dateRange.start,
          end: $scope.dateRange.end
        },
        dateFormat: $scope.dateFormat,
        dateRangeShortCut: $state.rangeSelected,
        customRange: $state.customRange,
        compare1Range: {
          start: $scope.compareRange1.start,
          end: $scope.compareRange1.end
        },
        compare2Range: {
          start: $scope.compareRange2.start,
          end: $scope.compareRange2.end
        },
        compare1Type: $scope.compareRange1Type,
        compare2Type: $scope.compareRange2Type,
        name: metricKey,
        firstDayOfWeekSetting: $scope.firstDayOfWeek,
        language: $scope.language,
        compareType: 'range1', // default
        selectedMetric: 'traffic' //default
      };

      if (params.dateRangeShortCut === 'custom' && params.customRange === null) {
        params.xDaysBack = moment().diff(params.dateRange.start, 'days');
        params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
      }

      if (metricKey === 'organization_summary') {
        params = updateParamsForTableWidget(metricKey, params);
      } else if (metricKey === 'traffic_per_weekday') {
        params = updateParamsForWeekdayWidget(metricKey, params);
      } else if (metricKey === 'daily_performance_widget') {
        params = updateParamsForDailyPerformance(metricKey, params);
      } else if (metricKey === 'site_performance') {
        params.currentView = 'traffic_contribution';
      }

      return params;
    }

    function updateParamsForTableWidget(metricKey, params) {
      if (typeof ObjectUtils.getNestedProperty($scope, 'viewData[' + metricKey + '].filterText') !== 'undefined') {
        params.filterQuery = $scope.viewData[metricKey].filterText;
      }
      if (typeof ObjectUtils.getNestedProperty($scope, 'viewData[' + metricKey + '].compareType') !== 'undefined') {
        params.compareType = $scope.viewData[metricKey].compareType;
      }
      if (typeof ObjectUtils.getNestedProperty($scope, 'viewData[' + metricKey + '].sortType') !== 'undefined') {
        params.sortType = $scope.viewData[metricKey].sortType;
      }
      params.compare1Type = dateRangeService.getCompareType($scope.dateRange, params.compare1Range, $scope.currentUser, $scope.currentOrganization);
      return params;
    }

    function updateParamsForWeekdayWidget(metricKey, params) {
      if (ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
        return params;
      }
      params.selectedMetric = $scope.viewData[metricKey].selectedMetric;

      params.orderTable = $scope.viewData[metricKey].orderTable;
      params.orderReverse = $scope.viewData[metricKey].orderReverse;
      params.showTable = $scope.viewData[metricKey].showTable;
      params.salesCategories = $scope.salesCategoriesTrafficWeekday.selection;
      params.organizationId = '' + $scope.currentOrganization.organization_id;

      params.selectedDays = $scope.viewData[metricKey].selectedDays;
      if (typeof ObjectUtils.getNestedProperty($scope, 'viewData[' + metricKey + '].selectedDays') !== 'undefined' &&
        $scope.viewData[metricKey].selectedDays.length < 7) {
        //don't include unless needed load all from widget
        params.selectedDays = $scope.viewData[metricKey].selectedDays;
        _.each(params.selectedDays, function (day) {
          delete day.transkey;
        })
      }


      return params;
    }

    function updateParamsForDailyPerformance(metricKey, params) {
      if (typeof ObjectUtils.getNestedProperty($scope, 'viewData.daily_performance_widget.selectedDaysDailyPerformance') === 'undefined') {
        return params;
      }
      params.showTable = $scope.viewData[metricKey].showTable;
      if ($scope.viewData[metricKey].selectedDays.length < 7) { //don't include unless needed load all from widget
        params.selectedDays = $scope.viewData[metricKey].selectedDays;
        _.each(params.selectedDays, function (day) {
          delete day.transkey;
        })
      }
      params.salesCategories = $scope.salesCategories;
      return params;
    }

    function viewIsLoaded() {
      return !ObjectUtils.isNullOrUndefinedOrEmpty($scope.metricsToShow) &&
        $scope.dateRangesLoaded;
    }

    function widgetVariables() {
      return widgetConstants.exportProperties;
    }
  }
})();
