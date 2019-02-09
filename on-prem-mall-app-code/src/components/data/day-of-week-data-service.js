(function() {
  'use strict';

  angular.module('shopperTrak')
  .factory('dayOfWeekDataService', [
    '$q',
    'apiUrl',
    '$translate',
    'metricsHelper',
    'requestManager',
    'ObjectUtils',
    'LocalizationService',
    'utils',
    function (
      $q,
      apiUrl,
      $translate,
      metricsHelper,
      requestManager,
      ObjectUtils,
      LocalizationService,
      utils
  ) {

    var dayOfWeekLongPrefix = 'weekdaysLong.';
    var dayOfWeekShortPrefix = 'weekdaysShort.';

    function getDailyData(dataRequest) {
      var deferred = $q.defer();
      var params = {
        comp_site: false,
        groupBy: 'day_of_week',
        orgId: dataRequest.organizationId,
        siteId: dataRequest.siteId,
        zoneId: dataRequest.zoneId,
        hierarchyTagId: dataRequest.selectedTags,
        reportStartDate: moment(dataRequest.startDate).toISOString(),
        reportEndDate: moment(dataRequest.endDate).toISOString(),
        operatingHours: dataRequest.operatingHours,
        kpi: dataRequest.metrics
      };

      if( !ObjectUtils.isNullOrUndefinedOrEmpty(dataRequest.customTagId) ) {
        params.customTagId = dataRequest.customTagId;
      }

      var requestPromise = getRequestPromise(params);

      requestPromise.then(function (response) {
        deferred.resolve(response);
      }).catch(function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getDataForChart(dataRequest, isHourly) {
      var deferred = $q.defer();

      // Needed for calculations

      if(isHourly) {
        var allMetrics = angular.copy(dataRequest.metrics);

        var temporaryMetrics = getTemporaryMetricsForCalculations(dataRequest.metrics);

        _.each(temporaryMetrics, function(tempMetric) {
          allMetrics.push(tempMetric);
        });

        dataRequest.metrics = allMetrics;
      }


      getData(dataRequest, isHourly)
        .then(function(data) {
          var metricsToFormat = dataRequest.metrics;

          if(!ObjectUtils.isNullOrUndefined(dataRequest.selectedMetric)) {
            metricsToFormat = [dataRequest.selectedMetric];
          }

          transformData(data, dataRequest.daysOfWeek, metricsToFormat, dataRequest.startDate, dataRequest.endDate)
            .then(function(chartData) {
              deferred.resolve(chartData);
            }, handleError);
        }).catch(function(error) {
          deferred.reject(error);
        });

        return deferred.promise;
    }

    function getData(dataRequest, isHourly) {
      const {
        comp_site,
        compStartDate,
        compEndDate,
        organizationId:orgId,
        siteId,
        zoneId,
        selectedTags:hierarchyTagId,
        startDate,
        endDate,
        operatingHours,
        metrics:kpi,
        monitor_point_id,
        salesCategories,
        customTagId
      } = dataRequest;

      const deferred = $q.defer();
      const groupBy = isHourly ? 'hour' : 'day_of_week';

      let sales_category_id;
      let trafficOnly;
      let aggregate_sales_categories;

      if (!_.isUndefined(salesCategories) && salesCategories.length > 0 && _.min(salesCategories.id) > 0) {
        sales_category_id = salesCategories.map((category) => category.id);
      }

      if(kpi.length === 1 && kpi[0] === 'traffic') {
        trafficOnly = true;
      }

      if(!ObjectUtils.isNullOrUndefined(sales_category_id) && sales_category_id.length > 1) {
        //set aggregate flag
        aggregate_sales_categories = true;
      }

      const reportStartDate = utils.getDateStringForRequest(startDate);
      const reportEndDate = utils.getDateStringForRequest(endDate);

      const params = {
        comp_site,
        groupBy,
        orgId,
        siteId,
        zoneId,
        hierarchyTagId,
        reportStartDate,
        reportEndDate,
        operatingHours,
        kpi,
        ...(comp_site === true ?  {compStartDate, compEndDate} : {}),
        ...(!_.isUndefined(monitor_point_id) ? {monitor_point_id} : {}),
        ...(!_.isUndefined(sales_category_id) ? {sales_category_id} : {}),
        ...(trafficOnly === true ? {trafficOnly} : {}),
        ...(aggregate_sales_categories === true ? {aggregate_sales_categories} : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {})
      };

      const requestPromise = getRequestPromise(params, trafficOnly);

      requestPromise.then( (response) => {
        var data = _.sortBy(response.result, (hourlyData) => {
          return hourlyData.period_start_date;
        });

        if(ObjectUtils.isNullOrUndefined(siteId) || trafficOnly === true) {
          fixPropertyNames(data);
        }

        if (!_.isUndefined(monitor_point_id)) {
          data = _.filter(data, (pointData) => pointData.monitor_point_id === monitor_point_id);
        }

        addDayOfWeekLabelToData(data);

        deferred.resolve(data);
      }).catch((error) => {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    /** Changes "sales_amount" to "sales" and "total_traffic" to "traffic".
     *  Only needed for calls to /kpis/sales and calls t /kpis/traffic. Returns nothing, instead operates directly on the collection
     *
     *  @param {array} data The collection of objects to rename
     **/
    function fixPropertyNames(data) {
      // eslint-disable-next-line no-unused-vars
      _.each(data, function(row) {
        row = ObjectUtils.rename(row, 'sales_amount', 'sales');
        row = ObjectUtils.rename(row, 'total_sales', 'sales');
        row = ObjectUtils.rename(row, 'total_traffic', 'traffic');
      });
    }

    function getContributionDataForChart(dataRequest) {
      var deferred = $q.defer();

      getDataForChart(dataRequest)
        .then(function(data) {
          _.each(data.series, function(series) {

            var total = getTotalForSeries(series);

            _.each(series, function(value, index) {
              series[index] = (value / total) * 100;

              if(isNaN(series[index])) {
                series[index] = null;
              }
            });
          });

          deferred.resolve(data);
        });
        return deferred.promise;
    }

    function getMetricContributionDataForTable(dataRequest) {
      var deferred = $q.defer();

      var isHourly = ObjectUtils.isNullOrUndefined(dataRequest.daysOfWeek);

      var allMetrics = angular.copy(dataRequest.metrics);
      // Needed for calculations
      var temporaryMetrics = getTemporaryMetricsForCalculations(dataRequest.metrics);

      _.each(temporaryMetrics, (tempMetric) => {
        allMetrics.push(tempMetric);
      });

      dataRequest.metrics = allMetrics;

      getData(dataRequest, isHourly)
      .then(function(data) {
        var result = {
          tableData: [],
          averages: {}
        };

        var dateRangeInfo = getDateRangeInfo(dataRequest.startDate, dataRequest.endDate);

        _.each(dataRequest.daysOfWeek, function(dayOfWeek, dayOfWeekIndex) {
          var dayOfWeekData = {
            dayOfWeek: dayOfWeek,
            dayOfWeekIndex: dayOfWeekIndex
          };

          _.each(allMetrics, function(metric) {
            var dayMetricValue = getMetricDayValue(dayOfWeek, metric, data, dateRangeInfo);

            dayOfWeekData[metric] = dayMetricValue;
          });
          result.tableData.push(dayOfWeekData);
        });

        // Hourly
        if (isHourly) {
          var hours = getHours(data);

          _.each(hours, function(hour, index) {
            var hourData = {
              hourOfDay: hour,
              hourOfDayIndex: index,
              period_start_date: hour
            };

            _.each(allMetrics, function(metric) {
              var hourMetricValue = getAverageMetricValueForHour(data, hour, metric);
              hourData[metric] = hourMetricValue;
            });

            result.tableData.push(hourData);
          });
        }

        _.each(allMetrics, function(metric) {
          var metricTotal = getTotalForMetric(metric, result.tableData);

          _.each(result.tableData, function(row) {
            var contribution = (row[metric] / metricTotal) * 100;
            var propertyName = metric + '_contribution';
            row[propertyName] = contribution;
          });

          var collectionSize;

          if(isHourly) {
            collectionSize = dataRequest.hoursOfDay.length;
          } else {
            collectionSize = dataRequest.daysOfWeek.length;
          }

          var metricAverage = calculateMetricAverage(metric, result.tableData, collectionSize);

          result.averages[metric] = metricAverage;
        });

        // Cleanup
        if(temporaryMetrics.length > 0) {
          _.each(result.tableData, function() {
            _.each(temporaryMetrics, function(tempMetric) {
              delete result.tableData[tempMetric];
            });
          });
        }

        deferred.resolve(result);
      }).catch(function (err) {
        if(err !== 'User cancelled') {
          console.error('error', err);
        }
      });
      return deferred.promise;
    }

    function getTemporaryMetricsForCalculations(metrics) {
      var temporaryMetrics = [];

      var calculatedMetrics = getCalculatedMetrics();

      _.each(calculatedMetrics, function(calculatedMetric) {
        if(_.contains(metrics, calculatedMetric.metric)) {
          _.each(calculatedMetric.dependencies, function(dependency) {
            if(!_.contains(metrics, dependency) && !_.contains(temporaryMetrics, dependency)) {
              temporaryMetrics.push(dependency);
            }
          });
        }
      });

      return temporaryMetrics;
    }

    function getCalculatedMetrics() {
      return [{
        metric: 'star',
        dependencies: [
          'traffic',
          'labor_hours'
        ]}, {
        metric: 'ats',
        dependencies: [
          'sales',
          'transactions'
        ]}, {
          metric: 'conversion',
          dependencies: [
            'traffic',
            'transactions'
          ]
        }];
    }

  /** Calculates the average value for a given metric.
   *  Handles pre-averaged (calculated) metrics differently (star, ATS, conversion)
   *
   *  @param {string} metric The metric name
   *  @param {object} tableData The data returned from the API
   *  @param {number} collectionSize The size of the collection to calculate the average. Is typically the number of days, or number of hours
   *  @returns {number} the average
   **/
    function calculateMetricAverage(metric, tableData, collectionSize) {
      if(metric === 'star') {
        return calculateStar(tableData);
      }

      if(metric === 'ats') {
        return calculateAts(tableData);
      }

      if(metric === 'conversion') {
        return calculateConversion(tableData);
      }

      var metricTotal = getTotalForMetric(metric, tableData);

      return metricTotal / collectionSize;
    }

    function calculateStar(tableData) {
      var trafficTotal = getTotalForMetric('traffic', tableData);

      var laborTotal = getTotalForMetric('labor_hours', tableData);

      return metricsHelper.getStar(trafficTotal, laborTotal);
    }

    function calculateAts(tableData) {
      var salesTotal = getTotalForMetric('sales', tableData);

      var transactionsTotal = getTotalForMetric('transactions', tableData);

      return metricsHelper.getAts(salesTotal, transactionsTotal);
    }

    function calculateConversion(tableData) {
      var trafficTotal = getTotalForMetric('traffic', tableData);

      var transactionsTotal = getTotalForMetric('transactions', tableData);

      return metricsHelper.getConversion(trafficTotal, transactionsTotal);
    }

    function getTotalForMetric(metric, tableData) {
      var total;

      _.each(tableData, function(row) {
        if(typeof total === 'undefined') {
          total = 0;
        }

        if(typeof row[metric] !== 'undefined') {
          total += row[metric];
        }
      });

      return total;
    }

    function getTotalForSeries(series) {
      var val;

      _.each(series, function(value) {
        if(typeof val === 'undefined') {
          val = 0;
        }

        if(typeof value !== 'undefined') {
          val += value;
        }
      });

      return val;
    }

    function getRequestPromise(params, trafficOnly) {
      var url = apiUrl + '/kpis/';

      if(trafficOnly === true) {
        url += 'traffic';
        delete params.kpi;
      } else if (!ObjectUtils.isNullOrUndefined(params.monitor_point_id)) {
        url += 'traffic/entrances'
      } else if(ObjectUtils.isNullOrUndefined(params.siteId)) {
        url += 'report';
        params.kpi = _.without(params.kpi, 'sales');
        params.org_level = true;
      } else {
        url += 'report';
      }

      return requestManager.get(url, {
          params: params
      });
    }

    function getHours(data) {
      var hours = [];
      _.each(data, function (point) {
        var hour = LocalizationService.getLocalDateTimeFormatIgnoringUTC(point.period_start_date).format('hA');

        if(!_.contains(hours, hour)) {
          hours.push(hour);
        }
      });

      return hours;
    }

    function transformData(data, daysOfWeek, metrics, startDate, endDate) {
      var deferred = $q.defer();

      if (daysOfWeek) {
        $translate(daysOfWeek).then(function(translatedDaysOfWeek) {
          var dayOfWeekKeys = [];
          var translations = [];

          for(var transkey in translatedDaysOfWeek) {
            dayOfWeekKeys.push(transkey);
            translations.push(translatedDaysOfWeek[transkey]);
          }

          var chartSeries = getChartSeries(data, dayOfWeekKeys, metrics, startDate, endDate);

          var chartData = {
            labels: translations,
            series: chartSeries.series,
            metricsWithData: chartSeries.metricsWithData
          };

          deferred.resolve(chartData);
        });
      } else {
        var hours = getHours(data);
        var chartSeries = getChartSeries(data, null, metrics, startDate, endDate, hours);
        var chartData = {
          labels: hours,
          series: chartSeries.series,
          metricsWithData: chartSeries.metricsWithData
        };

        deferred.resolve(chartData);
      }
      return deferred.promise;
    }

    function getChartSeries(data, dayOfWeekKeys, metrics, startDate, endDate, hours) {
      var series = [];
      var metricsWithData = [];
      var dateRangeInfo = getDateRangeInfo(startDate, endDate);

      _.each(metrics, function(metric) {
        var seriesData = [];

        _.each(dayOfWeekKeys, function(dayOfWeek) {
          var dayMetricValue = getMetricDayValue(dayOfWeek, metric, data, dateRangeInfo);

          seriesData.push(dayMetricValue);
        });

        var daysWithNoData = [];

        _.filter(seriesData, function(dayData) {
          if(dayData === null) {
            daysWithNoData.push(dayData);
          }
        });

        _.each(hours, function (hour) {
          var averageMetricValueForHour = getAverageMetricValueForHour(data, hour, metric);
          seriesData.push(averageMetricValueForHour);
        });

        if(daysWithNoData.length !== seriesData.length) {
          series.push(seriesData);
          metricsWithData.push(metric);
        }
      });

      return {
        series: series,
        metricsWithData: metricsWithData
      };
    }

    function getAverageMetricValueForHour(data, hour, metric) {
      var valuesForHour = _.filter(data, function(result) {
        var hourForData = LocalizationService.getLocalDateTimeFormatIgnoringUTC(result.period_start_date).format('hA');

        return hour === hourForData;
      });

      if(valuesForHour.length === 1) {
        return valuesForHour[0][metric];
      }

      if(metric === 'star') {
        return calculateStar(valuesForHour);
      }

      if(metric === 'conversion') {
        return calculateConversion(valuesForHour);
      }

      if(metric === 'ats') {
        return calculateAts(valuesForHour);
      }

      var total = 0;

      _.each(valuesForHour, function(hourData) {
        var value = hourData[metric];

        if(!ObjectUtils.isNullOrUndefined(value)) {
          total += value;
        }
      });

      return total / valuesForHour.length;
    }

    function getMetricDayValue(dayOfWeek, metric, data, dateRangeInfo) {
      var search = {
        dayOfWeek: dayOfWeek.replace(dayOfWeekLongPrefix, '').replace(dayOfWeekShortPrefix, '')
      };

      var dayValue = _.findWhere(data, search);

      // Safety first...
      if(typeof dayValue === 'undefined') {
        return undefined;
      }

      var dayMetricValue = dayValue[metric];

      // Why does total_traffic come back from the API as a string?
      if(typeof dayMetricValue === 'string') {
        dayMetricValue = parseInt(dayMetricValue, 10);
      }

      if(!metricIsCalculated(metric)) {
        // The user can select more than a week.
        // If this is the case, we need to average the value returned by the api for non calculated metrics.
        // This has caused confusion in the past. See SA-2453
        var daysOfWeekInRange = dateRangeInfo[search.dayOfWeek];

        dayMetricValue = (dayMetricValue / daysOfWeekInRange);
      }

      return dayMetricValue;
    }

    function metricIsCalculated(metric) {
      return metric === 'ats' ||
        metric === 'conversion' ||
        metric === 'star';
    }

    function getDateRangeInfo(startDate, endDate) {
      var dayInfo = {
        mon: 0,
        tue: 0,
        wed: 0,
        thu: 0,
        fri: 0,
        sat: 0,
        sun: 0
      };

      startDate = moment(startDate);
      endDate = moment(endDate);
      var current = angular.copy(startDate);

      while (current.isSame(startDate) || current.isBetween(startDate, endDate) || current.isSame(endDate)) {
        var currentDayOfWeek = current.format('ddd').toLowerCase();
        dayInfo[currentDayOfWeek] += 1;
        current = current.add(1, 'days');
      }

      return dayInfo;
    }

    function addDayOfWeekLabelToData(data) {
      _.each(data, function(row) {
        row.dayOfWeek = row.period_start_date.toLowerCase();
      });
    }

    function handleError() {
      console.error('Error');
    }

    return {
      getDailyData: getDailyData,
      getDataForChart: getDataForChart,
      getContributionDataForChart: getContributionDataForChart,
      getMetricContributionDataForTable: getMetricContributionDataForTable
    };

  }]);


})();
