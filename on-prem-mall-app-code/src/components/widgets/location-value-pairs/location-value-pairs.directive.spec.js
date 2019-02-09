'use strict';

describe('locationValuePairsDirective', function() {
  var $scope;
  var $compile;

  var locationTypeColorsMock = {
    // Note: these might not be the correct colors.
    'Floor': 'red',
    'Store': 'green',
    'Corridor': 'orange',
    'default': 'gray'
  };

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module(function($provide) {
    $provide.constant('locationTypeColors', locationTypeColorsMock);
  }));
  beforeEach(inject(function($rootScope, $templateCache, _$compile_) {
    $compile = _$compile_;

    $scope = $rootScope.$new();

    angular.extend($scope, {
      formatValue: jasmine.createSpy('formatValue'),
      handleClick: jasmine.createSpy('handleClick'),
      highlightedLocation: undefined,
      isClickable: true,
      locations: [],
      values: {}
    });

    // Put an empty template to the template cache
    // to prevent Angular from trying to fetch it.
    $templateCache.put(
      'components/widgets/location-value-pairs/location-value-pairs.partial.html',
      '<div></div>'
    );
  }));

  describe('clearHighlight', function() {
    it('should unset highlighted location', function() {
      $scope.locations = [
        new LocationMock(1000)
      ];

      var controller = renderDirectiveAndDigest();
      expect($scope.highlightedLocation).toBeUndefined();

      controller.highlightLocation($scope.locations[0]);
      $scope.$digest();
      expect($scope.highlightedLocation).toBe($scope.locations[0]);

      controller.clearHighlight();
      $scope.$digest();
      expect($scope.highlightedLocation).toBeUndefined();
    });
  });

  describe('formatValue', function() {
    it('should evaluate value format expression', function() {
      var controller = renderDirectiveAndDigest();
      expect($scope.formatValue).not.toHaveBeenCalled();
      controller.formatValue({ value: 1234 });
      expect($scope.formatValue).toHaveBeenCalledWith(1234);
    });
  });

  describe('getValue', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationMock(1000),
        new LocationMock(2000),
        new LocationMock(3000)
      ];
      $scope.values = {
        '1000': 123,
        '2000': 456
      };
      controller = renderDirectiveAndDigest();
    });

    it('should return value for location', function() {
      expect(controller.getValue($scope.locations[0]))
        .toBe($scope.values[$scope.locations[0].location_id]);
      expect(controller.getValue($scope.locations[1]))
        .toBe($scope.values[$scope.locations[1].location_id]);
    });

    it('should return undefined if location has no data', function() {
      expect(controller.getValue($scope.locations[2])).toBeUndefined();
    });
  });

  describe('getLocationColor', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationMock(1000, 'Floor'),
        new LocationMock(2000, 'Store'),
        new LocationMock(3000, 'Corridor'),
        new LocationMock(4000, 'BogusType')
      ];
      controller = renderDirectiveAndDigest();
    });

    it('should return proper color from location type color map', function() {
      expect(controller.getLocationColor($scope.locations[0]))
        .toBe(locationTypeColorsMock.Floor);
      expect(controller.getLocationColor($scope.locations[1]))
        .toBe(locationTypeColorsMock.Store);
      expect(controller.getLocationColor($scope.locations[2]))
        .toBe(locationTypeColorsMock.Corridor);
    });

    it('should return default color if there is no color for location type', function() {
      expect(controller.getLocationColor($scope.locations[3]))
        .toBe(locationTypeColorsMock.default);
    });
  });

  describe('handleClick', function() {
    it('should evaluate click handler expression', function() {
      $scope.locations = [
        new LocationMock(1000)
      ];
      var controller = renderDirectiveAndDigest();

      expect($scope.handleClick).not.toHaveBeenCalled();
      controller.handleClick({ location: $scope.locations[0] });
      $scope.$digest();
      expect($scope.handleClick).toHaveBeenCalledWith($scope.locations[0]);
    });
  });

  describe('hasValue', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationMock(1000),
        new LocationMock(2000),
        new LocationMock(3000)
      ];
      $scope.values = {
        '1000': 1234,
        '2000': 0
      };
      controller = renderDirectiveAndDigest();
    });

    it('should return true if location has data', function() {
      expect(controller.hasValue($scope.locations[0])).toBe(true);
    });

    it('should return true if location has a zero value', function() {
      expect(controller.hasValue($scope.locations[1])).toBe(true);
    });

    it('should return false if value does not exist', function() {
      expect(controller.hasValue($scope.locations[2])).toBe(false);
    });
  });

  describe('highlightLocation', function() {
    it('should set highlighted location', function() {
      $scope.locations = [
        new LocationMock(1000),
        new LocationMock(2000)
      ];
      expect($scope.highlightedLocation).toBeUndefined();
      var controller = renderDirectiveAndDigest();
      controller.highlightLocation($scope.locations[1]);
      $scope.$digest();
      expect($scope.highlightedLocation).toBe($scope.locations[1]);
    });
  });

  describe('isHighlighted', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationMock(1000),
        new LocationMock(2000)
      ];
      controller = renderDirectiveAndDigest();
    });

    it('should return true if location is highlighted', function() {
      expect(controller.isHighlighted($scope.locations[1])).toBe(false);
      $scope.highlightedLocation = $scope.locations[1];
      $scope.$digest();
      expect(controller.isHighlighted($scope.locations[1])).toBe(true);
    });

    it('should return false if location is not highlighted', function() {
      $scope.highlightedLocation = undefined;
      $scope.$digest();
      expect(controller.isHighlighted($scope.locations[0])).toBe(false);
      expect(controller.isHighlighted($scope.locations[1])).toBe(false);
    });
  });

  function renderDirectiveAndDigest() {
    var element = angular.element(
      '<location-value-pairs' +
      ' value-format="formatValue(value)"' +
      ' on-click="handleClick(location)"' +
      ' highlighted-location="highlightedLocation"' +
      ' clickable="isClickable"' +
      ' locations="locations"' +
      ' values="values">' +
      '</location-value-pairs>'
    );
    $compile(element)($scope);
    $scope.$digest();
    
    return element.controller('locationValuePairs');
  }

  function LocationMock(locationId, type) {
    this.location_id = locationId;
    this.location_type = type ? type : 'Store';
  }
});
