'use strict';

describe('AdminUserEditController', function () {
  var $scope,
    $controller,
    $state,
    $timeout,
    $anchorScroll = function(){},
    $q,
    ObjectUtils,
    adminUsersData,
    userData,
    SubscriptionsService;

  var adminOrganizationsData = {
    getOrganization: function (orgId) {
      angular.noop(orgId);

      var deferred = $q.defer();
      var organization = { organization_id: 10 };
      deferred.resolve(organization);
      return deferred.promise
    }
  };

  var userDataMock = {
    id: 1234,
    username: 'test_user_1',
    password: '1234567890',
    fullname: 'Mark Strange',
    accessMap: {
      setup:
      {
        organizations: [{
          'organization_id': 1000
        }, {
          'organization_id': 2000
        }],
        orgs_admin: '6789'
      },
      actual:
      {
        organizations: 'test'
      },
      mi_orgs: 'test'
    },
    subscriptions: {mi_index: 'test'}
  };
  var controller;
  var currentUserMock = {
    localization: { date_format: 'MM/DD/YYYY' }
  };

  var currentSite = {
    'site_id': 1000,
    'organization': {
      'id': 1000
    },
    'type': 'Mall'
  };

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _ObjectUtils_,_adminUsersData_,_$q_,_$timeout_,_SubscriptionsService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $state.params = { orgId: 1234, username: 'testUser' };
    ObjectUtils = _ObjectUtils_;
    $q = _$q_;
    $timeout = _$timeout_;
    SubscriptionsService = _SubscriptionsService_;
    adminUsersData = _adminUsersData_;

    // Prevent accidentally using the same controller
    // instance in multiple it-blocks.
    controller = null;
  }));

  beforeEach(function () {
    SubscriptionsService.hasMarketIntelligence = function (organization) {
      angular.noop(organization)

      return false;
    }
  });

  describe('Controller instantiation', function () {
    it('should call activate() successfully for $state.params.orgId set', function () {
      $state.params.orgId = '6789'

      instantiateController();

      $timeout.flush();
      $scope.$digest();

      expect(controller.orgAdmin).toBe(true);
      expect(controller.orgHasMI).toBe(false);
      expect(controller.orgId).toEqual($state.params.orgId);
      expect(controller.success).toEqual(false);
      expect(controller.error).toEqual(false);
      expect(controller.loading).toEqual(false);
      expect(controller.errorMessage).toEqual('');
      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.confirmPassword).toEqual('');
      expect(controller.watchHandle).toEqual(null);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessTypeFull).toEqual(false);
      expect(controller.MIaccessType).toEqual(false);
      expect(controller.includeOrg).toEqual(false);
      expect(controller.hideincludeOrg).toEqual(false);
    });
  });


  describe('toggleFullAccess()', function () {
    it('should call toggleFullAccess() successfully for org Admin with orgHasMI set to false', function () {
      instantiateController();

      $timeout.flush();
      $scope.$digest();

      controller.accessTypeFull = false;
      controller.orgAdmin = true;

      controller.toggleFullAccess();

      expect(controller.orgAdmin).toBe(false);
      expect(controller.orgHasMI).toBe(false);
    });
    it('should call toggleFullAccess() successfully for org Admin with orgHasMI set to true', function () {
      SubscriptionsService.hasMarketIntelligence = function (organization) {
        angular.noop(organization)
  
        return true;
      }

      instantiateController();

      $timeout.flush();
      $scope.$digest();

      controller.accessTypeFull = false;
      controller.orgAdmin = true;

      controller.toggleFullAccess();

      expect(controller.orgAdmin).toBe(false);
      expect(controller.orgHasMI).toBe(true);
    });
  });

  describe('toggleMIAccess()', function () {
    it('should call toggleMIAccess() successfully for $state.current.name set to admin.organizations.edit.users.add with true MI access type)', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.add'};
      controller.MIaccessType = true;

      controller.toggleMIAccess();

      expect(controller.user.miAccess).toEqual(true);
      expect(controller.user.miIndexFlag).toEqual(false);
    });
  });

  describe('toggleMIAccess()', function () {
    it('should call toggleMIAccess() successfully for $state.current.name set to admin.organizations.edit.users.add with false MI access type)', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.add'};
      controller.MIaccessType = false;

      controller.toggleMIAccess();

      expect(controller.user.miAccess).toEqual(false);
      expect(controller.user.miIndexFlag).toEqual(false);
    });
  });

  describe('toggleMIAccess()', function () {
    it('should call toggleMIAccess() successfully for $state.current.name set to admin.organizations.edit.users.edit with true MI access type)', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.edit'};
      controller.MIaccessType = true;

      controller.toggleMIAccess();

      expect(controller.user.accessMap.setup.mi_orgs[0]).toEqual(1234);
    });
  });

  describe('toggleMIAccess()', function () {
    it('should call toggleMIAccess() successfully for $state.current.name set to admin.organizations.edit.users.edit with false MI access type)', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.edit'};
      controller.MIaccessType = false;
      controller.toggleMIAccess();

      expect(controller.includeOrg).toBe(false);
      expect(controller.user.accessMap.setup.mi_orgs.indexOf($state.params.orgId)).toEqual(-1);
    });
  });

  describe('includeOrgIndex(includeOrg)', function () {
    it('should call includeOrgIndex(includeOrg) successfully for includeOrg set to true and $state.current.name set to admin.organizations.edit.users.add', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.add'};

      var includeOrg = true;
      controller.includeOrgIndex(includeOrg);

      expect(controller.user.miIndexFlag).toEqual(true);
    });
  });

  describe('includeOrgIndex(includeOrg)', function () {
    it('should call includeOrgIndex(includeOrg) successfully for includeOrg set to false and $state.current.name set to admin.organizations.edit.users.add', function () {
      instantiateController();

      $timeout.flush();
      $scope.$digest();

      $state.current = {name: 'admin.organizations.edit.users.add'};

      var includeOrg = false;
      controller.includeOrgIndex(includeOrg);

      expect(controller.user.miIndexFlag).toEqual(false);
    });
    it('should call includeOrgIndex(includeOrg) successfully for includeOrg set to true and $state.current.name set to admin.organizations.edit.users.edit', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.edit'};
      controller.user.subscriptions = {mi_index: ['ABCD']};

      var includeOrg = true;
      controller.includeOrgIndex(includeOrg);

      expect(controller.user.miIndexFlag).toEqual(false);

      var item = controller.user.subscriptions.mi_index.pop();
      expect(item).toEqual($state.params.orgId);
    });
    it('should call includeOrgIndex(includeOrg) successfully for includeOrg set to false and $state.current.name set to admin.organizations.edit.users.edit', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.edit.users.edit'};
      controller.user.subscriptions = {mi_index: ['ABCD']};

      var includeOrg = false;
      controller.includeOrgIndex(includeOrg);

      expect(controller.user.miIndexFlag).toEqual(false);

      var item = controller.user.subscriptions.mi_index.pop();
      expect(item).toEqual('ABCD');
    });
    it('should call save() successfully for admin user settings for password and confirm password matching', function () {
      $scope.userForm = {$error: {minlength: 8}};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(true);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(true);
      expect(controller.accessErrors).toEqual(true);
      expect(controller.success).toEqual(false);
    });
  });

  describe('save()', function () {
    it('should call save() successfully for admin user settings for password and confirm password matching with $state.current.name set to edit and vm.action set to edit', function () {
      $scope.userForm = {$error: {minlength: false}, $valid: true};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.accessErrors = false;
      $state.current.name = 'admin.usermanagement.edit';
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.loading).toEqual(true);
    });
    it('should call save() successfully for admin user settings for password and confirm password matching with $state.current.name set to edit and vm.action set to add', function () {
      $scope.userForm = {$error: {minlength: false}, $valid: true};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.accessErrors = false;
      $state.current.name = 'admin.usermanagement.edit';
      controller.action = 'add';
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.loading).toEqual(false);
    });
    it('should call save() successfully for admin user settings for password and confirm password matching with $state.current.name set to edit, vm.action set to add and vm.user.email set', function () {
      $scope.userForm = {$error: {minlength: false}, $valid: true};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.accessErrors = false;
      $state.current.name = 'admin.usermanagement.edit';
      controller.action = 'add';
      controller.user.email = 'peter.latimar@jci.com';
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.loading).toEqual(true);
    });
    it('should call save() successfully for admin user settings for password and confirm password matching with $state.current.name set to edit, vm.action set to add and vm.user.email set', function () {
      $scope.userForm = {$error: {minlength: false}, $valid: true};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.accessErrors = false;
      $state.current.name = 'admin.usermanagement.edit';
      controller.action = 'add';
      controller.user.email = 'peter.latimar@jci.com';
      controller.user.fullname = '';

      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.loading).toEqual(true);

      controller.user.fullname = 'Mark Strange';
    });
    it('should call save() successfully for admin user settings for confirm password, with $state.current.name set to edit, vm.action set to add and password set to empty string', function () {
      $scope.userForm = {$error: {minlength: false}, $valid: true};

      instantiateController();

      controller.confirmPassword = '1234567890';
      controller.accessErrors = false;
      $state.current.name = 'admin.usermanagement.edit'
      controller.action = 'add'
      controller.user.password = ''
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(false);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.loading).toEqual(false);
      expect(controller.error).toEqual(true);
      expect(controller.loading).toEqual(false);
      expect(controller.errorMessage).toEqual('Password is required.');
    });
    it('should call save() successfully for admin user settings for password and confirm password not matching', function () {
      $scope.userForm = {$error: {minlength: 8}};

      instantiateController();

      controller.user.password = '1234567890'
      controller.confirmPassword = 'XDDDDDDDD';
      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(true);
      expect(controller.minLengthError).toEqual(false);
      expect(controller.submitErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(true);
      expect(controller.accessErrors).toEqual(true);
      expect(controller.success).toEqual(false);
    });
    it('should call save() successfully for admin user settings with user set to false', function () {
      $scope.userForm = {$error: {minlength: 8}};

      instantiateController();

      controller.user = false;

      controller.save();

      expect(controller.passwordsDoNotMatch).toEqual(true);
      expect(controller.minLengthError).toEqual(true);
      expect(controller.submitErrors).toEqual(true);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.accessErrors).toEqual(false);
      expect(controller.success).toEqual(false);
      expect(controller.error).toEqual(false);
      expect(controller.loading).toEqual(false);
      expect(controller.errorMessage).toEqual('');
    });
  });

  describe('cancel()', function () {
    it('should call cancel() successfully for ', function () {
      instantiateController();

      $state.current = {name: 'admin.organizations.add'};
      controller.cancel();

      expect($state.current.name).toEqual('admin.organizations.add');
    });
  });

  function instantiateController() {
    controller = $controller('AdminUserEditController', {
      '$scope': $scope,
      '$state': $state,
      '$anchorScroll': $anchorScroll,
      'currentUser': currentUserMock,
      'userData': userDataMock,
      'adminOrganizationsData': adminOrganizationsData
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});