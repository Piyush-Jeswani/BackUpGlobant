(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('AnalyticsHeaderWithZoneSelectorCtrl', AnalyticsHeaderWithZoneSelectorCtrl);

  AnalyticsHeaderWithZoneSelectorCtrl.$inject = [
    '$scope',
    '$state',
    'currentOrganization',
    'currentSite',
    'currentZone',
    'currentEntrance',
    'ZoneResource',
    '$stateParams',
    'currentUser',
    '$translate',
    'LocalizationService',
    'ObjectUtils'
  ];
  function AnalyticsHeaderWithZoneSelectorCtrl(
    $scope,
    $state,
    currentOrganization,
    currentSite,
    currentZone,
    currentEntrance,
    ZoneResource,
    $stateParams,
    currentUser,
    $translate,
    LocalizationService,
    ObjectUtils
  ) {

    $scope.currentOrganization = currentOrganization;
    $scope.currentSite = currentSite;
    $scope.currentZone = currentZone;
    $scope.currentUser = currentUser;
    $scope.currentEntrance = currentEntrance;
    $scope.zoneSelectorIsVisible = false;
    $scope.dateRangesLoaded = dateRangesLoaded();

    $scope.$watchGroup([
      '$scope.orgId',
      '$scope.siteId'
    ], updateZones);

    /* Just an elegant temporary fix to remove first x character from some zone names
       of orgId 6255. To be removed in January 2016. */
    $scope.$watchCollection('zones', function() {
      if($scope.currentOrganization.organization_id === 6255) {
        angular.forEach($scope.zones,function(zone) {
          if(currentZone !== undefined && zone.name.substring(0,1)==='x') {
            zone.name = zone.name.substring(1);
          }
        });
        if(currentZone !== undefined && currentZone !== null) {
          if(currentZone.name.substring(0,1)==='x') {
            currentZone.name = currentZone.name.substring(1);
          }
        }
      }
    });

    activate();

    function activate() {
      $scope.stateData = typeof $state.current.data === 'undefined' ? {} : $state.current.data;

      $scope.language = LocalizationService.getCurrentLocaleSetting();
      $scope.viewTitle = 'views.' + $scope.stateData.translationSlug;
      loadTranslations();

      if($stateParams.comparisonDateRangeStart !== undefined && $stateParams.comparisonDateRangeEnd !== undefined) {
        $scope.comparisonDateRangeStart = $stateParams.comparisonDateRangeStart;
        $scope.comparisonDateRangeEnd = $stateParams.comparisonDateRangeEnd;
      }

      $scope.zoneSelectorIsVisible = true;
      $scope.viewLevel = getCurrentViewLevel();
    }

    function updateZones() {
      $scope.zones = new ZoneResource().query({
            orgId: currentOrganization.organization_id,
            siteId: currentSite.site_id
      });
    }

    function dateRangesLoaded() {
      if($stateParams.dateRangeStart !== undefined && $stateParams.dateRangeEnd !== undefined) {
           return true;
      } else {
        return false;
      }
    }

    function loadTranslations() {
      $translate.use($scope.language);
    }

    function getCurrentViewLevel() {
      if(!siteIsDefined() && !zoneIsDefined()) {
        return 'organization';
      } else if(siteIsDefined() && !zoneIsDefined()) {
        return 'site';
      } else if(siteIsDefined() && zoneIsDefined() && entranceIsDefined()) {
        return 'entrance';
      } else if(siteIsDefined() && zoneIsDefined()) {
        return 'zone';
      }  else {
        return null;
      }
    }

    function siteIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentSite);
    }

    function zoneIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentZone);
    }

    function entranceIsDefined() {
      return !ObjectUtils.isNullOrUndefined(currentEntrance);
    }

  }
})();
