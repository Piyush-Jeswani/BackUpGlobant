(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('heatmapColors', {
      'activeLocation': '#9bc614',
      'valuelessLocation': '#cccccc',
      'steps': [
        '#c9e4fc',
        '#99cdf9',
        '#6ab6f6',
        '#339af3',
        '#2191f2'
      ]
    })
    .constant('renderableLocationTypes', [
      'Department',
      'Store',
      'Corridor',
      'Entrance'
    ]);
})();
