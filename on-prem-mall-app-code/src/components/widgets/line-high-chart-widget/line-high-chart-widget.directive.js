(() => {
  angular
    .module('shopperTrak.widgets')
    .directive('lineHighChartWidget', lineHighChartWidget);

  function lineHighChartWidget () {
    return {
      templateUrl: 'components/widgets/line-high-chart-widget/line-high-chart-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationId: '=',
        zoneId: '=',
        entranceId: '=',
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
        //required for weather
        currentSite: '=?',
        // API/data settings
        operatingHours: '=',
        firstDayOfWeekSetting: '=',
        getUniqueReturning: '=',
        summaryAverages: '=',
        apiEndpoint: '@',
        apiReturnKey: '@',
        separateSummaryRequests: '=?',
        multiplier: '=?',
        groupBy: '=?',
        // Widget output settings
        widgetIcon: '@',
        kpi: '=?',
        kpiLabel: '@',
        valueLabel: '@',
        onExportClick: '&',
        dateFormatMask: '=',
        returnDataPrecision: '=?',
        hideExportIcon: '=?',
        exportIsDisabled: '=?',
        language: '=',
        exporting: '=?',
        showMetrics: '=?',
        currencySymbol: '=?', // used only by the PDF exports
        salesCategories: '=?',
        updateSelectedSalesCategories: '=?',
        isLoading: '=?',
        setSelectedWidget: '&',
        selectedOption: '=?',
        onSelectOption: '&',
        showWeatherMetrics: '=?',
        selectedWeatherMetrics: '=?',
        updateSelectedWeatherMetrics: '=?',
        chartType: '=?',
        isHourly: '=?',
        businessDayStartHour: '=?',
        showTable: '=?',
        showTableToggleButton: '=?',
        sortInfo: '=?',
        currentSortDirection: '=?',
        showSalesCategoriesSelector: '<',
        orgMetrics: '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: lineHighChartWidgetController,
      controllerAs: 'lineHighChartWidget',
      bindToController: true
    };
  }


  lineHighChartWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    'requestManager',
    '$q',
    '$filter',
    '$state',
    '$translate',
    'LocalizationService',
    'SubscriptionsService',
    'SiteResource',
    'apiUrl',
    'utils',
    'NumberUtils',
    'metricConstants',
    'comparisonsHelper',
    'ObjectUtils',
    'googleAnalytics',
    'getDefaultComparisonDateRangeParams',
    'currencyService'
  ];

  function lineHighChartWidgetController (
    $scope,
    $rootScope,
    $timeout,
    requestManager,
    $q,
    $filter,
    $state,
    $translate,
    LocalizationService,
    SubscriptionsService,
    SiteResource,
    apiUrl,
    utils,
    NumberUtils,
    metricConstants,
    comparisonsHelper,
    ObjectUtils,
    googleAnalytics,
    getDefaultComparisonDateRangeParams,
    currencyService) {

    const lineHighChartWidget = this;
    let periodLabelsRepresentSingleDay;
    let localMetricConstants;
    let updatedSelectedWeatherMetrics = [];

    // Current, Prior, Previous
    const dateLabels = [[], [], []];
    const debouncePeriod = 200;

    // Let's smooth out those bumpy signals...
    const updateWidgetDebounced = _.debounce(() => {
      updateWidget();
    }, debouncePeriod);

    activate();

    function setWatches () {
      lineHighChartWidget.orgChange = $scope.$watchGroup([
        'lineHighChartWidget.orgId',
        'lineHighChartWidget.siteId',
        'lineHighChartWidget.zoneId',
      ], updateWithOptions);

      lineHighChartWidget.groupChange = $scope.$watchGroup([
        'lineHighChartWidget.locationId',
        'lineHighChartWidget.dateRangeStart',
        'lineHighChartWidget.dateRangeEnd',
        'lineHighChartWidget.groupBy',
        'lineHighChartWidget.salesCategories',
        'lineHighChartWidget.selectedWeatherMetrics',
        'lineHighChartWidget.chartType'
      ], updateWidgetDebounced);

      lineHighChartWidget.requestQueueChange = $scope.$watchCollection('lineHighChartWidget.requestQueue', loadDetails);

      lineHighChartWidget.prefixSymbolChange = $scope.$watch(
        'lineHighChartWidget.selectedOption.metric.prefixSymbol', (
          newValue,
          oldValue
        ) => {
        if (newValue === oldValue) {
          return;
        }

        try {
          setDataPrefix(lineHighChartWidget.selectedOption.metric.isCurrency);
        } catch (error)  {
          console.error(error);
          lineHighChartWidget.dataPrefix = '';
        }

      });

      $scope.$on('$destroy', () => {
        cancelAllOutstandingRequests();
        if (typeof lineHighChartWidget.requestQueueChange === 'function') {
          lineHighChartWidget.requestQueueChange();
        }

        if (typeof lineHighChartWidget.groupChange === 'function') {
          lineHighChartWidget.groupChange();
        }

        if (typeof lineHighChartWidget.orgChange === 'function') {
          lineHighChartWidget.orgChange();
        }

        if (typeof lineHighChartWidget.prefixSymbolChange === 'function') {
          lineHighChartWidget.prefixSymbolChange();
        }
      });
    }

  /**
   * sets the global data prefix to the current currency symbol, if the passed in format is a currency
   * Resets the dataPrefix to an empty string if it is not a currency symbol
   *
   * @param {boolean} isCurrency - boolean to indicate if the current metric is a currency or not
   */
    function setDataPrefix (isCurrency) {
      if (isCurrency) {
        if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.currencySymbol)) {
          lineHighChartWidget.dataPrefix = lineHighChartWidget.currencySymbol;
          return;
        }
      }

      lineHighChartWidget.dataPrefix = '';
    }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations 
   */
    function setMetricsConstants () {
      localMetricConstants = angular.copy(metricConstants);

      if (!_.isUndefined(lineHighChartWidget.orgMetrics)) {
        localMetricConstants.metrics = lineHighChartWidget.orgMetrics;
      }
    }

    function activate () {
      setMetricsConstants();
      lineHighChartWidget.isPdf = $rootScope.pdf;
      lineHighChartWidget.coloring = 'positive';
      lineHighChartWidget.isLoading = true;
      lineHighChartWidget.requestFailed = false;
      lineHighChartWidget.requestsLoading = 0;
      lineHighChartWidget.numberFormatName = LocalizationService.getCurrentNumberFormatName(lineHighChartWidget.currentUser, lineHighChartWidget.currentOrganization);
      lineHighChartWidget.trueVal = true;
      lineHighChartWidget.selectedDate = null;
      lineHighChartWidget.toggleTableVisibility = toggleTableVisibility;
      lineHighChartWidget.chartType = lineHighChartWidget.chartType || 'line';
      lineHighChartWidget.sortTable = sortTable;
      lineHighChartWidget.currentSort = 'hourSort';
      lineHighChartWidget.isShoppersVSOthers = isShoppersVSOthers;

      if (_.isUndefined(lineHighChartWidget.currentSortDirection)) {
        lineHighChartWidget.currentSortDirection = 'asc';
      }

      if (lineHighChartWidget.isHourly && angular.isUndefined(lineHighChartWidget.showTable)) {
        lineHighChartWidget.showTable = {
          selection: true
        };
      }

      /* Tooltip requests are fired when hovering. This can generate a lot of concurrent requests.
        This is the maximum number of concurrent request. Note! 1 request here means 3 requests,
        for each date period.
      */
      lineHighChartWidget.maxConcurrentTooltips = 2;

      lineHighChartWidget.loadTooltipData = loadTooltipData;
      lineHighChartWidget.loadWidgetDefaults = loadWidgetDefaults;
      lineHighChartWidget.getCommonRequestParams = getCommonRequestParams;
      lineHighChartWidget.formatDate = formatDate;
      lineHighChartWidget.setGroupBy = setGroupBy;
      lineHighChartWidget.hasData = hasData;
      lineHighChartWidget.setLegendLabel = setLegendLabel;
      lineHighChartWidget.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      lineHighChartWidget.compareRangeIsPriorYear = compareRangeIsPriorYear;
      lineHighChartWidget.calculateDelta = calculateDelta;

      lineHighChartWidget.isDailyBreakdown = moment(lineHighChartWidget.compareRange1Start).format('YYYY-MM-DD') === moment(lineHighChartWidget.compareRange1End).format('YYYY-MM-DD')
                                                && !lineHighChartWidget.isHourly;

      if (!$rootScope.pdf) {
        lineHighChartWidget.tabWidget = getGroupKey();
      }

      initGroupBy();

      lineHighChartWidget.dateRanges = [];
      lineHighChartWidget.requestQueue = [];

      lineHighChartWidget.isCaching = true;

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.valueLabel)) {
        lineHighChartWidget.valueLabel = '';
      }

      if (lineHighChartWidget.isPdf || $rootScope.customDashboards) {
        setOptionsForPdf();
        setDataFormats();
      }

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentSite) &&
        !ObjectUtils.isNullOrUndefined(lineHighChartWidget.siteId)) {
        setCurrentSite();
        return;
      }

      lineHighChartWidget.weatherEnabled = hasUserEnabledWeather();

      init();
    }

    function initGroupBy () {
      if (ObjectUtils.isNullOrUndefined($rootScope.groupBy)) {
        $rootScope.groupBy = {};
        if (!ObjectUtils.isNullOrUndefinedOrBlank(lineHighChartWidget.groupBy) ) {
          setRootScopeGroupBy(lineHighChartWidget.groupBy);
        }
        return;
      }

      if (ObjectUtils.isNullOrUndefinedOrBlank(lineHighChartWidget.groupBy) ) {
        lineHighChartWidget.groupBy = getRootScopeGroupBy();
      }

      if (lineHighChartWidget.isHourly) {
        lineHighChartWidget.groupBy = 'hour';
      }
    }

    function init () {
      lineHighChartWidget.setOption = setOption;

      loadTranslations();

      loadWidgetDefaults();

      if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.showMetrics)) {
        setOptions();
      }

      setCurrencySymbol()
        .then(setDataFormats)
        .catch(setDataFormats);

      setWeatherMetrics();

      setWeatherSplitOption();

      $timeout(() => {
        // Set the watches last.
        // This prevents a double render for the first load
        setWatches();
      });
    }

    function hasUserEnabledWeather () {

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentUser)) {
        return false;
      }

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentUser.preferences)) {
        return false;
      }

      if (!lineHighChartWidget.showWeatherMetrics) {
        return false;
      }

      return lineHighChartWidget.currentUser.preferences.weather_reporting === true;
    }

    function setWeatherSplitOption () {
      const oneMonth = 1;
      if (!lineHighChartWidget.showWeatherMetrics) {
        return;
      }
      const start = moment(lineHighChartWidget.dateRangeStart);
      const end = moment(lineHighChartWidget.dateRangeEnd);
      lineHighChartWidget.splitWeatherRequests = moment.duration(end.diff(start)).asMonths() > oneMonth;
    }

    function setCurrentSite () {
      const currentSite = SiteResource.get({
        orgId: lineHighChartWidget.orgId,
        siteId: lineHighChartWidget.siteId
      }).$promise;

      currentSite.then((result) => {
        lineHighChartWidget.currentSite = result;
        init();
      });
    }

    function setOption (option) {
      if (lineHighChartWidget.selectedOption.name === option.name) {
        return;
      }

      lineHighChartWidget.isLoading = true;

      lineHighChartWidget.selectedOption = option;

      lineHighChartWidget.kpi = lineHighChartWidget.selectedOption.name;

      lineHighChartWidget.apiReturnKey = lineHighChartWidget.selectedOption.propertyName;

      if (!_.contains(lineHighChartWidget.selectedOption.metric.requiredSubscriptions, 'sales')) {
        delete lineHighChartWidget.salesCategories;
        lineHighChartWidget.showSalesCategoriesSelector = false;
      } else {
        lineHighChartWidget.showSalesCategoriesSelector = true;
      }

      setRootScopeGroupBy(lineHighChartWidget.groupBy);

      setDataFormats();

      lineHighChartWidget.onSelectOption({option});

      updateWidgetDebounced();
    }

    function updateMetricUnits (displayInfo) {
      _.each(displayInfo, (metric) => {
        if (metric.unitName === 'temperature' && _.has(lineHighChartWidget.currentUser.localization, 'temperature_format')) {

          const weatherSuffixesToTranslate = ['common.SHOWWEATHERTEMPCENTSUFFIX', 'common.SHOWWEATHERTEMPFAHRSUFFIX'];

          $translate(weatherSuffixesToTranslate).then((translations) => {

            if (lineHighChartWidget.currentUser.localization.temperature_format === 'C') {
              metric.suffixSymbol = `\u00B0${translations['common.SHOWWEATHERTEMPCENTSUFFIX']}`;
              metric.unit = 'c';
            } else if (lineHighChartWidget.currentUser.localization.temperature_format === 'F') {
              metric.suffixSymbol = `\u00B0${translations['common.SHOWWEATHERTEMPFAHRSUFFIX']}`;
              metric.unit = 'f';
            }
          });
        } else if (metric.unitName === 'weatherSpeed' && _.has(lineHighChartWidget.currentUser.localization, 'velocity_format')) {

          const suffixesToTranslate = ['common.SHOWWEATHERWINDKILOSUFFIX', 'common.SHOWWEATHERWINDMILESUFFIX'];

          $translate(suffixesToTranslate).then((translations) => {
            if (lineHighChartWidget.currentUser.localization.velocity_format === 'KPH') {
              metric.suffixSymbol = translations['common.SHOWWEATHERWINDKILOSUFFIX'];
              metric.unit = 'kmph';
            } else if (lineHighChartWidget.currentUser.localization.velocity_format === 'MPH') {
              metric.suffixSymbol = translations['common.SHOWWEATHERWINDMILESUFFIX'];
              metric.unit = 'mph';
            }
          });
        }
      });
      return displayInfo;
    }

    function setWeatherMetrics () {
      if (!lineHighChartWidget.showWeatherMetrics || lineHighChartWidget.isHourly || lineHighChartWidget.groupBy === 'hour') {
        return;
      }

      lineHighChartWidget.weatherMetricsDisplayInfo = updateMetricUnits(angular.copy(localMetricConstants.weatherMetrics));

      if ($rootScope.pdf) {
        if (lineHighChartWidget.selectedWeatherMetrics) {
          const selectedMetrics = [];
          _.each(lineHighChartWidget.selectedWeatherMetrics, (item) => {
            const detailMetric = _.where(lineHighChartWidget.weatherMetricsDisplayInfo, item);
            selectedMetrics.push(detailMetric[0]);
          });
          lineHighChartWidget.selectedWeatherMetrics = selectedMetrics;
        }
        return;
      }

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedWeatherMetrics)) {
        lineHighChartWidget.selectedWeatherMetrics = [];
        lineHighChartWidget.selectedWeatherMetrics.push(lineHighChartWidget.weatherMetricsDisplayInfo[0]);
      }

      lineHighChartWidget.minWeatherMetricsLength = 0;
      lineHighChartWidget.maxWeatherMetricsLength = 3;
    }

    function setDataFormats () {
      const formatting = getMetricsFormatting(lineHighChartWidget.kpi);
        if (!ObjectUtils.isNullOrUndefined(formatting)) {
        lineHighChartWidget.dataPrecision = formatting.precision;
        lineHighChartWidget.dataPrefix = formatting.prefixSymbol;
        lineHighChartWidget.dataSuffix = formatting.suffixSymbol;

        setDataPrefix(formatting.isCurrency);

        if ( ObjectUtils.isNullOrUndefined(formatting.multiplier) && ObjectUtils.isNullOrUndefined(lineHighChartWidget.defaultMultiplier) ) {
          //set default to 1
          lineHighChartWidget.defaultMultiplier = 1;
        }

        if (!ObjectUtils.isNullOrUndefined(formatting.multiplier)) {
           lineHighChartWidget.multiplier = formatting.multiplier;
        } else {
          lineHighChartWidget.multiplier = lineHighChartWidget.defaultMultiplier;
        }
      } else {
        lineHighChartWidget.dataPrecision = lineHighChartWidget.returnDataPrecision;
        lineHighChartWidget.dataPrefix = '';
        lineHighChartWidget.dataSuffix = '';
      }
    }

    function loadWidgetDefaults () {
      if (typeof lineHighChartWidget.groupBy !== 'string' ||
        ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.groupBy) &&
        !$rootScope.pdf && !$rootScope.customDashboards) {
        lineHighChartWidget.groupBy = 'day';
        if (!ObjectUtils.isNullOrUndefinedOrEmpty($state.current.views)) {
          setRootScopeGroupBy('day');
        }
      }

      if ( ObjectUtils.isNullOrUndefined(lineHighChartWidget.returnDataPrecision) ) {
        lineHighChartWidget.returnDataPrecision = 0;
      }

      if ( ObjectUtils.isNullOrUndefined(lineHighChartWidget.multiplier) ) {
        lineHighChartWidget.defaultMultiplier = lineHighChartWidget.multiplier = 1;
      }

      lineHighChartWidget.compare1Period = {
        start: lineHighChartWidget.compareRange1Start,
        end: lineHighChartWidget.compareRange1End
      };

      lineHighChartWidget.compare2Period = {
        start: lineHighChartWidget.compareRange2Start,
        end: lineHighChartWidget.compareRange2End
      };
    }

    function getMetricsFormatting (value) {
      const metric = _.find(localMetricConstants.metrics, (_metric) => _metric.value === value);

      if (!ObjectUtils.isNullOrUndefined(metric)) {
        const formatting = {
          precision: metric.precision,
          prefixSymbol: metric.prefixSymbol,
          suffixSymbol: metric.suffixSymbol,
          isCurrency: metric.isCurrency
        };

        if (!ObjectUtils.isNullOrUndefined(metric.multiplier)) {
          formatting.multiplier = metric.multiplier;
        }

        return formatting;
      }

      return;
    }

    function cancelAllOutstandingRequests () {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.outStandingRequests)) {
        const requests = angular.copy(lineHighChartWidget.outStandingRequests);
        requestManager.cancelRequests(requests, 'line highchart user cancelling');
        lineHighChartWidget.outstandingRequests = _.without(lineHighChartWidget.outstandingRequests, requests);
      }
    }

    /** Updates the widget. Should be called after a load, and should not be called directly.
     *  Instead, please call the debounced version of this function (updateWidgetDebounced)
     *
     **/
    function updateWidget () {
      setDateRangeIndicators();
      lineHighChartWidget.isLoading = true;
      lineHighChartWidget.dataReady = false;
      lineHighChartWidget.requestFailed = false;
      lineHighChartWidget.isChartLoading = true;
      lineHighChartWidget.chartRequestFailed = false;
      lineHighChartWidget.noData = null;
      if (typeof lineHighChartWidget.updateSelectedWeatherMetrics === 'function') {
        lineHighChartWidget.updateSelectedWeatherMetrics(lineHighChartWidget.selectedWeatherMetrics);
      }

      if (typeof lineHighChartWidget.updateSelectedSalesCategories === 'function') {
        lineHighChartWidget.updateSelectedSalesCategories(lineHighChartWidget.salesCategories);
      }

      lineHighChartWidget.chartData = {
        labels: [],
        series: [[], [], []]
      };

      lineHighChartWidget.summaryData = [null, null, null];
      lineHighChartWidget.delta = [{}, {}, {}];
      lineHighChartWidget.returnData = [];
      lineHighChartWidget.uniqueData = [];
      lineHighChartWidget.totalData = [];
      lineHighChartWidget.separateSummaryRequests = true;

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.apiEndpoint)) {
        lineHighChartWidget.isLoading = false;
        lineHighChartWidget.requestFailed = true;
        return true;
      }

      lineHighChartWidget.tooltipData = [];

      fetchChartData()
        .then(transformChartData)
        .catch((err) => {
          console.error(err);
          if (err !== 'line highchart user cancelling') {
            lineHighChartWidget.isChartLoading = false;
            lineHighChartWidget.chartRequestFailed = true;
            lineHighChartWidget.isLoading = false;
            lineHighChartWidget.requestFailed = true;
          }
        });
    }

    /** Sets boolean values indicating if the current date range:
     *  1. Spans over two calendar weeks
     *  2. Spans over two calendar months
     *  This function is called during the update cycle.
     *
     **/
    function setDateRangeIndicators () {
      lineHighChartWidget.dateRangeSpansOverTwoCalendarWeeks = utils.dateRangeSpansOverTwoCalendarWeeks(lineHighChartWidget.dateRangeStart, lineHighChartWidget.dateRangeEnd);
      lineHighChartWidget.dateRangeSpansOverTwoCalendarMonths = utils.dateRangeSpansOverTwoCalendarMonths(lineHighChartWidget.dateRangeStart, lineHighChartWidget.dateRangeEnd);
    }

    function updateWithOptions () {
      cancelAllOutstandingRequests();
      if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.showMetrics)) {
        setOptions();
        return;
      }

      updateWidgetDebounced();
    }

    function setDefaultOption () {
      switch (lineHighChartWidget.kpi) {
        case 'sales':
          lineHighChartWidget.options = [getSalesOption()];
          break;
        case 'conversion':
          lineHighChartWidget.options = [getConversionOption()];
          break;
        case 'ats':
          lineHighChartWidget.options = [getAtsOption()];
          break;
        case 'star':
          lineHighChartWidget.options = [getStarOption()];
          break;
        case 'upt':
          lineHighChartWidget.options = [getUptOption()];
          break;
        case 'labor_hours':
          lineHighChartWidget.options = [getLaborOption()];
          break;
        case 'visitor_behaviour_traffic':
          lineHighChartWidget.options = [getVisitorBehaviourOption()];
          break;
        case 'gsh':
          lineHighChartWidget.options = [getGrossShoppingOption()];
          break;
        case 'draw_rate':
          lineHighChartWidget.options = [getDrawRateOption()];
          break;
        case 'opportunity':
          lineHighChartWidget.options = [getOpportunityOption()];
          break;
        case 'dwell_time':
          lineHighChartWidget.options = [getDwellTimeOption()];
          break;
        case 'abandonment_rate':
          lineHighChartWidget.options = [getAbandonmentRateOption()];
          break;
        case 'peel_off':
          lineHighChartWidget.options = [getPeelOffOption()];
          break;
        case 'average_percent_shoppers':
          lineHighChartWidget.options = [getPercentShoppersOption()];
          break;
        default:
          lineHighChartWidget.options = [getTrafficOption()];
          break;
      }
    }

    function setOptionsForPdf () {
      switch (lineHighChartWidget.kpi) {
        case 'sales':
          lineHighChartWidget.selectedOption = getSalesOption();
          break;
        case 'conversion':
          lineHighChartWidget.selectedOption = getConversionOption();
          break;
        case 'ats':
          lineHighChartWidget.selectedOption = getAtsOption();
          break;
        case 'star':
          lineHighChartWidget.selectedOption = getStarOption();
          break;
        case 'upt':
          lineHighChartWidget.selectedOption = getUptOption();
          break;
        case 'labor_hours':
          lineHighChartWidget.selectedOption = getLaborOption();
          break;
        case 'visitor_behaviour_traffic':
          lineHighChartWidget.selectedOption = getVisitorBehaviourOption();
          break;
        case 'gsh':
          lineHighChartWidget.selectedOption = getGrossShoppingOption();
          break;
        case 'draw_rate':
          lineHighChartWidget.selectedOption = getDrawRateOption();
          break;
        case 'opportunity':
          lineHighChartWidget.selectedOption = getOpportunityOption();
          break;
        case 'dwell_time':
          lineHighChartWidget.selectedOption = getDwellTimeOption();
          break;
        case 'abandonment_rate':
          lineHighChartWidget.selectedOption = getAbandonmentRateOption();
          break;
        case 'peel_off':
          lineHighChartWidget.options = [getPeelOffOption()];
          break;
        case 'average_percent_shoppers':
          lineHighChartWidget.options = [getPercentShoppersOption()];
          break;
        default:
          lineHighChartWidget.selectedOption = getTrafficOption();
          break;
      }

      if (!lineHighChartWidget.kpi.match(/(sales|ats)/)) {
        lineHighChartWidget.currencySymbol = '';
      } else {
        lineHighChartWidget.selectedOption.metric.prefixSymbol = lineHighChartWidget.currencySymbol;
        lineHighChartWidget.dataPrefix = lineHighChartWidget.currencySymbol;
      }
    }

    function getPeelOffOption () {
      return {
        name: 'peel_off',
        displayType: 'peel_off',
        propertyName: 'peel_off',
        metric: getMetric('peel_off')
      };
    }

    function getTrafficOption () {
      return {
        name: 'traffic',
        displayType: 'traffic',
        propertyName: 'total_traffic',
        metric: getMetric('traffic')
      };
    }

    function getSalesOption () {
      return {
        name: 'sales',
        displayType: 'sales',
        propertyName: 'sales_amount',
        metric: getMetric('sales')
      };
    }

    function getConversionOption () {
      return {
        name: 'conversion',
        displayType: 'conversion',
        propertyName: 'conversion',
        metric: getMetric('conversion')
      };
    }

    function getAtsOption () {
      return {
        name: 'ats',
        displayType: 'ats',
        propertyName: 'ats',
        metric: getMetric('ats')
      };
    }

    function getStarOption () {
      return {
        name: 'star',
        displayType: 'star',
        propertyName: 'star',
        metric: getMetric('star')
      };
    }

    function getUptOption () {
      return {
        name: 'upt',
        displayType: 'upt',
        propertyName: 'upt',
        metric: getMetric('upt')
      };
    }

    function getLaborOption () {
      return {
        name: 'labor_hours',
        displayType: 'labor_hours',
        propertyName: 'labor_hours',
        metric: getMetric('labor')
      };
    }

    function getVisitorBehaviourOption () {
      const option = {
        name: 'visitor_behaviour_traffic',
        displayType: 'visitor_behaviour_traffic',
        propertyName: 'total_traffic',
        metric: angular.copy(getMetric('traffic'))
      };

      $translate('views.VISITORBEHAVIOR').then((translation) => {
        option.metric.displayName = `${translation} ${option.metric.displayName.toLowerCase()}`;
      });

      return option;
    }

    function getGrossShoppingOption () {
      return {
        name: 'gsh',
        displayType: 'gsh',
        propertyName: 'gross_shopping_hours',
        metric: getMetric('gsh')
      };
    }

    function getDrawRateOption () {
      return {
        name: 'draw_rate',
        displayType: 'draw_rate',
        propertyName: 'average_draw_rate',
        metric: getMetric('draw_rate')
      };
    }

    function getOpportunityOption () {
      return {
        name: 'opportunity',
        displayType: 'opportunity',
        propertyName: 'total_opportunity',
        metric: getMetric('opportunity')
      };
    }

    function getDwellTimeOption () {
      return {
        name: 'dwell_time',
        displayType: 'dwelltime',
        propertyName: 'average_dwelltime',
        metric: getMetric('dwelltime')
      };
    }

    function getAbandonmentRateOption () {
      return {
        name: 'abandonment_rate',
        displayType: 'abandonment_rate',
        propertyName: 'average_abandonment_rate',
        metric: getMetric('abandonment_rate')
      };
    }

    function getPercentShoppersOption () {
      return {
        name: 'average_percent_shoppers',
        displayType: 'average_percent_shoppers',
        propertyName: 'shopper_percent',
        metric: getMetric('average_percent_shoppers')
      };
    }

    function setOptions () {     
      if (lineHighChartWidget.showMetrics !== true) {
        setDefaultOption();
      } else {
        lineHighChartWidget.options = [getTrafficOption()];
        const saleSubscription = SubscriptionsService.siteHasSales(lineHighChartWidget.currentOrganization, lineHighChartWidget.currentSite);

        if (saleSubscription) {
          lineHighChartWidget.options.push(getSalesOption(), getConversionOption(), getAtsOption());
        }

        const laborSubscription = SubscriptionsService.siteHasLabor(lineHighChartWidget.currentOrganization, lineHighChartWidget.currentSite);

        if (laborSubscription) {
          lineHighChartWidget.options.push(getStarOption());
        }
      }

      //hook to add peel off selection
      if (lineHighChartWidget.currentOrganization.peel_off === true) {
        lineHighChartWidget.options.push(getPeelOffOption());
      }

      if (!$rootScope.customDashboards) {
        lineHighChartWidget.selectedOption = lineHighChartWidget.options[0];
      } else {
        const search = { name: lineHighChartWidget.kpi };
        lineHighChartWidget.selectedOption = _.findWhere(lineHighChartWidget.options, search);
      }

      if (lineHighChartWidget.kpi !== 'upt') {
        lineHighChartWidget.kpi = lineHighChartWidget.selectedOption.name;
      }
    }

    function getMetric (id) {
      return _.findWhere(localMetricConstants.metrics, { value: id });
    }

    function getApiUrl () {
      if
      ((ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption) &&
        ObjectUtils.isNullOrUndefinedOrBlank(lineHighChartWidget.kpi)) ||
        lineHighChartWidget.kpi.match(/(traffic|visitor_behaviour_traffic|gsh|draw_rate|opportunity|dwell_time|abandonment_rate)/) ||
        (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption) &&
        lineHighChartWidget.selectedOption.name === 'traffic') ||
        (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption) &&
        lineHighChartWidget.kpi === 'percent_shoppers') ||
        (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption) &&
          isShoppersVSOthers())) {

        return lineHighChartWidget.apiEndpoint;
      } else
      if (lineHighChartWidget.selectedOption.name === 'peel_off') {
        const orgId = lineHighChartWidget.currentOrganization.organization_id;
        const siteId = lineHighChartWidget.currentSite.site_id;
        return `kpis/peel-off/organizations/${orgId}/sites/${siteId}`;
      }

      return 'kpis/sales';
    }

    function fetchChartData () {
     return $q.all(getChartRequests());
    }

    function getChartRequests () {
      const commonRequestParams = getCommonRequestParams();
      const _endPoint = getApiUrl();
      const _apiUrl = `${apiUrl}/${_endPoint}`;

      if (_endPoint === 'kpis/sales' && lineHighChartWidget.kpi !== 'sales') {
        commonRequestParams.kpi = [ lineHighChartWidget.kpi ];
      }

      const requests = [
        getSelectedPeriodSummaryPromise(_apiUrl, commonRequestParams, lineHighChartWidget.isCaching),
        getRequestPromise(_apiUrl, commonRequestParams, lineHighChartWidget.isCaching, lineHighChartWidget.compare1Period),
        getRequestPromise(_apiUrl, commonRequestParams, lineHighChartWidget.isCaching, lineHighChartWidget.compare2Period),
      ];
      return requests;
    }

    function canGetWeatherData () {
      return lineHighChartWidget.showWeatherMetrics &&
        !ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedWeatherMetrics) &&
        !ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentSite) &&
        !ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentSite.geometry ) &&
        !ObjectUtils.isNullOrUndefined(lineHighChartWidget.currentSite.geometry.coordinates);
    }

    function getWeatherRequestParam (location, start, end) {
      return {
        location,
        reportStartDate:start.format('YYYY-MM-DDTHH'),
        reportEndDate: end.format('YYYY-MM-DDTHH')
      };
    }

    function getWeatherRequest (location, start, end, weatherUrl) {
      const weatherPrams = {params:getWeatherRequestParam(location, start, end)};
      const weatherRequest = requestManager.getRequest(weatherUrl,
      weatherPrams, lineHighChartWidget.isCaching, lineHighChartWidget.outStandingRequests);
      addOutstandingRequest(weatherRequest, weatherPrams, weatherUrl);
      return !ObjectUtils.isNullOrUndefined(weatherRequest.deferred) &&
        !ObjectUtils.isNullOrUndefined(weatherRequest.deferred.promise) ? weatherRequest.deferred.promise :
        weatherRequest.promise;
    }

    function getWeatherRequests () {
      const requests = [];
      const weatherUrl = `${apiUrl}/weather`;
      const coord = angular.copy(lineHighChartWidget.currentSite.geometry.coordinates);
      const location = coord.reverse().join(',');
      const start = moment(lineHighChartWidget.dateRangeStart);
      const end =  moment(lineHighChartWidget.dateRangeEnd);

      if (!lineHighChartWidget.splitWeatherRequests) {
        requests.push(getWeatherRequest (location, start, end, weatherUrl));
        return requests;
      }
      let startDate = angular.copy(start);
      let endDate =  getEndDate(startDate, end);

      while (startDate <= end) {
        const singleDay = 1;
        requests.push(getWeatherRequest (location, startDate, endDate, weatherUrl));
        startDate =  angular.copy(endDate).add(singleDay, 'days');
        endDate =  getEndDate(startDate, end);
      }

     return requests;
    }

    function getEndDate (startDate, end) {
      const daysToAdd = 30;
      let endDate = angular.copy(startDate).add(daysToAdd, 'days');

      if (endDate > end) {
        endDate = angular.copy(end);
      }
      return endDate;
    }

    function getWeatherData () {
      lineHighChartWidget.isWeatherLoading = true;
      lineHighChartWidget.weatherRequestFailed = false;

      $q.all(getWeatherRequests())
        .then(transformWeatherData)
        .catch((err) => {
          if (err !== 'line highchart user cancelling') {
            lineHighChartWidget.isWeatherLoading = false;
            lineHighChartWidget.weatherRequestFailed = true;
            console.error('weather request failed:', err);
            finalizeLoad(false);
          }
        });
    }

    function getCommonRequestParams () {
      if (angular.isUndefined(lineHighChartWidget.groupBy)) {
        lineHighChartWidget.groupBy = getRootScopeGroupBy();
      }

      const commonRequestParams = {
        orgId: lineHighChartWidget.orgId,
        groupBy: lineHighChartWidget.groupBy
      };

      if (angular.isDefined(lineHighChartWidget.zoneId)) {
        commonRequestParams.zoneId = lineHighChartWidget.zoneId;
      }

      if (angular.isDefined(lineHighChartWidget.siteId)) {
        commonRequestParams.siteId = lineHighChartWidget.siteId;
      }

      if (angular.isDefined(lineHighChartWidget.locationId) && !ObjectUtils.isNullOrUndefined(lineHighChartWidget.locationId)) {
        commonRequestParams.locationId = lineHighChartWidget.locationId;
      }

      if (angular.isDefined(lineHighChartWidget.operatingHours)) {
        commonRequestParams.operatingHours = lineHighChartWidget.operatingHours;
      }

      if (angular.isDefined(lineHighChartWidget.entranceId)) {
        commonRequestParams.monitor_point_id = lineHighChartWidget.entranceId;
      }

      if (!lineHighChartWidget.getUniqueReturning) {
        commonRequestParams.includeUnique = false;
        commonRequestParams.includeReturning = false;
      } else {
        commonRequestParams.includeUnique = true;
        commonRequestParams.includeReturning = true;
      }
      commonRequestParams.sales_category_id = selectedSalesCategoriesList();

      const singleRequestParamNumber = 1;

      if (!ObjectUtils.isNullOrUndefined(commonRequestParams.sales_category_id)
      && commonRequestParams.sales_category_id.length > singleRequestParamNumber) {
        //set aggregate flag
        commonRequestParams.aggregate_sales_categories = true;
      }

      return commonRequestParams;
    }

    function selectedSalesCategoriesList () {
      return _.pluck(lineHighChartWidget.salesCategories, 'id');
    }

    function getYAxisData (graphColor) {
      const yAxisData = [];

      // y-axis
      if (isShoppersVSOthers()) {
        yAxisData.push({
          min: 0,
          max: 100,
          labels: {
            formatter () {
              return Math.round(this.value);
            }
          },
          title: {
            text: ''
          },
          allowDecimals: false,
          gridLineDashStyle: 'Dot',
          gridLineColor: '#b0b0b0'
        });
      } else {
        yAxisData.push({
          labels: {
            formatter () {
              return Math.round(this.value);
            }
          },
          title: {
            text: ''
          },
          allowDecimals: false,
          gridLineDashStyle: 'Dot',
          gridLineColor: '#b0b0b0'
        });
      }

      yAxisData.push({
        labels: {
          style: {
            color: graphColor[3]
          },
          formatter () {
            return Math.round(this.value);
          }
        },
        title: {
          text: '',
          style: {
            color: graphColor[0],
          }
        },
        allowDecimals: false,
        opposite: false,
        gridLineDashStyle: 'Dot',
        gridLineColor: '#b0b0b0'
      });

      return yAxisData;
    }

    function getOperatingHours (chartData) {
      return chartData.labels.slice(Number(lineHighChartWidget.businessDayStartHour));
    }

    function getDataWithOperatingHours (data) {
      return data.slice(Number(lineHighChartWidget.businessDayStartHour));
    }

    function buildHighchartConfig () {
      lineHighChartWidget.availWeatherMetrics = [];
      const chartData = lineHighChartWidget.chartData;
      let isSelectedWeatherAvail;
      if (lineHighChartWidget.noData || ObjectUtils.isNullOrUndefined(chartData)) {
        return;
      }
      const yAxisType = 'single';
      const graphColor = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];

      const seriesData = [];

        // series data
      _.each(chartData.series, (data, seriesIndex) => {
        if (lineHighChartWidget.operatingHours) {
          data = getDataWithOperatingHours(data);
        }
        seriesData.push(createSeriesData(seriesIndex, yAxisType, data, graphColor, chartData.labels));
      });

      // We have to set the xAxis labels since they change depending on user selected filters
      // this is for the formatter bug on the tooltips
      if (lineHighChartWidget.operatingHours) {
        const operatingHours = getOperatingHours(chartData);
        setxAxisChartLabels(operatingHours);
      } else {
        setxAxisChartLabels(chartData.labels);
      }

      // Filter the selectedWeatherMetrics as per the availiable whether data to be displayed  
      _.each(lineHighChartWidget.selectedWeatherMetrics, (data) => {
        isSelectedWeatherAvail = _.findWhere(seriesData, { name: data.label });
        if (!ObjectUtils.isNullOrUndefinedOrBlank(isSelectedWeatherAvail)) {
          lineHighChartWidget.availWeatherMetrics.push(data);
        }
      });

      return getChartConfig(graphColor, seriesData);
    }

    function createSeriesData (index, yAxisType, data, graphColor, labels) {
      //Array is indexed make sure each index exist otherwise
      for (let i = 0; i < data.length; i++) {
        if (!NumberUtils.isValidNumber(data[i])) {
          //highchart represent points if value is not valid. For those values should be null otherwise highchart drows a line without a point on the time label
          data[i] = null;
        }
      }
      return {
        name: getSeriesName(index),
        yAxis: getYAxisValue(yAxisType, index),
        data,
        labels,
        color: graphColor[index],
        marker: {
          symbol: 'circle',
          radius: 3
        },
        states: {
          hover: {
            lineWidth: 2
          }
        }
      };
    }

    function getYAxisValue (yAxisType, index) {
      const secondIndex = 2;
      const axisValueZero = 0;
      const axisValueOne = 1;
      if (yAxisType === 'single') {
        if (lineHighChartWidget.showWeatherMetrics && index > secondIndex) {
          return axisValueOne;
        }
        return axisValueZero;
      }

      return index;
    }

    function getChartConfig (graphColor, seriesData) {
      const chartConfig = {
          options: {
            chart: {
              type: lineHighChartWidget.chartType, // 'line'|'column'
              height: 320,
              style: {
                fontFamily: '"Source Sans Pro", sans-serif'
              },
              events: {
                load (event) {
                  event.target.chartWidth -= 20;
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
                },
                animation: !$rootScope.pdf
              }
            },
            tooltip: {
              shared: true,
              useHTML: true,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: '#e5e5e5',
              shadow: false,
              formatter: toolTipFormatter
            },
            exporting: {
              enabled: false
            },
            legend: {
              enabled: false
            },
          },
          title: {
            text: ''
          },
          xAxis: {
            crosshair: false,
            tickLength: 0,
            showLastLabel: true,
            endOnTick: true,
            labels: {
              align: lineHighChartWidget.chartType === 'line' ? 'left' : 'center',
              style: {
                color: '#929090'
              },
              formatter () {
                return lineHighChartWidget.xAxisChartLabels[this.value];
              }
            }
          },
          yAxis: getYAxisData(graphColor),
          series: seriesData
        };

        if ($rootScope.pdf) {
          chartConfig.options.plotOptions.line = {
            animation: false,
            enableMouseTracking: false
          };
          lineHighChartWidget.renderReady = false;
          chartConfig.options.plotOptions.series.dataLabels = false;
          chartConfig.options.tooltip.enabled = { enabled: false, animation: false};
          chartConfig.options.reflow = false;
          chartConfig.options.events = {
            load: lineHighChartWidget.renderReady = true,
          };
          $scope.$watchGroup(['lineHighChartWidget.isLoading', 'lineHighChartWidget.renderReady'],
            () => {
              if (!lineHighChartWidget.isLoading && lineHighChartWidget.renderReady) {
                $rootScope.pdfExportsLoaded += 1;
              }
            }
          );
        }

        if (!$rootScope.pdf && lineHighChartWidget.kpi === 'traffic' && !lineHighChartWidget.isHourly) {
          addClickDrillDownEvents(chartConfig);
        }

        return chartConfig;
    }

  /**
   * Adds the click events to the chart config to enable drilling through to the hourly paage
   * Works directly on the supplied object
   * The first event that is applied is a hack to deal with some weirdness in high charts where some click events don't fire
   *
   * @param {object} chartConfig - The chart configuration to add the events to
   */
    function addClickDrillDownEvents (chartConfig) {
      if (ObjectUtils.isNullOrUndefined(chartConfig.options.chart.events)) {
        return;
      }

      chartConfig.options.chart.events.click = (event) => {
        if (!periodLabelsRepresentSingleDay) {
          return;
        }

        const nearestIndex = Math.round(event.xAxis[0].value);

        const currentDate = dateLabels[0][nearestIndex];

        redirectToHourlyPage(currentDate);
      };

      chartConfig.options.plotOptions.series.point = {
        events: {
          click () {
            if (!periodLabelsRepresentSingleDay) {
              return;
            }

            const labelIndex = this.x;

            if (labelIndex > dateLabels[0].length - 1) {
              return;
            }

            const currentDate = dateLabels[0][labelIndex];

            redirectToHourlyPage(currentDate);
          }
        }
      };

      if (periodLabelsRepresentSingleDay) {
        chartConfig.options.plotOptions.series.cursor = 'pointer';
      }
    }

    function setPeriodLabelsRepresentSingleDay () {
      periodLabelsRepresentSingleDay = true;

      const currentPeriodDates = dateLabels[0];

      let previousDate = currentPeriodDates[0];

      _.each(currentPeriodDates, (currentDate) => {
        const daysBetween = currentDate.diff(previousDate, 'days');

        if (daysBetween > 1) {
          periodLabelsRepresentSingleDay = false;
        }

        previousDate = currentDate;
      });
    }

    function getWeatherName (index) {
      return $filter('translate')(lineHighChartWidget.selectedWeatherMetrics[index - 3].shortTranslationLabel);
    }

    function getPeriod1Comparison () {
      switch (lineHighChartWidget.compareRange1Type) {
        case 'prior_period':
          return 'common.PRIORPERIOD';
        case 'prior_year':
          return 'common.PRIORYEAR';
        case 'custom':
          return 'common.CUSTOMCOMPARE1';
      }
    }

    function getPeriod2Comparison () {
      switch (lineHighChartWidget.compareRange2Type) {
        case 'prior_period':
          return 'common.PRIORPERIOD';
        case 'prior_year':
          return 'common.PRIORYEAR';
         case 'custom':
           return 'common.CUSTOMCOMPARE2';
       }
    }

    function getSeriesName (index) {
      switch (index) {
        case 0:
          return $filter('translate')('common.SELECTEDPERIOD');
        case 1:
          return $filter('translate')(getPeriod1Comparison());
        case 2:
          return $filter('translate')(getPeriod2Comparison());
        default:
          if (lineHighChartWidget.showWeatherMetrics) {
            return getWeatherName(index);
          }
          return '';
      }
    }

    function getPointValue (index, point) {
      if (!lineHighChartWidget.getUniqueReturning) {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(point)) {
          return ' <label class="tooltip-value"> - </label>' ;
        }
        return index > 2 ?  getWeatherToolTipValue(point, index) :  getToolTipValues(point[0].key, index);
      } else {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(point)) {
          return ' <div class="col-xs-3 tooltip-value text-right"> - </div>' ;
        }
        return index > 2 ?  getWeatherToolTipValue(point, index) :  getToolTipValues(point[0].key, index);
      }

    }

    function getPointColor (point) {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(point)) {
        return '#929090';
      }
      return  point[0].color;
    }

    function setSelectedDate (point) {
      if (!lineHighChartWidget.isHourly && lineHighChartWidget.groupBy !== 'hour') {
        if (_.isUndefined(point[0])) {
          return;
        }
        const key = point[0].key;
        const selectedDate = lineHighChartWidget.chartData.labels[key];
        const momentDate = moment(selectedDate, lineHighChartWidget.dateFormatMask);
        const formattedDate = momentDate.format('YYYY-MM-DD');
        if (formattedDate !== 'Invalid date') {
          lineHighChartWidget.selectedDate = formattedDate;
        }
      }
    }

    function getToolTipName (point, index, name) {
      setSelectedDate(point, index, name);
      if (index > 2) {
        return name;
      }

      if (ObjectUtils.isNullOrUndefinedOrEmpty(point)) {
        return '';
      }

      return lineHighChartWidget.tooltipData[index][point[0].key].startDateString;
    }

    function getToolTipTime (labels, index) {
      if (lineHighChartWidget.operatingHours) {
        labels = labels.slice(lineHighChartWidget.businessDayStartHour);
      }

      if (index.length > 0) {
        return labels[index[0].key] || '';
      }

      return '';
    }

    function getShoppersOthersTooltip (item) {
      const dataPrecision = lineHighChartWidget.dataPrecision;
      const others = item.othersData = 100 - item.value;
      return others.toFixed(dataPrecision);
    }

    function populateToolTipBody (point, seriesItem, index) {

      let body = '';

      if (index <= 2 && ObjectUtils.isNullOrUndefined(lineHighChartWidget.tooltipData[index])) {
       return body;
      }

      if (ObjectUtils.isNullOrUndefinedOrEmpty(point)) {
        return body;
      }

      const labelClass =  `label_${index}`;

      if (!lineHighChartWidget.getUniqueReturning) {
        body += ' <div class="col-xs-12">';

        let toolTipName = getToolTipName(point, index, seriesItem.name);

        if (lineHighChartWidget.isHourly) {
          toolTipName += ` ${getToolTipTime(seriesItem.labels, point)}`;
        }

        body +=
        `<span style="color:${getPointColor(point)}">●</span> <label class="${labelClass} tooltip-name" >${toolTipName}</label>`;

        body += getPointValue(index, point);

        body += ' </div>';
      } else {
        body = `<div class="row">
          <div class="col-xs-3">
            <span style="color:${getPointColor(point)}">●</span>
            <label class="${labelClass} tooltip-name" style="font-size:12px;" >${getToolTipName(point, index, seriesItem.name)} </label>
          </div>${getPointValue(index, point)}
        </div>`;
      }

      return body;
    }

    function getWeatherToolTipValue (point, index) {
      let valueLabel = ' <label class="tooltip-value">';

      let value = '-';

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(point) && !ObjectUtils.isNullOrUndefined(updatedSelectedWeatherMetrics[index - 3])) {
        value = $filter('formatNumber')(point[0].y, 1, lineHighChartWidget.numberFormatName) + updatedSelectedWeatherMetrics[index - 3].suffixSymbol;
      }

      valueLabel += value;

      valueLabel += '</label>';

      return  valueLabel;
    }

    function getToolTipValues (seriesItemIndex, index) {
      let row = '';

      const td = lineHighChartWidget.tooltipData[index];

      if (!lineHighChartWidget.getUniqueReturning ) {
        if (isShoppersVSOthers()) {
          row += ` <label class="text-center tooltip-value tooltip-other">${getShoppersOthersTooltip(td[seriesItemIndex])} % </label>`;
          row += ` <label class="text-center tooltip-value tooltip-shoppers">${getValueString (td[seriesItemIndex])}% </label>`;
        } else {
          row += ` <label class="text-center tooltip-value tooltip-shoppers">${getValueString (td[seriesItemIndex])} </label>`;
        }
      } else {
        row +=
        `<div class="col-xs-3 text-right"> <label class="tooltip-unique-value">${getValueString(td[seriesItemIndex])} </label></div><div class="col-xs-3 text-right"> <label class="tooltip-unique">${getUniqueValueString(td[seriesItemIndex])} </label></div><div class="col-xs-3 text-right"> <label  class="tooltip-return">${getReturnValueString(td[seriesItemIndex])} </label></div>`;
      }

      return row ;
    }

  function toolTipFormatter () {
      const title = `<div class="tooltip-header">${lineHighChartWidget.selectedOption.metric.displayName}</div>${populateToolTipTotalHeader()}`;

      let body = '';

      const points = this.points;

      _.each(lineHighChartWidget.chartConfig.series, (seriesItem, index) => {

        const point1 = _.filter(points, (pointItem) => pointItem.series.name === seriesItem.name);

        if (lineHighChartWidget.showWeatherMetrics && index === 3) {
          body += populateToolTipWeatherHeader();
        }

        body += populateToolTipBody(point1, seriesItem, index);
      });

      return title + body;
    }

    function populateToolTipWeatherHeader () {
      const header = `  <div class= "col-xs-12 tooltip-header">${$filter('translate')('common.WEATHER')} </div>`;

      return header ;
    }

    function populateToolTipTotalHeader () {
      let header = ' <div class= "row">';

      if (!lineHighChartWidget.getUniqueReturning) {
        header += ` <div class= "tooltip-total-title col-xs-12">${$filter('translate')('common.TOTAL')} </div>`;
        if (isShoppersVSOthers()) {
          header += '<div class="col-xs-3 tooltip-total-title-others">Others</div>';
          header += '<div class="col-xs-3 tooltip-total-title-shoppers">Shoppers</div>';
        }
      } else {
        header +=
          `<div class="col-xs-3"></div> <div class="tooltip-total-title-unique col-xs-3 text-right">${$filter('translate')('common.TOTAL')} </div> <div class="tooltip-unique-title col-xs-3 text-right">${$filter('translate')('summaryWidget.UNIQUE')} </div> <div class="tooltip-returning-title col-xs-3 text-right">${$filter('translate')('summaryWidget.RETURNING')} </div>`;
      }

      return `${header} </div>`;
    }

    function getPrefixForTooltip (metric) {
      if (metric.isCurrency) {
        return lineHighChartWidget.currencySymbol;
      }

      return metric.prefixSymbol;
    }

    function getMultipliedFormattedValue (value) {
      if (_.isUndefined(lineHighChartWidget.selectedOption.metric)) {
        return value.toFixed(lineHighChartWidget.dataPrecision);
      }

      return  getPrefixForTooltip(lineHighChartWidget.selectedOption.metric) +
        $filter('formatNumber')($filter('multiplyNumber')(value, lineHighChartWidget.multiplier),
        lineHighChartWidget.selectedOption.metric.precision, lineHighChartWidget.numberFormatName) +
        lineHighChartWidget.valueLabel +
        lineHighChartWidget.selectedOption.metric.suffixSymbol;
    }

    function validData (data) {
      return !ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefinedOrBlank(data.value);
    }

    function getValueString (data) {
      return validData(data) ? getMultipliedFormattedValue(data.value) : '-';
    }

    function validUniqueData  (data) {
      return !ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefinedOrBlank(data.uniqueTraffic);
    }

    function getUniqueValueString (data) {
      return validUniqueData(data) ? getMultipliedFormattedValue(data.uniqueTraffic) : '-';
    }

     function validReturnData (data) {
      return !ObjectUtils.isNullOrUndefined(data) && !ObjectUtils.isNullOrUndefinedOrBlank(data.returnTraffic);
    }

    function getReturnValueString (data) {
      return validReturnData(data) ? getMultipliedFormattedValue(data.returnTraffic) : '-';
    }

    function setxAxisChartLabels (chartLabels) {
      lineHighChartWidget.xAxisChartLabels = chartLabels;
    }

    function transformChartData (responses) {
      lineHighChartWidget.chartConfig = null;
      lineHighChartWidget.isChartLoading = false;
      lineHighChartWidget.chartRequestFailed = false;
      const result = angular.copy(responses);

      //handle sort issues with chart date on x-axis
      _.map(result, (responseObj) => {
        responseObj.result = _.sortBy(responseObj.result, 'period_end_date');
      });

      let reportData;
      let compareData;
      let yearCompareData;

      if (lineHighChartWidget.isHourly || lineHighChartWidget.groupBy === 'hour') {

        reportData = result[0].result;
        compareData = result[1].result;
        yearCompareData = result[2].result;

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(result[0].result)) {
          const hourRangeToDisplay = getHourRangeToDisplay(reportData);

          reportData = insertValuesForHourlyChart(reportData, hourRangeToDisplay);
          compareData = insertValuesForHourlyChart(compareData, hourRangeToDisplay);
          yearCompareData = insertValuesForHourlyChart(yearCompareData, hourRangeToDisplay);
        }

      } else {
        reportData = result[0].result;
        compareData = result[1].result;
        yearCompareData = result[2].result;
      }

      transformPeriodData('report', reportData);

      transformPeriodData('compare_period', compareData);

      transformPeriodData('compare_year', yearCompareData);

      fillEmptySeriesAndTooltipData();

      if (lineHighChartWidget.isHourly) {
        transformDataForTable(reportData, compareData, yearCompareData);
      }

      loadSummary();
    }

    /**
     * @function fillEmptySeriesAndTooltipData
     * This function adds missing data points to a compare series and tooltip values when it has less data compared to the selected period
     * 
     * @fires fillSeries()
     * @returns {Nothing} is returned, but existing tooltip and series data have null values inserted for missing data points
     */
    function fillEmptySeriesAndTooltipData() {

      if (!moment.isMoment(lineHighChartWidget.dateRangeStart) && !_.isObject(lineHighChartWidget.dateRangeStart)) {
        lineHighChartWidget.dateRangeStart = moment(lineHighChartWidget.dateRangeStart);
      }

      if (!moment.isMoment(lineHighChartWidget.dateRangeEnd) && !_.isObject(lineHighChartWidget.dateRangeEnd)) {
        lineHighChartWidget.dateRangeEnd = moment(lineHighChartWidget.dateRangeEnd);
      }

      const dataPointsInSelectedRange = lineHighChartWidget.dateRangeEnd.diff(lineHighChartWidget.dateRangeStart, lineHighChartWidget.groupBy);
      const selectedAndCompare1Diff = lineHighChartWidget.dateRangeStart.diff(lineHighChartWidget.compareRange1Start, lineHighChartWidget.groupBy);
      const selectedAndCompare2Diff = lineHighChartWidget.dateRangeStart.diff(lineHighChartWidget.compareRange2Start, lineHighChartWidget.groupBy);
      const selectedPeriodSeries = lineHighChartWidget.chartData.series[0];
      const compare1PeriodSeries = lineHighChartWidget.chartData.series[1];
      const compare2PeriodSeries = lineHighChartWidget.chartData.series[2];

      if (compare1PeriodSeries.length < selectedPeriodSeries.length) {
        fillSeries(lineHighChartWidget.chartData.series[1], selectedPeriodSeries, dataPointsInSelectedRange, selectedAndCompare1Diff, 1);
      }

      if (compare2PeriodSeries.length < selectedPeriodSeries.length) {
        fillSeries(lineHighChartWidget.chartData.series[2], selectedPeriodSeries, dataPointsInSelectedRange, selectedAndCompare2Diff, 2);
      }
    }

    /**
     *
     * @function fillSeries
     * Ensures the data is displayed from the correct start point
     * A new object is created and built out that contains a 0 value, a start date and end date. This is the empty tool tip data.
     *
     * @param {Array} comparePeriodSeries An array containing values for each data point in the compare period date range
     * @param {Array} selectedPeriodSeries An array containing values for each data point in the selected period date range
     * @param {Number} dataPointsInSelectedRange The number of data points that exist in the selected period
     * @param {Number} selectedAndCompareDiff The number of data points between the start date of the selected period and the compare period
     * @param {Number} targetToolTip The index of the target tooltip in linehighchart.tooltipData array
     * @fires fillToolTip()
     * @returns {Nothing} but adds a null value to each missing data point on a compare series
     */
    function fillSeries (comparePeriodSeries, selectedPeriodSeries, dataPointsInSelectedRange, selectedAndCompareDiff, targetToolTip) {
      const missingCompareNum = Number(selectedPeriodSeries.length) - Number(comparePeriodSeries.length);
      if (
        selectedPeriodSeries.length - missingCompareNum > 0 && 
        dataPointsInSelectedRange <= comparePeriodSeries.length + missingCompareNum
      ) {
          
        const newTooltipDataObj = {};

        _(missingCompareNum).times((time) => {
          comparePeriodSeries.unshift(null);
          newTooltipDataObj[time] = {
            startDate: lineHighChartWidget.tooltipData[0][time].startDate.subtract(selectedAndCompareDiff, lineHighChartWidget.groupBy),
            endDate: lineHighChartWidget.tooltipData[0][time].endDate.subtract(selectedAndCompareDiff, lineHighChartWidget.groupBy),
            startDateString: lineHighChartWidget.tooltipData[0][time].startDate.subtract(selectedAndCompareDiff, lineHighChartWidget.groupBy).format(lineHighChartWidget.dateFormatMask),
            value: 0
          };
        });
        
        fillTooltip(targetToolTip, missingCompareNum, newTooltipDataObj);
      }
    }

    /**
     * @function fillTooltip
     * Adds existing tool tip data to the new tooltip object
     * 
     * @param {Number} targetToolTip The index of the target tooltip in linehighchart.tooltipData array
     * @param {Number} numberOfMissingDataPoints The difference between the number of existing data points in the selected period and compare period
     * @param {Object} newTooltipDataObj An object containing empty tooltip data for the missing data points in the compare period series
     * @returns {Nothing} but reassigns the tooltip data for the compare object to the new one. 
     */
    function fillTooltip (targetToolTip, numberOfMissingDataPoints, newTooltipDataObj) {
      _.each(lineHighChartWidget.tooltipData[targetToolTip], (item, index) => {
        const key = numberOfMissingDataPoints + Number(index);
        newTooltipDataObj[key] = {
          startDate: item.startDate,
          endDate: item.endDate,
          value: item.value,
          startDateString: item.startDate.format(lineHighChartWidget.dateFormatMask)
        };
      });

      lineHighChartWidget.tooltipData[targetToolTip] = newTooltipDataObj;
    }

    function getHour (dateString) {
      return Number(moment(dateString).format('HH'));
    }

    function insertValuesForHourlyChart (data, hourRangeToDisplay) {
      const results = [];

      let currentHour = hourRangeToDisplay.start;

      while (currentHour <= hourRangeToDisplay.end) {
        let hourData = getDataForHour(data, currentHour);

        if (ObjectUtils.isNullOrUndefined(hourData) && !ObjectUtils.isNullOrUndefined(data[0])) {
          hourData = buildDefaultHourData(currentHour, data[0].period_start_date);
        }

        results.push(hourData);
        currentHour++;
      }

      return results;
    }

    function buildDefaultHourData (hour, firstDateRange) {
      const momentHour = moment(firstDateRange).startOf('day').add('hour', hour);

      return {
        period_start_date: momentHour.format('YYYY-MM-DDTHH:mm:ss'),
        period_end_date: momentHour.format('YYYY-MM-DDTHH:mm:ss')
      };
    }

    function loadSummary () {
      /* If unique and returning values (traffic widget) are used, we need to make separate
        API requests for summary data to fetch unique/returning data.
      */

      const commonRequestParams = getCommonRequestParams();
      let averageRequestParams;

      if (lineHighChartWidget.separateSummaryRequests || lineHighChartWidget.getUniqueReturning) {
        averageRequestParams = angular.copy(commonRequestParams);
        averageRequestParams.groupBy = 'aggregate';

        if (getApiUrl() === 'kpis/sales' && lineHighChartWidget.kpi !== 'sales') {
          averageRequestParams.kpi = [ lineHighChartWidget.kpi ];
        }
        lineHighChartWidget.summaryLoading = true;

        fetchSummaryData(averageRequestParams)
          .then((responses) => {
            transformSummaryData(responses);
          })
          .catch((err) => {
            if (err !== 'line highchart user cancelling') {
              lineHighChartWidget.summaryLoading = false;
              finalizeLoad(true);
            }
        });
        return;
      } else {

        if (canGetWeatherData()) {
          getWeatherData();
        } else {
          lineHighChartWidget.summaryLoading = false;
          finalizeLoad(false);
        }
      }
    }

    function finalizeLoad (requestFailed) {
      if (lineHighChartWidget.isWeatherLoading || lineHighChartWidget.isChartLoading || lineHighChartWidget.summaryLoading) {
        return;
      }

      lineHighChartWidget.outStandingRequests = [];

      lineHighChartWidget.requestFailed = requestFailed;

      lineHighChartWidget.isLoading = false;

      setNoData();

      $timeout(() => {
        const chartConfig = buildHighchartConfig();
        lineHighChartWidget.dataReady = (!lineHighChartWidget.noData && !ObjectUtils.isNullOrUndefined(chartConfig));

        if (lineHighChartWidget.dataReady) {
          lineHighChartWidget.chartConfig = chartConfig;
        }
      });
    }

    function noWeatherData (responses) {
      return ObjectUtils.isNullOrUndefined(lineHighChartWidget.chartData) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.chartData.labels) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(responses);
    }

    function noTranformWeatherData (responses) {
      return !canGetWeatherData() ||
        noWeatherData(responses);
    }

  /**
   * Transforms the weather data response into something that can be plotted on a graph
   *
   * @param {object} responses - The response returned by the weather API
   */
    function transformWeatherData (responses) {
      lineHighChartWidget.isWeatherLoading = false;
      lineHighChartWidget.weatherRequestFailed = false;
      //check if there is weather data
      if (noTranformWeatherData(responses)) {
        finalizeLoad(false);
        return;
      }

      const chartStartDate = moment(lineHighChartWidget.dateRangeStart);
      const data = _.map(responses, (data) => data.result);
      const weatherData = lineHighChartWidget.splitWeatherRequests || _.isArray(data) ?  _.flatten(data) : data[0];

      populateWeatherData(chartStartDate, weatherData);

      finalizeLoad(false);
    }

  /**
   * Populates the weather data
   *
   * @param {object} chartStartDate - The first plot point date
   * @param {object} weatherData - A sanitized weather API reponse object
   */
    function populateWeatherData (chartStartDate, weatherData) {
      // We need to operate against a copy of the chartSeries object to stop
      // unwanted angular digest cycles
      const chartSeries = angular.copy(lineHighChartWidget.chartData.series);

       _.each(lineHighChartWidget.chartData.labels, (label, index) => {
        plotWeatherData(label, weatherData, index, chartSeries);
       });

       lineHighChartWidget.chartData.series = chartSeries;
    }

    function getWeatherForDate (weatherData, date) {
      date = moment(date, lineHighChartWidget.dateFormatMask);

      return _.find(weatherData, (dayWeatherData) => {
        const weatherDate = moment(dayWeatherData.date, 'YYYY-MM-DD');

        return weatherDate.isSame(date, 'day');
      });
    }

    function getAgregatedMetricValue (filteredData, metric) {
      if (!_.isArray(filteredData)) {
        return getWeatherMetricValue(metric, filteredData);
      }

      let metricVal = null;
      let count = 0;

      _.each(filteredData, (data) => {
        const val = getWeatherMetricValue(metric, data);

        if (!ObjectUtils.isNullOrUndefined(val)) {
          if (ObjectUtils.isNullOrUndefined(metricVal)) {
              metricVal = 0;
          }

          count += 1;
          metricVal += val;
        }
      });

      if (count > 0) {
        metricVal = metricVal / count;
      }

      return metricVal;
    }

    /**
     * Updates the supplied chartSeries to inject any weather metrics that have been selected for the supplied date.
     * This operated directly on the supplied chartSeries, and returns nothing.
     *
     * @param {string} date - the date shown in the chart label in the UI
     * @param {array<weatherResponse>} weatherData - All weather data
     * @param {number} plotIndex - The index of where the supplied date appears in the chart date labels collection
     * @param {object<chartSeries>} - The chartSeries object to update
     */
    function plotWeatherData (date, weatherData, plotIndex, chartSeries) {
      /* Our chart will have:
       * 0: current period
       * 1: compare 1
       * 2: compare 2
       * So we need to start weather plot lines at index 3
       * */     
      updatedSelectedWeatherMetrics = [];
      const firstWeatherPlotLineIndex = 3;
      const weatherForDay = getWeatherForDate(weatherData, date);
      const updatedWeatherMetricsInfo = lineHighChartWidget.weatherMetricsDisplayInfo;
     
      _.each(lineHighChartWidget.selectedWeatherMetrics, (metric) => {
        updatedSelectedWeatherMetrics.push(_.findWhere(updatedWeatherMetricsInfo, { kpi: metric.kpi }));
      });

      _.each(updatedSelectedWeatherMetrics, (metric, i) => {

        const plotLineIndex = firstWeatherPlotLineIndex + i;

        const metricVal = getAgregatedMetricValue(weatherForDay, metric);

        if (!_.isUndefined(metricVal)) {
          if (ObjectUtils.isNullOrUndefined(chartSeries[plotLineIndex])) {
            const seriesData = [];
            seriesData[0] = metricVal;

            chartSeries[plotLineIndex] = seriesData;
          } else {
            chartSeries[plotLineIndex][plotIndex] = metricVal;
          }
        }
      });
    }

    function getWeatherAvg (metric, data) {
      let val;
      let count = 0;
      _.each(metric.avgKeys, (key) => {
        if (!ObjectUtils.isNullOrUndefined(data[key])) {
          if (ObjectUtils.isNullOrUndefined(val)) {
            val = 0;
          }
          val += Number(data[key][metric.unit]);
          count += 1;
        }
      });
      if (count > 0 ) {
        return val / count;
      }
      return val;
    }

    function getTotal (data, metric, total) {
       if (ObjectUtils.isNullOrUndefined(data[metric.apiReturnkey])) {
         return total;
       }
       if (ObjectUtils.isNullOrUndefined(total)) {
         total = 0;
       }
       return total + getMetricNumberValue(data, metric);
    }

    function getMetricNumberValue (data, metric) {
      return ObjectUtils.isNullOrUndefinedOrBlank(metric.unit) ||
        ObjectUtils.isNullOrUndefinedOrBlank(data[metric.apiReturnkey][metric.unit]) ?
        Number(data[metric.apiReturnkey]) :
        Number(data[metric.apiReturnkey][metric.unit]);
    }

    function getWeatherMetricAverageFromHourlyData (metric, data) {
      if (ObjectUtils.isNullOrUndefined(data) ||
        ObjectUtils.isNullOrUndefinedOrEmpty(data.hourly)) {
        return null;
      }

      let total = null;

      _.each(data.hourly, (hourlyData) => {
        total = getTotal(hourlyData, metric, total);
      });

      return total / data.hourly.length;
    }

    function getWeatherMetricValue (metric, data) {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(metric.avgKeys)) {
        return getWeatherAvg(metric, data);
      }
      if (metric.isHourly) {
        return getWeatherMetricAverageFromHourlyData(metric, data);
      }

      return ObjectUtils.isNullOrUndefined(data[metric.apiReturnkey]) ?
        data[metric.apiReturnkey]:
        getMetricNumberValue(data, metric);
    }

    function setNoData () {
      lineHighChartWidget.noData = !hasData(0);
      if (lineHighChartWidget.noData) {
        lineHighChartWidget.isLoading = false;
      }
    }

    function transformPeriodData (type, data) {
      let index, i, entry, chartStartDate, chartEndDate;
      if (ObjectUtils.isNullOrUndefinedOrEmpty(data) || _.isUndefined(data[0])) {
        return;
      }

      if (type === 'report') {
        index = 0;
        chartStartDate = moment(lineHighChartWidget.dateRangeStart);
        chartEndDate = moment(lineHighChartWidget.dateRangeEnd);
        lineHighChartWidget.chartData.labels = [];
      } else if (type === 'compare_period') {
        index = 1;
        chartStartDate = moment(lineHighChartWidget.compare1Period.start);
        chartEndDate = moment(lineHighChartWidget.compare1Period.end);
      } else if (type === 'compare_year') {
        index = 2;
        chartStartDate = moment(lineHighChartWidget.compare2Period.start);
        chartEndDate = moment(lineHighChartWidget.compare2Period.end);
      } else {
        return;
      }

      // Fetch the date format from the user preferences otherwise the selected date
      // range displayed won't be in the format the user expects.
      const dateFormat = LocalizationService.getCurrentDateFormat(lineHighChartWidget.currentOrganization);

      lineHighChartWidget.dateRanges[index] = {
        // These start and end dates are bound to the user selected period displayed in the Traffic widget
        // in the right hand corner.
        start: moment(chartStartDate).format(dateFormat),
        end: moment(chartEndDate).format(dateFormat)
      };

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.tooltipData[index])) {
        lineHighChartWidget.tooltipData[index] = {};
      }

      // Current, Prior1, Prior2
      dateLabels[index] = [];

      for (i = 0; i < data.length; i++) {
        /* Populate the data series. */
        entry = data[i];

        const date = moment(entry.period_start_date);

        dateLabels[index].push(date);

        /* Create chart labels. */
        if (index === 0) {
          let label;
          if (lineHighChartWidget.isHourly || lineHighChartWidget.groupBy === 'hour') {
            label = getTimeFromDate(date);
          } else {
            label = formatShortDate(date);
          }
          lineHighChartWidget.chartData.labels[i] = label;
        }

        updateSeriesAndTooltip(entry, index, i);
      }

      if (!lineHighChartWidget.isHourly) {
        setPeriodLabelsRepresentSingleDay(dateLabels);
      }


      // If we don't do separate summary requests, calculate totals here
      if (!lineHighChartWidget.separateSummaryRequests && !lineHighChartWidget.getUniqueReturning) {
        lineHighChartWidget.totalData[index] = data;
        calculateTotalAggregate(index, data);
      }
    }

    function updateSeriesAndTooltip (entry, index, seriesItemIndex) {
      if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption)) {
        lineHighChartWidget.chartData.series[index][seriesItemIndex] = entry[lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;

        if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.tooltipData[index][seriesItemIndex])) {
          lineHighChartWidget.tooltipData[index][seriesItemIndex] = {};
        }

        if (lineHighChartWidget.getUniqueReturning) {
          lineHighChartWidget.tooltipData[index][seriesItemIndex].returnTraffic = entry.return_traffic;
          lineHighChartWidget.tooltipData[index][seriesItemIndex].uniqueTraffic = entry.unique_traffic;
        }

        lineHighChartWidget.tooltipData[index][seriesItemIndex].value = entry[lineHighChartWidget.selectedOption.propertyName];
        lineHighChartWidget.tooltipData[index][seriesItemIndex].startDate = moment(entry.period_start_date, 'YYYY-MM-DD');
        lineHighChartWidget.tooltipData[index][seriesItemIndex].endDate = moment(entry.period_end_date, 'YYYY-MM-DD');
        lineHighChartWidget.tooltipData[index][seriesItemIndex].startDateString = moment(entry.period_start_date, 'YYYY-MM-DD').format(lineHighChartWidget.dateFormatMask);
      }
    }

    function convertDateToChartSeriesIndex (date, startDate, groupBy, realIndex) {
      switch (groupBy) {
        case 'week':
          return Math.floor((date.unix() - startDate.unix()) / (7 * 24 * 3600));
        case 'month':
          return realIndex;
        default: // Day
          return Math.floor((date.unix() - startDate.unix()) / (24 * 3600));
      }
    }

    function loadTooltipData (seriesItemIndex) {
      if (lineHighChartWidget.getUniqueReturning === true && tooltipDataInitialized(seriesItemIndex) && !tooltipDataIsLoaded(seriesItemIndex)) {
        const params = [];

        _.each(lineHighChartWidget.tooltipData, dateRange => {
          params.push({
            reportStartDate: dateRange[seriesItemIndex].startDate,
            reportEndDate: dateRange[seriesItemIndex].endDate
          });

          dateRange[seriesItemIndex].details = {};
        });

        lineHighChartWidget.requestQueue.push({
          seriesItemIndex,
          params
        });
      }
    }

    function tooltipDataInitialized (seriesItemIndex) {
      const initialized = _.every(lineHighChartWidget.tooltipData, dateRange => !ObjectUtils.isNullOrUndefined(dateRange) && !ObjectUtils.isNullOrUndefined(dateRange[seriesItemIndex]));

      return initialized;
    }

    function tooltipDataIsLoaded (seriesItemIndex) {
      const loaded = _.every(lineHighChartWidget.tooltipData, dateRange => !ObjectUtils.isNullOrUndefined(dateRange[seriesItemIndex].details));

      return loaded;
    }

    function loadDetails () {
      if (Object.keys(lineHighChartWidget.requestQueue).length > 0 && lineHighChartWidget.requestsLoading < lineHighChartWidget.maxConcurrentTooltips) {
        const item = lineHighChartWidget.requestQueue.shift();
        lineHighChartWidget.requestsLoading++;

        fetchDetailData(item)
          .then(transformDetailData)
          .then(() => {
            lineHighChartWidget.requestsLoading--;
            loadDetails();
          })
          .catch(() => {
            lineHighChartWidget.requestsLoading--;
            loadDetails();
          });
      }
    }

    function fetchDetailData (item) {
      const commonRequestParams = getCommonRequestParams();
      commonRequestParams.includeUnique = true;
      commonRequestParams.includeReturning = true;
      commonRequestParams.groupBy = 'aggregate';
      const _apiUrl = `${apiUrl}/${getApiUrl()}`;
      const promises = [];

      _.each(item.params, (dateRange) => {
        promises.push(requestManager.get(_apiUrl, {
          params: angular.extend({}, dateRange, commonRequestParams)
        }));
      });

      return $q.all(promises);
    }

    function transformDetailData (responses) {
      const result = angular.copy(responses);
      let seriesItemIndex;
      const chartStartDate = {
        0: moment(lineHighChartWidget.dateRangeStart),
        1: moment(lineHighChartWidget.compare1Period.start),
        2: moment(lineHighChartWidget.compare2Period.start)
      };
      _.each(result, (response, index) => {
        seriesItemIndex = convertDateToChartSeriesIndex(
          moment(response.result[0].period_start_date),
          chartStartDate[index],
          lineHighChartWidget.groupBy
        );
        lineHighChartWidget.tooltipData[index][seriesItemIndex].details = {
          return: response.result[0].return_traffic,
          unique: response.result[0].unique_traffic
        };
      });
    }

    function addOutstandingRequest (request, params, url) {
      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.outStandingRequests)) {
        lineHighChartWidget.outStandingRequests = [];
      }

      const outstandingRequest = requestManager.findOutstandingRequest(url,
        {params}, lineHighChartWidget.outStandingRequests);

      if (ObjectUtils.isNullOrUndefined(outstandingRequest)) {
        lineHighChartWidget.outStandingRequests.push(request);
      }
    }

    function getSelectedPeriodSummaryPromise (url, requestParams, cache) {
      const dateRange = {
        start: lineHighChartWidget.dateRangeStart,
        end: lineHighChartWidget.dateRangeEnd
      };

      return getRequestPromise(url, requestParams, cache, dateRange);
    }

    function getRequestPromise (_apiUrl, requestParams, cache, dateRange) {
      dateRange.start = makeMoment(dateRange.start);
      dateRange.end = makeMoment(dateRange.end);

      const params =  {
        params: angular.extend({}, {
          reportStartDate: utils.getDateStringForRequest(dateRange.start),
          reportEndDate: utils.getDateStringForRequest(dateRange.end),
        }, requestParams)
      };
      const request = requestManager.getRequest(_apiUrl, params, cache, lineHighChartWidget.outStandingRequests);
      addOutstandingRequest(request, params, _apiUrl);
      return !ObjectUtils.isNullOrUndefined(request.deferred) &&
        !ObjectUtils.isNullOrUndefined(request.deferred.promise) ? request.deferred.promise :
        request.promise;
    }

    function makeMoment (dateRange) {
      if (typeof(dateRange === 'string')) {
        return moment(dateRange); //ToDo: Get format
      }

      return dateRange;
    }

    function fetchSummaryData (averageRequestParams) {
      const _apiUrl = `${apiUrl}/${getApiUrl()}`;

      return $q.all([
        getSelectedPeriodSummaryPromise(_apiUrl, averageRequestParams, lineHighChartWidget.isCaching),
        getRequestPromise(_apiUrl, averageRequestParams, lineHighChartWidget.isCaching, lineHighChartWidget.compare1Period),
        getRequestPromise(_apiUrl, averageRequestParams, lineHighChartWidget.isCaching, lineHighChartWidget.compare2Period)
     ]);
    }

    function transformSummaryData (responses) {
      lineHighChartWidget.totalData = [];
      _.each(responses, (response, index) => {
        lineHighChartWidget.totalData.push(response.result);
        if (lineHighChartWidget.summaryAverages) {
          calculateAverageData(index, response.result);
        } else {
          calculateTotalAggregate(index, response.result);
        }
      });

      lineHighChartWidget.summaryLoading = false;
      if (canGetWeatherData()) {
        getWeatherData();
      } else {
        finalizeLoad(false);
      }
    }

    function calculateAverageData (index, data) {
      let currentValue, compareValue;
      if (index > 0 && !ObjectUtils.isNullOrUndefined(data[0])) {
        compareValue = data[0][lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;
        currentValue = lineHighChartWidget.summaryData[0];
        lineHighChartWidget.delta[index] = comparisonsHelper.getComparisonData(currentValue, compareValue, true);
        lineHighChartWidget.summaryData[index] = compareValue;
      } else if (!ObjectUtils.isNullOrUndefined(data[0])) {
        compareValue = data[0][lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;
        lineHighChartWidget.summaryData[0] = compareValue;
      }
    }

    function calculateTotalAggregate (index, data) {
      let currentValue, compareValue;

      if (!ObjectUtils.isNullOrUndefined(data[0])) {
        if (data.length > 0) {
          lineHighChartWidget.returnData[index] = 0;
          lineHighChartWidget.uniqueData[index] = 0;
          compareValue = null;

          _.each(data, (item) => {
            if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption) && !ObjectUtils.isNullOrUndefined(item[lineHighChartWidget.selectedOption.propertyName] ) ) {
              if ( compareValue === null) {
                //init
                compareValue = 0;
              }

              compareValue += item[lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;
            }

            if (lineHighChartWidget.getUniqueReturning) {
              lineHighChartWidget.uniqueData[index] += item.unique_traffic * lineHighChartWidget.multiplier;
              lineHighChartWidget.returnData[index] += item.return_traffic * lineHighChartWidget.multiplier;
            }
          });
        } else {
          compareValue = data[0][lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;
          if (lineHighChartWidget.getUniqueReturning) {
            lineHighChartWidget.uniqueData[index] = data[0].unique_traffic;
            lineHighChartWidget.returnData[index] = data[0].return_traffic;
          }
        }

        lineHighChartWidget.summaryData[index] = compareValue;
      }

      if (index > 0 && !ObjectUtils.isNullOrUndefined(data[0])) {
        currentValue = 0;
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.totalData[0]) && !ObjectUtils.isNullOrUndefined(lineHighChartWidget.selectedOption)) {
          _.each(lineHighChartWidget.totalData[0], item => {
            currentValue += item[lineHighChartWidget.selectedOption.propertyName] * lineHighChartWidget.multiplier;
          });
          lineHighChartWidget.delta[index] = comparisonsHelper.getComparisonData(currentValue, compareValue, true);
        }
      }
    }

    function formatDate (dateString) {
      return moment(dateString).format(lineHighChartWidget.dateFormatMask);
    }

    function formatShortDate (dateString) {
      let momentDate;

      if (moment.isMoment(dateString)) {
        momentDate = dateString;
      } else {
        momentDate = moment(dateString);
      }

      return momentDate.format(lineHighChartWidget.dateFormatMask);
    }

    function getTimeFromDate (momentDate) {
      return momentDate.format('LT');
    }

    function getGroupKey () {
      if (!ObjectUtils.isNullOrUndefined($state.current.views) &&
        !ObjectUtils.isNullOrUndefined($state.current.views.analyticsMain) &&
        !ObjectUtils.isNullOrUndefined($state.current.views.analyticsMain.controller)){
        return `${$state.current.views.analyticsMain.controller.toString()}-${lineHighChartWidget.kpi.toString()}`;
      }
      return '';
    }

    function setRootScopeGroupBy (groupBy) {
      $rootScope.groupBy[getGroupKey()] = groupBy;
    }

    function getRootScopeGroupBy () {
      return $rootScope.groupBy[getGroupKey()];
    }

    function setGroupBy (groupBy) {
      googleAnalytics.trackUserEvent('group by', groupBy);
      lineHighChartWidget.groupBy = groupBy;
      setRootScopeGroupBy(groupBy);
    }

    function hasData (index) {
      return !ObjectUtils.isNullOrUndefined(lineHighChartWidget.chartData) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.chartData.series) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.chartData.series[index] ) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(lineHighChartWidget.summaryData ) &&
        !ObjectUtils.isNullOrUndefined( lineHighChartWidget.summaryData[index] ) ;
    }

    function compareRangeIsPriorPeriod (comparePeriodType) {
      if (comparePeriodType === 'prior_period') {
        return true;
      } else {
        return false;
      }
    }

    function compareRangeIsPriorYear (comparePeriodType) {
      if (comparePeriodType === 'prior_year') {
        return true;
      } else {
        return false;
      }
    }

    function calculateDelta (current, compare) {
      return ((compare - current) / compare) * 100 * -1;
    }

    function loadTranslations () {
      $translate.use(lineHighChartWidget.language);
    }

    function setLegendLabel (comparisonIndex, comparisonType) {
      const compareRangeType = `compareRange${comparisonIndex}Type`;
      switch (comparisonType) {
        case 'priorPeriod':
          return hasData(comparisonIndex) && compareRangeIsPriorPeriod(lineHighChartWidget[compareRangeType]);
        case 'priorYear':
          return hasData(comparisonIndex) && compareRangeIsPriorYear(lineHighChartWidget[compareRangeType]);
        case 'custom':
          return hasData(comparisonIndex) && !compareRangeIsPriorPeriod(lineHighChartWidget[compareRangeType]) && !compareRangeIsPriorYear(lineHighChartWidget[compareRangeType]);
        default:
          return hasData(comparisonIndex) && compareRangeIsPriorPeriod(lineHighChartWidget[compareRangeType]);
      }
    }

    function toggleTableVisibility (){
      lineHighChartWidget.showTable.selection = !lineHighChartWidget.showTable.selection;
    }

    function transformDataForTable (currentPeriodData, comparePeriod1Data, comparePeriod2Data) {
      const tableData = [];
      const totalRow = {
        currentPeriod: 0,
        compare1: '-',
        compare2: '-'
      };

      _.each(lineHighChartWidget.chartData.labels, (label, index) => {
        const row = {
          hourSort: index,
          hour: label,
          currentPeriod: getPeriod(currentPeriodData, label),
          compare1: getPeriod(comparePeriod1Data, label),
          compare2: getPeriod(comparePeriod2Data, label)
        };

        if (_.isNumber(row.currentPeriod)) {
          totalRow.currentPeriod += row.currentPeriod;
        }

        if (_.isNumber(row.compare1)) {
          if (totalRow.compare1 === '-') {
            totalRow.compare1 = 0;
          }

          totalRow.compare1 += row.compare1;
        }

        if (_.isNumber(row.compare2)) {
          if (totalRow.compare2 === '-') {
            totalRow.compare2 = 0;
          }

          totalRow.compare2 += row.compare2;
        }

        tableData.push(row);
      });

      lineHighChartWidget.tableData = tableData;
      lineHighChartWidget.totalRow = totalRow;

      if (!ObjectUtils.isNullOrUndefined(lineHighChartWidget.sortInfo) && !ObjectUtils.isNullOrUndefinedOrBlank(lineHighChartWidget.sortInfo.currentSort)) {
        setInitialSort(lineHighChartWidget.sortInfo.currentSort, lineHighChartWidget.sortInfo.currentSortDirection);
      }
    }

    // ToDo: Remove this and use the getDataForHour instead
    function getPeriod (data, hour) {
      const dataForHour = _.find(data, (row) => {
        if (_.isUndefined(row)) {
          return;
        }

        return moment(row.period_start_date).format('h:mm A') === hour;
      });

      if (ObjectUtils.isNullOrUndefined(dataForHour)) {
        return '-';
      }

      return dataForHour.total_traffic;
    }

  /**
   * Gets the entry for the specified hour.
   *
   * @param {object} data - A response array from the API
   * @param {number} hour - The hour of data to retrieve. Can be between 0 and 23
   * @returns {object} The data for the hour requested. Returns undefined if the hour cannot be found
   */
    function getDataForHour (data, hour) {
      const dataForHour = _.filter(data, (row) => Number(moment(row.period_start_date).format('HH')) === hour);

      if (ObjectUtils.isNullOrUndefined(dataForHour[0])) {
        return;
      }

      const format = 'YYYY-MM-DDTHH:mm:ss';
      const momentDate = moment(dataForHour[0].period_start_date);

      const hourObject = {
        period_start_date: momentDate.format(format),
        period_end_date: momentDate.format(format),
        total_traffic: 0
      };

      _.each(dataForHour, (result) => {
        hourObject.total_traffic += result.total_traffic;
      });

      return hourObject;
    }

  /**
   * Sorts the hourly table
   *
   * @param {string} sortBy - The property name to sort by
   */
    function sortTable (sortBy) {
      lineHighChartWidget.tableData = _.sortBy(lineHighChartWidget.tableData, sortBy);

      if (lineHighChartWidget.currentSort === sortBy && lineHighChartWidget.currentSortDirection === 'asc') {
        lineHighChartWidget.tableData.reverse();
        lineHighChartWidget.currentSortDirection = 'desc';
      } else {
        lineHighChartWidget.currentSortDirection = 'asc';
      }
      lineHighChartWidget.currentSort = sortBy;

      if (ObjectUtils.isNullOrUndefined(lineHighChartWidget.sortInfo)) {
        lineHighChartWidget.sortInfo = {};
      }

      lineHighChartWidget.sortInfo.currentSort = lineHighChartWidget.currentSort;
      lineHighChartWidget.sortInfo.currentSortDirection = lineHighChartWidget.currentSortDirection;
    }

  /**
   * Sorts the hourly table during the initialisation sequence for the PDF
   *
   * @param {string} sortBy - The property name to sort by
   * @param {string} sortBy - The sortDirection
   */
    function setInitialSort (sortBy, sortDirection) {
      lineHighChartWidget.tableData = _.sortBy(lineHighChartWidget.tableData, sortBy);

      if (sortDirection === 'desc') {
        lineHighChartWidget.tableData.reverse();
      }

      lineHighChartWidget.currentSort = sortBy;
      lineHighChartWidget.currentSortDirection = sortDirection;

    }

  /**
   * Works out what the hour range shown to the users should be
   * Loops through all days in the current range to find the earliest hour and latest hour
   *
   * @param {object} currentPeriodData - A response array from the API
   * @returns {object} A object containing the min hour and max hour to display
   */
    function getHourRangeToDisplay (currentPeriodData) {
      const hourRangeToDisplay = { };

      const day = moment(lineHighChartWidget.dateRangeStart);
      const endDay = moment(lineHighChartWidget.dateRangeEnd);
      const dateFormatStringForComparison = 'DD-MM-YYYY';

      while (utils.getDaysBetweenDates(day, endDay) >= 0) {
        const dayString = day.format(dateFormatStringForComparison);

        const dataForDay = _.filter(currentPeriodData, (hourData) => {
          const date = moment(hourData.period_start_date);

          return date.format(dateFormatStringForComparison) === dayString;
        });

        if (ObjectUtils.isNullOrUndefinedOrEmpty(dataForDay)) {
          break;
        }

        const startHourForDay = getHour(dataForDay[0].period_start_date);
        const endHourForDay = getHour(dataForDay[dataForDay.length - 1].period_start_date);

        if (_.isUndefined(hourRangeToDisplay.start) || hourRangeToDisplay.start > startHourForDay) {
          hourRangeToDisplay.start = startHourForDay;
        }

        if (_.isUndefined(hourRangeToDisplay.end) || hourRangeToDisplay.end < endHourForDay) {
          hourRangeToDisplay.end = endHourForDay;
        }

        if (dataForDay.length === 24) {
            // We just covered a whole day, so no point continuing
          break;
        }

        day.add(1, 'days');
      }

      return hourRangeToDisplay;
    }

  /**
   * Redirects the user to the hourly page for the specified date.
   * Works out comparison dates based on the day view before redirecting.
   * This prevents unnecessary redirects and keeps the back button helpful
   *
   * @param {object} currentPeriodData - A response array from the API
   */
    function redirectToHourlyPage (currentDate) {
      const params = {
        dateRangeStart: currentDate,
        dateRangeEnd: currentDate
      };

      LocalizationService.getAllCalendars().then((calendars) => {
        calendars = calendars.result;

        const comparisonRanges = getDefaultComparisonDateRangeParams(params, lineHighChartWidget.currentUser, lineHighChartWidget.currentOrganization, calendars);
        
        angular.extend(params, comparisonRanges);

        $state.go('analytics.organization.site.hourly', params);
      });
    }

  /**
   * Sets the currency symbol
   * Requires the currentOrganization and the currentSite to be set. If not, the promise will be rejected
   * Only sets the currency symbol if it hasn't been passed into the directive
   * @returns {object} A promise
   */
    function setCurrencySymbol () {
      const deferred = $q.defer();
      try {
        currencyService.getCurrencySymbol(lineHighChartWidget.currentOrganization.organization_id, lineHighChartWidget.currentSite.site_id)
          .then((data) => {
            lineHighChartWidget.currencySymbol = data.currencySymbol;
            deferred.resolve();
          })
          .catch((error) => {
            deferred.reject(error);
          });
      } catch (error) {
        // This condition will be hit if one of the nested properties
        // passed to the currency service is not present
        deferred.reject(error);
      }
      return deferred.promise;
    }

    function isShoppersVSOthers () {
      return lineHighChartWidget.kpi === 'average_percent_shoppers';
    }
  }
})();
