(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('lineChartWidget', lineChartWidget);

  function lineChartWidget() {
    return {
      templateUrl: 'components/widgets/line-chart-widget/line-chart-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationId: '=',
        zoneId: '=',
        // Date settings
        dateRangeStart: '=',
        dateRangeEnd: '=',
        compareRange1Start: '=',
        compareRange1End: '=',
        compareRange1Type: '=?',
        compareRange2Start: '=',
        compareRange2End: '=',
        compareRange2Type: '=?',
        // For localization
        currentUser: '=',
        currentOrganization: '=',
        // API/data settings
        operatingHours: '=',
        firstDayOfWeekSetting: '=',
        getUniqueReturning: '=',
        summaryAverages: '=',
        apiEndpoint: '@',
        apiReturnKey: '@',
        separateSummaryRequests: '@',
        multiplier: '=?',
        groupBy: '=?',
        // Widget output settings
        widgetIcon: '@',
        kpi: '=?',
        kpiLabel: '@',
        valueLabel: '@',
        onExportClick: '&',
        dateFormatMask: '=',
        showLegend: '=?',
        showChartInLegend: '=?',
        returnDataPrecision: '=?',
        hideExportIcon: '=?',
        exportIsDisabled: '=?',
        language: '=',
        exporting: '=?',
        showMetrics: '=?',
        currencySymbol: '=?', // used only by the PDF exports
        salesCategories: '=?',
        onSelectOption: '=',
        isLoading: '=?',
        setSelectedWidget: '&',
        selectedOption: '=?',
        chartType: '=?'
      },
      controller: lineChartWidgetController,
      controllerAs: 'lineChartWidget',
      bindToController: true
    };
  }


  lineChartWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    'requestManager',
    '$q',
    '$filter',
    '$state',
    'apiUrl',
    'utils',
    'metricConstants',
    'comparisonsHelper',
    'LocalizationService',
    'SubscriptionsService',
    '$translate',
    'ObjectUtils'
  ];

  function lineChartWidgetController(
    $scope,
    $rootScope,
    $timeout,
    requestManager,
    $q,
    $filter,
    $state,
    apiUrl,
    utils,
    metricConstants,
    comparisonsHelper,
    LocalizationService,
    SubscriptionsService,
    $translate,
    ObjectUtils) {

    var lineChartWidget = this;

    lineChartWidget.isPdf = $rootScope.pdf;
    lineChartWidget.coloring = 'positive';
    lineChartWidget.isLoading = true;
    lineChartWidget.requestFailed = false;
    lineChartWidget.requestsLoading = 0;
    lineChartWidget.numberFormatName = LocalizationService.getCurrentNumberFormatName(lineChartWidget.currentUser, lineChartWidget.currentOrganization);
    /* Tooltip requests are fired when hovering. This can generate a lot of concurrent requests.
     This is the maximum number of concurrent request. Note! 1 request here means 3 requests,
     for each date period.
     */
    lineChartWidget.maxConcurrentTooltips = 2;

    lineChartWidget.loadTooltipData = loadTooltipData;
    lineChartWidget.loadWidgetDefaults = loadWidgetDefaults;
    lineChartWidget.getCommonRequestParams = getCommonRequestParams;
    lineChartWidget.formatDate = formatDate;
    lineChartWidget.setGroupBy = setGroupBy;
    lineChartWidget.hasData = hasData;
    lineChartWidget.setLegendLabel = setLegendLabel;
    lineChartWidget.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
    lineChartWidget.compareRangeIsPriorYear = compareRangeIsPriorYear;
    lineChartWidget.calculateDelta = calculateDelta;

    lineChartWidget.chartType = lineChartWidget.chartType || 'line';
    lineChartWidget.dateRangeSpansOverTwoCalendarWeeks = utils.dateRangeSpansOverTwoCalendarWeeks;
    lineChartWidget.dateRangeSpansOverTwoCalendarMonths = utils.dateRangeSpansOverTwoCalendarMonths;
    if(!$rootScope.pdf && !ObjectUtils.isNullOrUndefined($state.current.views)){
      lineChartWidget.tabWidget = $state.current.views.analyticsMain.controller.toString() + '-' + lineChartWidget.kpi.toString();
    }

    if(ObjectUtils.isNullOrUndefined($rootScope.groupBy)){
      $rootScope.groupBy = {};
    }


    var chartWidth = 600;

    lineChartWidget.dateRanges = [];
    lineChartWidget.requestQueue = [];

    var labelSpacing = 60;
    lineChartWidget.chartOptions = {
      lineSmooth: false,
      axisY: {
        offset: 40,
        labelInterpolationFnc: function (value) {
          return $filter('formatYAxis')(value, lineChartWidget.kpi, lineChartWidget.numberFormatName);
        }
      },
      axisX: {
        showGrid: false,
        labelInterpolationFnc: function (value, index) {
          var maxLabels = Math.floor(chartWidth / labelSpacing);
          var labelInterval = Math.ceil(lineChartWidget.chartData.labels.length / maxLabels);
          return index % labelInterval === 0 ? value : null;
        }
      }
    };

    activate();

    lineChartWidget.orgChange = $scope.$watchGroup([
      'lineChartWidget.orgId',
      'lineChartWidget.siteId',
      'lineChartWidget.zoneId',
    ], updateWithOptions);

    lineChartWidget.groupChange = $scope.$watchGroup([
      'lineChartWidget.locationId',
      'lineChartWidget.dateRangeStart',
      'lineChartWidget.dateRangeEnd',
      'lineChartWidget.groupBy',
      'lineChartWidget.salesCategories',
      'lineChartWidget.chartType'
    ], updateWidget);

    lineChartWidget.requestQueueChange = $scope.$watchCollection('lineChartWidget.requestQueue', loadDetails);

    lineChartWidget.setOption = function (option) {
      if (lineChartWidget.selectedOption.name === option.name) {
        return;
      }

      lineChartWidget.selectedOption = option;
      if (!$rootScope.customDashboards) {
        lineChartWidget.kpi = lineChartWidget.selectedOption.name;
      }

      lineChartWidget.apiReturnKey = lineChartWidget.selectedOption.propertyName;

      if (lineChartWidget.selectedOption.metric.subscription !== 'sales') {
        delete lineChartWidget.salesCategories;
        lineChartWidget.showSalesCategoriesSelector = false;
      } else {
        lineChartWidget.showSalesCategoriesSelector = true;
      }

      lineChartWidget.onSelectOption(option);

      setDataFormats();

      updateWidget();
    };

    $scope.$on('$destroy', function () {
      if (typeof lineChartWidget.requestQueueChange === 'function') {
        lineChartWidget.requestQueueChange();
      }

      if (typeof lineChartWidget.groupChange === 'function') {
        lineChartWidget.groupChange();
      }

      if (typeof lineChartWidget.orgChange === 'function') {
        lineChartWidget.orgChange();
      }
    });

    function activate() {

      loadTranslations();

      loadWidgetDefaults();

      if (!ObjectUtils.isNullOrUndefined(lineChartWidget.showMetrics)) {
        setOptions();
      }

      setDataFormats();
    }

    function setDataFormats() {

      var formatting = getMetricsFormatting(lineChartWidget.kpi);

      if( !ObjectUtils.isNullOrUndefined(formatting) ) {

        lineChartWidget.dataPrecision = formatting.precision;
        lineChartWidget.dataPrefix = formatting.prefixSymbol;
        lineChartWidget.dataSuffix = formatting.suffixSymbol;
      } else {
        lineChartWidget.dataPrecision = lineChartWidget.returnDataPrecision;
        lineChartWidget.dataPrefix = '';
        lineChartWidget.dataSuffix = '';
      }

      if( !ObjectUtils.isNullOrUndefined(lineChartWidget.currencySymbol) ) {
        lineChartWidget.dataPrefix = lineChartWidget.currencySymbol;
      }

    }

    function loadWidgetDefaults() {
      if (lineChartWidget.groupBy === 'hour') {
        $rootScope.groupBy = 'hour';
      }
      if (typeof lineChartWidget.groupBy !== 'string' ||
        !ObjectUtils.isNullOrUndefinedOrEmpty(lineChartWidget.groupBy) &&
        !$rootScope.pdf && !$rootScope.customDashboards){
        lineChartWidget.groupBy = 'day';
        if(!ObjectUtils.isNullOrUndefinedOrEmpty($state.current.views)){
          $rootScope.groupBy[lineChartWidget.tabWidget] = 'day';
        }
      }

      if( ObjectUtils.isNullOrUndefined(lineChartWidget.returnDataPrecision) ) {
        lineChartWidget.returnDataPrecision = 0;
      }

      if( ObjectUtils.isNullOrUndefined(lineChartWidget.multiplier) ) {
        lineChartWidget.multiplier = 1;
      }

      lineChartWidget.compare1Period = {
        start: lineChartWidget.compareRange1Start,
        end: lineChartWidget.compareRange1End
      };

      lineChartWidget.compare2Period = {
        start: lineChartWidget.compareRange2Start,
        end: lineChartWidget.compareRange2End
      };
    }

    function getMetricsFormatting(value) {

      var metric = _.find(metricConstants.metrics, function(_metric) {
        return _metric.value === value;
      });

      if(!ObjectUtils.isNullOrUndefined(metric)) {
        var formatting = {precision: metric.precision, prefixSymbol: metric.prefixSymbol, suffixSymbol:metric.suffixSymbol};
        return formatting;
      }

      return;
    }

    function updateWidget() {
      lineChartWidget.isLoading = true;
      lineChartWidget.requestFailed = false;

      lineChartWidget.chartData = {
        labels: [],
        series: [[], [], []]
      };
      lineChartWidget.summaryData = [null, null, null];
      lineChartWidget.delta = [{}, {}, {}];
      lineChartWidget.returnData = [];
      lineChartWidget.uniqueData = [];
      lineChartWidget.totalData = [];
      lineChartWidget.separateSummaryRequests = true;

      if (ObjectUtils.isNullOrUndefined(lineChartWidget.apiEndpoint)) {
        lineChartWidget.isLoading = false;
        lineChartWidget.requestFailed = true;
        return true;
      }

      lineChartWidget.tooltipData = [];

      fetchChartData()
        .then(transformChartData)
        .catch(function () {
          lineChartWidget.isLoading = false;
          lineChartWidget.requestFailed = true;
        });
    }

    function updateWithOptions() {
      if (!ObjectUtils.isNullOrUndefined(lineChartWidget.showMetrics)) {
        setOptions();
      }
      updateWidget();
    }

    function setDefaultOption() {
      switch (lineChartWidget.kpi) {
        case 'sales':
          lineChartWidget.options = [getSalesOption()];
          break;
        case 'conversion':
          lineChartWidget.options = [getConversionOption()];
          break;
        case 'ats':
          lineChartWidget.options = [getAtsOption()];
          break;
        case 'star':
          lineChartWidget.options = [getStarOption()];
          break;
        default:
          lineChartWidget.options = [getTrafficOption()];
          break;
      }
    }

    function getTrafficOption() {
      return {
        name: 'traffic',
        displayType: 'traffic',
        propertyName: 'total_traffic',
        metric: getMetric('traffic')
      };
    }

    function getSalesOption() {
      return {
        name: 'sales',
        displayType: 'sales',
        propertyName: 'sales_amount',
        metric: getMetric('sales')
      };
    }

    function getConversionOption() {
      return {
        name: 'conversion',
        displayType: 'conversion',
        propertyName: 'conversion',
        metric: getMetric('conversion')
      };
    }

    function getAtsOption() {
      return {
        name: 'ats',
        displayType: 'ats',
        propertyName: 'ats',
        metric: getMetric('ats')
      };
    }

    function getStarOption() {
      return {
        name: 'star',
        displayType: 'star',
        propertyName: 'star',
        metric: getMetric('star')
      };
    }

    function setOptions() {
      if (lineChartWidget.showMetrics !== true) {
        setDefaultOption();
      }
      else {
        lineChartWidget.options = [getTrafficOption()];
        var saleSubscription = SubscriptionsService.siteHasSales(lineChartWidget.currentOrganization, lineChartWidget.currentSite);

        if (saleSubscription) {
          lineChartWidget.options.push(getSalesOption(), getConversionOption(), getAtsOption());
        }

        var laborSubscription = SubscriptionsService.siteHasLabor(lineChartWidget.currentOrganization, lineChartWidget.currentSite);

        if (laborSubscription) {
          lineChartWidget.options.push(getStarOption());
        }
      }

      if(!$rootScope.customDashboards) {
        lineChartWidget.selectedOption = lineChartWidget.options[0];
      } else {
        var search = { name: lineChartWidget.kpi };
        lineChartWidget.selectedOption = _.findWhere(lineChartWidget.options, search);
      }
      if (lineChartWidget.selectedOption.metric.isCurrency && !ObjectUtils.isNullOrUndefinedOrBlank(lineChartWidget.currencySymbol)) {
        lineChartWidget.selectedOption.metric.prefixSymbol = lineChartWidget.currencySymbol;
      }

      lineChartWidget.kpi = lineChartWidget.selectedOption.name;
      lineChartWidget.apiReturnKey = lineChartWidget.selectedOption.propertyName;
    }

    function getMetric(id) {
      return _.findWhere(metricConstants.metrics, { value: id });
    }

    function getApiUrl() {
      if (ObjectUtils.isNullOrUndefined(lineChartWidget.selectedOption) ||
        lineChartWidget.selectedOption.name === 'traffic') {
        return lineChartWidget.apiEndpoint;
      }

      return 'kpis/sales';
    }

    function fetchChartData() {
      var commonRequestParams = getCommonRequestParams();
      var _apiUrl = apiUrl + '/' + getApiUrl();


      if(getApiUrl() === 'kpis/sales' && lineChartWidget.kpi !== 'sales') {
        commonRequestParams.kpi = [ lineChartWidget.kpi ];
      }

      return $q.all([
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.dateRangeStart)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.dateRangeEnd)),
          }, commonRequestParams)
        }),
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.compare1Period.start)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.compare1Period.end)),
          }, commonRequestParams)
        }),
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.compare2Period.start)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.compare2Period.end)),
          }, commonRequestParams)
        })
      ]);
    }

    function getCommonRequestParams() {
      var commonRequestParams = {
        orgId: lineChartWidget.orgId,
        groupBy: lineChartWidget.groupBy
      };

      if (angular.isDefined(lineChartWidget.zoneId)) {
        commonRequestParams.zoneId = lineChartWidget.zoneId;
      }
      if (angular.isDefined(lineChartWidget.siteId)) {
        commonRequestParams.siteId = lineChartWidget.siteId;
      }
      if (angular.isDefined(lineChartWidget.locationId) && !ObjectUtils.isNullOrUndefined(lineChartWidget.locationId)) {
        commonRequestParams.locationId = lineChartWidget.locationId;
      }
      if (angular.isDefined(lineChartWidget.operatingHours)) {
        commonRequestParams.operatingHours = lineChartWidget.operatingHours;
      }
      commonRequestParams.includeUnique = false;
      commonRequestParams.includeReturning = false;
      commonRequestParams.sales_category_id = selectedSalesCategoriesList();
      return commonRequestParams;
    }

    function selectedSalesCategoriesList() {
      return _.pluck(lineChartWidget.salesCategories, 'id');
    }

    function transformChartData(responses) {
      var result = angular.copy(responses);
      var reportData = result[0].result;
      var compareData = result[1].result;
      var yearCompareData = result[2].result;

      transformPeriodData('report', reportData);
      transformPeriodData('compare_period', compareData);
      transformPeriodData('compare_year', yearCompareData);

      loadSummary();
    }

    function loadSummary() {
     /* If unique and returning values (traffic widget) are used, we need to make separate
        API requests for summary data to fetch unique/returning data.
      */

      var commonRequestParams = getCommonRequestParams();
      var averageRequestParams;

      if (lineChartWidget.separateSummaryRequests || lineChartWidget.getUniqueReturning) {
        averageRequestParams = angular.copy(commonRequestParams);
        averageRequestParams.includeUnique = true;
        averageRequestParams.includeReturning = true;
        averageRequestParams.groupBy = 'aggregate';

        if(getApiUrl() === 'kpis/sales' && lineChartWidget.kpi !== 'sales') {
          averageRequestParams.kpi = [ lineChartWidget.kpi ];
        }

        fetchSummaryData(averageRequestParams).then(function(responses) {
          transformSummaryData(responses);
          finalizeLoad();
        });
      } else {
        finalizeLoad();
      }
    }

    function finalizeLoad() {
      setNoData();
      lineChartWidget.isLoading = false;
      lineChartWidget.requestFailed = false;
    }

    function setNoData() {
      lineChartWidget.noData = ObjectUtils.isNullOrUndefinedOrEmpty(lineChartWidget.chartData.series) || !hasSeriesData() || !hasData(0);
    }

    function hasSeriesData() {
      var data = _.find(lineChartWidget.chartData.series, function (item) {
        return !ObjectUtils.isNullOrUndefinedOrEmpty(item);
      });

      return !ObjectUtils.isNullOrUndefinedOrEmpty(data);
    }

    function transformPeriodData(type, data) {
      var index, i, entry, seriesItemIndex, chartStartDate, chartEndDate;
      if(ObjectUtils.isNullOrUndefinedOrEmpty(data)) {
        return;
      }

      if (type === 'report') {
        index = 0;
        chartStartDate = moment(lineChartWidget.dateRangeStart);
        chartEndDate = moment(lineChartWidget.dateRangeEnd);
        lineChartWidget.chartData.labels = [];
      } else if (type === 'compare_period') {
        index = 1;
        chartStartDate = moment(lineChartWidget.compare1Period.start);
        chartEndDate = moment(lineChartWidget.compare1Period.end);
      } else if (type === 'compare_year') {
        index = 2;
        chartStartDate = moment(lineChartWidget.compare2Period.start);
        chartEndDate = moment(lineChartWidget.compare2Period.end);
      } else {
        return;
      }

      lineChartWidget.dateRanges[index] = {
        start: formatShortDate(chartStartDate),
        end: formatShortDate(chartEndDate)
      };

      if (ObjectUtils.isNullOrUndefined(lineChartWidget.tooltipData[index])) {
        lineChartWidget.tooltipData[index] = {};
      }

      for (i = 0; i < data.length; i++) {
        /* Populate the data series. */
        entry = data[i];
        seriesItemIndex = convertDateToChartSeriesIndex(
          moment(entry.period_start_date),
          chartStartDate,
          lineChartWidget.groupBy
        );
        lineChartWidget.chartData.series[index][seriesItemIndex] = entry[lineChartWidget.apiReturnKey];
        if (ObjectUtils.isNullOrUndefined(lineChartWidget.tooltipData[index][seriesItemIndex])) {
          lineChartWidget.tooltipData[index][seriesItemIndex] = {};
        }
        lineChartWidget.tooltipData[index][seriesItemIndex].value = entry[lineChartWidget.apiReturnKey];
        lineChartWidget.tooltipData[index][seriesItemIndex].startDate = moment(entry.period_start_date);
        lineChartWidget.tooltipData[index][seriesItemIndex].endDate = moment(entry.period_end_date);

        /* Create chart labels. */
        if (index === 0) {
          var label = formatShortDate(entry.period_start_date);
          lineChartWidget.chartData.labels[seriesItemIndex] = label;
        }
      }

      // If we don't do separate summary requests, calculate totals here
      if (!lineChartWidget.separateSummaryRequests && !lineChartWidget.getUniqueReturning) {
        lineChartWidget.totalData[index] = data;
        calculateTotalAggregate(index, data);
      }
    }


    function convertDateToChartSeriesIndex(date, startDate, groupBy) {
      switch (groupBy) {
        case 'day':
          return Math.floor((date.unix() - startDate.unix()) / (24 * 3600));
        case 'week':
          return Math.floor((date.unix() - startDate.unix()) / (7 * 24 * 3600));
        case 'month':
          return 12 * (date.year() - startDate.year()) + (date.month() - startDate.month());
      }
    }

    function loadTooltipData(seriesItemIndex) {
      if (lineChartWidget.getUniqueReturning === true && tooltipDataInitialized(seriesItemIndex) && !tooltipDataIsLoaded(seriesItemIndex)) {
        var params = [];

        _.each(lineChartWidget.tooltipData, function(dateRange) {
          params.push({
            reportStartDate: utils.getDateStringForRequest(dateRange[seriesItemIndex].startDate),
            reportEndDate: utils.getDateStringForRequest(dateRange[seriesItemIndex].endDate)
          });

          dateRange[seriesItemIndex].details = {};
        });

        lineChartWidget.requestQueue.push({
          seriesItemIndex: seriesItemIndex,
          params: params
        });
      }
    }

    function tooltipDataInitialized(seriesItemIndex) {
      var initialized = _.every(lineChartWidget.tooltipData, function(dateRange) {
        return !ObjectUtils.isNullOrUndefined(dateRange) && !ObjectUtils.isNullOrUndefined(dateRange[seriesItemIndex]);
      });

      return initialized;
    }

    function tooltipDataIsLoaded(seriesItemIndex) {
      var loaded = _.every(lineChartWidget.tooltipData, function(dateRange) {
        return !ObjectUtils.isNullOrUndefined(dateRange[seriesItemIndex].details);
      });

      return loaded;
    }

    function loadDetails() {
      if (Object.keys(lineChartWidget.requestQueue).length > 0 && lineChartWidget.requestsLoading < lineChartWidget.maxConcurrentTooltips) {
        var item = lineChartWidget.requestQueue.shift();
        lineChartWidget.requestsLoading++;

        fetchDetailData(item)
          .then(transformDetailData)
          .then(function () {
            lineChartWidget.requestsLoading--;
            loadDetails();
          })
          .catch(function () {
            lineChartWidget.requestsLoading--;
            loadDetails();
          });
      }
    }

    function fetchDetailData(item) {
      var commonRequestParams = getCommonRequestParams();
      commonRequestParams.includeUnique = true;
      commonRequestParams.includeReturning = true;
      commonRequestParams.groupBy = 'aggregate';
      var _apiUrl = apiUrl + '/' + getApiUrl();
      var promises = [];

      _.each(item.params, function(dateRange) {
        promises.push(requestManager.get(_apiUrl, {
          params: angular.extend({}, dateRange, commonRequestParams)
        }));
      });

      return $q.all(promises);
    }

    function transformDetailData(responses) {
      var result = angular.copy(responses);
      var seriesItemIndex;
      var chartStartDate = {
        0: moment(lineChartWidget.dateRangeStart),
        1: moment(lineChartWidget.compare1Period.start),
        2: moment(lineChartWidget.compare2Period.start)
      };
      _.each(result, function (response, index) {
        seriesItemIndex = convertDateToChartSeriesIndex(
          moment(response.result[0].period_start_date),
          chartStartDate[index],
          lineChartWidget.groupBy
        );
        lineChartWidget.tooltipData[index][seriesItemIndex].details = {
          return: response.result[0].return_traffic,
          unique: response.result[0].unique_traffic
        };
      });
    }

    function fetchSummaryData(averageRequestParams) {
      var _apiUrl = apiUrl + '/' + getApiUrl();

      return $q.all([
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.dateRangeStart)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.dateRangeEnd)),
          }, averageRequestParams)
        }),
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.compare1Period.start)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.compare1Period.end)),
          }, averageRequestParams)
        }),
        requestManager.get(_apiUrl, {
          params: angular.extend({}, {
            reportStartDate: utils.getDateStringForRequest(moment(lineChartWidget.compare2Period.start)),
            reportEndDate: utils.getDateStringForRequest(moment(lineChartWidget.compare2Period.end)),
          }, averageRequestParams)
        })
      ]);
    }

    function transformSummaryData(responses) {
      lineChartWidget.totalData = [];

      _.each(responses, function(response, index) {
        if(lineChartWidget.summaryAverages) {
          calculateAverageData(index, response.result);
        } else {
          calculateTotalAggregate(index, response.result);
        }

        lineChartWidget.totalData.push(response.result);
      });
    }

    function calculateAverageData(index, data) {
      var currentValue, compareValue;

      if (index > 0 && !ObjectUtils.isNullOrUndefined(data[0])) {
        compareValue = data[0][lineChartWidget.apiReturnKey];
        currentValue = lineChartWidget.summaryData[0];

        lineChartWidget.delta[index] = comparisonsHelper.getComparisonData(currentValue, compareValue, true);
        lineChartWidget.summaryData[index] = compareValue;
      } else if (!ObjectUtils.isNullOrUndefined(data[0])) {
        compareValue = data[0][lineChartWidget.apiReturnKey];
        lineChartWidget.summaryData[0] = compareValue;
      }
    }

    function calculateTotalAggregate(index, data) {
      var currentValue, compareValue;

      if (!ObjectUtils.isNullOrUndefined(data[0])) {
        if (data.length > 0) {
          lineChartWidget.returnData[index] = 0;
          lineChartWidget.uniqueData[index] = 0;
          compareValue = null;

          _.each(data, function (item) {
            if( !ObjectUtils.isNullOrUndefined(item[lineChartWidget.apiReturnKey] ) ) {
              if( compareValue === null) {
                //init
                compareValue = 0;
              }

              compareValue += item[lineChartWidget.apiReturnKey] * lineChartWidget.multiplier;
            }

            if (lineChartWidget.getUniqueReturning) {
              lineChartWidget.uniqueData[index] += item.unique_traffic * lineChartWidget.multiplier;
              lineChartWidget.returnData[index] += item.return_traffic * lineChartWidget.multiplier;
            }
          });
        } else {
          compareValue = data[0][lineChartWidget.apiReturnKey] * lineChartWidget.multiplier;
          if (lineChartWidget.getUniqueReturning) {
            lineChartWidget.uniqueData[index] = data[0].unique_traffic;
            lineChartWidget.returnData[index] = data[0].return_traffic;
          }
        }


        lineChartWidget.summaryData[index] = compareValue;
      }

      if (index > 0 && !ObjectUtils.isNullOrUndefined(data[0])) {
        currentValue = 0;
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(lineChartWidget.totalData[0])) {
          _.each(lineChartWidget.totalData[0], function (item) {
            currentValue += item[lineChartWidget.apiReturnKey] * lineChartWidget.multiplier;
          });
          lineChartWidget.delta[index] = comparisonsHelper.getComparisonData(currentValue, compareValue, true);
        }
      }
    }

    function formatDate(dateString) {
      return moment(dateString).format(lineChartWidget.dateFormatMask);
    }

    function formatShortDate(dateString) {
      return moment(dateString).format(lineChartWidget.dateFormatMask);
    }

    function setGroupBy(groupBy) {
      lineChartWidget.groupBy = groupBy;
      $rootScope.groupBy[lineChartWidget.tabWidget] = groupBy;
    }

    function hasData(index) {
      return !ObjectUtils.isNullOrUndefinedOrEmpty(lineChartWidget.chartData.series[index] ) && !ObjectUtils.isNullOrUndefined( lineChartWidget.summaryData[index] ) ;
    }

    function compareRangeIsPriorPeriod(comparePeriodType) {
      if (comparePeriodType === 'prior_period') {
        return true;
      } else {
        return false;
      }
    }

    function compareRangeIsPriorYear(comparePeriodType) {
      if (comparePeriodType === 'prior_year') {
        return true;
      } else {
        return false;
      }
    }

    function calculateDelta(current, compare) {
      return ((compare - current) / compare) * 100 * -1;
    }

    function loadTranslations() {
      $translate.use(lineChartWidget.language);
    }

    function setLegendLabel(comparisonIndex, comparisonType) {
      var compareRangeType = 'compareRange' + comparisonIndex + 'Type';
      switch (comparisonType) {
        case 'priorPeriod':
          return hasData(comparisonIndex) && compareRangeIsPriorPeriod(lineChartWidget[compareRangeType]);
        case 'priorYear':
          return hasData(comparisonIndex) && compareRangeIsPriorYear(lineChartWidget[compareRangeType]);
        case 'custom':
          return hasData(comparisonIndex) && !compareRangeIsPriorPeriod(lineChartWidget[compareRangeType]) && !compareRangeIsPriorYear(lineChartWidget[compareRangeType]);
        default:
          return hasData(comparisonIndex) && compareRangeIsPriorPeriod(lineChartWidget[compareRangeType]);
      }
    }
  }
})();
