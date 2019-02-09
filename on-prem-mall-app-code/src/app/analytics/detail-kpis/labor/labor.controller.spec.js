'use strict';

describe('LaborCtrl', function() {
  var $scope;
  var $controller;
  var LocalizationService;
  var $timeout;
  var $stateDateDiffMock = {
    'params' : {
      'dateRangeEnd' : {
        'diff': function(){
          return 1440;
        }
      }
    }
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

    $controller('LaborCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': $stateDateDiffMock,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock
    });

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

    var currentUserMock = {localization: {date_format: {mask: 'MM/DD/YYYY'}}};

    $controller('LaborCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': $stateDateDiffMock,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock
    });

    expect($scope.metricsToShow).toEqual([
      'tenant_labor_hours_table_widget',
      'tenant_star_labor_table_widget'
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

    var currentUserMock = {localization: {date_format: {mask: 'MM/DD/YYYY'}}};

    $controller('LaborCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': $stateDateDiffMock,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock
    });

    $timeout.flush();
    $scope.$digest();
    
    expect($scope.metricsToShow).toEqual([
      'labor_hours_widget',
      'star_labor_widget'
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

    $controller('LaborCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId
      },
      '$state': $stateDateDiffMock,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock
    });

    expect($scope.metricsToShow).toEqual([
      'labor_hours_widget',
      'star_labor_widget'
    ]);
  });

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_, _LocalizationService_,_$timeout_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    LocalizationService = _LocalizationService_;
    spyOn(LocalizationService, 'getCurrentDateFormat');
    $timeout = _$timeout_;
  }));
});