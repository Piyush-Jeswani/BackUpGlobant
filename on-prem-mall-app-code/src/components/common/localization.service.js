/**
   * Enum for calendar types.
   * @readonly
   * @enum {number}
   */
const calendarType = {
  appDefault: 0,
  orgDefault: 1,
  userPreference: 2
};

/**
 * Enum for calendar types.
 * @readonly
 * @enum {number}
 */
const daysOfWeek = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const standardGregorianSundayCalendarId = -2;
const standardGregorianMondayCalendarId = -1; // Declared default calendar ID's for Gregorian Sunday & Monday
const standardMonthlyCalendarId = 65; // Other Sunday Gregorian calendar

class LocalizationService {
  constructor (localStorageService, $http, $q, apiUrl, ObjectUtils, requestManager) {
    this.localStorageService = localStorageService;
    this.$http = $http;
    this.$q = $q;
    this.apiUrl = apiUrl;
    this.ObjectUtils = ObjectUtils;
    this.requestManager = requestManager;

    this.activeOrganization;
    this.allCalendars = this.localStorageService.get('calendars') || undefined;
    this.activeUser;
    this.calendarFirstDayOfWeek;
    this.weeksAgo = {};
    this.customCompareSetting = {};
    this.cache = {};
  }

  /**
   * Returns the legacy first day of week from an organization object.
   * This should only be called when the user is on a 'Standard' calendar - i.e. they do not have a calendar set
    * and the current organization does not have a calendar set
    *
    * @param {object} currentOrganization - The current organization as returned by /organizations/:orgId
    * @returns {number} The day of the week. Sunday = 0, Saturday = 6
  */
  getLegacyFirstDayOfWeek (currentOrganization) {
    let legacyFirstDayOfWeek;

    if (!this.ObjectUtils.isNullOrUndefined(this.calendarFirstDayOfWeek)) {
      legacyFirstDayOfWeek = this.calendarFirstDayOfWeek;
    } else {

      if (!this.ObjectUtils.isNullOrUndefined(currentOrganization) &&
        !this.ObjectUtils.isNullOrUndefined(currentOrganization.portal_settings)) {
        let firstWeekDaySetting = currentOrganization.portal_settings.legacy_week_start_day;

        if (this.ObjectUtils.isNullOrUndefined(firstWeekDaySetting)) {
          firstWeekDaySetting = 'Sunday';
        }

        firstWeekDaySetting = firstWeekDaySetting.toLowerCase();

        legacyFirstDayOfWeek = daysOfWeek[firstWeekDaySetting];
      } else {
        legacyFirstDayOfWeek = daysOfWeek.sunday; // default to Sunday if setting not available
      }
    }

    return legacyFirstDayOfWeek;
  }

  /**
   * Gets the first day of the week for the current user
   * This takes into account whether the user is on a custom or standard calendar
   *
   * @returns {number} The day of the week. Sunday = 0, Saturday = 6
   */
  getCurrentCalendarFirstDayOfWeek () {
    return this.getResult('getCurrentCalendarFirstDayOfWeek', runGetCurrentCalendarFirstDayOfWeek);

    function runGetCurrentCalendarFirstDayOfWeek () {
      let currentCalendarFirstDayOfWeek;

      if (!this.ObjectUtils.isNullOrUndefined(this.activeUser) && !this.ObjectUtils.isNullOrUndefined(this.allCalendars)) {
        const currentCalendarSettings = this.getActiveCalendarSettings(false);

        if (this.ObjectUtils.isNullOrUndefined(currentCalendarSettings) ||
          this.ObjectUtils.isNullOrUndefinedOrEmpty(currentCalendarSettings.years)) {

          const userCalendarId = this.activeUser.preferences.calendar_id;

          if (userCalendarId === standardGregorianSundayCalendarId) {
            return daysOfWeek.sunday;
          }

          if (userCalendarId === standardMonthlyCalendarId) {
            return daysOfWeek.sunday;
          }

          if (userCalendarId === standardGregorianMondayCalendarId) {
            return daysOfWeek.monday;
          }

          // 1. Check if the calendar has been set in the admin tool for the current org
          if (!this.ObjectUtils.isNullOrUndefined(this.activeOrganization) &&
            !this.ObjectUtils.isNullOrUndefined(this.activeOrganization.default_calendar_id)) {
            return this.getFirstDayOfWeekInCalendar(this.activeOrganization.default_calendar_id);
          }

          // Fallback to the legacy portal setting on the activeOrg
          currentCalendarFirstDayOfWeek = this.getLegacyFirstDayOfWeek(this.activeOrganization);
        } else {
          const year = this.getCurrentYear();
          const firstDate = this.getFirstDayOfYear(year);

          currentCalendarFirstDayOfWeek = firstDate.weekday();
        }
      }

      return currentCalendarFirstDayOfWeek;
    }

  }

  /**
   * Gets the first day of the week for the specified calendar
   * This takes into account whether the user is on a custom or standard calendar.
   * This function is identical to getCurrentCalendarFirstDayOfWeek, with the exception of
   * taking in the calendarId.
   *
   * @param {number} calendarId the calendarId
   */
  getFirstDayOfWeekInCalendar (calendarId) {
    let FirstDayOfWeekInCalendar;

    if (this.ObjectUtils.isNullOrUndefined(this.allCalendars) && this.ObjectUtils.isNullOrUndefined(this.activeOrganization)) {
      return;
    }

    if (calendarId === standardGregorianSundayCalendarId) {
      FirstDayOfWeekInCalendar = daysOfWeek.sunday;
    }

    if (calendarId === standardMonthlyCalendarId) {
      FirstDayOfWeekInCalendar = daysOfWeek.sunday;
    }

    if (calendarId === standardGregorianMondayCalendarId) {
      FirstDayOfWeekInCalendar = daysOfWeek.monday;
    }

    const calendarSettings = this.getCalendarSettings(calendarId);

    if (this.ObjectUtils.isNullOrUndefined(calendarSettings) || this.ObjectUtils.isNullOrUndefined(calendarSettings.years)) {
      FirstDayOfWeekInCalendar = this.getLegacyFirstDayOfWeek(this.activeOrganization);
    } else {
      const year = this.getCurrentYear();
      const firstDate = this.getFirstDayOfYear(year, calendarSettings);
      FirstDayOfWeekInCalendar = firstDate.weekday();
    }

    return FirstDayOfWeekInCalendar;
  }


  /**
   * Gets all calendars.
   * This attempts to load calendars in the following order:
   * 1. In memory cache
   * 2. Local Storage  (ls.calendars key)
   * 3. A http request to /calendars
   *
   * @param {boolean} noCache - Optional. Defaults to false. Specifies if any of the caches should be read.
   * @returns {Object} A promise containing the calendars
   */
  getAllCalendars (noCache) {
    if (_.isUndefined(noCache)) {
      noCache = false;
    }

    if (noCache === false) {
      // 1 - In Memory Cache
      if (!this.ObjectUtils.isNullOrUndefined(this.allCalendars)) {
        return this.promisify(this.allCalendars);
      }

      // 2 - Local Storage
      const lsCalendars = this.localStorageService.get('calendars');

      if (!this.ObjectUtils.isNullOrUndefined(this.allCalendars)) {
        return this.promisify(lsCalendars);
      }
    }

    // 3 - The API
    const deferred = this.$q.defer();

    const req = this.requestManager.get(`${this.apiUrl}/calendars`, {});

    req.then(calendar => {
      this.setAllCalendars(calendar.result, noCache);

      deferred.resolve(calendar);
    }, () => {
      deferred.reject();
    });

    return deferred.promise;
  }



  /**
   * Returns the active calendar id with the calendarType enum to indicate how it was resolved.
   * Tries to resolve the calendarId in the following order:
   * 1. The user prefered calendar
   * 2. The current organization's default calendar
   * 3. The application default calendar
   *
   * @returns {object} An object that contains the active calendarId and the calendarType
   */
  getActiveCalendar () {
    const calendarInfo = {};
    const preferences = this.getUserPreferences();

    if (!this.ObjectUtils.isNullOrUndefined(preferences)) {
      calendarInfo.id = preferences.calendar_id;
    }

    if (this.ObjectUtils.isNullOrUndefined(calendarInfo.id)) {
      if (!this.ObjectUtils.isNullOrUndefined(this.activeOrganization)) {
        calendarInfo.id = this.activeOrganization.default_calendar_id;
        calendarInfo.type = calendarType.orgDefault;
      }

      if (calendarInfo.id === standardGregorianSundayCalendarId ||
        calendarInfo.id === standardGregorianMondayCalendarId ||
        calendarInfo.id === standardMonthlyCalendarId) {
        return calendarInfo;
      }

      if (this.ObjectUtils.isNullOrUndefined(calendarInfo.id) ||
        this.ObjectUtils.isNullOrUndefined(this.getCalendarSettings(calendarInfo.id))) {
        calendarInfo.id = this.getAppDefaultCalendarId();
        calendarInfo.type = calendarType.appDefault;
      }
    }
    return calendarInfo;
  }



  /**
   * Returns the active calendar.
   * Tries to resolve the calendarId in the following order:
   * 1. The user prefered calendar
   * 2. The current organization's default calendar
   * 3. The application default calendar (this last fallback can be disabled)
   *
   * @param {boolean} fallbackToAppDefaultCalendar - Optional. Defaults to true. 
   * Specifies if the Application default calendar is an acceptable result.
   * @returns {object} The active calendar's object
   */
  getActiveCalendarSettings (fallbackToAppDefaultCalendar) {
    if (this.ObjectUtils.isNullOrUndefined(fallbackToAppDefaultCalendar)) {
      fallbackToAppDefaultCalendar = true;
    }
    // We do not need to do any default checking here as getActiveCalendar does it for us
    const calendarInfo = this.getActiveCalendar();

    if (calendarInfo.type === calendarType.appDefault && fallbackToAppDefaultCalendar === false) {
      return;
    }

    return this.getCalendarSettings(calendarInfo.id);
  }

  /**
   * Gets the first day of the specified month for the current calendar.
   *
   * @param {number} month the zero indexed month number, ranging from 0 to 11
   * @param {number} year the year
   * @returns {Object} A momentJs object that is the first day of the month
   */
  getFirstDayOfMonth (month, year) {
    return this.getResult('getFirstDayOfMonth', runGetFirstDayOfMonth, [month, year]);

    function runGetFirstDayOfMonth (month, year) {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      const threeDigitMonth = 10;
      let firstDayOfMonth;

      if (this.isGregorian(currentCalendarSettings)) {
        month = month + 1;

        // Ensure that `0${month}` doesn't give more than 3 digits 
        // e.g. OK = 01, 02, 03, 04, 05, 06, 07, 08, 09   NOT OK = 010, 011, 012.
        if (month < threeDigitMonth) {
          month = `0${month}`;
        }

        const format = 'YYYY-MM-DD';

        firstDayOfMonth = moment(`${year}-${month}-01`, format).startOf('month');
      } else {
        const currentYear = _.findWhere(currentCalendarSettings.years, { year });

        if (this.ObjectUtils.isNullOrUndefined(currentYear)) {
          return;
        }

        let weeksFromStart = 0;

        _.each(currentYear.month_mask, (numberOfWeeksInMonth, index) => {
          if (index < month) {
            weeksFromStart += numberOfWeeksInMonth;
          }
        });

        const firstDayOfYear = this.getLocalDateIgnoringUTC(currentYear.start_date);

        firstDayOfMonth = firstDayOfYear.add(weeksFromStart, 'weeks');
      }

      return firstDayOfMonth;
    }
  }

  /**
   * Gets the last day of the specified month for the current calendar.
   *
   * @param {number} month the zero indexed month number, ranging from 0 to 11
   * @param {number} year the year
   * @returns {Object} A momentJs object that is the last day of the month
   */
  getLastDayOfMonth (month, year) {
    return this.getResult('getLastDayOfMonth', runGetLastDayOfMonth, [month, year]);

    function runGetLastDayOfMonth (month, year) {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      const threeDigitMonth = 10;
      let   lastDayOfMonth;

      if (this.isGregorian(currentCalendarSettings)) {
        month = month + 1;

        // Ensure that `0${month}` doesn't give more than 3 digits 
        // e.g. OK = 01, 02, 03, 04, 05, 06, 07, 08, 09   NOT OK = 010, 011, 012.
        if (month < threeDigitMonth) {
          month = `0${month}`;
        }

        const dateStr = `${year.toString()}-${month.toString()}-01`;

        lastDayOfMonth = moment(dateStr, 'YYYY-MM-DD', true).endOf('month');
      } else {
        const monthWeeks = this.getWeekCountOfMonth(year, month);

        const monthStart = this.getFirstDayOfMonth(month, year);

        if (!this.ObjectUtils.isNullOrUndefined(monthStart)) {
          lastDayOfMonth = monthStart.add(monthWeeks, 'weeks').subtract(1, 'day');
        }
      }

      return lastDayOfMonth;
    }
  }

  /**
   * Gets the first day of the specified year for the calendar that is passed in, or the default calendar
   *
   * @param {number} year the year
   * @param {object} calendar Optional. the calendar to check. 
   * If this is passed in as null or undefined, the current calendar is used instead.
   * @returns {Object} A momentJs object that is the first day of the year
   */
  getFirstDayOfYear (year, _calendarSettings) {
    return this.getResult('getFirstDayOfYear', runGetFirstDayOfYear, [year, _calendarSettings]);

    function runGetFirstDayOfYear (year, _calendarSettings) {
      let calendarSettings = _calendarSettings;

      let dateStr;

      let firstDayOfYear;


      if (this.ObjectUtils.isNullOrUndefined(calendarSettings) ||
        this.ObjectUtils.isNullOrUndefined(calendarSettings.years)) { // gregorian
        calendarSettings = this.getActiveCalendarSettings();
      }

      if (this.isGregorian(calendarSettings)) {
        dateStr = `${year.toString()}-01-01`;
        firstDayOfYear = moment(dateStr, 'YYYY-MM-DD', true);
      } else {

        const result = _.findWhere(calendarSettings.years, { year });

        if (this.ObjectUtils.isNullOrUndefined(result)) {

          dateStr = `${year.toString()}-01-01`;
          firstDayOfYear = moment(dateStr, 'YYYY-MM-DD', true);
        }

        firstDayOfYear = this.getLocalDateIgnoringUTC(result.start_date);
      }

      return firstDayOfYear;
    }
  }

  /**
   * Returns a local date based on the UTC date passed in.
   *
   * This function is needed because the calendars endpoint returns calendar start dates in UTC,
   * But the UTC time part should be ignored.
   *
   * @param {string} date ISO 8601, with a UTC date (e.g. 2017-10-20T00:00:00Z)
   * @returns {Object} A momentJs object that is the first day of the year
   */
  getLocalDateIgnoringUTC (date) {
    const parseFormat = 'YYYY-MM-DD';

    return this.stripTimezoneData(date, parseFormat);
  }

  /**
   * Returns a local datetime based on the UTC date passed in.
   *
   * This function is needed because the calendars endpoint returns calendar start dates in UTC,
   * But the UTC time part should be ignored.
   *
   * @param {string} date ISO 8601, with a UTC date (e.g. 2017-10-20T00:00:00Z)
   * @returns {Object} A momentJs object that is the first day of the year
   */
  getLocalDateTimeFormatIgnoringUTC (date) {
    const parseFormat = 'YYYY-MM-DD HH:mm:ss';

    return this.stripTimezoneData(date, parseFormat);
  }

  stripTimezoneData (date, parseFormat) {
    const utcDate = moment.utc(date);

    const dateWithoutTime = utcDate.format(parseFormat);

    return moment(dateWithoutTime, parseFormat);
  }

  /**
   * Gets the last day of the specified year for the current calendar with a time of 23:59:59
   *
   * @param {number} year the year
   * @returns {Object} A momentJs object that is the first day of the year
   */
  getLastDayOfYear (year) {
    return this.getResult('getLastDayOfYear', runGetLastDayOfYear, [year]);

    function runGetLastDayOfYear (year) {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      let lastDayOfYear;
      const weekMinusOneDay = 6;
      if (this.isGregorian(currentCalendarSettings)) {

        const dateStr = `${year.toString()}-01-01`;

        lastDayOfYear = moment(dateStr, 'YYYY-MM-DD', true).endOf('year');
      } else {
        const yearStart = this.getFirstDayOfYear(year);

        const monthDefinitions = this.getMonthDefinitions(year);

        const yearWeeks = _.reduce(monthDefinitions, (total, weeks) => {
          if (!this.ObjectUtils.isNullOrUndefined(weeks)) {
            return total + weeks;

          } 
            
          return total;
          
        }, 0);

        lastDayOfYear = yearStart.add(yearWeeks - 1, 'week').add(weekMinusOneDay, 'day').endOf('day');
      }

      return lastDayOfYear;
    }
  }

  /**
   * Gets the first calendar month of the specified year for the current calendar
   *
   * @param {number} year the year
   * @returns {number} The first month of the year. Zero indexed.
   */
  getFirstMonthOfYear (year) {
    const currentCalendarSettings = this.getActiveCalendarSettings();
    let firstMonthOfYear;

    if (this.isGregorian(currentCalendarSettings)) {
      firstMonthOfYear = 0;
    } else {
      const result = _.filter(currentCalendarSettings.years, yearData => Number(yearData.year) === Number(year));

      if (this.ObjectUtils.isNullOrUndefinedOrEmpty(result)) {
        firstMonthOfYear = 0;
      } else {
        firstMonthOfYear = result[0].start_month;
      }
    }

    return firstMonthOfYear;
  }

  /**
   * Gets the first date in the current week for the current calendar
   *
   * @returns {object} A momentJs Object
   */
  getFirstDayOfCurrentWeek () {
    return this.getResult('getFirstDayOfCurrentWeek', runGetFirstDayOfCurrentWeek);

    function runGetFirstDayOfCurrentWeek () {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      const hrsInADay = 24;
      const secondsInAnHour = 3600;
      const msScalingFactor = 1000;
      const daysInAWeek = 7;
      let firstDayOfCurrentWeek;

      if (this.isGregorian(currentCalendarSettings)) {
        if (this.isGregorianMonday() === true) {
          return moment().startOf('week').add(1, 'days');
        }

        firstDayOfCurrentWeek = moment().startOf('week');

      } else {
        const date = moment();
        const year = this.getCurrentYear();
        let firstDayOfYear = this.getFirstDayOfYear(year);
        let week = Math.ceil(moment(date).diff(firstDayOfYear) / (hrsInADay * secondsInAnHour * msScalingFactor) / daysInAWeek) - 1;
        if (week < 1) {
          // For the first week of year, use previous year to calculate current week
          firstDayOfYear = this.getFirstDayOfYear(year - 1);
          week = this.getNumberOfWeeksInYear(year - 1) - week;
        }
        firstDayOfCurrentWeek = firstDayOfYear.add(week, 'weeks');
      }

      return firstDayOfCurrentWeek;
    }
  }

  /**
   * Helper function to check if the user has set a gregorian calendar to start on a Monday
   *
   * @returns {boolean} true/false
   */
  isGregorianMonday () {
    const calendarInfo = this.getActiveCalendar();

    return this.isCalendarIdGregorianMonday(calendarInfo.id);
  }

  /**
   * Helper function to check if calendarId is the gregorian monday calendarId
   *
   * @param {number} calendarId The calendarId
   * @returns {boolean} true/false
   */
  isCalendarIdGregorianMonday (calendarId) {
    return calendarId === standardGregorianMondayCalendarId;
  }

  /**
   * Helper function to check if calendarId is the gregorian sunday calendarId
   *
   * @param {number} calendarId The calendarId
   * @returns {boolean} true/false
   */
  isCalendarIdGregorianSunday (calendarId) {
    return calendarId === standardGregorianSundayCalendarId;
  }

  /**
   * Gets number of weeks in a year
   *
   * @returns {integer} Number of weeks
   */
  getNumberOfWeeksInYear (year) {
    return this.getResult('getNumberOfWeeksInYear', runGetNumberOfWeeksInYear, [year]);

    function runGetNumberOfWeeksInYear (year) {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      let numberOfWeeksInYear;

      if (this.isGregorian(currentCalendarSettings)) {
        numberOfWeeksInYear = moment(`${year}-12-31`).week();
      } else {
        const result = _.filter(currentCalendarSettings.years, yearData => Number(yearData.year) === Number(year));
        numberOfWeeksInYear = _.reduce(result[0].month_mask, (memo, num) => memo + num, 0);
      }

      return numberOfWeeksInYear; 
    }
  }

  /**
   * Gets the last date in the current week for the current calendar
   *
   * @returns {object} A momentJs Object
   */
  getLastDayOfCurrentWeek () {
    return this.getResult('getLastDayOfCurrentWeek', runGetLastDayOfCurrentWeek);

    function runGetLastDayOfCurrentWeek () {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      const weekMinusOneDay = 6;
      let lastDayOfCurrentWeek;
      if (this.ObjectUtils.isNullOrUndefined(currentCalendarSettings) ||
        this.ObjectUtils.isNullOrUndefinedOrEmpty(currentCalendarSettings.years)) { // gregorian

        if (this.isGregorianMonday()) {
          lastDayOfCurrentWeek = moment().endOf('week').add(1, 'days');
        } else {
          lastDayOfCurrentWeek = moment().endOf('week');
        }
      } else {
        const start = this.getFirstDayOfCurrentWeek();
        lastDayOfCurrentWeek = start.add(weekMinusOneDay, 'days').endOf('day');
      }

      return lastDayOfCurrentWeek;
    }
  }

  /**
   * Gets the month definitions (array containing week numbers) for the current calendar
   *
   * @param {number} year the year
   * @returns {array} An array of numbers, which is the number of weeks in each month. 
   * This is not zero indexed. The item at position zero is always undefined.
   * It is ordered by the month after the start month. E.g. if the start month is Feb, 
   * the first item in the array will be the number of weeks for March
   *
   */
  getMonthDefinitions (year) {
    return this.getResult('getMonthDefinitions', runGetMonthDefinitions, [year]);

    function runGetMonthDefinitions (year) {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      const numberOfWeeks = [];
      const monthsInAYear = 12;
      let monthDefinitions;
      if (!this.isGregorian(currentCalendarSettings)) {

        const result = _.filter(currentCalendarSettings.years, yearData => parseInt(yearData.year) === parseInt(year));
        const startMonth = this.getFirstMonthOfYear(year);

        if (this.ObjectUtils.isNullOrUndefinedOrEmpty(result)) {
          return null;
        }

        _.each(result[0].month_mask, (month, key) => {
          let actualKey = key + startMonth;
          if (actualKey >= monthsInAYear) {
            actualKey = parseInt(actualKey - result[0].month_mask.length);
          }
          numberOfWeeks[actualKey + 1] = month;
        });

        monthDefinitions = numberOfWeeks;
      } else {
        monthDefinitions = null;
      }

      return monthDefinitions;
    }
  }

  /** Gets the correct definition for a month according to calendar settings.
   *  For example definition for January can be found from earlier year's
   *  year definition.
   *
   *  @param {number} year the year
   *  @param {number} month the month, zero indexed
   *  @returns {number} The number of weeks in the month
   **/
  getWeekCountOfMonth (year, month) {
    return this.getResult('getWeekCountOfMonth', runGetWeekCountOfMonth, [year, month]);

    function runGetWeekCountOfMonth (year, month) {
      let numWeeks;
      let earlierMonth;

      month = month + 1;

      const firstDayOfSelectedMonth = this.getFirstDayOfMonth(month, year);
      const currentCalendarSettings = this.getActiveCalendarSettings();

      if (!this.isGregorian(currentCalendarSettings)) {
        _.each(currentCalendarSettings.years, ({ start_date, month_mask }) => {
          if (this.ObjectUtils.isNullOrUndefined(numWeeks)) {
            const dt = this.getLocalDateIgnoringUTC(start_date); // This is a UTC date and needs funky parsing

            _.each(month_mask, (weeks, monthIndex) => {
              if (dt >= firstDayOfSelectedMonth) {
                numWeeks = earlierMonth;
              } else {
                earlierMonth = weeks;
                dt.add(weeks, 'weeks');

                if (this.isFinalMonthOfYear(monthIndex) && dt >= firstDayOfSelectedMonth) {
                  numWeeks = earlierMonth;
                }
              }
            });
          }
        });

        return numWeeks;
      }
      return 0;
    }
  }

  /** Gets the week number based on the last valid date that is passed in
   *
   *  @param {array} weekDays An Array of weekdays to check. The last valid date is used.
   *  @returns {number} The week that the last valid date is in
   **/
  getWeekNumber (weekDays) {
    const currentCalendarSettings = this.getActiveCalendarSettings();
    const invalidIndex = -1;
    const weekMinusOneDay = 6;
    const hrsInADay = 24;
    const secondsInAnHour = 3600;
    const msScalingFactor = 1000;
    const daysInAWeek = 7;

    const result = _.filter(weekDays, day => !this.ObjectUtils.isNullOrUndefined(day) &&
      typeof day.isValid === 'function' && day.isValid());
    const date = result.slice(invalidIndex)[0];

    if (this.isGregorian(currentCalendarSettings)) {
      if (!this.ObjectUtils.isNullOrUndefined(date) && typeof date.isValid === 'function' && date.isValid()) {
        const firstWeekdaySetting = this.getCurrentCalendarFirstDayOfWeek();
        if (firstWeekdaySetting === 0) {
          return angular.copy(date).day(weekMinusOneDay).isoWeek();
        }
          
        return date.isoWeek();
      }
    } else {
      const systemDate = this.getSystemYearForDate(date);
      const year = systemDate.year;

      let firstDayOfYear = this.getFirstDayOfYear(year);
      let week = Math.ceil(moment(date).diff(firstDayOfYear) / (hrsInADay * secondsInAnHour * msScalingFactor) / daysInAWeek);

      if (week < 1) {
        firstDayOfYear = this.getFirstDayOfYear(year - 1);
        week = Math.ceil(moment(date).diff(firstDayOfYear) / (hrsInADay * secondsInAnHour * msScalingFactor) / daysInAWeek);
      }
      return week;
    }
  }


  /** Gets the current month based on the active calendar
   *  ToDo: Fix this so that it is zero indexed. Do not do this until it is unit tested
   *        and all code that calls it is unit tested
   *  @returns {number} The current month. Not zero indexed.
   **/
  getCurrentMonth () {
    return this.getResult('getCurrentMonth', runGetCurrentMonth);

    function runGetCurrentMonth () {
      const invalidMonthIndex = -1;
      let currentMonth = -1;

      const currentCalendarSettings = this.getActiveCalendarSettings();

      if (this.isGregorian(currentCalendarSettings)) {
        return moment().format('M'); // This will return a string. Needs fixing.
      }
      const day = [];
      day[0] = moment(); // ToDo: Abstract this out into an angular service to make testing possible
      const week = this.getWeekNumber(day);

      const currentYear = this.getCurrentYear();
      let firstMonthOfYear = this.getFirstMonthOfYear(currentYear) + 1;
      let monthDefinitions = this.getMonthDefinitions(currentYear);
      let counter = 0;

      _.each(monthDefinitions, (weeks, monthKey) => {
        if (!this.ObjectUtils.isNullOrUndefined(weeks) && monthKey >= firstMonthOfYear) {
          counter = counter + parseInt(weeks);
          if (week <= counter && currentMonth === invalidMonthIndex) {
            currentMonth = monthKey;
          }
        }
      });

      if (currentMonth === invalidMonthIndex) {
        monthDefinitions = this.getMonthDefinitions(currentYear - 1);
        firstMonthOfYear = this.getFirstMonthOfYear(currentYear - 1);

        _.each(monthDefinitions, (weeks, monthKey) => {
          if (!this.ObjectUtils.isNullOrUndefined(weeks) && monthKey >= firstMonthOfYear) {
            counter = counter + parseInt(weeks);
            if (week <= counter && currentMonth === invalidMonthIndex) {
              currentMonth = monthKey;
            }
          }
        });
      }

      return currentMonth;
    }
  }

  /** Gets the current year based on the active calendar
   *
   *  This function is a little faulty for certain calendars.
   *  Return the year from the active calendar. Call getSystemYearForDate instead
    *
    *  @returns {number} The current year
    **/
  getCurrentYear () {
    return this.getResult('getCurrentYear', runGetCurrentYear);

    function runGetCurrentYear () {
      const currentCalendarSettings = this.getActiveCalendarSettings();
      let CurrentYear;
      if (this.isGregorian(currentCalendarSettings)) {
        CurrentYear = Number(moment().format('YYYY'));
      } else {
        const systemDate = this.getSystemYearForDate(moment());
        CurrentYear = systemDate.year;
      }
      return CurrentYear;
    }
  }

  /** Gets the year for the date passed in based on the active calendar
   *
   *  @param {Object} date - the date under question, as a momentJs object
   *  @returns {Object} The year and month for the date passed in. Month is zero indexed.
   **/
  getSystemYearForDate (date) {
    return this.getResult('getSystemYearForDate', runSystemYearForDate, [date]);

    function runSystemYearForDate (date) {
        let ret = {};
        const currentSettings = this.getActiveCalendarSettings();

        let dateArg = date;
        if (!moment.isMoment(dateArg) && !_.isObject(dateArg)) {
         dateArg = moment(dateArg);
        }

        if (this.isGregorian(currentSettings)) {
          ret = {
            month: Number(angular.copy(dateArg).format('M')), // Fix this and make it zero indexed
            year: Number(angular.copy(dateArg).format('YYYY'))
          };
  
          if (ret.month < dateArg.format('M')) { // How can this ever be true?
            ret.year = ret.year + 1;
          }
        } else {
          _.each(currentSettings.years, year => {
            if (this.ObjectUtils.isNullOrUndefined(ret.month) && this.ObjectUtils.isNullOrUndefined(ret.year)) {
              const dt = this.getLocalDateIgnoringUTC(year.start_date);
              
              _.each(year.month_mask, (weeks, monthIndex) => {
                if ( dt.isAfter(dateArg) ) {

                  if (this.ObjectUtils.isNullOrUndefined(ret.month) && this.ObjectUtils.isNullOrUndefined(ret.year)) {

                    ret = {
                      year: year.year,
                      month: monthIndex - 1
                    };
                  }
                } else {
                  dt.add(weeks, 'weeks');
                  // This check fixes a bug where if your current period is in the last
                  // defined month of the calendar, no value gets assigned to ret
                  if (this.isFinalMonthOfYear(monthIndex) && dt.isAfter(dateArg)) {
                    ret = {
                      year: year.year,
                      month: monthIndex
                    };
                  }
                }
  
              });
            }
          });
        }
  
        return ret;
    }
  }

  /** Sets the current organization. Should be called before other functions are called
   *  ToDo: Call this only once when the current organization changes, and during app load.
   *
   *  @param {object} currentOrganization - The current organization, as returned from the API
   **/
  setOrganization (currentOrganization) {
    this.activeOrganization = currentOrganization;
    this.requestManager.setOrganization(this.activeOrganization);
  }

  /** Sets all calendars that are available to the user. Stores the calendars into local Storage
   * @param {boolean} noCache - Optional. Defaults to false. Specifies if the local storage cache should be written to.
   *
   *  @param {array} calendars - Collection of calendar objects, as returned from the API
   **/
  setAllCalendars (calendars, noCache) {
    if (noCache === false) {
      this.localStorageService.set('calendars', calendars);
    }
    this.allCalendars = calendars;
  }

  /** Sets the current user. Should be called before other functions are called
   *  ToDo: Call this function only once when the user logs in
   *        or automatically call the currentUser endpoint after login and when this service loads
   *
   *  @returns {object} currentUser - The user object, as returned from the API
   **/
  setUser (currentUser) {
    this.activeUser = currentUser;
  }

  /** Retrieves the number formats available on the user preferences page.
   *
   *  @returns {object} number preferences
   **/
  getNumberFormats () {
    return [
      { name: null, description: 'Use organization default' },
      { name: 'en-us', description: '1,234.00' },
      { name: 'international', description: '1.234,00' }
    ];
  }

  /** Retrieves the number format separators
   *
   *  @returns {object} seperator options
   **/
  getNumberFormatSeparatorsByName (name) {
    const separators = {
      'en-us': { decimalSeparator: '.', thousandsSeparator: ',' },
      'international': { decimalSeparator: ',', thousandsSeparator: '.' },

    };
    return separators[name] || { decimalSeparator: null, thousandsSeparator: null };
  }

  /** Infers the name of the number format based on the seperators
  *
  *  @returns {string} The format key
  **/
  getNumberFormatName (number_format) {
    let formatKey = 'en-us';
    if (!this.ObjectUtils.isNullOrUndefined(number_format) &&
      !this.ObjectUtils.isNullOrUndefinedOrBlank(number_format.decimal_separator) &&
      !this.ObjectUtils.isNullOrUndefinedOrBlank(number_format.thousands_separator) &&
      number_format.decimal_separator === ',' &&
      number_format.thousands_separator === '.') {
      formatKey = 'international';
    }
    return formatKey;
  }

  hasNullValue (_numberFormatObject) {
    const _hasNullValue = _.find(_numberFormatObject, val => this.ObjectUtils.isNullOrUndefinedOrBlank(val));

    let ret = false;

    if (_hasNullValue !== undefined) {
      ret = true;
    }

    return ret;
  }

  /**
   * returns this.activeUser or this.activeOrganization numberformat settings. 
   * This should be used instead of getNumberFormatSeparatorsByName
   *
   * @returns {object}
   */
  getActualNumberFormat () {
    const numberFormat = this.getUserNumberFormat(this.activeUser);
    let actualNumberFormat;

    if (!this.hasNullValue(numberFormat)) {
      actualNumberFormat = numberFormat;
    } else {
      //defaults to en-us if org does not have numberFormat prop -  might never happen
      const orgNumberFmt = this.getOrganizationNumberFormat(this.activeOrganization);
      actualNumberFormat = !this.hasNullValue(orgNumberFmt) ? orgNumberFmt : this.getNumberFormatSeparatorsByName('en-us');
    }

    return actualNumberFormat;
  }

  /** Gets the number format name
   *
   *  @param {object} currentUser the user to check
   *  @param {object} currentOrganization the org to check
   *  @returns {string} The format key
   **/
  getCurrentNumberFormatName (currentUser, currentOrganization) {
    // Try to get user settings first
    let numberFormat = this.getUserNumberFormat(currentUser);
    if (!this.ObjectUtils.isNullOrUndefined(numberFormat) &&
      !this.ObjectUtils.isNullOrUndefined(numberFormat.decimal_separator) &&
      !this.ObjectUtils.isNullOrUndefined(numberFormat.thousands_separator)) {
      return this.getNumberFormatName(numberFormat);
    }

    // Fall back to organization settings if available
    numberFormat = currentOrganization ?
      this.getOrganizationNumberFormat(currentOrganization) :
      null;
    return this.getNumberFormatName(numberFormat);
  }

  /** Gets the current date format.
   *  Attempts to lift the format from the current user first, before falling back to the currentOrg
   *
   *  @param {object} currentOrganization the user to check
   *  @returns {string} The format key
   **/
  getCurrentDateFormat (currentOrganization) {
    let currentDateFormat;
    currentOrganization = _.isUndefined(currentOrganization) ? this.activeOrganization : currentOrganization;

    if (this.currentUserHasDateFormatSetting(this.activeUser)) {
      return this.activeUser.localization.date_format.mask;
    }
    if (this.currentOrganizationHasDateFormatSetting(currentOrganization)) {
      currentDateFormat = currentOrganization.localization.date_format.mask;
    } else {
      currentDateFormat = 'MM/DD/YYYY';
    }

    return currentDateFormat;
  }

  /** Safely retrieves the active user's locale settings.
   *  Defaults to en_US if no locale settings are found
   *
   *  @returns {string} locale
   **/
  getCurrentLocaleSetting () {
    /* @todo: add locale picker with validation */
    let locale = 'en_US';
    if (!this.ObjectUtils.isNullOrUndefined(this.activeUser) &&
      !this.ObjectUtils.isNullOrUndefined(this.activeUser.localization) &&
      !this.ObjectUtils.isNullOrUndefined(this.activeUser.localization.locale)) {
      locale = this.activeUser.localization.locale;
    }
    return locale;
  }

  /** Gets the first day of the week from the current org.
   *  Defaults to Sunday if the data is not available
   *
   *  @returns {number} The day of the week. Zero indexed. Sunday = 0, Saturday = 6.
   **/
  getCurrentOrganizationDaysOfWeek () {
    const firstDayOfWeek = this.getCurrentCalendarFirstDayOfWeek() || 0;

    return this.getDaysOfWeek(firstDayOfWeek);
  }

  /** Gets the days of the week, ordered based on the first day of the week passed in
   *
   *  @param {number} firstDayOfWeek Zero indexed day of week to start on
   *  @returns {array} Array of weekday labels, ordered correctly
   **/
  getDaysOfWeek (firstDayOfWeek) {
    const standardWeekDayLabels = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const weekMinusOneDay = 6;
    const nosOfDaysInAWeek = 7;

    const daysOfWeek = [];

    while (daysOfWeek.length < nosOfDaysInAWeek) {
      const weekDayLabel = standardWeekDayLabels[firstDayOfWeek];

      daysOfWeek.push(weekDayLabel);

      if (firstDayOfWeek === weekMinusOneDay) {
        firstDayOfWeek = 0;
      } else {
        firstDayOfWeek++;
      }
    }

    return daysOfWeek;
  }

  /** Gets the weeks ago setting
   *
   *  @returns {object} Weeks ago setting
   **/
  getWeeksAgo () {
    return this.weeksAgo;
  }

  /** sets the weeks ago setting
   *
   *  @param {object} data to be stored as the weeks ago setting
   **/
  setWeeksAgo (data) {
    this.weeksAgo = data;
  }

  /** Gets the customCompare setting
   *  ToDo: Move this. It should't be a reponsiblity of the localization service.
   *
   *  @returns {object} Weeks ago setting
   **/
  getCustomCompareSetting () {
    return this.customCompareSetting;
  }

  /** Sets the customCompare setting
   *  ToDo: Move this. It should't be a reponsiblity of the localization service.
   *
   *  @param {object} data to be stored as the customCompare setting
   **/
  setCustomCompareSetting (data) {
    this.customCompareSetting = data;
  }

  /** Gets the start of the current calendar
   *
   *  @returns {object} The first date of the first year of the active calendar.
   **/
  getStartOfCurrentCalendar () {
    return this.getResult('getStartOfCurrentCalendar', runGetStartOfCurrentCalendar);

    function runGetStartOfCurrentCalendar () {
      const epochYear = 1970;
      const currentCalendarSettings = this.getActiveCalendarSettings();
      let minYear = moment();

      if (this.isGregorian(currentCalendarSettings)) {
        minYear = epochYear;
      } else {
        _.each(currentCalendarSettings.years, year => {
          if (minYear > moment(year.start_date)) {
            minYear = year.year;
          }
        });
      }
      return this.getFirstDayOfYear(minYear, currentCalendarSettings);
    }
  }

  /** Gets the end of the current calendar
   *
   *  @returns {object} The last date of the last year of the active calendar.
   **/
  getEndOfCurrentCalendar () {
    return this.getResult('getEndOfCurrentCalendar', runGetEndOfCurrentCalendar);

    function runGetEndOfCurrentCalendar () {
      let previousYear;
      let lastYear;
      const currentCalendarSettings = this.getActiveCalendarSettings();

      // Default to the current year, which will remain as this value for gregorian cals
      lastYear = moment().year();

      if (!this.isGregorian(currentCalendarSettings)) {
        const years = currentCalendarSettings.years;
        _.each(years, year => {
          if (moment(year.start_date) > previousYear) {
            lastYear = year.year;
          }
          previousYear = moment(year.start_date);
        });
      }

      return this.getLastDayOfYear(lastYear);
    }
  }

  /** Checks if the current calendar has year definitions
   *
   *  @returns {boolean}
   **/
  hasMonthDefinitions () {
    const currentCalendarSettings = this.getActiveCalendarSettings();

    if (this.ObjectUtils.isNullOrUndefined(currentCalendarSettings)) {
      return false;
    }

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(currentCalendarSettings.years)) {
      return false;
    }

    if (this.currentCalendarHasExpired()) {
      return false;
    }

    return true;
  }

  /**
   * Determines if the current calendar has expired.
   *
   * @returns {boolean}
   */
  currentCalendarHasExpired () {   
    const latestSupportedDate = this.getCurrentCalendarLatestDate();

    if (moment().isAfter(latestSupportedDate)) {
      return true;
    }

    return false;
  }

  /**
   * Gets the current, user selected calendar name. Ignores any isGregorian checks.
   *
   * @returns {boolean}
   */
  getCurrentCalendarName () {
    const currentCalendarSettings = this.getActiveCalendarSettings();

    if (this.ObjectUtils.isNullOrUndefined(currentCalendarSettings)) {
      return;
    }

    return currentCalendarSettings.name;

  }

  /**
   * Gets the Standard Monthly calendarId
   *
   * @returns {number} The calendarId
   */
  getStandardMonthlyCalendarId () {
    return standardMonthlyCalendarId;
  }

  /**
   * Gets the Standard Gregorian Sunday calendarId
   *
   * @returns {number} The calendarId
   */
  getStandardGregorianSundayCalendarId () {
    return standardGregorianSundayCalendarId;
  }

  /**
  * Gets the Standard Gregorian Monday calendarId
  *
  * @returns {number} The calendarId
  */
  getStandardGregorianMondayCalendarId () {
    return standardGregorianMondayCalendarId;
  }

  /**
   *
   * Private Functions
   *
   */

  /**
   * Helper function to wrap something in a promise
   * Private function
   *
   * @returns {Object} item - anything you want
   */
  promisify (item) {
    return this.$q(resolve => {
      resolve({ result: item });
    });
  }

  /**
   * Finds the calendar object that matches the calendarId param
   * Private function
   *
   * @param {number} calendarId
   * @returns {object} The active calendar's object
   */
  getCalendarSettings (calendarId) {
    const result = _.filter(this.allCalendars, ({calendar_id}) => Number(calendar_id) === Number(calendarId));
    return result[0];
  }

  /**
   * Checks if calendar for active user is Gregorian and exposing existing private isGregorian method publicly
   *
   * @param {boolean} ignoreExpiredCheck optional. Defaults to false.
   * Public function
   * @returns {boolean}
   */
  isCurrentCalendarGregorian (ignoreExpiredCheck) {
    if (!this.ObjectUtils.isNullOrUndefined(this.activeUser)) {
      const activeCalendarSetting = this.getActiveCalendarSettings();
      return this.isGregorian(activeCalendarSetting, ignoreExpiredCheck);
    }
    return false;
  }

  /**
   * Determines if the passed in calendar is Gregorian or not
   * Private function
   *
   * @param {object} calendar a calendar object to test
   * @param {boolean} ignoreExpiredCheck optional. Defaults to false.
   * @returns {boolean}
   */
  isGregorian (calendar, ignoreExpiredCheck) {

    if (this.ObjectUtils.isNullOrUndefined(ignoreExpiredCheck)) {
      ignoreExpiredCheck = false;
    }

    if (this.ObjectUtils.isNullOrUndefined(calendar)) {
      return true;
    }

    if (this.ObjectUtils.isNullOrUndefinedOrEmpty(calendar.years)) {
      return true;
    }

    if (!ignoreExpiredCheck && this.currentCalendarHasExpired()) {
      return true;
    }

    return false;
  }

  /**
   * Gets the last day of the last year of the current calendar
   * Private function
   *
   * @returns {object} a momentJs DateTime object
   */
  getCurrentCalendarLatestDate () {
    const currentSettings = this.getActiveCalendarSettings();

    const latestYearDefinition = _.max(currentSettings.years, ({year}) => year);

    const yearEnd = moment(latestYearDefinition.start_date);

    _.each(latestYearDefinition.month_mask, monthMask => {
      yearEnd.add(monthMask, 'weeks');
    });

    return yearEnd;
  }

  /** Gets application wide default calendar. Should only be used as a last ditch.
   *  Private Function
   *
   *  @returns {number} The app wide default calendar Id
   **/
  getAppDefaultCalendarId () {
    return 1;
  }

  /** Safely checks if the passed in user has date format settings
   *  Private Function
   *
   *  @param {object} user the user to check
   *  @returns {boolean}
   **/
  currentUserHasDateFormatSetting (user) {
    if (!this.ObjectUtils.isNullOrUndefined(user) &&
      !this.ObjectUtils.isNullOrUndefined(user.localization) &&
      !this.ObjectUtils.isNullOrUndefined(user.localization.date_format) &&
      !this.ObjectUtils.isNullOrUndefined(user.localization.date_format.mask)) {
      return true;
    }
      
    return false;
  }

  /** Safely retrieves the passed in user's date format settings
   *  Private Function
   *
   *  @param {object} user the user to check
   *  @returns {boolean}
   **/
  currentOrganizationHasDateFormatSetting (organization) {
    if (!this.ObjectUtils.isNullOrUndefined(organization) &&
      !this.ObjectUtils.isNullOrUndefined(organization.localization) &&
      !this.ObjectUtils.isNullOrUndefined(organization.localization.date_format) &&
      !this.ObjectUtils.isNullOrUndefined(organization.localization.date_format.mask)) {
      return true;
    } 
      
    return false;    
  }
  
  /** Gets the organizations number format
   *  Private Function
   *
   *  @param {object} currentOrganization the org to check
   *  @returns {string} The format key
   **/
  getOrganizationNumberFormat (currentOrganization) {
    return currentOrganization &&
      currentOrganization.localization &&
      currentOrganization.localization.number_format;
  }

  /** Gets the users number format
   *  Private Function
   *
   *  @param {object} currentUser the user to check
   *  @returns {string} The format key
   **/
  getUserNumberFormat (currentUser) {
    return currentUser &&
      currentUser.localization &&
      currentUser.localization.number_format;
  }

  /** Retrieves the user's preferences from the this.activeUser object.
   *  Private Function.
   *
   *  @param {object} user preferences
   **/
  getUserPreferences () {
    if (this.ObjectUtils.isNullOrUndefined(this.activeUser)) {
      return;
    }

    return this.activeUser.preferences;
  }

  /** Checks if the month in question is the final month of the year
   *  Private function
   *
   *  @param {monthIndex} number - the month number, zero indexed
   *  @returns {boolean}
   **/
  isFinalMonthOfYear (monthIndex) {
    const maxZeroBasedMonthIndex = 11;
    return monthIndex === maxZeroBasedMonthIndex;
  }

  /** Returns yesterday date as a momentJS object. Allows for mocking in unit tests
   *
   *  @returns {momentJS object}
   **/
  getYesterday () {
    return moment().subtract(1, 'day');
  }

  /**
   * Returns current date/time as a momentJS object. Allows for mocking in unit tests
   *
   * @returns {momentJS object}
   */
  getCurrentTime () {
    return moment();
  }

  getResult (functionName, functionToRun, params) {
    const cacheKey = this.getCacheKey(functionName, params);
    
    let result = this.cache[cacheKey];

    if (!_.isUndefined(this.cache[cacheKey])) {
      if (_.isObject(result)) {
        return angular.copy(result);
      } 
        
      return result;
      
    }
    result = functionToRun.apply(this, params);
    
    if (!_.isUndefined(this.allCalendars)) {
      // We only want to cache data if the calendars have been loaded
      this.cacheResult(cacheKey, result);
    }

    return result;
  }

  cacheResult (cacheKey, result) {
    if (_.isObject(result)) {
      this.cache[cacheKey] = angular.copy(result);
    } else {
      this.cache[cacheKey] = result;
    }
  }

  getCacheKey (functionName, params) {
    let cacheKey = functionName;
    const activeCalendar = this.getActiveCalendar();
    cacheKey = `${cacheKey}.${activeCalendar.id.toString()}`;

    _.each(params, param => {
      let paramKey;

      if (moment.isMoment(param)) {
        paramKey = param.format('YYYY-DD-MM');
      }

      if (_.isObject(param)) {
        if (!_.isUndefined(param.id)) {
          paramKey = this.getParamKey(param.id);
        }
      } else {
        paramKey = this.getParamKey(param);
      }

      cacheKey = `${cacheKey}.${paramKey}`;
    });

    return cacheKey;
  }

  getParamKey (param) {
    if (_.isNumber(param)) {
      return param.toString();
    }

    if (_.isString(param)) {
      return param;
    }
  }
}

angular.module('shopperTrak')
  .service('LocalizationService', LocalizationService);

LocalizationService.$inject = ['localStorageService', '$http', '$q', 'apiUrl', 'ObjectUtils', 'requestManager'];
