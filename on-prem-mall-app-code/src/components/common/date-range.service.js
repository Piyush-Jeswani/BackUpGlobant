let cache = {};

/**
 * Enum for comparison range names
 * @readonly
 * @enum {string}
 */
const rangeNames = {
  priorPeriod: 'prior_period',
  priorYear: 'prior_year',
  custom: 'custom'
};

class dateRangeService {
  constructor (LocalizationService, utils, ObjectUtils) {
    this.LocalizationService = LocalizationService;
    this.utils = utils;
    this.ObjectUtils = ObjectUtils;
  }

  /**
  * @function checkDateRangeIsValid
  *
  * Takes in the state and checks to see if the date range is at least a full day.
  * In stan 1 day does not equal 24 hours, but slightly less.
  *
  * @param {object} state the current $state object
  * @returns {boolean}
  */
  checkDateRangeIsValid (state) {
    const minutesInOneHr = 60;
    const minhoursInRange = 22.9;

    if (this.ObjectUtils.isNullOrUndefined(state.params.dateRangeEnd) || 
    this.ObjectUtils.isNullOrUndefined(state.params.dateRangeStart)) return true;
    const hoursInRange = state.params.dateRangeEnd.diff(state.params.dateRangeStart, 'minutes') / minutesInOneHr;
    if (hoursInRange >= minhoursInRange) return true;
    return false;
  }

  /**
   * @function getNewStateDateParams
   *
   * checks the state for a previously selected date shortcut and uses the service to get that date range
   * if no shortcut is found then the 'week' date range is retrived.
   *
   *
   * @param {object} state the current $state object
   * @param {object} currentUser the current user
   * @param {object} currentOrganization the current organisation
   *
   * @returns {object} containing the requiste date range and compare periods - these are passed into a state.go function
   */
  getNewStateDateParams (state, currentUser, currentOrganization) {
    let defaultRanges;
    if (!this.ObjectUtils.isNullOrUndefinedOrEmpty(state.rangeSelected)) {
      const selectedRangeShortcut = state.rangeSelected !== 'custom' ? state.rangeSelected : state.customRange;
      if (selectedRangeShortcut === 'custom' || this.ObjectUtils.isNullOrUndefinedOrEmpty(selectedRangeShortcut)) {
        defaultRanges = this.getSelectedAndCompareRanges('week', currentUser, currentOrganization);
      } else {
        defaultRanges = this.getSelectedAndCompareRanges(selectedRangeShortcut, currentUser, currentOrganization);
      }
    } else {
      defaultRanges = this.getSelectedAndCompareRanges('week', currentUser, currentOrganization);
    }

    return {
      dateRangeStart: defaultRanges.selectedPeriod.start,
      dateRangeEnd: defaultRanges.selectedPeriod.end,
      compareRange1Start: defaultRanges.comparePeriod1.start,
      compareRange1End: defaultRanges.comparePeriod1.end,
      compareRange2Start: defaultRanges.comparePeriod2.start,
      compareRange2End: defaultRanges.comparePeriod2.end
    };
  }

  /**
  * Returns the date range
  * This takes into account the users compare period selections and assigns them accordingly
  * @param {string} can be day, week, month, quarter, year, wtd, mtd, qtd, ytd
  * @returns {object} containing three {objects} each with two moment objects
  */
  getPeriodRange (period, currentUser, currentOrg) {
    switch (period) {
      case 'day':
        return this.getDay();
      case 'week':
        return this.getWeek();
      case 'month':
        return this.getMonth(currentOrg, currentUser);
      case 'quarter':
        return this.getQuarter();
      case 'year':
        return this.getYear(currentOrg, currentUser);
      case 'week_to_date':
      case 'wtd':
        return this.getWeekToDate();
      case 'month_to_date':
      case 'mtd':
        return this.getMonthToDate(currentOrg, currentUser);
      case 'quarter_to_date':
      case 'qtd':
        return this.getQuarterToDate();
      case 'year_to_date':
      case 'ytd':
        return this.getYearToDate(currentOrg, currentUser);
    }
  }

  /**
  * Returns the selected period and both compare period date ranges
  * This takes into account the users compare period selections and assigns them accordingly
  * @param {string} can be day, week, month, quarter, year, wtd, mtd, qtd, ytd
  * @returns {object} containing three {objects} each with two moment objects
  */
  getSelectedAndCompareRanges (period, currentUser, currentOrg, hasOnlyOneCompare) {
    const dateRanges = {};
    dateRanges.selectedPeriod = this.getPeriodRange(period, currentUser, currentOrg);

    if (hasOnlyOneCompare === true) {
      dateRanges.comparePeriod1 = this.getCustomPeriod(dateRanges.selectedPeriod, 
                                                       currentUser, 
                                                       currentOrg, 
                                                       period, 
                                                       null, 
                                                       rangeNames.priorYear, 
                                                       true);
    } else {
      dateRanges.comparePeriod1 = this.getCustomPeriod(dateRanges.selectedPeriod, currentUser, currentOrg, period, 'compare1Range');
      dateRanges.comparePeriod2 = this.getCustomPeriod(dateRanges.selectedPeriod, currentUser, currentOrg, period, 'compare2Range');
    }

    return dateRanges;
  }

  /**
    * Works out what the compare period is based on the current period.
    * @param {object} currentPeriod a date range containing two momentJS objects
    * @param {object} compareRange a date range containing two momentJS objects
    * @param {object} currentUser the current user
    * @param {object} currentOrg the current org
    * @param {('day'|'week'|'month'|'quarter'|'year'|'wtd'|'mtd'|'qtd'|'ytd')} period Optional. 
    * The date period shortcut e.g. 'mtd'. If not set, this function will use the utils service to work out what this is
    * @returns {boolean}
    */
  getCompareType (currentPeriod, compareRange, currentUser, currentOrg, period) {
    if (!this.dateRangeIsValid(currentPeriod) || !this.dateRangeIsValid(compareRange)) {
      return;
    }

    const priorYearCompareRange = this.getCustomPeriod(currentPeriod, currentUser, currentOrg, period, null, rangeNames.priorYear);

    if (this.dateRangesAreEqual(compareRange, priorYearCompareRange)) {
      return rangeNames.priorYear;
    }

    const priorPeriodCompareRange = this.getCustomPeriod(currentPeriod, currentUser, currentOrg, period, null, rangeNames.priorPeriod);

    if (this.dateRangesAreEqual(compareRange, priorPeriodCompareRange)) {
      return rangeNames.priorPeriod;
    }
    return rangeNames.custom;
  }

  dateRangeIsValid (dateRange) {
    if (_.isUndefined(dateRange)) {
      return false;
    }

    if (_.isUndefined(dateRange.start)) {
      return false;
    }

    if (_.isUndefined(dateRange.end)) {
      return false;
    }

    return true;
  }

  /**
    * Returns a boolean indicating if the two ranges passed in are the same.
    * Only compares the day portion of all dates, not the times.
    * @param {object} range1 a date range containing two momentJS objects
    * @param {object} range2 a date range containing two momentJS objects
    * @returns {boolean}
    */
  dateRangesAreEqual (range1, range2) {
    const format = 'DD-MM-YYYY'; // used for comparison only

    return range1.start.format(format) === range2.start.format(format)
      && range1.end.format(format) === range2.end.format(format);
  }

  /**
  * Gets the whole day for yesterday
  * This adjusts the start and endtime
  * @returns {object} containing two moment objects, the utc start and end.
  */
  getDay () {
    return {
      start: this.toStartOfDay(this.LocalizationService.getYesterday()),
      end: this.toEndOfDay(this.LocalizationService.getYesterday())
    };
  }

  /**
  * Gets the whole of last week using the users start of week settings
  * This adjusts the start and endtime
  * @returns {object} containing two moment objects, the utc start and end.
  */
  getWeek () {
    const firstDay = this.LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week');

    return {
      start: this.toStartOfDay(firstDay),
      end: this.toEndOfDay(this.LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week'))
    };
  }

  /**
  * Gets the whole of last month using the users start of month settings
  * This adjusts the start and endtime
  *  @param {object} currentUser the user to check
  *  @param {object} currentOrganization the org to check
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getMonth (currentOrganization, currentUser) {
    const indexOfLastMonthInYr = 11;

    this.LocalizationService.setOrganization(currentOrganization);
    this.LocalizationService.setUser(currentUser);

    // The "this" is needed to help with some unit testing pain
    let calendarInfo;

    if (_.isUndefined(this)) {
      calendarInfo = this.LocalizationService.getSystemYearForDate(moment());
    } else {
      calendarInfo = this.getSystemYearForDate(moment());
    }

    if (!this.LocalizationService.hasMonthDefinitions()) calendarInfo.month -= 1;
    const currentMonth = calendarInfo.month;
    const currentYear = calendarInfo.year;
    let previousYear;
    let previousMonth = currentMonth - 1;
    if (previousMonth < 0) {
      previousMonth = indexOfLastMonthInYr;
      previousYear = currentYear - 1;
    } else {
      previousYear = currentYear;
    }
    return {
      start: this.toStartOfDay(this.LocalizationService.getFirstDayOfMonth(previousMonth, previousYear)),
      end: this.toEndOfDay(this.LocalizationService.getLastDayOfMonth(previousMonth, previousYear))
    };
  }

  /**
   * Get a quarter index
   *
   * @returns {object} containing two properties, quarter index and year
   */
  getCurrentSystemQuarter () {
    const mthsInAQtr = 3;

    const systemDate = this.LocalizationService.getSystemYearForDate(moment());

    if (this.LocalizationService.isCurrentCalendarGregorian()) {
      systemDate.month = systemDate.month - 1;
    }

    const currentQuarter = Math.floor(systemDate.month / mthsInAQtr) + 1;

    const currentYear = this.LocalizationService.getCurrentYear();

    return {
      year: currentYear,
      quarter: currentQuarter
    };
  }

  /**
  * Gets the whole of last quarter using the users start of month settings
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getQuarter () {
    const currentSystemQuarter = this.getCurrentSystemQuarter();

    return this.getDateRangeForQuarter(currentSystemQuarter.quarter, currentSystemQuarter.year);
  }

  /**
   * Get the start and end dates of a quarter based on the month and year passed as parameters
   *
   * @param {number} currentQuarter
   * @param {number} currentYear
   * @returns {momentJS} containing two moment objects, the utc start and end.
   */
  getDateRangeForQuarter (currentQuarter, currentYear) {
    const maxQtrsInAYr = 4;
    
    let prevPeriod = currentQuarter - 1;
    let year = currentYear;

    if (prevPeriod < 1) {
      prevPeriod = maxQtrsInAYr;
      year = currentYear - 1;
    }

    const firstMonthOfQuarter = this.getFirstMonthInQuarter(prevPeriod);
    let lastMonthOfQuarter = this.getFirstMonthInQuarter(currentQuarter);
    if (lastMonthOfQuarter < 1) lastMonthOfQuarter = 0;

    return {
      start: this.toStartOfDay(this.LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, year)),
      end: this.toEndOfDay(this.LocalizationService.getFirstDayOfMonth(lastMonthOfQuarter, currentYear).subtract(1, 'days'))
    };
  }

  /**
   * Gets the date range from the start of this quarter plus a number of days in the original range
   *
   * @param {object} dateRange contains start and end properties
   * @param {number} currentQuarter zero based
   * @param {number} year non-zero based
   * @returns {object} containing two moment objects, the utc start and end.
   */
  getPriorQuarterToDate ({ end, start }, currentQuarter, currentYear) {
    const maxQtrsInAYr = 4;
    let quarter;
    let year;
    const currentSystemQuarter = this.getCurrentSystemQuarter();

    quarter = currentQuarter ? currentQuarter : currentSystemQuarter.quarter - 1;
    year = currentYear ? currentYear : currentSystemQuarter.year;

    if (quarter < 1) {
      quarter = maxQtrsInAYr;
      year = year - 1;
    }

    const firstMonthOfQuarter = this.getFirstMonthInQuarter(quarter);
    const length = end.diff(start, 'days');
    const startRange = this.toStartOfDay(this.LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, year));

    return {
      start: startRange,
      end: this.toEndOfDay(angular.copy(startRange).add(length, 'days'))
    };
  }

  /**
   * Get quarter index
   *
   * @returns {number} quarter index
   */
  getPreviousSystemQuarter () {
    const currentSystemQuarter = this.getCurrentSystemQuarter();

    if (currentSystemQuarter.quarter < 1) {
      currentSystemQuarter.quarter = 4;
      currentSystemQuarter.year = currentSystemQuarter.year - 1;
    } else {
      currentSystemQuarter.quarter = currentSystemQuarter.quarter - 1;
    }

    return currentSystemQuarter;
  }

  /**
  * Gets the whole of last year using the users start of month settings
  * This adjusts the start and endtime
  *  @param {object} currentUser the user to check
  *  @param {object} currentOrganization the org to check
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getYear (currentOrganization, currentUser) {
    this.LocalizationService.setOrganization(currentOrganization);
    this.LocalizationService.setUser(currentUser);
    const currentYear = this.LocalizationService.getCurrentYear();
    return {
      start: this.toStartOfDay(this.LocalizationService.getFirstDayOfYear(currentYear - 1)),
      end: this.toEndOfDay(this.LocalizationService.getLastDayOfYear(currentYear - 1))
    };
  }

  /**
  * Gets the date range from the start of this week until the end of yesterday
  * This adjusts the start and endtime
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getWeekToDate () {
    const firstDay = this.LocalizationService.getFirstDayOfCurrentWeek();
    const startDate = this.toStartOfDay(firstDay);
    const endDate = this.toEndOfDay(this.LocalizationService.getYesterday());

    if (endDate.isBefore(startDate)) {
      return this.getWeek();
    }

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
  * Gets equivalent prior period for the week to date
  * @param {object} dateRange contains start and end properties
  * @returns {object} containing two moment objects, the utc start and end.
  */
  getPriorWeekToDate (dateRange) {
    const priorOneWeek = -1;
    const priorWeek = angular.copy(dateRange);

    priorWeek.start.add(priorOneWeek, 'week');
    priorWeek.end.add(priorOneWeek, 'week');

    return priorWeek;
  }

  getPriorYearWeekToDate (dateRange) {
    const maxWksInPrevYr = -52;
    const priorYear = angular.copy(dateRange);

    priorYear.start.add(maxWksInPrevYr, 'week');
    priorYear.end.add(maxWksInPrevYr, 'week');

    return priorYear;
  }

  /**
  * Gets the date range from the start of this month until the end of yesterday
  * This adjusts the start and endtime
  *  @param {object} currentUser the user to check
  *  @param {object} currentOrganization the org to check
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getMonthToDate (currentOrganization, currentUser) {
    this.LocalizationService.setOrganization(currentOrganization);
    this.LocalizationService.setUser(currentUser);

    // 'This' is needed for unit testing.
    const calendarInfo = this.getSystemYearForDate(moment());
    if (!this.LocalizationService.hasMonthDefinitions()) calendarInfo.month -= 1;
    const firstDayOfMonth = this.LocalizationService.getFirstDayOfMonth(calendarInfo.month, calendarInfo.year);
    const startDate = this.toStartOfDay(firstDayOfMonth);
    const endDate = this.toEndOfDay(this.LocalizationService.getYesterday());

    if (endDate.isBefore(startDate)) {
      return this.getMonth(currentOrganization, currentUser);
    }

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
   * Gets the date range from the start of this month plus a number of days in the original range
   * This adjusts the start and endtime
   *
   * @param {object} dateRange contains start and end properties
   * @param {number} month zero based
   * @param {number} year non-zero based
   * @returns {object} containing two moment objects, the utc start and end.
   */
  getPriorMonthToDate (dateRange, month, year) {
    const maxMonthZeroBasedIndex = 11;
    const systemDate = this.LocalizationService.getSystemYearForDate(dateRange.end);

    month = month ? month : systemDate.month - 1;
    year = year ? year : systemDate.year;

    if (!this.LocalizationService.hasMonthDefinitions()) {
      month = month - 1;
    }

    if (month < 0) {
      month = maxMonthZeroBasedIndex;
      year = systemDate.year - 1;
    }

    const firstDayOfMonth = this.LocalizationService.getFirstDayOfMonth(month, year);
    const length = dateRange.end.diff(dateRange.start, 'days');
    const startDate = this.toStartOfDay(firstDayOfMonth);
    const endDate = this.toEndOfDay(angular.copy(startDate).add(length, 'days'));

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
   * Gets the equivalent prior year MTD
   * This adjusts the start and endtime
   *
   * @param {object} dateRange contains start and end properties, which must be momentJS objects
   * @returns {object} containing two momentJS objects, the utc start and end.
   */
  getPriorYearMonthToDate (dateRange) {
    const systemDate = this.LocalizationService.getSystemYearForDate(dateRange.end);

    if (this.LocalizationService.isCurrentCalendarGregorian()) {
      systemDate.month = systemDate.month - 1;
    }

    const month = systemDate.month;
    const year = systemDate.year - 1;

    const firstDayOfMonth = this.LocalizationService.getFirstDayOfMonth(month, year);
    const length = dateRange.end.diff(dateRange.start, 'days');

    const startDate = this.toStartOfDay(firstDayOfMonth);
    const endDate = this.toEndOfDay(angular.copy(startDate).add(length, 'days'));

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
  * Gets the date range from the start of this quarter until the end of yesterday
  * This adjusts the start and endtime
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getQuarterToDate () {
    const maxMthsInQtr = 3;
    const endDate = this.toEndOfDay(this.LocalizationService.getYesterday());
    const systemDate = this.LocalizationService.getSystemYearForDate(endDate);

    if (this.LocalizationService.isCurrentCalendarGregorian()) {
      systemDate.month = systemDate.month - 1;
    }

    const currPeriod = Math.floor(systemDate.month / maxMthsInQtr) + 1;
    const currentYear = this.LocalizationService.getCurrentYear();
    const year = currentYear;
    const startDate = this.toStartOfDay(this.LocalizationService.getFirstDayOfMonth(this.getFirstMonthInQuarter(currPeriod), year));

    if (endDate.isBefore(startDate)) {
      return this.getQuarter();
    }

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
  * Gets the date range from the start of this year until the end of yesterday
  * This adjusts the start and endtime
  *  @param {object} currentUser the user to check
  *  @param {object} currentOrganization the org to check
  *  @returns {object} containing two moment objects, the utc start and end.
  */
  getYearToDate (currentOrganization, currentUser) {
    const currentTime = this.LocalizationService.getCurrentTime();
    const systemDate = this.LocalizationService.getSystemYearForDate(currentTime);

    if (this.LocalizationService.isCurrentCalendarGregorian()) {
      systemDate.month = systemDate.month - 1;
    }

    const startDate = this.toStartOfDay(this.LocalizationService.getFirstDayOfYear(systemDate.year));
    const endDate = this.toEndOfDay(this.LocalizationService.getYesterday());

    if (endDate.isBefore(startDate)) {
      return this.getYear(currentOrganization, currentUser);
    }

    return {
      start: startDate,
      end: endDate,
    };
  }

  /**
   * Gets the date range from the start of this year plus a number of days in the original range
   * This adjusts the start and endtime
   *
   * @param {object} dateRange contains start and end properties
   * @param {number} month non-zero based
   * @param {number} year non-zero based
   * @returns {object} containing two moment objects, the utc start and end.
   */
  getPriorYearToDate (dateRange, year) {
    const systemDate = this.LocalizationService.getSystemYearForDate(dateRange.end);
    if (this.LocalizationService.isCurrentCalendarGregorian()) {
      systemDate.month = systemDate.month - 1;
    }
    year = year ? year : systemDate.year - 1;
    const firstDayOfMonth = this.LocalizationService.getFirstDayOfYear(year);
    const dayLength = dateRange.end.diff(dateRange.start, 'days');
    const startDate = this.toStartOfDay(firstDayOfMonth);
    const endDate = this.toEndOfDay(angular.copy(startDate).add(dayLength, 'days'));

    return {
      start: startDate,
      end: endDate,
    };
  }


  /**
  * Private Function
  * Gets the first month in a given quarter
  * The month should be zero indexed, i.e. first month in q1 should be 0 in q2 should be 2 etc
  * @param {object} currentUser the user to check
  * @param {number} the quarter number to check
  * @returns {number} the first month number of the given quarter
  */
  getFirstMonthInQuarter (quarterNumber) {
    const maxMthsInQtr = 3;

    return quarterNumber * maxMthsInQtr - maxMthsInQtr;
  }

  /**
   * Private function
   * Sets time to 00:00
   * @param {string}
   *
   * @param {momentJS} date moment date
   * @returns {momentJS} start of the day
   */
  toStartOfDay (date) {
    return date.startOf('day');
  }

  /**
   * Private function
   * Sets time to 23:59
   * @param {string}
   *
   * @param {momentJS} date moment date
   * @returns {momentJS} start of the day
   */
  toEndOfDay (date) {
    return date.endOf('day');
  }

  /**
  * Private Function
  * Returns the compare period based upon the user preferences and selected period
  * @param {object} selectedPeriod the selected date range period (an object contains two moment objects)
  * @param {object} currentUser the current user object
  * @param {object} currentOrg the current organisation object
  * @param {('day'|'week'|'month'|'quarter'|'year'|'wtd'|'mtd'|'qtd'|'ytd')} period Optional. 
  * The date period shortcut e.g. 'mtd'. If not set, this function will use the utils service to work out what this is
  * @param {('compare1Range'|'compare2Range')} compareRangeNum the compare range 'compare1Range' or 'compare2Range'
  * @param {('prior_period'|'prior_year'|'custom')} overridePeriodType Optional. 
  * If set, the user's preferences around compare periods are ignored, and this is used instead.
  * @param {boolean} hasOnlyOneCompare Optional. Used in YTD and Year prior year calculations.
  * @returns {object} an object contains two moment objects, start and end.
  */
  getCustomPeriod (selectedPeriod, currentUser, currentOrg, period, compareRangeNum, overridePeriodType, hasOnlyOneCompare) {
    if (this.ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedPeriod)) return;

    const cacheKey = this.getCacheKey(selectedPeriod, 
                                      currentUser._id, 
                                      currentOrg.organization_id, 
                                      period, 
                                      compareRangeNum, 
                                      overridePeriodType, 
                                      hasOnlyOneCompare);

    const cachedRange = this.getRangeFromCache(cacheKey);

    if (!_.isUndefined(cachedRange)) {
      return cachedRange;
    }

    let periodType = overridePeriodType;

    if (_.isUndefined(periodType)) {
      periodType = this.getUserCustomPeriod(currentUser, compareRangeNum);
    }

    if (_.isUndefined(period)) {
      period = this.utils.getDateRangeType(selectedPeriod, currentUser, currentOrg);
    }

    let compareRange;

    switch (periodType) {
      case rangeNames.priorPeriod:
        if (period === 'quarter') {
          const currentSystemQuarter = this.getPreviousSystemQuarter();
          compareRange = this.getDateRangeForQuarter(currentSystemQuarter.quarter, currentSystemQuarter.year);
        } else if (period === 'qtd') {
          compareRange = this.getPriorQuarterToDate(selectedPeriod, null, null);
        } else if (period === 'mtd') {
          compareRange = this.getPriorMonthToDate(selectedPeriod, null, null);
        } else if (period === 'ytd') {
          compareRange = this.getPriorYearToDate(selectedPeriod, null);
        } else if (period === 'wtd') {
          compareRange = this.getPriorWeekToDate(selectedPeriod);
        } else if (period === 'day' || this.isSingleDaySelected(selectedPeriod.start, selectedPeriod.end)) {
          compareRange = this.getPriorDay(selectedPeriod);
        } else {
          compareRange = this.utils.getPreviousCalendarPeriodDateRange(selectedPeriod, currentUser, currentOrg, period);
        }
        break;
      case rangeNames.priorYear:
        if (period === 'quarter') {
          const currentSystemQuarter = this.getCurrentSystemQuarter();
          compareRange = this.getDateRangeForQuarter(currentSystemQuarter.quarter, currentSystemQuarter.year - 1);
        } else if (period === 'qtd') {
          const currentSystemQuarter = this.getCurrentSystemQuarter();
          compareRange = this.getPriorQuarterToDate(selectedPeriod, currentSystemQuarter.quarter, currentSystemQuarter.year - 1);
        } else if (period === 'mtd') {
          compareRange = this.getPriorYearMonthToDate(selectedPeriod);
        } else if (period === 'ytd') {
          let yearsBack = 2;
          if (hasOnlyOneCompare === true) {
            yearsBack = 1;
          }
          const systemDate = this.LocalizationService.getSystemYearForDate(moment());
          compareRange = this.getPriorYearToDate(selectedPeriod, systemDate.year - yearsBack);
        } else if (period === 'wtd') {
          compareRange = this.getPriorYearWeekToDate(selectedPeriod);
        } else {
          const firstDayOfWeekSetting = this.LocalizationService.getFirstDayOfCurrentWeek().format('dddd');
          compareRange = this.utils.getEquivalentPriorYearDateRange(selectedPeriod, 
                                                                    firstDayOfWeekSetting, 
                                                                    currentUser, 
                                                                    currentOrg, 
                                                                    period, 
                                                                    hasOnlyOneCompare);
        }
        break;
      case rangeNames.custom:
        const numWeeks = compareRangeNum === 
        'compare1Range' ? currentUser.preferences.custom_period_1.num_weeks : currentUser.preferences.custom_period_2.num_weeks;
        compareRange = {
          start: this.toStartOfDay(angular.copy(selectedPeriod).start).subtract(numWeeks, 'weeks'),
          end: this.toEndOfDay(angular.copy(selectedPeriod).end).subtract(numWeeks, 'weeks')
        };
        break;
      default:
        compareRange = this.utils.getPreviousCalendarPeriodDateRange(selectedPeriod, currentUser, currentOrg, period);
    }

    this.addToCache(cacheKey, compareRange);

    return compareRange;
  }

  /**
   * Get custom period from user settings
   * @param {object} currentUser - user details as preferences.
   * @param {string} compareRangeNum - compare range to find.
   * @returns {string} compare period if user doesn't have any setting return pirior perid to fix unit tests
   */
  getUserCustomPeriod (currentUser, compareRangeNum) {
    if (!this.ObjectUtils.isNullOrUndefined(currentUser.preferences)) {
      return compareRangeNum === 
      'compare1Range' ? currentUser.preferences.custom_period_1.period_type : currentUser.preferences.custom_period_2.period_type;
    }
    return 'prior_period';
  }

  /**
   * Sets the isSingleDaySelected scoped flag, which is consumed by the UI.
   * This function will set isSingleDaySelected to true if the current date range
   * spans zero days
   *
   * @param {object} startDate - The startDate. A momentJs object.
   * @param {object} endDate - The endDate. A momentJs object.
   */
  isSingleDaySelected (startDate, endDate) {
    if (this.ObjectUtils.isNullOrUndefined(startDate) || this.ObjectUtils.isNullOrUndefined(endDate)) {
      return;
    }

    const daysBetweenDates = startDate.diff(endDate, 'days');

    return daysBetweenDates === 0;
  }

  /**
   * Gets equivalent prior period for a single day
   * @param {object} dateRange contains start and end properties
   * @returns {object} containing two moment objects, the utc start and end.
   */
  getPriorDay (dateRange) {
    const priorWeek = {
      start: angular.copy(dateRange.start),
      end: angular.copy(dateRange.end)
    };

    priorWeek.start.add(-1, 'week');
    priorWeek.end.add(-1, 'week');

    return priorWeek;
  }

  /**
   * A simple proxy for LocalizationService.getSystemYearForDate.
   * Exists to help with unit testing
   * @param {object} date - The date. A momentJs object.
   */
  getSystemYearForDate (date) {
    return this.LocalizationService.getSystemYearForDate(date);
  }

  getCacheKey (
    selectedPeriod,
    userId,
    orgId,
    period,
    compareRangeNum,
    overridePeriodType,
    hasOnlyOneCompare
  ) {
    let key = '';

    key += selectedPeriod.start.format('YYYYMMDD');

    key += `_${selectedPeriod.end.format('YYYYMMDD')}`;

    key += `_${userId}`;

    if (!this.ObjectUtils.isNullOrUndefined(orgId)) {
      key += `_${orgId.toString()}`;
    }

    key += `_${period}`;

    key += `_${compareRangeNum}`;

    key += `_${overridePeriodType}`;

    key += `_${hasOnlyOneCompare}`;

    return key;
  }

  addToCache (key, range) {
    cache[key] = range;
  }

  getRangeFromCache (key) {
    return cache[key];
  }

  clearCache () {
    cache = {};
  }

  /**
  * Gets the last day of the last year of the current calendar
  *
  * @returns {object} a momentJs DateTime object
  */
  getCurrentCalendarLatestDate () {
    const currentSettings = this.LocalizationService.getActiveCalendarSettings();

    /* standard gragorian calendars - organization default, sunday gragorian, monday gragorian */
    if (this.ObjectUtils.isNullOrUndefined(currentSettings) || this.ObjectUtils.isNullOrUndefinedOrEmpty(currentSettings.years)) {
      return moment();
    }

    const latestYearDefinition = _.max(currentSettings.years, yearDefinition => yearDefinition.year);

    const yearEnd = moment(latestYearDefinition.start_date);

    _.each(latestYearDefinition.month_mask, monthMask => {
      yearEnd.add(monthMask, 'weeks');
    });

    return yearEnd;
  }

  /**
 * Gets the first day of the start  year of the current calendar
 *
 * This function will return the earlierst date for the current calendar.
 * @returns {object} a momentJs DateTime object
 */
  getCurrentCalendarEarliestDate () {
    const currentSettings = this.LocalizationService.getActiveCalendarSettings();

    /* for standard gragorian calendars - organization default, sunday gragorian, monday gragorian 
    setting start year (minYear) to 1970 same as done in localization service to maintain the same 
    functionality
    */

    if (this.ObjectUtils.isNullOrUndefined(currentSettings) || this.ObjectUtils.isNullOrUndefinedOrEmpty(currentSettings.years)) {
      return moment('1970/01/01', 'YYYY/MM/DD');
    }

    const earliestYearDefinition = _.min(currentSettings.years, yearDefinition => yearDefinition.year);

    const yearStart = moment(earliestYearDefinition.start_date);
    return yearStart;
  }

  /**
  * gets the selected_period, prior_period, prior_year for the selected month and year
  * @param {integer} month - month selected, zero indexed
  * @param {integer} year - year selected
  * @param {object} currentUser - logged in user object
  * @param {object} currentOrg - selected organization info
  * @returns {moment object} dateRangesForMonth which contains selectedPeriod_start_date, 
  * selectedPeriod_end_date, 
  * comparePeriod1_start_date, comparePeriod1_end_date,
  * comparePeriod2_start_date, comparePeriod2_end_date
  */
  getSelectedAndCompareRangesForMonth (month, year, currentUser, currentOrg, hasOnlyOneCompare) {
    const dateRangesForMonth = {};
    const selectedMonthPeriod = {};

    /* get the first day and last day of selected month and year */
    selectedMonthPeriod.start = this.LocalizationService.getFirstDayOfMonth(month, year);
    selectedMonthPeriod.end = this.LocalizationService.getLastDayOfMonth(month, year);

    /* get comparePeriod and compareYear ranges using the above monthStartDate & monthEndDate */
    if (hasOnlyOneCompare === true) {
      dateRangesForMonth.comparePeriod1 =
        this.getCustomPeriod(selectedMonthPeriod, currentUser, currentOrg, 'month', null, rangeNames.priorYear, true);
    } else {
      dateRangesForMonth.comparePeriod1 = this.getCustomPeriod(selectedMonthPeriod, currentUser, currentOrg, 'month', 'compare1Range');
      dateRangesForMonth.comparePeriod2 = this.getCustomPeriod(selectedMonthPeriod, currentUser, currentOrg, 'month', 'compare2Range');
    }
    dateRangesForMonth.selectedPeriod = selectedMonthPeriod;

    return dateRangesForMonth;
  }
}

angular.module('shopperTrak')
  .service('dateRangeService', dateRangeService);

dateRangeService.$inject = ['LocalizationService', 'utils', 'ObjectUtils'];
