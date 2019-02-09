'use strict';

describe('VisitorBehaviorCtrl', function() {
  var $scope;
  var $controller;

  var locationMock;
  var siteMock;
  var locationsMock;
  var visitorBehaviorController;
  var scope;
  var currentUserMock;
  var $timeout;
  var mockState = {
    current: {
      views: {
        analyticsMain: {
          controller: 'visitorBehaviorController'
        }
      }
    }
  };

  var exportServiceMock = {
    createExportAndStore: function(params) {
      angular.noop(params);
    }
  };

  var customDashboardServiceMock = {
    setSelectedWidget: function(params) {
      angular.noop(params);
    },
    getDashboards: function(currentUser) {
      return currentUser.preferences.custom_dashboards;
    }
  };

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_,_$timeout_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;

    scope = {};

    var orgId = 10;
    var siteId = 100;
    var locationId = 1000;

    siteMock = {
      'site_id': siteId,
      'organization': {
        'id': orgId
      }
    };

    locationMock = {
      'location_id': locationId,
      'geometry': {
        'coordinates': [[]]
      }
    };

    locationsMock = [];

    currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};
  }));

  it('should store current location object to scope', function() {
    visitorBehaviorController = createController(siteMock, locationMock, locationsMock, {}, currentUserMock);
    
    visitorBehaviorController.dateRangesLoaded = true;

    $timeout.flush();

    expect(visitorBehaviorController.currentLocation).toBe(locationMock);
  });

  it('should store current site object to scope', function() {
    visitorBehaviorController = createController(siteMock, locationMock, locationsMock, {}, currentUserMock);
    expect(visitorBehaviorController.currentSite).toBe(siteMock);
  });

  it('should show the correct set of widgets for a site with only one floor', function() {
    var locations = [locationMock];
    var currentLocation = null;
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time',
      'detail_opportunity',
      'detail_draw_rate',
      'average_percent_shoppers'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct set of widgets for a site with only one floor and no geometry data', function() {
    var locations = [{
      'location_id': 1000
    }];
    var currentLocation = null;
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time',
      'detail_opportunity',
      'detail_draw_rate',
      'average_percent_shoppers'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct set of widgets for a site with multiple floors and no geometry data', function() {
    var locations = [
      {
        'location_id': 1000
      }, {
        'location_id': 2000,
        'location_type': 'Floor'
      }, {
        'location_id': 3000,
        'location_type': 'Floor'
      }
    ];
    var currentLocation = null;
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time',
      'detail_opportunity',
      'detail_draw_rate',
      'average_percent_shoppers'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct set of widgets for a Store', function() {
    var currentLocation = {
      'location_id': 1000,
      'location_type': 'Store'
    };

    var locations = [currentLocation];
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time',
      'detail_opportunity',
      'detail_draw_rate',
      'detail_abandonment_rate'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct set of widgets for a Floor', function() {
    var currentLocation = {
      'location_id': 2000,
      'location_type': 'Floor'
    };

    var locations = [currentLocation];
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'detail_dwell_time',
      'gross_shopping_hours',
      'loyalty'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct set of widgets for an Entrance', function() {
    var currentLocation = {
      'location_id': 2000,
      'location_type': 'Entrance'
    };

    var locations = [currentLocation];
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time',
      'detail_opportunity',
      'detail_draw_rate'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should show the correct default set of widgets for unrecognized location types', function() {
    var currentLocation = {
      'location_id': 2000,
      'location_type': 'BogusLocationType'
    };

    var locations = [currentLocation];
    var expectedWidgets = [
      'visitor_behaviour_traffic',
      'loyalty',
      'gross_shopping_hours',
      'detail_dwell_time'
    ];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    expect(visitorBehaviorController.metricsToShow.length).toEqual(expectedWidgets.length);
    expectedWidgets.forEach(function(widget) {
      expect(visitorBehaviorController.metricsToShow).toContain(widget);
    });
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=false', function() {
    var currentLocation = {
      'location_id': 2000,
      'location_type': 'BogusLocationType'
    };

    var locations = [currentLocation];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    visitorBehaviorController.exportWidget('traffic', false);

    $timeout.flush();
    
    $scope.$digest();

    expect(visitorBehaviorController.currentSite.site_id).toBe(100);
  });

  it('should test exportWidget(metricKey, toDashboard) for toDashboard=true', function() {
    var currentLocation = {
      'location_id': 2000,
      'location_type': 'BogusLocationType'
    };

    var locations = [currentLocation];

    visitorBehaviorController = createController(siteMock, currentLocation, locations, {}, currentUserMock);

    visitorBehaviorController.exportWidget('traffic', true);

    $timeout.flush();
    
    $scope.$digest();

    expect(visitorBehaviorController.currentSite.site_id).toBe(100);
  });


  function createController(currentSite, currentLocation, locations, currentOrganization, currentUser) {
     return $controller('VisitorBehaviorCtrl', {
      '$scope': $scope,
      '$stateParams': {
        'orgId': currentSite.organization.id,
        'siteId': currentSite.site_id,
        'locationId': currentLocation ? currentLocation.location_id : undefined
      },
      '$state': mockState,
      'currentSite': currentSite,
      'currentLocation': currentLocation,
      'currentOrganization': currentOrganization,
      'currentUser' : currentUser,
      'locations': locations,
      'ExportService': exportServiceMock,
      'customDashboardService': customDashboardServiceMock
    });
  }
});