(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('MarketingController', MarketingController);

  MarketingController.$inject = [
    '$scope',
    '$state',
    'organizations',
  ];

  function MarketingController($scope, $state, organizations) {
    activate();

    function activate() {
      $scope.$on('$stateChangeSuccess', redirectIfNecessary);
    }

    function redirectIfNecessary() {
      if ($state.current.name !== 'marketing') {
        return;
      }

      $state.go('marketing.organization', {
        orgId: organizations[0].organization_id
      });
    }
  }
})();
