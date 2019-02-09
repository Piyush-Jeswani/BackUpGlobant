(function() {
  'use strict';

  angular.module('shopperTrak').factory('dateRangeHelper', dateRangeHelper);
  dateRangeHelper.$inject = [
    'LocalizationService',
    'utils',
    'ObjectUtils',
    'NumberUtils'
  ];

  function dateRangeHelper(
    LocalizationService,
    utils,
    ObjectUtils,
    NumberUtils
  ) {
    function compareDate(dateTimeA, dateTimeB) {
      var momentA = moment(dateTimeA, 'DD/MM/YYYY');
      var momentB = moment(dateTimeB, 'DD/MM/YYYY');
      if (momentA.isAfter(momentB, 'day')) {
        return 1;
      } else if (momentB.isAfter(momentA, 'day')) {
        return -1;
      }
      return 0;
    }

    function getCurrentTime() {
      return moment();
    }

    function getWTDForEndDate(endDate) {
      var firstDayOfWeek = LocalizationService.getFirstDayOfCurrentWeek().day();
      var startDate;
      var previousDay = moment(endDate).subtract(1, 'days');

      while(angular.isUndefined(startDate)) {
        if(previousDay.day() === firstDayOfWeek) {
          startDate = moment(previousDay);
        }

        previousDay.subtract(1, 'days');
      }

      return {
        start: startDate,
        end: endDate
      };
    }

  /**
   * Gets the first date in the current week for the current calendar
   *
   * @param {object} endDate - Optional. A momentJs object.
   * If provided, this function will find the WeekToDate range ending at this date
   */
    function getWTD(endDate) {
      if(angular.isDefined(endDate)) {
        return getWTDForEndDate(endDate);
      }

      var firstDayOfCurrentWeek = LocalizationService.getFirstDayOfCurrentWeek();
      var currentTime = getCurrentTime();

      if (compareDate(currentTime, firstDayOfCurrentWeek) === 0) {
        return {
          start: firstDayOfCurrentWeek.subtract(1, 'week'),
          end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week'),
        };
      }

      return {
        start: firstDayOfCurrentWeek,
        end: currentTime.subtract(1, 'day')
      };
    }

    function getMTDForEndDate(endDate) {
      var systemDate = LocalizationService.getSystemYearForDate(endDate);

      if(LocalizationService.isCurrentCalendarGregorian()) {
        systemDate.month = systemDate.month - 1;
      }

      var monthStartDate = LocalizationService.getFirstDayOfMonth(systemDate.month, systemDate.year);

      return {
        start: monthStartDate,
        end: endDate
      };
    }

    function getMTD(endDate) {
      if(angular.isDefined(endDate)) {
        return getMTDForEndDate(endDate);
      }

      var currentMonth, currentYear;
      var currentTime = getCurrentTime();
      currentYear = NumberUtils.getNumberValue(LocalizationService.getCurrentYear());
      currentMonth = NumberUtils.getNumberValue(LocalizationService.getCurrentMonth()) -1; // Zero indexed month number
      var firstDayOfCurrentMonth = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);

      if (compareDate(currentTime, firstDayOfCurrentMonth) === 0) {
        if (currentMonth === 1) {
          currentMonth = 12;
          currentYear -= 1;
        } else {
          currentMonth -= 1;
        }
        return {
          end: LocalizationService.getLastDayOfMonth(currentMonth, currentYear),
          start: LocalizationService.getFirstDayOfMonth(currentMonth, currentYear)
        };
      }

      return {
        start: firstDayOfCurrentMonth,
        end: moment().subtract(1, 'day')
      };
    }

    function getYTD(endDate) {
      if(!angular.isDefined(endDate)) {
        endDate = moment();
      }

      var currentTime = getCurrentTime();

      var systemDate = LocalizationService.getSystemYearForDate(endDate);

      var firstDayOfCurrentYear = LocalizationService.getFirstDayOfYear(systemDate.year);

      if (compareDate(currentTime, firstDayOfCurrentYear) === 0) {
        systemDate.year -= 1;
        return {
          end: LocalizationService.getLastDayOfYear(systemDate.year),
          start: LocalizationService.getFirstDayOfYear(systemDate.year)
        };
      }
      return {
        start: firstDayOfCurrentYear,
        end: moment().subtract(1, 'day')
      };
    }

    function getFirstMonthInQuarter(quarterNumber) {
      return quarterNumber * 3 - 2;
    }

    function getQTD(endDate) {
      if(!angular.isDefined(endDate)) {
        endDate = moment();
      }

      var currentTime = getCurrentTime();

      var systemDate = LocalizationService.getSystemYearForDate(endDate);

      if(LocalizationService.isCurrentCalendarGregorian()) {
        systemDate.month = systemDate.month - 1;
      }

      var currPeriod = Math.floor((systemDate.month - 1) / 3) + 1;
      var firstMonthInQuarter = getFirstMonthInQuarter(currPeriod) - 1; // Must be the zero indexed month number
      var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthInQuarter, systemDate.year);
      console.log('firstDayOfCurrentQuarter', firstDayOfCurrentQuarter.format('DD/MM/YYYY'));
      if (compareDate(currentTime, firstDayOfCurrentQuarter) === 0) {
        if (currPeriod === 1) {
          currPeriod = 4;
          systemDate.year -= 1;
          systemDate.month = 12;
        } else {
          currPeriod -= 1;
          systemDate.month -= 1;
        }

        return {
          end: LocalizationService.getLastDayOfMonth(systemDate.month, systemDate.year),
          start: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), systemDate.year)
        };
      }
      return {
        start: firstDayOfCurrentQuarter,
        end: moment().subtract(1, 'day')
      };
    }

    function getComparisonDateRange(type, user, org, range, firstDaySetting) {
      if (type === 'prior_period') {
        return getPriorPeriod(user, org, range);
      }
      getPriorYearPeriod(user, org, firstDaySetting, range);
    }

    function getPriorPeriod(user, org, range) {
      return utils.getPreviousCalendarPeriodDateRange({
        start: range.start,
        end: range.end
      }, user, org);
    }

    function getPriorYearPeriod(user, org, firstDaySetting, range) {
      return utils.getEquivalentPriorYearDateRange({
        start: range.start,
        end: range.end
      }, firstDaySetting, user, org);
    }

    function getYearPeriod() {
      var systemDate = LocalizationService.getSystemYearForDate(moment());
      var year = systemDate.year - 1;
      return {
        start: LocalizationService.getFirstDayOfYear(year),
        end: LocalizationService.getLastDayOfYear(year)
      };
    }

    function getMonthPeriod() {
      var systemDate = LocalizationService.getSystemYearForDate(moment());
      var currentMonth = LocalizationService.getCurrentMonth();
      var previousMonth = currentMonth - 1;
      var year = systemDate.year;

      if (previousMonth < 1) {
        previousMonth = 12;
        year = systemDate.year - 1;
      }

      return {
        start: LocalizationService.getFirstDayOfMonth(previousMonth, year),
        end: LocalizationService.getLastDayOfMonth(previousMonth, year)
      };
    }

    function getQuarterPeriod() {
      var currentMonth = NumberUtils.getNumberValue(LocalizationService.getCurrentMonth());
      var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
      var prevPeriod = currPeriod - 1;
      var currentYear = NumberUtils.getNumberValue(LocalizationService.getCurrentYear());

      var year = currentYear;

      if (prevPeriod < 1) {
        prevPeriod = 4;
        year = currentYear - 1;
      }

      return {
        start: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(prevPeriod), year),
        end: LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter(currPeriod), currentYear)
      };
    }

    function getWeekPeriod() {
      return {
        start: LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week'),
        end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week')
      };
    }

    function getDayPeriod() {
      return {
        start: moment().startOf('day').subtract(1, 'day'),
        end: moment().startOf('day').subtract(1, 'day').endOf('day')
      };
    }

    function getDateRange(key, range, user, org, firstDaySetting) {
      switch (key) {
        case 'day':
          return getDayPeriod();
        case 'week':
          return getWeekPeriod();
        case 'month':
          return getMonthPeriod();
        case 'quarter':
          return getQuarterPeriod();
        case 'year':
          return getYearPeriod();
        case 'wtd':
          return getWTD();
        case 'week_to_date':
          return getWTD();
        case 'mtd':
          return getMTD();
        case 'month_to_date':
          return getMTD();
        case 'qtd':
          return getQTD();
        case 'quarter_to_date':
          return getQTD();
        case 'ytd':
          return getYTD();
        case 'year_to_date':
          return getYTD();
        case 'priorPeriod':
          return getPriorPeriod(user, org, range);
        case 'prior_period':
          return getPriorPeriod(user, org, range);
        case 'priorYear':
          return getPriorYearPeriod(user, org, firstDaySetting, range);
        case 'prior_year':
          return getPriorYearPeriod(user, org, firstDaySetting, range);
        default:
          break;
      }
    }

    function isInRange(data, period) {
      var rangeDateStart = moment(period.start, 'YYYY-MM-DD');
      var rangeDateEnd = moment(period.end, 'YYYY-MM-DD');
      var startDate = moment(data.period_start_date, 'YYYY-MM-DD');
      var endDate = moment(data.period_end_date, 'YYYY-MM-DD');
      return (startDate.isSame(rangeDateStart) ||
          startDate.isBetween(rangeDateStart, rangeDateEnd) ||
          startDate.isSame(rangeDateEnd)) &&
        (endDate.isSame(rangeDateStart) ||
          endDate.isBetween(rangeDateStart, rangeDateEnd) ||
          endDate.isSame(rangeDateEnd));
    }

    function getDateRangeParams(dateRange) {
      if (ObjectUtils.isNullOrUndefined(dateRange)) {
        return null;
      }

      //check if there is day saving
      if(dateRange.start.isDST()) {
        return {
          reportStartDate:  dateRange.start.subtract(1, 'hour').format('YYYY-MM-DD'),
          reportEndDate: dateRange.end.subtract(1, 'hour').format('YYYY-MM-DD')
        };
      }

      return {
        reportStartDate: dateRange.start.format('YYYY-MM-DD'),
        reportEndDate: dateRange.end.format('YYYY-MM-DD')
      };
    }

    return {
      compareDate: compareDate,
      getCurrentTime: getCurrentTime,
      getWTD: getWTD,
      getMTD: getMTD,
      getYTD: getYTD,
      getFirstMonthInQuarter: getFirstMonthInQuarter,
      getQTD: getQTD,
      getComparisonDateRange: getComparisonDateRange,
      getPriorPeriod: getPriorPeriod,
      getPriorYearPeriod: getPriorYearPeriod,
      getYearPeriod: getYearPeriod,
      getQuarterPeriod: getQuarterPeriod,
      getMonthPeriod: getMonthPeriod,
      getWeekPeriod: getWeekPeriod,
      getDayPeriod: getDayPeriod,
      getDateRange: getDateRange,
      isInRange: isInRange,
      getDateRangeParams: getDateRangeParams
    };
  }
})();
