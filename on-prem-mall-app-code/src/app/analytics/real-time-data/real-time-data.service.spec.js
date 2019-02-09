'use strict';

describe('RealTimeDataService', function () {
  var $httpBackend;
  var realTimeDataService;

  var apiUrl;
  var constants;
  var activeSettings;

  beforeEach(function () {
    apiUrl = 'https://api.url';
    constants = {
      kpis: ['traffic', 'sales'],
      kpisMock: {
        'fooKPI': {
          key: 'bogus_value',
          queryParams: {}
        }
      }
    };

    activeSettings = {
      'orgId': 123,
      reportStartDate: moment('2016-09-26T00:00:00Z').format('YYYYMMDDHHmm'),
      reportEndDate: moment('2016-09-26T07:45:00Z').format('YYYYMMDDHHmm')
    };
  });

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(function (_$httpBackend_, _realTimeDataService_) {
    $httpBackend = _$httpBackend_;
    realTimeDataService = _realTimeDataService_;
    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
  }));

  describe('getRealTimeKpiData', function () {
    it('should do a correct query for org level', function () {
      var params = {
        orgId: 3068
      };
      expectOrgLevelQuery('fooKPI', params).respond(500);
      realTimeDataService.getRealTimeKpiData(params, metricList, null, null, 'exits', false, function () { }, function () { });
      $httpBackend.flush();
    });

    it('should transform kpi data for org when it has data', function () {
      var params = {
        orgId: 3068
      };
      var url = 'https://api.url/realtime/organization?orgId=3068';
      $httpBackend.whenGET(url).respond(mockOrgData);

      realTimeDataService.getRealTimeKpiData(params, metricList, null,null, 'exits', false) .then(function (dataList){
        expect(dataList.metricList[0].apiPropertyName).toEqual('traffic');
        expect(dataList.metricList[0].totalValue).toEqual(28);
      });

      $httpBackend.flush();
    });

    it('should transform kpi data for site when it has data', function () {
      var params = {
        orgId: 3068,
        siteId: 77825
      };
      var url = 'https://api.url/realtime?orgId=3068&siteId=77825';
      $httpBackend.whenGET(url).respond(mockSiteData);

      realTimeDataService.getRealTimeKpiData(params, metricList, null,null, 'exits', true) .then(function (dataList){
        expect(dataList.metricList[0].apiPropertyName).toEqual('traffic');
        expect(dataList.metricList[0].totalValue).toEqual(14);
      });

      $httpBackend.flush();
    });
  });

  describe('getRealTimeData', function () {

    it('should do a correct query for single site', function () {
      var params = {
        orgId: 3068,
        siteId: 77825
      };
      expectQuery('fooKPI', params).respond(500);
      realTimeDataService.getRealTimeData(params, constants.kpis, constants.kpis, null, null, true, false, 'exits', true, function () { }, function () { });
      $httpBackend.flush();
    });

    it('should do a correct query for org level', function () {
       var params = {
        orgId: 123
      };
      expectOrgLevelQuery('fooKPI', params).respond(500);
      realTimeDataService.getRealTimeData(params, constants.kpis, constants.kpis, null, null, true, false, 'exits', false, function () { }, function () { });
      $httpBackend.flush();
    });


    it('should transform data for org when it has data', function () {
      var params = {
        orgId: 3068
      };
      var url = 'https://api.url/realtime/organization?orgId=3068';
      $httpBackend.whenGET(url).respond(mockOrgData);

      realTimeDataService.getRealTimeData(params, metricList, metricList, null, null, true, true, 'exits', false) .then(function (dataList){
        expect(dataList.tableData.tableData[0].siteId).toEqual('516');
        expect(dataList.tableData.tableData[0].traffic).toEqual(14);
        expect(dataList.tableData.tableData[1].siteId).toEqual('509');
        expect(dataList.tableData.tableData[1].traffic).toEqual(14);
      });

      $httpBackend.flush();
    });

    it('should transform data for site when it has data', function () {
      var params = {
        orgId: 3068,
        siteId: 77825
      };
      var sitesMock = [{
        site_id: params.siteId,
        timezone:'Europe/Rome',
        customer_site_id: '32',
        name: 'site1',
        OrganizationResource: {
        id: params.orgId
      }}];
      var url = 'https://api.url/realtime?orgId=3068&siteId=77825';
      $httpBackend.whenGET(url).respond(mockSiteData);

      realTimeDataService.getRealTimeData(params, metricList, metricList, null, null, true, true, 'exits',true, sitesMock) .then(function (dataList){
        expect(dataList.chartData.labels[0]).toEqual(moment(mockSiteData.result[0].realtimeData[0].sites[0].data[0].time,'YYYYMMDDHHmm').format('HH:mm'));
        expect(dataList.chartData.series[0][0]).toEqual(14);
        expect(dataList.tableData.tableData[0].traffic).toEqual(14);
        expect(dataList.chartData.metricsWithData[0].value).toEqual('traffic');
      });

      $httpBackend.flush();
    });

    it('should transform data for multi site when it has data', function () {
      var params = {
        orgId: 3068,
        siteId: [51182, 51178, 51181, 11988],
        kpi: constants.kpis
      };
      var url = 'https://api.url/realtime/organization?kpi=traffic&kpi=sales&orgId=3068&siteId=51182&siteId=51178&siteId=51181&siteId=11988';
      $httpBackend.whenGET(url).respond(mockOrgData);

      realTimeDataService.getRealTimeData(params, metricList, metricList, null , null, true, true, 'exits',false) .then(function (dataList){
        expect(dataList.tableData.tableData[0].traffic).toEqual(14);
      });

      $httpBackend.flush();
    });

  });



  function expectQuery(kpi, params) {
    return $httpBackend.expectGET(
      buildUrl(apiUrl + '/realtime', params));
  }

  function expectOrgLevelQuery(kpi, params) {
    return $httpBackend.expectGET(
      buildUrl(apiUrl + '/realtime/organization', params));
  }

  function buildUrl(url, params) {
    return url + '?' +
      Object.keys(params)
        .sort()
        .map(function (key) {
          if (typeof params[key] === 'object') {
            var str = '';
            _.each(params[key], function (value) {
              if (value !== undefined && key !== undefined) {
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

  var metricList = [{
    apiPropertyName: 'traffic',
    apiReturnkey: 'enterExit',
    calculatedMetric: undefined,
    dependencies: undefined,
    group: 'any',
    icon: 'entrance',
    isCurrency: false,
    key: 'traffic',
    kpi: 'traffic',
    label: 'traffic',
    order: 1,
    precision: 0,
    prefixSymbol: '',
    requiredPermissions: [],
    shortTranslationLabel: 'kpis.shortKpiTitles.tenant_traffic',
    subscription: 'any',
    suffixSymbol: '',
    translationLabel: 'kpis.kpiTitle.traffic',
    value: 'traffic'
  }]

  var mockOrgData = {result:[{
        businessDayData:[
          {site_id: "516", start: "2017-01-22T06:00:00"},
          {site_id: "509", start: "2017-01-22T06:00:00"}
        ],
        operatingHoursData:[
          {site_id: 51182, end: "2016-12-28T23:00:00", start: "2016-12-28T08:00:00"},
          {site_id: 51179, end: "2016-12-28T23:00:00", start: "2016-12-28T08:00:00"}
        ],
        realtimeData:[{
            currency:'',
            id:'516',
            data:[{
              enters:"29",
              exits:"14",
              items:0,
              laborHours:5,
              sales:"0.00",
              time:"201701221000",
              transactions:0
            }]
        },
        {
            currency:'',
            id:'509',
            data:[{
              enters:"29",
              exits:"14",
              items:0,
              laborHours:5,
              sales:"0.00",
              time:"201701221000",
              transactions:0
            }]
        }]
  }]};

  var mockSiteData = {result:[{
        enterExit: 'Exits',
        businessDayData:{site_id: "32", start: "2017-01-22T06:00:00"},
        operatingHoursData: {
          end: '2017-01-23T23:00:00',
          site_id: 77825,
          start: '2017-01-23T08:00:00'
        },
        realtimeData:[
          {sites: [
            {
              id: '32',
              currency: '',
              data: [{
                enters: '29',
                exits: '14',
                items: 0,
                laborHours: 5,
                sales: '0.00',
                time: moment().format('YYYYMMDDHHmm'),//'201701221000',
                transactions:0
            }
              ]
            }
          ]}
        ]
  }]};
});
