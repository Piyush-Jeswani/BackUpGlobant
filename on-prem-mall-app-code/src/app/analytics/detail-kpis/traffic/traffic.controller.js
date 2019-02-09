'use strict';

angular.module('shopperTrak')
  .controller('TrafficCtrl', [
    '$scope',
    '$rootScope',
    '$q',
    '$state',
    '$stateParams',
    'currentOrganization',
    'currentZone',
    'currentSite',
    'currentUser',
    'currentEntrance',
    'ExportService',
    'SubscriptionsService',
    'MallCheckService',
    'LocalizationService',
    'utils',
    'ObjectUtils',
    'metricConstants',
    'customDashboardService',
    'trafficViewService',
    'dateRangeService',
    'operatingHoursService',
    'localStorageService',
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
      currentEntrance,
      ExportService,
      SubscriptionsService,
      MallCheckService,
      LocalizationService,
      utils,
      ObjectUtils,
      metricConstants,
      customDashboardService,
      trafficViewService,
      dateRangeService,
      operatingHoursService,
      localStorageService,
      loadingFlagsService
    ) {
      var _currentMetric = 'traffic';
      var loadingFlagUnbind;

      activate();

      function activate() {
        if (!dateRangeService.checkDateRangeIsValid($state)) {
          $state.go($state.current.name, dateRangeService.getNewStateDateParams($state, currentUser, currentOrganization));
        }
        $scope.currentOrganization = currentOrganization;
        $scope.currentSite = currentSite;
        $scope.zones = currentSite.zones;
        $scope.currentZone = currentZone;
        //get zone id from currentZone
        if(currentZone){
          localStorageService.set('selectedZoneId', currentZone.id);
        }
        /* to handle the scenario where the user had added widgets to a custom dashboard at org level,
        but has previously added zone level widgets. */
        else{
          localStorageService.remove('selectedZoneId');
        }
        $scope.currentUser = currentUser;
        $scope.currentEntrance = currentEntrance;
        trafficViewService.setCurrentOrganization(currentOrganization);
        trafficViewService.setCurrentZone(currentZone);
        trafficViewService.setCurrentSite(currentSite);
        $rootScope.customDashboards = false;
        $scope.updateSelectedWeatherMetrics = updateSelectedWeatherMetrics;
        $scope.updateSelectedSalesCategoriesLineChartWidget = updateSelectedSalesCategoriesLineChartWidget;
        $scope.language = LocalizationService.getCurrentLocaleSetting();
        $scope.exportWidget = exportWidget;
        $scope.setSelectedWidget = setSelectedWidget;

        $scope.vm.customDashboards = customDashboardService.getDashboards(currentUser);

        $scope.vm.chartSegments = null;

        $scope.showPerfWidget = MallCheckService.isNotMall(currentSite, currentZone);

        $scope.showWeatherMetrics = !ObjectUtils.isNullOrUndefined($scope.currentSite) &&
          $scope.currentUser.preferences.weather_reporting;

        $scope.kpi = {
          name: 'traffic'
        };

        $scope.salesCategoriesTraffic = {
          selection: []
        };

        $scope.groupBy = 'day';

        $scope.trafficOption = {};

        configureWatches();

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

        LocalizationService.getAllCalendars().then(function (calendars) {
          LocalizationService.setAllCalendars(calendars.result);
          LocalizationService.setOrganization($scope.currentOrganization);
          LocalizationService.setUser($scope.currentUser);

          $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
          $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
        });

        $scope.operatingHours = operatingHoursService.getOperatingHoursSetting($stateParams, currentOrganization);

        LocalizationService.setUser(currentUser);

        $scope.dateFormat = LocalizationService.getCurrentDateFormat($scope.currentOrganization);

        $scope.isRetail = currentOrganization.portal_settings.organization_type === 'Retail';

        initMetricsToShow();

        $scope.showMetrics = trafficViewService.isShowMetrics();

        $scope.siteHasLabor = SubscriptionsService.siteHasLabor(currentOrganization, currentSite);

        $scope.siteHasSales = SubscriptionsService.siteHasSales(currentOrganization, currentSite);

        $scope.viewData = initializeViewData();
        $scope.viewDataInitialized = true;
        $scope.$on('page-loaded', setWidgetExported);
        $scope.widgetVariables = trafficViewService.widgetVariables.bind($scope);
        $scope.onSelectOption = onSelectOption;
      }

      function initMetricsToShow() {
        var metricsToShow = [];

        if (currentEntrance) {
          metricsToShow = ['traffic', 'traffic_per_weekday'];
        } else if (currentZone) {
          metricsToShow = [
            'traffic',
            'entrance_contribution',
            'entrance_contribution_pie',
            'power_hours',
            'traffic_per_weekday'
          ];

          $scope.hasTenantZone = currentZone.type === 'TenantCommon';

          if($scope.showPerfWidget) {
            metricsToShow.push('daily_performance_widget');
          }
        } else if (currentSite && SubscriptionsService.siteHasPerimeter(currentOrganization, currentSite)) {
          var tenant = ['TenantCommon'];
          var otherAreas = ['TenantCommon', 'Entrance', 'TotalProp'];

          metricsToShow = [
            'traffic',
            'entrance_contribution',
            'entrance_contribution_pie',
            'power_hours',
            'traffic_per_weekday'];

          if (trafficViewService.hasZonesWithType(tenant)) {
            metricsToShow.push('tenant_traffic_table_widget');
          }

          var isSingleDaySelected = dateRangeService.isSingleDaySelected($scope.dateRange.start, $scope.dateRange.end);

          if($scope.showPerfWidget && !isSingleDaySelected) {
            metricsToShow.push('daily_performance_widget');
          }

          // Other areas widget should contain all types
          // except the ones listed in otherAreas variable
          if (trafficViewService.hasZonesWithType(otherAreas, true)) {
            metricsToShow.push('other_areas_traffic_table_widget');
          }
        } else if (currentSite && !SubscriptionsService.siteHasPerimeter(currentOrganization, currentSite)) {
          metricsToShow = ['traffic', 'traffic_per_weekday'];
        }

        if (($scope.isRetail || $scope.hasTenantZone) && !currentEntrance ) {
          metricsToShow.unshift('kpi_summary_widget_container');
        }


        setShowEntranceSummary();

        if (!$scope.showEntranceSummary) {
          removeMetric(metricsToShow, 'entrance_contribution');
          removeMetric(metricsToShow, 'entrance_contribution_pie');
        }

        swapDailyAvgesDailyPerfWidgetOrder(metricsToShow);

        $scope.metricsToShow = metricsToShow;

        $scope.isLoading = {};

        _.each(metricsToShow, function(metric) {
          $scope.isLoading[metric] = true;
        });

        trafficViewService.setMetricsToShow($scope.metricsToShow);
      }

      function setWidgetExported() {
        $scope.widgetIsExported = trafficViewService.widgetIsExported.bind($scope);
      }

      /**
       * SA-2370. On the site-level traffic tab view, the daily performance indicator widget
       * should appear before the daily averages widget, but after the power hours widget.
       * The function below will swap the order of display for theses 2 widgets IF they BOTH exist.
       * Argument is the array for the order of the widgets to show.
       *
       * @param {array} metricsToShow the metricsToShow
       */
      function swapDailyAvgesDailyPerfWidgetOrder(metricsToShow) {
        var a = metricsToShow.indexOf('traffic_per_weekday'),
          b = metricsToShow.indexOf('daily_performance_widget');

        if ((a !== -1) && (b !== -1)) {
          // Swap the widgets around now because they both exist in the array

          // Take temporary copy of 'traffic_per_weekday'
          var temp = metricsToShow[a];

          // Replace 'traffic_per_weekday' with 'daily_performance_widget'
          metricsToShow[a] = metricsToShow[b];

          // Replace 'daily_performance_widget' with 'traffic_per_weekday'
          metricsToShow[b] = temp;
        }
      }

      function removeMetric(metrics, metric) {
        for(var i = metrics.length; i--;) {
          if(metrics[i] === metric) {
            metrics.splice(i, 1);
          }
        }
      }

    /** Sets a scope level flag to specify if entrance contribution widgets should be shown or not.
     *  This scope level flag is used in the UI, as well as in this controller to specify which wigdets should ne
     *  added to the export cart when a page wide export is done.
     *
     *  Entrance contribution widgets are only shown if there is more than one TMP in the current site / zone.
     *  The passby zone is not included in this count. This may need to be expanded in future to exclude more zone types.
     *
     **/
      function setShowEntranceSummary() {
        try {
          if (ObjectUtils.isNullOrUndefinedOrEmptyObject(currentZone) && (currentSite.zones.length > 1 || (currentSite.zones && currentSite.zones[0].tmps.length > 1))) {
            if(currentSite.zones.length === 2){
              var show = true;
              _.each(currentSite.zones, function(zone){
                if (zone.type === 'PASSBY') show = false;
              })
              return $scope.showEntranceSummary = show;
            }
            return $scope.showEntranceSummary = true;
          }

          if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(currentZone) && !ObjectUtils.isNullOrUndefined(currentZone.tmps) && currentZone.tmps.length > 1) {
            return $scope.showEntranceSummary = true;
          }
          return $scope.showEntranceSummary = false;
        } catch (e) {
          $scope.showEntranceSummary = true;
        }
      }

      function goToHourlyDrilldown(event, data) {
        $state.go('analytics.organization.site.hourly', {
          orgId: $stateParams.orgId,
          siteId: $stateParams.siteId,
          day: data.label,
          compareRange1Start: event.currentScope.compareRange1.start,
          compareRange1End: event.currentScope.compareRange1.end,
          compareRange2Start: event.currentScope.compareRange2.start,
          compareRange2End: event.currentScope.compareRange2.end,
          dateRangeStart: event.currentScope.dateRange.start,
          dateRangeEnd: event.currentScope.dateRange.end
        });
      }

      function configureWatches() {
        var unbindFunctions = [];

        unbindFunctions.push($rootScope.$watch('currentSite', onCurrentSiteChange));
        unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySettingChange));
        unbindFunctions.push($scope.$watch('currentZone', onZoneChange));
        unbindFunctions.push($scope.$watch('kpi', onSelectedMetricChange));
        unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', trafficViewService.scheduleExportCurrentViewToPdf.bind(null, $scope)));
        unbindFunctions.push($scope.$on('goToHourlyDrilldown', goToHourlyDrilldown));
        loadingFlagUnbind = $scope.$watchCollection('isLoading', onLoadingFlagsChange);

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

      function onSelectOption(_option) {
        var itemIndex = $scope.metricsToShow.indexOf(_currentMetric);
        var metric = _currentMetric;

        if(itemIndex > -1) {
          $scope.metricsToShow[itemIndex] = _option.name;
          _currentMetric = _option.name;
          $scope.viewData[_option.name] = angular.copy($scope.viewData[metric]);
          $scope.viewData[_option.name].name = _option.name;
          $scope.viewData[_option.name].kpi = _option.name;
          $scope.viewData[_option.name].selectedOption = _option;
        }
      }

      function onCurrentSiteChange() {
        if( ObjectUtils.isNullOrUndefined($scope.viewData.power_hours)) {
          $scope.viewData.power_hours = {};
        }

        $scope.viewData.power_hours.displayType = '';

        $scope.vm.savedTrafficClasses = [];
      }

      function onFirstDaySettingChange() {
        $scope.firstDayOfWeek = $rootScope.firstDaySetting;
      }

      function onZoneChange() {
        $rootScope.groupBy = {};
      }

      function onSelectedMetricChange() {
        if (ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return;
        }

        if (ObjectUtils.isNullOrUndefined($scope.viewData[$scope.kpi.name])) {
          $scope.viewData[$scope.kpi.name] = {
            partialPageName : 'traffic'
          };
        } else {
          $scope.viewData[$scope.kpi.name].partialPageName = 'traffic';
        }
      }

      function updateParamsForKpiSummary(params) {
        params.orgId = $scope.currentSite.organization.id;
        params.siteId = $scope.currentSite.site_id;
        params.zoneId = !ObjectUtils.isNullOrUndefined($scope.currentZone) ? $scope.currentZone.id : undefined;
        params.dateRange = $scope.dateRange;
        params.compareRange1 = { start: $scope.compareRange1.start, end: $scope.compareRange1.end };
        params.compareRange1Type = $scope.compareRange1Type;
        params.compareRange2 = { start: $scope.compareRange2.start, end: $scope.compareRange2.end };
        params.compareRange2Type = $scope.compareRange2Type;
        params.operatingHours = $scope.operatingHours;
        params.firstDayOfWeekSetting = $scope.firstDayOfWeek;
        params.siteHasLabor = $scope.siteHasLabor;
        params.siteHasSales = $scope.siteHasSales;
        return params;
      }

      function updateParamsForPerWeekDay(params) {
        if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return params;
        }

        if(ObjectUtils.isNullOrUndefined($scope.viewData[params.name])) {
          return params;
        }

        params.orderTable = $scope.viewData[params.name].orderTable;
        params.orderReverse = $scope.viewData[params.name].orderReverse;
        params.showTable = $scope.viewData[params.name].showTable;
        params.salesCategories = angular.copy($scope.viewData[params.name].salesCategories);
        params.currentZone = $scope.currentZone;
        params.organizationId = '' + $scope.currentOrganization.organization_id;
        params.selectedMetric = $scope.viewData[params.name].selectedMetric;
        getDays(params);
        return params;
      }

      function updateParamsForPerformanceDaily(params) {
        if(typeof ObjectUtils.getNestedProperty($scope, 'viewData.daily_performance_widget.selectedDays') === 'undefined') {
          return params;
        }

        params.showTable = $scope.viewData[params.name].showTable;
        params.orderTable = $scope.viewData[params.name].orderTable;
        params.orderDirection = $scope.viewData[params.name].orderDirection;
        getDays(params);
        params.salesCategories = angular.copy($scope.viewData[params.name].salesCategories);
        return params;
      }

      function getDays(params) {
        var propName = 'viewData.' + params.name + '.selectedDays';

        if(angular.isUndefined(ObjectUtils.getNestedProperty($scope, propName))) {
          return;
        }

        params.selectedDays = $scope.viewData[params.name].selectedDays;
        _.each(params.selectedDays, function(day){
          delete day.transkey;
        });
      }

      function updateParamsForEntranceZone(params, metricKey) {
        if(typeof ObjectUtils.getNestedProperty($scope, 'viewData['+metricKey+']') === 'undefined') {
          return params;
        }

        params.filterQuery = $scope.viewData[metricKey].zoneFilterQuery;
        params.orderBy = $scope.viewData[metricKey].sortType;
        params.comparisonColumnIndex = $scope.viewData[metricKey].comparisonColumnIndex;
        params.childProperty = $scope.viewData[metricKey].childProperty;

        return params;
      }

      function updateParamsForTraffic(params, metricKey) {
        if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return params;
        }

        if(ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
          return params;
        }

        if(metricKey === 'sales' || metricKey === 'conversion' || metricKey === 'ats') {
          params.salesCategories = angular.copy($scope.viewData[metricKey].salesCategories);
        }

        params.partialPageName = 'traffic'; // make sure it gets pdf traffic partial

        params.showMetrics = $scope.showMetrics;
        if(!ObjectUtils.isNullOrUndefined($scope.viewData[params.name])) {
          params.selectedOption = $scope.viewData[params.name].selectedOption;
        }

        if(params.showWeatherMetrics) {
          params.weather = [];
          _.each(params.selectedWeatherMetrics, function(weatherMetric) {
            params.weather.push(weatherMetric.kpi);
          });
          delete params.selectedWeatherMetrics;
        }

        return params;
      }

      function exportWidget(metricKey, toDashboard) {
        if(metricKey === 'traffic') {
          metricKey = $scope.kpi.name;
        }

        var params = initExportParam(metricKey);

        if (toDashboard) {
          if (!ObjectUtils.isNullOrUndefinedOrEmpty(params.partialPageName)) {
            params.name = params.partialPageName; // params.name is used by the custom dashboard to determine which view to use
          }

          customDashboardService.setSelectedWidget(params);
        } else {
          ExportService.createExportAndStore(params);
        }
      }

      function getGroupBy(metricKey) {
        if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return;
        }

        if(ObjectUtils.isNullOrUndefined($scope.viewData[metricKey])) {
          return;
        }

        var groupByKey = metricKey;
        if(metricKey === 'traffic' && metricKey !== $scope.kpi.name) {
          groupByKey = $scope.kpi.name;
        }
        return $rootScope.groupBy[$state.current.views.analyticsMain.controller.toString() + '-' + groupByKey] || $scope.viewData[metricKey].groupBy || 'day';
      }

      function initializeViewData() {
        // When loading the view, create object holding all widget configuration variables.
        // This object is used when storing export or when determinating if widget is already in the export cart
        // with current configuration.

        var configuration = {};

        _.each($scope.metricsToShow, function(metricKey) {
          configuration[metricKey] = initExportParam(metricKey);
        });

        return configuration;
      }

    /**
     * Returns an object representing the passed in metric.
     * Should be used when exporting to the PDF of custom dashboard
     *
     * @param {string} metricKey - The widget key to export
     * @returns {object} The object representing with widget with all options set
     */
      function initExportParam(metricKey) {
        var params = trafficViewService.initExportParam(metricKey, $scope);

        switch (metricKey) {
          case 'kpi_summary_widget_container':
            params = updateParamsForKpiSummary(params);
            params.salesCategories = getPropFromViewData(metricKey, 'salesCategories');
            break;
          case 'entrance_contribution':
          case 'zone_traffic_summary':
          case 'entrance_contribution_pie':
            params.chartSegments = getPropFromViewData(metricKey, 'chartSegments');
          case 'other_areas_traffic_table_widget':
            params = updateParamsForEntranceZone(params, metricKey);
            break;
          case 'tenant_traffic_table_widget':
            params = updateParamsForEntranceZone(params, metricKey);
            break;
          case 'power_hours':
            params.displayType = getPropFromViewData(metricKey, 'displayType');
            params.pdfOrientation = getPropFromViewData(metricKey, 'pdfOrientation');
            params.savedTrafficClasses = getPropFromViewData(metricKey, 'savedTrafficClasses');
            params.salesCategories = getPropFromViewData(metricKey, 'salesCategories');
            break;
          case 'traffic_per_weekday':
            params = updateParamsForPerWeekDay(params);
            break;
          case 'daily_performance_widget':
            params = updateParamsForPerformanceDaily(params);
            break;
          default:
            params = updateParamsForTraffic(params, metricKey);
        }

        params.groupBy = getGroupBy(metricKey);

        if (isEntrancePage()) {
          params.entranceId = currentEntrance.id;
          params.showMetrics = false;
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


      function isEntrancePage() {
        return !ObjectUtils.isNullOrUndefined(currentEntrance);
      }

      function setSelectedWidget(title) {
        exportWidget(title, true);
      }

    /**
     * Updates the relevant viewData object with the selected weather metrics.
     * This function is passed into the LineHighChartWidget, where it is called from
     * This is needed as the weather selection is represented in a different way on the PDF export and in custom dashboards.
     * This function essentially maps the selection to match the necessary format
     *
     * @param {[]object} weatherMetrics - The newly selected weather metrics
     */
      function updateSelectedWeatherMetrics(weatherMetrics) {
        $scope.selectedWeatherMetrics = weatherMetrics;
        if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return;
        }

        if(ObjectUtils.isNullOrUndefined($scope.viewData[$scope.kpi.name])) {
          return;
        }

        var weather = [];

        _.each($scope.selectedWeatherMetrics, function(weatherMetric) {
          weather.push(weatherMetric.kpi);
        });

        $scope.viewData[$scope.kpi.name].weather = weather;
      }

    /**
     * Updates the relevant viewData object with the selected sales categories.
     * This function is passed into the LineHighChartWidget, where it is called from.
     * This is needed as the metricKey property that the UI is bound to changes when the user changes the selected metric.
     * This leads to binding problems in angular, so this function is needed to fully wire the selection up.
     * This function should only need to be called by the LineHighChartWidget directive
     *
     * @param {[]object} salesCategories - The newly selected sales categories
     */
      function updateSelectedSalesCategoriesLineChartWidget(salesCategories) {
        if(ObjectUtils.isNullOrUndefined($scope.viewData)) {
          return;
        }

        if(ObjectUtils.isNullOrUndefined($scope.viewData[$scope.kpi.name])) {
          return;
        }

        $scope.viewData[$scope.kpi.name].salesCategories = angular.copy(salesCategories);
      }

    }]);
