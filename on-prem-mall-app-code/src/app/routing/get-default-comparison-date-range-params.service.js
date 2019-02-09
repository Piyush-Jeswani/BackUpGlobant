(function () {
  'use strict';

  angular.module('shopperTrak.routing')
    .factory('getDefaultComparisonDateRangeParams', getDefaultComparisonDateRangeParamsFactory);

  getDefaultComparisonDateRangeParamsFactory.$inject = [
    'utils',
    'comparisons',
    'comparisonsHelper',
    '$stateParams',
    'authService',
    'LocalizationService',
    'dateRangeService'
  ];

  function getDefaultComparisonDateRangeParamsFactory(
    utils,
    comparisons,
    comparisonsHelper,
    $stateParams,
    authService,
    LocalizationService,
    dateRangeService
  ) {
    return getDefaultComparisonDateRangeParams;

    function getDefaultComparisonDateRangeParams(dateRangeParams, user, organization, orgCalendars, singleComparePeriod, periodName) {
      if(angular.isUndefined(singleComparePeriod)) {
        singleComparePeriod = false;
      }

      LocalizationService.setUser(user);
      LocalizationService.setAllCalendars(orgCalendars);

      var params = {};

      var selectedPeriod = angular.copy(dateRangeParams);

      if(singleComparePeriod === true) {
        var priorYear = {
          period_type: 'prior_year'
        };

        getDateparams(params, priorYear, 1, selectedPeriod, user, organization, true);
      } else {
        getDateparams(params, user.preferences.custom_period_1, 1, selectedPeriod, user, organization, periodName);
        getDateparams(params, user.preferences.custom_period_2, 2, selectedPeriod, user, organization, periodName);
      }

      // If default compare ranges are outside calendar definitions for current calendar,
      // load period of same length from the start of calendar

      var startOfCalendar = LocalizationService.getStartOfCurrentCalendar();
      var lengthOfSelectedPeriod = selectedPeriod.dateRangeEnd.diff(selectedPeriod.dateRangeStart,'days');

      if(params.compareRange1Start < startOfCalendar) {
        params.compareRange1Start = angular.copy(startOfCalendar);
        params.compareRange1End = angular.copy(startOfCalendar).add(lengthOfSelectedPeriod,'days');
      }

      if(!singleComparePeriod) {
        if(params.compareRange2Start < startOfCalendar) {
          params.compareRange2Start = angular.copy(startOfCalendar);
          params.compareRange2End = angular.copy(startOfCalendar).add(lengthOfSelectedPeriod,'days');
        }
      }

      return params;
    }

    function getDateparams(params, period, index, selectedPeriod, user, organization, singleComparePeriod, periodName) {
        var rangeIndex = index;
        var paramStartKey = 'compareRange' + rangeIndex + 'Start';
        var paramEndKey = 'compareRange' + rangeIndex + 'End';

        var dateRange = {
          start: selectedPeriod.dateRangeStart,
          end: selectedPeriod.dateRangeEnd
        };

        var compareRangeNum;

        if(period.period_type === 'custom') {
          compareRangeNum = 'compare' + rangeIndex.toString() + 'Range';
        }

        var comparisonRange = dateRangeService.getCustomPeriod(dateRange, user, organization, periodName, compareRangeNum, period.period_type, singleComparePeriod);
        params[paramStartKey] = comparisonRange.start;
        params[paramEndKey] = comparisonRange.end;
      }
  }
})();
