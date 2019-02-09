(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('adminRefresh', adminRefresh);

  function adminRefresh() {
    return {
      restrict: 'EA',
      templateUrl: 'app/admin/admin-refresh/admin-refresh.directive.html',
      scope: {
        status: '=',
        dateFormat: '='
      },
      bindToController: true,
      controller: AdminRefreshController,
      controllerAs: 'vm'
    };
  }

  AdminRefreshController.$inject = [
    '$scope'
  ];

  function AdminRefreshController($scope) {

    var vm = this;

    vm.refreshStatus = 'on-going';

    vm.refreshStatus = vm.status;

    $scope.$watch('vm.status', function () {
      if (vm.status.indexOf('refreshing') !== -1) {
        vm.refreshStatus = vm.status;
      } else {
        vm.refreshStatus = moment.utc(vm.status).format(vm.dateFormat);
      }
    });

  }

})();
