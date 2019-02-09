(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .constant('tableComparisonWidgetConstants', {
      rows: [{
        title: 'Overall visitors',
        kpis: ['traffic']
      }, {
        title: 'Unique / returning visitors',
        kpis: ['uniqueVisitors', 'returningVisitors']
      }, {
        title: 'Overall passing traffic',
        kpis: ['passingTraffic'], // Where do we get this data?
      }, {
        title: 'Draw rate',
        kpis: ['drawRate']
      }, {
        title: 'Average dwell time',
        kpis: ['dwellTime']
      }, {
        title: 'Average visiting frequency',
        kpis: ['loyalty']
      }, {
        title: 'Abandonment rate',
        kpis: ['abandonmentRate']
      }, {
        title: 'Total shopping time',
        // Is gross shopping hours the same as total shopping time?
        kpis: ['grossShoppingHours']
      }, {
        title: 'Shoppers vs others',
        kpis: ['shopperPercentage', 'nonShopperPercentage']
      }, {
        title: 'Opportunity',
        kpis: ['opportunity']
      }]
    });
})();
