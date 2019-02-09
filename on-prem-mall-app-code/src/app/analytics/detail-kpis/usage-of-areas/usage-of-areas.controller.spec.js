'use strict';

describe('UsageOfAreasCtrl', function() {
  var $scope;
  var $controller;
  var currentLocationMock;
  var locationWithGeometry;
  var currentSiteMock;
  var currentOrganizationMock;
  var currentUserMock;
  var apiUrl;
  var $httpBackend;
  var $timeout;
  var $mockState;
  var $rootScope;

  var supportedLocationTypes = [
    'Store',
    'Corridor',
    'Entrance',
    'Department'
  ];
  beforeEach(function() {
    apiUrl = 'https://api.url';
  });
  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));
  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));
  beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _$timeout_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_; 
    $rootScope = _$rootScope_;

    $mockState = {
      go: function(stateName) {
        angular.noop(stateName)
      },
      rangeSelected: 'custom'
    }

    currentLocationMock = {
      location_id: 'bar'
    };

    currentOrganizationMock = {
      organization_id: 10
    };

    currentUserMock = {
      localization: {
        date_format: 'MM/DD/YYYY'
      },
      preferences: {
        calendar_id: 1
      },
      username: 'test1'
    };

    locationWithGeometry = {
      'location_id': 'boo',
      'geometry': {
        'coordinates': [
          '[[-115.17621467669,36.09350667934],[-115.17616570426,36.0934187308]]'
        ],
        'type': 'Polygon'
      },
    };

    currentSiteMock = {
      organization: { id: 'foo' },
      site_id: 'foobar'
    };
  }));


  describe('widgetsToShow with sites that have geometry', function() {
    it('should contain heatmap widgets for site if locationId is not defined in $stateParams', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentOrganization': currentOrganizationMock,
        'currentSite': currentSiteMock,
        'locations': [currentLocationMock, locationWithGeometry],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      expect($scope.widgetsToShow.length).toBe(3);
      expect($scope.widgetsToShow).toContain('traffic_percentage_location');
      expect($scope.widgetsToShow).toContain('first_visits');
      expect($scope.widgetsToShow).toContain('one_and_done');
    });

    it('should contain heatmap widgets for single location if locationId is defined in $stateParams', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [currentLocationMock, locationWithGeometry],
        '$stateParams': {
          'locationId': 'foo'
        },
        'currentUser': currentUserMock
      });

      $timeout.flush();

      $scope.$digest();

      expect($scope.widgetsToShow.length).toBe(3);
      expect($scope.widgetsToShow).toContain('traffic_percentage_correlation');
      expect($scope.widgetsToShow).toContain('locations_after');
      expect($scope.widgetsToShow).toContain('locations_before');
    });
  });

  describe('widgetsToShow with sites that do not have geometry', function() {
    it('should contain table widgets for site if locationId is not defined in $stateParams', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [currentLocationMock, { location_id: 'boo' }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      $timeout.flush();

      $scope.$digest();

      expect($scope.widgetsToShow.length).toBe(3);
      expect($scope.widgetsToShow).toContain('traffic_percentage_location_table');
      expect($scope.widgetsToShow).toContain('first_visits_table');
      expect($scope.widgetsToShow).toContain('one_and_done_table');
    });

    it('should contain table widgets for single location if locationId is defined in $stateParams', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [currentLocationMock, { location_id: 'boo' }],
        '$stateParams': {
          'locationId': 'foo'
        },
        'currentUser': currentUserMock
      });

      $timeout.flush();

      $scope.$digest();

      expect($scope.widgetsToShow.length).toBe(3);
      expect($scope.widgetsToShow).toContain('traffic_percentage_correlation_table');
      expect($scope.widgetsToShow).toContain('locations_after_table');
      expect($scope.widgetsToShow).toContain('locations_before_table');
    });
  });

  describe('locationTypes', function() {
    it('should contain all supported location types if $stateParams.locationTypeFilter is empty', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [currentLocationMock, { location_id: 'boo' }],
        '$stateParams': {
          'locationId': 'foo'
        },
        'currentUser': currentUserMock
      });

      $timeout.flush();

      $scope.$digest();

      expect($scope.locationTypes.length).toBe(supportedLocationTypes.length);
      supportedLocationTypes.forEach(function(locationType) {
        expect($scope.locationTypes).toContain(locationType);
      });
    });

    it('should only contain the location type in $stateParams.locationTypeFilter, if defined', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': currentLocationMock,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [currentLocationMock, { location_id: 'boo' }],
        '$stateParams': {
          'locationId': 'foo',
          'locationTypeFilter': 'Entrance'
        },
        'currentUser': currentUserMock
      });

      expect($scope.locationTypes.length).toBe(1);
      expect($scope.locationTypes).toContain('Entrance');
    });
  });

  describe('locationTypeOptions', function() {
    it('should contain all available location types if the site has them all', function() {
      // Generate locations of all supported types
      var locations = supportedLocationTypes.map(function(locationType, index) {
        return {
          'location_id': index,
          'location_type': locationType
        };
      });

      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': locations,
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      var locationTypes = $scope.locationTypeOptions.map(function(option) {
        return option.locationType;
      });

      expect(locationTypes.length).toBe(supportedLocationTypes.length);
      supportedLocationTypes.forEach(function(locationType) {
        expect(locationTypes).toContain(locationType);
      });
    });

    it('should not contain location types that the site does not have', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Store'
        }, {
          'location_id': 2,
          'location_type': 'Corridor'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      var locationTypes = $scope.locationTypeOptions.map(function(option) {
        return option.locationType;
      });

      $timeout.flush();

      $scope.$digest();

      expect(locationTypes).not.toContain('Entrance');
    });

    it('should contain all supported location types that the site has', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Store'
        }, {
          'location_id': 2,
          'location_type': 'Entrance'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      var locationTypes = $scope.locationTypeOptions.map(function(option) {
        return option.locationType;
      });

      $timeout.flush();

      $scope.$digest();

      expect(locationTypes).toContain('Store');
      expect(locationTypes).toContain('Entrance');
    });
  });

  describe('siteHasCompatibleLocations', function() {

    it('should show one and done widgets if compatible locations are available', function() {

      $httpBackend.expectGET(apiUrl+'/calendars').respond(200);
      $httpBackend.expectGET(apiUrl+'/organizations').respond(200);
      $httpBackend.expectGET(apiUrl+'/auth/currentUser').respond(200);

      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Store'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      $scope.$digest();

      var hasCompatibleLocations = $scope.siteHasCompatibleLocations('one_and_done');

      $timeout.flush();

      $scope.$digest();

      expect( hasCompatibleLocations ).toBe(true);

    });

    it('should not show one and done widgets if compatible locations are not available', function() {

      $httpBackend.expectGET(apiUrl+'/calendars').respond(200);
      $httpBackend.expectGET(apiUrl+'/organizations').respond(200);
      $httpBackend.expectGET(apiUrl+'/auth/currentUser').respond(200);

      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Entrance'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      $scope.$digest();

      var hasCompatibleLocations = $scope.siteHasCompatibleLocations('one_and_done');

      $timeout.flush();

      $scope.$digest();
          
      expect( hasCompatibleLocations ).toBe(false);


    });

    it('should call scheduleExportCurrentViewToPdf() successfully', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        '$state': $mockState,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Entrance'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      spyOn($mockState, 'go');

      $scope.selectedFloors['traffic_percentage_location_table'] = 1;
      $rootScope.$broadcast('scheduleExportCurrentViewToPdf');

      $timeout.flush();
      
      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect($mockState.go).toHaveBeenCalledWith('pdfexport', { orgId: 10, view: 'schedule'});
    });

    it('should test exportWidget(metricKey, toDashboard) for toDashboard=false', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        '$state': $mockState,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Entrance'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      $scope.exportWidget('traffic', false);

      $timeout.flush();
      
      $scope.$digest();

      expect($scope.currentSite.site_id).toBe('foobar');
    });

    it('should test exportWidget(metricKey, toDashboard) for toDashboard=true', function() {
      $controller('UsageOfAreasCtrl', {
        '$scope': $scope,
        '$state': $mockState,
        'currentLocation': null,
        'currentSite': currentSiteMock,
        'currentOrganization': currentOrganizationMock,
        'locations': [{
          'location_id': 1,
          'location_type': 'Entrance'
        }],
        '$stateParams': {},
        'currentUser': currentUserMock
      });

      $scope.exportWidget('traffic', true);

      $timeout.flush();
      
      $scope.$digest();

      expect($scope.currentUser.username).toBe('test1');
    });

  });

});