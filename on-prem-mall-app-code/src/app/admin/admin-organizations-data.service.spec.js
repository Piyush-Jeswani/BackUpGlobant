'use strict';

describe('adminOrganizationsData', function () {
  var $rootScope;
  var $http;
  var $httpBackend;
  var $timeout;
  var $q;
  var stateMock;
  var apiUrl;
  var adminOrganizationsData;
  var callback;
  var orgMock;
  var org;
  var orgId;
  var url;
  var errorMessage;
  var nonUpdatedOrg;
  var shouldBeSuperuser;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {
    apiUrl = 'https://api.url';

    callback = {
      success: function (result) {
        org = result;
      },
      failed: function (result) {
        errorMessage = result.data.statusText;
      }
    };

    orgId = 1234;

    orgMock = [{
        organization_id: 1234,
        name: 'Test Org 1',
        portal_settings: 'test',
        subscriptions: {}
      },
      {
        organization_id: 5678,
        name: 'Test Org 2',
        portal_settings: 'tester',
        subscriptions: {}
      }
    ];

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
          if (shouldBeSuperuser) {
            return $q.when({
              superuser: true
            });
          } else {
            return $q.when({
              superuser: false
            });
          }
        });

        var hasAdminAccess = jasmine.createSpy('hasAdminAccess').and.callFake(function (orgId, currentUser) {
          return $q.when(true);
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
    _$httpBackend_,
    _$q_,
    _adminOrganizationsData_,
    _$timeout_) {

    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $timeout = _$timeout_;

    adminOrganizationsData = _adminOrganizationsData_;
  }));

  describe('current user is superuser', function () {
    beforeEach(function () {
      shouldBeSuperuser = true;
    });

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('fetchOrganizations', function () {
      it('should get organizations on a successful http call', function () {
        $httpBackend.expectGET(apiUrl + '/organizations?all_fields=true').respond({
          result: orgMock
        });
        adminOrganizationsData.fetchOrganizations(false).then(function (result) {
        var transformedData = adminOrganizationsData.transformResponseData({
          result: orgMock
        });
          expect(JSON.stringify(result)).toEqual(JSON.stringify(transformedData));
        });
        $httpBackend.flush();
        $timeout.flush();
      });

      it('should not create an http call when fetchOrganizations has already been called', function () {
        $httpBackend.expectGET(apiUrl + '/organizations?all_fields=true').respond({
          result: orgMock
        });
        adminOrganizationsData.fetchOrganizations(false).then(function () {});
        adminOrganizationsData.fetchOrganizations().then(function (result) {
        var transformedData = adminOrganizationsData.transformResponseData({
          result: orgMock
        });
          expect(JSON.stringify(result)).toEqual(JSON.stringify(transformedData));
        });
        $httpBackend.flush();
        $timeout.flush();
      });

      it('should fail on a failed http call', function () {
        $httpBackend.expectGET(apiUrl + '/organizations?all_fields=true').respond(500, {
          statusText: 'Failed to get organizations.'
        });
        adminOrganizationsData.fetchOrganizations(false).catch(function (error) {
          expect(error.statusText).toEqual('Failed to get organizations.');
        });
        $httpBackend.flush();
        $timeout.flush();
      });
    });

    describe('refreshOrganization', function () {
      beforeEach(function () {
        $httpBackend.expectGET(apiUrl + '/organizations?all_fields=true').respond({
          result: orgMock
        });
        adminOrganizationsData.fetchOrganizations(false).then(function (result) {
          nonUpdatedOrg = result;
        });
        $httpBackend.flush();
        $timeout.flush();
      });

      it('should update organization data on successful http call', function () {
        callback.success = function (result) {
          org = result;
          nonUpdatedOrg = result;
        };

        var newOrgMock = {
          organization_id: 5678,
          name: 'New Org',
          portal_settings: 'not portal',
          subscriptions: {}
        };

        $httpBackend.expectPUT(apiUrl + '/organizations/' + 5678 + '?refresh=true').respond({
          result: [newOrgMock]
        });
        adminOrganizationsData.refreshOrganization(5678, callback);
        $httpBackend.flush();

        var nonUpdatedTransformedOrg = adminOrganizationsData.transformResponseData({
          result: nonUpdatedOrg
        });
        var updatedTransformedOrg = adminOrganizationsData.transformResponseData({
          result: [newOrgMock]
        });

        expect(JSON.stringify(org)).not.toEqual(JSON.stringify(nonUpdatedTransformedOrg));
        expect(JSON.stringify(org[1])).toEqual(JSON.stringify(updatedTransformedOrg[0]));
      });

      it('should update organization data on successful http call when hide_sales_when_no_traffic is set', function () {
        callback.success = function (result) {
          org = result;
        };

        var newOrgMock = {
          organization_id: 5678,
          name: 'New Org',
          portal_settings: 'not portal',
          subscriptions: {},
          hide_sales_when_no_traffic: true
        };

        $httpBackend.expectPUT(apiUrl + '/organizations/' + 5678 + '?refresh=true').respond({
          result: [newOrgMock]
        });
        adminOrganizationsData.refreshOrganization(5678, callback);
        $httpBackend.flush();

        var nonUpdatedTransformedOrg = adminOrganizationsData.transformResponseData({
          result: nonUpdatedOrg
        });
        var updatedTransformedOrg = adminOrganizationsData.transformResponseData({
          result: [newOrgMock]
        });

        expect(JSON.stringify(org)).not.toEqual(JSON.stringify(nonUpdatedTransformedOrg));
        expect(JSON.stringify(org[1])).toEqual(JSON.stringify(updatedTransformedOrg[0]));
      });

      it('should fail on a failed http call', function () {
        $httpBackend.expectPUT(apiUrl + '/organizations/' + 5678 + '?refresh=true').respond(500, {
          statusText: 'Failed to refresh organization.'
        });
        adminOrganizationsData.refreshOrganization(5678, callback);
        $httpBackend.flush();

        expect(errorMessage).toEqual('Failed to refresh organization.');
      });
    });
  });
});
