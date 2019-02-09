(function() {
  'use strict';
  angular.module('shopperTrak').controller('CampaignAnalyticsCtrl', CampaignAnalyticsCtrl);

  CampaignAnalyticsCtrl.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    'resourceUtils',
    'currentLocation',
    'currentSite',
    'currentOrganization',
    'ExportService',
    'locations',
    'utils'
  ];

  function CampaignAnalyticsCtrl(
    $scope,
    $state,
    $stateParams,
    resourceUtils,
    currentLocation,
    currentSite,
    currentOrganization,
    ExportService,
    locations,
    utils
  ) {
    $scope.currentSite = currentSite;
    $scope.currentLocation = currentLocation;
    $scope.locations = locations;
    $scope.dateRangesLoaded = dateRangesLoaded();

    $scope.dateRange = {
      start: $stateParams.dateRangeStart,
      end: $stateParams.dateRangeEnd
    };

    $scope.compareRange1 = {
      start: $stateParams.compareRange1Start,
      end: $stateParams.compareRange1End
    };

    $scope.compareRange2 = {
      start: $stateParams.compareRange2Start,
      end: $stateParams.compareRange2End
    };

    $scope.exportWidget = exportWidget;
    $scope.widgetIsExported = widgetIsExported;
    $scope.goToLocation = goToLocation;
    $scope.siteHasCompatibleLocations = siteHasCompatibleLocations;

    var defaultLocationTypeOptions = [{
      locationType: 'Store',
      displayName: 'Stores',
      color: 'green'
    }, {
      locationType: 'Corridor',
      displayName: 'Corridors',
      color: 'orange'
    }, {
      locationType: 'Entrance',
      displayName: 'Entrances'
    }, {
      locationType: 'Department',
      displayName: 'Departments'
    }];

    activate();

    function activate() {
      var atLeastOneLocationHasGeometry = locations.some(resourceUtils.locationHasGeometry);

      $scope.widgetsToShow = getWidgetsToShow(!$stateParams.locationId, atLeastOneLocationHasGeometry);

      $scope.locationTypeOptions = defaultLocationTypeOptions.filter(function(option) {
        return locations.some(function(location) {
          return location.location_type === option.locationType;
        });
      });

      $scope.widgetContainerClassNames = atLeastOneLocationHasGeometry ? 'col-sm-12' : 'col-md-4';

      $scope.locationTypes = $stateParams.locationTypeFilter ? [$stateParams.locationTypeFilter] : ['Store', 'Corridor', 'Entrance', 'Department'];

      $scope.$watch('$scope.locations', function() {
        $scope.uniqueLocationTypes = getUniqueLocationTypes($scope.locations);
      });

      $scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf);
    }

    function getWidgetsToShow(isSiteLevel, siteHasGeometryData) {
      var widgetsToShow = [];

      if (isSiteLevel) {
        widgetsToShow = [
          'campaign_analytics',
          'first_campaigns',
          'one_and_done_campaigns'
        ];
      } else {
        widgetsToShow = [
          'campaign_correlation',
          'campaigns_before',
          'campaigns_after'
        ];
      }

      if (!siteHasGeometryData) {
        widgetsToShow = widgetsToShow.map(function(widgetType) {
          return widgetType + '_table';
        });
      }

      return widgetsToShow;
    }

    function scheduleExportCurrentViewToPdf() {
      angular.forEach($scope.widgetsToShow, function(value) {
        ExportService.addToExportCartAndStore(getAreaKey(), $scope.dateRange, $scope.comparisonDateRange, { name: value, location_type: $scope.locationTypes });
      });
      $state.go('pdfexport', {orgId: currentOrganization.organization_id, view: 'schedule'});
    }

    function getAreaKey() {
      var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
      if (currentLocation) {
        areaKey += '_' + currentLocation.location_id;
      }
      return areaKey;
    }

    function exportWidget(metricKey) {
      ExportService.addToExportCartAndStore(
        getAreaKey(),
        { start: $scope.dateRange.start, end: $scope.dateRange.end },
        { start: $scope.compareRange1.start, end: $scope.compareRange1.end },
        { name: metricKey, location_type: $scope.locationTypes }
      );
    }

    function widgetIsExported(metricKey) {
      var dateRangeKey =
        $scope.dateRange.start +
        ' - ' +
        $scope.dateRange.end +
        ' - ' +
        $scope.compareRange1.start +
        ' - ' +
        $scope.compareRange1.end;

      return ExportService.isInExportCart(getAreaKey(), dateRangeKey, metricKey);
    }

    function goToLocation(location) {
      var params = {
        locationId: location.location_id,
      };
      if ($stateParams.locationTypeFilter && location.location_type !== $stateParams.locationTypeFilter) {
        params.locationTypeFilter = null;
      }
      $state.go('analytics.organization.site.campaign-analytics', params);
    }

    function siteHasCompatibleLocations(metricKey) {

      var compatibleLocations = {}; var found = false;
      compatibleLocations.one_and_done = ['Store','Corridor'];

      if(metricKey === 'one_and_done') {
        angular.forEach($scope.uniqueLocationTypes, function(locationType) {
          if(!found && compatibleLocations.one_and_done.indexOf(locationType) !== -1) {
            found = true;
          }
        });
      }

      if(found) {
        return true;
      } else {
        return false;
      }

    }

    function getUniqueLocationTypes(locations) {
      return locations.reduce(function(uniqueLocationTypes, item) {
        if (uniqueLocationTypes.indexOf(item.location_type) < 0) {
          uniqueLocationTypes.push(item.location_type);
        }
        return uniqueLocationTypes;
      }, []);
    }

    function dateRangesLoaded() {
      return utils.urlDateParamsLoaded($stateParams);
    }

  }
})();
