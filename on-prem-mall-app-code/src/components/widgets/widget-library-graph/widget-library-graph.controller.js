(function () {
  'use strict';

  angular
    .module('shopperTrak')
    .controller('WidgetLibraryGraphController', WidgetLibraryGraphController);

  WidgetLibraryGraphController.$inject = [
    '$rootScope',
    '$scope',
    '$q',
    'ObjectUtils',
    'metricConstants',
    'widgetLibraryGraphFactory',
    'WidgetLibraryGraphRequestFactory',
    'widgetLibraryService',
    'dateRangeService',
    'LocalizationService',
    'metricNameService',
    'OrganizationResource'
  ];

  function WidgetLibraryGraphController(
    $rootScope,
    $scope,
    $q,
    ObjectUtils,
    metricConstants,
    widgetLibraryGraphFactory,
    WidgetLibraryGraphRequestFactory,
    widgetLibraryService,
    dateRangeService,
    LocalizationService,
    metricNameService,
    OrganizationResource
  ) {

    var vm = this;

    function activate() {
      initScope();
    }

    activate();

    function initScope() {
      vm.isPdf = $rootScope.pdf;
      vm.orgId = vm.selectedOrg.organization_id;
      vm.metricList = '';
      vm.watchUnbinds = [];

      getOrg(vm.selectedOrg.organization_id);

      if (vm.isPdf) {
        loadForPdfComplete();
      }
    }

    function getOrg(id) {
      OrganizationResource.get({ orgId: id }).$promise
        .then(getOrgSuccess)
        .catch(getOrgError);
    }

    function getOrgSuccess(response) {
      LocalizationService.setUser(vm.currentUser);
      LocalizationService.setOrganization(response);

      metricNameService.getMetricNames(response)
        .then(assignMetricNamesFromService)
        .catch(assignMetricNamesFromConstants);
    }

    function getOrgError(error) {
      console.error(error);
      LocalizationService.setUser(vm.currentUser);
      LocalizationService.setOrganization(vm.selectedOrg);
      assignMetricNamesFromConstants(error);
    }

    function assignMetricNamesFromService(data){
      vm.selectedOrg.metric_labels = [];
      _.each(data, function(metric){
        vm.selectedOrg.metric_labels[metric.kpi] = metric.displayName; //assigning the display name as the naming service has done translation/missing name work for us
      });
      vm.chartConfig = {};
      setLocalizationOptions();
      processMetrics();
    }

    function assignMetricNamesFromConstants(error){ //metric label has failed - get the translated, standard label instead, also avoids a situation where other orgs custom metric assigned
      console.error(error);
      vm.selectedOrg.metric_labels = [];
      _.each(metricConstants.metrics, function(metric){
        vm.selectedOrg.metric_labels[metric.kpi] = metric.translatedLabel;
      });
      vm.chartConfig = {};
      setLocalizationOptions();
      processMetrics();
    }

    function setLocalizationOptions() {
      vm.localizationOptions = {
        dateFormat: LocalizationService.getCurrentDateFormat(vm.selectedOrg),
        numberFormat: LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.selectedOrg)
      };
    }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      vm.renderReady = false;

      $scope.$watchGroup(['vm.isLoading', 'vm.renderReady'],
        function () {
          if (!vm.isLoading && vm.renderReady) {
            $rootScope.pdfExportsLoaded += 1;
          }
        });
    }

    /**
    * This sets up the widget object so it can be used in range service
    * to depict the date range and group.
    */
    function processMetrics() {
      // Sort in order of bar first and then line because
      // so the line is over the bar.
      transformMetrics();
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.metrics)) {
        return setKpiError(true);
      }

      vm.kpiError = false;
      vm.metrics = _.sortBy(vm.metrics, 'chartType');

      var period = vm.widgetConfig.overrideRange || vm.dateRangePeriod || 'week';
      vm.groupBy = checkGroupBy();
      vm.dateRanges = dateRangeService.getSelectedAndCompareRanges(period, vm.currentUser, vm.selectedOrg);
      vm.dateRange = vm.dateRange || vm.dateRanges.selectedPeriod;
      updateMetricDateRanges();
      updateWidget();
    }

    function updateMetricDateRanges() {
      _.each(vm.metrics, function (metric) {
        if (metric.timePeriod.periodInfo === 'selectedPeriod') {
          return metric.dateRange = vm.dateRanges.selectedPeriod;
        }

        if (metric.timePeriod.periodInfo.period_type === 'prior_period') {
          if (vm.currentUser.preferences.custom_period_1.period_type === 'prior_period') {
            return metric.dateRange = vm.dateRanges.comparePeriod1;
          }

          if (vm.currentUser.preferences.custom_period_2.period_type === 'prior_period') {
            return metric.dateRange = vm.dateRanges.comparePeriod2;
          }
        }

        if (metric.timePeriod.periodInfo.period_type === 'prior_year') {
          if (vm.currentUser.preferences.custom_period_1.period_type === 'prior_year') {
            return metric.dateRange = vm.dateRanges.comparePeriod1;
          }

          if (vm.currentUser.preferences.custom_period_2.period_type === 'prior_year') {
            return metric.dateRange = vm.dateRanges.comparePeriod2;
          }
        }
      });
    }
    /**
     * Checks that the group by selected is allowed against the date range that has been selected.
     */
    function checkGroupBy() {
      var group = vm.widgetConfig.xAxis.toLowerCase();
      var groupBy;

      switch (group) {
        case 'hour':// hour can have any dateRange
          groupBy = group;
          break;
        case 'day':// day's smallest day range
          groupBy = group;
          break;
        case 'week':
          if (ObjectUtils.isNullOrUndefined(vm.widgetConfig.overrideRange) || vm.widgetConfig.overrideRange === 'week' || vm.widgetConfig.overrideRange === 'wtd') {
            groupBy = 'day';
            break;
          }

          groupBy = group;
          break;
        case 'month':
          if (ObjectUtils.isNullOrUndefined(vm.widgetConfig.overrideRange) || vm.widgetConfig.overrideRange === 'week' || vm.widgetConfig.overrideRange === 'wtd') {
            groupBy = 'day';
            break;
          }

          if (vm.widgetConfig.overrideRange === 'month' || vm.widgetConfig.overrideRange === 'mtd') {
            groupBy = 'week';
            break;
          }

          groupBy = group;
          break;
        default:
          groupBy = 'day';
      };

      return groupBy;
    }

    /**
    *  Format a date to the user specified date format
    *  @param {object} date to be formated.
    *  @returns {string} return a date formated string
    */
    vm.dateFormat = function (date) {
      return moment(date).format(vm.localizationOptions.dateFormat);
    }

    /**
    * This calls the requests for the metrics in the bindings, filters the metrics
    * and makes requests based on the details of the metric.  The request are then
    * handled then renders the chart according to the response.
    */
    function updateWidget() {
      vm.isLoading = true;
      vm.dataReady = false;
      vm.requestFailed = false;
      vm.kpiError = false;
      vm.noData = false;

      fetchChartData();
    }

    /**
    * Check if there is any data in the series items.
    *  @param {object} series to checked.
    *  @returns {boolean} return result.
    */
    function checkAnySeriesWithData(series) {
      var result = _.find(series, function (item) {
        return !ObjectUtils.isNullOrUndefined(item) && !ObjectUtils.isNullOrUndefinedOrEmpty(item.data);
      });
      return !ObjectUtils.isNullOrUndefined(result) && !ObjectUtils.isNullOrUndefinedOrEmpty(result.data);
    }

    /**
    * Transform chart data based on responses of the api.
    *  @param {object} series to checked.
    *  @returns {object} return chart config object to render chart.
    */
    function transformChartData(responses) {
      try {
        vm.noData = ObjectUtils.isNullOrUndefinedOrEmpty(responses) ||
          ObjectUtils.isNullOrUndefinedOrEmpty(responses[0].result);
        if (!vm.noData) {
          var chartConfig = widgetLibraryGraphFactory.transformChartData(responses, vm.metrics, vm.currentUser, vm.orgId, vm.localizationOptions, vm.widgetConfig.xAxis, vm.dateRange, vm);
          vm.noData = !checkAnySeriesWithData(chartConfig.series);
          chartConfig = setPdfOptions(chartConfig);
          vm.dataReady = (!vm.noData && !ObjectUtils.isNullOrUndefined(chartConfig));

          if (vm.dataReady) {
            vm.chartConfig = chartConfig;
          }
        }

        vm.requestFailed = false;
      }
      catch (ex) {
        console.error(ex);
        vm.requestFailed = true;
        vm.noData = false;
      }
      vm.isLoading = false;
    }

    function setPdfOptions(chartConfig) {
      if (!vm.isPdf || vm.noData) {
        vm.renderReady = true;
        return chartConfig;
      }

      chartConfig.options.plotOptions.line = {
        animation: false,
        enableMouseTracking: false
      };
      chartConfig.options.plotOptions.series.dataLabels = false;
      chartConfig.options.tooltip.enabled = false;
      vm.renderReady = false;
      chartConfig.options.events = {
        load: vm.renderReady = true,
      }

      return chartConfig;
    }

    function setKpiError(isError) {
      vm.kpiError = isError;
      vm.isLoading = false;
      if (isError) {
        vm.renderReady = true;
      }
    }

    /**
    * Execute all the promise in an array for the request iterating through the metric list.
    *  @returns {object} returns all promise.
    */
    function fetchChartData() {
      $q.all(WidgetLibraryGraphRequestFactory.getChartRequests(vm.metrics, vm.orgId, vm.dateRange, vm.groupBy))
        .then(function (res, invalid) {
          transformChartData(res);
          if (!ObjectUtils.isNullOrUndefined(invalid)) {
            console.error(invalid);
          }
        })
        .catch(function (err) {
          if (err !== 'line highchart user cancelling') {
            vm.isLoading = false;
            vm.requestFailed = true;
            vm.renderReady = true;
          }
        });
    }

    function transformMetrics() {
      vm.metrics = [];
      _.each(vm.widgetConfig.yAxis, function (axis) {
        var metric = axis.selectedMetric.kpi;
        if (!ObjectUtils.isNullOrUndefinedOrBlank(metric) &&
          widgetLibraryService.isMetricAllowed(axis.selectedMetric.kpi, axis.selectedMetric, vm.selectedOrg)) { //check its not an empty metric
          var metricToAdd = angular.copy(axis.selectedMetric);
          metricToAdd.displayName = !_.isUndefined(vm.selectedOrg.metric_labels) && vm.selectedOrg.metric_labels[metricToAdd.kpi] !== '' ? vm.selectedOrg.metric_labels[metricToAdd.kpi] : metricToAdd.translatedLabel;
          metricToAdd.timePeriod = angular.copy(axis.selectedPeriod);
          metricToAdd.chartType = angular.copy(axis.chartType);
          vm.metrics.push(metricToAdd);
        }
      });
    }
  }
})();
