'use strict';

describe('adminSitesData', function () {
  var $httpBackend;
  var stateMock;
  var sitesMock;
  var urlMock;
  var apiUrl;
  var adminSitesData;
  var sitesFromApi;
  var errorMessage;
  var orgId;
  var callback;
  var shouldBeSuperuser;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {
    apiUrl = 'https://api.url';

    callback = {
      success: function (result) {
        sitesFromApi = result;
      },
      failed: function (result) {
        errorMessage = result.data.statusText;
      }
    };

    sitesMock = [{
        fullAccess: true,
        name: 'Test Site 1',
        organization: {},
        site_id: 1234
      },
      {
        fullAccess: true,
        name: 'Test Site 2',
        organization: {},
        site_id: 5678
      }
    ];

    orgId = 1111;

    urlMock = apiUrl + '/organizations/' + orgId + '/sites';

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

  beforeEach(inject(function (_$httpBackend_,
    _adminSitesData_) {

    $httpBackend = _$httpBackend_;
    adminSitesData = _adminSitesData_;
  }));

  describe('user is a superuser', function () {
    beforeEach(function () {
      shouldBeSuperuser = true;
    });

    describe('fetchSites', function () {
      it('should hit the success callback on a successful http call and transform the data', function () {
        $httpBackend.expectGET(urlMock + '?all_fields=true&hidden=true').respond({
          result: sitesMock
        });
        adminSitesData.fetchSites(orgId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(sitesFromApi)).not.toEqual(JSON.stringify(sitesMock));

        var transformedSitesMock = adminSitesData.transformSitesData({
          result: sitesMock
        });
        expect(JSON.stringify(sitesFromApi)).toEqual(JSON.stringify(transformedSitesMock));
      });

      it('should hit the failed callback on an unsuccessful http call', function () {
        sitesFromApi = null;

        $httpBackend.expectGET(urlMock + '?all_fields=true&hidden=true').respond(500, {
          statusText: 'Error has occurred getting sites.'
        });
        adminSitesData.fetchSites(orgId, callback);
        $httpBackend.flush();

        expect(sitesFromApi).toBe(null);
        expect(errorMessage).toBe('Error has occurred getting sites.');
      });

      it('should error out when no orgId has been sent', function () {

        var expectedError = new Error('orgId is undefined');

        var functionUnderTest = function () {
          adminSitesData.fetchSites();
        };

        expect(functionUnderTest).toThrow(expectedError);
      });
    });

    describe('fetchSite', function () {
      it('should hit the success callback on a successful http call and transform the site data', function () {
        var siteId = 5678;
        var results = [sitesMock[1]];

        $httpBackend.expectGET(urlMock + '/' + siteId).respond({
          result: results
        });
        adminSitesData.fetchSite(orgId, siteId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(sitesFromApi)).not.toEqual(JSON.stringify(results));

        var transformedResults = adminSitesData.transformSitesData({
          result: results
        });
        expect(JSON.stringify(sitesFromApi)).toEqual(JSON.stringify(transformedResults));
      });

      it('should hit the failed callback on an unsuccessful http call', function () {
        var siteId = 5678;
        sitesFromApi = null;

        $httpBackend.expectGET(urlMock + '/' + siteId).respond(500, {
          statusText: 'An error getting a site has occurred.'
        });
        adminSitesData.fetchSite(orgId, siteId, callback);
        $httpBackend.flush();

        expect(sitesFromApi).toBe(null);
        expect(errorMessage).toBe('An error getting a site has occurred.');
      });

      it('should throw new Error whenever a null site has been sent', function () {
        var expectedError = new Error('siteId is undefined');

        var functionUnderTest = function () {
          adminSitesData.fetchSite(orgId, null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });
    });
  });
});
