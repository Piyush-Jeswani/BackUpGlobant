(function() {
    'use strict';

    angular.module('shopperTrak')
      .controller('VisitorBehaviorCtrl', VisitorBehaviorCtrl);

    VisitorBehaviorCtrl.$inject = [
      '$scope',
      '$rootScope',
      '$state',
      '$stateParams',
      'currentLocation',
      'currentSite',
      'currentOrganization',
      'currentUser',
      'LocalizationService',
      '$translate',
      'ExportService',
      'utils',
      'customDashboardService',
      'ObjectUtils',
      'widgetConstants',
      'dateRangeService',
      'loadingFlagsService'
    ];

    function VisitorBehaviorCtrl(
      $scope,
      $rootScope,
      $state,
      $stateParams,
      currentLocation,
      currentSite,
      currentOrganization,
      currentUser,
      LocalizationService,
      $translate,
      ExportService,
      utils,
      customDashboardService,
      ObjectUtils,
      widgetConstants,
      dateRangeService,
      loadingFlagsService
    ) {
      var vm = this;
      var loadingFlagUnbind;

      activate();

      function activate() {
        initScope();
        
        loadTranslations();
  
        configureWatches();

        setupLocalization();
  
        vm.metricsToShow = getMetricsToShow();
  
        getKpiValuesForKpi();

        setupLocationId();

        if (vm.kpiValues && vm.kpiValues.average_percent_shoppers) {
          vm.kpiValues.average_percent_shoppers = 'average_percent_shoppers';
        }
      }

      function initScope() {
        $scope.$on('page-loaded', setWidgetExported);
        vm.currentOrganization = currentOrganization;
        vm.currentSite = currentSite;
        vm.currentLocation = currentLocation;
        vm.currentUser = currentUser;
        vm.dateRangesLoaded = dateRangesLoaded();
        vm.defaultMultiplier = 100;
        vm.kpiValues = {};
        vm.viewData = {};
        vm.isLoading = {};

        vm.dateRange = {
          start: $stateParams.dateRangeStart,
          end: $stateParams.dateRangeEnd
        };
  
        vm.compareRange1 = {
          start: $stateParams.compareRange1Start,
          end: $stateParams.compareRange1End
        };
  
        vm.compareRange2 = {
          start: $stateParams.compareRange2Start,
          end: $stateParams.compareRange2End
        };
      }

      function configureWatches() {
        var unbindFunctions = [];

        unbindFunctions.push($scope.$watch('vm.currentLocation', onCurrentLocationChange));

        var loadingWatchArray = [
          'vm.metricsToShow', 
          'vm.dateRangesLoaded', 
          'vm.selectedWeatherMetrics',
          'vm.firstDayOfWeek'
        ];

        unbindFunctions.push($scope.$watchGroup(loadingWatchArray, onLoadingChange));
        unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySettingChange));
        unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf));

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

      function setupLocalization() {
        LocalizationService.setOrganization(currentOrganization);
        LocalizationService.setUser(currentUser);
        vm.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);
  
        LocalizationService.getAllCalendars().then(function (calendars) {
          LocalizationService.setAllCalendars(calendars.result);

          // Call the date range service to set to compare ranges wrt the selected date range by the user.
          vm.compareRange1 = dateRangeService.getCustomPeriod(vm.dateRange, vm.currentUser, vm.currentOrganization, $state.dateRangeShortCut, 'compare1Range', undefined, false);
          vm.compareRange2 = dateRangeService.getCustomPeriod(vm.dateRange, vm.currentUser, vm.currentOrganization, $state.dateRangeShortCut, 'compare2Range', undefined, undefined);                                   ;
                    
          vm.compareRange1Type = dateRangeService.getCompareType(vm.dateRange, vm.compareRange1, vm.currentUser, vm.currentOrganization, $stateParams.activeShortcut);
          vm.compareRange2Type = dateRangeService.getCompareType(vm.dateRange, vm.compareRange2, vm.currentUser, vm.currentOrganization, $stateParams.activeShortcut);
        });
      }

      function setupLocationId() {
        if(currentLocation) {
          vm.currentLocationId = vm.currentLocation.location_id;
        } else if(vm.currentSite.location_id !== undefined) {
          vm.currentLocationId = vm.currentSite.location_id;
        }
      }

      function onCurrentLocationChange() {
        $rootScope.groupBy = {};
      }

      function onLoadingChange() {
        if(viewIsLoaded()) {
          vm.viewData = initializeViewData();
        }
      }

      /* Date range picker sets the first day of week setting
         according to current user, calendar and organisation. */
      function onFirstDaySettingChange() {
        vm.firstDayOfWeek = $rootScope.firstDaySetting;
      }

      function onLoadingFlagsChange(loadingFlags) {
        loadingFlagsService.onLoadingFlagsChange(loadingFlags, loadingFlagUnbind);
      }
  
      function removeLoadingFlagWatch() {
        if(angular.isFunction(loadingFlagUnbind)) {
          loadingFlagUnbind();
        }
      }

      function setDateGroup(_param, _widget) {
        var kpi = vm.kpiValues[_widget];
        var groupBy = $rootScope.groupBy[$state.current.views.analyticsMain.controller.toString() + '-' + kpi];

        if( !ObjectUtils.isNullOrUndefined(groupBy) ) {
          _param.groupBy = groupBy;
        }
      }

      function scheduleExportCurrentViewToPdf() {
        _.each(vm.metricsToShow, function(value) {
          var params = vm.viewData[value];
          setDateGroup(params, value);
          ExportService.addToExportCartAndStore(getAreaKey(), vm.dateRange, vm.compareRange1, vm.compareRange2, params);
        });

        $state.go('pdfexport', {orgId: currentOrganization.organization_id, view: 'schedule'});
      }

      function getAreaKey() {
        var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
        if (currentLocation) {
          areaKey += '_location_' + currentLocation.location_id;
        } else if(currentSite.location_id !== undefined) {
          areaKey += '_location_' + currentSite.location_id;
        }
        return areaKey;
      }

      vm.exportWidget = function(metricKey, toDashboard) {
        initializeViewData();
        var params = vm.viewData[metricKey];

        if (toDashboard) {
          customDashboardService.setSelectedWidget(params);
        } else {
          ExportService.createExportAndStore(params);
        }
      };

      function getGroupBy(metricKey) {
        return $rootScope.groupBy[$state.current.views.analyticsMain.controller.toString() + '-' + metricKey] || vm.viewData[metricKey].groupBy || 'day';
      }

      function setWidgetExported() {
        vm.widgetIsExported = widgetIsExported;
      }

      function widgetIsExported(metricKey, params) {
        const exports = ExportService.getCart();
        if(ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)){
          //if the export cart is empty there is nothing to check so return false (all export buttons can be enabled). 
          return false;
        }

        const dateRangeKey =
        vm.dateRange.start +
        ' - ' +
        vm.dateRange.end +
        ' - ' +
        vm.compareRange1.start +
        ' - ' +
        vm.compareRange1.end +
        ' - ' +
        vm.compareRange2.start +
        ' - ' +
        vm.compareRange2.end;

        const exportKey = _.keys(exports)[0];
        const exportItem = exports[exportKey];

        if(_.isUndefined(exports[exportItem][dateRangeKey])) {
          //no exports for the current date range, widget exports can be enabled
          return false;
        }

        const exportMetrics = _.pluck(exportItem[dateRangeKey].metrics, 'name');
  
        if(!exportMetrics.includes(metricKey)) {
          //if the widget type is not in the export cart, nothing needs to be checked, the export button for this widget can be enabled. 
          return false;
        }
        
  
        const paramsToCompare = widgetVariables()[metricKey];

        return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, metricKey, params, paramsToCompare);
      }

      vm.setSelectedWidget = function(metricKey) {
        vm.exportWidget(metricKey, true);
      };

      function getMetricsToShow() {
        var widgets = [];

        if (currentLocation === null ) {
          widgets = [
            'visitor_behaviour_traffic',
            'loyalty',
            'gross_shopping_hours',
            'detail_dwell_time',
            'detail_opportunity',
            'detail_draw_rate'
          ];
          if(currentSite.type==='Retailer') {
            widgets.push('detail_abandonment_rate');
          } else {
            widgets.push('average_percent_shoppers');
          }
        } else if (currentLocation.location_type === 'Store') {
          widgets = [
            'visitor_behaviour_traffic',
            'loyalty',
            'gross_shopping_hours',
            'detail_dwell_time',
            'detail_opportunity',
            'detail_draw_rate',
            'detail_abandonment_rate'
          ];
        } else if (currentLocation.location_type === 'Floor') {
          widgets = [
            'visitor_behaviour_traffic',
            'detail_dwell_time',
            'gross_shopping_hours',
            'loyalty'
          ];
        } else if (currentLocation.location_type === 'Entrance' || currentLocation.location_type === 'Zone') {
          widgets = [
            'visitor_behaviour_traffic',
            'loyalty',
            'gross_shopping_hours',
            'detail_dwell_time',
            'detail_opportunity',
            'detail_draw_rate'
          ];
        } else {
          widgets = [
            'visitor_behaviour_traffic',
            'loyalty',
            'gross_shopping_hours',
            'detail_dwell_time'
          ];
        }

        $scope.isLoading = {};
        
        _.each(widgets, function(metric) {
          $scope.isLoading[metric] = true;
        });

        return widgets;
      }

      function getKpiValuesForKpi(){
        vm.kpiValues.visitor_behaviour_traffic ='visitor_behaviour_traffic';
        vm.kpiValues.loyalty ='traffic';
        vm.kpiValues.gross_shopping_hours ='gsh';
        vm.kpiValues.detail_dwell_time ='dwell_time';
        vm.kpiValues.detail_opportunity ='opportunity';
        vm.kpiValues.detail_draw_rate ='draw_rate';
        vm.kpiValues.detail_abandonment_rate ='abandonment_rate';
        vm.kpiValues.average_percent_shoppers = 'average_percent_shoppers';
      }

      function dateRangesLoaded() {
        return utils.urlDateParamsLoaded($stateParams);
      }

      function loadTranslations() {
        vm.language = LocalizationService.getCurrentLocaleSetting();
        $translate.use(vm.language);
      }

      function initializeViewData() {
        var configuration = {};
        initializeGroupByParams();

        _.each(vm.metricsToShow, function(metricKey) {
          configuration[metricKey] = initExportParam(metricKey);
        });

        return configuration;
      }

      function initExportParam(metricKey) {

        var params;

        params = {
          orgId: currentSite.organization.id,
          siteId: currentSite.site_id,
          dateRange: { start: vm.dateRange.start, end: vm.dateRange.end },
          dateRangeType: utils.getDateRangeType(vm.dateRange, currentUser, currentOrganization),
          compare1Range: { start: vm.compareRange1.start, end: vm.compareRange1.end },
          compare2Range: { start: vm.compareRange2.start, end: vm.compareRange2.end },
          compare1Type: vm.compareRange1Type,
          compare2Type: vm.compareRange2Type,
          dateFormat: vm.dateFormat,
          dateRangeShortCut: $state.rangeSelected,
          customRange:  $state.customRange,
          language: vm.language,
          firstDayOfWeekSetting: vm.firstDayOfWeek,
          name: metricKey,
          kpi: vm.kpiValues[metricKey]
        };

        setDateGroup(params, metricKey);

        if(params.dateRangeShortCut === 'custom' && params.customRange === null) {
          params.xDaysBack = moment().diff(params.dateRange.start, 'days');
          params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
        }

        if (currentLocation) {
          params.locationId = currentLocation.location_id;
        } else if(currentSite.location_id !== undefined) {
          params.locationId = currentSite.location_id;
        }

        if (metricKey === 'visitor_behaviour_traffic') {
          params.displayUniqueReturning = true;
        }

        params.groupBy = getGroupBy(metricKey);

        return params;
      }

      function viewIsLoaded() {
        return !ObjectUtils.isNullOrUndefinedOrEmpty(vm.metricsToShow) && vm.dateRangesLoaded;
      }

      function widgetVariables() {
        return widgetConstants.exportProperties;
      }

      function initializeGroupByParams() {
        _.each(vm.metricsToShow, function(key) {
          if( ObjectUtils.isNullOrUndefined(vm.viewData[key])) {
            vm.viewData[key] = {};
          }
          if( ObjectUtils.isNullOrUndefined(vm.viewData[key].groupBy)) {
            vm.viewData[key].groupBy = 'day';
          }
        });
      }

  }
})();
