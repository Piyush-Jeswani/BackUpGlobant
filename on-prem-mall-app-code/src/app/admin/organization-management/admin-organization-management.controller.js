(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminOrgsListController', AdminOrgsListController);

  AdminOrgsListController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    'ObjectUtils',
    'currentUser',
    'currentOrganization',
    'adminOrganizationsData'
  ];

  function AdminOrgsListController($scope, $state, $stateParams, $timeout, ObjectUtils, currentUser, currentOrganization, adminOrganizationsData) {

    var vm = this;

    $scope.$on('$stateChangeSuccess', function (event, toState) {
      var name = toState.name;
      if (name.indexOf('admin.organizations.edit.') === 0) {
        $scope.isSitesActive = name.indexOf('admin.organizations.edit.sites') === 0;
        $scope.isUsersActive = name.indexOf('admin.organizations.edit.users') === 0;
      } else {
        $scope.isSitesActive = true;
        $scope.isUsersActive = true;
      }
    });

    vm.loading = false;
    vm.orgsearch = '';
    vm.sortBy = 'name';
    vm.organizations = [];
    vm.isReversed = {
      'name': false,
      'type': false
    };

    vm.refreshOrganization = refreshOrganization;
    vm.removeOrganization = removeOrganization;
    vm.editOrganization = editOrganization;
    vm.sortOrganizationData = sortOrganizationData;
    vm.addOrganization = addOrganization;
    vm.deleteOrgConfirmation = deleteOrgConfirmation;
    vm.refresh = refresh;
    vm.isSuperUser = isSuperUser();

    activate();
    function activate() {

      loadOrganizations();
    }

    function isSuperUser(){
      return currentUser.superuser;
    }
  

    // todo : maybe sortOrganizationData should return instead of
    //        overwriting?
    function sortOrganizationData(sortByType, shouldReverse) {
      if (!ObjectUtils.isNullOrUndefined(shouldReverse)) {
        vm.isReversed[sortByType] = shouldReverse;
      } else {
        vm.isReversed[sortByType] = !vm.isReversed[sortByType];
      }

      if (vm.isReversed[sortByType]) {
        vm.organizations = _.sortBy(vm.organizations, sortByType).reverse();
      } else {
        vm.organizations = _.sortBy(vm.organizations, sortByType);
      }
    }

    function loadOrganizations() {
      vm.loading = true;

      adminOrganizationsData.fetchOrganizations(false).then(orgs => {
        vm.loading = false;
        vm.organizations = filterOrganisationsBasedOfUserType(orgs);
        sortOrganizationData('name', false);
      }).catch(error => {
        console.error(error);
        vm.error = true;
        vm.errorMessage = error;
        vm.loading = false;
      });
    }

    function filterOrganisationsBasedOfUserType(orgs) {

        if (currentUser.superuser) return orgs;

        //Check to see if this user has any enteries in their set up for Org Admin.
        if (currentUser.accessMap.setup.orgs_admin.length > 0) {

            var tmpOrgList = [];
            var orgArray = currentUser.accessMap.setup.orgs_admin;

            _.each(orgs, function(anOrg) {
             if (_.contains(orgArray, anOrg.id)) {
               tmpOrgList.push(anOrg);
             }
            });

            return tmpOrgList;

        } else return orgs = {};
    }

    function refresh() {
      // Clear out the old organizations
      vm.organizations = null;

      // Load them back in.
      loadOrganizations();
    }

    function refreshOrganization(orgId) {
      vm.loading = true;
      var callback = {
        success: function (orgs) {
          vm.error = false;
          vm.errorMessage = '';

          vm.loading = false;
          vm.organizations = orgs;
          sortOrganizationData(vm.sortBy, false);
        },
        failed: function (result) {
          vm.loading = false;
          vm.error = true;
          vm.errorMessage = result.data.message;

          $timeout(function () {
            vm.error = false;
            vm.errorMessage = '';
          }, 5000);
        }
      };
      adminOrganizationsData.refreshOrganization(orgId, callback);
    }

    function removeOrganization(orgId, orgIndex) {
      vm.loading = true;

      var callback = {
        success: function () {
          vm.loading = false;
          vm.organizations.splice(orgIndex, 1);
          vm.success = true;
          vm.successMessage = '.DELETESUCCESSFUL';

          $timeout(function () {
            vm.success = undefined;
            vm.successMessage = '';
          }, 5000);

          $('#confirmation-modal').modal('toggle');
        },
        failed: function (error) {
          vm.loading = false;
          vm.error = true;
          vm.errorMessage = error.status + ' - ' + error.data.message;

          $timeout(function () {
            vm.error = false;
            vm.errorMessage = '';
          }, 5000);

          $('#confirmation-modal').modal('toggle');
        }
      };

      adminOrganizationsData.removeOrganization(orgId, callback);
    }

    function editOrganization(orgId) {
      $state.go('admin.organizations.edit', {
        orgId: orgId
      });
    }

    function addOrganization() {
      $state.go('admin.organizations.add');
    }

    function deleteOrgConfirmation(organization, orgIndex) {
      vm.orgSelectedName = organization.name;
      vm.orgSelectedId = organization.id;
      vm.orgSelectedIndex = orgIndex;

      $('#confirmation-modal').modal({
        show: true,
        focus: true
      });
    }
  }
    
})();
