'use strict';

angular.module('shopperTrak').directive('adminUserAccess', function () {
  return {
    templateUrl: 'app/admin/user-access/admin-user-access.partial.html',
    scope: {
      user: '=',
      mode: '=',
      enabled: '=',
    },
    controller: AdminUserAccessController,
    controllerAs: 'vm',
    bindToController: true
  };
});

AdminUserAccessController.$inject = [
  '$scope',
  '$rootScope',
  '$state',
  'ObjectUtils',
  'adminSitesData',
  'adminOrganizationsData',
  'adminLocationsData',
  'adminUsersData'
];

function AdminUserAccessController($scope, $rootScope, $state, ObjectUtils, adminSitesData, adminOrganizationsData, adminLocationsData, adminUsersData) {
  var vm = this;

  activate();

  function activate() {

    vm.orgId = $state.params.orgId;
    vm.sites = [];
    vm.selectedLocations = {};
    vm.getAllData = {};
    vm.orderBy = 'name';
    vm.loading = true;
    vm.error = false;
    vm.fetchSites = fetchSites;

    vm.toggleSiteAccess = toggleSiteAccess; // access map toggling
    vm.toggleLocation = toggleLocation; // access map toggling

    if (vm.mode === 'edit') {
      fetchUserAccessDetails();
    }

    //Set up an event listener should the user change the users custom access so we can 
    //repopulate the table should we need to.
    $rootScope.$on('custom-tag-access-changed', function(){
      fetchOrganization();
    });

    fetchOrganization();

  }



  function fetchUserAccessDetails() {

    adminUsersData.getOrgUsers($state.params.orgId, function (data) {

      vm.user = adminUsersData.filterDataByUsername($state.params.username, data);

      if (vm.user.accessMap && vm.user.accessMap.actual.organizations.indexOf(vm.orgId) >= 0) {
        vm.orgAccess = true;
        vm.orgAdmin = vm.user.accessMap.setup.orgs_admin.indexOf(vm.orgId) >= 0;
      } else {
        vm.orgAccess = false;
        vm.orgAdmin = false;
      }
    });
  }

  function fetchOrganization() {
    adminOrganizationsData.getOrganization(vm.orgId).then(function (data) {
      vm.organization = data;
      fetchSites(vm.orgId);
    });
  }

  function fetchSites(orgId) {
    var callback = {
      success: function (sites) {
        vm.loading = false;
        fetchLocations(orgId, sites);
      },
      failed: function (result) {
        vm.loading = false;
        vm.error = true;
        vm.errorMessage = result.statusText;
      }
    };

    adminSitesData.fetchSites(orgId, callback);
  }

  function fetchLocations(orgId, sites) {
    if (vm.organization.subscriptions.interior) {
      var callback = {
        success: function (locations) {
          vm.loading = false;
          buildUsersSites(sites, locations);
        },
        failed: function (result) {
          vm.loading = false;
          vm.error = true;
          vm.errorMessage = result.statusText;
        }
      };

      adminLocationsData.getAllLocations(orgId, callback);
    } else {
      buildUsersSites(sites);
    }
  }

  function toggleSiteAccess(siteId) {
    if (vm.getAllData[siteId]) {
      // reset all selected locations because we do not need it if we get all data for that site
      vm.selectedLocations[siteId] = [];

      //Remove any locations that belong to this site.
      _.each(vm.sites, function (site) {
        if (site.id === siteId) {
          //This is the site we are interested in.
          //Loop through the locations for this site - if it matches with accessMap.setup.locations. then remove from locations.
          //Where we match - remove 
          _.each(site.locations, function (location) {
            var removalIndex = vm.user.accessMap.setup.locations.indexOf(location.id);
            if (removalIndex !== -1) {
              vm.user.accessMap.setup.locations.splice(removalIndex,1);
            }
          });
        }
      }, siteId);

      if (vm.user.accessMap.setup.sites.indexOf(siteId) === -1) {
        vm.user.accessMap.setup.sites.push(siteId); // give full access to the site
      }
    } else {
      // Remove access from the site
      var siteIdx = vm.user.accessMap.setup.sites.indexOf(siteId);
      if (siteIdx !== -1) vm.user.accessMap.setup.sites.splice(siteIdx, 1);
    }
  }

  function toggleLocation(siteId) {
    if (vm.getAllData[siteId]) {
      vm.getAllData[siteId] = false;
      //Remove from accessMap....
      var removalIndex = vm.user.accessMap.setup.sites.indexOf(siteId);
      if (removalIndex !== -1) {
        vm.user.accessMap.setup.sites.splice(removalIndex,1);
      }
    }

    if (vm.selectedLocations[siteId].length > 0) {
      //Rather than working out what locations we have and don't have.
      //Kill the existing locations for this site and copy the current
      //set of locations into the array.

      //1. Get rid of the known locations for this site.
      _.each(vm.locations[siteId], function(location){
         var locIdx = vm.user.accessMap.setup.locations.indexOf(location.id);
         if (locIdx !== -1) {
           //Remove from the acces map.
           vm.user.accessMap.setup.locations.splice(locIdx,1);
         }
      });

      //2. Add the seleted list of locations back into the accessMap.
      _.each(vm.selectedLocations[siteId], function (locationId) {
          vm.user.accessMap.setup.locations.push(locationId); // give full access to the loation
      });
    } else {
      // Remove full access from the site
      var siteIdx = vm.user.accessMap.setup.sites.indexOf(siteId);
      if (siteIdx !== -1) vm.user.accessMap.setup.sites.splice(siteIdx, 1);

      var site = _.find(vm.sites, function (aSite) {
        return aSite.id === siteId
      });

      if (!ObjectUtils.isNullOrUndefined(site) && site.locations) {
        _.each(site.locations, function (loc) {
          var locIdx = vm.user.accessMap.setup.locations.indexOf(loc.id);
          if (locIdx !== -1) vm.user.accessMap.setup.locations.splice(locIdx, 1);
        });
      }
    }
  }

  //Helper function to return a list of site id's that this user has access to using custom tags.
  //If it returns an empty array - then we have no tag accesss.
  function markSitesWithTagAccess(userAccessMap, sites) {
  
      //Create a list of actual sites that the user has access to.
      //Iterate this list and match up which of these sites the user has tag access to.
      if (typeof userAccessMap.actual.sites === 'undefined' || userAccessMap.actual.sites.length === 0) return;
      
      //early out if we have no tags or sites
      if ((userAccessMap.setup.tags !== null && userAccessMap.setup.tags.length === 0) || 
         (sites !== null && sites.length === 0)) return;

      //From all of the sites we have - get the subset that the user has access to (reduce processing)
      //Use the access map to get the subset of sites we need to worry about for tag access.
      _.each(sites, function(aSite) {
        if (aSite.custom_tags.length > 0) {

          var aMatch = _.intersection(userAccessMap.setup.tags, aSite.custom_tags);

          if (aMatch.length > 0) {
            aSite.taggedSiteAccess = true;
          }
        }
      });
  }

  function buildUsersSites(sites, locations) {
   
    vm.sites = sites;
    vm.locations = locations;   

    markSitesWithTagAccess(vm.user.accessMap,vm.sites);

    _.each(vm.sites, function (site) {
      
       site.siteAccess = false;
       vm.selectedLocations[site.id] = [];

      if (vm.user.accessMap.setup.sites.indexOf(site.id) >= 0) {
        site.siteAccess = true;
        vm.selectedLocations[site.id] = []; // locations of this site the user has access to
        vm.getAllData[site.id] = true; // full access to site => access to all locations
      } else if (!ObjectUtils.isNullOrUndefined(locations) &&
        !ObjectUtils.isNullOrUndefined(locations[site.id])) {
          var siteLocations = locations[site.id];
        _.each(siteLocations, function (location) {
          if (vm.user.accessMap.setup.locations.indexOf(location.id) >= 0) {
            vm.selectedLocations[site.id].push(location.id);
            if (!vm.user.accessMap.setup.locations) vm.user.accessMap.setup.locations = []; //Set up the locations
          }
        });
      } else {
        vm.selectedLocations[site.id] = [];
        vm.getAllData[site.id] = false;
      }

      if (!ObjectUtils.isNullOrUndefined(locations) && !ObjectUtils.isNullOrUndefined(locations[site.id])) {
        site.locations = locations[site.id];
      } else {
        site.locations = [];
      }
    });
  }
  }


