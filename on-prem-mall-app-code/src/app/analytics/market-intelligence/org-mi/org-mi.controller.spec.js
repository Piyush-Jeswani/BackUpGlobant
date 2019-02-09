'use strict';

describe('OrgMiController',function () {
  var $scope;
  var $controller;
  var rootScope;
  var $timeout;
  var stateMock = {
    current:{
      name: ''
    },
    go: function(stateName) {
      angular.noop(stateName);
    },
    params : {

    }
  };
  var stateParamsMock = {
    dateRangeStart: moment('08-01-2017', 'DD-MM-YYYY'),
    dateRangeEnd: moment('14-01-2017', 'DD-MM-YYYY'),
    compareRange1Start: moment('01-01-2017', 'DD-MM-YYYY'),
    compareRange1End: moment('07-01-2017', 'DD-MM-YYYY')
  };

  var sitesMock = [{name: 'a site'}];

  var subscriptionServiceMock = {
    userHasMarketIntelligence: function() {
      return true;
    }
  }

   var subscriptionServiceMock2 = {
    userHasMarketIntelligence: function() {
      return false;
    },
    onlyMiSubscription: function () {
      return true;
    }
  }

  var currentOrganizationMock = {
    organization_id : 1000003068
  };
  var currentUserMock;
  var controller;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function($rootScope, _$controller_,_$timeout_) {
    rootScope = $rootScope;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    controller = null;
    $timeout = _$timeout_;
  }));

  beforeEach(function() {
    currentUserMock = {
      preferences: {
        market_intelligence: [
          {
            orgId: 1000003068,
            segments: [
              {
                subscription: {
                  someProp: "ok"
                }
              }
            ]
          }
        ]
      }
    };

  });

  describe('activate', function() {
    beforeEach(function() {
      stateMock.current = {
        name: 'analytics.organization.marketIntelligence.edit'
      };
    });

    it('should set editDisabled to true', function() {
      instantiateController();

      expect(controller.editDisabled).toBe(true);
    });

    it('should call SubscriptionsService.onlyMiSubscription()', function() {
      // Mocked SubscriptionsService function onlyMiSubscription()
      spyOn(subscriptionServiceMock2, 'onlyMiSubscription');

      instantiateController({'SubscriptionsService': subscriptionServiceMock2});

      // ngMock: Flush the queue of pending tasks - function calls occur immediately
      // make asyncronous tasks synchronous i.e. unit tests should always be synchronous
      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(subscriptionServiceMock2.onlyMiSubscription).toHaveBeenCalled();
    });

    it('should set defaultResetButtons to true if the current state is edit', function() {
      instantiateController();

      expect(controller.defaultResetButtons).toBe(true);
    });

    it('should set defaultResetButtons to false if the current state is not edit', function() {
      stateMock.current = {
        name: 'analytics.organization.marketIntelligence.somethingelse'
      };

      instantiateController();

      expect(controller.defaultResetButtons).toBe(false);
    });
  });

  describe('areUnequalNumberOfDaysSelected', function() {
    it('should set unequalNumberOfDaysSelected to false if the date ranges match up', function() {
      instantiateController();

      expect(controller.unequalNumberOfDaysSelected).toBe(false);
    });

    it('should set unequalNumberOfDaysSelected to true if the date ranges do not match up', function() {
      stateParamsMock = {
        dateRangeStart: moment('08-01-2017', 'DD-MM-YYYY'),
        dateRangeEnd: moment('25-01-2017', 'DD-MM-YYYY'),
        compareRange1Start: moment('01-01-2017', 'DD-MM-YYYY'),
        compareRange1End: moment('07-01-2017', 'DD-MM-YYYY')
      };

      instantiateController();

      expect(controller.unequalNumberOfDaysSelected).toBe(true);
    });
  });

  describe('initScope', function() {
    beforeEach(function() {
      stateMock.current = {
        name: 'analytics.organization.marketIntelligence.edit'
      };
    });

    it('should assign the current user to the scope as it is needed by the date range picker', function() {
      instantiateController();

      expect(controller.currentUser).toBe($scope.currentUser);
    });

    it('should assign the current org to the scope as it is needed by the date range picker', function() {
      instantiateController();

      expect(controller.currentOrganization).toBe($scope.currentOrganization);
    });
  });

  describe('setPageProperties', function() {
    describe('if the current state is edit', function() {
      beforeEach(function() {
        stateMock.current = {
          name: 'analytics.organization.marketIntelligence.edit'
        };

        instantiateController();

        rootScope.$broadcast('$stateChangeSuccess');
      });

      it('should set the header title to edit', function() {
        expect(controller.headerTitle).toBe('.NEWMARKETINTELLIGENCE');
      });

      it('should hide the date range picker', function() {
        expect(controller.showDateRangePicker).toBe(false);
      });
    });

    describe('if the current state is not edit', function() {
      beforeEach(function() {
        stateMock.current = {
          name: 'analytics.organization.marketIntelligence.somethingelse'
        };

        instantiateController();

        rootScope.$broadcast('$stateChangeSuccess');
      });

      it('should set the header to market intelligence', function() {
        expect(controller.headerTitle).toBe('.MARKETINTELLIGENCE');
      });

      it('should show the date range picker', function() {
        expect(controller.showDateRangePicker).toBe(true);
      });
    });
  });

  describe('getMiStatus', function() {
    it('should set miExists to false if the user has no market intelligence preferences', function() {
      currentUserMock = {
        preferences: { }
      };

      instantiateController();

      expect(controller.miExists).toBe(false);
    });

    it('should set miExists to false if the user has no market intelligence segments', function() {
      currentUserMock = {
        preferences: {
          market_intelligence: []
        }
      };

      instantiateController();

      expect(controller.miExists).toBe(false);
    });

    it('should set miExists to true if the user has market intelligence preferences', function() {

      currentUserMock = {
        preferences: {
          market_intelligence: [
            {
              orgId: 1000003068,
              segments: [
              {
                subscription: {
                  someProp: "ok"
                }
              }
            ]
            }
          ]
        }
      };

      instantiateController();

      expect(controller.miExists).toBe(true);
    });

  });

  describe('showEditMode', function() {
    it('should set the state to edit', function() {
      spyOn(stateMock, 'go');

      instantiateController();

      controller.showEditMode();

      expect(stateMock.go).toHaveBeenCalledWith('analytics.organization.marketIntelligence.edit');
    });
  });

  describe('showNoMi', function() {
    it('should set the state to dashboard', function() {
      spyOn(stateMock, 'go');

      instantiateController();

      controller.showNoMi();

      expect(stateMock.go).toHaveBeenCalledWith('analytics.organization.marketIntelligence.dashboard');
    });
  });

  describe('configureWatches', function() {
    it('should not call setPageProperties after the scope has been destroyed', function() {
      instantiateController();

      rootScope.$broadcast('$stateChangeSuccess');

      expect(controller.headerTitle.length).toBeGreaterThan(0);

      controller.headerTitle = 'Unchanged';

      var paramsObj = { dateEnd: moment('05/10/2017', 'MM/DD/YYYY')};
      rootScope.$broadcast('noDataForYesterday', paramsObj);
      expect(controller.showDataAvailableUntilMessage).toBe(true);

      rootScope.$broadcast('$destroy');

      rootScope.$broadcast('$stateChangeSuccess');

      expect(controller.headerTitle).toBe('Unchanged');
    });
  });

  function instantiateController(args) {
    controller = $controller('OrgMiController', angular.extend({
      '$scope': $scope,
      '$state': stateMock,
      '$stateParams': stateParamsMock,
      'currentOrganization' : currentOrganizationMock,
      'currentUser' : currentUserMock,
      'SubscriptionsService': subscriptionServiceMock,
      'sites': sitesMock
    }, args));

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});
