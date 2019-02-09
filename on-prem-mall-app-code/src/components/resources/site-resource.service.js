(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('SiteResource', ['createResource', 'apiUrl', function (createResource, apiUrl) {
    return createResource(apiUrl + '/organizations/:orgId/sites/:siteId');
  }]);  
})();
