(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('MarketingOrganizationController', MarketingOrganizationController);

  MarketingOrganizationController.$inject = [
    '$scope',
    '$state',
    'currentOrganization',
    'sites'
  ];

  function MarketingOrganizationController(
    $scope,
    $state,
    currentOrganization,
    sites
  ) {
    var vm = this;

    vm.sites = sites;

    activate();

    function activate() {
      $scope.$on('$stateChangeSuccess', redirectIfNecessary);
    }

    function redirectIfNecessary() {
      if ($state.current.name !== 'marketing.organization') {
        return;
      }

      $state.go('marketing.organization.campaigns', {
        orgId: currentOrganization.organization_id,
        siteId: sites[0].site_id
      });

    }
  }
})();
