'use strict';

let pieChartWidget = require('./common/pie-chart-widget.js');

module.exports = {

  widgetTitle() {
    return element(by.tagName('visiting-frequency-detail-widget')).element(by.className('widget-title'));
  },

  clickExportButton() {
    let exportButton = element(by.tagName('visiting-frequency-detail-widget')).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getSelectedPeriodDateRange(dateFormat) {
    return pieChartWidget.getSelectedPeriodDateRange('visiting-frequency-detail-widget', dateFormat);
  },

  getPriorPeriodDateRange(dateFormat) {
    return pieChartWidget.getPriorPeriodDateRange('visiting-frequency-detail-widget', dateFormat);
  },

  getPriorYearDateRange(dateFormat) {
    return pieChartWidget.getPriorYearDateRange('visiting-frequency-detail-widget', dateFormat);
  },

  getPiePercentSum() {
    return pieChartWidget.getPiePercentSum('visiting-frequency-detail-widget');
  },

  getPieChartLegendText() {
    return pieChartWidget.getPieChartLegendText('visiting-frequency-detail-widget');
  },

  // used in translation checks
  getSummaryFrameSelectedPeriodLabel() {
    return element(by.tagName('visiting-frequency-detail-widget')).element(by.className('visiting-frequency-detail-widget-current')).element(by.className('period-label')).getText();
  },

  // used in translation checks
  getSummaryFrameCompare1Label() {
    return element(by.tagName('visiting-frequency-detail-widget')).element(by.css('.visiting-frequency-detail-widget-compare.prior-period')).element(by.className('period-label')).getText();
  },

  // used in translation checks
  getSummaryFrameCompare2Label() {
    return element(by.tagName('visiting-frequency-detail-widget')).element(by.css('.visiting-frequency-detail-widget-compare.prior-year')).element(by.className('period-label')).getText();
  },

  // used in translation checks
  getSummaryFrameMetricLabel() {
    return element(by.tagName('visiting-frequency-detail-widget')).element(by.className('visiting-frequency-detail-widget-current')).element(by.className('share-info')).element(by.css('small')).getText();
  }

};

