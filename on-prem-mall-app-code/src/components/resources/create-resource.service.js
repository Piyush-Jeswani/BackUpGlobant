(function() {
  'use strict';

  // Angular's $resource-like $http wrapper
  angular.module('shopperTrak.resources')
    .factory('createResource', ['$http', '$q', '$cacheFactory', 'utils', 'ObjectUtils', function ($http, $q, $cacheFactory, utils, ObjectUtils) {
    function createResource(urlTemplate) {
      function Resource(value) {
        angular.copy(value || {}, this);
      }

      Resource.query = function(params, callback, queryParams, isCached) {
        var cached = !_.isUndefined(isCached) ? isCached : true;
        if (typeof(params) === 'undefined') {
          params = {};
        }
        var value = this instanceof Resource ? this : [];
        var deferred = $q.defer();
        value.$promise = deferred.promise;
        var url = utils.getUrlFromTemplate(params, urlTemplate, queryParams);
        $http.get(url, {
          cache: cached
        }).then(function(response) {
          value.length = 0;
          if (_.has(response.data, 'result')){
            _.each(response.data.result, function(item) {
              value.push(new Resource(item));
            });
          }
          else{
            _.each(response.data, function(item) {
              value.push(new Resource(item));
            });
          }

          deferred.resolve(value);
          if (!ObjectUtils.isNullOrUndefined(callback) && _.isFunction(callback)) {
            callback(value);
          }
        }, function() {
          deferred.reject();
        });
        return value;
      };

      Resource.get = function(params, queryParams) {
        var value = this instanceof Resource ? this : new Resource();
        var deferred = $q.defer();
        value.$promise = deferred.promise;
        $http.get(utils.getUrlFromTemplate(params, urlTemplate, queryParams), {
          cache: true
        }).then(function(response) {
          if (
            response.data &&
            response.data.result &&
            response.data.result[0]
          ) {
            angular.copy(response.data.result[0], value);
            deferred.resolve(value);
          }
        }, function() {
          deferred.reject();
        });
        return value;
      };

      Resource.search = function (params, queryParam) {
        var deferred = $q.defer();
        $http.get(utils.getUrlFromTemplate(params, urlTemplate), {
          params: queryParam
        }).then(function (response) {
          if (
            response.data &&
            response.data.result
          ) {
            deferred.resolve(response.data.result);
          }
          else if (response.data) {
            deferred.resolve(response.data);
          }
        }, function () {
          deferred.reject();
        });
        return deferred.promise;
      };

   Resource.clearCache = function(params) {
      var $httpDefaultCache = $cacheFactory.get('$http');

      var url = utils.getUrlFromTemplate(params, urlTemplate)

      $httpDefaultCache.remove(url);
   }

    return Resource;
}
return createResource;
  }]);
})();