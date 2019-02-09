(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('CustomDashboardController', CustomDashboardController);

  CustomDashboardController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$translate',
    '$q',
    '$document',
    '$window',
    '$timeout',
    '$confirm',
    'orgCompareService',
    'currentOrganization',
    'customDashboardService',
    'sites',
    'currentSite',
    'ExportService',
    'SubscriptionsService',
    'LocalizationService',
    'ObjectUtils',
    'utils',
    'organizations',
    'apiUrl',
    'SiteResource',
    'ZoneResource',
    'LocationResource',
    'EntranceResource',
    'authService',
    'customDashboardConstants',
    'viewportService',
    'features',
    'OrganizationResource',
    'dragulaService',
    'metricConstants',
    'dateRangeService',
    'metricNameService',
    'loadingFlagsService',
    'widgetConstants'
  ];

  function CustomDashboardController(
    $scope,
    $rootScope,
    $state,
    $stateParams,
    $translate,
    $q,
    $document,
    $window,
    $timeout,
    $confirm,
    orgCompareService,
    currentOrganization,
    customDashboardService,
    sites,
    currentSite,
    ExportService,
    SubscriptionsService,
    LocalizationService,
    ObjectUtils,
    utils,
    organizations,
    apiUrl,
    SiteResource,
    ZoneResource,
    LocationResource,
    EntranceResource,
    authService,
    constants,
    viewportService,
    features,
    OrganizationResource,
    dragulaService,
    metricConstants,
    dateRangeService,
    metricNameService,
    loadingFlagsService,
    widgetConstants
  ) {

    var vm = this;
    var tempDash;
    var $scopeEventHandlers = [];
    var loadingFlagUnbind;
    var defaultDateRangeType;

    activate();

    function initScope() {

      // Constants:
      vm.currentSite = currentSite;
      vm.currentOrganization = currentOrganization;
      vm.kpi = {
        name: 'traffic'
      };
      vm.stateParams = $stateParams;
      vm.sites = sites;
      vm.dashboardNameMaxlength = constants.MAX_NAME_LENGTH;
      vm.chartOverride = constants.chartOverride;
      vm.availableGridLayouts = constants.grid.widgetLayouts;
      vm.gridLayouts = constants.grid.layoutTypes;
      vm.gridLayoutsCssClasses = _.pluck(vm.gridLayouts, 'cssClasses');
      vm.customDashboardBagName = 'custom-dashboard-bag';
      vm.dateRangeTypes = angular.copy(constants.dateRangeTypes);
      vm.orgsLoaded = 0;
      vm.orgList = [];
      vm.siteList = [];
      vm.isLoading = [];

      // Methods:
      $scope.widgetLayoutChanged = widgetLayoutChanged;
      vm.cancelEdit = cancelEdit;
      vm.exportWidget = exportWidget;
      vm.compareWidgetIsExported = compareWidgetIsExported;
      vm.deleteDashboard = deleteDashboard;
      vm.deleteWidget = deleteWidget;
      vm.saveChanges = saveChanges;
      vm.getExportTimePeriodTitle = getExportTimePeriodTitle;
      vm.edit = edit;
      vm.getBreakpointName = getBreakpointName;
      vm.setAllDateRanges = setAllDateRanges;
      vm.setMainDateButtonString = setMainDateButtonString;
      vm.updateDateRanges = updateDateRanges;
      vm.updateWidgetDateRange = updateWidgetDateRange;
    }

    /** Activates the controller. Private function */
    function activate() {
      initScope();
      $rootScope.customDashboards = true;
      configureDragAndDrop();
      loadCurrentUser()
      .then(preloadData)
      .then(setMetricNames)
      .then( () => {
        $scope.$on('page-loaded', setWidgetExported);
        loadWidgets();
        setMainDateButtonString();
        LocalizationService.setUser(vm.currentUser);
        vm.dateFormat = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
        vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
        vm.language = LocalizationService.getCurrentLocaleSetting();
        vm.showWeatherMetrics = vm.currentUser.preferences.weather_reporting;
        setKpiValues();
        setWidgetWidths(); // Custom Dashboard Grid
        $scope.$on('$destroy', $scopeDestroyed);
        $window.document.addEventListener('mousemove', event_dashboardMousemove);
        vm.widgetsReady = true;
      })
      .catch( (err) => {
        console.error(err);
      });

      // Models & States:
      vm.editMode = false;
      vm.loadWidgets = false;
      vm.hasMarketIntelligence = hasMarketIntelligence();
    }

  /**
   * Sets up a copy of the metrics constants and attatches it to each widget.
   * This is to ensure that the correct custom metric names are used for each org.
   * This is needed as some users have access to more than one org.
   */
    function setMetricNames() {
      var deferred = $q.defer();

      if(vm.dashboard && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.dashboard.widgets)) {
        var metricLoadPromises = [];
        _.each(vm.dashboard.widgets, (widget) => {
          var metricLoad = $q.defer();

          metricLoadPromises.push(metricLoad.promise);
          // This must happen after standardiseOrgId has been called
          var org = _.findWhere(vm.orgList, { organization_id: widget.organizationId });

          if(_.isUndefined(org)) {
            metricLoad.resolve();
          } else {
            metricNameService.getMetricNames(org)
              .then( (orgMetrics) => {
                widget.orgMetrics = orgMetrics;
                metricLoad.resolve();
              })
              .catch( (error) => {
                console.error(error);
                // Swallow the error and don't prevent the load
                metricLoad.resolve();
              });
          }

          $q.all(metricLoadPromises).then( () => {
            deferred.resolve();
          }).catch( (error) => {
            console.error(error);
            // Swallow the error and don't prevent the load
            deferred.resolve();
          });

        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    function hasMarketIntelligence() {
      return SubscriptionsService.hasMarketIntelligence(vm.currentOrganization) &&
        SubscriptionsService.userHasMarketIntelligence(vm.currentUser, vm.currentOrganization.organization_id);
    }

    /** Loads the current user. Needed as the routing injection is a mess. Private function
     *  @returns {object} an empty promise
     */
    function loadCurrentUser() {
      var deferred = $q.defer();

      authService.getCurrentUser().then((user) => {
        if (redirectIfNoDashboards(user.preferences) === true) return false;

        vm.currentUser = user;
        vm.dashboards = vm.currentUser.preferences.custom_dashboards;
        vm.dashboard = angular.copy(getDashboard(vm.dashboards));
        vm.dashboardNames = _.map(vm.dashboards, 'name'); // list of all dashboard names
        vm.dashboardNameBlacklist = _.without(vm.dashboardNames, vm.dashboard.name); // disallowed dashboard names
        vm.editDashboardName = vm.dashboard.name; // default 'edit' name
        vm.compare1Type = vm.currentUser.preferences.custom_period_1.period_type;
        vm.compare2Type = vm.currentUser.preferences.custom_period_2.period_type;
        // TODO: Verify that this is needed
        vm.language = vm.currentUser.localization.locale;
        deferred.resolve();
      });

      return deferred.promise;
    }

    function getDashboard(dashboards) {
      var position = Number($stateParams.position);
      var search = { position: position };
      return _.findWhere(dashboards, search);
    }

    /**
     * Preloads data (orgs, sites) required by widgets. Thenable - resolves when data loaded.
    */
    function preloadData(){
      var deferred = $q.defer();
      var allPromiseChains = [];

      // Collect org and site IDs:
      var allOrgs = [];
      var allCurrentSites = [];

      _.each(vm.dashboard.widgets, (widget) => {
        standardiseOrgId(widget); // Consolidates the various orgID prop names in use
        allOrgs.push(widget.organizationId);
        if (widget.siteId) {
          allCurrentSites.push({
            siteId: widget.siteId,
            orgId: widget.organizationId
          });
        }
      });

      // De-dupe org and site IDs:
      var orgsToLoad = _.uniq(allOrgs);
      var sitesToLoad = _.uniq(allCurrentSites, (site) => site.siteId );

      // Request orgs/sites data:
      _.each(orgsToLoad, function(id){
        allPromiseChains.push(
          OrganizationResource.get({orgId: id}).$promise.then( (org) => {
            vm.orgList.push(org);
          })
        );
      });

      _.each(sitesToLoad, function(site){
        allPromiseChains.push(
          SiteResource.get({orgId: site.orgId, siteId: site.siteId}).$promise.then( (data) => {
            vm.siteList.push(data);
          })
        );
      });

      // Resolve once all promises are complete:
      $q.all(allPromiseChains).then( () => {
        deferred.resolve();
        vm.widgetsReady = true;
      });

      return deferred.promise;
    }

    /**
     * Prepares each widget object for displaying on the UI.
     * This function returns nothing, but instead acts upon each widget object.
     */
    function loadWidgets() {
      if (vm && vm.dashboard && vm.dashboard.widgets && vm.dashboard.widgets.length > 0) {
        if (vm.dashboard.widgets[0].dateRangeTypes) {
          if (vm.dashboard.widgets[0].dateRangeTypes.default) {
            defaultDateRangeType = vm.dashboard.widgets[0].dateRangeTypes.default;
          }
        }

        _.each(vm.dashboard.widgets, (widget) => {
          //different property assignments exist for the organisationId number this standardises it to ' organisationId'
          setForCompare(widget);
          //sets the widgets currentOrg object based upon its ' organisationId'
          setOrgs(widget);
          //converts date ranges from strings to moment objects
          momentizeWidgetDates(widget);
          //assign date dropdown options
          assignDateSelections(widget);
          //updates date ranges of the widget based upon its date range type string
          updateDateRanges(widget);

          //updates the widget config with any properties that could be impacted after a custom dashboard change
          updateWidgetSpecificProperties(widget);
          //assigns a zone object if a zoneId exists
          if ('zoneId' in widget) {
            widget.zone = getZone(widget);
          }
          //assigns a zone object if a locationId exists
          if ('locationId' in widget) {
            widget.location = getLocation(widget);
          }

          if ('entranceId' in widget) {
            getEntrance(widget).$promise.then((data) => {
              widget.entrance = data;
            });
          }

          //assigns sites  if siteId exists
          getSitesById(widget);
          //assigns sites by orgId
          getSitesByOrgId(widget);
          //sets the time period string
          widget.timePeriod = getExportTimePeriodTitle(widget);
          // Default Grid layout size
          widget.gridLayout = widget.gridLayout || '4x';
          //updates weather metrics
          updateWeather(widget);
          //update sales categories
          updateSalesCats(widget);

          // Inherit language setting for the widget from user preferences.
          widget.language = vm.language;

          //Set the loading status for the widget
          vm.isLoading.push(true);
        });

        $scopeEventHandlers = [
          $scope.$on('scheduleExportCurrentViewToPdf', exportAllWidgets),
          $scope.$on('customDashboardReflow', redrawCustomDashboardCharts),
          $scope.$on('viewportChanged', redrawCustomDashboardCharts),
          $scope.$on('viewportBreakpointChanged', setWidgetWidths),
          $scope.$on(vm.customDashboardBagName + '.drop-model', event_dashboardDropped)
        ];

        loadingFlagUnbind = $scope.$watchCollection('vm.isLoading', onLoadingFlagsChange);
      }
    }

    function onLoadingFlagsChange(loadingFlags) {
      if(_.isUndefined(loadingFlags)) {
        return;
      }

      var isLoading = false;

      _.each(loadingFlags, (loadingFlag) => {
        if(loadingFlag === true) {
          isLoading = true;
        }
      });

      if(isLoading === false) {
        $rootScope.$broadcast('pageLoadFinished');
        removeLoadingFlagWatch();
      }
    }

    function removeLoadingFlagWatch() {
      if(angular.isFunction(loadingFlagUnbind)) {
        loadingFlagUnbind();
      }
    }

    /** Puts the passed in widget into the export cart. Public function *
     *
     *  @param {object} widget - The widget to export
     */
    function exportWidget(widget) {
      if(!_.isUndefined(widget.selectedOption)) {
        //work around for selected metric defaulting to traffic and avoiding dupe names
        widget.name = widget.selectedOption.metric.kpi;
      }

      widget.displayName = getWidgetDisplayName(widget);

      ExportService.createExportAndStore(getPdfParams(widget));
    }

    function getWidgetDisplayName(widget) {
      if (!ObjectUtils.isNullOrUndefinedOrBlank(widget.displayType)) {
        if (_.includes(widget.displayType, ',')) {
          return getDisplayNameForMultiMetric(widget);
        }
        else {
          return $translate.instant(widget.displayType)
        }
      }

      return '';
    }

    /**
    * get display name for widgets which could have multiple metric selections.
    */
    function getDisplayNameForMultiMetric(params) {
      let displayTypes = params.displayType.split(',');
      let displayName = '';

      _.each(displayTypes, displayType => {
        displayName += $translate.instant(displayType)
      })

      return displayName;
    }

    function getPdfParams(widget) {
      var pdfParams = angular.copy(widget);
      pdfParams.orgName = pdfParams.currentOrganization.name;
      pdfParams.orgId = pdfParams.orgId ? pdfParams.orgId.toString() : pdfParams.organizationId.toString();

      if(pdfParams.showWeatherMetrics){
        pdfParams.weather = [];
        _.each(pdfParams.selectedWeatherMetrics, (weatherMetric) => {
          pdfParams.weather.push(weatherMetric.kpi);
        });
        delete pdfParams.selectedWeatherMetrics;
      }
      if(pdfParams.name === 'org-custom-compare') {//all of the following is required for the compare widget to work in pdf export
        pdfParams.dateRange = pdfParams.dateRanges.dateRange;
        pdfParams.compare1Range = pdfParams.dateRanges.compare1Range;
        pdfParams.compare2Range = pdfParams.dateRanges.compare2Range;
        pdfParams.name = pdfParams.compare.chart_name;
        pdfParams.noTranslation = true;
        pdfParams.summaryKey = 'org-custom-compare';
        pdfParams.compareId = widget.chart_name + pdfParams.orgId;
        pdfParams.selectedMetrics = pdfParams.compare.activeSelectedMetrics;
        pdfParams.table = pdfParams.compare.showTable;
        pdfParams.selectedComparePeriod = pdfParams.compare.activeSelectedComparePeriods;
        pdfParams.compareId = pdfParams.compareId.replace(/[^a-zA-Z0-9]/g, '');
      }

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(pdfParams.selectedMetrics)  && _.isObject(pdfParams.selectedMetrics[0])) {
        pdfParams.selectedMetrics = _.pluck(pdfParams.selectedMetrics, 'kpi');
      }

      if(pdfParams.name === 'traffic') {
        pdfParams.name = pdfParams.kpi;
      }

      // Strip out some props:
      removeParams(pdfParams);

      if(pdfParams.selectedDaysDailyPerformance) {
        _.each(pdfParams.selectedDaysDailyPerformance, (day) => {
          delete day.transkey;
        })
      }

      if(pdfParams.selectedDaysTrafficPerWeekday) {
        _.each(pdfParams.selectedDaysTrafficPerWeekday, (day) => {
          delete day.transkey;
        })
      }

      return pdfParams;
    }

    function removeParams(pdfParams) {
      var paramsToRemove = [
        'timePeriod',
        'currentOrganization',
        'dateRangeShortCut',
        'currentSite',
        'gridWidthClass',
        'dateRangeTypes',
        'sites',
        'orgMetrics'
      ];

      if(pdfParams.name === 'retail_organization_table') {
        paramsToRemove.push('currencySymbol');
        paramsToRemove.push('widgetData');
        paramsToRemove.push('tableData');
      }

      _.each(paramsToRemove, (name) => {
        delete pdfParams[name];
      });
    }


    /**
     * Adds all widgets (including retail_organization_table) on the current page into the Export cart.
     */
    function exportAllWidgets() {
      _.each(vm.dashboard.widgets, (widget) => {
        exportWidget(widget);
      });

      $state.go('pdfexport', { orgId: currentOrganization.organization_id, view: 'schedule' });
    }

    function setWidgetExported(){
      vm.widgetIsExported = widgetIsExported;
    }

    /** Checks if the specified widget has already been added to the export cart. Public function
     *  @param {object} widget - The widget to check
     */
    function widgetIsExported(widget) {
      const exports = ExportService.getCart();
      if(ObjectUtils.isNullOrUndefinedOrEmptyObject(exports)){
        //if the export cart is empty there is nothing to check so return false (all export buttons can be enabled). 
        return false;
      }
      
      const paramsToCompare = widgetVariables(widget);
      return ExportService.isInExportCartSimple(getPdfParams(widget), undefined, paramsToCompare);
    }

    function widgetVariables(widget) {
      var params =  widgetConstants.exportProperties[widget.name];
      if(ObjectUtils.isNullOrUndefinedOrEmpty(params)) {
        return params;
      }
      var paramsToCompare = {};
      _.each(params, (param) => {
        if(!ObjectUtils.isNullOrUndefined(widget[param])) {
          paramsToCompare[param] = widget[param];
        }
      });
      return paramsToCompare;
    }

    function compareWidgetIsExported(compare) {
      var areaKey = compare.organization_id + '_-1';

      var key = ExportService.buildDateRangeKey(compare.dateRanges.dateRange, compare.dateRanges.compare1Range, compare.dateRanges.compare2Range);

      return ExportService.isInExportCart(areaKey, key, compare.chart_name);
    }

    function getZone(widget) {
      return new ZoneResource().get(widget);
    }

    function getLocation(widget) {
      return LocationResource.get(widget);
    }

    function getEntrance(widget) {
      return new EntranceResource().get({
        orgId: widget.organizationId, siteId: widget.siteId, zoneId: widget.zoneId, entranceId: widget.entranceId
      })
    }

    /**
     * checks the currentdashboard exists and if not re-directs the user away
     */
    function redirectIfNoDashboards(preferences){
      var dashboard = getDashboard(preferences.custom_dashboards);

      if(ObjectUtils.isNullOrUndefined(dashboard)) {
        if(ObjectUtils.isNullOrUndefined($state.params.siteId)){
          $state.go('analytics.organization');
        } else {
          $state.go('analytics.organization.site');
        }
        return true;
      }
    }

    /**
     * enters edit mode and takes a copy of vm.dashboard
     * This function returns nothing, but instead copies the current vm.dashboard object.
     */
    function edit() {
      vm.editMode = true;
      tempDash = angular.copy(vm.dashboard);
    }

    /**
     * exits edit mode and restores vm.dashboard object to its previous state
     * This function returns nothing, but instead acts on the current vm.dashboard object.
     */
    function cancelEdit() {
      vm.editMode = false;
      vm.dashboard = tempDash;
      vm.editDashboardName = vm.dashboard.name;
      setMainDateButtonString();
    }

    /**
     * deletes the current dashboard object from user.preferences
     * This function returns nothing, but instead acts on the current user object.
     */
    function deleteDashboard(dashboard) {

      $confirm({ content: $translate.instant('customDashboard.AREYOUSUREDELETEDASHBOARD') })
      .then( (answer) => {
        if (answer) {
          vm.deleteLoading = true;
          vm.workingText = $translate.instant('customDashboard.DELETINGDASHBOARD');
          customDashboardService.deleteDashboard(dashboard, vm.currentUser);
          vm.deleteLoading = vm.currentUser.preferences.custom_dashboards;
        }
      });

    }

    /**
     * removes the selected widget from the widgets array in the current dashboard
     * This function returns nothing, but instead acts on the current vm.dashboard object.
     */
    function deleteWidget(index) {
      vm.dashboard.widgets.splice(index, 1);
    }

    /**
     * Saves any changes made during edit mode to the current user object, nullifies the current temp dashboard data and exits editmode.
     * Enables a frozen state whilst the save promise is resolving, prevents user navigating away
     * This function returns nothing, but instead acts on the current user object.
     */
    function saveChanges() {
      vm.saveLoadingIcon = true;
      vm.workingText = $translate.instant('common.SAVINGCHANGES');

      var oldDashboardName = vm.dashboard.name;
      if(vm.editDashboardName !== '' && vm.editDashboardName !== vm.dashboard.name) {
        vm.dashboard.name = vm.editDashboardName;
      }

      customDashboardService.updateDashboard(vm.dashboard, oldDashboardName, currentOrganization.organization_id).then( () => {
        tempDash = null;
        vm.editMode = false;
        vm.saveLoadingIcon = false;
        $rootScope.$broadcast('reloadSidebar'); // Fixes menu references to renamed dashboard
      }, (err) =>{
        console.error(err);
      });
    }


    $scope.$on('$stateChangeStart', (event, toState, toParams) => {
      if(vm.saveLoadingIcon){
        event.preventDefault();
        $confirm({
          content: $translate.instant('common.NAVIGATEAWAYLOSECHANGES')
        })
        .then( (answer) => {
          if (answer) {
            vm.saveLoadingIcon = false;
            if(toParams.position) {
              $state.go( toState.name, {position: toParams.position});
            }
          }
        });
      }
    });

    /**
     * Transforms all saved ISO string dates into momentJs objects. Private function.
     * This function returns nothing, but instead acts on the current object.
     * @param {widget} widget - A saved widget object
     */
    function momentizeWidgetDates(widget) {
      widget.dateRange = widget.dateRange || {}; // Ensure dateRange exists
      momentizeDateRange(widget.dateRange);
      momentizeDateRange(widget.compare1Range);
      momentizeDateRange(widget.compare2Range);
    }

    /**
     * Transforms a single date range of strings into a date range of momentJS objects. Private function.
     * This function returns nothing, but instead acts on the current object.
     * @param {dateRange} dateRange - A dateRange object. Should contain 'start' and 'end' properties.
     */
    function momentizeDateRange(dateRange) {
      if (!ObjectUtils.isNullOrUndefined(dateRange) && _.isString(dateRange.start)) {
        dateRange.start = LocalizationService.getLocalDateTimeFormatIgnoringUTC(dateRange.start);
      }

      if (!ObjectUtils.isNullOrUndefined(dateRange) && _.isString(dateRange.end)) {
        dateRange.end = LocalizationService.getLocalDateTimeFormatIgnoringUTC(dateRange.end);
      }
    }

    function setKpiValues() {
      vm.kpiValues = {
        ats: 'ats',
        conversion: 'conversion',
        average_abandonment_rate: 'abandonment_rate',
        draw_rate: 'draw_rate',
        dwell_time: 'dwell_time',
        opportunity: 'opportunity',
        gsh: 'gsh',
        labor_hours: 'labor_hours',
        sales: 'sales',
        star: 'star',
        traffic: 'traffic',
        upt: 'upt',
        average_percent_shoppers: 'average_percent_shoppers'
    };
    }


    /**
    * Replaces the date range and compare dates with up to date ranges based upon the widgets params. Private function.
    * This function returns nothing, but instead acts on the current object. It is called because the dates set in the widget
    * are dynamic and are advancing as the day, week, months and years advance i.e. the dates set in the widget when it
    * was first created are NOT static i.e. fixed in time, but they are momentary and need updating as time advances
    * in the real world.
    * @param {widget} widget - A saved widget object as returned by the API which reads it from the backend DB which at the moment is MongoDB.
    */
    function updateDateRanges(widget) {

      // If the newRange property is not undefined then update the newRange by calling correctDateRange(widget)
      // i.e. set the date range string to a format acceptable for finding the correct date range.
      if(!_.isUndefined(widget.newRange)) {
        correctDateRange(widget);
      }

      // For custom compare widgets there are ONLY 2 types i.e. single and multi. If either of these
      // are passed in then call correctCompareDateRange(widget) and set the date range string to format
      // acceptable for the custom compare.
      if (widget.type === 'single' || widget.type === 'multi') {
        correctCompareDateRange(widget);
      }

      // Fetch this users preferences.
      var userPreferences = vm.currentUser.preferences;

      // If the user has no user preferences set or has no calendar id set then set the user and the widget organization
      // in the LocalizationService so that users calendar can be taken from their organization.
      if(ObjectUtils.isNullOrUndefined(userPreferences) || ObjectUtils.isNullOrUndefined(userPreferences.calendar_id)) {
        LocalizationService.setUser(vm.currentUser);
        LocalizationService.setOrganization(widget.currentOrganization);
      }

      // If the widget was created for a custom date range i.e. not day, week, month or year then
      // update the date ranges in the widget as time advances in the real world.
      if (widget.dateRangeShortCut === 'custom' && ObjectUtils.isNullOrUndefined(widget.customRange)) {

        widget.dateRange.start = moment().startOf('day').subtract(widget.deferStartDaysDateBy, 'days');
        widget.dateRange.end = moment(widget.dateRange.start).add(widget.dateDurationInDays, 'days');

        // Safety for old custom widget configs
        if(angular.isDefined(widget.compareDatesBack)) {
          // Call the date range service for custom date range to set compare 1 range
          widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.dateRangeShortCut, 'compare1Range', undefined, false);

          // Call the date range service for custom date range to set compare 2 range
          widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.dateRangeShortCut, 'compare2Range', undefined, undefined);
        } else {
          // The old way for widgets lacking this information
          widget.compare1Range.start = moment(widget.dateRange.end).subtract(1, 'days');
          widget.compare1Range.end = widget.compare1Range.start.add(widget.dateDurationInDays, 'days');

          widget.compare2Range.start = moment(widget.dateRange.start).subtract(1, 'year');
          widget.compare2Range.end = moment(widget.dateRange.end).subtract(1, 'year');
        }

      } else if (!!widget.dateRangeShortCut.match(/(day|week|month|year)/)) {
        // If the widget date ranges match non-custom i.e. day, week, month or year as supported by the date range selector
        // then set the date ranges as per the date range service.

        // Set the dateRange property of the widget based on the date range short cut set in the
        // widget and the users current organization for any calendar specifics.
        widget.dateRange = setDateShortCut(widget.dateRangeShortCut, widget.currentOrganization);

        // Call the date range service for day, week, month or year for compare 1 range
        widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.dateRangeShortCut, 'compare1Range', undefined, false);

        // Call the date range service for day, week, month or year for compare 2 range
        widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.dateRangeShortCut, 'compare2Range', undefined, undefined);
      } else {
        switch (widget.customRange) {
          case 'wtd': setWTD(widget);
            break;
          case 'mtd': setMTD(widget);
            break;
          case 'qtd': setQTD(widget);
            break;
          case 'ytd': setYTD(widget);
            break;
        }
      }
      checkGroupBy(widget);
    }

    /**
    * Sets the date range string to format acceptable for finding the correct date range. Private function
    * returns the widget object with new set date string params
    * @param {object} - a saved widget object
    */
    function correctDateRange(widget){
      var type = widget.newRange.rangeType;
      switch(type) {
        case 'common.DAY':
          type = 'day';
          widget.dateRangeShortCut = type;
          widget.dateRangeType = type;
          break;
        case 'common.WEEK':
          type = 'week';
          widget.dateRangeShortCut = type;
          widget.dateRangeType = type;
          break;
        case 'common.MONTH':
          type = 'month';
          widget.dateRangeShortCut = type;
          widget.dateRangeType = type;
          break;
        case 'common.YEAR':
          type = 'year';
          widget.dateRangeShortCut = type;
          widget.dateRangeType = type;
          break;
        case 'dateRangePicker.WEEKTODATE':
          type = 'wtd';
          widget.dateRangeShortCut = 'custom';
          widget.dateRangeType = type;
          widget.customRange = type;
          break;
        case 'dateRangePicker.MONTHTODATE':
          type = 'mtd';
          widget.dateRangeShortCut = 'custom';
          widget.dateRangeType = type;
          widget.customRange = type;
          break;
        case 'dateRangePicker.QUARTERTODATE':
          type = 'qtd';
          widget.dateRangeShortCut = 'custom';
          widget.dateRangeType = type;
          widget.customRange = type;
          break;
        case 'dateRangePicker.YEARTODATE':
          type = 'ytd';
          widget.dateRangeShortCut = 'custom';
          widget.dateRangeType = type;
          widget.customRange = type;
          break;
        default:
          widget.dateRangeShortCut = type;
          widget.dateRangeType = type;
          widget.customRange = type;
      }
    }

    /**
    * Sets the date range string to format acceptable for the custom compare. Private function
    * returns the widget object with new set date string params
    * @param {object} - a saved widget object
    */
    function correctCompareDateRange(widget){
      var range = widget.newRange ? widget.newRange.rangeType : widget.selected_date_range.period_type;
      switch(range) {
        case 'common.DAY':
          range = 'day';
          break;
        case 'common.WEEK':
          range = 'week';
          break;
        case 'common.MONTH':
          range = 'month';
          break;
        case 'common.YEAR':
           range = 'year';
          break;
        case 'wtd':
        case 'dateRangePicker.WEEKTODATE':
          range = 'wtd';
          break;
        case 'mtd':
        case 'dateRangePicker.MONTHTODATE':
          range = 'mtd';
          break;
        case 'qtd':
        case 'dateRangePicker.QUARTERTODATE':
          range = 'qtd';
          break;
        case 'ytd':
        case 'dateRangePicker.YEARTODATE':
          range = 'ytd';
        break;
      }

      widget.compare.selected_date_range.period_type = range;
      widget.dateRangeShortCut = range;
      return widget;
    }

    /**
    * Sets the date range & compare periods based upon the shortcut type. Private function.
    * This function returns a new date range which is applied to the widget.
    * @param {type} type - a date range shortcut (string) that has been saved to the widget object
    * @param {organization} organization - organization to get date range for (might have org based calendar settings)
    */
      function setDateShortCut(type, organization) {
        var newDateRange;

        if(ObjectUtils.isNullOrUndefined(organization)) {
          organization = vm.currentOrganization;
        }

        LocalizationService.setOrganization(organization);

        var calendarInfo = LocalizationService.getSystemYearForDate(moment());
        if (!LocalizationService.hasMonthDefinitions()) calendarInfo.month -= 1;

        var currentMonth = calendarInfo.month;
        var currentYear = calendarInfo.year;

        switch (type) {
          case 'day':
            newDateRange = {
              start: moment().startOf('day').subtract(1, 'day').startOf('day'),
              end: moment().startOf('day').subtract(1, 'day').endOf('day')
            };
            break;
          case 'week':
            var firstDay = LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week');
              var zone = moment.locale();
              newDateRange = {
                start: moment(firstDay).startOf('day').add('minutes', zone),
                end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week').endOf('day')
              };
            break;
          case 'month':
            var previousYear;
            var previousMonth = currentMonth - 1;
            if (previousMonth < 0) {
              previousMonth = 11;
              previousYear = currentYear - 1;
            } else {
              previousYear = currentYear;
            }
            newDateRange = {
              start: LocalizationService.getFirstDayOfMonth(previousMonth, previousYear),
              end: LocalizationService.getLastDayOfMonth(previousMonth, previousYear).endOf('day')
            };
            break;
          case 'year':
            newDateRange = {
              start: LocalizationService.getFirstDayOfYear(currentYear - 1),
              end: LocalizationService.getLastDayOfYear(currentYear - 1)
            };
            break;
        }

        return newDateRange;
      }

    /**
    * Sets the date range & compare periods to week to date. Private function.
    * This function returns nothing, but instead acts on the current object.
    * @param {widget} widget - A saved widget object
    */
    function setWTD(widget) {
      widget.dateRange.start = LocalizationService.getFirstDayOfCurrentWeek();
      widget.dateRange.end = moment().subtract(1, 'day').endOf('day');

      // Call the date range service to fetch the compare date range for wtd to display in summary compare 1 range e.g. prior period
      widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare1Range', undefined, false);

      // Call the date range service to fetch the compare date range for wtd to display in summary compare 2 range e.g. prior year
      widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare2Range', undefined, undefined);

    }

    /**
    * Sets the date range & compare periods to month to date. Private function.
    * This function returns nothing, but instead acts on the current object.
    * @param {widget} widget - A saved widget object
    */
    function setMTD(widget) {
      var currentMonth;
      var currentTime = moment();
      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      if(LocalizationService.isCurrentCalendarGregorian()) {
        currentMonth = systemDate.month - 1; // Month needs to be 0-indexed
      } else {
        currentMonth = systemDate.month;
      }
      var currentYear = systemDate.year;

      widget.dateRange.start = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);
      widget.dateRange.end = moment().subtract(1, 'day').endOf('day');

      // Call the date range service to fetch the compare date range for mtd to display in summary compare 1 range e.g. prior period
      widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare1Range', undefined, false);

      // Call the date range service to fetch the compare date range for mtd to display in summary compare 2 range e.g. prior year
      widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare2Range', undefined, undefined);
    }

    /**
    * Sets the date range & compare periods to quarter to date. Private function.
    * This function returns nothing, but instead acts on the current object.
    * @param {widget} widget - A saved widget object
    */
    function setQTD(widget) {
      var currentTime = moment();
      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      var currentMonth = systemDate.month;
      var currentYear = systemDate.year;

      var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;

      var firstMonthOfQuarter = getFirstMonthInQuarter(currPeriod);
      var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, currentYear);

      widget.dateRange.start = firstDayOfCurrentQuarter;
      widget.dateRange.end = moment().subtract(1, 'day').endOf('day');

      // Call the date range service to fetch the compare date range for qtd to display in summary compare 1 range e.g. prior period
      widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare1Range', undefined, false);

      // Call the date range service to fetch the compare date range for qtd to display in summary compare 2 range e.g. prior year
      widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare2Range', undefined, undefined);

    }

    /**
    * Sets the date range & compare periods to year to date. Private function.
    * This function returns nothing, but instead acts on the current object.
    * @param {widget} widget - A saved widget object
    */
    function setYTD(widget) {
      var currentTime = moment();
      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      var currentYear = systemDate.year;
      var lastYear = currentYear - 1;
      var twoYearsAgo = currentYear - 2;

      widget.dateRange.start = LocalizationService.getFirstDayOfYear(currentYear);
      widget.dateRange.end = moment().subtract(1, 'day').endOf('day');

      var dateRangeDiff = widget.dateRange.end.diff(widget.dateRange.start, 'days');

      if(vm.compare1Type !== 'custom') {
        widget.compare1Range.start = LocalizationService.getFirstDayOfYear(lastYear);
        widget.compare1Range.end = moment(widget.compare1Range.start).add(dateRangeDiff, 'day');
      } else {
        // Call the date range service to fetch the compare date range for ytd to display in summary compare 1 range e.g. prior period
        widget.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare1Range', undefined, false);
      }

      if(vm.compare2Type !== 'custom') {
        widget.compare2Range.start = LocalizationService.getFirstDayOfYear(twoYearsAgo);
        widget.compare2Range.end = moment(widget.compare2Range.start).add(dateRangeDiff, 'day');
      } else {
        // Call the date range service to fetch the compare date range for ytd to display in summary compare 2 range e.g. prior year
        widget.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, vm.currentUser, vm.currentOrganization, widget.customRange, 'compare2Range', undefined, undefined);
      }

    }

    /**
    * This function calculates the first month in the current quarter. Private function.
    * This function returns a number.
    * @param {quarterNumber} quarterNumber - a number, the current quarter number
    */
    function getFirstMonthInQuarter(quarterNumber) {
      return quarterNumber * 3 - 3;
    }

    /**
    * This function generates a time period and readable date range type.
    * This function returns an object.
    * @param {widget} widget - a saved widget object
    */
    function getExportTimePeriodTitle(widget) {
      var timePeriod = {};
      var dateMask;
      vm.currentUser.localization.date_format.mask ? dateMask = vm.currentUser.localization.date_format.mask : dateMask = widget.dateFormat;
      if(widget.name === 'org-custom-compare') {
        widget.dateRangeShortCut = widget.newRange ? widget.newRange.rangeType : widget.compare.selected_date_range.period_type;
      } else {
        var start = widget.dateRange.start.format(dateMask);
        var end = widget.dateRange.end.format(dateMask);
        timePeriod.period = start + ' - ' + end;
      }

      if(widget && widget.name && widget.name.indexOf('real_time') >= 0) {
        return start;
      }

      if(!_.isUndefined(widget.date) &&
        widget.date.range.transKey === 'customDashboard.PAGEDEFAULT') {
        timePeriod.tranString = 'customDashboard.PAGEDEFAULT';
        return timePeriod;
      }

      if(widget.isHourly){
        timePeriod.tranString = 'common.HOUR';
        return timePeriod;
      }

      switch (widget.dateRangeShortCut) {
        case 'day': timePeriod.tranString = 'common.DAY'; break;
        case 'week': timePeriod.tranString = 'common.WEEK'; break;
        case 'month': timePeriod.tranString = 'common.MONTH'; break;
        case 'year': timePeriod.tranString = 'common.YEAR'; break;
        case 'quarter': timePeriod.tranString = 'datePeriodSelector.QUARTER'; break;
        case 'week_to_date': timePeriod.tranString = 'dateRangePicker.WEEKTODATE'; break;
        case 'month_to_date': timePeriod.tranString = 'dateRangePicker.MONTHTODATE'; break;
        case 'quarter_to_date': timePeriod.tranString = 'dateRangePicker.QUARTERTODATE'; break;
        case 'year_to_date': timePeriod.tranString = 'dateRangePicker.YEARTODATE'; break;
        default:
          switch (widget.customRange) {
            case 'wtd': timePeriod.tranString = 'dateRangePicker.WEEKTODATE'; break;
            case 'mtd': timePeriod.tranString = 'dateRangePicker.MONTHTODATE'; break;
            case 'qtd': timePeriod.tranString = 'dateRangePicker.QUARTERTODATE'; break;
            case 'ytd': timePeriod.tranString = 'dateRangePicker.YEARTODATE'; break;
            default: timePeriod.tranString = 'accountView.CUSTOM';
          };
      }

      return timePeriod;
    };

    /**
    * This function standardises the organisationId number for each widget
    * This function returns a widget object with a new assignment - the widget.organizationId number property.
    * @param {widget} widget - a saved widget object
    */
    function standardiseOrgId(widget) {
      if (!_.isUndefined(widget.organizationId)) {
        var widgetOrgId = Number(widget.organizationId);
      } else if (!_.isUndefined(widget.organization_id)) {
        var widgetOrgId = Number(widget.organization_id);
      } else if (!_.isUndefined(widget.orgId)) {
        var widgetOrgId = Number(widget.orgId);
      }

      //just so partialPageName is the standard based on fix for duplicates
      if(_.isUndefined(widget.partialPageName)) {
        widget.partialPageName = widget.name;
      }

      //standardise the org id
      widget.organizationId = widgetOrgId

      return widget;
    }

     /**
    * This function assigns the options for the date range dropdown
    * This function returns a widget object with new assignments - the widget.dateRanges
    * @param {widget} widget - a saved widget object
    */
    function assignDateSelections(widget){
      widget.dateRangeTypes = angular.copy(constants.dateRangeTypes);
      if (widget.name === 'org-custom-compare') {
        widget.dateRangeTypes.quarter = {
          transKey : 'datePeriodSelector.QUARTER',
          rangeType : 'quarter'
        }
      }

      if(widget.name === 'daily_performance_widget') {
        var dayOption = _.findWhere(widget.dateRangeTypes, { rangeType: 'day' });
        widget.dateRangeTypes = _.without(widget.dateRangeTypes, dayOption);
      }

      return widget;
    }

    /**
    * This function reassigns each widgets newRange property to be a dashboard level date range.
    * This function returns nothing but acts upon each widget object and the widget.date model that is set in the view
    * @param {range} widget - a date range object assigned on an ng-click
    */
    function setAllDateRanges(range) {
      _.each(vm.dashboard.widgets, (widget) => {
        if(!widget.isHourly){
          if(!_.isUndefined(widget.dateRangeTypes.default)){
            widget.dateRangeTypes.default.rangeType = range.rangeType;
          } else {
            widget.dateRangeTypes.default = {
              rangeType : range.rangeType,
              transKey: 'customDashboard.PAGEDEFAULT'
            }
          }
          widget.date = {
            range : widget.dateRangeTypes.default
          }
          widget.newRange = widget.dateRangeTypes.default;
        }
        widget.hasDefaultRange = true;
      });
      setMainDateButtonString(range);
    }

    /**
    * This function assigns vm.dashDateRange which is used in the view to populate the text in the button controlling dash level date ranges
    * This function returns nothing but acts upon the vm.dashDateRange property
    */
    function setMainDateButtonString(range){
      var shortCuts = [];
      _.each(vm.dashboard.widgets, (widget) => {
        if(!widget.isHourly){
          var shortcut = widget.dateRangeShortCut !== 'custom' ? widget.dateRangeShortCut : widget.customRange;
          shortCuts.push(shortcut);
        }
      })

      if(shortCuts.length === 0){
        vm.dashDateRange = 'customCompare.SELECTDATEPERIODS';
        return;
      }

      if(vm.dashboard.widgets.length && vm.dashboard.widgets[0].hasDefaultRange) {
        if(range){
          vm.dashDateRange = vm.dateRangeTypes[range.rangeType].transKey;
        } else {
          vm.dashDateRange = defaultDateRangeType.rangeType;
        }

        _.each(vm.dashboard.widgets, (widget) => {
          widget.dateRangeTypes.default = {
            rangeType: vm.dashDateRange,
            transKey: 'customDashboard.PAGEDEFAULT'
          }
        });
      } else {
        vm.dashDateRange = 'customCompare.SELECTDATEPERIODS';
        _.each(vm.dashboard.widgets, (widget) => {
          delete widget.dateRangeTypes.default;
        })
      }

      return vm.dashDateRange;
    }

    /**
    * This function assigns required properties needed if the widget is a custom compare chart
    * This function returns a widget object with new assignments - the widget.name and widget.compare
    * @param {widget} widget - a saved widget object
    */
    function setForCompare(widget) {
      if (widget.type === 'single' || widget.type === 'multi') {
        if (ObjectUtils.isNullOrUndefined(widget.compare)) {
          widget.compare = angular.copy(widget)
        }

        widget.dateRanges = '';
        widget.compare.sites = widget.compare.compareSites;
        widget.name = 'org-custom-compare';

        return widget;
      }
    }

    /**
    * This function assigns the widget.currentOrganization object property based upon the widget.organizationId
    * This function returns a widget object with a new assignment - the widget.currentOrganization
    * @param {widget} widget - a saved widget object
    */
    function setOrgs(widget) {

      widget.currentOrganization = _.find(vm.orgList, {organization_id: widget.organizationId});
      widget.orgName = widget.currentOrganization.name;
      //set the date format to be the same as the user selected, however if org default selected, change to widgets org.
      setWidgetDateFormat(widget);
      return widget;
    }

    function setWidgetDateFormat(widget){
      widget.dateFormat = LocalizationService.getCurrentDateFormat(widget.currentOrganization);
    }

     /**
    * This function assigns currentSite and siteName properties for site level widgets
    * This function returns a widget object with new assignments - widget.siteName and widget.currentSite
    * @param {widget} widget - a saved widget object
    */
    function getSitesById(widget) {
      if ('siteId' in widget) {
        widget.currentSite = _.find(vm.siteList, {site_id: widget.siteId});
        widget.siteName = widget.currentSite.name;
        return widget;
      }
    }

     /**
    * This function assigns an array of siteId's that belong to an organisation (org level widgets)
    * This function returns a widget object with new assignments - widget.sites
    * @param {widget} widget - a saved widget object
    */
    function getSitesByOrgId(widget) {
      if ('sites' in widget) {
        SiteResource.query({
          orgId: widget.organizationId
        }).$promise.then( (data) => {
          widget.sites = data;
          if (!ObjectUtils.isNullOrUndefined(widget.compare)) {//if custom compare widget, populate compare sites with detailed site information
            var sitesArray = [];
            _.each(widget.compare.sites, (site) => {
              site = _.find(widget.sites, (item) => item.site_id === site);
              sitesArray.push(site);
            });
            if (!ObjectUtils.isNullOrUndefined(sitesArray[0])){
              widget.compareSites = sitesArray;
            } else {
              widget.compareSites = widget.compare.compareSites;
            }
          }
        }, (message) => {
          throw Error(message);
        });
        return widget;
      }
    }

    function widgetLayoutChanged() {
      $rootScope.$broadcast('customDashboardReflow');
      setWidgetWidths();
    }

    function redrawCustomDashboardCharts() {
      // Re-render charts after transition delay:
      $timeout(function redrawCustomDashboardChartsTimeout(){
        $window.dispatchEvent(new CustomEvent('resize'));
      }, constants.WIDGET_RESIZE_TRANSITION_DURATION + 1200);
    }

    function setWidgetWidths() {
      _.each(vm.dashboard.widgets, function setWidgetWidths_each(widget) {
        widget.gridWidthClass = 'grid-' + vm.gridLayouts[widget.gridLayout].responsiveWidths[getBreakpointName()] + 'pc';
      });
    }

    function getBreakpointName() {
      return viewportService.getViewportInfo().breakpoint.name || 'media-md';
    }

    function event_dashboardDropped() { // args: e, $el
      $rootScope.$broadcast('customDashboardReflow');
    }

    function event_dashboardMousemove(e) {
      var isDragging = $scope.$$dragula && $scope.$$dragula.bags[0].drake.dragging;
      $window.document.documentElement.classList.toggle('is-dragging-dashboard', isDragging); // CSS hook
      if (!isDragging) return false;

      var windowHeight = $($window).height();
      var mousePosition = e.pageY - $($window).scrollTop();
      var topRegion = 220;
      var bottomRegion = windowHeight - 220;

      if (e.which === 1 && (mousePosition < topRegion || mousePosition > bottomRegion)) {
        $($document).scrollTop((e.clientY - windowHeight / 2) * 0.05 + $($document).scrollTop());
      }
    }

    function configureDragAndDrop() {
      dragulaService.options($scope, vm.customDashboardBagName, {
        direction: 'horizontal',
        moves: (el, container, clickedEl) => (vm.editMode && $(clickedEl).parents('.btn, button, .btn-group').length === 0)
      });
    }

    function $scopeDestroyed() {
      $rootScope.customDashboards = false;

      _.each($scopeEventHandlers, function $scopeDestroyed_each(cleanupFunction){
        // Unregisters $scope event handlers:
        if (_.isFunction(cleanupFunction)) cleanupFunction();
      });

      // Unregister DOM event handlers:
      $window.document.removeEventListener('mousemove', event_dashboardMousemove);

      removeLoadingFlagWatch();
    }

    function checkGroupBy(widget){
      var dateRangeStart = ObjectUtils.getNestedProperty(widget, 'dateRange.start');
      var dateRangeEnd = ObjectUtils.getNestedProperty(widget, 'dateRange.end');

      if (utils.dateRangeSpansOverTwoCalendarMonths(dateRangeStart, dateRangeEnd)){
        // = groupBy is valid
        return;
      }
      if (utils.dateRangeSpansOverTwoCalendarWeeks(dateRangeStart, dateRangeEnd)){
        // = only week and day group by is valid
        if(widget.groupBy === 'month'){
          widget.groupBy = 'week';
          return widget;
        } else {
          // = groupBy is valid
          return;
        }
      }

      widget.groupBy = 'day';      // default to 'day' as groupBy

      return widget;
    }

    /**
     * This function transforms the widget weather metrics to include relevant information to passed to the directive
     * @param {object} widget - a saved widget object
     */
    function updateWeather(widget) {
      if(!widget.showWeatherMetrics){
        return;
      }
      if(ObjectUtils.isNullOrUndefinedOrEmpty(widget.selectedWeatherMetrics)){
        widget.selectedWeatherMetrics = [];
        _.each(widget.weather, (selectedMetric) => {
          var weatherMetric = _.findWhere(metricConstants.weatherMetrics, {kpi: selectedMetric});
          widget.selectedWeatherMetrics.push(weatherMetric);
        });
        return;
      }
      widget.weather = _.pluck(widget.selectedWeatherMetrics, 'kpi');
    }

    /**
     * Updates the widgets sales categories
     * @param {object} widget - saved widget object
     */
    function updateSalesCats(widget){
      var salesCats = widget.currentOrganization.sales_categories;
      // check its the right widget type, that the orgs has sales cats & there is more than 1
      if(
        widget.name !== 'traffic' ||
        ObjectUtils.isNullOrUndefinedOrEmpty(salesCats) ||
        salesCats.length < 2
      ){
        widget.showSalesCategoriesSelector = false;
        return;
      }

      //check a correct sales metric is selected
      if(
        widget.kpi !== 'sales' &&
        widget.kpi !== 'ats' &&
        widget.kpi !== 'conversion'
      ){
        widget.showSalesCategoriesSelector = false;
        return;
      }

      widget.showSalesCategoriesSelector = true;
    }

    /**
     * Updates a widget type's specific properties if needed after a custom dashboard change.
     * E.g. Changing the date range may need to change a default selection on the widget
     * @param {object} widget - saved widget object
     */
    function updateWidgetSpecificProperties(widget) {
      if(widget.name === 'traffic_per_weekday') {
        updateTrafficPerWeekdayProperties(widget);
      }
    }

    /**
     * Sets the traffic per weekday widget's default day selection.
     * If the widget goes from having a single date range to anything else, the default day selection gets set to All days.
     * @param {object} widget - widget config for the traffic_per_weekday object
     */
    function updateTrafficPerWeekdayProperties(widget) {
      if(_.isUndefined(widget.newRange) || _.isUndefined(widget.oldRange)) {
        return;
      }

      if(widget.newRange.rangeType === widget.oldRange.rangeType) {
        return;
      }

      if(widget.newRange.rangeType !== 'day' && widget.oldRange.rangeType === 'day') {
        //select all days
        var allDaysOption = { key: 'all' }
        widget.selectedDays = [allDaysOption];
      }
    }

    function updateWidgetDateRange(widget, range) {
      if(!_.isUndefined(widget.date)) {
        widget.oldRange = angular.copy(widget.date.range);
      }

      widget.date = { range: range};
      widget.newRange = widget.date.range;
    }
  }
})();
