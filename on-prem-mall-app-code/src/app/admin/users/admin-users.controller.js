(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminUsersController', AdminUsersController);

  AdminUsersController.$inject = [
    '$scope',
    '$state',
    'ObjectUtils',
    'adminUsersData',
    'currentUser',
    'currentOrganization'
  ];

  function AdminUsersController($scope, $state,ObjectUtils, adminUsersData, currentUser, currentOrganization) {
    var vm = this;

    activate();

    function activate() {
      vm.currentUser = currentUser;
      vm.currentOrganization = currentOrganization;
    }

    function addUser() {
      $state.go('admin.organizations.edit.users.add');
    }

    function editUser(user) {
      $state.go('admin.organizations.edit.users.edit', {
        username: user.username,
        user: user
      });
    }

    function deleteUserConfirmation(user) {
      vm.userSelected = user.username;
      vm.userSelectedId = user._id;

      $('#confirmation-modal').modal({
        show: true,
        focus: true
      });
    }

    function deleteOrgUser(userId) {
      var callback = {
        success: function () {
          $('#confirmation-modal').modal('toggle');
          $state.reload('admin.organizations.edit', {
            orgId: $state.params.orgId
          });
        },
        failed: function (error) {
          $('#confirmation-modal').modal('toggle');
          throw new Error(error.data.message);
        }
      };

      adminUsersData.deleteOrgUser($state.params.orgId, userId, callback);
    }

    vm.deleteUserConfirmation = deleteUserConfirmation;
    vm.deleteOrgUser = deleteOrgUser;
    vm.addUser = addUser;
    vm.editUser = editUser;

  }
})();
