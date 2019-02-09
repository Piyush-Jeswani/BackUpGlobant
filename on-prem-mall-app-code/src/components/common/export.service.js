
class ExportService {
  constructor ($rootScope,
    localStorageService,
    $q,
    apiUrl,
    $http,
    $window,
    $location,
    $filter,
    $translate,
    session,
    ObjectUtils,
    authService,
    generatePdf,
    googleAnalytics,
    widgetConstants,
    utils,
    metricConstants,
    metricNameService) {
    this.$rootScope = $rootScope;
    this.localStorageService = localStorageService;
    this.$q = $q;
    this.apiUrl = apiUrl;
    this.$http = $http;
    this.$window = $window;
    this.$location = $location;
    this.$filter = $filter;
    this.$translate = $translate;
    this.session = session;
    this.ObjectUtils = ObjectUtils;
    this.authService = authService;
    this.generatePdf = generatePdf;
    this.googleAnalytics = googleAnalytics;
    this.widgetConstants = widgetConstants;
    this.utils = utils;
    this.metricConstants = metricConstants;
    this.metricNameService = metricNameService;
    this.numExportsInProgress = 0;

    this.exportedCarts = this.localStorageService.get('exportedCarts');
    this.exportCart = this.localStorageService.get('exportCart');
    this.visitorBehaviorName = '';

    this.setTranslations();

    this.widgetProperties = this.widgetConstants.exportProperties;

    if (!this.exportCart) {
      this.clearExportCart();
    }

    if (!this.exportedCarts) {
      this.deletePreviousExports();
    }
  } // End Of Construction


  /**
  * Clears the current export cart
  * stored in the local storage.
  */
  clearExportCart () {
    this.exportCart = {};
    this.localStorageService.set('exportCart', this.exportCart);
  }

  /**
  * Clears the previous export carts
  * stored in the local storage.
  */
  deletePreviousExports () {
    this.exportedCarts = [];
    this.localStorageService.set('exportedCarts', this.exportedCarts);
  }

  /**
  * Creates an export and adds it to the current export cart
  * and then commits this cart to local storage.
  * @param {Object} Parameter object has current user id.
  */
  createExportAndStore (parameter) {
    let userId;
    // !!! IMPORTANT !!!
    // this check removes the current user object from the export cart
    // without this the size of the cart may cause the app to lock up
    if (typeof parameter.currentUser === 'object') {
      userId = parameter.currentUser._id;
    } else {
      userId = parameter.currentUser;
    }

    const reducedParameter = {};
    const dateRange = parameter.dateRange;
    const compare1Range = parameter.compare1Range;
    const compare2Range = parameter.compare2Range;
    const locationIds = parameter.locationIds;
    const locationId = parameter.locationId;
    let areaKey;

    this.addCustomMetricName(parameter);

    Object.keys(parameter).filter(key => key !== 'orgId' &&
      key !== 'siteId' &&
      key !== 'locationId' &&
      key !== 'zoneId' &&
      key !== 'dateRange' &&
      key !== 'locationIds' &&
      key !== 'compare1Range' &&
      key !== 'compare2Range' &&
      key !== 'currentUser').map(key => {
        reducedParameter[key] = parameter[key];
      });

    reducedParameter.currentUser = userId;

    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(locationIds)) {

      const joinedLocationIds = this.joinLocationIds(locationIds);
      areaKey = this.buildAreaKey(parameter.orgId,
        parameter.siteId,
        joinedLocationIds,
        parameter.zoneId,
        parameter.selectedTags,
        parameter.areaKey);
      this.addToExportCart(this.exportCart, areaKey, dateRange, compare1Range, compare2Range, reducedParameter, parameter.dateRangeKey);
      this.storeExportCart(this.exportCart);
    } else {
      areaKey = this.buildAreaKey(parameter.orgId,
        parameter.siteId,
        locationId,
        parameter.zoneId,
        parameter.selectedTags,
        parameter.areaKey);
      this.addToExportCart(this.exportCart, areaKey, dateRange, compare1Range, compare2Range, reducedParameter, parameter.dateRangeKey);
      this.storeExportCart(this.exportCart);
    }
  }

  /**
  * set display name for widgets which could have multiple metric selections.
  * @param {Object} params to be used for display name
  */
  setDisplayNameForMultiMetric (params) {
    const displayTypes = params.displayType.split(',');
    let displayName = '';

    _.each(displayTypes, displayType => {
      let metric = _.findWhere(this.metricConstants.metrics, { shortTranslationLabel: displayType });

      if (_.isUndefined(metric)) {
        // Attempt to load metric info using the KPI name
        metric = _.findWhere(this.metricConstants.metrics, { kpi: displayType });
      }

      if (!_.isUndefined(metric)) {
        displayName += this.getSplitter(displayName) + metric.displayName;
      }
    });

    params.displayName = displayName;
  }

  /**
   * get splitter for display name for widgets which could have multiple metric selections.
   * @param {Object} displayName to be used for display name
  */
  getSplitter (displayName) {
    return `${!this.ObjectUtils.isNullOrUndefinedOrBlank(displayName) ? ' - ' : ''}`;
  }

  /**
   * Add custom metric name for widgets.
   * @param {Object} displayName to be used for display name
  */
  addCustomMetricName (parameter) {
    if (this.widgetIsRenameable(parameter.name)) {
      const kpiName = this.getKpiName(parameter);
      if (_.includes(kpiName, ',')) return this.setDisplayNameForMultiMetric(parameter);

      if (!this.ObjectUtils.isNullOrUndefined(kpiName)) {
        let metric = _.findWhere(this.metricConstants.metrics, { value: kpiName });

        if (_.isUndefined(metric)) {
          // Attempt to load metric info using the KPI name
          metric = _.findWhere(this.metricConstants.metrics, { kpi: kpiName });
        }

        if (!_.isUndefined(metric)) {
          parameter.displayName = metric.displayName;

          if (parameter.name === 'visitor_behaviour_traffic') {
            parameter.displayName = `${this.visitorBehaviorName} ${parameter.displayName.toLowerCase()}`;
          }
        }
      }
    }
  }

  /**
   * Returns true if there is renameable widget name otherwise false.
   * @param {String} widgetName to be used for widget name.
   * @returns {bool} Return true if contains widget name otherwise false.
  */  
  widgetIsRenameable (widgetName) {
    const renameableWidgets = this.metricNameService.getRenameableWidgets();

    return _.contains(renameableWidgets, widgetName);
  }

  /**
   * Returns kpi name for kpi.
   * @param {Object} params containing kpi.
   * @returns {String} returns kpi name.
  */  
  getKpiName (params) {
    if (params.kpi === 'visitor_behaviour_traffic') {
      return 'traffic';
    }

    if (params.kpi === 'dwell_time') {
      return 'dwelltime';
    }

    if (!this.ObjectUtils.isNullOrUndefined(params.selectedMetric)) {
      return params.selectedMetric;
    }

    if (!this.ObjectUtils.isNullOrUndefined(params.displayType)) {
      if (_.includes(params.displayType, ',')) return params.displayType;
      const metric = _.findWhere(this.metricConstants.metrics, { shortTranslationLabel: params.displayType });

      if (!_.isUndefined(metric)) {
        return metric.value;
      }
    }

    if (this.ObjectUtils.isNullOrUndefined(params.kpi)) {
      const widgetNameToKpiMap = {
        sales_widget: 'sales',
        conversion_widget: 'conversion',
        ats_sales_widget: 'ats',
        upt_sales_widget: 'upt',
        labor_hours_widget: 'labor',
        star_labor_widget: 'star'
      };

      return widgetNameToKpiMap[params.name];
    }

    return params.kpi;
  }

  /**
   * Returns joined Locations.
   * @param {Object} locationIds to join.
   * @returns {String} returns the joined location ids separated by commas.
  */    
  joinLocationIds (locationIds) {
    let joinedLocations;

    if (locationIds !== undefined) {
      joinedLocations = locationIds.join(',');
    }
    return joinedLocations;
  }


  /**
   * Adds the export to the export cart and stores the cart.
   * @param {String} areaKey the area key e.g. 2000_1000.
   * @param {moment} selected date range.
   * @param {moment} compare1Range date range.
   * @param {moment} compare2Range date range.
   * @param {String} metric key. 
   * 
  */ 
  addToExportCartAndStore (areaKey, dateRange, compare1Range, compare2Range, metricKey) {
    let parameter;

    if (_.isString(metricKey)) {
      parameter = {
        name: metricKey
      };
    } else {
      parameter = metricKey;
    }

    this.addCustomMetricName(parameter);

    this.addToExportCart(this.exportCart, areaKey, dateRange, compare1Range, compare2Range, parameter);

    this.storeExportCart(this.exportCart);
  }

  /**
   * Adds the export to the specified export cart.
   * @param {String} cart Specified cart to add export to.
   * @param {String} areaKey the area key e.g. 2000_1000.
   * @param {moment} dateRange selected date range.
   * @param {moment} compare1Range date range.
   * @param {moment} compare2Range date range.
   * @param {moment} parameter input parameter.
   * @param {moment} dateRangeKey composed from the dates.
   * 
  */ 
  addToExportCart (cart, areaKey, dateRange, compare1Range, compare2Range, parameter, dateRangeKey) {   
    const name = parameter;
    if (!parameter.name) {
      parameter = {
        name
      };
    }
    if (!cart[areaKey]) {
      cart[areaKey] = {};
    }
    if (this.ObjectUtils.isNullOrUndefined(dateRangeKey)) {
      dateRangeKey = this.buildDateRangeKey(dateRange, compare1Range, compare2Range);
    }

    // We need to stringify the dates here as they will be automatically converted to
    // iso strings when the export cart is stored in local storage
    // If we let that happen we will get timezone shifts in the date range

    const dateRangeString = this.stringifyDateRange(dateRange);
    const compare1RangeString = this.stringifyDateRange(compare1Range);
    const compare2StartString = this.stringifyDateRange(compare2Range);

    if (!cart[areaKey][dateRangeKey]) {
      cart[areaKey][dateRangeKey] = {
        start: dateRangeString.start,
        end: dateRangeString.end,
        compare1Start: compare1RangeString.start,
        compare1End: compare1RangeString.end,
        compare2Start: compare2StartString.start,
        compare2End: compare2StartString.end,
        metrics: [],
        groupBy: null
      };
    }

    const metricKey = parameter.name;
    let changingWidgetSettings;
    if (!this.ObjectUtils.isNullOrUndefined(parameter.partialPageName)) {
      changingWidgetSettings = this.widgetProperties[parameter.partialPageName];
    } else {
      changingWidgetSettings = this.widgetProperties[metricKey];
    }
    const exists = this.isInExportCartWithSettings(areaKey, dateRangeKey, metricKey, parameter, changingWidgetSettings);

    if (!exists) {
      const length = cart[areaKey][dateRangeKey].metrics.length;
      parameter.index = length;

      cart[areaKey][dateRangeKey].metrics.push(parameter);
    }

    // Slashes break down the export URLs

    if (parameter.dateFormat) {
      parameter.dateFormat = parameter.dateFormat.replace(/\//g, '|');
    }
    if (!this.ObjectUtils.isNullOrUndefined(parameter.currentUser) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentUser.localization) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentUser.localization.date_format) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentUser.localization.date_format.mask)
    ) {
      parameter.currentUser.localization.date_format.mask = parameter.currentUser.localization.date_format.mask.replace(/\//g, '|');
    }

    if (!this.ObjectUtils.isNullOrUndefined(parameter.currentOrganization) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentOrganization.localization) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentOrganization.localization.date_format) &&
      !this.ObjectUtils.isNullOrUndefined(parameter.currentOrganization.localization.date_format.mask)
    ) {
      parameter.currentOrganization.localization.date_format.mask =
        parameter.currentOrganization.localization.date_format.mask.replace(/\//g, '|');
    }

    cart[areaKey][dateRangeKey].pdfOrientation = parameter.pdfOrientation;

    return cart;
  }

  /**
   * Builds the area key from Ids passed in.
   * @param {int} orgId Organization id.
   * @param {int} siteId the area key e.g. 2000_1000.
   * @param {int} locationId location id.
   * @param {int} zoneId date range.
   * @param {moment} hierarchy tags.
   * @param {moment} widget area key.
   * @returns {String} returns the generated string based area key e.g. 2000_1000.
   * 
  */   
  buildAreaKey (orgId, siteId, locationId, zoneId, tags, key) {
    if (!this.ObjectUtils.isNullOrUndefinedOrBlank(key)) {
      return key;
    }
    let areaKey = orgId;
    areaKey += `_${this.getId(siteId)}`;
    if (locationId) {
      areaKey += `_location_${this.getId(locationId)}`;
    } else if (zoneId) {
      areaKey += `_zone_${this.getId(zoneId)}`;
    } else if (tags && tags.length > 0) {
      areaKey += '_tags_';
      _.each(tags, tag => {
        areaKey += tag;
      });
    }
    return areaKey;
  }

  /**
   * Returns the id passed in if its noy null or undefined.
   * If its null or undefined returns -1.
   * @param {int} Id e.g. site id, location id or zone id.
   * @returns {int} returns the id.
   * 
  */  
  getId (id) {
    const invalidID = -1;
    if (this.ObjectUtils.isNullOrUndefined(id)) {
      return invalidID;
    }
    return id;
  }

  /**
   * Build the date range key using the date ranges passed in.
   * @param {moment} dateRange Selected date range.
   * @param {moment} compare1Range Compare 1 Range based on the selected date range.
   * @param {moment} compare2Range Compare 2 Range based on the selected date range.
   * @returns {String} returns the built date range key.
   * 
  */  
  buildDateRangeKey (dateRange, compare1Range, compare2Range) {
    if (this.ObjectUtils.isNullOrUndefined(dateRange)) {
      return;
    }
    return dateRange.start +
               ' - ' +
               dateRange.end +
               ' - ' +
               compare1Range.start +
               ' - ' +
               compare1Range.end +
              ' - ' +
              compare2Range.start +
              ' - ' +
              compare2Range.end;
  }

  /**
   * Store the export cart passed in to the local storage.
   * @param {Object} exportCart passed in.
   * 
  */
  storeExportCart (exportCart) {
    this.localStorageService.set('exportCart', exportCart);
  }

  /**
   * Remove the specified export from the export cart and re-store
   * the cart in local storage.
   * @param {String} areaKey passed in.
   * @param {Object} dateRangeKey passed in.
   * @param {String} metricKey passed in e.g. 'test-metric'
   * 
  */
  removeFromExportCart (areaKey, dateRangeKey, metricKey) {
    const invalidIndex = -1;

    if (metricKey.name) {
      metricKey = metricKey.name;
    }

    const metricFound = this.exportCart[areaKey][dateRangeKey].metrics.some(metric => metric.name === metricKey);

    if (this.exportCart[areaKey] && this.exportCart[areaKey][dateRangeKey] && metricFound) {

      let index = -1;
      this.exportCart[areaKey][dateRangeKey].metrics.some((metric, iArg) => {
        if (metric.name === metricKey) {
          index = iArg;
        }
      });

      if (index > invalidIndex) {
        this.exportCart[areaKey][dateRangeKey].metrics.splice(index, 1);

      }

      if (this.exportCart[areaKey][dateRangeKey].metrics.length === 0) {
        delete this.exportCart[areaKey][dateRangeKey];
        if (Object.keys(this.exportCart[areaKey]).length === 0) {
          delete this.exportCart[areaKey];
        }
      }

      this.localStorageService.set('exportCart', this.exportCart);
    }
  }

  /**
   * Check Extra Parameters in the export cart Metrics
   * to facilitate check if export is in cart or not.
   * @param {Object} extraParams passed in.
   * @param {Object} cartMetric passed in.
   * @returns {Boolean} return matches for extra parameter.
  */
  checkExtraParametersInCart (extraParams, cartMetric) {
    if (this.ObjectUtils.isNullOrUndefined(extraParams)) {
      return true;
    }
    let matches = true;

    _.each(Object.keys(extraParams), key => {
      if (cartMetric[key] !== extraParams[key]) {
        matches = false;
      }
    });
    return matches;
  }

  /**
   * Check the export is in the export cart using the parameters
   * passed in. If is in export cart return true based on arguments 
   * passed in or otherwise false.
   * @param {String} areaKey passed in e.g. '2000_1000'. Area e.g. Org_site_zone_location.
   * @param {Object} dateRangeKey passed in 
   * e.g. '1388620800000 - 1389225599999 - 1387584000000 - 1388275199999 - 1387584000000 - 1388275199999'.
   * @param {String} metricKey passed in e.g. 'test-metric'
   * @param {boolean} groupBy passed in e.g. Group by day, week, month and year. 
   * @param {extraParams} extraParams passed in.
   * @returns {Boolean} returns true if export is in the cart else return false.
   * 
  */
  isInExportCart (areaKey, dateRangeKey, metricKey, groupBy, extraParams) {
    if (this.exportCart[areaKey] && this.exportCart[areaKey][dateRangeKey]) {
      let found;

      if (groupBy) {
        found = this.exportCart[areaKey][dateRangeKey].metrics.some(metric => metric.name === metricKey && metric.groupBy === groupBy);
      } else {
        found = this.exportCart[areaKey][dateRangeKey].metrics.some(metric => metric.name === metricKey && 
          this.checkExtraParametersInCart(extraParams, metric));
      }

      return this.exportCart[areaKey] &&
        this.exportCart[areaKey][dateRangeKey] &&
        found;
    }
    return false;
  }

  /**
   * Check the widget is in the export cart.
   * @param {String} areaKey passed in e.g. '2000_1000'. Area e.g. Org_site_zone_location.
   * @param {Object} dateRangeKey passed in 
   * e.g. '1388620800000 - 1389225599999 - 1387584000000 - 1388275199999 - 1387584000000 - 1388275199999'
   * @param {Object} widget passed in.
   * @param {boolean} groupBy passed in e.g. Group by day, week, month and year setting on the widget. 
   * @param {extraParams} extraParams passed in.
   * @returns {Boolean} returns true if widget is in the cart else return false.
   * 
  */
  isWidgetInExportCart (areaKey, dateRangeKey, widget, groupBy, extraParams) {
    if (this.exportCart[areaKey] && this.exportCart[areaKey][dateRangeKey]) {
      const found = this.exportCart[areaKey][dateRangeKey].metrics.some(metric =>
        this.compareMetric(metric, widget, groupBy, extraParams));

      return this.exportCart[areaKey] &&
        this.exportCart[areaKey][dateRangeKey] &&
        found;
    }
    return false;
  }

  /**
   * Compares metric to ensure widgets don't contain duplicate metrics 
   * in the export cart. If groupBy is changed i.e. day and week then
   * they become different metrics.
   * @param {Object} metric object passed.
   * @param {Object} widget passed in.
   * @param {boolean} groupBy passed in e.g. Group by day, week, month and year setting on the widget.  
   * @param {extraParams} extraParams passed in.
   * @returns {Boolean} returns true if widget metrics match in the cart else return false.
   * 
  */
  compareMetric (metric, widget, groupBy, extraParams) {
    const groupbyMatch = this.ObjectUtils.isNullOrUndefinedOrBlank(groupBy) ||
      metric.groupBy === groupBy;
    const extraParamsMatch = this.ObjectUtils.isNullOrUndefined(extraParams) ||
      this.checkExtraParametersInCartWithWidget(extraParams, metric, widget);

    return metric.name === widget.name && groupbyMatch && extraParamsMatch;
  }

  /**
   * Checks if the widget has extra parameters associated with it 
   * e.g. groupBy setting like day, week.  
   * @param {Object} extraParams passed in.
   * @param {array} cartMetric passed in.
   * @param {Object} widget passed in.
   * @returns {Boolean} returns true if matches else return false.
   * 
  */
  checkExtraParametersInCartWithWidget (extraParams, cartMetric, widget) {
    if (this.ObjectUtils.isNullOrUndefined(extraParams)) {
      return true;
    }
    let matches = true;

    _.each(Object.keys(extraParams), key => {
      if (!angular.equals(cartMetric[key], widget[key])) {
        matches = false;
      }
    });
    return matches;
  }

  /**
   * Check metric is in export cart with settings.  
   * @param {Object} areaKey passed in e.g. '2000_1000'. Area e.g. Org_site_zone_location.
   * @param {array} dateRangeKey passed in.
   * e.g. '1388620800000 - 1389225599999 - 1387584000000 - 1388275199999 - 1387584000000 - 1388275199999'
   * @param {String} metricKey passed in.
   * @param {Object} params passed in.
   * @param {Object} paramsToCompare passed in.
   * @returns {Boolean} returns true if exists else return false.
   * 
  */  
  isInExportCartWithSettings (areaKey, dateRangeKey, metricKey, params, paramsToCompare) {
    let found, checkCartData;

    const checkParams = this.filterParams(angular.copy(params), paramsToCompare);

    if (this.exportCart[areaKey] && this.exportCart[areaKey][dateRangeKey]) {
      found = this.exportCart[areaKey][dateRangeKey].metrics.some(data => {
        checkCartData = this.filterParams(angular.copy(data), paramsToCompare);
        return metricKey === data.name && angular.equals(checkCartData, checkParams);
      });

      return this.exportCart[areaKey] && this.exportCart[areaKey][dateRangeKey] && found;
    }

    return false;
  }

  /**
   * Filter the parameters passed in based on paramsToCompare.  
   * @param {Object} params passed in.
   * @param {array} paramsToCompare passed in.
   * @returns {Boolean} returns the compareParams used to check the export cart.
   * 
  */  
  filterParams (params, paramsToCompare) {
    if (this.ObjectUtils.isNullOrUndefined(params)) {
      return params;
    }
    const compareParams = [];

    _.each(paramsToCompare, param => {
      if (!this.ObjectUtils.isNullOrUndefined(params[param]) && !this.ObjectUtils.isNullOrUndefined(params[param].selection)) {
        compareParams.push(params[param].selection);
      } else {
        compareParams.push(params[param]);
      }

    });

    return compareParams;
  }

  /** Checks to see if a widget is in the export cart. Public function
   *  Does the legwork of building the various keys needed to check the export
   *
   *  @param {object} widget - The widget to check for.
   *  @param {boolean} groupBy passed in true or false e.g. group by day, week etc. setting on widget.
   *  @param {extraParams} extraParams passed in.
   *  @returns {boolean} returns the true if widget is in export cart otherwise false.
   */
  isInExportCartSimple (widget, groupBy, extraParams) {

    if (typeof widget.locationIds === 'undefined' && widget.locationId) {
      widget.locationIds = [];
      widget.locationIds.push(widget.locationId);
    }

    const joinedLocationIds = this.joinLocationIds(widget.locationIds);

    const areaKey = this.buildAreaKey(widget.orgId, widget.siteId, joinedLocationIds, widget.zoneId, widget.selectedTags, widget.areaKey);

    if (typeof widget.compare1Range === 'undefined' && typeof widget.compareRange1 !== 'undefined') {
      widget.compare1Range = widget.compareRange1;
    }

    if (typeof widget.compare2Range === 'undefined' && typeof widget.compareRange2 !== 'undefined') {
      widget.compare2Range = widget.compareRange2;
    }

    const dateRangeKey = this.buildDateRangeKey(widget.dateRange, widget.compare1Range, widget.compare2Range);

    return this.isWidgetInExportCart(areaKey, dateRangeKey, widget, groupBy, extraParams);
  }

  /** 
   *  Get the export cart. Also stored in local storage.
   * 
   *  @returns {array} returns the export cart.
   */
  getCart () {
    return this.exportCart;
  }

  /** 
   *  Get the carts previously exported in the same session.
   *  Also stored in local storage.
   *
   *  @returns {array} returns the previously exported carts.
   */  
  getExportedCarts () {
    return this.exportedCarts;
  }

  /** 
   *  If the cart has been exported returns true otherwise false.
   *
   *  @returns {boolean} returns true if cart has been exported e.g. 'Export PDF' button has been pressed.
   */ 
  cartHasBeenExported (cart) {
    const invalidIndex = -1;

    return this.exportedCarts.indexOf(cart) === invalidIndex;
  }

  /** 
   *  Returns location Ids Array.
   * 
   *  @param {locationId} location ids in csv format.
   *  @returns {array} location ids array.
   */ 
  dotSeparation (locationId) {
    const locationIdsArray = [];
    if (locationId !== undefined) {
      const separatedList = locationId.split(',');
      _.each(separatedList, key => {
        locationIdsArray.push(key);
      });
    }
    return locationIdsArray;
  }

  /** 
   *  Builds the widgets metrics list from the export cart.
   * 
   *  @param {Object} Export cart passed in.
   *  @param {Boolean} fromSchedule passed in.
   *  @returns {Object} returns list of widgets in the export cart.
   */  
  buildMetricListFromExportCart (cart, fromSchedule) {
    const widgets = [];
    let locationIdsArray = [];

    _.each(cart, (dateRangeGroups, areaKey) => {
      let locationId;
      let zoneId;
      const splitAreaKey = areaKey.split('_');
      const orgId = splitAreaKey[0];
      const siteId = this.setId(splitAreaKey[1]);
      const idType = splitAreaKey[2];

      if (idType === 'location') {
        locationId = this.setId(splitAreaKey[3]);
      } else if (idType === 'zone') {
        zoneId = this.setId(splitAreaKey[3]);
      }

      locationIdsArray = this.dotSeparation(locationId);

      if (locationIdsArray.length > 1) {
        locationId = undefined;
      }

      _.each(dateRangeGroups, dateRangeGroup => {

        _.each(dateRangeGroup.metrics, metric => {
          const locationTypes = [];
          _.each(metric.location_type, type => {
            locationTypes.push(type);
          });
          const parameter = {
            'partialPageName': metric.partialPageName,
            'pageName': metric.pageName,
            'organizationId': orgId,
            'siteId': siteId,
            'locationId': locationId,
            'zoneId': zoneId,
            'dateRange': { 'start': dateRangeGroup.start, 'end': dateRangeGroup.end },
            'compare1Range': { 'start': dateRangeGroup.compare1Start, 'end': dateRangeGroup.compare1End },
            'compare2Range': { 'start': dateRangeGroup.compare2Start, 'end': dateRangeGroup.compare2End },
            'summaryKey': this.getSummaryKey(metric),
            'locationType': locationTypes
          };

          if (locationIdsArray.length > 1) {
            parameter.locationIds = locationIdsArray;
          }


          if (fromSchedule !== true) {
            _.each(Object.keys(metric), key => {
              if (key !== 'name'
                && key !== 'location_type'
                && key !== 'index'
                && key !== 'currentUser'
                && key !== 'compare'
                && key !== 'dateRangeShortCut'
                && key !== 'customRange'
                && key !== 'xDaysBack'
                && key !== 'xDaysDuration'
                && key !== '$$hashKey'
                && key !== 'dateFormat'
                && key !== 'firstDayOfWeekSetting'
                && key !== 'language'
                && key !== 'currencySymbol'
                && key !== 'showWeatherMetrics'
                && key !== 'selectedWeatherMetrics'
              ) {
                parameter[key] = metric[key];
              }
            });
          } else {
            _.each(Object.keys(metric), key => {
              if (key !== 'name'
                && key !== 'location_type'
                && key !== 'index'
                && key !== 'currentUser'
                && key !== '$$hashKey'
                && key !== 'dateFormat'
                && key !== 'firstDayOfWeekSetting'
                && key !== 'language'
                && key !== 'currencySymbol'
              ) {
                parameter[key] = metric[key];
              }
            });
          }

          widgets.push(parameter);
        });
      });
    });

    return widgets;
  }

  /** 
   *  Returns the summary key property of metric passed in if its not null, undefined or blank.
   *  Otherwise returns the metric name.
   * 
   *  @param {Object} metric passed in.
   *  @returns {String} returns summary key of the metric or its name.
   */
  getSummaryKey (metric) {
    if (!this.ObjectUtils.isNullOrUndefinedOrBlank(metric.summaryKey)) {
      return metric.summaryKey;
    }

    return metric.name;
  }

  /** 
   *  Returns key that is then used to set the siteid, zoneid or locationid.
   * 
   *  @param {int} key passed in.
   *  @returns {String} returns undefined if key passed in is null or undefined. Otherwise
   *  returns the key passed in.
   */
  setId (key) {
    if (!this.ObjectUtils.isNullOrUndefined(key) && key < 0) {
      return undefined;
    }
    return key;
  }

  /** 
   *  Build the pdf URL that contains user selected widgets.
   * 
   *  @param {array} widgets passed in that are in the pdf.
   *  @param {Boolean} fromSchedule passed in i.e. is it from the schedule in DB or is it on demand.
   *  @returns {Object} returns deferred promise.
   */
  buildPdfUrl (widgets, fromSchedule) {
    const deferred = this.$q.defer();

    this.authService
      .getCurrentUser()
      .then(data => {
        const widgetData = {
          userId: data._id,
          widgets
        };

        _.each(widgetData.widgets, widget => {
          if (fromSchedule && !this.ObjectUtils.isNullOrUndefined(widget.compare)) {
            widget.compare.chart_name = this.$filter('replaceSpecialChars')(widget.compare.chart_name);
          }
          if (widget.compareSites) delete widget.compareSites;

          this.stringifyDates(widget);
        });

        const url = `${this.$location.absUrl().split('#')[0]}#/pdf/`;

        const encodedWidgetData = encodeURIComponent(JSON.stringify(widgetData));

        const retVal = {
          fullPdfUrl: encodeURIComponent(url) + encodedWidgetData,
          basePdfUrl: url,
          encodedWidgetData
        };

        deferred.resolve(retVal);
      }, () => {
        console.error('error');
        deferred.reject();
      });

    return deferred.promise;
  }

  /**
    * This function turns the all date ranges into strings for the widget.
    * 
    * @param {Object} widget passed in.
    */
  stringifyDates (widget) {
    const dateRangeProperties = ['dateRange', 'compare1Range', 'compare2Range'];

    _.each(dateRangeProperties, dateRangeProperty => {
      if (!this.ObjectUtils.isNullOrUndefined(widget[dateRangeProperty])) {
        widget[dateRangeProperty] = this.stringifyDateRange(widget[dateRangeProperty]);
      }
    });
  }

  /**
    * This function turns the date range passed into a string format.
    * 
    * @param {moment} dateRange passed in.
    */
  stringifyDateRange (dateRange) {
    if (this.ObjectUtils.isNullOrUndefined(dateRange)) {
      return;
    }

    if (this.ObjectUtils.isNullOrUndefined(dateRange.start) && this.ObjectUtils.isNullOrUndefined(dateRange.end)) {
      return dateRange;
    }

    if (angular.isString(dateRange.start) && angular.isString(dateRange.end)) {
      return dateRange;
    }

    return {
      start: this.utils.getDateStringForRequest(dateRange.start),
      end: this.utils.getDateStringForRequest(dateRange.end)
    };
  }

  /**
    * This function exports the cart to the pdf and sets it in local storage.
    * 
    * @param {array} cart passed in.
    */
  exportCartToPdf (cart) {
    this.googleAnalytics.trackUserEvent('pdf', 'generate');
    const widgets = _.sortBy(this.buildMetricListFromExportCart(cart), 'pdfOrientation');

    this.numExportsInProgress++;

    this.buildPdfUrl(widgets).then(pdfInfo => {
      this.$rootScope.$broadcast('pdfExportStart', cart);

      if (this.generatePdf === true) {
        const request = this.buildPdfRequest(pdfInfo.fullPdfUrl);
        console.info('Requesting PDF from API...');

        this.$http(request)
          .then(response => {
            this.turnResponseIntoPdf(response);

            this.numExportsInProgress--;

            this.onExportFinish(cart, true);
          }, () => {
            this.numExportsInProgress--;

            this.onExportFinish(cart, false);
          });
      } else {
        const url = pdfInfo.basePdfUrl + pdfInfo.encodedWidgetData;
        this.$window.open(url);

        this.numExportsInProgress--;

        this.onExportFinish(cart, true);
      }

      if (this.cartHasBeenExported(cart)) {
        this.exportedCarts.unshift(cart);
        this.localStorageService.set('exportedCarts', this.exportedCarts);
      }
    });
  }

  /**
    * This function builds the http get request object to the API for the pdf.
    * 
    * @param {String} builtPdfUrl passed in.
    * @returns {Object} Request object.
    */
  buildPdfRequest (builtPdfUrl) {
    return {
      method: 'GET',
      url: `${this.apiUrl}/pdf?url=${builtPdfUrl}`,
      headers: {
        'Accept': 'application/pdf',
        'Authorization': this.session.getToken()
      },
      responseType: 'arraybuffer'
    };
  }

  /**
    * This function is called when the cart of widgets has been
    * exported to the pdf. An event is then
    * broadcast on the $rootScope for any listeners to convey
    * a success or failure.
    * 
    * @param {array} cart passed in.
    * @param {boolean} successful boolean flag passed in. Can be true or false.
    */
  onExportFinish (cart, successful) {
    const exportDetails = {
      cart,
      success: successful
    };

    this.$rootScope.$broadcast('pdfExportFinish', exportDetails);
  }

  /**
    * This function is called when the http response returns from the API
    * and it turns the response into a pdf file.
    * 
    * @param {response} response passed in from API.
    */
  turnResponseIntoPdf (response) {
    console.info('PDF Data received from API');

    const file = new Blob([response.data], { type: 'application/pdf' });
    console.info('File blob created');

    const fileURL = URL.createObjectURL(file);
    console.info('File url created');

    const downloadAttrSupported = 'download' in document.createElement('a');

    // Unique and human-readable (more or less) filename
    const filename = `${moment().format('YYYY-MM-DD_HH-mm-ss')}_shoppertrak.pdf`;

    if (downloadAttrSupported) {
      console.info('downloadAttr Supported');
      const aTag = document.createElement('a');
      document.body.appendChild(aTag);
      aTag.style.display = 'none';
      aTag.href = fileURL;
      aTag.download = filename;
      console.info('Element created. Clicking...');
      aTag.click();
      console.info('Clicked');
    } else {
      console.info('downloadAttr not Supported');
      saveAs(file, filename);
    }
  }

  /**
    * This function is called when the current cart is exported to pdf.
    *
    */
  exportCurrentCartToPdf () {
    this.exportCartToPdf(this.exportCart);
  }

  /**
    * This function is called to sort widgets based on the index.
    * 
    * @param {widgets} widgets passed in.
    */  
  sort (widgets) {
    widgets.sort((aArg, bArg) => aArg.index - bArg.index);
  }

  /**
    * This function gets the count of items in the cart.
    * 
    * @returns {int} cart item count.
    */
  getCartItemCount () {
    let cartItemCount = 0;
    for (const areaKey in this.exportCart) {
      for (const dateRangeKey in this.exportCart[areaKey]) {
        cartItemCount += this.exportCart[areaKey][dateRangeKey].metrics.length;
      }
    }
    return cartItemCount;
  }

  /**
    * This function gets the number of exports in progress.
    * 
    * @returns {int} number of exports in progress.
    */
  getNumExportsInProgress () {
    return this.numExportsInProgress;
  }

  /**
    * This function gets the Org Id from the cart.
    * 
    * @returns {int} OrgId.
    */
  getOrgIdFrom (cart) {
    const areaKeys = Object.keys(cart);
    const orgIds = areaKeys.map(areaKey => areaKey.split('_')[0]);
    //TODO: Currently returns first orgId; can there be multiple?
    return orgIds[0];
  }

  /**
    * This function sets the translations for visitor behaviour.
    * 
    */
  setTranslations () {
    this.$translate('pdfExportView.VISITORBEHAVIOR').then(translation => {
      this.visitorBehaviorName = translation;
    });
  }
}

angular.module('shopperTrak')
  .service('ExportService', ExportService);

ExportService.$inject = ['$rootScope',
  'localStorageService',
  '$q',
  'apiUrl',
  '$http',
  '$window',
  '$location',
  '$filter',
  '$translate',
  'session',
  'ObjectUtils',
  'authService',
  'generatePdf',
  'googleAnalytics',
  'widgetConstants',
  'utils',
  'metricConstants',
  'metricNameService'];
