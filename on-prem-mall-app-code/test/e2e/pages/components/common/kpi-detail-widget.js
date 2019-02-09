'use strict';

var dateSelector = require('../time-period-picker.js');

module.exports = {

  getXAxisDates: function (widgetTag, dateFormat) {
    var dates = element(by.tagName(widgetTag)).element(by.className('ct-labels')).all(by.className('ct-horizontal'));
    var dateStrings = dates.getText();
    return dateStrings.then(function (dateStringsArray) {
      dateStringsArray.forEach(function (dateItem, index) {
        dateStringsArray[index] = dateSelector.dateStringToObj(dateItem, dateFormat);
      });
      return dateStringsArray;
    });
  },

  getHighestYAxisValue: function (widgetTag) {
    var highestValueElm = element(by.tagName(widgetTag)).element(by.className('ct-labels')).all(by.className('ct-vertical')).last();
    var highestValueText = highestValueElm.getText();
    return highestValueText.then(function(number){
      return Number(number.replace(/\./g, '').replace(/,/g, '.').replace('%', ''));
    });
  },

  getSelectedPeriodDateRange: function(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.kpi-detail-widget-current', dateFormat);
  },

  getSelectedPeriodDataValues: function (widgetTag){
    return getLineDataValues(widgetTag, 'ct-series-a');
  },

  getSelectedPeriodDataSum: function(widgetTag){
    return getLineDataSum(widgetTag, 'ct-series-a');
  },

  getSelectedPeriodOverall: function(widgetTag){
    return getPeriodTotalOverall(widgetTag, '.kpi-detail-widget-current')
  },

  getPriorPeriodDateRange: function(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.kpi-detail-widget-compare.prior-period', dateFormat);
  },

  getPriorPeriodDataValues: function (widgetTag){
    return getLineDataValues(widgetTag, 'ct-series-b');
  },

  getPriorPeriodDataSum: function(widgetTag){
    return getLineDataSum(widgetTag, 'ct-series-b');
  },

  getPriorPeriodOverall: function(widgetTag){
    return getPeriodTotalOverall(widgetTag, '.kpi-detail-widget-compare.prior-period')
  },

  getPriorPeriodDelta: function(widgetTag){
    return getPeriodDelta(widgetTag, '.kpi-detail-widget-compare.prior-period')
  },

  getPriorYearDateRange: function(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.kpi-detail-widget-compare.prior-year', dateFormat);
  },

  getPriorYearDataValues: function (widgetTag){
    return getLineDataValues(widgetTag, 'ct-series-c');
  },

  getPriorYearDataSum: function(widgetTag){
    return getLineDataSum(widgetTag, 'ct-series-c');
  },

  getPriorYearOverall: function(widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.kpi-detail-widget-compare.prior-year')
  },

  getPriorYearDelta: function(widgetTag){
    return getPeriodDelta(widgetTag, '.kpi-detail-widget-compare.prior-year')
  },

  calculateDelta: function(selectedPeriodTotal, priorPeriodTotal) {
    return selectedPeriodTotal.then(function(selected) {
      return priorPeriodTotal.then(function(prior) {
        var selectedPeriod = Number(selected);
        var priorPeriod = Number(prior);

        var diff = selectedPeriod - priorPeriod;
        //calc delta and round to one decimal
        var calculatedDelta = Math.round(((diff/priorPeriod)*100)*10)/10;
        return calculatedDelta;
      });
    });
  },

  //used in translation checks
  getLegendText: function(widgetTag){
    return element(by.tagName(widgetTag)).element(by.className('chart-legend')).all(by.css('label:first-child')).getText();
  },

  //used in translation checks- uses helper functions in page objects for specific line chart widgets
  getSummaryFramePeriodLabel: function(widgetTag, labelCss) {
    return element(by.tagName(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.css(labelCss)).element(by.className('period-label')).getText();
  },

  //used in translation checks
  getSummaryFrameMetricLabel: function(widgetTag) {
    return element(by.tagName(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('kpi-detail-widget-current')).element(by.className('value')).element(by.css('small')).getText()
  },

  //used in translation checks
  getTooltipTotalText: function(widgetTag) {
    var lineChart = element(by.tagName(widgetTag)).element(by.className('ct-chart-container'));
    lineChart.click();
    return element(by.tagName(widgetTag)).element(by.tagName('linechart-tooltip')).element(by.className('line-chart-tooltip-total')).getText();
  }
};

function getLineDataValues(widgetTag, seriesValue){
  var data = element(by.tagName(widgetTag)).element(by.className(seriesValue)).all(by.tagName('line'));
  var dataValues = data.getAttribute('ct:value');
  return dataValues;

}

function getLineDataSum(widgetTag, seriesValue){
  return getLineDataValues(widgetTag, seriesValue).then(function(dataArray){
    return dataArray.reduce(function(a, b){
      var number = Number(b);
      return Math.round(Number(a) + number);
    });
  });
}

function getPeriodTotalOverall(widgetTag, cssSelector){
  var total = element(by.tagName(widgetTag)).element(by.css(cssSelector)).element(by.css('span.ng-binding:not(.ng-hide)'));
  var totalText = total.getText();
  return totalText.then(function(text){
    return Number(text.replace(/\./g, '').replace(/,/g, '.').replace('%', ''));
  });
}

function getFrameDateRange(widgetTag, cssSelector, dateFormat){
  var date = element(by.tagName(widgetTag)).element(by.css(cssSelector)).element(by.css('div.selected-period'));
  var dateText = date.getText();
  return dateText.then(function (dateTextString) {
    var formattedDate = dateSelector.makeDateArray(dateTextString, dateFormat);
    return formattedDate;
  });
}

function getPeriodDelta(widgetTag, cssSelector){
  var delta = element(by.tagName(widgetTag)).element(by.css(cssSelector)).element(by.css('div.kpi-detail-widget-delta-label'));
  var deltaText = delta.getText();
  return deltaText.then(function(text) {
    var formattedDelta = text.replace('%','').replace( /\./g, '').replace( /,/g, '.').trim();
    formattedDelta = Number(formattedDelta);
    return formattedDelta;
  });
}

