(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('realTimeDataService', realTimeDataService);
  realTimeDataService.$inject = [
    'apiUrl',
    '$q',
    'requestManager',
    'ObjectUtils',
    'metricsHelper',
    'NumberUtils'
  ];
  function realTimeDataService(apiUrl, $q, requestManager, ObjectUtils, metricsHelper, NumberUtils) {
    var outstandingRequests = [];

    var metricLookup = [
      { key: 'sales', apiProperty: 'sales', apiReturnkey: 'sales', transkey: 'kpis.shortKpiTitles.tenant_sales' },
      { key: 'traffic', apiProperty: 'traffic', apiReturnkey: 'enterExit', transkey: 'kpis.shortKpiTitles.tenant_traffic' },
      {
        key: 'conversion', apiProperty: 'conversion', apiReturnkey: 'conversion', transkey: 'kpis.shortKpiTitles.tenant_conversion',
        calculatedMetric: true,
        dependencies: [
          'enterExit',
          'transactions'
        ]
      },
      {
        key: 'star', apiProperty: 'star', apiReturnkey: 'star', transkey: 'kpis.shortKpiTitles.tenant_star',
        calculatedMetric: true,
        dependencies: [
          'enterExit',
          'laborHours'
        ]
      },
      { key: 'labor', apiProperty: 'labor', apiReturnkey: 'laborHours', transkey: 'kpis.shortKpiTitles.tenant_labor' },
      { key: 'transaction', apiProperty: 'transactions', apiReturnkey: 'transactions', transkey: 'kpis.shortKpiTitles.tenant_transactions' },
      {
        key: 'ats', apiProperty: 'ats', apiReturnkey: 'ats', transkey: 'kpis.kpiTitle.ats',
        calculatedMetric: true,
        dependencies: [
          'sales',
          'transactions'
        ]
      },
    ];

    var getRealTimeKpiData = function (params, metricList, selectedSitesInfo, selectedTagsSites, enterExit, singleSite) {
      var deferred = $q.defer();
      var requestPromise = getRealTimeRequestPromise(params, singleSite);
      requestPromise.then(function (response) {
        enterExit = getEnterExit(response, enterExit);
        var businessDayData = response.result[0].businessDayData;
        var data = transformRealTimeDataForKPI(response.result[0].realtimeData,
          params,
          metricList,
          selectedSitesInfo,
          selectedTagsSites,
          enterExit,
          singleSite,
          businessDayData
        );
        removeOutstandingRequest(params, singleSite);
        deferred.resolve(data);
      }).catch(function (error) {
        removeOutstandingRequest(params, singleSite);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    var getRealTimeData = function (
      params,
      chartMetricList,
      tableMetricList,
      selectedSitesInfo,
      selectedTagsSites,
      hourlyOption,
      businessHourOption,
      enterExit,
      singleSite
      ) {
      var deferred = $q.defer();
      var requestPromise = getRealTimeRequestPromise(params, singleSite);

      requestPromise.then(function (response) {
        enterExit = getEnterExit(response, enterExit);
        var returnData = transformRealTimeData(params,
          response,
          chartMetricList,
          tableMetricList,
          selectedSitesInfo,
          selectedTagsSites,
          hourlyOption,
          businessHourOption,
          enterExit,
          singleSite
        );
        removeOutstandingRequest(params, singleSite);
        deferred.resolve(returnData);
      })
      .catch(function (error) {
        removeOutstandingRequest(params, singleSite);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    var cancelAllOutstandingRequests = function () {
      requestManager.cancelRequests(outstandingRequests);
      outstandingRequests = [];
    };

    function getOperatingHours(response) {
      var operatingHours = response.result[0].operatingHoursData;
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(operatingHours)) {
        return operatingHours[0];
      }
      return operatingHours;
    }

    function noDataForSiteLevel(response) {
      return ObjectUtils.isNullOrUndefined(response) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(response.result) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(response.result[0].realtimeData) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(response.result[0].realtimeData[0].sites) ||
        ObjectUtils.isNullOrUndefined(response.result[0].realtimeData[0].sites[0].data);
    }

    function logError(params,response) {
      console.log('error no data for params');
      console.log(params);
      console.log('response from api:');
      console.log(response);
    }

    function transformRealTimeData(params,
      response,
      chartMetricList,
      tableMetricList,
      selectedSitesInfo,
      selectedTagsSites,
      hourlyOption,
      businessHourOption,
      enterExit,
      singleSite
      ) {
      if (!singleSite) {
        return transformOrgLevelRealTimeData(
          response,
          params,
          chartMetricList,
          tableMetricList,
          selectedSitesInfo,
          selectedTagsSites,
          hourlyOption,
          businessHourOption,
          enterExit
        );
      }

      var returnData = {};
      if(noDataForSiteLevel(response)) {
        logError(params,response);
        return returnData;
      }
      var operatingHours = getOperatingHours(response);
      var businessDayData = response.result[0].businessDayData;
      var data = response.result[0].realtimeData[0].sites[0].data;
      var businessDayDataForSingleSite = filterBusinessDayDataForSingleSite(businessDayData, data);
      var items = getBusinessHoursItems(businessDayDataForSingleSite, operatingHours, businessHourOption);

      returnData.chartData = transformRealTimeDataForChart(items, params, chartMetricList, hourlyOption, enterExit, operatingHours);
      returnData.tableData = transformRealTimeDataForTable(items, params, tableMetricList, enterExit);
      return returnData;
    }

    function filterBusinessDayDataForSingleSite(businessDayData, items) {
      var startTime = getStartTimeForSingleSite(businessDayData);

      var filteredData = _.filter (items, function(data){
        var itemTime = moment(data.time, 'YYYYMMDDHH').format('YYYYMMDDHH');
        return itemTime >= startTime;
      });

      return filteredData;
    }

    function getStartTimeForSingleSite(businessDayData) {
      if(ObjectUtils.isNullOrUndefined(businessDayData)) {
        return moment().hours(0).minutes(0).format('YYYYMMDDHH');
      }

      return moment(businessDayData.start,'YYYY-MM-DDTHH:mm:ss').format('YYYYMMDDHH');
    }

    function getSelectedItemsForOrgLevel(items, selectedSitesInfo, selectedTagsSites) {
      if(ObjectUtils.isNullOrUndefinedOrEmpty(selectedSitesInfo) &&
        ObjectUtils.isNullOrUndefinedOrEmpty(selectedTagsSites)) {
        return items;
      }
      var realTTimeSelectedSitesItems = _.filter(items, function(item) {
        var site = _.findWhere(selectedSitesInfo, { customer_site_id: item.id });
        var tagSite = _.findWhere(selectedTagsSites, { customer_site_id: item.id });
        return !ObjectUtils.isNullOrUndefined(site) ||
          !ObjectUtils.isNullOrUndefined(tagSite);
      });
      return realTTimeSelectedSitesItems;
    }

    function noDataForOrgLevel(response) {
      return ObjectUtils.isNullOrUndefined(response) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(response.result) ||
        ObjectUtils.isNullOrUndefined(response.result[0].realtimeData);
    }

    function transformOrgLevelRealTimeData(response,
      params,
      chartMetricList,
      tableMetricList,
      selectedSitesInfo,
      selectedTagsSites,
      hourlyOption,
      businessHourOption,
      enterExit
      ) {
      var returnData = {};

      if(noDataForOrgLevel(response)) {
        return returnData;
      }

      var businessDayData = response.result[0].businessDayData;

      var items = getSelectedItemsForOrgLevel(response.result[0].realtimeData, selectedSitesInfo, selectedTagsSites);

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(items)){
        returnData.tableData = transformOrgLevelRealTimeDataForTable(items, params, tableMetricList, enterExit, businessDayData);
      }

      return returnData;
    }

    function getLocalTime(item) {
      if(!ObjectUtils.isNullOrUndefined(item) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item.data) &&
        !ObjectUtils.isNullOrUndefinedOrBlank(item.data[item.data.length -1].time)) {
        return moment(item.data[item.data.length -1].time, 'YYYYMMDDHHmm').format('HH:mm');
      }

      //when site filtered data structure is different so check it
      if(!ObjectUtils.isNullOrUndefinedOrEmpty(item) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item[0].sites) &&
        !ObjectUtils.isNullOrUndefined(item[0].sites[0].data)) {
        return moment(item[0].sites[0].data[item[0].sites[0].data.length -1].time, 'YYYYMMDDHHmm').format('HH:mm');
      }

      return '';

    }

    function getSiteId(item) {
      if(!ObjectUtils.isNullOrUndefined(item) &&
        !ObjectUtils.isNullOrUndefined(item.id) ) {
        return item.id;
      }

      if( !ObjectUtils.isNullOrUndefinedOrEmpty(item) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item[0].sites) &&
        !ObjectUtils.isNullOrUndefined(item[0].sites[0].id)) {
        return  item[0].sites[0].id;
      }

      return null;
    }

    function filterBusinessDayData(businessDayData, item) {
      var startTime = getStartTime(businessDayData, item);

      var filteredData = _.filter (item.data, function(data){
        var itemTime = moment(data.time, 'YYYYMMDDHH').format('YYYYMMDDHH');
        return itemTime >= startTime;
      });

      return filteredData;
    }

    function getStartTime(businessDayData, item) {
      if(ObjectUtils.isNullOrUndefined(businessDayData)) {
        return moment().hours(0).format('YYYYMMDDHH');
      }

      var businessDay = Array.isArray(businessDayData)? _.findWhere(businessDayData, {site_id:item.id}):businessDayData;

      var startDate = ObjectUtils.isNullOrUndefined(businessDay)? moment().hours(0): moment(businessDay.start,'YYYY-MM-DDTHH:mm:ss');

      return  startDate.format('YYYYMMDDHH');
    }

    function getApiPropertyValue(metric, item, enterExits, businessDayData) {
      if(!ObjectUtils.isNullOrUndefined(item) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item.data)) {
        return metricsHelper.getTotalForMetric(metric, filterBusinessDayData(businessDayData, item), enterExits);
      }

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(item) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(item[0].sites) &&
        !ObjectUtils.isNullOrUndefined(item[0].sites[0].data)) {
        return metricsHelper.getTotalForMetric(metric, filterBusinessDayData(businessDayData,item[0].sites[0]), enterExits);
      }
    }

    function buildSiteData (metricList, item, enterExits, siteId, index, businessDayData) {
      var siteData = {
        siteId: siteId,
        siteName: siteId,
        localHour: getLocalTime(item),
        siteIndex: index
      };

      _.each(metricList, function (metric) {
        siteData[metric.apiPropertyName] = getApiPropertyValue(metric, item, enterExits, businessDayData);
      });

      return siteData;
    }

    function transformOrgLevelRealTimeDataForTable(tableItems, params, metricList, enterExits, businessDayData) {
      var result = {
        tableData: [],
        averages: {},
        totals: {}
      };

      _.each(tableItems, function (item, index) {
        var siteId = getSiteId(item);
        if(!ObjectUtils.isNullOrUndefined(item)) {
          result.tableData.push(buildSiteData (metricList, item, enterExits, siteId, index, businessDayData));
        }
      });

      _.each(metricList, function (metric) {
        var metricTotal = getTotalForTable(metric.apiPropertyName, result.tableData);

        _.each(result.tableData, function (row) {
          var contribution = (row[metric.apiPropertyName] / metricTotal.total) * 100;
          var propertyName = metric.apiPropertyName + '_contribution';
          row[propertyName] = contribution;
        });

        var metricAverage = metricTotal.count > 1 ? (metricTotal.total / metricTotal.count): metricTotal.total;

        result.averages[metric.apiPropertyName] = metricAverage;
        result.totals[metric.apiPropertyName] = metric.calculatedMetric === true? metricAverage : metricTotal.total;
      });

      return result;
    }

    function dataHasEnterExit(response) {
      return !ObjectUtils.isNullOrUndefined(response) &&
       !ObjectUtils.isNullOrUndefinedOrEmpty(response.result) &&
       !ObjectUtils.isNullOrUndefinedOrBlank(response.result[0].enterExit);
    }

    function getDefaultEnterExit(enterExit) {
      return !ObjectUtils.isNullOrUndefinedOrBlank(enterExit)? enterExit: 'exits';
    }

    function getEnterExit(response, enterExit) {
      return dataHasEnterExit(response) ? response.result[0].enterExit.toLowerCase() : getDefaultEnterExit(enterExit).toLowerCase();
    }

    function getHourDataFromDataList(hour, dataList) {
      var hourData = _.find(dataList, function (item) {
        return moment(item.time, 'YYYYMMDDHHmm').format('YYYYMMDDHHmm') === hour.format('YYYYMMDDHHmm');
      });

      return hourData;
    }

    function removeOutstandingRequest(params, singleSite) {
      if(ObjectUtils.isNullOrUndefinedOrEmpty(outstandingRequests)) {
        return;
      }

      var url = getUrl(params, singleSite);

      var outstandingRequest = requestManager.findOutstandingRequest(url, {params: params}, outstandingRequests);

      if(!ObjectUtils.isNullOrUndefined(outstandingRequest)) {
         outstandingRequests = _.without(outstandingRequests, outstandingRequest);
      }
    }

    function getUrl(params, singleSite) {
      var url = apiUrl + '/realtime';

      //if no site id defined or we have multiple sites selected then we need to call org level so add organization to the url
      if (!singleSite) {
        url += '/organization';
      }

      return url;
    }

    function getRealTimeRequestPromise(params, singleSite) {
      var url = getUrl(params, singleSite);

      var outstandingRequest = requestManager.findOutstandingRequest(url, {params: params}, outstandingRequests);

      if(!ObjectUtils.isNullOrUndefined(outstandingRequest)) {
        return outstandingRequest.deferred.promise;
      }

      var req = requestManager.createRequest(url, {params: params});

      outstandingRequests.push(req);

      return req.deferred.promise;
    }

    function transformRealTimeDataForKPI(dataList, params, metricList, selectedSitesInfo, selectedTagsSites, enterExits, singleSite, businessDayData) {
      if (!singleSite) {
        return transformOrgLevelRealTimeDataForKPI(dataList, params, metricList, selectedSitesInfo, selectedTagsSites, enterExits, businessDayData);
      }

      var result = {
        hasData: false,
        metricList : metricList
      };

      _.each(metricList, function (metric) {
        var totalMetricValue = null;

        if(!ObjectUtils.isNullOrUndefinedOrEmpty(dataList)) {
          _.each(dataList, function (data) {
            var sites = data.sites;

            if(!ObjectUtils.isNullOrUndefinedOrEmpty(data) &&
              !ObjectUtils.isNullOrUndefinedOrEmpty(data[0].sites)) {
              sites = data[0].sites;
            }

            if(!ObjectUtils.isNullOrUndefinedOrEmpty(sites)) {
              _.each(sites, function (site) {
                var value= getApiPropertyValue(metric, site, enterExits, businessDayData) ;
                if(NumberUtils.isValidNumber(value)) {
                  if(ObjectUtils.isNullOrUndefined(totalMetricValue)) {
                    //init the value
                    totalMetricValue = 0;
                  }
                  totalMetricValue += value;
                }
              });
            }
          });
        }

        metric.totalValue = totalMetricValue;

        metric.hasData = ! ObjectUtils.isNullOrUndefinedOrBlank(metric.totalValue);

        if(metric.hasData === true) {
          result.hasData = true;
        }
      });

      result.metricList = metricList;

      return result;
    }

    function transformOrgLevelRealTimeDataForKPI(sites, params, metricList, selectedSitesInfo, selectedTagsSites, enterExits, businessDayData) {
      sites = getSelectedItemsForOrgLevel(sites, selectedSitesInfo, selectedTagsSites);

      var result = {
        hasData: false,
        metricList : metricList
      };

      if(ObjectUtils.isNullOrUndefinedOrEmpty(sites) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(metricList)) {
          return result;
      }

      _.each(metricList, function (metric) {
        var sitesCount = 0;
        var totalMetricValue = null;

        _.each(sites, function (site) {
          var value = getApiPropertyValue(metric, site, enterExits, businessDayData);
          if(NumberUtils.isValidNumber(value)) {
            if(ObjectUtils.isNullOrUndefined(totalMetricValue)) {
              //init the value
              totalMetricValue = 0;
            }

            sitesCount += 1;
            totalMetricValue += value;
            metric.hasData = true;
          }
        });

        metric.totalValue = totalMetricValue;

        if(metric.hasData === true && metric.calculatedMetric === true && sitesCount >0 ) {
          metric.totalValue = metric.totalValue/ sitesCount;
        }

        if(metric.hasData === true) {
          result.hasData = true;
        }
      });

      result.metricList = metricList;

      return result;
    }

    function getChartLabels(items, hourlyOption) {
      var chartLabels = _.map(items, function (item) {
        if (hourlyOption === true) {
          return moment(item[0].time, 'YYYYMMDDHHmm').format('HH:mm');
        }
        return moment(item.time, 'YYYYMMDDHHmm').format('HH:mm');
      });

      return chartLabels;

    }

    /** Filters the data returned from the API to only data for the operating hours.
     *  Works around the API returning the operating hours for the next day
     *
     *  @param {object} items The response hourly data from the API
     *  @param {object} operatingHoursData an object containing two start and end properties, which are date strings
     *  @returns {boolean} businessHours. If set to false, all data will be returned (Business days vs Business hours)
     **/
    function getBusinessHoursItems(items, operatingHoursData, businessHours) {
      if (businessHours === false || ObjectUtils.isNullOrUndefined(operatingHoursData)) {
        return items;
      }

      var operatingHoursDateFormat = 'YYYY-MM-DDTHH:mm:ss';
      var realTimeDateFormat = 'YYYYMMDDHH';

      var start = moment(operatingHoursData.start, operatingHoursDateFormat);
      var end = moment(operatingHoursData.end, operatingHoursDateFormat);

      if(moment.duration(end.diff(start)).asHours() >=24) {
        return items;
      }

      // Get days between operating start and first entry
      // This is because the API returns us the operating hours for tomorrow
      var firstItemDate = moment(items[0].time, realTimeDateFormat).startOf('day');
      var startDay = moment(operatingHoursData.start, 'YYYY-MM-DD');
      var daysBetween = firstItemDate.diff(startDay, 'days');

      start.add(daysBetween, 'days');
      end.add(daysBetween, 'days');

      var businessHoursItems = _.filter(items, function (item) {
        var currentItemDateTime = moment(item.time, realTimeDateFormat + 'mm');

        return currentItemDateTime.isBetween(start, end) ||
          (currentItemDateTime.isSame(start) ||
          currentItemDateTime.isSame(end));
      });

      if(businessHoursItems.length === 0) {
        return items;
      }

      return businessHoursItems;
    }

    function transformRealTimeDataForChart(chartItems, params, metricList, hourlyOption, enterExit, operatingHoursData) {
      var series = [];
      var metricsWithData = [];

      var hourItems = getGroupedItems(chartItems, hourlyOption);
      hourItems = sortHourItems(hourItems, operatingHoursData, hourlyOption);

      var chartLabels = getChartLabels(hourItems, hourlyOption);

      _.each(metricList, function (metric) {
        var seriesData = [];

        _.each(hourItems, function (items) {
          var hourMetricValue;

          if (hourlyOption === true) {
            hourMetricValue = metricsHelper.getCalculatedMetricValue(items[0], metric, enterExit);

            var quarters = getHourQuarterItems(chartItems, items[0]);

            _.each(quarters, function (quarterItem) {
              var metricValue = metricsHelper.getCalculatedMetricValue(quarterItem, metric, enterExit);
              hourMetricValue += metricValue;
            });
          }
          else {
            hourMetricValue = metricsHelper.getCalculatedMetricValue(items, metric, enterExit);
          }

          seriesData.push(hourMetricValue);
        });
        var labelsWithNoData = [];

        _.filter(seriesData, function (labelData) {
          if (labelData === null) {
            labelsWithNoData.push(labelData);
          }
        });

        if (labelsWithNoData.length !== seriesData.length) {
          series.push(seriesData);
          metricsWithData.push(metric);
        }
      });

      return {
        labels: chartLabels,
        series: series,
        metricsWithData: metricsWithData
      };
    }

    function getGroupedItems(data, hourlyOption) {
      if (hourlyOption === true) {
        return getGroupedHourItems(data);
      }
      return data;

    }

    function getGroupedHourItems(items) {
      return _.groupBy(items, function (item) {
        return moment(item.time, 'YYYYMMDDHH');
      });
    }

    function sortHourItems(items, operatingHoursData, hourlyOption) {
      if (hourlyOption === false ||
        ObjectUtils.isNullOrUndefinedOrEmpty(items) ||
        ObjectUtils.isNullOrUndefined(operatingHoursData)) {
        return items;
      }
      var startHour = operatingHoursData.startHour;
      if (startHour !== moment(items[0].time, 'YYYYMMDDHHmm').hour()) {
        for (var i = 0; i < items.length; i++) {
          if (startHour === moment(items[i].time, 'YYYYMMDDHHmm').hour()) {
            break;
          }

          var last = items.shift();

          items.push(last);
        }
      }
    }

    function getHourQuarterItems(items, item) {
      var hour = moment(item.time, 'YYYYMMDDHHmm').hour() - 1;
      if (hour === -1) {
        hour = 23;
      }
      var quarters = _.filter(items, function (quarterItem) {
        var time = moment(quarterItem.time, 'YYYYMMDDHHmm');

        if (time.hour() === hour && time.minute() > 0) {
          return item;
        }
      });
      return quarters;
    }

    function transformRealTimeDataForTable(tableHourItems, params, metricList, enterExit) {
      var result = {
        tableData: [],
        averages: {},
        totals: {}
      };

      var hourLabels = _.map(tableHourItems, function (item) {
        return moment(item.time, 'YYYYMMDDHHmm');
      });

      _.each(hourLabels, function (hour, hourIndex) {
        var item = getHourDataFromDataList(hour, tableHourItems);

        var hourData = {
          period_start_date: hour,
          hour: moment(hour, 'YYYYMMDDHHmm').format('HH:mm'),
          hourIndex: hourIndex
        };

        _.each(metricList, function (metric) {
          if (metric.key !== 'all') {
            if(metricsHelper.isCalculatedMetricValueValid(item, metric, enterExit)) {
               hourData[metric.apiPropertyName] = metricsHelper.getCalculatedMetricValue(item, metric, enterExit);
            }
          }
        });

        result.tableData.push(hourData);
      });

      _.each(metricList, function (metric) {
        var metricTotal = getTotalForTable(metric.apiPropertyName, result.tableData);

        _.each(result.tableData, function (row) {
          var contribution = (row[metric.apiPropertyName] / metricTotal.total) * 100;
          var propertyName = metric.apiPropertyName + '_contribution';
          row[propertyName] = contribution;
        });

        var metricAverage = metricTotal.count > 1 ? (metricTotal.total / metricTotal.count) : metricTotal.total ;

        result.totals[metric.apiPropertyName] = metric.calculatedMetric === true ? metricAverage : metricTotal.total;

        result.averages[metric.apiPropertyName] = metricAverage;
      });

      return result;
    }

    function getTotalForTable(key, tableData) {
      var total;
      var count = 0;

      _.each(tableData, function (row) {
        if(NumberUtils.isValidNumber(row[key])) {
          if (ObjectUtils.isNullOrUndefined(total)) {
            total = 0;
          }
          count += 1;
          total += metricsHelper.getValidNumber(row[key]);
        }
      });

      return {total: total, count: count};
    }

    return {
      getRealTimeData: getRealTimeData,
      getRealTimeKpiData: getRealTimeKpiData,
      metricLookup:metricLookup,
      cancelAllOutstandingRequests:cancelAllOutstandingRequests
    };
  }
})();

