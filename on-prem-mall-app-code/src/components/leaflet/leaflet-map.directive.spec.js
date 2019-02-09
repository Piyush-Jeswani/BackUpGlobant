'use strict';

describe('leafletMapDirective', function() {
  var $scope;
  var $templateCache;
  var $compile;
  var $timeout;

  var controller;

  var leafletInstanceMock;
  var leafletMock;
  var leafletUtilsMock;

  setup();

  it('should create the map', function() {
    spyOn(leafletMock, 'map').and.callThrough();
    renderDirective();
    expect(leafletMock.map).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      jasmine.any(Object)
    );
  });

  it('should fit the map view to show all layers', function() {
    renderDirective();

    var fakeBounds;

    spyOn(leafletUtilsMock, 'getBounds').and.callFake(function() {
      return fakeBounds;
    });

    spyOn(leafletInstanceMock, 'fitBounds');

    var layerMock1 = {};
    var layerMock2 = {};

    fakeBounds = 'fake bounds 1';

    controller.addLayer(layerMock1);
    controller.addLayer(layerMock2);
    $scope.$digest();
    $timeout.flush();

    expect(leafletInstanceMock.fitBounds).toHaveBeenCalledWith('fake bounds 1');

    fakeBounds = 'fake bounds 2';

    // Remove one map layer to test that the map gets
    // centered properly after changes to the layers.
    controller.removeLayer(layerMock1);
    $scope.$digest();
    $timeout.flush();

    expect(leafletInstanceMock.fitBounds).toHaveBeenCalledWith('fake bounds 2');
  });

  it('should not fit the map view if there are no layers', function() {
    // Don't add any layers
    spyOn(leafletInstanceMock, 'fitBounds');
    renderDirective();
    expect(leafletInstanceMock.fitBounds).not.toHaveBeenCalled();
  });

  it('should show zoom controls on the top right corner', function() {
    spyOn(leafletMock, 'map').and.callThrough();

    var addZoomControlToMap = jasmine.createSpy('addTo');

    // Create a fake zoom control constructor so
    // that we can spy on the instance's functions.
    spyOn(leafletMock.Control, 'Zoom').and.callFake(function() {
      this.addTo = addZoomControlToMap;
    });

    renderDirective();

    // Expect it to disable the default zoom control
    expect(leafletMock.map.calls.mostRecent().args[1].zoomControl).toEqual(false);

    // Expect it to create a zoom control with custom parameters
    expect(leafletMock.Control.Zoom).toHaveBeenCalledWith({ position: 'topright' });

    // Expect it to add the custom zoom control to the map
    expect(addZoomControlToMap).toHaveBeenCalledWith(leafletInstanceMock);
  });

  it('should set the maximum zoom level to 30', function() {
    spyOn(leafletMock, 'map').and.callThrough();
    renderDirective();
    expect(leafletMock.map.calls.mostRecent().args[1].maxZoom).toEqual(30);
  });

  it('should hide the attribution control', function() {
    spyOn(leafletMock, 'map').and.callThrough();
    renderDirective();
    expect(leafletMock.map.calls.mostRecent().args[1].attributionControl).toEqual(false);
  });

  it('should disable scroll wheel zooming', function() {
    spyOn(leafletMock, 'map').and.callThrough();
    renderDirective();
    expect(leafletMock.map.calls.mostRecent().args[1].scrollWheelZoom).toEqual(false);
  });

  describe('addLayer', function() {
    it('should add a layer to the map', function() {
      renderDirective();

      spyOn(leafletInstanceMock, 'addLayer');

      var layerMock = {};
      controller.addLayer(layerMock);

      expect(leafletInstanceMock.addLayer).toHaveBeenCalledWith(layerMock);
    });
  });

  describe('removeLayer', function() {
    it('should remove a layer from the map', function() {
      renderDirective();

      var layerMock = {};
      controller.addLayer(layerMock);

      spyOn(leafletInstanceMock, 'removeLayer');

      controller.removeLayer(layerMock);

      expect(leafletInstanceMock.removeLayer).toHaveBeenCalledWith(layerMock);
    });
  });

  it('should destroy the leaflet instance when scope is destroyed', function() {
    renderDirective();

    spyOn(leafletInstanceMock, 'remove');

    $scope.$destroy();

    expect(leafletInstanceMock.remove).toHaveBeenCalled();
  });

  function renderDirective() {
    // Put a template to the template cache
    // to prevent Angular from trying to fetch it.
    $templateCache.put(
      'components/leaflet/leaflet-map.partial.html',
      '<div class="leaflet-map"></div><div ng-transclude></div>'
    );

    var element = angular.element(
      '<leaflet-map></leaflet-map>'
    );
    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('leafletMap');
  }

  function setup() {
    beforeEach(module('shopperTrak.leaflet'));

    // Override leaflet service with a mock
    beforeEach(module(function($provide) {
      $provide.provider('leaflet', function() {
        this.$get = function() {
          return leafletMock;
        };
      });
    }));

    // Override leafletUtils service with a mock
    beforeEach(module(function($provide) {
      $provide.provider('leafletUtils', function() {
        this.$get = function() {
          return leafletUtilsMock;
        };
      });
    }));

    beforeEach(inject(setGlobals));
  }

  function setGlobals($rootScope, _$templateCache_, _$compile_, _$timeout_) {
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    $compile = _$compile_;
    $timeout = _$timeout_;

    leafletInstanceMock = {
      fitBounds: function() {},
      addLayer: function() {},
      removeLayer: function() {},
      remove: function() {}
    };

    leafletMock = {
      map: function() {
        return leafletInstanceMock;
      },
      Control: {
        Zoom: function() {
          this.addTo = function() {};
        }
      }
    };

    leafletUtilsMock = {
      getBounds: function() {}
    };
  }
});
