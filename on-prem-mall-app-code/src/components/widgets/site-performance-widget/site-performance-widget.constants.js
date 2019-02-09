(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('sitePerformanceWidgetConstants', {
      views: [
        {
          view: 'traffic_contribution',
          kpi: 'traffic',
          type: 'selectedPeriod',
          order: 'desc'
        },
        {
          view: 'traffic_increase',
          kpi: 'traffic',
          type: 'priorPeriodChange',
          order: 'desc'
        },
        {
          view: 'traffic_loss',
          kpi: 'traffic',
          type: 'priorPeriodChange',
          order: 'asc'
        }
      ]
    });
})();
