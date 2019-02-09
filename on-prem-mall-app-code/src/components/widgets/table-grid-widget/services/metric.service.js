(function () {
  'use strict';

  angular
    .module('shopperTrak.tableGridWidget')
    .factory('MetricDataService', MetricDataService);

  MetricDataService.$inject = [
    'requestManager',
    'apiUrl'
  ];
  function MetricDataService(
    requestManager,
    apiUrl
  ) {
    var service = {
      getDataByKpi: getDataByKpi
    };

    return service;

    function getDataByKpi(orgId, kpis, dateRangeStart, dateRangeEnd, orgLevel) {
      var urlParams = {
        orgId: orgId,
        groupBy: 'aggregate',
        operatingHours: 'true',
        kpi: kpis,
        reportStartDate: dateRangeStart,
        reportEndDate: dateRangeEnd,
        org_level: orgLevel
      };

      return requestManager.get(apiUrl + '/kpis/report', {
        params: urlParams
      });
    }
  }
})();