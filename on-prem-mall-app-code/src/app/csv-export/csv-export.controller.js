(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('CSVExportCtrl', CSVExportCtrl);

  CSVExportCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$translate',
    '$filter',
    '$http',
    '$anchorScroll',
    '$location',
    '$q',
    '$timeout',
    '$window',
    'currentOrganization',
    'currentSite',
    'currentUser',
    'LocalizationService',
    'csvExportConstants',
    'apiUrl',
    'OrganizationResource',
    'SiteResource',
    'LocationResource',
    'ZoneResource',
    'utils',
    'SubscriptionsService',
    'ObjectUtils',
    'internalDateFormat',
    'googleAnalytics',
    'activeFilters',
    'dateRangeService',
    'authService',
    'metricConstants'
  ];

  function CSVExportCtrl (
    $scope,
    $rootScope,
    $stateParams,
    $translate,
    $filter,
    $http,
    $anchorScroll,
    $location,
    $q,
    $timeout,
    $window,
    currentOrganization,
    currentSite,
    currentUser,
    LocalizationService,
    csvExportConstants,
    apiUrl,
    OrganizationResource,
    SiteResource,
    LocationResource,
    ZoneResource,
    utils,
    SubscriptionsService,
    ObjectUtils,
    internalDateFormat,
    googleAnalytics,
    activeFilters,
    dateRangeService,
    authService,
    metricConstants
  ) {

    var vm = this;

    var newline = '\r\n';
    var entranceNameTranslation;
    var noDataText;

    activate();

    function activate () {
      initScope();
      configureWatches();
      getActiveSubscriptions();
      setupComparePeriods();

      LocalizationService.setOrganization(vm.currentOrganization);
      LocalizationService.setUser(vm.currentUser);

      setDateRange();
      vm.language = LocalizationService.getCurrentLocaleSetting();
      vm.dateFormat = LocalizationService.getCurrentDateFormat(vm.currentOrganization);

      if (!ObjectUtils.isNullOrUndefined(currentSite)) {
        vm.siteLevel = true;
        vm.currentSiteName = vm.currentSite.name;
        vm.locations = loadSiteLocations(vm.currentOrganization, vm.currentSite);
        vm.zones = loadSiteZones(vm.currentOrganization, vm.currentSite);

        if (!ObjectUtils.isNullOrUndefinedOrBlank($stateParams.zoneId)) {
          vm.zoneLevel = true;
          vm.selectedZone = _.find(vm.currentSite.zones, function (_zone) {
            return Number($stateParams.zoneId) === _zone.id;
          });
        }
      } else {
        vm.siteLevel = false;
        vm.currentOrganizationName = vm.currentOrganization.name;
        vm.sites = loadOrganizationSites(vm.currentOrganization);
      }

      // If only one tag, site or kpi is provided, they will string instead of array
      if ($stateParams.tag !== undefined) {
        if (typeof $stateParams.tag === 'string') {
          $stateParams.tag = [$stateParams.tag];
        }
        vm.tags = $stateParams.tag;
      }
      if ($stateParams.site !== undefined) {
        if (typeof $stateParams.site === 'string') {
          $stateParams.site = [$stateParams.site];
        }
        vm.selectedSites = $stateParams.site;
      }
      if ($stateParams.kpi !== undefined) {
        if (typeof $stateParams.kpi === 'string') {
          $stateParams.kpi = [$stateParams.kpi];
        }
        vm.selectedMetrics = $stateParams.kpi;
        var kpis = $stateParams.kpi;
        _.each(kpis, function (kpi) {
          var metric = _.findWhere(vm.metrics, { kpi: kpi });

          var group = _.findWhere(vm.groups, { name: metric.group });

          if (vm.hasSubscription(group.subscription) && SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, currentOrganization)) {
            vm.selectedMetrics[kpi] = true;
          }
        });

        setSalesCategoryVisibility();
      }

      if ($stateParams.startDate !== undefined && $stateParams.endDate !== undefined) {
        vm.dateRange = {
          start: moment($stateParams.startDate, internalDateFormat),
          end: moment($stateParams.endDate, internalDateFormat)
        };
        vm.selectedDateRange = angular.copy(vm.dateRange);
      }

      if (!ObjectUtils.isNullOrUndefined($stateParams.compareRangeStart) && !ObjectUtils.isNullOrUndefined($stateParams.compareRangeEnd)) {
        vm.compareDateRange = {
          start: moment($stateParams.compareRangeStart, internalDateFormat),
          end: moment($stateParams.compareRangeEnd, internalDateFormat)
        };
      }

      loadTranslations();
      loadSchedules();
      loadCalendars();
      loadSalesCategories();
    }

    /**
     * Initialises the scope.
     * This function should be used to assign functions to the vm, or any default values.
     * Other logic should go in the activate chain.
     *
     */
    function initScope () {
      vm.log = ObjectUtils.isNullOrUndefined($scope.log) ? true : $scope.log;
      vm.currentOrganization = currentOrganization;
      vm.currentSite = currentSite;
      vm.currentUser = currentUser;
      vm.groups = csvExportConstants.groups;
      vm.groupByChoices = csvExportConstants.groupByChoices;
      vm.frequencyChoices = csvExportConstants.frequencyChoices;
      vm.activeChoices = csvExportConstants.activeChoices;
      vm.activeFilters = activeFilters;
      vm.activeShortcut = $stateParams.activeShortcut;
      vm.translationsLoaded = false;
      vm.activeGroup = 'perimeter';
      vm.selectedMetrics = {}; //used {} instead of [] to allow watch for changes in properties
      vm.businessHours = true;
      vm.selectedSites = [];
      vm.selectedLocations = [];
      vm.selectedZones = [];
      vm.selectedTmps = [];
      vm.tags = [];
      vm.customTags = [];
      vm.groupBySetting = 'day';
      vm.hoursDisabled = false;
      vm.selectedSitesData = [];
      vm.siteTags = [];

      vm.numExportsInProgress = 0;
      vm.activeSetting = 6;
      vm.frequencySetting = vm.frequencyChoices[0];

      /** @todo: Scheduling could be extracted into own service to make this controller cleaner. */

      vm.setActiveGroup = setActiveGroup;
      vm.selectMetric = selectMetric;
      vm.setActive = setActive;
      vm.setWeekDay = setWeekDay;
      vm.setMonthDay = setMonthDay;
      vm.setMonth = setMonth;
      vm.weekDayIsSetTo = weekDayIsSetTo;
      vm.dayIsSetTo = dayIsSetTo;
      vm.monthIsSetTo = monthIsSetTo;
      vm.addEMail = addEMail;
      vm.removeEmail = removeEmail;
      vm.toggleSchedulingForm = toggleSchedulingForm;
      vm.deleteSchedule = deleteSchedule;
      vm.toggleSite = toggleSite;
      vm.toggleLocation = toggleLocation;
      vm.siteIsSelected = siteIsSelected;
      vm.locationIsSelected = locationIsSelected;
      vm.metricIsDisabled = metricIsDisabled;
      vm.selectAllSites = selectAllSites;
      vm.isAllSitesSelected = isAllSitesSelected;
      vm.selectAllZones = selectAllZones;
      vm.getSiteNameById = getSiteNameById;
      vm.setSelectedFilters = setSelectedFilters;
      vm.setGroupBy = setGroupBy;
      vm.getSelectedGroupByName = getSelectedGroupByName;
      vm.doExport = doExport;
      vm.loadSchedules = loadSchedules;
      vm.organizationIsTypeRetail = organizationIsTypeRetail;
      vm.setExportSiteOverall = setExportSiteOverall;
      vm.selectAllLocations = selectAllLocations;
      vm.toggleZone = toggleZone;
      vm.zoneIsSelected = zoneIsSelected;
      vm.tmpIsSelected = tmpIsSelected;
      vm.locationIsSelected = locationIsSelected;
      vm.getZoneNameById = getZoneNameById;
      vm.getTmpById = getTmpById;
      vm.getLocationNameById = getLocationNameById;
      vm.selectAllLocations = selectAllLocations;
      vm.removeAllLocations = removeAllLocations;
      vm.removeAllZones = removeAllZones;
      vm.canBeExported = canBeExported;
      vm.removeAllTags = removeAllTags;
      vm.removeAllSites = removeAllSites;
      vm.tagDropdownIsDisabled = tagDropdownIsDisabled;
      vm.siteDropdownIsDisabled = siteDropdownIsDisabled;
      vm.hasSubscription = hasSubscription;
      vm.toggleReport = toggleReport;
      vm.clearSitesAndFilters = clearSitesAndFilters;
      vm.selectComparePeriod = selectComparePeriod;
      vm.back = back;

      vm.mailCC = [{ email: null }];

      vm.weekDays = [
        $filter('translate')('weekdaysShort.sun'),
        $filter('translate')('weekdaysShort.mon'),
        $filter('translate')('weekdaysShort.tue'),
        $filter('translate')('weekdaysShort.wed'),
        $filter('translate')('weekdaysShort.thu'),
        $filter('translate')('weekdaysShort.fri'),
        $filter('translate')('weekdaysShort.sat')
      ];

      vm.monthParts = [
        $filter('translate')('common.FIRST'),
        $filter('translate')('common.15TH'),
        $filter('translate')('common.LAST')
      ];

      vm.months = [
        $filter('translate')('monthsShort.january'),
        $filter('translate')('monthsShort.february'),
        $filter('translate')('monthsShort.march'),
        $filter('translate')('monthsShort.april'),
        $filter('translate')('monthsShort.may'),
        $filter('translate')('monthsShort.june'),
        $filter('translate')('monthsShort.july'),
        $filter('translate')('monthsShort.august'),
        $filter('translate')('monthsShort.september'),
        $filter('translate')('monthsShort.october'),
        $filter('translate')('monthsShort.november'),
        $filter('translate')('monthsShort.december')
      ];
    }

    /**
     * Configures watches and destroys them
     */
    function configureWatches () {
      var watches = [];

      watches.push($scope.$watch('vm.activeGroup', onActiveGroupChange));

      watches.push($scope.$watchCollection('vm.selectedMetrics', onSelectedMetricsChange));

      watches.push($scope.$watch('vm.dateRange', onDateRangeChange));

      watches.push($scope.$watch('vm.selectedComparePeriods', onSelectedComparePeriodsChange));

      $scope.$on('$destroy', function () {
        _.each(watches, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function onSelectedComparePeriodsChange (newSelectedComparePeriods) {
      selectComparePeriod(newSelectedComparePeriods);
    }

    function onSelectedMetricsChange (newMetrics, oldMetrics) {
      if (newMetrics === oldMetrics) {
        return;
      }
      setSalesCategoryVisibility();
    }

    function onActiveGroupChange () {
      if (vm.activeGroup === 'interior') {
        vm.hoursDisabled = true;
        vm.businessHours = false;

        if (vm.groupBySetting === 'hour') {
          vm.groupBySetting = 'day';
          vm.disabled = false;
        }
      } else {
        vm.hoursDisabled = false;
      }
    }

    function back () {
      $window.history.back();
    }

    function onDateRangeChange (dateRange) {
      if (ObjectUtils.isNullOrUndefined(dateRange)) {
        return;
      }
      //changes to get proper date ranges when user selects dateRange from the calendar
      if (vm.selectedComparePeriods) {
        _.each(vm.selectedComparePeriods, function (item) {
          if (item.key === 'none') return;
          if (item.key === 'prior_period') {
            vm.compareDateRange1 = getCompareDateRanges(item.key)
          }
          if (item.key === 'prior_year') {
            vm.compareDateRange2 = getCompareDateRanges(item.key)
          }
        });
      }
    }

    function setDateRange () {
      var firstDay = getOrganizationStartOfWeek();
      var now = moment();
      if (firstDay === 1) {
        vm.dateRange = {
          start: moment(now).startOf('week').subtract(1, 'week').add(1, 'days'),
          end: moment(now).startOf('week').subtract(1, 'week').endOf('week').add(1, 'days')
        };
      } else {
        vm.dateRange = {
          start: moment(now).startOf('week').subtract(1, 'week'),
          end: moment(now).startOf('week').subtract(1, 'week').endOf('week')
        };
      }
      vm.selectedDateRange = angular.copy(vm.dateRange);
    }

    /**
     * Sets up the compare period options to be used in the dropdown on the UI.
     * Also selects the "none" option as the default.
     */
    function setupComparePeriods () {
      vm.comparePeriods = [{
        key: 'none',
        transkey: 'common.NONE',
        selectionType: 'single'
      }, {
        key: 'prior_period',
        transkey: 'common.PRIORPERIOD'
      }, {
        key: 'prior_year',
        transkey: 'common.PRIORYEAR'
      }];

      vm.selectedComparePeriods = [];
      vm.selectedComparePeriods.push(vm.comparePeriods[0]);
    }

    /**
     * Sets the current selected comparePeriod.
     * Assigned to the vm and is called by the UI, as well as setupComparePeriods()
     */
    function selectComparePeriod (comparePeriod) {
      vm.comparePeriod1 = 'none';
      vm.comparePeriod2 = 'none';
      vm.compareDateRange1 = null;
      vm.compareDateRange2 = null;

      _.each(comparePeriod, function (item) {
        if (item.key === 'prior_period' && item.selected) {
          vm.comparePeriod1 = item;
          vm.compareDateRange1 = getCompareDateRanges(item.key);
        }
        if (item.key === 'prior_year' && item.selected) {
          vm.comparePeriod2 = item;
          vm.compareDateRange2 = getCompareDateRanges(item.key);
        }
      })
    }

    function getCompareDateRanges (periodTypeKey) {
      if (ObjectUtils.isNullOrUndefined(vm.dateRange)) {
        return;
      }

      if (periodTypeKey === 'none') {
        return undefined;
      }

      // We need to use our own object here as we need to send the time through to the utils
      // service for the end date at 23:59:59
      var dateRange = {
        start: vm.dateRange.start.startOf('day'),
        end: vm.dateRange.end.endOf('day')
      }

      var compareRangeNum;

      //csv is currently locked to prior period and prior year, 
      //we need to alter the user prefs so that only these periods 
      //are returned from the date range services
      var alteredUser = angular.copy(vm.currentUser)
      alteredUser.preferences.custom_period_1.period_type = 'prior_period';
      alteredUser.preferences.custom_period_2.period_type = 'prior_year';

      if (periodTypeKey === 'prior_period') {
        compareRangeNum = 'compare1Range';
      } else if (periodTypeKey === 'prior_year') {
        compareRangeNum = 'compare2Range';
      } else {
        compareRangeNum = undefined;
      }

      return dateRangeService.getCustomPeriod(dateRange, alteredUser, currentOrganization, vm.activeShortcut, compareRangeNum);
    }

    function getActiveSubscriptions () {
      if (!ObjectUtils.isNullOrUndefined(vm.currentSite)) {
        if (!ObjectUtils.isNullOrUndefined(vm.currentSite.subscriptions)) {
          vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentSite);
        } else {
          //use org data
          vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentOrganization);
        }
      } else {
        vm.activeSubscriptions = SubscriptionsService.getSubscriptions(vm.currentOrganization);
      }

      vm.metrics = filterSubscriptions(csvExportConstants.metrics);

      /* Currently, the CSV export uses it's own defined list of metric constants instead of the global constants.
       * These are held in csv-export.constants.js. They contain no information about requiredSubscriptions.
       * Rather than duplicate the requiredSubcriptions array for each metric in the csv-export.constants.js.
       * this block of code copies the requiredSubscriptions from the global contstants file.
       */
      _.each(vm.metrics, metric => {
        const metricConstant = _.findWhere(metricConstants.metrics, { kpi: metric.kpi });
        if (!_.isUndefined(metricConstant)) {
          metric.requiredSubscriptions = metricConstant.requiredSubscriptions;
        }
      });
    }

    function filterSubscriptions (obj) {
      return _.filter(obj, function (subClass) {
        return (subClass.subscription === 'any' || _.contains(vm.activeSubscriptions, subClass.subscription));
      });
    }

    function loadSalesCategories () {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.currentOrganization.portal_settings.sales_categories)) {
        vm.showSalesCategories = false;
        return;
      }

      if (vm.currentOrganization.portal_settings.sales_categories.length <= 1) {
        vm.showSalesCategories = false;
        return;
      }

      vm.salesCategories = vm.currentOrganization.portal_settings.sales_categories;

      var selectedSalesCategories = {};

      _.each(vm.salesCategories, function (salesCategory) {
        selectedSalesCategories[salesCategory.id] = false;
      });

      if (typeof $stateParams.salesCategories === 'string') {
        $stateParams.salesCategories = [$stateParams.salesCategories];
      }

      _.each($stateParams.salesCategories, function (salesCategory) {
        selectedSalesCategories[salesCategory] = true;
      });

      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedSalesCategories)) {
        vm.selectedSalesCategories = selectedSalesCategories;
      }

      vm.showSalesCategories = true;
    }

    function loadCalendars () {
      LocalizationService.getAllCalendars().then(function (calendars) {
        vm.organizationCalendars = calendars.result;
        LocalizationService.setAllCalendars(vm.organizationCalendars);
        vm.calendarsLoaded = true;
      });
    }

    function hasInteriorSubscription () {
      if (vm.currentSite !== null) {
        return SubscriptionsService.siteHasInterior(vm.currentOrganization, vm.currentSite);
      } else {
        return SubscriptionsService.siteHasInterior(vm.currentOrganization);
      }
    }

    function hasPerimeterSubscription () {
      if (vm.currentSite !== null) {
        return SubscriptionsService.siteHasPerimeter(vm.currentOrganization, vm.currentSite);
      } else {
        return SubscriptionsService.siteHasPerimeter(vm.currentOrganization);
      }
    }

    function hasSalesSubscription () {
      if (vm.currentSite !== null) {
        return SubscriptionsService.siteHasSales(vm.currentOrganization, vm.currentSite);
      } else {
        return SubscriptionsService.siteHasSales(vm.currentOrganization);
      }
    }
    function hasLaborSubscription () {
      if (vm.currentSite !== null) {
        return SubscriptionsService.siteHasLabor(vm.currentOrganization, vm.currentSite);
      } else {
        return SubscriptionsService.siteHasLabor(vm.currentOrganization);
      }
    }

    function hasSubscription (subscription) {
      if (subscription === 'any') {
        return true;
      } else {
        if (subscription === 'sales') {
          return hasSalesSubscription();
        } else if (subscription === 'labor') {
          return hasLaborSubscription();
        } else if (subscription === 'interior') {
          return hasInteriorSubscription();
        } else if (subscription === 'perimeter') {
          return hasPerimeterSubscription();
        }
      }
    }

    function toggleSite (siteId) {
      if (!siteIsSelected(siteId)) {
        vm.selectedSites.push(siteId);
      } else {
        var index = vm.selectedSites.indexOf(siteId);
        vm.selectedSites.splice(index, 1);
      }
    }

    function toggleLocation (locationId) {
      if (!locationIsSelected(locationId)) {
        vm.selectedLocations.push(locationId);
      } else {
        var index = vm.selectedLocations.indexOf(locationId);
        vm.selectedLocations.splice(index, 1);
      }
    }

    function toggleZone (zoneId) {
      //tmp selection
      if (vm.zoneLevel === true) {
        if (!tmpIsSelected(zoneId)) {
          vm.selectedTmps.push(zoneId);
        } else {
          vm.selectedTmps = _.without(vm.selectedTmps, zoneId);
        }
      }
      else
        if (!zoneIsSelected(zoneId)) {
          vm.selectedZones.push(zoneId);
        } else {
          var index = vm.selectedZones.indexOf(zoneId);
          vm.selectedZones.splice(index, 1);
        }
    }

    function siteIsSelected (siteId) {
      return (vm.selectedSites.indexOf(siteId) > -1);
    }

    function locationIsSelected (locationId) {
      return (vm.selectedLocations.indexOf(locationId) > -1);
    }

    function zoneIsSelected (zoneId) {
      return (vm.selectedZones.indexOf(zoneId) > -1);
    }

    function tmpIsSelected (_id) {
      return (vm.selectedTmps.indexOf(_id) > -1);
    }

    function metricIsDisabled (kpi) {
      var disabled = false;
      if (vm.groupBySetting === 'hour' && kpi !== 'traffic') {
        disabled = true;
      }
      return disabled;
    }

    function selectAllSites () {
      if (vm.selectedSites && vm.selectedSites.length === vm.sites.length) {
        vm.selectedSites = [];
        vm.allSelected = false;
      } else {
        vm.selectedSites = [];
        _.each(vm.sites, function (site) {
          vm.selectedSites.push(site.site_id);
        });

        vm.allSelected = true;
      }
    }

    function isAllSitesSelected () {
      return (vm.selectedSites.length === vm.sites.length);
    }

    function selectAllZones () {
      if (vm.zoneLevel) {
        if (vm.selectedTmps.length === vm.selectedZone.tmps.length) {
          vm.selectedTmps = [];
        } else {
          _.each(vm.selectedZone.tmps, function (tmp) {
            vm.selectedTmps.push(tmp.id);
          });
        }

      }
      else if (vm.selectedZones.length === vm.zones.length) {
        vm.selectedZones = [];
      } else {
        vm.selectedZones = [];
        _.each(vm.zones, function (zone) {
          vm.selectedZones.push(zone.id);
        });
      }
    }

    function tagDropdownIsDisabled () {
      if (Object.keys(vm.selectedSites).length > 0) {
        return true;
      } else {
        return false;
      }
    }

    function siteDropdownIsDisabled () {
      if (vm.tags.length > 0) {
        return true;
      } else {
        return false;
      }
    }

    function pushToList (allLocationsList) {
      var childListLenght = null;

      angular.forEach(allLocationsList, function (selectedLocation) {
        var locationId = selectedLocation.location_id;
        var childList = selectedLocation.sublist;

        vm.toggleLocation(locationId);

        angular.forEach(childList, function (selectedChildLocation) {
          vm.toggleLocation(selectedChildLocation.location_id);
          childListLenght++;
        });

      });

      if (childListLenght === 0) {
        $scope.selectedItemsLength = childListLenght;
      }
    }

    function setExportSiteOverall (value) {
      vm.exportSiteOverall = value;
    }

    function loadTranslations () {
      $translate.use(vm.language)
        .then(function () {
          setEntranceNameTranslation();
          setNoDataTranslation();

          vm.translationsLoaded = true;
        });
    }

    function selectMetric (metric) {
      if (vm.metricIsDisabled(metric)) {
        return false;
      }
      vm.selectedMetrics[metric] = !vm.selectedMetrics[metric];

      setSalesCategoryVisibility();
    }

    function setSalesCategoryVisibility () {
      var salesMetricIsSelected = false;

      _.each(vm.metrics, function (metric) {
        if (vm.selectedMetrics[metric.kpi] === true && SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, currentOrganization)) {
          salesMetricIsSelected = true;
        }
      });

      if (vm.salesMeasureIsSelected !== salesMetricIsSelected) {
        vm.salesMeasureIsSelected = salesMetricIsSelected;
      }
    }

    function setActiveGroup (group) {
      vm.selectedMetrics = [];
      vm.activeGroup = group;
    }

    function setActive (active) {
      vm.activeSetting = active;
    }

    function setWeekDay (day) {
      vm.weekDaySetting = day;
    }

    function setMonthDay (day) {
      vm.monthDaySetting = day;
    }

    function setGroupBy (groupBy) {
      /* Temporary fix: if groupBy = hour, unselect sales metrics */
      var salesMetrics = ['sales', 'conversion', 'ats', 'upt', 'labor_hours', 'star'];

      salesMetrics.forEach(function (metric) {
        vm.selectedMetrics[metric] = false;
      });

      vm.groupBySetting = groupBy;

      if (groupBy === 'hour') {
        /* SA-4041 when group by Hour selected, do not allow compare period data currently
        hence disable multiselect drop down when hour selected*/
        vm.selectedComparePeriods = [];
        vm.selectedComparePeriods.push(vm.comparePeriods[0]);
        vm.disabled = true;
      } else {
        vm.disabled = false;
      }
    }

    function setMonth (month) {
      vm.monthSetting = month;
    }

    function weekDayIsSetTo (day) {
      return vm.weekDaySetting === day;
    }

    function dayIsSetTo (day) {
      return vm.monthDaySetting === day;
    }

    function monthIsSetTo (month) {
      return vm.monthSetting === month;
    }

    function getSelectedGroupByName () {
      var setting = _.find(vm.groupByChoices, { name: vm.groupBySetting });
      return setting.translation_label;
    }

    function addEMail () {
      vm.mailCC.push({
        email: null
      });
    }

    function removeEmail (index) {
      vm.mailCC.splice(index, 1);
    }

    function setSelectedFilters (filters, customTags) {
      vm.tags = [];
      vm.customTags = [];
      vm.selectedTagNames = filters[1];

      // selected custom tags
      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(customTags)) {
        vm.customTags = _.keys(_.pick(customTags, function (_selected) {
          return _selected === true;
        }));
      }

      // Selected Tags
      var selectedTags = filters[0];
      vm.tags = _.keys(_.pick(selectedTags, function (_selected) {
        return _selected === true;
      }));
    }

    function toggleSchedulingForm () {
      vm.formIsVisible = !vm.formIsVisible;
      if (vm.formIsVisible) {
        $location.hash('schedule-form');
        $anchorScroll();
      } else {
        $location.hash('');
      }
    }

    function canBeExported () {
      if (hasSelectedMetric()) {
        if (!vm.siteLevel && (Object.keys(vm.selectedSites).length > 0 || vm.tags.length > 0 || vm.customTags.length > 0)) {
          return true;
        } else {
          if (vm.siteLevel && vm.hasSubscription('interior') && Object.keys(vm.selectedLocations).length > 0) {
            return true;
          } else if (vm.siteLevel && vm.hasSubscription('perimeter') && (Object.keys(vm.selectedZones).length > 0 || vm.selectedTmps.length > 0)) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    function hasSelectedMetric () {
      for (var metric in vm.selectedMetrics) {
        if (vm.selectedMetrics[metric] === true) {
          return true;
        }
      }
      return false;
    }

    function organizationIsTypeRetail () {
      return currentOrganization.portal_settings.organization_type === 'Retail';
    }

    function removeAllSites () {
      vm.selectedSites = [];
    }

    function removeAllTags () {
      vm.tags = [];
      vm.customTags = [];
      vm.selectedTagData = [];
    }

    function removeAllLocations () {
      vm.selectedLocations = [];
    }

    function removeAllZones () {
      vm.selectedZones = [];
    }

    function getSiteNameById (siteId) {
      var site = _.where(vm.sites, { site_id: siteId });
      return site[0].name;
    }

    function getZoneNameById (zoneId) {
      var zone = _.where(vm.zones, { id: zoneId });
      return zone[0].name;
    }

    function getTmpById (_tmpId) {
      var tmp = _.where(vm.selectedZone.tmps, { id: _tmpId });
      return tmp[0].name;
    }

    function getLocationNameById (locationId) {
      var location = _.where(vm.locations, { location_id: locationId });
      return location[0].description;
    }

    function selectAllLocations (allLocationsList) {
      var selectedItems = vm.selectedLocations;
      var selectedChildItemsLength = vm.selectedItemsLength;
      var selectedItemsLength = selectedItems.length;
      var totalLength = selectedItemsLength + selectedChildItemsLength;

      if (selectedItems.length !== totalLength || selectedItems.length === 0) {
        pushToList(allLocationsList);
      } else {
        vm.selectedLocations = [];
      }
    }

    function getOrganizationStartOfWeek () {
      return LocalizationService.getCurrentCalendarFirstDayOfWeek();
    }

    function loadOrganizationSites (currentOrganization) {
      return SiteResource.query({
        orgId: currentOrganization.organization_id
      });
    }

    function loadSiteLocations (currentOrganization, currentSite) {
      return LocationResource.query({
        orgId: currentOrganization.organization_id,
        siteId: currentSite.site_id
      });
    }

    function loadSiteZones (currentOrganization, currentSite) {
      return new ZoneResource().query({
        orgId: currentOrganization.organization_id,
        siteId: currentSite.site_id
      });
    }

    function inValidSchedules (response) {
      return ObjectUtils.isNullOrUndefinedOrEmptyObject(response) ||
        ObjectUtils.isNullOrUndefinedOrEmptyObject(response.data) ||
        ObjectUtils.isNullOrUndefinedOrEmptyObject(response.data.result);
    }

    function loadSchedules () {
      $http.get(apiUrl + '/organizations/' + $stateParams.orgId + '/scheduled-reports?exportType=csv')
        .then(function (response) {
          if (!inValidSchedules(response)) {
            vm.schedules = response.data.result;

            vm.isOpenReport = null;

            if (typeof vm.schedules === 'object') {
              _.each(vm.schedules, (function (schedule) {

                createTranslatableScheduleNameAndFrequency(schedule);

                if (schedule.data && schedule.data.userId) {
                  authService.getCurrentUser(true).then(function (response) {
                    schedule.data.username = response.username;
                  }).catch(function (err) {
                    console.error(err);
                  });
                }
              }));
              vm.schedules = _.sortBy(vm.schedules, function (schedule) {
                if (schedule.data && schedule.data.scheduleEndDate) {
                  return schedule.data.scheduleEndDate;
                } else {
                  return schedule._id;
                }
              });
            }
          }
        }).catch(function (error) {
          if (vm.log) {
            console.error('error in loadSchedules');
            console.error(error)
          }

          vm.loadingSchedulesFailed = true;
        });
    }

    /**
     * @function createTranslatableScheduleNameAndFrequency
     * Checks the schedule frequency and creates a new property, displayInterval, a translation key
     * 
     * @param {Object} schedule a scheduled report - contains information about the report 
     * @returns {Nothing} does not return anything but acts upon the passed in object instead
     */
    function createTranslatableScheduleNameAndFrequency (schedule) {
      if (!schedule.repeatInterval.match(/day|week|month|year|15th/)) {
        //convert freqency *monthName* to year 
        schedule.displayInterval = 'common.YEAR';
      } else if (schedule.repeatInterval.match(/sunday|monday|tuesday|wednesday|thursday|friday|saturday/)) {
        schedule.displayInterval = 'common.' + 'WEEK';
      } else if (schedule.repeatInterval.match(/15th/)) {
        schedule.displayInterval = 'common.' + 'MONTH';
      } else {
        schedule.displayInterval = 'common.' + schedule.repeatInterval.toUpperCase();
      }

      //if there is no custom title, convert subject to translatable string
      if (schedule.data.subject === 'Scheduled report') {
        schedule.data.subject = 'scheduleReport.SINGLESCHEDULEDREPORT';
      }
    }

    function deleteSchedule (schedule) {
      $http.delete(apiUrl + '/organizations/' + schedule.data.orgId + '/scheduled-reports/' + schedule._id)
        .then(function () {
          vm.isOpenReport = null;
          vm.loadSchedules();
        }).catch(function (error) {
          console.error('error in deleteSchedule', error);
          vm.deletingScheduleFailed = true;
        });
    }

    function getSelectedMetricIds () {
      var metrics = [];
      _.each(Object.keys(vm.selectedMetrics), function (key) {
        if (vm.selectedMetrics[key]) {
          metrics.push(key);
        }
      });

      return metrics;
    }

    function getSelectedSalesCategoryIds () {
      if (ObjectUtils.isNullOrUndefined(vm.selectedSalesCategories)) {
        return undefined;
      }

      // This is to mitigate an API error
      if (vm.salesMeasureIsSelected === false) {
        return undefined;
      }

      var salesCategories = _.keys(_.pick(vm.selectedSalesCategories, function (_selected) {
        return _selected === true;
      }));

      return salesCategories;
    }

    function doExport () {
      delete vm.errorMessage;
      vm.numExportsInProgress++;

      var dateRange = {
        start: vm.dateRange.start,
        end: vm.dateRange.end
      };

      var params = {
        groupBy: vm.groupBySetting,
        orgId: vm.currentOrganization.organization_id,
        reportStartDate: utils.getDateStringForRequest(vm.dateRange.start),
        reportEndDate: utils.getDateStringForRequest(vm.dateRange.end),
        dateRangeType: utils.getDateRangeType(dateRange, currentUser, currentOrganization),
        kpi: getSelectedMetricIds()
      };

      if (!ObjectUtils.isNullOrUndefined(vm.compareDateRange1)) {
        params.compare1StartDate = utils.getDateStringForRequest(vm.compareDateRange1.start);
        params.compare1EndDate = utils.getDateStringForRequest(vm.compareDateRange1.end);
      }
      if (!ObjectUtils.isNullOrUndefined(vm.compareDateRange2)) {
        params.compare2StartDate = utils.getDateStringForRequest(vm.compareDateRange2.start);
        params.compare2EndDate = utils.getDateStringForRequest(vm.compareDateRange2.end);
      }
      // We'll use sales_category_id param only, if org has sales categories defined
      if (!ObjectUtils.isNullOrUndefined(vm.salesCategories) && isSalesMetricsSelected()) {
        params.sales_category_id = getSelectedSalesCategoryIds();
      }

      if (vm.activeGroup === 'perimeter') {
        // Only perimeter data uses operatingHours
        params.operatingHours = vm.businessHours;
      }

      if (vm.siteLevel) {
        params.siteId = vm.currentSite.site_id;
        params.includeSiteNames = true;
        if (vm.activeGroup === 'perimeter') {
          params.zoneId = vm.selectedZones;
          params.includeZoneNames = true;
        } else {
          params.locationId = vm.selectedLocations;
        }

        if (vm.zoneLevel) {
          params.zoneId = vm.selectedZone.id;
          params.monitor_point_id = vm.selectedTmps;
        }
      } else {
        params.hierarchyTagId = vm.tags;
        params.customTagId = vm.customTags;
        params.siteId = vm.selectedSites;
        params.includeSiteNames = true;
      }

      var promises = [];

      vm.siteTags = [];

      var orgTagTypes = [];

      if (!ObjectUtils.isNullOrUndefined(vm.currentOrganization.custom_tags)) {
        orgTagTypes = _.pluck(vm.currentOrganization.custom_tags, 'tag_type');
      }

      if (orgTagTypes.length > 0) {
        promises = getTagPromises(params.orgId, orgTagTypes);
      }

      $q.all(promises).then(function () {
        $http.get(apiUrl + '/kpis/report', {
          headers: {
            'Accept': 'text/csv'
          },
          params: params
        }).then(function (response) {
          vm.error = false;
          googleAnalytics.trackUserEvent('csv', 'generate');

          if (vm.selectedZone) {
            response.data = applyEntranceNameHeading(response.data);
          }

          if (vm.showSalesCategories) {
            response.data = applySalesCategoryNames(response.data);
          }

          if (vm.selectedSitesData) {
            response.data = applyTags(response.data);
          }

          if (ObjectUtils.isNullOrUndefined(vm.currentUser.localization.date_format) ||
              ObjectUtils.isNullOrUndefined(vm.currentUser.localization.date_format.mask) ||
              vm.currentUser.localization.date_format.mask !== vm.dateFormat) {
            response.data = applyDateFormat(response.data);
          }

          if (response.data === '\r\n') {
            response.data = noDataText;
          }

          utils.saveFileAs('report-site.csv', response.data, 'text/csv');
          vm.numExportsInProgress--;

        }).catch(function (error) {
          vm.error = true;
          vm.errorMessage = error.data.message;
          vm.numExportsInProgress--;
        });
      });
    }

    function getTagPromises (orgId, orgTagTypes) {
      var promises = [];

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.customTags)) {
        promises.push(SiteResource.search({ orgId: orgId }, { customTagId: vm.customTags, all_fields: true })
          .then(function (sites) {
            _.each(sites, function (site) {
              if (!ObjectUtils.isNullOrUndefined(site.custom_tags)) {
                addSiteTags(site.custom_tags, orgTagTypes);
              }

              vm.selectedSitesData.push(site);
            });
          })
        );
      }

      // We need to use search here to bypass the caching hard coded into the resource service
      _.each(vm.selectedSites, function (siteId) {
        promises.push(SiteResource.search({ orgId: orgId, siteId: siteId })
          .then(function (sites) {
            if (!ObjectUtils.isNullOrUndefinedOrEmpty(sites)) {
              var site = sites[0];

              if (site && site.custom_tags) {
                addSiteTags(site.custom_tags, orgTagTypes);
              }
              vm.selectedSitesData.push(site);
            }
          })
        );
      });

      return promises;
    }

    function addSiteTags (tags, orgTagTypes) {
      var uniqueTags = _.uniq(tags, function (tag) {
        return tag.tag_type;
      });

      var tagTypes = _.pluck(uniqueTags, 'tag_type');

      tagTypes = _.intersection(tagTypes, orgTagTypes);

      vm.siteTags = _.union(vm.siteTags, tagTypes);
    }

    function getSiteTag (siteName, tagType) {
      var site = _.findWhere(vm.selectedSitesData, { name: siteName });

      // If we couldn't locate the site using it's name, lets try to use the report name
      if (_.isUndefined(site)) {
        site = _.findWhere(vm.selectedSitesData, { report_name: siteName });
      }

      if (!site || !site.custom_tags) {
        return;
      }

      var tag = _.findWhere(site.custom_tags, { tag_type: tagType });

      if (tag && tag.name) {
        return tag.name;
      }

    }

    function isSalesMetricsSelected () {
      var hasSalesMetrics = false;
      var selectedMetrics = getSelectedMetricIds();
      var salesMetrics = [];

      _.each(vm.metrics, function (metric) {
        if (SubscriptionsService.hasSubscriptions(metric.requiredSubscriptions, currentOrganization)) {
          salesMetrics.push(metric.kpi);
        }
      });

      _.each(selectedMetrics, function (item) {
        if (salesMetrics.indexOf(item) > -1) {
          hasSalesMetrics = true;
        }
      });

      return hasSalesMetrics;
    }

    function toggleReport (index) {
      if (!ObjectUtils.isNullOrUndefined(vm.isOpenReport) && vm.isOpenReport[index]) {
        vm.isOpenReport[index] = false;
      } else {
        vm.isOpenReport = [];
        vm.isOpenReport[index] = true;
      }
    }

    function clearSitesAndFilters () {
      removeAllSites();
      removeAllTags();
      vm.selectedTagData = [];
    }

    function applyEntranceNameHeading (response) {
      var lines = response.split(newline);

      var headings = csvToArray(lines[0]);

      var headingCsv = '';

      _.each(headings, function (heading) {
        if (heading === 'monitor_point_name') {
          heading = entranceNameTranslation;
        }

        if (headingCsv !== '') {
          headingCsv += ',';
        }

        headingCsv = headingCsv + '"' + heading + '"';
      });

      headingCsv = headingCsv += newline;

      lines[0] = headingCsv;

      return lines.join(newline);
    }

    function applySalesCategoryNames (response) {
      var lines = response.split(newline);

      var outputLines = [];

      var salesCategoryIndex;

      var headings = csvToArray(lines[0]);

      _.each(headings, function (heading, index) {
        if (heading === 'sales_category_id') {
          salesCategoryIndex = index;
        }
      });

      if (ObjectUtils.isNullOrUndefined(salesCategoryIndex)) {
        return response;
      }

      outputLines.push(lines[0]);

      _.each(lines, function (line, index) {
        if (index !== 0 && line !== '') {

          var lineValues = csvToArray(line);

          lineValues[salesCategoryIndex] = getSalesCategoryName(lineValues[salesCategoryIndex]);

          var updatedLine = '"' + lineValues.join('","') + '"';

          outputLines.push(updatedLine);
        }
      });

      outputLines.push('');

      return outputLines.join(newline);
    }

    function getSalesCategoryName (id) {
      if (ObjectUtils.isNullOrUndefinedOrBlank(id)) {
        return '';
      }

      var idInt = parseInt(id.replace('"', ''));

      var salesCat = _.findWhere(vm.salesCategories, { id: idInt });

      if (ObjectUtils.isNullOrUndefined(salesCat)) {
        return id;
      }

      return salesCat.name;
    }

    function applyDateFormat (response) {
      var userDateFormat = 'MM/DD/YYYY';
      var lines = response.split(newline);
      var outputLines = [];
      var headings = csvToArray(lines[0]);
      var headingStr = '"' + headings.join('","') + '"';
      outputLines.push(headingStr);

      if (!ObjectUtils.isNullOrUndefined(vm.currentUser.localization.date_format) && !ObjectUtils.isNullOrUndefined(vm.currentUser.localization.date_format.mask)) {
        userDateFormat = vm.currentUser.localization.date_format.mask;
      }

      _.each(lines, function (line, index) {
          var lineValues;

          if (index !== 0 && line !== '') {
            lineValues = csvToArray(line);
            var updatedLine = '';

            _.each(lineValues, function (data, index) {
              if (moment(data, userDateFormat, true).isValid()) {
                lineValues[index] = moment.utc(data).format(vm.dateFormat);
              }
            });

            var updatedLine = '"' + lineValues.join('","') + '"';
            outputLines.push(updatedLine);

          }
        });

      outputLines.push('');
      return outputLines.join(newline);
    }

    function applyTags (response) {
      var lines = response.split(newline);

      var outputLines = [];

      var headings = csvToArray(lines[0]);

      _.each(vm.siteTags, function (tagType) {
        headings.push('Tag: ' + tagType);
      });

      outputLines.push(headings);

      _.each(lines, function (line, index) {
        if (index !== 0 && line !== '') {
          var lineValues = csvToArray(line);
          var siteName = lineValues[1];

          _.each(vm.siteTags, function (tagType) {
            lineValues.push(getSiteTag(siteName, tagType));
          });

          var updatedLine = '"' + lineValues.join('","') + '"';
          outputLines.push(updatedLine);
        }
      });

      outputLines.push('');

      return outputLines.join(newline);
    }

    /**
     * converts a csv string to an array of strings
     * lifted from: http://stackoverflow.com/a/8497474/228770
     */
    function csvToArray (text) {
      var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
      var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      // Return NULL if input string is not well formed CSV string.
      if (!re_valid.test(text)) {
        return null;
      }

      var a = [];

      text.replace(re_value, // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
          // Remove backslash from \' in single quoted values.
          if (typeof m1 !== 'undefined') {
            a.push(m1.replace(/\\'/g, '\''));
          }
          // Remove backslash from \" in double quoted values.
          else if (typeof m2 !== 'undefined') {
            a.push(m2.replace(/\\"/g, '"'));
          }

          else if (typeof m3 !== 'undefined') {
            a.push(m3);
          }
          return ''; // Return empty string.
        });

      // Handle special case of empty last value.
      if (/,\s*$/.test(text)) {
        a.push('');
      }

      return a;
    }

    function setNoDataTranslation () {
      $translate('common.NODATA').then(function (noDataTranslation) {
        noDataText = noDataTranslation;
      });
    }

    function setEntranceNameTranslation () {
      $translate('common.ENTRANCE').then(function (translation) {
        entranceNameTranslation = translation;
      });
    }

  }
})();
