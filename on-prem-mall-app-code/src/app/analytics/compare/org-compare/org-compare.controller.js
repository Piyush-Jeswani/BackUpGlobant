(function() {
  'use strict';

  angular.module('shopperTrak').controller('OrgCompareController', OrgCompareController);

  OrgCompareController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$translate',
    '$timeout',
    'orgCompareService',
    'customDashboardService',
    'currentOrganization',
    'sites',
    'currentUser',
    'ExportService',
    'SubscriptionsService',
    'LocalizationService',
    'ObjectUtils',
    'dateRangeHelper',
    'metricNameService'
  ];

  function OrgCompareController(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $translate,
    $timeout,
    orgCompareService,
    customDashboardService,
    currentOrganization,
    sites,
    currentUser,
    ExportService,
    SubscriptionsService,
    LocalizationService,
    ObjectUtils,
    dateRangeHelper,
    metricNameService
  ) {
    var vm = this;

    vm.currentOrganization = currentOrganization;
    vm.cachedUser = angular.copy(currentUser);
    vm.currentUser = angular.copy(currentUser);
    vm.dashboardUser = currentUser;
    vm.customDashboards = customDashboardService.getDashboards(currentUser);
    vm.setSelectedWidget = setSelectedWidget;
    vm.sites = sites;
    vm.trueVal = true;

    vm.stateParams = $stateParams;
    vm.title = 'customCompare.COMPARE';
    vm.editMode = '';

    vm.deleteCompare = deleteCompare;
    vm.updateCompare = updateCompare;

    vm.saveChanges = saveChanges;
    vm.exportWidget = exportWidget;
    vm.widgetIsExported = widgetIsExported;
    vm.setSelectedWidget = customDashboardService.setSelectedWidget;

    vm.language = LocalizationService.getCurrentLocaleSetting();

    $rootScope.customDashboards = false;
    var loadingFlagWatch;

    activate();

    function activate() {

      // We need to apply the custom metric names here as the org compare controller does not use the header controller
      metricNameService.applyCustomMetricNames(vm.currentOrganization)
        .then(function() {
          orgCompareService.setMetricLookup(vm.currentOrganization);
          vm.editCompare = editCompare;
          vm.setMode = setMode;
          vm.cancelEdit = cancelEdit;
          vm.isWidgetNameExist = isWidgetNameExist;
    
          LocalizationService.setUser(vm.currentUser);
          LocalizationService.setOrganization(vm.currentOrganization);
          vm.dateFormat = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
          vm.numberFormatName = LocalizationService.getCurrentNumberFormatName( vm.currentUser,  vm.currentOrganization);
          vm.hasMarketIntelligence = hasMarketIntelligence();
    
          setCustomChartList(vm.currentUser);
          configureWatches();
        });
    }

    function hasMarketIntelligence() {
      return SubscriptionsService.hasMarketIntelligence(currentOrganization) && 
        SubscriptionsService.userHasMarketIntelligence(currentUser, currentOrganization.organization_id);
    }

    function userHaveCustomCharts(user) {
      return !ObjectUtils.isNullOrUndefined(user.preferences) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(user.preferences.custom_charts);
    }

    function getDatePeriod(period, range) {
      if (ObjectUtils.isNullOrUndefined(period)) {
        return null;
      }

      if (period.period_type === 'custom') {
        // ToDo: Find out if this is used. The option isn't available on the UI
        return {
          start: moment(period.custom_start_date).utc(),
          end: moment(period.custom_end_date).utc()
        };
      }
      return dateRangeHelper.getDateRange(period.period_type, range, vm.currentUser, vm.currentOrganization, $rootScope.firstDaySetting);
    }

    function getComparePeriod(compare) {
      return ObjectUtils.isNullOrUndefinedOrEmpty(compare.activeSelectedComparePeriods) ?
        compare.compare_period_1 :
        compare.activeSelectedComparePeriods[0];
    }

    function exportWidget(compare, showTable, toDashboard) {
      if (ObjectUtils.isNullOrUndefined(compare)) {
        return;
      }

      var range = getDatePeriod(compare.selected_date_range, null);

      var compare1Range = getDatePeriod(getComparePeriod(compare), range);

      var areaKey = getAreaKey(compare);

      var selectedMetrics = getSelectedMetics(compare);

      var params = {
        orgId: vm.currentOrganization.organization_id,
        compare: compare,
        showTable: showTable,
        dateRange: range,
        compare1Range: compare1Range,
        compare2Range: range,
        dateRangeKey: buildDateRangeKey (range, compare1Range, range),
        hideCompare2Range: true,
        currentUser: vm.currentUser,
        language: vm.language,
        name: compare.chart_name,
        areaKey: areaKey,
        noTranslation: true,
        summaryKey: 'org-custom-compare',
        dateFormat: vm.dateFormat,
        compareId: compare.chart_name + vm.currentOrganization.organization_id,
        selectedMetrics: selectedMetrics,
        table: compare.showTable
      };

      params.compareId = params.compareId.replace(/[^a-zA-Z0-9]/g, '');

      if (toDashboard) {
        customDashboardService.setSelectedWidget(params);
      } else {
        ExportService.createExportAndStore(params);
      }

      vm.exportIsDisabled = true;
    }

    function setSelectedWidget(title) {
      exportWidget(title, true);
    }

    function getSelectedMetics(compare) {
      if(ObjectUtils.isNullOrUndefined(compare.activeSelectedMetrics)){
        return compare.metrics;
      }
      return compare.activeSelectedMetrics;
    }

    function buildDateRangeKey (dateRange, compare1Range, compare2Range) {
      return dateRange.start.format('YYYY-MM-DD') +
        ' - ' +
        dateRange.end.format('YYYY-MM-DD') +
        ' - ' +
        compare1Range.start.format('YYYY-MM-DD') +
        ' - ' +
        compare1Range.end.format('YYYY-MM-DD') +
        ' - ' +
        compare2Range.start.format('YYYY-MM-DD') +
        ' - ' +
        compare2Range.end.format('YYYY-MM-DD');
    }

    function isWidgetNameExist(name) {
      var chart = _.where(vm.customCharts, {
        chart_name: name
      });
      return !ObjectUtils.isNullOrUndefinedOrEmpty(chart);
    }

    function scheduleExportCurrentViewToPdf() {
      angular.forEach(vm.customCharts, function(compare) {
        exportWidget(compare, true);
      });
      $state.go('pdfexport', {orgId: vm.currentOrganization.organization_id, view: 'schedule'});
    }

    function getAreaKey(compare) {
      return compare.organization_id + '_-1';
    }

    function widgetIsExported(compare) {
      var range = getDatePeriod(compare.selected_date_range, null);

      var compare1Range = getDatePeriod(getComparePeriod(compare), range);

      var areaKey = getAreaKey(compare);

      var key = buildDateRangeKey(range, compare1Range, range);

      return ExportService.isInExportCart(areaKey, key, compare.chart_name);
    }

    function setCustomChartList(user) {
      if (userHaveCustomCharts(user)) {
        vm.customCharts = angular.copy(_.where(user.preferences.custom_charts, {
          organization_id: vm.currentOrganization.organization_id
        }));
      }

      vm.showNoCompare = ObjectUtils.isNullOrUndefinedOrEmpty(vm.customCharts);
      setupLoadingFlags(vm.customCharts);
    }

    function setupLoadingFlags(customCharts) {
      var loadingFlags = [];

      _.each(customCharts, function() {
        loadingFlags.push(true);
      });

      vm.loadingFlags = loadingFlags;
    }

    function setMode(mode, compare, customCharts) {
      vm.editMode = mode;
      switch (mode) {
        case 'new':
          vm.title = 'customCompare.NEWCOMPARE';
          break;
        case 'edit':
          vm.title = 'customCompare.EDITCOMPARE';
          break;
        case 'editCompare':
          vm.title = 'customCompare.EDITCOMPARE';
          break;
        case 'added':
          addCompare(compare, customCharts);
          vm.title = 'customCompare.COMPARE';
          vm.editMode = '';
          break;
        case 'editCompareCompleted':
          vm.title = 'customCompare.EDITCOMPARE';
          updateCompare(compare);
          $timeout(function() {
            vm.editMode = 'edit';
          }, 300);
          break;

        default:
          vm.title = 'customCompare.COMPARE';
          break;
      }

      vm.hideExportIcon = vm.editMode !== '';
    }

    function addCompare(compare, customCharts) {
      if (ObjectUtils.isNullOrUndefined(vm.customCharts)) {
        vm.customCharts = [];
      }

      checkSites(compare);

      vm.customCharts.push(compare);
      vm.currentUser.preferences.custom_charts = customCharts;
      vm.cachedUser.preferences.custom_charts = customCharts;

      vm.showNoCompare = false;
    }

    function checkSites(compare) {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(compare.sites)){
        compare.sites = [-1];
      }
    }

    function updateCompare(compare) {
      var index = _.findLastIndex(vm.customCharts, {
        chart_name: compare.chart_name
      });

      compare.activeSelectedMetrics = compare.metrics;

      checkSites(compare);

      vm.customCharts[index] = compare;
    }

    function deleteCompare(compare) {
      var customCharts = _.filter(vm.customCharts, function(chart) {
        return chart.chart_name !== compare.chart_name; //chart name is unique so we can remove it for edit
      });

      vm.customCharts = customCharts;
    }

    function editCompare(compare) {
      vm.activeCompare = compare;
      vm.setMode('editCompare');
    }

    function cancelEdit() {
      setCustomChartList(vm.cachedUser);
      if (vm.editMode === 'editCompare') {
        vm.setMode('edit');
        return;
      }
      vm.setMode('');
    }

  /** Configures the watches. Also destroys them.
   *  Should only be called during the activate cycle
   **/
    function configureWatches() {
      var unbindFunctions = [];

      unbindFunctions.push($scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf));
      loadingFlagWatch = $scope.$watchCollection('vm.loadingFlags', onLoadingFlagsChanged);

      $scope.$on('$destroy', function() {
        removeLoadingFlagWatch();

        _.each(unbindFunctions, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

  /** Handler for the loading flags changing.
   *  Fires the pageLoadFinished event once all widgets have fully loaded
   *
   *  @param {boolean[]} loadingFlags - An array of booleans indicating the loading status of all widgets
   **/
    function onLoadingFlagsChanged(loadingFlags) {
      var loadedFlags = _.filter(loadingFlags, function(loadingFlag) {
        return loadingFlag === false;
      });

      var isLoading = loadedFlags.length !== loadingFlags.length;

      if(isLoading === false) {
        $rootScope.$broadcast('pageLoadFinished');
        removeLoadingFlagWatch();
      }
    }

    function removeLoadingFlagWatch() {
      if(angular.isFunction(loadingFlagWatch)) {
        loadingFlagWatch();
      }
    }

    function saveChanges() {
      orgCompareService.saveUserCustomCompare(vm.currentUser, vm.customCharts, vm.currentOrganization.organization_id)
        .then(function(customCharts) {
          vm.currentUser.preferences.custom_charts = customCharts;
          vm.cachedUser.preferences.custom_charts = customCharts;
          setMode('');
          vm.showNoCompare = ObjectUtils.isNullOrUndefinedOrEmpty(vm.customCharts);
        });
    }
  }
})();
