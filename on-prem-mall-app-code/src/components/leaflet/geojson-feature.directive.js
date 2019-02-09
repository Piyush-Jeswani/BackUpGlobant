(function() {
  'use strict';

  angular
    .module('shopperTrak.leaflet')
    .directive('geojsonFeature', geojsonFeatureDirective);

  geojsonFeatureDirective.$inject = ['leaflet'];

  function geojsonFeatureDirective(leaflet) {
    var directive = {
      restrict: 'E',
      require: '^leafletMap',
      scope: {
        geometry: '=',
        featureStyle: '=',
        onMouseEnter: '&',
        onMouseLeave: '&',
        onClick: '&'
      },
      link: linkGeojsonFeature
    };

    function linkGeojsonFeature(scope, element, attrs, leafletMapController) {
      activate();

      function activate() {
        var layer = createMapLayer(
          scope.geometry,
          scope.featureStyle,
          applied(scope, scope.onMouseEnter),
          applied(scope, scope.onMouseLeave),
          applied(scope, scope.onClick)
        );

        leafletMapController.addLayer(layer);

        element.on('$destroy', function() {
          leafletMapController.removeLayer(layer);
        });

        scope.$watch('featureStyle', function(newStyle) {
          layer.setStyle(newStyle);
        });
      }

      function createMapLayer(geometry, style, onMouseOver, onMouseOut, onClick) {
        var geoJsonFeature = {
          type: 'Feature',
          geometry: geometry
        };

        var layer = leaflet.geoJson(geoJsonFeature, {
          style: style
        });

        layer.on('click', onClick);
        layer.on('mouseover', onMouseOver);
        layer.on('mouseout', onMouseOut);

        return layer;
      }

      function applied(scope, func) {
        return function() {
          var args = arguments;
          scope.$apply(function() {
            func.apply(null, args);
          });
        };
      }
    }

    return directive;
  }
})();
