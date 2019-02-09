(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('SiteSearch', ['createResource', 'apiUrl', function (createResource, apiUrl) {
    return createResource(apiUrl + '/organizations/:orgId/sites/');
  }]);  
})();
