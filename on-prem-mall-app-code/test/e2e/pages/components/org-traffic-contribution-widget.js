'use strict';

var pieChartWidget = require('./common/pie-chart-widget.js');

module.exports = {

  widgetTitle: function() {
    return element(by.tagName('organization-traffic-contribution-widget')).element(by.className('widget-title'));
  },

  widgetSvg: function() {
    return element(by.tagName('organization-traffic-contribution-widget')).element(by.tagName('svg'));
  },

  pieSlice: function(site) {
    return this.widgetSvg().element(by.cssContainingText('text', site));
  },

  //RegEx matches number followed by % to confirm data is present
  siteRegEx: function(site) {
    return new RegExp("(" + site + ": 100(\.0{1,2})?%)|(" + site + ": ([1-9]([0-9])?|0)(\.0{1,2})?%)");
  },

  //siteList: function(){
  // return pieChartWidget.getSiteList('organization-traffic-contribution-widget', 'site in vm.chartSites');
  //},

  siteListItem: function(site) {
    return element(by.tagName('organization-traffic-contribution-widget')).element(by.className('site-list')).element(by.cssContainingText('li', site));
  },

  getListPercentSum: function () {
    return pieChartWidget.getListPercentSum('organization-traffic-contribution-widget', 'site in vm.chartSites', 'site');
  },

  getPiePercentSum: function () {
    return pieChartWidget.getPiePercentSum('organization-traffic-contribution-widget');
  }
};
