'use strict';

const lineChartWidget = require('./common/line-high-chart-widget.js');

const widgetID = 'visitor-behavior-tab-draw-rate-line-chart-widget';

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

  getSelectedPeriodDataSum() {
    return lineChartWidget.getSelectedPeriodDataSum(widgetID);
  },

  getSelectedPeriodOverall() {
    return lineChartWidget.getSelectedPeriodOverall(widgetID);
  },

  getSelectedPeriodOverallAsText() {
    return lineChartWidget.getSelectedPeriodOverallAsText(widgetID);
  },

  getPriorPeriodDateRange(dateFormat) {
    return lineChartWidget.getPriorPeriodDateRange(widgetID, dateFormat);
  },

  getPriorPeriodDataValues() {
    return lineChartWidget.getPriorPeriodDataValues(widgetID);
  },

  getPriorPeriodDataSum() {
    return lineChartWidget.getPriorPeriodDataSum(widgetID);
  },

  getPriorPeriodOverall() {
    return lineChartWidget.getPriorPeriodOverall(widgetID);
  },

  getPriorPeriodOverallAsText() {
    return lineChartWidget.getPriorPeriodOverallAsText(widgetID);
  },

  getPriorPeriodDelta() {
    return lineChartWidget.getPriorPeriodDelta(widgetID);
  },

  getPriorYearDateRange(dateFormat) {
    return lineChartWidget.getPriorYearDateRange(widgetID, dateFormat);
  },

  getPriorYearDataValues() {
    return lineChartWidget.getPriorYearDataValues(widgetID);
  },

  getPriorYearDataSum() {
    return lineChartWidget.getPriorYearDataSum(widgetID);
  },

  getPriorYearOverall() {
    return lineChartWidget.getPriorYearOverall(widgetID);
  },

  getPriorYearOverallAsText() {
    return lineChartWidget.getPriorYearOverallAsText(widgetID);
  },

  getPriorYearDelta() {
    return lineChartWidget.getPriorYearDelta(widgetID);
  },

  calculatePriorPeriodDelta() {
    return lineChartWidget.calculateDelta(this.getSelectedPeriodOverall(), this.getPriorPeriodOverall());
  },

  calculatePriorYearDelta() {
    return lineChartWidget.calculateDelta(this.getSelectedPeriodOverall(), this.getPriorYearOverall());
  },

  // used in translation tests
  getLegendText() {
    return lineChartWidget.getLegendTextLowerCase(widgetID);
  },

  // used in translation checks
  getSummaryFrameSelectedPeriodLabel() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-summary');
  },

  // used in translation checks
  getSummaryFrameCompare1Label() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-compare.prior-period');
  },

  // used in translation checks
  getSummaryFrameCompare2Label() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-compare.prior-year');
  },

  // used in translation checks
  getSummaryFrameMetricLabel() {
    return lineChartWidget.getSummaryFrameMetricLabel(widgetID);
  },

  // used in translation checks
  getTooltipTotalText() {
    return lineChartWidget.getHighChartTooltipTotalText(widgetID);
  }
};

