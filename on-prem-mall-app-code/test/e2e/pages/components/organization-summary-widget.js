'use strict';

var tableWidget = require('./common/table-widget.js');

module.exports = {

  columns: [ 'SITE', 'TRAFFIC CHANGE', 'TRAFFIC', 'GSH CHANGE', 'GROSS SHOPPING HOURS', 'VISITING FREQ. CHANGE', 'VISITING FREQUENCY' ],

  widgetTitle: function() {
    return element(by.tagName('organization-summary-widget')).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  clickExpandButtonIfPresent: function() {
    return tableWidget.clickExpandButton('organization-summary-widget');
  },

  getKpiColumns: function() {
    return element(by.tagName('organization-summary-widget')).all(by.repeater('column in header.columns[\'center\'] track by column.$id')).getText();
  },

  clickSiteHeaderAndGetOrgList: function() {
      var headerList = element(by.tagName('organization-summary-widget')).all(by.deepCss('span.metric-label'));
      headerList.then(function(hdrList) {
        if (hdrList.length === 0) {} else {
          headerList.first().click();
        }
      });
    return this.getFilteredOrgList();
  },

  getFilteredOrgList: function() {
    return tableWidget.getColumnByBinding('organization-summary-widget', 'column in rowCtrl.columns[\'center\'] track by column.$id', '$row.name').getText();
  },

  getFilter: function() {
    return element(by.tagName('organization-summary-widget')).element(by.css('input'));
  },

  siteListItem: function(site) {
    return element(by.cssContainingText('text', site));
  },

  getColumnText: function(columnBinding) {
    return tableWidget.getColumnByBinding('organization-summary-widget', 'kpi in site.kpis', columnBinding).getText();
  },

  getTrafficDeltaColumn: function() {
    return tableWidget.formatDeltaColumn(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('span.traffic-change')).getText());
  },

  getCurrentOverallColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('div.traffic')).getText());
  },

  getPreviousOverallColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('small.traffic')).getText());
  },

  // if GSH data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getGSHDeltaColumn: function() {
    return tableWidget.formatDeltaColumn(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('span.gsh-change')).getText());
  },

  // if GSH data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getCurrentGSHColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('div.gsh')).getText());
  },

  // if GSH data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getPreviousGSHColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('small.gsh')).getText());
  },

  // if visiting freq. data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getVisitingDeltaColumn: function() {
    return tableWidget.formatDeltaColumn(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('span.loyalty-change')).getText());
  },

  // if visiting freq. data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getCurrentVisitingColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('div.loyalty')).getText());
  },

  // if visiting freq. data is ever present for org Arabian Centres Mall, selector below will need to be tested to confirm functionality
  getPreviousVisitingColumn: function() {
    return tableWidget.formatNumberArray(element(by.tagName('organization-summary-widget')).all(by.repeater('column in rowCtrl.columns[\'center\'] track by column.$id')).all(by.css('small.loyalty')).getText());
  },

  calculateTrafficDeltaColumn: function() {
    return tableWidget.calculateDelta(this.getCurrentOverallColumn(), this.getPreviousOverallColumn());
  },

  calculateGSHDeltaColumn: function() {
    return tableWidget.calculateDelta(this.getCurrentGSHColumn(), this.getPreviousGSHColumn());
  },

  calculateVisitingDeltaColumn: function() {
    return tableWidget.calculateDelta(this.getCurrentVisitingColumn(), this.getPreviousVisitingColumn());
  },

  getDatePeriodButton: function() {
    return element(by.tagName('organization-summary-widget')).element(by.css('div.widget-actions')).all(by.css('button'));
  },

  getFilterDefaultValue: function() {
    return this.getFilter().getAttribute('placeholder');
  }

};

