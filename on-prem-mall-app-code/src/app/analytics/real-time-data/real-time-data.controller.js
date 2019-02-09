(function () {
  'use strict';

  angular.module('shopperTrak')
    .controller('RealTimeDataCtrl', [
      '$scope',
      '$rootScope',
      '$state',
      '$stateParams',
      'currentSite',
      'ExportService',
      'currentOrganization',
      'sites',
      'currentZone',
      'currentUser',
      'LocalizationService',
      'utils',
      'metricConstants',
      'SubscriptionsService',
      'realTimeDataService',
      'MallCheckService',
      'SiteResource',
      'ObjectUtils',
      'dateRangeService',
      'loadingFlagsService',
      function (
        $scope,
        $rootScope,
        $state,
        $stateParams,
        currentSite,
        ExportService,
        currentOrganization,
        sites,
        currentZone,
        currentUser,
        LocalizationService,
        utils,
        metricConstants,
        SubscriptionsService,
        realTimeDataService,
        MallCheckService,
        SiteResource,
        ObjectUtils,
        dateRangeService,
        loadingFlagsService
      ) {
        $scope.currentOrganization = currentOrganization;
        $scope.currentSite = currentSite;
        $scope.currentUser = currentUser;
        $scope.sites = filterRealTimeSites(sites);
        activate();

        function activate() {
          checkAccess();
          setupLoadingFlags();
          $scope.dateRangesLoaded = dateRangesLoaded();
          $scope.setSelectedTagsSites = setSelectedTagsSites;
          $scope.scheduleExportCurrentViewToPdf = scheduleExportCurrentViewToPdf;
          $scope.exportWidget = exportWidget;
          $scope.clearFilter = clearFilter;
          $scope.widgetIsExported = widgetIsExported;
          $scope.siteDropdownIsDisabled = siteDropdownIsDisabled;
          $scope.setSelectedFilters = setSelectedFilters;
          $scope.language = LocalizationService.getCurrentLocaleSetting();
          $scope.selectAllSites = selectAllSites;
          $scope.siteIsSelected = siteIsSelected;
          $scope.toggleSite = toggleSite;
          $scope.showFilter = (MallCheckService.isNotMall($scope.currentOrganization) && MallCheckService.hasTags($scope.currentOrganization));
          $scope.selectedTagData = [];
          $scope.selectedSites = [];
          $scope.selectedSitesInfo = [];
          $scope.data = {};
          $scope.setShowTable = setShowTable;
          $scope.dateRange = {
            start: moment(),
            end: moment()
          };
          $scope.metricsToShow = ['real_time_data_widget', 'real_time_interval_data_widget'];

          $scope.compareRange1 = {
            start: $stateParams.compareRange1Start,
            end: $stateParams.compareRange1End
          };

          $scope.compareRange2 = {
            start: $stateParams.compareRange2Start,
            end: $stateParams.compareRange2End
          };
          $scope.businessDays = $stateParams.businessDays === 'true';

          LocalizationService.setUser($scope.currentUser);

          LocalizationService.setOrganization($scope.currentOrganization);

          $scope.dateFormat = LocalizationService.getCurrentDateFormat($scope.currentOrganization);

          $scope.numberFormat = {
            name: LocalizationService.getCurrentNumberFormatName($scope.currentUser, $scope.currentOrganization)
          };

          $scope.language = LocalizationService.getCurrentLocaleSetting();

          LocalizationService.getAllCalendars().then(function (calendars) {
            LocalizationService.setAllCalendars(calendars.result);
            $scope.compareRange1Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange1, $scope.currentUser, $scope.currentOrganization);
            $scope.compareRange2Type = dateRangeService.getCompareType($scope.dateRange, $scope.compareRange2, $scope.currentUser, $scope.currentOrganization);
          });

          if (SubscriptionsService.siteHasSales($scope.currentOrganization, $scope.currentSite)) {
            $scope.orgHasSales = true;
          } else {
            $scope.orgHasSales = false;
          }

          if (SubscriptionsService.siteHasLabor($scope.currentOrganization, $scope.currentSite)) {
            $scope.orgHasLabor = true;
          } else {
            $scope.orgHasLabor = false;
          }

          if (currentZone !== null) {
            $scope.currentZone = currentZone;
          }

          setEnterExits();

          $scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf);

          $scope.salesDateRanges = {
            current: 1,
            previousPeriod: 2,
            previousYear: 3,
            range: {
              1: { value: '' },
              2: { value: '' },
              3: { value: '' }
            }
          };

          getOrganizationSites();

          $scope.orgLevel = ObjectUtils.isNullOrUndefined($scope.currentSite);
          $scope.singleSite = !$scope.orgLevel;
          
          setupWatches();
        }

        function setupLoadingFlags() {
          $scope.loadingFlags = {
            dataWidget: true,
            intervalWidget: true
          };
        }

        function setupWatches() {
          var unbindLoadingFlagsWatch = $scope.$watchCollection('loadingFlags', function(loadingFlags) {
            loadingFlagsService.onLoadingFlagsChange(loadingFlags, unbindLoadingFlagsWatch);
          });

          $scope.$on('$destroy', function() {
            realTimeDataService.cancelAllOutstandingRequests();

            if(_.isFunction(unbindLoadingFlagsWatch)) {
              unbindLoadingFlagsWatch();
            }
          });
        }

        function setSelectedTagsSites(selectedTagsSites) {
          $scope.selectedTagsSites = selectedTagsSites;
          setSingleSiteSelection();
          setRefresh();
        }

        function setFilterActive() {
          $scope.filterActive = !ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites) ||
            !ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedTags);
        }

        function clearFilter() {
          unSelectAllSites();

          $scope.$broadcast('clearFilter', true);
          setRefresh();
        }

        function setSingleSiteSelection() {
          $scope.singleSite = !$scope.orgLevel ||
            (!ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites) &&
              ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedTagsSites) &&
              $scope.selectedSites.length === 1) ||
            (ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites) &&
              !ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedTagsSites) &&
              $scope.selectedTagsSites.length === 1);
        }

        function getOrganizationSites() {
          if (ObjectUtils.isNullOrUndefined($scope.currentSite) &&
            ObjectUtils.isNullOrUndefinedOrEmpty($scope.sites)) {
            var sites = SiteResource.query({ orgId: $scope.currentOrganization.organization_id }, null, { all_fields: true });
            sites.$promise.then(function (sites) {
              $scope.sites = filterRealTimeSites(sites);
            });
          }
        }

        function filterRealTimeSites(sites) {
          if (ObjectUtils.isNullOrUndefinedOrEmpty(sites)) {
            return sites;
          }

          var realTTimeSites = _.filter(sites, function (site) {
            return !ObjectUtils.isNullOrUndefinedOrBlank(site.customer_site_id) &&
              !_.isNaN(site.customer_site_id) &&
              site.customer_site_id !== 'N/A';
          });

          var ordered = _.sortBy(realTTimeSites, function (row) {
            if (!ObjectUtils.isNullOrUndefinedOrBlank(row.name)) {
              return row.customer_site_id + '-' + row.name;
            }

            return 0;
          });
          return ordered;
        }

        function unSelectAllSites() {
          $scope.selectedSitesInfo = [];
          $scope.selectedSites = [];
          setSingleSiteSelection();
          setFilterActive();
        }

        function selectAllSites() {
          if (isAllSitesSelected()) {
            unSelectAllSites();
            setRefresh();
            return;
          }
          $scope.selectedSitesInfo = [];
          $scope.selectedSites = _.pluck($scope.sites, 'site_id');
          populateSelectedSitesInfo();
          setSingleSiteSelection();
          setFilterActive();
          setRefresh();
        }

        function populateSelectedSitesInfo() {
          _.each($scope.selectedSites, function (siteId) {
            addToSiteIfo(siteId);
          });
        }

        function initFilters() {
          $scope.selectedTags = [];
          $scope.selectedTagNames = [];
          $scope.selectedTagsInGroup = '';
          $scope.data.filterText = ''; // clear search text when tags are applied
        }

        function setSelectedFilters(filters) {
          initFilters();

          if (ObjectUtils.isNullOrUndefined(filters)) {
            return;
          }

          $scope.tags = [];

          // Selected Tags
          var selectedTags = filters[0];

          _.each(Object.keys(selectedTags), function (key) {
            if (selectedTags[key] === true) {
              $scope.selectedTags.push(key);
              $scope.tags.push(key);
              $scope.selectedTagNames.push(getSelectedTagName(filters, key));
            }
          });

          setFilterActive();
        }

        function getSelectedTagName(filters, key) {
          if (filters.length > 1) {
            return filters[1][key];
          }
          return null;
        }

        function isAllSitesSelected() {
          if (ObjectUtils.isNullOrUndefinedOrEmpty($scope.sites) ||
            ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites)) {
            return false;
          }
          return ($scope.selectedSites.length === $scope.sites.length);
        }

        function siteDropdownIsDisabled() {
          return false;
        }

        function toggleSite(siteId) {
          if (siteIsSelected(siteId)) {
            var index = $scope.selectedSites.indexOf(siteId);
            removeSiteIfo(siteId);
            $scope.selectedSites.splice(index, 1);
            setRefresh();
            setSingleSiteSelection();
            setFilterActive();
            return;
          }

          $scope.selectedSites.push(siteId);
          addToSiteIfo(siteId);
          setRefresh();
          setSingleSiteSelection();
          setFilterActive();
        }

        function setRefresh() {
          realTimeDataService.cancelAllOutstandingRequests();
          $scope.refreshData = true;
        }

        function addToSiteIfo(siteId) {
          var site = _.findWhere($scope.sites, { site_id: siteId });
          if (!ObjectUtils.isNullOrUndefined(site)) {
            $scope.selectedSitesInfo.push(site);
          }
        }

        function removeSiteIfo(siteId) {
          var site = _.findWhere($scope.sites, { site_id: siteId });
          var index = $scope.selectedSitesInfo.indexOf(site);
          $scope.selectedSitesInfo.splice(index, 1);
        }

        function siteIsSelected(siteId) {
          if (ObjectUtils.isNullOrUndefinedOrEmpty($scope.selectedSites)) {
            return false;
          }
          return ($scope.selectedSites.indexOf(siteId) > -1);
        }

        function orgHasEnterExit() {
          return !ObjectUtils.isNullOrUndefined($scope.currentOrganization) &&
            !ObjectUtils.isNullOrUndefined($scope.currentOrganization.portal_settings) &&
            !ObjectUtils.isNullOrUndefinedOrBlank($scope.currentOrganization.portal_settings.enter_exit);
        }

        function getEnterExit() {
          return orgHasEnterExit() ? $scope.currentOrganization.portal_settings.enter_exit : 'Exits';
        }

        function setEnterExits() {
          $scope.enterExit = getEnterExit();
        }

        function scheduleExportCurrentViewToPdf() {
          _.each($scope.metricsToShow, function (value) {
            exportWidget(value);
          });
          $state.go('pdfexport', { orgId: currentOrganization.organization_id, view: 'schedule' });
        }

        function exportWidget(metricKey) {
          var params;
          params = {
            orgId: $scope.currentOrganization.organization_id,
            organizationId: $scope.currentOrganization.organization_id,
            dateRange: $scope.dateRange,
            compare1Range: $scope.dateRange,
            compare2Range: $scope.dateRange,
            compare1Type: $scope.compareRange1Type,
            compare2Type: $scope.compareRange2Type,
            dateFormat: $scope.dateFormat,
            name: metricKey,
            language: $scope.language,
            firstDayOfWeekSetting: $scope.firstDayOfWeek,
            operatingHours: $scope.operatingHours,
            currencySymbol: _.findWhere(metricConstants.metrics, { isCurrency: true }).prefixSymbol,
            hasSales: $scope.orgHasSales,
            hasLabor: $scope.orgHasLabor,
            businessDays: $scope.businessDays,
            selectedTimeOption: $scope.selectedTimeOption,
            selectedTags: $scope.selectedTags,
            selectedTagsSites: _.pluck($scope.selectedTagsSites, 'site_id'),
            selectedSites: $scope.selectedSites,
            singleSite: $scope.singleSite
          };

          if (metricKey === 'real_time_interval_data_widget') {
            params.selectedMetricIds = _.map($scope.selectedMetrics, function (metric) { return metric.value; });
            params.showTable = $scope.showTable;
          }

          if (!ObjectUtils.isNullOrUndefined($scope.currentSite)) {
            params.siteId = $scope.currentSite.site_id;
          }

          if (!ObjectUtils.isNullOrUndefined($scope.currentZone)) {
            params.zoneId = $scope.currentZone.id;
          }

          if (!ObjectUtils.isNullOrUndefined($scope.vm.filterString) &&
            !ObjectUtils.isNullOrUndefined($scope.vm.filterString[metricKey])) {
            params.filterQuery = $scope.vm.filterString[metricKey];
          }

          if (!ObjectUtils.isNullOrUndefined($scope.vm.orderByString) &&
            !ObjectUtils.isNullOrUndefined($scope.vm.orderByString[metricKey])) {
            params.orderBy = $scope.vm.orderByString[metricKey];
          }

          ExportService.createExportAndStore(params);
        }

        function setShowTable(flag) {
          $scope.showTable = flag;
        }

        function widgetIsExported(metricKey) {
          var dateRangeKey = ExportService.buildDateRangeKey($scope.dateRange, $scope.dateRange, $scope.dateRange);
          var siteId;
          if (!ObjectUtils.isNullOrUndefined($scope.currentSite)) {
            siteId = $scope.currentSite.site_id;
          }

          return ExportService.isInExportCart(ExportService.buildAreaKey($scope.currentOrganization.organization_id, siteId, null, null, $scope.selectedTags), dateRangeKey, metricKey);
        }

        function dateRangesLoaded() {
          utils.urlDateParamsLoaded($stateParams);
        }

        function checkAccess() {
          if (!SubscriptionsService.hasRealTime(currentOrganization)) {
            $state.go('home');
          }
        }
      }]);
})();
