(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('customCompareDataWidget', customCompareDataWidgetDirective);

  function customCompareDataWidgetDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/custom-compare-widget/custom-compare-data-widget.partial.html',
      scope: {
        currentUser: '=',
        currentOrganization: '=?',
        sites: '=?sites',
        onExportClick: '&',
        exportIsDisabled: '=?exportIsDisabled',
        orderBy: '=?',
        hideExportIcon: '=?hideExportIcon',
        dateFormatMask: '=?',
        businessDays: '=?',
        compare: '=?',
        editMode: '=?',
        previewInProgress: '=?',
        deleteCompare: '=?',
        editCompare: '=?',
        setSelectedWidget: '&',
        loading: '=?',
        dateRanges: '=?'
      },
      controller: customCompareDataWidgetController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  customCompareDataWidgetController.$inject = [
    '$scope',
    '$rootScope',
    '$q',
    '$filter',
    '$translate',
    'ObjectUtils',
    'LocalizationService',
    'apiUrl',
    'orgCompareService',
    'OrganizationResource',
    'SiteResource',
    'metricsHelper',
    'dateRangeHelper',
    'chartColors',
    'datePeriods',
    'getOrganization',
    '$parse',
    'utils',
    'currencyService'
  ];

  function customCompareDataWidgetController(
    $scope,
    $rootScope,
    $q,
    $filter,
    $translate,
    ObjectUtils,
    LocalizationService,
    apiUrl,
    orgCompareService,
    OrganizationResource,
    SiteResource,
    metricsHelper,
    dateRangeHelper,
    chartColors,
    datePeriods,
    getOrganization,
    $parse,
    utils,
    currencyService
  ) {
    var vm = this;

    var unbindMetricSelectorWatch;
    var unbindCompareWatch;
    var unbindEditModeWatch;
    var unbindPreviewInProgressWatch;
    vm.loaded = false;
    vm.orderBy = orderBy;
    vm.averageTranskey = '';
    vm.additionalTableCssClass = '';
    vm.sortProp = {};
    vm.getPrefixSymbol = getPrefixSymbol;

    activate();

    function activate() {
      vm.firstLoad = true;
      vm.trueVal = true;
      vm.showAverage = false;
      vm.isValidNumber = isValidNumber;
      vm.hideExportIcon = $rootScope.pdf;
      vm.pdf = $rootScope.pdf;
      vm.requestFailed = false;
      vm.hasTableData = false;
      vm.minLength = 1;
      vm.maxLength = 1;
      vm.setComparePeriod = setComparePeriod;
      vm.chartGraphClass = 'col-xs-12  col-md-9 col-lg-10';
      vm.chartLegendClass = 'col-xs-12 col-md-3 col-lg-2';
      vm.toogleTableShow = toogleTableShow;

      if ($rootScope.pdf === true) {
        setForPdf();
        return;
      }

      if($rootScope.customDashboards) {
        vm.dateFormatMask = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
      }

      setCurrencySymbol().then(init).catch(function (e) {
        // Log catch but still call init()
        console.error(e);
        init();
      });
    }

    function setCurrencySymbol() {
      var deferred = $q.defer();

      if (vm.sites) {
        _.each(vm.sites, function (site, index) {
          if (!ObjectUtils.isNullOrUndefined(site)) { //some older custom compares may contain sites that no longer exist. This breaks the compare in custom dash
            currencyService.getCurrencySymbol(vm.currentOrganization.organization_id, site.site_id).then(function (data) {
              vm.sites[index].currencySymbol = data.currencySymbol;
            });
          }
        });
      } else {
        deferred.reject('no sites');
      }

      if (vm.currentOrganization) {
        currencyService.getCurrencySymbol(vm.currentOrganization.organization_id).then(function (data) {
          vm.currencySymbol = data.currencySymbol;
          deferred.resolve(data.currencySymbol);
        }, function (err) {
          deferred.reject(err);
        });
      }

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.currentOrganization) && ObjectUtils.isNullOrUndefinedOrEmpty(vm.sites)) {
        deferred.reject('currentOrg and sites are undefined');
      }

      return deferred.promise;
    }

    function setForPdf() {
       vm.chartGraphClass = 'col-xs-12';
        vm.chartLegendClass = 'col-xs-12';
        getOrganization(vm.compare.organization_id).then(function(organization) {
          vm.currentOrganization = organization;
          orgCompareService.setMetricLookup(vm.currentOrganization);
          vm.dateFormatMask = LocalizationService.getCurrentDateFormat(vm.currentOrganization);
          var sites = SiteResource.query({ 'orgId': organization.organization_id });
          sites.$promise.then(function(sites) {
             vm.sites = sites;
             setCurrencySymbol().then(init).catch(function(err) {
               console.error(err);
               init();
             });
          });
        });
    }

    function init() {
      if (vm.compare.type === 'multi') {
        vm.maxLength = 5;
      }
      if($rootScope.customDashboards) {
        orgCompareService.setMetricLookup(vm.currentOrganization);
      }
      vm.metricDisplayInfo = orgCompareService.getMetricLookup();

      setupLayout();

      setNA();

      getNumberFormatInfo();

      setSelectedDateRange();

      setDatePeriods();

      setComparePeriods();

      setupWatch();

      if($rootScope.customDashboards) {
        vm.dateRanges = {
          dateRange : vm.selectedDatePeriod,
          compare1Range : vm.comparePeriods[0].datePeriod,
          compare2Range : vm.comparePeriods[1].datePeriod
        }
      }
    }

    function getSiteIdFromRow(row) {
      if (row && row.tag && row.tag.type === 'site') {
        return row.tag.id;
      }
    }

    function getCurrencySymbolForSite(siteId) {
      return _.pick(_.findWhere(vm.sites, {site_id: siteId}), 'currencySymbol').currencySymbol;
    }

    function getPrefixSymbol(metric, row) {
      var siteId = getSiteIdFromRow(row);

      // Get currency symbol for site row
      if (metric.isCurrency && siteId) {
        return getCurrencySymbolForSite(siteId);
      }

      if (metric.isCurrency && !siteId) {
        return vm.currencySymbol;
      }

      return metric.prefixSymbol;
    }

    function setMetrics() {
      var selectedMetrics = [];
      var metrics = vm.compare.metrics;
      if ($rootScope.pdf === true || $rootScope.customDashboards === true && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.activeSelectedMetrics)) {
        metrics = vm.compare.activeSelectedMetrics;
      }

      _.each(metrics, function(metric) {
        var metricInfo = _.find(vm.metricDisplayInfo, function(item){
          return item.value === metric || item.key === metric || item.kpi === metric;
        });

        if (!ObjectUtils.isNullOrUndefined(metricInfo)) {
          selectedMetrics.push(metricInfo);
        } else {
          console.warn('error metric is not found :' + metric);
        }
      });


      vm.metricSetByCode = true;
      vm.selectedMetrics = selectedMetrics;
    }

    function getTag(id, type, item) {
      return {
        id: id,
        type: type,
        name: ObjectUtils.isNullOrUndefined(item) ? id : item.name,
        item: item
      };
    }



    function setTags() {
      vm.tags = [];
      _.each(vm.compare.hierarchy_tag_ids, function(tagId) {
        vm.tags.push(getTag(tagId, 'hierarchy_tag', getOrganizationTag(tagId)));
      });

      if (hasSites()) {
        _.each(vm.compare.sites, function (siteId) {
          const siteDetails = getSite(siteId);
          if (!ObjectUtils.isNullOrUndefined(siteDetails)) { //removes sites that no longer exist from compare
            vm.tags.push(getTag(siteId, 'site', siteDetails));
          }
        });
      }
    }

    function getSite(siteId) {
      var site = _.findWhere(vm.sites, {
        site_id: siteId
      });
      return site;
    }

    function setDatePeriods() {
      vm.selectedDatePeriod = utils.getShortcutDateRange(vm.compare.selected_date_range.period_type, vm.currentOrganization, vm.currentUser);
      if ($rootScope.pdf === true && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.activeSelectedComparePeriods)) {
        vm.customDatePeriod1 = getDatePeriod( vm.compare.activeSelectedComparePeriods[0]);
        return;
      }

      vm.customDatePeriod1 = getDatePeriod(vm.compare.compare_period_1);

      if($rootScope.pdf) {
        // Fixes custom compare date ranges when overriden on custom dashboard:
        var newRangeType = ObjectUtils.getNestedProperty($scope, '$parent.$parent.export.newRange.rangeType');
        if (newRangeType && newRangeType !== vm.compare.selected_date_range.period_type) {
          switch(newRangeType){
            case 'wtd': newRangeType = 'week_to_date'; break;
            case 'mtd': newRangeType = 'month_to_date'; break;
            case 'qtd': newRangeType = 'quarter_to_date'; break;
            case 'ytd': newRangeType = 'year_to_date'; break
          }
          vm.compare.selected_date_range.period_type = newRangeType;
        }
      }
    }

    function setSelectedDateRange() {
      vm.selectedDateRange = [];

      var search = {
        key: vm.compare.selected_date_range.period_type
      };

      var item = _.findWhere(datePeriods, search);

      if (ObjectUtils.isNullOrUndefined(item)) {
        return;
      }

      item.selected = true;

      vm.selectedDateRange.push(item);
    }

    function setComparePeriods() {
      if ($rootScope.pdf === true && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.activeSelectedComparePeriods)) {
        vm.selectedComparePeriods  = vm.compare.activeSelectedComparePeriods;
        return;
      }

      vm.selectedComparePeriods = [];

      vm.comparePeriods = [{
        transKey: 'common.PRIORPERIOD',
        period_type: 'prior_period', //  possible values: 'prior_period', 'prior_year'
        custom_start_date: '', // only used if period_type is 'custom'
        custom_end_date: '' //  only used if period_type is 'custom'
      }, {
        transKey: 'common.PRIORYEAR',
        period_type: 'prior_year', //  possible values: 'prior_period', 'prior_year'
        custom_start_date: '', // only used if period_type is 'custom'
        custom_end_date: '' //  only used if period_type is 'custom'
      }];


      if (vm.compare.compare_period_1.period_type === 'prior_period') {
        var currentCalendarSettings = LocalizationService.getActiveCalendarSettings();

        switch(vm.compare.selected_date_range.period_type){
          case 'week':
            vm.comparePeriods[0].datePeriod = utils.getPreviousCalendarPeriodDateRange(vm.selectedDatePeriod);
            vm.comparePeriods[1].datePeriod = getDatePeriod(vm.comparePeriods[1]);

            vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod;
            vm.selectedComparePeriods.push(vm.comparePeriods[0]);
            break;
          case 'week_to_date':
            setWTDPeriods(currentCalendarSettings);
            break;
          case 'month_to_date':
            setMTDPeriods(currentCalendarSettings);
            break;
          case 'quarter_to_date':
            setQTDPeriods(currentCalendarSettings);
            break;
          case 'quarter':
            setQuarterPeriods(currentCalendarSettings);
            break;
          case 'year_to_date':
            setYTDPeriods(currentCalendarSettings);
            break;
          default:
            vm.comparePeriods[0].datePeriod = vm.customDatePeriod1;
            vm.comparePeriods[1].datePeriod = getDatePeriod(vm.comparePeriods[1]);
            vm.selectedComparePeriods.push(vm.comparePeriods[0]);
        }

        return;
      }

      vm.comparePeriods[1].datePeriod = vm.customDatePeriod1;
      vm.comparePeriods[0].datePeriod = getDatePeriod(vm.comparePeriods[0]);
      vm.selectedComparePeriods.push(vm.comparePeriods[1]);

    }

    /**
    * Sets the correct prior periods when the date range is WTD.
    *
    * @param {object} currentCalendarSettings calendarSettings from the localisation service
    * returns nothing, acts on comparePeriods and selectedComparePeriods properties on the VM object
    */
    function setWTDPeriods() {
      var firstDayOfCurrentWeek = LocalizationService.getFirstDayOfCurrentWeek();
      var currentTime = moment();
      if (utils.compareDate(currentTime, firstDayOfCurrentWeek) === 0) {
        vm.selectedDatePeriod.start = firstDayOfCurrentWeek.subtract(1, 'week');
        vm.selectedDatePeriod.end = LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week');
      } else {
        vm.selectedDatePeriod.start = firstDayOfCurrentWeek;
        vm.selectedDatePeriod.end = currentTime.subtract(1, 'day');
      }

      vm.comparePeriods[0].datePeriod = utils.getDateRangeForPreviousWTD(vm.selectedDatePeriod);
      vm.comparePeriods[1].datePeriod = utils.getEquivalentPriorYearDateRange(vm.selectedDatePeriod);

      if (LocalizationService.isCurrentCalendarGregorian()){
        vm.comparePeriods[1].datePeriod.start = vm.comparePeriods[1].datePeriod.start.add(1, 'days');
        vm.comparePeriods[1].datePeriod.end = vm.comparePeriods[1].datePeriod.end.add(1, 'days');
      }

      vm.customDatePeriod1 = utils.getDateRangeForPreviousWTD(vm.selectedDatePeriod); //updates the information periods (information.partial)
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);
    }

    /**
    * Sets the correct prior periods when the date range is MTD.
    *
    * returns nothing, acts on comparePeriods and selectedComparePeriods properties on the VM object
    */
    function setMTDPeriods(currentCalendarSettings) {
      if (LocalizationService.isGregorian(currentCalendarSettings)){

        var locale = moment().locale();
        var firstDayOfCurrentMonth = moment().startOf('month').startOf('day').add(locale, 'minutes');
        vm.selectedDatePeriod.start = firstDayOfCurrentMonth;
        vm.selectedDatePeriod.end = moment().endOf('day').add(locale, 'minutes').subtract(1, 'day');

      } else {

        var currentMonth, currentYear;
        var currentTime = moment();

        var systemDate = LocalizationService.getSystemYearForDate(currentTime);
        currentMonth = systemDate.month;
        currentYear = systemDate.year;

        if(!LocalizationService.hasMonthDefinitions()) {
          currentMonth = currentMonth - 1;
        }

        var firstDayOfCurrentMonth = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);

        if (utils.compareDate(currentTime, firstDayOfCurrentMonth) === 0) {
          if (currentMonth === 1) {
            currentMonth = 12;
            currentYear -= 1;
          }
          else {
            currentMonth -= 1;
          }
          vm.selectedDatePeriod.end = LocalizationService.getLastDayOfMonth(currentMonth, currentYear);
          vm.selectedDatePeriod.start = LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);
        }
        else {
          vm.selectedDatePeriod.start = firstDayOfCurrentMonth;
          vm.selectedDatePeriod.end = moment().subtract(1, 'day');
        }
      }

      vm.comparePeriods[0].datePeriod = utils.getDateRangeForPreviousMTD(vm.selectedDatePeriod);
      vm.comparePeriods[1].datePeriod = utils.getEquivalentPriorYearDateRange(vm.selectedDatePeriod);

      vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod; //updates the information periods (information.partial)
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);
    }

    /**
    * Sets the correct prior periods when the date range is QTD.
    *
    * @param {object} currentCalendarSettings calendarSettings from the localisation service
    * returns nothing, acts on comparePeriods and selectedComparePeriods properties on the VM object
    */
    function setQTDPeriods() {
      var currentTime = moment();
      var systemDate = LocalizationService.getSystemYearForDate(currentTime);
      var currentMonth = systemDate.month;
      var currentYear = systemDate.year;

      var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
      var firstMonthOfQuarter = utils.getFirstMonthInQuarter(currPeriod);
      var firstDayOfCurrentQuarter = LocalizationService.getFirstDayOfMonth(firstMonthOfQuarter, currentYear);

      if (utils.compareDate(currentTime, firstDayOfCurrentQuarter) === 0) {
        if (currPeriod === 1) {
          currPeriod = 4;
          currentYear -= 1;
          currentMonth = 12;
        }
        else {
          currPeriod -= 1;
          currentMonth -= 1;
        }

        vm.selectedDatePeriod.end = LocalizationService.getLastDayOfMonth(currentMonth, currentYear);
        vm.selectedDatePeriod.start = LocalizationService.getFirstDayOfMonth(utils.getFirstMonthInQuarter(currPeriod), currentYear);
      }
      else {
        vm.selectedDatePeriod.start = firstDayOfCurrentQuarter;
        vm.selectedDatePeriod.end = moment().subtract(1, 'day');
      }

      // vm.selectedDatePeriod.end = moment().endOf('day').subtract(1, 'day');
      vm.comparePeriods[1].datePeriod = utils.getEquivalentPriorYearDateRange(vm.selectedDatePeriod);
      vm.comparePeriods[0].datePeriod = utils.getDateRangeForPreviousQTD(vm.selectedDatePeriod);

      vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod; //updates the information periods (information.partial)
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);
    }

    /**
    * Sets the correct prior periods when the date range is Quarter.
    *
    * @param {object} currentCalendarSettings calendarSettings from the localisation service
    * returns nothing, acts on comparePeriods and selectedComparePeriods properties on the VM object
    */
    function setQuarterPeriods(currentCalendarSettings) {

      vm.selectedDatePeriod = utils.getPreviousCalendarPeriodDateRange(vm.selectedDatePeriod, vm.currentUser);

      if (LocalizationService.isGregorian(currentCalendarSettings)) {
        vm.selectedDatePeriod.start = vm.selectedDatePeriod.start.add(1, 'days');
      }

      vm.comparePeriods[0].datePeriod = utils.getPreviousCalendarPeriodDateRange(vm.selectedDatePeriod, vm.currentUser);
      vm.comparePeriods[1].datePeriod = utils.getEquivalentPriorYearDateRange(vm.selectedDatePeriod);

      if (LocalizationService.isGregorian(currentCalendarSettings)) {
        var month = moment(vm.comparePeriods[0].datePeriod.start).month();
        var year = moment(vm.comparePeriods[0].datePeriod.start).year();
        vm.comparePeriods[0].datePeriod.start = moment(LocalizationService.getFirstDayOfMonth(month, year)).startOf('day');
        vm.comparePeriods[0].datePeriod.end = moment(vm.comparePeriods[0].datePeriod.end).endOf('day').subtract(1, 'day');
      } else {
        vm.comparePeriods[0].datePeriod.start.subtract(1, 'days');
        vm.comparePeriods[0].datePeriod.end.subtract(1, 'days');
      }

      vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod; //updates the information periods (information.partial)
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);
    }

    /**
    * Sets the corect prior periods when the date range is YTD.
    *
    * returns nothing, acts on comparePeriods and selectedComparePeriods properties on the VM object
    */
    function setYTDPeriods(currentCalendarSettings) {
      vm.comparePeriods[0].datePeriod = utils.getDateRangeForPreviousYTD(vm.selectedDatePeriod);
      vm.comparePeriods[1].datePeriod = utils.getEquivalentPriorYearDateRange(vm.comparePeriods[0].datePeriod);

      vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod; //updates the information periods (information.partial)

      if (LocalizationService.isGregorian(currentCalendarSettings)) {
        vm.comparePeriods[1].datePeriod.end = moment(vm.comparePeriods[1].datePeriod.end).add(1, 'days');
      }

      vm.customDatePeriod1 = vm.comparePeriods[0].datePeriod; //updates the information periods (information.partial)
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);

      if ($rootScope.customDashboards  && vm.compare.activeSelectedComparePeriods) {
        vm.selectedComparePeriods  = vm.compare.activeSelectedComparePeriods;
      } else {
        vm.selectedComparePeriods.push(vm.comparePeriods[1]);
      }
    }

    function getDatePeriod(period) {
      if (ObjectUtils.isNullOrUndefined(period)) {
        return null;
      }

      if (period.period_type === 'custom') {
        return {
          start: moment(period.custom_start_date),
          end: moment(period.custom_end_date)
        };
      }
      return dateRangeHelper.getDateRange(period.period_type, vm.selectedDatePeriod, vm.currentUser, vm.currentOrganization, $rootScope.firstDaySetting);
    }

    function getOrganizationTag(tagId) {
      var foundTag = {};
      if (!ObjectUtils.isNullOrUndefined(vm.currentOrganization.portal_settings) &&
        !ObjectUtils.isNullOrUndefined(vm.currentOrganization.portal_settings.group_structures)) {
        _.each(vm.currentOrganization.portal_settings.group_structures, function(tagGroup) {
          _.each(tagGroup.levels, function(tag) {
            _.each(tag.possible_values, function(tagValue) {
              if (tagValue._id === tagId) {
                foundTag = tagValue;
              }
            });
          });
        });
      }
      return foundTag;
    }

    function setNA() {
      vm.NA = '-';
    }

    function buildChartTitle() {
      vm.chartTitle = 'customCompare.CHANGE';
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics) && vm.compare.type === 'single') {
        var metric = vm.selectedMetrics[0];
        vm.chartTitle = metric.shortTranslationLabel;

        vm.translatedChartTitle = metric.displayName;
      }
    }

    function getNumberFormatInfo() {
      vm.numberFormatName = LocalizationService.getCurrentNumberFormatName(vm.currentUser, vm.currentOrganization);
    }

    function setHasData() {
      vm.hasData = !ObjectUtils.isNullOrUndefined(vm.chartData) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(vm.chartData.chartWithData);

      vm.hasTableData = !ObjectUtils.isNullOrUndefined(vm.tableData) &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(vm.tableData.tableData);
    }

    function updateWidget() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.metrics)) {
        return;
      }

      setTags();

      setMetrics();

      setSelectedDateRange();

      setDatePeriods();

      setComparePeriods();

      buildChartTitle();

      vm.loading = true;
      vm.loaded = false;
      vm.requestFailed = false;
      fetchData()
        .then(transformData)
        .then(function() {
          setLoadingCompleted(false);
        })
        .catch(function(error) {
          setLoadingCompleted(true, error);
        });
    }

    function metricChange() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics)) {
        return;
      }

      var keys = _.map(vm.selectedMetrics, function (metric) {return metric.key;});
      vm.compare.activeSelectedMetrics = keys;
      buildChartTitle();

      vm.loading = true;
      vm.loaded = false;
      vm.requestFailed = false;
      fetchData()
        .then(transformData)
        .then(function() {
          setLoadingCompleted(false);
        })
        .catch(function(error) {
           setLoadingCompleted(true, error);
        });
    }

    function setLoadingCompleted(requestFailed, error){
      vm.firstLoad = false;
      vm.loading = false;
      vm.requestFailed = false;
      vm.loaded = true;
      if(requestFailed === true && error !== 'User cancelled') {
        vm.requestFailed = true;
        vm.hasData = false;
        vm.chartData = null;
        vm.tableData = null;
      }
    }

    function customPeriodChange() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedComparePeriods)) {
        return;
      }

      vm.customDatePeriod1 = getDatePeriod(vm.selectedComparePeriods[0]);

      vm.loading = true;
      vm.loaded = false;
      vm.requestFailed = false;
      fetchData()
        .then(transformData)
        .then(function() {
          setLoadingCompleted(false);
        })
        .catch(function(error) {
          setLoadingCompleted(true, error);
        });
    }

    function transformData(responses) {
      vm.chartData = orgCompareService.transformDataForChart(responses, vm.selectedMetrics, vm.dateFormatMask, vm.tags, vm.compare.type, vm.compare.selected_date_range.period_type);
      vm.tableData = orgCompareService.transformDataForTable(responses, vm.selectedMetrics, vm.dateFormatMask, vm.tags, vm.selectedDatePeriod, vm.customDatePeriod1);

      if (!ObjectUtils.isNullOrUndefined(vm.chartData)) {
        vm.chartConfig = buildHighchartConfig(vm.chartData, 'single');
      }

      setHasData();
    }

    function getGroupByForChart() {
      var aggreagate = 'aggregate';
      if (vm.compare.type === 'multi') {
        return aggreagate;
      }
      // 'day', 'week' or 'month'
      switch (vm.compare.selected_date_range.period_type) {
        case 'year':
          return 'month';
        case 'year_to_date':
          return 'month';
        case 'ytd':
          return 'month';
        case 'quarter':
          return 'month';
        case 'quarter_to_date':
          return 'month';
        case 'qtd':
          return 'month';
        case 'month':
          return 'week';
        case 'month_to_date':
          return 'week';
        case 'mtd':
          return 'week';
        case 'week':
          return 'day';
        case 'week_to_date':
          return 'day';
        case 'wtd':
          return 'day';
        case 'day':
          return 'hour';
        default:
          return 'day';
      }
    }

    function getKpiList() {
      var kpiList = [];
      _.each(vm.selectedMetrics, function(metric) {
        if(ObjectUtils.isNullOrUndefinedOrEmpty(kpiList) || !_.contains(kpiList, metric.key)) {
          kpiList.push(metric.apiPropertyName);
        }
        if(metric.calculatedMetric === true) {
          _.each(metric.dependencies, function(dependency) {
            if(!_.contains(kpiList, dependency)) {
              kpiList.push(dependency);
            }
          });
        }
      });

      //make sure we have traffic in the list since kpi report api fails without it
      if(!_.contains(kpiList, 'traffic')) {
        kpiList.push('traffic');
      }

      return kpiList;
    }

    function getMetricList() {
      if ($rootScope.pdf === true && !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.activeSelectedMetrics)) {
         return vm.compare.activeSelectedMetrics;
      }
      return vm.compare.metrics;
    }

    function fetchData() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.metrics)) {
        return;
      }
      vm.loading = true;
      vm.loaded = false;
      var queries = [];
      var kpiList = getKpiList();
      var aggreagate = getGroupByForChart();
      var metricList = getMetricList();

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.hierarchy_tag_ids)) {
        _.each(vm.tags, function(tag) {
          if (tag.type === 'hierarchy_tag') {
            queries.push(orgCompareService.getCustomCompareData(getDataParams(aggreagate, 'tag', tag.id, kpiList), dateRangeHelper.getDateRangeParams(vm.selectedDatePeriod),
              metricList, vm.compare.type, 'chartData', 'tag', tag));
            queries.push(orgCompareService.getCustomCompareData(getDataParams(aggreagate, 'tag', tag.id, kpiList), dateRangeHelper.getDateRangeParams(vm.customDatePeriod1),
              metricList, vm.compare.type, 'compareData', 'tag', tag));
          }
        });
      }

      if (hasSites()) {
        queries.push(orgCompareService.getCustomCompareData(getDataParams(aggreagate, 'sites', '', kpiList), dateRangeHelper.getDateRangeParams(vm.selectedDatePeriod),
          metricList, vm.compare.type, 'chartData', 'sites', vm.compare.sites));
        queries.push(orgCompareService.getCustomCompareData(getDataParams(aggreagate, 'sites', '', kpiList), dateRangeHelper.getDateRangeParams(vm.customDatePeriod1),
          metricList, vm.compare.type, 'compareData', 'sites', vm.compare.sites));
      }
      return $q.all(queries);
    }

    function hasSites() {
      return !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.sites)  &&
        _.min(vm.compare.sites) > 0;
    }

    function getDataParams(groupBy, type, tag, kpiList) {
      var params = {
        orgId: vm.currentOrganization.organization_id,
        groupBy: groupBy, // groupBy can be 'day', 'week' or 'month'
        operatingHours: 'true',
        kpi: kpiList
      };

      if (type === 'tag') {
        params.hierarchyTagId = tag;
      }

      if (type === 'sites') {
        params.siteId = vm.compare.sites;
      }

      if (hasSalesCategory()) {
        params.sales_category_id = vm.compare.salesCategories.map(function(category) {
          return category.id;
        });
      }

      return params;
    }

    function hasSalesCategory() {
     return !ObjectUtils.isNullOrUndefinedOrEmpty(vm.currentOrganization.portal_settings.sales_categories) &&
       !ObjectUtils.isNullOrUndefinedOrEmpty(vm.compare.salesCategories) && _.min(vm.compare.salesCategories, function(item){return item.id;}) > 0;
    }

    function setupWatch() {
      unbindPreviewInProgressWatch = $scope.$watch('vm.previewInProgress', function() {
        if (vm.previewInProgress !== true ||
          ObjectUtils.isNullOrUndefined(vm.compare.metrics) ||
          ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
          return;
        }

        vm.loaded = false;

        updateWidget();

      });

      unbindCompareWatch = $scope.$watchGroup(['vm.compare'], function() {
        if (ObjectUtils.isNullOrUndefined(vm.compare.metrics) ||
          ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
          return;
        }
        vm.loaded = false;
        updateWidget();
      });

      unbindEditModeWatch = $scope.$watchGroup(['vm.editMode'], function() {
        if (ObjectUtils.isNullOrUndefined(vm.compare.metrics) ||
          ObjectUtils.isNullOrUndefined(vm.currentOrganization)) {
          return;
        }

        if(vm.editMode === 'editCompareCompleted') {
          setMetrics();
        }

        vm.loaded = false;
        updateWidget();
      });

      unbindMetricSelectorWatch = $scope.$watchGroup(['vm.selectedMetrics'], function() {
        if (vm.firstLoad || ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedMetrics)) {
          return;
        }
        vm.loaded = false;
        metricChange();
      });

      $scope.$on('$destroy', function() {
        if (typeof unbindPreviewInProgressWatch === 'function') {
          unbindPreviewInProgressWatch();
        }

        if (typeof unbindEditModeWatch === 'function') {
          unbindEditModeWatch();
        }

        if (typeof unbindMetricSelectorWatch === 'function') {
          unbindMetricSelectorWatch();
        }

        if (typeof unbindCompareWatch === 'function') {
          unbindCompareWatch();
        }
      });
    }

    function setComparePeriod(item) {

      if(vm.selectedComparePeriods[0].period_type === item.period_type) {
        //already selected
        return;
      }
      vm.selectedComparePeriods = [];
      vm.selectedComparePeriods.push(item);
      vm.compare.activeSelectedComparePeriods = vm.selectedComparePeriods;
      vm.loaded = false;
      customPeriodChange();
    }

    function orderBy(metric, property) {
      if (ObjectUtils.isNullOrUndefined(vm.tableData) || ObjectUtils.isNullOrUndefinedOrEmpty(vm.tableData.tableData)) {
        return;
      }

      var prop;

      if(typeof(metric) === 'string') {
        prop = metric + '.' + property;
      } else {
        prop = metric.kpi + '.' + property;
      }

      if(vm.sortProp[prop] === 'asc') {
        vm.sortProp[prop] = 'desc';
      } else {
        vm.sortProp[prop] = 'asc';
      }

      var sortDirection = vm.sortProp[prop];

      var ordered = _.sortBy(vm.tableData.tableData, function(row) {
        var val = $parse(prop)(row);
        if(sortDirection === 'desc' && !isNaN(val)) {
          return -val;
        } else {
          return val;
        }
      });

      if(metric === 'tag' && sortDirection === 'desc') {
        ordered.reverse();
      }

      vm.tableData.tableData = ordered;

      if(typeof(metric) === 'object') {
        vm.currentSort = {
          metric: metric.apiPropertyName,
          property: property
        };
      } else {
        vm.currentSort = {
          metric: metric,
          property: property
        };
      }

      vm.currentSortDirection = sortDirection;
    }

    function setupLayout() {
      if ($rootScope.pdf) {
        vm.averageTranskey = 'common.AVG';
        vm.additionalTableCssClass = 'reduced-padding';
      } else {
        vm.averageTranskey = 'common.AVERAGE';
      }
    }

    function setxAxisChartLabels(chartLabels) {
      vm.xAxisChartLabels = chartLabels;
    }

    function getChartType() {
      if (vm.compare.type === 'multi') {
        return 'column';
      }

      return 'line';
    }

    function getSeriesName(data) {
      if (ObjectUtils.isNullOrUndefined(data)) {
        return 'no data name';
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.displayName)) {
        return data.displayName;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.transkey)) {
        var translated2 = $filter('translate')(data.transkey);

        if (!ObjectUtils.isNullOrUndefinedOrBlank(translated2)) {
          return translated2;
        }
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.key)) {
        return data.key;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data)) {
        var tag = _.find(vm.tags, {
          id: data
        });

        if (!ObjectUtils.isNullOrUndefined(tag)) {
          return tag.name;
        }
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.name)) {
        return data.name;
      }

      return data;
    }

    function getTagKey(data) {
      if (ObjectUtils.isNullOrUndefined(data)) {
        return 'ERROR';
      }

      var tag = _.find(vm.tags, {
        id: data
      });

      if (!ObjectUtils.isNullOrUndefined(tag) && !ObjectUtils.isNullOrUndefined(tag)) {
        return tag.name;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.name)) {
        return data.name;
      }

      if (!ObjectUtils.isNullOrUndefinedOrBlank(data.key)) {
       return data.key;
      }

    }

    function getIndex(itemWithData) {
      if (vm.compare.type === 'multi') {
        //itemWithData is metric
        return _.findIndex(vm.selectedMetrics, function(item) {
          return item.key === itemWithData.key || item.value === itemWithData.value;
        });
      }

      //itemWithData is hierarcy or site (tag)
      return _.findIndex(vm.tags, {
        id: itemWithData.id
      });
    }

    function getChartColor(itemWithData) {
      if (ObjectUtils.isNullOrUndefined(itemWithData)) {
        return _.last(chartColors);
      }
      return chartColors[getIndex(itemWithData)];
    }

    function buildHighchartConfig(chartData, yAxisType) {
      if (!ObjectUtils.isNullOrUndefined(chartData)) {
        var seriesData = [],
          yAxisData = [],
          xAxisTickAmount = 1;

        if (!ObjectUtils.isNullOrUndefined(chartData.labels)) {
          xAxisTickAmount = chartData.labels.length + 1;
        }

        // We have to set the xAxis labels since they change depending on user selected filters
        // this is for the formatter bug on the tooltips
        setxAxisChartLabels(chartData.labels);

        // y-axis
        if (yAxisType === 'single') {
          yAxisData.push({
            labels: {
              formatter: function() {
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
          _.each(chartData.chartWithData, function(chart, index) {
            var oppositeValue = false;
            var chartColor = getChartColor(chart);

            if (index === 1) {
              oppositeValue = true;
            }

            yAxisData.push({
              labels: {
                style: {
                  color: chartColor
                },
                formatter: function() {
                  return Math.round(this.value);
                }
              },
              title: {
                text: '',
                style: {
                  color: chartColor,
                }
              },
              allowDecimals: false,
              opposite: oppositeValue,
              gridLineDashStyle: 'Dot',
              gridLineColor: '#b0b0b0'
            });
          });
        }

        // series data
        _.each(chartData.series, function(data, index) {
          if(!ObjectUtils.isNullOrUndefinedOrEmpty(data)){
            seriesData.push(populateSeriesData(chartData ,data, index, yAxisType));
          }
        });

        var chartConfig = {
          options: {
            chart: {
              type: getChartType(),
              height: 225,
              style: {
                fontFamily: '"Source Sans Pro", sans-serif'
              },
              events: {
                load: function(event) {
                  event.target.reflow();
                }
              }
            },
            tooltip: {
              shared: true,
              useHTML: true,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderColor: '#e5e5e5',
              shadow: false,
              formatter: createToolTip
            },
            exporting: {
              enabled: false
            }
          },
          title: {
            text: ''
          },
          xAxis: {
            crosshair: false,
            tickLength: 0,
            showLastLabel: true,
            labels: {
              autoRotation: [-45],
              style: {
                textOverflow: 'none',
                color: '#929090'
              },
              tickAmount: xAxisTickAmount,
              formatter: function() {
                return chartData.labels[this.value];
              }
            }
          },
          yAxis: yAxisData,
          series: seriesData
        };

        if($rootScope.pdf) {
          vm.loadRun = 0;
          vm.renderReady = false;
          chartConfig.options.events = {
            load: vm.renderReady = true,
          }
          $scope.$watchGroup(['vm.isLoading', 'vm.renderReady'],
            function () {
              if (!vm.isLoading && vm.renderReady && vm.loadRun < 1) {
                $rootScope.pdfExportsLoaded += 1;
                vm.loadRun += 1;
              }
            }
          );
          chartConfig.options.plotOptions = {
              series: {
                  animation: false
              }
          }
        }

        if($rootScope.customDashboards) {
          chartConfig.xAxis.tickInterval = 1;
        }

        return chartConfig;
      }
    }

    function toogleTableShow() {
      if(vm.editMode === 'edit') {
        return;
      }
      vm.compare.showTable = !vm.compare.showTable;
    }

    function populateSeriesData(chartData ,data, index, yAxisType) {
      var yAxisValue;

      if (yAxisType === 'single') {
        yAxisValue = 0;
      } else {
        yAxisValue = index;
      }

      if (chartData.chartWithData[index] && chartData.chartWithData[index].type === 'site') {
        var siteId = chartData.chartWithData[index].id;
      }

      var currencySymbol = getCurrencySymbolForSite(siteId);

      return {
        showInLegend: false,
        tagKey: getTagKey(chartData.chartWithData[index]),
        tag: chartData.chartWithData[index],
        name: getSeriesName(chartData.chartWithData[index]),
        yAxis: yAxisValue,
        data: getSeriesDataValue(data),
        color: getChartColor(chartData.chartWithData[index]),
        marker: {
          symbol: 'circle',
          radius: 3
        },
        states: {
          hover: {
            lineWidth: 2
          }
        },
        currencySymbol: currencySymbol
      };
    }

    function getSeriesDataValue(data) {
      if(vm.compare.type === 'single') {
        return data;
      }

      return _.map(data, function (item) {
        return item.comparisonData.percentageChangeReal;
      });
    }

    function createToolTip() {
      var title = '<div class="tooltip-header">' + getToolTipHeader(vm.xAxisChartLabels[this.x]) + '</div><div>';

      return title + getToolTipBody(this) + '</div>';
    }

    function getToolTipBody(chart) {
      if (vm.compare.type === 'multi') {
        return getMetricListToolTip(chart);
      }

      return getTagListToolTip(chart);
    }

    function populateToolTipBody(item, numberFormat) {
      var body = '';

      body += ' <div class="col-xs-12 chart-legend-label">';

      body += ' <label>' + item.name + '</label>';

      var valueLabel = ' <label class="tooltip-value">' ;

      if(!ObjectUtils.isNullOrUndefinedOrBlank(numberFormat.prefixSymbol) && item.value !== vm.NA) {
        valueLabel += numberFormat.prefixSymbol;
      }

      var value = item.value;

      if(item.value !== vm.NA) {
        value = $filter('formatNumber')(item.value, numberFormat.precision, vm.numberFormatName);
      }

      valueLabel += value;

      if(!ObjectUtils.isNullOrUndefinedOrBlank(numberFormat.suffixSymbol) && item.value !== vm.NA) {
        valueLabel += numberFormat.suffixSymbol;
      }

      valueLabel += '</label>';

      body += valueLabel;

      body += ' </div>';

      return body;
    }

    function getNameValue(chart, tagKey, tag) {
      var item = _.filter(chart.points, function(point) {
        return point.series.options.tagKey === tagKey;
      });

      if (ObjectUtils.isNullOrUndefinedOrEmpty(item)) {
        return {
          name: getSeriesName(tag),
          value: vm.NA
        };
      }
      return {
        name: item[0].series.options.name,
        value: item[0].y
      };
    }

    function getMetricListToolTip(chart) {
      var body = '';

      var numberFormat = {
        suffixSymbol: '%',
        precision: 1
      };

      _.each(vm.selectedMetrics, function(metric) {
        body += populateToolTipBody(getNameValue(chart, metric.key, metric), numberFormat);
      });
      return body;

    }

    function getTagListToolTip(chart) {
      var body = '';

      var numberFormat = {
        prefixSymbol: vm.selectedMetrics[0].prefixSymbol,
        suffixSymbol: vm.selectedMetrics[0].suffixSymbol,
        precision: vm.selectedMetrics[0].precision
      };

      _.each(vm.tags, function(tag) {
        if (tag && tag.type === 'site' && numberFormat.prefixSymbol !== '') {
          var currencySymbol = getCurrencySymbolForSite(tag.id);
          numberFormat.prefixSymbol = currencySymbol;
        }
        body += populateToolTipBody(getNameValue(chart, tag.name, tag), numberFormat);
      });
      return body;
    }

    function getToolTipHeader(itemLabel) {
      if (vm.compare.type === 'single') {
        return vm.translatedChartTitle + ' ' + itemLabel;
      }
      return itemLabel;
    }

    function isValidNumber(value, property) {
      return !ObjectUtils.isNullOrUndefined(value) && !ObjectUtils.isNullOrUndefined(value[property]) &&
        !isNaN(value[property]) && isFinite(value[property]);
    }
  }
})();
