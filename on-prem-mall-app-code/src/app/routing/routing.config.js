(function() {
  'use strict';
  angular.module('shopperTrak.routing').config(routing);

  routing.$inject = [
    '$stateProvider',
    '$urlRouterProvider',
    '$urlMatcherFactoryProvider'
  ];

  function routing(
    $stateProvider,
    $urlRouterProvider,
    $urlMatcherFactoryProvider
  ) {

    var resolves = getRoutingResolves();

    registerCustomUrlParameterTypes();

    $urlRouterProvider.rule(function($injector, $location) {
      var queryParams = $location.search(),
        authService = $injector.get('authService');
      if (queryParams.hasOwnProperty('token')) {
        authService.loginWithToken(queryParams.token);
      }
    });

    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        views: {
          header: {
            templateUrl: 'app/header/header.html'
          },
          main: {
            templateUrl: 'app/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'vm' // vm stands for viewmodel
          }
        }
      })
      .state('account', {
        url: '/account/:refreshCache?',
        views: {
          header: {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils',
              currentUser: [
                '$stateParams',
                'authService',
                function($stateParams, authService) {
                  var disableCache = !!$stateParams.refreshCache;
                  return authService.getCurrentUser(disableCache);
                }
              ]
            }
          },
          main: {
            templateUrl: 'app/account/account.partial.html',
            controller: 'AccountCtrl'
          }
        },
        resolve: {
          organizations: resolves.organizations
        }
      })
      .state('pdf', {
        // Renaming this without co-ordinating API changes will break scheduled PDFs.
        url: '/pdf/:data',
        views: {
          header: {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils',
              currentUser: resolves.currentUser
            }
          },
          main: {
            templateUrl: 'app/pdf/pdf.html',
            controller: 'PdfCtrl'
          }
        },
        resolve: {
          organizations: resolves.organizations,
          currentOrganization: resolves.currentOrganizationResolve,
          currentUser: resolves.currentUser,
          currentSite: resolves.currentSite
        }
      })
      .state('csv', {
        url: '/csv/{orgId:int}/:siteId/:zoneId?{startDate}&{endDate}&{tag}&{site}&{kpi}&{salesCategories}&{activeShortcut}',
        views: {
          header: {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils',
              currentUser: resolves.currentUser
            }
          },
          main: {
            templateUrl: 'app/csv-export/csv-export.partial.html',
            controller: 'CSVExportCtrl',
            controllerAs: 'vm'
          }
        },
        resolve: {
          organizations: resolves.organizations,
          currentOrganization: resolves.currentOrganizationResolve,
          previousState: [
            '$state',
            function($state) {
              return $state.current.name;
            }
          ],
          activeFilters: [
            '$state',
            function($state) {
              return $state.activeFilters;
            }
          ],
          activeShortcut: [
            '$state',
            function($state) {
              return $state.params.activeShortcut;
            }
          ],
          currentUser: resolves.currentUser,
          currentSite: resolves.currentSite,
          currentZone: resolves.currentZone,
        }
      })
      .state('pdfexport', {
        url: '/pdfexport/{orgId:int}/:siteId',
        views: {
          header: {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils'
            }
          },
          main: {
            templateUrl: 'app/pdf-export/pdf-export.partial.html',
            controller: 'PdfExportCtrl'
          }
        },
        resolve: {
          organizations: resolves.organizations,
          currentOrganization: resolves.currentOrganizationResolve,
          currentUser: resolves.currentUser

        }
      })
      .state('analytics', {
        url: '',
        views: {
          'header': {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils',
              currentUser: resolves.currentUser
            }
          },
          main: {
            templateUrl: 'app/analytics/analytics.partial.html',
            controller: 'AnalyticsController'
          }
        },
        resolve: {
          organizations: resolves.organizations,
          currentUser: resolves.currentUser
        }
      })
      .state('analytics.organization', {
        url: '/{orgId:int}',
        templateUrl: 'app/analytics/organization.partial.html',
        controller: 'OrganizationController',
        controllerAs: 'vm',
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve
        }
      })
      .state('analytics.organization.compare', {
        url: '/compare?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/compare/org-compare/org-compare.partial.html',
            controller: 'OrgCompareController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite
        },
        data: {
          title: 'Compare',
          translationSlug: 'COMPARE',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.marketIntelligence', {
        abstract: true,
        url: '/market-intelligence?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{activeShortcut}',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/market-intelligence/org-mi/org-mi.partial.html',
            controller: 'OrgMiController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite,
          subscriptionCheck: function($state, currentOrganization, SubscriptionsService) {
            if (!SubscriptionsService.hasMarketIntelligence(currentOrganization)) {
              $state.go('analytics');
            }
          }
        },
        data: {
          title: 'Marker Intelligence',
          translationSlug: 'MARKETINTELLIGENCE',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.marketIntelligence.edit', {
        url: '/edit',
        views: {
          marketIntelligenceMain: {
            templateUrl: 'app/analytics/market-intelligence/org-mi/edit-mi-new.partial.html',
            controller: 'EditMiNewController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: resolves.currentSite
        },
        data: {
          title: 'Marker Intelligence',
          translationSlug: 'MARKETINTELLIGENCE',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.marketIntelligence.dashboard', {
        url: '',
        views: {
          marketIntelligenceMain: {
            templateUrl: 'app/analytics/market-intelligence/org-mi/dashboard-mi.partial.html',
            controller: 'DashboardMiController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentUser: resolves.currentUser
        },
      })
      .state('analytics.organization.summary', {
        url: '/summary?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        params:{
          previousSelectedMonth: null
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/organization-summary/organization-summary.partial.html',
            controller: 'OrganizationSummaryController',
            controllerAs: 'vm'
          }
        },
        // AnalyticsHeaderCtrl depends on currentSite,
        // currentLocation and locations.
        resolve: {
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: function() {
            return null;
          },
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          sites: resolves.sitesResolve,
          currentZone: resolves.currentZone,
          currentEntrance: resolves.currentEntrance
        },
        data: {
          title: 'Organization Summary',
          translationSlug: 'ORGANIZATIONSUMMARY',
          usesComparisonDateRange: true,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.retail', {
        url: '/retail?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{compareMode}&{activeShortcut}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/retail-organization-summary/retail-organization-summary.partial.html',
            controller: 'RetailOrganizationSummaryController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: function() {
            return null;
          },
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          currentEntrance: function () {
            return null;
          },
          sites: resolves.sitesResolve
        },
        data: {
          title: 'Retail Organization Summary',
          translationSlug: 'RETAILORGANIZATIONSUMMARY',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site', {
        url: '/{siteId:int}',
        templateUrl: 'app/analytics/site.partial.html',
        controller: 'SiteController',
        resolve: {
          currentSite: resolves.currentSite,
          locations: ['$stateParams', 'LocationResource', function($stateParams, LocationResource) {
            if ($stateParams.orgId && $stateParams.siteId) {
              return LocationResource.query({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }).$promise;
            } else {
              return [];
            }
          }]
        }
      })
      .state('analytics.organization.site.sales-and-conversion', {
        url: '/{zoneId:int}/sales-and-conversion?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{activeShortcut}',
        params: {
          zoneId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderWithZoneSelectorCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/sales-and-conversion/sales-and-conversion.html',
            controller: 'SalesAndConversionCtrl',
          }
        },
        resolve: {
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser,
          currentEntrance: resolves.currentEntrance
        },
        data: {
          title: 'Sales and Conversion',
          translationSlug: 'SALES',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.labor', {
        url: '/{zoneId:int}/labor?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        params: {
          zoneId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderWithZoneSelectorCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/labor/labor.html',
            controller: 'LaborCtrl',
          }
        },
        resolve: {
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser,
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Labor',
          translationSlug: 'LABOR',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.visitor-behavior', {
        url: '/{locationId:int}/visitor-behavior?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        params: {
          locationId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/visitor-behavior/visitor-behavior.html',
            controller: 'VisitorBehaviorCtrl',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentLocation: resolves.currentLocation,
          currentUser: resolves.currentUser,
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Visitor behavior analytics',
          translationSlug: 'VISITORBEHAVIOR',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.compare', {
        abstract: true,
        url: '/compare?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            template: '<div ui-view></div>'
          }
        },
        resolve: {
          currentUser: resolves.currentUser,
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          currentEntrance: function () {
            return null;
          }
        }
      })
      .state('analytics.organization.site.compare.graphs', {
        url: '',
        templateUrl: 'app/analytics/compare/graph-compare.partial.html',
        controller: 'GraphCompareController',
        controllerAs: 'vm',
        resolve: {
          currentSite: resolves.currentSite
        },
        data: {
          title: 'Compare',
          translationSlug: 'COMPARE',
          usesComparisonDateRange: false,
          isExportableAsPdf: false // For now, add support later
        }
      })
      .state('analytics.organization.site.compare.table', {
        url: '/table?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}',
        templateUrl: 'app/analytics/compare/table-compare.partial.html',
        controller: 'TableCompareController',
        controllerAs: 'vm',
        data: {
          title: 'Compare',
          translationSlug: 'COMPARE',
          usesComparisonDateRange: true,
          isExportableAsPdf: false // For now, add support later
        }
      })
      .state('analytics.organization.site.traffic', {
        url: '/{zoneId:int}/traffic?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{activeShortcut}',
        params: {
          zoneId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderWithZoneSelectorCtrl',
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/traffic/traffic.html',
            controller: 'TrafficCtrl'
          }
        },
        resolve: {
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser,
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Traffic',
          translationSlug: 'TRAFFIC',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.entrance', {
        url: '/{zoneId:int}/{entranceId:int}/entrance?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{activeShortcut}',
        params: {
          zoneId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderWithZoneSelectorCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/entrance/entrance.html',
            controller: 'TrafficCtrl'
          }
        },
        resolve: {
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser,
          currentEntrance: resolves.currentEntrance
        },
        data: {
          title: 'Traffic',
          translationSlug: 'TRAFFIC',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.hourly', {
        url: '/hourly/?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{activeShortcut}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/hourly/hourly.partial.html',
            controller: 'HourlyController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentOrganization: [
            '$stateParams',
            'OrganizationResource',
            function($stateParams, OrganizationResource) {
              return OrganizationResource.get({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          sites: [
            '$stateParams',
            'SiteResource',
            function($stateParams, SiteResource) {
              return SiteResource.query({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
            if ($stateParams.siteId) {
              return SiteResource.get({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }).$promise;
            } else {
              return null;
            }
          }],
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          currentEntrance: function () {
            return null;
          },
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser
        },
        data: {
          title: 'Hourly',
          translationSlug: 'HOURLY',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })

      .state('analytics.organization.whatIf', {
        url: '/what-if/?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{returnState}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/what-if/what-if.html',
            controller: 'WhatifCtrl',
            controllerAs: 'vm'
          }
        },
        // currentLocation and locations.
        resolve: {
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: resolves.currentSite,
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          currentEntrance: function () {
            return null;
          },
          currentZone: function () {
            return [];
          },

        },
        data: {
          title: 'What If',
          translationSlug: 'WHATIF'
        }
      })

      .state('analytics.organization.site.whatIf', {
        url: '/what-if/?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{returnState}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/what-if/what-if.html',
            controller: 'WhatifCtrl',
            controllerAs: 'vm'
          }
        },
        // currentLocation and locations.
        resolve: {
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: resolves.currentSite,
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          currentEntrance: function () {
            return null;
          },
          currentZone: function () {
            return [];
          },

        },
        data: {
          title: 'What If',
          translationSlug: 'WHATIF'
        }
      })

      .state('analytics.organization.site.usageOfAreas', {
        url: '/{locationId:int}/usage-of-areas?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&locationTypeFilter&{activeShortcut}',
        params: {
          locationId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/usage-of-areas/usage-of-areas.html',
            controller: 'UsageOfAreasCtrl'
          }
        },
        resolve: {
          currentLocation: resolves.currentLocation,
          currentUser: resolves.currentUser,
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Usage of areas',
          translationSlug: 'USAGEOFAREAS',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.campaign-analytics', {
        url: '/{locationId:int}/campaign-analytics?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&locationTypeFilter',
        params: {
          locationId: {
            value: null,
            squash: true
          }
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/detail-kpis/campaign-analytics/campaign-analytics.html',
            controller: 'CampaignAnalyticsCtrl'
          }
        },
        resolve: {
          currentLocation: resolves.currentLocation,
          currentUser: resolves.currentUser
        },
        data: {
          title: 'Campaign Analytics',
          translationSlug: 'CAMPAIGNANALYTICS',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.real-time-data', {
        url: '/{zoneId:int}/real-time-data?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{returnState}&{tag}',
        params: {
          zoneId: {
            value: null,
            squash: true
          },
          realTimeDataShown: true
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderWithZoneSelectorCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/real-time-data/real-time-data.partial.html',
            controller: 'RealTimeDataCtrl',
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          currentZone: resolves.currentZone,
          currentUser: resolves.currentUser,
          currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
            if ($stateParams.siteId) {
              return SiteResource.get({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }, {
                all_fields: true
              }).$promise;
            } else {
              return null;
            }
          }],
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Real Time Data',
          translationSlug: 'REALTIMEDATA',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.real-time-data', {
        url: '/real-time-data?{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{businessDays}&{returnState}',
        params: {
          zoneId: {
            value: null,
            squash: true
          },
          realTimeDataShown: true
        },
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/real-time-data/real-time-data.partial.html',
            controller: 'RealTimeDataCtrl',
          }
        },
        // currentLocation and locations.
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: function() {
            return null;
          },
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          sites: [
            '$stateParams',
            'SiteResource',
            function($stateParams, SiteResource) {
              return SiteResource.query({
                orgId: $stateParams.orgId
              }, null, {
                all_fields: true
              }).$promise;
            }
          ],
          currentZone: resolves.currentZone,
          currentEntrance: function () {
            return null;
          }
        },
        data: {
          title: 'Real Time Data',
          translationSlug: 'REALTIMEDATA',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      // MARKETING CMS ROUTES
      .state('marketing', {
        url: '/marketing',
        views: {
          'header': {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              resourceUtils: 'resourceUtils',
              currentUser: resolves.currentUser
            }
          },
          main: {
            templateUrl: 'app/marketing/marketing.partial.html',
            controller: 'MarketingController'
          }
        },
        resolve: {
          organizations: resolves.organizations,
        }
      })
      .state('marketing.organization', {
        url: '/{orgId:int}',
        templateUrl: 'app/marketing/marketing-organization.partial.html',
        controller: 'MarketingOrganizationController',
        constrollerAs: 'vm',
        resolve: {
          currentOrganization: [
            '$stateParams',
            'OrganizationResource',
            function($stateParams, OrganizationResource) {
              if ($stateParams.orgId !== 8699) {
                return false;
              } else {
                return OrganizationResource.get({
                  orgId: $stateParams.orgId
                }).$promise;
              }
            }
          ],
          sites: resolves.sitesResolve
        }
      })
      .state('marketing.organization.campaigns', {
        url: '/campaigns',
        views: {
          'marketingMain': {
            templateUrl: 'app/marketing/site-campaign-list/site-campaign-list.partial.html',
            controller: 'MarketingCampaignListController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          organizations: resolves.organizations,
        }
      })
      .state('marketing.organization.campaigns.create', {
        url: '/create',
        views: {
          'marketingMain': {
            templateUrl: 'app/marketing/campaign-edit/campaign-edit.partial.html',
            controller: 'MarketingCampaignEditController',
            controllerAs: 'vm'
          }
        }
      })
      .state('analytics.organization.custom-dashboard', {
        url: '/custom-dashboard/:position',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/custom-dashboard/custom-dashboard.partial.html',
            controller: 'CustomDashboardController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          currentOrganization: [
            '$stateParams',
            'OrganizationResource',
            function($stateParams, OrganizationResource) {
              return OrganizationResource.get({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          sites: [
            '$stateParams',
            'SiteResource',
            function($stateParams, SiteResource) {
              return SiteResource.query({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
            if ($stateParams.siteId) {
              return SiteResource.get({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }).$promise;
            } else {
              return null;
            }
          }]
        },
        data: {
          title: 'Custom Dashboard',
          translationSlug: 'CUSTOM-DASHBOARD',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.custom-dashboard', {
        url: '/custom-dashboard/:position',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/custom-dashboard/custom-dashboard.partial.html',
            controller: 'CustomDashboardController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          currentOrganization: [
            '$stateParams',
            'OrganizationResource',
            function($stateParams, OrganizationResource) {
              return OrganizationResource.get({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          sites: [
            '$stateParams',
            'SiteResource',
            function($stateParams, SiteResource) {
              return SiteResource.query({
                orgId: $stateParams.orgId
              }).$promise;
            }
          ],
          currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
            if ($stateParams.siteId) {
              return SiteResource.get({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }).$promise;
            } else {
              return null;
            }
          }]
        },
        data: {
          title: 'Custom Dashboard',
          translationSlug: 'CUSTOM-DASHBOARD',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.hourly', {
        url: '/hourly/?{:date}&{:day}&{dateRangeStart:dayStart}&{dateRangeEnd:dayEnd}&{compareRange1Start:dayStart}&{compareRange1End:dayEnd}&{compareRange2Start:dayStart}&{compareRange2End:dayEnd}&{activeShortcut}',
        views: {
          analyticsHeader: {
            templateUrl: 'app/analytics/analytics-header/analytics-header.partial.html',
            controller: 'AnalyticsHeaderCtrl'
          },
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/hourly/hourly.partial.html',
            controller: 'HourlyController',
            controllerAs: 'vm',
          }
        },

        resolve: {
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
            if ($stateParams.siteId) {
              return SiteResource.get({
                orgId: $stateParams.orgId,
                siteId: $stateParams.siteId
              }).$promise;
            } else {
              return null;
            }
          }],
          currentLocation: function() {
            return null;
          },
          locations: function() {
            return [];
          },
          sites: resolves.sitesResolve,
          currentZone: resolves.currentZone,
          currentEntrance: resolves.currentEntrance
        },

        data: {
          title: 'Hourly',
          translationSlug: 'HOURLY',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })


      /* ADMIN APP */

      .state('admin', {
        url: '/admin',
        redirectTo: 'admin.organizations',
        views: {
          'header': {
            templateUrl: 'app/header/header.html',
            controller: 'HeaderCtrl',
            resolve: {
              authService: 'authService',
              currentUser: resolves.currentUser
            }
          },
          'main': {
            templateUrl: 'app/admin/admin.partial.html',
            controller: 'AdminController'
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          organizations: resolves.organizations,
          superUserCheck: function(authService, $state) {
            authService.getCurrentUser().then(function(currentUser) {
              //Check to see if we are either Org Admin or Superuser.
              if (!authService.hasAdminAccess(currentUser)) {
                $state.go('analytics');
              }
            });
          }
        }
      })
      .state('admin.organizations', {
        url: '/organizations',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain': {
            templateUrl: 'app/admin/organization-management/admin-organization-management.partial.html',
            controller: 'AdminOrgsListController',
            controllerAs: 'vm'
          }
        },
        resolve: {
            currentUser: function (authService) {
              return authService.getCurrentUser().then(function (currentUser) {
                return currentUser;
              });
            }
          },
          data: {
            title: 'Organizations'
          }

      })
      .state('admin.organizations.add', {
        url: '/add',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/organization-add/admin-organization-add.partial.html',
            controller: 'AdminOrgAddController',
            controllerAs: 'vm'
          }
        }
      })
      .state('admin.organizations.edit', {
        url: '/{orgId:int}',
        views: {
          'adminTabs@admin.organizations.edit': {
            templateUrl: 'app/admin/admin-tabs/admin-tabs.partial.html',
            controller: 'AdminTabsController',
            controllerAs: 'vm'
          },
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/organization-edit/admin-organization-edit.partial.html',
            controller: 'AdminOrgEditController',
            controllerAs: 'edit'
          },
          'adminSites@admin.organizations.edit': {
            templateUrl: 'app/admin/sites/admin-sites.partial.html',
            controller: 'AdminSitesController',
            controllerAs: 'vm'
          },
          'adminUsers@admin.organizations.edit': {
            templateUrl: 'app/admin/users/admin-users.partial.html',
            controller: 'AdminUsersController',
            controllerAs: 'vm'
          },
          'adminKpi@admin.organizations.edit': {
            templateUrl: 'app/admin/kpi-library/admin-kpi-library.partial.html',
            controller: 'AdminKpiLibraryController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentAdminOrganization: resolves.currentAdminOrganization,
          currentUser: resolves.currentUser
        }
      })
      .state('admin.organizations.edit.site', {
        url: '/site/{siteId:int}',
        views: {
          'adminTabs@admin.organizations.edit.site': {
            templateUrl: 'app/admin/admin-tabs/admin-site-tabs.partial.html',
            controller: 'AdminTabsController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/site/admin-site.partial.html',
            controller: 'AdminSiteEditController',
            controllerAs: 'vm'
          },
          'customTags@admin.organizations.edit.site': {
            templateUrl: 'app/admin/site/admin-site-custom-tags.partial.html',
            controller: 'AdminSiteEditController',
            controllerAs: 'vm'
          },
          'timeSettings@admin.organizations.edit.site': {
            templateUrl: 'app/admin/site/admin-site-time-settings.partial.html',
            controller: 'AdminSiteEditController',
            controllerAs: 'vm'
          },
          'siteOsm@admin.organizations.edit.site': {
            templateUrl: 'app/admin/site/admin-site-osm.partial.html',
            controller: 'AdminSiteEditController',
            controllerAs: 'vm'
          },
          'siteLocations@admin.organizations.edit.site': {
            templateUrl: 'app/admin/locations/admin-locations-tab.partial.html',
            controller: 'LocationsTabController',
            controllerAs: 'vm'
          },
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          currentSite: resolves.currentSite
        }
      })
      .state('admin.organizations.edit.users', {
        url: '/users',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            template: '<div></div>',
            controller: ['$state', '$scope', function($state, $scope) {
              redirect();

              $scope.$on('$stateChangeSuccess', function() {
                redirect();
              });

              function redirect() {
                if ($state.current.name === 'admin.organizations.edit.users') {
                  $state.go('^');
                }
              }
            }]
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
        }
      })
      .state('admin.organizations.edit.users.add', {
        url: '/add',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/user-edit/admin-user-edit.partial.html',
            controller: 'AdminUserEditController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          userData: function() {
            return {};
          },
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
        }
      })
      .state('admin.organizations.edit.users.edit', {
        url: '/{username:string}?{status:saved}',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/user-edit/admin-user-edit.partial.html',
            controller: 'AdminUserEditController',
            controllerAs: 'vm'
          }
        },
        params: {
          user: {}
        },
        resolve: {
          userData: resolves.userData,
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve,
        }
      })

      .state('admin.organizations.edit.kpis', {
        url: '/kpis',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            template: '<div></div>',
            controller: ['$state', '$scope', function($state, $scope) {
              redirect();

              $scope.$on('$stateChangeSuccess', function() {
                redirect();
              });

              function redirect() {
                if ($state.current.name === 'admin.organizations.edit.kpis') {
                  $state.go('^');
                }
              }
            }]
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
        }
      })
      .state('admin.organizations.edit.kpis.edit', {
        url: '/{kpi:string}',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/shoppertrak-kpi-edit/admin-kpi-edit.partial.html',
            controller: 'AdminKPIEditController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentOrganization: resolves.currentAdminOrganization
        }
      })
      .state('admin.usermanagement', {
        url: '/usermanagement',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/user-management/admin-user-management.partial.html',
            controller: 'AdminUserManagementController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentUser: resolves.currentUser
        }
      })
      .state('admin.usermanagement.add', {
        url: '/add',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/user-edit/admin-user-edit.partial.html',
            controller: 'AdminUserEditController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          userData: function() {
            return { };
          },
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve
        }
      })
      .state('admin.usermanagement.edit', {
        url: '/{username:string}',
        views: {
          'adminMenu': {
            templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
            controller: 'AdminMenuController',
            controllerAs: 'vm'
          },
          'adminMain@admin': {
            templateUrl: 'app/admin/user-edit/admin-user-edit.partial.html',
            controller: 'AdminUserEditController',
            controllerAs: 'vm'
          }
        },
        params: {
          user: {}
        },
        resolve: {
          userData: resolves.userData,
          currentUser: resolves.currentUser,
          currentOrganization: resolves.currentOrganizationResolve
        }
      })
    .state('admin.misubscriptionmanagement', {
      url: '/misubscriptionmanagement/{orgId:int}/{startDate:date}/{endDate:date}',
      views: {
        'adminMenu': {
          templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
          controller: 'AdminMenuController',
          controllerAs: 'vm'
        },
        'adminMain@admin': {
          templateUrl: 'app/admin/mi-subscription-management/admin-mi-subscription-management.partial.html',
          controller: 'AdminMiSubscriptionController',
          controllerAs: 'vm'
        }
      }
    })
    .state('admin.misubscriptionpage', {
      url: '/misubscriptionpage',
      views: {
        'adminMenu': {
          templateUrl: 'app/admin/admin-menu/admin-menu.partial.html',
          controller: 'AdminMenuController',
          controllerAs: 'vm'
        },
        'adminMain@admin': {
          templateUrl: 'app/admin/mi-subscription-management/mi-subscription-page/admin-mi-subscription-page.partial.html',
          controller: 'AdminMiPageController',
          controllerAs: 'vm'
        }
      }
    })
      .state('analytics.organization.widget-library', {
        url: '/widget-library',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/widget-library/widget-library.partial.html',
            controller: 'WidgetLibraryController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite,
          currentUser: resolves.currentUser
        },
        data: {
          title: 'Widget Library',
          translationSlug: '',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.site.widget-library', {
        url: '/widget-library',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/widget-library/widget-library.partial.html',
            controller: 'WidgetLibraryController',
            controllerAs: 'vm',
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite,
          currentUser: resolves.currentUser
        },
        data: {
          title: 'Widget Library',
          translationSlug: '',
          usesComparisonDateRange: false,
          isExportableAsPdf: true
        }
      })
      .state('analytics.organization.reports', {
        url: '/reports',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/reports/report-tabs.html',
            controller: 'reportTabsController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          organizations: resolves.organizations,
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite,
          currentUser: resolves.currentUser
        },
        data: {
          title: 'Reports',
          translationSlug: '',
          usesComparisonDateRange: false,
          isExportableAsPdf: false
        }
      })
      .state('analytics.organization.site.reports', {
        url: '/reports',
        views: {
          analyticsMenu: {
            templateUrl: 'app/analytics/analytics-menu/analytics-menu.partial.html',
            controller: 'AnalyticsMenuController',
            controllerAs: 'vm'
          },
          analyticsMain: {
            templateUrl: 'app/analytics/reports/report-tabs.html',
            controller: 'reportTabsController',
            controllerAs: 'vm'
          }
        },
        resolve: {
          currentOrganization: resolves.currentOrganizationResolve,
          sites: resolves.sitesResolve,
          currentSite: resolves.currentSite
        },
        data: {
          title: 'Reports',
          translationSlug: '',
          usesComparisonDateRange: false,
          isExportableAsPdf: false
        }
      });

    function registerCustomUrlParameterTypes() {
      $urlMatcherFactoryProvider.type('dayStart', {
        name: 'dayStart',
        decode: function(value) {
          return moment(value);
        },
        encode: function(value) {
          return value.format('YYYY-MM-DD');
        },
        equals: function(a, b) {
          a.isSame(b);
        },
        is: function(value) {
          return moment.isMoment(value);
        },
        pattern: /[0-9]{4}-[0-9]{2}-[0-9]{2}/
      });

      $urlMatcherFactoryProvider.type('dayEnd', {
        name: 'dayEnd',
        decode: function(value) {
          return moment(value).endOf('day');
        },
        encode: function(value) {
          return value.format('YYYY-MM-DD');
        },
        equals: function(a, b) {
          return a.isSame(b);
        },
        is: function(value) {
          return moment.isMoment(value);
        },
        pattern: /[0-9]{4}-[0-9]{2}-[0-9]{2}/
      });
    }

    function getRoutingResolves() {
      return {
        MarketIntelligenceGeographyResolve: [
          '$stateParams',
          'MarketIntelligenceGeographyResource',
          function($stateParams, MarketIntelligenceGeographyResource) {
           return MarketIntelligenceGeographyResource.query().$promise;
          }
        ],
        MarketIntelligenceCategoryResolve: [
          '$stateParams',
          'MarketIntelligenceCategoryResource',
          function($stateParams, MarketIntelligenceCategoryResource) {
            return MarketIntelligenceCategoryResource.query().$promise;
          }
        ],
        MarketIntelligenceSubscriptionResolve: [
          '$stateParams',
          'MarketIntelligenceSubscriptionResource',
          function ($stateParams, MarketIntelligenceSubscriptionResource) {
            return MarketIntelligenceSubscriptionResource.query({
              orgId: $stateParams.orgId
            }).$promise;
          }
        ],
        currentOrganizationResolve: [
          '$stateParams',
          'OrganizationResource',
          function($stateParams, OrganizationResource) {
            return OrganizationResource.get({
              orgId: $stateParams.orgId
            }).$promise;
          }
        ],
        sitesResolve: [
          '$stateParams',
          'SiteResource',
          function($stateParams, SiteResource) {
            return SiteResource.query({
              orgId: $stateParams.orgId
            }).$promise;
          }
        ],

        currentSite: ['$stateParams', 'SiteResource', function($stateParams, SiteResource) {
          if ($stateParams.siteId) {
            return SiteResource.get({
              orgId: $stateParams.orgId,
              siteId: $stateParams.siteId
            }).$promise;
          } else {
            return null;
          }
        }],

        organizations: [
          'OrganizationResource',
          function(OrganizationResource) {
            return OrganizationResource.query().$promise;
          }
        ],

        currentUser: [
          'authService',
          function(authService) {
            return authService.getCurrentUser();
          }
        ],

        currentAdminOrganization: [
          '$stateParams',
          'adminOrganizationsData',
          function($stateParams, adminOrganizationsData) {
            return adminOrganizationsData.getOrganization($stateParams.orgId);
          }
        ],

        currentZone: ['$stateParams', 'ZoneResource', function($stateParams, ZoneResource) {
          if ($stateParams.zoneId) {
            return new ZoneResource().get({
              orgId: $stateParams.orgId,
              siteId: $stateParams.siteId,
              zoneId: $stateParams.zoneId
            }).$promise;
          } else {
            return null;
          }
        }],

        currentEntrance: ['$stateParams', 'EntranceResource', function($stateParams, EntranceResource) {
          if ($stateParams.entranceId) {
            return new EntranceResource().get({
              orgId: $stateParams.orgId,
              siteId: $stateParams.siteId,
              zoneId: $stateParams.zoneId,
              entranceId: $stateParams.entranceId
            }).$promise;
          } else {
            return null;
          }
        }],

        currentLocation: ['$stateParams', 'LocationResource', function($stateParams, LocationResource) {
          if ($stateParams.locationId) {
            return LocationResource.get({
              orgId: $stateParams.orgId,
              siteId: $stateParams.siteId,
              locationId: $stateParams.locationId
            }).$promise;
          } else {
            return null;
          }
        }],
        userData: ['$stateParams', '$q', 'ObjectUtils', 'adminUsersData', function($stateParams, $q, ObjectUtils, adminUsersData) {
          if (ObjectUtils.isNullOrUndefined($stateParams.user._id)) {
            var deferred = $q.defer();
            adminUsersData.getOrgUsers($stateParams.orgId, function(data) {
              deferred.resolve(adminUsersData.filterDataByUsername($stateParams.username, data));
            });
            return deferred.promise;
          } else {
            return $stateParams.user;
          }
        }]
      }
    }
  }
})();
