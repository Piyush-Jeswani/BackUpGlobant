(function() {
  'use strict';

  angular.module('shopperTrak')
    .factory('orgCompareService', orgCompareService);

  orgCompareService.$inject = [
    'apiUrl',
    '$http',
    '$q',
    'authService',
    'LocalizationService',
    'SubscriptionsService',
    'requestManager',
    'comparisons',
    'comparisonsHelper',
    'ObjectUtils',
    'metricsHelper',
    'NumberUtils'
  ];

  function orgCompareService(
    apiUrl,
    $http,
    $q,
    authService,
    LocalizationService,
    SubscriptionsService,
    requestManager,
    comparisons,
    comparisonsHelper,
    ObjectUtils,
    metricsHelper,
    NumberUtils
  ) {

    var metricLookup;

    function setMetricLookup(currentOrganization) {
      const subscriptions = SubscriptionsService.getSubscriptions(currentOrganization);
      const metricDisplayInfo = metricsHelper.getMetricDisplayInformation(subscriptions, false, currentOrganization);
      metricLookup =  _.sortBy(metricDisplayInfo);
    }

    function getMetricLookup() {
      return metricLookup;
    }

    var getDateRangeKey = function(dateRangeStart, dateRangeEnd) {
      return dateRangeStart + '_' + dateRangeEnd;
    };

    function getMetricFromLookup(metric) {
      return _.findWhere(metricLookup, {
        key: metric
      });
    }

    function saveUserCustomCompare(user, customCharts, orgId) {
      var deferred = $q.defer();
      $http.put(apiUrl + '/users/' + user._id, getUserParams(user, customCharts, orgId))
        .then(function(result) {
          authService.updateUserPreferencesCustomCharts(result.data.result[0].preferences.custom_charts);
          deferred.resolve(result.data.result[0].preferences.custom_charts);
        });

      return deferred.promise;
    }

    function getUserParams(user, customCharts, orgId) {
      var params = {
        preferences: angular.copy(user.preferences),
        orgId:orgId
      };

      params.preferences.custom_charts = customCharts;

      return params;
    }

    function getCustomCompareData(params, dateRangeParams, chartMetricList, type, dataType, tagType, tag) {
      var deferred = $q.defer();
      if (ObjectUtils.isNullOrUndefined(dateRangeParams)) {
        return null;
      }

      requestManager.get(apiUrl + '/kpis/report', {
        params: angular.extend(params, dateRangeParams)
      }).then(function(data) {
        var result = {
          type: type,
          dataType: dataType, //chart or comparisons
          tagType: tagType, //hierarchies or sites
          tag: tag, //ids
          data: data
        };
        deferred.resolve(result);
      })
      .catch(function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function getChartLabels(items, dateFormat, periodType) {
      var chartLabels = [];
      var labelFormat = dateFormat;

      var groups = getGroupedItems(items, 'period_start_date', periodType);
      var format = 'YYYYMMDD';
      if(!ObjectUtils.isNullOrUndefinedOrBlank(periodType) && periodType === 'day') {
        format = 'YYYYMMDDHH';
        labelFormat = 'HH-mm';
      }
      _.each(groups, function(items) {
        chartLabels.push(moment(items[0].period_start_date, format).format(labelFormat));
      });
      return chartLabels;
    }

    function getSiteData(data, siteId) {
      return _.where(data, {
        site_id: siteId
      });
    }

    function getChartSeriesData(chartItems, metric) {
      var seriesData = [];

      _.each(chartItems, function(item) {
        var metricValue = metricsHelper.getCalculatedMetricValue(item, metric);
        seriesData.push(metricValue);
      });
      return seriesData;
    }

    function getTableMetricData(items, metric) {
      var metricValue = 0;
      var count = 0;

      _.each(items, function(item) {
        if(metricsHelper.isCalculatedMetricValueValid(item, metric)) {
          metricValue += metricsHelper.getCalculatedMetricValue(item, metric);
          count +=1;
        }
      });

      if (metric.calculatedMetric === true && count > 0) {
        metricValue = metricValue/count;
      }

      return metricValue;
    }

    function hasValidData(seriesData) {
      var validData = _.filter(seriesData, function(labelData) {
        return !ObjectUtils.isNullOrUndefinedOrBlank(labelData);
      });

      return !ObjectUtils.isNullOrUndefinedOrEmpty(validData);
    }

    function getChartSeriesDataForMetric(data, grouppedItems, metric) {
      var seriesData = [];

      _.each(grouppedItems, function(groups) {
        var metricValue = 0;
        _.each(groups, function(item) {
          metricValue += metricsHelper.getCalculatedMetricValue(item, metric);
        });
        seriesData.push(metricValue);
      });
      return seriesData;
    }

    function getTag(tags, id) {
      return _.find(tags, function(tag) {
        return tag.id === id;
      });
    }

    function getValidData(dataList) {
      return _.filter(dataList, function(data) {
        return !ObjectUtils.isNullOrUndefined( data.period_start_date);
      });

    }

    function isItemValidChartData(item) {
      return item.dataType === 'chartData' &&
      !ObjectUtils.isNullOrUndefined(item)  &&
      !ObjectUtils.isNullOrUndefined(item.data) &&
      !ObjectUtils.isNullOrUndefinedOrEmpty(item.data.result);
    }

    function populateTagDataForSites(item, data, metric, series, chartWithData, tags) {
      _.each(item.tag, function(tag) {
        var siteDataItems = getSiteData(data, tag);
        var seriesData = getChartSeriesData(siteDataItems, metric);
        if (hasValidData(seriesData)) {
          series.push(seriesData);
          chartWithData.push(getTag(tags, tag));
        }
      });
    }

    function populateTagDataForHerarchy(item, data, metric, series, chartWithData) {
      var grouppedItems = getGroupedItems(data, 'period_start_date');
      var seriesData = getChartSeriesDataForMetric(data, grouppedItems, metric);
      if (hasValidData(seriesData)) {
        series.push(seriesData);
        chartWithData.push(item.tag);
      }
    }

    function transformSingleMetric(dataList, metricList, dateFormat, tags, periodType) {
      var series = [];
      var chartWithData = [];
      var chartLabels;
      _.each(dataList, function(item) {
        if (isItemValidChartData(item)) {
          var data = getValidData(item.data.result);

          data.sort(function(a, b) {
            return LocalizationService.getLocalDateTimeFormatIgnoringUTC(a.period_start_date) - LocalizationService.getLocalDateTimeFormatIgnoringUTC(b.period_start_date)
          });

          var metric = metricList[0];
          if (ObjectUtils.isNullOrUndefined(chartLabels) && !ObjectUtils.isNullOrUndefinedOrEmpty(data)) {
            chartLabels = getChartLabels(data, dateFormat, periodType);
            chartLabels.sort(function(a,b){
              // This is just used for ordering, so we can leave UTC.

              // Also, this block doesn't work for day view
              return moment.utc(a, dateFormat) - moment.utc(b, dateFormat);
            });
          }

          if (item.tagType === 'sites') {
            //multiple chart objects for each sites
            populateTagDataForSites(item, data, metric, series, chartWithData, tags);
          } else {
            //hierarchy tag so aggreagate site values into tag with time
            populateTagDataForHerarchy(item, data, metric, series, chartWithData);
          }
        }
      });

      return {
        labels: chartLabels,
        series: series,
        chartWithData: chartWithData
      };
    }

    function getMetricHierarchyTagData(dataList, tag, metric, dataType) {
      var tagDataList = _.filter(dataList, function(item) {
        return !ObjectUtils.isNullOrUndefined(item) &&
          item.dataType === dataType &&
          item.tag.type === tag.type &&
          item.tag.id === tag.id;
      });
      if (ObjectUtils.isNullOrUndefinedOrEmpty(tagDataList) ||
        ObjectUtils.isNullOrUndefined(tagDataList[0].data) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(tagDataList[0].data.result)) {
        return undefined;
      }
      return getAggregatedMetricValue(tagDataList[0].data.result, metric);
    }

    function getAggregatedMetricValue(tagDataList, metric) {
      var metricValue = 0;

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(tagDataList)) {
        _.each(tagDataList, function(tagData) {
          metricValue += metricsHelper.getCalculatedMetricValue(tagData, metric);
        });
      }

      return metricValue;
    }

    function buildHierarchySeriesData(dataList, tag, metric ) {
      if (tag.type === 'site') {
        return buildSiteSeriesData(dataList, tag, metric );
      }
      var data = {
        metric: metric,
        tag: tag,
        metricPeriodValue: getMetricHierarchyTagData(dataList, tag, metric, 'chartData'),
        metricComparePeriodValue: getMetricHierarchyTagData(dataList, tag, metric, 'compareData')
      };
      data.hasValidData = !ObjectUtils.isNullOrUndefinedOrBlank(data.metricPeriodValue) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(data.metricPeriodValue);
      if(!data.hasValidData) {
        return data;
      }
      data.comparisonData = comparisonsHelper.getComparisonData(data.metricPeriodValue, data.metricComparePeriodValue, true);
      return data;
    }

    function notValid(tagData) {
      return ObjectUtils.isNullOrUndefinedOrEmpty(tagData) ||
        ObjectUtils.isNullOrUndefined(tagData[0]) ||
        ObjectUtils.isNullOrUndefined(tagData[0].data) ||
        ObjectUtils.isNullOrUndefined(tagData[0].data.result);
    }

    function buildSiteSeriesData(dataList, tag, metric ) {
      var sitesPeriodTagData = getSitesTagData(dataList, 'chartData');
      var sitesComparePeriodTagData = getSitesTagData(dataList, 'compareData');
      var data = {
        metric: metric,
        tag: tag
      };

      if(notValid(sitesPeriodTagData) || notValid(sitesPeriodTagData)) {
        data.hasValidData = false;
        return data;
      }
      data.metricPeriodValue = getAggregatedMetricValue(getSiteData(sitesPeriodTagData[0].data.result, tag.id), metric);
      data.metricComparePeriodValue = getAggregatedMetricValue(getSiteData(sitesComparePeriodTagData[0].data.result, tag.id), metric);

      data.hasValidData = !ObjectUtils.isNullOrUndefinedOrBlank(data.metricPeriodValue) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(data.metricPeriodValue);
      if(!data.hasValidData) {
        return data;
      }
      data.comparisonData = comparisonsHelper.getComparisonData(data.metricPeriodValue, data.metricComparePeriodValue, true);
      return data;
    }

    function transformMultiMetric(dataList, metricList, dateFormat, tags) {
      var series = [];
      var chartWithData = [];

      var chartLabels = _.map(tags, function(item) {
        return item.name;
      });

      _.each(metricList, function(metric) {
        var seriesData = [];
        _.each(tags, function(tag) {
          var data = buildHierarchySeriesData(dataList, tag, metric);

          if (data.hasValidData) {
            seriesData.push(data);
            if (chartWithData.indexOf(metric) < 0) {
              chartWithData.push(metric);
            }
          }
        });

        series.push(seriesData);
      });

      var result = {
        labels: chartLabels,
        series: series,
        chartWithData: chartWithData
      };

      return result;
    }

    function transformDataForChart(dataList, metricList, dateFormat, tags, type, periodType) {
      if (type === 'single') {
        return transformSingleMetric(dataList, metricList, dateFormat, tags, periodType);
      }
      return transformMultiMetric(dataList, metricList, dateFormat, tags);
    }

    function getGroupedItems(items, timeProperty, periodType) {
      var format = 'YYYYMMDD';
      if(!ObjectUtils.isNullOrUndefinedOrBlank(periodType) && periodType === 'day') {
        format = 'YYYYMMDDHH';
      }

      return _.groupBy(items, function(item) {
        return moment(item[timeProperty], format).utc();
      });
    }

    function hasData(item) {
      return !ObjectUtils.isNullOrUndefined(item) &&
        !ObjectUtils.isNullOrUndefined(item.data) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item.data.result);
    }

    function getTagData(dataList, tag, dataType) {
      if (tag.type === 'site') {
        return _.filter(dataList, function(dataItem) {
          return hasData(dataItem) && dataItem.tagType === 'sites' &&
          dataItem.dataType === dataType;
        });

      }
      return _.filter(dataList, function(dataItem) {
        return hasData(dataItem) &&
        dataItem.tag.id === tag.id &&
        dataItem.dataType === dataType;
      });
    }

    function getSitesTagData(dataList, dataType) {
      return _.filter(dataList, function(dataItem) {
        return hasData(dataItem) &&
          dataItem.dataType === dataType &&
          dataItem.tagType === 'sites';
      });
    }

    function transformDataForTable(dataList, metricList, dateFormat, tags) {
      var result = {
        tableData: []
      };
      _.each(tags, function(tag, tagIndex) {
        var tableData = {
          tag: tag,
          tagIndex: tagIndex
        };
        var tagChartDataList = getTagData(dataList, tag, 'chartData');
        var tagCompareDataList = getTagData(dataList, tag, 'compareData');

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(tagChartDataList)) {
          var tableChartItems = tagChartDataList[0].data.result;
          var tableCompareItems = tagCompareDataList[0].data.result;

          if (tag.type === 'site') {
            tableChartItems = getSiteData(tableChartItems, tag.id);
            tableCompareItems = getSiteData(tableCompareItems, tag.id);
          }

          _.each(metricList, function(metric) {
            var periodData = getTableMetricData(tableChartItems, metric);
            var comparePeriodData = getTableMetricData(tableCompareItems, metric);
            var comparisonData = comparisonsHelper.getComparisonData(periodData, comparePeriodData, true);
            tableData[metric.apiPropertyName] = {
              periodData: periodData,
              comparePeriodData: comparePeriodData,
              percentageChangePeriod: comparisonData.percentageChange,
              deltaColoringPeriod: comparisonData.deltaColoringPeriod,
              percentageChangeReal:comparisonData.percentageChangeReal
            };
          });
        }

        result.tableData.push(tableData);
      });

      _.each(metricList, function(metric) {
       var metricTotal = getTotalForTable(metric.apiPropertyName, result.tableData);

        _.each(result.tableData, function(row) {
          if (!ObjectUtils.isNullOrUndefined(row[metric.apiPropertyName])) {
            if (NumberUtils.isValidNonZeroNumber(metricTotal.periodTotal)) {
              row[metric.apiPropertyName].periodContribution = (row[metric.apiPropertyName].periodData / metricTotal.periodTotal) * 100;
            }
            if (NumberUtils.isValidNonZeroNumber(metricTotal.comparePeriodTotal)) {
              row[metric.apiPropertyName].comparePeriodContribution = (row[metric.apiPropertyName].comparePeriodData / metricTotal.comparePeriodTotal) * 100;
            }
          }
        });
      });

      return result;
    }

    function getTotalForTable(key, tableData) {
      var total = {
        periodTotal: 0,
        comparePeriodTotal: 0
      };

      _.each(tableData, function(row) {
        if (!ObjectUtils.isNullOrUndefined(row[key]) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(row[key].periodData)) {
          total.periodTotal += NumberUtils.getNumberValue(row[key].periodData);
        }
        if (!ObjectUtils.isNullOrUndefined(row[key]) &&
          !ObjectUtils.isNullOrUndefinedOrBlank(row[key].comparePeriodData)) {
          total.comparePeriodTotal += NumberUtils.getNumberValue(row[key].comparePeriodData);
        }
      });

      return total;
    }

    return {
      getDateRangeKey: getDateRangeKey,
      getCustomCompareData: getCustomCompareData,
      getMetricLookup: getMetricLookup,
      getChartLabels: getChartLabels,
      transformDataForChart: transformDataForChart,
      transformDataForTable: transformDataForTable,
      getMetricFromLookup: getMetricFromLookup,
      saveUserCustomCompare: saveUserCustomCompare,
      setMetricLookup: setMetricLookup
    };
  }
})();
