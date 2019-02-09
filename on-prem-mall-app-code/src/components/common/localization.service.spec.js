'use strict';

describe('LocalizationService', function () {

  var localizationService;

  var daysOfWeek = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  var allCalendars = [];

  var mockedRequestManagerCalendars = [];

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {

    $provide.factory('requestManager', function ($q) {
      return {
        get: function () {
          var deferred = $q.defer();

          deferred.resolve(mockedRequestManagerCalendars);

          return deferred.promise;
        },
        setOrganization: function(org) {
          angular.noop(org);
        }
      };
    });
  }));

  beforeEach(inject(function (_LocalizationService_) {

    localizationService = _LocalizationService_;

    localizationService.setUser({ preferences: { calendar_id: 1 } });

    allCalendars = [
      {
        '_id': '56fc5f721a76b5921e3df217',
        'calendar_id': 1,
        'name': 'NRF Calendar',
        '__v': 360,
        'organization_ids': [

        ],
        'years': [
          {
            'year': Number(getFirstSunday(1).format('YYYY')) - 1,
            'start_date': getFirstSundayLastYear(1).toISOString(), // This is fine as a utc date as that is what the API returns
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSunday(1).format('YYYY')),
            'start_date': getFirstSunday(1).toISOString(), // This is fine as a utc date as that is what the API returns
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          }
        ],
        'global': true
      },

      {
        '_id': '1234',
        'calendar_id': 2,
        'name': 'A Saturday Calendar',
        'organization_ids': [

        ],
        'years': [
          {
            'year': 2015, // This is our un-dynamic safe year
            'start_date': moment.utc('07-02-2015', 'DD-MM-YYYY').toISOString(), // This is fine as a utc date as that is what the API returns
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSaturday(1).format('YYYY')) - 1,
            'start_date': getFirstSaturday(1).toISOString(), // This is fine as a utc date as that is what the API returns
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSaturday(1).format('YYYY')),
            'start_date': getFirstSaturday(1).toISOString(), // This is fine as a utc date as that is what the API returns
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          }
        ],
        'global': true
      },
      {
        '_id': '5706c4b6c6332ca9432667aa',
        'calendar_id': 3,
        'name': 'Standard Sunday Weeks',
        '__v': 1016,
        'organization_ids': [ ],
        'years': [
          {
            'year': 2015,
            'start_date': '2014-12-28T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          },
          {
            'year': 2016,
            'start_date': '2015-12-27T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          },
          {
            'year': 2017,
            'start_date': '2016-12-25T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          },
          {
            'year': 2018,
            'start_date': '2017-12-31T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          }
        ],
        'global': true
      }
    ];

    localizationService.setAllCalendars(allCalendars);

    mockedRequestManagerCalendars = angular.copy(allCalendars);

    mockedRequestManagerCalendars[0].name += ' from requestManager';

    mockedRequestManagerCalendars[1].name += ' from requestManager';

  }));

  describe('getCurrentOrganizationDaysOfWeek', function () {

    it('should set weekday labels starting with Sunday for Sunday based calendars', function () {

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']);
    });

    it('should set weekday labels starting with Monday for Monday based calendars', function () {

      var sunday = getFirstSunday(1);

      var monday = sunday.add(1, 'day');

      allCalendars[0].years[1].start_date = monday.toISOString();

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
    });

    it('should set weekday labels starting with Tuesday for Tuesday based calendars', function () {

      var sunday = getFirstSunday(1);

      var tuesday = sunday.add(2, 'day');

      allCalendars[0].years[1].start_date = tuesday.toISOString();
      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon']);
    });

    it('should set weekday labels starting with Wednesday for Wednesday based calendars', function () {

      var sunday = getFirstSunday(1);

      var wednesday = sunday.add(3, 'day');

      allCalendars[0].years[1].start_date = wednesday.toISOString();

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue']);
    });

    it('should set weekday labels starting with Thursday for Thursday based calendars', function () {

      var sunday = getFirstSunday(1);

      var thursday = sunday.add(4, 'day');

      allCalendars[0].years[1].start_date = thursday.toISOString();

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['thu', 'fri', 'sat', 'sun', 'mon', 'tue', 'wed']);
    });

    it('should set weekday labels starting with Friday for Friday based calendars', function () {

      var sunday = getFirstSunday(1);

      var friday = sunday.add(5, 'day');

      allCalendars[0].years[1].start_date = friday.toISOString();

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['fri', 'sat', 'sun', 'mon', 'tue', 'wed', 'thu']);
    });

    it('should set weekday labels starting with Saturday for Saturday based calendars', function () {

      var sunday = getFirstSunday(1);

      var saturday = sunday.add(6, 'day');

      allCalendars[0].years[1].start_date = saturday.toISOString();

      var weekdayLabels = localizationService.getCurrentOrganizationDaysOfWeek();

      expect(weekdayLabels).toEqual(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']);
    });
  });

  describe('getLegacyFirstDayOfWeek', function () {

    it('should return Sunday as first day of week if the current organization is undefined', function () {
      var firstDayOfWeek = localizationService.getLegacyFirstDayOfWeek();

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });

    it('should return Sunday as the first day of the week if the current organization portal settings are undefined', function () {
      var organization = {};

      var firstDayOfWeek = localizationService.getLegacyFirstDayOfWeek(organization);

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });

    it('should return Sunday as the first day of the week if the current organization portal settings legacy week start is undefined', function () {
      var organization = {
        portal_settings: {}
      };

      var firstDayOfWeek = localizationService.getLegacyFirstDayOfWeek(organization);

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });

    it('should return Sunday as the first day of the week if the current organization\'s legacy week start is Sunday', function () {
      var organization = {
        portal_settings: {
          legacy_week_start_day: 'Sunday'
        }
      };

      var firstDayOfWeek = localizationService.getLegacyFirstDayOfWeek(organization);

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });


    it('should return Saturday as the first day of the week if the current organization\'s legacy week start is Saturday', function () {
      var organization = {
        portal_settings: {
          legacy_week_start_day: 'Saturday'
        }
      };

      var firstDayOfWeek = localizationService.getLegacyFirstDayOfWeek(organization);

      expect(firstDayOfWeek).toEqual(daysOfWeek.saturday);
    });
  });

  describe('getCurrentCalendarFirstDayOfWeek', function () {

    it('should return sunday as the first day of the week for sunday based calendars', function () {
      var sunday = getFirstSunday(1);

      allCalendars[0].years[1].start_date = sunday.toISOString();

      localizationService.setUser({ preferences: { calendar_id: 1 } });

      var firstDayOfWeek = localizationService.getCurrentCalendarFirstDayOfWeek(true);

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });

    it('should return saturday as the first day of the week for saturday based calendars', function () {
      localizationService.setUser({ preferences: { calendar_id: 2 } });

      var firstDayOfWeek = localizationService.getCurrentCalendarFirstDayOfWeek();

      expect(firstDayOfWeek).toEqual(daysOfWeek.saturday);
    });

    it('should revert back to the legacy first day of the week if the user has no calendar preference', function () {
      localizationService.setUser({ preferences: {} });

      var organization = {
        portal_settings: {
          legacy_week_start_day: 'Wednesday'
        }
      };

      localizationService.setOrganization(organization);

      var firstDayOfWeek = localizationService.getCurrentCalendarFirstDayOfWeek();

      expect(firstDayOfWeek).toEqual(daysOfWeek.wednesday);
    });
  });

  describe('getFirstDayOfWeekInCalendar', function () {

    beforeEach(function () {
      localizationService.setOrganization({});
    });

    it('should return sunday as the first day of the week for sunday based calendars', function () {
      var firstDayOfWeek = localizationService.getFirstDayOfWeekInCalendar(1, true);

      expect(firstDayOfWeek).toEqual(daysOfWeek.sunday);
    });

    it('should return saturday as the first day of the week for saturday based calendars', function () {
      var firstDayOfWeek = localizationService.getFirstDayOfWeekInCalendar(2);

      expect(firstDayOfWeek).toEqual(daysOfWeek.saturday);
    });

    // ES: This behaviour looks incorrect to me. I think that it should check the organization's defaut before falling back to the legacy settings
    it('should fallback to the organizations legacy weekstart if the calendar does not exist', function () {
      var organization = {
        portal_settings: {
          legacy_week_start_day: 'Wednesday'
        }
      };

      localizationService.setOrganization(organization);

      var calendarIdThatDoesNotExist = 900;

      var firstDayOfWeek = localizationService.getFirstDayOfWeekInCalendar(calendarIdThatDoesNotExist);

      expect(firstDayOfWeek).toEqual(daysOfWeek.wednesday);
    });
  });

  describe('getFirstDayOfMonth', function () {

    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the first day of the passed in month for Gregorian calendars', function () {
      allCalendars[0].years = [];

      localizationService.setAllCalendars(allCalendars);

      // Zero indexed month, remember
      var startOfMonth = localizationService.getFirstDayOfMonth(3, 2017);

      expect(startOfMonth.format('YYYY')).toBe('2017');
      expect(startOfMonth.format('MM')).toBe('04');
      expect(startOfMonth.format('DD')).toBe('01');
    });

    it('should return the first day of the first month for custom calendars', function() {
      localizationService.setUser({ preferences: { calendar_id: 3 } });

      var startOfMonth = localizationService.getFirstDayOfMonth(0, 2015); // Jan

      var expectedStartOfMonth = moment('28-12-2014', 'DD-MM-YYYY');

      expect(startOfMonth.format('YYYY')).toBe(expectedStartOfMonth.format('YYYY'));
      expect(startOfMonth.format('MM')).toBe(expectedStartOfMonth.format('MM'));
      expect(startOfMonth.format('DD')).toBe(expectedStartOfMonth.format('DD'));
    });

    it('should return the first day of the second month for custom calendars', function() {
      localizationService.setUser({ preferences: { calendar_id: 3 } });

      var startOfMonth = localizationService.getFirstDayOfMonth(3, 2015); // April

      var expectedStartOfMonth = moment('29-03-2015', 'DD-MM-YYYY');

      expect(startOfMonth.format('YYYY')).toBe(expectedStartOfMonth.format('YYYY'));
      expect(startOfMonth.format('MM')).toBe(expectedStartOfMonth.format('MM'));
      expect(startOfMonth.format('DD')).toBe(expectedStartOfMonth.format('DD'));
    });

    it('should return the first day of the passed in month for custom calendars', function () {
      localizationService.setUser({ preferences: { calendar_id: 3 } });

      var startOfMonth = localizationService.getFirstDayOfMonth(10, 2015);

      var expectedStartOfMonth = moment('25-10-2015', 'DD-MM-YYYY');

      expect(startOfMonth.format('YYYY')).toBe(expectedStartOfMonth.format('YYYY'));
      expect(startOfMonth.format('MM')).toBe(expectedStartOfMonth.format('MM'));
      expect(startOfMonth.format('DD')).toBe(expectedStartOfMonth.format('DD'));
    });

  });

  describe('getLastDayOfMonth', function () {

    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the last day of the passed in month for Gregorian calendars', function () {
      allCalendars[0].years = [];

      localizationService.setAllCalendars(allCalendars);

      // Zero indexed month, remember
      var endOfMonth = localizationService.getLastDayOfMonth(3, 2017);

      expect(endOfMonth.format('YYYY')).toBe('2017');
      expect(endOfMonth.format('MM')).toBe('04');
      expect(endOfMonth.format('DD')).toBe('30');
    });

    it('should return the last day of the passed in month for custom calendars', function () {
      var year = moment.utc().year();

      var endOfMonth = localizationService.getLastDayOfMonth(2, year);

      var endOfMonthExpected = getFirstSunday(1).add(13, 'week').add(-1, 'day');

      expect(endOfMonth.format('YYYY')).toBe(year.toString());
      expect(endOfMonth.format('MM')).toBe(endOfMonthExpected.format('MM'));
      expect(endOfMonth.format('DD')).toBe(endOfMonthExpected.format('DD'));
    });
  });

  describe('getFirstDayOfYear', function () {

    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the first day of the passed in year for Gregorian calendars', function () {
      allCalendars[0].years = [];

      var year = moment.utc().year();

      // Zero indexed month, remember
      var startOfYear = localizationService.getFirstDayOfYear(year, allCalendars[0]);

      expect(startOfYear.format('YYYY')).toBe(year.toString());
      expect(startOfYear.format('MM')).toBe('01');
      expect(startOfYear.format('DD')).toBe('01');
    });

    it('should return the first day of the passed in year for custom calendars', function () {
      var year = moment.utc().year();

      // Zero indexed month, remember
      var startOfYear = localizationService.getFirstDayOfYear(year, allCalendars[0]);

      var firstSunday = getFirstSunday(1);

      expect(startOfYear.format('YYYY')).toBe(firstSunday.format('YYYY'));
      expect(startOfYear.format('MM')).toBe(firstSunday.format('MM'));
      expect(startOfYear.format('DD')).toBe(firstSunday.format('DD'));
    });

    it('should return the first day of the passed in year if the year does not exist in the calendar definition', function () {
      allCalendars[0].years = [];

      var year = moment.utc().add(1, 'year').year();

      // Zero indexed month, remember
      var startOfYear = localizationService.getFirstDayOfYear(year, allCalendars[0]);

      expect(startOfYear.format('YYYY')).toBe(year.toString());
      expect(startOfYear.format('MM')).toBe('01');
      expect(startOfYear.format('DD')).toBe('01');
    });
  });

  describe('getLastDayOfYear', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the last day of the passed in year for Gregorian calendars', function () {
      allCalendars[0].years = [];

      localizationService.setAllCalendars(allCalendars);

      var lastDayOfYear = localizationService.getLastDayOfYear(2017);

      expect(lastDayOfYear.format('YYYY')).toBe('2017');
      expect(lastDayOfYear.format('MM')).toBe('12');
      expect(lastDayOfYear.format('DD')).toBe('31');
    });

    it('should return the last day of the year for custom calendars (sunday calendar)', function () {
      var year = moment.utc().year();

      var lastDayOfYear = localizationService.getLastDayOfYear(year);

      var expectedLastDayOfYear = getFirstSunday(1).add(51, 'week').add(6, 'day').endOf('day');

      expect(lastDayOfYear.format('YYYY')).toBe(expectedLastDayOfYear.format('YYYY'));
      expect(lastDayOfYear.format('MM')).toBe(expectedLastDayOfYear.format('MM'));
      expect(lastDayOfYear.format('DD')).toBe(expectedLastDayOfYear.format('DD'));
      expect(lastDayOfYear.format('HH')).toBe(expectedLastDayOfYear.format('HH'));
      expect(lastDayOfYear.format('mm')).toBe(expectedLastDayOfYear.format('mm'));
    });

    it('should return the last day of the year for custom calendars (saturday calendar)', function () {
      localizationService.setUser({ preferences: { calendar_id: 2 } });

      var lastDayOfYear = localizationService.getLastDayOfYear(2015);

      var expectedLastDayOfYear = moment.utc('05-02-2016 23:59', 'DD-MM-YYYY HH:mm');

      expect(lastDayOfYear.format('YYYY')).toBe(expectedLastDayOfYear.format('YYYY'));
      expect(lastDayOfYear.format('MM')).toBe(expectedLastDayOfYear.format('MM'));
      expect(lastDayOfYear.format('DD')).toBe(expectedLastDayOfYear.format('DD'));
      expect(lastDayOfYear.format('HH')).toBe(expectedLastDayOfYear.format('HH'));
      expect(lastDayOfYear.format('mm')).toBe(expectedLastDayOfYear.format('mm'));
    });
  });

  describe('getAllCalendars', function () {
    it('should return the in memory calendars if they are present', function () {
      localizationService.getAllCalendars().then(function (calendars) {
        expect(calendars.length).toBe(2);
        expect(calendars[0].name).toBe('NRF Calendar');
      });
    });

    it('should request the calendars from the api if they are not present in memory', function () {
      localizationService.setAllCalendars(undefined);

      localizationService.getAllCalendars().then(function (calendars) {
        expect(calendars.length).toBe(2);
        expect(calendars[0].name).toBe('NRF Calendar from requestManager');
        expect(calendars[0].name).toBe('A Saturday Calendar from requestManager');
      });
    });
  });

  describe('getFirstMonthOfYear', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return January for Gregorian calendars', function () {
      allCalendars[0].years = [];

      localizationService.setAllCalendars(allCalendars);

      var firstMonthOfYear = localizationService.getFirstMonthOfYear(moment.utc().year());

      expect(firstMonthOfYear).toBe(0);
    });

    it('should return January for years that do not have a calendar definition', function () {
      var twoYearsInTheFuture = moment.utc().add(2, 'year').year();

      var firstMonthOfYear = localizationService.getFirstMonthOfYear(twoYearsInTheFuture);

      expect(firstMonthOfYear).toBe(0);
    });

    it('should return the calendar definition\'s start month for custom calendars', function () {
      var firstMonthOfYear = localizationService.getFirstMonthOfYear(moment.utc().year());

      expect(firstMonthOfYear).toBe(1);
    });

  });


  describe('getFirstDayOfCurrentWeek', function () {
    // This function is only partially tested.
    // It is tightly coupled to momentJs and cannot be tested without breaking this down

    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the start of the current week for Gregorian calendars', function () {
      allCalendars[0].years = [];

      localizationService.setAllCalendars(allCalendars);

      var firstDayOfCurrentWeek = localizationService.getFirstDayOfCurrentWeek();

      var expectedDate = moment.utc().startOf('week');

      expect(firstDayOfCurrentWeek.format('DD')).toBe(expectedDate.format('DD'));
      expect(firstDayOfCurrentWeek.format('MM')).toBe(expectedDate.format('MM'));
      expect(firstDayOfCurrentWeek.format('YYYY')).toBe(expectedDate.format('YYYY'));
    });
  });

  describe('getLastDayOfCurrentWeek', function () {
    // This function is only partially tested.
    // It is tightly coupled to momentJs and cannot be tested without breaking this down

    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the start of the current week for Gregorian calendars', function () {
      setGregorian();

      var lastDayOfCurrentWeek = localizationService.getLastDayOfCurrentWeek();

      var expectedDate = moment.utc().endOf('week');

      expect(lastDayOfCurrentWeek.format('DD')).toBe(expectedDate.format('DD'));
      expect(lastDayOfCurrentWeek.format('MM')).toBe(expectedDate.format('MM'));
      expect(lastDayOfCurrentWeek.format('YYYY')).toBe(expectedDate.format('YYYY'));

    });

  });

  describe('getMonthDefinitions', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return null for Gregorian calendars', function () {
      setGregorian();

      var calendarDefinitions = localizationService.getMonthDefinitions(2017);

      expect(calendarDefinitions).toBe(null);
    });

    it('should return an array entry for each month in the year', function () {
      var calendarDefinitions = localizationService.getMonthDefinitions(moment.utc().year());

      expect(calendarDefinitions.length).toBe(13);
    });

    it('should return the correct array of week lengths for the year', function () {
      var calendarDefinitions = localizationService.getMonthDefinitions(moment.utc().year());

      // Start month of this calendar is Feb.
      expect(calendarDefinitions[1]).toBe(4); // March is first
      expect(calendarDefinitions[2]).toBe(4);
      expect(calendarDefinitions[3]).toBe(5);
      expect(calendarDefinitions[4]).toBe(4);
      expect(calendarDefinitions[5]).toBe(4);
      expect(calendarDefinitions[6]).toBe(5);
      expect(calendarDefinitions[7]).toBe(4);
      expect(calendarDefinitions[8]).toBe(4);
      expect(calendarDefinitions[9]).toBe(5);
      expect(calendarDefinitions[10]).toBe(4);
      expect(calendarDefinitions[11]).toBe(4);
      expect(calendarDefinitions[12]).toBe(5);
    });
  });

  describe('getWeekCountOfMonth', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return 0 for Gregorian calendars', function () {
      setGregorian();

      var calendarDefinitions = localizationService.getWeekCountOfMonth(2017, 1);

      expect(calendarDefinitions).toBe(0);
    });

    xit('should return the correct number of weeks for custom calendars', function () {

      // Having a different length of weeks for each month makes this easier to test
      allCalendars[0].years[1].month_mask = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
      ];

      localizationService.setAllCalendars(allCalendars);

      var mayMonthNumber = 4; // Zero indexed

      var calendarDefinitions = localizationService.getWeekCountOfMonth(moment().year(), mayMonthNumber);

      expect(calendarDefinitions).toBe(5);
    });
  });

  describe('getWeekNumber', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the ISO week number for Gregorian calendars', function () {
      setGregorian();

      var date = moment.utc().year().toString() + '-01-01';

      var weeks = [moment(date, 'YYYY-DD-MM').add(6, 'week')];

      var weekNumber = localizationService.getWeekNumber(weeks);

      expect(weekNumber).toBe(7);
    });

    it('should get the correct weeknumber for custom calendars', function () {
      var date = moment().year().toString() + '-01-01';

      var weeks = [moment(date, 'YYYY-DD-MM').add(6, 'week')];

      var weekNumber = localizationService.getWeekNumber(weeks);

      expect(weekNumber).toBe(6);
    });
  });

  describe('getCurrentMonth', function () {
    // This function cannot be unit tested fully because of a tight coupling with momentJS
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the raw calendar month number for Gregorian calendars', function () {
      setGregorian();

      var month = localizationService.getCurrentMonth();

      expect(month).toBe(moment.utc().format('M'));
    });
  });

  describe('getCurrentYear', function () {
    // This function cannot be unit tested fully because of a tight coupling with momentJS
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the current year number for Gregorian calendars', function () {
      setGregorian();

      var year = localizationService.getCurrentYear();
      var expectYear = Number(moment.utc().format('YYYY'));

      expect(year).toBe(expectYear);
    });
  });

  describe('getSystemYearForDate', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 2 } });
    });

    it('should return the raw year and month for Gregorian calendars', function () {
      allCalendars[1].years = [];

      var systemYear = localizationService.getSystemYearForDate(moment.utc());

      expect(systemYear.year).toBe(moment.utc().year());
      expect(systemYear.month).toBe(moment.utc().month() + 1);
    });

    it('should return the correct year and month at the start of the year', function () {
      // 2015 is our 'safe' hardcoded calendar that will not change in these tests
      var dateToTest = moment('11-02-2015', 'DD-MM-YYYY');

      var systemYear = localizationService.getSystemYearForDate(dateToTest);

      // This calendar starts in Feb, so this should be good
      expect(systemYear.year).toBe(2015);
      expect(systemYear.month).toBe(0);
    });

    it('should return the correct year and month at the end of the year', function () {
      // 2015 is our 'safe' hardcoded calendar that will not change in these tests
      var dateToTest = moment('05-02-2016', 'DD-MM-YYYY');

      var systemYear = localizationService.getSystemYearForDate(dateToTest);

      // This calendar starts in Feb, so this should be good
      expect(systemYear.year).toBe(2015);
      expect(systemYear.month).toBe(11);
    });
  });

  describe('getStartOfCurrentCalendar', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the correct start date for the current calendar', function () {
      var startOfCal = localizationService.getStartOfCurrentCalendar();

      var expectedDate = moment.utc(allCalendars[0].years[0].start_date);

      expect(startOfCal.format('YYYY')).toBe(expectedDate.format('YYYY'));
      expect(startOfCal.format('MM')).toBe(expectedDate.format('MM'));
      expect(startOfCal.format('DD')).toBe(expectedDate.format('DD'));
    });

    it('should return the 1st of Jan 1970 for Gregorian calendars', function () {
      setGregorian();

      var expectedDate = moment.utc('01-01-1970', 'DD-MM-YYYY');

      var startOfCal = localizationService.getStartOfCurrentCalendar();

      expect(startOfCal.format('YYYY')).toBe(expectedDate.format('YYYY'));
      expect(startOfCal.format('MM')).toBe(expectedDate.format('MM'));
      expect(startOfCal.format('DD')).toBe(expectedDate.format('DD'));
    });
  });

  describe('getEndOfCurrentCalendar', function () {
    beforeEach(function () {
      localizationService.setUser({ preferences: { calendar_id: 1 } });
    });

    it('should return the correct end date for the current calendar', function () {

      var expectedLastDayOfYear = getFirstSunday(2).add(51, 'week').add(6, 'day').endOf('day');

      var endOfCal = localizationService.getEndOfCurrentCalendar();

      expect(endOfCal.format('YYYY')).toBe(expectedLastDayOfYear.format('YYYY'));
      expect(endOfCal.format('MM')).toBe(expectedLastDayOfYear.format('MM'));
      expect(endOfCal.format('DD')).toBe(expectedLastDayOfYear.format('DD'));
    });

    it('should return the last day of the current year for Gregorian calendars', function () {
      setGregorian();

      var expectedDate = moment.utc().endOf('year');

      var endOfCal = localizationService.getEndOfCurrentCalendar();

      expect(endOfCal.format('YYYY')).toBe(expectedDate.format('YYYY'));
      expect(endOfCal.format('MM')).toBe(expectedDate.format('MM'));
      expect(endOfCal.format('DD')).toBe(expectedDate.format('DD'));
    });
  });

  describe('getLocalDateTimeFormatIgnoringUTC', function() {
    it('should be exposed on the service', function() {
      expect(typeof localizationService.getLocalDateTimeFormatIgnoringUTC).toBe('function');
    });

    it('should transform a UTC date into a local date without any timezone adjustment', function() {
      /* This test is needed because the API returns dates from some endpoints in UTC format.
         This is incorrect as all data relating to sales and traffic is actually stored in the local date time
         and is ignorant of timezones, nor is adjusted and stored in UTC.

         An example of an endpoint that does this is the power hours endpoint.

         If this test is broken, the power hours widget is probably displaying hours incorrectly.
      */

      var dateTimeFromTheAPI = '2017-10-20T11:00:00.000+00:00'; // Actual date string from the power hours endpoint

      var localDate = localizationService.getLocalDateTimeFormatIgnoringUTC(dateTimeFromTheAPI);

      var testFormat = 'YYYY-MM-DD HH:mm:ss';

      expect(localDate.format(testFormat)).toBe('2017-10-20 11:00:00');

      var localTimeUTCOffset = moment('2017-10-20 11:00:00', testFormat).utcOffset(); // This is local to where the test is being run

      expect(localDate.utcOffset()).toBe(localTimeUTCOffset);
    });


  });

  function setGregorian() {
    allCalendars[0].years = [];

    localizationService.setAllCalendars(allCalendars);
  }

  function getFirstSunday(month) {
    var startOfYear = moment.utc().startOf('year');

    return findSunday(startOfYear, month);
  }

  function getFirstSundayLastYear(month) {
    var startOfYear = moment.utc().add(-1, 'year').startOf('year');

    return findSunday(startOfYear, month);
  }

  function findSunday(startOfYear, month) {
    while (startOfYear.month() !== month && startOfYear.day() !== 0) {
      startOfYear.add(1, 'day');
    }

    return startOfYear;
  }

  function getFirstSaturday() {
    var startOfYear = moment.utc().startOf('year');

    while (startOfYear.day() !== 6) {
      startOfYear.add(1, 'day');
    }

    return startOfYear;
  }


});


