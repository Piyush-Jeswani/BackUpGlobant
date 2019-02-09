const widgetID = 'sales-conversion-tab-conversion-line-chart-widget';
const lineChartWidget = require('./common/line-high-chart-widget.js');

module.exports = {

  widgetTitle() {
    return element(by.id(widgetID)).element(by.className('widget-title')).element(by.className('ng-binding'));
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
    return lineChartWidget.getPriorYearDataValues(widgetID);
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

  getSummaryFrameSelectedPeriodLabel() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-summary');
  },

  getSummaryFrameCompare1Label() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-compare.prior-period');
  },

  getSummaryFrameCompare2Label() {
    return lineChartWidget.getSummaryFramePeriodLabel(widgetID, '.line-high-chart-widget-compare.prior-year');
  },

  getSummaryFrameMetricLabel() {
    return lineChartWidget.getSummaryFrameMetricLabel(widgetID);
  },

  // used in translation checks
  getTooltipTotalText() {
    return lineChartWidget.getHighChartTooltipTotalText(widgetID);
  }
};
