'use strict';

angular.module('shopperTrak')
.controller('SalesAndConversionCtrl', [
  '$scope',
  '$rootScope',
  '$state',
  '$stateParams',
  'currentSite',
  'ExportService',
  'currentOrganization',
  'currentZone',
  'currentUser',
  'LocalizationService',
  'utils',
  'metricConstants',
  'customDashboardService',
  'ObjectUtils',
  'widgetConstants',
  'dateRangeService',
  'loadingFlagsService',
function(
  $scope,
  $rootScope,
  $state,
  $stateParams,
  currentSite,
  ExportService,
  currentOrganization,
  currentZone,
  currentUser,
  LocalizationService,
  utils,
  metricConstants,
  customDashboardService,
  ObjectUtils,
  widgetConstants,
  dateRangeService,
  loadingFlagsService
) {

  var loadingFlagUnbind;
  activate();

  function activate() {
    if (!dateRangeService.checkDateRangeIsValid($state)) {
      if(!ObjectUtils.isNullOrUndefined($state) && !ObjectUtils.isNullOrUndefined($state.current)) {
        $state.go($state.current.name, dateRangeService.getNewStateDateParams($state, currentUser, currentOrganization));
      }
    }
    initScope();
    configureWatches();
    setupLocalization(currentUser, currentOrganization);
    initZone();
    initMetricsToShow();
    getKpiValuesForKpi();
  }

  function initScope() {
    $scope.$on('page-loaded', setWidgetExported);
    $scope.currentOrganization = currentOrganization;
    $scope.currentSite = currentSite;
    $scope.currentUser = currentUser;
    $scope.dateRangesLoaded = dateRangesLoaded();
    $scope.scheduleExportCurrentViewToPdf = scheduleExportCurrentViewToPdf;
    $scope.exportWidget = exportWidget;

    $scope.kpiValues = {};
    $scope.viewData = {};
    $scope.isLoading = {};

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
  }

  function configureWatches() {
    var unbindFunctions = [];

    unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySetting));
    unbindFunctions.push($scope.$watch('currentZone'), onCurrentZoneChange);
    unbindFunctions.push($scope.$on('page-loaded', setWidgetExported));

    var loadWatchArray = [
      'metricsToShow',
      'dateRangesLoaded',
      'firstDayOfWeek',
      'isLoading'
    ];

    unbindFunctions.push($scope.$watchGroup(loadWatchArray, onLoadWatchChange));
    unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf));

    loadingFlagUnbind = $scope.$watchCollection('loadingFlags', onLoadingFlagsChange);

    $scope.$on('$destroy', function () {
      _.each(unbindFunctions, function(unbindFunction) {
        if(angular.isFunction(unbindFunction)) {
          unbindFunction();
        }
      });

      removeLoadingFlagWatch();
    });
  }

  function onLoadWatchChange() {
    if(viewIsLoaded()) {
      $scope.viewData = initializeViewData();
    }
  }

  /* Date range picker sets the first day of week setting
  according to current user, calendar and organisation. */
  function onFirstDaySetting() {
    $scope.firstDayOfWeek = $rootScope.firstDaySetting;
  }

  function onCurrentZoneChange() {
    $rootScope.groupBy = {};
  }

  function onLoadingFlagsChange(loadingFlags) {
    loadingFlagsService.onLoadingFlagsChange(loadingFlags, loadingFlagUnbind);
  }

  function removeLoadingFlagWatch() {
    if(angular.isFunction(loadingFlagUnbind)) {
      loadingFlagUnbind();
    }
  }

  function setupLocalization(user, org) {
    LocalizationService.setUser(user);
    LocalizationService.setOrganization(org);

    $scope.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);

    $scope.numberFormat = {
      name: LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization)
    };
    $scope.language = LocalizationService.getCurrentLocaleSetting();

    LocalizationService.getAllCalendars().then(function (calendars) {
      LocalizationService.setAllCalendars(calendars.result);
      $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, user, org, $stateParams.activeShortcut);
      $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, user, org, $stateParams.activeShortcut);
    });
  }

  function initZone() {
    if(!ObjectUtils.isNullOrUndefined(currentZone)) {
      $scope.currentZone = currentZone;
    }
  }

  function initMetricsToShow() {
    if (currentSite.type === 'Mall' && currentZone === null) {
      $scope.metricsToShow = [
        'tenant_sales_table_widget',
        'tenant_conversion_table_widget',
        'tenant_ats_table_widget',
        'tenant_upt_table_widget'
      ];
    } else {
      $scope.metricsToShow = [
        'sales_widget',
        'conversion_widget',
        'ats_sales_widget',
        'upt_sales_widget'
      ];
    }

    $scope.loadingFlags = {};

    _.each($scope.metricsToShow, function(metric) {
      $scope.loadingFlags[metric] = true;
    });
  }

  function getKpiValuesForKpi() {
    var kpiValues = {
      sales_widget : {name : 'sales'},
      conversion_widget  : {name : 'conversion'},
      ats_sales_widget : {name : 'ats'},
      upt_sales_widget : {name : 'upt'}
    };
    $scope.kpiValues = angular.copy(kpiValues);
  }

  function scheduleExportCurrentViewToPdf() {
    _.each($scope.metricsToShow, function (value) {
      $scope.exportWidget(value);
    });

    $state.go('pdfexport', { orgId: currentOrganization.organization_id, view: 'schedule' });
  }

  function getAreaKey() {
    var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
    if (currentZone) {
      areaKey += '_zone_' + currentZone.id;
    }
    return areaKey;
  }

  function exportWidget(metricKey, toDashboard) {
    initializeViewData();
    var params = $scope.viewData[metricKey];

    if(toDashboard === true) {
      params.currentView = 'analytics.organization.site.sales-and-conversion';
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

    let currentOrgExports;

    if (!ObjectUtils.isNullOrUndefinedOrEmpty($scope.currentZone)) {
      currentOrgExports = `${$scope.currentOrganization.organization_id}_${$scope.currentSite.site_id}_zone_${$scope.currentZone.id}`;
    } else if (!_.isUndefined($scope.currentSite.site_id)) {
      currentOrgExports = `${$scope.currentOrganization.organization_id}_${$scope.currentSite.site_id}`;
    } else {
      currentOrgExports = `${$scope.currentOrganization.organization_id}_-1`;
    }

    if (_.isUndefined(exports[currentOrgExports])) {
      //no exports for the current organisation/site in the cart, nothing needs to be checked, the export button for this widget can be enabled. 
      return false;
    }

    const exportMetrics = _.pluck(exports[currentOrgExports][dateRangeKey].metrics, 'name');

    if (!exportMetrics.includes(metricKey)) {
      //if the widget type is not in the export cart, nothing needs to be checked, the export button for this widget can be enabled. 
      return false;
    }

    if(_.isUndefined(exports[currentOrgExports][dateRangeKey])) {
      //no exports for the current date range, widget exports can be enabled
      return false;
    }

    const paramsToCompare = widgetVariables()[metricKey];

    return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, metricKey, params, paramsToCompare);
  }

  function dateRangesLoaded() {
    return utils.urlDateParamsLoaded($stateParams);
  }

  function initializeViewData() {
    var configuration = {};

    _.each($scope.metricsToShow, function(metricKey) {
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
    var tab = $state.current.views.analyticsMain.controller.toString();
    params = {
      orgId: currentSite.organization.id  ,
      siteId: currentSite.site_id,
      dateRange: { start: $scope.dateRange.start, end: $scope.dateRange.end },
      dateRangeType: getDateRangeType(),
      compare1Range: { start: $scope.compareRange1.start, end: $scope.compareRange1.end },
      compare2Range: { start: $scope.compareRange2.start, end: $scope.compareRange2.end },
      compare1Type: $scope.compareRange1Type,
      compare2Type: $scope.compareRange2Type,
      numberFormat: $scope.numberFormat,
      dateFormat: $scope.dateFormat,
      dateRangeShortCut: $state.rangeSelected,
      customRange:  $state.customRange,
      name: metricKey,
      language: $scope.language,
      firstDayOfWeekSetting: $scope.firstDayOfWeek,
      operatingHours: $scope.operatingHours,
      currencySymbol: _.findWhere(metricConstants.metrics, {isCurrency: true}).prefixSymbol,
      groupBy: 'day'
    };

    if(params.dateRangeShortCut === 'custom' && params.customRange === null) {
      params.xDaysBack = moment().diff(params.dateRange.start, 'days');
      params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
    }

    if (currentZone) {
      params.zoneId = currentZone.id;
    }

    if(typeof ObjectUtils.getNestedProperty($scope, 'viewData['+metricKey+'].zoneFilterQuery') !== 'undefined') {
      params.filterQuery = $scope.viewData[metricKey].zoneFilterQuery;
    }

    initializeSortTypeParams();

    params.orderBy = $scope.viewData[metricKey].sortType;

    initializeGroupByParams();

    if(metricKey === 'sales_widget') {
      params.groupBy = $rootScope.groupBy[tab + '-sales'] || $scope.viewData[metricKey].groupBy;
    }

    if(metricKey === 'conversion_widget') {
      params.groupBy = $rootScope.groupBy[tab + '-conversion'] || $scope.viewData[metricKey].groupBy;
    }

    if(metricKey === 'ats_sales_widget') {
      params.groupBy = $rootScope.groupBy[tab + '-ats'] || $scope.viewData[metricKey].groupBy;
    }

    if(metricKey === 'upt_sales_widget') {
      params.groupBy = $rootScope.groupBy[tab + '-upt'] || $scope.viewData[metricKey].groupBy;
    }

    return params;
  }

  function viewIsLoaded() {
    return !ObjectUtils.isNullOrUndefinedOrEmpty($scope.metricsToShow) &&
      $scope.dateRangesLoaded;
  }

  function widgetVariables() {
    return widgetConstants.exportProperties;
  }

  function initializeGroupByParams() {
    _.each($scope.metricsToShow, function(key) {
      if( ObjectUtils.isNullOrUndefined($scope.viewData[key])) {
        $scope.viewData[key] = {};
      }
      if( ObjectUtils.isNullOrUndefined($scope.viewData[key].groupBy)) {
        $scope.viewData[key].groupBy = 'day';
      }
    });
  }

  function initializeSortTypeParams() {
    _.each($scope.metricsToShow, function(key) {
      if( ObjectUtils.isNullOrUndefined($scope.viewData[key])) {
        $scope.viewData[key] = {};
      }
      if( ObjectUtils.isNullOrUndefined($scope.viewData[key].sortType)) {
        $scope.viewData[key].sortType = '-periodValues';
      }
    });
  }
}]);
