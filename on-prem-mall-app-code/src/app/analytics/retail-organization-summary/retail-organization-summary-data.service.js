(function() {
  'use strict';

  angular.module('shopperTrak')
    .constant('retailOrganizationSummaryDataConstants', {
      kpis: [
        'traffic',
        'dwelltime',
        'sales',
        'conversion',
        'ats',
        'star',
        'upt',
        'sps',
        'splh',
        'aur',
        'transactions',
      ],
      deltaLabels: {
        'traffic': 'Traffic change',
        'dwelltime': 'Dwell time',
        'sales': 'Sales',
        'conversion': 'Conversion',
        'ats': 'ATS',
        'star': 'STAR',
        'upt': 'UPT',
        'sps': 'SPS',
        'splh': 'SPLH',
        'aur': 'AUR'
      },
      totalLabels: {
        'traffic': 'Overall traffic',
        'dwelltime': 'Avg dwell time',
        'sales': 'Gross revenue',
        'conversion': 'Avg conversion',
        'ats': 'Avg transaction',
        'star': 'Shoppers to associate',
        'upt': 'Units per transaction',
        'sps': 'Sales per shopper',
        'splh': 'Sales per labor hour',
        'aur': 'Average unit retail'
      },
      fractionSizes: {
        'traffic': 0,
        'dwelltime': 2,
        'sales': 0,
        'conversion': 2,
        'ats': 2,
        'star': 2,
        'upt': 1,
        'sps': 2,
        'splh': 2,
        'aur': 2
      }
    })
    .factory('retailOrganizationSummaryData', retailOrganizationSummaryData);

  retailOrganizationSummaryData.$inject = [
    '$filter',
    'requestManager',
    'apiUrl',
    'retailOrganizationSummaryDataConstants',
    'ObjectUtils',
    'utils'
  ];

  function retailOrganizationSummaryData($filter, requestManager, apiUrl, constants, ObjectUtils, utils) {
    var selectedTags = {};
    var selectedTagNames = {};
    var isRequestComplete;

    /* Make /kpis/reports request and transform site data. */
    function fetchReportData(params, checkCache, callback, errorCallback) {
      const {
        orgId,
        comp_site,
        compStartDate,
        compEndDate,
        kpi,
        sales_category_id,
        operatingHours,
        dateRangeStart,
        dateRangeEnd,
        customTagId
      } = params;

      setRequestCompletedFlag(false);

      if(ObjectUtils.isNullOrUndefined(dateRangeStart)) {
        return;
      }

      if(ObjectUtils.isNullOrUndefined(dateRangeEnd)) {
        return;
      }

      const dateRangeParams = {
        reportStartDate: utils.getDateStringForRequest(dateRangeStart),
        reportEndDate: utils.getDateStringForRequest(dateRangeEnd)
      };

      const kpis = kpi !== undefined ?  _.intersection(constants.kpis, kpi) : constants.kpis;

      const requestParams = {
        orgId,
        comp_site,
        groupBy: 'aggregate',
        kpi: kpis,
        sales_category_id,
        operatingHours,
        ...dateRangeParams,
        ...(comp_site === true ?  {compStartDate, compEndDate} : {}),
        ...(
          ( !ObjectUtils.isNullOrUndefined(sales_category_id) && sales_category_id.length > 1) ?
          { aggregate_sales_categories : true } : {} ),

        ...( !ObjectUtils.isNullOrUndefined(customTagId) ? { customTagId } : {} )
      };

     requestManager.get(`${apiUrl}/kpis/report`, {
        params: requestParams,
        setTimeOut : 3
      }, checkCache)
      .then((data) => {
        setRequestCompletedFlag(true);
        var transformedData = transformResponseData(data, constants.kpis);
        callback(transformedData);
      })
      .catch((error) => {
        if(angular.isFunction(errorCallback)) {
          errorCallback(error);
        }
      });
    }

    function transformResponseData(responseData, kpis) {
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(responseData) ||
      ObjectUtils.isNullOrUndefined(responseData.result)) {
        return;
      }

      var transformedData = [];
      var uniqueSites = $filter('unique')(responseData.result,'site_id');

      var uniqueSitesLength = uniqueSites.length;

      for(var i = 0; i !== uniqueSitesLength; ++i){
        var row = uniqueSites[i];

        var kpisLength = kpis.length;

        for(var j = 0; j !== kpisLength; ++j){
          var kpi = kpis[j];
          if(row[kpi] === 0 || typeof row[kpi] === 'undefined') {
            var siteRow = getSiteRow(responseData.result, row);
            if(typeof siteRow[0] !== 'undefined') {
              row[kpi] = siteRow[0][kpi];
            }
          }
        }

        transformedData.push(row);
      }

      function getSiteRow(data, row) {
        return data.filter(function(obj) {
          return obj.site_id === row.site_id && obj[kpi] !== 0 && !_.isUndefined(obj[kpi]);
        });
      }

      return transformedData;
    }


  /** Fetches data for the 5 kpi widget at org level.
   *  Must be called for each date range.
   *  This function returns nothing and instead executes callbacks.
   *
   *  @param {object} params - The params object. Not all properties are used.
   *  @param {boolean} checkCache - Flag that is passed to the requestManager. Can be used to bypass the client side caching
   *  @param {function} callback - Function to be executed on successful request of data
   *  @param {function} errorCallBack - Function to be executed on unsuccessful request of data
   **/
    function fetchKpiData(params, checkCache, callback, errorCallBack) {
      const {
        apiEndpoint,
        orgId,
        siteId,
        comp_site,
        selectedTags:hierarchyTagId,
        customTagId,
        kpi,
        sales_category_id,
        operatingHours,
        dateRangeStart,
        dateRangeEnd,
        compStartDate,
        compEndDate,
      } = params;

      if(!ObjectUtils.isNullOrUndefined(dateRangeStart) && !ObjectUtils.isNullOrUndefined(dateRangeEnd)) {

        const dateRangeParams = {
          reportStartDate: getDateString(dateRangeStart),
          reportEndDate: getDateString(dateRangeEnd)
        };

        const requestParams = {
          orgId,
          siteId,
          comp_site,
          groupBy: 'aggregate',
          hierarchyTagId,
          kpi,
          sales_category_id,
          operatingHours,
          ...dateRangeParams,
          ...(comp_site === true ?  {compStartDate, compEndDate} : {}),
          ...(!ObjectUtils.isNullOrUndefined(customTagId) ? { customTagId } : {}),
          ...(ObjectUtils.isNullOrUndefined(siteId) ? {org_level: true} : {})
        };

        requestManager.get(`${apiUrl}/${apiEndpoint}`, {
          params: requestParams
        }, checkCache).then( (data) => {

          // Depending on the endpoint we call, the api returns traffic and sales with different prop name.
          // This code renames the properies into something more common

          // eslint-disable-next-line no-unused-vars
          _.each(data.result, function(row) {
            row = ObjectUtils.rename(row, 'sales_amount', 'sales');
            row = ObjectUtils.rename(row, 'total_sales', 'sales');
            row = ObjectUtils.rename(row, 'total_traffic', 'traffic');
          });

          callback(data);
        }, (error, status) => {

          if(typeof errorCallBack === 'function') {
            errorCallBack(error, status);
          }

        fetchKpiData.error = { message: error, status: status};

        });
      }
    }

    function getDateString(dateRange) {
      if(typeof dateRange === 'string') {
        //TODo: check when this condition is entered
        return dateRange;
      }

      return utils.getDateStringForRequest(dateRange);
    }

    function getDateRangeKey(dateRangeStart, dateRangeEnd) {
      return dateRangeStart + '_' + dateRangeEnd;
    }

    function setSelectedTags(tags) {
      selectedTags = tags;
    }

    function setSelectedTagNames(names) {
      selectedTagNames = names;
    }

    function getSelectedTagNames() {
      return selectedTagNames;
    }

    function getSelectedTags() {
      return selectedTags;
    }

    function setRequestCompletedFlag(value){
      isRequestComplete = value;
    }

    function getRequestCompletedFlag(){
      return isRequestComplete;
    }

    return {
      fetchReportData: fetchReportData,
      fetchKpiData: fetchKpiData,
      transformResponseData: transformResponseData,
      getDateRangeKey: getDateRangeKey,
      setSelectedTags: setSelectedTags,
      getSelectedTags: getSelectedTags,
      setSelectedTagNames: setSelectedTagNames,
      getSelectedTagNames: getSelectedTagNames,
      setRequestCompletedFlag: setRequestCompletedFlag,
      getRequestCompletedFlag: getRequestCompletedFlag
    };
  }
})();
