'use strict';

module.exports = {
  widgetTitle: function (widgetTag) {
    return element(by.tagName(widgetTag)).element(by.className('widget-title'));
  },

  getAreaList: function (widgetTag) {
    var areas = element(by.tagName(widgetTag)).element(by.className('location-list-container')).all(by.repeater('location in vm.locations | filter : vm.hasValue | orderBy : vm.getValue : true'));
    var areaList = areas.map(function (elm) {
      return elm.element(by.className('list-item-name')).getText();
    });
    return areaList;
  },

  getAreaName: function(){
    return element(by.className('title-container')).element(by.className('title'));
  },

  getHeatmap: function(widgetTag) {
    return element(by.tagName(widgetTag)).element(by.tagName('heatmap'));
  },

  //used in translation checks. returns an array containing text strings taken from heatmap legend.
  getLegendTextArray: function(widgetTag){
    return element(by.tagName(widgetTag)).element(by.className('heatmap-legend')).getText().then(function(legendText){
      return legendText.split('\n');
    })
  },

  //used in translation checks.
  getPercentageFrameTitle: function(widgetTag) {
    return element(by.tagName(widgetTag)).element(by.className('location-list-title')).getText();
  },

  //used in translation checks. returns "customers who visited" text for area-level heatmap widgets
  getPercentageFrameHeaderText: function(widgetTag) {
    return element(by.tagName(widgetTag)).element(by.className('target-location-info')).element(by.css('strong')).getText()
  }
};
