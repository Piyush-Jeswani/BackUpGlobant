(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminUserManagementController', AdminUserManagementController);

  AdminUserManagementController.$inject = [
    '$scope',
    '$state',
    'ObjectUtils',
    'adminUsersData',
    'currentUser',
  ];

  // TODO : check if we already have the user data so we don't have to load on every
  // transition

  function AdminUserManagementController($scope, $state, ObjectUtils, adminUsersData, currentUser) {
    var vm = this;

    activate();

    function activate() {
      vm.currentUser = currentUser;

      vm.addUser = addUser;
      vm.editUser = editUser;
      vm.deleteUser = deleteUser;
      vm.changeSort = changeSort;
      vm.selectUser = selectUser;
      vm.selectAllUsers = selectAllUsers;
      vm.bulkActionApply = bulkActionApply;
      vm.deleteUserConfirmation = deleteUserConfirmation;
      vm.shouldShowClearButton = shouldShowClearButton;
      vm.clearSelectedUsers = clearSelectedUsers;
      vm.accessCount = accessCount;
      vm.getRole = getRole;
      vm.getLastLogin = getLastLogin;
      vm.dateFormat = currentUser.localization.mask || 'DD/MM/YY';

      vm.sortBy = 'fullname';
      vm.sortReverse = false;

      vm.selectedUsers = {};
      vm.allUsersSelected = false;
      vm.showClearButton = false;

      vm.bulkActions = [
        'Delete'
      ];


      initialize();
    }

    function initialize() {
      vm.loading = true;

      var callback = {
        success: function(data) {
          vm.loading = false;
          vm.users = data;
        },
        failed: function(error) {
          vm.errorMessage = error.data.message;
          vm.loading = false;
        }
      };

      adminUsersData.getUsers(callback);
    }

    function addUser() {
      $state.go('admin.usermanagement.add');
    }

    function editUser(user) {
      $state.go('admin.usermanagement.edit', { username: user.username, user: user });
    }

    function accessCount(_user) {
      var orgs = ( ( (_user.accessMap || {}).setup || {} ).organizations || {} ).length || 0;
      var tags = ( ( (_user.accessMap || {}).setup || {} ).tags || {} ).length || 0;
      var sites = ( ( (_user.accessMap || {}).setup || {} ).sites || {} ).length || 0;
      return orgs + ' | ' + tags + ' | ' + sites;
    }

    function getRole(_user) {
      var role = 'n/\a';
      var isSuperUser = _user.superuser || false;
      var orgs_admin_count = ( ( (_user.accessMap || {}).setup || {} ).orgs_admin || {} ).length || 0;

      if(isSuperUser === true && orgs_admin_count === 0) {
        //assume that user is STAdmin
        role = 'ST Admin';
      } else
      if(isSuperUser === true && orgs_admin_count > 0) {
        //asume that user can only administer selected orgs in orgs_admin
        role = 'Org Admin';
      }

      return role;
    }


    function getLastLogin(_user) {
      var lastLogin = _user.last_login;
      if(_.isUndefined(lastLogin)) {
        return 'n/a';
      }

      return moment(lastLogin).format(vm.dateFormat);
    }

    function deleteUser(userToDelete) {
      if(!ObjectUtils.isNullOrUndefinedOrEmptyObject(userToDelete)) {
        var callback = {
          success: function() {
            var index = vm.users.findIndex(function(user) {
              return user._id === userToDelete._id;
            });

            vm.users.splice(index, 1);
            $('#confirmation-modal').modal('toggle');
          }, failed: function(error) {
            $('#confirmation-modal').modal('toggle');
            throw new Error(error.data.message);
          }
        };

        adminUsersData.deleteUser(userToDelete._id, callback);
      }
    }

    function changeSort(type) {
      if(type === vm.sortBy) {
        vm.sortReverse = !vm.sortReverse;
      } else {
        vm.sortReverse = false;
        vm.sortBy = type;
      }
    }

    function selectUser() {
      if(vm.allUsersSelected) {
        clearSelectedUsers();
      }
    }

    function selectAllUsers() {
      vm.selectedUsers = {};

      if(!vm.allUsersSelected) {
        var ids = _.pluck(vm.users, '_id');

        _.each(ids, function(id) {
          vm.selectedUsers[id] = true;
        });

        vm.showClearButton = true;
      } else {
        vm.showClearButton = false;
      }
    }

    function clearSelectedUsers() {
      vm.selectedUsers = {};
      vm.allUsersSelected = false;
      vm.showClearButton = false;
    }

    function actionValid(action) {
      return action === 'Delete';
    }

    function shouldShowClearButton() {
      var selectedUsers = _.omit(vm.selectedUsers, function(value) {
        return !value;
      });

      if(!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedUsers)) {
        vm.showClearButton = true;
      } else {
        vm.showClearButton = false;
      }
    }

    function bulkActionApply() {
      vm.valid = actionValid(vm.actionSelected);
      vm.usernamesSelected = [];
      vm.userIds = [];

      if(vm.valid) {
        if(vm.allUsersSelected) {
          vm.usernamesSelected = vm.users;
        } else {
          var selectedUsers = _.omit(vm.selectedUsers, function(value) {
            return !value;
          });

          if(!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedUsers)) {
            vm.userIds = _.keys(selectedUsers);
            vm.usernamesSelected = _.filter(vm.users, function(user) {
              return _.indexOf(vm.userIds, user._id) >= 0;
            });
          }
        }
      }

      $('#bulkActionModal').modal({
        show: true,
        focus: true
      });
    }

    function deleteUserConfirmation(user) {
      vm.userSelected = user;

      $('#confirmation-modal').modal({
        show: true,
        focus: true
      });
    }
  }
})();
