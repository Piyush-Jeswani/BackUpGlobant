(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('LocationResource', ['createResource', 'apiUrl', function (createResource, apiUrl) {
    return createResource(apiUrl + '/organizations/:orgId/sites/:siteId/locations/:locationId');
  }]);
})();
