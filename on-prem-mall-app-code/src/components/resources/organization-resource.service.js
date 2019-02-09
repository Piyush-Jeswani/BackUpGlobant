(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('OrganizationResource', ['createResource', 'apiUrl', function (createResource, apiUrl) {
    return createResource(apiUrl + '/organizations/:orgId');
  }]);
})();
