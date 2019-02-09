(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminController', AdminController);

  AdminController.$inject = [
    '$scope',
    '$state'
  ];

  function AdminController($scope, $state) {
    redirect();

    $scope.$on('$stateChangeSuccess', function () {
      redirect();
    });

    function redirect() {
      if ($state.current.redirectTo) {
        $state.go($state.current.redirectTo);
      }
    }
  }
})();
