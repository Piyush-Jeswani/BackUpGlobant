'use strict';

var pieChartWidget = require('./common/pie-chart-widget.js');
const tagName = 'entrance-contribution-pie-widget';

module.exports = {

  widgetTitle: function () {
    return element(by.tagName(tagName)).element(by.className('widget-title'));
  },

  clickExportButton: function() {
    var exportButton = element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getCustomDashboardButton() {
    return element(by.tagName(tagName)).element(by.css('div.add-to-custom-dashboard'));
  },

  widgetSvg: function () {
    return element(by.tagName(tagName)).element(by.tagName('svg'));
  },

  pieSlice: function (site) {
    return this.widgetSvg().element(by.cssContainingText('text', site));
  },

  //RegEx matches number followed by % to confirm data is present
  entranceRegEx: function (entrance) {
    return new RegExp("(\\d\\d?\\s* " + entrance + ":\\s*100(.\\d{1,2})?%)|(\\d\\d?\\s* " + entrance + ":\\s*([1-9]([0-9])?|0)(.\\d{1,2})?%)");

  },

  entranceNameFromListItem: function (entrance) {
    var entranceName = entrance.replace(':', '').slice(0, -5).slice(2).trim();
    return entranceName;
  },

  entranceListItem: function (entrance) {
    return element(by.tagName(tagName)).element(by.cssContainingText('li', entrance));
  },

  getListPercentSum: function () {
    return pieChartWidget.getListPercentSum(tagName, 'entranceItem in ::vm.entranceItems | orderBy:\'-traffic\' track by $index', 'entranceItem.name');
  }
};
