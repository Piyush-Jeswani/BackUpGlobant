(function() {
  'use strict';

  var isReversed = {
    'name': true,
    'created': true
  };

  function toggleReversed(property) {
    isReversed[property] = !isReversed[property];
    return isReversed[property];
  }

  function sortSitesData(data, property) {
    var reversed = toggleReversed(property);

    return reversed ? _.sortBy(data, property).reverse() : _.sortBy(data, property);
  }

  angular.module('shopperTrak')
    .controller('AdminSitesTableController', AdminSitesTableController);

  AdminSitesTableController.$inject = [
    '$state',
    'adminSitesData'
  ];

  function AdminSitesTableController($state, adminSitesData) {

    var that = this;
    var orgId = $state.params.orgId;
    this.sites = [];
    this.sitesearch = '';

    that.error = false;
    that.errorMessage = '';

    this.sortByName = function () {
      that.sites = sortSitesData(that.sites, 'name');
    };

    this.sortByDate = function () {
      that.sites = sortSitesData(that.sites, 'created');
    };

    this.refresh = function() {
      this.load();
    }

    this.load = function() {

      var callback = {
        success: function(sites) {
          that.sites = _.sortBy(sites, 'name');
        },
        failed: function(result) {
          that.error = true;
          that.errorMessage = result.statusText;
        }
      };

      adminSitesData.fetchSites(orgId, callback);
    }

    this.load();
  }
})();
