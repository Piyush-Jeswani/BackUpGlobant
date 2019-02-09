'use strict';

const lineChartWidget = require('./common/line-high-chart-widget.js');

const tagName = 'traffic-per-weekday-widget';
const tableSelector = 'ag-summary-table.traffic-per-weekday-widget-table-area.showTable';
const _ = require('underscore');

module.exports = {

  getDayHeaders() {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  },

  getMondayHeaders() {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  },

  sortedDayHeaders() {
    return this.getDayHeaders().reverse();
  },

  sortedMondayHeaders() {
    return this.getMondayHeaders().reverse();
  },

  widgetTitle() {
    return element(by.tagName(tagName)).element(by.className('widget-title-name'));
  },

  getExpandTableButton() {
    let buttonList = element(by.tagName(tagName)).all(by.className('table-toggle'));
    let activeButton =  buttonList.filter(button => {
      return button.isDisplayed();
    }).first();
    return activeButton.element(by.css('a'));
  },

  isTableDisplayed() {
    let table = element(by.tagName(tagName)).element(by.className('ag-summary-table'));
    return table.isDisplayed();
  },

  openDaySelectorDropdown() {
    let dropdown =  element(by.tagName(tagName)).element(by.tagName('day-selector')).element(by.css('button'));
    dropdown.click();
  },

  getDayRow(day) {
    switch (day.toLowerCase()) {
      case 'hours':
        return 0;
      case 'all':
        return 1;
      case 'weekend':
        return 2;
      case 'sunday':
        return 3;
      case 'monday':
        return 4;
      case 'tuesday':
        return 5;
      case 'wednesday':
        return 6;
      case 'thursday':
        return 7;
      case 'friday':
        return 8;
      case 'saturday':
        return 9;
      default :
        throw new Error(`${day} is not a valid day.`);
    }
  },

  selectDay(day) {
    let dayRow = this.getDayRow(day);
    element(by.tagName(tagName)).element(by.tagName('day-selector')).all(by.repeater('item in vm.items track by $index').row(dayRow)).click();
  },


  getDaySelectorOptions() {
    this.openDaySelectorDropdown();
    return element(by.tagName(tagName)).element(by.tagName('day-selector')).all(by.repeater('item in vm.items track by $index')).getText();
  },

  openMetricSelectorDropdown() {
    let dropdown =  element(by.tagName(tagName)).element(by.css('span.select-chart-metric-dropdown')).element(by.css('button'));
    dropdown.click();
  },

  getMetricSelectorOptions() {
    this.openMetricSelectorDropdown();
    return element(by.tagName(tagName)).element(by.css('span.select-chart-metric-dropdown')).element(by.css('ul.dropdown-menu')).all(by.repeater('metric in vm.availableMetrics')).getText();
  },

  getMetricRowNum(metric) {
    switch (metric.toLowerCase()) {
      case 'traffic':
        return 0;
      case 'sales':
        return 1;
      case 'conversion':
        return 2;
      case 'ats':
        return 3;
      case 'star':
        return 4;
      default:
        throw new Error(`${metric} is not a valid option for metric.`);
    }
  },

  selectMetric(metric) {
    let metricNum = this.getMetricRowNum(metric);
    this.openMetricSelectorDropdown();
    browser.waitForAngular();
    let metricList = element(by.tagName(tagName)).element(by.css('span.select-chart-metric-dropdown')).all(by.css('ul.dropdown-menu')).all(by.repeater('metric in vm.availableMetrics').row(metricNum));
    metricList.click();
  },

  getHeaderColumnNum(metricColumn) {
    switch (metricColumn.toLowerCase()) {
      case 'dayofweek':
        return 0;
      case 'traffic':
        return 1;
      case 'traffic_change_numeric':
        return 2;
      case 'sales':
        return 3;
      case 'sales_change_numeric':
        return 4;
      case 'conversion':
        return 5;
      case 'conversion_change_numeric':
        return 6;
      case 'ats':
        return 7;
      case 'ats_change_numeric':
        return 8;
      case 'star':
        return 9;
      case 'star_change_numeric':
        return 10;
      default :
        throw new Error(`${metricColumn} is not a valid option for metricColumn.`);
    }
  },

  getTableHeaders() {
    return ['sales', 'sales_change_numeric', 'traffic', 'traffic_change_numeric', 'ats', 'ats_change_numeric', 'star', 'star_change_numeric',
      'conversion', 'conversion_change_numeric', 'dayOfWeek'];
  },

  sortTableBy(metricColumn) {
    let columnNum = this.getHeaderColumnNum(metricColumn);
    let columnHeader = element(by.tagName(tagName)).element(by.css(tableSelector)).element(by.css('div.ag-header-container')).all(by.css('span.ag-header-cell-text')).get(columnNum);
    return columnHeader.click();
  },

  getColumnData(metricColumn) {
    return new Promise((resolve, reject) => {
      let tableElement = element(by.tagName(tagName)).element(by.css(tableSelector));
      let tableItems = tableElement.all(by.css(`div[col-id="${metricColumn}"]`));
      // console.log(tableItems);
      let items = tableItems.map(tableItem => {
        let parentRow = tableItem.element(by.xpath('..'));

        return {
          text: tableItem.getText(),
          index: parentRow.getAttribute('index'),
          rowIndex: parentRow.getAttribute('row-index')
        };
      });

      // Blame protractor for this. Everything returns a promise, even though you're using the same resource for all queries (the browser window)
      items.then(resolvedItems => {
        let indexPromises = _.pluck(resolvedItems, 'index');
        let rowIndexPromises = _.pluck(resolvedItems, 'rowIndex');

        Promise.all([...indexPromises, ...rowIndexPromises])
          .then(results => {
            let indexResults = results.slice(0, indexPromises.length);
            let rowIndexResults = results.slice(indexPromises.length, results.length);

            _.each(resolvedItems, (resolvedItem, i) => {
              resolvedItem.order = indexResults[i];

              if (resolvedItem.order === undefined) {
                resolvedItem.order = rowIndexResults[i];
              }

              resolvedItem.order = Number(resolvedItem.order);
            });

            let orderedItems = _.sortBy(resolvedItems, 'order');
            let orderedValues = _.pluck(orderedItems, 'text');
            orderedValues = _.without(orderedValues, '');

            resolve(orderedValues);
          })
          .catch(error => {
            console.error(error);
            return reject(error);
          });
      });
    });
  },

  getMetricColumnNum(metricColumn) {
    let metric = metricColumn.toLowerCase();
    if (metric === 'traffic') {
      return 0;
    } else if (metric === 'sales') {
      return 1;
    } else if (metric === 'conversion') {
      return 2;
    } else if (metric === 'ats') {
      return 3;
    } else if (metric === 'star') {
      return 4;
    }
  },

  getDeltaColumnNum(metricColumn) {
    let deltaMetric = metricColumn.toLowerCase();
    if (deltaMetric === 'traffic-delta') {
      return 0;
    } else if (deltaMetric === 'sales-delta') {
      return 1;
    } else if (deltaMetric === 'conversion-delta') {
      return 2;
    } else if (deltaMetric === 'ats-delta') {
      return 3;
    } else if (deltaMetric === 'star-delta') {
      return 4;
    }
  },

  getTableHeaderMetricLabels() {
    return element(by.tagName(tagName)).all(by.css('ag-summary-table.traffic-per-weekday-widget-table-area.showTable div.ag-header.ag-pivot-off > div.ag-header-viewport div.ag-header-cell.ag-header-cell-sortable span.ag-header-cell-text')).getText();
  },

  getTableDayLabels() {
    return new Promise((resolve, reject) => {
      return element(by.tagName(tagName)).all(by.css('traffic-per-weekday-widget ag-summary-table.traffic-per-weekday-widget-table-area.showTable div.ag-body-container div[role="row"] >div[col-id="dayOfWeek"]'))
        .getText()
        .then(days => {
          let daysOfWeek = _.without(days, '');
          daysOfWeek = _.without(daysOfWeek, 'AVERAGE');
          daysOfWeek = _.without(daysOfWeek, 'PROMEDIO');
          resolve(daysOfWeek);
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  },

  getTableFooterLabel() {
    return element(by.tagName(tagName)).all(by.css('traffic-per-weekday-widget ag-summary-table.traffic-per-weekday-widget-table-area.showTable div.ag-body-container div[role="row"] >div[col-id="dayOfWeek"]')).last().getText();
  },

  clickExportButton() {
    let exportButton = element(by.tagName(tagName)).element(by.className('export-widget')).element(by.css('a'));
    exportButton.click();
  },

  getCustomDashboardButton() {
    return element(by.tagName(tagName)).element(by.css('div.add-to-custom-dashboard'));
  },

  getHighestYAxisValue() {
    return lineChartWidget.getHighestYAxisValue(tagName);
  },

  getSelectedPeriodDataValues() {
    return lineChartWidget.getSelectedPeriodDataValuesAsNumbers(tagName);
  },

  getPriorPeriodDataValues() {
    return lineChartWidget.getPriorPeriodDataValuesAsNumbers(tagName);
  },

  getPriorYearDataValues() {
    return lineChartWidget.getPriorYearDataValuesAsNumbers(tagName);
  },

  getXAxisLabels() {
    return element(by.tagName(tagName)).element(by.className('highcharts-xaxis-labels')).all(by.css('tspan')).getText();
  },

  getLegendTextLowerCase() {
    return lineChartWidget.getLegendTextLowerCase(tagName);
  },

  // used in translation checks
  getTooltipTotalText() {
    return lineChartWidget.getBarChartTooltipTotalText(tagName);
  }
};
