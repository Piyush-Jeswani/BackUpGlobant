(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('OrganizationController', OrganizationController);

  OrganizationController.$inject = [
    '$scope',
    '$state',
    '$translate',
    '$timeout',
    'currentUser',
    'currentOrganization',
    'sites',
    'SubscriptionsService',
    'LocalizationService',
    'metricNameService',
    'ExportService'
  ];

  function OrganizationController(
    $scope,
    $state,
    $translate,
    $timeout,
    currentUser,
    currentOrganization,
    sites,
    SubscriptionsService,
    LocalizationService,
    metricNameService,
    ExportService
  ) {
    var vm = this;

    vm.sites = sites;

    activate();

    function activate() {
      setLocale(currentUser, currentOrganization)
        .then(onTranslationsLoaded)
        .catch(function(error) {
          // Fallback to english
          console.error(error);

          $translate.use('en_US')
            .then(onTranslationsLoaded);
        })
    }

    function onTranslationsLoaded() {
      metricNameService.applyCustomMetricNames(currentOrganization)
        .then(function() {
          vm.translationsLoaded = true;
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
      if ($state.current.name !== 'analytics.organization') {
        return;
      }

      if (SubscriptionsService.onlyMiSubscription(currentOrganization, sites)) {
        $state.go('analytics.organization.marketIntelligence.dashboard');
      } else if (sites.length > 1) {
        if (currentOrganization.portal_settings !== undefined &&
          currentOrganization.portal_settings.organization_type !== undefined &&
          currentOrganization.portal_settings.organization_type === 'Retail'
        ) {
          $state.go('analytics.organization.retail');
        } else {
          $state.go('analytics.organization.summary');
        }
      } else if (sites.length === 1) {
        $state.go('analytics.organization.site', {
          orgId: currentOrganization.organization_id,
          siteId: sites[0].site_id
        });
      }
    }
  }
})();
