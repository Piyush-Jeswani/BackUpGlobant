'use strict';

describe('dayOfWeekDataService', function () {
  var $httpBackend;
  var dayOfWeekDataService;
  var apiUrl;
  var localStorage;
  var utils;

  beforeEach(function () {
    apiUrl = 'https://api.url';
  });

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide, $translateProvider) {
    $provide.constant('apiUrl', apiUrl);

    $translateProvider.translations('en', {
      'weekdaysLong.sun': 'sunday_translated',
      'weekdaysLong.mon': 'monday_translated',
      'weekdaysLong.tue': 'tuesday_translated',
      'weekdaysLong.wed': 'wednesday_translated',
      'weekdaysLong.thu': 'thursday_translated',
      'weekdaysLong.fri': 'friday_translated',
      'weekdaysLong.sat': 'saturday_translated',
    });

    $translateProvider.preferredLanguage('en');

    localStorage = {
      set: function() {},
      get: function(key) {
        angular.noop(key);
        return null
      },
      keys: function() {
        return [];
      }
    };

    var googleAnalytics = {
      sendRequestTime: function () {
        angular.noop()
      }
    };

    $provide.value('localStorageService', localStorage);
    $provide.value('googleAnalytics', googleAnalytics);
  }));

  beforeEach(inject(function(_$httpBackend_, _dayOfWeekDataService_, _utils_) {
    $httpBackend = _$httpBackend_;
    dayOfWeekDataService = _dayOfWeekDataService_;
    utils = _utils_;
  }));

  it('should expose a getDataForChart function', function() {
    expect(typeof dayOfWeekDataService.getDataForChart).toBe('function');
  });

  it('should expose a getContributionDataForChart function', function() {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: 2,
      zoneId: 3,
      kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
    };

    setupBackend(params);

    var isHourly = true;

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = moment('20160722', 'YYYYMMDD');
    dataRequest.endDate = moment('20160728', 'YYYYMMDD');
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = getDaysOfWeek();
    dataRequest.customTagId = [{id: 1}];

    dayOfWeekDataService.getContributionDataForChart(dataRequest)
    expect(typeof dayOfWeekDataService.getContributionDataForChart).toBe('function');
  });

  it('should expose a getMetricContributionDataForTable function', function() {
    expect(typeof dayOfWeekDataService.getMetricContributionDataForTable).toBe('function');
  });

  it('getDataForChart should make a http request if the data is not held in the cache', function () {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: 2,
      zoneId: 3,
      kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
    };

    setupBackend(params);

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = moment('20160722', 'YYYYMMDD');
    dataRequest.endDate = moment('20160728', 'YYYYMMDD');
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = getDaysOfWeek();

    dayOfWeekDataService.getDataForChart(dataRequest);

    $httpBackend.flush();
  });

  it('getDataForChart should make a http request if the data is not held in the cache for hourly data', function () {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: 2,
      zoneId: 3,
      kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
    };

    setupBackend(params);

    var isHourly = true;

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = moment('20160722', 'YYYYMMDD');
    dataRequest.endDate = moment('20160728', 'YYYYMMDD');
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = getDaysOfWeek();
    dataRequest.monitor_point_id = 5;

    dayOfWeekDataService.getDataForChart(dataRequest, isHourly);
    expect(typeof dayOfWeekDataService.getDataForChart).toBe('function');
  });

  it('getDataForChart should make a http request if the data is not held in the cache for hourly data for siteId null', function () {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: null,
      zoneId: 3,
      kpi: ['sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
    };

    setupBackend(params);

    var isHourly = true;

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = moment('20160722', 'YYYYMMDD');
    dataRequest.endDate = moment('20160728', 'YYYYMMDD');
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = getDaysOfWeek();

    dayOfWeekDataService.getDataForChart(dataRequest, isHourly);
    expect(typeof dayOfWeekDataService.getDataForChart).toBe('function');
  });

  it('getDataForChart should make a http request if the data is not held in the cache if monitor point id is set', function () {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: 2,
      zoneId: 3,
      kpi: ['traffic']
    };

    setupBackend(params);

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = moment('20160722', 'YYYYMMDD');
    dataRequest.endDate = moment('20160728', 'YYYYMMDD');
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = getDaysOfWeek();
    dataRequest.monitor_point_id = 5;

    dayOfWeekDataService.getDataForChart(dataRequest, false);
    expect(typeof dayOfWeekDataService.getDataForChart).toBe('function');
  });

  it('getDataForChart should return translated labels', function () {
    var params = {
      reportStartDate: moment('20160722', 'YYYYMMDD'),
      reportEndDate: moment('20160728', 'YYYYMMDD'),
      orgId: 1,
      siteId: 2,
      zoneId: 3,
      kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
    };

    setupBackend(params);

    var daysOfWeek = getDaysOfWeek();

    var request1Result;

    var dataRequest = {};
    dataRequest.comp_site = false;
    dataRequest.metrics = params.kpi;
    dataRequest.startDate = params.reportStartDate;
    dataRequest.endDate = params.reportEndDate;
    dataRequest.organizationId = params.orgId;
    dataRequest.siteId = params.siteId;
    dataRequest.zoneId = params.zoneId;
    dataRequest.daysOfWeek = daysOfWeek;

    // First call
    dayOfWeekDataService.getDataForChart(dataRequest).then(function (data) {
      request1Result = data;
    });

    $httpBackend.flush();

    var expectedTranslations = ['sunday_translated', 'monday_translated', 'tuesday_translated', 'wednesday_translated', 'thursday_translated', 'friday_translated', 'saturday_translated'];

    expect(angular.equals(expectedTranslations, request1Result.labels)).toBe(true);
  });

  describe('getDataForChart', function () {
    it('should average the total value of non calculated measures based on the count of day of week in the date period', function () {
      // LFR-455
      var serviceResult;

      getServiceResultForOneMonthPeriod(['sales'])
      .then(function (data) {
        serviceResult = data;
      });

      $httpBackend.flush();
      // 22-Jul-2016 - 18-Aug-2016
      // There are 4 of each day of the week in this period
      // Rounding is handled by the number filter in the UI

      var salesResults = serviceResult.series[0];
      expect(salesResults[0]).toBe(315167.5);
      expect(salesResults[1]).toBe(209304.5);
      expect(salesResults[2]).toBe(184359);
      expect(salesResults[3]).toBe(178168.5);
      expect(salesResults[4]).toBe(188170.25);
      expect(salesResults[5]).toBe(224597.75);
      expect(salesResults[6]).toBe(387040);
    });

    function getServiceResultForOneMonthPeriod(metrics) {
      // LFR-455
      // A four week period
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160818', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: metrics
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = metrics;
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      return dayOfWeekDataService.getDataForChart(dataRequest);
    }
  });

  describe('getMetricContributionDataForTable', function () {
    it('should calculate the overall STAR for the selected days', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = params.kpi;
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
        .then(function (data) {
          serviceResult = data;
        });

      $httpBackend.flush();

      // STAR = TRAFFIC / labor_hours rounded to 0dp
      // Traffic total = 70855
      // labor_hours total = 38525
      expect(serviceResult.averages.star).toBe(14);
    });

    it('should calculate the overall STAR for the selected days even if labour_hours is not needed', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'total_traffic', 'labor_hours']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'total_traffic'];
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest).then(function (data) {
        serviceResult = data;
      });

      $httpBackend.flush();

      // STAR = TRAFFIC / labor_hours rounded to 0dp
      // Traffic total = 70855
      // labor_hours total = 38525
      expect(serviceResult.averages.star).toBe(14);
    });

    it('should calculate the overall ATS for the selected days', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = params.kpi;
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
        .then(function (data) {
          serviceResult = data;
        });

      $httpBackend.flush();

      // ATS = total_sales / transactions rounded to 2dp
      // total_sales = 6747230
      // transactions total = 84768
      var exprected = (79.60).toFixed(2);

      expect(serviceResult.averages.ats.toFixed(2)).toBe(exprected);
    });

    it('should calculate the overall ATS for the selected days even if transactions is not needed', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'labor_hours', 'transactions']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = ['traffic', 'sales', 'ats', 'conversion', 'star', 'labor_hours'];
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
        .then(function (data) {
          serviceResult = data;
        });

      $httpBackend.flush();

      // ATS = total_sales / transactions rounded to 2dp
      // total_sales = 6747230
      // transactions total = 84768
      var exprected = (79.60).toFixed(2);

      expect(serviceResult.averages.ats.toFixed(2)).toBe(exprected);
    });

    it('should calculate the overall conversion for the selected days', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'sales', 'ats', 'conversion', 'star', 'transactions', 'labor_hours']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = params.kpi;
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
        .then(function (data) {
          serviceResult = data;
        });

      $httpBackend.flush();

      // conversion = (transactions / total_traffic) * 100 rounded to 2dp
      var exprected = (16.20).toFixed(2);

      expect(serviceResult.averages.conversion.toFixed(2)).toBe(exprected);
    });

    it('should calculate the overall conversion for the selected days even if transactions is not needed', function () {
      // LFR-314
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        kpi: ['traffic', 'conversion', 'labor_hours', 'transactions']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {
        comp_site: false,
        metrics: ['traffic', 'conversion', 'labor_hours'],
        startDate: params.reportStartDate,
        endDate: params.reportEndDate,
        organizationId: params.orgId,
        siteId: params.siteId,
        zoneId: params.zoneId,
        daysOfWeek: daysOfWeek
      };


      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
      .then(function(data) {
        serviceResult = data;
      });

      $httpBackend.flush();

      // conversion = (transactions / total_traffic) * 100 rounded to 2dp
      var exprected = (16.20).toFixed(2);

      expect(serviceResult.averages.conversion.toFixed(2)).toBe(exprected);
    });

    it('should calculate the overall conversion for the filtered data for the sales categories for the selected days if sales categories are selected', function () {
      // LFR-407
      var params = {
        reportStartDate: moment('20160722', 'YYYYMMDD'),
        reportEndDate: moment('20160728', 'YYYYMMDD'),
        orgId: 1,
        siteId: 2,
        zoneId: 3,
        sales_category_id : [1,2,3],
        aggregate_sales_categories: true,
        kpi: ['traffic', 'conversion', 'labor_hours', 'transactions']
      };

      setupBackend(params);

      var daysOfWeek = getDaysOfWeek();

      var serviceResult;

      var dataRequest = {};
      dataRequest.comp_site = false;
      dataRequest.metrics = ['traffic', 'conversion', 'labor_hours'];
      dataRequest.startDate = params.reportStartDate;
      dataRequest.endDate = params.reportEndDate;
      dataRequest.organizationId = params.orgId;
      dataRequest.siteId = params.siteId;
      dataRequest.zoneId = params.zoneId;
      dataRequest.daysOfWeek = daysOfWeek;
      dataRequest.salesCategories = [
        { id: 1 },
        { id: 2 },
        { id: 3 }];

      dayOfWeekDataService.getMetricContributionDataForTable(dataRequest)
        .then(function (data) {
          serviceResult = data;
        });

      $httpBackend.flush();

      // conversion = (transactions / total_traffic) * 100 rounded to 2dp
      var exprected = (200.00).toFixed(2);

      expect(serviceResult.averages.conversion.toFixed(2)).toBe(exprected);
    });
  });

  function setupBackend(paramsObj) {
    var params = angular.copy(paramsObj);

    var endpoint = apiUrl + '/kpis/report';

    params.comp_site = false;

    params.groupBy = 'day_of_week';

    params.reportStartDate = utils.getDateStringForRequest(params.reportStartDate);

    params.reportEndDate = utils.getDateStringForRequest(params.reportEndDate);

    var url = buildUrl(endpoint, params);

    if (url.indexOf('sales_category_id') > 0) {
      $httpBackend.whenGET(url).respond({ result: getMockDataForFewCategories() });
    } else {
      $httpBackend.whenGET(url).respond({ result: getMockData() });
    }
  }

  function buildUrl(endpoint, params) {
    return endpoint + '?' +
      Object.keys(params)
        .sort()
        .map(function (key) {

          if (Array.isArray(params[key])) {
            var param = '';

            _.each(params[key], function (item) {
              if (param.length > 0) {
                param += '&';
              }
              param += (key + '=' + item);
            });

            return param;
          }

          return key + '=' + params[key];
        })
        .join('&');
  }

  function getDaysOfWeek() {
    return [
      'weekdaysLong.sun',
      'weekdaysLong.mon',
      'weekdaysLong.tue',
      'weekdaysLong.wed',
      'weekdaysLong.thu',
      'weekdaysLong.fri',
      'weekdaysLong.sat'
    ]
  }

  function getMockData() {
    return [
      {
        'organization_id': 1145,
        'period_start_date': 'Fri',
        'period_end_date': 'Fri',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 898391,
        'traffic': 66166,
        'labor_hours': 5338,
        'transactions': 10938,
        'dayOfWeek': 'friday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Mon',
        'period_end_date': 'Mon',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 837218,
        'traffic': 63801,
        'labor_hours': 5246,
        'transactions': 10509,
        'dayOfWeek': 'monday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Sat',
        'period_end_date': 'Sat',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 1548160,
        'traffic': 124053,
        'labor_hours': 5235,
        'transactions': 19074,
        'dayOfWeek': 'saturday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Sun',
        'period_end_date': 'Sun',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 1260670,
        'traffic': 103318,
        'labor_hours': 5265,
        'transactions': 16759,
        'dayOfWeek': 'sunday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Thu',
        'period_end_date': 'Thu',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 752681,
        'traffic': 54545,
        'labor_hours': 5300,
        'transactions': 9267,
        'dayOfWeek': 'thursday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Tue',
        'period_end_date': 'Tue',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 737436,
        'traffic': 56331,
        'labor_hours': 6141,
        'transactions' : 9193,
        'dayOfWeek': 'tuesday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Wed',
        'period_end_date': 'Wed',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 712674,
        'traffic': 55078,
        'labor_hours': 6000,
        'transactions': 9028,
        'dayOfWeek': 'wednesday'
      }
    ];
  }

  function getMockDataForFewCategories() {
    return [
      {
        'organization_id': 1145,
        'period_start_date': 'Fri',
        'period_end_date': 'Fri',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 100,
        'traffic': 200,
        'labor_hours': 300,
        'transactions': 400,
        'dayOfWeek': 'friday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Mon',
        'period_end_date': 'Mon',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 200,
        'traffic': 400,
        'labor_hours': 600,
        'transactions': 800,
        'dayOfWeek': 'monday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Sat',
        'period_end_date': 'Sat',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 300,
        'traffic': 600,
        'labor_hours': 900,
        'transactions': 1200,
        'dayOfWeek': 'saturday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Sun',
        'period_end_date': 'Sun',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 400,
        'traffic': 800,
        'labor_hours': 1200,
        'transactions': 1600,
        'dayOfWeek': 'sunday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Thu',
        'period_end_date': 'Thu',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 500,
        'traffic': 1000,
        'labor_hours': 1500,
        'transactions': 2000,
        'dayOfWeek': 'thursday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Tue',
        'period_end_date': 'Tue',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 600,
        'traffic': 1200,
        'labor_hours': 1800,
        'transactions': 2400,
        'dayOfWeek': 'tuesday'
      },
      {
        'organization_id': 1145,
        'period_start_date': 'Wed',
        'period_end_date': 'Wed',
        'site_id': 80064248,
        'conversion': null,
        'star': null,
        'ats': null,
        'sales': 700,
        'traffic': 1400,
        'labor_hours': 2100,
        'transactions': 2800,
        'dayOfWeek': 'wednesday'
      }
    ];
  }
});
