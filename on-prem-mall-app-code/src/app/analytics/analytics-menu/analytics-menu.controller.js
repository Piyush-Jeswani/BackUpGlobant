(function () {
  'use strict';
  angular.module('shopperTrak').controller('AnalyticsMenuController', AnalyticsMenuController);

  AnalyticsMenuController.$inject = [
    '$state',
    '$stateParams',
    'currentOrganization',
    'currentSite',
    'currentUser',
    'SubscriptionsService',
    'ObjectUtils',
    '$rootScope',
    'localStorageService',
    'authService',
    'sites'
  ];

  function AnalyticsMenuController(
    $state,
    $stateParams,
    currentOrganization,
    currentSite,
    currentUser,
    SubscriptionsService,
    ObjectUtils,
    $rootScope,
    localStorageService,
    authService,
    sites
  ) {
    var vm = this;

    // Constants
    var sidebarStateKey = 'has-open-sidebar';
    var sidebarTransitionClass = 'is-transitioning-analytics-menu';
    var htmlEl = document.documentElement;

    vm.menuItems = getMenuItems();

    // Methods
    vm.stateIsActive = stateIsActive;

    // States
    vm.isExpanded = vm.isExpanded || false;
    vm.toggleExpanded = toggleExpanded;

    activate();

    function activate() {
      if (localStorageService.get(sidebarStateKey) === 1) {
        toggleExpanded(true);
      }
    }

    $rootScope.$on('reloadSidebar', function () {
      return $state.reload()
    });

    function toggleExpanded(expandState) {
      // Update state:
      vm.isExpanded = _.isUndefined(expandState) ? !vm.isExpanded : expandState;
      htmlEl.classList.toggle('has-expanded-analytics-menu', expandState);
      htmlEl.classList.add(sidebarTransitionClass);
      localStorageService.set(sidebarStateKey, vm.isExpanded ? 1 : 0);
      // Post-transition behaviour:
      setTimeout(expandedTransitionDone, 241);
    }

    function expandedTransitionDone() {
      // Force re-render of charts:
      window.dispatchEvent(new CustomEvent('resize'));
      // Remove transition style tweaks:
      setTimeout(function(){
        htmlEl.classList.remove(sidebarTransitionClass);
      },100);
    }

    function getMenuItems() {
      var menuItems = [];

      if (!ObjectUtils.isNullOrUndefined(currentSite)) {

        if(SubscriptionsService.siteHasPerimeter(currentOrganization, currentSite) === true) {
          menuItems.push(getTrafficMenuItem());
        }

        if(SubscriptionsService.siteHasInterior(currentOrganization,currentSite) === true) {
          menuItems.push(getVisitorMenuItem());

          if (currentSite.fullAccess) {
            menuItems.push(getAreasMenuItem());
          }

        }

        if (SubscriptionsService.siteHasSales(currentOrganization, currentSite)) {
          menuItems.push(getSalesMenuItem());
        }

        if (SubscriptionsService.siteHasLabor(currentOrganization, currentSite)) {
          menuItems.push(getLaborMenuItem());
        }
      }
      else {
        menuItems.push(getSummaryMenuItem());
      }

      menuItems.push(getCompareMenuItem());

      if( SubscriptionsService.getSubscriptionFor(currentOrganization, 'what_if_analysis') ) {
        menuItems.push(getWhatIfMenuItem());
      }



      // Custom dashboard navigation
      authService.getCurrentUser().then(function (user) {
        var dashboards = user.preferences.custom_dashboards;

        _.each(dashboards, function (dashboard) {
          if(!SubscriptionsService.onlyMiSubscription(currentOrganization, sites)) {
            menuItems.push(getDashboardMenuItem(dashboard));
          }
        });
      });

      $rootScope.$on('customDashboardAdded', function (event, data) {
        var newDashboard = customDashboardToAdd(data.customDashboards);
        menuItems.push(getDashboardMenuItem(newDashboard));
      });

      $rootScope.$on('customDashboardRemoved', function (event, dashboardBeforeOrAfter) {
        var zoneId = localStorageService.get('selectedZoneId');

        if (dashboardBeforeOrAfter) {
          var currentPosition = parseInt($state.params.position, 10);
          var positionToGoTo = dashboardBeforeOrAfter.customDashboard.position;

          // Dashboard has been deleted and the position has been replaced by the dashboard below
          if (currentPosition === positionToGoTo && dashboardBeforeOrAfter.dashboardAfter) {
            return $state.reload();
          }

          if (isSiteLevel()) {
            return $state.go('analytics.organization.site.custom-dashboard', { position: positionToGoTo });
          }

          return $state.go('analytics.organization.custom-dashboard', { position: positionToGoTo });
        }
        //checking for zone availability
        if(!_.isUndefined($state.$current.includes.analytics)) {
          if ($state.$current.includes['analytics.organization.site']) {
            if(zoneId){
              return $state.go('analytics.organization.site.traffic', {zoneId: zoneId});
            }
            return  $state.go('analytics.organization.site', {orgId: $stateParams.orgId, siteId: $stateParams.siteId})
          }
          if ($state.$current.includes['analytics.organization']) {
            return  $state.go('analytics.organization', {orgId: $stateParams.orgId})
          }

          return $state.go('analytics');
        }

        $state.go('home');
      });

      if(SubscriptionsService.hasMarketIntelligence(currentOrganization) && SubscriptionsService.userHasMarketIntelligence(currentUser, currentOrganization.organization_id))  {
        menuItems.push(getMarketIntelligenceMenuItem());
      }


      var dateParams = getDateParams();
      _.each(menuItems, function (menuItem) {
        if (shouldIncludeDateRanges(menuItem.id)) {
          menuItem.href = getHref(menuItem.state, dateParams);
        } else {
          menuItem.href = getHref(menuItem.state, {});
        }
      });

      if (SubscriptionsService.onlyMiSubscription(currentOrganization, sites)) {
        menuItems = _.filter(menuItems, function (item) {
          return item.id === 'analytics-menu-item-market-intelligence'
        });
      }

      return menuItems;
    }

    function shouldIncludeDateRanges(menuItemId) {
      if (ObjectUtils.isNullOrUndefined(menuItemId)) {
        return true;
      }
      if (menuItemId === 'custom-dashboard') {
        return false;
      }
      if (menuItemId === 'analytics-menu-item-market-intelligence') {
        return false;
      }
      return true;
    }

    function getDateParams() {
      var selectedDateRanges = {
        current: {
          start: $stateParams.dateRangeStart,
          end: $stateParams.dateRangeEnd
        },
        compare1: {
          start: $stateParams.compareRange1Start,
          end: $stateParams.compareRange1End
        },
        compare2: {
          start: $stateParams.compareRange2Start,
          end: $stateParams.compareRange2End
        }
      };

      var dateParams = {
        dateRangeStart: selectedDateRanges.current.start,
        dateRangeEnd: selectedDateRanges.current.end
      };

      if (selectedDateRanges.compare1.start !== undefined &&
        selectedDateRanges.compare1.end !== undefined &&
        selectedDateRanges.compare2.start !== undefined &&
        selectedDateRanges.compare2.end !== undefined) {
        dateParams.compareRange1Start = selectedDateRanges.compare1.start;
        dateParams.compareRange1End = selectedDateRanges.compare1.end;
        dateParams.compareRange2Start = selectedDateRanges.compare2.start;
        dateParams.compareRange2End = selectedDateRanges.compare2.end;
      }

      return dateParams;
    }

    function getHref(stateName, dateParams) {
      return $state.href(stateName, dateParams);
    }

    function stateIsActive(stateName, menuId, dashboardPosition) {
      if (menuId !== 'custom-dashboard') {

        return $state.current.name.indexOf(stateName) !== -1;

      } else {

        return $state.current.name.indexOf(stateName) !== -1 && dashboardPosition === parseInt($stateParams.position, 10);
      }
    }

    function isSiteLevel() { // todo add this to custom compare function below and maybe move to ObjectUtils
      if (!ObjectUtils.isNullOrUndefined(currentSite)) {
        return true;
      } else {
        return false;
      }
    }

    function customDashboardToAdd(dashboards) {
      return dashboards[dashboards.length - 1];
    }

    function getDashboardMenuItem(dashboard) {
      var state = 'analytics.organization.custom-dashboard';

      if (isSiteLevel()) {
        state = 'analytics.organization.site.custom-dashboard';
      }

      return {
        'name': dashboard.name,
        'id': 'custom-dashboard',
        'state': state,
        'icon': 'dashboard',
        'isMainView': false,
        href: getHref(state, {position: dashboard.position}),
        position: dashboard.position
      };
    }


    function getTrafficMenuItem() {
      return {
        'name': 'views.TRAFFIC',
        'id': 'analytics-menu-item-traffic',
        'state': 'analytics.organization.site.traffic',
        'icon': 'entrance',
        'isMainView': false
      };
    }

    function getVisitorMenuItem() {
      return {
        'name': 'views.VISITORBEHAVIOR',
        'id': 'analytics-menu-item-visitor-behavior',
        'state': 'analytics.organization.site.visitor-behavior',
        'icon': 'consumer-fat',
        'isMainView': false
      };
    }

    function getAreasMenuItem() {
      return {
        'name': 'views.USAGEOFAREAS',
        'id': 'analytics-menu-item-usage-of-areas',
        'state': 'analytics.organization.site.usageOfAreas',
        'icon': 'map-and-pin-fat',
        'isMainView': false
      };
    }

    function getSalesMenuItem() {
      return {
        'name': 'views.SALES',
        'id': 'analytics-menu-item-sales-and-conversion',
        'state': 'analytics.organization.site.sales-and-conversion',
        'icon': 'sales',
        'isMainView': false
      };
    }

    function getStateForCompare() {
      if (!ObjectUtils.isNullOrUndefined(currentSite)) {
        return 'analytics.organization.site.compare';
      }

      return 'analytics.organization.compare';
    }

    function getWhatIfMenuItem() {
      return {
        'name': 'views.WHATIF',
        'id': 'analytics-menu-item-what-if',
        'state': !ObjectUtils.isNullOrUndefined(currentSite) ? 'analytics.organization.site.whatIf' : 'analytics.organization.whatIf',
        'icon': 'what-if',
        'isMainView': false
      };
    }

    function getCompareMenuItem() {
      return {
        'name': 'views.COMPARE',
        'state': getStateForCompare(),
        'icon': 'scale-fat',
        'isMainView': false
      };
    }

    function getMarketIntelligenceMenuItem() {
      return {
        'name': 'views.MARKETINTELLIGENCE',
        'id': 'analytics-menu-item-market-intelligence',
        'state': 'analytics.organization.marketIntelligence',
        'icon': 'market-insight',
        'isMainView': false
      };
    }

    function getLaborMenuItem() {
      return {
        'name': 'views.LABOR',
        'id': 'analytics-menu-item-labor',
        'state': 'analytics.organization.site.labor',
        'icon': 'labor-fat',
        'isMainView': false
      };
    }

    function getSummaryMenuItem() {
      if (currentOrganization.portal_settings.organization_type === 'Retail') {
        return {
          'name': 'views.RETAILORGANIZATIONSUMMARY',
          'state': 'analytics.organization.retail',
          'icon': 'chart-stand',
          'isMainView': false
        };
      } else {
        return {
          'name': 'views.ORGANIZATIONSUMMARY',
          'state': 'analytics.organization.summary',
          'icon': 'chart-stand',
          'isMainView': false
        };
      }
    }
  }
})();
