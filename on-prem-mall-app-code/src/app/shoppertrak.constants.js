(function() {
  'use strict';

  angular.module('shopperTrak.constants', [])
  .constant('locationTypeColors', {
    'Zone': 'red',
    'Store': 'green',
    'Floor': 'blue',
    'Corridor': 'orange',
    'default': 'gray'
  })
  .constant('internalDateFormat', 'YYYY-MM-DD')
  .constant('angularMomentConfig', {
    timezone: 'GMT' // Default timezone: GMT
  });
})();
