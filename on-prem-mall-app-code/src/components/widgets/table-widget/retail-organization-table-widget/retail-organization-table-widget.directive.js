
(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('retailOrganizationTableWidget', retailOrganizationTableWidget);

  function retailOrganizationTableWidget() {
    return {
      templateUrl: 'components/widgets/table-widget/retail-organization-table-widget/retail-organization-table-widget.partial.html',
      scope: {
        orgId:                  '=',
        orgSites:               '=',
        dateRangeStart:         '=',
        dateRangeEnd:           '=',
        compareStores:          '=',
        compareRange1Start:     '=',
        compareRange1End:       '=',
        compareRange2Start:     '=',
        compareRange2End:       '=',
        currentOrganization:    '=',
        currentUser:            '=',
        firstDayOfWeekSetting:  '=',
        hideExportIcon:         '=',
        onExportClick:          '&',
        exportIsDisabled:       '=?',
        summaryKey:             '@',
        widgetTitle:            '@',
        widgetIcon:             '@',
        orderBy:                '=?',
        activeSortType:         '=',
        widgetData:             '=?',
        isLoading:              '=',
        selectedTags:           '=',
        siteCategories:         '=',
        selectedCategory:       '=',
        filterText:             '=',
        orgHasInterior:         '=',
        orgHasSales:            '=',
        orgHasLabor:            '=',
        customTags:             '=',
        language:               '=',
        salesCategories:        '=?',
        setSelectedWidget:      '&', // Custom dashboard,
        selectedMetrics:        '=?',
        comparisonIndex:        '=?',
        compStores:             '=?',
        compStoresRange:        '=?',
        currencySymbol:         '=?',
        requestFailed:          '=?',
        operatingHours:         '=?',
        orgMetrics:             '=?', // This is passed in on the custom dashboard, and the PDF
        selectedTagsSites:      '=?',
        mid:                    '=?'
      },
      controller: retailOrganizationTableWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  retailOrganizationTableWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$filter',
    '$window',
    '$translate',
    '$q',
    '$timeout',
    '$document',
    '$location',
    'metricConstants',
    'retailOrganizationSummaryData',
    'utils',
    'LocalizationService',
    'ObjectUtils',
    'comparisonsHelper',
    'SubscriptionsService',
    'currencyService',
    'SiteResource',
    'currentSalesCategoryService',
    'CompParams'
  ];

  function retailOrganizationTableWidgetController(
    $scope,
    $rootScope,
    $filter,
    $window,
    $translate,
    $q,
    $timeout,
    $document,
    $location,
    metricConstants,
    retailOrganizationSummaryData,
    utils,
    LocalizationService,
    ObjectUtils,
    comparisonsHelper,
    SubscriptionsService,
    currencyService,
    SiteResource,
    currentSalesCategoryService,
    CompParams
  ) {
    var vm = this;
    var localMetricConstants, unbindDataLoadWatch;

    activate();

    function activate() {
      initScope();
      setMetricsConstants();
      configureWatches();

      getSubscribedMetrics();
      
      /* IMPORTANT!
      * vm.widgetData is undefined when this widget is consumed by the PDF or the custom dashboard.
      * This means is needs to load it's own data.
      * The retail org summary page supplies this widget with data, but initially sends an empty object.
      * */
      if ($rootScope.customDashboards || vm.pdf) {
        vm.widgetData = null;
        loadDataForCustomDashOrPdf();
      }

      setSelectedMetrics();
      loadSalesCategories()
      getCompareLabels();
      loadTranslations();
      loadMetricsColumns(); // pushes 'selectedMetrics' columns to be displayed

      if (ObjectUtils.isNullOrUndefined(vm.selectedCategory)) {
        vm.selectedCategory = '';
      }
      vm.numberFormatName = getNumberFormat();

      if (SubscriptionsService.orgHasSalesCategories(vm.currentOrganization)) {
        setSalesCategoriesSelection();
      }

    }

    /**
    * Set Sales Category Pull Down Selection.
    *
    */
    function setSalesCategoriesSelection() {

      var selectedSalesCategory;
      if (ObjectUtils.isNullOrUndefined(vm.salesCategories)) {
        selectedSalesCategory = currentSalesCategoryService.readSelection('retail-organization-table-widget');

        if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategory)) {
          vm.salesCategories = selectedSalesCategory;
        }

      }
    }

    /**
     * Overwrites the metric constants with whatever has been passed in to the directive
     * This is used by the PDF and the custom dashboard and covers the case of users with
     * Access to multiple organizations
     */
    function setMetricsConstants() {
      localMetricConstants = angular.copy(metricConstants);

      if (!_.isUndefined(vm.orgMetrics)) {
        localMetricConstants.metrics = vm.orgMetrics;
      }
    }


    function initScope() {
      vm.pdf = $rootScope.pdf || false;
      vm.gridOptions = {};
      vm.watchUnbinds = [];
      vm.items = [];
      vm.itemIds = [];
      vm.itemTypes = [];
      vm.requestFailed = false;
      vm.showAllItems = false;
      vm.filterText = vm.filterText || ''; // default
      vm.orderByOrder = '-';
      vm.orderByColumn = 'selectedPeriod';
      vm.orderByKpi = 'traffic';
      vm.trueVal = true;
      vm.falseVal = false;
      vm.filterSitesByText = filterSitesByText;
      if (_.isUndefined(vm.comparisonIndex)) vm.comparisonIndex = 1; // default

      vm.allData = [];
      vm.getSiteNameById = getSiteNameById;
      vm.filterCategory = filterCategory;
      vm.changeCompare = changeCompare;
      vm.exportToCSV = exportToCSV;

      vm.compareRangeIsPriorPeriod = compareRangeIsPriorPeriod;
      vm.compareRangeIsPriorYear = compareRangeIsPriorYear;


      vm.compare1Period = {
        start: vm.compareRange1Start,
        end: vm.compareRange1End
      };

      vm.compare2Period = {
        start: vm.compareRange2Start,
        end: vm.compareRange2End
      };

      vm.hasFilterText = false;

      if (vm.pdf && ObjectUtils.isNullOrUndefinedOrEmpty(vm.orgSites)) {
        SiteResource.query({
          orgId: vm.orgId
        }).$promise.then(function (data) {
          vm.orgSites = data;
        }, function (message) {
          throw Error(message);
        });
      }

    }

    function configureWatches() {
      if (vm.isLoading === true) {
        unbindDataLoadWatch = $scope.$watch('vm.isLoading', handleWidgetDataLoadedFirstTime);
      }

      if(!$rootScope.customDashboards) {
        vm.watchUnbinds.push($scope.$watch('vm.filterText', filterSitesByText));
      } else {
        vm.watchUnbinds.push($scope.$watch('vm.filterText', filterSitesByTextCustomDash));
      }

      if (!_.isUndefined(vm.widgetData)) {
        // Widget data is being passed in, so we need to watch the siteCategories.
        // This will happen on the retail org summary page, but not the PDF or custom dashboards

        //its important to have an exit condition on this watch, under some conditions this watch can get into a loop
        //as site cats are changed down the chain which can again call this watch, eventually locking up the browser
        var unbindsiteCatWatch = $scope.$watch('vm.siteCategories', function (newValue, oldValue) {
          handleSiteCategoriesChange();
          if (ObjectUtils.isNullOrUndefinedOrEmptyObject(newValue) && ObjectUtils.isNullOrUndefinedOrEmptyObject(oldValue)) {
            unbindsiteCatWatch()
          }
        });

        vm.watchUnbinds.push(unbindsiteCatWatch);
      }

      vm.watchUnbinds.push($scope.$watch('vm.selectedTagsSites', handleSelectedTagsSiteChange));

      vm.watchUnbinds.push($scope.$watch('vm.selectedCategory', onSelectedCategoryChange));

      vm.watchUnbinds.push($scope.$watchGroup(['vm.selectedMetrics', 'vm.comparisonIndex'], handleColumnChange));

      vm.watchUnbinds.push($scope.$watch('vm.salesCategories', handleWatchSalesCategories));

      var resizeColumnsDebounced = _.debounce(resizeColumns, 300);

      //this is destroyed with watches in configureWatches() but needs to be set here
      angular.element($window).on('resize', resizeColumnsDebounced);

      $scope.$on('$destroy', function () {
        _.each(vm.watchUnbinds, function (unbind) {
          if (typeof unbind === 'function') {
            unbind();
          }
        });
        angular.element($window).off('resize', resizeColumns());
      });
    }

    /**
    * handles watch for Sales Category pull-down selection.
    */
    function handleWatchSalesCategories() {
      filterSitesByText();
      if ($rootScope.customDashboards || $rootScope.pdf) {
        vm.widgetData = null;
        loadDataForCustomDashOrPdf();

        return;
      }

      currentSalesCategoryService.storeSelection('retail-organization-table-widget', vm.salesCategories);
    }

    /** Is used to make sure that the widget data is actually loaded before proceeding.
    *  Prevents problems where the cache is not primed
    **/
    function handleWidgetDataLoadedFirstTime() {
      if (vm.isLoading) {
        //table data is definitely changing
        vm.gridOptions = null;
      }

      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData) || vm.isLoading) {
        return;
      }


      $timeout(function () {
        vm.gridOptions = {};
        buildAllData(true);
        updateCats();
        filterSitesByText();
      });
    }

    /**
     * Handler for the site categories changing.
     * This will only be called on pages where the widget data is supplied externally
     *
     * @param {object} newValue - The newly seleted site category
     * @param {object} oldValue - The previously seleted site category
     */
    function handleSiteCategoriesChange(newValue, oldValue) {
      //watch vm.isLoading instead
      if (vm.orgHasSales === false && _.isUndefined(unbindDataLoadWatch)) {
        unbindDataLoadWatch = $scope.$watch('vm.isLoading', handleWidgetDataLoadedFirstTime);
        return;
      }

      // Some orgs can have traffic data and no sales data.
      // In this case, their sites will not get categorised, so we should just load anyway
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(newValue) && hasNoSalesData(vm.widgetData) && hasData(vm.widgetData)) {
        unbindDataLoadWatch = $scope.$watch('vm.isLoading', handleWidgetDataLoadedFirstTime);
      }

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(newValue) && ObjectUtils.isNullOrUndefinedOrEmptyObject(oldValue)) {
        unbindDataLoadWatch = $scope.$watch('vm.isLoading', handleWidgetDataLoadedFirstTime);
      } else if (hasData(vm.widgetData) && ObjectUtils.isNullOrUndefinedOrEmpty(vm.allData)) {
        //for when there is cached widget data but vm.allData has not yet been built
        buildAllData(true);
        updateCats();
        filterSitesByText();
      } else {
        updateCats();
        filterSitesByText();
      }
    }

    function hasData(widgetData) {
      if (ObjectUtils.isUndefined(widgetData)) return false;

      var dateRangeKeys = getDateRangeKeys();
      return !ObjectUtils.isNullOrUndefinedOrEmpty(widgetData[dateRangeKeys[0]]);
    }

    function hasNoSalesData(data) {
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(data)) {
        return false;
      }

      var dateRangeKeys = getDateRangeKeys();

      if (ObjectUtils.isNullOrUndefinedOrEmpty(dateRangeKeys)) {
        return false;
      }

      var currentDateRange = dateRangeKeys[0];

      var currentData = data[currentDateRange];

      var nullSalesValues = _.where(currentData, { sales: null });

      if (_.isUndefined(nullSalesValues)) {
        return false;
      }

      return nullSalesValues.length === currentData.length;
    }

    function handleSelectedTagsSiteChange() {
      updateSiteFilter();
    }

    function handleColumnChange() {
      loadMetricsColumns();
      updateCats();
    }

    function loadDataForCustomDashOrPdf() {
      var defer = $q.defer();
      var salesCategories;

      if (!ObjectUtils.isNullOrUndefined(vm.salesCategories)) {
        salesCategories = _.pluck(vm.salesCategories, 'id');
      }

      // Used for Custom Dashboards as data is not passed in
      if ($rootScope.customDashboards || vm.pdf) {
        vm.tempTableData = {};
        vm.isLoading = true;

        var promises = [];
        promises.push(getReportData(vm.orgId, vm.dateRangeStart, vm.dateRangeEnd, vm.selectedTags, salesCategories));
        promises.push(getReportData(vm.orgId, vm.compareRange1Start, vm.compareRange1End, vm.selectedTags, salesCategories));
        promises.push(getReportData(vm.orgId, vm.compareRange2Start, vm.compareRange2End, vm.selectedTags, salesCategories));

        $q.all(promises).then(() => {

          vm.widgetData = angular.copy(vm.tempTableData);
         
          buildAllData();
          vm.initialSalesCategory = salesCategories;
          defer.resolve();
          vm.requestFailed = false;
           
          transformData(vm.widgetData[retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd)]);
          vm.initialSalesCategory = salesCategories;
          gridBuilder();
        }).catch((e) => {
          defer.reject(e);
          vm.isLoading = false;
          vm.requestFailed = true;
        });
      } else {
        defer.resolve();
      }
      return defer.promise;
    }

    function getReportData(orgId, dateRangeStart, dateRangeEnd, selectedTags, salesCategoryId) {
      const dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(dateRangeStart, dateRangeEnd);

      vm.tempTableData[dateRangeKey] = [];

      const {
        compStores: comp_site,
        compStoresRange,
        operatingHours,
        customTags: customTagId,
      } = vm;

      let sales_category_id = salesCategoryId;
     
      const params = {
        orgId,
        comp_site,
        dateRangeStart,
        dateRangeEnd,
        selectedTags,
        kpi: getPermittedKpis(),
        operatingHours,
        sales_category_id,
        ...(comp_site === true ? CompParams.getCompDates(compStoresRange) : {}),
        ...(!ObjectUtils.isNullOrUndefinedOrEmpty(customTagId) ? { customTagId } : {})
      };

      var deferred = $q.defer();

      retailOrganizationSummaryData.fetchReportData(params, true, (data) => {
        vm.tempTableData[dateRangeKey] = data;
        deferred.resolve();
      }, (error) => {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getPermittedKpis() {
      var kpisPermitted = [];

      var permdMetrics = localMetricConstants.metrics.filter(function (metric) {
        return SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, vm.currentOrganization);
      });

      kpisPermitted = _.pluck(permdMetrics, 'value');

      kpisPermitted.push('traffic');

      return kpisPermitted;
    }

    function loadSalesCategories() {
      var salesCategories;
      if (!ObjectUtils.isNullOrUndefined(vm.salesCategories)) {
        salesCategories = _.pluck(vm.salesCategories, 'id');
      }

      vm.initialSalesCategory = salesCategories;
    }

    function getSubscribedMetrics() {

      var metricsShownOnWidget = ['traffic', 'dwelltime', 'star', 'sales', 'conversion', 'ats', 'sps', 'splh', 'aur', 'transactions'];

      var sortedMetrics = _.sortBy(localMetricConstants.metrics, 'order');

      vm.metrics = _.filter(sortedMetrics, function (metric) {
        var hasSubscription = SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, vm.currentOrganization);
        return _.contains(metricsShownOnWidget, metric.value) && hasSubscription;
      });

      _.each(vm.metrics, function (metric) {
        metric.displayName = getMetricTitle(metric, metric.displayName);
      });

      vm.metrics[0].selected = true;

    }

    function getMetricTitle(metricInfo, displayName) {
      if (_.isUndefined(metricInfo)) {
        return displayName;
      }
      if (!_.isUndefined(vm.orgMetrics)) {
        var metric = _.findWhere(vm.orgMetrics, { value: metricInfo.value });
        if (!_.isUndefined(metric)) {
          return metric.displayName;
        }
      }
      return getMetricDisplayName(metricInfo, displayName);
    }

    function getMetricDisplayName(metricInfo, displayName) {
      if (!ObjectUtils.isNullOrUndefinedOrBlank(metricInfo.title)) {
        metricInfo.title;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(displayName)) {
        return displayName;
      }
      return metricInfo.shortTranslationLabel;
    }

    function setSelectedMetrics() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics)) {
        vm.selectedMetrics = vm.metrics.slice(0, 5);
      }

      var selectedMetrics = [];
      if (($rootScope.customDashboards || vm.pdf) && typeof vm.selectedMetrics[0] === 'string') {
        _.map(vm.metrics, function (metric) {
          metric.selected = _.contains(vm.selectedMetrics, metric.kpi);
          if (metric.selected) {
            selectedMetrics.push(metric);
          }
        });
        vm.selectedMetrics = selectedMetrics;
      }
    }

    function getNumberFormat() {
      var currentUser = vm.currentUser;
      var currentOrganization = vm.currentOrganization;
      return LocalizationService.getCurrentNumberFormatName(currentUser, currentOrganization);
    }

    function buildAllData(firstLoad) {
      if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData)) {
        return;
      }

      if (firstLoad) transformData(vm.widgetData[retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd)]);

      var dateRangeKeys = getDateRangeKeys();
      vm.allData = getTableWidgetData(dateRangeKeys, vm.widgetData);
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.allData)) {
        vm.showNoData = true;
        vm.isLoading = false;
      } else {
        gridBuilder();
        vm.showNoData = false;
      }
      vm.dataReady = true;
    }

    function getDateRangeKeys() {
      var dateRangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.dateRangeStart, vm.dateRangeEnd);
      var com1RangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.compareRange1Start, vm.compareRange1End);
      var com2RangeKey = retailOrganizationSummaryData.getDateRangeKey(vm.compareRange2Start, vm.compareRange2End);
      return [dateRangeKey, com1RangeKey, com2RangeKey];
    }

    function getTableWidgetData(dateRangeKeys, widgetData) {
      var baseData = widgetData[dateRangeKeys[0]];

      if (ObjectUtils.isNullOrUndefinedOrEmpty(baseData)) {
        return
      }

      var allData = _.extend({}, widgetData);
      var compare = [null, null];
      var comparisonIndices = [1, 2];
      vm.comparisonIndices = comparisonIndices;
      // Load compare data
      _.each(Object.keys(allData), function (key) {
        if (key === dateRangeKeys[0]) {
          return;
        }

        var list = _.sortBy(allData[key], 'site_id');
        var result = {};

        _.each(list, function (obj) {
          result[obj.site_id] = {
            site_id: obj.site_id,
            traffic: obj.traffic,
            dwelltime: obj.dwelltime,
            star: obj.star,
            sales: obj.sales,
            conversion: obj.conversion,
            ats: obj.ats,
            upt: obj.upt,
            transactions: obj.transactions
          };
        });

        if (key === dateRangeKeys[1]) {
          compare[0] = result;
        }
        if (key === dateRangeKeys[2]) {
          compare[1] = result;
        }

      });

      baseData = baseData.map(function (obj) {
        var site_id = obj.site_id;
        var siteName = getSiteNameById(obj.site_id);
        var result = {
          site_id: site_id,
          site_name: siteName,
          traffic: {},
          dwelltime: {},
          star: {},
          sales: {},
          conversion: {},
          ats: {},
          upt: {}
        };

        if (!ObjectUtils.isNullOrUndefined(vm.siteCategories)) {
          result.site_category = vm.siteCategories[obj.site_id];
        } else {
          result.site_category = null;
        }

        result.siteClass = getSiteClass(result.site_category);

        _.each(vm.metrics, function (metric) {

          result[metric.value] = {
            prefixSymbol: metric.prefixSymbol,
            suffixSymbol: metric.suffixSymbol,
            selectedPeriod: obj[metric.value], // This is needed for sorting
            comparisons: [],
            currentComparison: {}
          };

          for (var i = 0; i < compare.length; i++) {
            var period = compare[i];
            var metricCompare;
            if (period[site_id]) {
              metricCompare = period[site_id][metric.value];
            } else {
              metricCompare = null;
            }
            var metricComparison = comparisonsHelper.getComparisonData(obj[metric.value], metricCompare, true);
            result[metric.value].comparisons.push(metricComparison);
            if (vm.comparisonIndex - 1 === i) {
              result[metric.value].currentComparison = metricComparison;
            }
          }

        });
        return result;
      });
      return baseData;
    }

    /** Gets the CSS class for a site based on it's category.
     *  This function saves a heavy ng-class expression.
     *
     *  @param {number} siteCategory the value that represents the site's category
     *  @returns {string} The CSS class to be used in the UI
     **/
    function getSiteClass(siteCategory) {
      var siteClass = 'site-name-label--';

      switch (siteCategory) {
        case 0:
          siteClass += 'yellow';
          break;
        case 1:
          siteClass += 'orange';
          break;
        case 2:
          siteClass += 'purple';
          break;
        case 3:
          siteClass += 'cyan';
          break;
        default:
          siteClass = '';
          break;
      }

      return siteClass;
    }

    function getSiteNameById(siteId) {
      var site = vm.orgSites.filter(function (obj) {
        return Number(obj.site_id) === Number(siteId);
      });

      if (!ObjectUtils.isNullOrUndefined(site[0])) {
        return site[0].name;
      }
    }

    function filterCategory(cat) {
      vm.selectedCategory = cat;
    }

    function changeCompare(comparisonIndex) {
      vm.comparisonIndex = comparisonIndex;
    }

    function compareRangeIsPriorPeriod(comparePeriod) {
      if (!ObjectUtils.isNullOrUndefined(vm.dateRangeStart) && !ObjectUtils.isNullOrUndefined(vm.dateRangeEnd)) {
        var range = {
          start: vm.dateRangeStart,
          end: vm.dateRangeEnd
        };

        if (utils.dateRangeIsPriorPeriod(range, comparePeriod)) {
          return true;
        }
      }
      return false;
    }

    function compareRangeIsPriorYear(comparePeriod) {
      if (vm.dateRangeStart !== undefined && vm.dateRangeEnd !== undefined) {
        var range = {
          start: vm.dateRangeStart,
          end: vm.dateRangeEnd
        };

        if (utils.dateRangeIsPriorYear(range, comparePeriod, vm.firstDayOfWeekSetting)) {
          return true;
        }
      }
      return false;
    }

    function loadMetricsColumns() {
      if (
        !ObjectUtils.isNullOrUndefined(vm.gridOptions) &&
        !ObjectUtils.isNullOrUndefined(vm.gridOptions.columnDefs) &&
        !ObjectUtils.isNullOrUndefined(vm.gridOptions.api) &&
        !_.isUndefined(vm.metrics)
      ) {
        var columnDefs = buildColDefs();
        vm.gridOptions.api.setColumnDefs(columnDefs);
        vm.gridOptions.api.sizeColumnsToFit();
        return;
      }

      if (typeof vm.salesCategories !== 'undefined' && vm.hideSalesCategories) {
        //re-init handle for when salesCategories dropdown is back in view...
        vm.salesCategories[0] = vm.currentOrganization.portal_settings.sales_categories[0];
      }

      filterSitesByText();

    }

    function getCompareLabels() {
      if (compareRangeIsPriorPeriod(vm.compare1Period)) {
        vm.compareLabel1 = 'common.PRIORPERIOD';
      } else if (compareRangeIsPriorYear(vm.compare1Period)) {
        vm.compareLabel1 = 'common.PRIORYEAR';
      } else {
        vm.compareLabel1 = 'common.CUSTOMCOMPARE1';
      }

      if (compareRangeIsPriorPeriod(vm.compare2Period)) {
        vm.compareLabel2 = 'common.PRIORPERIOD';
      } else if (compareRangeIsPriorYear(vm.compare2Period)) {
        vm.compareLabel2 = 'common.PRIORYEAR';
      } else {
        vm.compareLabel2 = 'common.CUSTOMCOMPARE2';
      }
    }

    function loadTranslations() {
      $translate.use(vm.language);
    }

    function exportToCSV() {
      var dateMask = vm.currentUser.localization.date_format.mask ? vm.currentUser.localization.date_format.mask : vm.currentOrganization.localization.date_format.mask;
      var start = vm.dateRangeStart.format(dateMask);
      var end = vm.dateRangeEnd.format(dateMask);
      var params = {
        customHeader: 'Date Range : ' + start + ' - ' + end + ' \n'
      };
      vm.exportingToCSV = true;
      vm.gridOptions.columnDefs = buildColDefs();
      vm.gridOptions.api.redrawRows()

      replaceColumnHeaders('&#37;', '%');

      vm.gridOptions.api.exportDataAsCsv(params);
      replaceColumnHeaders('%', '&#37;');

      vm.exportingToCSV = false;
      vm.gridOptions.columnDefs = buildColDefs();
      vm.gridOptions.api.sizeColumnsToFit();
      vm.gridOptions.api.redrawRows()
    }

    function replaceColumnHeaders(search, replace) {
      var columnDefs = _.map(vm.gridOptions.columnDefs, function (columDef) {
        if (columDef.headerName === search) {
          columDef.headerName = replace;
        }

        return columDef;
      });
      vm.gridOptions.columnDefs = columnDefs;
    }

    function transformData(sourceData) {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(sourceData)) {
        var sortedData = [];

        _.each(sourceData, function (site) {
          if (site.traffic > 0 && site.conversion > 0) {
            sortedData.push({
              x: Number(site.traffic),
              y: site.conversion,
              site_id: site.site_id,
            });
          }
        });
        categorizeSites(sortedData);
      }
    }

    function countTotals(arr) {
      var total = {};
      total.x = _.reduce(arr, function (total, item) {
        return total + item.x;
      }, 0);
      total.y = _.reduce(arr, function (total, item) {
        return total + item.y;
      }, 0);
      return total;
    }

    function calculateAverages(arr, totals) {
      var avg = { x: 0, y: 0 };
      avg.x = totals.x / arr.length;
      avg.y = totals.y / arr.length;
      return avg;
    }

    function getMidValues(sortedData) {
      var total = countTotals(sortedData);
      var avg = calculateAverages(sortedData, total);
      var min = {};
      var max = {};
      max.x = Math.max.apply(Math, sortedData.map(function (o) { return o.x; }));
      min.x = Math.min.apply(Math, sortedData.map(function (o) { return o.x; }));
      max.y = Math.max.apply(Math, sortedData.map(function (o) { return o.y; }));
      min.y = Math.min.apply(Math, sortedData.map(function (o) { return o.y; }));

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

      return { x: (min.x + ((max.x - min.x) / 2)), y: (min.y + ((max.y - min.y) / 2)) };
    }

    function categorizeSites(data) {
      var categories = {};
      var mid = vm.mid ? vm.mid : getMidValues(data);

      angular.forEach(data, function (siteData) {

        var x = siteData.x;
        var y = siteData.y;


        var siteId = siteData.site_id;

        if (isOutOfStoreOpportunity(x, y, mid)) {
          categories[siteId] = 0;
        } else if (isHighPerformer(x, y, mid)) {
          categories[siteId] = 1;
        } else if (isInStoreOpportunity(x, y, mid)) {
          categories[siteId] = 2;
        } else if (isLowPerformer(x, y, mid)) {
          categories[siteId] = 3;
        }

      });
      vm.siteCategories = categories;
    }

    function isOutOfStoreOpportunity(x, y, mid) {
      return x < mid.x && y >= mid.y ? true : false;
    }

    function isHighPerformer(x, y, mid) {
      return x >= mid.x && y >= mid.y ? true : false;
    }

    function isInStoreOpportunity(x, y, mid) {
      return x >= mid.x && y < mid.y ? true : false;
    }

    function isLowPerformer(x, y, mid) {
      return x < mid.x && y < mid.y ? true : false;
    }


    /************************************************
     * AG GRID STUFF
    ************************************************/

    function gridBuilder() {
      vm.gridBuilder = {};
      vm.locale = angular.copy(vm.currentUser.localization.locale);
      vm.thousandsSeparator = angular.copy(vm.currentUser.localization.number_format.thousands_separator);
      currencyService.getCurrencySymbol(vm.currentOrganization.organization_id).then(function (data) {
        vm.currencySymbol = data.currencySymbol;
        vm.gridBuilder.columnDefs = buildColDefs();

        // Sometimes the widgetData will be loaded beofre the currency service resolves - e.g. with a primed cache
        if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.widgetData)) {
          buildRowData();
          return;
        }

      });
    }

    function buildColDefs() {
      var columnDefs = [];
      _.each(vm.metrics, function (metric) {
        var isSelectedMetric = _.findWhere(vm.selectedMetrics, { 'kpi': metric.kpi });
        columnDefs.push(
          {
            headerName: metric.displayName,
            field: metric.kpi,
            comparator: customComparator,
            hide: _.isUndefined(isSelectedMetric),
            suppressFilter: true,
            suppressPaste: true,
            suppressMovable: true,
          },
          {
            headerName: '%',
            field: metric.kpi + 'p1',
            cellStyle: deltaFormatter,
            comparator: customComparator,
            hide: _.isUndefined(isSelectedMetric) || vm.comparisonIndex === 2,
            maxWidth: 120,
            suppressFilter: true,
            suppressPaste: true,
            suppressMovable: true
          },
          {
            headerName: '%',
            field: metric.kpi + 'p2',
            cellStyle: deltaFormatter,
            comparator: customComparator,
            hide: _.isUndefined(isSelectedMetric) || vm.comparisonIndex === 1,
            maxWidth: 120,
            suppressFilter: true,
            suppressPaste: true,
            suppressMovable: true
          }
        );
      });

      columnDefs.push({ headerName: 'Category', field: 'category', hide: true });
      columnDefs.push({ headerName: 'SiteId', field: 'site_id', hide: true });

      columnDefs.unshift(getSiteNamesColumn());
      return columnDefs;
    }

    function getSiteNamesColumn() {
      var sitesColumn = {
        headerName: 'Sites',
        field: 'rowname',
        sort: 'dsc',
        suppressSorting: true,
        width: 350,
        enableTooltip: true,
        enableFilter: true,
        cellRenderer: cellRendererForSite,
        suppressPaste: true,
        suppressMenu: true,
        filter: 'agTextColumnFilter',
      };

      if (vm.isPdf) {
        sitesColumn.cellStyle = {
          'height': 'auto!important',
          'white-space': 'normal',
          'text-overflow': 'clip !important',
          'word-wrap': 'break-word !important'
        };
        sitesColumn.width = 250;
      }

      return sitesColumn;
    }

    function filterSitesByText() {
      if (
        !$rootScope.customDashboards &&
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridOptions) &&
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridOptions.api) &&
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridOptions.columnDefs)
      ) {
        var filterComponent = vm.gridOptions.api.getFilterInstance('rowname');
        if (!ObjectUtils.isNullOrUndefined(filterComponent)) {
          filterComponent.setModel({
            type: 'contains',
            filter: vm.filterText
          });
          vm.gridOptions.api.onFilterChanged();
          updateSiteFilter();
        }
      }
    }

    function filterSitesByTextCustomDash() {
      //required for when navigating INBETWEEN custom dashboards
      if (_.isUndefined(vm.agApi)) {
        return;
      }
      let filterComponent = vm.agApi.getFilterInstance('rowname');
      if (!ObjectUtils.isNullOrUndefined(filterComponent)) {
        filterComponent.setModel({
          type: 'contains',
          filter: vm.filterText
        });
        vm.agApi.onFilterChanged();
        updateSiteFilter();
      }
    }

    function deltaFormatter(params) {
      var textColor = '#4c4a4a';
      if (params.value.indexOf('-') === -1 && params.value !== '0') {
        textColor = '#9bc614';
      } else if (params.value.indexOf('-') !== -1) {
        textColor = '#f75c38';
      }
      return { color: textColor };
    }

    function cellRendererForSite(params) {
      var cellDiv = document.createElement('div');

      var tooltip = getToolTip(params);

      var dotColor = '#4c4a4a';
      if (!_.isUndefined(params.data.class)) {
        dotColor = params.data.class;
      }

      if (!vm.pdf) {
        cellDiv.innerHTML = '<span data-tooltip="' + tooltip + '">' + getLinkElement(params) + params.value + '</span>';
      } else {
        cellDiv.innerHTML = '<span data-tooltip>' + params.value + '</span>';
      }

      cellDiv.className = getClassNameForSiteLink(dotColor);

      return cellDiv;
    }

    function getClassNameForSiteLink(dotColor) {
      var className = 'site-link site-name-label ' + dotColor;
      if (vm.pdf) {
        className += ' pdf'
      }

      return className;
    }

    function getLinkElement(params) {
      return '<a ui-sref="analytics.organization.site({ siteId: ' +
        params.data.site_id + ' })" href="#/' +
        vm.currentOrganization.organization_id + '/' +
        params.data.site_id + '"></a>';
    }

    function getToolTip(params) {

      var url = $location.absUrl().split('#')[0] + 'index.html#/';
      return url +
        vm.currentOrganization.organization_id + '/' +
        params.data.site_id;
    }

    function customComparator(a, b) {
      var numberA = Number(a.replace(/[^\d.-]/g, ''));
      var numberB = Number(b.replace(/[^\d.-]/g, ''));
      if (isNaN(numberA) && isNaN(numberB)) {
        return 0;
      }
      if (isNaN(numberA)) {
        return 1;
      }
      if (isNaN(numberB)) {
        return -1;
      }

      return numberB - numberA;

    }

    function buildRowData() {
      vm.gridBuilder.rowData = [];
      if (vm.allData) {
        var hasSiteCat = false;
        _.each(vm.allData, function (data) {

          var row = {};

          _.each(vm.gridBuilder.columnDefs, function (col) {
            if (col.field !== 'rowname' && col.field !== 'category' && col.field !== 'site_id') {
              var period;
              if (col.field.indexOf('p1') !== -1) {
                var dataPoint = col.field.replace('p1', '');
                period = data[dataPoint].comparisons[0].percentageChange ? data[dataPoint].comparisons[0].percentageChange : undefined;
              } else if (col.field.indexOf('p2') !== -1) {
                var dataPoint = col.field.replace('p2', '');
                period = data[dataPoint].comparisons[1].percentageChange ? data[dataPoint].comparisons[1].percentageChange : undefined;
              } else if (col.field) {
                var value = data[col.field].selectedPeriod;
                var metricDetails = angular.copy(_.findWhere(localMetricConstants.metrics, { 'kpi': col.field }));
                var newValue = $filter('formatNumber')(value, metricDetails.precision, vm.numberFormatName, vm.thousandsSeparator);


                if (ObjectUtils.isNullOrUndefinedOrEmpty(newValue)) {
                  newValue = '-';
                }

                if (newValue !== '-') {
                  newValue = newValue + metricDetails.suffixSymbol
                }

                if (metricDetails.isCurrency && newValue !== '-') {
                  newValue = vm.currencySymbol + newValue;
                }
                period = newValue;
              }

              row[col.field] = period ? period.toString() : '-';
            }
          });
          row['class'] = data.siteClass;
          row['site_id'] = data.site_id;
          row['category'] = !_.isUndefined(vm.siteCategories) ? vm.siteCategories[data.site_id] : undefined;
          row['rowname'] = !_.isUndefined(data.site_name) ? data.site_name.replace(/\s+/g, ' ').trim() : data.site_id.toString();

          if (row['category'] !== undefined && !hasSiteCat) {
            hasSiteCat = true;
          }

          vm.gridBuilder.rowData.push(row);
        });

        if (
          hasSiteCat &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.gridOptions) &&
          !ObjectUtils.isNullOrUndefinedOrEmpty(vm.gridOptions.api) &&
          !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridBuilder.rowData)) {
          vm.gridOptions.api.setRowData(vm.gridBuilder.rowData);
        }

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.gridBuilder.rowData)) {
          renderGrid();
        }
      }
    }

    function renderGrid() {
      vm.isLoading = false;
      vm.requestFailed = false;

      vm.gridOptions.rowData = vm.gridBuilder.rowData;
      vm.gridOptions.columnDefs = vm.gridBuilder.columnDefs;
      vm.gridOptions.enableColResize = !vm.pdf;
      vm.gridOptions.suppressResize = false;
      vm.gridOptions.enableSorting = !vm.pdf;
      vm.gridOptions.rowHeight = 26;
      vm.gridOptions.enableFilter = !vm.pdf;
      vm.gridOptions.suppressDragLeaveHidesColumns = !vm.pdf;
      vm.gridOptions.angularCompileHeaders = !vm.pdf;

      if (vm.pdf) {
        vm.gridOptions.domLayout = 'forPrint';
        vm.suppressColumnMoveAnimation = true;
        vm.animateRows = true;
      }

      vm.gridOptions.onGridReady = (params) => {

        resizeColumns();
        updateCats();
        $timeout(function () {
          setClickEventForSiteName();
        }, 10);

        if (vm.pdf) {
          $timeout(function () {
            setRowHeightForPdf(params);
            $rootScope.pdfExportsLoaded += 1;
          });
        }

        if ($rootScope.customDashboards) {
          vm.agApi = params.api;
          vm.gridOptions.api = params.api;
          filterSitesByTextCustomDash();
          resizeColumns();
          updateCats();
        } else {
          filterSitesByText();
        }
      }


    }

    function setClickEventForSiteName() {
      vm.rowHeightChanged = false;
      var selector = $document[0].querySelectorAll('div.site-link');
      _.each(selector, function (item) {
        item.onclick = onClickEvent;
      });
    }

    function onClickEvent() {
      window.location = $location.absUrl().split('#')[0] + $(this).find('a').attr('href');
      return false;
    }

    function setRowHeightForPdf(params) {
      vm.rowHeightChanged = false;
      var selector = $document[0].querySelectorAll('.ag-row-level-0');

      params.api.forEachNode(function (rowNode) {
        setRowHeight(selector, rowNode);
      });

      if (vm.rowHeightChanged) {
        params.api.onRowHeightChanged();
      }
    }

    /**
   * private function to reset ag-grid row height when we have long site names in pdf.
   * this function returns nothing but sets the row height.
   */
    function setRowHeight(selector, rowNode) {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(selector)) {
        var row;
        _.each(selector, function (item) {
          if (item.firstChild.innerText.trim() === rowNode.data.rowname) {
            row = item;
          }
        });
        if (!ObjectUtils.isNullOrUndefined(row) && !ObjectUtils.isNullOrUndefined(row.firstChild)) {
          var clientHeight = angular.copy(row.firstChild.children[0].firstChild.clientHeight);
          var rowheight = angular.copy(rowNode.rowHeight);
          if (clientHeight > (rowheight - 2)) {
            row.firstChild.style.height = rowheight + 'px !important';
            rowNode.setRowHeight(clientHeight);
            vm.rowHeightChanged = true;
            return;
          }

          var lineCount = getLineNumber(rowNode.data.rowName);

          if (lineCount < 1) {
            lineCount = 1;
          }

          rowNode.setRowHeight(rowheight * lineCount);
          vm.rowHeightChanged = true;
        }
      }
    }

    function getLineNumber(value) {
      var lineCount = 1;
      if (ObjectUtils.isNullOrUndefinedOrBlank(value) || typeof value.split !== 'function') {
        return lineCount;
      }
      var parts = value.split(' ');

      var maxLengthForLine = 30;
      var partLength = 0;
      _.each(parts, function (part) {
        partLength += part.length + 1;
        if (partLength > maxLengthForLine) {
          lineCount += 1;
          partLength = part.length;
        }
      });

      return lineCount;
    }


    function resizeColumns() {
      if (
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridOptions) &&
        !ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.gridOptions.api &&
          _.isFunction(vm.gridOptions.api.sizeColumnsToFit))
      ) {
        vm.gridOptions.api.sizeColumnsToFit()
      }
    }


    // Applies filter based on selectedCategory
    function onSelectedCategoryChange() {
      if (ObjectUtils.isNullOrUndefined(vm.gridOptions)) {
        return;
      }

      if (ObjectUtils.isNullOrUndefined(vm.gridOptions.columnDefs)) {
        return;
      }

      if (ObjectUtils.isNullOrUndefined(vm.gridOptions.api)) {
        return;
      }

      if (ObjectUtils.isNullOrUndefined(vm.metrics)) {
        return;
      }

      var columnDefs = buildColDefs();
      vm.gridOptions.api.setColumnDefs(columnDefs);
      vm.gridOptions.api.sizeColumnsToFit();
      updateCats();
      filterSitesByText();
    }

    function updateSiteFilter() {
      if (ObjectUtils.isNullOrUndefined(vm.gridOptions) ||
        ObjectUtils.isNullOrUndefined(vm.gridOptions.api) ||
        ObjectUtils.isNullOrUndefined(vm.gridOptions.columnDefs)) {
        return;

      }

      var filterSiteIdComponent = vm.gridOptions.api.getFilterInstance('site_id');
      if (!_.isUndefined(filterSiteIdComponent)) {
        filterSiteIdComponent.resetFilterValues();
        var siteIds = [];

        _.each(vm.selectedTagsSites, function (site) {
          siteIds.push(site.site_id.toString());
        });

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(siteIds)) {
          filterSiteIdComponent.setModel(siteIds);
        }

        vm.gridOptions.api.onFilterChanged();
      }
    }

    function updateCats() {
      if (!ObjectUtils.isNullOrUndefined(vm.gridOptions) &&
        !ObjectUtils.isNullOrUndefined(vm.gridOptions.api) &&
        !ObjectUtils.isNullOrUndefined(vm.gridOptions.columnDefs)) {
        var filterComponent = vm.gridOptions.api.getFilterInstance('category');
        var textFilterComponent = vm.gridOptions.api.getFilterInstance('rowname');
        
        if (!_.isUndefined(filterComponent)) {
          if (typeof filterComponent.selectNothing === 'function') {
            filterComponent.selectNothing();
          }
          if (typeof vm.selectedCategory === 'number') {
            filterComponent.selectValue(vm.selectedCategory);
          } else {
            if (typeof filterComponent.selectEverything === 'function') {
              filterComponent.selectEverything();
            }
          }

          textFilterComponent.setModel({
            type: 'contains',
            filter: vm.filterText
          });

          vm.gridOptions.api.onFilterChanged();
        }
      }
      updateSiteFilter();
    }
  }
})();
