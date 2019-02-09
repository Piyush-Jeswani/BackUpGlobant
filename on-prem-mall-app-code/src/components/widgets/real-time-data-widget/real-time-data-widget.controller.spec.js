'use strict';

describe('realTimeDataWidgetCtrl', function () {
  var $scope;
  var $controller;
  var realTimeDataService;
  var comparisonsHelper;
  var metrics;
  var realTimeDataWidgetConstants;
  var $translate;
  var $q;
  var $httpBackend;
  var ObjectUtils;
  var apiUrl = 'https://api.url';
  var currentUserMock = { localization: { date_format: 'MM/DD/YYYY' } };
  var date = moment().format('YYYY-MM-DD')
  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    var googleAnalytics = {
      sendRequestTime: function () {
        angular.noop()
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));

  beforeEach(inject(function ($rootScope, $templateCache, _$controller_, _realTimeDataService_,
    _comparisonsHelper_, _metricConstants_, _$translate_, _$httpBackend_, _$q_, _ObjectUtils_, _realTimeDataWidgetConstants_) {

    $scope = $rootScope.$new();
    $controller = _$controller_;
    realTimeDataService = _realTimeDataService_;
    comparisonsHelper = _comparisonsHelper_;
    metrics = _metricConstants_;
    $translate = _$translate_;
    realTimeDataWidgetConstants = _realTimeDataWidgetConstants_

    $httpBackend = _$httpBackend_;
    $q = _$q_;
    ObjectUtils = _ObjectUtils_;
    var authUser = { result: [currentUserMock] };

    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
    $httpBackend.whenGET('https://api.url/auth/currentUser').respond(authUser);
    $httpBackend.whenGET('https://api.url/organizations').respond($scope.currentOrganization);

    initCurrentOrg();
    $scope.$apply();
    setInitialBackup();
    cacheTemplates($templateCache);

  }));

  it('should create controller', function () {
    $scope.orgId = 5777;
    $scope.siteId = 80070123;
    $scope.singleSite = true;
    var params = {
      orgId: $scope.orgId,
      siteId: $scope.siteId,
    };
    setupBackend(params, true);
    createController();
    $scope.$apply();
    expect($scope.showCompareTimePeriod).toBe(false);
    expect($scope.widgetIcon).toBe('real-time');

  });

  it('should set widget data when there is data', function () {
    $scope.orgId = 5777;
    $scope.siteId = 80070123;
    $scope.singleSite = true;
    var params = {
      orgId: $scope.orgId,
      siteId: $scope.siteId,
    };
    setupBackend(params, true);
    $scope.showCompareTimePeriod = true;
    $scope.$apply();
    createController();
    $httpBackend.flush()
    $scope.$apply();
    expect($scope.hasData).toBe(true);
    expect($scope.loading).toBe(false);
    expect($scope.widgetData.ats).toBe(getMockData().ats)
  });

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/analytics.partial.html',
      '<div></div>'
    );

    $templateCache.put(
      'components/widgets/real-time-data-widget/real-time-data-widget.partial.html',
      '<div></div>'
    );
  }

  function createController() {
    $controller('realTimeDataWidgetCtrl', {
      '$scope': $scope,
      'realTimeDataService': realTimeDataService,
      'comparisonsHelper': comparisonsHelper,
      'realTimeDataWidgetConstants': realTimeDataWidgetConstants,
      'metricConstants': metrics,
      '$translate': $translate,
      '$q': $q,
      'ObjectUtils': ObjectUtils
    });

  }

  function setupBackend(params, singleSite) {
    var endpoint = apiUrl + '/realtime';
    if (!singleSite) {
      endpoint += '/organization';
    }
    var url = buildUrl(endpoint, params);
    $httpBackend.whenGET(url).respond({ result: getMockData() });
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

  function setInitialBackup() {
   $scope.siteId = 80070123;
    var params = {
      orgId: $scope.currentOrganization.organization_id,
      siteId: $scope.siteId,
    };
    setupBackend(params, true);
  }

  function getMockData() {
    var data = [{ "realtimeData": [{ "sites": [{ "id": "0067", "currency": "", "data": [{ "time": "201609280000", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280015", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280030", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280045", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280100", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280115", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280130", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280145", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280200", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280215", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280230", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280245", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280300", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280315", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280330", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280345", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280400", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280415", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280430", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280445", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280500", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280515", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280530", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280545", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280600", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280615", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280630", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280645", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280700", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280715", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280730", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280745", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280800", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280815", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280830", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280845", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280900", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280915", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280930", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280945", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281000", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281015", "enters": "", "exits": "3", "trafficCode": "01", "sales": "0.00", "transactions": 3, "items": 0, "laborHours": 0 }, { "time": "201609281030", "enters": "", "exits": "5", "trafficCode": "01", "sales": "0.00", "transactions": 1, "items": 0, "laborHours": 0 }, { "time": "201609281045", "enters": "", "exits": "6", "trafficCode": "01", "sales": "10.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281100", "enters": "", "exits": "5", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }] }] }], "businessDayData":{ "site_id": "516", "start": "2016-09-28T08:00:00"}, "operatingHoursData": { "start": "2016-09-28T08:00:00", "end": "2016-09-28T23:00:00" }, "enterExit": "Exits" }];
    return data;
  }

  function initCurrentOrg() {
    var orgId = 5777;
    var siteId = 80070123;
    var zoneId = 1000;

    var sitesMock = [{
      site_id: 100,
      customer_site_id: '0067',
      timezone:'Europe/Rome',
      name: 'site1',
      OrganizationResource: {
        id: orgId
    }}];

    var org = {
      'organization_id': orgId,
      'subscriptions': {
        'interior': true,
        'perimeter': true
      },
      'portal_settings': {
        'organization_type': 'Mall'
      }
    };
    $scope.currentOrganization = org;
    $scope.sites = sitesMock;
  }
});
