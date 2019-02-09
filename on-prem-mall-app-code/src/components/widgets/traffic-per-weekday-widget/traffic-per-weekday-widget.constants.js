(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('trafficPerWeekdayWidgetMetrics', {
      'metrics': [
        {
          value: 'traffic',
          returnKey: 'traffic'
        },
        {
          value: 'sales',
          returnKey: 'sales'
        },
        {
          value: 'conversion',
          returnKey: 'conversion'
        },
        {
          value: 'ats',
          returnKey: 'ats'
        },
        {
          value: 'star',
          returnKey: 'star'
        }
      ],
    table: {
      show: {
        value: 'Show Table',
        translation_label: 'lineHighChartWidget.SHOWTABLE'
      },
      hide: {
        value: 'Hide Table',
        translation_label: 'lineHighChartWidget.HIDETABLE'
      }
    }});

})();
