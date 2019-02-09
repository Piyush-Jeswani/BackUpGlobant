(function() {
  'use strict';

  angular
    .module('shopperTrak.leaflet')
    .directive('leafletMap', leafletMapDirective);

  function leafletMapDirective() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'components/leaflet/leaflet-map.partial.html',
      scope: {},
      controller: LeafletMapController,
      bindToController: true,
      controllerAs: 'vm'
    };
  }

  LeafletMapController.$inject = [
    '$scope',
    '$element',
    '$timeout',
    'leaflet',
    'leafletUtils'
  ];

  function LeafletMapController($scope, $element, $timeout, leaflet, leafletUtils) {
    var leafletInstance;
    var layers = [];

    // Map position is marked as not being up to date whenever a layer is
    // added to or removed from the map. The position is updated right after
    // the next digest cycle.
    var mapPositionIsUpToDate = true;

    // Child directives use these methods
    this.addLayer = addLayer;
    this.removeLayer = removeLayer;

    activate();

    function activate() {
      initLeaflet();

      var deregisterMapFeatureAddedListener = $scope.$on('mapFeatureAdded', handleMapFeaturesChanged);
      var deregisterMapFeatureRemovedListener = $scope.$on('mapFeatureRemoved', handleMapFeaturesChanged);

      $scope.$on('$destroy', function() {
        deregisterMapFeatureAddedListener();
        deregisterMapFeatureRemovedListener();
        leafletInstance.remove();
      });
    }

    function initLeaflet() {
      var mapElement = $element.find('.leaflet-map')[0];

      leafletInstance = leaflet.map(mapElement, {
        zoomControl: false,
        maxZoom: 30,
        attributionControl: false,
        scrollWheelZoom: false
      });

      new leaflet.Control.Zoom({ position: 'topright' }).addTo(leafletInstance);
    }

    function fitMapOnLayers(layers) {
      leafletInstance.fitBounds(leafletUtils.getBounds(layers));
    }

    function addLayer(layer) {
      leafletInstance.addLayer(layer);
      layers.push(layer);
      $scope.$broadcast('mapFeatureAdded');
    }

    function removeLayer(layer) {
      leafletInstance.removeLayer(layer);
      layers.splice(layers.indexOf(layer), 1);
      $scope.$broadcast('mapFeatureRemoved');
    }

    function handleMapFeaturesChanged() {
      mapPositionIsUpToDate = false;

      // Update the map position right after the next $digest cycle. This is
      // more efficient than updating the position each time a layer is added
      // or removed, because that can happen hundreds of times per second.
      $scope.$evalAsync(function() {
        if (!mapPositionIsUpToDate) {
          fitMapOnLayers(layers);
          mapPositionIsUpToDate = true;
        }
      });
    }
  }
})();
