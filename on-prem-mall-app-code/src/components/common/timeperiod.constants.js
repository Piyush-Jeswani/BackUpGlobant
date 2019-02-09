(function() {
  'use strict';

  angular.module('shopperTrak.constants')
  .constant('timeperiodConstants', {
    timeperiod: [
      {time: 'None', period: 'none'},
      {time: 'Yesterday', period: 'day'},
      {time: 'Last week', period: 'week'},
      {time: 'Last month', period: 'month'},
      {time: 'Last year', period: 'year'},
      {time: 'Week-to-date', period: 'WTD'},
      {time: 'Month-to-date', period: 'MTD'},
      {time: 'Quarter-to-date', period: 'QTD'},
      {time: 'Year-to-date', period: 'YTD'}
    ]
  });
})();