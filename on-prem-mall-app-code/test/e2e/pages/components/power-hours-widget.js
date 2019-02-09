'use strict';

const tableWidget = require('./common/table-widget.js');

const _ = require('underscore');

const tagName = 'power-hours-widget';

module.exports = {

  getExpectedDayHeaders() {
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  },

  getExpectedMondayHeaders() {
    return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  },

  getExpectedHours() {
    return ['0 - 1', '1 - 2', '2 - 3', '3 - 4', '4 - 5', '5 - 6', '6 - 7',
      '7 - 8', '8 - 9', '9 - 10', '10 - 11', '11 - 12', '12 - 13', '13 - 14', '14 - 15', '15 - 16',
      '16 - 17', '17 - 18', '18 - 19', '19 - 20', '20 - 21', '21 - 22', '22 - 23', '23 - 0'];
  },

  widgetTitle() {
    return element(by.tagName(tagName)).element(by.className('widget-title')).element(by.className('ng-binding'));
  },

  clickExportButton() {
    const exportButton = element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  // ***
// * Do not remove this function - it is for custom dashboard test.

  getCustomDashboardButton() {
    return element(by.tagName(tagName)).element(by.css('div.add-to-custom-dashboard'));
  },

/**
 * Finds the index for the specified metric in the metric dropdown.
 * At organization level, the PH widget contains more metrics
 * (Average traffic per site and Average sales per site). This function returns
 * the index based on the isOrgLevel param
 *
 * @param {boolean} isOrgLevel - A flag indicating if this is running in an org level context
 * @returns {number} The index
 */
  getMetricRowNum(metric, isOrgLevel) {
    switch (metric.toLowerCase()) {
      case 'average traffic':
        return 0;
      case 'traffic%':
      case 'traffic %':
        return isOrgLevel ? 2 : 1;
      case 'average sales':
      case 'sales':
        return isOrgLevel ? 3 : 2;
      case 'conversion':
        return isOrgLevel ? 5 : 3;
      case 'ats':
        return isOrgLevel ? 6 : 4;
      case 'star':
        return isOrgLevel ? 7 : 5;
      default:
        throw new Error(`${metric} is not a valid option for metric.`);
    }
  },

  openMetricDropdown() {
    element(by.tagName(tagName)).element(by.css('metric-selector multi-select-list button')).click();
  },

  getMetricListItem(metricNum, repeater) {
    return element(by.tagName(tagName)).element(by.className('dropdown-menu')).all(by.repeater(repeater).row(metricNum));
  },

  selectMetricDropdown(metric, isOrgLevel = false) {
    const metricNum = this.getMetricRowNum(metric, isOrgLevel);
    this.openMetricDropdown();
    const metricListItem = this.getMetricListItem(metricNum, 'option in vm.options ');
    metricListItem.click();
  },

  getMetricOptions() {
    this.openMetricDropdown();
    const metricList = element(by.tagName(tagName)).element(by.className('dropdown-menu')).all(by.repeater('item in vm.items track by $index')).getText();
    return metricList;
  },

  getWeeklyTotalTraffic() {
    const totalRowTotal = element(by.tagName(tagName))
      .element(by.className('power-hours-table'))
      .element(by.className('weekly-total-cell'))
      .getText();
    return totalRowTotal.then(num => {
      return Number(num.replace(/\./g, '').replace(/,/g, '.'));
    });
  },

  // used in translation checks
  getChartLegendText(volume) {
    if (volume.toLowerCase() === 'medium') {
      return element(by.tagName(tagName)).element(by.className('power-hours-table-legend')).element(by.css('div.medium-traffic')).getText();
    } else if (volume.toLowerCase() === 'high') {
      return element(by.tagName(tagName)).element(by.className('power-hours-table-legend')).element(by.css('div.high-traffic')).getText();
    }
    throw new Error(`${volume} is not a valid option for volume.`);
  },

  getDayHeaders() {
    return element(by.tagName(tagName))
      .element(by.className('ag-header-viewport'))
      .all(by.className('ag-header-row'))
      .all(by.className('ag-header-group-cell'))
      .getText().then(days => {
        let daysOfWeek = _.without(days, '');
        daysOfWeek = _.without(daysOfWeek, 'AVERAGE');
        daysOfWeek = _.without(daysOfWeek, 'TOTAL');

        return daysOfWeek;
      });
  },

  getTotalHeader() {
    return element(by.css('.ag-pivot-off .ag-pinned-right-header .ag-header-group-text')).getText();
  },

  getRowHeaders() {
    return element(by.tagName(tagName))
      .all(by.css('div.ag-bl-center-row div.ag-body > div.ag-body-viewport-wrapper div.ag-row div.ag-cell.ag-hour-column.ag-cell-value'))
      .all(by.css('div.hour-row-header'))
      .getText();
  },

  getTotalRow() {
    return element(by.tagName(tagName))
      .all(by.css('div.ag-bl-center-row div.ag-body > div.ag-body-viewport-wrapper div.ag-row > div.ag-cell.ag-cell-not-inline-editing.ag-cell-no-focus > div'))
      .last();
  },

  getTotalRowHeader() {
    return element(by.tagName(tagName))
      .element(by.className('power-hours-table'))
      .element(by.className('total-row-header'));
  },

  getTotalRowSum() {
    const totalRowSum = element(by.tagName(tagName))
      .all(by.className('daily-total-value'))
      .getText();
    return totalRowSum.then(array => {
      let formattedNumbers = [];
      array.forEach(traffic => {
        const newNoFormat = traffic.replace(/%/, '').replace(/\$/, '').replace(/\./g, '').replace(/,/g, '');
        const num = Number(newNoFormat);
        formattedNumbers.push(num);
      });
      console.log('formattedNumbers', formattedNumbers);
      return getRowSum(formattedNumbers);
    });
  },

  getHourRowSum(rowNumber) {
    const hourRowArray = element(by.tagName('power-hours-widget'))
    .all(by.className(`hour-row-value-${rowNumber}`))
    .getText();
    return hourRowArray.then(array => {
      let numberArray = [];
      array.forEach(number => {
        // format string, change to number, and round to one decimal
        const num = Number(number.replace(/\./g, '').replace(/,/g, '.').replace(/%/, '').replace(/\$/, ''));
        numberArray.push(num);
      });
      return getRowSum(numberArray);
    });
  },

  getTotalColumnArray() {
    const totalRowArray = element(by.tagName('power-hours-widget'))
      .all(by.className('total-hour-value'))
      .getText();
    return totalRowArray.then(array => {
      let totalNumberArray = [];
      array.forEach(number => {
        const num = Number(number.replace(/\./g, '').replace(/,/g, '.').replace(/%/, '').replace(/\$/, ''));
        totalNumberArray.push(num);
      });
      return totalNumberArray;
    });
  },

  getColumnData(columnName) {
    return new Promise((resolve, reject) => {
      let tableElement = element(by.tagName(tagName)).element(by.className('power-hours-table'));

      let tableItems = tableElement.all(by.css(`div[col-id="${columnName}"]`));

      let items = tableItems.map(tableItem => {
        let parentRow = tableItem.element(by.xpath('..'));

        return {
          text: tableItem.getText(),
          index: parentRow.getAttribute('index'),
          rowIndex: parentRow.getAttribute('row-index')
        };
      });
    });
  },

  getTotalColumnList() {
    return element(by.tagName('power-hours-widget'))
      .all(by.className('total-hour-value'));
  },

  getTotalColumnRowText(rowNumber) {
    const totalRowArray = element(by.tagName('power-hours-widget'))
      .all(by.className('total-hour-value'))
      .all(by.className(`row-${rowNumber}`))
      .last()
      .getText();
    return totalRowArray.then(val => {
      let totalNumberArray = [];
      return Number(val.replace(/\./g, '').replace(/,/g, '.').replace(/%/, '').replace(/\$/, ''));
    });
  },

  getTotalColumnSum() {
    return this.getTotalColumnArray().then(array => {
      return getRowSum(array);
    });
  }
};


function getRowSum(elementIDText) {
  const row = elementIDText;
  const sum = row.reduce((a, b) => {
    return a + b;
  });
  return sum;
}

