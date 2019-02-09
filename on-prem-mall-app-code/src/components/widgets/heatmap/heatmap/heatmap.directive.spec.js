'use strict';

describe('heatmapDirective', function() {
  var $scope;
  var $compile;

  var heatmapColors;
  var renderableLocationTypes;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module(function($provide) {
    heatmapColors = {
      activeLocation: '#9bc614',
      valuelessLocation: '#cccccc',
      steps: [
        '#c9e4fc',
        '#99cdf9',
        '#6ab6f6'
      ]
    };
    renderableLocationTypes = [
      'Store'
    ];
    $provide.constant('heatmapColors', heatmapColors);
    $provide.constant('renderableLocationTypes', renderableLocationTypes);
  }));
  beforeEach(inject(function($rootScope, $templateCache, _$compile_) {
    $scope = $rootScope.$new();

    angular.extend($scope, {
      activeLocation: undefined,
      floorNum: undefined,
      formatValue: jasmine.createSpy('formatValue'),
      handleClick: jasmine.createSpy('handleClick'),
      highlightedLocation: undefined,
      isClickable: true,
      locations: [],
      values: {}
    });

    $compile = _$compile_;

    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/heatmap/heatmap/heatmap.partial.html',
      '<div></div>'
    );
  }));

  describe('initial floor selection', function() {
    beforeEach(function() {
      $scope.locations = [
        // Put floors in ascending order to verify that controller
        // looks at floor numbers instead of array order.
        new LocationWithGeometryMock(3001, 3, 'Store'),
        new LocationWithGeometryMock(2001, 2, 'Store'),
        new LocationWithGeometryMock(1001, 1, 'Store'),
        new LocationWithGeometryMock(1001, null, 'Store')
      ];
    });

    it('should get unique non null floors from locations and put them in accending order', function() {
      $scope.floorNum = undefined;
      var controller = renderDirectiveAndDigest();
      var floors = controller.getFloorsForDropdown($scope.locations);

      expect(floors).toEqual([1, 2, 3]);
    });

    it('should show the floor given as parameter', function() {
      $scope.floorNum = 2;
      var controller = renderDirectiveAndDigest();
      expect(controller.floorNum).toBe(2);
    });

    it('should show the first floor if neither floorNum nor activeLocation is given as parameter', function() {
      $scope.floorNum = undefined;
      var controller = renderDirectiveAndDigest();
      expect(controller.floorNum).toBe(1);
    });

    it('should show the floor of active location if floorNum is not given as parameter', function() {
      $scope.activeLocation = $scope.locations[2];
      $scope.floorNum = undefined;
      var controller = renderDirectiveAndDigest();
      expect(controller.floorNum).toBe($scope.locations[2].floor);
    });
  });

  describe('clearHighlight', function() {
    it('should unset highlighted location', function() {
      $scope.locations = [
        new LocationWithGeometryMock(1000)
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

  describe('getColor', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationWithGeometryMock(1000),
        new LocationWithGeometryMock(2000),
        new LocationWithGeometryMock(3000),
        new LocationWithGeometryMock(4000),
        new LocationWithGeometryMock(5000)
      ];
      $scope.activeLocation = $scope.locations[4];
      $scope.values = {
        '1000': 0,
        '2000': 50,
        '3000': 100
      };
      controller = renderDirectiveAndDigest();
    });

    it('should return active location color if given location is active', function() {
      expect(controller.getColor($scope.activeLocation))
        .toBe(heatmapColors.activeLocation);
    });

    it('should return valueless location color if given location has no data', function() {
      expect(controller.getColor($scope.locations[3]))
        .toBe(heatmapColors.valuelessLocation);
    });

    it('should return color from color scale if location has data', function() {
      expect(controller.getColor($scope.locations[0]))
        .toBe(heatmapColors.steps[0]);
      expect(controller.getColor($scope.locations[1]))
        .toBe(heatmapColors.steps[1]);
      expect(controller.getColor($scope.locations[2]))
        .toBe(heatmapColors.steps[2]);
    });
  });

  describe('getValue', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationWithGeometryMock(1000),
        new LocationWithGeometryMock(2000),
        new LocationWithGeometryMock(3000)
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

  describe('hasValue', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationWithGeometryMock(1000),
        new LocationWithGeometryMock(2000),
        new LocationWithGeometryMock(3000)
      ];
      $scope.values = {
        '1000': 123,
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
        new LocationWithGeometryMock(1000),
        new LocationWithGeometryMock(2000)
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
        new LocationWithGeometryMock(1000),
        new LocationWithGeometryMock(2000)
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

  describe('shouldBeRendered', function() {
    var controller;

    beforeEach(function() {
      $scope.floorNum = 2;
      $scope.locations = [
        new LocationWithoutGeometryMock(100, 1, 'Floor'),
        new LocationWithoutGeometryMock(100, 2, 'Floor')
      ];
      controller = renderDirectiveAndDigest();
    });

    it('should return false if the location has no geometry', function() {
      $scope.locations.push(
        new LocationWithoutGeometryMock(1, $scope.floorNum)
      );
      expect(controller.shouldBeRendered($scope.locations[0])).toBe(false);
    });

    it('should return false if the location is on a different floor', function() {
      $scope.locations.push(new LocationWithGeometryMock(1, 2));
      expect(controller.shouldBeRendered($scope.locations[0])).toBe(false);
    });

    it('should return false if the location is not of renderable type', function() {
      $scope.locations.push(
        new LocationWithGeometryMock(1, $scope.floorNum, 'BogusType')
      );
      expect(controller.shouldBeRendered($scope.locations[0])).toBe(false);
    });

    it('should return true if the location matches criteria', function() {
      var locations = renderableLocationTypes.map(function(locationType, index) {
        return new LocationWithGeometryMock(index, $scope.floorNum, locationType);
      });
      $scope.locations.concat(locations);
      locations.forEach(function(location) {
        expect(controller.shouldBeRendered(location)).toBe(true);
      });
    });
  });

  describe('closeFloorDropdown', function() {
    it('should close floor dropdown', function() {
      var controller = renderDirectiveAndDigest();
      controller.toggleFloorDropdown();
      expect(controller.floorDropdownIsOpen).toBe(true);
      controller.closeFloorDropdown();
      expect(controller.floorDropdownIsOpen).toBe(false);
    });
  });

  describe('floorIsSelected', function() {
    var controller;

    beforeEach(function() {
      $scope.locations = [
        new LocationWithoutGeometryMock(1000, 1, 'Floor'),
        new LocationWithoutGeometryMock(1000, 2, 'Floor')
      ];
      $scope.floorNum = $scope.locations[1].floor;
      controller = renderDirectiveAndDigest();
    });

    it('should return true if floor is selected', function() {
      expect(controller.floorIsSelected($scope.locations[1].floor)).toBe(true);
    });

    it('should return false if floor is not selected', function() {
      expect(controller.floorIsSelected($scope.locations[0].floor)).toBe(false);
    });
  });

  describe('getNavigableFloors', function() {
    it('should return all locations of type floor that have their floor properties set', function() {
      var navigableFloor = {
        location_type: 'Floor',
        floor: 1
      };
      var anotherNavigableFloor = {
        location_type: 'Floor',
        floor: 2
      };
      var nonNavigableFloor = {
        location_type: 'Floor'
      };

      $scope.locations = [
        navigableFloor,
        anotherNavigableFloor,
        nonNavigableFloor
      ];

      var controller = renderDirectiveAndDigest([
        navigableFloor,
        anotherNavigableFloor,
        nonNavigableFloor],
        {}
      );

      var navigableFloors = controller.navigableFloors;

      expect(navigableFloors.length).toBe(2);
      expect(navigableFloors).toContain(navigableFloor.floor);
      expect(navigableFloors).toContain(anotherNavigableFloor.floor);
      expect(navigableFloors).not.toContain(nonNavigableFloor.floor);
    });
  });

  describe('handleClick', function() {
    it('should evaluate click handler expression', function() {
      $scope.locations = [
        new LocationWithGeometryMock(1000, 1)
      ];
      var controller = renderDirectiveAndDigest();

      expect($scope.handleClick).not.toHaveBeenCalled();
      controller.handleClick({ location: $scope.locations[0] });
      $scope.$digest();
      expect($scope.handleClick).toHaveBeenCalledWith($scope.locations[0]);
    });
  });

  describe('setFloorNumAndCloseDropdown', function() {
    it('should close the floor dropdown', function() {
      var controller = renderDirectiveAndDigest();
      controller.floorDropdownIsOpen = true;
      controller.setFloorNumAndCloseDropdown(2);
      expect(controller.floorDropdownIsOpen).toEqual(false);
    });

    it('should change the current floor number', function() {
      var controller = renderDirectiveAndDigest();
      controller.setFloorNumAndCloseDropdown(2);
      $scope.$digest();
      expect($scope.floorNum).toEqual(2);
      controller.setFloorNumAndCloseDropdown(1);
      $scope.$digest();
      expect($scope.floorNum).toEqual(1);
    });
  });

  describe('toggleFloorDropdown', function() {
    it('should toggle the floor dropdown', function() {
      var controller = renderDirectiveAndDigest();
      expect(controller.floorDropdownIsOpen).toBe(false);
      controller.toggleFloorDropdown();
      expect(controller.floorDropdownIsOpen).toBe(true);
      controller.toggleFloorDropdown();
      expect(controller.floorDropdownIsOpen).toBe(false);
    });
  });

  function renderDirectiveAndDigest() {
    var element = angular.element(
      '<heatmap' +
      ' active-location="activeLocation"' +
      ' floor="floorNum"' +
      ' value-format="formatValue(value)"' +
      ' on-click="handleClick(location)"' +
      ' highlighted-location="highlightedLocation"' +
      ' clickable="isClickable"' +
      ' locations="locations"' +
      ' legend-label="Test label"' +
      ' values="values">' +
      '</heatmap>'
    );

    $compile(element)($scope);
    $scope.$digest();
    return element.controller('heatmap');
  }

  function LocationWithGeometryMock(locationId, floor, type) {
    this.location_id = locationId;
    this.floor = floor;
    this.location_type = type ? type : 'Store';
    this.geometry = {
      coordinates: [
        [[-73.57217164719,45.50223825938],[-73.57213441729,45.50222066763],[-73.57212358685,45.50223163083],[-73.57210570137,45.5022232152],[-73.57204235819,45.5022887764],[-73.5720986742,45.50231537947],[-73.57217164719,45.50223825938]]
      ],
      type: 'Polygon'
    };
  }

  function LocationWithoutGeometryMock(locationId, floor, type) {
    this.location_id = locationId;
    this.floor = floor;
    this.location_type = type ? type : 'Store';
  }
});
