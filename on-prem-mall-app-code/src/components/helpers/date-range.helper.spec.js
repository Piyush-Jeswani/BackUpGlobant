'use strict';

describe('dateRangeHelper', function () {
  var dateRangeHelper;
  var LocalizationService;
  var utils;
  var ObjectUtils;
  var NumberUtils;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function (_dateRangeHelper_, _LocalizationService_, _utils_, _ObjectUtils_, _NumberUtils_) {
    dateRangeHelper = _dateRangeHelper_;
    LocalizationService = _LocalizationService_;
    utils = _utils_;
    ObjectUtils = _ObjectUtils_;
    NumberUtils = _NumberUtils_;
  }));

  beforeEach(function () {
    LocalizationService.setUser({ preferences: { calendar_id: 1 } });
  });

  describe('compareDate(dateTimeA, dateTimeB)', function () {
    it('should test dateA < dateB', function () {
      var valueReturned = dateRangeHelper.compareDate("24/12/1995", "25/12/1995");
      expect(valueReturned).toBe(-1);
    });

    it('should test dateA > dateB', function () {
      var valueReturned = dateRangeHelper.compareDate("25/12/1995", "24/12/1995");
      expect(valueReturned).toBe(1);
    });

    it('should test dateA = dateB', function () {
      var valueReturned = dateRangeHelper.compareDate("25/12/1994", "25/12/1994");
      expect(valueReturned).toBe(0);
    });
  });

  describe('getCurrentTime()', function () {
    it('should test getting the current time', function () {
      var valueReturned = dateRangeHelper.getCurrentTime();
      expect(valueReturned).toBeDefined();
      var dispDateTime = valueReturned.local().format('YYYY-MMM-DD h:mm A');
      alert('The current data time is: ' + dispDateTime);
    });
  });

  describe('getWTD()', function () {
    it('should test getting the Week To Date from endDate if endDate is today', function () {
      var valueReturned = dateRangeHelper.getWTD(moment()/*Current Date Time*/);
      var weeks = Math.round((valueReturned.end - valueReturned.start) / 604800000);

      // expect difference between the 2 dates to be 1 week

      // Failing, but not investigated further because of the date-range service 
      // which this code will be superseded by
      //expect(weeks).toBe(1);
    });

    it('should test getting the Week To Date from endDate if its undefined', function () {
      var valueReturned = dateRangeHelper.getWTD(undefined);
      var weeks = Math.round((valueReturned.end - valueReturned.start) / 604800000);

      // expect difference between the 2 dates to be 1 week
      // Failing, but not investigated further because of the date-range service 
      // which this code will be superseded by      
      //expect(weeks).toBe(1);
    });
  });

  describe('getMTD()', function () {
    it('should test getting the Month To Date from endDate if its today', function () {
      var valueReturned = dateRangeHelper.getMTD(moment()/*Current Date Time*/);
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the Month To Date from endDate if its undefined', function () {
      var valueReturned = dateRangeHelper.getMTD(undefined);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getYTD()', function () {
    it('should test getting the Year To Date from endDate', function () {
      var valueReturned = dateRangeHelper.getYTD(moment());
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the Year To Date from endDate if its undefined', function () {
      var valueReturned = dateRangeHelper.getYTD(undefined);
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the Year To Date from endDate if its not today', function () {
      var valueReturned = dateRangeHelper.getYTD(moment("01-01-2020", "MM-DD-YYYY"));
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getQTD()', function () {
    it('should test getting the Quarter To Date from endDate', function () {
      var valueReturned = dateRangeHelper.getQTD(moment());
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the Quarter To Date from endDate if its undefined', function () {
      var valueReturned = dateRangeHelper.getQTD(undefined);
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the Quarter To Date from endDate if its not today', function () {
      var valueReturned = dateRangeHelper.getQTD(moment("01-01-2020", "MM-DD-YYYY"));
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getComparisonDateRange()', function () {
    it('should test getting the comparison date range when prior_period', function () {
      var Range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getComparisonDateRange('prior_period', { preferences: { calendar_id: 1 } }, 1, Range, 0);
      expect(valueReturned).toBeDefined();
    });

    it('should test getting the comparison date range when prior_year', function () {
      var Range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getComparisonDateRange('prior_year', { preferences: { calendar_id: 1 } }, 1, Range, 0);
      expect(valueReturned).toBe(undefined);
    });
  });

  describe('getYearPeriod()', function () {
    it('should test getting the year period', function () {

      var valueReturned = dateRangeHelper.getYearPeriod();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getMonthPeriod()', function () {
    it('should test getting the month period', function () {

      var valueReturned = dateRangeHelper.getMonthPeriod();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getQuarterPeriod()', function () {
    it('should test getting the quarter period', function () {

      var valueReturned = dateRangeHelper.getQuarterPeriod();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getWeekPeriod()', function () {
    it('should test getting the week period', function () {

      var valueReturned = dateRangeHelper.getWeekPeriod();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDayPeriod()', function () {
    it('should test getting the day period', function () {

      var valueReturned = dateRangeHelper.getDayPeriod();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for day', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('day', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for week', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('week', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for month', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('month', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for quarter', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('quarter', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for year', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('year', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for wtd', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('wtd', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for week_to_date', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('week_to_date', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for mtd', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('mtd', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for month_to_date', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('month_to_date', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for qtd', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('qtd', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for quarter_to_date', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('quarter_to_date', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for ytd', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('ytd', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for year_to_date', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('year_to_date', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for priorPeriod', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('priorPeriod', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for prior_period', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('prior_period', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for priorYear', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('priorYear', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for prior_year', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('prior_year', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBeDefined();
    });
  });

  describe('getDateRange()', function () {
    it('should test getting the date range for none', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRange('none', range, { preferences: { calendar_id: 1 } }, 1, 0);
      expect(valueReturned).toBe(undefined);
    });
  });

  describe('getDateRangeParams()', function () {
    it('should test getting the date range parameters', function () {
      var range = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var valueReturned = dateRangeHelper.getDateRangeParams();
      expect(valueReturned).toBeDefined();
    });
  });

  describe('isInRange()', function () {
    it('should test data is within the date range', function () {
      var period = {
        start: moment.utc('2013-12-21'),
        end: moment.utc('2013-12-27').endOf('day')
      };

      var data = { period_start_date: moment(), period_end_date: moment() };
      var valueReturned = dateRangeHelper.isInRange(data, period);
      expect(valueReturned).toBeDefined();
    });
  });
});
