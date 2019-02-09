'use strict';

describe('AdminUserManagementController', function () {
  var currentAdminOrganizationMock = {},
  $controller,
  $q,
  $timeout,
  $scope,
  $state,
  ObjectUtils;

  var currentUserMock = {
    localization: { date_format: 'MM/DD/YYYY' }
  };

  var adminUsersData = {
    getUsers: function (_callback) {
      _callback.success([]);
    }
  };

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_, _$state_, _ObjectUtils_,_adminUsersData_,_$q_,_$timeout_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    $timeout = _$timeout_;
  }));

  beforeEach(inject(function($state) {
    spyOn($state, 'go');
  }));



  describe('Controller init', function () {
    it('should call activate() and set defaults', function () {
      var controller = createController();
      var bulkActions = [
        'Delete'
      ];

      expect(controller.bulkActions).toEqual(bulkActions);
      expect(controller.currentUser).toEqual(currentUserMock);
      expect(typeof controller.addUser).toBe('function');
      expect(typeof controller.editUser).toBe('function');
      expect(typeof controller.deleteUser).toBe('function');
      expect(typeof controller.changeSort).toBe('function');
      expect(typeof controller.selectUser).toBe('function');
      expect(typeof controller.selectAllUsers).toBe('function');
      expect(typeof controller.bulkActionApply).toBe('function');
      expect(typeof controller.deleteUserConfirmation).toBe('function');
      expect(typeof controller.shouldShowClearButton).toBe('function');
      expect(typeof controller.clearSelectedUsers).toBe('function');
      expect(typeof controller.accessCount).toBe('function');
      expect(typeof controller.getRole).toBe('function');
      expect(typeof controller.getLastLogin).toBe('function');
    });

    it('should call initialize() successfully', function () {
      var controller = createController();

      expect(controller.loading).toBe(false);

    });

    it('should call addUser() successfully', function () {
      var controller = createController();
      controller.addUser();
      expect($state.go).toHaveBeenCalledWith('admin.usermanagement.add');
    });

    it('should call editUser() successfully', function () {
      var controller = createController();
      var testUser = {
        username:'testUser'
      }
      controller.editUser(testUser);

      expect($state.go).toHaveBeenCalledWith('admin.usermanagement.edit',  {user:testUser, username:testUser.username});
    });

    it('should call accessCount() successfully', function () {
      var controller = createController();
      var testUser = {
        accessMap:{
          setup: {
            organizations: [1, 2, 3],
            tags: [],
            sites: [1]
          }
        }
      }

      expect(controller.accessCount(testUser)).toBe('3 | 0 | 1');

    });


  });


  function createController() {
    return $controller('AdminUserManagementController', {
      '$scope': $scope,
      '$state': $state,
      'ObjectUtils': ObjectUtils,
      'currentUser': currentUserMock,
      'adminUsersData': adminUsersData
    });
  }

});
