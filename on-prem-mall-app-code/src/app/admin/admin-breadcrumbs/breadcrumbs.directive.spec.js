'use strict';

describe('adminBreadcrumbs', function() {
  var $compile;
  var $rootScope;
  var $scope;
  var $state;
  var $stateParams;
  var ObjectUtils;
  var adminOrganizationsData;
  var AdminBreadcrumbs;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function( $rootScope,
    _$compile_,
    _$state_,
    _$stateParams_,
    _ObjectUtils_,
    _adminOrganizationsData_) {

    $compile = _$compile_;
    $scope = $rootScope.$new();
    $state = _$state_;
    ObjectUtils = _ObjectUtils_;
    adminOrganizationsData = _adminOrganizationsData_;

    AdminBreadcrumbs = renderDirectiveAndDigest();
  }));

  describe('populateRouteWithParams functionality', function() {
    it('should populate route with correct params with orgId', function() {
      $state.params = { orgId: 1234 }; 
      var route = '/admin/organizations/{orgId:int}';
      var populatedRoute = AdminBreadcrumbs.populateRouteWithParams(route);
      
      expect(populatedRoute).toBe('/admin/organizations/1234');
    });

    it('should populate route with correct params with orgId and siteId', function() {
      $state.params = { orgId: 1234, siteId: 5678 };
      var route = '/admin/organizations/{orgId:int}/edit/site/{siteId:int}';
      var populatedRoute = AdminBreadcrumbs.populateRouteWithParams(route);
      
      expect(populatedRoute).toBe('/admin/organizations/1234/edit/site/5678');
    });

    it('should populate route with correct params with orgId and username', function() {
      $state.params = { orgId: 1234, username: 'testUser' };
      var route = '/admin/organizations/{orgId:int}/edit/users/{username:string}';
      var populatedRoute = AdminBreadcrumbs.populateRouteWithParams(route);
      
      expect(populatedRoute).toBe('/admin/organizations/1234/edit/users/testUser');
    });

    it('should populate route with correct params with orgId and without username', function() {
      $state.params = { orgId: 1234 };
      var route = '/admin/organizations/{orgId:int}/edit/users/{username:string}';
      var populatedRoute = AdminBreadcrumbs.populateRouteWithParams(route);
      
      expect(populatedRoute).toBe('/admin/organizations/1234/edit/users/');
    });
  });

  it('should correctly parse the path info', function() {
    var path = { 
      url: { source: '/admin'},
      toString: function() { return 'admin' }
    };
    
    var parsedPath = AdminBreadcrumbs.parsePathInfo(path);
    var expectedResult = { title: 'Home', route: '/admin' };

    expect(JSON.stringify(parsedPath)).toEqual(JSON.stringify(expectedResult));
  });

  it('should get the correct current organization name with currentOrganization', function() {
    $state.$current.locals = {  };
  });


  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('adminBreadcrumbs');
  }

  function createDirectiveElement() {
    return angular.element(
      '<admin-breadcrumbs></admin-breadcrumbs>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'app/admin/admin-breadcrumbs/breadcrumbs.partial.html',
      '<div></div>'
    );
  }
});