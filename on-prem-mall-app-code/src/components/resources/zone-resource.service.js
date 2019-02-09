(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('ZoneResource', ['$http', '$q', 'utils', 'apiUrl', 'ZoneHelperService', function ($http, $q, utils, apiUrl, ZoneHelperService) {
    function ZoneResource() {

      function Resource(value) {
        angular.copy(value || {}, this);
      }

      Resource.query = function(params, callback) {
        if (typeof(params) === 'undefined') {
          params = {};
        }
        var value = this instanceof Resource ? this : [];
        var deferred = $q.defer();
        value.$promise = deferred.promise;
        $http.get(utils.getUrlFromTemplate(params, apiUrl + '/organizations/:orgId/sites/:siteId'), {
          cache: true
        }).then(function(response) {
          value.length = 0;
          angular.forEach(response.data.result[0].zones, function(item) {
            item.depth = 1;
            item.zone_type = 'zone';
            item.parent_item = null;
            value.push(new Resource(item));
          });
          deferred.resolve(value);
          if (typeof callback !== 'undefined') {
            callback(value);
          }
        }, function() {
          deferred.reject();
        });
        return value;
      };

      Resource.get = function(params) {
        var value = this instanceof Resource ? this : new Resource();
        var deferred = $q.defer();
        value.$promise = deferred.promise;
        $http.get(utils.getUrlFromTemplate(params, apiUrl + '/organizations/:orgId/sites/:siteId'), {
          cache: true
        }).then(function(response) {
          if (
            response.data &&
            response.data.result &&
            response.data.result[0]
          ) {

            var zoneData = null;

            if(params.zoneId) {

              angular.forEach(response.data.result[0].zones, function(z) {
                if(z.id === params.zoneId) {
                  zoneData = z;
                } else if(zoneData === null) {
                  zoneData = _.findWhere(z.tmps, { id: params.zoneId });
                }
              });

            } else {
              zoneData = _.extend({}, response.data.result[0].zones);
            }

            if(zoneData !== null) {
              angular.copy(zoneData, value);
            }

            value.name = ZoneHelperService.removeLeadingX(value.name);
            deferred.resolve(value);
          }
        }, function() {
          deferred.reject();
        });
        return value;
      };

      return Resource;
    }

    return ZoneResource;
  }]);
})();
