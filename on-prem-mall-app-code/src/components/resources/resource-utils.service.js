(function() {
  'use strict';

  angular.module('shopperTrak.resources').factory('resourceUtils', ['$q', 'OrganizationResource', 'SiteResource', 'LocationResource', function($q, OrganizationResource, SiteResource, LocationResource) {
    function getAllSitesFromOrganizations(organizations) {
      var deferred = $q.defer();
      var allSites = [];
      var fetchedCount = 0;
      angular.forEach(organizations, function(organization) {
        var sites = SiteResource.query({ 'orgId': organization.organization_id });
        sites.$promise.then(function(sites) {
          allSites = allSites.concat(sites);
          fetchedCount++;
          if (fetchedCount === organizations.length) {
            deferred.resolve(allSites);
          }
        });
      });
      return deferred.promise;
    }

    function getAllLocationsFromSites(sites) {
      var deferred = $q.defer();
      var allLocations = [];
      var fetchedCount = 0;
      angular.forEach(sites, function(site) {
        var locations = LocationResource.query({ 'orgId': site.organization.id, 'siteId': site.site_id });
        locations.$promise.then(function(locations) {
          allLocations = allLocations.concat(locations);
          fetchedCount++;
          if (fetchedCount === sites.length) {
            deferred.resolve(allLocations);
          }
        });
      });
      return deferred.promise;
    }

    function getAllSites() {
      return OrganizationResource.query().$promise.then(getAllSitesFromOrganizations);
    }

    function getAllLocations() {
      return getAllSites().then(getAllLocationsFromSites);
    }

    function locationHasGeometry(location) {
      return !!location.geometry &&
             !!location.geometry.coordinates &&
             location.geometry.coordinates.length > 0;
    }

    return {
      getAllSites: getAllSites,
      getAllLocations: getAllLocations,
      locationHasGeometry: locationHasGeometry
    };
  }]);
})();
