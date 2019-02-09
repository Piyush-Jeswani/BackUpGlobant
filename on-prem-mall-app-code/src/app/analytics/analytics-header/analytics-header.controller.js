(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AnalyticsHeaderCtrl', AnalyticsHeaderCtrl);

  AnalyticsHeaderCtrl.$inject = [
    '$scope',
    '$state',
    'currentOrganization',
    'currentSite',
    'currentLocation',
    'locations',
    '$stateParams',
    '$translate',
    'currentUser',
    'LocalizationService',
    'ObjectUtils',
    'customDashboardService',
    'currentEntrance',
    'SubscriptionsService'
  ];

  function AnalyticsHeaderCtrl(
    $scope,
    $state,
    currentOrganization,
    currentSite,
    currentLocation,
    locations,
    $stateParams,
    $translate,
    currentUser,
    LocalizationService,
    ObjectUtils,
    customDashboardService,
    currentEntrance,
    subscriptionsService
  ) {

    $scope.currentOrganization = currentOrganization;
    $scope.currentSite = currentSite;
    $scope.currentLocation = currentLocation;
    $scope.currentUser = currentUser;
    $scope.areaSelectorIsVisible = false;
    $scope.locations = locations;
    $scope.showSelectAllButton = false;
    $scope.dateRangesLoaded = dateRangesLoaded();

    $scope.vm.saveDashboard = saveDashboard;

    function saveDashboard(target, newDashboardName) {
      $scope.vm.dashNameExists = false;
      if (ObjectUtils.isNullOrUndefinedOrEmpty(newDashboardName)){
        $scope.vm.noDashName = true;
        return;
      } else if (!customDashboardService.isNewDashboardAllowed(newDashboardName, currentUser)) {
        $scope.vm.dashNameExists = true;
        return;
      } else if(! $scope.vm.nameMaxLength) {
        $scope.vm.dashNameExists = false;
        customDashboardService.saveNewDashboard(newDashboardName, $scope.vm.customCharts, currentUser);
        $scope.vm.newDashboardName = '';
        angular.element(target).modal('hide');
      }
    }

    activate();

    function activate() {
      $scope.stateData = ObjectUtils.isNullOrUndefined($state.current.data) ? {} : $state.current.data;

      $scope.language = LocalizationService.getCurrentLocaleSetting();
      $scope.viewTitle = 'views.' + $scope.stateData.translationSlug;
      loadTranslations();

      if(!ObjectUtils.isNullOrUndefined($stateParams.comparisonDateRangeStart) && !ObjectUtils.isNullOrUndefined($stateParams.comparisonDateRangeEnd)) {
        $scope.comparisonDateRangeStart = $stateParams.comparisonDateRangeStart;
        $scope.comparisonDateRangeEnd = $stateParams.comparisonDateRangeEnd;
      }

      if (locations.length > 1 ) {
        $scope.areaSelectorIsVisible = true;
      }

      if (locations.length === 1 && ObjectUtils.isNullOrUndefined($scope.currentLocation)) {
        $state.params.locationId = locations[0].location_id;
        $state.go($state.current.name, $state.params);
      }

      if(!ObjectUtils.isNullOrUndefinedOrEmpty($scope.currentLocation)) {
        $scope.currentDepth = $scope.currentLocation.nested_set.depth;
      } else {
        $scope.currentDepth = 1;
      }

      $scope.viewLevel = getCurrentViewLevel();
      $scope.hasMarketIntelligence = hasMarketIntelligence();
    }

    function hasMarketIntelligence() {
      return subscriptionsService.hasMarketIntelligence(currentOrganization) && 
        subscriptionsService.userHasMarketIntelligence(currentUser, currentOrganization.organization_id);
    }

    function getCurrentViewLevel() {
      if(!siteIsDefined() && !locationIsDefined()) {
        return 'organization';
      } else if(siteIsDefined() && !locationIsDefined()) {
        return 'site';
      } else if(siteIsDefined() && entranceIsDefined()) {
          return 'entrance';
      } else if(siteIsDefined() && locationIsDefined()) {
        return 'location';
      } else {
        return null;
      }
    }

    function siteIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentSite);
    }

    function locationIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentLocation);
    }

    function entranceIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentEntrance);
    }

    function dateRangesLoaded() {
      return !ObjectUtils.isNullOrUndefined($stateParams.dateRangeStart) &&
             !ObjectUtils.isNullOrUndefined($stateParams.dateRangeEnd);
    }

    function loadTranslations() {
      $translate.use($scope.language);
    }
  }
})();
