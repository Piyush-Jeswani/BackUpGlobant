'use strict';

describe('dateRangeService', function () {

  var dateRangeService;
  var LocalizationService;
  var userMock;
  var calendarsMock;
  var organizationMock;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function (_dateRangeService_, _LocalizationService_) {
    dateRangeService = _dateRangeService_;
    LocalizationService = _LocalizationService_;

    calendarsMock = [{
      '_id': '56fc5f721a76b5921e3df217',
      'calendar_id': 1,
      'name': 'NRF Calendar',
      '__v': 100,
      'organization_ids': [
        5798,
        6177,
        5947,
        5210,
        8695,
        5198,
        8882,
        1224,
        6240,
        6751,
        5349,
        8699,
        5178,
        6339
      ],
      'years': [
        {
          'year': 2001,
          'start_date': '2001-02-04T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2002,
          'start_date': '2002-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2003,
          'start_date':
          '2003-02-02T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2004,
          'start_date': '2004-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2005,
          'start_date': '2005-01-30T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        }, {
          'year': 2006,
          'start_date': '2006-01-29T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
        },
        {
          'year': 2007,
          'start_date': '2007-02-04T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2008,
          'start_date': '2008-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2009,
          'start_date': '2009-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2010,
          'start_date': '2010-01-31T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2011,
          'start_date': '2011-01-30T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2012,
          'start_date': '2012-01-29T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
        },
        {
          'year': 2013,
          'start_date': '2013-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2014,
          'start_date': '2014-02-02T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2015,
          'start_date': '2015-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2016,
          'start_date': '2016-01-31T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        }
      ],
      'global': true
    }]; 

    userMock = {
      preferences: {
        calendar_id: 1,
        custom_period_1: {
          period_type: 'prior_period'
        },
        custom_period_2: {
          period_type: 'prior_year'
        }
      }
    };

    organizationMock = {};

    LocalizationService.setAllCalendars(calendarsMock);
    LocalizationService.setUser(userMock);
    LocalizationService.setOrganization(organizationMock);
  }));

  describe('getDay()', function () {

    var dayObj;
    var locale;
    var testDayObj;

    beforeEach(function () {
      dayObj = dateRangeService.getDay();
      locale = moment.locale();
      testDayObj = {
        start: moment().subtract(1, 'day').startOf('day').add('minutes', locale),
        end: moment().subtract(1, 'day').endOf('day').add('minutes', locale)
      }
    });

    it('should be an object', function () {
      expect(dayObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the day', function () {
      expect(dayObj.start).not.toBe(undefined);
      expect(dayObj.end).not.toBe(undefined);
    });

    it('should calculate day as yesterday', function () {
      var yesterday = moment().subtract(1, 'day').format('DD/MM/YYYY');
      var dayObjStartDate = dayObj.start.format('DD/MM/YYYY');
      var dayObjEndDate = dayObj.end.format('DD/MM/YYYY');
      expect(dayObjStartDate).toEqual(yesterday);
      expect(dayObjEndDate).toEqual(yesterday);
    });

    it('should calculate create an object equal to our test object', function () {
      expect(dayObj).toEqual(testDayObj);
    });

    it('should have a difference of 24 hours between the start and end dates', function () {
      var hourDiff = Math.ceil(dayObj.end.diff(dayObj.start, 'hours', true));

      // It should be 24 hours, but daylight savings can cause us some problems
      var expectedHourDiff = 24;

      if(dayObj.end.isDST()) {
        expectedHourDiff = 23;
      }

      expect(hourDiff).toBeGreaterThanOrEqual(expectedHourDiff);
      expect(hourDiff).toBeLessThanOrEqual(25);
    });

  });

  describe('getWeek()', function () {

    var weekObj;
    var locale;
    var testweekObj;
    var firstDay;
    var lastDay;

    beforeEach(function () {
      spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
      spyOn(LocalizationService, 'getLastDayOfCurrentWeek').and.callFake(getLastDayOfCurrentWeek);
      weekObj = dateRangeService.getWeek();
      locale = moment.locale();
      firstDay = LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week');
      lastDay = LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week');

      testweekObj = {
        start: moment(firstDay).startOf('day').add('minutes', locale),
        end: moment(lastDay).endOf('day').add('minutes', locale),
      };
    });

    it('should be an object', function () {
      expect(weekObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the week', function () {
      expect(weekObj.start).not.toBe(undefined);
      expect(weekObj.end).not.toBe(undefined);
    });

    it('should calculate week as last week', function () {
      var weekObjStartDate = weekObj.start.format('DD/MM/YYYY');
      var weekObjEndDate = weekObj.end.format('DD/MM/YYYY');
      expect(weekObjStartDate).toEqual('04/09/2017');
      expect(weekObjEndDate).toEqual('10/09/2017');
    });

    it('should calculate create an object equal to our test object', function () {
      expect(weekObj).toEqual(testweekObj);
    });

    it('should have a difference of 7 days between the start and end dates', function () {
      var dayDiff = Math.ceil(weekObj.end.diff(weekObj.start, 'days', true));
      expect(dayDiff).toBe(7);
    });

  });

  describe('getMonth()', function () {
    var monthObj;

    beforeEach(function () {
      monthObj = dateRangeService.getMonth(organizationMock, userMock);
    });

    it('should be an object', function () {
      expect(monthObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the month', function () {
      expect(monthObj.start).not.toBe(undefined);
      expect(monthObj.end).not.toBe(undefined);
    });

    describe('current month number > 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(9);
        });
        monthObj = dateRangeService.getMonth(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var monthObjStartDate = monthObj.start.format('DD/MM/YYYY');
        var monthObjEndDate = monthObj.end.format('DD/MM/YYYY');
        expect(monthObjStartDate).toEqual('01/08/2017');
        expect(monthObjEndDate).toEqual('31/08/2017');
      });
    });

    describe('current month number = 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(1);
        });
        monthObj = dateRangeService.getMonth(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var monthObjStartDate = monthObj.start.format('DD/MM/YYYY');
        var monthObjEndDate = monthObj.end.format('DD/MM/YYYY');
        expect(monthObjStartDate).toEqual('01/12/2016');
        expect(monthObjEndDate).toEqual('31/12/2016');
      });
    });
  });

  describe('getQuarter()', function () {
    var quarterObj;

    beforeEach(function () {
      quarterObj = dateRangeService.getQuarter();
    });

    it('should be an object', function () {
      expect(quarterObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the quarter', function () {
      expect(quarterObj.start).not.toBe(undefined);
      expect(quarterObj.end).not.toBe(undefined);
    });

    describe('current quarter > 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });

        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);

        quarterObj = dateRangeService.getQuarter();
      });

      it('should calculate week as last month', function () {
        var quarterObjStartDate = quarterObj.start.format('DD/MM/YYYY');
        var quarterObjEndDate = quarterObj.end.format('DD/MM/YYYY');
        expect(quarterObjStartDate).toEqual('01/04/2017');
        expect(quarterObjEndDate).toEqual('30/06/2017');
      });
    });

    describe('current quarter < 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(2);
        });

        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
        quarterObj = dateRangeService.getQuarter();
      });

      it('should calculate week as last month', function () {
        var quarterObjStartDate = quarterObj.start.format('DD/MM/YYYY');
        var quarterObjEndDate = quarterObj.end.format('DD/MM/YYYY');
        expect(quarterObjStartDate).toEqual('01/10/2016');
        expect(quarterObjEndDate).toEqual('31/12/2016');
      });
    });
  });

  describe('getYear()', function () {
    var yearObj;

    beforeEach(function () {
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      yearObj = dateRangeService.getYear(organizationMock, userMock);
    });

    it('should be an object', function () {
      expect(yearObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the year', function () {
      expect(yearObj.start).not.toBe(undefined);
      expect(yearObj.end).not.toBe(undefined);
    });

    it('should calculate week as last month', function () {
      var yearObjStartDate = yearObj.start.format('DD/MM/YYYY');
      var yearObjEndDate = yearObj.end.format('DD/MM/YYYY');
      expect(yearObjStartDate).toEqual('01/01/2016');
      expect(yearObjEndDate).toEqual('31/12/2016');
    });
  });

  describe('getWeekToDate()', function () {
    var weekObj;

    beforeEach(function () {
      weekObj = dateRangeService.getWeekToDate();
    });

    it('should be an object', function () {
      expect(weekObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the week', function () {
      expect(weekObj.start).not.toBe(undefined);
      expect(weekObj.end).not.toBe(undefined);
    });

    describe('date range >= 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('13/09/2017');
        });
        spyOn(LocalizationService, 'getLastDayOfCurrentWeek').and.callFake(getLastDayOfCurrentWeek);
        weekObj = dateRangeService.getWeekToDate();
      });

      it('should calculate range from the beginning of the week to the end yesterday', function () {
        var weekObjStartDate = weekObj.start.format('DD/MM/YYYY');
        var weekObjEndDate = weekObj.end.format('DD/MM/YYYY');
        expect(weekObjStartDate).toEqual('11/09/2017');
        expect(weekObjEndDate).toEqual('13/09/2017');
      });
    });

    describe('date range < 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
        spyOn(LocalizationService, 'getYesterday').and.callFake(getFirstDayOfCurrentWeek);
        spyOn(LocalizationService, 'getLastDayOfCurrentWeek').and.callFake(getLastDayOfCurrentWeek);
        weekObj = dateRangeService.getWeekToDate();
      });

      it('should calculate range from the beginning of the week to the end yesterday', function () {
        var weekObjStartDate = weekObj.start.format('DD/MM/YYYY');
        var weekObjEndDate = weekObj.end.format('DD/MM/YYYY');
        expect(weekObjStartDate).toEqual('11/09/2017');
        expect(weekObjEndDate).toEqual('11/09/2017');
      });
    });
  });

  describe('getMonthToDate()', function () {
    var monthObj;

    beforeEach(function () {
      monthObj = dateRangeService.getMonthToDate(organizationMock, userMock);
    });

    it('should be an object', function () {
      expect(monthObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the month', function () {
      expect(monthObj.start).not.toBe(undefined);
      expect(monthObj.end).not.toBe(undefined);
    });

    describe('date range is <= 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });
        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('20/08/2017');
        });
        monthObj = dateRangeService.getMonthToDate(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var monthObjStartDate = monthObj.start.format('DD/MM/YYYY');
        var monthObjEndDate = monthObj.end.format('DD/MM/YYYY');
        expect(monthObjStartDate).toEqual('01/08/2017');
        expect(monthObjEndDate).toEqual('20/08/2017');
      });
    });

    describe('date range is < 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });
        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('01/08/2017');
        });
        monthObj = dateRangeService.getMonthToDate(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var monthObjStartDate = monthObj.start.format('DD/MM/YYYY');
        var monthObjEndDate = monthObj.end.format('DD/MM/YYYY');
        expect(monthObjStartDate).toEqual('01/08/2017');
        expect(monthObjEndDate).toEqual('01/08/2017');
      });
    });
  });

  describe('getQuarterToDate()', function () {
    var quarterObj;

    beforeEach(function () {
      quarterObj = dateRangeService.getQuarterToDate();
    });

    it('should be an object', function () {
      expect(quarterObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the quarter', function () {
      expect(quarterObj.start).not.toBe(undefined);
      expect(quarterObj.end).not.toBe(undefined);
    });

    describe('date range >= 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });
        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('20/08/2017');
        });
        quarterObj = dateRangeService.getQuarterToDate();
      });

      it('should calculate week as last month', function () {
        var quarterObjStartDate = quarterObj.start.format('DD/MM/YYYY');
        var quarterObjEndDate = quarterObj.end.format('DD/MM/YYYY');
        expect(quarterObjStartDate).toEqual('01/07/2017');
        expect(quarterObjEndDate).toEqual('20/08/2017');
      });
    });

    describe('date range < 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(7);
        });
        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('01/07/2017');
        });
        quarterObj = dateRangeService.getQuarterToDate();
      });

      it('should calculate week as last month', function () {
        var quarterObjStartDate = quarterObj.start.format('DD/MM/YYYY');
        var quarterObjEndDate = quarterObj.end.format('DD/MM/YYYY');
        expect(quarterObjStartDate).toEqual('01/07/2017');
        expect(quarterObjEndDate).toEqual('01/07/2017');
      });
    });

  });

  describe('getYearToDate()', function () {
    var yearObj;

    beforeEach(function () {
      yearObj = dateRangeService.getYearToDate(organizationMock, userMock);
    });

    it('should be an object', function () {
      expect(yearObj).toEqual(jasmine.any(Object));
    });

    it('should calculate a start and end to the quarter', function () {
      expect(yearObj.start).not.toBe(undefined);
      expect(yearObj.end).not.toBe(undefined);
    });

    describe('date range >= 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });
        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);

        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('20/08/2017');
        });

        yearObj = dateRangeService.getYearToDate(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var yearObjStartDate = yearObj.start.format('DD/MM/YYYY');
        var yearObjEndDate = yearObj.end.format('DD/MM/YYYY');
        expect(yearObjStartDate).toEqual('01/01/2017');
        expect(yearObjEndDate).toEqual('20/08/2017');
      });
    });

    describe('date range < 1', function () {
      beforeEach(function () {
        spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
          return getSystemYearForDate(8);
        });
        spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);

        spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
          return getMomentOf('01/01/2017');
        });
        yearObj = dateRangeService.getYearToDate(organizationMock, userMock);
      });

      it('should calculate week as last month', function () {
        var yearObjStartDate = yearObj.start.format('DD/MM/YYYY');
        var yearObjEndDate = yearObj.end.format('DD/MM/YYYY');
        expect(yearObjStartDate).toEqual('01/01/2017');
        expect(yearObjEndDate).toEqual('01/01/2017');
      });
    });
  });

  describe('getSelectedAndCompareRanges() priorPeriod / priorYear', function () {

    it('getDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('24/09/2017');
      });
      spyOn(dateRangeService, 'getDay').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('day', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('17/09/2017'); // This is now the same day last week, not yesterday
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('17/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('25/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('25/09/2016');
      expect(dateRangeService.getDay).toHaveBeenCalled();
    });

    it('getWeek() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(8);
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);

      spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
      spyOn(LocalizationService, 'getLastDayOfCurrentWeek').and.callFake(getLastDayOfCurrentWeek);
      spyOn(dateRangeService, 'getWeek').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('week', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('28/08/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('03/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('05/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('11/09/2016');
      expect(dateRangeService.getWeek).toHaveBeenCalled();
    });

    it('getQuarter() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(7);
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);

      spyOn(LocalizationService, 'getCurrentMonth').and.callFake(function () {
        return getFakeCurrentMonth('7');
      });
      spyOn(dateRangeService, 'getQuarter').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('quarter', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/01/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('31/03/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/04/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('30/06/2016');
      expect(dateRangeService.getQuarter).toHaveBeenCalled();
    });

    it('getMonth() returns a correct date range', function () {
      spyOn(dateRangeService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(9);
      });

      spyOn(dateRangeService, 'getMonth').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('month', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/07/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('31/07/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/08/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('31/08/2016');
      expect(dateRangeService.getMonth).toHaveBeenCalled();
    });

    it('getYear() returns a correct date range', function () {
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(dateRangeService, 'getYear').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('year', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/01/2015');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('31/12/2015');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/01/2014');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('31/12/2014');
      expect(dateRangeService.getYear).toHaveBeenCalled();
    });

    it('getWeekToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('13/09/2017');
      });
      spyOn(dateRangeService, 'getWeekToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('wtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('04/09/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('06/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('12/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('14/09/2016');
      expect(dateRangeService.getWeekToDate).toHaveBeenCalled();
    });

    it('getQuarterToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(8);
      });

      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(dateRangeService, 'getQuarterToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('qtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/04/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('21/05/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/07/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2016');
      expect(dateRangeService.getQuarterToDate).toHaveBeenCalled();
    });

    it('getMonthToDate() returns a correct date range', function () {
      spyOn(dateRangeService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(8); // For Gregorian calendars - this is not zero indexed
      });
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(dateRangeService, 'getMonthToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('mtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/07/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('20/07/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/08/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2016');
      expect(dateRangeService.getMonthToDate).toHaveBeenCalled();
    });

    it('getYearToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(7);
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(dateRangeService, 'getYearToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('ytd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/01/2016');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('19/08/2016');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/01/2015');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2015');
      expect(dateRangeService.getYearToDate).toHaveBeenCalled();
    });

  });

  describe('getSelectedAndCompareRanges() custom / priorYear', function () {
    beforeEach(function () {
      userMock.preferences.custom_period_1 = {
        period_type: 'custom',
        num_weeks: 2
      };
    });

    it('getDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('24/09/2017');
      });
      spyOn(dateRangeService, 'getDay').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('day', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('17/09/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('17/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('25/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('25/09/2016');
      expect(dateRangeService.getDay).toHaveBeenCalled();
    });

    it('getWeek() returns a correct date range', function () {
      spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
      spyOn(LocalizationService, 'getLastDayOfCurrentWeek').and.callFake(getLastDayOfCurrentWeek);
      spyOn(dateRangeService, 'getWeek').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('week', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('28/08/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('03/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('05/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('11/09/2016');
      expect(dateRangeService.getWeek).toHaveBeenCalled();
    });

    it('getQuarter() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(10);
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(LocalizationService, 'getCurrentMonth').and.callFake(function () {
        return getFakeCurrentMonth('9');
      });
      spyOn(dateRangeService, 'getQuarter').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('quarter', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('17/06/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('16/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/07/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('30/09/2016');
      expect(dateRangeService.getQuarter).toHaveBeenCalled();
    });

    it('getMonth() returns a correct date range', function () {
      spyOn(dateRangeService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(9);
      });
      spyOn(dateRangeService, 'getMonth').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('month', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/07/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('31/07/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/08/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('31/08/2016');
      expect(dateRangeService.getMonth).toHaveBeenCalled();
    });

    it('getYear() returns a correct date range', function () {
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(dateRangeService, 'getYear').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('year', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/01/2015');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('31/12/2015');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/01/2014');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('31/12/2014');
      expect(dateRangeService.getYear).toHaveBeenCalled();
    });

    it('getWeekToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getFirstDayOfCurrentWeek').and.callFake(getFirstDayOfCurrentWeek);
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('13/09/2017');
      });
      spyOn(dateRangeService, 'getWeekToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('wtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('04/09/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('06/09/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('12/09/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('14/09/2016');
      expect(dateRangeService.getWeekToDate).toHaveBeenCalled();
    });

    it('getQuarterToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(8);
      });
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(dateRangeService, 'getQuarterToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('qtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/04/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('21/05/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/07/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2016');
      expect(dateRangeService.getQuarterToDate).toHaveBeenCalled();
    });

    it('getMonthToDate() returns a correct date range', function () {
      spyOn(dateRangeService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(8);
      });
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(dateRangeService, 'getMonthToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('mtd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/07/2017');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('20/07/2017');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/08/2016');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2016');
      expect(dateRangeService.getMonthToDate).toHaveBeenCalled();
    });

    it('getYearToDate() returns a correct date range', function () {
      spyOn(LocalizationService, 'getSystemYearForDate').and.callFake(function () {
        return getSystemYearForDate(10);
      });
      spyOn(LocalizationService, 'getCurrentYear').and.callFake(getCurrentYear);
      spyOn(LocalizationService, 'getYesterday').and.callFake(function () {
        return getMomentOf('20/08/2017');
      });
      spyOn(dateRangeService, 'getYearToDate').and.callThrough();
      var dateRange = dateRangeService.getSelectedAndCompareRanges('ytd', userMock, organizationMock);

      expect(dateRange).toEqual(jasmine.any(Object));
      expect(dateRange.comparePeriod1.start.format('DD/MM/YYYY')).toEqual('01/01/2016');
      expect(dateRange.comparePeriod1.end.format('DD/MM/YYYY')).toEqual('19/08/2016');
      expect(dateRange.comparePeriod2.start.format('DD/MM/YYYY')).toEqual('01/01/2015');
      expect(dateRange.comparePeriod2.end.format('DD/MM/YYYY')).toEqual('20/08/2015');
      expect(dateRangeService.getYearToDate).toHaveBeenCalled();
    });

  });

  function getFirstDayOfCurrentWeek() {
    return moment('11/09/2017', 'DD/MM/YYYY');
  }

  function getLastDayOfCurrentWeek() {
    return moment('17/09/2017', 'DD/MM/YYYY');
  }

  function getSystemYearForDate(number) {
    return {
      month: number,
      year: 2017
    }
  }
  function getCurrentYear(number) {
    return 2017;
  }

  function getFakeCurrentMonth(month) {
    return month;
  }

  function getMomentOf(dateString) {
    return moment(dateString, 'DD/MM/YYYY');
  }

  describe('getLatestAndEarliestDates', function(){
    it('get last year of the current selected calendar', function(){
      let yearEndObj = dateRangeService.getCurrentCalendarLatestDate();
      let yearEnd = yearEndObj.year();
      
      expect(yearEnd).toBe(2017);
    }); 

    it('get starting year of the current selected calendar', function(){
      let year_start = dateRangeService.getCurrentCalendarEarliestDate();
      let start_of_year = year_start.year();
      
      expect(start_of_year).toBe(2001);
    });

  });
});
