'use strict';

angular.module('shopperTrak')
.controller('LaborCtrl', [
  '$scope',
  '$rootScope',
  '$q',
  '$state',
  '$stateParams',
  'currentOrganization',
  'currentZone',
  'currentSite',
  'currentUser',
  'ExportService',
  'LocalizationService',
  'utils',
  'customDashboardService',
  'ObjectUtils',
  'widgetConstants',
  'dateRangeService',
  'loadingFlagsService',
function (
  $scope,
  $rootScope,
  $q,
  $state,
  $stateParams,
  currentOrganization,
  currentZone,
  currentSite,
  currentUser,
  ExportService,
  LocalizationService,
  utils,
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
    initMetricsToShow();
    getKpiValuesForKpi();
  }

  function initScope() {
    $scope.currentOrganization = currentOrganization;
    $scope.currentSite = currentSite;
    $scope.zones = currentSite.zones;
    $scope.currentZone = currentZone;
    $scope.dateRangesLoaded = dateRangesLoaded();
    $scope.scheduleExportCurrentViewToPdf = scheduleExportCurrentViewToPdf;
    $scope.kpiValues = {};
    $scope.viewData = {};

    $scope.exportWidget = exportWidget;
    $scope.setSelectedWidget = setSelectedWidget;

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
    unbindFunctions.push($scope.$watch('currentZone'), onCurrentZoneChange);
    unbindFunctions.push(unbindFunctions.push($scope.$on('page-loaded', setWidgetExported)));

    var loadWatchArray = [
      'metricsToShow',
      'dateRangesLoaded',
      'selectedWeatherMetrics',
      'firstDayOfWeek'
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
    $scope.dateFormat = LocalizationService.getCurrentDateFormat(org);

    LocalizationService.getAllCalendars().then(function (calendars) {
      LocalizationService.setAllCalendars(calendars.result);
      LocalizationService.setOrganization(org);
      $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, user, org, $stateParams.activeShortcut);
      $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, user, org, $stateParams.activeShortcut);
    });
  }

  function initMetricsToShow() {
    if (currentSite.type === 'Mall' && currentZone === null) {
      $scope.metricsToShow = [
        'tenant_labor_hours_table_widget',
        'tenant_star_labor_table_widget'
      ];
    } else {
      $scope.metricsToShow = [
        'labor_hours_widget',
        'star_labor_widget'
      ];
    }

    $scope.loadingFlags = {};

    _.each($scope.metricsToShow, function(metric) {
      $scope.loadingFlags[metric] = true;
    });
  }

  function getKpiValuesForKpi() {
    $scope.kpiValues.labor_hours_widget = 'labor_hours';
    $scope.kpiValues.star_labor_widget = 'star';
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

    if (toDashboard) {
      customDashboardService.setSelectedWidget(params);
    } else {
      ExportService.createExportAndStore(params);
    }
  };

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

    _.each($scope.metricsToShow, function (value) {
      $scope.exportWidget(value);
    });

    $state.go('pdfexport', { orgId: currentOrganization.organization_id, view: 'schedule' });
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

    params = {
      orgId: currentSite.organization.id  ,
      siteId: currentSite.site_id,
      dateRange: { start: $scope.dateRange.start, end: $scope.dateRange.end },
      dateRangeType: getDateRangeType(),
      compare1Range: { start: $scope.compareRange1.start, end: $scope.compareRange1.end },
      compare2Range: { start: $scope.compareRange2.start, end: $scope.compareRange2.end },
      compare1Type: $scope.compareRange1Type,
      compare2Type: $scope.compareRange2Type,
      dateFormat: $scope.dateFormat,
      language: $scope.language,
      firstDayOfWeekSetting: $scope.firstDayOfWeek,
      name: metricKey,
      dateRangeShortCut: $state.rangeSelected,
      customRange:  $state.customRange,
      groupBy: 'day' //default
    };

    if(metricKey === 'tenant_star_labor_table_widget' || metricKey === 'tenant_labor_hours_table_widget') {
      params.filterQuery = $scope.viewData[metricKey].zoneFilterQuery;
      params.orderBy = $scope.viewData[metricKey].sortType;
    }

    if(params.dateRangeShortCut === 'custom' && params.customRange === null) {
      params.xDaysBack = moment().diff(params.dateRange.start, 'days');
      params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
    }

    if (currentZone) {
      params.zoneId = currentZone.id;
    }

    if(metricKey === 'labor_hours_widget' && !ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
      params.groupBy = $scope.viewData[metricKey].groupBy || 'day';
    }

    if(metricKey === 'star_labor_widget' && !ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
      params.groupBy = $scope.viewData[metricKey].groupBy || 'day';
    }

    if(metricKey === 'labor_hours_widget' || metricKey === 'star_labor_widget') {
      params.kpi = $scope.kpiValues[metricKey]
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

}]);
