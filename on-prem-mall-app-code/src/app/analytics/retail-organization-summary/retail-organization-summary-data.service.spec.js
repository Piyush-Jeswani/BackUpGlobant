'use strict';

describe('retailOrganizationSummaryData', function() {
  var $httpBackend;
  var retailOrganizationSummaryData;

  var apiUrl;
  var constants;
  var activeSettings;
  var defaultParams;

  beforeEach(function() {
    apiUrl = 'https://api.url';
    constants = {
      kpis: ['foo','bar'],
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
      dateRangeStart: moment.utc('2016-01-01'),
      dateRangeEnd: moment.utc('2016-01-31').endOf('day')
    };
    activeSettings = {
      'orgId': 123,
      'dateRangeStart': moment.utc('2016-01-01'),
      'dateRangeEnd': moment.utc('2016-01-31').endOf('day')
    };
  });

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.constant('retailOrganizationSummaryDataConstants', constants);
  }));

  beforeEach(inject(function(_$httpBackend_, _retailOrganizationSummaryData_) {
    $httpBackend = _$httpBackend_;
    retailOrganizationSummaryData = _retailOrganizationSummaryData_;
  }));

  describe('fetchReportData', function() {

    it('should do a correct query', function() {
      expectQuery('fooKPI', defaultParams).respond(500);
      retailOrganizationSummaryData.fetchReportData(activeSettings, function() {});
      $httpBackend.flush();
    });

    it('should transform response data', function() {
      var response = {
        result: [{
          'org_id': '123',
          'site_id': '456',
          'period_start_date': '2014-12-01',
          'period_end_date': '2014-12-01',
          'foo': 100,
        },
        {
          'org_id': '123',
          'site_id': '456',
          'period_start_date': '2014-12-02',
          'period_end_date': '2014-12-12',
          'bar': 200
        }]
      };

      var transformedData = retailOrganizationSummaryData.transformResponseData(response, constants.kpis);

      var i = 0;
      angular.forEach(transformedData,function(item) {
        expect(item.site_id).toBe(response.result[i].site_id);
        expect(item.foo).toBe(100);
        expect(item.bar).toBe(200);
        i++;
      });
      expect(transformedData.length).toBe(1);
    });
  });

  function expectQuery(kpi, params) {
    return $httpBackend.expectGET(
      buildUrl(apiUrl + constants.kpisMock[kpi].apiEndpoint, angular.extend({
              orgId: params.orgId,
              groupBy: params.groupBy,
              kpi: params.kpi,
              reportStartDate: params.dateRangeStart.toISOString(),
              reportEndDate: params.dateRangeEnd.toISOString(),
            }, constants.kpisMock[kpi].queryParams)));
  }

  function buildUrl(url, params) {
    return url + '?' +
      Object.keys(params)
      .sort()
      .map(function(key) {
        if(typeof params[key] === 'object') {
          var str = '';
          _.each(params[key],function(value) {
            if(value !== undefined && key !== undefined) {
              str += '&' + key + '=' + value;
            }
          });
          return str.substring(1);
        } else {
          return key + '=' + params[key];
        }
      })
      .join('&');
  }
});
