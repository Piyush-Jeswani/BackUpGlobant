'use strict';

module.exports = {

  orgTitle: function() {
    return element(by.className('title-container')).element(by.className('title'));
  },

  orgSummaryWidget: function() {
    return element(by.tagName('organization-summary-widget'));
  },

  sitePerformanceWidget: function() {
    return element(by.tagName('site-performance-widget'));
  },

  trafficWeekdayDistWidget: function() {
    return element(by.tagName('traffic-per-weekday-widget'));
  }
};

