'use strict';

angular.module('shopperTrak.widgets')
  .directive('visitingFrequencyDetailWidget', visitingFrequencyDetailWidget);

visitingFrequencyDetailWidget.$inject = ['requestManager',
  '$q',
  '$filter',
  '$rootScope',
  'apiUrl',
  'utils',
  '$translate',
  'LocalizationService',
  'dateRangeService',
  'ObjectUtils'
]

function visitingFrequencyDetailWidget(
  requestManager,
  $q,
  $filter,
  $rootScope,
  apiUrl,
  utils,
  $translate,
  LocalizationService,
  dateRangeService,
  ObjectUtils
) {
  return {
    templateUrl: 'components/widgets/visiting-frequency-detail-widget/visiting-frequency-detail-widget.partial.html',
    scope: {
      orgId: '=',
      siteId: '=',
      locationId: '=',
      zoneId: '=',
      dateRangeStart: '=',
      dateRangeEnd: '=',
      compareRange1Start: '=',
      compareRange1End: '=',
      compareRange2Start: '=',
      compareRange2End: '=',
      currentUser: '=',
      currentOrganization: '=',
      dateFormatMask: '=',
      firstDayOfWeekSetting: '=',
      onExportClick: '&',
      exportIsDisabled: '=?',
      widgetTitle: '@',
      widgetIcon: '@',
      hideExportIcon: '=?',
      language: '=',
      groupBy: '=?',
      isLoading: '=?',
      setSelectedWidget: '&'
    },
    link: function (scope) {
      var currentUser = scope.currentUser;
      var currentOrganization = scope.currentOrganization;
      var chartDataRequestCanceler = $q.defer();

      scope.dateRangeSpansOverTwoCalendarWeeks = utils.dateRangeSpansOverTwoCalendarWeeks;
      scope.dateRangeSpansOverTwoCalendarMonths = utils.dateRangeSpansOverTwoCalendarMonths;

      scope.isLoading = true;
      scope.requestFailed = false;
      scope.calculateDelta = [];
      scope.deltaLabel = [];
      scope.deltaColoring = [];
      scope.isPdf = $rootScope.pdf;

      scope.hasWidgetLegend = hasWidgetLegend;
      scope.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      scope.compareRangeIsPriorYear = compareRangeIsPriorYear;
      scope.numberFormatName = LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);

      if ($rootScope.pdf) loadForPdfComplete();

      scope.chartOptions = {
        donut: true,
        labelOffset: 35,
        labelDirection: 'explode',
        chartPadding: 20,
        donutWidth: 50
      };
      scope.chartData = {};
      scope.chartLegend = [];

      scope.compare1Period = {
        start: scope.compareRange1Start,
        end: scope.compareRange1End
      };

      scope.compare2Period = {
        start: scope.compareRange2Start,
        end: scope.compareRange2End
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
          .then(function () {
            scope.isLoading = false;
            scope.requestFailed = false;
          })
          .catch(function () {
            scope.isLoading = false;
            scope.requestFailed = true;
          });
      }

      function fetchData() {
        fetchChartData();
        var commonRequestParams = {
          orgId: scope.orgId,
          groupBy: scope.groupBy,
          type: 'ave'
        };

        if (angular.isDefined(scope.siteId)) {
          commonRequestParams.siteId = scope.siteId;
        }
        if (angular.isDefined(scope.locationId)) {
          commonRequestParams.locationId = scope.locationId;
        }

        return $q.all([
          requestManager.get(apiUrl + '/kpis/loyalty', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
              reportEndDate: utils.getDateStringForRequest(scope.dateRangeEnd),
              compareStartDate: utils.getDateStringForRequest(scope.compareRange1Start),
              compareEndDate: utils.getDateStringForRequest(scope.compareRange1End),
            }, commonRequestParams)
          }),
          requestManager.get(apiUrl + '/kpis/loyalty', {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compareRange2Start),
              reportEndDate: utils.getDateStringForRequest(scope.compareRange2End),
              compareStartDate: utils.getDateStringForRequest(scope.compareRange2Start),
              compareEndDate: utils.getDateStringForRequest(scope.compareRange2End)
            }, commonRequestParams)
          })
        ]);
      }

      function fetchChartData() {
        chartDataRequestCanceler.resolve();
        chartDataRequestCanceler = $q.defer();

        scope.isLoadingChartData = true;
        scope.chartDataRequestFailed = false;

        var chartDataRequestParams = {
          orgId: scope.orgId,
          siteId: scope.siteId,
          type: 'dstr',
          reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
          reportEndDate: utils.getDateStringForRequest(scope.dateRangeEnd),
          compareStartDate: utils.getDateStringForRequest(scope.compareRange1Start),
          compareEndDate: utils.getDateStringForRequest(scope.compareRange1End)
        };

        if (scope.locationId) {
          chartDataRequestParams.locationId = scope.locationId;
        }

        requestManager.get(apiUrl + '/kpis/loyalty', {
          params: chartDataRequestParams,
          timeout: chartDataRequestCanceler.promise
        }).then(function (response) {
          var chartData = {
            series: [],
            labels: []
          };
          var chartLegend = [];
          // checking for loyalty distribution to avoid errors 
          if (!ObjectUtils.isNullOrUndefined(response.result[0]) && !ObjectUtils.isNullOrUndefined(response.result[0].loyalty[0]) &&
            !ObjectUtils.isNullOrUndefined(response.result[0].loyalty[0].loyaltyDstr)) {
            for (var i = 0; i < response.result[0].loyalty[0].loyaltyDstr.length; i++) {
              var distribution = response.result[0].loyalty[0].loyaltyDstr[i];
              var interval = response.result[0].loyalty[0].loyaltyInterval[i];
              var labelValue = Math.round(distribution * 10000) / 100;

              chartData.series.push(distribution);
              chartData.labels.push(formatNumber(labelValue, 2) + '%');
              chartLegend.push(stringifyVisitingFrequencyInterval(interval[0], interval[1]));
            }
          }
          

          scope.chartData = chartData;
          scope.chartLegend = chartLegend;
          scope.isLoadingChartData = false;
          scope.isLoading = false;

          if (scope.chartData.series.length === 0) {
            scope.noData = true;
            console.warn('No data returned from /kpis/loyalty');
            console.warn(response.result[0])
          } else {
            scope.noData = false;
          }

        }, function () {
          scope.chartDataRequestFailed = true;
          scope.isLoadingChartData = false;
          scope.isLoading = false;
        });
      }

      function transformData(responses) {
        var reportData = responses[0].result;
        var yearCompareData = responses[1].result;

        var tooltipData = [];

        var chartData = {
          series: [[], [], []],
          labels: []
        };

        if (reportData.length === 0) {
          scope.chartData = chartData;
          scope.tooltipData = tooltipData;
          return;
        }

        scope.tooltipData = [];
        scope.totalData = [];

        // Reportdata contains also comparison period data
        transformPeriodData('report', reportData);
        transformPeriodData('compare_year', yearCompareData);
      }

      function transformPeriodData(type, data) {
        var i;
        var entry;

        if (data.length === 0) {
          return;
        }

        for (i = 0; i < data.length; i++) {
          entry = data[i];

          if (type === 'report') {
            scope.totalData[0] = entry.loyalty[0];
            scope.totalData[1] = entry.loyalty[1];
            calculateDelta(1, scope.totalData[0], scope.totalData[1]);
          } else if (type === 'compare_year') {
            scope.totalData[2] = entry.loyalty[0];
            calculateDelta(2, scope.totalData[0], scope.totalData[2]);
          } else {
            return;
          }

        }

      }

      function calculateDelta(index, report, compare) {
        scope.calculateDelta[index] = (100 - (report.loyaltyAve / compare.loyaltyAve * 100)) * -1;
        if (scope.calculateDelta[index] < 0) {
          scope.deltaLabel[index] = formatNumber(scope.calculateDelta[index], 1) + '%';
          scope.deltaColoring[index] = 'negative';
        } else {
          scope.deltaLabel[index] = '+' + formatNumber(scope.calculateDelta[index], 1) + '%';
          scope.deltaColoring[index] = 'positive';
        }
      }

      function hasWidgetLegend(kpi) {
        var ret;
        if (kpi === 'total_traffic') {
          ret = true;
        } else if (kpi === 'gross_shopping_hours') {
          ret = true;
        } else if (kpi === 'average_dwelltime') {
          ret = true;
        } else if (kpi === 'average_draw_rate') {
          ret = true;
        } else if (kpi === 'total_opportunity') {
          ret = true;
        } else {
          ret = false;
        }
        return ret;
      }

      function formatNumber(value, precision) {
        return $filter('formatNumber')(value, precision, scope.numberFormatName);
      }

      function formatDate(dateString) {
        return moment(dateString).format(scope.dateFormatMask);
      }

      // Right endpoint value -1 means infinity
      function stringifyVisitingFrequencyInterval(leftEndpoint, rightEndpoint) {

        if (leftEndpoint === 1 && rightEndpoint === 1) {
          return 'visitingFrequencyDetailWidget.ONEVISIT';
        } else if (rightEndpoint === -1) {
          return leftEndpoint + ' ' + $filter('translate')('visitingFrequencyDetailWidget.ORMOREVISITS');
        } else if (leftEndpoint === rightEndpoint) {
          return leftEndpoint + ' ' + $filter('translate')('visitingFrequencyDetailWidget.VISITS');
        } else {
          return leftEndpoint + ' ' + $filter('translate')('visitingFrequencyDetailWidget.TO') + ' ' + rightEndpoint + ' ' + $filter('translate')('visitingFrequencyDetailWidget.VISITS');
        }
      }

      /**
       * The function below will work out if the comparePeriod represents 
       * prior period or not based on the current date range setting on the page.
       * 
       * @param {comparePeriod} argument passed in is the comparePeriod being assessed to be 
       * PriorPeriod or not.
       */
      function compareRangeIsPriorPeriod(comparePeriod) {
        if (scope.dateRangeStart !== undefined && scope.dateRangeEnd !== undefined) {
          var range = {
            start: scope.dateRangeStart,
            end: scope.dateRangeEnd
          };

          // Using the date Range service, get the compare1Range.
          var compare1Range = dateRangeService.getCustomPeriod(range, currentUser, currentOrganization, undefined, 'compare1Range', 'prior_period', false);

          // Used for comparisons only. Not actually displayed anywhere   
          var formatString = 'DD-MM-YYYY';

          return comparePeriod.start.format(formatString) === compare1Range.start.format(formatString) &&
            comparePeriod.end.format(formatString) === compare1Range.end.format(formatString)
        }
      }

      /**
       * The function below will work out if the comparePeriod represents 
       * prior year or not based on the current date range setting on the page.
       * 
       * @param {comparePeriod} argument passed in is the comparePeriod being assessed to be 
       * PriorYear or not.
       */
      function compareRangeIsPriorYear(comparePeriod) {
        if (scope.dateRangeStart !== undefined && scope.dateRangeEnd !== undefined) {
          var range = {
            start: scope.dateRangeStart,
            end: scope.dateRangeEnd
          };

          // Using the date Range service, get the compare2Range.
          var compare2Range = dateRangeService.getCustomPeriod(range, currentUser, currentOrganization, undefined, 'compare2Range', 'prior_year', undefined);

          // Used for comparisons only. Not actually displayed anywhere
          var formatString = 'DD-MM-YYYY';

          return (comparePeriod.start.format(formatString) === compare2Range.start.format(formatString) &&
            comparePeriod.end.format(formatString) === compare2Range.end.format(formatString))
        }
      }

      scope.setGroupBy = function (groupBy) {
        scope.groupBy = groupBy;
      };

      /**
      * Notifies the pdf controller when all widgets have rendered.
      * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
      */
      function loadForPdfComplete() {
        scope.loadRun = 0;
        scope.isLoading = true;
        scope.$watch('isLoading',
          function () {
            if (!scope.isLoading && scope.loadRun < 1) {
              $rootScope.pdfExportsLoaded += 1;
              scope.loadRun += 1;
            }
          }
        );
      }

      scope.formatDate = formatDate;
      scope.formatNumber = formatNumber;
    }
  };
};
