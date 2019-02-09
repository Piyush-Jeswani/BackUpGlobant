'use strict';

describe('AnalyticsHeaderCtrl', function() {
  var $scope;
  var $controller;

  var currentOrganizationMock;
  var currentSiteMock;
  var currentLocationMock;
  var currentUserMock;
  var currentEntranceMock;

  var customDashboardServiceMock = {
    isNewDashboardAllowed: function(newDashboardName, currentUser) {
      angular.noop(currentUser);
      return false;
    }
  };
  
  var mockStateParams = {
    dateRangeStart: '01-01-2016',
    dateRangeEnd: '30-01-2016',
    comparisonDateRangeStart: '01-01-2016',
    comparisonDateRangeEnd: '30-01-2016'
  };

  it('should hide the location selector if the site has no locations', function() {
    createController({
      'currentLocation': null,
      'locations': []
    });
    expect($scope.areaSelectorIsVisible).toBe(false);
  });

  it('should hide the location selector if the site has only 1 location', function() {
    createController();
    expect($scope.areaSelectorIsVisible).toBe(false);
  });

  it('should show the location selector if the site has more than 1 location', function() {
    var anotherLocationMock = { 'location_id': 200 };
    createController({
      'locations': [currentLocationMock, anotherLocationMock]
    });
    expect($scope.areaSelectorIsVisible).toBe(true);
  });

  it('should store currentOrganization to scope', function() {
    createController();
    expect($scope.currentOrganization).toBe(currentOrganizationMock);
  });

  it('should store currentSite to scope', function() {
    createController();
    expect($scope.currentSite).toBe(currentSiteMock);
  });

  it('should store currentLocation to scope', function() {
    createController();
    expect($scope.currentLocation).toBe(currentLocationMock);
  });

  it('should store current state data to scope', function() {
    var stateDataMock = { 'testData': 'does not matter' };
    createController({
      '$state': {
        'current': {
          'data': stateDataMock
        }
      }
    });
    expect($scope.stateData).toBe(stateDataMock);
  });

  it('should store an empty object to scope if current state has no data object', function() {
    createController({
      '$state': {
        'current': {}
      }
    });
    expect($scope.stateData).toEqual({});
  });

  it('should execute dateRangesLoaded() and return true because dates in state params are set', function() {

    // Mocked customDashboardService attribute of sales and conversion controller
    spyOn(customDashboardServiceMock, 'isNewDashboardAllowed');

    createController({
      '$state': {
        'current': {}
      },
      '$stateParams': mockStateParams,
      'customDashboardService': customDashboardServiceMock
    });  

    $scope.vm.saveDashboard();
    $scope.vm.saveDashboard(null, 'AnyDashboard');

    expect(customDashboardServiceMock.isNewDashboardAllowed).toHaveBeenCalled();  
    expect($scope.dateRangesLoaded).toEqual(true);
  });

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $scope.vm = {}; 
    $scope.vm.saveDashboard = function(){};

    currentOrganizationMock = { organization_id: 1 };
    currentSiteMock = { organization_id: 10 };
    currentLocationMock = { location_id: 100 };
    currentUserMock = {};
    currentEntranceMock = {};
  }));

  function createController(args) {
    return $controller('AnalyticsHeaderCtrl', angular.extend({
      '$scope': $scope,
      '$state': { current: {} },
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'currentLocation': currentLocationMock,
      'locations': [currentLocationMock],
      'currentUser': currentUserMock,
      'currentEntrance': currentEntranceMock
    }, args));
  }
});