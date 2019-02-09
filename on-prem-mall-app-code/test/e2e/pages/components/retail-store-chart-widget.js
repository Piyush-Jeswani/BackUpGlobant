'use strict';

let widgetTag = 'retail-store-summary-widget';

module.exports = {

  widgetTitle() {
    return element(by.tagName(widgetTag)).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  openStoreCategoryDropdown() {
    let dropdown = element(by.tagName(widgetTag)).all(by.css('span.kpi-dropdown')).first();
    dropdown.click();
  },

  getStoreCategoryOptions() {
    this.openStoreCategoryDropdown();
    return element(by.tagName(widgetTag)).all(by.css('span.kpi-dropdown')).first().element(by.css('ul.dropdown-menu')).all(by.css('li')).getText();
  },

  openMetricSelectorDropdown() {
    let dropdown =  element(by.tagName(widgetTag)).all(by.css('span.kpi-dropdown')).last();
    dropdown.click();
  },

  getMetricOptions() {
    this.openMetricSelectorDropdown();
    return element(by.tagName(widgetTag)).all(by.css('span.kpi-dropdown')).last().element(by.css('ul.dropdown-menu')).all(by.css('li')).getText();
  },

  // works with setMetricOption functions below
  getMetricIndex(metric) {
    if (metric.toLowerCase() === 'conversion') {
      return 0;
    } else if (metric.toLowerCase() === 'sales') {
      return 1;
    }
  },

  setMetricOption(metric) {
    let metricIndex = this.getMetricIndex(metric);
    this.openMetricSelectorDropdown();
    var metric =  element(by.tagName(widgetTag)).all(by.css('span.kpi-dropdown')).last().element(by.css('ul.dropdown-menu')).all(by.css('li')).get(metricIndex).getText();
    metric.click();
  },

  getSearchBar() {
    return element(by.tagName(widgetTag)).element(by.css('span.filter-search')).element(by.css('input'));
  },

  getSearchBarPlaceholder() {
    return this.getSearchBar().getAttribute('placeholder');
  },

  getExtremeCheckboxLabel() {
    return element(by.tagName(widgetTag)).element(by.css('span.retail-extreme-checkbox')).getText();
  },

  getChartText() {
    return element(by.tagName(widgetTag)).element(by.css('div.highcharts-container ')).all(by.css('text.highcharts-plot-band-label ')).getText();
  },

  getChartAxisTitle() {
    return element(by.tagName(widgetTag)).element(by.css('div.highcharts-container ')).all(by.css('text.highcharts-axis-title')).getText();
  },

  getChartTooltipMetrics() {
    let dataPoint = element(by.tagName(widgetTag)).element(by.className('highcharts-series-group')).element(by.className('highcharts-markers')).all(by.css('path')).first();
    browser.actions().mouseMove(dataPoint).perform();
    let tooltips =  element(by.tagName(widgetTag)).all(by.css('div.retail-summary-tooltip'));
    return tooltips.filter(tooltip => {
      return tooltip.isDisplayed();
    }).all(by.css('tr')).all(by.css('th')).getText();
  }
};
