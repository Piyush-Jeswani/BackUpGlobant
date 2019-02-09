(function() {
  'use strict';

  //ToDo: Add transkeys
  angular.module('shopperTrak.constants')
    .constant('datePeriods', [{
      key: 'day',
      shortTranslationLabel: 'datePeriodSelector.DAY',
      selected: false
    }, {
      key: 'week',
      shortTranslationLabel: 'datePeriodSelector.WEEK',
      selected: false
    }, {
      key: 'month',
      shortTranslationLabel: 'datePeriodSelector.MONTH',
      selected: false
    }, {
      key: 'quarter',
      shortTranslationLabel: 'datePeriodSelector.QUARTER',
      selected: false
    }, {
      key: 'year',
      shortTranslationLabel: 'datePeriodSelector.YEAR',
      selected: false
    }, {
      key: 'week_to_date',
      shortTranslationLabel: 'datePeriodSelector.WEEKTODATE',
      selected: false
    }, {
      key: 'month_to_date',
      shortTranslationLabel: 'datePeriodSelector.MONTHTODATE',
      selected: false
    }, {
      key: 'quarter_to_date',
      shortTranslationLabel: 'datePeriodSelector.QUARTERTODATE',
      selected: false
    }, {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.YEARTODATE',
      selected: false
    }, ]);
})();
