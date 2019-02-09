'use strict';
angular
  .module('shopperTrak')
  .factory('widgetLibraryGraphFactory', widgetLibraryGraphFactory);
widgetLibraryGraphFactory.$inject = [
  '$window',
  '$filter',
  'ObjectUtils',
  'metricConstants',
  'currencyService'
];
function widgetLibraryGraphFactory(
  $window,
  $filter,
  ObjectUtils,
  metricConstants,
  currencyService
) {

  var orgObj = {}; //this is set to the current org when passed in by transformChartData() - used by tooltipformatter
  /**
  * This method initialises chart config json.
  */
  function init() {
    return {
      options: {
        chart: {
          zoomType: '',
          height: 320,
          style: {
            fontFamily: '\"Source Sans Pro\", sans-serif'
          },
          events: {
            load: function (event) {
              event.target.chartWidth -= 25;
              event.target.redraw();
            }
          }
        },
        plotOptions: {
          series: {
            dataLabels: {
              allowOverlap: true,
              defer: false,
              enabled: true,
              padding: 0,
              style: {
                opacity: 0.001
              }
            }
          }
        },
        tooltip: {
          shared: true,
          split: false,
          useHTML: true,
          backgroundColor: 'rgba(247,247,247,0)',
          borderColor: 'rgba(247,247,247,0)',
          shadow: false,
          formatter: toolTipFormatter
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
      },
      colors: ['#562F1E', '#AF7F24', '#263249', '#5F7F90', '#D9CDB6'],
      title: {
        text: ''
      },

      subtitle: {
        text: ''
      },
      xAxis: [],
      yAxis: [],
      series: []
    };
  }

  /**
  * This method formats tool tip
  */
  function toolTipFormatter() {
    var points = this.points;

    var body = '';
    var title = '';

    _.each(points, function (point, index) {
      if (index === 0) {
        title = '<div class="tooltipTitle">' + point.series.userOptions.seriesLabel[point.key] + '</div>';
      }

      var metricTitle = orgObj.metric_labels[point.series.userOptions.metric.kpi];
      var value = $filter('formatNumber')(
        point.y,
        point.series.userOptions.metric.dataPrecision,
        point.series.userOptions.locale,
        point.series.userOptions.numberFormat.thousands_separator
      );
      var prefix = !_.isUndefined(point.series.userOptions.metric.prefixSymbol) && point.series.userOptions.metric.prefixSymbol !== 'Q' ? point.series.userOptions.metric.prefixSymbol : '';
      var suffix = point.series.userOptions.metric.suffixSymbol ? point.series.userOptions.metric.suffixSymbol : '';
      point.series.userOptions.metric.isCurrency ? currencyService.getCurrencySymbol(point.series.userOptions.metric.org).then(function (currency) {
        prefix = currency.currencySymbol;
      }) : '';
      var groomedValue = value.replace(/null/g, '');
      body += '<div class="row"><span class="point" style="background-color:' +
        point.color + '"></span><span class="title">' + metricTitle +
        '</span><span class="title">' + point.series.userOptions.seriesLabel[point.key]
        + '</span><span class="value pull-right">' + prefix + groomedValue + suffix + '</span></div>';
    });
    return title + body;
  }

  /**
  * This method assigns the chart zoom type to the chart config object
  *  @param {object} value zoom type value to be assigned.
  *  @param {object} chartModel is the chart config json.
  */
  function addChartZoomType(value, chartModel) {
    if (!ObjectUtils.isNullOrUndefined(chartModel.options.chart)) {
      chartModel.options.chart.zoomType = value;
    }
  }

  function addGroupBYInToDate(groupBy, startdate) {
    switch (groupBy) {
      case 'Hour':
        return moment(startdate).add(1, 'hours');
      case 'Day':
        return moment(startdate).add(1, 'days');
      case 'Week':
        return moment(startdate).add(1, 'weeks');
      case 'Month':
        return moment(startdate).add(1, 'months');
    }

  }

  function getxAxisListFromDateRange(localizationOptions, dateRange, groupBy) {
    var formatedXAxisList = [];
    var dateFormat = groupBy !== 'Hour' ? localizationOptions.dateFormat : localizationOptions.dateFormat + ' HH:00';
    var start = angular.copy(dateRange.start);
    while (start < dateRange.end) {
      var time = moment(start).format(dateFormat);
      formatedXAxisList.push(time);
      start = addGroupBYInToDate(groupBy, start);
    }
    return formatedXAxisList;
  }

  function getxAxisList(xAxisList, localizationOptions, dateRange, groupBy) {
    if (ObjectUtils.isNullOrUndefinedOrEmpty(xAxisList)) {
      return getxAxisListFromDateRange(localizationOptions, dateRange, groupBy);
    }
    return getFormattedOrderedDateList(xAxisList, localizationOptions, groupBy);
  }

  /**
  * This appends a xaxis on the chart model's xaxis collection.
  *  @param {object} xAxisList is a list of the data to be plotted on the x axis.
  *  @param {object} chartModel is the chart config json.
  */
  function addXaxis(xAxisList, crosshair, chartModel, localizationOptions, groupBy, dateRange, vm, align) {
    vm.xAxisList = getxAxisList(xAxisList, localizationOptions, dateRange, groupBy);
    chartModel.xAxis = {
      tickLength: 0,
      showLastLabel: true,
      endOnTick: true,
      rotation: '0',
      labels: {
        align: align,
        rotation: '0',
        style: {
          color: '#929090'
        },
        formatter: function () {
          return vm.xAxisList[this.value];
        }
      },
      crosshair: false
    };
  }

  /**
  * Gets formatted ordered date list for labels.
  *  @param {object} list is a list of the data to be plotted on the x axis.
  *  @param {object} localizationOptions is the object that hold dateFormat.
  *  @param {object} groupBy is the parameter for group buy if it is hour we add hour for the date.
  */
  function getFormattedOrderedDateList(list, localizationOptions, groupBy) {
    // Reorder chronologically
    list = _(list).sortBy(function (d) { return d; });

    var dateFormat = groupBy !== 'Hour' ? localizationOptions.dateFormat : localizationOptions.dateFormat + ' HH:00';

    var formatedXAxisList = [];
    _(list).each(function (d) {

      var time = moment(d).format(dateFormat);
      formatedXAxisList.push(time);
    });

    return formatedXAxisList;
  }

  /**
  * This appends a y axis on the chart model's axis collection.
  *  @param {object} xAxisList is a list of the data to be plotted on the x axis.
  *  @param {object} chartModel is the chart config json.
  */
  function addYaxis(chartModel, opposite, labelColor, format, titleColor, title) {
    var yAxis = {
      title: {
        enabled: true,
        useHTML: true,
        text: title,
        style: {
          visibility: 'visible',
          color: titleColor
        }
      },
      style: {
        color: titleColor
      },
      labels: {
        format: format,
        formatter: function () {
          return Math.round(this.value);
        },
        style: {
          color: labelColor
        },
        allowDecimals: false,
        gridLineDashStyle: 'Dot',
        gridLineColor: '#b0b0b0'
      },
      opposite: opposite
    };

    chartModel.yAxis.push(yAxis);
  }

  /**
  * Creates a series from the parameters and adds it to the chartmodel's series collection.
  *  @param {object} chartModel is the chart config json.
  *  @param {string} seriesName name of the series.
  *  @param {string} chartType to be plotted.
  *  @param {number} yAxisNumber determines which yaxis to plot.
  *  @param {object} data coordinates to be plotted.
  *  @param {number} index number for differentiate the series colors.
  */
  function addSeries(chartModel, seriesName, chartType, data, index, metricConstant, org, currentUser, localizationOptions, seriesLabel) {
    var graphColor = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];

    var prefix = !_.isUndefined(metricConstant.prefixSymbol) && metricConstant.prefixSymbol !== 'Q' ? metricConstant.prefixSymbol : '';
    var suffix = metricConstant.suffixSymbol ? metricConstant.suffixSymbol : '';
    metricConstant.isCurrency ? currencyService.getCurrencySymbol(org).then(function (currency) {
      prefix = currency.currencySymbol;
    }) : '';
    var yAxisNum = chartModel.yAxisNumber[metricConstant.kpi];

    var series = {
      name: seriesName,
      type: chartType,
      color: graphColor[index],
      yAxis: yAxisNum,
      seriesLabel: seriesLabel,
      metric: metricConstant,
      numberFormat: localizationOptions.numberFormat,
      local: currentUser.localization.locale,
      org: org,
      data: data,
      marker: { symbol: 'circle', radius: 3 },
      tooltip: {
        split: false,
        useHTML: true,
        pointFormatter: function () {
          var value = $filter('formatNumber')(
            this.y,
            metricConstant.dataPrecision,
            currentUser.localization.locale,
            localizationOptions.numberFormat.thousands_separator
          );
          var groomedValue = value.replace(/null/g, '');
          return '<div class="row"><span class="point" style="background-color:' + this.color + '"></span><span class="title">' + metricConstant.translatedLabel + '</span><span class="title">' + this.series.userOptions.seriesLabel[this.index] + '</span><span class="value pull-right">' + prefix + groomedValue + suffix + '</span></div>';
        },
      }
    };
    chartModel.series.push(series);
  }

  /**
  * Finds and returns a metric contant by kpi
  *  @param {string} kpi name to be used in the search.
  */
  function findMetricConstantByKpi(kpi) {
    return _.find(metricConstants.metrics, function (item) {
      return item.kpi === kpi;
    });
  }

  /**
  * This determines what yaxises are needed based on the metric list.
  * There can only one or two.
  * @param {object} chartModel is the chart config json.
  * @param {object} metricList list of metrics.
  */
  function configureYAxis(chartConfig, metricList, org) {
    var uniqueMetrics = _.uniq(metricList, false, function (metric) { return metric.kpi });

    if (!ObjectUtils.isNullOrUndefinedOrEmpty(uniqueMetrics)) {
      chartConfig.yAxisNumber = {};
    }
    _.each(uniqueMetrics, function (metric, index) {
      if (index < 2) {
        var graphSide = (index % 2 === 0) ? false : true; //false is left, true is right
        chartConfig.yAxisNumber[metric.kpi] = index;
        addYaxis(chartConfig, graphSide, '#40405', '', '#73405', org.metric_labels[metric.kpi]);
      }
    });

  }

  /**
  * Create chart config json from reponses from api and metric list
  * @param {object} responses from web api requests.
  * @param {string} metricList list of metric objects.
  */
  function transformChartData(responses, metricList, currentUser, org, localizationOptions, groupBy, dateRange, vm) {
    orgObj = vm.selectedOrg;
    var chartConfig = init();
    addChartZoomType('xy', chartConfig);
    configureYAxis(chartConfig, metricList, vm.selectedOrg);
    var xAxis = [];
    var xAxisAlign = 'left';

    if (!ObjectUtils.isNullOrUndefined(responses) && !ObjectUtils.isNullOrUndefinedOrEmpty(metricList)) {
      _.forEach(responses, function (response, index) {
        if (!ObjectUtils.isNullOrUndefined(response) && !ObjectUtils.isNullOrUndefinedOrEmpty(response.result)) {
          var metric = metricList[index];
          var metricConstant = _.find(metricConstants.metrics, function (item) {
            return item.kpi === metric.kpi;
          });

          var displayName = vm.selectedOrg.metric_labels[metric.kpi];

          var series = [];
          var resetAxis = metric.timePeriod.periodInfo === 'selectedPeriod';

          if (resetAxis) {
            xAxis = [];
          }

          var xAxisLabels = [];

          var responseResult = _(response.result).sortBy(function (item) { return item.period_start_date; });
          _.forEach(responseResult, function (row) {
            if (resetAxis) {
              xAxis.push(row.period_start_date);
            }
            xAxisLabels.push(row.period_start_date);

            var rowPlotValue = depictRowValue(row, metric.kpi);
            if (!ObjectUtils.isNullOrUndefined(rowPlotValue)) {

              series.push(depictRowValue(row, metric.kpi));
            }
          });

          var metricConstant = findMetricConstantByKpi(metric.kpi);

          if (!ObjectUtils.isNullOrUndefined(metric.dateRange)) {
            var seriesName = displayName + ' (' + moment(metric.dateRange.start).format(localizationOptions.dateFormat) + ' - ' + moment(metric.dateRange.end).format(localizationOptions.dateFormat) + ')';
          }
          var seriesLabel = getFormattedOrderedDateList(xAxisLabels, localizationOptions, groupBy);
          if(metric.chartType === 'bar') {
            xAxisAlign = 'center';
          }
          addSeries(chartConfig, seriesName, metric.chartType, series, index, metricConstant, org, currentUser, localizationOptions, seriesLabel);
        }
      });
    }
    addXaxis(xAxis, true, chartConfig, localizationOptions, groupBy, dateRange, vm, xAxisAlign);

    return chartConfig;
  }

  /**
  * Depict the property name to used from the object of the responses
  * @param {object} row object to call the property.
  * @param {string} kpi name used to decide what property name to use.
  */
  function depictRowValue(row, kpi) {
    return !ObjectUtils.isNullOrUndefined(row) ? row[kpi] : row;
  }

  return {
    transformChartData: transformChartData
  };
}
