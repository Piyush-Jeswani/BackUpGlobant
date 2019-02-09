'use strict';
angular.module('shopperTrak')
  .factory('WidgetLibraryGraphRequestFactory', WidgetLibraryGraphRequestFactory);
WidgetLibraryGraphRequestFactory.$inject = [
  'requestManager',
  'ObjectUtils',
  'apiUrl',
  'utils'];
function WidgetLibraryGraphRequestFactory(requestManager, ObjectUtils, apiUrl, utils) {
  /**
  * Formats the command request params.
  * @returns {object} containing main params for request.
  */
  function getCommonRequestParams(orgId, groupBy) {
    return {
      orgId: orgId,
      groupBy: groupBy
    };
  }

  /**
  * Extend params, invoke request and append outstanding requests.
  */
  function getRequestPromise(fullUrl, requestParams, cache, dateRange) {
    var params = {
      params: angular.extend({}, {
        reportStartDate: utils.getDateStringForRequest(moment(dateRange.start)),
        reportEndDate: utils.getDateStringForRequest(moment(dateRange.end)),
      }, requestParams)
    };
    return requestManager.get(fullUrl, params, cache);
  }

  /**
  * Loop round the metric list and for each iteration call the getRequestPromise
  * @returns {object} containing an array of requests.
  */
  function getChartRequests(metricList, orgId, dateRange, groupBy) {
    var requests = [];
    if (!ObjectUtils.isNullOrUndefined(metricList)) {
      _.each(metricList, function (metric) {
        try {
          var commonRequestParams = getCommonRequestParams(orgId, groupBy);
          commonRequestParams.org_level = true;
          commonRequestParams.kpi = [metric.kpi];
          var fullUrl = apiUrl + '/kpis/report';
          requests.push(getRequestPromise(fullUrl, commonRequestParams, true, metric.dateRange));
        }
        catch (ex) {
          console.warn('Metric request failed for ' + metric.kpi + '. ' + ex);
        }
      });
    }
    return requests;
  }

  return {
    getChartRequests: getChartRequests
  }
}







