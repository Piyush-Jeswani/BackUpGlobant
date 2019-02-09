'use strict';

angular.module('shopperTrak.widgets').directive('shoppersVsOthersDetailWidget',
['$rootScope', '$state', 'requestManager', '$q', 'apiUrl', 'utils', 'LocalizationService', '$filter', 'ObjectUtils',
function($rootScope, $state, requestManager, $q, apiUrl, utils, LocalizationService, $filter, ObjectUtils) {
  return {
    templateUrl: 'components/widgets/shoppers-vs-others-detail-widget/shoppers-vs-others-detail-widget.partial.html',
    scope: {
      orgId:                  '=',
      siteId:                 '=',
      locationId:             '=',
      dateRangeStart:         '=',
      dateRangeEnd:           '=',
      compareRange1Start:     '=',
      compareRange1End:       '=',
      compareRange1Type:      '=',
      compareRange2Start:     '=',
      compareRange2End:       '=',
      compareRange2Type:      '=',
      currentUser:            '=',
      currentOrganization:    '=',
      dateFormatMask:         '=',
      firstDayOfWeekSetting:  '=',
      language:               '=',
      onExportClick:          '&',
      exportIsDisabled:       '=?',
      widgetIcon:             '@',
      hideExportIcon:         '=?',
      groupBy:                '=?',
      isLoading:              '=?',
      kpi:                    '=',
      setSelectedWidget:      '&'
    },
    link: function(scope, element) {
      var labelSpacing = 60;
      var currentUser = scope.currentUser;
      var currentOrganization = scope.currentOrganization;

     if (!scope.groupBy) {
        scope.groupBy = 'day';
      }

      scope.returnDataPrecision = 0;
      scope.multiplier = 1;

      scope.dateRangeSpansOverTwoCalendarWeeks = utils.dateRangeSpansOverTwoCalendarWeeks;
      scope.dateRangeSpansOverTwoCalendarMonths = utils.dateRangeSpansOverTwoCalendarMonths;

      scope.isPdf = $rootScope.pdf;
      scope.isLoading = true;
      scope.requestFailed = false;
      scope.hasWidgetLegend = hasWidgetLegend;
      scope.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      scope.compareRangeIsPriorYear = compareRangeIsPriorYear;

      scope.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);

      if(!$rootScope.pdf && !ObjectUtils.isNullOrUndefined($state.current.views)) {
        scope.tabWidget = $state.current.views.analyticsMain.controller.toString() + '-' + scope.kpi.toString();
      }

      if($rootScope.pdf) loadForPdfComplete();

      scope.chartOptions = {
        lineSmooth: false,
        axisY: {
          offset: 60,
          position: 'start',
          labelInterpolationFnc: function(value) {
            return $filter('formatYAxis')(value, 'shoppers_vs_others', scope.numberFormatName);
          }
        },
        axisX: {
          showGrid: false,
          labelInterpolationFnc: function(value, index) {
            var maxLabels = Math.floor($('.ct-chart', element).width() / labelSpacing);
            var labelInterval = Math.ceil(scope.chartData.labels.length / maxLabels);
            return index % labelInterval === 0 ? value : null;
          }
        },
        low: 0,
        hight: 100,
        showArea: true,
        showLine: false,
        showPoint: true,
        fullWidth: true
      };
      scope.chartData = {
        labels: [],
        series: []
      };

      scope.$watchGroup([
        'orgId',
        'siteId',
        'locationId',
        'dateRangeStart',
        'dateRangeEnd',
        'comparisonDateRangeStart',
        'comparisonDateRangeEnd',
        'widgetTitle',
        'groupBy',
        'utils'
      ], updateWidget);

      function updateWidget() {
        scope.isLoading = true;
        scope.requestFailed = false;
        fetchData()
          .then(transformData)
          .then(function() {
            scope.isLoading = false;
            scope.requestFailed = false;
          })
          .catch(function() {
            scope.isLoading = false;
            scope.requestFailed = true;
          });
      }

      function fetchData() {
        var commonRequestParams = {
          orgId:   scope.orgId,
          groupBy: scope.groupBy
        };
        var averageRequestParams = {};

        if (angular.isDefined(scope.siteId)) {
          commonRequestParams.siteId = scope.siteId;
        }
        if (angular.isDefined(scope.locationId)) {
          commonRequestParams.locationId = scope.locationId;
        }

        scope.compareRange1 = {
          start: scope.compareRange1Start,
          end: scope.compareRange1End
        };

        scope.compareRange2 = {
          start: scope.compareRange2Start,
          end: scope.compareRange2End
        };

        angular.copy(commonRequestParams,averageRequestParams);
        averageRequestParams.groupBy = 'aggregate';
        fetchAverage(averageRequestParams).then(transformAverageData);

        return $q.all([
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
              reportEndDate: utils.getDateStringForRequest(scope.dateRangeEnd),
            }, commonRequestParams)
          }),
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compareRange1.start),
              reportEndDate: utils.getDateStringForRequest(scope.compareRange1.end),
            }, commonRequestParams)
          }),
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compareRange2.start),
              reportEndDate: utils.getDateStringForRequest(scope.compareRange2.end),
            }, commonRequestParams)
          })
        ]);
      }

      function transformData(responses) {
        var reportData = responses[0].result;
        var compareData = responses[1].result;
        var yearCompareData = responses[2].result;

        scope.chartData = {
          series: [[], [], []],
          labels: []
        };
        scope.tooltipData = [];

        if (reportData.length === 0) {
          return;
        }

        scope.totalData = [];
        scope.firstDate = [];
        scope.endDate = [];
        scope.calculateDelta = [];
        scope.deltaLabel  = [];
        scope.deltaColoring = [];
        scope.numDays = [{shoppers:0,others:0},{shoppers:0,others:0},{shoppers:0,others:0}];

        transformPeriodData('report',reportData);
        transformPeriodData('compare_period',compareData);
        transformPeriodData('compare_year',yearCompareData);

        // In some cases, with the weekly grouping, the reportData and compareData
        // have different amount of weeks.
        if(scope.chartData.series[0].length > scope.chartData.series[1].length) {
          scope.chartData.labels.splice(-1,1);
          scope.chartData.series[0].splice(-1,1);
        }

        if(scope.chartData.series[1].length > scope.chartData.series[0].length) {
          scope.chartData.labels.splice(-1,1);
          scope.chartData.series[1].splice(-1,1);
        }

      }

      function transformPeriodData(type,data) {
        var index, i, entry, seriesItemIndex, chartStartDate, chartEndDate;

        if(type==='report') {
          index = 0;
          chartStartDate = moment(scope.dateRangeStart);
          chartEndDate = moment(scope.dateRangeEnd);
        } else if(type==='compare_period') {
          index = 1;
          chartStartDate = moment(scope.compareRange1.start);
          chartEndDate = moment(scope.compareRange1.end);
        } else if(type==='compare_year') {
          index = 2;
          chartStartDate = moment(scope.compareRange2.start);
          chartEndDate = moment(scope.compareRange2.end);
        } else {
          return;
        }

        if(data.length === 0) {
          return;
        }

        scope.chartData.series[index] = [];
        scope.totalData[index] = [];
        scope.totalData[index] = {shoppers: 0, others: 0};

        for (i = 0; i < data.length; i++) {
          entry = data[i];
          seriesItemIndex = convertDateToChartSeriesIndex(
            moment(entry.period_start_date),
            chartStartDate,
            scope.groupBy
          );

          if(index===0) {
            scope.chartData.series[0][seriesItemIndex] = entry.shopper_percent;
            scope.tooltipData[seriesItemIndex] = {
              date: scope.chartData.labels[seriesItemIndex],
              shoppers: entry.shopper_percent,
              others: entry.others_percent
            };
            scope.chartData.labels[seriesItemIndex] = moment(entry.period_start_date).format(scope.dateFormatMask);
          } else if(index===1) {
            scope.chartData.series[1][seriesItemIndex] = 100;
          }
        }

        scope.firstDate[index] = chartStartDate.format(scope.dateFormatMask);
        scope.endDate[index] = chartEndDate.format(scope.dateFormatMask);

      }

      function fetchAverage(averageRequestParams) {
        return $q.all([
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
              reportEndDate: utils.getDateStringForRequest(scope.dateRangeEnd),
            }, averageRequestParams)
          }),
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compareRange1.start),
              reportEndDate: utils.getDateStringForRequest(scope.compareRange1.end)
            }, averageRequestParams)
          }),
          requestManager.get(apiUrl + '/kpis/shoppersVsTravellers', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compareRange2.start),
              reportEndDate: utils.getDateStringForRequest(scope.compareRange2.end),
            }, averageRequestParams)
          })
        ]);
      }

      function transformAverageData(responses) {
        scope.averageReportData = responses[0].result;
        scope.averageCompareData = responses[1].result;
        scope.averageYearData = responses[2].result;
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

      function hasWidgetLegend(kpi) {
        var ret;
        if(kpi==='total_traffic') {
          ret = true;
        } else if(kpi==='gross_shopping_hours') {
          ret = true;
        } else if(kpi==='average_dwelltime') {
          ret = true;
        } else if(kpi==='average_draw_rate') {
          ret = true;
        } else if(kpi==='total_opportunity') {
          ret = true;
        } else {
          ret = false;
        }
        return ret;
      }

      function formatDate(dateString) {
        return moment(dateString).format(scope.dateFormatMask);
      }

      function compareRangeIsPriorPeriod(comparePeriodType) {
        if(comparePeriodType === 'prior_period') {
          return true;
        } else {
          return false;
        }
      }

      function compareRangeIsPriorYear(comparePeriodType) {
        if(comparePeriodType === 'prior_year') {
          return true;
        } else {
          return false;
        }
      }

      /**
      * Notifies the pdf controller when all widgets have rendered.
      * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
      */
      function loadForPdfComplete() {
        scope.loadRun = 0;
        scope.isLoading = true;
        scope.$watch('isLoading',
          function () {
            if (!scope.isLoading &&scope.loadRun < 1) {
              $rootScope.pdfExportsLoaded += 1;
              scope.loadRun += 1;
            }
          }
        );
      }

      scope.setGroupBy = function(groupBy) {
        scope.groupBy = groupBy;
        $rootScope.groupBy[scope.tabWidget] = groupBy;
      };

      scope.formatDate = formatDate;
    }
  };
}]);
