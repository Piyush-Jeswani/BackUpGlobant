'use strict';

let dateSelector = require('../time-period-picker.js');

module.exports = {
  // used in currently-inactive entrance contribution widget?
  // getSiteList: function(widgetTag, columnRepeater, listElementTag) {
  //  var sites = element(by.tagName(widgetTag)).all(by.repeater(columnRepeater));
  //  var siteList = sites.map(function(elm) {
  //    return elm.getText();
  //  });
  //  return siteList;
  // },

  getColList(widgetTag, columnRepeater, columnBinding) {
    let siteList = element(by.tagName(widgetTag)).all(by.repeater(columnRepeater).column(columnBinding)).getText();
    return siteList;
  },

  percentFromListItem(entrance) {
    let entranceText = entrance.split(' ');

    let percentValue = (entranceText.length) - 1;
    let entrancePercent = entranceText[percentValue].replace('%', '').replace(/\./g, '').replace(/,/g, '.');

    return entrancePercent;
  },

  getListPercentSum(widgetTag, columnRepeater, columnBinding) {
    let itemList = this.getColList(widgetTag, columnRepeater, columnBinding);
    return itemList.then(list => {
      let percentList = [];

      list.forEach(item => {
        let percent = this.percentFromListItem(item);
        percentList.push(percent);
      });

      let percentSum = percentList.reduce((a, b) => {
        let number = Number(b);
        return Number(a) + number;
      });

      return Math.round(percentSum);
    });
  },

  getPiePercentSum(widgetTag) {
    let itemList = element(by.tagName(widgetTag)).element(by.css('g.highcharts-data-labels')).all(by.css('tspan.highcharts-text-outline')).getText();
    return itemList.then(list => {
      let percentList = [];

      list.forEach(item => {
        let percent = this.percentFromListItem(item);
        percentList.push(percent);
      });

      let percentSum = percentList.reduce((a, b) => {
        let number = Number(b);
        return Number(a) + number;
      });

      return Math.round(percentSum);
    });
  },

  getSelectedPeriodDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.visiting-frequency-detail-widget-current', dateFormat);
  },


  getPriorPeriodDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.visiting-frequency-detail-widget-compare.prior-period', dateFormat);
  },

  getPriorYearDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.visiting-frequency-detail-widget-compare.prior-year', dateFormat);
  },

  getPieChartLegendText(widgetTag) {
    return element(by.tagName(widgetTag)).all(by.className('chart-legend-label')).getText();
  }
};

function getFrameDateRange(widgetTag, cssSelector, dateFormat) {
  let date = element(by.tagName(widgetTag)).element(by.css(cssSelector)).element(by.css('div.selected-period'));
  let dateText = date.getText();
  return dateText.then(dateTextString => {
    let formattedDate = dateSelector.makeDateArray(dateTextString, dateFormat);
    return formattedDate;
  });
}
