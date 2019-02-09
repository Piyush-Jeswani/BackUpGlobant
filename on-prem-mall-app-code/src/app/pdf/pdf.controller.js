'use strict';

angular.module('shopperTrak')
.controller('PdfCtrl',
['$scope',
  '$rootScope',
  '$q',
  '$http',
  '$stateParams',
  '$filter',
  '$timeout',
  '$translate',
  'resourceUtils',
  'currentOrganization',
  'currentSite',
  'OrganizationResource',
  'SiteResource',
  'LocationResource',
  'ZoneResource',
  'EntranceResource',
  'LocalizationService',
  'ObjectUtils',
  'obfuscation',
  'ZoneHelperService',
  'utils',
  'apiUrl',
  'currencyService',
  'widgetLibraryService',
  'dateRangeService',
  'datePeriods',
  'metricNameService',
  'authService',
function (
  $scope,
  $rootScope,
  $q,
  $http,
  $stateParams,
  $filter,
  $timeout,
  $translate,
  resourceUtils,
  currentOrganization,
  currentSite,
  OrganizationResource,
  SiteResource,
  LocationResource,
  ZoneResource,
  EntranceResource,
  LocalizationService,
  ObjectUtils,
  obfuscation,
  ZoneHelperService,
  utils,
  apiUrl,
  currencyService,
  widgetLibraryService,
  dateRangeService,
  datePeriods,
  metricNameService,
  authService
) {
  var tempExports = [];
  $scope.summaryPage = $stateParams.data.indexOf('summary-page') > -1;

  $scope.widgetIsLoading = {};
  $scope.organizations = [];
  $scope.sites = [];
  $scope.zones = [];
  $scope.locations = [];
  $scope.entrances = [];

  $scope.siteList = '';
  $scope.orgList = '';
  $scope.isLoadingLocations = true;

  $scope.datePeriods = datePeriods;

  $scope.hasOrganizationId = hasOrganizationId;
  $scope.hasSiteId = hasSiteId;
  $scope.hasLocationId = hasLocationId;
  $scope.hasZoneId = hasZoneId;
  $scope.hasEntranceId = hasEntranceId;
  $scope.getPartialPageKey = getPartialPageKey;
  $scope.getDatePeriodTransKey = getDatePeriodTransKey;

  $rootScope.pdf = true;
  $rootScope.pdfExportsLoaded = 0;
  $scope.language = LocalizationService.getCurrentLocaleSetting();
  $scope.orgTags = {};

  $scope.currentUserLoaded = false;

  $scope.getColumnCssClass = getColumnCssClass;
  $scope.getPageBreakCssClass = getPageBreakCssClass;
  $scope.getCompareMode = getCompareMode;

  var requestData = JSON.parse($stateParams.data);
  if (!ObjectUtils.isNullOrUndefined(requestData.userId)) {
    $scope.hasUserId = true;
    loadCurrentUser(requestData);
  } else {
    $scope.hasUserId = false;
    var promises = [LocalizationService.getAllCalendars(true)];
    if (requestData.loadWidgets &&
      !ObjectUtils.isNullOrUndefinedOrBlank(requestData.reportId)) {
      promises.push(widgetLibraryService.loadReportAndWidgets(requestData.reportId));
    }
    else if(requestData.widgets.loadWidgetsFromIdList &&
      !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.widgets.widgetIds)) {
        promises.push(widgetLibraryService.loadWidgets(requestData.widgets));
    }
    $q.all(promises).then(function (results) {
      if ((requestData.loadWidgets &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.reportId)) ||
        (requestData.widgets.loadWidgetsFromIdList &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.widgets.widgetIds))) {
        $scope.reportData = results[1];
      }

      activate();
    });

    $scope.currentUserLoaded = true;
  }

  // pdf stops trying to load widgets after 5 minutes (page-wide timeout)
  $timeout(setWindowStatus, 300000);

  /**
  * Notifies the controller when all widgets have rendered.
  * this function returns nothing but fires a function when number of loaded widgets matches the number of exports.
  */
  function widgetsRendered(numberOfWidgets){
    $rootScope.$watch('pdfExportsLoaded', function() { //watch for changes on the $rootScope.pdfExportsLoaded property (a number that changes)
      if(numberOfWidgets === $rootScope.pdfExportsLoaded) { //when the export count is the same as the number of widgets that have rendered..
        $scope.pdfLoadCompleted = true;
        $timeout(setWindowStatus, 500); // Animations should be disabled in PDF mode, so this small timeout should suffice
      }

    });
  }

  /**
  * gets the translation key for the period
  * @param {String} period period type
  * @return {String} trans key
  */
  function getDatePeriodTransKey(period_type) {
    var period = _.findWhere($scope.datePeriods, { key: getPeriodKey(period_type) });
    if (!ObjectUtils.isNullOrUndefined(period)) {
      return period.shortTranslationLabel;
    }
    return '';
  }

   /**
    * gets the period key we use in dateperiod constants
    * @param {String} period if period is a short key then return long key
    * @return {String} period
    */
    function getPeriodKey(period) {
      switch (period) {
        case 'wtd':
          return 'week_to_date';
          break;
        case 'mtd':
          return 'month_to_date';
          break;
        case 'qtd':
          return 'quarter_to_date';
          break;
        case 'ytd':
          return 'year_to_date';
          break;
      }
      return period;
    }

  //sets a status on the window, this is used in labs node api as a condition for phantom to render a pdf
  function setWindowStatus() {
    window.status = 'allWidgetsRendered';
    window.renderable = 'allWidgetsRendered';
  }

  function getPartialPageKey(export2) {
    return ObjectUtils.isNullOrUndefinedOrBlank(export2.partialPageName)?
      export2.summaryKey : export2.partialPageName;
  }

  function loadCurrentUser(requestData) {
    var promises = [authService.getCurrentUser()];
    if (requestData.loadWidgets &&
      !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.reportId)) {
      promises.push(widgetLibraryService.loadReportAndWidgets(requestData.reportId));
    }
    else if(requestData.widgets.loadWidgetsFromIdList &&
      !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.widgets.widgetIds)) {
        promises.push(widgetLibraryService.loadWidgets(requestData.widgets));
    }
    $q.all(promises).then(function (results) {
      if ((requestData.loadWidgets &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.reportId)) ||
        (requestData.widgets.loadWidgetsFromIdList &&
        !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.widgets.widgetIds))) {
        $scope.reportData = results[1];
      }

      $scope.currentUser = results[0];

      if ($scope.currentUser.username.match(/^demo/gi)) {
        obfuscation.enableForSession();
      } else {
        obfuscation.disableForSession();
      }

      LocalizationService.getAllCalendars(true).then(function () {
        activate();
      });
      $scope.currentUserLoaded = true;
    },
      function onError() {
        console.error('error')
      }
    );
  };

  function activate() {
    getKpiValuesForKpi();

    if(angular.isDefined($scope.currentUser)) {
      LocalizationService.setUser($scope.currentUser);
    }

    loadTranslations()
      .then(onTranslationsLoaded)
      .catch(function(error) {
        console.error(error);
      });
  }

  function getPeriodType() {
    if( !ObjectUtils.isNullOrUndefinedOrBlank(requestData.periodType)) return requestData.periodType;
    return requestData.widgets ? requestData.widgets.periodType : null;
  }

  function onTranslationsLoaded() {
    var widgetData = [];

    if($scope.hasUserId){
      widgetData = requestData.widgets;
    } else {
      widgetData = requestData;
    }

    if (requestData.loadWidgets &&
      !ObjectUtils.isNullOrUndefinedOrBlank(requestData.reportId)||
      (requestData.widgets.loadWidgetsFromIdList &&
      !ObjectUtils.isNullOrUndefinedOrEmpty(requestData.widgets.widgetIds))) {
      widgetData = $scope.reportData;
      widgetData.periodType = getPeriodType();
    }

    var orgIds = _.uniq(_.pluck(!ObjectUtils.isNullOrUndefined(widgetData.widgets) ? widgetData.widgets:widgetData, 'organizationId'));

    loadOrganizations(orgIds).then(function() {
      loadOrganizationTags();
      widgetsRendered(!ObjectUtils.isNullOrUndefined(widgetData.widgets) ? widgetData.widgets.length:widgetData.length);
      mapWidgets(widgetData);
      parseExports();
      loadSites();
      loadZones();
      loadLocations();
      loadEntrances();
      createOrder();

      setMetricNames(tempExports).then(function(updatedExports) {
        $scope.exports = updatedExports;
      }).catch(function(error) {
        console.error(error);
        // Dont let the error prevent the load
        $scope.exports = tempExports;
      });

    }).catch(function(error) {
      console.error(error);
    });
  }

  function setMetricNames(widgetData) {
    var deferred = $q.defer();

    var metricLoadPromises = [];
    _.each(widgetData, function(widget) {
      var metricLoad = $q.defer();

      metricLoadPromises.push(metricLoad.promise);
      // This must happen after standardiseOrgId has been called
      var org = $scope.organizations[widget.organizationId];

      if(_.isUndefined(org)) {
        metricLoad.resolve();
      } else {
        metricNameService.applyCustomMetricNames(org)
          .then(function (orgMetrics) {
            widget.orgMetrics = orgMetrics;
            metricLoad.resolve();
          })
          .catch(function (error) {
            console.error(error);
            // Swallow the error and don't prevent the load
            metricLoad.resolve();
          });
      }

      $q.all(metricLoadPromises).then(function() {
        deferred.resolve(widgetData);
      }).catch(function (error) {
        console.error(error);
        // Swallow the error and don't prevent the load
        deferred.resolve();
      });
    });

    return deferred.promise;
  }

  function getDateRangeIgnoringUTC(dateRange) {
    if(ObjectUtils.isNullOrUndefined(dateRange)) {
      return dateRange;
    }

    dateRange.start = LocalizationService.getLocalDateTimeFormatIgnoringUTC(dateRange.start);
    dateRange.end = LocalizationService.getLocalDateTimeFormatIgnoringUTC(dateRange.end);
    return dateRange;
  }

  function getDateRangeFromPeriodType(period, overrideRange, currentUser, org) {

    if (ObjectUtils.isNullOrUndefined(org)) {
      return;
    }
    setLocalization(org, currentUser);

    var periodType = ObjectUtils.isNullOrUndefinedOrBlank(overrideRange) ? period : overrideRange;

    return dateRangeService.getPeriodRange(periodType, currentUser, org);
  }

  function setLocalization(org, currentUser) {
    //set localization service with selected org and current user so we could get correct range
    LocalizationService.setOrganization(org);
    LocalizationService.setUser(currentUser);
  }


  function mapWidgets(widgetData) {
    var widgets = ObjectUtils.isNullOrUndefined(widgetData.widgets)? widgetData: widgetData.widgets;
    if(ObjectUtils.isNullOrUndefinedOrEmpty(widgets)) {
      return;
    }

    tempExports = widgets.map(function (value) {
      value.currentUser = $scope.currentUser;

      //parse string ids passed through stateParams - string ids tend to return empty values for map in pdf export
      if(!ObjectUtils.isNullOrUndefined(value.locationId)) {
        value.locationId = Number(value.locationId);
      }

      if(!ObjectUtils.isNullOrUndefined(value.organizationId)) {
        value.organizationId = Number(value.organizationId);

        if(ObjectUtils.isNullOrUndefined(value.currentOrganization)) {
          value.currentOrganization = $scope.organizations[value.organizationId];
        }
      }

      value.dateRange = !ObjectUtils.isNullOrUndefined(widgetData.report) &&
      !ObjectUtils.isNullOrUndefinedOrBlank( widgetData.report.period_type) ?
      getDateRangeFromPeriodType(widgetData.report.period_type, value.overrideRange, value.currentUser, value.currentOrganization):
      getDateRangeIgnoringUTC(value.dateRange);
      value.compare1Range = getDateRangeIgnoringUTC(value.compare1Range);
      value.compare2Range = getDateRangeIgnoringUTC(value.compare2Range);
      value.periodType = widgetData.periodType;


      if(_.isUndefined(value.siteId)){
        currencyService.getCurrencySymbol(value.organizationId).then(function(data){
          value.currencySymbol = data.currencySymbol;
        })
      } else {
        currencyService.getCurrencySymbol(value.organizationId, value.siteId).then(function(data){
          value.currencySymbol = data.currencySymbol;
        })
      }


      if(!ObjectUtils.isNullOrUndefined(value.siteId)) {
        value.siteId = Number(value.siteId);
      }

      if (typeof value.tags !== 'undefined' && typeof $scope.orgTags[value.organizationId] === 'undefined') {
        getOrganizationTags(value.organizationId);
      }

      // Slashes break down the export URLs
      if (value.dateFormat) {
        value.dateFormat = value.dateFormat.replace(/\|/g, '/');
      } else {
        value.dateFormat = LocalizationService.getCurrentDateFormat(value.currentOrganization);
      }
      if (typeof $scope.currentUser !== 'undefined') {
        if (
          typeof $scope.currentUser.localization !== 'undefined' &&
          typeof $scope.currentUser.localization.date_format !== 'undefined' &&
          !ObjectUtils.isNullOrUndefined( $scope.currentUser.localization.date_format.mask )
        ) {
          $scope.currentUser.localization.date_format.mask = $scope.currentUser.localization.date_format.mask.replace(/\|/g, '/');
        }
      }

      if (typeof value.currentOrganization !== 'undefined') {
        if (
          typeof value.currentOrganization.localization !== 'undefined' &&
          typeof value.currentOrganization.localization.date_format !== 'undefined' &&
          !ObjectUtils.isNullOrUndefined( value.currentOrganization.localization.date_format.mask )
        ) {
          value.currentOrganization.localization.date_format.mask = value.currentOrganization.localization.date_format.mask.replace(/\|/g, '/');
        }
      }

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(value.compareId)){
        _.each(value.currentUser.preferences.custom_charts, function(customChart){
          var idToCheck = customChart.chart_name.replace(/[^a-zA-Z0-9]/g, '') + customChart.organization_id;
          if(value.compareId === idToCheck){
            value.compare = customChart;
            value.compare.activeSelectedComparePeriods = value.selectedComparePeriod;
            value.compare.activeSelectedMetrics = value.selectedMetrics;
            value.compare.showTable = value.table;
          }
        });
      }

      if (!ObjectUtils.isNullOrUndefined(value.dateRangeShortCut)) {
        let shortcut = value.dateRangeShortCut;

        if (shortcut === 'custom' && value.customRange !== 'custom') {
          shortcut = value.customRange;
        }

        const dateRanges = updateDateRanges(value, shortcut);

        value.dateRange = dateRanges.dateRange;
        value.compare1Range = dateRanges.compare1Range;
        value.compare2Range = dateRanges.compare2Range;
      }

      if (value.currentUser.preferences.weather_reporting) {
        value.showWeatherMetrics = true;
        value.selectedWeatherMetrics = [];
        _.each(value.weather, function(selectedMetric){
          value.selectedWeatherMetrics.push({kpi : selectedMetric});
        });
      }

      if(angular.isDefined(value.salesCategories) && angular.isDefined(value.salesCategories.selection)) {;
        value.salesCategories = value.salesCategories.selection;
      }
      
      if (angular.isDefined(value.customTags)) {
        let orgCustomTags = value.currentOrganization.custom_tags;
        value.heirarchyName = '';

        _.each(value.customTags, (tag, index) => {
          let tagDetails = _.findWhere(orgCustomTags, { _id : tag});
          if (index > 0) { 
            value.heirarchyName += ` | ${tagDetails.tag_type} - ${tagDetails.name}`;
          } else {
            value.heirarchyName += `${tagDetails.tag_type} - ${tagDetails.name}`;
          }
        });
      }
      return value;
    });
  }

  function getPdfOrientationOrder(exports) {
    return exports.pdfOrientation === 'landscape'? 9999: 0;
  }

  function createOrder(){
    var orgList = [];
    var siteOrder, zoneOrder, locationOrder;
    var unique = 0;

    _.each(tempExports, function(exports) {
        var org = exports.organizationId;
        if(orgList.indexOf(org) < 0) {
          orgList.push(org);
        }
    });

    _.each(orgList, function(org){
      var currentOrg = org;

      _.each(tempExports, function(exports){
        if(exports.organizationId === currentOrg) {

          siteOrder = !ObjectUtils.isNullOrUndefined(exports.siteId) ? exports.siteId : '0';

          zoneOrder = !ObjectUtils.isNullOrUndefined(exports.zoneId) ? exports.zoneId : '0';

          locationOrder = !ObjectUtils.isNullOrUndefined(exports.locationId) ? exports.locationId : '0';

          exports.order =getPdfOrientationOrder(exports)  + '.' +org + '.' + siteOrder + '.' + zoneOrder + '.' + locationOrder + '.' + unique;
          unique++;
        }
      });
    });
  }

  function isShowMainLogo() {
    if(tempExports.length === 1 && tempExports[0].pdfOrientation === 'landscape') return false;
    let landscapeWidgets = _.filter(tempExports,{
      pdfOrientation: 'landscape'
    })

    if(ObjectUtils.isNullOrUndefined(landscapeWidgets)) return true;

    if(tempExports.length === landscapeWidgets.length) return false;

    return true;
  }

  function parseExports () {
    $scope.showMainLogo = isShowMainLogo();

    _.each(tempExports, value => {
      const siteIds = [], orgIds = [];
      value = decodeExportCartSlashes(value);

      //parse string ids passed through stateParams - string ids tend to return empty values for map in pdf export
      if (!ObjectUtils.isNullOrUndefined(value.locationId)) {
        value.locationId = Number(value.locationId);
      }

      if (!ObjectUtils.isNullOrUndefined(value.organizationId)) {
        value.organizationId = Number(value.organizationId);
      }

      if (!ObjectUtils.isNullOrUndefined(value.siteId)) {
        value.siteId = Number(value.siteId);
      }

      if (siteIds.indexOf(value.siteId) === -1) {
        siteIds.push(value.siteId);
      }
      if (orgIds.indexOf(value.organizationId) === -1) {
        orgIds.push(value.organizationId);
      }

      if (ObjectUtils.isNullOrUndefined(value.dateFormat)) {
        value.dateFormat = 'MM/DD/YYYY';
      }

      if (value.dateRangeType !== 'custom' ||
        value.compare1Type !== 'custom' ||
        value.compare2Type !== 'custom'
      ) {
        const currentOrganization = $scope.organizations[value.organizationId];
        LocalizationService.setOrganization(currentOrganization);

        if (ObjectUtils.isNullOrUndefined(value.currentUser)) {
          value.currentUser = $scope.currentUser;
        }
      }

      if (value.dateRangeType !== 'custom' && !ObjectUtils.isNullOrUndefined(value.dateRangeType)) {
        const allRanges = dateRangeService.getSelectedAndCompareRanges(value.dateRangeType, value.currentUser, currentOrganization);

        value.dateRange = allRanges.selectedPeriod;

        if (value.compare1Type !== 'custom') {
          value.compare1Range = allRanges.comparePeriod1;
        }

        if (value.compare2Type !== 'custom') {
          value.compare2Range = allRanges.comparePeriod2;
        }
      }

      if (typeof value.currentOrganization !== 'undefined') {
        if (
          typeof value.currentOrganization.localization !== 'undefined' &&
          typeof value.currentOrganization.localization.date_format !== 'undefined' &&
          !ObjectUtils.isNullOrUndefined(value.currentOrganization.localization.date_format.mask)
        ) {
          value.currentOrganization.localization.date_format.mask = value.currentOrganization.localization.date_format.mask.replace(/\|/g, '/');
        }
      }
    });
  }

  function decodeExportCartSlashes(value) {
    if (!ObjectUtils.isNullOrUndefined(value.dateFormat)) {
      value.dateFormat = value.dateFormat.replace(/\|/g, '/');
    }
    if (!ObjectUtils.isNullOrUndefined(value.currentUser)) {
      if (
        typeof value.currentUser.localization !== 'undefined' &&
        typeof value.currentUser.localization.date_format !== 'undefined' &&
        !ObjectUtils.isNullOrUndefined( value.currentUser.localization.date_format.mask )
      ) {
        value.currentUser.localization.date_format.mask = value.currentUser.localization.date_format.mask.replace(/\|/g, '/');
      }
    }
    if (!ObjectUtils.isNullOrUndefined(value.currentOrganization)) {
      if (
        typeof value.currentOrganization.localization !== 'undefined' &&
        typeof value.currentOrganization.localization.date_format !== 'undefined' &&
        !ObjectUtils.isNullOrUndefined( value.currentOrganization.localization.date_format.mask )
      ) {
        value.currentOrganization.localization.date_format.mask = value.currentOrganization.localization.date_format.mask.replace(/\|/g, '/');
      }
    }
    return value;
  }

  function getOrganizationById(orgId) {
    return  OrganizationResource.get({orgId: orgId}).$promise;
  }

  function getOrganizationTags(orgId) {
    $scope.orgTags[orgId] = {};
    var organization = getOrganizationById(orgId);
    organization.then(function(result) {
      if(!ObjectUtils.isNullOrUndefined(result.portal_settings) &&
         !ObjectUtils.isNullOrUndefined(result.portal_settings.group_structures)) {
        _.each(result.portal_settings.group_structures, function(tagGroup) {
          _.each(tagGroup.levels, function(tag) {
            _.each(tag.possible_values, function(tagValue) {
              $scope.orgTags[orgId][tagValue._id] = tagValue.name;
            });
          });
        });
      }
    });
  }

  function loadOrganizations(orgIds) {
    var deferred = $q.defer();

    var promises = [];

    _.each(orgIds, function(orgIdStr) {
      var orgId = Number(orgIdStr);
      if(ObjectUtils.isNullOrUndefined($scope.organizations[orgId])) {
        promises.push(OrganizationResource.get({orgId: orgId}).$promise.then(function(data) {
          $scope.organizations[orgId] = data;
        }));
      }
    });

    $q.all(promises).then(function() {
      deferred.resolve();
    });

    return deferred.promise;
  }

  function loadOrganizationTags() {
    _.each(tempExports, function(item) {
      if (ObjectUtils.isNullOrUndefined(item.tags) &&
          ObjectUtils.isNullOrUndefined($scope.orgTags[item.organizationId])) {
        getOrganizationTags(item.organizationId);
      }
    });
  }

  function loadSites() {
    _.each(tempExports, function(item) {
      if(ObjectUtils.isNullOrUndefined($scope.sites[item.organizationId]) ||
         ObjectUtils.isNullOrUndefined($scope.sites[item.organizationId][item.siteId])) {
        if(typeof $scope.sites[item.organizationId.toString()] === 'undefined') {
          $scope.sites[item.organizationId.toString()] = {};
        }

        getSite(item).$promise.then(function(site){
          $scope.sites[item.organizationId.toString()][site.site_id.toString()] = site;
        });
      }
    });
  }

  function loadZones() {
    _.each(tempExports, function(item) {
      if(ObjectUtils.isNullOrUndefined($scope.zones[item.organizationId]) ||
         ObjectUtils.isNullOrUndefined($scope.zones[item.organizationId]) ||
         ObjectUtils.isNullOrUndefined($scope.zones[item.organizationId][item.siteId]) ||
         ObjectUtils.isNullOrUndefined($scope.zones[item.organizationId][item.siteId][item.zoneId])) {
        if(typeof $scope.zones[item.organizationId] === 'undefined') {
          $scope.zones[item.organizationId] = [];
        }
        if(typeof $scope.zones[item.organizationId][item.siteId] === 'undefined') {
          $scope.zones[item.organizationId][item.siteId] = [];
        }

        getZone(item).$promise.then(function(zoneInfo){
          var zoneName = zoneInfo.name;
          zoneInfo.name = ZoneHelperService.removeLeadingX(zoneName);
          $scope.zones[item.organizationId][item.siteId][item.zoneId] = zoneInfo;
        });

      }
    });
  }

  function loadLocations() {
    _.each(tempExports, function(item) {
      if(!ObjectUtils.isNullOrUndefined(item.locationId) && !ObjectUtils.isNullOrUndefined(item.organizationId) && !ObjectUtils.isNullOrUndefined(item.siteId)) {
        if(ObjectUtils.isNullOrUndefined($scope.locations[item.organizationId]) ||
          ObjectUtils.isNullOrUndefined($scope.locations[item.organizationId]) ||
          ObjectUtils.isNullOrUndefined($scope.locations[item.organizationId][item.siteId]) ||
          ObjectUtils.isNullOrUndefined($scope.locations[item.organizationId][item.siteId][item.locationId])) {
          if(typeof $scope.locations[item.organizationId] === 'undefined') {
            $scope.locations[item.organizationId] = [];
          }
          if(typeof $scope.locations[item.organizationId][item.siteId] === 'undefined') {
            $scope.locations[item.organizationId][item.siteId] = [];
          }

          getLocation(item).$promise.then(function(location){
            $scope.locations[item.organizationId][item.siteId][item.locationId] = location;
          });
        }
      }
    });
  }

  function loadEntrances() {
    _.each(tempExports, function (item) {
      if(ObjectUtils.isNullOrUndefined($scope.entrances[item.organizationId]) ||
        ObjectUtils.isNullOrUndefined($scope.entrances[item.organizationId]) ||
        ObjectUtils.isNullOrUndefined($scope.entrances[item.organizationId][item.siteId]) ||
        ObjectUtils.isNullOrUndefined($scope.entrances[item.organizationId][item.siteId][item.zoneId]) ||
        ObjectUtils.isNullOrUndefined($scope.entrances[item.organizationId][item.siteId][item.zoneId][item.entranceId])) {

        if(typeof $scope.entrances[item.organizationId] === 'undefined') {
          $scope.entrances[item.organizationId] = [];
        }

        if(typeof $scope.entrances[item.organizationId][item.siteId] === 'undefined') {
          $scope.entrances[item.organizationId][item.siteId] = [];
        }

        if(typeof $scope.entrances[item.organizationId][item.siteId][item.zoneId] === 'undefined') {
          $scope.entrances[item.organizationId][item.siteId][item.zoneId] = [];
        }

        if(typeof $scope.entrances[item.organizationId][item.siteId][item.zoneId][item.entranceId] === 'undefined') {
          $scope.entrances[item.organizationId][item.siteId][item.zoneId][item.entranceId] = [];
        }

        if (ObjectUtils.isNullOrUndefined(item.zoneId) || ObjectUtils.isNullOrUndefined(item.entranceId)) {
          return;
        }

        if(!ObjectUtils.isNullOrUndefined(item.currentEntrance)) {
          assignEntrance(item, item.currentEntrance);
        } else {
          getEntrance(item).$promise.then(function (entrance) {
            assignEntrance(item, entrance)
          }).catch(function (error) {
            console.err(error);
          });
        }
      }
    })
  }

  function assignEntrance(exportCartItem, entrance) {
    $scope.entrances[exportCartItem.organizationId][exportCartItem.siteId][exportCartItem.zoneId][exportCartItem.entranceId] = entrance
  }

  function hasOrganizationId(exportCart) {
    return !ObjectUtils.isNullOrUndefined(exportCart.organizationId);
  }

  function getSite(exportCart) {
    if(!ObjectUtils.isNullOrUndefinedOrEmpty(exportCart.currentSite)) {
      return exportCart.currentSite;
    } else {
      return SiteResource.get({orgId: exportCart.organizationId, siteId: exportCart.siteId});
    }
  }

  function hasSiteId(exportCart) {
    return !ObjectUtils.isNullOrUndefined(exportCart.siteId) && exportCart.siteId !== 'tags';
  }

  function getZone(exportCart) {
    if(!ObjectUtils.isNullOrUndefinedOrEmpty(exportCart.currentZone)) {
      return exportCart.currentZone;
    } else {
      if(!ObjectUtils.isNullOrUndefined(exportCart.zoneId)) {
        exportCart.zoneId = Number(exportCart.zoneId);
      }
      return new ZoneResource().get({orgId: exportCart.organizationId, siteId: exportCart.siteId, zoneId: exportCart.zoneId});
    }
  }

  function hasLocationId(exportCart) {
    return !ObjectUtils.isNullOrUndefined(exportCart.locationId) && exportCart.locationId !== 'zone' && exportCart.siteId !== 'tags';
  }

  function hasZoneId(exportCart) {
    return !ObjectUtils.isNullOrUndefined(exportCart.zoneId);
  }

  function hasEntranceId(exportCart) {
    return !ObjectUtils.isNullOrUndefined((exportCart.entranceId));
  }

  function getLocation(exportCart) {
    if(!ObjectUtils.isNullOrUndefinedOrEmpty(exportCart.currentLocation)) {
      return exportCart.currentLocation;
    } else {
      if(!ObjectUtils.isNullOrUndefined(exportCart.locationId)) {
        exportCart.locationId = Number(exportCart.locationId);
      }
      return LocationResource.get({orgId: exportCart.organizationId, siteId: exportCart.siteId, locationId: exportCart.locationId});
    }
  }

  function getEntrance(exportCart) {
    if (!ObjectUtils.isNullOrUndefined(exportCart.entranceId)) {
      exportCart.entranceId = Number(exportCart.entranceId);
    }

    return new EntranceResource().get({orgId: exportCart.organizationId, siteId: exportCart.siteId, zoneId: exportCart.zoneId, entranceId: exportCart.entranceId});
  }

  function getCompareMode(_export) {
    return _export.compStores === true ? '.COMPSTORES' : '.ALLSTORES';
  }

  $scope.getExportTimePeriodTitle = function(exportElm) {
    var start = exportElm.dateRange.start.format(exportElm.dateFormat);
    if(exportElm.summaryKey.indexOf('real_time') >= 0) {
      return start;
    }
    var end = exportElm.dateRange.end.format(exportElm.dateFormat);
    var period = start + ' - ' + end;

    if(!ObjectUtils.isNullOrUndefined(exportElm.compare1Range)) {
      var start2 = exportElm.compare1Range.start.format(exportElm.dateFormat);
      var end2= exportElm.compare1Range.end.format(exportElm.dateFormat);

      if(start2 !== 'Invalid date') {
        period += ', ' + start2 + ' - ';
      }
      if(end2 !== 'Invalid date') {
        period += end2;
      }
    }

    if(!ObjectUtils.isNullOrUndefined(exportElm.compare2Range) &&
      exportElm.hideCompare2Range !== true) {
      var start3 =  exportElm.compare2Range.start.format(exportElm.dateFormat);
      var end3 = exportElm.compare2Range.end.format(exportElm.dateFormat);
      if(start3 !== 'Invalid date') {
        period += ' & ' + start3+ ' - ';
      }
      if(end3 !== 'Invalid date') {
        period += end3;
      }
    }

    return period;
  };

  function getColumnCssClass(key) {
    switch (key) {
      case 'traffic_percentage_location_table':
      case 'traffic_percentage_correlation_table':
      case 'locations_before_table':
      case 'locations_after_table':
      case 'first_visits_table':
      case 'one_and_done_table':
        return 'col-xs-6';
      default:
        return 'col-xs-12';
    }
  };

  function loadTranslations() {
    return $translate.use($scope.language);
  }

  function getKpiValuesForKpi(){
    $scope.kpiValues ={};
    $scope.kpiValues.ats ='ats';
    $scope.kpiValues.conversion ='conversion';
    $scope.kpiValues.average_abandonment_rate ='abandonment_rate';
    $scope.kpiValues.draw_rate ='draw_rate';
    $scope.kpiValues.dwell_time ='dwell_time';
    $scope.kpiValues.opportunity ='opportunity';
    $scope.kpiValues.gsh ='gsh';
    $scope.kpiValues.labor_hours ='labor_hours';
    $scope.kpiValues.sales = 'sales';
    $scope.kpiValues.star = 'star';
    $scope.kpiValues.traffic = 'traffic';
    $scope.kpiValues.upt = 'upt';
    $scope.kpiValues.average_percent_shoppers = 'average_percent_shoppers';
  }

  /**
    * Replaces the date range and compare dates with up to date ranges based upon the widgets params. Private function.
    * This function returns nothing, but instead acts on the current object.
    * @param {widget} widget - A saved widget object
    */
    function updateDateRanges(widget, shortcut) {
      const allRanges = {};
      if (widget.dateRangeShortCut === 'custom' && widget.customRange === null){

        if (_.isUndefined(widget.xDaysBack)) {
          return;
        }

        const startDate = moment().subtract(widget.xDaysBack, 'days').startOf('day');
        const startDateCopyForCalc = angular.copy(startDate); //need this to break the reference in the endDate calc as this can move the startDate along
        const endDate = moment(startDateCopyForCalc.add(widget.xDaysDuration, 'days').endOf('day'));

        allRanges.dateRange = {
          start: startDate,
          end: endDate
        };

        allRanges.compare1Range = dateRangeService.getCustomPeriod(widget.dateRange, widget.currentUser, widget.currentOrganization, null, 'compare1Range');
        allRanges.compare2Range = dateRangeService.getCustomPeriod(widget.dateRange, widget.currentUser, widget.currentOrganization, null, 'compare2Range');

        return allRanges;

      } else {
        const ranges = dateRangeService.getSelectedAndCompareRanges(shortcut, widget.currentUser, widget.currentOrganization, false);

        allRanges.dateRange = ranges.selectedPeriod;
        allRanges.compare1Range = ranges.comparePeriod1;
        allRanges.compare2Range = ranges.comparePeriod2;

        return allRanges;
      }
    }

    function getPageBreakCssClass(exportKey, index, isHourly, pdfOrientation) {
      //in case of single export avoid page break and for landscape reset top to remove border and page break
      if(tempExports.length === 1) {
        if(pdfOrientation === 'landscape') return 'page-break-avoid single';
        return 'page-break-avoid';
      }

      const maxIndex = tempExports.length -1;

      if(pdfOrientation === 'landscape' && index === maxIndex) return 'page-break-before';
      if(pdfOrientation === 'landscape') return 'page-break-before  page-break-after';
      if(isHourly === true) {

        if(index === maxIndex) {
          return 'page-break-avoid';
        }

        return 'page-break-after';
      }

      switch (exportKey) {
        case 'entrance_contribution':
        case 'entrance_contribution_pie':
        case 'other_areas_traffic_table_widget':
        // Tenant table widgets:
        case 'tenant_sales_table_widget':
        case 'tenant_conversion_table_widget':
        case 'tenant_traffic_table_widget':
        case 'tenant_ats_table_widget':
        case 'tenant_upt_table_widget':
        case 'tenant_labor_hours_table_widget':
        case 'tenant_star_labor_table_widget':
        // Heatmap widgets:
        case 'traffic_percentage_location':
        case 'traffic_percentage_correlation':
        case 'first_visits':
        case 'one_and_done':
        case 'locations_after':
        case 'locations_before':
          if (index > 0) return 'page-break-before'; // Don't force break if it's the first widget in the export
        default:
          return 'page-break-avoid';
      }
    }

}]);
