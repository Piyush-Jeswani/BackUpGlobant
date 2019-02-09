(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .factory(
      'multiLocationKPIFetcherKPIDefinitions',
      createMultiLocationKPIFetcherKPIDefinitions
    );

  createMultiLocationKPIFetcherKPIDefinitions.$inject = [
    'LocationResource'
  ];

  function createMultiLocationKPIFetcherKPIDefinitions(LocationResource) {
    return {
      trafficPercentage: {
        apiEndpoint: 'kpis/traffic-percentage-location',
        valueKey: 'percent_total_traffic',
        locationIdKey: 'location_id',
        queryParams: { noBatch:true }
      },
      firstVisits: {
        apiEndpoint: 'kpis/first-visits',
        valueKey: 'percent_first_visits',
        locationIdKey: 'location_id',
        queryParams: {}
      },
      trafficCorrelation: {
        apiEndpoint: 'kpis/traffic-percentage-correlation',
        valueKey: 'percent_traffic',
        locationIdKey: 'location_id_other',
        queryParams: {}
      },
      locationsAfter: {
        apiEndpoint: 'kpis/locations-after',
        valueKey: 'percent_visits',
        locationIdKey: 'location_id_other',
        queryParams: {noBatch:true }
      },
      locationsBefore: {
        apiEndpoint: 'kpis/locations-before',
        valueKey: 'percent_visits',
        locationIdKey: 'location_id_other',
        queryParams: { noBatch:true }
      },
      oneAndDone: {
        apiEndpoint: 'kpis/oneAndDone',
        valueKey: 'shopper_percent',
        locationIdKey: 'location_id',
        queryParams: { noBatch:true },
        prefetch: function(params) {
          // Add all locationIds to query params, because
          // the endpoint requires them.
          // TODO: Remove this if/when API starts supporting oneAndDone
          //       queries without the locationId parameter.
          return LocationResource.query({
            orgId: params.orgId,
            siteId: params.siteId
          }, null).$promise.then(function(locations) {
            var seen = {};

            if(params.locationType === undefined) {
              params.locationType = _(locations.filter(function(location) {
                if (seen[location.location_type]) {
                  return false;
                } else {
                  seen[location.location_type] = true;
                  return location.location_type === 'Store' || location.location_type === 'Corridor';
                }
              })).pluck('location_type');
            }
            return params;
          });
        }
      },
      dwellTime: {
        apiEndpoint: 'kpis/report',
        valueKey: 'dwelltime',
        locationIdKey: 'location_id',
        queryParams: {
          kpi: 'dwelltime',
          groupBy: 'aggregate',
          allLocations: 'true'
        }
      }
    };
  }
})();
