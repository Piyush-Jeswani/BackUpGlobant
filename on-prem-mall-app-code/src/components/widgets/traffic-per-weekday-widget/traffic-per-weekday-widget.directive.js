(function () {

  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('trafficPerWeekdayWidget', trafficPerWeekdayWidget);

  function trafficPerWeekdayWidget() {
    return {
      restrict: 'EA',
      templateUrl: 'components/widgets/traffic-per-weekday-widget/traffic-per-weekday-widget.partial.html',
      transclude: true,
      scope: {
        // API/data settings
        isLoading: '=?',
        exists: '=?',
        requestFailed: '=?',
        data: '=?',
        kpi: '@',
        // Organization, site
        orgId: '=',
        siteId: '=',
        zoneId: '=?',
        entranceId: '=?',
        // Date settings
        dateRange: '=',
        compStores: '=?',
        compStoresRange: '=?',
        compareRange1: '=',
        compareRange1Type: '=?',
        compareRange2: '=',
        compareRange2Type: '=?',
        dateFormatMask: '=',
        operatingHours: '=',
        // For localization
        currentUser: '=',
        currentOrganization: '=?',
        currentSite: '=?',
        currentZone: '=?',
        firstDayOfWeekSetting: '=',
        language: '=',
        // Widget output settings
        widgetIcon: '@',
        onExportClick: '&',
        hideExportIcon: '=?',
        exportIsDisabled: '=?',
        isShown: '=?',
        selectedTags: '=?',
        customTags: '=?',
        selectedMetric: '=?',
        selectedDays: '=?',
        orderBy: '=?',
        showTable: '=?',
        orderReverse: '=?',
        currencySymbol: '=?',
        salesCategories: '=?',
        setSelectedWidget: '&',
        chartType: '=?',
        businessDayStartHour: '=?',
        orgMetrics: '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: trafficPerWeekdayWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  trafficPerWeekdayWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$filter',
    '$q',
    'LocalizationService',
    'dayOfWeekDataService',
    'trafficPerWeekdayWidgetMetrics',
    'metricConstants',
    'comparisonsHelper',
    'OrganizationResource',
    'ObjectUtils',
    'SiteResource',
    'ZoneResource',
    'MallCheckService',
    'currencyService',
    'dateRangeService',
    'SubscriptionsService',
    'currentSalesCategoryService',
    'CompParams'
  ];

  function trafficPerWeekdayWidgetController(
    $scope,
    $rootScope,
    $filter,
    $q,
    LocalizationService,
    dayOfWeekDataService,
    trafficPerWeekdayWidgetMetrics,
    metricConstants,
    comparisonsHelper,
    OrganizationResource,
    ObjectUtils,
    SiteResource,
    ZoneResource,
    MallCheckService,
    currencyService,
    dateRangeService,
    SubscriptionsService,
    currentSalesCategoryService,
    CompParams
  ) {
    var vm = this;
    var localMetricConstants;

    // This debounce prevents double renders
    var loadDataDebounced = _.debounce(loadData, 100);

    activate();

    function activate() {
      initScope();
      setMetricsConstants();
      configureWatches();

      vm.isPdf = $rootScope.pdf;

      if(vm.isPdf){
        loadForPdfComplete();
      }
      // User settings are required for localization settings
      LocalizationService.setUser(vm.currentUser);

      vm.isSingleDaySelected = dateRangeService.isSingleDaySelected(vm.dateRange.start, vm.dateRange.end);

      // If currentOrganization is not provided, fetch organization settings using vm.orgId
      if (typeof vm.currentOrganization === 'undefined' && typeof vm.orgId !== 'undefined') {
        var currentOrganization;
        currentOrganization = OrganizationResource.get({
          orgId: vm.orgId
        }).$promise;
        currentOrganization.then(function (result) {
          vm.currentOrganization = result;
          LocalizationService.setOrganization(vm.currentOrganization);
          getNumberFormatInfo();
        });
      }

      if (typeof vm.currentSite === 'undefined' && typeof vm.siteId !== 'undefined') {
        var currentSite;
        currentSite = SiteResource.get({
          orgId: vm.orgId,
          siteId: vm.siteId
        }).$promise;
        currentSite.then(function (result) {
          vm.currentSite = result;
        });
      }

      if (typeof vm.currentZone === 'undefined' && typeof vm.zoneId !== 'undefined') {
        var currentZone;
        currentZone = ZoneResource().get({
          orgId: vm.orgId,
          siteId: vm.siteId,
          zoneId: vm.zoneId
        }).$promise;
        currentZone.then(function (result) {
          vm.currentZone = result;
        });
      }

      getNumberFormatInfo();
      setCurrencySymbol();

      if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
        setSalesCategoriesSelection();
      }
    }

    /**
     * Set Sales Category Pull Down Selection and
     * watch the selection for changes.
     *
     */
    function setSalesCategoriesSelection() {

      var selectedSalesCategory = currentSalesCategoryService.readSelection('traffic-per-weekday-widget');

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory)) {
        vm.salesCategories = selectedSalesCategory;
      }
    }

    function initScope() {
      vm.isLoading = true;
      vm.exists = false;
      vm.requestFailed = false;

      if (typeof vm.selectedMetric === 'undefined') {
        vm.selectedMetric = 'traffic';
      }
      if (typeof vm.isShown === 'undefined') {
        vm.isShown = false;
      }

      vm.availableMetrics = [];
      vm.returnKeys = {};
      vm.metrics = trafficPerWeekdayWidgetMetrics.metrics;
      vm.tableData = [];
      if (ObjectUtils.isNullOrUndefined(vm.showTable)) {
        vm.showTable = false;
      }
  
      vm.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      vm.compareRangeIsPriorYear = compareRangeIsPriorYear;
      vm.orderTableBy = orderTableBy;
      vm.loadChartData = loadChartData;

      vm.graphColor = ['#9bc614', '#0aaaff', '#be64f0', '#ff5028', '#feac00', '#00abae', '#929090'];

      vm.chartType = vm.chartType || 'column';
      vm.chartOptions = {
        seriesBarDistance: 13,
        axisX: {
          showGrid: false
        },
        chartPadding: 20
      };
    }

    /**
     * Overwrites the metric constants with whatever has been passed in to the directive
     * This is used by the PDF and the custom dashboard and covers the case of users with
     * Access to multiple organizations
     */
    function setMetricsConstants() {
      localMetricConstants = angular.copy(metricConstants);
    }

    function configureWatches() {
      var watches = [];
      watches.push($scope.$watchGroup([
        'vm.currentOrganization',
        'vm.orgId',
        'vm.currentSite',
        'vm.currentZone',
        'vm.siteId',
        'vm.dateRange',
        'vm.compareRange1',
        'vm.compareRange2',
        'vm.selectedDays',
        'vm.selectedTags',
        'vm.salesCategories',
        'vm.chartType',
        'vm.compStores'
        ], loadDataDebounced));

      watches.push($scope.$watchCollection('vm.currentOrganization', loadOrganizationSettings));

      // Watch sales category pull down. When loaded or selection changed set
      // the current sales category service with the selected item in the pull down.
      watches.push($scope.$watchCollection('vm.salesCategories', handleWatchSalesCategories));

      $scope.$on('$destroy', function () {
        _.each(watches, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function handleWatchSalesCategories() {
      currentSalesCategoryService.storeSelection('traffic-per-weekday-widget', vm.salesCategories);
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

    function getNumberFormatInfo() {
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
    }

    function setCurrencySymbol() {
      if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.orgId) && !ObjectUtils.isNullOrUndefined(vm.siteId) && ObjectUtils.isNullOrUndefinedOrBlank(vm.currencySymbol)) {
        currencyService.getCurrencySymbol(vm.orgId, vm.siteId).then(function (data) {
          vm.currencySymbol = data.currencySymbol;
        });
      }
    }

    function loadOrganizationSettings() {
      if (typeof vm.currentOrganization !== 'undefined') {
        if (vm.numberFormatName === null) {
          vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(
            vm.currentUser,
            vm.currentOrganization
          );
        }

        loadDefaultMetrics();
        loadMetricsConfiguration();

        _.each(vm.metrics, function (metricData) {
          vm.returnKeys[metricData.value] = metricData.returnKey;
        });
      }
    }

    function loadDefaultMetrics() {
      var activeSubscriptions;
      var requiredSubscription;

      if (!ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        //site level
        activeSubscriptions = vm.currentSite.subscriptions;
      }

      if (ObjectUtils.isNullOrUndefined(activeSubscriptions)) {
        //org level access
        activeSubscriptions = vm.currentOrganization.subscriptions;
      }

      vm.availableMetrics = [];

      if(isMall() || isEntrance()) {
        //add only traffic data
        vm.availableMetrics.push('traffic');
        return;
      }

      vm.metrics.forEach(function (metric) {
        requiredSubscription = getMetricSubscriptions(metric.value);
        if (orgHasSubscription(activeSubscriptions, requiredSubscription)) {
          if (vm.availableMetrics.length < 5) {
            vm.availableMetrics.push(metric.returnKey);
          }
        }
      });
    }

    function isMall() {
      if (!ObjectUtils.isNullOrUndefined(vm.currentZone)) {
        //preference for tenantcommon zonetype
        return !MallCheckService.isNotMall(vm.currentSite, vm.currentZone);
      }

      return !MallCheckService.isNotMall(vm.currentOrganization)
    }

    function isEntrance() {
      return !ObjectUtils.isNullOrUndefined(vm.entranceId);
    }

    function orgHasSubscription(orgSubscriptions, requiredSubscriptions) {
      if (requiredSubscriptions.length === 0) {
        return true;
      } else {
        var hasRequiredSubscriptions = true;
        _.each(requiredSubscriptions, function (subscription) {
          if (orgSubscriptions[subscription] === false || typeof orgSubscriptions[subscription] === 'undefined') {
            hasRequiredSubscriptions = false;
          }
        });
        return hasRequiredSubscriptions;
      }
    }

    function getMetricSubscriptions(metric) {
      return _.findWhere(localMetricConstants.metrics, { value: metric }).requiredSubscriptions;
    }

    function getMetricPrefix(metricInfo) {
      var prefixSymbol;

      if(_.isUndefined(metricInfo)) {
        return '';
      }

      prefixSymbol = metricInfo.prefixSymbol;

      if (isMetricCurrency(metricInfo) && !ObjectUtils.isNullOrUndefinedOrBlank(vm.currencySymbol)) {
        prefixSymbol = vm.currencySymbol;
      }

      return prefixSymbol;
    }

    function getMetricSuffix(metricInfo) {
      if(_.isUndefined(metricInfo)) {
        return '';
      }

      return metricInfo.suffixSymbol;
    }

    function loadMetricsConfiguration() {
      vm.metricsConfiguration = {};
      _.each(vm.metrics, function (metric) {

        var fullMetricInfo = _.findWhere(localMetricConstants.metrics, { value: metric.value});

        vm.metricsConfiguration[metric.returnKey] = {
          precision: getMetricPrecision(fullMetricInfo),
          translationLabel: metric.value,
          displayName: getMetricTitle(fullMetricInfo, fullMetricInfo.displayName),
          prefixSymbol: getMetricPrefix(fullMetricInfo),
          suffixSymbol: getMetricSuffix(fullMetricInfo)
        };
      });
    }

    function getMetricTitle(metricInfo, displayName) {
      if(_.isUndefined(metricInfo)) {
        return displayName;
      }
      if(!_.isUndefined(vm.orgMetrics)) {
        var metric = _.findWhere(vm.orgMetrics, { value: metricInfo.value });
        if(!_.isUndefined(metric)) {
          return metric.displayName;
        }
      }
      return !ObjectUtils.isNullOrUndefinedOrBlank(metricInfo.title)? metricInfo.title: !ObjectUtils.isNullOrUndefinedOrBlank(displayName)? displayName: metricInfo.shortTranslationLabel;
    }

    function isMetricCurrency(metricInfo) {
      if(_.isUndefined(metricInfo)) {
        return false;
      }

      return metricInfo.isCurrency;
    }

    function getMetricPrecision(metricInfo) {
      if(_.isUndefined(metricInfo)) {
        return 0;
      }

      return metricInfo.precision;
    }

    function zoneNotLoadedIfNecessary() {
      return ObjectUtils.isNullOrUndefined(vm.currentZone) && !ObjectUtils.isNullOrUndefined(vm.zoneId);
    }

    function getOperatingHours(labels) {
      var businessDayStartHour = Number(vm.businessDayStartHour);

      if(ObjectUtils.isNullOrUndefined(businessDayStartHour) && !ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        businessDayStartHour = Number(vm.currentSite.business_day_start_hour);
      }

      if(ObjectUtils.isNullOrUndefined(businessDayStartHour)) {
        businessDayStartHour = 0;
      }

      if(ObjectUtils.isNullOrUndefined(labels)) {
        return;
      }

      return labels.slice(businessDayStartHour);
    }

    function loadData() {
      vm.isLoading = true;
      vm.requestFailed = false;

      if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedDays)) {
        if(vm.exists){
          vm.isLoading = false;
        }
        return true;
      }

      if(notAllDateRangesAreSet()) {
        return;
      }

      vm.isHourly = (vm.selectedDays[0].key === 'hours');

      if(vm.isSingleDaySelected && !vm.isHourly) {
        // Bad watch fire, exit
        return;
      }

      vm.orderReverse = true; // This actually makes sure the order is correct - check the order function below

      if (ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
        return true;
      }

      if(isSiteLevel() && ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        return;
      }

      if(zoneNotLoadedIfNecessary()) {
        return true;
      }

      loadDefaultMetrics();
      loadMetricsConfiguration();

      var weekdays = moment.weekdays();
      _.each(weekdays, function (weekday, key) {
        weekdays[key] = $filter('translate')('weekdaysLong.' + weekday.toLowerCase());
      });

      if (vm.firstDay === 1) {
        var last = weekdays.shift();
        weekdays.push(last);
      }

      var promises = [];

      // Load chart data

      var widgetDataDefered = $q.defer();
      promises.push(widgetDataDefered.promise);

      getChartData(vm.dateRange)
        .then(function (chartData) {
          chartData.labels = vm.operatingHours ? getOperatingHours(chartData.labels) : chartData.labels;
          chartData.series[0] = vm.operatingHours ? getOperatingHours(chartData.series[0]) : chartData.series[0];
          vm.widgetData = chartData;
          widgetDataDefered.resolve();
        })
        .catch(function(error) {
          reject(widgetDataDefered, error);
        });

      var compare1DataDefered = $q.defer();
      promises.push(compare1DataDefered.promise);

      getChartData(vm.compareRange1)
        .then(function (chartData) {
          vm.compareRange1data = chartData;
          compare1DataDefered.resolve();
        })
        .catch(function(error) {
          reject(compare1DataDefered, error);
        });

      var compare2DataDefered = $q.defer();
      promises.push(compare2DataDefered.promise);

      getChartData(vm.compareRange2)
        .then(function (chartData) {
          vm.compareRange2data = chartData;
          compare2DataDefered.resolve();
        })
        .catch(function(error) {
          reject(compare2DataDefered, error);
        });

      // Load table data

      var tableDataDefered = $q.defer();
      promises.push(tableDataDefered.promise);

      getTableData(vm.dateRange)
        .then(function (tableData) {
          vm.tableData = tableData.tableData;
          vm.averageTableData = tableData.averages;
          vm.hasData = hasTableData(vm.tableData);

          if(ObjectUtils.isNullOrUndefined(vm.orderBy)) {
            if(vm.isHourly) {
              vm.orderBy = 'hourOfDayIndex';
            } else {
              vm.orderBy = 'dayOfWeekIndex';
            }

            vm.orderTableBy(vm.orderBy);
          }

          tableDataDefered.resolve();
        })
        .catch(function(error) {
          reject(tableDataDefered, error);
        });

      var tableCompareDataDefered = $q.defer();
      promises.push(tableCompareDataDefered.promise);

      getTableData(vm.compareRange1)
        .then(function (tableData) {
          vm.tableCompareData = tableData.tableData;
          vm.averageCompareTableData = tableData.averages;
          tableCompareDataDefered.resolve();
        })
        .catch(function(error) {
          reject(tableCompareDataDefered, error);
        });

      $q.all(promises)
        .then(function () {
          if(vm.hasData) {
            combineChartData();
            combineTableData();
          }
          vm.isLoading = false;
          vm.requestFailed = false;
          vm.exists = true;
        })
        .catch(function(error) {
          console.error(error);
          vm.isLoading = false;
          vm.requestFailed = true;
        });
    }

  /** Determines if the widget is being used at site level
   *  Checks to see if the siteId or the currentSite have been set at the directive level
   *
   *  @returns {boolean}
   **/
    function isSiteLevel() {
      if(!ObjectUtils.isNullOrUndefined(vm.siteId)) {
        return true;
      }

      if(!ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        return true;
      }

      return false;
    }

    function reject(promise, error) {
      promise.reject(error);
    }

    function notAllDateRangesAreSet() {
      return dateRangeIsNotSet(vm.dateRange) || dateRangeIsNotSet(vm.compareRange1) || dateRangeIsNotSet(vm.compareRange2)
    }

    function dateRangeIsNotSet(dateRange) {
      return _.isUndefined(dateRange.start) || _.isUndefined(dateRange.end);
    }

    function hasTableData(data) {
      var fullMetrics = vm.availableMetrics;
      var hasData = false;

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

    function loadChartData(metric) {
      var promises = [];
      vm.isLoading = true;
      vm.selectedMetric = metric;

      var widgetDataDefered = $q.defer();
      promises.push(widgetDataDefered.promise);
      getChartData(vm.dateRange)
        .then(function (chartData) {
          vm.widgetData = chartData;
          widgetDataDefered.resolve();
        });

      var compare1DataDefered = $q.defer();
      promises.push(compare1DataDefered.promise);
      getChartData(vm.compareRange1)
        .then(function (chartData) {
          vm.compareRange1data = chartData;
          compare1DataDefered.resolve();
        });

      var compare2DataDefered = $q.defer();
      promises.push(compare2DataDefered.promise);
      getChartData(vm.compareRange2)
        .then(function (chartData) {
          vm.compareRange2data = chartData;
          compare2DataDefered.resolve();
        });

      $q.all(promises).then(function () {
        combineChartData();
        vm.isLoading = false;
      });
  }

    function getSeriesData(index, data) {
      var values = _.map(data, function(value) {
        if(_.isUndefined(value)) {
          value = null;
        }

        return value;
      });

      return {
        name: 'ser ' + index,
        color: vm.graphColor[index],
        data: values
      };
    }

    function combineChartData() {
      if(vm.isHourly) {
        if( ObjectUtils.isNullOrUndefined(vm.widgetData.series[0].data) ) {
          vm.widgetData.series[0] = getSeriesData(0, buildCompareSeriesForHourly(vm.widgetData));
        }
        vm.widgetData.series[1] = getSeriesData(1, buildCompareSeriesForHourly(vm.compareRange1data));
        vm.widgetData.series[2] = getSeriesData(2, buildCompareSeriesForHourly(vm.compareRange2data));
      } else {
        if( ObjectUtils.isNullOrUndefined(vm.widgetData.series[0].data) ) {
          vm.widgetData.series[0] = getSeriesData(0, vm.widgetData.series[0]);
        }
        vm.widgetData.series[1] = getSeriesData(1, vm.compareRange1data.series[0]);
        vm.widgetData.series[2] = getSeriesData(2, vm.compareRange2data.series[0]);
      }

      vm.chartData = {
        series: vm.widgetData.series,
        options: {
          chart: {
            type: vm.chartType,
            height: 320,
            animation: false,
            style: {
              fontFamily: '"Source Sans Pro", sans-serif'
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
              groupPadding: 0.35,
              animation: !$rootScope.pdf
            },
            column: {
              pointWidth: 8
            }
          },
          tooltip: {
            shared: true,
            useHTML: true,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#e5e5e5',
            shadow: false,
            padding: 10,
            pointFormat: '<strong>{point.name}</strong> <span>{point.value}</span>',
            formatter: toolTipFormatter,
            positioner: positionFormatter
          },
          exporting: {
            enabled: false
          },
          legend: {
            enabled: false
          }
        },
        yAxis: {
          title: {
            text: null
          },
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        xAxis: {
          crosshair: false,
          tickLength: 0,
          showLastLabel: true,
          endOnTick: true,
          labels: {
            align: 'center',
            style: {
              color: '#929090'
            },
            formatter: function() {
              return vm.widgetData.labels[this.value];
            }
          }
        },
        title: {
          text: ''
        }
      };

      if($rootScope.pdf) {
        vm.chartData.options.plotOptions = {};
        vm.chartData.options.plotOptions.column = {
          animation: false
        }
        vm.chartData.options.plotOptions.series = {
          enableMouseTracking : false
        }
        vm.chartData.options.tooltip = { enabled: false, animation: false};
        vm.chartData.options.reflow = false;
      }

    }

    /**
      * Returns the precision value for the currently selected metric.
      *
      * @returns {number} The precision (number of decimals)
    */
    function getMetricPrecisionNumber() {
      var precisionVal = 0;
      if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.selectedMetric)) {

        var fullMetricInfo = _.findWhere(localMetricConstants.metrics, { value: vm.selectedMetric });
        var precisionVal = getMetricPrecision(fullMetricInfo);

        return precisionVal;
      }
      return precisionVal;
    }

    function toolTipFormatter () {
      var label;
      var s = '';
      var i = 0;
      var formatNumber = $filter('formatNumber');
      var precisionValue = getMetricPrecisionNumber();
      s += '<table class="chart-tooltip-per-weekday">';

      $.each(this.points, function () {
        if(i === 0) {
          label = 'common.SELECTEDPERIOD';
        } else {
          label = getRangeLabel(i);
        }
        s += '<tr><td class="table-label">' + $filter('translate')(label) + '</td><td>'+ formatNumber(this.y, precisionValue, vm.numberFormatName) + '</td></tr>';
        i++;
      });

      s += '</table>';

      return s;
    }

    function positionFormatter(boxWidth, boxHeight, point) {
      return {x:point.plotX + 20,y:point.plotY};
    }

  /** Builds chart data for hourly data.
   *  This is necessary because different days can have different operating hours
   *  This function makes sure that the hours tie up
   *
   *  @param {object} user preferences
   **/
    function buildCompareSeriesForHourly(compareDataSeries) {
      var compareData = [];

      _.each(vm.widgetData.labels, function(hour) {
        var index = _.indexOf(compareDataSeries.labels, hour);

        if(index === -1) {
          compareData.push(undefined);
        } else {
          var dataForHour = compareDataSeries.series[0][index];
          compareData.push(dataForHour);
        }
      });

      return compareData;
    }

    function combineTableData() {
      // Calculate change percentages of the table metrics using vm.tableData and vm.tableCompareData
      _.each(vm.tableData, function (row) {
        var compareDay;
        if (!ObjectUtils.isNullOrUndefined(row.hourOfDay)) {
          compareDay = _.findWhere(vm.tableCompareData, { hourOfDay: row.hourOfDay });
        } else {
          compareDay = _.findWhere(vm.tableCompareData, { dayOfWeek: row.dayOfWeek });
        }

        _.each(vm.availableMetrics, function (metric) {
          if(!_.isUndefined(compareDay)) {
            // calculate change
            row[metric + '_change'] = comparisonsHelper.getComparisonData(row[metric], compareDay[metric]).percentageChange;
            row[metric + '_change_type'] = comparisonsHelper.getComparisonData(row[metric], compareDay[metric]).deltaColoringPeriod;
            row[metric + '_change_numeric'] = parseFloat(comparisonsHelper.getComparisonData(row[metric], compareDay[metric]).percentageChange);
          }

          if(ObjectUtils.isNullOrUndefined(row[metric])) {
            row[metric] = null;
          }
        });
      });

      _.each(vm.availableMetrics, function (metric) {
        vm.averageTableData[metric + '_change'] = comparisonsHelper.getComparisonData(vm.averageTableData[metric], vm.averageCompareTableData[metric]).percentageChange;
        vm.averageTableData[metric + '_change_type'] = comparisonsHelper.getComparisonData(vm.averageTableData[metric], vm.averageCompareTableData[metric]).deltaColoringPeriod;
        vm.averageTableData[metric + '_change_numeric'] = parseFloat(comparisonsHelper.getComparisonData(vm.averageTableData[metric], vm.averageCompareTableData[metric]).percentageChange);
      });
    }

    function getChartData(dates) {
      var dataRequest = buildRequestParams(dates);

      return dayOfWeekDataService.getDataForChart(dataRequest, vm.isHourly);
    }

    function getTableData(dates) {
     var dataRequest = buildRequestParams(dates, vm.isHourly);

      return dayOfWeekDataService.getMetricContributionDataForTable(dataRequest);
    }

    function buildRequestParams({start:startDate, end:endDate}, isHourly) {
      const {
        availableMetrics:metrics,
        orgId,
        currentOrganization,
        compStores: comp_site,
        compStoresRange,
        selectedTags,
        zoneId,
        salesCategories,
        operatingHours,
        selectedMetric,
        customTags: customTagId,
        entranceId:monitor_point_id
      } = vm;

      let hoursOfDay;
      if (isHourly) {
        var hours = [];
        var hourCount = 0;

        while (hourCount < 24) {
          hours.push(hourCount);
          hourCount++;
        }

        hoursOfDay = hours;
      }

      const requestParams = {
        metrics,
        startDate,
        endDate,
        organizationId: orgId || currentOrganization.organization_id,
        selectedTags,
        siteId: getSiteId(),
        zoneId,
        salesCategories,
        operatingHours,
        trafficOnly: isMall(),
        selectedMetric,
        comp_site,
        ...(!_.isUndefined(hoursOfDay) ? {hoursOfDay} : {daysOfWeek: getChartLabels()} ),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? {customTagId} : {}),
        ...(!_.isUndefined(monitor_point_id) ? {monitor_point_id} : {}),
        ...(comp_site === true ?  CompParams.getCompDates(compStoresRange) : {})
      };

      return requestParams;
    }

    function getChartLabels() {
      var dayOfWeekPrefix = 'weekdaysLong.';

      if (vm.selectedDays && !vm.isHourly) {
        var orderedDays = vm.selectedDays.map(function (day) {
          return dayOfWeekPrefix + day.key;
        });

        return orderedDays;
      }
    }

    function compareRangeIsPriorPeriod(comparePeriodType) {
      return comparePeriodType === 'prior_period';
    }

    function compareRangeIsPriorYear(comparePeriodType) {
      return comparePeriodType === 'prior_year';
    }

    function getSiteId() {
      if (ObjectUtils.isNullOrUndefined(vm.currentSite) && typeof vm.siteId === 'undefined') {
        return undefined;
      }

      if (typeof vm.siteId === 'undefined') {
        return vm.currentSite.site_id;
      } else {
        return vm.siteId;
      }
    }

    function orderTableBy(metric) {
      if (vm.orderBy === metric && vm.orderReverse) {
        vm.orderBy = metric;
        vm.orderReverse = false;
      } else {
        vm.orderBy = metric;
        vm.orderReverse = true;
      }
      vm.tableData = $filter('orderBy')(vm.tableData, vm.orderBy, vm.orderReverse);
    }

    function getRangeLabel(index) {
      var dateRangeType;

      if(index === 1) {
        dateRangeType = vm.compareRange1Type;
      } else if(index === 2) {
        dateRangeType = vm.compareRange2Type;
      }

      if(dateRangeType === 'prior_period') {
        return 'common.PRIORPERIOD';
      } else if(dateRangeType === 'prior_year') {
        return 'common.PRIORYEAR';
      } else {
        return 'common.CUSTOMCOMPARE' + index;
      }
    }
  }

})();
