(function() {
  'use strict';

  angular.module('shopperTrak.routing')
    .factory('fillDefaultDateRangeParams', fillDefaultDateRangeParamsFactory);

  fillDefaultDateRangeParamsFactory.$inject = [
    'getDefaultComparisonDateRangeParams',
    'LocalizationService',
    'localStorageService',
    'routeUtils',
    'ObjectUtils'
  ];

  function fillDefaultDateRangeParamsFactory(
    getDefaultComparisonDateRangeParams,
    LocalizationService,
    localStorageService,
    routeUtils,
    ObjectUtils
  ) {
    return fillDefaultDateRangeParams;

    function fillDefaultDateRangeParams(stateParams, organization, user, calendars, toStateName, fromStateName) {
      var firstDay;

      // Do a shallow copy to not mutate the original
      var newParams = angular.extend({}, stateParams);

      var cachedCalendarId = localStorageService.get('currentCalendarId');

      if(!ObjectUtils.isNullOrUndefined(organization)) {
        LocalizationService.setOrganization(organization)
      }
      
      if(cachedCalendarId > 0) {
        firstDay = LocalizationService.getFirstDayOfWeekInCalendar(cachedCalendarId);
      } else {
        firstDay = LocalizationService.getCurrentCalendarFirstDayOfWeek();
      }

      if (
        ('dateRangeStart' in stateParams && !stateParams.dateRangeStart) &&
        ('dateRangeEnd' in stateParams && !stateParams.dateRangeEnd)
      ) {
        var newDateRange;

        if(toStateName === 'analytics.organization.marketIntelligence.dashboard') {
          newDateRange = routeUtils.getDefaultDateRangeParams(firstDay);
        } else {
          newDateRange = routeUtils.getDefaultDateRangeParams(firstDay);
        }
        
        angular.extend(newParams, newDateRange);
      }

      if (
        ('compareRange1Start' in stateParams && !stateParams.compareRange1Start) &&
        ('compareRange1End' in stateParams && !stateParams.compareRange1End) &&
        ('compareRange2Start' in stateParams && !stateParams.compareRange2Start) &&
        ('compareRange2End' in stateParams && !stateParams.compareRange2End)
      ) {
        angular.extend(
          newParams,
          getDefaultComparisonDateRangeParams(
            {
              dateRangeStart: newParams.dateRangeStart,
              dateRangeEnd: newParams.dateRangeEnd
            },
            user,
            organization,
            calendars
          )
        );

        return newParams;
      }
      
      // One compare period only. Used by MI
      if(('compareRange1Start' in stateParams && !stateParams.compareRange1Start) &&
         ('compareRange1End' in stateParams && !stateParams.compareRange1End)
      ) {
        angular.extend(
          newParams,
          getDefaultComparisonDateRangeParams(
            {
              dateRangeStart: newParams.dateRangeStart,
              dateRangeEnd: newParams.dateRangeEnd
            },
            user,
            organization,
            calendars,
            true
          )
        );
      }


      if(toStateName === 'analytics.organization.marketIntelligence.dashboard' && fromStateName !== 'analytics.organization.marketIntelligence.dashboard') {
        angular.extend(
          newParams,
          getDefaultComparisonDateRangeParams(
            {
              dateRangeStart: newParams.dateRangeStart,
              dateRangeEnd: newParams.dateRangeEnd
            },
            user,
            organization,
            calendars,
            true
          )
        );
      }

      return newParams;
    }

  }
})();
