(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AnalyticsController', AnalyticsController);

  AnalyticsController.$inject = [
    '$scope',
    '$state',
    'organizations'
  ];

  function AnalyticsController($scope, $state, organizations) {

    activate();

    function activate() {
      $scope.$on('$stateChangeSuccess', redirectIfNecessary);
    }

    function redirectIfNecessary() {
      if ($state.current.name !== 'analytics') {
        return;
      }

      if (organizations.length === 0) {
        throw new Error('No organizations available.');
      }
      $state.go('analytics.organization', {
        orgId: organizations[0].organization_id
      });
    }
  }
})();
