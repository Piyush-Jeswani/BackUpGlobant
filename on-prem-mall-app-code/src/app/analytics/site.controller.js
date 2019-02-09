(function() {
  'use strict';

  angular.module('shopperTrak').
    controller('SiteController', SiteController);

  SiteController.$inject = [
    '$scope',
    '$state',
    '$timeout',
    '$translate',
    'currentUser',
    'currentOrganization',
    'currentSite',
    'locations',
    'SubscriptionsService',
    'LocalizationService',
    'metricNameService',
    'ExportService'
  ];

  function SiteController(
    $scope,
    $state,
    $timeout,
    $translate,
    currentUser,
    currentOrganization,
    currentSite,
    locations,
    SubscriptionsService,
    LocalizationService,
    metricNameService,
    ExportService
  ) {

    activate();

    function activate() {
      setLocale(currentUser, currentOrganization)
      .then(onTranslationsLoaded)
      .catch(function(error) {
        // Fallback to english
        console.error(error);

        $translate.use('en_US')
          .then(onTranslationsLoaded);
      });
    }

    function onTranslationsLoaded() {
      metricNameService.applyCustomMetricNames(currentOrganization)
        .then(function() {
          $scope.translationsLoaded = true;
          $scope.$on('$stateChangeSuccess', redirectIfNecessary);
          redirectIfNecessary();
        });

        ExportService.setTranslations();        
    }

    function setLocale(currentUser, currentOrganization) {
      LocalizationService.setUser(currentUser);
      LocalizationService.setOrganization(currentOrganization);

      var locale = LocalizationService.getCurrentLocaleSetting();

      return $translate.use(locale);
    }

    function redirectIfNecessary() {

      if ($state.current.name !== 'analytics.organization.site') {
        return;
      }

      var siteHasPerimeter = SubscriptionsService.siteHasPerimeter(currentOrganization, currentSite);

      var stateName = siteHasPerimeter ?
                      'analytics.organization.site.traffic' :
                      'analytics.organization.site.visitor-behavior';

      if (currentSite.fullAccess) {
        $state.go(stateName, {
          orgId: currentOrganization.organization_id,
          siteId: currentSite.site_id
        });
      } else if (locations.length > 0) {
        $state.go(stateName, {
          orgId: currentOrganization.organization_id,
          siteId: currentSite.site_id,
          locationId: locations[0].location_id
        });
      } else {
        throw new Error('No routes available with current access rights.');
      }
    }
  }
})();
