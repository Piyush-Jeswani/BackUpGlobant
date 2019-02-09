const tagName = 'tenant-conversion-table-widget';
const widgetColumnRepeater = 'item in (salesSummaryTableWidget.filteredItems = (salesSummaryTableWidget.items | sortObjectBy: salesSummaryTableWidget.orderBy : salesSummaryTableWidget.sortColumnIndex : salesSummaryTableWidget.sortChildColumn : salesSummaryTableWidget.childProperty | filter: salesSummaryTableWidget.filterItems))';
const tableWidget = require('./common/table-widget.js');

module.exports = {
  columnHeadings: ['Selected period conversion', 'Change', 'Prior period conversion', 'Change', 'Prior year conversion'],

  widgetTitle() {
    return element(by.tagName(tagName)).element(by.className('widget-title'));
  },

  clickExportButton() {
    element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a')).click();
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

  getFilteredTenantList() {
    return tableWidget.getFilteredItemList(tagName, widgetColumnRepeater);
  },

  getFilter() {
    return tableWidget.getFilter(tagName, 'salesSummaryTableWidget.filterItems');
  },

  getCurrentColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="salesSummaryTableWidget.doOrderBy(0, \'value\')"]'));
  },

  getPeriodChangeColumnHeader() {
    return element(by.tagName(tagName)).all(by.css('[ng-click="salesSummaryTableWidget.doOrderBy($index + 1, \'comparison\', \'percentageChangeReal\')"]')).first();
  },

  getPeriodColumnHeader() {
    return element(by.tagName(tagName)).all(by.css('[ng-click="salesSummaryTableWidget.doOrderBy($index + 1, \'value\')"]')).first();
  },
  getYearChangeColumnHeader() {
    return element(by.tagName(tagName)).all(by.css('[ng-click="salesSummaryTableWidget.doOrderBy($index + 2, \'comparison\', \'percentageChangeReal\')"]')).last();
  },

  getYearColumnHeader() {
    return element(by.tagName(tagName)).all(by.css('[ng-click="salesSummaryTableWidget.doOrderBy($index + 2, \'value\')"]')).last();
  },

  getColumnText(columnBinding) {
    return tableWidget.getColumnByBinding(tagName, widgetColumnRepeater, columnBinding).getText();
  },

  // use formatDeltaColumn w/includeZeroes parameter instead of formatNumberArray - incoming data is an array of percentage values
  getCurrentPeriodColumn() {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.periodValues[0].value | formatNumber:salesSummaryTableWidget.returnDataPrecision:salesSummaryTableWidget.numberFormatName | dashIfNull '));
  },

  // use formatDeltaColumn w/includeZeroes parameter instead of formatNumberArray - incoming data is an array of percentage values
  getPriorPeriodColumn() {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.periodValues[1].value | formatNumber:salesSummaryTableWidget.returnDataPrecision:salesSummaryTableWidget.numberFormatName | dashIfNull '));
  },

  // use formatDeltaColumn w/includeZeroes parameter instead of formatNumberArray - incoming data is an array of percentage values
  getPriorYearColumn() {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.periodValues[2].value | formatNumber:salesSummaryTableWidget.returnDataPrecision:salesSummaryTableWidget.numberFormatName | dashIfNull '));
  },

  getPriorPeriodDeltaColumn(dashAsZero) {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.periodValues[1].comparison.percentageChange | formatNumber : 1 : salesSummaryTableWidget.numberFormatName'), dashAsZero);
  },

  getPriorYearDeltaColumn(dashAsZero) {
    return tableWidget.formatDeltaColumn(this.getColumnText('::item.periodValues[2].comparison.percentageChange | formatNumber : 1 : salesSummaryTableWidget.numberFormatName'), dashAsZero);
  },

  calculatePriorPeriodDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorPeriodColumn());
  },

  calculatePriorYearDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorYearColumn());
  },

  // used in translation checks
  getFilterBarText() {
    return tableWidget.getFilter(tagName, 'salesSummaryTableWidget.filterItems').getAttribute('placeholder');
  },

  getExpandButton() {
    return tableWidget.getExpandButton(tagName);
  },

  // used in translation checks
  getExpandButtonText() {
    return tableWidget.getExpandButtonText(tagName);
  },

  // used in translation checks
  getContractButtonText() {
    return tableWidget.getContractButtonText(tagName);
  }
};

