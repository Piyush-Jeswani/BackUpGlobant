(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('AdminUserEditController', AdminUserEditController);

  AdminUserEditController.$inject = [
    '$scope',
    '$state',
    '$timeout',
    '$anchorScroll',
    'ObjectUtils',
    'adminUsersData',
    'currentUser',
    'userData',
    'adminOrganizationsData',
    'SubscriptionsService'
  ];

  function AdminUserEditController(
    $scope,
    $state,
    $timeout,
    $anchorScroll,
    ObjectUtils,
    adminUsersData,
    currentUser,
    userData,
    adminOrganizationsData,
    SubscriptionsService) {

    var vm = this;

    vm.toggleFullAccess = toggleFullAccess;
    vm.toggleMIAccess = toggleMIAccess;
    vm.includeOrgIndex = includeOrgIndex;
    vm.toggleAdminAccess = toggleAdminAccess;

    vm.orgId = $state.params.orgId;

    vm.action = 'add';
    vm.submitErrors = false;
    vm.user = {};

    vm.success = false;
    vm.error = false;
    vm.loading = false;
    vm.errorMessage = '';
    vm.confirmPassword = '';
    vm.watchHandle = null;

    vm.passwordsDoNotMatch = false;
    vm.minLengthError = false;
    vm.accessErrors = false;
    vm.orgAdmin = false;
    vm.accessTypeFull = true; // By default we turn this on.
    vm.MIaccessType = false;
    vm.includeOrg = false;
    vm.hideincludeOrg = false;

    vm.userCallback = {
      success: saveSuccessful,
      failed: saveFailed
    };
    vm.userDetailsCallback = {
      success: autoPopulateAllFields,
      failed: autoPopulateFailed
    };

    vm.save = save;
    vm.cancel = cancel;
    vm.user = userData;
    vm.getUserDetails = getUserDetails;
    if($state.current.name === 'admin.organizations.edit.users.add') {
      vm.disable = true;
    }
    

    activate();

    function shouldNotDisplayUserAccess() {
      return !isOrgContext() ||
        vm.action === 'add';
    }

    function shouldDisplaySuperuserToggle() {
      return !ObjectUtils.isNullOrUndefined($state.params.username) &&
        $state.params.username !== currentUser.username &&
        !isOrgContext()
    }

    function fetchOrganization() {
      if (vm.orgId) {
        adminOrganizationsData.getOrganization(vm.orgId).then(function (data) {
          vm.organization = data;
          setMiFlags(vm.organization);
        });
      }
    }

  /**
   * Sets the UI flags for market intelligence
   *
   * @param {object} organization - The organization to check
   */
    function setMiFlags(organization) {
      vm.orgHasMI = SubscriptionsService.hasMarketIntelligence(organization);

      if(vm.orgHasMI === false) {
        return;
      }

      vm.showIncludeOrgIndex = !SubscriptionsService.onlyMiSubscription(organization);
    }

    function setUserAccessToggle(user) {
      //Does this user have organization access set up for this org - if so turn on the switch
      if (user && vm.action === 'edit') {
        (vm.user.accessMap.actual.organizations && vm.user.accessMap.actual.organizations.indexOf($state.params.orgId) !== -1) ? vm.accessTypeFull = true : vm.accessTypeFull = false;
        toggleOrgAccess();

        if (vm.user.accessMap.setup.orgs_admin && vm.user.accessMap.setup.orgs_admin.indexOf($state.params.orgId) !== -1) { //Have we been set up as an OrgAdmin?
          vm.orgAdmin = true;
          toggleAdminAccess();
        }
      }
    }

    function save() {
      vm.passwordsDoNotMatch = false;
      vm.minLengthError = false;
      vm.submitErrors = false;
      vm.accessErrors = false;

      if (!vm.user) {
        vm.passwordsDoNotMatch = true;
        vm.minLengthError = true;
        vm.submitErrors = true;
        return;
      } //early out

      var passwordIsSet = !ObjectUtils.isNullOrUndefined(vm.user.password) && vm.user.password !== '';
      var fullnameIsSet = !ObjectUtils.isNullOrUndefined(vm.user.fullname) && vm.user.fullname !== '';

      //We only perform the next check if we are NOT on the management screen.
      if ($state.current.name !== 'admin.usermanagement.edit') {
        //If partial access has been set - check we have at least on item in the tags selected list
        if (!vm.accessTypeFull && !vm.MIaccessType) {
          //Check the list of partial tags and make sure we have more than one.
          //Check to see if we have any sites assigned?
          if (!vm.user.accessMap.setup.sites ||
            vm.user.accessMap.setup.sites.length === 0 &&
            vm.user.accessMap.setup.tags.length === 0 &&
            vm.user.accessMap.setup.locations.length === 0) {
            vm.accessErrors = true;
            vm.success = false;
          }
        }
      }


      if (passwordIsSet && vm.user.password !== vm.confirmPassword) {
        vm.passwordsDoNotMatch = true;
      } else if ($scope.userForm.$error.minlength) {
        vm.minLengthError = true;
      } else if ($scope.userForm.$valid && vm.accessErrors === false) {
        vm.loading = true;

        if (vm.action === 'edit') {
          saveUser('edit');
        }
        /* directly calling saveOrgUser if trying to add already existing user.
          need not check for password and other fields sa-3479
        */
        else if($state.current.name === 'admin.organizations.edit.users.add'){
          saveOrgUser('add');
        }
        //execute below block when adding user from user management
        else {
          if (fullnameIsSet && !passwordIsSet) {
            saveFailed({
              data: {
                message: 'Password is required.'
              }
            });
          } else if (passwordIsSet && !vm.user.email) {
            saveFailed({
              data: {
                message: 'Email is required.'
              }
            });
          } else {
            if (fullnameIsSet && passwordIsSet) {
              saveUser('add');
            } else {
              if (ObjectUtils.isNullOrUndefined($state.params.orgId)) {
                saveFailed({
                  data: {
                    message: 'Please fill out all fields.'
                  }
                })
              } else {
                saveOrgUser('add');
              }
            }
          }
        }
      } else {
        vm.submitErrors = true;
      }

      //See if we have any errors - if we do scroll up and show the user.
      if (vm.passwordsDoNotMatch || vm.minLengthError || vm.submitErrors || vm.accessErrors) {
        $anchorScroll();
      }
    }

    function saveOrgUser(action) {
      var orgId = $state.params.orgId;

      adminUsersData.saveOrgUser(vm.user, orgId, action, vm.userCallback);
    }

  /** Determines if the edit user form is being used within the context of an organization.
   *  This is needed as this form can be used on a system wide level (super users) or at an org level.
   *
   *  @returns {boolean}
   **/
    function isOrgContext() {
      var regexFind = /admin.organizations/;
      return regexFind.test($state.current.name)
    }


  /** Saves a user.
   *  Determines which endpoint should be called based on the context of the page
   *  @param {('edit'|'add'} action the save action
   **/
    function saveUser(action) {
      if(isOrgContext()) {
        return saveOrgUser(action);
      }

      saveUserGlobal(action);
    }

  /** Updates or creates a new user when the creating user is a superuser.
   *  @param {('edit'|'add'} action the save action
   **/
    function saveUserGlobal(action) {
      if (action === 'edit') {
        return adminUsersData.saveUser(vm.user, action, vm.userCallback);
      }

      var callback = {
        success: function (result) {
          if (!ObjectUtils.isNullOrUndefined($state.params.orgId)) {
            saveOrgUser('add');
          } else {
            saveSuccessful(result);
          }
        },
        failed: saveFailed
      };
      adminUsersData.saveUser(vm.user, action, callback);
    }

    function cancel() {
      if (!ObjectUtils.isNullOrUndefined($state.params.siteId)) {
        $state.go('admin.organizations.edit.sites.edit', {
          siteId: $state.params.siteId
        });
      } else if (!ObjectUtils.isNullOrUndefined($state.params.orgId)) {
        $state.go('admin.organizations.edit', {
          orgId: $state.params.orgId
        });
      } else {
        $state.go('admin.usermanagement');
      }
    }

    function saveSuccessful(result) {
      vm.success = true;
      vm.loading = false;
      vm.error = false;

      //Check we got something sensible back.
      if (result && result.data.result[0])
      {
        var theUser = result.data.result[0];

        if (vm.action === 'add') {
          vm.action = 'edit';

          //Lets now redirect to edit.
          $state.go('admin.organizations.edit.users.edit', { username: theUser.username, user: theUser, status: 'saved' });
        }

      }
      $anchorScroll();
      $timeout(function () {
        vm.success = false;
      }, 5000);
    }

    function saveFailed(result) {
      if (result.data.message === 'User does not exist.') {
        saveUser();
      } else {
        vm.error = true;
        vm.loading = false;
        vm.errorMessage = result.data.message;
        $anchorScroll();
      }
    }

    function toggleOrgAccess() {

      // Give full access to the org
      if (vm.user.accessMap.setup.organizations.indexOf($state.params.orgId) === -1) {
        vm.user.accessMap.setup.organizations.push($state.params.orgId);
      } else {
        // Remove access from the org - Partial.
        var orgIdx = vm.user.accessMap.setup.organizations.indexOf($state.params.orgId);
        if (orgIdx !== -1) vm.user.accessMap.setup.organizations.splice(orgIdx, 1);
      }
    }

    function toggleAdminAccess() {
      if (vm.orgAdmin) {
        if(vm.user.accessMap){
        if(_.has(vm.user.accessMap.setup,'orgs_admin')){
          if (vm.user.accessMap.setup.orgs_admin.indexOf($state.params.orgId) === -1) {
            vm.user.accessMap.setup.orgs_admin.push($state.params.orgId);
          }
        }
      }
      } else {

        if(_.has(vm.user.accessMap.setup,'orgs_admin')){
          var orgAdminIdx = vm.user.accessMap.setup.orgs_admin.indexOf($state.params.orgId);
          if (orgAdminIdx !== -1) vm.user.accessMap.setup.orgs_admin.splice(orgAdminIdx, 1);
        }
      }
    }

    function toggleFullAccess() {
      //If we are toggling full access off AND Admin is True - we need to turn Admin off also.
      if (!vm.accessTypeFull && vm.orgAdmin) {
        vm.orgAdmin = false;
        toggleAdminAccess();
      }

      toggleOrgAccess();
    }

    function toggleMIAccess() {
      if ($state.current.name === 'admin.organizations.edit.users.add') {
        if (vm.MIaccessType) {
          vm.user.miAccess = true;
          vm.user.miIndexFlag = false;
        } else {
          vm.user.miAccess = false;
        }
      } else if ($state.current.name === 'admin.organizations.edit.users.edit') {
        if (vm.MIaccessType) {
          if (!_.has(vm.user.accessMap.setup, 'mi_orgs')) {
            vm.user.accessMap.setup.mi_orgs = [];
            vm.user.accessMap.setup.mi_orgs.push($state.params.orgId);
          } else {
            if (vm.user.accessMap.setup.mi_orgs.indexOf($state.params.orgId) === -1) {
              vm.user.accessMap.setup.mi_orgs.push($state.params.orgId);
            }
          }
        } else {
          vm.includeOrg = false;
          var removeMIAccess = vm.user.accessMap.setup.mi_orgs.indexOf($state.params.orgId);
          if (removeMIAccess !== -1) vm.user.accessMap.setup.mi_orgs.splice(removeMIAccess, 1);
          if (_.has(vm.user, 'subscriptions')) {
            if (_.has(vm.user.subscriptions, 'mi_index')) {
              var excludeOrgIndex = vm.user.subscriptions.mi_index.indexOf($state.params.orgId);
              if (excludeOrgIndex !== -1) vm.user.subscriptions.mi_index.splice(excludeOrgIndex, 1);
            }
          }
        }
      }
    }

    function includeOrgIndex(includeOrg) {
      if ($state.current.name === 'admin.organizations.edit.users.add') {
        if (includeOrg) {
          vm.user.miIndexFlag = true;
        } else {
          vm.user.miIndexFlag = false;
        }
      } else if ($state.current.name === 'admin.organizations.edit.users.edit') {
        if (includeOrg) {
          if (!_.has(vm.user, 'subscriptions')) {
            vm.user.subscriptions = {mi_index: []};
            vm.user.subscriptions.mi_index.push($state.params.orgId);
          } else {
            if (vm.user.subscriptions.mi_index.indexOf($state.params.orgId) === -1) {
              vm.user.subscriptions.mi_index.push($state.params.orgId);
            }
          }
        } else {
          var excludeOrgIndex = vm.user.subscriptions.mi_index.indexOf($state.params.orgId);
          if (excludeOrgIndex !== -1) vm.user.subscriptions.mi_index.splice(excludeOrgIndex, 1);
        }
      }
    }

    function activate() {
      if (Object.keys(vm.user).length !== 0) {
        vm.action = 'edit';

        if($state.params.status === 'saved') {
          vm.success = true;
          $timeout(function () {
            vm.success = false;
          }, 5000);
        }

        //Set up Full Access/Partial Access.
        vm.user.accessMap.setup.organizations.indexOf($state.params.orgId) === -1 ? vm.accessTypeFull = false : vm.accessTypeFull = true;

        // Set up Admin?
        if (_.has(vm.user.accessMap.setup, 'orgs_admin')) {
            vm.user.accessMap.setup.orgs_admin.indexOf($state.params.orgId) === -1 ? vm.orgAdmin = false : vm.orgAdmin = true;
        }
        if (_.has(vm.user.accessMap.setup, 'mi_orgs')) {
          vm.user.accessMap.setup.mi_orgs.indexOf($state.params.orgId) === -1 ? vm.MIaccessType = false : vm.MIaccessType = true;
        }
        if (_.has(vm.user, 'subscriptions')) {
          if (_.has(vm.user.subscriptions, 'mi_index')) {
            vm.user.subscriptions.mi_index.indexOf($state.params.orgId) === -1 ? vm.includeOrg = false : vm.includeOrg = true;
          }
        }
        vm.user.accessMap.setup.orgs_admin.indexOf($state.params.orgId) === -1 ? vm.orgAdmin = false : vm.orgAdmin = true;

      } else {
        //We are adding a user so we give it a dummy template.
        vm.user = prepareUser();
        vm.accessTypeFull = true;
      }

      setUserAccessToggle(vm.user);

      vm.hideUserAccess = shouldNotDisplayUserAccess();
      vm.displaySuperuserToggle = shouldDisplaySuperuserToggle();

      fetchOrganization();
    }

    function getUserDetails(username){
      if($state.current.name === 'admin.organizations.edit.users.add'){
        vm.loading = true;
        adminUsersData.getUserDetailsByUserName(username, vm.userDetailsCallback);
      }
      else{
        return;
      }
    }
    function autoPopulateAllFields(result){
      if(!ObjectUtils.isNullOrUndefinedOrEmpty(result)){
        vm.loading = false;
        vm.error = false;
        // updating only the field values so that the organization details get retained
        vm.user.username = result[0].username;
        vm.user.fullname = result[0].fullname;
        vm.user.email = result[0].email;
        vm.user.title = result[0].title;

        vm.disable = false;
      }
      // api is returning empty array if user does not exist. hence error handling here
      else{
        vm.error = true;
        vm.loading = false;
        vm.errorMessage = ' User does not exist. Please enter a valid username or create a new user.';
        vm.disable = false;
        $anchorScroll();
      }
    }
    function autoPopulateFailed(error){
      vm.error = true;
      vm.errorMessage = error.data.message;
      vm.loading = false;
      $anchorScroll();
    }
    function prepareUser(theUser) {

      //Do we have a new user?
      if (!theUser) {
        //Add the tags
        theUser =  {
          username: '',
          fullname: '',
          email: '',
          title: '',
          accessMap: {
            setup: {
              tags: [],
              organizations: [$state.params.orgId], //As we add a user we given them full access to the org so do that now.
              sites: [],
              locations: [],
              orgs_admin: [],
              mi_orgs: [],
              belongs_to: []
            },
            actual: {
              organizations: [],
              sites: [],
              locations: []
            },
            partial: {
              organizations: [],
              sites: []
            }
          },
          superuser: false
        }
      };

      return theUser;

    }
  }
})();

