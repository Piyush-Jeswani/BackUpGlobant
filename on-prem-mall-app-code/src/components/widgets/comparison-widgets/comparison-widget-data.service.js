(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('comparisonWidgetDataConstants', {
      kpis: {
        'traffic': {
          apiEndpoint: '/kpis/traffic',
          key: 'total_traffic',
          languageSlug: 'traffic',
          queryParams: {}
        },
        'dwellTime': {
          apiEndpoint: '/kpis/dwellTime',
          key: 'average_dwelltime',
          languageSlug: 'dwell_time',
          queryParams: {}
        },
        'dwell_time': {
          apiEndpoint: '/kpis/dwellTime',
          key: 'average_dwelltime',
          languageSlug: 'dwell_time',
          queryParams: {}
        },
        'grossShoppingHours': {
          apiEndpoint: '/kpis/grossShoppingHours',
          key: 'gross_shopping_hours',
          languageSlug: 'gsh',
          queryParams: {}
        },
        'gsh': {
          apiEndpoint: '/kpis/grossShoppingHours',
          key: 'gross_shopping_hours',
          languageSlug: 'gsh',
          queryParams: {}
        },
        'drawRate': {
          apiEndpoint: '/kpis/drawRate',
          key: 'average_draw_rate',
          languageSlug: 'draw_rate',
          queryParams: {}
        },
        'draw_rate': {
          apiEndpoint: '/kpis/drawRate',
          key: 'average_draw_rate',
          languageSlug: 'draw_rate',
          queryParams: {}
        },
        'abandonmentRate': {
          apiEndpoint: '/kpis/abandonmentRate',
          key: 'average_abandonment_rate',
          languageSlug: 'abandonment_rate',
          queryParams: {}
        },
        'abandonment_rate': {
          apiEndpoint: '/kpis/abandonmentRate',
          key: 'average_abandonment_rate',
          languageSlug: 'abandonment_rate',
          queryParams: {}
        },
        'opportunity': {
          apiEndpoint: '/kpis/opportunity',
          key: 'total_opportunity',
          languageSlug: 'opportunity',
          queryParams: {}
        },
        'sales': {
          apiEndpoint: '/kpis/sales',
          key: 'sales_amount',
          languageSlug: 'sales',
          queryParams: {}
        },
        'conversion': {
          apiEndpoint: '/kpis/sales',
          key: 'conversion',
          languageSlug: 'conversion',
          queryParams: {}
        },
        'ats': {
          apiEndpoint: '/kpis/sales',
          key: 'ats',
          languageSlug: 'ats',
          queryParams: {}
        },
        'upt': {
          apiEndpoint: '/kpis/sales',
          key: 'upt',
          languageSlug: 'upt',
          queryParams: {}
        },
        'star': {
          apiEndpoint: '/kpis/sales',
          key: 'star',
          languageSlug: 'star',
          queryParams: {}
        },
        'labor-hours': {
          apiEndpoint: '/kpis/sales',
          key: 'labor_hours',
          languageSlug: 'labor_hours',
          queryParams: {}
        }
      }
    })
    .factory('comparisonWidgetData', comparisonWidgetData);

  comparisonWidgetData.$inject = [
    '$q',
    'requestManager',
    'apiUrl',
    'comparisonWidgetDataConstants',
    'utils',
    'LocalizationService'
  ];

  function comparisonWidgetData($q, requestManager, apiUrl, constants, utils, LocalizationService) {
    return {
      fetchKPI: fetchKPI
    };

    function fetchKPI(kpi, params) {
      var deferred = $q.defer();

      var data = [];
      data.promise = deferred.promise;

      var queryParams = angular.extend({
        orgId: params.orgId,
        siteId: params.siteId,
        reportStartDate: utils.getDateStringForRequest(params.dateRangeStart),
        reportEndDate: utils.getDateStringForRequest(params.dateRangeEnd)
      }, constants.kpis[kpi].queryParams);

      if(params.zoneId !== undefined) {
        queryParams.zoneId = params.zoneId;
      } else {
        queryParams.locationId = params.locationId;
      }

      if(constants.kpis[kpi].apiEndpoint === '/kpis/sales' && kpi !== 'sales') {
        queryParams.kpi = [ constants.kpis[kpi].key ];
      }

      requestManager.get(apiUrl + constants.kpis[kpi].apiEndpoint, {
        cache: true,
        params: queryParams
      }).then(function(response) {
        // Use one data.push call to append the data
        // to prevent multiple $digest cycle triggers.
        data.push.apply(data, transformResponse(response, kpi));
        deferred.resolve();
      }).catch(function() {
        deferred.reject();
      });

      return data;
    }

    function transformResponse(data, kpi) {
      return data.result.map(function(item) {
        var key = constants.kpis[kpi].key;
        return {
          value: item[key],
          date: LocalizationService.getLocalDateTimeFormatIgnoringUTC(item.period_start_date)
        };
      });
    }
  }
})();
