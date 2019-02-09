'use strict';

describe('multiLocationKPIFetcher', function() {
  var $q;
  var $httpBackend;
  var multiLocationKPIFetcher;

  var apiUrl = 'https://api.url';
  var kpiDefinitions = {
    testMetric: {
      apiEndpoint: 'kpis/testEndpoint',
      valueKey: 'test_value',
      locationIdKey: 'test_location_id',
      queryParams: {
        testParam1: 'foo',
        testParam2: 'bar'
      }
    },
    testMetricWithPrefetch: {
      apiEndpoint: 'kpis/anotherTestEndpoint',
      valueKey: 'test_value',
      locationIdKey: 'test_location_id',
      queryParams: {
        testParam1: 'foo',
        testParam2: 'bar'
      },
      prefetch: function(params) {
        var deferred = $q.defer();
        deferred.resolve(angular.extend({
          testParam3: 'foobar'
        }, params));
        return deferred.promise;
      }
    }
  };

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module(function($provide, $qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
    $provide.constant('apiUrl', apiUrl);
    $provide.constant('multiLocationKPIFetcherKPIDefinitions', kpiDefinitions);
  }));
  beforeEach(inject(function(_$q_, _$httpBackend_, _multiLocationKPIFetcher_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    multiLocationKPIFetcher = _multiLocationKPIFetcher_;
  }));

  describe('fetchAggregate', function() {
    it('should query the correct endpoint with correct parameters', function() {
      var kpi = 'testMetric';
      var params = {
        orgId: 123,
        siteId: 456,
        locationId: 789
      };

      expectQuery(kpi, params).respond(200);
      multiLocationKPIFetcher.fetchAggregate('testMetric', params);
      $httpBackend.flush();
    });

    it('should reject the promise if query fails', function() {
      var kpi = 'testMetric';
      var params = {
        orgId: 123,
        siteId: 456,
        locationId: 789
      };

      var requestFailed = false;

      expectQuery(kpi, params).respond(500);
      var data = multiLocationKPIFetcher.fetchAggregate('testMetric', params);
      data.promise.catch(function() {
        requestFailed = true;
      });
      $httpBackend.flush();

      expect(requestFailed).toBe(true);
    });

    it('should set isLoading flag to true while loading', function() {
      var kpi = 'testMetric';
      var params = {
        orgId: 123,
        siteId: 456,
        locationId: 789
      };

      // Test for successful query
      expectQuery(kpi, params).respond({
        result: []
      });
      var data = multiLocationKPIFetcher.fetchAggregate('testMetric', params);
      expect(data.isLoading).toBe(true);
      $httpBackend.flush();
      expect(data.isLoading).toBe(false);

      // Test for failing query
      expectQuery(kpi, params).respond(500);
      var failingData = multiLocationKPIFetcher.fetchAggregate('testMetric', params);

      expect(failingData.isLoading).toBe(true);
      $httpBackend.flush();
      expect(failingData.isLoading).toBe(false);
    });

    it('should call the prefetch function if present in kpi definition', function() {
      var kpi = 'testMetricWithPrefetch';
      var params = {
        orgId: 123,
        siteId: 456
      };
      var kpiDefinition = kpiDefinitions.testMetricWithPrefetch;

      spyOn(kpiDefinition, 'prefetch').and.callThrough();

      // Expect a request with transformed parameters
      expectQuery(kpi, angular.extend({
        testParam3: 'foobar'
      }, params)).respond({ result: [] });

      multiLocationKPIFetcher.fetchAggregate(kpi, params);
      $httpBackend.flush();

      expect(kpiDefinitions[kpi].prefetch).toHaveBeenCalledWith(
        angular.extend({}, params, kpiDefinition.queryParams)
      );
    });

    describe('data transformation', function() {
      var data;

      beforeEach(function() {
        var kpi = 'testMetric';
        var params = {
          orgId: 123,
          siteId: 456
        };

        expectQuery(kpi, params).respond({
          result: [{
            test_location_id: 1000,
            test_value: 50
          }, {
            test_location_id: 2000,
            test_value: 100
          }, {
            test_location_id: 3000,
            test_value: null
          }]
        });

        data = multiLocationKPIFetcher.fetchAggregate('testMetric', params);
        $httpBackend.flush();
      });

      it('should transform the response according to kpiDefinitions', function() {
        expect(data['1000']).toBe(50);
        expect(data['2000']).toBe(100);
      });

      it('should filter out null values', function() {
        expect(data['3000']).toBeUndefined();
      });
    });
  });

  it('should set hasFailed flag to true if query fails', function() {
    var kpi = 'testMetric';
    var params = {
      orgId: 123,
      siteId: 456,
      locationId: 789
    };

    expectQuery(kpi, params).respond(500);
    var data = multiLocationKPIFetcher.fetchAggregate('testMetric', params);
    expect(data.hasFailed).toBe(false);
    $httpBackend.flush();
    expect(data.hasFailed).toBe(true);
  });

  function expectQuery(kpi, params) {
    var url = buildUrl(
      apiUrl + '/' + kpiDefinitions[kpi].apiEndpoint,
      angular.extend({}, kpiDefinitions[kpi].queryParams, params)
    );
    return $httpBackend.expectGET(url);
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
