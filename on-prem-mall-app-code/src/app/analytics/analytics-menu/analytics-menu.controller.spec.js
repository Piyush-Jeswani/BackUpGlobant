'use strict';

describe('AnalyticsMenuController', function() {
  var $controller;
  var sitesMock = [{name: 'a site'}];
  var features;
  var $rootScope;
  var $timeout;
  var localStorageServiceMock;

  var siteUserDoesNotHaveFullAccessTo = {
    'fullAccess': false
  };

  var siteUserHasFullAccessTo = {
    'fullAccess': true
  };

  var currentUserMock = {
    'username': 'foobar',
    'preferences': {
      'custom_dashboards': []
    }
  };

  beforeEach(module('shopperTrak'));

  beforeEach(module(function($provide) {
    localStorageServiceMock = {
      storage: {},
      set: function(key, value) {
        localStorageServiceMock.storage[key] = value;
      },
      get: function(key) {
        return localStorageServiceMock.storage[key];
      },
      remove: function(key) {
        delete localStorageServiceMock.storage[key];
      },
      keys: function() {
        return Object.keys(localStorageServiceMock.storage);
      },
    };
    $provide.factory('localStorageService', function() {
      return localStorageServiceMock;
    });
  }));
  beforeEach(inject(function(_$rootScope_, _$timeout_, _$controller_, _features_, _LocalizationService_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $controller = _$controller_;
    features = _features_;
    _LocalizationService_.setUser({ preferences: { calendar_id: 1}});
  }));

  describe('when user has full access to site', function() {
    it('should show the correct set of menu items for organizations with interior subscription', function() {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      //fix from SA-920 only perimeter should enable traffic
      var states = [
        'analytics.organization.site.traffic',
        'analytics.organization.site.visitor-behavior',
        'analytics.organization.site.usageOfAreas',
        'analytics.organization.site.compare'
      ];

      expect(menuItemStates).toEqual(states);
    });

    it('should show the correct set of menu items for organizations with market intelligence subscription', function() {
      var organizationWithMarketIntelligenceSubscription = {
        'subscriptions': { 'perimeter': true, 'market_intelligence': true }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithMarketIntelligenceSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      var states = [
        'analytics.organization.site.traffic',
        'analytics.organization.site.compare'
      ];

      expect(menuItemStates).toEqual(states);
    });

    it('should show only traffic menu item for organizations do not have interior subscription and a market intelligence subscription', function() {
      var organizationWithoutInteriorSubscription = {
        'subscriptions': { 'interior': false, 'perimeter': true }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithoutInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      var states = [
        'analytics.organization.site.traffic',
        'analytics.organization.site.compare'
      ];

      expect(menuItemStates).toEqual(states);
    });
  });

  describe('activate', function() {
    it('should toggle toggleExpanded when sidebar is 1 in local storage', function() {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true }
      };

      spyOn(localStorageServiceMock, 'get').and.callFake(function() {
        return 1;
      });
      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });
      $timeout.flush();

      expect(controller.isExpanded).toEqual(true);
    });
  });

  describe('when user does not have full access to site', function() {
    it('should show all menu items except Usage of areas if site has interior subscription and market intelligence subscription', function() {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'perimeter': true, 'interior': true, 'market_intelligence': true }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      var states = [
        'analytics.organization.site.traffic',
        'analytics.organization.site.visitor-behavior',
        'analytics.organization.site.compare'
      ];

      expect(menuItemStates).toEqual(states);
    });

    it('should show no menu items if site does not have interior subscription', function() {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': false }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      var states = ['analytics.organization.site.compare'];

      expect(menuItemStates).toEqual(states);
    });
  });

  describe('Menu hyperlinks', function() {
    var mockState = {
      href: function(state, dateParams) {
        return 'http://app.url/' + state;
      }
    };

    var organizationWithInteriorSubscription = {
        'subscriptions': { 'perimeter': true, 'interior': true }
    };

    it('should be set for each menuItem', function() {

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.site.traffic',
        'http://app.url/analytics.organization.site.visitor-behavior',
        'http://app.url/analytics.organization.site.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
    });

    it('should be set with any date parameters', function() {

      var mockStateParams = {
        dateRangeStart: '01-01-2016',
        dateRangeEnd: '30-01-2016'
      };

      spyOn(mockState, 'href');

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        '$stateParams': mockStateParams,
        'sites': sitesMock
      });

      var firstCallArgs = mockState.href.calls.first().args;

      expect(firstCallArgs[1].dateRangeStart).toBe('01-01-2016');
      expect(firstCallArgs[1].dateRangeEnd).toBe('30-01-2016');
    });
  });

  describe('customDashboardRemoved', function() {
    var mockState = {
      href: function(state, dateParams) {
        return 'http://app.url/' + state;
      },
      go: function(state, params) {
        angular.noop(state, params);
      },
      reload: function() {
        angular.noop();
      },
      params: {
        position:1
      }
    };

    var organizationWithInteriorSubscription = {
        subscriptions: { 'perimeter': true, 'interior': true },
        portal_settings: {
          organization_type: 'retail'

        }
    };

    it('should call state go to the next custom dashboard page when customDashboardRemoved in site level', function() {

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.site.traffic',
        'http://app.url/analytics.organization.site.visitor-behavior',
        'http://app.url/analytics.organization.site.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      var isDashboardBeforeOrAfter = {
        customDashboard:{
          position:1
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved', isDashboardBeforeOrAfter);
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('analytics.organization.site.custom-dashboard', { position: 1 });
    });

    it('should call state go to the next custom dashboard page when customDashboardRemoved org level', function() {

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': null,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.summary',
        'http://app.url/analytics.organization.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      var isDashboardBeforeOrAfter = {
        customDashboard:{
          position:1
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved', isDashboardBeforeOrAfter);
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('analytics.organization.custom-dashboard', { position: 1 });
    });

    it('should call state reload if current position is same as event position and dashboardAfter', function() {

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.site.traffic',
        'http://app.url/analytics.organization.site.visitor-behavior',
        'http://app.url/analytics.organization.site.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      var isDashboardBeforeOrAfter = {
        customDashboard:{
          position:1
        },
        dashboardAfter: true
      }

      spyOn(mockState, 'reload');

      $rootScope.$broadcast('customDashboardRemoved', isDashboardBeforeOrAfter);
      $timeout.flush();
      expect(mockState.reload).toHaveBeenCalled();
    });

    it('should call state go to the site if there is no isDashboardBeforeOrAfter in site level', function() {
      var mockStateParams = {
        orgId: 1,
        siteId: 1
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock,
        '$stateParams': mockStateParams
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.site.traffic',
        'http://app.url/analytics.organization.site.visitor-behavior',
        'http://app.url/analytics.organization.site.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);

      mockState.$current = {
        includes: {
          'analytics': true,
          'analytics.organization.site': true
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved');
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('analytics.organization.site', {orgId: mockStateParams.orgId, siteId: mockStateParams.siteId});
    });

    it('should call state go to the site if there is no isDashboardBeforeOrAfter org level', function() {
      var mockStateParams = {
        orgId: 1
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': null,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock,
        '$stateParams': mockStateParams
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.summary',
        'http://app.url/analytics.organization.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      mockState.$current = {
        includes: {
          'analytics': true,
          'analytics.organization': true
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved');
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('analytics.organization', {orgId: mockStateParams.orgId});
    });

    it('should call state go to the site if there is no isDashboardBeforeOrAfter should go to analytics if state param does not have either org or site', function() {
      var mockStateParams = {
        orgId: 1
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': null,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock,
        '$stateParams': mockStateParams
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.summary',
        'http://app.url/analytics.organization.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      mockState.$current = {
        includes: {
          'analytics': true
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved');
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('analytics');
    });

    it('should call state go  to home if no inclused or position set', function() {
      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': null,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.summary',
        'http://app.url/analytics.organization.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      mockState.$current = {
        includes: {
        }
      }

      spyOn(mockState, 'go');

      $rootScope.$broadcast('customDashboardRemoved');
      $timeout.flush();
      expect(mockState.go).toHaveBeenCalledWith('home');
    });

  });

  describe('customDashboardAdded', function() {
    var mockState = {
      href: function(state, dateParams) {
        return 'http://app.url/' + state;
      },
      go: function(state, params) {
        angular.noop(state, params);
      },
      reload: function() {
        angular.noop();
      },
      params: {
        position:1
      }
    };

    var organizationWithInteriorSubscription = {
        subscriptions: { 'perimeter': true, 'interior': true },
        portal_settings: {
          organization_type: 'retail'

        }
    };

    it('should add new added dashboard into the menu items', function() {

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        '$state': mockState,
        'sites': sitesMock
      });

      var menuItemHrefs = _(controller.menuItems).pluck('href');

      var urls = [
        'http://app.url/analytics.organization.site.traffic',
        'http://app.url/analytics.organization.site.visitor-behavior',
        'http://app.url/analytics.organization.site.compare'
      ];

      expect(menuItemHrefs).toEqual(urls);
      var isDashboardBeforeOrAfter = {
        customDashboard:{
          position:1
        }
      }

      var customDashboards = [
        {
          name:'test 1',
          position:1
        }
      ];

      var expectedMenuItem = {name: 'test 1', id: 'custom-dashboard', state: 'analytics.organization.site.custom-dashboard', icon: 'dashboard', isMainView: false, href: 'http://app.url/analytics.organization.site.custom-dashboard', position: 1};

      $rootScope.$broadcast('customDashboardAdded', {customDashboards:customDashboards});
      $timeout.flush();
      expect(controller.menuItems[controller.menuItems.length -1]).toEqual(expectedMenuItem);
    });
  });

  it('should show all menu items except Usage of areas if site has interior subscription and market intelligence subscription', function() {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'perimeter': true, 'interior': true, 'market_intelligence': true }
      };

      var controller = $controller('AnalyticsMenuController', {
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserDoesNotHaveFullAccessTo,
        'currentUser': currentUserMock,
        'sites': sitesMock
      });

      var menuItemStates = _(controller.menuItems).pluck('state');

      var states = [
        'analytics.organization.site.traffic',
        'analytics.organization.site.visitor-behavior',
        'analytics.organization.site.compare'
      ];

      expect(menuItemStates).toEqual(states);
    });

});
