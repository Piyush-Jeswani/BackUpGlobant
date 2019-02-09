'use strict';

describe('adminUsersData', function () {
  var $httpBackend;
  var apiUrl;
  var stateMock;
  var orgUsersMock;
  var usersMock;
  var adminUsersData;
  var userData;
  var callback;
  var callbackSuccess;
  var user;
  var updatedUser;
  var orgId;
  var url;
  var errorMessage;
  var shouldBeSuperuser;
  var errorMessage;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {
    apiUrl = 'https://api.url';
    callback = function (data) {
      userData = data;
    };

    callbackSuccess = {
      success: function (data) {
        userData = data;
      },
      failed: function (error) {
        errorMessage = error.data.errorMessage;
        angular.noop(errorMessage);
      }
    };

    usersMock = [{
        id: 1234,
        username: 'test_user_1'
      },
      {
        id: 5678,
        username: 'test_user_2'
      }
    ];

    orgUsersMock = [{
        _id: '1234',
        fullname: 'test_user_1',
        username: 'test.user.1',
        accessMap: {},
        title: 'test user title',
        email: 'test_user_1@email.com'
      },
      {
        _id: '5678',
        fullname: 'test_user_2',
        username: 'test.user.2',
        accessMap: {},
        title: 'test user title',
        email: 'test_user_2@email.com'
      },
    ];

    orgId = 1;

    stateMock = {
      go: jasmine.createSpy('go'),
      params : {
        orgId : orgId
      }
    };

    module(function ($provide) {
      $provide.constant('apiUrl', apiUrl);

      $provide.factory('authService', function ($q) {
        var getCurrentUser = jasmine.createSpy('getCurrentUser').and.callFake(function () {
          return $q.when({
            superuser: shouldBeSuperuser
          });
        });

        var hasAdminAccess = jasmine.createSpy('hasAdminAccess').and.callFake(function () {
          return true;
        });

        var isAdminForOrg = jasmine.createSpy('isAdminForOrg').and.callFake(function() { 
          return true;
        });

        return {
          getCurrentUser: getCurrentUser,
          hasAdminAccess: hasAdminAccess,
          isAdminForOrg: isAdminForOrg
        };
      });

      $provide.value('$state', stateMock);
    });
  });

  beforeEach(inject(function (_$rootScope_,
    _$state_,
    _$httpBackend_,
    _$q_,
    _adminUsersData_) {

    $httpBackend = _$httpBackend_;
    adminUsersData = _adminUsersData_;
  }));

  describe('user is a superuser', function () {
    beforeEach(function () {
      shouldBeSuperuser = true;
    });

    describe('getUsers', function () {
      it('should get users', function () {
        $httpBackend.expectGET(apiUrl + '/users').respond({
          result: usersMock
        });
        adminUsersData.getUsers(callbackSuccess);
        $httpBackend.flush();

        expect(JSON.stringify(userData)).toEqual(JSON.stringify(usersMock));
      });

      it('should get user by their userId', function () {
        var userId = 1234;

        $httpBackend.expectGET(apiUrl + '/users/' + userId).respond({
          data: {
            user: {
              id: 1234
            }
          }
        });
        adminUsersData.getUser(userId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(userData.data)).toEqual(JSON.stringify({
          user: {
            id: userId
          }
        }));
      });

      it('should get users associated with a given orgId and transform that data', function () {
        adminUsersData.currentUser = {
          superuser: true
        };

        $httpBackend.expectGET(apiUrl + '/organizations/' + orgId + '/users').respond({
          result: orgUsersMock
        });
        adminUsersData.getOrgUsers(orgId, callback);
        $httpBackend.flush();

        var newOrgUsersMock = adminUsersData.transformOrgUsersData({
          result: orgUsersMock
        });

        expect(JSON.stringify(userData)).not.toEqual(JSON.stringify(orgUsersMock));
        expect(JSON.stringify(userData)).toEqual(JSON.stringify(newOrgUsersMock));
      });
    });

    describe('saving or updating a user', function () {
      var updateUrl;

      beforeEach(function () {
        user = {
          _id: '1234',
          fullname: 'test_user_1',
          username: 'test.user.1',
          accessMap: {},
          title: 'test user title',
          email: 'test_user_1@email.com'
        };

        updatedUser = {
          _id: '1234',
          fullname: 'New User',
          username: 'test.user.1',
          accessMap: {},
          title: 'updated information',
          email: 'test_user_01@email.com'
        };

        url = apiUrl + '/organizations/' + orgId + '/users';
        updateUrl = apiUrl + '/users';

        callback = {
          success: function (user) {
            userData = user.data;
          },
          failed: function (error) {
            errorMessage = error.data.statusText;
          }
        };
      });

      it('should be a post call when action is add and returns the new users data', function () {
        var action = 'add';

        $httpBackend.when('POST', url, user).respond(user);
        adminUsersData.saveOrgUser(user, orgId, action, callback);
        $httpBackend.flush();

        expect(JSON.stringify(userData)).toEqual(JSON.stringify(user));
      });

      it('should be a post call when action is add and return an error message if the post failed', function () {
        var action = 'add';

        $httpBackend.when('POST', url, user).respond(500, {
          statusText: 'Error in saving user.'
        });
        adminUsersData.saveOrgUser(user, orgId, action, callback);
        $httpBackend.flush();

        expect(errorMessage).toEqual('Error in saving user.');
      });

      it('should be a put call when action is edit and returns the updated users data', function () {
        var action = 'edit';
        var accessMapUrl = updateUrl + '/' + updatedUser._id + '/access';
        url = updateUrl + '/' + updatedUser._id;

        var accessMapUserObj = {
          superuser: updatedUser.superuser,
          accessMap: updatedUser.accessMap,
          _id: updatedUser._id,
          orgId: orgId
        };

        var userWithoutAccessMap = _.omit(updatedUser, 'accessMap');
        userWithoutAccessMap.orgId = orgId;

        $httpBackend.when('PUT', accessMapUrl, accessMapUserObj).respond(updatedUser);
        $httpBackend.when('PUT', url, userWithoutAccessMap).respond(updatedUser);
        adminUsersData.saveOrgUser(updatedUser, orgId, action, callback);
        $httpBackend.flush();

        expect(JSON.stringify(userData)).toEqual(JSON.stringify(updatedUser));
      });

      it('should be a put call when action is edit and return an error message if a put failed', function () {
        var action = 'edit';
        var accessMapUrl = updateUrl + '/' + updatedUser._id + '/access';
        url = updateUrl + '/' + updatedUser._id;

        var accessMapUserObj = {
          superuser: updatedUser.superuser,
          accessMap: updatedUser.accessMap,
          _id: updatedUser._id,
          orgId: orgId
        };

        var userWithoutAccessMap = _.omit(updatedUser, 'accessMap');
        userWithoutAccessMap.orgId = orgId;

        $httpBackend.when('PUT', accessMapUrl, accessMapUserObj).respond(500, {
          statusText: 'Error in updating user.'
        });

        adminUsersData.saveOrgUser(updatedUser, orgId, action, callback);
        $httpBackend.flush();

        expect(errorMessage).toEqual('Error in updating user.');
      });
    });
  });
});
