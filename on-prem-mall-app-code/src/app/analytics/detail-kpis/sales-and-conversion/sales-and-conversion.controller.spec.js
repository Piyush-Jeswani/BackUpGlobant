'use strict';

describe('SalesAndConversionCtrl', function() {
  var $scope;
  var $controller;
  var LocalizationService;
  var $timeout;

  var exportServiceMock = {
    createExportAndStore: function(params) {
      angular.noop(params);
    },

    isInExportCartWithSettings: function(params) {
      angular.noop(params);
    },
  };

  var customDashboardServiceMock = {
    setSelectedWidget: function(params) {
      angular.noop(params);
    },
    getDashboards: function(currentUser) {
      return currentUser.preferences.custom_dashboards;
    }
  };

  // Will avoid this kind of Jasmine error:
  // TypeError: null is not an object (evaluating '$state.current.views.analyticsMain')
  var mockState = {
    current: {
      views: {
        analyticsMain: {
          controller: 'someController'
        }
      }
    },
    params : {
      dateRangeEnd : {
        diff: function(){
          return 1440;
        }
      }
    },
    go:function(){}
  };

  it('should add currentZone object to scope', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      }
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock
    });

    $timeout.flush();

    $scope.$digest();

    expect($scope.currentZone).toBe(currentZoneMock);
  });

  it('should show the correct set of widgets for site level with site with type of Mall', function() {
    var orgId = 10;
    var siteId = 100;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'type': 'Mall'
    };

    var currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock
    });

    $timeout.flush();

    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'tenant_sales_table_widget',
      'tenant_conversion_table_widget',
      'tenant_ats_table_widget',
      'tenant_upt_table_widget'
    ]);
  });

  it('should show the correct set of widgets for site level with sites with type of Retail', function() {
    var orgId = 10;
    var siteId = 100;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'type': 'Retail'
    };

    var currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock
    });

    $timeout.flush();

    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'sales_widget',
      'conversion_widget',
      'ats_sales_widget',
      'upt_sales_widget'
    ]);
  });


  it('should show the correct set of widgets for zone level', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'type': 'Mall'
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var currentUserMock = {localization: {date_format: {mask: 'MM/DD/YYYY'}}};

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock
    });

    // Ensures viewIsLoaded() returns true
    $scope.dateRangesLoaded = true;

    $timeout.flush();

    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'sales_widget',
      'conversion_widget',
      'ats_sales_widget',
      'upt_sales_widget'
    ]);
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=false', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'type': 'Mall'
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var currentUserMock = {localization: {date_format: {mask: 'MM/DD/YYYY'}}};

    // Mocked ExportService attribute of traffic controller
    spyOn(exportServiceMock, 'createExportAndStore');

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock,
      'ExportService': exportServiceMock
    });

    // Ensures viewIsLoaded() returns true
    $scope.dateRangesLoaded = true;

    $timeout.flush();

    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.exportWidget('traffic', false);

    expect($scope.metricsToShow).toEqual([
      'sales_widget',
      'conversion_widget',
      'ats_sales_widget',
      'upt_sales_widget'
    ]);

    expect(exportServiceMock.createExportAndStore).toHaveBeenCalled();
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=true', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

    var currentOrganizationMock = {
      'organization_id': orgId
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      },
      'type': 'Mall'
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var currentUserMock = {localization: {date_format: {mask: 'MM/DD/YYYY'}}};

    // Mocked customDashboardService attribute of sales and conversion controller
    spyOn(customDashboardServiceMock, 'setSelectedWidget');

    $controller('SalesAndConversionCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock,
      'customDashboardService': customDashboardServiceMock
    });

    // Ensures viewIsLoaded() returns true
    $scope.dateRangesLoaded = true;

    $timeout.flush();

    $scope.$digest();

    $scope.viewData['traffic'] = {currentView: ''};
    $scope.exportWidget('traffic', true);

    expect($scope.metricsToShow).toEqual([
      'sales_widget',
      'conversion_widget',
      'ats_sales_widget',
      'upt_sales_widget'
    ]);

    expect(customDashboardServiceMock.setSelectedWidget).toHaveBeenCalled();
  });

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_, _LocalizationService_,_$timeout_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    LocalizationService = _LocalizationService_;
    $timeout = _$timeout_;
    spyOn(LocalizationService, 'getCurrentDateFormat');
  }));
});
