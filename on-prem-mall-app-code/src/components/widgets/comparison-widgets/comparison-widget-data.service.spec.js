'use strict';

describe('comparisonWidgetData', function() {
  var $httpBackend;
  var comparisonWidgetData;
  var localizationService;
  var utils;


  var apiUrl;
  var constants;
  var defaultParams;

  beforeEach(function() {
    apiUrl = 'https://api.url';
    constants = {
      kpis: {
        'bogusKPI': {
          apiEndpoint: '/bogus',
          key: 'bogus_value',
          queryParams: {}
        }
      }
    };
    defaultParams = {
      orgId: 123,
      siteId: 456,
      locationId: 789,
      dateRangeStart: moment('2015-01-01'),
      dateRangeEnd: moment('2015-01-31').endOf('day')
    };
  });
  
  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));
  
  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.constant('comparisonWidgetDataConstants', constants);

    var localStorageService = {
      set: function(key, value) { },
      get: function(key) {
        return undefined;
      },
      keys: function() {
        return [];
      }
    };

    $provide.value('localStorageService', localStorageService);

    var googleAnalytics = {
      sendRequestTime: function (apiUri, urlWithParams, requestTime) {
        angular.noop(apiUri, urlWithParams, requestTime);
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));
  beforeEach(inject(function(_$httpBackend_, _comparisonWidgetData_, _LocalizationService_, _utils_) {
    $httpBackend = _$httpBackend_;
    comparisonWidgetData = _comparisonWidgetData_;
    localizationService = _LocalizationService_;
    utils = _utils_;
  }));

  describe('fetchKPI', function() {
    it('should do a correct query', function() {
      expectQuery('bogusKPI', defaultParams).respond(500);
      comparisonWidgetData.fetchKPI('bogusKPI', defaultParams);
      $httpBackend.flush();
    });

    it('should transform response data', function() {
      var response = {
        result: [{
          'bogus_value': 100,
          'period_start_date': '2015-01-01T00:00:00.000Z'
        }, {
          'bogus_value': 200,
          'period_start_date': '2015-01-02T00:00:00.000Z'
        }, {
          'bogus_value': 300,
          'period_start_date': '2015-01-03T00:00:00.000Z'
        }]
      };

      expectQuery('bogusKPI', defaultParams).respond(response);
      var data = comparisonWidgetData.fetchKPI('bogusKPI', defaultParams);
      $httpBackend.flush();

      data.forEach(function(item, index) {
        expect(item.value)
          .toBe(response.result[index].bogus_value);
        expect(utils.getDateStringForRequest(item.date))
          .toBe(response.result[index].period_start_date);
      });
    });

    it('should resolve promise on success', function() {
      var handleSuccess = jasmine.createSpy('handleSuccess');
      var handleError = jasmine.createSpy('handleError');

      expectQuery('bogusKPI', defaultParams).respond({ result: [] });
      comparisonWidgetData.fetchKPI('bogusKPI', defaultParams)
        .promise.then(handleSuccess);
      $httpBackend.flush();

      expect(handleSuccess).toHaveBeenCalled();
      expect(handleError).not.toHaveBeenCalled();
    });

    it('should reject promise on error', function() {
      var handleSuccess = jasmine.createSpy('handleSuccess');
      var handleError = jasmine.createSpy('handleError');

      expectQuery('bogusKPI', defaultParams).respond(500);
      comparisonWidgetData.fetchKPI('bogusKPI', defaultParams)
        .promise
        .then(handleSuccess)
        .catch(handleError);
      $httpBackend.flush();

      expect(handleSuccess).not.toHaveBeenCalled();
      expect(handleError).toHaveBeenCalled();
    });
  });

  function expectQuery(kpi, params) {
    return $httpBackend.expectGET(
      buildUrl(apiUrl + constants.kpis[kpi].apiEndpoint, angular.extend({
        orgId: params.orgId,
        siteId: params.siteId,
        locationId: params.locationId,
        reportStartDate: utils.getDateStringForRequest(params.dateRangeStart),
        reportEndDate: utils.getDateStringForRequest(params.dateRangeEnd)
      }, constants.kpis[kpi].queryParams))
    );
  }

  function buildUrl(url, params) {
    return url + '?' +
      Object.keys(params)
      .sort()
      .map(function(key) {
        return key + '=' + params[key];
      })
      .join('&');
  }
});
