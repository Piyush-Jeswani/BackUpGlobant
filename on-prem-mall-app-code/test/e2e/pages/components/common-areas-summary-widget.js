const tagName = 'other-areas-traffic-table-widget';
const widgetColumnRepeater = 'item in (trafficTableWidget.filteredItems = (trafficTableWidget.items ';
const tableWidget = require('./common/table-widget.js');

module.exports = {

  columnHeadings: ['Selected period Traffic', 'Change', 'Prior period Traffic', 'Change', 'Prior year Traffic'],

  widgetTitle() {
    return element(by.tagName(tagName)).element(by.className('widget-title'));
  },

  clickExportButton() {
    const exportButton = element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  clickExpandButtonIfPresent() {
    return tableWidget.clickExpandButton(tagName);
  },

  clickHeaderAndGetList() {
    return tableWidget.clickHeaderAndGetList(tagName, widgetColumnRepeater);
  },

  getFilteredItemList() {
    return tableWidget.getFilteredItemList(tagName, widgetColumnRepeater);
  },

  getFilteredAreaList() {
    return tableWidget.getFilteredItemList(tagName, widgetColumnRepeater);
  },

  getFilter() {
    return tableWidget.getFilter(tagName, 'trafficTableWidget.filterItems');
  },

  getCurrentColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="trafficTableWidget.orderBy(\'traffic\')"]'));
  },

  getPeriodChangeColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="trafficTableWidget.orderBy(\'comparisons\',0,\'percentageChangeReal\')"]'));
  },

  getPeriodColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="trafficTableWidget.orderBy(\'totals\', 0)"]'));
  },
  getYearChangeColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="trafficTableWidget.orderBy(\'comparisons\',1,\'percentageChangeReal\')"]'));
  },

  getYearColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="trafficTableWidget.orderBy(\'totals\', 1)"]'));
  },

  getColumnText(columnBinding) {
    return tableWidget.getColumnByBinding(tagName, widgetColumnRepeater, columnBinding).getText();
  },

  getCurrentPeriodColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('::item.traffic | formatNumber:0:trafficTableWidget.numberFormatName '));
  },

  getPriorPeriodColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('::item.totals[0] | formatNumber:0:trafficTableWidget.numberFormatName '));
  },

  getPriorYearColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('::item.totals[1] | formatNumber:0:trafficTableWidget.numberFormatName '));
  },

  getPriorPeriodDeltaColumn() {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.comparisons[0].percentageChange | formatNumber : 1 : trafficTableWidget.numberFormatName '));
  },

  getPriorYearDeltaColumn() {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.comparisons[1].percentageChange | formatNumber : 1 : trafficTableWidget.numberFormatName '));
  },

  calculatePriorPeriodDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorPeriodColumn());
  },

  calculatePriorYearDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorYearColumn());
  },

  // used in translation checks
  getFilterBarText() {
    return tableWidget.getFilter(tagName, 'trafficTableWidget.filterItems').getAttribute('placeholder');
  },

  getExpandButton() {
    return tableWidget.getExpandButton(tagName);
  },

  // used in translation checks
  getExpandButtonText() {
    return tableWidget.getExpandButtonText(tagName);
  }
};

