'use strict';

describe('geojsonFeatureDirective', function() {
  var $compile;
  var $scope;
  var leafletMock;
  var layerMock;
  var leafletMapControllerMock;
  var mapFeature;

  beforeEach(module('shopperTrak.leaflet'));
  beforeEach(module(function($provide) {
    $provide.provider('leaflet', function() {
      this.$get = function() {
        return leafletMock;
      };
    });
  }));
  beforeEach(inject(setGlobals));

  it('should create a GeoJSON layer', function() {
    spyOn(leafletMock, 'geoJson').and.callThrough();

    renderDirective();

    expect(leafletMock.geoJson).toHaveBeenCalledWith({
      type: 'Feature',
      geometry: mapFeature.geometry
    }, {
      style: mapFeature.featureStyle
    });
  });

  it('should add a layer to map when created', function() {
    spyOn(leafletMapControllerMock, 'addLayer');
    renderDirective();
    expect(leafletMapControllerMock.addLayer).toHaveBeenCalledWith(layerMock);
  });

  it('should remove the layer from the map when scope is destroyed', function() {
    renderDirective();

    spyOn(leafletMapControllerMock, 'removeLayer');

    $scope.mapFeatures.pop();
    $scope.$digest();

    expect(leafletMapControllerMock.removeLayer).toHaveBeenCalledWith(layerMock);
  });

  it('should update the layer style when the directive\'s layer attribute is changed', function() {
    renderDirective();

    spyOn(layerMock, 'setStyle');

    mapFeature.featureStyle = {
      weight: 2,
      color: '#ffffff',
      opacity: 1,
      fillColor: '#00ff00',
      fillOpacity: 1
    };
    $scope.$digest();

    expect(layerMock.setStyle).toHaveBeenCalledWith(mapFeature.featureStyle);
  });

  it('should add a click handler to the map layer', function() {
    spyOn(layerMock, 'on');
    spyOn(mapFeature, 'onClick');

    renderDirective();

    expect(layerMock.on).toHaveBeenCalledWith('click', jasmine.any(Function));

    // Call all added handlers
    layerMock.on.calls.allArgs().forEach(function(args) {
      args[1]();
    });

    expect(mapFeature.onClick).toHaveBeenCalled();
  });

  it('should add a mouseover handler to the map layer', function() {
    spyOn(layerMock, 'on');
    spyOn(mapFeature, 'onMouseEnter');

    renderDirective();

    expect(layerMock.on).toHaveBeenCalledWith('mouseover', jasmine.any(Function));

    // Call all added handlers
    layerMock.on.calls.allArgs().forEach(function(args) {
      args[1]();
    });

    expect(mapFeature.onMouseEnter).toHaveBeenCalled();
  });

  it('should add a mouseout handler to the map layer', function() {
    spyOn(layerMock, 'on');
    spyOn(mapFeature, 'onMouseLeave');

    renderDirective();

    expect(layerMock.on).toHaveBeenCalledWith('mouseout', jasmine.any(Function));

    // Call all added handlers
    layerMock.on.calls.allArgs().forEach(function(args) {
      args[1]();
    });

    expect(mapFeature.onMouseLeave).toHaveBeenCalled();
  });

  function renderDirective() {
    var element = angular.element(
      '<fake-leaflet-map>' +
        '<geojson-feature' +
        ' ng-repeat="mapFeature in mapFeatures"' +
        ' geometry="mapFeature.geometry"' +
        ' feature-style="mapFeature.featureStyle"' +
        ' on-click="mapFeature.onClick()"' +
        ' on-mouse-enter="mapFeature.onMouseEnter()"' +
        ' on-mouse-leave="mapFeature.onMouseLeave()"' +
        '/>' +
      '</fake-leaflet-map>'
    );

    // The geojsonFeature directive looks for the controller
    // of the leafletMapDirective in the enclosing element,
    // so add the mockController to it.
    element.data('$leafletMapController', leafletMapControllerMock);

    $compile(element)($scope);
    $scope.$digest();
  }

  function setGlobals($rootScope, $templateCache, _$compile_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;

    leafletMapControllerMock = {
      addLayer: function() {},
      removeLayer: function() {}
    };

    layerMock = {
      on: function() {},
      setStyle: function() {}
    };

    leafletMock = {
      geoJson: function() {
        return layerMock;
      }
    };

    mapFeature = {
      geometry: {
        'type': 'Polygon',
        'coordinates': [[
          [-115.17579422059, 36.09427663276],
          [-115.17588406574, 36.09420247765],
          [-115.17569223809, 36.0942024825],
          [-115.17569223579, 36.09427662444],
          [-115.17579422059, 36.09427663276]
        ]]
      },
      featureStyle: {
        weight: 2,
        color: '#ffffff',
        opacity: 1,
        fillColor: '#ff0000',
        fillOpacity: 1
      },
      onClick: function() {},
      onMouseEnter: function() {},
      onMouseLeave: function() {},
    };

    $scope.mapFeatures = [mapFeature];
  }
});
