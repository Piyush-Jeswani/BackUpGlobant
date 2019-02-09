(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('userTable', UserTable);

  function UserTable() {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      templateUrl: 'app/admin/commons/user-table.partial.html',
      scope: {
        users: '=',
        currentUser: '=',
        searchFilter: '=',
        userSelected: '=',
        userIds: '=',
        selectedUsers: '=',
        shouldShowClearButton: '=',
        selectAllUsers: '=',
        allUsersSelected: '=',
        clearSelectedUsers: '=',
        deleteUserConfirmation: '=',
        editUser: '=',
        loading: '='
      },
      bindToController: true,
      controller: userTableController,
      controllerAs: 'vm'
    };
  }

  userTableController.$inject = [
    '$state',
    '$stateParams',
    'ObjectUtils',
    'LocalizationService'
  ];

  function userTableController($state,  $stateParams, ObjectUtils, LocalizationService) {
    var vm = this;

    activate();

    function activate() {
      LocalizationService.setUser( vm.currentUser);

      vm.getRole = getRole;
      vm.getLastLogin = getLastLogin;
      vm.dateFormat = LocalizationService.getCurrentDateFormat();
      vm.accessCount = accessCount;
      vm.changeSort = changeSort;
      vm.selectUser = selectUser;
      vm.sortBy = 'fullname';
      vm.sortReverse = false;
    }

    function accessCount(_user) {
      var orgs = ( ( (_user.accessMap || {}).setup || {} ).belongs_to || {} ).length || 0;
      var tags = ( ( (_user.accessMap || {}).setup || {} ).tags || {} ).length || 0;
      var sites = ( ( (_user.accessMap || {}).actual || {} ).sites || {} ).length || 0 + ( ( (_user.accessMap || {}).partial || {} ).sites || {} ).length || 0;
      return orgs + ' | ' + tags + ' | ' + sites;
    }

    function getRole(_user) {
      var role = '-';
      var isSuperUser = _user.superuser || false;

      if(isSuperUser === true) {
        //assume that user is STAdmin
        role = 'ST Admin';
      } else
      if(isSuperUser === false) {
        if (_user.accessMap.setup.orgs_admin.indexOf($stateParams.orgId) !== -1) {
          role = 'Org Admin';
        }
      }

      return role;
    }

    function getLastLogin(_user) {
      var lastLogin = _user.last_login;
      if(_.isUndefined(lastLogin)) {
        return '-';
      }

      return moment(lastLogin).format(vm.dateFormat + ', ' + 'h:mm a');
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
        vm.clearSelectedUsers();
      }
    }


  }

})();
