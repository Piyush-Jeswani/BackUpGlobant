'use strict';

angular.module('shopperTrak.widgets').directive('valueListWidgetBody', [
'LocationResource', 'multiLocationKPIFetcher', 'utils',
function(LocationResource, multiLocationKPIFetcher, utils) {
  return {
    templateUrl: 'components/widgets/value-list/value-list-widget-body.partial.html',
    scope: {
      orgId:           '=orgId',
      siteId:          '=siteId',
      locationId:      '=?locationId',
      // Fetch percentages for these location types. Must be one
      // of the values supported by the API endpoint.
      locationTypes:   '=locationTypes',
      dateRangeStart:  '=dateRangeStart',
      dateRangeEnd:    '=dateRangeEnd',
      onLocationClick: '=?onLocationClick',
      listTitle:       '@listTitle',
      kpi:             '@',
      formatValue:     '&valueFormat',
      isLoadingValues: '=?'
    },
    link: function(scope) {
      // TODO: Create an authoritative source for this color mapping to
      //       remove duplication with area-selector-popover.
      scope.defaultAreaColor = 'gray';
      scope.areaColors = {
        'Zone': 'red',
        'Store': 'green',
        'Floor': 'blue',
        'Corridor': 'orange'
      };

      scope.locations = [];

      scope.isLoadingValues = true;
      scope.locationRequestFailed = false;
      scope.valueRequestFailed = false;

      scope.getLocationById = getLocationById;
      scope.locationHasValue = locationHasValue;

      getAllLocations().then(function(locations) {
        scope.locationRequestFailed = false;
        scope.locations = locations;
        scope.$watchGroup([
          'orgId',
          'siteId',
          'locationId',
          'locationTypes',
          'dateRangeStart',
          'dateRangeEnd'
        ], updateValues);
        scope.$watch('locationId', updateCurrentLocation);
      }).catch(function() {
        scope.locationRequestFailed = true;
      });

      function updateValues() {
        scope.isLoadingValues = true;
        scope.valueRequestFailed = false;

        getValues().then(function(valueResponse) {
          storeValuesToLocations(valueResponse);
          scope.isLoadingValues = false;
        }).catch(function() {
          scope.valueRequestFailed = true;
          scope.isLoadingValues = false;
        });
      }

      function updateCurrentLocation() {
        scope.currentLocation = getLocationById(scope.locationId);
      }

      function getAllLocations() {
        return LocationResource.query({
          orgId: scope.orgId,
          siteId: scope.siteId
        }).$promise;
      }

      function getValues() {
        var params = {
          orgId:           scope.orgId,
          siteId:          scope.siteId,
          reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
          reportEndDate:   utils.getDateStringForRequest(scope.dateRangeEnd),
          locationType:    scope.locationTypes
        };
        if (scope.locationId) {
          params.locationId = scope.locationId;
        }
        var data = multiLocationKPIFetcher.fetchAggregate(scope.kpi, params);
        return data.promise;
      }

      function storeValuesToLocations(values) {
        for (var i = 0; i < scope.locations.length; i++) {
          var value = values[scope.locations[i].location_id];
          if (value) {
            scope.locations[i].value = value;
          }
        }
      }

      function getLocationById(locationId) {
        var ret;
        angular.forEach(scope.locations, function(location) {
          if (String(location.location_id) === String(locationId)) {
            ret = location;
          }
        });
        return ret;
      }

      function locationHasValue(location) {
        return location.value !== undefined;
      }
    }
  };
}]);
