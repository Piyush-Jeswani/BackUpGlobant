'use strict';

// TODO: Make tests more generic and comprehensive.

describe('createResource', function() {


  var orgId = '1000';

  var SiteResource;
  var $httpBackend;
  var apiUrl;
  beforeEach(function() {
    module('shopperTrak', function($provide, $translateProvider) {
      $provide.constant('httpBatchConfigProvider', {
        getBatchConfig: function (url) {
          return {enabled: false};
        },
        setAllowedBatchEndpoint: function(serviceUrl, batchEndpointUrl, config) {},
        canBatchCall: function (url, method) { return false; },
        calculateBoundary: function () {  },
        $get: [function() {
          return this;
        }]
      });

      $translateProvider.translations('en_US', {});
    });
  });
  beforeEach(module('shopperTrak.resources'));
  beforeEach(inject(function(_$httpBackend_, _apiUrl_, createResource) {
    $httpBackend = _$httpBackend_;
    apiUrl = _apiUrl_;
    SiteResource = createResource(apiUrl + '/organizations/:orgId/sites/:siteId');
  }));



  describe('query method', function() {

    it('should request all sites', function() {
      expectAllSitesQueryAndGiveEmptyResponse(orgId);
      SiteResource.query({ 'orgId': orgId });
      $httpBackend.flush();
    });

    it('should return an object containing a promise object', function() {
      expectAllSitesQueryAndGiveEmptyResponse(orgId);
      var sites = SiteResource.query({ 'orgId': orgId });
      expect(typeof sites.$promise).toBe('object');
      expect(typeof sites.$promise.then).toBe('function');
      $httpBackend.flush();
    });

    it('should pass the fetched data as parameter to the callback', function() {
      expectAllSitesQueryAndGiveEmptyResponse(orgId);
      var data;
      SiteResource.query({ 'orgId': orgId }, function(sites) {
        data = sites;
      });
      $httpBackend.flush();
      expect(typeof data).toBe('object');
    });

    it('should resolve the promise to a resource object', function() {
      var siteArray = [{ 'id': '1001' }, { 'id': '1002' }, { 'id': '1003' }];
      var response = {
        'result': siteArray
      };
      var responseObject;
      expectAllSitesQueryAndRespondWithObject(orgId, response);
      SiteResource.query({ 'orgId': orgId }).$promise.then(function(_responseObject) {
        responseObject = _responseObject;
      });
      $httpBackend.flush();
      expect(responseObject[0].id).toBe(siteArray[0].id);
      expect(responseObject[1].id).toBe(siteArray[1].id);
      expect(responseObject[2].id).toBe(siteArray[2].id);
    });

    it('should reject the promise if request fails', function() {
      var response = {};
      expectAllSitesQueryAndRespondWithObject(orgId, response, 404);
      var success = true;
      SiteResource.query({ 'orgId': orgId }).$promise.then(function() {
      }, function() {
        success = false;
      });
      $httpBackend.flush();
      expect(success).toBe(false);
    });

    it('should call the callback parameter when query is successful', function() {
      expectAllSitesQueryAndGiveEmptyResponse(orgId);
      var callbackCalled = false;
      SiteResource.query({ 'orgId': orgId }, function() {
        callbackCalled = true;
      });
      $httpBackend.flush();
      expect(callbackCalled).toBe(true);
    });

    it('should not fail when no url parameters are given', function() {
      SiteResource.query();
    });

  });



  describe('get method', function() {

    it('should request a single site with the given id', function() {
      var siteId = '1234';
      expectSingleSiteQueryAndGiveEmptyResponse(orgId, siteId);
      SiteResource.get({ 'orgId': orgId, 'siteId': siteId });
      $httpBackend.flush();
    });

    it('should return an object containing a promise object', function() {
      var siteId = '1234';
      expectSingleSiteQueryAndGiveEmptyResponse(orgId, siteId);
      var site = SiteResource.get({ 'orgId': orgId, 'siteId': siteId });
      expect(typeof site.$promise).toBe('object');
      expect(typeof site.$promise.then).toBe('function');
      $httpBackend.flush();
    });

    it('should resolve the promise to a resource object', function() {
      var siteId = '1234';
      var siteObject = {
        'id': '1234'
      };
      var response = {
        'result': [siteObject]
      };
      expectSingleSiteQueryAndRespondWithObject(orgId, siteId, response);
      var responseObject;
      SiteResource.get({ 'orgId': orgId, 'siteId': siteId }).$promise.then(function(_responseObject) {
        responseObject = _responseObject;
      });
      $httpBackend.flush();
      expect(responseObject.id).toBe(siteObject.id);
    });

    it('should reject the promise if request fails', function() {
      var siteId = '1234';
      var response = {};
      expectSingleSiteQueryAndRespondWithObject(orgId, siteId, response, 404);
      var success = true;
      SiteResource.get({ 'orgId': orgId, 'siteId': siteId }).$promise.then(function() {
      }, function() {
        success = false;
      });
      $httpBackend.flush();
      expect(success).toBe(false);
    });

  });



  function expectAllSitesQueryAndGiveEmptyResponse(orgId) {
    $httpBackend
      .expectGET(apiUrl + '/organizations/' + orgId + '/sites')
      .respond({
        'result': []
      });
  }



  function expectAllSitesQueryAndRespondWithObject(orgId, response, status) {
    $httpBackend
      .expectGET(apiUrl + '/organizations/' + orgId + '/sites')
      .respond(status ? status : 200, response);
  }



  function expectSingleSiteQueryAndGiveEmptyResponse(orgId, siteId) {
    $httpBackend
      .expectGET(apiUrl + '/organizations/' + orgId + '/sites/' + siteId)
      .respond({
        'result': []
      });
  }



  function expectSingleSiteQueryAndRespondWithObject(orgId, siteId, response, status) {
    $httpBackend
      .expectGET(apiUrl + '/organizations/' + orgId + '/sites/' + siteId)
      .respond(status ? status : 200, response);
  }


});
