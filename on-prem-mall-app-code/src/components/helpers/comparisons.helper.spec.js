
'use strict';

describe('comparisonsHelper', function () {
  var kpiData;
  var comparisonsHelper;
  var kpiData = {
    id: 1,
    api: "testApi1",
    comparisons: {
      current: 1,
      previousPeriod: 2,
      previousYear: 3,
      data: {}
    }
  };

  var kpisData = [
    {
      id: 1,
      api: "testApi1",
      comparisons: {
        current: 1,
        previousPeriod: 2,
        previousYear: 3,
        data: {}
      }
    },
    {
      id: 2,
      api: "testApi2",
      comparisons: {
        current: 1,
        previousPeriod: 2,
        previousYear: 3,
        data: {}
      }
    },
    {
      id: 3,
      api: "testApi3",
      comparisons: {
        current: 1,
        previousPeriod: 2,
        previousYear: 3,
        data: {}
      }
    }
  ];

  var data = {
    testApi1: 12234
  };

  var multiData = {
    testApi1: 11111,
    testApi2: 22222,
    testApi3: 33333
  };

  var dateRange = {
    1: { start: moment('01/02/2010'), end: moment('02/27/2010'), key: 'key1' },
    2: { start: moment('01/01/2010'), end: moment('01/27/2010'), key: 'key2' },
    3: { start: moment('01/02/2009'), end: moment('02/27/2009'), key: 'key3' }
  };

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function (_comparisonsHelper_) {
    comparisonsHelper = _comparisonsHelper_;
  }));

  describe('getValuesForRange', function () {
    it('should get comparison values for the selected date range', function () {
      comparisonsHelper.getValuesForRange(1, data, kpiData, dateRange[1]);
      expect(kpiData.comparisons.data[1].total).toBe(12234);
      expect(kpiData.comparisons.data[1].comparePeriod).toBe('01/02/2010 - 02/27/2010');

      kpiData.comparisons.data = {
        1: { total: 600 }
      };
      comparisonsHelper.getValuesForRange(2, data, kpiData, dateRange[2]);
      expect(kpiData.comparisons.data[2].total).toBe(12234);
      expect(kpiData.comparisons.data[2].comparePeriod).toBe('01/01/2010 - 01/27/2010');
      expect(kpiData.comparisons.data[2].percentageChangePeriod).toBe('-95.1%');
      expect(kpiData.comparisons.data[2].deltaColoringPeriod).toBe('negative');
    });

    it('should get multiple comparison values for the selected date ranges', function () {
      comparisonsHelper.getValuesForRange(1, multiData, kpisData, dateRange[1]);
      expect(kpisData[1].comparisons.data[1].total).toBe(22222);
      expect(kpisData[1].comparisons.data[1].comparePeriod).toBe('01/02/2010 - 02/27/2010');

      kpisData[0].comparisons.data = { 1: { total: 453 } };
      kpisData[1].comparisons.data = { 1: { total: 788 } };
      kpisData[2].comparisons.data = { 1: { total: 45345 } };

      comparisonsHelper.getValuesForRange(2, multiData, kpisData, dateRange[2]);
      expect(kpisData[0].comparisons.data[2].total).toBe(11111);
      expect(kpisData[0].comparisons.data[2].comparePeriod).toBe('01/01/2010 - 01/27/2010');
      expect(kpisData[0].comparisons.data[2].percentageChangePeriod).toBe('-95.9%');
      expect(kpisData[0].comparisons.data[2].deltaColoringPeriod).toBe('negative');

      expect(kpisData[1].comparisons.data[2].total).toBe(22222);
      expect(kpisData[1].comparisons.data[2].comparePeriod).toBe('01/01/2010 - 01/27/2010');
      expect(kpisData[1].comparisons.data[2].percentageChangePeriod).toBe('-96.5%');
      expect(kpisData[1].comparisons.data[2].deltaColoringPeriod).toBe('negative');

      expect(kpisData[2].comparisons.data[2].total).toBe(33333);
      expect(kpisData[2].comparisons.data[2].comparePeriod).toBe('01/01/2010 - 01/27/2010');
      expect(kpisData[2].comparisons.data[2].percentageChangePeriod).toBe('36.0%');
      expect(kpisData[2].comparisons.data[2].deltaColoringPeriod).toBe('positive');
    });
  });

  describe('getComparisonData', function () {
    it('should get % comparison and rise or fall for the selected values', function () {
      var result = comparisonsHelper.getComparisonData(111, 222);
      expect(result.percentageChange).toBe('-50.0%');
      expect(result.deltaColoringPeriod).toBe('negative');

      result = comparisonsHelper.getComparisonData(125, 100);
      expect(result.percentageChange).toBe('25.0%');
      expect(result.deltaColoringPeriod).toBe('positive');
    });


    it('should return "-" if the previous period total is 0', function() {
      var result = comparisonsHelper.getComparisonData(100, 0);
      expect(result.percentageChange).toBe('-');
      expect(result.deltaColoringPeriod).toBe('');
    });

    it('should consider negative values for the previous period calculate change accordingly', function() {
      var result = comparisonsHelper.getComparisonData(408, -349);
      expect(result.percentageChange).toBe('-216.9%');
      expect(result.deltaColoringPeriod).toBe('negative');
    });

    it('should return "-" if the previousValue is null', function() {
      var result = comparisonsHelper.getComparisonData(484, null);
      expect(result.percentageChange).toBe('-');
      expect(result.deltaColoringPeriod).toBe('');
    });

    it('should return "-" if the previousValue is undefined', function() {
      var result = comparisonsHelper.getComparisonData(484);
      expect(result.percentageChange).toBe('-');
      expect(result.deltaColoringPeriod).toBe('');
    });

  });

  describe('getPeriodString', function () {
    it('should form the date range string for the selected date range', function () {
      var result = comparisonsHelper.getPeriodString(moment('02/11/2016'), moment('02/21/2016'));
      expect(result).toBe('02/11/2016 - 02/21/2016');
    });

  });

});
