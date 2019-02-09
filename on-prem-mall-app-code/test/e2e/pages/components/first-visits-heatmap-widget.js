'use strict';

var heatmapWidget = require('./common/heatmap-widget.js');

module.exports = {
  widgetTag: 'first-visits-heatmap-widget',

  widgetTitle: function () {
    return heatmapWidget.widgetTitle(this.widgetTag);
  },

  clickExportButton: function() {
    var exportButton = element(by.tagName('first-visits-heatmap-widget')).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getAreaList: function () {
    return heatmapWidget.getAreaList(this.widgetTag);
  },
  
  getHeatmap: function() {
    return heatmapWidget.getHeatmap(this.widgetTag);
  },

  //used in translation checks. returns an array containing text strings taken from heatmap legend.
  getLegendTextArray: function(){
    return heatmapWidget.getLegendTextArray(this.widgetTag);
  },

  //used in translation checks.
  getPercentageFrameTitle: function() {
    return heatmapWidget.getPercentageFrameTitle(this.widgetTag);
  }
};


