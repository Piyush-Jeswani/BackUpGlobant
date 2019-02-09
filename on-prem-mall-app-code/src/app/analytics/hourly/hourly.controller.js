'use strict';

angular.module('shopperTrak')
  .controller('HourlyController', [
    '$scope',
    '$rootScope',
    '$stateParams',
    'currentOrganization',
    'currentZone',
    'currentSite',
    'currentUser',
    'ExportService',
    'SubscriptionsService',
    'LocalizationService',
    'utils',
    'ObjectUtils',
    'customDashboardService',
    'trafficViewService',
    'operatingHoursService',
    'dateRangeService',
    function (
      $scope,
      $rootScope,
      $stateParams,
      currentOrganization,
      currentZone,
      currentSite,
      currentUser,
      ExportService,
      SubscriptionsService,
      LocalizationService,
      utils,
      ObjectUtils,
      customDashboardService,
      trafficViewService,
      operatingHoursService,
      dateRangeService
    ) {
      $scope.currentOrganization = currentOrganization;
      $scope.currentSite = currentSite;
      $scope.zones = currentSite && currentSite.zones;
      $scope.currentZone = currentZone;
      $scope.currentUser = currentUser;
      $scope.sortInfo = {};
      $scope.viewData = {};

      let _currentMetric = 'traffic';

      activate();

      function activate () {
        trafficViewService.setCurrentOrganization(currentOrganization);
        trafficViewService.setCurrentZone(currentZone);
        trafficViewService.setCurrentSite(currentSite);
        $rootScope.customDashboards = false;
        $scope.updateSelectedWeatherMetrics = updateSelectedWeatherMetrics;
        $scope.dateRangesLoaded = dateRangesLoaded();
        $scope.language = LocalizationService.getCurrentLocaleSetting();
        $scope.exportWidget = exportWidget;
        $scope.setSelectedWidget = setSelectedWidget;

        $scope.vm.customDashboards = customDashboardService.getDashboards(currentUser);

        $scope.vm.chartSegments = null;

        $scope.showWeatherMetrics = !ObjectUtils.isNullOrUndefined($scope.currentSite) &&
        $scope.currentUser.preferences.weather_reporting;

        $scope.kpi = {
          name: 'traffic'
        };

        $scope.groupBy = 'hour';
        $scope.showLineHighChartTable = {
          selection: true
        };

        $scope.salesCategoriesTraffic = {
          selection: []
        };

        $scope.salesCategoriesTraffic = {
          selection: []
        };

        $scope.salesCategoriesDailyPerf = {
          selection: []
        };

        $scope.salesCategoriesTrafficWeekday = {
          selection: []
        };

        $scope.trafficOption = {};

        setWatches();

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

        LocalizationService.getAllCalendars().then(calendars => {
          LocalizationService.setAllCalendars(calendars.result);
          LocalizationService.setOrganization($scope.currentOrganization);
          LocalizationService.setUser($scope.currentUser);

          $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, 
            $scope.currentOrganization, $stateParams.activeShortcut);

          $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, 
            $scope.currentOrganization, $stateParams.activeShortcut);
        });

        $scope.operatingHours = operatingHoursService.getOperatingHoursSetting($stateParams, currentOrganization);

        LocalizationService.setUser(currentUser);

        $scope.dateFormat = LocalizationService.getCurrentDateFormat($scope.currentOrganization);

        $scope.isRetail = currentOrganization.portal_settings.organization_type === 'Retail';

        $scope.metricsToShow = ['traffic'];

        trafficViewService.setMetricsToShow($scope.metricsToShow);

        $scope.showMetrics = trafficViewService.isShowMetrics();

        $scope.siteHasLabor = SubscriptionsService.siteHasLabor(currentOrganization, currentSite);

        $scope.siteHasSales = SubscriptionsService.siteHasSales(currentOrganization, currentSite);

        $scope.$on('scheduleExportCurrentViewToPdf', trafficViewService.scheduleExportCurrentViewToPdf.bind(null, $scope));
      }


      function setWatches () {
        /* Date range picker sets the first day of week setting
         according to current user, calendar and organisation. */
        $scope.currentSiteChange = $rootScope.$watch('currentSite', () => {
          $scope.vm.displayType = '';
          $scope.vm.savedTrafficClasses = [];
        });

        $scope.firstDaySettingChange = $rootScope.$watch('firstDaySetting', () => {
          $scope.firstDayOfWeek = $rootScope.firstDaySetting;
        });

        $scope.$on('$destroy', () => {
          if (typeof $scope.currentSiteChange === 'function') {
            $scope.currentSiteChange();
          }
          if (typeof $scope.firstDaySettingChange === 'function') {
            $scope.firstDaySettingChange();
          }
        });
      }

      function updateSelectedWeatherMetrics (metrics) {
        $scope.selectedWeatherMetrics = metrics;
      }

      $scope.onSelectOption = function (_option) {
        const itemIndex = $scope.metricsToShow.indexOf(_currentMetric);

        if (itemIndex > -1) {
          $scope.metricsToShow[itemIndex] = _option.name;
          _currentMetric = _option.name;
        }

      };

      function exportWidget (metricKey, toDashboard) {
        const params = trafficViewService.initExportParam(metricKey, $scope);

        params.partialPageName = 'traffic';
        params.showMetrics = $scope.showMetrics;
        params.showTable = $scope.showLineHighChartTable;

        params.selectedOption = angular.copy($scope.trafficOption.selectedMetric);

        if (!ObjectUtils.isNullOrUndefined(params.selectedOption.metric)) {
          delete params.selectedOption.metric;
        }

        params.groupBy = 'hour';
        params.isHourly = true;
        params.businessDayStartHour = currentSite.business_day_start_hour;
        params.sortInfo = $scope.sortInfo;

        if (toDashboard) {
          customDashboardService.setSelectedWidget(params);
        } else {
          $scope.viewData = params;
          ExportService.createExportAndStore(params);
        }
      }

      $scope.widgetIsExported = trafficViewService.widgetIsExported.bind($scope);

      function setSelectedWidget (title) {
        exportWidget(title, true);
      }

      function dateRangesLoaded () {
        return utils.urlDateParamsLoaded($stateParams);
      }

    }]);
