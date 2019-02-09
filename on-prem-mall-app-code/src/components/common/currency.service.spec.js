'use strict';

describe('currencyService', function() {

  var $rootScope;
  var $q;
  var $timeout;
  var $httpBackend;

  var currencyService;
  var apiUrl = 'https://api.url';

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(function(_$rootScope_, _currencyService_, _$q_, _$timeout_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    currencyService = _currencyService_;
  }));

  describe('getCurrencySymbol', function() {

    it('should return USD if no organization could be loaded', function() {
      var organizationMock = {
        organization_id: 2
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('$');
      });
      $httpBackend.flush();
    });

    it('should return USD if the organization does not have any portal settings', function() {
      var organizationMock = {
        organization_id: 1
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('$');
      });
      $httpBackend.flush();
    });

    it('should return USD if the organization portal settings do not contain a currency property', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {}
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('$');
      });
      $httpBackend.flush();
    });

    it('should return USD if the organization currency is get to "NONE"', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'NONE'
        }
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('$');
      });
      $httpBackend.flush();
    });

    it('should return £ if the organization currency is get to "GBP"', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('£');
      });
      $httpBackend.flush();
    });

    it('should set the organization id', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});

      currencyService.getCurrencySymbol(1).then(function(currencyInfo) {
        expect(currencyInfo.orgId).toBe(1);
      });
      $httpBackend.flush();
    });


    it('should return the organization currency if the site does not have a currency', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      var siteMock = {
        site_id : 2,
        organization: {
          id : 1
        }
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});
      $httpBackend.whenGET('https://api.url/organizations/1/sites/2').respond(200, {result: [siteMock]});

      currencyService.getCurrencySymbol(1, 2).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('£');
      });
      
      $httpBackend.flush();
    });


    it('should return the organization currency if the site currency is set to "NONE"', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      var siteMock = {
        site_id : 2,
        organization: {
          id : 1
        },
        currency: 'NONE'
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});
      $httpBackend.whenGET('https://api.url/organizations/1/sites/2').respond(200, {result: [siteMock]});

      currencyService.getCurrencySymbol(1, 2).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('£');
      });
      
      $httpBackend.flush();
    });

    it('site currency should take priority over organization currency', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      var siteMock = {
        site_id : 2,
        organization: {
          id : 1
        },
        currency: 'EUR'
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});
      $httpBackend.whenGET('https://api.url/organizations/1/sites/2').respond(200, {result: [siteMock]});

      currencyService.getCurrencySymbol(1, 2).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('€');
      });
      
      $httpBackend.flush();
    });

    it('should return the organization currency if the site could not be loaded', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      var siteMock = { };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});
      $httpBackend.whenGET('https://api.url/organizations/1/sites/2').respond(200, {result: [siteMock]});

      currencyService.getCurrencySymbol(1, 2).then(function(currencyInfo) {
        expect(currencyInfo.currencySymbol).toBe('£');
      });
      
      $httpBackend.flush();
    });

    it('should set the site and organization ids', function() {
      var organizationMock = {
        organization_id: 1,
        portal_settings : {
          currency : 'GBP'
        }
      };

      var siteMock = {
        site_id : 2,
        organization: {
          id : 1
        },
        currency: 'EUR'
      };

      $httpBackend.whenGET('https://api.url/organizations/1').respond(200, {result: [organizationMock]});
      $httpBackend.whenGET('https://api.url/organizations/1/sites/2').respond(200, {result: [siteMock]});

      currencyService.getCurrencySymbol(1, 2).then(function(currencyInfo) {
        expect(currencyInfo.orgId).toBe(1);
        expect(currencyInfo.siteId).toBe(2);
      });
      
      $httpBackend.flush();
    });

  });
});