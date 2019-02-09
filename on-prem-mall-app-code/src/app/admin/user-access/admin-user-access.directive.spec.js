'use strict';

describe('adminUserAccessDirective', function() {
  var $scope;
  var $compile;
  var $state;
  var $httpBackend;

  var ObjectUtils;
  var adminSitesData;
  var adminOrganizationsData;
  var adminLocationsData;

  var UserAccessDirective;

  var element;
  var apiUrl;
  var callback;
  var errorMessage;
  var org;

  var multipleOrganizationsMock;
  var multipleSitesMock;
  var organizationMock;
  var locationMock;
  var userMock;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function() {
    apiUrl = 'https://api.url';

    callback = {
      success: function(result) {
        org = result;
      },
      failed: function(result) {
        errorMessage = result.data.statusText;
      }
    };

    organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    multipleOrganizationsMock = [organizationMock];

    multipleSitesMock = [
      {
        site_id: 5678,
        name: 'Single-Site Org 1'
      },
      {
        site_id: 9012,
        name: 'Single-Site Org 2'
      }
    ];

    userMock = {
      id: 1111,
      superuser: true,
      accessMap: {
        setup: {
          tags: [
            "bbbbbbbbbbbbbbbbbbbb5555",
            "aaaaaaaaaaaaaaaaaaaa5555",
            "cccccccccccccccccccc1868",
            "592ea1167d36dd238853aebe",
            "592ea1167d36dd238853aebf",
            "ffffffffffffffffffff5555",
            "592ea1167d36dd238853aec6",
            "cccccccccccccccccccc5555"
          ],
          organizations: [

          ],
          sites: [

          ],
          locations: [

          ],
          orgs_admin: [

          ],
          mi_orgs: [

          ]
        },
        actual: {
          organizations: [
            1234
          ],
          sites: [
            12345678,
            57777,
            57778
          ],
          locations: [
            577771
          ]
        },
        partial: {
          organizations: [
            1868
          ],
          sites: [

          ]
        }
      }
    };



    locationMock = [{
      "5555" : [
        {
          "location_id": 400,
          "location_type": "Site",
          "description": "Multi-Site Org - Site 1 - Site Location"
        },
        {
          "location_id": 401,
          "location_type": "Site",
          "description": "Multi-Site Org - Site 2 - Site Location"
        },
        {
          "location_id": 402,
          "location_type": "Site",
          "description": "Multi-Site Org - Site 3 - Site Location"
        }
      ]
    }];

    module(function($provide) {
      $provide.constant('apiUrl', apiUrl);
      $provide.factory('authService', function($q) {

        var getCurrentUser = jasmine.createSpy('getCurrentUser').and.callFake(function() {
          return $q.when(userMock);
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
    });
  })

  beforeEach(inject(function($rootScope, $templateCache, _$compile_, _$state_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $state = _$state_;
    $httpBackend = _$httpBackend_;

    $templateCache.put('app/admin/user-access/admin-user-access.partial.html', '<div></div>');
  }));

  beforeEach(function() {
    $httpBackend.expectGET(apiUrl + '/organizations/1234').respond({ result: multipleOrganizationsMock });
    $httpBackend.expectGET(apiUrl + '/organizations').respond({ result: multipleOrganizationsMock });
    $httpBackend.expectGET(apiUrl + '/organizations/1234/sites?all_fields=true&hidden=true').respond({ result: multipleSitesMock });
    $httpBackend.expectGET(apiUrl + '/organizations/1234/locations').respond({ result: locationMock });
    $httpBackend.whenGET('app/header/header.html').respond(200, '');
    $httpBackend.whenGET('app/analytics/analytics.partial.html').respond(200, '');

    UserAccessDirective = renderDirective();

    $httpBackend.flush();
  });

  describe('user data access mapping', function() {
    it('should build users sites', function() {
      expect(UserAccessDirective.user.accessMap.actual.sites).not.toBe(null);
      expect(UserAccessDirective.user.accessMap.actual.sites).not.toBeUndefined();
    });
  });

  describe('toggle changes in the user access map', function() {

    it('should toggle site access', function() {
      var siteId = multipleSitesMock[1].site_id;
      expect(UserAccessDirective.user.accessMap.setup.sites.indexOf(siteId)).toEqual(-1);

      // if the get all data for that site is true, then it should add that site to the access map
      UserAccessDirective.getAllData[siteId] = true;
      UserAccessDirective.toggleSiteAccess(siteId);
      expect(UserAccessDirective.user.accessMap.setup.sites.indexOf(siteId)).toBeGreaterThanOrEqual(0);

      // if the get all data for that site is false, then it should remove that site from the access map
      UserAccessDirective.getAllData[siteId] = false;
      UserAccessDirective.toggleSiteAccess(siteId);
      expect(UserAccessDirective.user.accessMap.setup.sites.indexOf(siteId)).toEqual(-1);
    });

    it('should toggle location access', function() {
      var siteId = multipleSitesMock[1].site_id;
      expect(UserAccessDirective.user.accessMap.actual.sites.indexOf(siteId)).toEqual(-1);

      // if the user selects locations, it should add them to the users access map
      UserAccessDirective.getAllData[siteId] = true;
      UserAccessDirective.selectedLocations[siteId] = [ 401, 402 ];
      UserAccessDirective.toggleLocation(siteId);

      expect(UserAccessDirective.getAllData[siteId]).toBe(false);
      expect(UserAccessDirective.user.accessMap.setup.sites.indexOf(siteId)).toEqual(-1);

      expect(UserAccessDirective.user.accessMap.setup.locations.indexOf(401)).toBeGreaterThanOrEqual(0);
      expect(UserAccessDirective.user.accessMap.setup.locations.indexOf(402)).toBeGreaterThanOrEqual(0);
    });
  });

  function renderDirective() {
    element = angular.element(
      '<admin-user-access' +
       ' user="user">' +
      '</admin-user-access>'
    );

    $state.params = { orgId: 1234 };
    $scope.user = userMock;

    element = $compile(element)($scope);
    $scope.$digest();

    return element.controller('adminUserAccess');
  }
});
