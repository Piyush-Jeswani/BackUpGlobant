class widgetLibraryService {
  constructor ($rootScope,
    $http,
    $q,
    apiUrl,
    OrganizationResource,
    SiteResource,
    metricConstants,
    SubscriptionsService,
    ObjectUtils) {
    this.$rootScope = $rootScope;
    this.$http = $http;
    this.$q = $q;
    this.apiUrl = apiUrl;
    this.OrganizationResource = OrganizationResource;     
    this.SiteResource = SiteResource;
    this.metricConstants = metricConstants;
    this.SubscriptionsService = SubscriptionsService;
    this.ObjectUtils = ObjectUtils;
  }
  /**
  * Takes in an org id and returns all of the sites that belong to the org
  * @param {Number} id the organisation ID
  */
  getAllOrgSites (id) {
    return this.SiteResource.query({ orgId: id });
  }

  /**
   * loads available widgets since api is not completed it mocks data
   * @param {organizations}  organizations to filter widgets distributed orgs
   * @return {Array} widget library list
   */
  loadAvailableWidgetLibraries (user, organizations) {
    const deferred = this.$q.defer();
    this.$http.get(`${this.apiUrl}/widget/`)
      .then(response => {
        deferred.resolve(this.getWidgetDataList(response, user, organizations));
      })
      .catch(error => {
        console.error(error);

        deferred.reject(error);
      });

    return deferred.promise;
  }

  /**
   * loads report and its widgets this function is created for pdf export
   * @param {String}  reportId to filter widgets
   * @return {Array} widget library list
   */
  loadReportAndWidgets (reportId) {
    const deferred = this.$q.defer();
    this.$http.get(`${this.apiUrl}/report/${reportId}/widgets/`)
      .then(response => {
        deferred.resolve(this.getWidgetDataList(response, null, null, true));
      })
      .catch(error => {
        console.error(error);

        deferred.reject(error);
      });

    return deferred.promise;
  }

  /**
   * loads report and its widgets this function is created for pdf export
   * @param {String}  reportId to filter widgets
   * @return {Array} widget library list
   */
  loadWidgets (widgetParams) {
    const deferred = this.$q.defer();
    this.$http.get(`${this.apiUrl}/widget/`)
      .then(response => {
        if (this.isDataValid(response)) {
          deferred.resolve(this.transformWidgetDataFilterWidgetIds(response.data.result, widgetParams));
        } else {
          deferred.resolve([]);
        }
      })
      .catch(error => {
        console.error(error);

        deferred.reject(error);
      });

    return deferred.promise;
  }

  /**
  * getWidgetDataList in api return data
  * @param {object} response to get widget datalist
  * @param {organizations}  organizations to filter widgets distributed orgs
  */
  getWidgetDataList (response, user, organizations, noFilter) {
    if (this.isDataValid(response)) {
      return this.transformWidgetData(response.data.result, user, organizations, noFilter);
    }
    return [];
  }

  /**
  * validates api return data
  * @param {object} response to validate data
  * @return {Boolean} if there is valid daata
  */
  isDataValid (response) {
    return !this.ObjectUtils.isNullOrUndefined(response.data) &&
      !this.ObjectUtils.isNullOrUndefined(response.data.result);
  }

  /**
  * transforms widget data list to load available widgets private function
  * @param {array} widgets to find widget ids
  * @param {organizations}  organizations to filter widgets distributed orgs
  * @return {Array} widget lists
  */
  transformWidgetData (widgets, user, organizations, noFilter) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(widgets)) {
      return [];
    }

    if (noFilter) {
      return this.getTransformedWidgets(widgets);
    }

    const orgIds = _.pluck(organizations, 'organization_id');

    const objList = [];
    _.map(this.getActiveWidgets(widgets), obj => {
      if (this.isWidgetInOrg(user, orgIds, obj)) {
        objList.push(this.transformWidget(obj));
      }
    });

    return objList;
  }

  /**
  * transforms widget data list to load available widgets private function
  * @param {array} widgets to find widget ids
  * @param {widgetIs}  widgetIs to filter widgets
  * @return {Array} widget lists
  */
  transformWidgetDataFilterWidgetIds (widgets, params) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(widgets)) {
      return [];
    }

    const objList = [];
    _.map(widgets, obj => {
      if (_.contains(params.widgetIds, obj._id)) {
        const widget = this.transformWidget(obj);

        const widgetParam = _.findWhere(params.widgetParams, { widgetId: obj._id });

        widget.partialPageName = widgetParam ? widgetParam.partialPageName : '';
        widget.pageName = widgetParam ? widgetParam.pageName : '';
        widget.organizationId = params.organizationId;
        widget.org = params.org;
        widget.dateRange = params.dateRange;
        widget.summaryKey = widgetParam ? widgetParam.summaryKey : '';
        objList.push(widget);
      }
    });

    return objList;
  }

  getTransformedWidgets (data) {
    const objList = [];
    _.each(data[0].widgets, widget => {
      const widget1 = this.transformWidget(widget);
      widget1.organizationId = data[0].report.organization_id;
      widget1.summaryKey = this.getSummaryKey(widget1);
      widget1.showOverrideRange = true;
      objList.push(widget1);
    });
    const reportData = {
      report: data[0].report,
      widgets: objList
    };

    return reportData;
  }

  /**
    * private help function for export
    * @param {object} widget to find widget ids
    * @return {String} summary key to render the widget depending on widgetType
    */
  getSummaryKey (widget) {
    if (widget.widgetType === 'graph') {
      return 'widget-library-graph';
    }
    return 'table-grid-widget';
  }

  /**
  * transforms widget data list to load available widgets private function
  * @param {array} orgIds to to filter widgets with distributed orgs
  * @param {object}  widget to filter widgets distributed orgs
  * @return {boolean} true if any distribution org of widget is in org list
  */
  isWidgetInOrg (user, orgIds, widget) {
    if (user._id === widget.userId) {
      return true;
    }
    let containsFlag = false;
    _.each(widget.config.distributedOrgs, org => {
      if (_.contains(orgIds, org.organization_id)) {
        containsFlag = true;
      }
    });
    return containsFlag;
  }

  /**
  * filter deleted widgets from widget data list to load available widgets private function
  * @param {array} widgets to find widget ids
  * @return {Array} widget lists
  */
  getActiveWidgets (widgets) {
    return _.where(widgets, { hidden: false });
  }

  transformWidget (obj) {
    const widgetObj = angular.copy(obj.config);
    widgetObj.hidden = obj.hidden;
    widgetObj.userId = obj.userId;
    widgetObj.selectionType = 'multiple';
    widgetObj.multiSelectDisabled = false;
    widgetObj._id = obj._id;
    widgetObj.__v = obj.__v;
    return widgetObj;

  }

  /**
  * This function takes in an array of kpis and checks which of them are allowed to be shown by the org
  * an array of allowed kpi's are returned
  * @param {array} metricList an array of the requested metric
  * @param {object} org the organisation object
  */
  filterAllowedMetrics (metricList, org) {

    //ToDo: Plug this into the subscription service call
    if (this.ObjectUtils.isNullOrUndefined(metricList)) {
      return;
    }

    const allowedMetrics = [];

    _.each(metricList, metric => {
      const metricDetail = _.findWhere(this.metricConstants.metrics, { kpi: metric });
      if (this.isMetricAllowed(metric, metricDetail, org)) {
        allowedMetrics.push(metricDetail);
      }
    });

    return allowedMetrics;
  }

  /**
   * checks if metric allowed
   * @param {String} metric to check
   * @param {Object} org to check
   * @return {Boolean} true if it is allowed
   */
  isMetricAllowed (metric, metricDetail, org) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(metricDetail)) {
      return false;
    }

    //if the required permissions are not empty check each one against the subscription list
    return this.isGroupAllowed(metricDetail.group, org) &&
      (this.ObjectUtils.isNullOrUndefinedOrEmpty(metricDetail.requiredSubscriptions) ||
        this.SubscriptionsService.hasSubscriptions(metricDetail.requiredSubscriptions, org));
  }

  /**
   * checks if group allowed
   * @param {String} group to to check
   * @param {Object} org to check
   * @return {Boolean} true if it is allowed
   */
  isGroupAllowed (group, org) {
    // checks the group type and sets group allowed to true if the tested group is in the subscription list
    return group === 'any' ||
      this.SubscriptionsService.hasSubscriptions([group], org);
  }

  /**
   * creates new widget and retuns it in success case and broadcasts widget added event so ui could update the view list
   * @param {object} widget to create
   * @return {object} widget to the ui to update the view
   */
  saveNewWidget (widget) {
    const deferred = this.$q.defer();
    this.$http.post(`${this.apiUrl}/widget`, {
      config_object: widget
    })
      .then(result => {
        const widget = this.transformWidget(result.data.result[0]);
        deferred.resolve(widget);
      }, err => {
        console.error('save widget error', err.status);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  /**
   * removes the widget by means of setting hidden parameter to true and retuns it in 
   * success case and broadcasts widget added event so ui could update the view list
   * @param {object} widget to create
   * @return {object} widget to the ui to update the view
   */
  deleteWidget (widget) {
    const deferred = this.$q.defer();
    this.$http.delete(`${this.apiUrl}/widget/${widget._id}`)
      .then(result => {
        deferred.resolve(result.data.result[0]);
      }, err => {
        console.error('delete widget error', err.status);
        deferred.reject(err);
      });

    return deferred.promise;
  }

  /**
  * updates existing Widget library
  * @param {object} widget to be updated
  * @return {object} widget to be updated in ui and broadcasts WidgetUpdated so ui would update the list
  */
  updateWidget (widget) {
    const deferred = this.$q.defer();

    this.$http.put(`${this.apiUrl}/widget/${widget._id}`, {
      config_object: widget
    })
      .then(result => {
        deferred.resolve(this.transformWidget(result.data.result[0]));
      }).catch(error => {
        console.error('update widget error', error.status);
        deferred.reject(error);
      });

    return deferred.promise;
  }

  buildGraphWidgetConfig (widget, currentUser) {
    return {
      _id: widget._id,
      widgetType: 'graph',
      dateRange: widget.overrideRange,
      widgetName: angular.copy(widget.widgetName),
      widgetDescription: angular.copy(widget.widgetDescription),
      distributedOrgs: angular.copy(widget.distributedOrgs),
      xAxis: angular.copy(widget.xAxis),
      yAxis: angular.copy(widget.yAxis),
      overrideRange: angular.copy(widget.overrideRange),
      auditTrail: this.buildAuditTrail(currentUser)
    };

  }

  buildWidgetConfig (widget, currentUser) {
    if (widget.widgetType === 'graph') {
      return this.buildGraphWidgetConfig(widget, currentUser);
    }

    return {
      _id: widget._id,
      widgetType: 'data-grid',
      widgetName: angular.copy(widget.widgetName),
      widgetDescription: angular.copy(widget.widgetDescription),
      distributedOrgs: angular.copy(widget.distributedOrgs),
      columns: angular.copy(widget.columns),
      orgLevel: angular.copy(widget.rowTypeOrg),
      controls: angular.copy(widget.tableControls),
      overrideRange: angular.copy(widget.overrideRange),
      auditTrail: this.buildAuditTrail(currentUser),
      conditionalFormatMetrics: angular.copy(widget.conditionalFormatMetrics)
    };
  }

  /**
  * Builds and audit trail for a new widget
  * @param {object} currentUser to be used to create return object
  * @return {object} AuditTrail for widget
  */
  buildAuditTrail (currentUser) {
    return {
      creator: currentUser._id,
      creatorName: currentUser.fullname,
      creationDate: moment(),
      edits: []
    };
  }
}

angular.module('shopperTrak')
  .service('widgetLibraryService', widgetLibraryService);

widgetLibraryService.$inject = [
  '$rootScope',
  '$http',
  '$q',
  'apiUrl',
  'OrganizationResource',
  'SiteResource',
  'metricConstants',
  'SubscriptionsService',
  'ObjectUtils'
];
