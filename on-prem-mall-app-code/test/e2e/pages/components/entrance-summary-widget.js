const tagName = 'entrance-contribution-widget';
const widgetColumnRepeater = 'entranceItem in (vm.filteredEntrances = (vm.entranceItems | orderBy: vm.sortType | filter: vm.filterEntrances))';
const tableWidget = require('./common/table-widget.js');

module.exports = {

  columnHeadings: ['Selected period', 'Change', 'Prior period Traffic', 'Change', 'Prior year Traffic'],

  widgetTitle() {
    return element(by.tagName(tagName)).element(by.className('widget-title'));
  },

  clickExportButton() {
    const exportButton = element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getCustomDashboardButton() {
    return element(by.tagName(tagName)).element(by.css('div.add-to-custom-dashboard'));
  },

  clickExpandButtonIfPresent() {
    return tableWidget.clickExpandButton(tagName);
  },

  clickHeaderAndGetList() {
    return tableWidget.clickHeaderAndGetList(tagName, widgetColumnRepeater);
  },

  getFilteredItemList() {
    return tableWidget.getColumnByBinding(tagName, widgetColumnRepeater, 'entranceItem.name').getText();
  },

  getFilteredEntranceList() {
    return tableWidget.getColumnByBinding(tagName, widgetColumnRepeater, 'entranceItem.name').getText();
  },

  getFilter() {
    return tableWidget.getFilter(tagName, 'vm.filterEntrances');
  },

  getCurrentColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="vm.orderBy(\'traffic*1\')"]'));
  },

  getPeriodChangeColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="vm.orderBy(\'change*1\')"]'));
  },

  getPeriodColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="vm.orderBy(\'trafficCompare*1\')"]'));
  },
  getYearChangeColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="vm.orderBy(\'changeYear*1\')"]'));
  },

  getYearColumnHeader() {
    return element(by.tagName(tagName)).element(by.css('[ng-click="vm.orderBy(\'trafficYearCompare*1\')"]'));
  },

  getColumnText(columnBinding) {
    return tableWidget.getColumnByBinding(tagName, widgetColumnRepeater, columnBinding).getText();
  },

  getCurrentPeriodColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('entranceItem.traffic | formatNumber:0:vm.numberFormatName'));
  },

  getPriorPeriodColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('entranceItem.trafficCompare | formatNumber:0:vm.numberFormatName'));
  },

  getPriorYearColumn() {
    return tableWidget.formatNumberArray(this.getColumnText('entranceItem.trafficYearCompare | formatNumber:0:vm.numberFormatName'));
  },

  getPriorPeriodDeltaColumn() {
    return tableWidget.formatDeltaColumn(element(by.tagName(tagName)).all(by.repeater(widgetColumnRepeater).column('vm.displayPercentageChangeLabel( entranceItem.change, vm.numberFormatName )')).getText());
  },

  getPriorYearDeltaColumn() {
    return tableWidget.formatDeltaColumn(element(by.tagName(tagName)).all(by.repeater(widgetColumnRepeater).column('vm.displayPercentageChangeLabel( entranceItem.changeYear, vm.numberFormatName )')).getText());
  },

  calculatePriorPeriodDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorPeriodColumn());
  },

  calculatePriorYearDeltaColumn() {
    return tableWidget.calculateDelta(this.getCurrentPeriodColumn(), this.getPriorYearColumn());
  },

  // used in translation checks
  getFilterBarText() {
    return tableWidget.getFilter(tagName, 'vm.filterEntrances').getAttribute('placeholder');
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
