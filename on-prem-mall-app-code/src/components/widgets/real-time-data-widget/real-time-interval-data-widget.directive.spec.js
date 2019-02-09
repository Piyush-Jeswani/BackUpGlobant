'use strict';
describe('realTimeIntervalDataWidgetDirective', function () {
  var $scope;
  var $timeout;
  var $compile;
  var $httpBackend;
  var $rootScope;
  var apiUrl = 'https://api.url';
  var currentUserMock = { localization: { date_format: 'MM/DD/YYYY' } };
  var currentSiteMock;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    var googleAnalytics = {
      sendRequestTime: function () {
        angular.noop()
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));

  beforeEach(inject(function (_$rootScope_, $templateCache, _$compile_, _$timeout_,
    _$httpBackend_
  ) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $scope.currentUser = currentUserMock;
    $httpBackend = _$httpBackend_;
    var authUser = { result: [currentUserMock] };
    initCurrentOrg();
    $timeout = _$timeout_;
    $scope.$apply();
    setInitialBackup();
    cacheTemplates($templateCache);
    currentSiteMock = { organization_id: 5777 };

    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
    $httpBackend.whenGET('https://api.url/auth/currentUser').respond(authUser);
    $httpBackend.whenGET('https://api.url/organizations').respond([$scope.currentOrganization]);
    $httpBackend.whenGET('https://api.url/organizations/10').respond($scope.currentOrganization);
    $httpBackend.whenGET('https://api.url/organizations/5777/sites/80070123?all_fields=true').respond(currentSiteMock);

  }));

  describe('populateOptions', function () {
    it('should have options', function () {
      var selector = renderDirectiveAndDigest();

      $scope.$digest();

      $timeout.flush();

      expect(selector.hasSales).toBe(true);
      expect(selector.totalTranskey).toBe('common.TOTAL');
      expect(selector.currentOrganization.organization_id).toBe(5777);
    });
  });

  describe('populateData', function () {
    it('should have data for org level', function () {
      setCurrentOrgWithRealTimeSubscription();
      var params = {
        orgId: 5777,
      };
      setupBackend(params, false);
      var selector = renderDirectiveAndDigest();
      $httpBackend.flush();

      expect(selector.hasData).toBe(true);
      expect(selector.hasTableData).toBe(true);
    });

    it('should error set vm data error parameters for org level', function () {
      setCurrentOrgWithRealTimeSubscription();
      var params = {
        orgId: 5777,
      };
      setupBackend(params, false, true);
      var selector = renderDirectiveAndDigest();
      $httpBackend.flush();

      expect(selector.hasData).toBe(false);
      expect(selector.hasTableData).toBe(false);
      expect(selector.requestFailed).toBe(true);
    });

    it('should have data for org level when it is pdf', function () {
      $rootScope.pdf = true;
      $scope.siteId = null;
      setCurrentOrgWithRealTimeSubscription();
      var params = {
        orgId: 5777,
      };
      setupBackendForOrg(params, false).respond({ result: getMockData() });
      var selector = renderDirectiveAndDigest();
      $httpBackend.flush();
      expect(selector.tableData[0].traffic).toBe(6);
      expect(selector.hasData).toBe(true);
      expect(selector.hasTableData).toBe(true);
      expect(selector.hasTableData).toBe(true);
      $rootScope.pdf = true;
    });

    it('should have data for org level when it is pdf and it should load sites and current org when it is not sent', function () {
      $rootScope.pdf = true;
      $scope.siteId = null;
      $scope.orgLevel = true;
      setCurrentOrgWithRealTimeSubscription();
      var params = {
        orgId: 5777,
      };

      $httpBackend.whenGET('https://api.url/organizations/5777').respond({result:[$scope.currentOrganization]});
      setupBackendForOrg(params, false).respond({ result: getMockData() });
      var selector = renderDirectiveAndDigestToLoadSitesAndOrg();
      $httpBackend.flush();

      expect(selector.tableData[0].traffic).toBe(6);
      expect(selector.hasData).toBe(true);
      expect(selector.hasTableData).toBe(true);
      expect(selector.hasTableData).toBe(true);
      $rootScope.pdf = true;
    });

    it('should have data for single site', function () {
      $scope.siteId = 80070123;
      $scope.singleSite = true;
      setCurrentOrgWithRealTimeSubscription();

      $scope.$apply();
      var params = {
        orgId: 5777,
        siteId: $scope.siteId,
      };
      setupBackend(params, true);
      var selector = renderSingleSiteDirectiveAndDigest();
      $httpBackend.flush();
      $scope.$apply();
      expect(selector.hasData).toBe(true);
      expect(selector.chartData.labels.length).toBe(4);
    });
  });

  describe('getSiteName()', function () {
    it('should test getSiteName(siteId) with siteId set to 1 with no name set', function () {
      var selector = renderSingleSiteDirectiveAndDigest();

      expect(selector.getSiteName(1)).toBe(1);
    });
  });

  describe('getSiteName()', function () {
    it('should test getSiteName(siteId) with siteId set to 0067 with name set', function () {
      var selector = renderSingleSiteDirectiveAndDigest();

      expect(selector.getSiteName('0067')).toBe('0067-site1');
    });
  });

  describe('setupWatch()', function () {
    it('should test generation of businessDayChanged event', function () {
      var selector = renderSingleSiteDirectiveAndDigest();

      $scope.$broadcast('businessDayChanged', 'test');

      $timeout.flush();
      expect(selector.businessDays).toBe('test');
      expect(selector.loaded).toBe(false);
    });
  });

  describe('setupWatch()', function () {
    it('should test generation of businessDayChanged event with organisation set to null', function () {
      var selector = renderSingleSiteDirectiveAndDigest();

      selector.currentOrganization = null;
      $scope.$broadcast('businessDayChanged', 'test');

      expect(selector.businessDays).toBe('test');
      expect(selector.loaded).toBe(false);
    });
  });

  function renderSingleSiteDirectiveAndDigest() {
    var orgId = 5777;
    var siteId = 80070123;
    $scope.selectedSites = [];
    $scope.selectedSites.push(siteId);
    var sitesMock = [{
      site_id: siteId,
      timezone: 'Europe/Rome',
      customer_site_id: '0067',
      name: 'site1',
      OrganizationResource: {
        id: orgId
      }
    }];
    $scope.selectedSitesInfo = sitesMock;

    var element = angular.element(
      '  <real-time-interval-data-widget' +
      '  org-id="orgId"' +
      '  current-user="currentUser"' +
      '  current-organization="currentOrganization"' +
      '  site-id="siteId"' +
      '  sites="sites"' +
      '  selected-sites="selectedSites"' +
      '  selected-sites-info="selectedSitesInfo"' +
      '  single-site="true"' +
      '  has-labor="false"' +
      '  site-has-labor="false"' +
      '  has-sales="true"' +
      '  site-has-sales="true"' +
      '  </real-time-interval-data-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('realTimeIntervalDataWidget');
  }

  function renderDirectiveAndDigest() {
    var element = angular.element(
      '  <real-time-interval-data-widget' +
      '  org-id="orgId"' +
      '  current-user="currentUser"' +
      '  current-organization="currentOrganization"' +
      '  site-id=""' +
      '  sites="sites"' +
      '  has-labor="true"' +
      '  has-sales="true"' +
      '  </real-time-interval-data-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('realTimeIntervalDataWidget');
  }

  function renderDirectiveAndDigestToLoadSitesAndOrg() {
    var element = angular.element(
      '  <real-time-interval-data-widget' +
      '  org-id="orgId"' +
      '  current-user="currentUser"' +
      '  site-id=""' +
      '  has-labor="true"' +
      '  has-sales="true"' +
      '  </real-time-interval-data-widget>'
    );

    $compile(element)($scope);
    $scope.$digest();

    return element.controller('realTimeIntervalDataWidget');
  }

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
      'components/widgets/real-time-data-widget/real-time-interval-data-widget.partial.html',
      '<div></div>'
    );
  }

  function setupBackend(params, singleSite, error) {
    var endpoint = apiUrl + '/realtime';
    if (!singleSite) {
      endpoint += '/organization';
    }
    var url = buildUrl(endpoint, params);

    if(error === true) {
      $httpBackend.whenGET(url).respond(500);

    }

    if (!singleSite) {
      $httpBackend.whenGET(url).respond({ result: getMockData() });
    }
    else {
      $httpBackend.whenGET(url).respond({ result: getMockDataSingleSite() });      
    }
 
  }

  function setupBackendForOrg(params, singleSite) {

    var url1 = getUrl(params, singleSite);//buildUrl(endpoint, params);

    return $httpBackend.when('GET', function (url) {
      return url.indexOf(url1 !== -1);
    })
  }

  function getUrl(params, singleSite) {
    var url = apiUrl + '/realtime';

    //if no site id defined or we have multiple sites selected then we need to call org level so add organization to the url
    if (!singleSite) {
      url += '/organization';
    }

    return url;
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
    var date = moment();
    var businessStart = angular.copy(date.hours(date.hours() - 2));
    var operartingHourStart = angular.copy(date.hours(date.hours() - 1));
    var operartingHourEnd = angular.copy(date.hours(date.hours() + 1));
    var result = [{
      realtimeData:
        [{
          id: '0067',
          currency: '',
          data: [
            { 'time': businessStart.format('YYYYMMDDHHmm'), 'enters': '5', 'exits': '6', 'trafficCode': '01', 'sales': '30.00', 'transactions': 4, 'items': 0, 'laborHours': 5 },
            { 'time': operartingHourStart.format('YYYYMMDDHHmm'), 'enters': '4', 'exits': '8', 'trafficCode': '01', 'sales': '60.00', 'transactions': 3, 'items': 0, 'laborHours': 5 }
          ]
        }],
      businessDayData: { site_id: '0067', start: businessStart },
      operatingHoursData: { start: operartingHourStart, end: operartingHourEnd },
      enterExit: 'exits'
    }];
    return result;
  }

  function getMockDataSingleSite() {

    var data = [{ "realtimeData": [{ "sites": [{ "id": "0067", "currency": "", "data": [{ "time": "201609280000", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280015", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280030", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280045", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280100", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280115", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280130", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280145", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280200", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280215", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280230", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280245", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280300", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280315", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280330", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280345", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280400", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280415", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280430", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280445", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280500", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280515", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280530", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280545", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280600", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280615", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280630", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280645", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280700", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280715", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280730", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280745", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280800", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280815", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280830", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280845", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280900", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280915", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280930", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609280945", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281000", "enters": "", "exits": "", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281015", "enters": "", "exits": "3", "trafficCode": "01", "sales": "0.00", "transactions": 3, "items": 0, "laborHours": 0 }, { "time": "201609281030", "enters": "", "exits": "5", "trafficCode": "01", "sales": "0.00", "transactions": 1, "items": 0, "laborHours": 0 }, { "time": "201609281045", "enters": "", "exits": "6", "trafficCode": "01", "sales": "10.00", "transactions": 0, "items": 0, "laborHours": 0 }, { "time": "201609281100", "enters": "", "exits": "5", "trafficCode": "01", "sales": "0.00", "transactions": 0, "items": 0, "laborHours": 0 }] }] }], "businessDayData":{ "site_id": "516", "start": "2016-09-28T08:00:00"}, "operatingHoursData": { "start": "2016-09-28T08:00:00", "end": "2016-09-28T23:00:00" }, "enterExit": "Exits" }];
    return data;
  }

  function initCurrentOrg() {
    var orgId = 5777;
    $scope.orgId = orgId;
    var siteId = 80070123;

    var sitesMock = [{
      site_id: siteId,
      customer_site_id: '0067',
      name: 'site1',
      OrganizationResource: {
        id: orgId
      }
    }];

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

  function setCurrentOrgWithRealTimeSubscription() {
    var orgId = 5777;
    var siteId = 80070123;

    var sitesMock = [{
      site_id: siteId,
      customer_site_id: '0067',
      timezone: 'Europe/Rome',
      name: 'site1',
      OrganizationResource: {
        id: orgId
      }
    }];

    var org = {
      'organization_id': orgId,
      'subscriptions': {
        'interior': true,
        'perimeter': true,
        'realtime_sales': true,
        'realtime_traffic': true
      },
      'portal_settings': {
        'organization_type': 'Mall'
      }
    };
    $scope.sites = sitesMock;
    $scope.currentOrganization = org;
  }
});
