

/**
 * report tabs
 *
 */
class reportTabsController {
  constructor($scope,
    $mdDialog,
    organizations,
    sites,
    currentUser,
    currentOrganization,
    currentSite
  ) {
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    this.organizations = organizations;
    this.sites = sites;
    this.currentUser = currentUser;
    this.currentOrganization = currentOrganization;
    this.currentSite = currentSite;
  };
}

angular
  .module('shopperTrak')
  .controller('reportTabsController', reportTabsController);

reportTabsController.$inject = [
  '$scope',
  '$mdDialog',
  'organizations',
  'sites',
  'currentUser',
  'currentOrganization',
  'currentSite'
];
