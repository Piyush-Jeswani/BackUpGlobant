(function () {
  'use strict';

  angular.module('shopperTrak')
    .constant('organizationSummaryDataConstants', {
      kpis: ['traffic', 'gsh', 'loyalty'],
      deltaLabels: {
        'traffic': 'Traffic change',
        'gsh': 'GSH change',
        'loyalty': 'Visiting freq. change'
      },
      totalLabels: {
        'traffic': 'Overall traffic',
        'gsh': 'Gross shopping hours',
        'loyalty': 'Visiting frequency'
      },
      fractionSizes: {
        'traffic': 0,
        'gsh': 0,
        'loyalty': 2
      }
    })
    .factory('organizationSummaryData', organizationSummaryData);

  organizationSummaryData.$inject = [
    '$q',
    'apiUrl',
    'organizationSummaryDataConstants',
    'requestManager',
    'ObjectUtils',
    'utils'
  ];

  function organizationSummaryData($q, apiUrl, constants, requestManager, ObjectUtils, utils) {

    var activeSettings;

    function fetchKPIData(callback) {

      var dateRangeParams = {
        reportStartDate: utils.getDateStringForRequest(activeSettings.dateRangeStart),
        reportEndDate: utils.getDateStringForRequest(activeSettings.dateRangeEnd)
      };

      requestManager.get(apiUrl + '/kpis/report', {
        params: angular.extend({
          orgId: activeSettings.orgId,
          groupBy: 'aggregate',
          kpi: constants.kpis,
        }, dateRangeParams)
      }).then(function (data) {
        var transformedData = transformResponseData(data, constants.kpis);
        callback(transformedData);
      });

    }

    function transformResponseData(responseData, kpis) {
      var transformedData = {};
      if (!ObjectUtils.isNullOrUndefined(responseData) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(responseData.result)) {
        angular.forEach(kpis, function () {
          responseData.result.reduce(function (itemData, item) {
            transformedData[item.site_id] = _.pick(item, kpis);
          }, {});
        });
      }
      return transformedData;
    }

    function getDateRangeKey(dateRangeStart, dateRangeEnd) {
      return dateRangeStart + '_' + dateRangeEnd;
    }

    function setParams(settings) {
      activeSettings = settings;
    }

    return {
      fetchKPIData: fetchKPIData,
      transformResponseData: transformResponseData,
      setParams: setParams,
      getDateRangeKey: getDateRangeKey
    };
  }
})();
