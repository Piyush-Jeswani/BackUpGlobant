'use strict';

angular.module('shopperTrak')
.controller('ExportCartModalCtrl', ['$scope', '$q', 'resourceUtils', 'ExportService', 'LocationResource', function ($scope, $q, resourceUtils, ExportService, LocationResource) {
  $scope.loading = true;

  $scope.numExportsInProgress = 0;

  $scope.lastExportFailed = false;

  $scope.getSiteById = getSiteById;
  $scope.isExportCartEmpty = isExportCartEmpty;
  $scope.clearExportCart = clearExportCart;
  $scope.removeMetric = removeMetric;
  $scope.getLocationById = getLocationById;
  $scope.getExportAreaTitle = getExportAreaTitle;
  $scope.exportCurrentCartToPdf = exportCurrentCartToPdf;
  $scope.getNumKeys = getNumKeys;

  $scope.exportCart = ExportService.getCart();
  $scope.exportedCarts = ExportService.getExportedCarts();

  $scope.sites = [];
  $scope.locations = [];
  resourceUtils.getAllSites().then(function(sites) {
    $scope.sites = sites;
    $scope.currentCartSites = getCurrentCartSites();
  });

  $q.all($scope.sites.promise).then(function() {
    $scope.loading = false;
  });

  $scope.$on('pdfExportStart', updateNumExportsInProgress);
  $scope.$on('pdfExportFinish', updateNumExportsInProgress);
  $scope.$on('pdfExportFinish', updateExportErrorStatus);

  $scope.exportMetricNames = {
    'traffic': 'Traffic',
    'total_traffic': 'Traffic summary',
    'average_percent_shoppers': 'Shoppers vs Others',
    'average_draw_rate': 'Draw rate',
    'detail_draw_rate': 'Draw rate',
    'total_opportunity': 'Opportunity',
    'detail_opportunity': 'Opportunity',
    'gross_shopping_hours': 'Gross shopping hours',
    'detail_gross_shopping_hours': 'Gross shopping hours',
    'average_dwelltime': 'Average dwell time',
    'detail_dwell_time': 'Dwell time',
    'average_abandonment_rate': 'Abandonment rate',
    'detail_abandonment_rate': 'Abandonment rate',
    'loyalty': 'Visiting frequency',
    'usage_heatmap': 'Usage of areas',
    'entrance_contribution': 'Entrance contribution',
    'power_hours': 'Power hours',
    'traffic_weekday_distribution': 'Average Traffic per day of the Week',
    'traffic_percentage_location': 'Traffic heat map',
    'traffic_percentage_correlation': 'Correlation heat map',
    'locations_before': 'Locations visited before',
    'locations_after': 'Locations visited after',
    'first_visits': 'First locations to visit',
    'traffic_percentage_location_table': 'Traffic heat map',
    'traffic_percentage_correlation_table': 'Correlation heat map',
    'locations_before_table': 'Locations visited before',
    'locations_after_table': 'Locations visited after',
    'first_visits_table': 'First locations to visit',
    'one_and_done': 'One and done',
    'one_and_done_table': 'One and done'
  };

  $scope.sortableOptions = {
    stop: function(e, ui) {
      for (var index in ui.item.sortable.sourceModel) {
        ui.item.sortable.sourceModel[index].index = index;
      }
    }
  };

  updateNumExportsInProgress();

  function updateNumExportsInProgress() {
    $scope.numExportsInProgress = ExportService.getNumExportsInProgress();
  }

  function updateExportErrorStatus (event, exportDetails) {
    $scope.lastExportFailed = !exportDetails.success;
  }

  function getCurrentCartSites() {
    angular.forEach($scope.exportCart, function(value, key) {
      var cartKey = key.split('_');
      var orgId = cartKey[0];
      var siteId = cartKey[1];

      LocationResource.query({
        orgId: orgId,
        siteId: siteId
      }).$promise.then(function(locations) {
        $scope.locations = $scope.locations.concat(locations);
      });
    });
  }

  function isExportCartEmpty() {
    return Object.keys($scope.exportCart).length === 0;
  }

  function clearExportCart() {
    ExportService.clearExportCart();
    $scope.exportCart = ExportService.getCart();
  }

  function removeMetric(areaKey, rangeKey, metric) {
    ExportService.removeFromExportCart(areaKey, rangeKey, metric);
    $scope.exportCart = ExportService.getCart();
  }

  function getSiteById(siteId) {
    var ret;
    angular.forEach($scope.sites, function(site) {
      if (String(site.site_id) === String(siteId)) {
        ret = site;
      }
    });
    return ret;
  }

  function getLocationById(locationId) {
    var ret;
    angular.forEach($scope.locations, function(location) {
      if (String(location.location_id) === String(locationId)) {
        ret = location;
      }
    });
    return ret;
  }

  function getExportAreaTitle(areaKey) {
    var splitAreaKey = areaKey.split('_');
    var siteId = splitAreaKey[1];
    var site = $scope.getSiteById(siteId);
    var siteName = site ? site.name : siteId;
    if (typeof splitAreaKey[2] === 'undefined') {
      return siteName + ' (property overall)';
    } else {
      var locationId = splitAreaKey[2];
      var location = $scope.getLocationById(locationId);
      var locationDescription = location ? location.description : locationId;
      return siteName + ' / ' + locationDescription;
    }
  }

  function exportCurrentCartToPdf() {
    ExportService.exportCurrentCartToPdf();
    $scope.clearExportCart();
  }

  function getNumKeys(obj) {
    return Object.keys(obj).length;
  }

  $scope.exportCartToPdf = ExportService.exportCartToPdf;
}]);
