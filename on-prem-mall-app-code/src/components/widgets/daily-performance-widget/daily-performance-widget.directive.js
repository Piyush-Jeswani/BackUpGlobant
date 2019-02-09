(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('dailyPerformanceWidget', dailyPerformanceWidgetDirective);

  function dailyPerformanceWidgetDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/daily-performance-widget/daily-performance-widget.partial.html',
      scope: {
        dateRange: '=',
        compStores: '=?',
        compStoresRange: '=?',
        currentUser: '=',
        currentOrganization: '=?',
        orgId: '=?',
        currentSite: '=?',
        siteId: '=?',
        locationId: '=?',
        zoneId: '=?',
        onExportClick: '&',
        exportIsDisabled: '=?',
        showTable: '=?',
        selectedDays: '=?',
        selectedTags: '=?',
        customTags: '=?',
        orderBy: '=?',
        currentSort: '=?',
        currentSortDirection: '=?',
        hasSales: '=?',
        hasLabor: '=?',
        siteHasLabor: '=?',
        siteHasSales: '=?',
        hideExportIcon: '=?',
        salesCategories: '=?',
        isLoading: '=?',
        setSelectedWidget: '&',
        currencySymbol: '=?',
        operatingHours: '=',
        orgMetrics: '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: dailyPerformanceWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  dailyPerformanceWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$translate',
    '$filter',
    '$stateParams',
    '$q',
    '$timeout',
    'ObjectUtils',
    'LocalizationService',
    'apiUrl',
    'metricConstants',
    'dayOfWeekDataService',
    'OrganizationResource',
    'SiteResource',
    'metricsHelper',
    'currencyService',
    'SubscriptionsService',
    'currentSalesCategoryService',
    'CompParams'
  ];

  function dailyPerformanceWidgetController(
    $scope,
    $rootScope,
    $translate,
    $filter,
    $stateParams,
    $q,
    $timeout,
    ObjectUtils,
    LocalizationService,
    apiUrl,
    metricConstants,
    dayOfWeekDataService,
    OrganizationResource,
    SiteResource,
    metricsHelper,
    currencyService,
    SubscriptionsService,
    currentSalesCategoryService,
    CompParams
    ) {

    var vm = this;
    var unbindDaySelectorWatch;
    var dayOfWeekPrefix = '';
    var localMetricConstants;

    vm.chartDataLeft = {};
    vm.chartDataRight = {};
    vm.xAxisChartLabels = [];
    vm.loaded = false;
    vm.isLoading = true;
    vm.buildHighchartConfig = buildHighchartConfig;
    vm.orderBy = orderBy;
    vm.averageTranskey = '';
    vm.additionalTableCssClass = '';
    vm.fullMetrics = ['sales', 'traffic', 'labor_hours', 'transactions', 'conversion', 'star'];
    vm.graphColors = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];
    vm.chartType = vm.chartType || 'line';
    vm.hasError = false;
    vm.rightChartHeading = {};

    var metricApiLookup = buildMetricApiLookup();

    if (ObjectUtils.isNullOrUndefined(vm.showTable)) {
      vm.showTable = false;
    }

    if (!ObjectUtils.isNullOrUndefined(vm.siteHasLabor)) {
      vm.hasLabor = vm.siteHasLabor;
    }

    if (!ObjectUtils.isNullOrUndefined(vm.siteHasSales)) {
      vm.hasSales = vm.siteHasSales;
    }

    activate();

    function activate() {
      setMetricsConstants();
      setupLayout();

      if (vm.hasSales === false) {
        vm.showPermissionsMessage = true;
        vm.loaded = true;
        vm.isLoading = false;
        return;
      }

      vm.showPermissionsMessage = false;

      vm.isPdf = $rootScope.pdf;

      LocalizationService.setUser(vm.currentUser);

      // If currentOrganization is not provided, fetch organization settings using vm.orgId
      if (ObjectUtils.isNullOrUndefined(vm.currentOrganization) && !ObjectUtils.isNullOrUndefined(vm.orgId)) {
        var currentOrganization;
        currentOrganization = OrganizationResource.get({
          orgId: vm.orgId
        }).$promise;
        currentOrganization.then(function (result) {
          vm.currentOrganization = result;
          vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
          LocalizationService.setOrganization(vm.currentOrganization);
          if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
            setSalesCategoriesSelection();
          }
        });
      } else {
        vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);

        if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
          setSalesCategoriesSelection();
        }
      }

      if (ObjectUtils.isNullOrUndefined(vm.currentSite) && !ObjectUtils.isNullOrUndefined(vm.siteId)) {
        var currentSite;
        currentSite = SiteResource.get({
          orgId: vm.orgId,
          siteId: vm.siteId
        }).$promise;
        currentSite.then(function (result) {
          vm.currentSite = result;
        });
      }

      setCurrencySymbol().then(function () {
        getMetricDisplayInformation();
      });

      getNumberFormatInfo();
      setChartOptions();
      if(vm.isPdf){
        loadForPdfComplete();
      }
      setupWatch();
    }

    /**
     * Set Sales Category Pull Down Selection
     *
     */
    function setSalesCategoriesSelection() {

      var selectedSalesCategory = currentSalesCategoryService.readSelection('daily-performance-widget');

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory)) {
        vm.salesCategories = selectedSalesCategory;
      }
    }

  /**
   * Overwrites the metric constants with whatever has been passed in to the directive
   * This is used by the PDF and the custom dashboard and covers the case of users with
   * Access to multiple organizations
   */
  function setMetricsConstants() {
    localMetricConstants = angular.copy(metricConstants);
  }

    /**
    * Notifies the pdf controller when all widgets have rendered.
    * this function returns nothing but increases the $rootScope.pdfExportsLoaded number by 1.
    */
    function loadForPdfComplete() {
      vm.renderReady = false;
      vm.chartOptions.events = {
        load: vm.renderReady = true,
      }
      $scope.$watchGroup(['vm.isLoading', 'vm.renderReady'],
        function () {
          if (!vm.isLoading && vm.renderReady) {
            $rootScope.pdfExportsLoaded += 1;
          }
        }
      );
    }

    function getMetricDisplayInformation() {
      vm.metricDisplayInfo = [
        getMetricInfo('sales'),
        getMetricInfo('traffic'),
        getMetricInfo('labor'),
        getMetricInfo('transactions'),
        getMetricInfo('conversion'),
        getMetricInfo('star')
      ];

      if (!vm.hasLabor) {
        vm.metricDisplayInfo = _.filter(vm.metricDisplayInfo, function (metric) {
          if (_.contains(metric.requiredSubscriptions, 'labor')) {
            return false;
          }
          return true;
        });
      }

      if (vm.metricDisplayInfo) {
        _.each(vm.metricDisplayInfo, function (metric) {
          if (metric.isCurrency) {
            metric.prefixSymbol = vm.currencySymbol;
          }
        });
      }

      buildChartTitle('left');
      buildChartTitle('right');
    }

    function getMetricDisplayConfig(selectedMetric) {
      var metricObj = _.find(vm.metricDisplayInfo, function(metric) {
        return metric.value === selectedMetric;
      });

      return {suffixSymbol: metricObj.suffixSymbol, precision: metricObj.precision};
    }

    function buildChartTitle(direction) {
      var metricDisplayInfo = _.where(vm.metricDisplayInfo, { chartLocation: direction });

      var chartTitle = '';

      var metricTitles = _.pluck(metricDisplayInfo, 'displayName');

      _.each(metricTitles, function(metricTitle, index) {
        if (index > 0 && (index < metricTitles.length - 1)) {
          chartTitle += ',';
        }

        if (index === metricTitles.length - 1 && metricTitles.length > 1) {
          chartTitle += ' &';
        }

        if (index > 0) {
          chartTitle += ' ';
        }

        chartTitle += metricTitle;
      });

      vm[direction + 'ChartTitle'] = chartTitle;
    }

    function getMetricInfo(value) {
      var metricInfo = metricsHelper.getMetricInfo(value, metricApiLookup, localMetricConstants.metrics);
      if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.orgMetrics)) {
        var metric = _.findWhere(vm.orgMetrics, { value: metricInfo.value });
        if(!ObjectUtils.isNullOrUndefined(metric)){
          metricInfo.displayName = metric.displayName;
        }
      }
      metricInfo.apiPropertyName =  metricsHelper.getMetricApiProperty(metricInfo.shortTranslationLabel, metricApiLookup);
      metricInfo.chartLocation =  metricsHelper.getMetricChartLocation(metricInfo.shortTranslationLabel, metricApiLookup);

      if(metricInfo.label === 'Conversion' || metricInfo.label === 'STAR') {
        metricInfo.hidePercentColumn = true;
        vm.rightChartHeading[metricInfo.label.toLowerCase()] = metricInfo.displayName;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.currencySymbol) && metricInfo.isCurrency) {
        metricInfo.prefixSymbol = vm.currencySymbol;
      }

      return metricInfo;
    }

    function getNumberFormatInfo() {
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
    }

    function setChartOptions() {
      vm.chartOptions = {
        lineSmooth: false
      };

      vm.chartOptions = {
        lineSmooth: false,
        axisY: {
          offset: 40,
          labelInterpolationFnc: function (value) {
            return $filter('formatNumber')(value, 1, vm.numberFormatName);
          }
        },
        axisX: {
          showGrid: false,
          labelInterpolationFnc: function (value) {
            return value;
          }
        }
      };
    }

    function getPerformanceTableData(result) {
      vm.tableData = [];
      vm.averages = [];
      //just so ng-repeat can refresh :-D
      $timeout(function () {
        vm.tableData = result.tableData;
        vm.averages = result.averages;
        vm.hasData = hasTableData(vm.tableData);

        if (ObjectUtils.isNullOrUndefined(vm.currentSort)) {
          vm.currentSort = 'dayOfWeekIndex';
          vm.currentSortDirection = 'desc';
          orderBy(vm.currentSort);
        }

      });
    }


    function getContriDataForChart(contriChartData) {
      vm.chartDataLeft = contriChartData;
      vm.chartDataLeft.metricsWithData = getMetricDisplayNames(vm.chartDataLeft.metricsWithData);

      if (!ObjectUtils.isNullOrUndefined(vm.chartDataLeft)) {
        $timeout(function () {
          vm.chartLeftConfig = buildHighchartConfig(vm.chartDataLeft, 'single');
        });
      }
    }


    function gePerformanceChartData(chartData) {
      var chartSeries = _.map(chartData.series, function (series) {
        return _.filter(series, function (value) {
          return !_.isUndefined(value);
        });
      });

      chartData.series = chartSeries;
      removeTraffic(chartData);
      vm.chartDataRight = chartData;
      vm.chartDataRight.metricsWithData = getMetricDisplayNames(vm.chartDataRight.metricsWithData);

      if (!ObjectUtils.isNullOrUndefined(vm.chartDataRight)) {
        $timeout(function () {
          vm.chartRightConfig = buildHighchartConfig(vm.chartDataRight, 'multi');
        });
      }
    }

    function loadData() {
      vm.loaded = false;
      vm.isLoading = true;
      var promises = [];

      promises.push(getTableData());

      promises.push(getContributionDataForChart(['sales', 'traffic', 'labor_hours', 'transactions']));

      var metricsForRightChart = ['conversion', 'star'];

      if (isZoneLevel()) {
        // SA-1755 - The API needs at least one perimiter KPI when requesting data at the zone level
        // So we add traffic in here, but do not use it on the UI
        metricsForRightChart.push('traffic');
      }

      promises.push(getChartData(metricsForRightChart));

      $q.all(promises).then( (value) => {

        var result = value[0];
        var contriChartData = value[1];
        var chartData = value[2];

        getPerformanceTableData(result)
        getContriDataForChart(contriChartData)
        gePerformanceChartData(chartData)

        vm.loaded = true;
        vm.isLoading = false;
      }).catch(() => {
        vm.hasError = true;
        vm.loaded = true;
        vm.isLoading = false;
      });
    }

    function isZoneLevel() {
      return !ObjectUtils.isNullOrUndefined(vm.zoneId);
    }

    function removeTraffic(chartData) {
      var trafficIndex = _.findIndex(chartData.metricsWithData, function(metric) {
        return metric === 'traffic';
      });

      if(trafficIndex < 0) {
        return;
      }

      chartData.metricsWithData.splice(trafficIndex, 1);
      chartData.series.splice(trafficIndex, 1);

      return;
    }

    function hasTableData(data) {
      var fullMetrics = vm.fullMetrics;
      var hasData = false;

      if(ObjectUtils.isNullOrUndefined(data)) {
        return false;
      }

      for(var i = 0; i < data.length; i++) {
        var row = data[i];
        for(var j = 0; j < fullMetrics.length; j++) {
          var metric = fullMetrics[j];
          if(!ObjectUtils.isNullOrUndefined(row[metric])) {
            hasData = true;
          }
        }
      }

      return hasData;
    }

    function getTableData() {
      var request = getRequestObject(vm.fullMetrics);
      return dayOfWeekDataService.getMetricContributionDataForTable(request);
    }

    function getChartData(fullMetrics) {
      var request = getRequestObject(fullMetrics);
      return dayOfWeekDataService.getDataForChart(request);
    }

    function getRequestObject(fullMetrics) {
      const {
        currentOrganization,
        zoneId,
        salesCategories,
        selectedTags,
        customTags: customTagId,
        operatingHours,
        compStores: comp_site,
        compStoresRange
      } = vm;

      const dateRange = getDateRange();
      const params = {
        metrics: getMetricsWithPermission(fullMetrics),
        startDate: dateRange.start,
        endDate:  dateRange.end,
        organizationId: currentOrganization.organization_id,
        siteId: getSiteId(),
        zoneId,
        daysOfWeek: getChartLabels(),
        salesCategories,
        selectedTags,
        operatingHours,
        comp_site,
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {}),
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {})
      };

      return params;
    }

    function getMetricsWithPermission(fullMetrics) {
      var userPermissions = getUserPermissions();

      var metricsWithPermissions = [];

      _.each(fullMetrics, function (metric) {
        var metricValue = getMetricValueFromTrafficEndpointAlias(metric);

        var metricInfo = _.findWhere(localMetricConstants.metrics, { value: metricValue });

        var matchedPermissions = [];

        if(ObjectUtils.isNullOrUndefined(metricInfo)) {
          return metricsWithPermissions;
        }
        _.each(metricInfo.requiredSubscriptions, function (requiredPermission) {
          if (_.contains(userPermissions, requiredPermission)) {
            matchedPermissions.push(requiredPermission);
          }
        });

        if (matchedPermissions.length === metricInfo.requiredSubscriptions.length) {
          metricsWithPermissions.push(metric);
        }
      });

      return metricsWithPermissions;
    }

    function getUserPermissions() {
      var userPermissions = [];

      if (vm.hasLabor === true) {
        userPermissions.push('labor');
      }

      if (vm.hasSales === true) {
        userPermissions.push('sales');
      }

      return userPermissions;
    }

    function getMetricValueFromTrafficEndpointAlias(metric) {
      switch (metric) {
        case 'sales':
          return 'sales';
        case 'traffic':
          return 'traffic';
        case 'labor_hours':
          return 'labor';
        default:
          return metric;
      }
    }

    function getMetricDisplayNames(metrics){
      var metricDisplayNames = [];

      _.each(metrics, function (metric) {
        var fullMetricInfo = _.findWhere(localMetricConstants.metrics, { kpi: metric});
        metricDisplayNames.push(getMetricTitle(fullMetricInfo,fullMetricInfo.displayName));
      });

      return metricDisplayNames;
    }

    function getMetricTitle(kpi, displayName) {
      if(!_.isUndefined(vm.orgMetrics)) {
        var metric = _.findWhere(vm.orgMetrics, { value: kpi.value });
        if(!_.isUndefined(metric)) {
          return metric.displayName;
        }
      }
      return !ObjectUtils.isNullOrUndefinedOrBlank(kpi.title)? kpi.title: !ObjectUtils.isNullOrUndefinedOrBlank(displayName)? displayName: kpi.shortTranslationLabel;
    }

    function getContributionDataForChart(fullMetrics) {
      const {
        currentOrganization,
        zoneId,
        salesCategories,
        selectedTags,
        customTags: customTagId,
        operatingHours,
        compStores: comp_site,
        compStoresRange
      } = vm;

      const dateRange = getDateRange();

      const dataRequest = {
        metrics: getMetricsWithPermission(fullMetrics),
        startDate: dateRange.start,
        endDate: dateRange.end,
        organizationId: currentOrganization.organization_id,
        siteId: getSiteId(),
        selectedTags,
        zoneId,
        daysOfWeek: getChartLabels(),
        salesCategories,
        operatingHours,
        comp_site,
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {}),
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {})
      };

      return dayOfWeekDataService.getContributionDataForChart(dataRequest);
    }

    function setupWatch() {
      unbindDaySelectorWatch = $scope.$watchGroup([
        'vm.selectedDays',
        'vm.currentOrganization',
        'vm.currentSite',
        'vm.selectedTags',
        'vm.salesCategories',
        'vm.chartType',
        'vm.operatingHours',
        'vm.compStores'
      ], function() {

        if(ObjectUtils.isNullOrUndefined(vm.selectedDays) ||
          ObjectUtils.isNullOrUndefined(vm.currentOrganization) ||
          (ObjectUtils.isNullOrUndefined(vm.currentSite) && !ObjectUtils.isNullOrUndefined(vm.siteId))) {
          return;
        }

        // This prevents an initial double load
        if(orgHasSalesCategories(vm.currentOrganization) && ObjectUtils.isNullOrUndefinedOrEmpty(vm.salesCategories)) {
          return;
        }

        if (orgHasSalesCategories(vm.currentOrganization) && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.salesCategories)) {
          // Watch sales category pull down. When loaded or selection changed set
          // the current sales category service with the selected item in the pull down.
          currentSalesCategoryService.storeSelection('daily-performance-widget', vm.salesCategories);
        }

        loadData();
      });

      $scope.$on('$destroy', function () {
        if (typeof unbindDaySelectorWatch === 'function') {
          unbindDaySelectorWatch();
        }
      });
    }

    function orgHasSalesCategories(currentOrganization) {
      if (ObjectUtils.isNullOrUndefined(currentOrganization.portal_settings)) {
        return false;
      }

      if (ObjectUtils.isNullOrUndefinedOrEmpty(currentOrganization.portal_settings.sales_categories)) {
        return false;
      }

      // This is usually total only
      if (currentOrganization.portal_settings.sales_categories.length === 1) {
        return false;
      }

      return true;
    }

    function orderBy(metric) {
      var sortDirection = getSortDirection(metric);

      var ordered = _.sortBy(vm.tableData, function (row) {
        if (typeof row[metric] === 'number') {
          return row[metric];
        }

        return 0;
      });

      if (sortDirection === 'desc') {
        ordered = ordered.reverse();
      }

      vm.tableData = ordered;
      vm.currentSort = metric;
      vm.currentSortDirection = sortDirection;
    }

    function getSortDirection(metric) {
      if (vm.currentSort === metric) {
        if (vm.currentSortDirection === 'asc') {
          return 'desc';
        }
        if (vm.currentSortDirection === 'desc') {
          return 'asc';
        }
      }

      if (metric === 'dayOfWeekIndex') {
        return 'asc';
      }

      return 'desc';
    }

    function getChartLabels() {
      var orderedDays = vm.selectedDays.map(function (day) {
        return dayOfWeekPrefix + day.key;
      });

      return orderedDays;
    }

    function getSiteId() {
      if (ObjectUtils.isNullOrUndefined(vm.currentSite) && ObjectUtils.isNullOrUndefined(vm.siteId)) {
        return undefined;
      }

      if (!ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        return vm.currentSite.site_id;
      } else {
        return vm.siteId;
      }
    }

    function getDateRange() {
      return {
        start: vm.dateRange.start,
        end: vm.dateRange.end
      };
    }

    function buildMetricApiLookup() {
      return [
        { apiProperty: 'sales', transkey: 'kpis.shortKpiTitles.tenant_sales', chartLocation: 'left' },
        { apiProperty: 'traffic', transkey: 'kpis.shortKpiTitles.tenant_traffic', chartLocation: 'left' },
        { apiProperty: 'conversion', transkey: 'kpis.shortKpiTitles.tenant_conversion', chartLocation: 'right' },
        { apiProperty: 'star', transkey: 'kpis.shortKpiTitles.tenant_star', chartLocation: 'right' },
        { apiProperty: 'labor_hours', transkey: 'kpis.shortKpiTitles.tenant_labor', chartLocation: 'left' },
        { apiProperty: 'transactions', transkey: 'kpis.shortKpiTitles.tenant_transactions', chartLocation: 'left' }
      ];
    }

    function setupLayout() {
      if ($rootScope.pdf) {
        dayOfWeekPrefix = 'weekdaysShort.';
        vm.averageTranskey = 'common.AVG';
        vm.additionalTableCssClass = 'reduced-padding';
      } else {
        dayOfWeekPrefix = 'weekdaysLong.';
        vm.averageTranskey = 'common.AVERAGE';
      }
    }

    function setxAxisChartLabels(chartLabels) {
      vm.xAxisChartLabels = chartLabels;
    }

    function buildHighchartConfig(chartData, yAxisType) {

      if (!ObjectUtils.isNullOrUndefined(chartData)) {
        var xAxisTickAmount = 1;

        if (!ObjectUtils.isNullOrUndefined(chartData.labels)) {
          xAxisTickAmount = chartData.labels.length + 1;
        }

        // We have to set the xAxis labels since they change depending on user selected filters
        // this is for the formatter bug on the tooltips
        setxAxisChartLabels(chartData.labels);

        var yAxisData = constructHighChartYAxis(chartData, yAxisType);
        var seriesData = constructHighChartSeriesData(chartData, yAxisType);

        var chartConfig = {
          options: {
            credits: {
              enabled: false
            },
            chart: {
              type: vm.chartType, // 'line'|'column'
              height: 225,
              style: {
                fontFamily: '"Source Sans Pro", sans-serif'
              }
            },
            tooltip: {
              shared: true,
              useHTML: true,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: '#e5e5e5',
              shadow: false,
              style: {
                width: 'auto'
              },
              formatter: function() {
                var title = '<div class="tooltip-header">' + this.x + '</div>';

                var body = '';
                var pointsDisplayConfig = {};

                _.each(this.points, function (point) {

                  var precision = 1;
                  var suffixSymbol = '%';
                  var seriesName = point.series.name.toLowerCase();

                  if( (seriesName === 'star' || seriesName === 'conversion') && ObjectUtils.isNullOrUndefined(pointsDisplayConfig[seriesName]) ) {
                    pointsDisplayConfig[seriesName] = getMetricDisplayConfig(seriesName);
                  }

                  if (!ObjectUtils.isNullOrUndefined(pointsDisplayConfig[seriesName])) {
                    precision = pointsDisplayConfig[seriesName].precision;
                    suffixSymbol = pointsDisplayConfig[seriesName].suffixSymbol;
                  }

                  body += '<div class="row tooltip-option">';
                  body += '<div class="tooltip-name">' + point.series.name + '</div>';
                  body += '<div class="tooltip-value">' + $filter('formatNumber')(point.y, precision, vm.numberFormatName) + suffixSymbol + '</div>';
                  body += '</div>';
                });

                return title + body;
              }
            },
            exporting: {
              enabled: false
            },
            legend: {
              enabled: false
            }
          },
          title: {
            text: ''
          },
          xAxis: {
            categories: chartData.labels,
            crosshair: false,
            tickLength: 0,
            labels: {
              autoRotation: [-45],
              style: {
                color: '#929090'
              }
            },
            tickAmount: xAxisTickAmount
          },
          yAxis: yAxisData,
          series: seriesData
        };
      }

      if($rootScope.pdf) {
        chartConfig.options.plotOptions = {};
        chartConfig.options.plotOptions[vm.chartType === 'line' ? 'line' : 'column'] = {
          animation: false
        }
        chartConfig.options.plotOptions.series = {
          enableMouseTracking : false
        }
        chartConfig.options.tooltip = { enabled: false, animation: false};
        chartConfig.options.reflow = false;
      }

      return chartConfig;
    }

    function constructHighChartYAxis(chartData, yAxisType) {
      var yAxisData = [];
      var baseYAxisObject = {
        labels: {
          formatter: function () {
            return Math.round(this.value);
          }
        },
        title: {
          text: ''
        },
        allowDecimals: false,
        gridLineDashStyle: 'Dot',
        gridLineColor: '#b0b0b0',
        floor: 0,
        ceiling: 100
      };

      if (yAxisType === 'single') {
        var yAxisObject = angular.copy(baseYAxisObject);
        yAxisData.push(yAxisObject);
      } else {
        for(var index = 0; index < chartData.metricsWithData.length; index++) {
          var oppositeValue = false;

          if(index === 1) {
            oppositeValue = true;
          }

          var multiYAxisObjects = angular.copy(baseYAxisObject);
          multiYAxisObjects.labels = { style: { color: vm.graphColors[index] }};
          multiYAxisObjects.opposite = oppositeValue;
          yAxisData.push(multiYAxisObjects);
        }
      }

      return yAxisData;
    }

    function constructHighChartSeriesData(chartData, yAxisType) {
      var seriesData = [];

      _.each(chartData.series, function (data, index) {
        var yAxisValue;

        if (yAxisType === 'single') {
          yAxisValue = 0;
        } else {
          yAxisValue = index;
        }

        seriesData.push({
          name: chartData.metricsWithData[index],
          yAxis: yAxisValue,
          data: data,
          color: vm.graphColors[index],
          marker: {
            symbol: 'circle',
            radius: 3
          },
          states: {
            hover: {
              lineWidth: 2
            }
          }
        });
      });

      return seriesData;
    }

    function setCurrencySymbol() {
      var deferred = $q.defer();
      var hasCurrentOrganizationId = (!ObjectUtils.isNullOrUndefined(vm.currentOrganization) && !ObjectUtils.isNullOrUndefined((vm.currentOrganization.organization_id))) || !ObjectUtils.isNullOrUndefined(vm.orgId);
      var hasCurrentSiteId = (!ObjectUtils.isNullOrUndefined(vm.currentSite) && !ObjectUtils.isNullOrUndefined(vm.currentSite.site_id)) || !ObjectUtils.isNullOrUndefined(vm.siteId);
      var hasCurrencySymbol = !ObjectUtils.isNullOrUndefined(vm.currencySymbol);

      var orgId = vm.orgId || vm.currentOrganization.organization_id;
      var siteId = vm.siteId || (vm.currentSite && vm.currentSite.site_id ? vm.currentSite.site_id : null);

      if (hasCurrentOrganizationId && hasCurrentSiteId && !hasCurrencySymbol) {
        currencyService.getCurrencySymbol(orgId, siteId).then(function (data) {
          vm.currencySymbol = data.currencySymbol;
          deferred.resolve();
        });
      } else if (hasCurrentOrganizationId && !hasCurrencySymbol) {
        currencyService.getCurrencySymbol(orgId).then(function (data) {
          vm.currencySymbol = data.currencySymbol;
          deferred.resolve();
        });
      } else {
        deferred.resolve();
      }

      return deferred.promise;
    }
  }
})();
