(function() {
  'use strict';

  angular.module('shopperTrak.constants')
  .constant('comparisons', [
        {
          id: 1, 
          value: 'current',
          transKey: '',
          valueKey: 'current'
        },
        {
          id: 2, 
          value: 'prior_period',
          transKey: 'common.PRIORPERIOD',
          valueKey: 'priorPeriod'
        },
        {
          id: 3, 
          value: 'prior_year',
          transKey: 'common.PRIORYEAR',
          valueKey: 'priorYear'
        },
        {
          id: 999, 
          value: 'custom',
          transKey: '.CUSTOM',
          valueKey: 'custom'
        }
    ]);
})();
