(function () {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('retailStoreSummaryWidget', retailStoreSummaryWidgetDirective);

  function retailStoreSummaryWidgetDirective () {
    return {
      templateUrl: 'components/widgets/retail-store-summary-widget/retail-store-summary-widget.partial.html',
      scope: {
        orgId: '=',
        currentUser: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        compStores: '=?',
        compStoresRange: '=?',
        currentOrganization: '=',
        onExportClick: '&',
        exportIsDisabled: '=?',
        widgetTitle: '@',
        widgetIcon: '@',
        hideExportIcon: '=?',
        widgetData: '=?',
        orgSites: '=?',
        siteCategories: '=',
        selectedCategory: '=',
        selectedTags: '=',
        customTags: '=',
        filterText: '=',
        chartData: '=?',
        numberFormat: '=?',
        hasSales: '=?',
        hasInterior: '=?',
        hasLabor: '=?',
        includeExtremes: '=?',
        activeKpi: '=?',
        salesCategories: '=?',
        categories: '=?',
        isLoading: '=?',
        setSelectedWidget: '&',
        chartType: '=?',
        requestFailed: '=?',
        operatingHours: '=?',
        selectedSites: '=?', // An Array of siteIds. The open tooltips
        orgMetrics: '=?', // This is passed in on the custom dashboard, and the PDF
        mid: '=?',        // This is passed in on the custom dashboard
        dashIndex: '=?'   // this give the highcharts container a unique ID on custom dash (where there may be more than 1)
      },
      controller: retailStoreSummaryWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  retailStoreSummaryWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$timeout',
    '$q',
    '$filter',
    '$compile',
    'LocalizationService',
    'SubscriptionsService',
    'SiteResource',
    'ObjectUtils',
    'retailOrganizationSummaryData',
    'retailStoreSummaryWidgetConstants',
    'metricConstants',
    'OrganizationResource',
    'maxSitesToCache',
    'currencyService',
    'currentSalesCategoryService',
    'CompParams'
  ];

  function retailStoreSummaryWidgetController (
    $scope,
    $rootScope,
    $timeout,
    $q,
    $filter,
    $compile,
    LocalizationService,
    SubscriptionsService,
    SiteResource,
    ObjectUtils,
    retailOrganizationSummaryData,
    constants,
    metricConstants,
    OrganizationResource,
    maxSitesToCache,
    currencyService,
    currentSalesCategoryService,
    CompParams
  ) {
    const vm = this;
    let localMetricConstants;
    let exportClickFlag;
    // This holds onto tooltips that are made sticky on the UI
    let clonedTooltips = [];
    let lastClosedTooltipSiteId; // The siteId of the most recently closed tooltip

    vm.hasData = hasData;
    vm.changeKpi = changeKpi;
    vm.toggleExtremes = toggleExtremes;
    vm.getSiteNameById = getSiteNameById;
    vm.transformData = transformData;
    vm.countTotals = countTotals;
    vm.renderWidget = renderWidget;
    vm.calculateAverages = calculateAverages;
    vm.filterCategory = filterCategory;
    vm.closeTooltip = closeTooltip;
    vm.closeAllTooltips = closeAllTooltips;
    vm.tooltipsReady = false;
    vm.chartType = vm.chartType || 'column';
    vm.timesRun = 0;
    vm.optimalViewMessage = false;
    vm.onExportVerifyClick = onExportVerifyClick;

    vm.selectedMetrics = vm.selectedMetrics || [];
    vm.filter = vm.filter || {};
    vm.siteCategories = vm.siteCategories || {};
    if (_.isUndefined(vm.selectedCategory)) vm.selectedCategory = '';
    if (_.isUndefined(vm.includeExtremes)) vm.includeExtremes = false;
    vm.extremeToggle = { checkbox: vm.includeExtremes };
    vm.categories = vm.categories || ObjectUtils.getNestedProperty(vm, 'currentOrganization.portal_settings.sales_categories');

    const chartConfig = constants.defaults;
    let unbindWidgetDataWatch;
    let unbindFilterTextWatch;
    let unbindFilterText;
    let unbindSelectedCategory;
    let unbindSalesCategories;
    let filterTextTimeout;

    activate();

    function activate () {
      setMetricsConstants();

      if (ObjectUtils.isNullOrUndefined(vm.activeKpi)) {
        vm.activeKpi = 'conversion';
        vm.activeKpiDisplayName = _.findWhere(localMetricConstants.metrics, { kpi: vm.activeKpi }).displayName;
      }

      if (ObjectUtils.isNullOrUndefined(vm.activeKpiDisplayName)) {
        // on CD this can be blank even though vm.activeKpi may not be
        vm.activeKpiDisplayName = _.findWhere(localMetricConstants.metrics, { kpi: vm.activeKpi }).displayName;
      }

      currencyService.getCurrencySymbol(vm.orgId).then(data => {
        vm.currencySymbol = data.currencySymbol;
        if (ObjectUtils.isNullOrUndefined(vm.selectedSites)) {
          vm.selectedSites = [];
        }

        if (ObjectUtils.isNullOrUndefined(vm.orgSites)) {
          loadOrgSites();
        } else {
          vm.checkCache = vm.orgSites.length < maxSitesToCache;
          configureWatches();
          loadOrgSettings();
        }
      });

      if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
        setSalesCategoriesSelection();
      }
    }


    $scope.$on('exportHeaderClick', function (event, exportClicked) {
      exportClickFlag = exportClicked ? true : false;
    })

    /**
     * Set Sales Category Pull Down Selection
     *
     */
    function setSalesCategoriesSelection () {

      const selectedSalesCategory = currentSalesCategoryService.readSelection('retail-store-summary-widget');

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory)) {
        vm.salesCategories = selectedSalesCategory;
      }
    }

    /**
     * Overwrites the metric constants with whatever has been passed in to the directive
     * This is used by the PDF and the custom dashboard and covers the case of users with
     * Access to multiple organizations
     */
    function setMetricsConstants () {
      localMetricConstants = angular.copy(metricConstants);

      if (!_.isUndefined(vm.orgMetrics)) {
        localMetricConstants.metrics = vm.orgMetrics;
      }
    }

    function loadOrgSites () {
      vm.isLoading = true;

      SiteResource.query({ orgId: vm.orgId }).$promise.then(sites => {
        vm.orgSites = sites;
        vm.checkCache = ObjectUtils.isNullOrUndefined(vm.orgSites) || vm.orgSites.length < maxSitesToCache;
        configureWatches();
        loadOrgSettings();
      });
    }

    function configureWatches () {
      unbindWidgetDataWatch = $scope.$watchCollection('vm.widgetData', watchData);

      unbindFilterText = $scope.$watch('vm.filterText', () => {
        vm.filter.text = angular.copy(vm.filterText) || '';
      });

      unbindSelectedCategory = $scope.$watch('vm.selectedCategory', renderWidget);

      if (ObjectUtils.isNullOrUndefined(vm.widgetData)) {
        unbindSalesCategories = $scope.$watch('vm.salesCategories', (newVal, oldVal) => {
          if (angular.equals(newVal, oldVal)) {
            // This prevents a double load for MCR orgs
            return;
          }

          getAllKpiData();

          // Watch sales category pull down. When loaded or selection changed set
          // the current sales category service with the selected item in the pull down.
          currentSalesCategoryService.storeSelection('retail-store-summary-widget', vm.salesCategories);
        });
      }

      unbindFilterTextWatch = $scope.$watch('vm.filter.text', val => {
        renderWidget();
        filter(val);
      });

      $scope.$on('$destroy', () => {
        if (typeof unbindFilterTextWatch === 'function') {
          unbindFilterTextWatch();
        }

        if (typeof unbindWidgetDataWatch === 'function') {
          unbindWidgetDataWatch();
        }

        if (typeof unbindWidgetDataWatch === 'function') {
          unbindWidgetDataWatch();
        }

        if (typeof unbindFilterText === 'function') {
          unbindFilterText();
        }

        if (typeof unbindSelectedCategory === 'function') {
          unbindSelectedCategory();
        }

        if (typeof unbindSalesCategories === 'function') {
          unbindSalesCategories();
        }

        _.each(clonedTooltips, tooltip => {
          tooltip.cloneToolTip.remove();
          tooltip.cloneToolTipContent.remove();
        });
      });
    }

    function filter (val) {
      if (filterTextTimeout) {
        $timeout.cancel(filterTextTimeout);
      }

      const tempFilterText = val;
      filterTextTimeout = $timeout(() => {
        if (!ObjectUtils.isNullOrUndefined(vm.filter.text) && vm.filter.text.length > 2) {
          vm.filter.text = tempFilterText;
          vm.filterText = tempFilterText;
        } else {
          vm.filterText = tempFilterText;
          vm.currentDisplayUpTo = 25;
        }
      }, 250);
    }

    //ToDo: Add a meaningful unit test for this
    function loadOrgSettings () {
      OrganizationResource.get({ orgId: vm.orgId }).$promise.then(org => {
        vm.currentOrg = org;

        const metricsNotShownOnWidget = [
          'upt',
          'traffic (pct)',
          'labor',
          'gsh',
          'opportunity',
          'abandonment_rate',
          'draw_rate',
          'traffic_per_site',
          'sales_per_site',
          'dwelltime',
          'average_traffic',
          'average_percent_shoppers',
          'average_sales'
        ];

        vm.metrics = localMetricConstants.metrics.filter(metric => !_.contains(metricsNotShownOnWidget, metric.value)
          && SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, vm.currentOrg)
        );

        // Used to display the metric selector
        vm.availableMetrics = {
          conversionDisplayName: _.findWhere(vm.metrics, { kpi: 'conversion' }).displayName,
          salesDisplayName: _.findWhere(vm.metrics, { kpi: 'sales' }).displayName
        };

        vm.numberFormat = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrg);
      });
    }

    $scope.$watchCollection('orgSites', () => {
      if (ObjectUtils.isNullOrUndefined(vm.widgetData)) {
        vm.isLoading = true;
        vm.widgetData = {};
        getAllKpiData();
      }
    });

    function watchData (newVal) {
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(newVal)) {
        return;
      }

      $timeout(() => {
        const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd);
        vm.rangeData = vm.widgetData[dateRangeKey];
        /* for few orgs, this method being called before the success of api request,
         hence getting no data available message for few seconds initially. below check fixes the issue */
        if (!retailOrganizationSummaryData.getRequestCompletedFlag()) {
          return;
        }
        if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.rangeData) || vm.rangeData.length === 0) {
          vm.isLoading = false;
          vm.requestFailed = false;
          return;
        }
        renderWidget();
        vm.isLoading = false;
        vm.requestFailed = false;
      });

    }

    function addMetricPopUpRow (point) {
      let rows = '';
      const sortedMetrics = _.sortBy(vm.metrics, 'order');

      sortedMetrics.forEach(metric => {
        let metricValue = metric.value === 'traffic' ? point.x : point.kpis[metric.value];
        metricValue = metric.prefixSymbol + getFormattedValue(metricValue, metric) + metric.suffixSymbol;
        rows += `<tr><th>${metric.displayName}: </th><td>${metricValue}</td></tr>`;
      });

      return rows;
    }

    function getFormattedValue (value, metric) {
      return $filter('formatNumber')(value, metric.precision, vm.numberFormat);
    }

    function closeAllTooltips () {
      if(exportClickFlag){
        return
      }
      _.each(clonedTooltips, tooltip => {
        tooltip.cloneToolTip.detach();
        tooltip.cloneToolTipContent.detach();
      });

      clonedTooltips = [];
      vm.selectedSites = [];
    }

    function closeTooltip (siteId) {
      const tooltip = _.findWhere(clonedTooltips, { siteId });

      if (_.isUndefined(tooltip)) {
        return;
      }

      tooltip.cloneToolTip.detach();
      tooltip.cloneToolTipContent.detach();

      clonedTooltips = _.without(clonedTooltips, _.findWhere(clonedTooltips, {
        siteId
      }));

      vm.selectedSites = _.without(vm.selectedSites, siteId);

      lastClosedTooltipSiteId = siteId;
    }

    function getToolTipHtmlFormat (point) {
      if (isTooltipOpen(point.site_id)) {
        return false;
      }

      if (tooltipWasJustClosed(point.site_id)) {
        // This prevents the popup from showing immediately after it was closed
        lastClosedTooltipSiteId = undefined;
        return false;
      }

      if (pointIsBehindOpenTooltip(point)) {
        return false;
      }

      const sref = `ui-sref="analytics.organization.site({orgId: ${vm.orgId.toString()}, siteId: ${point.site_id.toString()}, locationId: null })"`;

      const siteLink = `<h3><a ${sref} href="#/${vm.orgId.toString()}/${point.site_id.toString()}">${point.name}</a></h3>`;

      const closeIcon = '<span class="sticon sticon-delete-small" aria-hidden="true"></span>';

      const closeButton = `<a class="btn btn-default close-button hidden-button" ng-click="vm.closeTooltip(${point.site_id.toString()})">${closeIcon}</a>`;

      const topBar = `<div class="heading">${siteLink}${closeButton}</div>`;

      let tooltip = `<div class="retail-summary-tooltip" id="site_${point.site_id.toString()}">${topBar}`;

      tooltip += `<div class="body"><table>${addMetricPopUpRow(point)}</table></div></div>`;

      return tooltip;
    }

    function renderWidget () {
      if (!$rootScope.pdf && ObjectUtils.isNullOrUndefined(vm.orgSites)) {
        return;
      }

      vm.chartData = [];
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd);

      if (!ObjectUtils.isNullOrUndefined(vm.rangeData) && vm.rangeData.length > 0) {
        const min = {};
        let mid = {};
        const max = {};

        const chartData = transformData(vm.widgetData[dateRangeKey]);
        const total = countTotals(chartData);
        const avg = calculateAverages(chartData, total);
        vm.avg = avg;

        chartConfig.options.tooltip = {
          headerFormat: '',
          useHTML: true
        };

        chartConfig.options.tooltip.formatter = function () {
          return getToolTipHtmlFormat(this.point);
        };

        chartConfig.options.tooltip.padding = 0;

        chartConfig.yAxis.title.text = $filter('translate')(`kpis.kpiTitle.${vm.activeKpi}`);
        chartConfig.xAxis.title.text = $filter('translate')('retailOrganization.DAILYTRAFFIC');

        max.x = Math.max(...chartData.map(o => o.x));
        min.x = Math.min(...chartData.map(o => o.x));
        max.y = Math.max(...chartData.map(o => o.y));
        min.y = Math.min(...chartData.map(o => o.y));

        min.x *= 0.90;
        max.x *= 1.10;
        min.y *= 0.90;
        max.y *= 1.10;

        if (avg.x - min.x < max.x - avg.x) {
          min.x = avg.x - (max.x - avg.x);
        } else {
          max.x = avg.x + (avg.x - min.x);
        }

        if (avg.y - min.y < max.y - avg.y) {
          min.y = avg.y - (max.y - avg.y);
        } else {
          max.y = avg.y + (avg.y - min.y);
        }

        mid = getMidValues(min, max);
        vm.mid = mid;

        if ((max.y - mid.y) > (mid.y - 0)) {
          min.y = mid.y - (max.y - mid.y);
        } else {
          min.y = 0;
          max.y = mid.y + mid.y;
        }

        if ((max.x - mid.x) > (mid.x - 0)) {
          min.x = mid.x - (max.x - mid.x);
        } else {
          min.x = 0;
          max.x = mid.x + mid.x;
        }

        chartConfig.options.yAxis.tickPositions = [min.y, mid.y, max.y];
        chartConfig.options.yAxis.plotLines.value = mid.y;

        chartConfig.options.xAxis.tickPositions = [min.x, mid.x, max.x];
        chartConfig.options.xAxis.plotLines.value = mid.x;

        chartConfig.options.plotOptions = {
          marker: {
            symbol: 'circle'
          }
        };

        chartConfig.options.yAxis.plotBands = [{
          from: min.y,
          to: mid.y,
          label: {
            text: $filter('translate')('retailOrganization.POORPERFORMERS'),
            align: 'left',
            verticalAlign: 'bottom',
            x: 10,
            y: -10,
            style: {
              color: '#929090',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro',
            }
          }
        },
        {
          from: min.y,
          to: mid.y,
          label: {
            text: $filter('translate')('retailOrganization.INSTOREOPPORUNITY'),
            align: 'right',
            verticalAlign: 'bottom',
            x: -10,
            y: -10,
            style: {
              color: '#929090',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro',
              margin: '10px'
            }
          }
        },
        {
          from: mid.y,
          to: max.y,
          label: {
            text: $filter('translate')('retailOrganization.OUTOFSTOREOPPORTUNITY'),
            align: 'left',
            verticalAlign: 'top',
            x: 10,
            y: 20,
            style: {
              color: '#929090',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro',
              margin: '10px'
            }
          }
        },
        {
          from: mid.y,
          to: max.y,
          label: {
            text: $filter('translate')('retailOrganization.HIGHPERFORMERS'),
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 20,
            style: {
              color: '#929090',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontFamily: 'Source Sans Pro',
              margin: '10px',
            }
          }
        }];
        let filteredData = angular.copy(chartData);
        filteredData = $filter('filter')(filteredData, { 'name': vm.filter.text });

        vm.siteCategories = categorizeSites(vm.allSites);

        // narrow down to only those sites within the selected category
        if (vm.selectedCategory !== '') {
          filteredData = _.filter(filteredData, site => vm.siteCategories[site.site_id] === vm.selectedCategory);
        }

        chartConfig.series = [{
          name: 'Performance',
          type: 'scatter',
          data: filteredData,
          dataGrouping: {
            enabled: true
          },
          turboThreshold: 10000,
          enableMouseTracking: true,
          tooltip: {
            followPointer: false
          },
          marker: {
            symbol: 'circle'
          },
          point: {
            events: {
              click (clickEvent) {
                const currentChart = getChartInstance();

                if (ObjectUtils.isNullOrUndefined(currentChart) || ObjectUtils.isNullOrUndefined(currentChart.container)) {
                  return;
                }

                const clickedTooltip = { x: this.series.chart.tooltip.now.x, y: this.series.chart.tooltip.now.y };

                const siteId = clickEvent.point.site_id;

                if (isTooltipOpen(siteId)) {
                  closeTooltip(siteId);
                  return;
                }

                const tooltip = {
                  coordinates: clickedTooltip,
                  siteId: clickEvent.point.site_id
                };

                tooltip.cloneToolTip = angular.element(this.series.chart.tooltip.label.element.cloneNode(true));
                tooltip.cloneToolTip.addClass('fixed');

                if (!$rootScope.pdf) {
                  tooltip.cloneToolTip.find('div.heading').find('a').removeClass('hidden-button');
                }

                angular.element(currentChart.container.firstChild).append(tooltip.cloneToolTip);

                // Clone the tooltip content
                const siteIdSelector = `#site_${tooltip.siteId.toString()}`;
                const toolTipContent = angular.element(siteIdSelector).closest('div.highcharts-tooltip');
                tooltip.cloneToolTipContent = toolTipContent.clone(true);
                tooltip.cloneToolTipContent.addClass('fixed');

                if (!$rootScope.pdf) {
                  tooltip.cloneToolTipContent.find('div.heading').find('a').removeClass('hidden-button');
                }

                angular.element(currentChart.container).append(tooltip.cloneToolTipContent);
                $compile(tooltip.cloneToolTipContent)($scope);

                try {
                  if (!ObjectUtils.isNullOrUndefinedOrEmpty(tooltip.cloneToolTipContent[0])) {
                    const el = angular.element(tooltip.cloneToolTipContent[0].firstChild);
                    tooltip.width = el.width();
                    tooltip.height = el.height();
                  }
                } catch (error) {
                  console.error(error);
                }

                clonedTooltips.push(tooltip);

                if (!_.contains(vm.selectedSites, tooltip.siteId)) {
                  vm.selectedSites.push(tooltip.siteId);
                }

                selectedSitesCountFlag(vm.selectedSites);

                // Mark chart-container for CSS styling
                angular.element(currentChart.container).addClass('has-fixed-popup');

                if (!_.isUndefined(currentChart)) {
                  currentChart.tooltip.hide();
                }
              }
            }
          }
        }];

        chartConfig.xAxis.min = min.x;
        chartConfig.xAxis.max = max.x;
        chartConfig.yAxis.min = min.y;
        chartConfig.yAxis.max = max.y;

        if ($rootScope.pdf) {
          vm.renderReady = false;
          chartConfig.options.plotOptions.series = {
            animation: false
          };
          chartConfig.options.events = {
            load: vm.renderReady = true,
          };
          const renderUnbind = $scope.$watchGroup(['vm.isLoading', 'vm.renderReady', 'vm.tooltipsReady'],
            () => {
              if (!vm.isLoading && vm.renderReady && vm.timesRun < 1 && vm.tooltipsReady) {
                vm.timesRun += 1; //stops this function runing more than once, otherwise the PDF renders before other widgets are ready
                $rootScope.pdfExportsLoaded += 1;
                renderUnbind();
              }
            }
          );
        }

        vm.chartData = filteredData;
        vm.chartConfig = angular.copy(chartConfig);
        $timeout(() => {
          openSelectedSites();
        });
        vm.isLoading = false;
      }
    }

    /**
    * Checks the number of sites clicked on the widget
    * and accordingly help to display flag message on exceed 
    * of site count more than 3 for optimal view experience. 
    */
    function selectedSitesCountFlag (sitesCount) {
      if ($rootScope.pdf) {
        return;
      }

      if (ObjectUtils.isNullOrUndefinedOrEmpty(sitesCount)) {
        vm.optimalViewMessage = false;
        return;
      }

      if (sitesCount.length > 3) {
        vm.optimalViewMessage = true;
        $timeout(() => {
          vm.optimalViewMessage = false;
        }, 20000);
      }
    }

    /**
    * onExportClick verify first to show the message on the widget for
    * optimal view or not than proceed with export functinality.   
    */
    function onExportVerifyClick () {
      selectedSitesCountFlag(vm.selectedSites);
      if (_.isFunction(vm.onExportClick)) {
        vm.onExportClick();
      }

    }

    function getChartInstance () {
      if (ObjectUtils.isNullOrUndefined(vm.chartConfig) || !_.isFunction(vm.chartConfig.getHighcharts)) {
        return getChartInstanceFromDom();
      }

      return vm.chartConfig.getHighcharts();
    }

    function getChartInstanceFromDom () {
      let selector = '#retail-store-summary-chart-';

      if (!ObjectUtils.isNullOrUndefinedOrBlank(vm.dashIndex)) {
        selector = selector + vm.dashIndex;
      }

      return angular.element(selector).highcharts();
    }

    function openSelectedSites () {
      const chart = getChartInstance();

      if (_.isUndefined(chart) || ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedSites)) {
        vm.tooltipsReady = true;
        return;
      }

      setTooltipHideDelay(chart, 0);

      _.each(vm.selectedSites, siteId => {
        openSiteTooltip(chart, siteId);
      });

      setTooltipHideDelay(chart, 500);

      vm.tooltipsReady = true;
    }

    function setTooltipHideDelay (chart, hideDelay) {
      chart.update({ tooltip: { hideDelay } });
    }

    function openSiteTooltip (chart, siteId) {
      if (isTooltipOpen(siteId)) {
        return;
      }

      const sitePlotPoint = _.findWhere(chart.series[0].points, { site_id: siteId });

      if (_.isUndefined(sitePlotPoint)) {
        return;
      }

      // Show the tooltip
      chart.tooltip.refresh(sitePlotPoint);

      // Make it stick
      sitePlotPoint.firePointEvent('click', { point: sitePlotPoint });

      // Remove the hover tooltip as it has now stuck
      chart.tooltip.hide();
    }

    function isTooltipOpen (siteId) {
      const openTooltip = _.findWhere(clonedTooltips, { siteId });

      return !_.isUndefined(openTooltip);
    }

    function tooltipWasJustClosed (siteId) {
      return siteId === lastClosedTooltipSiteId;
    }

    function pointIsBehindOpenTooltip (point) {
      const padding = 15;
      return _.some(clonedTooltips, openTooltip => {
        const maxX = (openTooltip.coordinates.x + openTooltip.width) - padding;
        const maxY = (openTooltip.coordinates.y + openTooltip.height) - padding;

        return point.plotX >= openTooltip.coordinates.x &&
          point.plotX <= maxX &&
          point.plotY >= openTooltip.coordinates.y &&
          point.plotY <= maxY;
      });
    }

    function transformData (sourceData) {
      if (!ObjectUtils.isNullOrUndefined(sourceData)) {
        let chartData = [];

        _.each(sourceData, site => {
          if (site.traffic > 0 && site[vm.activeKpi] > 0) {
            chartData.push({
              x: getTrafficValue(site.traffic),
              y: site[vm.activeKpi],
              name: getSiteNameById(site.site_id),
              site_id: site.site_id,
              kpis: {
                sales: site.sales,
                conversion: site.conversion,
                dwelltime: site.dwell_time,
                ats: site.ats,
                star: site.star,
                aur: site.aur,
                splh: site.splh,
                sps: site.sps,
                transactions: site.transactions
              }
            });
          }
        });

        vm.allSites = chartData;

        if (vm.includeExtremes === false) {
          let perce;
          chartData = $filter('orderBy')(chartData, 'x');
          perce = percentile(chartData, 0.9, 'x');
          chartData = _.filter(chartData, item => item.x <= perce);
          chartData = $filter('orderBy')(chartData, 'y');
          perce = percentile(chartData, 0.9, 'y');
          chartData = _.filter(chartData, item => item.y <= perce);
        }

        return chartData;
      }
    }

    function getTrafficValue (traffic) {
      if (typeof traffic === 'string') {
        return Number(traffic);
      }

      return traffic;
    }

    function hasData () {
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd);
      return !ObjectUtils.isNullOrUndefined(vm.widgetData) && !ObjectUtils.isNullOrUndefined(vm.widgetData[dateRangeKey]);
    }

    function toggleExtremes () {
      closeAllTooltips();
      selectedSitesCountFlag(vm.selectedSites);
      if (vm.extremeToggle.checkbox) {
        vm.includeExtremes = true;
      } else {
        vm.includeExtremes = false;
      }
      renderWidget();
    }

    function changeKpi (kpi) {
      vm.activeKpi = kpi;
      vm.activeKpiDisplayName = _.findWhere(vm.metrics, { kpi }).displayName;
      closeAllTooltips();
      renderWidget();
    }

    function percentile (arr, p, property) {
      if (ObjectUtils.isNullOrUndefined(arr) || arr.length === 0) {
        return 0;
      }
      const length = arr.length;
      const index = Math.round(p * length);
      return arr[index - 1][property];
    }

    function countTotals (arr) {
      const total = {};
      total.x = _.reduce(arr, (total, item) => total + item.x, 0);
      total.y = _.reduce(arr, (total, item) => total + item.y, 0);
      return total;
    }

    function calculateAverages (arr, totals) {
      const avg = { x: 0, y: 0 };
      avg.x = totals.x / arr.length;
      avg.y = totals.y / arr.length;
      return avg;
    }

    function getSiteNameById (siteId) {
      if (!ObjectUtils.isNullOrUndefined(vm.orgSites)) {
        const site = vm.orgSites.filter(obj => parseInt(obj.site_id) === parseInt(siteId));
        if (!ObjectUtils.isNullOrUndefined(site[0])) {
          return site[0].name;
        }

        return siteId;
      }
    }

    function getMidValues (min, max) {
      return { x: (min.x + ((max.x - min.x) / 2)), y: (min.y + ((max.y - min.y) / 2)) };
    }

    function categorizeSites (data) {
      const categories = {};

      angular.forEach(data, siteData => {
        const x = siteData.x;
        const y = siteData.y;
        const mid = vm.mid;

        const siteId = siteData.site_id;

        if (x < mid.x && y >= mid.y) {
          // 0 = out of store opportunity
          categories[siteId] = 0;
        } else if (x >= mid.x && y >= mid.y) {
          // 1 = high performer
          categories[siteId] = 1;
        } else if (x >= mid.x && y < mid.y) {
          // 2 = in store opportunity
          categories[siteId] = 2;
        } else if (x < mid.x && y < mid.y) {
          // 3 = low performer
          categories[siteId] = 3;
        }
      });

      return categories;
    }

    function filterCategory (cat) {
      closeAllTooltips();
      vm.selectedCategory = cat;
    }

    function getAllKpiData () {
      getReportData(vm.orgId, vm.dateRangeStart, vm.dateRangeEnd, vm.selectedTags);
    }

    function getReportData (orgId, dateRangeStart, dateRangeEnd, selectedTags) {
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

      if (ObjectUtils.isNullOrUndefined(vm.widgetData)) {
        vm.widgetData = [];
      }

      vm.widgetData[dateRangeKey] = [];
      vm.isLoading = true;

      const {
        compStores: comp_site,
        compStoresRange,
        operatingHours,
        salesCategories,
        customTags: customTagId,
      } = vm;

      const params = {
        orgId,
        comp_site,
        dateRangeStart,
        dateRangeEnd,
        selectedTags,
        operatingHours,
        ...(comp_site === true ? CompParams.getCompDates(compStoresRange) : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(salesCategories) ? { sales_category_id: _.map(salesCategories, 'id') } : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? { customTagId } : {})
      };

      retailOrganizationSummaryData.fetchReportData(params, vm.checkCache, data => {
        vm.widgetData[dateRangeKey] = data;
        vm.requestFailed = false;
        watchData();
      }, error => {
        vm.isLoading = false;
        vm.requestFailed = true;
        console.error(error);
      });
    }
  }
})();
