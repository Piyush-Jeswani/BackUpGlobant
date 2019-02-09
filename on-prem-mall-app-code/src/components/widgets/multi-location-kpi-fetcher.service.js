(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .factory('multiLocationKPIFetcher', multiLocationKPIFetcher);

  multiLocationKPIFetcher.$inject = [
    '$q',
    '$http',
    'apiUrl',
    'multiLocationKPIFetcherKPIDefinitions',
    'ObjectUtils'
  ];

  function multiLocationKPIFetcher($q, $http, apiUrl, kpiDefinitions, ObjectUtils) {
    return {
      fetchAggregate: fetchAggregate
    };

    // Fetch a response containing aggregated values for multiple
    // locations and transform it into an object containing key-value
    // pairs. Keys are locationId's.
    function fetchAggregate(kpiId, params) {
      var deferred = $q.defer();

      var data = [];
      data.isLoading = true;
      data.hasFailed = false;
      data.promise = deferred.promise;

      var kpiDefinition = kpiDefinitions[kpiId];

      var prefetch = kpiDefinition.prefetch || defaultPrefetch;

      prefetch(angular.extend({}, kpiDefinition.queryParams, params))
        .then(function (transformedParams) {
          return $http.get(apiUrl + '/' + kpiDefinition.apiEndpoint, {
            params: transformedParams
          });
        })
        .then(function (response) {
          var transformedData = transformResponseData(kpiId, response.data);
          angular.extend(data, transformedData);
          data.isLoading = false;
          deferred.resolve(data);
        }).catch(function () {
          data.hasFailed = true;
          data.isLoading = false;
          deferred.reject();
        });

      return data;

      function defaultPrefetch(params) {
        var deferred = $q.defer();
        deferred.resolve(params);
        return deferred.promise;
      }
    }

    function transformResponseData(kpiId, responseData) {
      var valueKey = kpiDefinitions[kpiId].valueKey;
      var locationIdKey = kpiDefinitions[kpiId].locationIdKey;

      var transformedData = {};
      if (!ObjectUtils.isNullOrUndefined(responseData) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(responseData.result)) {
        _.each(responseData.result, function (item) {
          var locationId = item[locationIdKey];
          var value = item[valueKey];
          if (!ObjectUtils.isNullOrUndefined(value)) {
            transformedData[locationId] = value;
          }
        });
      }
      return transformedData;

    }
  }
})();
