'use strict';

describe('TrafficCtrl', function() {
  var $scope;
  var $controller;
  var LocalizationService;
  var $timeout;
  var $q;

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
    go : function(){
      return true;
    }
  };

  var currentUserMock = {
    localization: {date_format: 'MM/DD/YYYY'},
    preferences: {
      custom_dashboards:[],
      weather_reporting:false,
      custom_period_1 : {
        period_type : 'prior_period'
      },
      custom_period_2 : {
        period_type : 'prior_year'
      }
    }
  };

  it('should add currentZone object to scope', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

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
      }
    };

    var currentZoneMock = {
      'id': zoneId
    };

    $controller('TrafficCtrl', {
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
      'currentEntrance': null
    });

    $timeout.flush();
    $scope.$digest();

    expect($scope.currentZone).toBe(currentZoneMock);
  });

  it('should show the correct set of widgets for site level with sites that have perimeter', function() {
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

    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock,
      'currentEntrance': null
    });

    $timeout.flush();
    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'tenant_traffic_table_widget',
      'other_areas_traffic_table_widget'
    ]);
  });

  it('should not show Tenant summary if site has no tenant zones', function() {
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
          'name': 'Other zone',
          'type': 'MallPerim'
        }
      ]
    };

    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock,
      'currentEntrance': null
    });

    $timeout.flush();
    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'other_areas_traffic_table_widget'
    ]);
  });

  it('should show the correct set of widgets for site level with sites that do not have perimeter', function() {
    var orgId = 10;
    var siteId = 100;

    var currentOrganizationMock = {
      'organization_id': orgId,
      'subscriptions': {
        'interior': true,
        'perimeter': false
      },
      'portal_settings': {
        'organization_type': 'Mall'
      }
    };

    var currentSiteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      }
    };

    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': null,
      'currentUser': currentUserMock,
      'currentEntrance': null
    });

    $timeout.flush();
    $scope.$digest();

    expect($scope.metricsToShow).toEqual([
      'traffic',
      'traffic_per_weekday'
    ]);
  });

  describe('zone level', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;
    var businessDays = false;

    var currentOrganizationMock, currentSiteMock, currentZoneMock;

    beforeEach(function() {
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
  
      currentSiteMock = {
        'site_id': siteId,
        'organization': {
          'id': orgId
        }
      };
  
      currentZoneMock = {
        'id': zoneId
      };
    });


    it('should not show entrance contribution widgets if there are no tmps defined', function() {
      currentZoneMock.tmps = [ ];
      
      $controller('TrafficCtrl', {
        '$scope': $scope,
        '$stateParams': {
          'orgId': orgId,
          'siteId': siteId,
          'zoneId': zoneId,
          'businessDays': businessDays
        },
        '$state': mockState,
        'currentOrganization': currentOrganizationMock,
        'currentSite': currentSiteMock,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'currentEntrance': null
      });
  
      $timeout.flush();
      $scope.$digest();
  
      expect($scope.metricsToShow).toEqual([
        'traffic',
        'power_hours',
        'traffic_per_weekday'
      ]);
    });

    it('should not show entrance contribution widgets if there is only one tmp', function() {
      currentZoneMock.tmps = [ {id: 1, name: 'one lonely tmp'} ];
      
      $controller('TrafficCtrl', {
        '$scope': $scope,
        '$stateParams': {
          'orgId': orgId,
          'siteId': siteId,
          'zoneId': zoneId,
          'businessDays': businessDays
        },
        '$state': mockState,
        'currentOrganization': currentOrganizationMock,
        'currentSite': currentSiteMock,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'currentEntrance': null
      });
  
      $timeout.flush();
      $scope.$digest();
  
      expect($scope.metricsToShow).toEqual([
        'traffic',
        'power_hours',
        'traffic_per_weekday'
      ]);
    });

    it('should show entrance contribution widgets if there are at least two tmps', function() {
      currentZoneMock.tmps = [ {id: 1, name: 'one tmp' }, { id: 2, name: 'two tmps'} ];
      
      $controller('TrafficCtrl', {
        '$scope': $scope,
        '$stateParams': {
          'orgId': orgId,
          'siteId': siteId,
          'zoneId': zoneId,
          'businessDays': businessDays
        },
        '$state': mockState,
        'currentOrganization': currentOrganizationMock,
        'currentSite': currentSiteMock,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'currentEntrance': null
      });
  
      $timeout.flush();
      $scope.$digest();
  
      expect($scope.metricsToShow).toEqual([
        'traffic',
        'entrance_contribution',
        'entrance_contribution_pie',
        'power_hours',
        'traffic_per_weekday'
      ]);
    });

    it('should show the correct set of widgets for zone level', function() {  
      $controller('TrafficCtrl', {
        '$scope': $scope,
        '$stateParams': {
          'orgId': orgId,
          'siteId': siteId,
          'zoneId': zoneId,
          'businessDays': businessDays
        },
        '$state': mockState,
        'currentOrganization': currentOrganizationMock,
        'currentSite': currentSiteMock,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'currentEntrance': null
      });
  
      $timeout.flush();
      $scope.$digest();
  
      expect($scope.metricsToShow).toEqual([
        'traffic',
        'power_hours',
        'traffic_per_weekday'
      ]);
    });
  });



  it('it should test all metrics to show', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

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
      }
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var businessDays = true;

    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId,
        'businessDays': businessDays
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock,
      'currentEntrance': null
    });

    $scope.metricsToShow = [
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'kpi_summary_widget_container',
      'tenant_traffic_table_widget',
      'daily_performance_widget'
    ];

    $scope.updateSelectedWeatherMetrics();
    $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
    $scope.showWeatherMetrics = true;
    $scope.dateRangesLoaded = true;
    $timeout.flush();
    $scope.$digest();

    

    expect($scope.metricsToShow).toEqual([
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'kpi_summary_widget_container',
      'tenant_traffic_table_widget',
      'daily_performance_widget'
    ]);
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=false', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

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
      }
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var businessDays = true;

    // Mocked ExportService attribute of traffic controller
    spyOn(exportServiceMock, 'createExportAndStore');
    
    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId,
        'businessDays': businessDays
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock,
      'ExportService': exportServiceMock,
      'currentEntrance': null
    });

    $scope.metricsToShow = [
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'kpi_summary_widget_container',
      'tenant_traffic_table_widget',
      'daily_performance_widget'
    ];

    $scope.updateSelectedWeatherMetrics();
    $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
    $scope.showWeatherMetrics = true;
    $scope.dateRangesLoaded = true;  

    $timeout.flush();

    $scope.exportWidget('traffic', false);

    expect(exportServiceMock.createExportAndStore).toHaveBeenCalled();
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=true', function() {
    var orgId = 10;
    var siteId = 100;
    var zoneId = 1000;

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
      }
    };

    var currentZoneMock = {
      'id': zoneId
    };

    var businessDays = true;

    // Mocked customDashboardService attribute of traffic controller
    spyOn(customDashboardServiceMock, 'setSelectedWidget');
    
    $controller('TrafficCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': orgId,
        'siteId': siteId,
        'zoneId': zoneId,
        'businessDays': businessDays
      },
      '$state': mockState,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentZone': currentZoneMock,
      'currentUser': currentUserMock,
      'customDashboardService': customDashboardServiceMock,
      'currentEntrance': null
    });

    $scope.metricsToShow = [
      'traffic',
      'entrance_contribution',
      'entrance_contribution_pie',
      'power_hours',
      'traffic_per_weekday',
      'kpi_summary_widget_container',
      'tenant_traffic_table_widget',
      'daily_performance_widget'
    ];

    $scope.updateSelectedWeatherMetrics();
    $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
    $scope.showWeatherMetrics = true;
    $scope.dateRangesLoaded = true;  

    $timeout.flush();

    $scope.exportWidget('traffic', true);

    expect(customDashboardServiceMock.setSelectedWidget).toHaveBeenCalled();
  });
  
  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_,_LocalizationService_,_$timeout_,_$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;

    $scope.vm = {};
    $scope.vm.customDashboards = function() {};

    LocalizationService = _LocalizationService_;
    spyOn(LocalizationService, 'getCurrentDateFormat');
    $timeout = _$timeout_;
    $q=_$q_;
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
  }));
});