(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminTabsController', AdminTabsController);

  AdminTabsController.$inject = [
    '$stateParams',
    'currentUser'
  ];

  function AdminTabsController($stateParams, currentUser) {
    var vm = this;

    activate();

    function activate() {
      vm.superuser = false;
      vm.orgadmin = false;

      if (currentUser.superuser) {
        vm.superuser = currentUser.superuser;
        vm.orgadmin = false;
      } else {
        vm.superuser = false;

        //Check the accessMap to see if the current org is in the users access Map.
        if (currentUser.accessMap.setup.orgs_admin.indexOf($stateParams.orgId) !== -1) {
          vm.orgadmin = true;
        }
      }
    }

  }
})();
