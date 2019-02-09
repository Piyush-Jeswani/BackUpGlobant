(function() {
    'use strict';

angular.module('shopperTrak').factory('comparisonsHelper', ['LocalizationService', 'comparisons', comparisonsHelper]);

 function comparisonsHelper(LocalizationService, comparisons) {

 var types = {};
 comparisons.forEach(function(period) {
   types[period.valueKey] = period.id;
 });

  return {
    periodTypes: types,

    getValuesForRange: function(period, data, kpisData, dateRange) {
      if (Object.prototype.toString.call(kpisData) !== '[object Array]') {
          this.getValuesForRangeForKpi(period, data, kpisData, dateRange);
      } else {
          kpisData.forEach(function(kpiData) {
      this.getValuesForRangeForKpi(period, data, kpiData, dateRange);
          }, this);
      }
    },

    getValuesForRangeForKpi: function(period, data, kpiData, dateRange) {
      var currentTotal = period === this.periodTypes.current ? data[kpiData.api] : kpiData.comparisons.data[this.periodTypes.current].total;
      var previousTotal = period === this.periodTypes.current ? null : data[kpiData.api];
      var comparisonData = this.getTotalsAndVariances(period, currentTotal, dateRange, previousTotal);
      kpiData.comparisons.data[period] = comparisonData;
    },

    getTotalsAndVariances: function(period, currentTotal, compareRange, compareTotal) {
      compareTotal = (typeof compareTotal === 'undefined') ? null : compareTotal;
      var comparisonData = this.getComparisonData(currentTotal, compareTotal);
      return {
        total: period === this.periodTypes.current ? currentTotal : compareTotal,
        comparePeriod: this.getPeriodString(compareRange.start, compareRange.end),
        percentageChangePeriod: comparisonData.percentageChange,
        deltaColoringPeriod: comparisonData.deltaColoringPeriod
      };
    },

    getComparisonData: function(currentValue, compareValue, showPositiveSign) {
      var positiveSign;
      var showPositive = (typeof showPositiveSign === 'undefined') ? false : showPositiveSign;
      var hasCompareValue = !isNaN(compareValue) && compareValue !== null && compareValue !== 0 &&  !isNaN(currentValue);

      if(currentValue === compareValue){
          return {
            percentageChangeReal: null,
            percentageChange: '0.0%',
            deltaColoringPeriod: ''
          }
      }
      
      if (!hasCompareValue) {
          return {
            percentageChangeReal: null,
            percentageChange: '-',
            deltaColoringPeriod: ''
          };
      }

      var changeInPercent;
      var changeInPercentFormatted;
      var deltaColor;


      var variance = (100 - (currentValue / compareValue * 100)) * -1;
      changeInPercent = parseFloat(variance);
      changeInPercentFormatted = changeInPercent.toFixed(1) + '%';

      if (variance > 0) {
          deltaColor = 'positive';
          positiveSign = showPositive ? '+' : '';
      } else {
          deltaColor = 'negative';
      }

      return {
        prefixSymbol: positiveSign,
        percentageChangeReal: changeInPercent,
        percentageChange: changeInPercentFormatted,
        deltaColoringPeriod: deltaColor
      };
    },

    getPeriodString: function(startDate, endDate) {
      var dateFormat = LocalizationService.getCurrentDateFormat();
      return startDate.format(dateFormat) + ' - ' + endDate.format(dateFormat);
    },

    getPercentageShare: function(total, share) {
      if (typeof share === 'undefined' || share === null || share === 0) {
        return {
          difference: total,
          actual: 0,
          percentageShareReal: null,
          percentageShare: '-'
        };
      }

      var percent = parseFloat(share / total) * 100;
      var percentFormatted = percent.toFixed(1) + '%';

      return {
        actual: share,
        percentageShareReal: percent,
        percentageShare: percentFormatted
      };
    }
  };
}
})();
