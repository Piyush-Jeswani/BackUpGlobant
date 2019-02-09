(function() {
  'use strict';

  angular.module('shopperTrak.routing')
    .factory('getOrganization', getOrganizationFactory);

  getOrganizationFactory.$inject = [
    'OrganizationResource',
    '$q'
  ];

  function getOrganizationFactory(
    OrganizationResource,
    $q
  ) {
    return getCurrentOrganization;

    function getCurrentOrganization(orgId) {
      var def = $q.defer();
      var organization = OrganizationResource.get({
        orgId: orgId
      }).$promise;
      organization.then(function(result) {
        def.resolve(result);
      });
      return def.promise;
    }

  }
})();
