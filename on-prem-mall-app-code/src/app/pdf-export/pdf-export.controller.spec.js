'use strict';

describe('PdfExportCtrl', function () {
  var $rootScope;
  var $scope;
  var $controller;
  var $httpBackend;
  var ExportService;
  var OrganizationResource;
  var SiteResource;
  var $q;
  var currentUserMock = {
    'username': 'test1',
    'preferences': {
      'custom_dashboards': [],
      'custom_period_1': {
        'period_type': 'prior_period'
      },
      'custom_period_2': {
        'period_type': 'prior_year'
      }
    }
  };
  var currentOrganizationMock = {
    organization_id: 6255,
    name: 'testorg',
    subscriptions: {
      'interior': true,
      'perimeter': true,
      'real-time': true
    },
    portal_settings: { currency: '$' },
    default_calendar_id: 1
  };
  var authServiceMock = {
    getCurrentUser: function () {
      var deffered = $q.defer();
      var mockUserObj = { username: 'test1' };
      deffered.resolve(mockUserObj);
      return deffered.promise;
    }
  };
  var siteMock = [{
    name: 'site 1',
    site_id: 80030032,
    organization: {
      id: 6255,
      name: 'testorg'
    }
  },
  {
    name: 'site 2',
    site_id: 80030033,
    organization: {
      id: 6255,
      name: 'testorg'
    }
  }];
  var apiUrl = 'https://api.url';

  function addMockExportCart(exportService) {
    var areaKey = '6255_80030032';
    var dateRange = {
      start: moment.utc('2014-01-01'),
      end: moment.utc('2014-01-07').endOf('day')
    };
    var compare1Range = {
      start: moment.utc('2013-12-21'),
      end: moment.utc('2013-12-27').endOf('day')
    };
    var compare2Range = {
      start: moment.utc('2013-12-18'),
      end: moment.utc('2013-12-24').endOf('day')
    };
    var metricKey = 'traffic';
    exportService.addToExportCartAndStore(areaKey, dateRange, compare1Range, compare2Range, metricKey);
  };
  var googleAnalytics = {
    trackUserEvent: function (shortcut, type) {
      angular.noop(shortcut, type);
    }
  };
  var now = moment().utc();
  var schedules = [{
    data: {
      _id: 1,
      userId: 111,
      orgId: 6255,
      scheduleEndDate: moment(now).add(5, 'week')
    }
  },
  {
    data: {
      _id: 2,
      userId: 222,
      orgId: 6255,
      scheduleEndDate: moment(now).add(8, 'week')
    }
  }];
  
  function createPDFController() {
    var $stateParams = { orgId: 6255 };
    return $controller('PdfExportCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      ExportService: ExportService,
      currentUser: currentUserMock,
      currentOrganization: currentOrganizationMock,
      authService: authServiceMock,
      OrganizationResource: OrganizationResource,
      SiteResource: SiteResource
    });
  };

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {
    module(function ($provide) {
      $provide.constant('apiUrl', apiUrl);
      $provide.value('googleAnalytics', googleAnalytics);
    });
  });

  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _ExportService_, _OrganizationResource_, _SiteResource_, _$stateParams_, _$q_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    ExportService = _ExportService_;
    OrganizationResource = _OrganizationResource_;
    SiteResource = _SiteResource_;
    $q = _$q_;
    addMockExportCart(ExportService);
  }));

  afterEach(function () {
    ExportService.clearExportCart();
  });

  it('should load PdfExportCtlr correctly', function () {
    var controller = createPDFController();
    expect(controller).toBeDefined();
    expect($scope.currentUser).toEqual(currentUserMock);
  });

  it('should have called loadSchedules', function () {
    var url = apiUrl + '/organizations/' + currentOrganizationMock.organization_id + '/scheduled-reports?exportType=pdf';
    $httpBackend.expectGET(url).respond({ result: schedules });
    var controller = createPDFController();
    $httpBackend.flush();
    expect(controller).toBeDefined();
    expect($scope.schedules.length).toBe(2);
    expect($scope.hasNoSchedules()).toBe(false);
  });

  it('should have exportCart populated correctly', function () {
    var controller = createPDFController();
    var currentCart = $scope.exportCart;
    expect(controller).toBeDefined();
    expect(currentCart).toBeDefined();
  });

  it('should load Organizations and sites correctly', function () {
    var orgurl = apiUrl + '/organizations/' + currentOrganizationMock.organization_id;
    $httpBackend.expectGET(orgurl).respond({ result: currentOrganizationMock });
    var controller = createPDFController();
    $httpBackend.flush();
    $scope.$digest();
    expect(controller).toBeDefined();
    expect($scope.organizations).toBeDefined();
    expect($scope.sites).toBeDefined();
  });

  it('should Clear Export cart and set isExportCartEmpty to true', function () {
    var controller = createPDFController();
    $scope.clearExportCart();
    expect(controller).toBeDefined();
    expect($scope.isExportCartEmpty()).toBe(true);
  });

  it('should do exportCurrentCartToPdf correctly', function () {
    spyOn(ExportService, 'exportCurrentCartToPdf').and.callThrough();
    var controller = createPDFController();
    $scope.exportCurrentCartToPdf();
    expect(controller).toBeDefined();
    expect($scope.isExportCartEmpty()).toBe(true);
    expect(ExportService.exportCurrentCartToPdf).toHaveBeenCalled();
  });

  it('should have correct getExportAreaTitle', function () {
    var orgId = currentOrganizationMock.organization_id;
    var siteId = siteMock[0].site_id;
    var controller = createPDFController();
    $scope.organizations = [];
    $scope.organizations[orgId] = currentOrganizationMock;
    var cSites = [];
    cSites[orgId] = []
    cSites[orgId][siteId] = siteMock[0];
    $scope.sites = cSites;
    var title = $scope.getExportAreaTitle('6255_80030032');
    expect(controller).toBeDefined();
    expect(title).toBe('testorg / site 1');
  });

  it('should get correct Site details', function () {
    var controller = createPDFController();
    $scope.sites = siteMock;
    expect(controller).toBeDefined();
    var site = $scope.getSiteById(80030032);
    expect(site.site_id).toBe(80030032);
    expect(site.name).toBe('site 1');
    site = $scope.getSiteById(80030033);
    expect(site.site_id).toBe(80030033);
    expect(site.name).toBe('site 2');
  });

  it('should check widgetIsRenameable correctly', function () {
    var controller = createPDFController();
    var renameble = $scope.widgetIsRenameable('traffic');
    expect(controller).toBeDefined();
    expect(renameble).toBe(true);
    renameble = $scope.widgetIsRenameable('power_hours');
    expect(renameble).toBe(false);
  });

  it('should delete Schedules correctly', function () {
    var delUrl = apiUrl + '/organizations/' + currentOrganizationMock.organization_id + '/scheduled-reports/' + schedules[0]._id
    $httpBackend.expectDELETE(delUrl).respond({ result: {} });
    var url = apiUrl + '/organizations/' + currentOrganizationMock.organization_id + '/scheduled-reports?exportType=pdf';
    $httpBackend.expectGET(url).respond({ result: schedules });

    var controller = createPDFController();
    expect(controller).toBeDefined();
    $scope.deleteSchedule(schedules[0]);  
    $httpBackend.flush();    
  });

});
