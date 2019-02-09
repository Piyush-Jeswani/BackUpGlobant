'use strict';

const widgetTag = 'kpi-summary-widget';

module.exports = {

  widgetTitle: function() {
    return element(by.tagName(widgetTag)).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  getKpiLabels: function() {
    return element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id').column('data.title')).filter(kpiLabel => {
      return kpiLabel.isDisplayed();
    }).getText();
  },

  getKpiTotalLabels: function() {
    return element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id').column('data.labels[data.comparisons.current].totalsLabel')).getText();
  },

  getKpiVarianceLabels: function() {
    return element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id').column('data.labels[data.comparisons.previousYear].fromLabel')).getText();
  },

  //works with getTooltip functions below
  getMetricIndex: function(metric) {
    if (metric.toLowerCase() === 'sales') {
      return 0;
    } else if (metric.toLowerCase() === 'traffic') {
      return 1;
    } else if (metric.toLowerCase() === 'conversion') {
      return 2;
    } else if (metric.toLowerCase() === 'ats') {
      return 3;
    } else if (metric.toLowerCase() === 'star') {
      return 4;
    }
  },

//acceptable metric parameters string values are sales, traffic, conversion, ats, star
  //acceptable position parameters string values are upper, lower
  getTooltipCompareLabel: function(metric, position) {
    const metricIndex = this.getMetricIndex(metric);

    if(position.toLowerCase() === 'upper') {
      const metricContainer = element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id')).get(metricIndex).element(by.className('top-section'));
      metricContainer.click();
      return element(by.tagName(widgetTag)).element(by.className('kpi-variance-popover')).element(by.className('compare-period')).getText();
    } else if (position.toLowerCase() === 'lower') {
      const metricContainer = element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id')).get(metricIndex).element(by.className('kpi-variance-compare'));
      metricContainer.click();
      return element(by.tagName(widgetTag)).element(by.className('kpi-variance-popover')).element(by.className('compare-period')).getText();
    }
  },

  //acceptable metric parameters string values are sales, traffic, conversion, ats, star
  //acceptable position parameters string values are upper, lower
  getTooltipKpiTotalLabel: function(metric, position) {
    const metricIndex = this.getMetricIndex(metric);

    if(position.toLowerCase() === 'upper') {
      const metricContainer = element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id')).get(metricIndex).element(by.className('top-section'));
      metricContainer.click();
      return element(by.tagName(widgetTag)).element(by.className('kpi-variance-popover')).element(by.className('period-label')).getText();
    } else if (position.toLowerCase() === 'lower') {
      const metricContainer = element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id')).get(metricIndex).element(by.className('kpi-variance-compare'));
      metricContainer.click();
      return element(by.tagName(widgetTag)).element(by.className('kpi-variance-popover')).element(by.className('period-label')).getText();
    }
  },

  getKpiSection: function(metric) {
    const metricIndex = this.getMetricIndex(metric);
    return element(by.tagName(widgetTag)).all(by.repeater('kpi in vm.allKpisData track by kpi.id')).get(metricIndex);
  },

  getSelectedPeriodValue: function(metric) {
    return this.getKpiSection(metric).element(by.className('top-section')).element(by.className('actual-value')).element(by.className('value')).getText().then(metricData => {
      return this.metricStringToNumber(metricData);
    });
  },

  getPriorPeriodValue: function(metric) {
    const metricContainer = this.getKpiSection(metric).element(by.className('top-section'));
    metricContainer.click();
    return this.getKpiSection(metric).element(by.className('kpi-variance-popover')).element(by.className('total-value')).getText().then(metricData => {
      return this.metricStringToNumber(metricData);
    });
  },

  getPriorPeriodDelta: function(metric) {
    return this.getKpiSection(metric).element(by.className('top-section')).element(by.className('kpi-variance-delta-value')).getText().then(metricData => {
      return this.metricStringToNumber(metricData);
    });
  },

  getPriorYearValue: function(metric) {
    const metricContainer = this.getKpiSection(metric).element(by.className('kpi-variance-compare'));
    metricContainer.click();
    return this.getKpiSection(metric).element(by.className('kpi-variance-popover')).element(by.className('total-value')).getText().then(metricData => {
      return this.metricStringToNumber(metricData);
    });
  },

  getPriorYearDelta: function(metric) {
    return this.getKpiSection(metric).element(by.className('kpi-variance-compare')).element(by.className('kpi-variance-delta-value')).getText().then(metricData => {
      return this.metricStringToNumber(metricData);
    });
  },

  metricStringToNumber: function(stringNum) {
    stringNum = Number(stringNum.replace( /\./g, '').replace( /,/g, '.').replace( /%/g, '').replace( /\$/g, ''));
    return stringNum;
  },

  getCustomDashboardButton() {
    return element(by.tagName(widgetTag)).element(by.css('div.add-to-custom-dashboard'));
  },

};
