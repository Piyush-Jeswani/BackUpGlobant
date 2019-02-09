(function () {
  'use strict';

  angular.module('shopperTrak')
    .constant('formatYAxisConstants', {
      formats: {
        'gsh': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'gross_shopping_hours': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'opportunity': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'sales': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'traffic': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'ats': {
          dataPrecision: 0,
          thousandsSeparator: ''
        },
        'draw_rate': {
          dataPrecision: 1,
          thousandsSeparator: '',
          mapValue: function (value) {
            return value * 100;
          }
        },
        'abandonment_rate': {
          dataPrecision: 1,
          thousandsSeparator: '',
          mapValue: function (value) {
            return value * 100;
          }
        },
        'upt': {
          dataPrecision: 2
        },
        'default': {
          dataPrecision: 1
        }
      }
    })
    .filter('formatYAxis', formatYAxisFilter);

  formatYAxisFilter.$inject = [
    'formatYAxisConstants',
    '$filter'
  ];

  function toUnderscoreCase(string) {
    return string.replace(/([A-Z])/g, function ($1) { return '_' + $1.toLowerCase(); });
  }

  // Format KPI charts y-axis labels:
  //   $filter('formatYAxis')(value, kpi, numberFormatName)
  function formatYAxisFilter(filterConstants, $filter) {
    return formatYAxis;

    function formatYAxis(value, kpi, numberFormatName) {
      var filter = $filter('formatNumber');
      var format = filterConstants.formats[toUnderscoreCase(kpi)];
      if (typeof format === 'undefined' || format === null) {
        format = filterConstants.formats['default'];
      }
      if (format.mapValue) {
        value = format.mapValue(value);
      }
      value = filter(value, format.dataPrecision, numberFormatName, format.thousandsSeparator);
      if (format.prefix) {
        value = value + format.prefix;
      }
      return value;
    }
  }
})();
