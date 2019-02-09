(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('EntranceResource', ['$http', '$q', 'utils', 'apiUrl', 'ZoneHelperService', 'ZoneResource', 'ObjectUtils', function ($http, $q, utils, apiUrl, ZoneHelperService, ZoneResource, ObjectUtils) {
    function EntranceResource() {

      function Resource(value) {
        angular.copy(value || {}, this);
      }

      Resource.get = function(params) {
        var value = this instanceof Resource ? this : new Resource();
        var deferred = $q.defer();
        value.$promise = deferred.promise;


        var zoneResource = new ZoneResource();

        zoneResource.get({orgId: params.orgId, siteId: params.siteId, zoneId: params.zoneId}).$promise.then(function (response) {
          var entrance = getEntrance(params.entranceId, response.tmps);

          if (ObjectUtils.isNullOrUndefined(entrance)) {
            deferred.reject('invalid entrance');
          }

          deferred.resolve(entrance);
        }, function (e) {
          console.log('e', e);
          deferred.reject(e);
        });

        return value;
      };

      function getEntrance(entranceId, entrances) {
        return _.find(entrances, {id: entranceId});
      }

      return Resource;
    }

    return EntranceResource;
  }]);
})();
