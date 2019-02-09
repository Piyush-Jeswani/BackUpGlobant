(function () {
  'use strict';
  angular.module('shopperTrak').controller('UsageOfAreasCtrl', UsageOfAreasCtrl);

  UsageOfAreasCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    'resourceUtils',
    'currentLocation',
    'currentSite',
    'currentOrganization',
    'currentUser',
    'LocalizationService',
    'ExportService',
    'locations',
    'utils',
    '$translate',
    'ObjectUtils',
    'customDashboardService',
    'dateRangeService',
    'loadingFlagsService'
  ];

  function UsageOfAreasCtrl(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    resourceUtils,
    currentLocation,
    currentSite,
    currentOrganization,
    currentUser,
    LocalizationService,
    ExportService,
    locations,
    utils,
    $translate,
    ObjectUtils,
    customDashboardService,
    dateRangeService,
    loadingFlagsService
  ) {

    var defaultLocationTypeOptions;
    var loadingFlagUnbind;

    activate();

    function activate() {
      initScope();
      setupLocalization();
      setupWidgets();
      configureWatches();
    }

    function initScope() {
      $scope.currentSite = currentSite;
      $scope.currentLocation = currentLocation;
      $scope.currentOrganization = currentOrganization;
      $scope.currentUser = currentUser;
      $scope.locations = locations;
      $scope.dateRangesLoaded = dateRangesLoaded();
      $scope.selectedFloors = {};
  
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
  
      $scope.exportWidget = exportWidget;
      $scope.setSelectedWidget = setSelectedWidget;
      $scope.goToLocation = goToLocation;
      $scope.siteHasCompatibleLocations = siteHasCompatibleLocations;
  
      defaultLocationTypeOptions = [{
        locationType: 'Store',
        displayName: 'usageOfAreasView.STORES',
        color: 'green'
      }, {
          locationType: 'Corridor',
          displayName: 'usageOfAreasView.CORRIDORS',
          color: 'orange'
        }, {
          locationType: 'Entrance',
          displayName: 'usageOfAreasView.ENTRANCES'
        }, {
          locationType: 'Department',
          displayName: 'usageOfAreasView.DEPARTMENTS'
        }];
      
      setWidgetExported()
    }

    function configureWatches() {
      var unbindFunctions = [];

      unbindFunctions.push($rootScope.$watch('firstDaySetting', onFirstDaySettingChange));
      unbindFunctions.push($scope.$on('floorSelected', onFloorSelectionChange));
      unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf));
      unbindFunctions.push($scope.$watch('$scope.locations', onLocationsChange));

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
      LocalizationService.setUser(currentUser);
      $scope.dateFormat = LocalizationService.getCurrentDateFormat($scope.currentOrganization);
      $scope.numberFormatName = LocalizationService.getCurrentNumberFormatName($scope.currentUser, $scope.currentOrganization);

      LocalizationService.getAllCalendars().then(function (calendars) {
        LocalizationService.setAllCalendars(calendars.result);
        LocalizationService.setOrganization($scope.currentOrganization);
        LocalizationService.setUser($scope.currentUser);
        loadTranslations();

        $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
        $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, $scope.currentOrganization, $stateParams.activeShortcut);
      });
    }

    function setupWidgets() {
      var atLeastOneLocationHasGeometry = locations.some(resourceUtils.locationHasGeometry);
      
      $scope.widgetsToShow = getWidgetsToShow(!$stateParams.locationId, atLeastOneLocationHasGeometry);
      $scope.widgetsKpis = {};

      _.map($scope.widgetsToShow, function(widgetType) {
        var kpi;

        if(widgetType === 'traffic_percentage_location') {

          kpi = 'traffic_percentage';

        } else if(widgetType === 'traffic_percentage_correlation') {

          kpi = 'traffic_correlation';

        } else {

          kpi = widgetType;

        }

        $scope.widgetsKpis[widgetType] = kpi;
      });

      $scope.isLoading = {};
      
      _.each($scope.widgetsToShow, function(metric) {
        $scope.isLoading[metric] = true;
      });

      $scope.locationTypeOptions = defaultLocationTypeOptions.filter(function (option) {
        return locations.some(function (location) {
          return location.location_type === option.locationType;
        });
      });

      $scope.widgetContainerClassNames = atLeastOneLocationHasGeometry ? 'col-sm-12' : 'col-md-4';

      $scope.locationTypes = $stateParams.locationTypeFilter ? [$stateParams.locationTypeFilter] : ['Store', 'Corridor', 'Entrance', 'Department'];
    }

    /* Date range picker sets the first day of week setting
       according to current user, calendar and organisation. */
    function onFirstDaySettingChange() {
      $scope.firstDayOfWeek = $rootScope.firstDaySetting;
    }

    function onFloorSelectionChange(e, data) {
      var kpi = data.kpi;
      $scope.selectedFloors[kpi] = data.floorNum;
    }

    function onLocationsChange() {
      $scope.uniqueLocationTypes = getUniqueLocationTypes($scope.locations)
    }

    function onLoadingFlagsChange(loadingFlags) {
      loadingFlagsService.onLoadingFlagsChange(loadingFlags, loadingFlagUnbind);
    }

    function removeLoadingFlagWatch() {
      if(angular.isFunction(loadingFlagUnbind)) {
        loadingFlagUnbind();
      }
    }

    function getWidgetsToShow(isSiteLevel, siteHasGeometryData) {
      var widgetsToShow = [];

      if (isSiteLevel) {
        widgetsToShow = [
          'traffic_percentage_location',
          'first_visits',
          'one_and_done'
        ];
      } else {
        widgetsToShow = [
          'traffic_percentage_correlation',
          'locations_after',
          'locations_before'
        ];
      }

      if (!siteHasGeometryData) {
        widgetsToShow = widgetsToShow.map(function (widgetType) {
          return widgetType + '_table';
        });
      }

      return widgetsToShow;
    }

    function scheduleExportCurrentViewToPdf() {
      _.map($scope.widgetsToShow, function (value) {

        var params = {
          name: value,
          location_type: $scope.locationTypes,
          dateFormat: $scope.dateFormat,
          compare1Type: $scope.compareRange1Type,
          compare2Type: $scope.compareRange2Type
        };

        //check if widget has floor selected...
        var widgetKpi = $scope.widgetsKpis[value];
        if(!ObjectUtils.isNullOrUndefined($scope.selectedFloors[widgetKpi])) {
          params.floor = $scope.selectedFloors[widgetKpi];
        }

        ExportService.addToExportCartAndStore(getAreaKey(), $scope.dateRange, $scope.compareRange1, $scope.compareRange2, params);
      });

      $state.go('pdfexport', { orgId: currentOrganization.organization_id, view: 'schedule' });
    }

    function getAreaKey() {
      var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
      if (currentLocation) {
        areaKey += '_location_' + currentLocation.location_id;
      }
      return areaKey;
    }

    function getDateRangeType() {
      var dateRangeType = $stateParams.activeShortcut;
  
      if(_.isUndefined(dateRangeType)) {
        dateRangeType = utils.getDateRangeType($scope.dateRange, currentUser, currentOrganization);
      }
  
      return dateRangeType;
    }

    function exportWidget(metricKey, toDashboard) {
      var params;

      params = {
        orgId: currentSite.organization.id,
        siteId: currentSite.site_id,
        dateRange: { start: $scope.dateRange.start, end: $scope.dateRange.end },
        dateRangeType: getDateRangeType(),
        compare1Range: { start: $scope.compareRange1.start, end: $scope.compareRange1.end },
        compare2Range: { start: $scope.compareRange2.start, end: $scope.compareRange2.end },
        compare1Type: $scope.compareRange1Type,
        compare2Type: $scope.compareRange2Type,
        dateFormat: $scope.dateFormat,
        dateRangeShortCut: $state.rangeSelected,
        customRange:  $state.customRange,
        name: metricKey,
        language: $scope.language,
        firstDayOfWeekSetting: $scope.firstDayOfWeek,
        location_type: $scope.locationTypes
      };

      if(params.dateRangeShortCut === 'custom' && params.customRange === null) {
        params.xDaysBack = moment().diff(params.dateRange.start, 'days');
        params.xDaysDuration = params.dateRange.end.diff(params.dateRange.start, 'days');
      }

      var widgetKpi = $scope.widgetsKpis[metricKey];
      if(!ObjectUtils.isNullOrUndefined($scope.selectedFloors[widgetKpi])) {
        params.floor = $scope.selectedFloors[widgetKpi];
      }

      if (currentLocation) {
        params.locationId = currentLocation.location_id;
      }

      if (toDashboard) {
        customDashboardService.setSelectedWidget(params);
      } else {
        ExportService.createExportAndStore(params);
      }
    }

    function setWidgetExported(){
      $scope.widgetIsExported = widgetIsExported;
    }

    function widgetIsExported(metricKey) {
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

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject($scope.currentLocation)) {
        currentOrgExports = `${$scope.currentOrganization.organization_id}_${$scope.currentSite.site_id}_location_${$scope.currentLocation.location_id}`;
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

      return ExportService.isInExportCart(getAreaKey(), dateRangeKey, metricKey);
    }

    function setSelectedWidget(title) {
      exportWidget(title, true);
    }

    function goToLocation(location) {
      var params = {
        locationId: location.location_id,
      };
      if ($stateParams.locationTypeFilter && location.location_type !== $stateParams.locationTypeFilter) {
        params.locationTypeFilter = null;
      }
      $state.go('analytics.organization.site.usageOfAreas', params);
    }

    function siteHasCompatibleLocations(metricKey) {

      var compatibleLocations = {}; var found = false;
      compatibleLocations.one_and_done = ['Store', 'Corridor'];

      if (metricKey === 'one_and_done') {
        angular.forEach($scope.uniqueLocationTypes, function (locationType) {
          if (!found && compatibleLocations.one_and_done.indexOf(locationType) !== -1) {
            found = true;
          }
        });
      }

      return found;

    }

    function getUniqueLocationTypes(locations) {
      return locations.reduce(function (uniqueLocationTypes, item) {
        if (uniqueLocationTypes.indexOf(item.location_type) < 0) {
          uniqueLocationTypes.push(item.location_type);
        }
        return uniqueLocationTypes;
      }, []);
    }

    function dateRangesLoaded() {
      return utils.urlDateParamsLoaded($stateParams);
    }

    function loadTranslations() {
      $scope.language = LocalizationService.getCurrentLocaleSetting();
      $translate.use($scope.language);
    }
  }
})();
