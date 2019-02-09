class cellRenderer {
  constructor() {
  }

  // init method gets the details of the cell to be rendere
  init(params) {
    this.eGui = document.createElement('div');
    this.eGui.setAttribute('class', this.getCellClass(params));
    this.eGui.innerHTML = params.value;
  }

  getGui() {
    return this.eGui;
  }

  /**
  * gets cell class
  * this classes are set to hel e2e test please do not remove them unless you are changing e2e tests
  *
  */
  getCellClass(params) {
    if (params.node.data.isTotalFooter) {
      switch (params.column.colId) {
        case 'total': return 'weekly-total-cell';
        case 'hour': return 'total-row-header';
        default: return 'daily-total-value';
      }
    }

    switch (params.column.colId) {
      case 'total': return 'total-hour-value row-' + params.rowIndex;
      case 'hour': return 'hour-row-header';
      default: return 'hour-row-value hour-row-value-' + params.rowIndex;
    }
  }
}

/**
 * Power Hours widget loading logic:
 *
 * 1. Load organization and site details if necessary. These might be provided by the view.
 * 2. Load traffic data for coloring cells and getting hour definition (this is crucial,
 *    as sales requests to powerHours always return only business hours)
 * 3. Load data for cells and use hour definition from step 1
 * 4. Load total data to populate "total" rows in the table. This is required because we can't
 *    calculate average of averages.
 */
class powerHoursWidgetController {
  constructor($scope,
    $rootScope,
    $q,
    $timeout,
    $translate,
    $filter,
    $window,
    $element,
    requestManager,
    apiUrl,
    LocalizationService,
    SubscriptionsService,
    metricConstants,
    ObjectUtils,
    currencyService,
    SiteResource,
    OrganizationResource,
    utils,
    NumberUtils,
    currentSalesCategoryService,
    CompParams
  ) {
    this.$timeout = $timeout;
    this.$translate = $translate;
    this.$filter = $filter;
    this.$window = $window;
    this.weekDayTransKey = 'weekdaysShort.';
    this.unbindFunctions = [];
    this.metricConstants = metricConstants;
    this.apiUrl = apiUrl;
    this.localMetricConstants;
    this.requestManager = requestManager;
    this.salesDataLoaded = false;
    this.ObjectUtils = ObjectUtils;
    this.SubscriptionsService = SubscriptionsService;
    this.LocalizationService = LocalizationService;
    this.currencyService = currencyService;
    this.OrganizationResource = OrganizationResource;
    this.SiteResource = SiteResource;
    this.currentSalesCategoryService = currentSalesCategoryService;
    this.NumberUtils = NumberUtils;
    this.utils = utils;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$q = $q;
    this.$element = $element;
    this.CompParams = CompParams;


    /**
    * handles watch for Sales Category pull-down selection.
    */
    this.handleWatchMetricSelection = (newValue, oldValue) => {
      // This stops that weird initialization fire
      if (angular.equals(newValue, oldValue)) {
        return;
      }
      this.showTimeFormatInfo = !this.$rootScope.pdf && Number(this.timeFormat) === 12 && this.selectedMetrics.length > 1;
      this.isSalesMetricSelected = this.isSalesMetricInSelectedMetrics();
      this.setActiveOption();
      this.handleWatch(newValue, oldValue);
    }

    this.setActiveOption = () => {
      this.activeOption = _.reduce(this.selectedMetrics, (total, item) => {
        if (!_.isUndefined(total) && total !== '') total = total + ',';
        return total + item.metric.shortTranslationLabel;
      }, '');

      this.pdfOrientation = this.getOrientation();

      this.displayType = this.activeOption;
    }

    /**
    * handles watches if new value is different then old one then load metric data
    */
    this.handleWatch = (newValue, oldValue) => {
      // This stops that weird initialization fire
      if (angular.equals(newValue, oldValue)) {
        return;
      }

      this.isLoading = true;
      this.requestFailed = false;
      this.showNodata = false;

      this.loadMetricData();
    }

    /**
    * handles watch for Sales Category pull-down selection.
    */
    this.handleWatchSalesCategories = (newValue, oldValue) => {
      this.salesCategories = newValue;
      this.handleWatch(newValue, oldValue);

      this.$rootScope.customDashboards !== true &&
        this.currentSalesCategoryService.storeSelection('power-hours-widget', this.salesCategories);
    }

    /**
    * handle api errors
    *
    * @returns nothing
    */
    this.handleError = (error) => {
      this.outstandingRequests = [];
      this.isLoading = false;
      if (error.status === 404 && !this.ObjectUtils.isNullOrUndefinedOrEmpty(this.customTags)) {
        // We probably got a 404 because the user selected a tag and there are no sites with that tag
        // So let's show a no data message
        console.warn(error);
        this.periodHasData = false;
        this.clearLoadingFlagsAndSetNoData();
        this.setExportLoaded();
        return;
      }

      if (error !== 'User cancelled') {
        this.requestFailed = true;
        this.setExportLoaded();
        console.error(error);
      }
    }
  }

  $onInit() {
    this.requestFailed = false;
    this.showNodata = false;
    this.trueVal = true;
    this.isPdf = _.isUndefined(this.$rootScope.pdf) ? false : this.$rootScope.pdf;
    this.minLength = 1;
    this.maxLength = 2;
    this.totalTitleKey = 'powerHoursWidget.TOTAL';
    this.averageTitleKey = 'powerHoursWidget.AVERAGE';

    // All metrics should show Daily Average as label
    this.averageMetricSelected = true;

    this.setMetricsConstants();
    this.loadTranslations();

    this.configureWatches();

    this.loadAllData();
  }

  getOrientation() {
    if(!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedMetrics) && this.selectedMetrics.length > 1) return 'landscape';
    return 'portrait';
  }

  /**
  * initiate loading
  */
  setLoadingFlags() {
    this.isLoading = true;
    this.requestFailed = false;
    this.showNodata = false;
  }

  /**
  * Set Sales Category Pull Down Selection and
  * watch the selection for changes.
  *
  */
  setSalesCategoriesSelection() {
    const selectedSalesCategory = this.currentSalesCategoryService.readSelection('power-hours-widget');

    //MCR fix for PH: dont use preselected values for custom dashboard widgets!
    if (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory) && this.$rootScope.customDashboards !== true) {
      this.salesCategories = selectedSalesCategory;
    }
  }

  /**
   * cancel outstanding requests to stop showing no data or error message when user changes metrics
   *
   */
  cancelAllOutstandingRequests() {
    _.each(this.outstandingRequests, (request) => {
      this.requestManager.cancelRequest(request);
    });
    this.cancelOutstandingRequests = [];
  }

  /**
  * updates vm hour model with given result sets
  * @param {Object} The result sets to update model
  */
  updateDataModels(responses) {
    this.initValues();
    this.updateDataModelWithTrafficColour(responses[0], this.options[0]);
    _.each(this.selectedMetrics, metric => {
      this.updateDataModel(responses[1], metric);

      if (this.selectedMetricIsCalculated(metric)) {
        this.updateDataModelTotals(responses[2], metric);

        this.updateDataModelHourTotals(responses[3], metric);

        this.updateDataModelTotal(responses[4], metric);
      }
    });

    this.renderGrid();
  }

  setSelectedMetricForPdfIfNotSet() {
    // this if block is for some legacy pdf reports, where they cannot apply a selectedOption
    if (this.$rootScope.pdf && this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedMetrics)) {
      const selectedMetrics = [];
      const kpiTypes = angular.copy(this.activeOption).split(',');
      _.each(kpiTypes, kpi => {
        const kpiType = kpi.replace('kpis.shortKpiTitles.', '');
        selectedMetrics.push(_.findWhere(this.options, { 'customMetricKey': kpiType }));
      })


      if (this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedMetrics) && this.activeOption.indexOf('tenant_traffic') !== -1) {
        selectedMetrics.push(_.findWhere(this.options, { 'customMetricKey': 'average_traffic' }));
      } else {//if still not found - fall back to average_traffic
        selectedMetrics.push(this.options[0]);
      }
      this.selectedMetrics = selectedMetrics;
    }
  }

  /**
  * load metric data and populate module
  */
  loadMetricData() {
    this.timeFormat = this.getTimeFormat();
    this.cancelAllOutstandingRequests();
    this.setSelectedMetricForPdfIfNotSet();

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedMetrics)) {
      return;
    }

    if (this.isSalesMetricSelected && this.SubscriptionsService.orgHasSalesCategories(this.currentOrganization) && !this.salesCategoriesAreSet()) {
      return;
    }

    this.showTimeFormatInfo = !this.$rootScope.pdf && Number(this.timeFormat) === 12 && this.selectedMetrics.length > 1;

    this.setLoadingFlags();

    this.outstandingRequests = this.getAllDataRequests();

    this.$q.all(this.outstandingRequests)
      .then(responses => {
        this.outstandingRequests = [];
        try {
          this.updateDataModels(responses);
          this.clearLoadingFlagsAndSetNoData();
        }
        catch (err) {
          this.handleError(err);
        }
      })
      .catch(this.handleError);
  }

  /**
  * get required request sets to call in this.$q.all so it can populate modules properly and wait minimum to improve performance
  * @param {Object} The result sets to update model
  */
  getAllDataRequests() {
    const requests = [this.getTrafficDataForColourSettingRequest(), this.getDataRequest()];
    if (this.selectedMetricIsCalculated()) {
      requests.push(this.getTotalsRequest());

      requests.push(this.getHourTotalsRequest());

      requests.push(this.getHourTotalRequest());
    }

    return requests;
  }

  /**
  * Gets the totals request for the API rather than calculating them in this controller.
  * Should be called for calculated metrics, like ATS, Conversion and STAR
  *
  * @returns {Object} A request object
  */
  getHourTotalRequest() {
    const requestParams = { params: this.getRequestParamsForTotals('aggregate') };

    // As this is only called for ATS, STAR and Conversion, we can hit the sales endpoint
    return this.requestManager.get(`${this.apiUrl}/kpis/report`, requestParams);
  }

  /**
  * first load org and site then load metric data and populates models
  */
  loadAllData() {
    this.$q.all([this.getCurrentOrganization(), this.getCurrentSite()])
      .then(() => {
        this.getOrganizationParameters();
        this.setCurrencySymbol();
        this.loadMetricData();

        if (this.SubscriptionsService.orgHasSalesCategories(this.currentOrganization)) {
          this.setSalesCategoriesSelection();
        }
      })
      .catch(this.handleError);
  }

  /**
   * returns data value for hour total value
   * @param {Object} hourItem to find hour in data set
   * @param {Object} data set to find the value
  * @return {Number} 0 if it is not valid or data value
   */
  getHourTotalValue(hourItem, data, metric) {
    if (this.ObjectUtils.isNullOrUndefined(data) || this.ObjectUtils.isNullOrUndefinedOrEmpty(data.result)) {
      return 0;
    }
    const dataItem = _.findWhere(data.result, { period_start_date: hourItem.hour });
    if (this.ObjectUtils.isNullOrUndefined(dataItem) || this.ObjectUtils.isNullOrUndefinedOrBlank(dataItem[metric.displayType])) {
      return '0';
    }
    return dataItem[metric.displayType];
  }

  /**
  * updates hour model total values for calculated metrics
  * @param {Object} data set to find the value
  */
  updateDataModelHourTotals(data, metric) {
    let hourData = this.getHourDataForMetric(metric);
    _.each(hourData, hourItem => {
      hourItem.total = this.getHourTotalValue(hourItem, data, metric);
    });
  }

  /**
  * Gets the totals from the API rather than calculating them in this controller.
  * Should be called for calculated metrics, like ATS, Conversion and STAR
  *
  * @returns {Object} A momentJs object that is the first day of the year
  */
  getTotalsRequest() {
    const requestParams = { params: this.getRequestParamsForTotals() };
    // As this is only called for ATS, STAR and Conversion, we can hit the sales endpoint
    return this.requestManager.get(`${this.apiUrl}/kpis/sales`, requestParams);
  }

  /**
  * Gets the totals request for the API rather than calculating them in this controller.
  * Should be called for calculated metrics, like ATS, Conversion and STAR
  *
  * @returns {Object} A request object
  */
  getHourTotalsRequest() {
    const requestParams = { params: this.getRequestParamsForTotals('hour_of_day') };
    // As this is only called for ATS, STAR and Conversion, we can hit the sales endpoint
    return this.requestManager.get(`${this.apiUrl}/kpis/report`, requestParams);
  }

  /**
  * Gets the request for the API for metric data fetch
  *
  * @returns {Object} A request object
  */
  getDataRequest() {
    const requestParams = { params: this.getRequestParams() };

    if (this.isSalesMetricSelected !== true) {
      requestParams.params = _.omit(requestParams.params, 'sales_category_id');
    }

    const url = this.getApiEndpoint();

    return this.requestManager.get(url, requestParams);
  }

  /**
  * Gets the traffic request for the API for metric data fetch color settings
  *
  * @returns {Object} A request object
  */
  getTrafficDataForColourSettingRequest() {
    const requestParams = this.getRequestParamsForTraffic();

    const url = this.getApiEndpoint();

    return this.requestManager
      .get(url, {
        params: requestParams
      });
  }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations
   */
  setMetricsConstants() {
    this.localMetricConstants = angular.copy(this.metricConstants);

    if (!_.isUndefined(this.orgMetrics)) {
      this.localMetricConstants.metrics = this.orgMetrics;
    }
  }

  /**
  * Configures watches. Also destroys watches when needed
  */
  configureWatches() {
    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.unbindFunctions)) {
      return;
    }

    // Watch sales category pull down. When loaded or selection changed set
    // the current sales category service with the selected item in the pull down.
    this.unbindFunctions.push(this.$scope.$watch(angular.bind(this, () => {
      return this.customTags;
    }), this.handleWatch));

    this.unbindFunctions.push(this.$scope.$watch(angular.bind(this, () => {
      return this.selectedTags;
    }), this.handleWatch));

    this.unbindFunctions.push(this.$scope.$watch(angular.bind(this, () => {
      return this.selectedMetrics;
    }), this.handleWatchMetricSelection));

    this.unbindFunctions.push(this.$scope.$watch(angular.bind(this, () => {
      return this.compStores;
    }), this.handleWatch));

    this.$scope.$on('$destroy', () => {
      _.each(this.unbindFunctions, unbindFunction => {
        if (angular.isFunction(unbindFunction)) {
          unbindFunction();
        }
      });
      angular.element(this.$window).off('resize', this.resizeColumns());
    });
  }

  getCurrentSite() {
    const deferred = this.$q.defer();

    if (this.isOrgLevel()) {
      deferred.resolve();
      return deferred.promise;
    }

    if (!this.ObjectUtils.isNullOrUndefined(this.currentSite) || this.ObjectUtils.isNullOrUndefined(this.siteId)) {
      // We don't need to load the site, so continue
      deferred.resolve();
      return deferred.promise;
    }

    this.SiteResource.get({
      orgId: this.orgId,
      siteId: this.siteId
    }).$promise.then(result => {
      this.currentSite = result;
      deferred.resolve();
    });

    return deferred.promise;
  }

  /**
   * Checks if the widget is being used at org level.
   * If the currentSite or a siteId have not been supplied to the directive, this returns true
   *
   * @returns {boolean} The result
   */
  isOrgLevel() {
    if (!this.ObjectUtils.isNullOrUndefined(this.currentSite)) {
      return false;
    }

    if (!this.ObjectUtils.isNullOrUndefined(this.siteId)) {
      return false;
    }

    return true;
  }

  /**
   * Checks if the widget is being used at site level.
   * Returns the inverse of isOrgLevel.
   * This is a helper designed to make the code super readable.
   *
   * @returns {boolean} The result
   */
  isSiteLevel() {
    return !this.isOrgLevel();
  }

  getCurrentOrganization() {
    const deferred = this.$q.defer();

    if (!this.ObjectUtils.isNullOrUndefined(this.currentOrganization) || this.ObjectUtils.isNullOrUndefined(this.orgId)) {
      // We don't need to load the org, so continue
      this.setLocalization();
      deferred.resolve();
      return deferred.promise;
    }

    this.OrganizationResource.get({
      orgId: this.orgId
    }).$promise.then(result => {
      this.currentOrganization = result;
      this.setLocalization();
      deferred.resolve();
    });

    return deferred.promise;
  }

  setLocalization() {
    this.LocalizationService.setOrganization(this.currentOrganization);
    this.numberFormatName = this.LocalizationService.getCurrentNumberFormatName(this.currentUser, this.currentOrganization);
  }

  setDays() {
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push({
        day: i,
        key: this.getDayKey(i),
        hasData: false,
        metricData: []
      });
    }

    const firstDay = this.LocalizationService.getCurrentCalendarFirstDayOfWeek();

    if (firstDay === 1) {
      const last = days.shift();

      days.push(last);
    }

    this.days = days;
  }

  setNumberOfDaysHasData() {
    _.each(this.selectedMetrics, option => {
      if (this.isTraffic(option)) {
        const days = _.filter(option.data.days, dayItem => dayItem.hasData === true);

        if (!this.ObjectUtils.isNullOrUndefined(days)) {
          this.numOfWeekDaysThatHaveData = days.length;
        }
      }

    })

  }

  setNumberOfDaysHasDataForTrafficColor() {
    const days = _.filter(this.days, dayItem => dayItem.hasData === true);

    if (!this.ObjectUtils.isNullOrUndefined(days)) {
      this.numOfWeekDaysThatHaveData = days.length;
    }
  }

  getOrganizationParameters() {
    const thresholds = this.getThresholds(this.currentOrganization);
    this.lowThreshold = thresholds.lower;
    this.highThreshold = thresholds.upper;

    // This can only be called af the LocalizationService has been primed and the first day set
    this.setDays();
    this.setOptions();
  }

  getTimeFormat() {
    if (this.$rootScope.pdf && !_.isUndefined(this.selectedMetrics) && this.selectedMetrics.length > 1) return 24;
    return (((this.currentOrganization || {}).localization || {}).time_format || {}).format || 12;
  }

  /**
   * Sets the selected metric. Should be called from the UI
   * @param {object} option - The metric to select
   * @param {boolean} noFetch - If set to true, the UI will not be updated. Should only really be set to true in the init stages
   * @returns {Boolean} The result
   */
  setOption(option, noFetch) {
    option.selected = true;
    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedMetrics)) this.selectedMetrics = [option];
    else this.selectedMetrics.push(option);
    this.setActiveOption();

    this.isSalesMetricSelected = this.isSalesMetricInSelectedMetrics();

    if (noFetch === true) {
      return;
    }

    this.loadMetricData();
  };

  isSalesMetric(metric) {
    return _.contains(metric.requiredSubscriptions, 'sales');
  }

  isSalesMetricInSelectedMetrics() {
    return !this.ObjectUtils.isNullOrUndefined(_.find(this.selectedMetrics, item => {
      return this.isSalesMetric(item.metric);
    }));
  }

  getMetric(id) {
    const metric = angular.copy(_.findWhere(this.localMetricConstants.metrics, { value: id }));

    if (metric.isCurrency && !this.ObjectUtils.isNullOrUndefinedOrBlank(this.currencySymbol)) {
      metric.prefixSymbol = this.currencySymbol;
    }
    return metric;
  }

  setOptionFromActiveOption() {
    if (typeof this.options !== 'object') {
      return;
    }
    if (this.ObjectUtils.isNullOrUndefinedOrBlank(this.activeOption)) return this.setOption(this.options[0], true);
    let activeoptions = this.activeOption.split(',');
    _.each(activeoptions, shortTranslationLabel => {
      let option = _.find(this.options, option => option.metric.shortTranslationLabel === shortTranslationLabel);
      // We need to call setOption with noFetch set to true
      // This is because setOptions runs in the init stages of the controller, and calling without noFetch set
      // would result in unwanted loads
      if (!this.ObjectUtils.isNullOrUndefined(option)) this.setOption(option, true);
    })
  }

  getOption(name, displayType, propertyName, metric, calculateAverage, customMetricKey) {
    return {
      name: name,
      displayType: displayType,
      propertyName: propertyName,
      metric: metric,
      calculateAverage: calculateAverage,
      customMetricKey: customMetricKey,
      data: {
        hours: [],
        summedAverage: 0,
        days: angular.copy(this.days)
      }
    }
  }

  setOptions() {
    let options = [
      this.getOption('average_traffic', 'traffic', 'total_traffic', this.getMetric('average_traffic'), true, 'average_traffic'),
      this.getOption('traffic (pct)', 'traffic', 'period_traffic_percent', this.getMetric('traffic (pct)'), false, 'traffic_pct'),
    ];

    if (this.isOrgLevel()) {
      let averageTrafficPerSiteOption = this.getOption('traffic_per_site', 'traffic', 'traffic_per_site', this.getMetric('traffic_per_site'), true, 'traffic_per_site');

      options.splice(1, 0, averageTrafficPerSiteOption);
    }

    const saleSubscription = this.SubscriptionsService.siteHasSales(this.currentOrganization, this.currentSite);

    if (saleSubscription) {
      options.push(
        this.getOption('average_sales', 'sales', 'hourly_sales', this.getMetric('average_sales'), true, 'average_sales'),
        this.getOption('conversion', 'conversion', 'hourly_conversion', this.getMetric('conversion'), false, 'conversion'),
        this.getOption('ats', 'ats', 'hourly_ats', this.getMetric('ats'), false, 'ats')
      );

      if (this.isOrgLevel()) {
        const averageSalesPerSiteOption = this.getOption('sales_per_site', 'sales', 'sales_per_site', this.getMetric('sales_per_site'), true, 'sales_per_site');

        const salesIndex = _.findIndex(options, option => option.name === 'average_sales');

        options.splice(salesIndex + 1, 0, averageSalesPerSiteOption);
      }

      const laborSubscription = this.SubscriptionsService.siteHasLabor(this.currentOrganization, this.currentSite);

      if (laborSubscription) {
        options.push(this.getOption('star', 'star', 'hourly_star', this.getMetric('star'), false, 'star'));
      }
    }
    options.map(option => option.displayName = option.metric.displayName)

    this.options = options;

    this.setOptionFromActiveOption();
  }

  setNodata() {
    this.showNoData = this.isLoading === false &&
      this.requestFailed === false &&
      this.periodHasData === false;
  }

  getRequestParamsForTraffic() {
    const params = this.getRequestParams();
    params.kpi = _.findWhere(this.options, { displayType: 'traffic' }).displayType;
    params.sales_category_id = undefined;

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.customTags)) {
      params.customTagId = this.customTags;
    }

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedTags)) {
      params.hierarchyTagId = this.selectedTags;
    }

    return params;
  }

  setSalesCategoryIdParam(params) {
    if (!this.SubscriptionsService.orgHasSalesCategories(this.currentOrganization)) {
      return;
    }

    if (this.salesCategoriesAreSet()) {
      params.sales_category_id = _.pluck(this.salesCategories, 'id');
    }
  }

  salesCategoriesAreSet() {
    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(this.salesCategories)) {
      return false;
    }

    if (!_.min(this.salesCategories.id) > 0) {
      return false;
    }

    return true;
  }

  getRequestParams() {
    const {
      selectedMetrics,
      dateRangeStart,
      dateRangeEnd,
      compStores: comp_site,
      compStoresRange,
      utils,
      CompParams
    } = this;

    const params = {
      kpi: _.pluck(selectedMetrics, 'displayType'),
      countType: 'enters',
      reportStartDate: utils.getDateStringForRequest(dateRangeStart),
      reportEndDate: utils.getDateStringForRequest(dateRangeEnd),
      // Hard-code basePercentage.
      // It is required by API
      // because this widget doesn't use power hour ind fields in the response
      basePercentage: 0.15,
      comp_site,
      ...(comp_site === true ? CompParams.getCompDates(compStoresRange) : {})
    };

    if (!this.ObjectUtils.isNullOrUndefined(this.zoneId)) {
      params.zoneId = this.zoneId;
    }

    if (!this.ObjectUtils.isNullOrUndefined(this.operatingHours)) {
      params.operatingHours = this.operatingHours;
    }

    this.setSalesCategoryIdParam(params);

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.customTags)) {
      params.customTagId = this.customTags;
    }

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(this.selectedTags)) {
      params.hierarchyTagId = this.selectedTags;
    }

    return params;
  }

  getRequestParamsForTotals(groupBy) {
    const {
      dateRangeStart,
      dateRangeEnd,
      currentOrganization,
      currentSite,
      customTags: customTagId,
      operatingHours,
      selectedMetrics,
      compStores: comp_site,
      compStoresRange,
      utils,
      ObjectUtils,
      CompParams
    } = this;

    const org_level = !this.isSiteLevel();


    const params = {
      reportStartDate: utils.getDateStringForRequest(dateRangeStart),
      reportEndDate: utils.getDateStringForRequest(dateRangeEnd),
      orgId: currentOrganization.organization_id,
      groupBy: ObjectUtils.isNullOrUndefinedOrBlank(groupBy) ? 'day_of_week' : groupBy,
      kpi: _.pluck(selectedMetrics, 'displayType'),
      org_level,
      comp_site,
      ...(comp_site === true ? CompParams.getCompDates(compStoresRange) : {}),
      ...(!org_level ? { siteId: currentSite.site_id } : {}),
      ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? { customTagId } : {}),
      ...(!ObjectUtils.isNullOrUndefined(operatingHours) ? { operatingHours } : {})
    };

    this.setSalesCategoryIdParam(params);

    return params;
  }

  /**
   * Returns true if the current selected metric is calculated.
   *
   * @returns {Boolean} The result
   */
  selectedMetricIsCalculated(metric) {
    if (!metric) {
      let calcMetric = _.find(this.selectedMetrics, metricItem => {
        return !this.ObjectUtils.isNullOrUndefined(metricItem.metric) &&
          metricItem.metric.calculated;
      })

      return !this.ObjectUtils.isNullOrUndefined(calcMetric);
    }

    const isTotalRequired = !this.ObjectUtils.isNullOrUndefined(metric.metric) &&
      metric.metric.calculated;

    return isTotalRequired;
  }

  getItemValue(item, option) {
    if (this.ObjectUtils.isNullOrUndefined(item)) return 0;
    const key = this.ObjectUtils.isNullOrUndefinedOrBlank(option.metric.kpi) ? option.name : option.metric.kpi;

    const value = item[key];

    return parseFloat(this.isValid(value) ? value : 0);
  }

  setDayTotalValue(key, value, option) {
    if (this.ObjectUtils.isNullOrUndefined(value) ||
      this.ObjectUtils.isNullOrUndefinedOrBlank(key)) {
      return;
    }

    const daysItem = _.find(option.data.days, dayItem => this.weekDayTransKey + key.toLowerCase() === dayItem.key);

    if (this.ObjectUtils.isNullOrUndefined(daysItem)) return;

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(daysItem.metricData)) {
      daysItem.metricData = [{
        metric: option.displayType,
        dailyTotal: value
      }];
    }
    let dayMetricData = _.findWhere(daysItem.metricData, { metric: option.displayType });

    if (!this.ObjectUtils.isNullOrUndefined(dayMetricData)) {
      dayMetricData.dailyTotal = value;
    }
    else daysItem.metricData.push({
      metric: option.displayType,
      dailyTotal: value
    });
  }

  updateDataModelTotals(response, metric) {
    if (this.ObjectUtils.isNullOrUndefined(response) ||
      this.ObjectUtils.isNullOrUndefinedOrEmpty(response.result)) {
      return;
    }
    const items = response.result;

    _.each(items, item => {
      this.setDayTotalValue(item.period_start_date, this.getItemValue(item, metric), metric);
    });
  }

  updateDataModelTotal(response, option) {
    if (this.ObjectUtils.isNullOrUndefined(response) ||
      this.ObjectUtils.isNullOrUndefinedOrEmpty(response.result)) {
      return;
    }

    const item = _.isArray(response.result) ? response.result[0] : response.result;

    option.data.summedAverage = this.getItemValue(item, option);
  }

  getApiEndpoint() {
    let url = `${this.apiUrl}/kpis/powerhours/organizations/${this.currentOrganization.organization_id.toString()}`;

    if (this.isOrgLevel()) {
      return url;
    }

    return url += `/sites/${this.currentSite.site_id.toString()}`;
  }

  setVmHoursTrafficClass(hours, totalTraffic, option) {
    if (this.ObjectUtils.isNullOrUndefined(option.data.hours)) {
      this.cachedTrafficClassHours = hours;
      this.cachedTotalTraffic = totalTraffic;
      return;
    }

    let hourData = this.getHourDataForMetric(option);

    _.each(hours, hourItem => {
      const vmHour = _.findWhere(hourData, { hour: hourItem.hour });
      if (!this.ObjectUtils.isNullOrUndefined(vmHour) &&
        !this.ObjectUtils.isNullOrUndefined(vmHour.dayValues)) {
        _.each(hourItem.dayValues, dayItem => {
          const colorClass = this.getTrafficClass(dayItem, totalTraffic);
          const hourDayItem = _.findWhere(vmHour.dayValues, { dayName: dayItem.dayName });
          if (!this.ObjectUtils.isNullOrUndefined(hourDayItem)) {
            hourDayItem.colorClass = colorClass;
          }
        });
      }
    });
  }

  getItemData(item, propertyName) {
    const value = item[propertyName];

    return parseFloat(this.isValid(value) ? value : 0);
  }

  isValid(value) {
    return !this.ObjectUtils.isNullOrUndefinedOrBlank(value);
  }

  getGroupedHourItems(items) {
    let hourlyData = items;

    /* At org level, the PH response for sales data
     * is wrapped in a salesPowerHours object
    **/
    if (!_.isUndefined(items.salesPowerHours)) {
      hourlyData = items.salesPowerHours;
    }

    return _.groupBy(hourlyData, item => {
      if (!this.ObjectUtils.isNullOrUndefinedOrBlank(item.period_start_date)) {
        return this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.period_start_date).hour();
      }
      return item.hour_of_day;
    });
  }

  getGroupedHourDayItems(items) {
    return _.groupBy(items, item => item.dow_name);
  }

  getDayDataForHourFromDataList(hourDayItems, propertyName, option, colorSettingsHour) {
    const data = {
      dayName: hourDayItems[0].dow_name,
      summedData: 0,
      frequency: hourDayItems.length,
      total: 0,
      colorClass: this.getColorClassFromDayItem(colorSettingsHour, hourDayItems[0])
    };

    _.each(hourDayItems, hourDayItem => {
      data.summedData += this.getItemData(hourDayItem, propertyName);
    });

    if (option.calculateAverage) {
      data.total = data.summedData / data.frequency;
    } else {
      data.total = data.summedData;
    }

    return data;
  }

  isTraffic(option) {
    return option.displayType === 'traffic';
  }

  getDayDataForHour(hourDayItem, propertyName, option, colorSettingsHour) {
    if (!this.ObjectUtils.isNullOrUndefined(hourDayItem.length)) {
      return this.getDayDataForHourFromDataList(hourDayItem, propertyName, option, colorSettingsHour);
    }

    const value = this.getItemData(hourDayItem, propertyName);

    return {
      dayName: hourDayItem.dow_name,
      summedData: value,
      frequency: 1,
      total: value,
      colorClass: this.getColorClassFromDayItem(colorSettingsHour, hourDayItem)
    };
  }

  getColorClassFromDayItem(colorSettingsHour, hourDayItem) {
    if (this.ObjectUtils.isNullOrUndefined(colorSettingsHour) ||
      this.ObjectUtils.isNullOrUndefined(hourDayItem)) return '';
    const colorItem = _.findWhere(colorSettingsHour.dayValues, { dayName: hourDayItem.dow_name });
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(colorItem) ||
      this.ObjectUtils.isNullOrUndefined(colorItem.colorClass)) return '';

    return colorItem.colorClass;
  }

  isPeriodHasData(items) {
    return (!this.ObjectUtils.isNullOrUndefined(items) && items.length > 0) ||
      (!this.ObjectUtils.isNullOrUndefinedOrEmptyObject(items) && !_.isUndefined(items.salesPowerHours) &&
        !this.ObjectUtils.isNullOrUndefinedOrEmpty(items.salesPowerHours));
  }

  getTotalAveragePerSite(response, option) {
    let hourData = this.getHourDataForMetricFromResponse(response, option);
    return this.ObjectUtils.isNullOrUndefined(hourData) ||
      this.ObjectUtils.isNullOrUndefinedOrEmpty(hourData.salesTotalAveragePerSite) ? 0 :
      this.getHourDataForMetricFromResponse(response, option).salesTotalAveragePerSite[0].total_average_per_site;
  }

  /**
  * Calculate daily averages and totals for each hour
  * for display in the Total and Daily Average
  *
  */
  calculateDailyAveragesAndTotals(hours, response, option) {
    if (this.ObjectUtils.isNullOrUndefined(hours)) {
      return;
    }

    if (this.isSalesPerSiteSelected(response, option)) {
      option.data.summedAverage = this.getTotalAveragePerSite(response, option);
      return;
    }

    option.data.summedAverage = _.chain(hours).pluck('total').reduce((mem, val) => mem + val, 0).value();

    if (this.isTrafficPctSelected(option)) {
      if (option.data.summedAverage < 100) {
        option.data.summedAverage = this.NumberUtils.roundUp(option.data.summedAverage, 1);
      } else if (option.data.summedAverage > 100) {
        option.data.summedAverage = this.NumberUtils.roundDown(option.data.summedAverage, 1);
      }
    }

    if (!option.calculateAverage) {
      return;
    }

    //which metrics to calculate the average of for Daily Average row
    if (this.selectedMetricIsCalculated(option) ||
      option.propertyName === 'period_traffic_percent') {
      _.each(option.data.days, daysItem => {
        let dayMetricData = _.findWhere(daysItem.metricData, { metric: option.displayType });

        if (!this.ObjectUtils.isNullOrUndefined(dayMetricData)) dayMetricData.dailyTotal = dayMetricData.dailyTotal / hours.length;
      });
    }
  }

  initValues() {
    _.each(this.days, daysItem => {
      daysItem.metricData = [];
      _.each(this.selectedMetrics, option => {
        daysItem.metricData.push({
          metric: option.displayType,
          dailyTotal: 0,
          hasData: false
        })
      });
    })
  }

  getHourItem(groupedHourItems, hourItem) {
    let data = _.find(groupedHourItems, item => {
      return item[0].hour_of_day === hourItem.hour
    });
    return data;
  }

  getHourFromHourData(hourData, hourItem, option) {
    if(!this.ObjectUtils.isNullOrUndefined(hourData)) {
      return this.getHourData(hourData, option.propertyName, option);
    }

    let hour = angular.copy(hourItem);
    _.map(hour.dayValues , day => {
      day.colorClass = "has-low-traffic";
      day.summedData = 0;
      day.total = 0;
    });

    hour.total = 0;

    return hour;
  }

  updateDataModel(response, option) {
    const items = this.getHourDataForMetricFromResponse(response, option);

    const hours = [];

    if (this.isPeriodHasData(items)) {
      const groupedHourItems = this.getGroupedHourItems(items);

      _.each(this.options[0].data.hours, hourItem => {
        let hourData = this.getHourItem(groupedHourItems, hourItem);

        hours.push(this.getHourFromHourData(hourData, hourItem, option));
      });
    }

    this.setTotals(hours, response, option);
    this.calculateDailyAveragesAndTotals(hours, response, option);
    option.data.hours = hours;
    this.setNumberOfDaysHasData();
  }

  getMetricTitle(option) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(option.metric)) {
      if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(option.customMetricKey)) return option.customMetricKey;
      return option.name;
    }
    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(option.metric.displayName)) return option.metric.displayName;

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(option.metric.translatedShortLabel)) return option.metric.translatedShortLabel;

    return this.$filter('translate')(option.metric.shortTranslationLabel);

    return option.metric.label;
  }

  getMetricColumns(key) {
    const metricColumns = [];
    _.each(this.selectedMetrics, (option, index) => {
      metricColumns.push({
        headerName: this.getMetricTitle(option),
        suppressSizeToFit: false,
        suppressMovable: true,
        suppressMenu: true,
        suppressFilter: true,
        noBorderClass: this.getNoBorderClass(index),
        kpi: option.metric.kpi,
        field: key.replace(this.weekDayTransKey, '') + option.metric.kpi,
        cellRenderer: 'cellRenderer',
        cellClass: this.getCellColorClass
      });
    });

    return metricColumns;
  }

  getNoBorderClass(index) {
    if (this.selectedMetrics.length > 1 &&
      index !== this.selectedMetrics.length - 1) {
      return ' no-border';
    };
    return '';

  }

  getCellColorClass(params) {
    // Traffic class is based on value down to 1/10th of a percent
    const key = `${params.colDef.field}colorClass`;

    return params.data[key] + params.colDef.noBorderClass;
  };

  setColumnDef() {
    this.gridOptions.columnDefs = [];
    this.gridOptions.components = {
      'cellRenderer': cellRenderer
    }
    const columnDefs = [];

    const hourColDef = {
      headerName: '',
      suppressMovable: true,
      suppressMenu: true,
      suppressFilter: true,
      suppressSizeToFit: false,
      pinned: 'left',
      children: [{
        suppressMovable: true,
        suppressSizeToFit: false,
        headerName: '',
        kpi: 'hour',
        field: 'hour',
        cellRenderer: 'cellRenderer',
        cellClass: 'ag-hour-column'
      }]
    };

    if (this.$rootScope.pdf) {
      hourColDef.cellStyle = {
        'height': 'auto!important',
        'white-space': 'normal',
        'text-overflow': 'clip !important',
        'word-wrap': 'break-word !important'
      };
      hourColDef.width = 180;
      hourColDef.children[0].cellStyle = {
        'height': 'auto!important',
        'white-space': 'normal',
        'text-overflow': 'clip !important',
        'word-wrap': 'break-word !important'
      };
      hourColDef.children[0].width = 180;
    }

    columnDefs.push(hourColDef);

    _.each(this.days, day => {
      const colDef = {
        suppressMovable: true,
        suppressMenu: true,
        suppressFilter: true,
        headerName: this.$filter('translate')(day.key),
        children: this.getMetricColumns(day.key)
      };
      columnDefs.push(colDef);
    });

    const TotalColDef = {
      headerName: this.getTotatHederName(),
      suppressMovable: true,
      suppressMenu: true,
      suppressFilter: true,
      suppressSizeToFit: false,
      pinned: 'right',
      children: this.getTotalMetricColumns()
    };
    columnDefs.push(TotalColDef);

    if (!this.ObjectUtils.isNullOrUndefined(this.gridOptions) &&
      this.gridOptions.api) {
      this.gridOptions.api.setColumnDefs(columnDefs);
      this.gridOptions.api.sizeColumnsToFit();
    }
    else {
      this.gridOptions.columnDefs = columnDefs;
    }
  }

  getTotatHederName() {
    let calcMetric = _.find(this.selectedMetrics, metricItem => {
      return !this.ObjectUtils.isNullOrUndefined(metricItem.metric) &&
        metricItem.metric.calculated;
    })

    let isAwerage = !this.ObjectUtils.isNullOrUndefined(calcMetric);

    let noCalcMetric = _.find(this.selectedMetrics, metricItem => {
      return !this.ObjectUtils.isNullOrUndefined(metricItem.metric) &&
        !metricItem.metric.calculated;
    })
    let isTotal = !this.ObjectUtils.isNullOrUndefined(noCalcMetric);
    if(isTotal && isAwerage) return this.$filter('translate')(this.totalTitleKey) + '/' + this.$filter('translate')(this.averageTitleKey);
    if(isAwerage)return this.$filter('translate')(this.averageTitleKey);
    return this.$filter('translate')(this.totalTitleKey)
  }

  getTotalMetricColumns() {
    const metricColumns = [];
    _.each(this.selectedMetrics, option => {
      let totalCellKey = this.getTotalCellKey(option);
      metricColumns.push({
        suppressMovable: true,
        suppressSizeToFit: false,
        pinned: 'right',
        cellRenderer: 'cellRenderer',
        headerName: this.getMetricTitle(option),
        kpi: totalCellKey,
        field: totalCellKey
      });
    });

    return metricColumns;
  }


  renderGrid() {
    if (this.ObjectUtils.isNullOrUndefined(this.gridOptions)) {
      this.gridOptions = {};
      this.gridOptions.rowData = [];
    }

    this.setColumnDef();

    this.assembleRow();

    this.gridOptions.showFooter = true;
    this.gridOptions.footerRowHeight = 30;
    this.gridOptions.showFooter = true;

    this.gridOptions.suppressMenu = true;
    this.gridOptions.enableColResize = false;
    this.gridOptions.suppressFilter = true;
    this.gridOptions.suppressSizeToFit = false,
      this.gridOptions.suppressResize = false;
    this.gridOptions.enableSorting = false;
    this.gridOptions.rowHeight = 24;
    /* Group columns */
    this.gridOptions.groupHeaderHeight = 35;

    /* Label columns */
    this.gridOptions.headerHeight = this.$rootScope.pdf && this.selectedMetrics.length > 1 ? 50 : 26;
    this.gridOptions.enableFilter = false;
    this.gridOptions.suppressDragLeaveHidesColumns = false;
    this.gridOptions.angularCompileHeaders = !this.$rootScope.pdf;

    this.gridOptions.domLayout = 'autoHeight';
    this.isLoading = false;
    this.requestFailed = false;

    if (this.$rootScope.pdf) {
      this.gridOptions.domLayout = 'forPrint';
      this.suppressColumnMoveAnimation = true;
      this.animateRows = true;
    }

    this.gridOptions.onGridReady = (params) => {
      this.gridOptions.api = params.api;
      params.api.sizeColumnsToFit();

      this.$timeout(() => {

        this.setRowHeightForPdf(params);
        this.setHeaderHeight();
        this.setExportLoaded();
      }, 10);
    }

    //this is destroyed with watches in configureWatches() but needs to be set here
    this.resizeColumnsDebounced = _.debounce(() => {
      this.resizeColumns();
    }, 200);

    //this is destroyed with watches in configureWatches() but needs to be set here
    angular.element(this.$window).on('resize', this.resizeColumnsDebounced);
  }

  setExportLoaded() {
    if (this.$rootScope.pdf) this.$rootScope.pdfExportsLoaded += 1;
  }

  setRowHeightForPdf(params) {
    this.rowHeightChanged = false;
    let selector = this.$element[0].querySelectorAll('.ag-row-level-0');

    params.api.forEachNode((rowNode) => {
      this.setRowHeight(selector, rowNode);
    });

    if (this.rowHeightChanged) {
      params.api.onRowHeightChanged();
    }
  }

  setHeaderHeight() {
    let selector = this.$element[0].querySelectorAll('.ag-header-cell-text');
    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(selector)) {
      let height = 0;
      _.each(selector, (item) => {
        if (height < item.clientHeight && item.id === '') height = item.clientHeight;
      });
      if (height > 0 && height > this.gridOptions.headerHeight) this.gridOptions.api.setHeaderHeight(height);
    }
  }

  getRowClientHeight(selector, rowNode) {
    let clientHeight;
    _.each(selector, (item) => {
      _.each(item.childNodes, node => {
        if (!this.ObjectUtils.isNullOrUndefined(node.firstChild) &&
        node.firstChild.innerText.trim().toLowerCase() === rowNode.data.hour.trim().toLowerCase()) {
            clientHeight = angular.copy(node.firstChild.clientHeight);
        }
      });
    });
    return clientHeight;
  }

  /**
  * private function to reset ag-grid row height when we have long site names in pdf.
  * this function returns nothing but sets the row height.
  */
  setRowHeight(selector, rowNode) {
    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(selector)) {
      let rowheight = angular.copy(rowNode.rowHeight);
      let clientHeight = this.getRowClientHeight(selector, rowNode)

      if (clientHeight > (rowheight - 2)) {
        rowNode.setRowHeight(clientHeight);
        this.rowHeightChanged = true;
        return;
      }

      let lineCount = this.getLineNumber(rowNode.data.rowName);

      if (lineCount < 1) {
        lineCount = 1;
      }

      rowNode.setRowHeight(rowheight * lineCount);
      this.rowHeightChanged = true;
    }
  }

  getLineNumber(value) {
    let lineCount = 1;
    if (this.ObjectUtils.isNullOrUndefinedOrBlank(value) || typeof value.split !== 'function') {
      return lineCount;
    }
    let parts = value.split(' ');

    let maxLengthForLine = 30;
    let partLength = 0;
    _.each(parts, (part) => {
      partLength += part.length + 1;
      if (partLength > maxLengthForLine) {
        lineCount += 1;
        partLength = part.length;
      }
    });

    return lineCount;
  }

  getCellKey(day, option) {
    return day.key.replace(this.weekDayTransKey, '') + option.metric.kpi;
  }

  /**
  * set hour data values for rows in the ag-grid
  *
  */
  assembleHour(hourData, rowData, option) {
    if (this.ObjectUtils.isNullOrUndefined(hourData)) return;
    _.each(hourData, hour => {
      let rowExist = false;
      let row = _.find(rowData, rowItem => {
        return rowItem['hour'] === hour.yAxisLabel;
      });

      if (!_.isUndefined(row)) {
        rowExist = true;
      } else {
        row = {
          hour: hour.yAxisLabel,
          hourValue: hour.hour
        };
      }

      _.each(this.days, day => {
        let dayData = _.find(hour.dayValues, dayItem => {
          return (this.weekDayTransKey + dayItem.dayName).toLowerCase() === day.key.toLowerCase();
        });
        let val = this.ObjectUtils.isNullOrUndefined(dayData) ? 0 : dayData.total;

        let key = this.getCellKey(day, option);
        row[key] = this.$filter('formatNumber')(val, option.metric.precision, this.numberFormatName);
        row[key + 'colorClass'] = !this.ObjectUtils.isNullOrUndefined(dayData) ? dayData.colorClass : '';
      });
      row[option.name + 'totalValue'] = hour.total;
      row[option.name + 'total'] = option.metric.prefixSymbol +
        this.$filter('formatNumber')(hour.total, option.metric.precision, this.numberFormatName) +
        option.metric.suffixSymbol;
      if (!rowExist) rowData.push(row);
    });
  }

  /**
  * set rows for the ag-grid
  *
  */
  assembleRow() {
    let rowData = [];
    _.each(this.selectedMetrics, option => {
      let hourData = this.getHourDataForMetric(option);
      this.assembleHour(hourData, rowData, option);
    });

    rowData = this.orderHours(rowData);

    this.periodHasData = !this.ObjectUtils.isNullOrUndefinedOrEmpty(rowData);

    if(!this.periodHasData)return;

    this.setDailyTotalFooter(rowData);
    this.setMissingValuesInRows(rowData);
    if (!this.ObjectUtils.isNullOrUndefined(this.gridOptions) &&
      this.gridOptions.api) {
      this.gridOptions.api.setRowData(rowData);
    }
    else {
      this.gridOptions.rowData = rowData;
    }
  }

  getTotalCellKey(option) {
    return option.name + 'total';
  }

  setMissingValuesInRows(rowData) {
    _.each(this.selectedMetrics, option => {
      _.each(this.days, day => {
        _.each(rowData, row => {
          let key = this.getCellKey(day, option);
          if (this.ObjectUtils.isNullOrUndefined(row[key])) {
            row[key] = this.$filter('formatNumber')(0, option.metric.precision, this.numberFormatName);
            row[key + 'colorClass'] = '';
          }
          let totalKey = this.getTotalCellKey(option);
          if (this.ObjectUtils.isNullOrUndefined(row[totalKey])) {
            row[totalKey] = this.$filter('formatNumber')(0, option.metric.precision, this.numberFormatName);
            row[totalKey + 'colorClass'] = '';
          }
        });
      });
    });
  }

  /**
  * set footer row for the ag-grid
  *
  */
  setDailyTotalFooter(rowData) {
    let row = {};
    row['hour'] = this.getDailyTotalLabel();
    row['isTotalFooter'] = true;
    _.each(this.selectedMetrics, option => {
      _.each(option.data.days, day => {
        let key = this.getCellKey(day, option);
        let dayMetricData = _.findWhere(day.metricData, { metric: option.displayType });
        if (!this.ObjectUtils.isNullOrUndefined(dayMetricData)) {
          row[key + 'colorClass'] = '';
          row[key] = option.metric.prefixSymbol +
            this.$filter('formatNumber')(dayMetricData.dailyTotal, option.metric.precision, this.numberFormatName) +
            option.metric.suffixSymbol;
        }
      });
    });

    _.each(this.selectedMetrics, option => { //Add total value
      row[option.name + 'totalValue'] = option.data.summedAverage;
      row[this.getTotalCellKey(option)] = option.metric.prefixSymbol +
        this.$filter('formatNumber')(option.data.summedAverage, option.metric.precision, this.numberFormatName) +
        option.metric.suffixSymbol;
    });

    rowData.push(row);
  }

  getDailyTotalLabel() {
    return !this.averageMetricSelected ?
      this.$filter('translate')('powerHoursWidget.DAILYTOTAL') :
      this.$filter('translate')('powerHoursWidget.DAILYAVERAGE')
  }

  resizeColumns() {
    if (!this.ObjectUtils.isNullOrUndefined(this.gridOptions) &&
      !this.ObjectUtils.isNullOrUndefinedOrEmptyObject(this.gridOptions.api)) {
      this.gridOptions.api.sizeColumnsToFit()
    }
  }

  updateDataModelWithTrafficColour(response, option) {
    let totalTraffic = 0;

    const items = _.findWhere(response.result, { metric: option.displayType }).hourData;

    const hours = [];

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(items)) {
      // No matter if a sales metric is selected or not, we always colour based on traffic, and using the traffic data
      // Hence the hardcoded "false" value here
      const groupedHourItems = this.getGroupedHourItems(items, false);
      _.each(groupedHourItems, hourItem => {
        hours.push(this.getHourData(hourItem, option.propertyName, option));
      });
      _.each(hours, hourItem => {
        _.each(hourItem.dayValues, hourDayItem => {
          totalTraffic += hourDayItem.summedData;
        });
      });

      this.setTotals(hours, response, option);

      this.calculateDailyAveragesAndTotals(hours, response, option);
      option.data.hours = hours;
    }

    this.setVmHoursTrafficClass(hours, totalTraffic, option);

    if (this.cachedTrafficClassHours) {
      this.setVmHoursTrafficClass(this.cachedTrafficClassHours, this.cachedTotalTraffic, option);
      this.cachedTrafficClassHours = null;
      this.cachedTotalTraffic = null;
    }
  }

  clearLoadingFlagsAndSetNoData() {
    this.isLoading = false;
    this.requestFailed = false;
    this.setNodata();

    // The purpose of this block is to background load sales data
    // It will prime the request manager cache, meaning the user wont have to wait for a load
    // After selecting a sales metric
    if (this.SubscriptionsService.siteHasSales(this.currentOrganization, this.currentSite) && this.salesDataLoaded === false) {
      this.loadSalesData()
        .then(() => {
          this.salesDataLoaded = true
        });
    }
  }

  loadSalesData() {
    const requestParams = { params: this.getRequestParams() };

    requestParams.params.kpi = 'sales'

    const url = this.getApiEndpoint();

    return this.requestManager.get(url, requestParams);
  }

  getHourDataForMetric(option) {
    let hourItem = option.data.hours;
    if (!this.ObjectUtils.isNullOrUndefined(hourItem)) return hourItem;
    return [];
  }

  getTrafficClass(dayData, totalTraffic) {
    // Traffic class is based on value down to 1/10th of a percent
    const precision = 3;
    let value = dayData.summedData / totalTraffic;
    value = value.toFixed(precision);

    const low = this.lowThreshold;
    const high = this.highThreshold;

    if (value < low) {
      return 'has-low-traffic';
    }

    if (value <= high && value >= low) {
      return 'has-medium-traffic';
    }
    return 'has-high-traffic';
  }

  getDailyTotalsForSalesPerSite(response, option) {
    let hourData = this.getHourDataForMetricFromResponse(response, option);
    if (this.ObjectUtils.isNullOrUndefined(hourData)) return hourData;
    return this.getHourDataForMetricFromResponse(response, option).salesDailyAveragePerSite;
  }

  setTotals(hours, response, option) {
    if (this.isSalesPerSiteSelected(response, option)) {
      const dailyTotals = this.getDailyTotalsForSalesPerSite(response, option);
      _.each(dailyTotals, dailyTotal => {
        this.setDayTotalValue(dailyTotal.dow_name, dailyTotal.daily_average_per_site, option);
      });

      return;
    }

    if (this.selectedMetricIsCalculated(option)) return;

    let dayGroupValues = _.groupBy(this.getHourDataForMetricFromResponse(response, option), item => item.dow_name);
    _.each(dayGroupValues, dayGroupValue => {
      let totalValue = _.reduce(dayGroupValue, (total, item) => {
        return total + this.getPropertyValue(item, option);
      }, 0);
      this.setDayTotalValue(dayGroupValue[0].dow_name, totalValue, option);
    });
  }

  getPropertyValue(item, option) {
    let value = item[option.propertyName];
    return parseFloat(this.isValid(value) ? value : 0);
  }

  isSalesPerSiteSelected(response, option) {
    if (option.name !== 'sales_per_site') {
      return false;
    }

    return !this.ObjectUtils.isNullOrUndefined(response)
      && !this.ObjectUtils.isNullOrUndefinedOrEmpty(response.result)
      && !this.ObjectUtils.isNullOrUndefined(response.result[0])
      && !this.getHourDataForMetricFromResponse(response, option);
  }

  isTrafficPctSelected(option) {
    return option.name === 'traffic (pct)';
  }

  getHour(hourItem) {
    if (!this.ObjectUtils.isNullOrUndefinedOrBlank(hourItem[0].period_start_date)) {
      return this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(hourItem[0].period_start_date).hour();
    }
    return hourItem[0].hour_of_day;
  }

  getHourYAxisLabel(hourItem) {
    const utc_hour = this.getHour(hourItem);
    if (!this.ObjectUtils.isNullOrUndefinedOrBlank(hourItem[0].period_start_date)) {
      const hour_offset = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(hourItem[0].period_start_date).add(1, 'hours');
      const utc_hour_offset = hour_offset.hour();

      const hour_12 = this.LocalizationService.getLocalDateTimeFormatIgnoringUTC(hourItem[0].period_start_date).format('ha');
      const hour_offset_12 = hour_offset.format('ha');
      return Number(this.timeFormat) === 24 ? `${utc_hour} - ${utc_hour_offset}` : `${hour_12} - ${hour_offset_12}`;
    }

    return this.getFormattedHourLabel(Number(utc_hour));
  }

  getAMPMFormattedHourLabel(utc_hour) {
    if (utc_hour === 0 || utc_hour === 24) {
      return '12am';
    }
    if (utc_hour === 12) {
      return '12pm';
    }
    if (utc_hour > 0 && utc_hour < 12) {
      return `${angular.copy(utc_hour)}am`;
    }
    const h = angular.copy(utc_hour) - 12;
    return `${h}pm`;
  }

  getFormattedHourLabel(utc_hour) {
    if (Number(this.timeFormat) === 24) {
      let nextHour = utc_hour + 1;

      if (nextHour === 24) nextHour = 0;

      return `${utc_hour} - ${nextHour}`;
    }

    return `${this.getAMPMFormattedHourLabel(utc_hour)} - ${this.getAMPMFormattedHourLabel(utc_hour + 1)}`;
  }

  getHourData(hourItem, propertyName, option) {
    const groupedHourDayItems = this.getGroupedHourDayItems(hourItem);

    const hour = {
      yAxisLabel: this.getHourYAxisLabel(hourItem),
      dayValues: [],
      hour: this.getHour(hourItem),
      total: 0
    };

    const colorSettingsHour = _.findWhere(this.getHourDataForMetric(this.options[0]), { hour: hour.hour });

    hour.dayValues = this.getHourDayValues(groupedHourDayItems, propertyName, option, colorSettingsHour);
    hour.total = _.reduce(hour.dayValues, (total, item) => {
      return total + parseFloat(this.isValid(item.total) ? item.total : 0);
    }, 0);

    return hour;
  }

  getHourDayValues(groupedHourDayItems, propertyName, option, colorSettingsHour) {
    const dayValues = [];
    _.each(groupedHourDayItems, hourDayItems => {
      dayValues.push(this.getDayDataForHour(hourDayItems, propertyName, option, colorSettingsHour));
    });

    return dayValues;
  }

  getHourDataForMetricFromResponse(response, option) {
    let data = _.findWhere(response.result, { metric: option.displayType });
    if (!_.isUndefined(data) && !_.isUndefined(data.hourData)) {
      if (!_.isUndefined(data.hourData.salesPowerHours)) return data.hourData.salesPowerHours;
      return data.hourData;
    }

    return data;
  }

  getHourTotal(hour, response, option) {
    let hourData = this.getHourDataForMetricFromResponse(response, option);
    if (this.isSalesPerSiteSelected(response, option) ||
      !_.isUndefined(hourData.salesHourlyAveragePerSite)) {
      const hourTotal = _.findWhere(hourData.salesHourlyAveragePerSite, { hour_of_day: hour.hour });

      if (!_.isUndefined(hourTotal)) {
        return hourTotal.hourly_average_per_site;
      }
    }

    let total = 0;

    _.each(hour.dayValues, value => {
      total += value.total;
    });

    return total;
  }

  getStartTime() {
    if (!this.isSiteLevel() ||
      this.ObjectUtils.isNullOrUndefined(this.currentSite.business_day_start_hour)) {
      return 0;
    }
    return this.currentSite.business_day_start_hour;
  }

  orderHours(hours) {
    let startHour = this.getStartTime();

    const orderedHours = [];
    let index = 0;
    let hoursChecked = 0;

    // The ordered hours may not always have 24 hours in it - see the break condition below
    while (hoursChecked <= 23) {
      const hour = _.findWhere(hours, { hourValue: startHour });

      if (startHour === 23) {
        startHour = 0;
      } else {
        startHour = startHour + 1;
      }

      if (_.isUndefined(hour)) {
        // This hour was not returned from the API, so move onto the next hour
        hoursChecked++;
        continue;
      }

      const currentHourInOrderedCollection = _.findWhere(orderedHours, { hour: hour.hour });

      if (!_.isUndefined(currentHourInOrderedCollection)) {
        // We've already been through everything that the API has given us, so finish
        break;
      }

      hour.index = index;
      orderedHours.push(hour);

      index = index + 1;
      hoursChecked++;
    }

    return orderedHours;
  }

  getDayKey(weekDay) {
    const weekday = moment().day(weekDay).format('ddd').toLowerCase();

    return this.weekDayTransKey + weekday;
  }

  loadTranslations() {
    this.kpiTitle = 'kpis.totalLabel.power_hours';
    this.widgetTitle = 'kpis.kpiTitle.power_hours';
  }

  setCurrencySymbol() {
    if (!this.ObjectUtils.isNullOrUndefinedOrBlank(this.orgId) &&
      !this.ObjectUtils.isNullOrUndefined(this.siteId) &&
      this.ObjectUtils.isNullOrUndefinedOrBlank(this.currencySymbol)) {
      this.currencyService.getCurrencySymbol(this.orgId, this.siteId).then(data => {
        this.currencySymbol = data.currencySymbol;
      });
    }
  }

  getThresholds(organization) {
    if (typeof this.ObjectUtils.getNestedProperty(organization, 'power_hours_thresholds') === 'undefined') {
      return { lower: 0.005, upper: 0.015 };
    }

    const lower = organization.power_hours_thresholds.lower;
    const upper = organization.power_hours_thresholds.upper;

    return { lower, upper };
  }
}

angular
  .module('shopperTrak.widgets')
  .controller('powerHoursWidgetController', powerHoursWidgetController);

powerHoursWidgetController.$inject = [
  '$scope',
  '$rootScope',
  '$q',
  '$timeout',
  '$translate',
  '$filter',
  '$window',
  '$element',
  'requestManager',
  'apiUrl',
  'LocalizationService',
  'SubscriptionsService',
  'metricConstants',
  'ObjectUtils',
  'currencyService',
  'SiteResource',
  'OrganizationResource',
  'utils',
  'NumberUtils',
  'currentSalesCategoryService',
  'CompParams'
];
