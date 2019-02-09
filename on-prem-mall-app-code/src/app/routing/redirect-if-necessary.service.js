(function () {
  'use strict';

  angular.module('shopperTrak.routing')
    .factory('redirectIfNecessary', redirectIfNecessaryFactory);

  redirectIfNecessaryFactory.$inject = [
    '$state',
    '$stateParams',
    '$timeout',
    'fillDefaultDateRangeParams',
    'getOrganization',
    'authService',
    'LocalizationService',
    'localStorageService',
    'ObjectUtils'
  ];

  function redirectIfNecessaryFactory (
    $state,
    $stateParams,
    $timeout,
    fillDefaultDateRangeParams,
    getOrganization,
    authService,
    LocalizationService,
    localStorageService,
    ObjectUtils
  ) {

    // When the application first loads clear the 'selectedDateRanges'
    // in local storage to ensure any date range settings made during the last session
    // are not carried over.
    localStorageService.remove('selectedDateRanges');
    
    return redirectIfNecessary;

    function redirectIfNecessary (event, toState, toParams, fromState) {
      if (toState.name === 'analytics.organization.site.hourly') {
        return;
      }

      const strSelectedDateRanges = localStorageService.get('selectedDateRanges');

      if (useRedirect(toParams, toState, strSelectedDateRanges, fromState)) {
        getOrganization($stateParams.orgId).then(organization => {

          authService.getCurrentUser().then(user => {
            LocalizationService.getAllCalendars().then(calendars => {

              calendars = calendars.result;
              let newParams;

              if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(strSelectedDateRanges) && !isMarketIntelligence(toState.name)) {
                  newParams = getDateParams(strSelectedDateRanges);
              } else {
                  newParams = fillDefaultDateRangeParams(toParams, organization, user, calendars, toState.name, fromState.name);
              }   

              let datesAreEqual = false;
              let hasDates = false;

              // If newParams and toParams both have date ranges set then compare
              // them to work out if they are not equal to facilitate a state change below.
              // Checking one of the compare dates is sufficent here.
              // Checking the second compare date here will break marker intelligence, so don't do it.
              if (newParams.hasOwnProperty('dateRangeStart') &&
                newParams.hasOwnProperty('dateRangeEnd') &&
                newParams.hasOwnProperty('compareRange1Start') &&
                newParams.hasOwnProperty('compareRange1End') &&

                toParams.hasOwnProperty('dateRangeStart') &&
                toParams.hasOwnProperty('dateRangeEnd') &&
                toParams.hasOwnProperty('compareRange1Start') &&
                toParams.hasOwnProperty('compareRange1End')) {
                  datesAreEqual = dateRangesAreEqual(newParams, toParams);
                  hasDates = true;
              }

              if (toParams.hasOwnProperty('startDate') &&
                  toParams.hasOwnProperty('endDate') &&
                  !_.isUndefined(toParams.startDate) &&
                  !_.isUndefined(toParams.endDate)) {
                    toParams.startDate = moment(toParams.startDate).format('YYYY-MM-DD');
                    toParams.endDate = moment(toParams.endDate).format('YYYY-MM-DD');
              }

              let updatedObjnewParams = null;
              let updatedObjtoParams = null;

              // If newParams and toParams both have date ranges set then create
              // updated versions of these objects with all date range
              // attributes removed so they can be equality tested separately
              // below. This is because angular.equals() can't compare dates correctly
              // i.e. they need to equality tested separately.
              if (hasDates) {
                updatedObjnewParams = _.omit(newParams, ['dateRangeStart',
                  'dateRangeEnd', 'compareRange1Start', 'compareRange1End',
                  'compareRange2Start', 'compareRange2End']);

                updatedObjtoParams = _.omit(toParams, ['dateRangeStart',
                  'dateRangeEnd', 'compareRange1Start', 'compareRange1End',
                  'compareRange2Start', 'compareRange2End']);
              }

              // Force state change if state params (without dates) are not equal OR their date ranges are not equal.
              if (!angular.equals(updatedObjnewParams, updatedObjtoParams) || hasDates && !datesAreEqual) {
                event.preventDefault();
                // Call $state.go inside a $timeout to work around
                // buggy behavior otherwise.
                const halfASecond = 500;
                $timeout(() => {
                  // Clear cached calendarId when it's not needed anymore
                  localStorageService.set('currentCalendarId', null);
                  $state.go(toState.name, newParams);
                }, halfASecond);
              }
            });
          });
        });
      }
    }

    /**
     * Compare the date ranges of 2 Param objects. If they are identical return true otherwise return false.
     *
     * @param {object} newParams LHS object.
     * @param {object} toParams RHS object.
     * @returns {Boolean} return result of date range comparison attribute by attribute.
     *
     */
    function dateRangesAreEqual (newParams, toParams) {
      if (datesAreNotEqual(newParams, toParams, 'dateRangeStart') ||
            datesAreNotEqual(newParams, toParams, 'dateRangeEnd') ||
            datesAreNotEqual(newParams, toParams, 'compareRange1Start') ||
            datesAreNotEqual(newParams, toParams, 'compareRange1End') ||
            datesAreNotEqual(newParams, toParams, 'compareRange2Start') ||
            datesAreNotEqual(newParams, toParams, 'compareRange2End') ) {
              return false;
        }

      return true;
    }

    function datesAreNotEqual (newParams, toParams, property) {
      const parseFormat = 'YYYY-MM-DD';
      return !(_.isUndefined(newParams[property]) && _.isUndefined(toParams[property])) && 
        newParams[property].format(parseFormat) !== moment(toParams[property]).format(parseFormat);
    }

    function useRedirect (toParams, toState, strSelectedDateRanges, fromState) {
      if (toState.name === 'pdf') {
        return false;
      }

      if (toParams.dateRangeStart === undefined || toParams.dateRangeEnd === undefined ||
      toParams.compareRange1Start === undefined || toParams.compareRange1End === undefined ||
      toParams.compareRange2Start === undefined || toParams.compareRange2End === undefined) {
        return true;
      }

      if (!ObjectUtils.isNullOrUndefined(strSelectedDateRanges) && 
          toState.name !== 'analytics.organization.site.real-time-data' && 
          fromState.name !== toState.name) {
            return true;
      }

      return false;
    }

    /**
     * Returns date range parameters extracted from a string in JSON string format
     * read from local storage.
     *
     * @param {string} selectedDateRanges .
     * @returns {object} return date range parameters object
     *
     */
    function getDateParams (selectedDateRanges) {
      const dateParams = {
        dateRangeStart: moment(selectedDateRanges.current.start),
        dateRangeEnd: moment(selectedDateRanges.current.end)
      };

      if (!_.isUndefined(selectedDateRanges.compare1.start) &&
          !_.isUndefined(selectedDateRanges.compare1.end) &&
          !_.isUndefined(selectedDateRanges.compare2.start) &&
          !_.isUndefined(selectedDateRanges.compare2.end)) {
            dateParams.compareRange1Start = moment(selectedDateRanges.compare1.start);
            dateParams.compareRange1End = moment(selectedDateRanges.compare1.end);
            dateParams.compareRange2Start = moment(selectedDateRanges.compare2.start);
            dateParams.compareRange2End = moment(selectedDateRanges.compare2.end);
      }

      return dateParams;
    }

    function isMarketIntelligence (toStateName) {
      if (toStateName.indexOf('analytics.organization.marketIntelligence') > -1) {
        return true;
      }

      return false;
    }
  }
})();
