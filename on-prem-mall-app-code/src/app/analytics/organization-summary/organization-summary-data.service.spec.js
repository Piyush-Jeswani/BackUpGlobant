'use strict';

describe('organizationSummaryData', function() {
  var $httpBackend;
  var organizationSummaryData;

  var apiUrl;
  var constants;
  var activeSettings;
  var defaultParams;
  var utils;

  beforeEach(function() {
    apiUrl = 'https://api.url';
    constants = {
      kpis: ['foo'],
      kpisMock: {
        'fooKPI': {
          apiEndpoint: '/kpis/report',
          key: 'bogus_value',
          queryParams: {}
        }
      }
    };
    defaultParams = {
      orgId: 123,
      groupBy: 'aggregate',
      kpi: constants.kpis,
      dateRangeStart: moment('2016-01-01'),
      dateRangeEnd: moment('2016-01-31').endOf('day')
    };
    activeSettings = {
      'orgId': 123,
      'dateRangeStart': moment('2016-01-01'),
      'dateRangeEnd': moment('2016-01-31').endOf('day')
    };
  });

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.constant('organizationSummaryDataConstants', constants);
  }));

  beforeEach(inject(function(_$httpBackend_, _organizationSummaryData_, _utils_) {
    $httpBackend = _$httpBackend_;
    organizationSummaryData = _organizationSummaryData_;
    organizationSummaryData.setParams(activeSettings);
    utils = _utils_;
  }));

  describe('fetchReportData', function() {

    it('should do a correct query', function() {
      expectQuery('fooKPI', defaultParams).respond(500);
      organizationSummaryData.fetchKPIData(function() {});
      $httpBackend.flush();
    });

    it('should transform response data', function() {
      var response = {
        result: [{
          'org_id': '123',
          'site_id': '345',
          'period_start_date': '2014-12-01',
          'period_end_date': '2014-12-01',
          'foo': 100
        },
        {
          'org_id': '123',
          'site_id': '345',
          'period_start_date': '2014-12-02',
          'period_end_date': '2014-12-12',
          'foo': 200
        }]
      };

      var transformedData = organizationSummaryData.transformResponseData(response, constants.kpis);

      var i = 0;
      angular.forEach(transformedData,function(item, index) {
        expect(index)
          .toBe(response.result[i].site_id);
        i++;
      });
    });
  });

  function expectQuery(kpi, params) {
    return $httpBackend.expectGET(
      buildUrl(apiUrl + constants.kpisMock[kpi].apiEndpoint, angular.extend({
              orgId: params.orgId,
              groupBy: params.groupBy,
              kpi: params.kpi,
              reportStartDate: utils.getDateStringForRequest(params.dateRangeStart),
              reportEndDate: utils.getDateStringForRequest(params.dateRangeEnd),
            }, constants.kpisMock[kpi].queryParams)));
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
