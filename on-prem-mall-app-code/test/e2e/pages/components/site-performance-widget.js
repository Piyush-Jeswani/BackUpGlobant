'use strict';

const lineChartWidget = require('./common/line-high-chart-widget.js');

const widgetID = 'org-summary-site-performance-widget';

module.exports = {
  widgetTitle() {
    return element(by.id(widgetID)).element(by.className('widget-title')).all(by.css('span.ng-binding')).first();
  },

  openChartTypeDropdown() {
    const dropdown = element(by.id(widgetID)).element(by.className('widget-title')).element(by.css('button.dropdown-toggle'));
    dropdown.click();
  },

  getChartTypeDropdownOptions() {
    this.openChartTypeDropdown();
    return element(by.id(widgetID)).element(by.className('widget-title')).all(by.repeater('(key, view) in sitePerformanceWidget.views')).getText();
  },

  getChartDataRowNum(option) {
    switch (option.toLowerCase()) {
      case 'contribution':
        return 0;
      case 'increase':
        return 1;
      case 'loss':
        return 2;
      default:
        throw new Error(`${option} is not a valid value for option.`);
    }
  },
// sets chart type option in widget header dropdown.  acceptable "option" parameters are 'contribution', 'increase' and 'loss'
  setChartDataOption(option) {
    this.openChartTypeDropdown();
    const optionRowNum = this.getChartDataRowNum(option);
    const chartSelector = element(by.id(widgetID)).element(by.className('widget-title')).all(by.repeater('(key, view) in sitePerformanceWidget.views').row(optionRowNum));
    chartSelector.click();
  },

  getHighestYAxisValue() {
    return lineChartWidget.getHighestYAxisValue(widgetID);
  },

  getXAxisSites() {
    return element(by.id(widgetID)).all(by.className('ct-labels')).all(by.className('ct-horizontal')).all(by.className('label-name'))
      .getText();
  },

  getSelectedPeriodDataValues() {
    return lineChartWidget.getSelectedPeriodDataValues(widgetID);
  },

  getPriorPeriodDataValues() {
    return lineChartWidget.getPriorPeriodDataValues(widgetID);
  },

  getPriorYearDataValues() {
    return lineChartWidget.getPriorYearDataValues(widgetID);
  },

  getLegendTextLowerCase() {
    return lineChartWidget.getLegendTextLowerCase(widgetID);
  },

  // used in translation checks
  getTooltipTotalText() {
    return lineChartWidget.getBarChartTooltipTotalText(widgetID);
  }
};
