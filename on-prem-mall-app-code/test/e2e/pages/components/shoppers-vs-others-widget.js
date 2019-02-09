'use strict';

const widgetID = 'visitor-behavior-tab-shoppers-vs-others-line-chart-widget';
const spaces = /[\n\r]/g;
const lineChartWidget = require('./common/line-high-chart-widget.js');
const dateSelector = require('./time-period-picker.js');

module.exports = {

  widgetTitle() {
    return element(by.id(widgetID)).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  clickExportButton() {
    const exportButton = element(by.id(widgetID)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getXAxisDates(dateFormat) {
    return lineChartWidget.getXAxisDates(widgetID, dateFormat);
  },

  getHighestYAxisValue() {
    return lineChartWidget.getHighestYAxisValue(widgetID);
  },

  getSelectedPeriodDateRange(dateFormat) {
    return lineChartWidget.getSelectedPeriodDateRange(widgetID, dateFormat);
  },

  getSelectedPeriodDataValues() {
    return lineChartWidget.getSelectedPeriodDataValues(widgetID);
  },

  getSelectedPeriodShoppers() {
    return new Promise( (resolve, reject) => {
      setTimeout(() => {
        element(by.id(widgetID)).element(by.className('line-high-chart-widget-summary-shoppers')).getText().then(percent => {
          resolve(percentFormatter(percent.split(spaces)[0]));
        });
      });
    });
  },

  getSelectedPeriodOthers() {
    return new Promise( (resolve, reject) => {
      setTimeout(() => {
        element(by.id(widgetID)).element(by.className('line-high-chart-widget-summary-others')).getText().then(percent => {
          resolve(percentFormatter(percent.split(spaces)[0]));
        });
      });
    });
  },

  getPriorPeriodDateRange(dateFormat) {
    return lineChartWidget.getPriorPeriodDateRange(widgetID, dateFormat);
  },

  getPriorPeriodDataValues() {
    return lineChartWidget.getPriorPeriodDataValues(widgetID);
  },

  getPriorPeriodShoppers() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-period')).element(by.className('share-info')).all(by.tagName('span'))
      .first()
      .getText()
      .then(percent => {
        return percentFormatter(percent);
      });
  },

  getPriorPeriodOthers() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-period')).element(by.className('share-info')).all(by.tagName('span'))
      .last()
      .getText()
      .then(percent => {
        return percentFormatter(percent);
      });
  },

  getPriorYearDateRange(dateFormat) {
    return lineChartWidget.getPriorYearDateRange(widgetID, dateFormat);
  },

  getPriorYearDataValues() {
    return lineChartWidget.getPriorYearDataValues(widgetID);
  },

  getPriorYearShoppers() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-year')).element(by.className('share-info')).all(by.tagName('span'))
      .first()
      .getText()
      .then(percent => {
        return percentFormatter(percent);
      });
  },

  getPriorYearOthers() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-year')).element(by.className('share-info')).all(by.tagName('span'))
      .last()
      .getText()
      .then(percent => {
        return percentFormatter(percent);
      });
  },

  // used in translation checks.
  getLegendText() {
    return lineChartWidget.getLegendTextLowerCase(widgetID);
    // return element(by.id(widgetID)).element(by.className('chart-legend')).all(by.className('chart-legend-label')).getText();
  },

  // used in translation checks
  getSummaryFrameSelectedPeriodLabel() {
    return element(by.id(widgetID)).element(by.className('line-high-chart-widget-summary')).element(by.className('period-label')).getText();
  },

  // used in translation checks
  getSummaryFrameCompare1Label() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-period')).element(by.className('period-label')).getText();
  },

  // used in translation checks
  getSummaryFrameCompare2Label() {
    return element(by.id(widgetID)).element(by.css('.line-high-chart-widget-compare.prior-year')).element(by.className('period-label')).getText();
  },

  // used in translation checks - summaryType parameter should be string value of either 'shoppers' or 'others' to assist with getting translated string in widget
  getSummaryFrameMetricLabel(summaryType) {
    return element(by.id(widgetID)).element(by.className('line-high-chart-widget-summary')).element(by.className(`line-high-chart-widget-summary-${summaryType}`)).element(by.css('span'))
      .getText();
  },

  // used in translation checks - summaryType parameter should be string value of either 'shoppers' or 'others' to assist with getting translated string in widget tooltip
  getTooltipTotalText(summaryType) {
    return lineChartWidget.getHighChartTooltipTotalText(widgetID, summaryType);
  }
};

function percentFormatter(percent) {
  return Number(percent.replace(/,/g, '.').replace('%', ''));
}
