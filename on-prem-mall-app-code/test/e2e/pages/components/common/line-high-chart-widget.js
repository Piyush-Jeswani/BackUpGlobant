'use strict';

const dateSelector = require('../time-period-picker.js');

module.exports = {

  getHighestYAxisValue(widgetTag) {
    const valueElements = element(by.id(widgetTag)).element(by.className('highcharts-yaxis-labels')).all(by.css('text'));
    const valueElementStrings = valueElements.getText();

    return valueElementStrings.then(elements => {
      let maxValue = 0;
      elements.forEach(value => {
        let num = Number(value.replace(/\./g, '').replace(/,/g, '.').replace('%', ''));
        if (num > maxValue) {
          maxValue = num;
        }
      });
      return maxValue;
    });
  },

  getXAxisDates(widgetTag, dateFormat) {
    const dates = element(by.id(widgetTag)).element(by.className('highcharts-xaxis-labels')).all(by.css('text'));
    const dateStrings = dates.getText();
    return dateStrings.then(dateStringsArray => {
      let fullDateStringsArray = [];
      dateStringsArray.forEach(dateItem => {
        // highchart shows ... at the end of label when there are more labels to fit screan so check those as well
        if (dateItem.charAt(dateItem.length - 1) === '…') {
          const titles = element(by.id(widgetTag)).element(by.className('highcharts-xaxis-labels')).all(by.css('text')).all(by.css('title'));
          const dateStrings2 = titles.getText();
          dateStrings2.then(dateStrings2Array => {
            fullDateStringsArray.push(dateSelector.dateStringToObj(dateStrings2Array[0], dateFormat));
          });
        } else {
          fullDateStringsArray.push(dateSelector.dateStringToObj(dateItem, dateFormat));
        }
      });
      return fullDateStringsArray;
    });
  },

  getWeatherMetricLine(widgetTag, seriesNumber) {
    return element(by.id(widgetTag)).element(by.className(`highcharts-series highcharts-series-${seriesNumber}`));
  },

  getWeatherMetricPermission(widgetTag) {
    if (element(by.id(widgetTag)).element(by.className('highcharts-series highcharts-series-3')) !== 'undefined') {
      return true;
    }
    return false;
  },

  getSelectedPeriodDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-high-chart-widget-summary');
  },

  getSelectedPeriodDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-high-chart-widget-summary', dateFormat);
  },

  getSelectedPeriodDataValues(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 0);
  },

  getSelectedPeriodDataValuesAsNumbers(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 0, true);
  },

  getSelectedPeriodDataSum(widgetTag) {
    return getHighchartLineDataSum(widgetTag, 0);
  },

  getSelectedPeriodOverall(widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-high-chart-widget-summary');
  },

  getSelectedPeriodOverallAsText(widgetTag) {
    return getPeriodTotalOverallAsText(widgetTag, '.line-high-chart-widget-summary');
  },

  getPriorPeriodDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-high-chart-widget-compare.prior-period');
  },

  getPriorPeriodDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-high-chart-widget-compare.prior-period', dateFormat);
  },

  getPriorPeriodDataValues(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 1);
  },

  getPriorPeriodDataValuesAsNumbers(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 1, true);
  },

  getPriorPeriodDataSum(widgetTag) {
    return getHighchartLineDataSum(widgetTag, 1);
  },

  getPriorPeriodOverall(widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-high-chart-widget-compare.prior-period');
  },

  getPriorPeriodOverallAsText(widgetTag) {
    return getPeriodTotalOverallAsText(widgetTag, '.line-high-chart-widget-compare.prior-period');
  },

  getPriorPeriodDelta(widgetTag) {
    return getPeriodDelta(widgetTag, '.line-high-chart-widget-compare.prior-period');
  },

  getPriorYearDateRangeText(widgetTag) {
    return getFrameDateRangeText(widgetTag, '.line-high-chart-widget-compare.prior-year');
  },

  getPriorYearDateRange(widgetTag, dateFormat) {
    return getFrameDateRange(widgetTag, '.line-high-chart-widget-compare.prior-year', dateFormat);
  },

  getPriorYearDataValues(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 2);
  },

  getPriorYearDataValuesAsNumbers(widgetTag) {
    return getHighchartLineDataValues(widgetTag, 2, true);
  },

  getPriorYearDataSum(widgetTag) {
    return getHighchartLineDataSum(widgetTag, 2);
  },

  getPriorYearOverall(widgetTag) {
    return getPeriodTotalOverall(widgetTag, '.line-high-chart-widget-compare.prior-year');
  },

  getPriorYearOverallAsText(widgetTag) {
    return getPeriodTotalOverallAsText(widgetTag, '.line-high-chart-widget-compare.prior-year');
  },

  getPriorYearDelta(widgetTag) {
    return getPeriodDelta(widgetTag, '.line-high-chart-widget-compare.prior-year');
  },

  calculateDelta(selectedPeriodTotal, priorPeriodTotal) {
    return protractor.promise.all([selectedPeriodTotal, priorPeriodTotal]).then(promiseArray => {
      const selected = promiseArray[0];
      const prior = promiseArray[1];

      const diff = selected - prior;
      // calc delta and round to one decimal
      return Math.round(((diff / prior) * 100) * 10) / 10;
    });
  },

// used in translation checks.
  getLegendTextLowerCase(widgetTag) {
    return element(by.id(widgetTag)).element(by.className('chart-legend')).all(by.css('label:first-child')).getTextLowerCase();
  },

// used in translation checks- uses helper functions in page objects for specific line chart widgets
  getSummaryFramePeriodLabel(widgetTag, labelCss) {
    return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.css(labelCss)).element(by.className('period-label'))
      .getText();
  },

// used in translation checks - frequency parameter should be string value of either null, unique, or returning; assists with getting text on visitor behavior traffic widget
  getSummaryFrameMetricLabel(widgetTag, frequency) {
    if (frequency === 'unique') {
      return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-high-chart-widget-summary')).element(by.className('traffic-share-info-unique'))
        .element(by.css('small'))
        .getText();
    }
    if (frequency === 'returning') {
      return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-high-chart-widget-summary')).element(by.className('traffic-share-info-returning'))
        .element(by.css('small'))
        .getText();
    }
    return element(by.id(widgetTag)).element(by.className('kpi-detail-widget-legend')).element(by.className('line-high-chart-widget-summary')).element(by.className('value'))
      .element(by.css('small'))
      .getText();
  },

  getHighChartTooltip(widgetTag) {
    return element(by.id(widgetTag)).element(by.className('widget-title-part')).click()
      .then(() => {
        const chartSeries = element(by.id(widgetTag))
          .element(by.className('highcharts-container'))
          .all(by.className('highcharts-series-group')).filter(elem => { return elem.isDisplayed(); })
          .first()
          .all(by.css('path'))
          .filter((elem, index) => { return index < 10; });

        chartSeries.each(point => {
          browser.actions().mouseMove(point).perform();
        });
      })
      .then(() => {
        return element(by.id(widgetTag)).all(by.className('highcharts-tooltip'));
      })
      .asElementArrayFinder()
      .getTextLowerCase();
  },

// used in translation checks - summaryType parameter should be string value of either null, 'unique', or 'returning'
// assists with getting text on visitor behavior traffic widget
  getHighChartTooltipTotalText(widgetTag, summaryType) {
    const lineChart = element(by.id(widgetTag)).element(by.className('widget-title-part'));
    lineChart.click();
    const chartSeries =  element(by.id(widgetTag)).element(by.className('highcharts-container')).element(by.className('highcharts-series-group')).element(by.css('g.highcharts-markers'))
      .all(by.css('path'));
    chartSeries.each(point => {
      browser.actions().mouseMove(point).perform();
    });

    let dataValues;
    if (summaryType === 'unique') {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-unique-title')).getText();
    } else if (summaryType === 'returning') {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-returning-title')).getText();
    } else if (summaryType === 'total') {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-total-title-unique')).getText();
    } else if (summaryType === 'others') {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-total-title-others')).first()
        .getText();
    } else if (summaryType === 'shoppers') {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-total-title-shoppers')).first()
        .getText();
    } else {
      dataValues = element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.className('tooltip-total-title')).getText();
    }
    return dataValues;
  },

// used in translation checks for Average Traffic (bar chart) widget
  getBarChartTooltipTotalText(widgetTag) {
    const lineChart = element(by.id(widgetTag)).element(by.className('widget-title-part'));
    lineChart.click();
    const chartSeries = element(by.id(widgetTag)).element(by.className('highcharts-container')).element(by.className('highcharts-series-group')).all(by.css('rect'));
    chartSeries.each(bar => {
      browser.actions().mouseMove(bar).perform();
    });

    return element(by.id(widgetTag)).all(by.className('highcharts-tooltip')).all(by.css('span')).all(by.className('table-label'))
      .getText();
  },

  getSumDataWindow(timePeriod) {
    // sets data range for sum checks of line chart widgets - avoids failures due to rounding
    switch (timePeriod.toLowerCase()) {
      case 'week':
        return 4;
      case 'month':
        return 16;
      case 'year':
        return 183;
      default :
        throw new Error(`${timePeriod} is not a valid option for timePeriod.`);
    }
  }
};

function getHighchartLineDataValues(widgetTag, seriesNumber, convertToNumber) {
  const seriesClass = `highcharts-series-${seriesNumber}`;
  const dataValues = element(by.id(widgetTag)).all(by.className(`highcharts-data-labels ${seriesClass}`)).all(by.css('g.highcharts-data-label')).all(by.className('highcharts-text-outline'))
    .getText();

  return dataValues.then(textArray => {
    let valuesArray = [];
    textArray.forEach(htmlText => {
      let value = htmlText.replace(/ /g, '');

      if (convertToNumber) {
        value = Number(value);
      }

      valuesArray.push(value);
    });
    return valuesArray;
  });
}

function getHighchartLineDataSum(widgetTag, seriesNumber) {
  return getHighchartLineDataValues(widgetTag, seriesNumber).then(dataArray => {
    return dataArray.reduce((a, b) => {
      const number = Number(b);
      return Math.round(Number(a) + number);
    });
  });
}

function getPeriodTotalOverallAsText(widgetTag, cssSelector) {
  const total = element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('span.ng-binding:not(.ng-hide)'));
  return total.getText();
}

function getPeriodTotalOverall(widgetTag, cssSelector, numberFormat = 'europe') {
  const totalText = getPeriodTotalOverallAsText(widgetTag, cssSelector);
  return totalText.then(text => {
    if (numberFormat.toLowerCase() === 'us') {
      return Number(text.replace(/[$|€|£|¥|%]/g, ''));
    }
    if (numberFormat.toLowerCase() === 'europe') {
      return Number(text.replace(/\./g, '').replace(/,/g, '.').replace(/[$|€|£|¥|%]/g, ''));
    }
    throw new Error(`${numberFormat} is not a valid option for numberFormat.`);
  });
}

function getFrameDateRange(widgetTag, cssSelector, dateFormat) {
  return getFrameDateRangeText(widgetTag, cssSelector).then(dateTextString => {
    return dateSelector.makeDateArray(dateTextString, dateFormat);
  });
}

function getFrameDateRangeText(widgetTag, cssSelector) {
  return element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('div.selected-period')).getText();
}

function getPeriodDelta(widgetTag, cssSelector) {
  const delta = element(by.id(widgetTag)).element(by.css(cssSelector)).element(by.css('div.line-high-chart-widget-delta-label'));
  const deltaText = delta.getText();
  return deltaText.then(text => {
    let formattedDelta = text.replace('+', '').replace('%', '').replace(/\./g, '').replace(/,/g, '.')
      .trim();
    formattedDelta = Number(formattedDelta);
    return formattedDelta;
  });
}

