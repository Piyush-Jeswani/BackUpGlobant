(function () {
  'use strict';
  angular.module('shopperTrak').controller('HeaderCtrl', HeaderCtrl);

  HeaderCtrl.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$location',
    '$window',
    '$timeout',
    '$http',
    '$q',
    'authService',
    'ExportService',
    'SubscriptionsService',
    'LocationResource',
    'currentUser',
    'OrganizationResource',
    'organizations',
    '$translate',
    'LocalizationService',
    'metricConstants',
    'currencyService',
    'ObjectUtils',
    'apiUrl',
    'sitesRequestsService',
    'googleAnalytics',
    'features',
    'localStorageService',
    'routeUtils',
    'widgetLibraryService',
    'SiteResource'
  ];

  function HeaderCtrl (
    $scope,
    $rootScope,
    $state,
    $location,
    $window,
    $timeout,
    $http,
    $q,
    authService,
    ExportService,
    SubscriptionsService,
    LocationResource,
    currentUser,
    OrganizationResource,
    organizations,
    $translate,
    LocalizationService,
    metricConstants,
    currencyService,
    ObjectUtils,
    apiUrl,
    sitesRequestsService,
    googleAnalytics,
    features,
    localStorageService,
    routeUtils,
    widgetLibraryService,
    SiteResource
  ) {
    $scope.orgSelect = {};
    $scope.siteSelect = {};
    $scope.siteSelect.sites = [];

    $scope.siteSelectionDropdownIsOpen = false;
    $scope.getExportCartItemCount = function () {
      return ExportService.getCartItemCount();
    };
    $scope.logout = authService.logout;
    $scope.numPdfExportsInProgress = 0;
    $scope.$state = $state;
    $scope.currentUser = currentUser;
    $scope.scheduleExportCurrentViewToPdf = scheduleExportCurrentViewToPdf;
    $scope.organizations = organizations;
    $scope.organizationDropdownIsOpen = false;
    $scope.orgSelect.currentOrganization = null;
    $scope.appDropdownIsOpen = false;
    $scope.clearExportCart = clearExportCart;
    $scope.language = LocalizationService.getCurrentLocaleSetting();
    $scope.setCurrencySymbol = setCurrencySymbol;
    $scope.navigateToAnalytics = navigateToAnalytics;
    $scope.navigateToAdmin = navigateToAdmin;
    $scope.exportHeaderClick = exportHeaderClick;
    $scope.exportDropdownIsOpen = false;

    $scope.campaignAccess = false;
    $scope.showHeaderInformation = true;
    const pageTransitionDebounceTime = 200;

    const stateChangeSuccessDebounced = _.debounce((event, toState, toParams) => {
      // The state change is debounced as we don't want the redirects skewing our tracking data
      trackStateChange(event, toState, toParams);

      if (allDateRangesAreValid(toParams) && 
          (!ObjectUtils.isNullOrUndefined(toState) && toState.name !== 'analytics.organization.site.hourly')) {
            storeDateRanges(toParams);
      }

      if (!ObjectUtils.isNullOrUndefined(toState) && toState.name !== 'analytics.organization.custom-dashboard') {
        setCurrencySymbol();
      }
    }, pageTransitionDebounceTime);

    activate();
    configureDropDowns();

    function activate () {


      setGoogleAnalyticsUserData(currentUser);
      $scope.usedTypeAhead = false;

      updateCurrentOrganization();

      $translate.use($scope.language).then(() => {
        loadTranslations();
      });

      configureWatches();

      $scope.sitesPageNumber = 1;

      $scope.currentStateName = $state.current.name.split('.');

      if ($state.current.name.includes('admin.home')) {
        $scope.showHeaderInformation = false;
      }

      checkForWidgetsAssignedToOrg();

      checkUserOrgAccess();
    }

    function checkUserOrgAccess () {
      $scope.isRestrictedUser = false;
      if (!authService.isSuperUser($scope.currentUser)) {
        const currentOrg = $scope.orgSelect.currentOrganization;
        const userAccess = $scope.currentUser.accessMap;
        if (_.isEmpty(userAccess.actual.sites) && _.isEmpty(userAccess.setup.tags) && !_.isEmpty(userAccess.setup.mi_orgs)
          || isOnlyMISubscribed(currentOrg)) {
          $scope.isRestrictedUser = true;
        }
      }
    }

    function exportHeaderClick(exportClicked) {
      if (exportClicked) {
        $scope.exportDropdownIsOpen = !$scope.exportDropdownIsOpen;
      } else {
        $scope.exportDropdownIsOpen = false;
      }
      $rootScope.$broadcast('exportHeaderClick', exportClicked);
    }

    function isOnlyMISubscribed(currentOrg){
      var isOnlyMISubscribed = false;
      var subscriptionCount = 0;
      if(!_.isEmpty(currentOrg)) {
        if(!_.isEmpty(currentOrg.status_subscriptions) && !ObjectUtils.isNullOrUndefinedOrEmpty(currentOrg.status_subscriptions.market_intelligence)) {
          if(!ObjectUtils.isNullOrUndefinedOrEmpty(_.last(currentOrg.status_subscriptions.market_intelligence).status)) {
            isOnlyMISubscribed = (_.last(currentOrg.status_subscriptions.market_intelligence).status).toLowerCase() === 'active';
          }
        }
        _.each(currentOrg.subscriptions, subscription => {
          if (subscription) subscriptionCount++;
        });
      }
      return subscriptionCount === 0 && isOnlyMISubscribed;
    }

    /**
     * Configures all watch functions. Also destroys watches when this controller is destroyed.
     * Should only be called during the activate cycle of the controller
     */
    function configureWatches () {
      const unbindFunctions = [];

      unbindFunctions.push($scope.$on('$stateChangeSuccess', updateCurrentOrganization));
      unbindFunctions.push($scope.$on('$stateChangeSuccess', updateCurrentSite));
      unbindFunctions.push($scope.$on('$stateChangeSuccess', confirmZoneLevel));
      unbindFunctions.push($scope.$on('$stateChangeSuccess', stateChangeSuccessDebounced));
      unbindFunctions.push($scope.$watch('orgSelect.currentOrganization', updateSites));
      unbindFunctions.push($scope.$watchCollection('organizations', updateCurrentOrganization));
      unbindFunctions.push($scope.$watchCollection('siteSelect.sites', updateCurrentSite));
      unbindFunctions.push($scope.$watchCollection('orgSelect.currentOrganization', setSiteCurrentUiSrefPattern));
      unbindFunctions.push($scope.$on('searchTextChanged', onSearchTextChanged));
      unbindFunctions.push($scope.$on('pdfExportStart', onPdfExportStart));
      unbindFunctions.push($scope.$on('pdfExportFinish', onPdfExportFinish));
      unbindFunctions.push($scope.$watch('siteSelect.addMoreSites', onAddMoreSites));

      unbindFunctions.push($scope.$on('pageLoadFinished', () => {
        $timeout( () => {
          onPageLoadFinished();
        }, pageTransitionDebounceTime);
      }));

      $scope.$on('$destroy', () => {
        _.each(unbindFunctions, unbindFunction => {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function hasMiAccess (user, orgId) {
      if ($state.current.name === 'csv') {
        return false;
      }

      const currentOrganization = getOrganizationById(orgId);

      return SubscriptionsService.hasMarketIntelligence(currentOrganization) &&
        SubscriptionsService.userHasMarketIntelligence(currentUser, orgId);
    }

    function addSites (pageNumber) {
      const minSearchTermLen = 3;
      const params = {
        page_number: pageNumber,
        page_size: 25
      };
      if (!ObjectUtils.isNullOrUndefined($scope.searchTerm) && $scope.searchTerm.length > minSearchTermLen) {
        $scope.usedTypeAhead = true;
        angular.extend(params, {
          site_search_term: $scope.searchTerm
        });
      }
      $scope.isSearchingItems = true;
      getSitesRequest(params).then( output => {
        if (pageNumber > 1) {
          const sitesConCat = $scope.siteSelect.sites.concat(output.data.result);
          $scope.siteSelect.sites = sitesConCat;
        } else {
          $scope.siteSelect.sites = output.data.result;
        }
        if (output.data.result.length > 0) {
          $scope.siteSelect.addMoreSites = false;
        }
        $scope.isSearchingItems = false;
      });
    }

    function scheduleExportCurrentViewToPdf () {
      $rootScope.$broadcast('scheduleExportCurrentViewToPdf');
    }

    function updateCurrentOrganization (nv, ov, newParams, nw, oldParams) {
      if (organizations.length === 1) {
        $scope.orgSelect.currentOrganization = organizations[0];
      } else if ($state.params.orgId) {
        if (resetSavedSearchterm(newParams, oldParams)) {
          $rootScope.savedSearchterm = '';
        }

        $scope.orgSelect.currentOrganization = getOrganizationById($state.params.orgId);
      } else {
        $scope.orgSelect.currentOrganization = null;
      }

      $scope.siteSelect.addMoreSites = false;
      $scope.searchTerm = '';

      // This check for 0 sites in the pull down is necessary before resetting the sitesPageNumber to 1
      // because if the sites pull down has already got sites in it then resetting sitesPageNumber to 1
      // at this point fetches sites from the API for the wrong page e.g.
      // So you might be on page 7 of 10, load a site, and then open the dropdown again which will then
      // append page 1 into where page 8 should go.
      // This was causing the bug in SA-2542.
      if ($scope.siteSelect.sites.length === 0) {
        $scope.sitesPageNumber = 1;
      }

      setCurrencySymbol();
      $scope.adminToolAccess = authService.hasAdminAccess(currentUser);

      $scope.orgMiReportAccess = hasMiAccess(currentUser, $state.params.orgId) &&
        $state.current.name === 'analytics.organization.marketIntelligence.dashboard';
    }

    function resetSavedSearchterm (newParams, oldParams) {
      if (ObjectUtils.isNullOrUndefined(newParams) || ObjectUtils.isNullOrUndefined(oldParams)) {
        return true;
      }
      if (ObjectUtils.isNullOrUndefined(newParams.orgId) || ObjectUtils.isNullOrUndefined(oldParams.orgId)) {
        return true;
      }
      if (newParams.orgId !== oldParams.orgId) {
        return ObjectUtils.isNullOrUndefined(newParams.siteId);
      }
        
      return ObjectUtils.isNullOrUndefined(newParams.siteId) && !ObjectUtils.isNullOrUndefined(oldParams.siteId);
    }

    function updateSites () {
      if ($scope.orgSelect.currentOrganization) {
        $scope.isFetchingFirst = true;
        const params = {
          page_number: 1,
          page_size: 25
        };

        const requests = [];

        requests.push(getSitesRequest(params));

        if ($state.params.siteId) {
          // We need to do this incase the selected site is not returned in the first 25 sites
          requests.push(getSite($state.params.siteId));
        }

        $q.all(requests).then( responses => {
          const currentOrgSites = checkCurrentOrgSites(responses, $state.params);
          $scope.siteSelect.sites = currentOrgSites;
          $scope.isSearchingItems = false;
          $scope.isFetchingFirst = false;

        }).catch( error => {
          console.error(error);
        });
      } else {
        $scope.siteSelect.sites = [];
        $scope.isSearchingItems = false;
      }
    }

    /**
     * function used for org with more than 50 sites (50 being the page size), and the site you are 
     * looking at does not appear in the current page, this code makes sure the site is pushed in.
     * And also it check's that the sites must be of active organization only.
     */
    function checkCurrentOrgSites (response, params) {
      let activeSitesOrg;
      let currentOrgForSites;
      const sites = response[0].data.result;
      if ($scope.orgSelect.currentOrganization) {
        currentOrgForSites = $scope.orgSelect.currentOrganization.organization_id;
      }

      if (response[1]) {
        activeSitesOrg = response[1].organization.id;
      }

      if (params.siteId) {
        let activeSiteId;
        if (!_.isNumber(params.siteId)) {
          activeSiteId = Number(params.siteId);
        } else {
          activeSiteId = params.siteId;
        }
        const activeSite = _.findWhere(sites, { site_id: activeSiteId });


        if (_.isUndefined(activeSite) && activeSitesOrg === currentOrgForSites) {
          sites.push(response[1]);
        }
      }
      return sites;

    }


    function getSiteRequestUrl () {
      return `${apiUrl}/organizations/${$scope.orgSelect.currentOrganization.organization_id}/sites/`;
    }

    function getSitesRequest (params) {
      return sitesRequestsService.get(getSiteRequestUrl(), params);
    }

    function getSite (siteId) {
      return SiteResource.get({ orgId: $state.params.orgId, siteId: siteId }).$promise;
    }

    function setSiteCurrentUiSrefPattern () {
      const maxSelectCurrOrgSiteCnt = 2;
      if (ObjectUtils.isNullOrUndefined($scope.orgSelect.currentOrganization) ||
        $scope.orgSelect.currentOrganization.site_count < maxSelectCurrOrgSiteCnt) {
        //single site so remove url from single site to stop refresh
        $scope.usedTypeAhead = false;
        $scope.siteSelect.siteCurrentUiSrefPattern = null;
      }
    }

    function confirmZoneLevel () {
      if ($scope.isSiteLevel === true && !ObjectUtils.isNullOrUndefinedOrBlank($state.params.zoneId)) {
        $scope.isZoneLevel = true;
        $scope.selectedZone = $state.params.zoneId;
      } else {
        delete $scope.isZoneLevel;
        delete $scope.selectedZone;
      }
    }


    function updateCurrentSite () {
      const maxSearchTermLen = 4;
      if ($scope.siteSelect.sites.length === 1 &&
        !ObjectUtils.isNullOrUndefined($scope.searchTerm) && $scope.searchTerm.length < maxSearchTermLen) {
        $scope.siteSelect.currentSite = $scope.siteSelect.sites[0];
        $scope.isSiteLevel = true;
      } else if ($state.params.siteId) {
        $scope.searchTerm = $rootScope.savedSearchterm;
        $scope.siteSelect.currentSite = getSiteById($state.params.siteId);
        $scope.isSiteLevel = true;
      } else {
        $scope.siteSelect.currentSite = undefined;
        $scope.isSiteLevel = false;
      }

      setCurrencySymbol();
    }

    function getOrganizationById (orgId) {
      return _.findWhere($scope.organizations, { organization_id: orgId });
    }

    function getSiteById (siteId) {
      let activeSiteId;
      if (!_.isNumber(siteId)) {
        activeSiteId = Number(siteId);
      } else {
        activeSiteId = siteId;
      }
      return _.findWhere($scope.siteSelect.sites, { site_id: activeSiteId });
    }

    function loadTranslations () {
      $translate(['header.SELECTORGANIZATION',
        'header.ORGANIZATIONSUMMARY',
        'header.SELECTPROPERTY',
        'header.SEARCHSITES']).then(results => {
        $scope.siteSelect.activeLinkHeader = results['header.ORGANIZATIONSUMMARY'];
        $scope.orgSelect.selectOrgHeader = results['header.SELECTORGANIZATION'];
        $scope.siteSelect.selectSiteHeader = results['header.SELECTPROPERTY'];
        $scope.siteSelect.promptText = results['header.SEARCHSITES'];
      });
    }

    function configureDropDowns () {
      $scope.orgSelect.orgCurrentUiSrefPattern = 'analytics.organization({ orgId: item.organization_id })';
      $scope.siteSelect.siteUiSrefPattern = 
      'analytics.organization.site({orgId: item.organization.id,siteId: item.site_id,locationId: null })';
      $scope.siteSelect.orgUiSrefPattern = 'analytics.organization({orgId: currentItem.organization.id,siteId: null,locationId: null })';
      $scope.siteSelect.siteCurrentUiSrefPattern = 
      'analytics.organization.site({orgId: currentItem.organization.id,siteId: currentItem.site_id,locationId: null })';
    }

    function setCurrencySymbol () {
      if (ObjectUtils.isNullOrUndefined($scope.orgSelect.currentOrganization)) {
        return;
      }
      const orgId = $scope.orgSelect.currentOrganization.organization_id;
      let siteId;

      if (!ObjectUtils.isNullOrUndefined($scope.siteSelect.currentSite)) {
        siteId = $scope.siteSelect.currentSite.site_id;
      }

      currencyService.getCurrencySymbol(orgId, siteId).then( currencyInfo => {

        if (currencyInfo.orgId !== $scope.orgSelect.currentOrganization.organization_id) {
          // This call back is late, go away
          return;
        }

        if (!ObjectUtils.isNullOrUndefined($scope.siteSelect.currentSite) &&
          currencyInfo.siteId !== $scope.siteSelect.currentSite.site_id) {
          // This call back is late, go away
          return;
        }

        _.filter(metricConstants.metrics, metric => {
          if (metric.isCurrency === true) {
            metric.prefixSymbol = currencyInfo.currencySymbol;
          }
        });
      });
    }

    function clearExportCart () {
      ExportService.clearExportCart();
      const cleanUpExportCall = $rootScope.$broadcast('clearCurrentPDfExports');

      $scope.$on('$destroy', () => {
        if (typeof cleanUpExportCall === 'function') {
          cleanUpExportCall();
        }
      });
    }

    function navigateToAnalytics () {
      if (ObjectUtils.isNullOrUndefined($scope.orgSelect) ||
        ObjectUtils.isNullOrUndefined($scope.orgSelect.currentOrganization)) {
        $state.go('analytics');
      } else {
        $state.go('analytics.organization', { orgId: $scope.orgSelect.currentOrganization.organization_id });
      }
    }

    // Helper method to help with navigation.
    // If we have one organisation we just navigate straight there.
    // If we have more than one org we let the user choose.
    function navigateToAdmin () {

      let numberOfOrgs = 0;

      //If we are a super user we have access to ALL so let them choose which org.
      if ($scope.currentUser.superuser === true) {
        $state.go('admin.organizations');
        return;
      }

      //Get the number of orgs we have for admin access.
      if ($scope.currentUser) {
        numberOfOrgs = $scope.currentUser.accessMap.setup.orgs_admin.length;

        if (numberOfOrgs === 1) {
          // Go directly to the admin page for the org.
          const orgId = $scope.currentUser.accessMap.setup.orgs_admin[0];
          $state.go('admin.organizations.edit', { orgId: orgId });
        } else {
          if (numberOfOrgs > 1) {
            $state.go('admin.organizations');
          }
        }
      }
    }

    function trackStateChange (event, toState, toParams) {
      if (_.isUndefined($window.performance)) {
        // We time all of our state changes. If we can't, we don't track
        return;
      }

      if ($rootScope.pdf) {
        return;
      }

      // We track only the location.path as we don't want the date params skewing tracking data
      const currentPath = $location.$$path;

      if (ObjectUtils.isNullOrUndefinedOrBlank(currentPath)) {
        return;
      }

      if (routeRequiresDateRanges(toParams) && !hasDateRanges(toParams)) {
        // This means we don't track redirection URLs
        return;
      }

      if (paramsHaveOrgId(toParams)) {
        googleAnalytics.setOrg(toParams.orgId);
      }

      if (!_.isUndefined($scope.currentLoadingView)) {
        // The user navigated away before the load completed, so let's just close off this load

        googleAnalytics.sendPageView($scope.currentLoadingView.path);

        delete $scope.currentLoadingView;
      }

      $scope.currentLoadingView = {
        path: currentPath,
        loadStartTime: $window.performance.now()
      };
    }

    function onPageLoadFinished () {
      if (_.isUndefined($scope.currentLoadingView)) {
        throw new Error('No view is currently loading');
      }

      const loadFinishTime = $window.performance.now();

      const loadTimeInMilliseconds = Math.round(loadFinishTime - $scope.currentLoadingView.loadStartTime);

      $rootScope.$broadcast('page-loaded'); //used by page controllers to bind widgetIsLoaded to scope
      googleAnalytics.sendPageView($scope.currentLoadingView.path, loadTimeInMilliseconds);

      delete $scope.currentLoadingView;
    }

    function paramsHaveOrgId (toParams) {
      return !ObjectUtils.isNullOrUndefined(toParams) && !ObjectUtils.isNullOrUndefined(toParams.orgId);
    }

    function routeRequiresDateRanges (toParams) {
      const dateRangeProperties = getDateRangeProperties();

      return _.every(dateRangeProperties, dateRangeProperty => {
        return _.has(toParams, dateRangeProperty);
      });
    }

    function hasDateRanges (toParams) {
      const dateRangeProperties = getDateRangeProperties();

      return _.every(dateRangeProperties, dateRangeProperty => {
        return !ObjectUtils.isNullOrUndefined(toParams[dateRangeProperty]);
      });
    }

    function getDateRangeProperties () {
      return [
        'dateRangeEnd',
        'dateRangeStart',
        'compareRange1Start',
        'compareRange1End',
        'compareRange2Start',
        'compareRange2End'
      ];
    }

    /**
     * Handler for the search text changing
     *
     * @param {object} event - The event object. Not currently used.
     * @param {string} searchValue The text entered into the search box
     */
    function onSearchTextChanged (event, searchValue) {
      if ($scope.searchTerm === '' && searchValue === '' || $scope.searchTerm !== searchValue) {
        $scope.searchUsed = false;
        $scope.searchTerm = searchValue;
        $rootScope.savedSearchterm = searchValue;
        $scope.sitesPageNumber = 1;
        addSites(1);
      }
    }

    /**
     * Handler for a PDF export starting. Increments the export counter.
     */
    function onPdfExportStart () {
      $scope.numPdfExportsInProgress++;
    }

    /**
     * Handler for a PDF export finishing. Decrements the export counter.
     */
    function onPdfExportFinish () {
      $scope.numPdfExportsInProgress--;
    }

    /**
     * Watch handler for more the siteSelect.addMoreSites value changing
     * @param {object} nv - The new value
     */
    function onAddMoreSites (nv) {
      if (nv) {
        $scope.sitesPageNumber++;
        addSites($scope.sitesPageNumber);
      }
    }

    function setGoogleAnalyticsUserData (user) {
      if ($rootScope.pdf) {
        return;
      }

      googleAnalytics.setUserId(user._id);

      const userRole = getUserRole(user);

      googleAnalytics.setUserRole(userRole);
    }

    function getUserRole (user) {
      if (user.superuser === true) {
        return 'ST Admin';
      }

      if (hasUserAccessMap(user) && user.accessMap.setup.orgs_admin.length > 0) {
        return 'Org Admin';
      }

      return 'User';
    }

    function hasUserAccessMap (user) {
      return user.accessMap && user.accessMap.setup && user.accessMap.setup.orgs_admin;
    }

    function checkForWidgetsAssignedToOrg () {
      widgetLibraryService.loadAvailableWidgetLibraries($scope.currentUser, $scope.organizations)
        .then( response => {
          if (ObjectUtils.isNullOrUndefinedOrEmpty(response)) {
            $scope.showWidgetLibrary = false;
          } else {
            $scope.showWidgetLibrary = true;
          }
        })
        .catch( error => {
          $scope.showWidgetLibrary = false;
          console.error('error in loadAvailableWidgetLibraries ', error);
        });
    }

    /**
     * Checks all date ranges contain momentJs objects
     * Private function
     *
     * @param {object<stateParams>} toParams the to state params
     * @returns {boolean} The result
     */
    function allDateRangesAreValid (toParams) {
      return moment.isMoment(toParams.dateRangeStart) &&
        moment.isMoment(toParams.dateRangeEnd) &&
        moment.isMoment(toParams.compareRange1Start) &&
        moment.isMoment(toParams.compareRange1End) &&
        moment.isMoment(toParams.compareRange2Start) &&
        moment.isMoment(toParams.compareRange2End);
    }

    /**
     * Stores the current date ranges into local storage,
     * If the default date range matches the selected data range then DO NOT set
     * local storage because this will cause the local storage to be overwritten
     * with the date range defaults of a week and we don't want this
     * i.e. if the user has selected an org and changes the date range e.g. from week to year,
     * then when he/she selects a site the current date range selected should be inherited
     * otherwise will default back to week.
     * Private function
     *
     * @param {object<stateParams>} toParams the to state params
     */
    function storeDateRanges (toParams) {
      // Fetch the current start and end dates for default date range
      const currentDateRange = routeUtils.getDefaultDateRangeParams();


      if (!(currentDateRange.dateRangeStart.format('YYYY-MM-DD') === moment(toParams.dateRangeStart).format('YYYY-MM-DD')
        &&
        currentDateRange.dateRangeEnd.format('YYYY-MM-DD') === moment(toParams.dateRangeEnd).format('YYYY-MM-DD'))) {
        const selectedDateRanges = {};

        if (!_.isUndefined(toParams.dateRangeStart) &&
          moment.isMoment(toParams.dateRangeStart) &&
          !_.isUndefined(toParams.dateRangeEnd) &&
          moment.isMoment(toParams.dateRangeEnd)) {
          selectedDateRanges.current = {
            start: toParams.dateRangeStart,
            end: toParams.dateRangeEnd
          };
        }

        if (!_.isUndefined(toParams.compareRange1Start) &&
          moment.isMoment(toParams.compareRange1Start) &&
          !_.isUndefined(toParams.compareRange1End) &&
          moment.isMoment(toParams.compareRange1End)) {
          selectedDateRanges.compare1 = {
            start: toParams.compareRange1Start,
            end: toParams.compareRange1End
          };
        }

        if (!_.isUndefined(toParams.compareRange2Start) &&
          moment.isMoment(toParams.compareRange2Start) &&
          !_.isUndefined(toParams.compareRange2End) &&
          moment.isMoment(toParams.compareRange2End)) {
          selectedDateRanges.compare2 = {
            start: toParams.compareRange2Start,
            end: toParams.compareRange2End
          };
        }

        localStorageService.set('selectedDateRanges', JSON.stringify(selectedDateRanges));
      }
    }
  }
})();
