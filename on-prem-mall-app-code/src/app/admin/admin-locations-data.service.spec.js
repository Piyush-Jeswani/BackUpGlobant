'use strict';

describe('adminUsersData', function () {
  var $httpBackend;
  var stateMock;
  var locationDataMock;
  var adminLocationsData;
  var apiUrl;
  var url;
  var orgId;
  var siteId;
  var callback;
  var locationData;
  var errorMessage;
  var shouldBeSuperuser;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {
    apiUrl = 'https://api.url';
    orgId = 1234;
    siteId = 1234;
    url = apiUrl + '/organizations/' + orgId + '/sites/' + siteId + '/locations';
    locationData = null;
    errorMessage = null;

    callback = {
      success: function (data) {
        locationData = data;
      },
      failed: function (result) {
        errorMessage = result.data.statusText;
      }
    };

    locationDataMock = [{
      _id: 'abcd1234',
      created: '',
      description: 'Test Location',
      expired: null,
      floors: [],
      geometry: {},
      location_id: 1234,
      location_type: 'Site',
      nested_set: {},
      organization: {},
      site: {},
      updated: ''
    }];

    stateMock = {
      go: jasmine.createSpy('go')
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

        var hasAdminAccess = jasmine.createSpy('hasAdminAccess').and.callFake(function () {
          return true;
        });

        var isAdminForOrg = jasmine.createSpy('isAdminForOrg').and.callFake(function() { 
          return true;
        });

        return {
          getCurrentUser : getCurrentUser,
          hasAdminAccess : hasAdminAccess,
          isAdminForOrg : isAdminForOrg
        };
      });

      $provide.value('$state', stateMock);
      
    });
  });

  beforeEach(inject(function (_$httpBackend_,
    _adminLocationsData_) {

    $httpBackend = _$httpBackend_;
    adminLocationsData = _adminLocationsData_;
  }));

  describe('user is a superuser', function () {
    beforeEach(function () {
      shouldBeSuperuser = true;
    });

    describe('getLocations', function () {
      it('should call success callback on a successful http request', function () {
        $httpBackend.expectGET(url).respond(200, {
          result: locationDataMock
        });
        adminLocationsData.getLocations(orgId, siteId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(locationData)).not.toEqual(JSON.stringify(locationDataMock));

        var transformedLocationDataMock = adminLocationsData.transformLocationsData(locationDataMock);
        expect(JSON.stringify(locationData)).toEqual(JSON.stringify(transformedLocationDataMock));
      });

      it('should call failed callback on an unsuccessful http request', function () {
        $httpBackend.expectGET(url).respond(500, {
          statusText: 'Request has failed.'
        });
        adminLocationsData.getLocations(orgId, siteId, callback);
        $httpBackend.flush();

        expect(locationData).toBe(null);
        expect(errorMessage).toBe('Request has failed.');
      });

      it('should throw an error when orgId is undefined or null', function () {
        var expectedError = new Error('orgId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminLocationsData.getLocations(null, siteId, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when siteId is undefined or null', function () {
        var expectedError = new Error('siteId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminLocationsData.getLocations(orgId, null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });
    });
  });
});
