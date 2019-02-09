'use strict';

angular.module('shopperTrak.utils')
.factory('utils', ['LocalizationService', 'ObjectUtils', 'localStorageService', function(LocalizationService, ObjectUtils, localStorageService) {

  // All dates are represented as Moment.js objects. See: http://momentjs.com/

  function getDateRangeForLastMonthBeforeDate(dateRange, user, organization) {
    var currentMonth;

    if(dateRange === undefined) {
      return;
    }

    if(!moment.isMoment(dateRange.start)) {
      dateRange.start = moment(dateRange.start);
    }

    if(!moment.isMoment(dateRange.end)) {
      dateRange.end = moment(dateRange.end);
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var systemDate = LocalizationService.getSystemYearForDate(dateRange.start);

      if(LocalizationService.hasMonthDefinitions()) {
        currentMonth = Number(systemDate.month);
      } else {
        currentMonth = Number(systemDate.month) - 1;
      }

      // Alter month selection according to first month of year setting
      var previousMonth = currentMonth - 1;
      var year;

      if (previousMonth < 0) {
        // Start from "Fake" January and work back
        previousMonth =  12 - (previousMonth * -1);
        year = systemDate.year - 1;
      } else {
        year = systemDate.year;
      }

      var previousMonth = {
        start: LocalizationService.getFirstDayOfMonth(previousMonth, year),
        end: LocalizationService.getLastDayOfMonth(previousMonth, year)
      };

      if(!LocalizationService.isCurrentCalendarGregorian()) {
        // For custom calendars, the prior month must be the same number number of days selected.
        // This can mean that if the current month covers a 4 week period, and the previous month covers a 5 week period,
        // that the last week of the previous month isn't included. This is ok.

        var numberOfDaysInCurrentMonth = getDaysBetweenDates(dateRange.start, dateRange.end, false);
        
        previousMonth.end = moment(previousMonth.start).add(numberOfDaysInCurrentMonth, 'days');
      }

      return previousMonth;

    } else {
      var end = dateRange.start.startOf('month').subtract(1, 'millisecond');
      return {
        start: moment(end).startOf('month'),
        end: end
      };
    }
  }

  function getDateRangeForLastCalendarYearBeforeDate(date, user, organization) {
    if(date === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var systemDate = LocalizationService.getSystemYearForDate(moment(date));
      var year = angular.copy(systemDate.year) - 1;

      return {
        start: LocalizationService.getFirstDayOfYear(year),
        end: LocalizationService.getLastDayOfYear(year)
      };
    } else {
      var end = moment(date).startOf('year').subtract(1, 'millisecond');
      return {
        start: moment(end).startOf('year'),
        end: end
      };
    }

  }

  function dateRangeIsCalendarWeek(dateRange, firstDayOfWeekSetting) {
    var weekStart = 'week';

    if(dateRange.start === undefined && dateRange.end === undefined) {
      return;
    }

    if(firstDayOfWeekSetting === undefined || firstDayOfWeekSetting === null) {
      firstDayOfWeekSetting = 'Sunday'; // default to Sunday
    }

    if(dateRange.start.format('dddd') === 'Monday') {
      weekStart = 'isoWeek';
      firstDayOfWeekSetting = 'Monday';
    }

    var startOfWeek = moment(dateRange.start).startOf(weekStart);
    var endOfWeek = moment(dateRange.start).endOf(weekStart);
    var days = moment(dateRange.end).diff(moment(dateRange.start), 'days');

    return (dateRange.start.isSame(startOfWeek) && dateRange.end.isSame(endOfWeek) && firstDayOfWeekSetting === 'Sunday') ||
           (days === 6 && ( moment(dateRange.start).day()===firstDayOfWeekSetting || moment(dateRange.start).format('dddd')===firstDayOfWeekSetting ));
  }

  function dateRangeIsMonth(dateRange, user, organization) {
    var m;

    if(dateRange.start === undefined && dateRange.end === undefined) {
      return;
    }
    if(user !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var systemDate = LocalizationService.getSystemYearForDate(moment(dateRange.end));

      if(LocalizationService.hasMonthDefinitions()) {
        m = systemDate.month;
      } else {
        m = systemDate.month - 1;
      }

      var startOfMonth = LocalizationService.getFirstDayOfMonth(m, systemDate.year);
      var endOfMonth = LocalizationService.getLastDayOfMonth(m, systemDate.year);

      return (!ObjectUtils.isNullOrUndefined(dateRange) && !ObjectUtils.isNullOrUndefined(startOfMonth) &&
              dateRange.start.format('DD.MM.YYYY') === startOfMonth.format('DD.MM.YYYY') &&
              dateRange.end.format('DD.MM.YYYY') === endOfMonth.format('DD.MM.YYYY'));

    } else {
      return false;
    }
  }

  function dateRangeIsCalendarYear(dateRange, user, organization) {
    if(dateRange === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var systemDate = LocalizationService.getSystemYearForDate(moment(dateRange.end));
      var year = systemDate.year;

      var startOfYear = LocalizationService.getFirstDayOfYear(year);
      var endOfYear = LocalizationService.getLastDayOfYear(year);

      return dateRange.start !== undefined && dateRange.end !== undefined &&
             dateRange.start.format('DD.MM.YYYY') === startOfYear.format('DD.MM.YYYY') &&
             dateRange.end.format('DD.MM.YYYY') === endOfYear.format('DD.MM.YYYY');
    } else {
      return false;
    }
  }

  function compareDate(dateTimeA, dateTimeB) {
    var momentA, momentB;

    if(typeof dateTimeA === 'string' ) {
      momentA = moment(dateTimeA, 'DD/MM/YYYY');
    } else {
      momentA = dateTimeA
    }
    if(typeof dateTimeB === 'string' ) {
      momentB = moment(dateTimeA, 'DD/MM/YYYY');
    } else {
      momentB = dateTimeB
    }

    if (momentA.isAfter(momentB, 'day')) {
      return 1;
    }
    else if (momentB.isAfter(momentA, 'day')) {
      return -1;
    }
    return 0;
  }

  function dateRangeIsWTD(dateRange, user, organization) {
    if(dateRange === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var firstDayOfCurrentWeek = LocalizationService.getFirstDayOfCurrentWeek();
      var currentTime = LocalizationService.getYesterday().add(1, 'day');
      var start, end;

      if (compareDate(currentTime, firstDayOfCurrentWeek) === 0) {
        start = firstDayOfCurrentWeek.subtract(1, 'week');
        end = LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week');
      } else {
        start = firstDayOfCurrentWeek;
        end = LocalizationService.getYesterday();
      }

      return dateRange.start !== undefined && dateRange.end !== undefined &&
        dateRange.start.format('DD.MM.YYYY') === start.format('DD.MM.YYYY') &&
        dateRange.end.format('DD.MM.YYYY') === end.format('DD.MM.YYYY');
    } else {
      return false;
    }
  }

  function dateRangeIsMTD(dateRange, user, organization) {
    if(dateRange === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var currentMonth, currentYear, start, end;
      var currentTime = LocalizationService.getYesterday().add(1, 'day');

      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      currentMonth = systemDate.month;
      currentYear = systemDate.year;

      if(!LocalizationService.hasMonthDefinitions()) {
        currentMonth = currentMonth - 1;
      }

      var firstDayOfCurrentMonth = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);

      if (compareDate(currentTime, firstDayOfCurrentMonth) === 0) {
        if (currentMonth === 1) {
          currentMonth = 12;
          currentYear -= 1;
        }
        else {
          currentMonth -= 1;
        }
        start = LocalizationService.getLastDayOfMonth(currentMonth, currentYear);
        end = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);
      } else {
        start = firstDayOfCurrentMonth;
        end = LocalizationService.getYesterday().subtract(1, 'day');
      }

      return dateRange.start !== undefined && dateRange.end !== undefined &&
        dateRange.start.format('DD.MM.YYYY') === start.format('DD.MM.YYYY') &&
        dateRange.end.format('DD.MM.YYYY') === end.format('DD.MM.YYYY');
    } else {
      return false;
    }
  }
  function dateRangeIsQTD(dateRange, user, organization) {
    if(dateRange === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var start, end;
      var currentTime = LocalizationService.getYesterday().add(1, 'day');
      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      var currentMonth = systemDate.month;
      var currentYear = systemDate.year;

      var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
      var firstMonthOfQuarter = getFirstMonthInQuarter(currPeriod);
      var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, currentYear);

      if (compareDate(currentTime, firstDayOfCurrentQuarter) === 0) {
        if (currPeriod === 1) {
          currPeriod = 4;
          currentYear -= 1;
          currentMonth = 12;
        } else {
          currPeriod -= 1;
          currentMonth -= 1;
        }

        start = LocalizationService.getLastDayOfMonth(currentMonth, currentYear);
        end = LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), currentYear);
      } else {
        start = firstDayOfCurrentQuarter;
        end = LocalizationService.getYesterday();
      }

      return dateRange.start !== undefined && dateRange.end !== undefined &&
        dateRange.start.format('DD.MM.YYYY') === start.format('DD.MM.YYYY') &&
        dateRange.end.format('DD.MM.YYYY') === end.format('DD.MM.YYYY');
    } else {
      return false;
    }
  }
  function dateRangeIsYTD(dateRange, user, organization) {
    if(dateRange === undefined) {
      return;
    }

    if(user !== undefined && organization !== undefined) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      var start, end, currentYear;
      var currentTime = LocalizationService.getYesterday().add(1, 'day');

      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      currentYear = systemDate.year;

      var firstDayOfCurrentYear = LocalizationService.getFirstDayOfYear(currentYear);

      if (compareDate(currentTime, firstDayOfCurrentYear) === 0) {
        currentYear -= 1;
        start = LocalizationService.getLastDayOfYear(currentYear);
        end = LocalizationService.getFirstDayOfYear(currentYear);
      } else {
        start = firstDayOfCurrentYear;
        end = LocalizationService.getYesterday();
      }

      return dateRange.start !== undefined && dateRange.end !== undefined &&
        dateRange.start.format('DD.MM.YYYY') === start.format('DD.MM.YYYY') &&
        dateRange.end.format('DD.MM.YYYY') === end.format('DD.MM.YYYY');
    } else {
      return false;
    }
  }

  function dateRangesAreTwoConsecutiveDays(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) {
    if(dateRange1Start === undefined || dateRange2Start === undefined) {
      return;
    }
    return dateRange1End.diff(dateRange1Start) + 1 === moment.duration(1, 'day').asMilliseconds() &&
           dateRange2End.diff(dateRange2Start) + 1 === moment.duration(1, 'day').asMilliseconds() &&
           dateRange2End.diff(dateRange1Start) + 1 === moment.duration(2, 'days').asMilliseconds();
  }

  function dateRangesAreTwoConsecutiveWeeks(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) {
    if(dateRange1Start === undefined || dateRange2Start === undefined) {
      return;
    }
    return dateRange1End.diff(dateRange1Start) + 1 === moment.duration(1, 'week').asMilliseconds() &&
           dateRange2End.diff(dateRange2Start) + 1 === moment.duration(1, 'week').asMilliseconds() &&
           dateRange2End.diff(dateRange1Start) + 1 === moment.duration(2, 'weeks').asMilliseconds();
  }

  function dateRangesAreTwoConsecutiveMonths(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) {
    if(dateRange1Start === undefined || dateRange2Start === undefined) {
      return;
    }
    var dateRange1DurationIs1Month = moment(dateRange1Start).add(1, 'month').subtract(1, 'millisecond').isSame(dateRange1End);
    var dateRange2DurationIs1Month = moment(dateRange2Start).add(1, 'month').subtract(1, 'millisecond').isSame(dateRange2End);
    var wholeDateRangeDurationIs2Months = moment(dateRange1Start).add(2, 'months').subtract(1, 'millisecond').isSame(dateRange2End);
    return dateRange1DurationIs1Month &&
           dateRange2DurationIs1Month &&
           wholeDateRangeDurationIs2Months;
  }

  function dateRangesAreTwoConsecutiveCalendarWeeks(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) {
    if(dateRange1Start === undefined || dateRange2Start === undefined) {
      return;
    }
    return dateRangesAreTwoConsecutiveWeeks(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) &&
           dateRange1Start.isSame(moment(dateRange1Start).startOf('week')); // Is dataRange1Start start of calendar week?
  }

  function dateRangesAreTwoConsecutiveCalendarMonths(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) {
    if(dateRange1Start === undefined || dateRange2Start === undefined) {
      return;
    }
    return dateRangesAreTwoConsecutiveMonths(dateRange1Start, dateRange1End, dateRange2Start, dateRange2End) &&
           dateRange1Start.isSame(moment(dateRange1Start).startOf('month')); // Is dataRange1Start start of calendar month?
  }

  function dateRangeSpansOverTwoCalendarWeeks(dateRangeStart, dateRangeEnd) {
    if(dateRangeStart === undefined || dateRangeEnd === undefined) {
      return;
    }

    var start = moment(dateRangeStart);
    var end = moment(dateRangeEnd);
    var days = end.diff(start, 'days');
    var spansOverTwoWeeks;

    if(days === 0) {
      return false;
    }

    if(days === 6 && (start.day()===0 || start.day()===1) ) {
      spansOverTwoWeeks = false;
    } else {
      spansOverTwoWeeks = true;
    }

    return spansOverTwoWeeks;
  }

  function dateRangeSpansOverTwoCalendarMonths(dateRangeStart, dateRangeEnd) {

    if(dateRangeStart === undefined || dateRangeEnd === undefined) {
      return;
    }
    
    var SystemYearForDateStart = LocalizationService.getSystemYearForDate(dateRangeStart),
        SystemYearForDateEnd = LocalizationService.getSystemYearForDate(dateRangeEnd);
    

    return SystemYearForDateStart.month !== SystemYearForDateEnd.month ||
           SystemYearForDateStart.year !== SystemYearForDateEnd.year
  }

  // Return a date range that is exactly the same length as the given date
  // range, but which ends at the millisecond preceding it.
  //
  // dateRange.start and dateRange.end must be Moment.js objects.
  // See: http://momentjs.com/
  function getPreviousPeriodDateRange(dateRange) {
    if(dateRange === undefined || dateRange.length === 0 ||
       dateRange.start === undefined || dateRange.end === undefined) {
      return;
    }
    /* removed milliseconds calculation as is not safe for dates near daylight saving time transitions.
    When in day light savings the date was geting calculated one day prior because of milliseconds calculation */ 
    var duration = dateRange.end.diff(dateRange.start, 'days') + 1;
    
    return {
      start: moment(dateRange.start).subtract(duration, 'days'),
      end: moment(dateRange.end).subtract(duration, 'days')
    }; 
  }

  function getPreviousCalendarPeriodDateRange(dateRange, user, organization, selectedType) {
    if(dateRange === undefined) {
      return;
    }

    if(ObjectUtils.isNullOrUndefined(selectedType)) {
      selectedType = getCurrentDateRangeShortCut();
    }

    if (dateRangeIsMonth(dateRange, user, organization)) {
      // If current calendar is gregorian and date range is calendar month
      return getDateRangeForLastMonthBeforeDate(dateRange, user, organization);
    } else if (dateRangeIsCalendarYear(dateRange, user, organization)) {
      return getDateRangeForLastCalendarYearBeforeDate(dateRange.start, user, organization);
    } else if (dateRangeIsYTD(dateRange, user, organization) && selectedType === 'ytd') {
      return getDateRangeForPreviousYTD(dateRange);
    } else if (dateRangeIsQTD(dateRange, user, organization) && selectedType === 'qtd') {
      return getDateRangeForPreviousQTD(dateRange);
    } else if (dateRangeIsMTD(dateRange, user, organization) && selectedType === 'mtd') {
      return getDateRangeForPreviousMTD(dateRange);
    } else if (dateRangeIsWTD(dateRange, user, organization) && selectedType === 'wtd') {
      return getDateRangeForPreviousWTD(dateRange);
    }
    // Otherwise, return the preceding date range of the same length.
    return getPreviousPeriodDateRange(dateRange);
  }

  function getDateRangeForPreviousYTD(dateRange) {
    var systemDate = LocalizationService.getSystemYearForDate(dateRange.start);

    var year = systemDate.year - 1;

    var firstDayOfYear = LocalizationService.getFirstDayOfYear(year);

    var length = dateRange.end.diff(dateRange.start,'days');

    return {
      start: firstDayOfYear,
      end: angular.copy(firstDayOfYear).add(length,'days')
    };
  }

  function getDateRangeForPreviousQTD(dateRange) {
    var systemDate = LocalizationService.getSystemYearForDate(dateRange.start);
    var month = systemDate.month;
    var year = systemDate.year;

    var period = Math.floor((month - 1) / 3);
    if(period < 1) {
      period = 4;
      year = year - 1;
    }

    var firstMonthOfQuarter = getFirstMonthInQuarter(period);
    var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, year);
    var length = dateRange.end.diff(dateRange.start,'days');

    return {
      start: firstDayOfCurrentQuarter,
      end: angular.copy(firstDayOfCurrentQuarter).add(length,'days')
    };
  }

  function getDateRangeForPreviousMTD(dateRange) {
    var month, year;

    var systemDate = LocalizationService.getSystemYearForDate(dateRange.start);
    month = systemDate.month - 1;
    year = systemDate.year;

    if(!LocalizationService.hasMonthDefinitions()) {
      month = month - 1;
    }

    if(month < 0) {
      month = 11;
      year = systemDate.year - 1;
    }

    var firstDayOfMonth = LocalizationService.getFirstDayOfMonth(month, year);
    var length = dateRange.end.diff(dateRange.start,'days');

    return {
      start: firstDayOfMonth,
      end: angular.copy(firstDayOfMonth).add(length,'days')
    };
  }

  function getDateRangeForPreviousWTD(dateRange) {
    var range = angular.copy(dateRange);
    return {
      start: range.start.subtract(1,'week'),
      end: range.end.subtract(1,'week')
    };
  }

  function getEquivalentPriorYearDateRange(dateRange, firstDayOfWeekSetting, user, organization, selectedShortcut, hasOnlyOneCompare) {
    var systemDate, year, month;

    if(dateRange === undefined) {
      return;
    }

    if(firstDayOfWeekSetting === undefined) {
      firstDayOfWeekSetting = 'Sunday'; // default to Sunday
    }

    var yearsBackForPriorYearCalculations = 2;

    if(hasOnlyOneCompare === true) {
      yearsBackForPriorYearCalculations = 1;
    }

    if (dateRangeIsCalendarWeek(dateRange, firstDayOfWeekSetting) || (dateRangeIsWTD(dateRange, user, organization) && selectedShortcut === 'wtd')) {
      return {
        start: moment(dateRange.start).subtract(52, 'weeks'),
        end: moment(dateRange.end).subtract(52, 'weeks')
      };
    } else if (dateRangeIsMonth(dateRange, user, organization)) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      systemDate = LocalizationService.getSystemYearForDate(moment(dateRange.end));
      year = systemDate.year - 1;

      if(LocalizationService.hasMonthDefinitions()) {
        month = systemDate.month;
      } else {
        month = systemDate.month - 1;
      }

      return {
        start: LocalizationService.getFirstDayOfMonth(month, year),
        end: LocalizationService.getLastDayOfMonth(month, year)
      };
    } else if (dateRangeIsCalendarYear(dateRange, user, organization)) {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      systemDate = LocalizationService.getSystemYearForDate(moment(dateRange.start));

      //SA-4267 temporary fix
      const calendarSettings = LocalizationService.getActiveCalendarSettings();

      year = systemDate.year - yearsBackForPriorYearCalculations;
      /* if the year is out of scope for the particular calendar type , fallback the year to the start year of 
      the particular calendar type */
      if (!ObjectUtils.isNullOrUndefined(calendarSettings) && !ObjectUtils.isNullOrUndefined(calendarSettings.years)) {
        if (year < calendarSettings.years[0].year) {
          year = calendarSettings.years[0].year;
          return dateRange = {
            start: moment(LocalizationService.getFirstDayOfYear(year)).subtract(52, 'weeks'),
            end: moment(LocalizationService.getLastDayOfYear(year)).subtract(52, 'weeks')
          };
        }
      }
      
      return {
        start: LocalizationService.getFirstDayOfYear(year),
        end: LocalizationService.getLastDayOfYear(year)
      };
    } else if (dateRangeIsYTD(dateRange, user, organization) && selectedShortcut === 'ytd') {
      LocalizationService.setUser(user);
      LocalizationService.setOrganization(organization);

      systemDate = LocalizationService.getSystemYearForDate(moment(dateRange.end));
      year = systemDate.year - yearsBackForPriorYearCalculations;

      var length = dateRange.end.diff(dateRange.start,'days');
      var startDate = LocalizationService.getFirstDayOfYear(year);

      return {
        start: startDate,
        end: angular.copy(startDate).add(length,'days')
      };
    } else {
      return {
        start: moment(dateRange.start).subtract(52, 'weeks'),
        end: moment(dateRange.end).subtract(52, 'weeks')
      };
    }
  }

  function dateRangeIsPriorPeriod(dateRange, compareRange, user, organization, activeType) {
    if(dateRange === undefined || compareRange === undefined ||
       compareRange.start === undefined || compareRange.end === undefined) {
      return false;
    }

    if(ObjectUtils.isNullOrUndefined(activeType)) {
      activeType = getCurrentDateRangeShortCut();
    }

    var defaultPriorPeriod = getPreviousCalendarPeriodDateRange({
      start: dateRange.start,
      end:   dateRange.end
    }, user, organization, activeType);

    if(
       (compareRange.start.format('YYYY-MM-DD') === defaultPriorPeriod.start.format('YYYY-MM-DD') &&
       compareRange.end.format('YYYY-MM-DD') === defaultPriorPeriod.end.format('YYYY-MM-DD'))
       || (dateRangesAreTwoConsecutiveMTDs(dateRange, compareRange, user, organization) && activeType === 'mtd')
       || (dateRangesAreTwoConsecutiveWTDs(dateRange, compareRange, user, organization) && activeType === 'wtd')
       || (dateRangesAreTwoConsecutiveQTDs(dateRange, compareRange, user, organization) && activeType === 'qtd')
       || (dateRangesAreTwoConsecutiveYTDs(dateRange, compareRange, user, organization) && activeType === 'ytd')
      ) {
      return true;
    } else {
      return false;
    }
  }

  function dateRangesAreTwoConsecutiveWTDs(dateRange1, dateRange2, user, organization) {
    var isWTD = dateRangeIsWTD(dateRange1, user, organization);

    if(isWTD) {
      var diff1 = dateRange1.end.diff(dateRange1.start, 'days');
      var diff2 = dateRange2.end.diff(dateRange2.start, 'days');
      var diffWeeks = dateRange1.start.diff(dateRange2.start,'days');

      if(diff1 === diff2 && diffWeeks === 7) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function dateRangesAreTwoConsecutiveMTDs(dateRange1, dateRange2, user, organization) {
    var isMTD = dateRangeIsMTD(dateRange1, user, organization);
    var firstWeekday = LocalizationService.getCurrentCalendarFirstDayOfWeek();

    var currentDateRange = getCurrentDateRangeShortCut();

    if(isMTD &&  currentDateRange === 'mtd' && !dateRangeIsPriorYear(dateRange1,dateRange2,firstWeekday,user,organization)) {
      var diff1 = dateRange1.end.diff(dateRange1.start, 'days');
      var diff2 = dateRange2.end.diff(dateRange2.start, 'days');
      var diffWeeks = dateRange1.start.diff(dateRange2.start,'weeks');

      // We expect that month is shorter than 8 weeks
      if(diff1 === diff2 && diffWeeks < 8) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function dateRangesAreTwoConsecutiveQTDs(dateRange1, dateRange2, user, organization) {
    var isQTD = dateRangeIsQTD(dateRange1, user, organization);
    var firstWeekday = LocalizationService.getCurrentCalendarFirstDayOfWeek();

    var currentDateRange = getCurrentDateRangeShortCut();

    if(isQTD && currentDateRange === 'qtd' && !dateRangeIsPriorYear(dateRange1,dateRange2,firstWeekday,user,organization)) {
      var diff1 = dateRange1.end.diff(dateRange1.start, 'days');
      var diff2 = dateRange2.end.diff(dateRange2.start, 'days');

      if(diff1 === diff2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function dateRangesAreTwoConsecutiveYTDs(dateRange1, dateRange2, user, organization) {
    var isYTD = dateRangeIsYTD(dateRange1, user, organization);

    var currentDateRange = getCurrentDateRangeShortCut();

    if(isYTD && currentDateRange === 'ytd') {
      var diff1 = dateRange1.end.diff(dateRange1.start, 'days');
      var diff2 = dateRange2.end.diff(dateRange2.start, 'days');
      var diffWeeks = dateRange1.start.diff(dateRange2.start,'weeks');

      // We expect that year is no shorter than 50 weeks
      if(diff1 === diff2 && diffWeeks > 50 && diffWeeks < 100) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function dateRangeIsPriorYear(dateRange, compareRange, firstWeekDaySetting, user, organization) {
    if(dateRange === undefined || compareRange === undefined ||
      compareRange.start === undefined || compareRange.end === undefined) {
      return false;
    }

    var currentDateRange = getCurrentDateRangeShortCut();

    var defaultPriorYear = getEquivalentPriorYearDateRange({
      start: dateRange.start,
      end:   dateRange.end
    }, firstWeekDaySetting, user, organization, currentDateRange);

    if(!ObjectUtils.isNullOrUndefined(defaultPriorYear.start) && !ObjectUtils.isNullOrUndefined(defaultPriorYear.end) &&
       compareRange.start.format('YYYY-MM-DD') === defaultPriorYear.start.format('YYYY-MM-DD') &&
       compareRange.end.format('YYYY-MM-DD') === defaultPriorYear.end.format('YYYY-MM-DD')) {
      return true;
    } else {
      return false;
    }
  }

  function getUrlFromTemplate(urlParams, urlTemplate, urlQueryParams) {
    var url = urlTemplate;

    // Extract parameter names from url template
    var paramNames = [];
    angular.forEach(url.split(/\W/), function(paramName) {
      if (!(new RegExp('^\\d+$').test(paramName)) && paramName &&
        (new RegExp('(^|[^\\\\]):' + paramName + '(\\W|$)').test(url))) {
        paramNames.push(paramName);
      }
    });
    url = url.replace(/\\:/g, ':');

    // Loop through parameter names and replace them in the url
    angular.forEach(paramNames, function(paramKey) {
      // If parameter has no value in urlParams, replace it with an empty string
      var encodedVal = urlParams[paramKey] ? encodeUriSegment(urlParams[paramKey]) : '';
      url = url.replace(new RegExp(':' + paramKey + '(\\W|$)', 'g'), function(match, p1) {
        return encodedVal + p1;
      });
    });

    url = url.replace(/\/+$/, '') || '/';

    if(!ObjectUtils.isNullOrUndefinedOrEmptyObject(urlQueryParams)) {
     _.each(_.keys(urlQueryParams), function(key,index){
       if(index === 0) {
         url += '?';
       }
       else {
         url += '&';
       }
       url += key + '=' + urlQueryParams[key];
     });

    }

    return url;
  }

  // We need a custom method, because encodeURIComponent is too aggressive.
  function encodeUriSegment(val) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '%20').
      replace(/%26/gi, '&').
      replace(/%3D/gi, '=').
      replace(/%2B/gi, '+');
  }

  function saveFileAs(filename, data, type) {
    var file = new Blob([data], { type: type });
    var fileURL = URL.createObjectURL(file);

    var downloadAttrSupported = ('download' in document.createElement('a'));

    if(downloadAttrSupported) {
      var a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = fileURL;
      a.download = filename;
      a.click();
      document.body.removeChild(a);
    } else {
      saveAs(file, filename);
    }
  }

  function svg11IsSupported() {
    return document.implementation.hasFeature('www.http://w3.org/TR/SVG11/feature#Extensibility', '1.1');
  }

  function startsWith(string, start) {
    return string.indexOf(start) === 0;
  }

  function isExisty(value) {
    return value !== null && value !== undefined;
  }

  function hasExistyElements(elements) {
    return elements.some(isExisty);
  }

  function urlDateParamsLoaded(params, noSecondCompare) {
    if(params.dateRangeStart !== undefined && params.dateRangeEnd !== undefined &&
       params.compareRange1Start !== undefined && params.compareRange1End !== undefined &&
       params.compareRange2Start !== undefined && params.compareRange2End !== undefined) {
        return true;
    } else if(params.dateRangeStart !== undefined && params.dateRangeEnd !== undefined &&
      params.compareRange1Start !== undefined && params.compareRange1End !== undefined &&
      noSecondCompare) {
      return true;
    } else {
      return false;
    }
  }

  function compareRangeIsPriorPeriod(comparePeriod, currentPeriod, user, organization) {
    if(comparePeriod === undefined || currentPeriod === undefined || user === undefined || organization === undefined) {
      return;
    }
    var range = {
      start: currentPeriod.start,
      end: currentPeriod.end
    };

    if(dateRangeIsPriorPeriod(range, comparePeriod, user, organization)) {
      return true;
    } else {
      return false;
    }
  }

  function compareRangeIsPriorYear(comparePeriod, currentPeriod, user, organization) {
    if(comparePeriod === undefined || currentPeriod === undefined || user === undefined) {
      return;
    }
    var range = {
      start: currentPeriod.start,
      end: currentPeriod.end
    };

    var firstDaySetting = LocalizationService.getCurrentCalendarFirstDayOfWeek();

    if(dateRangeIsPriorYear(range, comparePeriod, firstDaySetting, user, organization)) {
      return true;
    } else {
      return false;
    }
  }

  //ToDo - stop using this function or wire it up with the date range service
  function dateRangeIsSetTo(type, dateRange, organization, user) {
    var compareDateRange;

    LocalizationService.setOrganization(organization);
    LocalizationService.setUser(user);

    var currentMonth = LocalizationService.getCurrentMonth();
    var currentYear = parseInt(LocalizationService.getCurrentYear());

    if(type==='day') {
      compareDateRange = {
        start: moment().startOf('day').subtract(1, 'day'),
        end: moment().startOf('day').subtract(1, 'day').endOf('day')
      };
    } else if(type==='week') {
      compareDateRange = {
        start: LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week'),
        end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week')
      };
    } else if(type==='month') {
      var previousYear;
      var previousMonth = currentMonth - 1;
      if(previousMonth < 1) {
        previousMonth = 12;
        previousYear = currentYear - 1;
      } else {
        previousYear = currentYear;
      }
      compareDateRange = {
        start: LocalizationService.getFirstDayOfMonth(previousMonth, previousYear),
        end: LocalizationService.getLastDayOfMonth(previousMonth, previousYear)
      };
    } else if(type==='year') {
      compareDateRange = {
        start: LocalizationService.getFirstDayOfYear(currentYear-1),
        end: LocalizationService.getLastDayOfYear(currentYear-1)
      };
    } else if(type==='wtd') {
      compareDateRange = getDateRangeForType('wtd',organization,user);
    } else if(type==='mtd') {
      compareDateRange = getDateRangeForType('mtd',organization,user);
    } else if(type==='qtd') {
      compareDateRange = getDateRangeForType('qtd',organization,user);
    } else if(type==='ytd') {
      compareDateRange = getDateRangeForType('ytd',organization,user);
    } else {
      return false;
    }

    return dateRange.start.format('DD.MM.YYYY') === compareDateRange.start.format('DD.MM.YYYY') &&
           dateRange.end.format('DD.MM.YYYY') === compareDateRange.end.format('DD.MM.YYYY');
  }

  function getDateRangeType(dateRange, user, organization) {
    var presets = ['day', 'week', 'month', 'year', 'wtd', 'mtd', 'qtd', 'ytd'];

    var type = 'custom';

    if(!ObjectUtils.isNullOrUndefined(user) &&
       !ObjectUtils.isNullOrUndefined(organization) &&
       !ObjectUtils.isNullOrUndefined(dateRange.start) &&
       !ObjectUtils.isNullOrUndefined(dateRange.end)
    ) {
      _.each(presets, function(preset) {
        if(dateRangeIsSetTo(preset, dateRange, organization, user)) {
          type = preset;
        }
      });
      return type;
    }
  }

  function getDateRangeForType(type, organization, user) {
    var dateRange;

    LocalizationService.setOrganization(organization);
    LocalizationService.setUser(user);

    var currentMonth = LocalizationService.getCurrentMonth();
    var currentYear = parseInt(LocalizationService.getCurrentYear());
    var currentTime = moment();

    if(type==='day') {
      dateRange = {
        start: moment().startOf('day').subtract(1, 'day'),
        end: moment().startOf('day').subtract(1, 'day').endOf('day')
      };
    } else if(type==='week') {
      dateRange = {
        start: LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week'),
        end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week')
      };
    } else if(type==='month') {
      var year;
      var month = currentMonth -1;
      if(month < 1) {
        month = 12;
        year = currentYear - 1;
      } else {
        year = currentYear;
      }
      dateRange = {
        start: LocalizationService.getFirstDayOfMonth(month, year),
        end: LocalizationService.getLastDayOfMonth(month, year)
      };
    } else if(type==='year') {
      currentYear = currentYear - 1;
      dateRange = {
        start: LocalizationService.getFirstDayOfYear(currentYear),
        end: LocalizationService.getLastDayOfYear(currentYear)
      };
    } else if(type==='wtd') {
      var firstDayOfCurrentWeek = LocalizationService.getFirstDayOfCurrentWeek();
      if (compareDate(currentTime, firstDayOfCurrentWeek) === 0) {
        dateRange = {
          start: firstDayOfCurrentWeek.subtract(1, 'week'),
          end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week')
        };
      } else {
        dateRange = {
          start: firstDayOfCurrentWeek,
          end: currentTime.subtract(1, 'day')
        };
      }
    } else if(type==='mtd') {
      var firstDayOfCurrentMonth = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);

      if (compareDate(currentTime, firstDayOfCurrentMonth) === 0) {
        if (currentMonth === 1) {
          currentMonth = 12;
          currentYear -= 1;
        }
        else {
          currentMonth -= 1;
        }
        dateRange = {
          start: LocalizationService.getFirstDayOfMonth(currentMonth, currentYear),
          end: LocalizationService.getLastDayOfMonth(currentMonth, currentYear)
        };
      } else {
        dateRange = {
          start: firstDayOfCurrentMonth,
          end: moment().subtract(1, 'day')
        };
      }
    } else if(type==='qtd') {
      var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
      var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), currentYear);

      if (compareDate(currentTime, firstDayOfCurrentQuarter) === 0) {
        if (currPeriod === 1) {
          currPeriod = 4;
          currentYear -= 1;
          currentMonth = 12;
        }
        else {
          currPeriod -= 1;
          currentMonth -= 1;
        }
        dateRange = {
          start: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), currentYear),
          end: LocalizationService.getLastDayOfMonth(currentMonth, currentYear)
        };
      } else {
        dateRange = {
          start: firstDayOfCurrentQuarter,
          end: moment().subtract(1, 'day')
        };
      }
    } else if(type==='ytd') {
      var firstDayOfCurrentYear = LocalizationService.getFirstDayOfYear(currentYear);

      if (compareDate(currentTime, firstDayOfCurrentYear) === 0) {
        currentYear -= 1;
        dateRange = {
          start: LocalizationService.getFirstDayOfYear(currentYear),
          end: LocalizationService.getLastDayOfYear(currentYear)
        };
      } else {
        dateRange = {
          start: firstDayOfCurrentYear,
          end: moment().subtract(1, 'day')
        };
      }
    } else {
      return false;
    }

    return dateRange;
  }

  function compareDate(dateTimeA, dateTimeB) {
    var momentA = moment(dateTimeA, 'DD/MM/YYYY');
    var momentB = moment(dateTimeB, 'DD/MM/YYYY');
    if (momentA.isAfter(momentB, 'day')) {
      return 1;
    }
    else if (momentB.isAfter(momentA, 'day')) {
      return -1;
    }
    return 0;
  }

  function getFirstMonthInQuarter(quarterNumber) {
    return quarterNumber * 3 - 3;
  }

  // @todo: This will be altered to use state's shortcut param in future after SA-1027 is merged
  function getCurrentDateRangeShortCut() {
    return localStorageService.get('currentDateRangeShortcut');
  }

  function getShortcutDateRange(shortcut, currentOrg, currentUser) {
    switch (shortcut) {
      case 'week_to_date': return setWTD();
      case 'month_to_date': return setMTD();
      case 'quarter_to_date': return setQTD();
      case 'year_to_date': return setYTD();
      default: return setDateShortCut(shortcut, currentOrg, currentUser);
    }
  }

  function setDateShortCut(shortcut, currentOrg, currentUser) {
    var newDateRange;

    LocalizationService.setOrganization(currentOrg);
    LocalizationService.setUser(currentUser);
    var now = moment();
    var calendarInfo = LocalizationService.getSystemYearForDate(now);
    if (!LocalizationService.hasMonthDefinitions()) calendarInfo.month -= 1;

    var currentMonth = calendarInfo.month;
    var currentYear = calendarInfo.year;

    switch (shortcut) {
      case 'day':
        newDateRange = {
          start: moment().startOf('day').subtract(1, 'day').startOf('day'),
          end: moment().startOf('day').subtract(1, 'day').endOf('day')
        };
        break;
      case 'week':
        newDateRange = {
          start: LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week'),
          end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week').endOf('day')
        };
        break;
      case 'month':
        var previousYear;
        var previousMonth = currentMonth - 1;
        if (previousMonth < 0) {
          previousMonth = 11;
          previousYear = currentYear - 1;
        } else {
          previousYear = currentYear;
        }

        newDateRange = {
          start: LocalizationService.getFirstDayOfMonth(previousMonth, previousYear),
          end: LocalizationService.getLastDayOfMonth(previousMonth, previousYear)
        };
        break;
      case 'quarter':
          var currentMonth = LocalizationService.getCurrentMonth(),
              currPeriod = Math.floor((currentMonth - 1) / 3) + 1,
              prevPeriod = currPeriod - 1,
              currentYear = LocalizationService.getCurrentYear(),
              nextPeriod = currPeriod + 1,
              year = currentYear;

          if (prevPeriod < 1) {
            prevPeriod = 4;
            year = currentYear - 1;
          }

          if(nextPeriod > 4) {
            nextPeriod = 1;
          }

          newDateRange = {
            start: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), year),
            end: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(nextPeriod), currentYear).subtract(1, 'days')
          };
        break;
      case 'year':
        newDateRange = {
          start: LocalizationService.getFirstDayOfYear(currentYear - 1),
          end: LocalizationService.getLastDayOfYear(currentYear - 1)
        };
        break;
    }

    return newDateRange;
  }

  function setWTD() {
    var dateRange = {};
    dateRange.start = LocalizationService.getFirstDayOfCurrentWeek();
    dateRange.end = moment().subtract(1, 'day').endOf('day');
    return dateRange;
  }

  function setMTD() {
      var currentTime = moment(),
          systemDate = LocalizationService.getSystemYearForDate(currentTime),
          currentMonth = systemDate.month,
          currentYear = systemDate.year,
          dateRange = {},
          currentCalendarSettings = LocalizationService.getActiveCalendarSettings();

          if(LocalizationService.isGregorian(currentCalendarSettings)) {
            currentMonth = currentMonth - 1;
            if(currentMonth < 1){
              currentMonth = 12;
            }
          }

      dateRange.start = moment(LocalizationService.getFirstDayOfMonth(currentMonth, currentYear)).startOf('day');
      dateRange.end = moment().subtract(1, 'day').endOf('day');

      return dateRange;
  }

    function setQTD() {
      var currentTime = moment(),
          systemDate = LocalizationService.getSystemYearForDate(currentTime),
          currentMonth = systemDate.month,
          currentYear = systemDate.year,
          dateRange = {},
          currPeriod = Math.floor((currentMonth - 1) / 3) + 1,
          firstMonthOfQuarter = getFirstMonthInQuarter(currPeriod),
          firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, currentYear);

      dateRange.start = firstDayOfCurrentQuarter;
      dateRange.end = moment().subtract(1, 'day').endOf('day');

      return dateRange;

    }

    function setYTD() {
      var currentTime = moment(),
          systemDate = LocalizationService.getSystemYearForDate(currentTime),
          currentYear = systemDate.year,
          dateRange = {};

      dateRange.start = LocalizationService.getFirstDayOfYear(currentYear);
      dateRange.end = moment().subtract(1, 'day').endOf('day');
      return dateRange;
    }

    /**
     * Gets the number of days between two dayes
     * 
     * @param {object} startDate - The start date. A momentJs object
     * @param {object} endDate - The end date. A momentJs object
     * @param {boolean} includeFirstDay - Optional. Defaults to true
     * @returns {number} The number of days between the dates. Includes the the first day
     */
    function getDaysBetweenDates(startDate, endDate, includeFirstDay) {
      if(_.isUndefined(includeFirstDay)) {
        includeFirstDay = true;
      }

      if(!moment.isMoment(startDate)) {
        throw new Error('startDate must be a valid momentJs object');
      }

      if(!moment.isMoment(endDate)) {
        throw new Error('endDate must be a valid momentJs object');
      }

      var dayBetweenDates = endDate.diff(startDate, 'days');

      if(includeFirstDay) {
        dayBetweenDates = dayBetweenDates + 1;
      }

      return dayBetweenDates;
    }

  /**
   * Gets a date string that the API will consume.
   * This returns a string that contains no timezone specific information
   *
   * @param {object} date a momentJS date object
   * @returns {string} An ISO 8601 date without timezone information (YYYY-MM-DDTHH:mm:ss), plus a faked UTC declaration
   * The API forces us to provide a faked UTC declaration 
   */
    function getDateStringForRequest(date) {
      if(!moment.isMoment(date)) {
        throw new Error('The provided date is not a momentJS date');
      }

      var format = 'YYYY-MM-DDTHH:mm:ss.SSS[Z]';

      var dateString = date.format(format);

      return dateString;
    }

  return {
    dateRangeIsCalendarWeek:                    dateRangeIsCalendarWeek,
    dateRangeIsMonth:                           dateRangeIsMonth,
    dateRangeIsCalendarYear:                    dateRangeIsCalendarYear,
    getDateRangeForLastMonthBeforeDate:         getDateRangeForLastMonthBeforeDate,
    getDateRangeForLastCalendarYearBeforeDate:  getDateRangeForLastCalendarYearBeforeDate,
    dateRangesAreTwoConsecutiveDays:            dateRangesAreTwoConsecutiveDays,
    dateRangesAreTwoConsecutiveWeeks:           dateRangesAreTwoConsecutiveWeeks,
    dateRangesAreTwoConsecutiveMonths:          dateRangesAreTwoConsecutiveMonths,
    dateRangesAreTwoConsecutiveCalendarWeeks:   dateRangesAreTwoConsecutiveCalendarWeeks,
    dateRangesAreTwoConsecutiveCalendarMonths:  dateRangesAreTwoConsecutiveCalendarMonths,
    dateRangeSpansOverTwoCalendarWeeks:         dateRangeSpansOverTwoCalendarWeeks,
    dateRangeSpansOverTwoCalendarMonths:        dateRangeSpansOverTwoCalendarMonths,
    getPreviousPeriodDateRange:                 getPreviousPeriodDateRange,
    getPreviousCalendarPeriodDateRange:         getPreviousCalendarPeriodDateRange,
    getEquivalentPriorYearDateRange:            getEquivalentPriorYearDateRange,
    getUrlFromTemplate:                         getUrlFromTemplate,
    dateRangeIsPriorPeriod:                     dateRangeIsPriorPeriod,
    dateRangeIsPriorYear:                       dateRangeIsPriorYear,
    saveFileAs:                                 saveFileAs,
    svg11IsSupported:                           svg11IsSupported,
    startsWith:                                 startsWith,
    isExisty:                                   isExisty,
    hasExistyElements:                          hasExistyElements,
    urlDateParamsLoaded:                        urlDateParamsLoaded,
    compareRangeIsPriorPeriod:                  compareRangeIsPriorPeriod,
    compareRangeIsPriorYear:                    compareRangeIsPriorYear,
    dateRangeIsSetTo:                           dateRangeIsSetTo,
    getDateRangeType:                           getDateRangeType,
    getDateRangeForType:                        getDateRangeForType,
    getFirstMonthInQuarter:                     getFirstMonthInQuarter,
    compareDate:                                compareDate,
    getDateRangeForPreviousWTD:                 getDateRangeForPreviousWTD,
    getDateRangeForPreviousQTD:                 getDateRangeForPreviousQTD,
    getDateRangeForPreviousMTD:                 getDateRangeForPreviousMTD,
    getDateRangeForPreviousYTD:                 getDateRangeForPreviousYTD,
    getShortcutDateRange:                       getShortcutDateRange,
    getDaysBetweenDates:                        getDaysBetweenDates,
    getDateStringForRequest:                    getDateStringForRequest
  };
}]);
