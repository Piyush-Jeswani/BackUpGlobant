(() => {
  DashboardMiController.$inject = [
    '$scope',
    '$q',
    '$state',
    '$stateParams',
    '$filter',
    'currentOrganization',
    'ObjectUtils',
    'currentUser',
    'utils',
    'LocalizationService',
    'SubscriptionsService',
    'miUserPreferences',
    'ExportService',
    'marketIntelligenceService',
    'widgetConstants',
    'localStorageService',
    'dateRangeService',
    'loadingFlagsService'
  ];

  function DashboardMiController (
    $scope,
    $q,
    $state,
    $stateParams,
    $filter,
    currentOrganization,
    ObjectUtils,
    currentUser,
    utils,
    LocalizationService,
    SubscriptionsService,
    miUserPreferences,
    ExportService,
    marketIntelligenceService,
    {exportProperties},
    localStorageService,
    dateRangeService,
    loadingFlagsService
  ) {
    const vm = this;
    let loadingFlagUnbind;
    const advancedFilterOptions = {};

    activate();

    function activate () {
      vm.isLoading = true;
      marketIntelligenceService.getSubscriptions($stateParams.orgId, false, false)
      .then(res => {
        vm.miAvailable = true;
        vm.rules = [{name: 'Contains'}];
        vm.geography = marketIntelligenceService.sliceSubscription(res, 'geography');
        vm.category = marketIntelligenceService.sliceSubscription(res, 'category');
        vm.sourceSubscriptions = res;
        vm.currentUser = currentUser;

        if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.sourceSubscriptions)) {
          showError(`No ShopperTrak Index subscriptions found for orgId: ${$stateParams.orgId.toString()}`);
          return;
        }

        LocalizationService.setUser(vm.currentUser);

        initScope();

        checkIfMiExists(vm.currentUser);
      })
      .catch(showError);
    }

    function checkCurrentUserSegments () {
      const currentUserSegments = miUserPreferences.getConfiguredSegments(vm.currentUser.preferences, currentOrganization.organization_id);
      const updatedUserSegments = [];
      let matchedSubscription = [];

      _.each(currentUserSegments, (currentUserSubs, index) => {
        matchedSubscription = _.filter(vm.sourceSubscriptions, ({category, geography}) => {
          if (currentUserSubs.subscription.category.value.src.name === category.name &&
            currentUserSubs.subscription.geography.value.src.name === geography.name) {
            return currentUserSubs;
          }
        });

        if (ObjectUtils.isNullOrUndefinedOrEmpty(matchedSubscription)) {
          currentUserSegments[index].subscription = {};
        } else {
          updatedUserSegments.push(matchedSubscription[0]);
        }
      });

      if (currentUserSegments.length !== updatedUserSegments.length) {
        marketIntelligenceService.saveUserMarketIntelligence(vm.currentUser, currentUserSegments, currentOrganization.organization_id)
          .then(() => {
            loadConfiguredMi();
          })
          .catch(showError);
        return;
      }
      loadConfiguredMi();
    }

    function checkIfMiExists ({preferences}) {
      vm.miExists = miUserPreferences.segmentPreferencesAreConfigured(preferences, currentOrganization.organization_id);
      if (vm.miExists) {
        checkCurrentUserSegments();
      } else {
        vm.firstTimeConfigure = true;
        saveDefaultSegments();
      }
    }

    function loadConfiguredMi () {
      try {
        vm.firstTimeConfigure = false;
        vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, currentOrganization);
        vm.dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);
        getMiData();
        setSegmentForAdvancedOptions();
        configureWatches();
        vm.showOrgIndex = SubscriptionsService.hasMiOrgIndex(vm.currentUser, currentOrganization);
        vm.isLoading = false;
      } catch (error) {
        showError(error);
      }
    }

    function showError (error) {
      console.error(error);
      vm.isLoading = false;
      vm.miAvailable = false;
    }

    function getDefaultSegments () {
      const subscription = {};
      const segmentsArray = [];
      _.each(vm.sourceSubscriptions, (item, index) => {
        if (index < vm.trendSummaryNoOfSegments) {
          subscription.geography = constructSubscription(angular.copy(item), 'geography');
          subscription.category = constructSubscription(angular.copy(item), 'category');
          segmentsArray.push({ 'subscription': angular.copy(subscription) });
        }
      });
      return segmentsArray;
    }

    function constructSubscription (sourceSubscription, subscriptionKey) {
      const name = subscriptionKey === 'geography' ?
                 sourceSubscription[subscriptionKey].geoType :
                 sourceSubscription[subscriptionKey].name;
      return {
        orgId: currentOrganization.organization_id,
        name: $filter('capitalize')(name),
        rule: 'Contains',
        value: {
          name: sourceSubscription[subscriptionKey].name,
          src: sourceSubscription[subscriptionKey]
        }
      };
    }

    function saveDefaultSegments () {
      marketIntelligenceService.saveUserMarketIntelligence(vm.currentUser, getDefaultSegments(), currentOrganization.organization_id)
      .then(() => {
        vm.miExists = miUserPreferences.segmentPreferencesAreConfigured(vm.currentUser.preferences, currentOrganization.organization_id);
        vm.firstTimeConfigure = false;
        $scope.$emit('setMiExists');
        loadConfiguredMi();
      })
      .catch(showError);
    }

    function setSegmentForAdvancedOptions () {
      vm.segment = {};
      const userSegments = miUserPreferences.getConfiguredSegments(
        vm.currentUser.preferences, currentOrganization.organization_id
      );
      const segmentInStateValid = marketIntelligenceService.isSubscriptionValid(
        vm.sourceSubscriptions, $state.advanceFilterSelectedSegment
      );

      if (segmentInStateValid) {
        vm.segment = $state.advanceFilterSelectedSegment;
      }

      if (!segmentInStateValid && !ObjectUtils.isNullOrUndefined(userSegments) && userSegments.length) {
        const subscriptionCopy = angular.copy(userSegments[0].subscription);
        subscriptionCopy.geography.name = 'Geography';
        subscriptionCopy.geography.value.name = marketIntelligenceService.getFullGeoTitleByCode(subscriptionCopy.geography.value.name);
        subscriptionCopy.category.name = 'Category';
        vm.segment.subscription = objectPropsToArrayItems(subscriptionCopy);
      }
    }

    function objectPropsToArrayItems (object) {
      return _.values(object);
    }

    function initScope () {
      $scope.$on('page-loaded', setWidgetExported);
      vm.currentOrganization = currentOrganization;
      vm.metricsToShow = ['segment', 'market_intelligence'];
      vm.widgetLoadingStatus = {};

      _.each(vm.metricsToShow, metric => {
        vm.widgetLoadingStatus[metric] = true;
      });

      vm.advanceFilterPanelArray = [];
      vm.viewData = {};
      vm.isLoading = {};
      vm.exportWidget = exportWidget;
      vm.updateSelectedSegment = updateSelectedSegment;
      vm.getDefaultSegments = getDefaultSegments;

      vm.periodSelected = {
        start: $stateParams.dateRangeStart,
        end: $stateParams.dateRangeEnd
      };

      vm.periodCompared = {
        start: $stateParams.compareRange1Start,
        end: $stateParams.compareRange1End
      };

      vm.isPriorYear = isPriorYear(vm.periodSelected, vm.periodCompared);
      vm.dateRangesLoaded = dateRangesLoaded();

      vm.advancedFilterConfig = {
        position: 'right',
        showSummary: false,
        title: '.ADVANCEOPTIONS',
        shouldClear: false
      };
      vm.trendSummaryNoOfSegments = 5;
      vm.pdfExportConfig = {};
    }

    function exportAllWidgets () {
      _.each(vm.metricsToShow, metricKey => {
        exportWidget(metricKey);
      });
      $state.go('pdfexport', { orgId: vm.currentOrganization.organization_id, view: 'schedule' });
    }

    function exportWidget (widgetType) {
      const params = buildWidgetConfig(widgetType);
      ExportService.createExportAndStore(params);
    }

    function buildWidgetConfig (widgetType) {
      const dateRange = { start: $stateParams.dateRangeStart, end: $stateParams.dateRangeEnd };
      const compareRange1 = { start: $stateParams.compareRange1Start, end: $stateParams.compareRange1End };
      const widgetConfig = {
        orgId: currentOrganization.organization_id,
        dateRange,
        compare1Range: compareRange1,
        compare2Range: { },
        compare1Type: dateRangeService.getCompareType(
          dateRange,
          compareRange1,
          vm.currentUser,
          vm.currentOrganization,
          $stateParams.activeShortcut
        ),
        compare2Type: { },
        numberFormatName: vm.numberFormatName,
        name: widgetType,
        hideCompare2Range: true,
        dateFormat: vm.dateFormat,
        showOrgIndex: vm.showOrgIndex
      };

      if (widgetType === 'segment') {
        if (ObjectUtils.isNullOrUndefined(vm.params)) return;
        widgetConfig.segments = _.map(vm.params.subscriptions, ({positionIndex, category, geography}) => ({
          positionIndex: positionIndex,

          category: {
            uuid: category.uuid
          },

          geography: {
            uuid: geography.uuid
          }
        }));
      }

      if (widgetType === 'market_intelligence') {
        widgetConfig.selectedOptions = setAdvancedOptions(advancedFilterOptions.subscriptions);
        // Prevent time zone being applied when generating a PDF export
        widgetConfig.selectedOptions.dateStart = utils.getDateStringForRequest(widgetConfig.selectedOptions.dateStart);
        widgetConfig.selectedOptions.dateEnd = utils.getDateStringForRequest(widgetConfig.selectedOptions.dateEnd);
        widgetConfig.selectedOptions.compareStart = utils.getDateStringForRequest(widgetConfig.selectedOptions.compareStart);
        widgetConfig.selectedOptions.compareEnd = utils.getDateStringForRequest(widgetConfig.selectedOptions.compareEnd);
        widgetConfig.isPriorYear = vm.isPriorYear;
        widgetConfig.pdfExportConfig = vm.pdfExportConfig[widgetType];
      }
      return widgetConfig;
    }

    function setWidgetExported () {
      vm.widgetIsExported = widgetIsExported;
    }

    function widgetIsExported (widgetType, params) {
      const exports = ExportService.getCart();
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)) {
        //if the export cart is empty there is nothing to check so return false (all export buttons can be enabled). 
        return false;
      }

      const dateRangeKey = `${
        params.dateRange.start
      } - ${
        params.dateRange.end
      } - ${
        params.compare1Range.start
      } - ${
        params.compare1Range.end
      } - undefined - undefined`; // MI doesn't use second compare range

      const currentOrgExports = `${params.orgId}_-1`;
  
      if (_.isUndefined(exports[currentOrgExports])) {
        // no exports for the current organisation/site in the cart,
        // nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      if (_.isUndefined(exports[currentOrgExports][dateRangeKey])) {
        //no exports for the current date range, widget exports can be enabled
        return false;
      }
      
      const exportMetrics = _.pluck(exports[currentOrgExports][dateRangeKey].metrics, 'name');
  
      if (!exportMetrics.includes(widgetType)) {
        //if the widget type is not in the export cart, nothing needs to be checked, the export button for this widget can be enabled. 
        return false;
      }

      const paramsToCompare = widgetVariables()[widgetType];

      return ExportService.isInExportCartWithSettings(getAreaKey(), dateRangeKey, widgetType, params, paramsToCompare);
    }

    function getAreaKey () {
      return `${currentOrganization.organization_id}_-1`;
    }

    function configureWatches () {
      const unbinds = [];

      unbinds.push($scope.$watch('vm.segment', () => {
        if (!_.isUndefined(vm.segment.subscription)) {
          advancedFilterOptions.orgId = vm.currentOrganization.organization_id;
          advancedFilterOptions.lastUpdated = 0;
          advancedFilterOptions.subscriptions = [];
          advancedFilterOptions.subscriptions =  advancedFilterOptions.subscriptions.concat(vm.segment.subscription);
        }
        getUpdatedAdvanceOptions();
      }, true));

      unbinds.push($scope.$on('scheduleExportCurrentViewToPdf', exportAllWidgets));
      unbinds.push($scope.$on('page-loaded', setWidgetExported));

      unbinds.push(
        $scope.metricsChange = $scope.$watchGroup([
          'vm.metricsToShow',
          'vm.dateRangesLoaded'
        ], () => {
          if (viewIsLoaded()) {
            vm.viewData = initializeViewData();
          }
        }));

      loadingFlagUnbind = $scope.$watchCollection('vm.widgetLoadingStatus', onLoadingFlagsChange);

      $scope.$on('$destroy', () => {
        _.each(unbinds, unbind => {
          if (angular.isFunction(unbind)) {
            unbind();
          }
        });

        removeLoadingFlagWatch();
      });
    }

    function onLoadingFlagsChange (loadingFlags) {
      loadingFlagsService.onLoadingFlagsChange(loadingFlags, loadingFlagUnbind);
    }

    function removeLoadingFlagWatch () {
      if (angular.isFunction(loadingFlagUnbind)) {
        loadingFlagUnbind();
      }
    }

    function getUpdatedAdvanceOptions () {
      vm.advancedFilterOptions = setAdvancedOptions(advancedFilterOptions.subscriptions);
    }

    function getMiData () {
      const configuredSegments = miUserPreferences.getConfiguredSegments(vm.currentUser.preferences, currentOrganization.organization_id);

      const subs = configuredSegments.map(({positionIndex, subscription, timePeriod}) => ({
        positionIndex: positionIndex,
        uuid: '54c454be-f729-48f4-8ffd-5285b9c4103d',
        lastUpdated: 0,
        orgId: vm.currentOrganization.organization_id,
        category: subscription.category.value.src,
        geography: subscription.geography.value.src,
        timePeriod:timePeriod
      }));

      vm.params = setAdvancedOptions(subs);
    }

    function firstDaySetting () {
      return LocalizationService.getCurrentCalendarFirstDayOfWeek();
    }

    function isPriorYear (startPeriod, comparePeriod) {
      return utils.dateRangeIsPriorYear(startPeriod, comparePeriod, firstDaySetting(), vm.currentUser, vm.currentOrganization);
    }

    function setAdvancedOptions (subscriptions) {
      return {
        dateStart: $stateParams.dateRangeStart,
        dateEnd: $stateParams.dateRangeEnd,
        compareStart: $stateParams.compareRange1Start,
        compareEnd: $stateParams.compareRange1End,
        subscriptions
      };
    }

    function initializeViewData () {
      const configuration = {};

      _.each(vm.metricsToShow, metricKey => {
        configuration[metricKey] = buildWidgetConfig(metricKey);
        vm.pdfExportConfig[metricKey] = {};
      });

      return configuration;
    }

    function widgetVariables () {
      return exportProperties;
    }

    function viewIsLoaded () {
      return !ObjectUtils.isNullOrUndefinedOrEmpty(vm.metricsToShow) && vm.dateRangesLoaded;
    }

    function dateRangesLoaded () {
      return utils.urlDateParamsLoaded($stateParams, true);
    }

    function updateSelectedSegment (selectedSegment) {
      $state.advanceFilterSelectedSegment = selectedSegment;
    }
  }

  angular.module('shopperTrak').controller('DashboardMiController', DashboardMiController);
})();
