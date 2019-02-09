'use strict';

var dateSelector = require('../time-period-picker.js');

module.exports = {

  getXAxisDates: function (widgetTag, dateFormat) {
    var dates = element(by.id(widgetTag)).element(by.className('ct-labels')).all(by.className('ct-horizontal'));
    var dateStrings = dates.getText();
    return dateStrings.then(function (dateStringsArray) {
      dateStringsArray.forEach(function (dateItem, index) {
        dateStringsArray[index] = dateSelector.dateStringToObj(dateItem, dateFormat);
      });
      return dateStringsArray;
    });
  },

  getHighestYAxisValue: function (widgetTag) {
    var highestValueElm = element(by.id(widgetTag)).element(by.className('ct-labels')).all(by.className('ct-vertical')).last();
    var highestValueText = highestValueElm.getText();
    return highestValueText.then(function (number) {
      return Number(number.replace(/\./g, '').replace(/,/g, '.').replace('%', ''));
    });
  },

  getSelectedPeriodDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-chart-widget-summary');
  },

  getSelectedPeriodDateRange: function (widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-chart-widget-summary', dateFormat);
  },

  getSelectedPeriodDataValues: function (widgetTag, numberFormat) {
    return getLineDataValues(widgetTag, 'ct-series-a', numberFormat);
  },

  getSelectedPeriodDataValuesAsNumbers: function (widgetTag) {
    return getLineDataValues(widgetTag, 'ct-series-a', true);
  },

  getSelectedPeriodDataSum: function (widgetTag) {
    return getLineDataSum(widgetTag, 'ct-series-a');
  },

  getSelectedPeriodOverall: function (widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-chart-widget-summary');
  },

  getPriorPeriodDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-chart-widget-compare.prior-period');
  },

  getPriorPeriodDateRange: function (widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-chart-widget-compare.prior-period', dateFormat);
  },

  getPriorPeriodDataValues: function (widgetTag) {
    return getLineDataValues(widgetTag, 'ct-series-b');
  },

  getPriorPeriodDataValuesAsNumbers: function (widgetTag) {
    return getLineDataValues(widgetTag, 'ct-series-b', true);
  },

  getPriorPeriodDataSum: function (widgetTag) {
    return getLineDataSum(widgetTag, 'ct-series-b');
  },

  getPriorPeriodOverall: function (widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-chart-widget-compare.prior-period');
  },

  getPriorPeriodDelta: function (widgetTag) {
    return getPeriodDelta(widgetTag, '.line-chart-widget-compare.prior-period');
  },

  getPriorYearDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-chart-widget-compare.prior-year');
  },

  getPriorYearDateRange: function (widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-chart-widget-compare.prior-year', dateFormat);
  },

  getPriorYearDataValues: function (widgetTag) {
    return getLineDataValues(widgetTag, 'ct-series-c');
  },

  getPriorYearDataValuesAsNumbers: function (widgetTag) {
    return getLineDataValues(widgetTag, 'ct-series-c', true);
  },

  getPriorYearDataSum: function (widgetTag) {
    return getLineDataSum(widgetTag, 'ct-series-c');
  },

  getPriorYearOverall: function (widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-chart-widget-compare.prior-year');
  },

  getPriorYearDelta: function (widgetTag) {
    return getPeriodDelta(widgetTag, '.line-chart-widget-compare.prior-year');
  },

  calculateDelta: function (selectedPeriodTotal, priorPeriodTotal) {

    return protractor.promise.all([selectedPeriodTotal, priorPeriodTotal]).then(function (promiseArray) {

      var selected = promiseArray[0];
      var prior = promiseArray[1];

      var diff = selected - prior;
      //calc delta and round to one decimal
      var calculatedDelta = Math.round(((diff / prior) * 100) * 10) / 10;
      return calculatedDelta;
    });
  },

//used in translation checks.
  getLegendText: function (widgetTag) {
    return element(by.id(widgetTag)).element(by.className('chart-legend')).all(by.css('label:first-child')).getText();
  },

//used in translation checks- uses helper functions in page objects for specific line chart widgets
  getSummaryFramePeriodLabel: function (widgetTag, labelCss) {
    return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.css(labelCss)).element(by.className('period-label')).getText();
  },

//used in translation checks - frequency parameter should be string value of either null, unique, or returning; assists with getting text on visitor behavior traffic widget
  getSummaryFrameMetricLabel: function (widgetTag, frequency) {
    if (frequency === 'unique') {
      return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-chart-widget-summary')).element(by.className('traffic-share-info-unique')).element(by.css('small')).getText();
    } else if (frequency === 'returning') {
      return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-chart-widget-summary')).element(by.className('traffic-share-info-returning')).element(by.css('small')).getText();
    } else {
      return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-chart-widget-summary')).element(by.className('value')).element(by.css('small')).getText();
    }
  },

//used in translation checks - frequency parameter should be string value of either null, 'unique', or 'returning'; assists with getting text on visitor behavior traffic widget
  getTooltipTotalText: function (widgetTag, frequency) {
    var lineChart = element(by.id(widgetTag)).element(by.className('ct-chart-container'));
    lineChart.click();
    if (frequency === 'unique') {
      return element(by.id(widgetTag)).element(by.tagName('linechart-tooltip')).element(by.className('line-chart-tooltip-unique')).getText();
    } else if (frequency === 'returning') {
      return element(by.id(widgetTag)).element(by.tagName('linechart-tooltip')).element(by.className('line-chart-tooltip-returning')).getText();
    } else {
      return element(by.id(widgetTag)).element(by.tagName('linechart-tooltip')).element(by.className('line-chart-tooltip-total')).getText();
    }
  },

//used in translation checks for Average Traffic (bar chart) widget
  getBarChartTooltipTotalText: function (widgetTag) {
    var barChart = element(by.id(widgetTag)).element(by.className('ct-chart-container'));
    barChart.click();
    return element(by.id(widgetTag)).element(by.tagName('barchart-tooltip')).all(by.className('chart-tooltip-label')).getText();
  },

  getSumDataWindow: function (timePeriod) {
    //sets data range for sum checks of line chart widgets - avoids failures due to rounding
    switch (timePeriod.toLowerCase()) {
      case 'week':
        return 4;
      case 'month':
        return 16;
      case 'year':
        return 183;
      default :
        throw new Error(timePeriod + ' is not a valid option for timePeriod.');
    }
  }
};

//todo: revisit after upgrading protractor, which may change test behavior
function getLineDataValues(widgetTag, seriesValue, convertToNumber){
  var data = element(by.id(widgetTag)).element(by.className(seriesValue)).all(by.tagName('line'));
  var dataValues = data.getAttribute('outerHTML');

  return dataValues.then(function(textArray) {
    var valuesArray = [];
    textArray.forEach(function(htmlText) {
      var value = htmlText.match(/.*value="(.*?)".*/);
      value = value[1];

      if (convertToNumber) {
        value = Number(value);
      }

      valuesArray.push(value);
    });
    return valuesArray;
  });
}

function getLineDataSum(widgetTag, seriesValue){
  return getLineDataValues(widgetTag, seriesValue).then(function(dataArray){
    return dataArray.reduce(function(a, b){
      var number = Number(b);
      return Math.round(Number(a) + number);
    });
  });
}

function getPeriodTotalOverall(widgetTag, cssSelector, numberFormat = 'europe'){
  var total = element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('span.ng-binding:not(.ng-hide)'));
  var totalText = total.getText();
  return totalText.then(function(text){
    if (numberFormat.toLowerCase() === 'us') {
      return Number(text.replace(/[$|€|£|¥|%]/g, ''));
    } else if (numberFormat.toLowerCase() === 'europe') {
      return Number(text.replace(/\./g, '').replace(/,/g, '.').replace(/[$|€|£|¥|%]/g, ''));
    } else {
      throw new Error(numberFormat + ' is not a valid option for numberFormat.');
    }
  });
}

function getFrameDateRange(widgetTag, cssSelector, dateFormat){
  return getFrameDateRangeText(widgetTag, cssSelector).then(function (dateTextString) {
    var formattedDate = dateSelector.makeDateArray(dateTextString, dateFormat);
    return formattedDate;
  });
}

function getFrameDateRangeText(widgetTag, cssSelector) {
  return element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('div.selected-period')).getText();
}

function getPeriodDelta(widgetTag, cssSelector){
  var delta = element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('div.line-chart-widget-delta-label'));
  var deltaText = delta.getText();
  return deltaText.then(function(text) {
    var formattedDelta = text.replace('+','').replace('%','').replace( /\./g, '').replace( /,/g, '.').trim();
    formattedDelta = Number(formattedDelta);
    return formattedDelta;
  });
}

