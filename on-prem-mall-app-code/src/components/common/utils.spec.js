'use strict';

describe('utils', function() {


  var utils;
  var scope;
  var LocalizationService;
  var organizationMock;
  var userMock;
  var calendarsMock;
  var customCalendars;

  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.utils'));
  beforeEach(inject(function(_utils_, $rootScope, _LocalizationService_) {
    utils = _utils_;
    scope = $rootScope.$new();
    LocalizationService = _LocalizationService_;

    calendarsMock = [ {
      'calendar_id': 1,
      'name': 'Foo Calendar',
      'years': null
    }];

    userMock = {
      preferences: {
        'calendar_id': 1
      }
    };

    organizationMock = {};

    LocalizationService.setAllCalendars(calendarsMock);
    LocalizationService.setUser(userMock);
    LocalizationService.setOrganization(organizationMock);

  }));

  describe('getDateRangeForLastMonthBeforeDate', function() {

    it('should return date range for the last calendar month before given date', function() {
      var startOfPreviousCalendarMonth = moment.utc('2014-05-01', 'YYYY-MM-DD');
      var endOfPreviousCalendarMonth = moment.utc('2014-05-01', 'YYYY-MM-DD').endOf('month');

      var dateRange = {
        start: moment.utc('2014-06-14', 'YYYY-MM-DD')
      };

      var returnedDateRange = utils.getDateRangeForLastMonthBeforeDate(dateRange);

      expect(returnedDateRange.start.isSame(startOfPreviousCalendarMonth)).toBe(true);
      expect(returnedDateRange.end.isSame(endOfPreviousCalendarMonth)).toBe(true);
    });

    describe('custom calendars', function() {
      beforeEach(function() {
        enableCustomCalendars();
      });

      it('should return the correct date range for the previous month when the supplied date is in month 0', function() {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(12, 2016);
        });
        var dateRange = {
          start: moment('25-12-2016', 'DD-MM-YYYY'),
          end: moment('22-01-2017', 'DD-MM-YYYY')
        };

        var returnedDateRange = utils.getDateRangeForLastMonthBeforeDate(dateRange, userMock, organizationMock);

        var startOfPreviousCalendarMonth = moment('2016-11-20', 'YYYY-MM-DD');
        var endOfPreviousCalendarMonth = moment('2016-12-18', 'YYYY-MM-DD');

        expect(returnedDateRange.start.format('DD')).toBe(startOfPreviousCalendarMonth.format('DD'));
        expect(returnedDateRange.start.format('MM')).toBe(startOfPreviousCalendarMonth.format('MM'));
        expect(returnedDateRange.start.format('YYYY')).toBe(startOfPreviousCalendarMonth.format('YYYY'));

        expect(returnedDateRange.end.format('DD')).toBe(endOfPreviousCalendarMonth.format('DD'));
        expect(returnedDateRange.end.format('MM')).toBe(endOfPreviousCalendarMonth.format('MM'));
        expect(returnedDateRange.end.format('YYYY')).toBe(endOfPreviousCalendarMonth.format('YYYY'));
      });

      it('should return the correct date range for the previous month when the supplied date is in month 11', function() {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(11, 2016);
        });
        var dateRange = {
          start: moment('20-11-2016', 'DD-MM-YYYY'),
          end: moment('24-12-2016', 'DD-MM-YYYY')
        };

        var returnedDateRange = utils.getDateRangeForLastMonthBeforeDate(dateRange, userMock, organizationMock);

        var startOfPreviousCalendarMonth = moment('2016-10-23', 'YYYY-MM-DD');
        var endOfPreviousCalendarMonth = moment('2016-11-26', 'YYYY-MM-DD');

        expect(returnedDateRange.start.format('DD')).toBe(startOfPreviousCalendarMonth.format('DD'));
        expect(returnedDateRange.start.format('MM')).toBe(startOfPreviousCalendarMonth.format('MM'));
        expect(returnedDateRange.start.format('YYYY')).toBe(startOfPreviousCalendarMonth.format('YYYY'));

        expect(returnedDateRange.end.format('DD')).toBe(endOfPreviousCalendarMonth.format('DD'));
        expect(returnedDateRange.end.format('MM')).toBe(endOfPreviousCalendarMonth.format('MM'));
        expect(returnedDateRange.end.format('YYYY')).toBe(endOfPreviousCalendarMonth.format('YYYY'));
      });

    });

  });



  describe('getDateRangeForLastCalendarYearBeforeDate', function() {

    it('should return date range for the last calendar year before given date', function() {
      var date = moment('2014-02-06');
      var startOfPreviousCalendarYear = moment('2013-01-01');
      var endOfPreviousCalendarYear = moment('2013-01-01').endOf('year');
      var returnedDateRange = utils.getDateRangeForLastCalendarYearBeforeDate(date);
      expect(returnedDateRange.start.isSame(startOfPreviousCalendarYear)).toBe(true);
      expect(returnedDateRange.end.isSame(endOfPreviousCalendarYear)).toBe(true);
    });

  });



  describe('dateRangeIsCalendarWeek', function() {

    it('should return true if date range is a calendar week', function() {
      var dateRange = {
        start: moment('2014-09-07'),
        end:   moment('2014-09-13').endOf('day')
      };
      expect(utils.dateRangeIsCalendarWeek(dateRange)).toBe(true);
    });

    it('should return false if date range is not a calendar week', function() {
      var dateRange = {
        start: moment('2014-09-07'),
        end:   moment('2014-09-15').endOf('day')
      };
      expect(utils.dateRangeIsCalendarWeek(dateRange)).toBe(false);
    });

    it('should return false if date range is multiple calendar weeks', function() {
      var dateRange = {
        // Three weeks
        start: moment('2014-09-07'),
        end:   moment('2014-09-27').endOf('day')
      };
      expect(utils.dateRangeIsCalendarWeek(dateRange)).toBe(false);
    });

  });



  describe('dateRangeIsMonth', function() {

    it('should return true if date range is a calendar month', function() {
      var dateRange = {
        start: moment('2014-02-01'),
        end:   moment('2014-02-01').endOf('month')
      };

      expect(utils.dateRangeIsMonth(dateRange, userMock, organizationMock)).toBe(true);
    });

    it('should return false if date range is not a calendar month', function() {
      // Arbitrary date range
      var dateRange = {
        start: moment('2014-02-15'),
        end:   moment('2014-03-28')
      };
      expect(utils.dateRangeIsMonth(dateRange, userMock, organizationMock)).toBe(false);
    });

  });



  describe('dateRangeIsCalendarYear', function() {

    it('should return true if date range is a regular calendar year (not leap yer)', function() {
      var dateRange = {
        start: moment('2014-01-01'),
        end:   moment('2014-01-01').endOf('year')
      };
      expect(utils.dateRangeIsCalendarYear(dateRange, userMock, organizationMock)).toBe(true);
    });

    it('should return true if date range is a leap year', function() {
      var dateRange = {
        start: moment('2012-01-01'),
        end:   moment('2012-01-01').endOf('year')
      };
      expect(utils.dateRangeIsCalendarYear(dateRange, userMock, organizationMock)).toBe(true);
    });

    it('should return false if date range is a arbitrary range of 365 days', function() {
      var dateRange = {
        start: moment('2014-01-01').add(5, 'days'),
        end:   moment('2014-01-01').endOf('year').add(5, 'days')
      };
      expect(utils.dateRangeIsCalendarYear(dateRange, userMock, organizationMock)).toBe(false);
    });

    it('should return false if date range is arbitrary', function() {
      // Arbitrary date range
      var dateRange = {
        start: moment('2013-02-15'),
        end:   moment('2013-09-28')
      };
      expect(utils.dateRangeIsMonth(dateRange, userMock, organizationMock)).toBe(false);
    });

  });



  describe('dateRangesAreTwoConsecutiveDays', function() {

    it('should return true if date ranges are two consecutive days', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveDays(
        moment(date),
        moment(date).add(1, 'day').subtract(1, 'millisecond'),
        moment(date).add(1, 'day'),
        moment(date).add(2, 'day').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if date ranges are not consecutive', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveDays(
        moment(date),
        moment(date).add(1, 'day').subtract(1, 'millisecond'),
        moment(date).add(2, 'day'),
        moment(date).add(3, 'day').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges overlap', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveDays(
        moment(date).add(1, 'hour'),
        moment(date).add(1, 'hour').add(1, 'day').subtract(1, 'millisecond'),
        moment(date).add(2, 'day'),
        moment(date).add(3, 'day').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

  });



  describe('dateRangesAreTwoConsecutiveWeeks', function() {

    it('should return true if date ranges are two consecutive weeks', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveWeeks(
        moment(date),
        moment(date).add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(1, 'week'),
        moment(date).add(2, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if date ranges are not consecutive', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveWeeks(
        moment(date),
        moment(date).add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(2, 'weeks'),
        moment(date).add(3, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges overlap', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveWeeks(
        moment(date).add(1, 'hour'),
        moment(date).add(1, 'hour').add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(1, 'week'),
        moment(date).add(2, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

  });



  describe('dateRangesAreTwoConsecutiveMonths', function() {

    it('should return true if date ranges are two consecutive months', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveMonths(
        moment(date),
        moment(date).add(1, 'month').subtract(1, 'millisecond'),
        moment(date).add(1, 'month'),
        moment(date).add(2, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if date ranges are not consecutive', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveMonths(
        moment(date),
        moment(date).add(1, 'month').subtract(1, 'millisecond'),
        moment(date).add(2, 'months'),
        moment(date).add(3, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges overlap', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveMonths(
        moment(date),
        moment(date).add(1, 'month').add(1, 'hour'),
        moment(date).add(2, 'months'),
        moment(date).add(3, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

  });



  describe('dateRangesAreTwoConsecutiveCalendarWeeks', function() {

    it('should return true if date ranges are two consecutive calendar weeks', function() {
      var date = moment('2012-02-05');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarWeeks(
        moment(date),
        moment(date).add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(1, 'week'),
        moment(date).add(2, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if date ranges are not consecutive', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarWeeks(
        moment(date),
        moment(date).add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(2, 'weeks'),
        moment(date).add(3, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges overlap', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarWeeks(
        moment(date).add(1, 'hour'),
        moment(date).add(1, 'hour').add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(1, 'week'),
        moment(date).add(2, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges are consecutive 7 day ranges, but not calendar weeks', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarWeeks(
        moment(date),
        moment(date).add(1, 'week').subtract(1, 'millisecond'),
        moment(date).add(1, 'week'),
        moment(date).add(2, 'weeks').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

  });



  describe('dateRangesAreTwoConsecutiveCalendarMonths', function() {

    it('should return true if date ranges are two consecutive months', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarMonths(
        moment(date),
        moment(date).add(1, 'month').subtract(1, 'millisecond'),
        moment(date).add(1, 'month'),
        moment(date).add(2, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(true);
    });

    it('should return false if date ranges are not consecutive', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarMonths(
        moment(date),
        moment(date).add(1, 'month').subtract(1, 'millisecond'),
        moment(date).add(2, 'months'),
        moment(date).add(3, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges overlap', function() {
      var date = moment('2012-02-01');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarMonths(
        moment(date),
        moment(date).add(1, 'month').add(1, 'hour'),
        moment(date).add(2, 'months'),
        moment(date).add(3, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

    it('should return false if date ranges are not calendar months', function() {
      var date = moment('2012-02-15');
      var returnValue = utils.dateRangesAreTwoConsecutiveCalendarMonths(
        moment(date),
        moment(date).add(1, 'month').subtract(1, 'millisecond'),
        moment(date).add(1, 'month'),
        moment(date).add(2, 'months').subtract(1, 'millisecond')
      );
      expect(returnValue).toBe(false);
    });

  });



  describe('getPreviousPeriodDateRange', function() {

    it('should return the preceding same length date range with an arbitrary date range', function() {
      var previousPeriod = utils.getPreviousPeriodDateRange({
        start: moment.utc('2014-02-01'),
        end:   moment.utc('2014-02-04').endOf('day'),
      }, userMock, organizationMock);
      expect(previousPeriod.start.isSame(moment.utc('2014-01-28'))).toBe(true);
      expect(previousPeriod.end.isSame(moment.utc('2014-01-31T23:59:59.999Z'))).toBe(true);
    });

    it('should return the preceding same length date range with a calendar week', function() {
      var previousPeriod = utils.getPreviousPeriodDateRange({
        start: moment.utc('2015-01-12'),
        end:   moment.utc('2015-01-18').endOf('day'),
      }, userMock, organizationMock);
      expect(previousPeriod.start.isSame(moment.utc('2015-01-05'))).toBe(true);
      expect(previousPeriod.end.isSame(moment.utc('2015-01-11T23:59:59.999Z'))).toBe(true);
    });

    it('should return the preceding calendar month length date range with a calendar month', function() {
      var previousPeriod = utils.getPreviousPeriodDateRange({
        start: moment.utc('2014-02-01'),
        end:   moment.utc('2014-02-28').endOf('day'),
      }, userMock, organizationMock);
      expect(previousPeriod.start.isSame(moment.utc('2014-01-04'))).toBe(true);
      expect(previousPeriod.end.isSame(moment.utc('2014-01-31T23:59:59.999Z'))).toBe(true);
    });
  });

  describe('getPreviousCalendarPeriodDateRange', function() {
    it('should return previous calendar month if given calendar month', function() {
      var previousPeriod = utils.getPreviousCalendarPeriodDateRange({
        start: moment.utc('2015-02-01'),
        end:   moment.utc('2015-02-28').endOf('day'),
      }, userMock, organizationMock);

      expect(previousPeriod.start.format('YYYY')).toBe('2015');
      expect(previousPeriod.start.format('MM')).toBe('01');
      expect(previousPeriod.start.format('DD')).toBe('01');

      expect(previousPeriod.end.format('YYYY')).toBe('2015');
      expect(previousPeriod.end.format('MM')).toBe('01');
      expect(previousPeriod.end.format('DD')).toBe('31');
    });

    it('should return previous year if given year', function() {
      // 2012 is leap year, so that's a good test
      var previousPeriod = utils.getPreviousCalendarPeriodDateRange({
        start: moment('2012-01-01'),
        end:   moment('2012-12-31').endOf('day'),
      }, userMock, organizationMock);
      expect(previousPeriod.start.isSame(moment('2011-01-01'))).toBe(true);
      expect(previousPeriod.end.isSame(moment('2011-12-31').endOf('day'))).toBe(true);
    });

    it('should return preceding period of same length with arbirary date ranges', function() {
      var previousPeriod = utils.getPreviousCalendarPeriodDateRange({
        start: moment.utc('2012-01-06'),
        end:   moment.utc('2012-01-10').endOf('day'),
      }, userMock, organizationMock);
      expect(previousPeriod.start.isSame(moment.utc('2012-01-01'))).toBe(true);
      expect(previousPeriod.end.isSame(moment.utc('2012-01-05T23:59:59.999Z'))).toBe(true);
    });

    describe('custom calendar', function() {
      beforeEach(function() {
        enableDynamicCustomCalendars();
      });

      xit('should return correct date range for previous week if date range is week to date', function() {
        spyOn(LocalizationService, 'getActiveCalendarSettings').and.callFake(function () {
          return getSystemYearForDate(12, 2016);
        });
        var startOfWeek = moment();

        if (startOfWeek.format('ddd') === 'Sun') {
          // Running this unit test on a sunday fails. This condition fixes it
          startOfWeek.add(-1, 'day');
        }

        // Find the most recent sunday
        while(startOfWeek.format('ddd') !== 'Sun') {
          startOfWeek.add(-1, 'day');
        }

        var dateRange = {
          start: startOfWeek,
          end: moment().add(-1, 'day')
        }

        var previousDateRange = utils.getPreviousCalendarPeriodDateRange(dateRange, userMock, organizationMock, 'wtd');

        var expectedDates = {
          start: dateRange.start.add(-1, 'week'),
          end: dateRange.end.add(-1, 'week')
        }

        var dateFormatForComparison = 'DD-MM-YYYY';
        expect(previousDateRange.start.format(dateFormatForComparison)).toBe(expectedDates.start.format(dateFormatForComparison));
        expect(previousDateRange.end.format(dateFormatForComparison)).toBe(expectedDates.end.format(dateFormatForComparison));
      });
    });
  });



  describe('getEquivalentPriorYearDateRange', function() {

    it('should return the equivalent day of the previous year if a single day is selected', function() {
      var dateRange = {
        start: moment('2012-02-15'),
        end:   moment('2012-02-15').endOf('day')
      };
      var priorYearDateRange = {
        start: moment('2011-02-16'),
        end:   moment('2011-02-16').endOf('day')
      };

      var returnedDateRange = utils.getEquivalentPriorYearDateRange(dateRange);
      expect(returnedDateRange.start.isSame(priorYearDateRange.start)).toBe(true);
      expect(returnedDateRange.end.isSame(priorYearDateRange.end)).toBe(true);
    });

    it('should return a calendar week 52 weeks prior if date range is calendar week', function() {
      var dateRange = {
        start: moment('2014-01-05'),
        end:   moment('2014-01-11').endOf('day')
      };
      var priorYearDateRange = {
        start: moment('2013-01-06'),
        end:   moment('2013-01-12').endOf('day')
      };
      var returnedDateRange = utils.getEquivalentPriorYearDateRange(dateRange);
      expect(returnedDateRange.start.isSame(priorYearDateRange.start)).toBe(true);
      expect(returnedDateRange.end.isSame(priorYearDateRange.end)).toBe(true);
    });

    it('should return calendar month for prior year if date range is calendar month', function() {
      var dateRange = {
        start: moment('2014-02-01'),
        end:   moment('2014-02-01').endOf('month')
      };
      var priorYearDateRange = {
        start: moment('2013-02-01'),
        end:   moment('2013-02-01').endOf('month')
      };

      var user = {
        preferences: {
          calendar_id: -1
        }
      };
      var returnedDateRange = utils.getEquivalentPriorYearDateRange(dateRange, 'Sunday', user);

      expect(returnedDateRange.start.isSame(priorYearDateRange.start)).toBe(true);
      expect(returnedDateRange.end.isSame(priorYearDateRange.end)).toBe(true);
    });

  });



  describe('dateRangeSpansOverTwoCalendarWeeks', function() {

    it('should return false if date range endpoints are within a single calendar week', function() {
      expect(utils.dateRangeSpansOverTwoCalendarWeeks(
        moment('2015-05-03'),
        moment('2015-05-09')
      )).toBe(false);
    });

    it('should return true if date range endpoints are not within a single calendar week', function() {
      // Sunday to monday
      expect(utils.dateRangeSpansOverTwoCalendarWeeks(
        moment('2015-05-03'),
        moment('2015-05-10')
      )).toBe(true);

      // 7 days, but over two calendar weeks
      expect(utils.dateRangeSpansOverTwoCalendarWeeks(
        moment('2015-05-02'),
        moment('2015-05-08')
      )).toBe(true);
    });

  });



  describe('dateRangeSpansOverTwoCalendarMonths', function() {

    it('should return false if date range endpoints are within a single calendar month', function() {
      expect(utils.dateRangeSpansOverTwoCalendarMonths(
        moment('2015-01-01'),
        moment('2015-01-31')
      )).toBe(false);
    });

    it('should return true if date range endpoints are not within a single calendar month', function() {
      expect(utils.dateRangeSpansOverTwoCalendarMonths(
        moment('2015-01-01'),
        moment('2015-02-01')
      )).toBe(true);

      // Date range length is less than one month,
      // but it spans over two calendar months
      expect(utils.dateRangeSpansOverTwoCalendarMonths(
        moment('2015-31-01'),
        moment('2015-02-01')
      )).toBe(true);

      // Same month, but different year
      expect(utils.dateRangeSpansOverTwoCalendarMonths(
        moment('2015-02-01'),
        moment('2016-02-01')
      )).toBe(true);
    });

  });

  describe('getUrlFromTemplate', function() {

    it('should replace placeholder strings in url template with param values', function() {

      var urlTemplate;
      var url;

      // One param
      urlTemplate = 'http://www.test.com/collection/:param1';
      url = utils.getUrlFromTemplate({ param1: '1234' }, urlTemplate);
      expect(url).toBe('http://www.test.com/collection/1234');

      // Two params
      urlTemplate = 'http://www.test.com/collection/:param1/items/:param2';
      url = utils.getUrlFromTemplate({ param1: '1234', param2: '5678' }, urlTemplate);
      expect(url).toBe('http://www.test.com/collection/1234/items/5678');

    });

    it('should strip all trailing slashes', function() {

      var urlTemplate;
      var url;

      // One slash
      urlTemplate = 'http://www.test.com/collection/:param1/';
      url = utils.getUrlFromTemplate({ param1: '1234' }, urlTemplate);
      expect(url).toBe('http://www.test.com/collection/1234');

      // Two slashes
      urlTemplate = 'http://www.test.com/collection/:param1//';
      url = utils.getUrlFromTemplate({ param1: '1234' }, urlTemplate);
      expect(url).toBe('http://www.test.com/collection/1234');

    });

    it('should remove placeholder string from url template that have no matching param', function() {

      var urlTemplate;
      var url;

      // One param
      urlTemplate = 'http://www.test.com/collection/:param1';
      url = utils.getUrlFromTemplate({}, urlTemplate);
      expect(url).toBe('http://www.test.com/collection');

      // Two params
      urlTemplate = 'http://www.test.com/collection/:param1/items/:param2';
      url = utils.getUrlFromTemplate({ param2: '5678' }, urlTemplate);
      expect(url).toBe('http://www.test.com/collection//items/5678');

    });

  });



  describe('startsWith', function() {

    it('should return true if string starts with the comparison string', function() {
      expect(utils.startsWith('testing this thing', 'test')).toBe(true);
      expect(utils.startsWith('another test', 'another')).toBe(true);
    });

    it('should return false if string starts with the comparison string', function() {
      expect(utils.startsWith('testing this thing', 'foo')).toBe(false);
      expect(utils.startsWith('another test', 'bar')).toBe(false);
    });

    it('should return true if both strings are the same', function() {
      expect(utils.startsWith('test', 'test')).toBe(true);
      expect(utils.startsWith('foobar', 'foobar')).toBe(true);
      expect(utils.startsWith(' ', ' ')).toBe(true);
      expect(utils.startsWith('', '')).toBe(true);
    });

    it('should return true if comparison string is empty', function() {
      expect(utils.startsWith('test', '')).toBe(true);
      expect(utils.startsWith('foobar', '')).toBe(true);
    });

  });



  describe('isExisty', function() {

    it('should return false if value is undefined', function() {
      expect(utils.isExisty(undefined)).toBe(false);
    });

    it('should return false if value is null', function() {
      expect(utils.isExisty(undefined)).toBe(false);
    });

    it('should return true if value is non-null and not undefined', function() {
      expect(utils.isExisty(0)).toBe(true);
      expect(utils.isExisty(123)).toBe(true);
      expect(utils.isExisty('foobar')).toBe(true);
      expect(utils.isExisty('')).toBe(true);
      expect(utils.isExisty({ foo: 'bar' })).toBe(true);
      expect(utils.isExisty([])).toBe(true);
    });

  });



  describe('hasExistyElements', function() {

    it('should return true if array has one or more existy values', function() {
      expect(utils.hasExistyElements([0, 1, 'foo'])).toBe(true);
      expect(utils.hasExistyElements([null, 1, 'foo'])).toBe(true);
      expect(utils.hasExistyElements([undefined, 1, 'foo'])).toBe(true);
      expect(utils.hasExistyElements([null, undefined, 'foo'])).toBe(true);
    });

    it('should return false if array has only null values', function() {
      expect(utils.hasExistyElements([null, null, null])).toBe(false);
    });

    it('should return false if array has only undefined values', function() {
      expect(utils.hasExistyElements([undefined, undefined, undefined])).toBe(false);
    });

  });

  describe('getFirstMonthInQuarter', function() {
    it('should return month 0 for quarter 1', function() {
      var firstMonthInQuarter = utils.getFirstMonthInQuarter(1);

      expect(firstMonthInQuarter).toBe(0); // Jan
    });

    it('should return month 3 for quarter 2', function() {
      var firstMonthInQuarter = utils.getFirstMonthInQuarter(2);

      expect(firstMonthInQuarter).toBe(3); // April
    });

    it('should return month 6 for quarter 3', function() {
      var firstMonthInQuarter = utils.getFirstMonthInQuarter(3);

      expect(firstMonthInQuarter).toBe(6); // July
    });

    it('should return month 9 for quarter 3', function() {
      var firstMonthInQuarter = utils.getFirstMonthInQuarter(4);

      expect(firstMonthInQuarter).toBe(9); // October
    });
  });

  describe('getDaysBetweenDates', function() {
    it('should throw an exception if the supplied startDate is not a valid momentJS object', function() {
      var expectedError = new Error('startDate must be a valid momentJs object');

      var functionUnderTest = function () {
        utils.getDaysBetweenDates();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an exception if the supplied endDate is not a valid momentJS object', function() {
      var expectedError = new Error('endDate must be a valid momentJs object');

      var functionUnderTest = function () {
        utils.getDaysBetweenDates(moment(), null);
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should return 7 for a date range covering a week', function() {
      var startDate = moment('12-06-2017', 'DD-MM-YYYY');
      var endDate = moment('18-06-2017', 'DD-MM-YYYY');

      var daysDiff = utils.getDaysBetweenDates(startDate, endDate);

      expect(daysDiff).toBe(7);
    });
  });

  describe('getDateStringForRequest', function() {
    it('should throw an exception if the supplied date is not a valid momentJS object', function() {
      var expectedError = new Error('The provided date is not a momentJS date');

      var functionUnderTest = function () {
        utils.getDateStringForRequest();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should return a string that repesents the supplied date in the format YYYY-MM-DDTHH:mm:ss.SSSZ', function() {
      var date = moment('01-02-2017 12:30:00', 'DD-MM-YYYY HH:mm:ss');

      var dateString = utils.getDateStringForRequest(date);

      expect(dateString).toBe('2017-02-01T12:30:00.000Z');
    });
  });

  function enableCustomCalendars() {
    customCalendars = [{
      'calendar_id': 1,
      'name': 'Foo Calendar',
      'years': [
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
      ]
    }];

    LocalizationService.setAllCalendars(customCalendars);
  }

  // These calendars will auto generate as the year moves on
  function enableDynamicCustomCalendars() {
    var allCalendars = [
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
            'start_date': getFirstSundayLastYear(1).toISOString(),
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
            'start_date': getFirstSunday(1).toISOString(),
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
      }
    ];

    LocalizationService.setAllCalendars(allCalendars);
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

  function getSystemYearForDate(number, year) {
    return {
      month: number,
      year: year? year:2017
    }
  }
});
