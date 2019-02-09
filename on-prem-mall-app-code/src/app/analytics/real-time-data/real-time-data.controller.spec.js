'use strict';

describe('RealTimeDataCtrl', function () {
  var $scope;
  var $controller;
  var LocalizationService;
  var SubscriptionsService;
  var $state;
  var $stateParams;
  var ExportService;
  var $httpBackend
  var $q;
  var apiUrl = 'https://api.url';
  var currentUserMock = { localization: { date_format: 'MM/DD/YYYY' } };
  var OrganizationResource, SiteResource, MallCheckService, utils, metricConstants;
  var sitesMock;
  var currentSiteMock;
  var currentZoneMock;
  var currentOrganizationMock;
  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(function ($rootScope,
    $templateCache,
    _$controller_,
    _LocalizationService_,
    _SubscriptionsService_,
    _MallCheckService_,
    _$state_,
    _$stateParams_,
    _ExportService_,
    _$httpBackend_,
    _$q_,
    _OrganizationResource_,
    _SiteResource_,
    _ObjectUtils_,
    _utils_,
    _metricConstants_
  ) {
    $scope = $rootScope.$new();
    $scope.vm = {};
    $controller = _$controller_;
    LocalizationService = _LocalizationService_;
    SubscriptionsService = _SubscriptionsService_;
    MallCheckService = _MallCheckService_;
    utils = _utils_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    ExportService = _ExportService_;
    $httpBackend = _$httpBackend_;
    OrganizationResource = _OrganizationResource_;
    SiteResource = _SiteResource_;
    $q = _$q_;
    var authUser = { result: [currentUserMock] };
    var orgId = 10;
    initCurrentOrg()
    sitesMock = [{
      site_id: 100,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: orgId
      }},{
      site_id: 101,
      customer_site_id: '1214',
      name: 'site2',
      organization: {
        id: orgId
    }}];

    currentSiteMock = null;

    currentZoneMock = null;

    $httpBackend.whenGET('https://api.url/organizations').respond(currentOrganizationMock);

    $httpBackend.whenGET('https://api.url/auth/currentUser').respond(authUser);
    $httpBackend.whenGET('https://api.url/organizations').respond($scope.currentOrganization);
    $httpBackend.whenGET('https://api.url/organizations/10/sites?all_fields=true').respond({result:sitesMock});
    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});

    LocalizationService.getAllCalendars = function () {
      var deferred = $q.defer();
      var calendars = {
        data: {
          result: {}
        }
      };
      deferred.resolve(calendars);
      return deferred.promise;
    };

    cacheTemplates($templateCache);

    spyOn(LocalizationService, 'getCurrentDateFormat');

  }));

  it('should add currentZone object to scope and set sales and labor parameters false when subscriptions missing', function () {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentSiteMock = {
      site_id: siteId,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: orgId
      }
    };

    var currentZoneMock = {
      id: zoneId
    };

    createController(orgId, siteId, zoneId, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    expect($scope.currentZone).toBe(currentZoneMock);
    expect($scope.orgHasSales).toBe(false);
    expect($scope.orgHasLabor).toBe(false);
  });

  it('should select all sites and set refreshData to be true for widgets could refresh', function () {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentSiteMock = {
      site_id: siteId,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: orgId
      }
    };

    var currentZoneMock = {
      id: zoneId
    };

    var controller = createController(orgId, siteId, zoneId, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.selectAllSites();
    expect($scope.selectedSites.length).toBe(sitesMock.length)
    expect($scope.refreshData).toBe(true);
    expect($scope.currentZone).toBe(currentZoneMock);
    expect($scope.orgHasSales).toBe(false);
    expect($scope.orgHasLabor).toBe(false);
  });

  it('should un-select all sites when selectall called if all sites are selected and set refreshData to be true for widgets could refresh', function () {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentSiteMock = {
      site_id: siteId,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: orgId
      }
    };

    var currentZoneMock = {
      id: zoneId
    };

    var controller = createController(orgId, siteId, zoneId, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.selectedSites = sitesMock;
    $scope.selectAllSites();
    expect($scope.selectedSites.length).toBe(0)
    expect($scope.refreshData).toBe(true);
    expect($scope.currentZone).toBe(currentZoneMock);
    expect($scope.orgHasSales).toBe(false);
    expect($scope.orgHasLabor).toBe(false);
  });

  it('should org level select site when toggle site called and set refreshData to be true for widgets could refresh', function () {

    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.toggleSite(101);
    expect($scope.selectedSites.length).toBe(1);
    expect($scope.selectedSites[0]).toBe(101);
    expect($scope.selectedSites.length).toBe(1);
    expect($scope.selectedSitesInfo[0].site_id).toBe(101);
    expect($scope.refreshData).toBe(true);
    expect($scope.singleSite).toBe(true);
  });

  it('should org level un-select site when toggle site called if site already selected and set refreshData to be true for widgets could refresh', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.selectedSites.push(101);
    $scope.toggleSite(101);
    expect($scope.selectedSites.length).toBe(0);
    expect($scope.selectedSites.length).toBe(0);
    expect($scope.refreshData).toBe(true);
    expect($scope.singleSite).toBe(false);
  });

  it('should org level select site and set single site to false if more then 1 site selected', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.selectedSites.push(100);
    $scope.selectedSitesInfo.push(sitesMock[0]);
    $scope.toggleSite(101);
    expect($scope.selectedSites.length).toBe(2);
    expect($scope.selectedSites[1]).toBe(101);
    expect($scope.selectedSites.length).toBe(2);
    expect($scope.selectedSitesInfo[1].site_id).toBe(101);
    expect($scope.refreshData).toBe(true);
    expect($scope.singleSite).toBe(false);
  });

  it('should org level set selected tags when filtered and set selectedtagssites when setSelectedTagsSites called', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    var filters = [
      { '5886838dcd5144965a73cb8e': true },
      { '5886838dcd5144965a73cb8e':"Z- West" },
      { District:1 }
    ]
    $scope.setSelectedFilters(filters);
    expect($scope.selectedTags[0]).toBe('5886838dcd5144965a73cb8e');
    var selectedSites = [{
      site_id: 100,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: currentOrganizationMock.organization_id
    }}];
    
    $scope.setSelectedTagsSites(selectedSites);
    expect($scope.selectedTagsSites.length).toBe(1);
    expect($scope.selectedTagsSites[0].site_id).toBe(100);
    expect($scope.refreshData).toBe(true);
    expect($scope.singleSite).toBe(true);
  });

  it('should org level not to disable sites dropdown', function () {    
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    
    var flag = $scope.siteDropdownIsDisabled();
    expect(flag).toBe(false);
  });

  it('should export widget', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    var metricKey = 'real_time_interval_data_widget';
    $scope.exportWidget(metricKey);
    var flag = $scope.widgetIsExported(metricKey);
    expect(flag).toBe(true);
  });

  it('should schedule to export current view', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    var metricKey = 'real_time_interval_data_widget';
    $scope.scheduleExportCurrentViewToPdf();
    var flag = $scope.widgetIsExported(metricKey);
    expect(flag).toBe(true);
  });

  it('should load org sites if it is not site level and no org sites defined', function () {
    var controller = createController(currentOrganizationMock.organization_id, null, null, currentOrganizationMock, currentSiteMock, currentUserMock, currentZoneMock, sitesMock);
    $scope.$digest();
    $httpBackend.flush();
    expect($scope.sites.length).toBe(2);
    expect($scope.sites[0].site_id).toBe(100);
  });

  it('should add currentZone object to scope and set sales and labor parameters true when subscriptions exist', function () {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

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

    var site = {
      site_id: siteId,
      customer_site_id: '1213',
      name: 'site1',
      organization: {
        id: orgId
      },
      subscriptions: {
        sales: true,
        labor: true
      }
    };

    var zone = {
      id: zoneId
    };

    $httpBackend.whenGET('https://api.url/organizations').respond(org);

    createController(orgId, siteId, zoneId, org, site, currentUserMock, zone, sitesMock);
    $scope.$apply();
    expect($scope.currentZone).toBe(zone);
    expect($scope.orgHasSales).toBe(true);
    expect($scope.orgHasLabor).toBe(true);
  });

  it('should  set metrics even if org has perimeter', function () {
    var orgId = 10;
    var siteId = 100;

    var currentOrganizationMock = {
      'organization_id': orgId,
      'subscriptions': {
        'interior': true,
        'perimeter': true
      },
      'portal_settings': {
        'organization_type': 'Mall'
      }
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'zones': [
        {
          'name': 'Entrance 1',
          'type': 'Entrance'
        },
        {
          'name': 'Tenant 1',
          'type': 'TenantCommon'
        },
        {
          'name': 'Other zone',
          'type': 'MallPerim'
        }
      ]
    };

    var currentUserMock = { localization: { date_format: 'MM/DD/YYYY' } };

    var sitesMock = [{
      'site_id': siteId,
      'organization': {
        'id': orgId
      }},{
      'site_id': 101,
      'organization': {
        'id': orgId
    }}];

    $httpBackend.whenGET('https://api.url/organizations').respond(currentOrganizationMock);

    createController(orgId, siteId, null, currentOrganizationMock, currentSiteMock, currentUserMock, null, sitesMock);

    expect($scope.metricsToShow).toEqual( [ 'real_time_data_widget', 'real_time_interval_data_widget' ]);
  });

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/home/home.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/analytics.partial.html',
      '<div></div>'
    );
  }

  function createController(orgId, siteId, zoneId, org, site, user, zone, sites) {
    return $controller('RealTimeDataCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      'currentOrganization': org,
      'currentSite': site,
      'currentZone': zone,
      'sites': sites,
      'currentUser': user,
      'SiteResource': SiteResource
    });
  }

  function initCurrentOrg() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    currentOrganizationMock = {
      'organization_id': orgId,
      'subscriptions': {
        'interior': true,
        'perimeter': true
      },
      'portal_settings': {
        'organization_type': 'Mall'
      }
    };
    $scope.currentOrganization = currentOrganizationMock;
  }
});
