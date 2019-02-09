'use strict';

module.exports = {

  widgetBar: function() {
    return element(by.className('analytics-menu'));
  },

  getActiveTabName: function() {
    return element(by.className('analytics-header')).element(by.className('title-specifier')).getText();
  },

  navToTrafficTab: function() {
    siteTabPicker('analytics-menu-item-traffic');
  },

  navToSalesTab: function() {
    siteTabPicker('analytics-menu-item-sales-and-conversion');
  },

  navToVisitorBehaviorTab: function() {
    siteTabPicker('analytics-menu-item-visitor-behavior');
  },

  navToUsageOfAreasTab: function() {
    siteTabPicker('analytics-menu-item-usage-of-areas');
  },

  navToCompareTab: function() {
    siteTabPicker('analytics-menu-item-compare');
  },

  getTrafficTabName: function(){
    return getTabName('analytics-menu-item-traffic')
  },

  getSalesTabName: function(){
    return getTabName('analytics-menu-item-sales-and-conversion');
  },

  getVisitorBehaviorTabName: function() {
    return getTabName('analytics-menu-item-visitor-behavior');
  },

  getUsageOfAreasTabName: function() {
    return getTabName('analytics-menu-item-usage-of-areas');
  },

  getCompareTabName: function() {
    return getTabName('analytics-menu-item-compare');
  }

};
function siteTabPicker(tabId) {
  var tab = element(by.className('analytics-menu')).element(by.id(tabId));
  tab.click();
}

function getTabName(tabId) {
  return element(by.className('analytics-menu')).element(by.id(tabId)).getText();
}

