(function() {
  'use strict';

  angular.module('shopperTrak')
    .constant('formatKPIFilterConstants', {
      formats: {
        'traffic': 'value | number : 0',
        'dwellTime': {
          concise: 'value | number : 1',
          verbose: '(value | number : 1) + " min"'
        },
        'grossShoppingHours': {
          concise: 'value | number : 0',
          verbose: '(value | number : 0) + " hours"'
        },
        'trafficPercentage': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'firstVisits': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'trafficCorrelation': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'locationsBefore': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'locationsAfter': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'oneAndDone': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'opportunity': 'value | number: 0',
        'drawRate': {
          concise: '(value * 100 | number : 1)',
          verbose: '(value * 100 | number : 1) + "%"'
        },
        'abandonmentRate': {
          concise: 'value * 100 | number : 1',
          verbose: '(value * 100 | number : 1) + "%"'
        },
        'shopperPercentage': {
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'nonShopperPercentage': { // "Others"
          concise: '(value | number : 1)',
          verbose: '(value | number : 1) + "%"'
        },
        'passingTraffic': 'value | number : 0',
        'default': 'value | number : 1'
      }
    })
    .filter('formatKPI', formatKPIFilter);

  formatKPIFilter.$inject = [
    '$rootScope',
    'formatKPIFilterConstants'
  ];

  // Transforms format string to use 'formatNumber' as filter.
  // Example:
  //
  //    (value | number : 1) + "%" -> (value | formatNumber : 1 : 'en-us') + "%"
  //
  function _transformFormat(format, name){
    var pattern = /number\s*:\s*(\d+)/;
    var filter  = ['formatNumber : $1 : ', '\'' ,  name, '\'' ].join('');
    return format.replace(pattern, filter);
  }

  // This is neede to handle cases where
  // kpi is like 'abandonment_rate'
  function toCamelCase(string) {
    return string.replace(/_([a-zA-Z])/g, function($1, $2){return $2.toUpperCase();});
  }

  // Format KPIs according to constants. Usage:
  //   Template: {{ value | formatKPI : verbose }}
  //   JavaScript: $filter('formatKPI')(value, verbose)
  //
  // Parameters:
  //   verbose: true/false
  function formatKPIFilter($rootScope, filterConstants) {
    return formatKPI;

    function formatKPI(value, kpi, verbose, formatName) {
      var format = filterConstants.formats[toCamelCase(kpi)];
      if (!format) {
        format = filterConstants.formats.default;
      } else if (typeof format === 'object') {
        format = verbose ? format.verbose : format.concise;
      }
      if(formatName){
        format = _transformFormat(format, formatName);
      }

      return $rootScope.$eval(format, {
        value: value
      });
    }
  }
})();
