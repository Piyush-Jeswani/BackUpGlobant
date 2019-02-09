'use strict';

const widgetTag = 'daily-performance-widget';
const _ = require('underscore');

const tableSelector = 'ag-summary-table.daily-performance-widget-table.showTable';

module.exports = {

  getTableHeaders() {
    return ['sales', 'sales_contribution', 'traffic', 'traffic_contribution', 'labor_hours', 'labor_hours_contribution', 'transactions', 'transactions_contribution',
      'conversion', 'star', 'dayOfWeek'];
  },

  widgetTitle() {
    return element(by.tagName(widgetTag)).element(by.className('widget-title')).element(by.css('span.ng-binding'));
  },

  getExpandTableButton() {
    let buttonList = element(by.tagName(widgetTag)).all(by.className('table-toggle'));
    let activeButton =  buttonList.filter(button => {
      return button.isDisplayed();
    }).first();
    return activeButton.element(by.css('a'));
  },

  isTableDisplayed() {
    let table = element(by.tagName(widgetTag)).element(by.css('ag-summary-table.daily-performance-widget-table.showTable'));
    return table.isPresent();
  },

  getHeaderColumnNum(metricColumn) {
    switch (metricColumn.toLowerCase()) {
      case 'dayofweek':
        return 0;
      case 'sales':
        return 1;
      case 'sales_contribution':
        return 2;
      case 'traffic':
        return 3;
      case 'traffic_contribution':
        return 4;
      case 'labor_hours':
        return 5;
      case 'labor_hours_contribution':
        return 6;
      case 'transactions':
        return 7;
      case 'transactions_contribution':
        return 8;
      case 'conversion':
        return 9;
      case 'star':
        return 10;
      default :
        throw new Error(`${metricColumn} is not a valid option for metricColumn.`);
    }
  },

  sortTableBy(metricColumn) {
    let columnNum = this.getHeaderColumnNum(metricColumn);
    // let columnHeader = element(by.tagName(widgetTag)).element(by.css('ag-summary-table.daily-performance-widget-table.showTable')).all(by.css('div.ag-header-cell')).get(columnNum);
    let columnHeader = element(by.tagName(widgetTag)).element(by.css('ag-summary-table.daily-performance-widget-table.showTable')).element(by.css('div.ag-header-container')).all(by.css('span.ag-header-cell-text')).get(columnNum);
    return columnHeader.click();
  },

  getColumnData(metricColumn) {
    return new Promise((resolve, reject) => {
      let tableElement = element(by.tagName(widgetTag)).element(by.css(tableSelector));

      let tableItems = tableElement.all(by.css(`div[col-id="${metricColumn}"]`));

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

  openDaySelectorDropdown() {
    return new Promise((resolve, reject) => {
      let dropdown =  element(by.tagName(widgetTag)).element(by.tagName('day-selector')).element(by.css('button'));
      browser.executeScript('window.scrollTo(0, 0);').then(() => {
        dropdown.click().then(resolve).catch(reject);
      }).catch(reject);
    });
  },

  getDaySelectorOptions() {
    this.openDaySelectorDropdown();
    return element(by.tagName(widgetTag)).element(by.tagName('day-selector')).all(by.repeater('item in vm.items track by $index')).getText();
  },

  getColumnDataAsNumber(metricColumn) {
    return this.getColumnData(metricColumn).then(columnData => {
      let numberArray = [];
      columnData.forEach(columnDatum => {
        columnDatum = Number(columnDatum.replace(/\./g, '').replace(/,/g, '.').replace('%', ''));

        columnDatum /= 100;

        numberArray.push(columnDatum);
      });
      return numberArray;
    });
  },

  getHighestYAxisValue(position, yAxisPosition) {
    let highestValue;
    if (position === 'left') {
      highestValue = element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('left-chart')).element(by.className('highcharts-yaxis-labels')).all(by.css('text')).last().getText();
    } else if (position === 'right') {
      if (yAxisPosition === 'left') {
        highestValue = element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).all(by.className('highcharts-yaxis-labels')).first().all(by.css('text')).last().getText();
      } else if (yAxisPosition === 'right') {
        highestValue = element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).all(by.className('highcharts-yaxis-labels')).last().all(by.css('text')).last().getText();
      }
    }

    return highestValue.then(value => {
      return Number(value);
    });
  },

  getChartTitle(position) {
    if (position === 'left') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('left-chart')).element(by.className('chart-title')).element(by.css('h3')).getText();
    } else if (position === 'right') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).element(by.className('chart-title')).element(by.css('h3')).getText();
    }
  },

  getChartYAxisLabels(position) {
    if (position === 'left') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('left-chart')).element(by.className('y-axis-titles')).getText();
    } else if (position === 'right') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).element(by.className('y-axis-titles')).getText();
    }
  },

  getChartXAxisLabels(position) {
    if (position === 'left') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('left-chart')).element(by.className('chart-body')).element(by.className('highcharts-xaxis-labels')).all(by.css('text')).getText();
    } else if (position === 'right') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).element(by.className('chart-body')).element(by.className('highcharts-xaxis-labels')).all(by.css('text')).getText();
    }
  },

  getChartLegend(position) {
    if (position === 'left') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('left-chart')).element(by.className('chart-body')).element(by.className('chart-legend')).all(by.css('span.chart-legend-label')).getText();
    } else if (position === 'right') {
      return element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className('right-chart')).element(by.className('chart-body')).element(by.className('chart-legend')).all(by.css('span.chart-legend-label')).getText();
    }
  },

  getChartTooltip(position) {
    let chartClass;
    if (position === 'left') {
      chartClass = 'left-chart';
    } else if (position === 'right') {
      chartClass = 'right-chart';
    }

    let chartSeries =  element(by.tagName(widgetTag)).element(by.className(chartClass)).element(by.className('highcharts-container')).element(by.className('highcharts-series-group')).element(by.css('g.highcharts-markers')).all(by.css('path'));
    chartSeries.each(point => {
      browser.actions().mouseMove(point).perform();
    });

    let tooltips = element(by.tagName(widgetTag)).element(by.className('data-section')).element(by.className(chartClass)).element(by.className('chart-body')).all(by.css('div.highcharts-tooltip'));
    return tooltips.filter(tooltip => {
      return tooltip.isDisplayed();
    }).all(by.className('tooltip-option')).getText();
  },

  getChartClass(position) {
    let chartClass;
    if (position === 'left') {
      chartClass = 'left-chart';
    } else if (position === 'right') {
      chartClass = 'right-chart';
    }
    return chartClass;
  },

  getLineNum(metric) {
    switch (metric.toLowerCase()) {
      // left chart
      case 'traffic':
        return 0;
      case 'sales':
        return 1;
      case 'labor':
        return 2;
      case 'transactions':
        return 3;
      // right chart
      case 'conversion':
        return 0;
      case 'star':
        return 1;
      default :
        throw new Error(`${metric} is not a valid option for metric.`);
    }
  },

  getChartLineLength(position, metric) {
    let chartClass = this.getChartClass(position);
    let lineNum = this.getLineNum(metric);
    let points = element(by.tagName(widgetTag)).element(by.className(chartClass)).element(by.className('highcharts-container')).element(by.className('highcharts-series-group')).all(by.css('g.highcharts-markers')).get(lineNum).all(by.css('path'));
    return points.then(linePoints => {
      return linePoints.length;
    });
  },

  getDayRow(day) {
    switch (day.toLowerCase()) {
      case 'all':
        return 0;
      case 'weekend':
        return 1;
      case 'sunday':
        return 2;
      case 'monday':
        return 3;
      case 'tuesday':
        return 4;
      case 'wednesday':
        return 5;
      case 'thursday':
        return 6;
      case 'friday':
        return 7;
      case 'saturday':
        return 8;
      default :
        throw new Error(`${day} is not a valid day.`);
    }
  },

  selectDay(day) {
    let dayRow = this.getDayRow(day);
    return element(by.tagName(widgetTag)).element(by.tagName('day-selector')).all(by.repeater('item in vm.items track by $index').row(dayRow)).click();
  },

  getTableHeaderMetricLabels() {
    return element(by.tagName(widgetTag)).all(by.css('div.col-md-6 > div.col-md-12.chart-body > div.chart-legend > span > label')).getText();
  },

  getTableDayLabels() {
    return new Promise((resolve, reject) => {
      let tableElement = element(by.tagName(widgetTag)).element(by.css(tableSelector));

      tableElement.all(by.css('div[col-id="dayOfWeek"]')).getText()
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
    return element(by.tagName(widgetTag)).element(by.css('ag-summary-table.daily-performance-widget-table.showTable')).all(by.css('div.ag-cell.ag-cell-not-inline-editing.dayOfWeek.text-left.ag-cell-value > span')).last().getText();
  },

  getCustomDashboardButton() {
    return element(by.tagName(widgetTag)).element(by.css('div.add-to-custom-dashboard'));
  },

};
