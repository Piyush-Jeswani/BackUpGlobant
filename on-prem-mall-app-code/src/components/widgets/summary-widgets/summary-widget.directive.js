'use strict';

//ToDo: Delete this - I don't think the widgets that consume it are actually used
angular.module('shopperTrak.widgets').directive('summaryWidget',
[
  'requestManager',
  '$q',
  '$filter',
  'apiUrl',
  'utils',
  'retailOrganizationSummaryData',
  'LocalizationService',
  '$translate',
function(
  requestManager,
  $q,
  $filter,
  apiUrl,
  utils,
  retailOrganizationSummaryData,
  LocalizationService,
  $translate
) {
  return {
    templateUrl: 'components/widgets/summary-widgets/summary-widget.partial.html',
    scope: {
      orgId:          '=orgId',
      siteId:         '=siteId',
      locationId:     '=locationId',
      zoneId:         '=zoneId',
      dateRangeStart: '=dateRangeStart',
      dateRangeEnd:   '=dateRangeEnd',
      compareRange1Start: '=compareRange1Start',
      compareRange1End: '=compareRange1End',
      compareRange2Start: '=compareRange2Start',
      compareRange2End: '=compareRange2End',
      currentOrganization: '=currentOrganization',
      currentUser: '=currentUser',
      firstDayOfWeekSetting: '=firstDayOfWeekSetting',
      calculateAverages: '=calculateAverages',
      separateAggregateCall: '=?separateAggregateCall',
      multiplier:       '=?multiplier',
      operatingHours:   '=operatingHours',
      widgetTitle:      '@widgetTitle',
      widgetIcon:       '@widgetIcon',
      apiEndpoint:      '@apiEndpoint',
      apiReturnKey:     '@apiReturnKey',
      kpiLabel:         '@kpiLabel',
      valueLabel:       '@valueLabel',
      returnDataPrecision:   '=?returnDataPrecision',
      displayUniqueReturning: '=displayUniqueReturning',
      onExportClick:    '&onExportClick',
      exportIsDisabled: '=?exportIsDisabled',
      hideExportIcon:   '=?hideExportIcon',
      widgetData:       '=widgetData',
      isLoading:        '=?isLoading',
      selectedTags:     '=selectedTags',
      kpi:              '@kpi',
      language:         '=language'
    },
    link: function(scope) {
      scope.requestFailed = false;
      scope.totalData = [];
      scope.uniqueData = [];
      scope.returnData = [];
      scope.calculateDelta = [];
      scope.deltaLabel = [];
      scope.deltaColoring = [];

      scope.hasData = hasData;
      scope.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      scope.compareRangeIsPriorYear = compareRangeIsPriorYear;

      loadTranslations();

      activate();

      scope.compare1Period = {
        start: scope.compareRange1Start,
        end: scope.compareRange1End,
      };

      scope.compare2Period = {
        start: scope.compareRange2Start,
        end: scope.compareRange2End,
      };

      getDateRanges();

      function activate() {

        if (!scope.returnDataPrecision) {
          scope.returnDataPrecision = 0;
        }

        if (!scope.numberFormatName) {
          scope.numberFormatName = getNumberFormat();
        }

        if (!angular.isDefined(scope.multiplier)) {
          scope.multiplier = 1;
        }

        if (!scope.selectedTags) {
          scope.selectedTags = [];
        }

        if (!angular.isDefined(scope.isLoading)) {
          scope.isLoading = true;
        }

        if(scope.calculateAverages === true) {
          scope.showAverages = true;
        } else {
          scope.showAverages = false;
        }

        scope.dateRangeSpansOverTwoCalendarWeeks = utils.dateRangeSpansOverTwoCalendarWeeks;
        scope.dateRangeSpansOverTwoCalendarMonths = utils.dateRangeSpansOverTwoCalendarMonths;

        /* If widgetData variable is defined, the data is coming from view's data service. If not,
         * the widget makes it's own data requests. In PDF export widget always makes own requests. */

        if( !angular.isDefined(scope.widgetData) ) {
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
            'utils',
            'selectedTags'
          ], updateWidget);
        } else {
          scope.$watchCollection('widgetData', function() {
            if(Object.keys(scope.widgetData).length > 0) {
              transformDataFromViewService(scope.widgetData);
            }
          });
        }

      }

      /* Make data requests and render widget. */

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
          groupBy: 'aggregate'
        };

        if (angular.isDefined(scope.zoneId)) {
          commonRequestParams.zoneId = scope.zoneId;
        }
        if (angular.isDefined(scope.siteId)) {
          commonRequestParams.siteId = scope.siteId;
        }
        if (angular.isDefined(scope.locationId) && scope.locationId !== undefined) {
          commonRequestParams.locationId = scope.locationId;
        }
        if(angular.isDefined(scope.operatingHours)) {
          commonRequestParams.operatingHours = scope.operatingHours;
        }

        commonRequestParams.hierarchyTagId = [];
        angular.forEach(scope.selectedTags, function(tagId) {
          commonRequestParams.hierarchyTagId.push(tagId);
        });

        return $q.all([
          requestManager.get(apiUrl + '/' + scope.apiEndpoint, {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.dateRangeStart),
              reportEndDate:   utils.getDateStringForRequest(scope.dateRangeEnd),
            }, commonRequestParams)
          }),
          requestManager.get(apiUrl + '/' + scope.apiEndpoint, {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compare1Period.start),
              reportEndDate:   utils.getDateStringForRequest(scope.compare1Period.end),
            }, commonRequestParams)
          }),
          requestManager.get(apiUrl + '/' + scope.apiEndpoint, {
            params: angular.extend({}, {
              reportStartDate: utils.getDateStringForRequest(scope.compare2Period.start),
              reportEndDate:   utils.getDateStringForRequest(scope.compare2Period.end),
            }, commonRequestParams)
          })
        ]);
      }

      function getDateRanges() {
        scope.firstDate = [];
        scope.endDate = [];
        scope.firstDate[0] = moment(scope.dateRangeStart).format('MM/DD/YY');
        scope.endDate[0] = moment(scope.dateRangeEnd).format('MM/DD/YY');
        scope.firstDate[1] = moment(scope.compareRange1Start).format('MM/DD/YY');
        scope.endDate[1] = moment(scope.compareRange1End).format('MM/DD/YY');
        scope.firstDate[2] = moment(scope.compareRange2Start).format('MM/DD/YY');
        scope.endDate[2] = moment(scope.compareRange2End).format('MM/DD/YY');
      }

      function getNumberFormat() {
        var currentUser = scope.currentUser;
        var currentOrganization = scope.currentOrganization;
        return LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
      }

      function transformData(responses) {
        var averageReportData = responses[0].result;
        var averageCompareData = responses[1].result;
        var averageYearData = responses[2].result;

        scope.averageReportData = averageReportData;
        scope.averageCompareData = averageCompareData;
        scope.averageYearData = averageYearData;

        scope.isLoading = false;

        if(scope.showAverages) {
          calculateAverageData('report',averageReportData);
          calculateAverageData('compare_period',averageCompareData);
          calculateAverageData('compare_year',averageYearData);
        } else {
          calculateTotalAggregate('report',averageReportData);
          calculateTotalAggregate('compare_period',averageCompareData);
          calculateTotalAggregate('compare_year',averageYearData);
        }
      }

      /* Transform data from the view's data service. */

      function transformDataFromViewService(data) {
        var dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(scope.dateRangeStart, scope.dateRangeEnd);
        var compare1RangeKey = retailOrganizationSummaryData.getDateRangeKey(scope.compareRange1Start, scope.compareRange1End);
        var compare2RangeKey = retailOrganizationSummaryData.getDateRangeKey(scope.compareRange2Start, scope.compareRange2End);

        var averageReportData = data[dateRangeKey].result;
        var averageCompareData = data[compare1RangeKey].result;
        var averageYearData = data[compare2RangeKey].result;

        if(averageReportData !== undefined || averageCompareData !== undefined || averageYearData !== undefined) {
          scope.averageReportData = averageReportData;
          scope.averageCompareData = averageCompareData;
          scope.averageYearData = averageYearData;

          if(scope.showAverages) {
            calculateAverageData('report',averageReportData);
            calculateAverageData('compare_period',averageCompareData);
            calculateAverageData('compare_year',averageYearData);
          } else {
            calculateTotalAggregate('report', averageReportData);
            calculateTotalAggregate('compare_period', averageCompareData);
            calculateTotalAggregate('compare_year', averageYearData);
          }
        }
      }

      function calculateAverageData(type,data) {
        var index, currentValue, compareValue;

        if(type==='report') {
          index = 0;
        } else if(type==='compare_period') {
          index = 1;
        } else if(type==='compare_year') {
          index = 2;
        } else {
          return;
        }

        if(data !== undefined  && data[0] !== undefined) {

          /* For average numbers, we cannot do calculations. In this case we expect
           * to get 1 data row containing average for the parameters used. */

          if(index > 0) {
              compareValue = data[0][scope.apiReturnKey] * scope.multiplier;
              currentValue = scope.totalData[0] * scope.multiplier;

              scope.totalData[index] = compareValue;
              scope.calculateDelta[index] = (100 - (currentValue / compareValue * 100 )) * -1;

              if(scope.calculateDelta[index] > 0) {
                scope.deltaLabel[index] = '+' + $filter('formatNumber')(scope.calculateDelta[index], 1, scope.numberFormatName) + '%';
                scope.deltaColoring[index] = 'positive';
              } else {
                scope.deltaLabel[index] = $filter('formatNumber')(scope.calculateDelta[index], 1, scope.numberFormatName) + '%';
                scope.deltaColoring[index] = 'negative';
              }
          } else {
            compareValue = data[0][scope.apiReturnKey] * scope.multiplier;
            scope.totalData[index] = compareValue;
          }
        }
      }

      function calculateTotalAggregate(type,data) {
        var index, currentValue;
        var uniqueValue = 0;
        var returnValue = 0;
        var compareValue = 0;

        if(type==='report') {
          index = 0;
        } else if(type==='compare_period') {
          index = 1;
        } else if(type==='compare_year') {
          index = 2;
        } else {
          return;
        }

        if(data !== undefined && data[0] !== undefined) {

          /* If response has more than one row, it means the response contains
           * data grouped by sites. In this scenario, we sum up the numbers. */

          if(data.length > 1) {
            _.each(data, function(item) {
              compareValue += item[scope.apiReturnKey] * scope.multiplier;
              if(scope.apiEndpoint==='kpis/traffic') {
                uniqueValue += item.unique_traffic * scope.multiplier;
                returnValue += item.return_traffic * scope.multiplier;
              }
            });
          } else {
            compareValue = data[0][scope.apiReturnKey] * scope.multiplier;
            if(scope.apiEndpoint==='kpis/traffic') {
              uniqueValue = data[0].unique_traffic;
              returnValue = data[0].return_traffic;
            }
          }

          scope.totalData[index] = compareValue;
          if(scope.apiEndpoint==='kpis/traffic') {
            scope.uniqueData[index] = uniqueValue;
            scope.returnData[index] = returnValue;
          }
        } else {
          scope.totalData = [];
          scope.uniqueData = [];
          scope.returnData = [];
        }

        if(index > 0) {
          if(data !== undefined && data[0] !== undefined) {
            compareValue = 0;
            if(data.length > 1) {
              _.each(data, function(item) {
                compareValue += item[scope.apiReturnKey] * scope.multiplier;
                if(scope.apiEndpoint==='kpis/traffic') {
                  uniqueValue += item.unique_traffic * scope.multiplier;
                  returnValue += item.return_traffic * scope.multiplier;
                }
              });
            } else {
              compareValue = data[0][scope.apiReturnKey] * scope.multiplier;
              if(scope.apiEndpoint==='kpis/traffic') {
                uniqueValue = data[0].unique_traffic;
                returnValue = data[0].return_traffic;
              }
            }

            currentValue = scope.totalData[0];

            scope.calculateDelta[index] =  ((compareValue - currentValue) / currentValue) * 100 * -1;

            if(scope.calculateDelta[index] > 0) {
              scope.deltaLabel[index] = '+' + $filter('formatNumber')(scope.calculateDelta[index], 1, scope.numberFormatName)  + '%';
              scope.deltaColoring[index] = 'positive';
            } else {
              scope.deltaLabel[index] = $filter('formatNumber')(scope.calculateDelta[index], 1, scope.numberFormatName)  + '%';
              scope.deltaColoring[index] = 'negative';
            }
          }
        }

      }

      function hasData(index) {
        if(scope.totalData[index] !== undefined) {
          return true;
        } else {
          return false;
        }
      }

      function compareRangeIsPriorPeriod(comparePeriod) {
        if(scope.dateRangeStart !== undefined && scope.dateRangeEnd !== undefined && comparePeriod !== undefined) {
          var range = {
            start: scope.dateRangeStart,
            end: scope.dateRangeEnd
          };

          if(utils.dateRangeIsPriorPeriod(range, comparePeriod)) {
            return true;
          } else {
            return false;
          }
        }
      }

      function compareRangeIsPriorYear(comparePeriod) {
        if(scope.dateRangeStart !== undefined && scope.dateRangeEnd !== undefined && comparePeriod !== undefined) {
          var range = {
            start: scope.dateRangeStart,
            end: scope.dateRangeEnd
          };

          if(utils.dateRangeIsPriorYear(range, comparePeriod, scope.firstDayOfWeekSetting)) {
            return true;
          } else {
            return false;
          }
        }
      }

      function loadTranslations() {
        $translate.use(scope.language);
        $translate('kpis.totalLabel.'+scope.kpi).then(function (title) {
          scope.kpiTitle = title;
        });
        $translate('kpis.kpiTitle.'+scope.kpi).then(function (title) {
          scope.widgetTitle = title;
        });
      }

    }
  };
}]);
