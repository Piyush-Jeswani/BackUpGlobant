
const lineChartWidget = require('./common/line-high-chart-widget.js');

const widgetID = 'traffic-tab-traffic-line-high-chart-widget';

module.exports = {
  getWeatherMetrics() {
    return [
      'temperature',
      'high temperature',
      'low temperature',
      'precipitation',
      'humidity',
      'feels like temp',
      'wind speed'
    ];
  },

  getWeatherUnits() {
    return [
      '°f',
      '°c',
      'mph',
      'kph'
    ];
  },

  widgetTitle() {
    return element(by.id(widgetID)).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  clickExportButton() {
    const exportButton = element(by.id(widgetID)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getCustomDashboardButton() {
    return element(by.id(widgetID)).element(by.css('div.add-to-custom-dashboard'));
  },

  getMetricRowNum(metric) {
    switch (metric.toLowerCase()) {
      case 'traffic':
        return 0;
      case 'sales':
        return 1;
      case 'conversion':
        return 2;
      case 'ats':
        return 3;
      case 'star':
        return 4;
      default:
        throw new Error(`${metric} is not a valid option for metric.`);
    }
  },

  openMetricDropdown() {
    return element(by.id(widgetID)).element(by.className('widget-actions')).element(by.css('span.kpi-dropdown')).element(by.css('button.dropdown-toggle'))
      .click();
  },

  selectMetric(metric) {
    const metricNum = this.getMetricRowNum(metric);
    return this.openMetricDropdown().then(() => {
      return element(by.id(widgetID)).element(by.className('widget-actions')).element(by.css('span.kpi-dropdown')).all(by.repeater('option in lineHighChartWidget.options ').row(metricNum))
        .click();
    });
  },

  getWeatherDropdown() {
    return element(by.id(widgetID)).element(by.className('weather-metric-selector'));
  },

  getWeatherMetricRowNum(metric) {
    switch (metric.toLowerCase()) {
      case 'temperature':
        return 0;
      case 'high temperature':
        return 1;
      case 'low temperature':
        return 2;
      case 'precipitation':
        return 3;
      case 'humidity':
        return 4;
      case 'feels like temp':
        return 5;
      case 'wind speed':
        return 6;
      default:
        throw new Error(`${metric} is not a valid option for metric.`);
    }
  },

  getActiveWeatherMetrics() {
    return this.getWeatherDropdown().click().then(() => {
      return this.getWeatherDropdown().all(by.css('li.active')).getTextLowerCase().then(text => {
        this.widgetTitle().click();
        return text;
      });
    });
  },

  getAllDisplayedWeatherOptions() {
    return this.getWeatherDropdown().all(by.css('li a')).filter(option => {
      return option.isDisplayed();
    });
  },

  setWeatherMetric(metric) {
    const rowNum = this.getWeatherMetricRowNum(metric);
    return this.getWeatherDropdown().click().then(() => {
      return this.getWeatherDropdown().all(by.repeater('item in vm.items')).get(rowNum).click();
    }).then(() => {
      // placeholder to close dropdown. needed until dropdown can be reliably closed by 2nd click action on getWeatherDropdown
      return this.widgetTitle().click();
    });
  },

  getXAxisDates(dateFormat) {
    return lineChartWidget.getXAxisDates(widgetID, dateFormat);
  },

  getHighestYAxisValue() {
    return lineChartWidget.getHighestYAxisValue(widgetID);
  },

  getWeatherMetricLine(seriesNumber) {
    return lineChartWidget.getWeatherMetricLine(widgetID, seriesNumber);
  },

  getWidgetWeatherPermission() {
    return lineChartWidget.getWeatherMetricPermission(widgetID);
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
  getLegendTextLowerCase() {
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

  getTooltipText() {
    return lineChartWidget.getHighChartTooltip(widgetID);
  },

  // used in translation checks
  getTooltipTotalText() {
    return lineChartWidget.getHighChartTooltipTotalText(widgetID);
  }
};
