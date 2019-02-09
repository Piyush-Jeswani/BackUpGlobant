'use strict';

describe('RetailOrganizationSummaryController', function() {
  var $scope;
  var $controller;
  var $q;
  var $timeout;

  var fakes;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function($rootScope, _$controller_, _$q_, _$timeout_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;

    fakes = {
      stateParams: getFakeStateParams(),
      state : getFakeState(),
      currentOrganization: getCurrentOrgFake(),
      localizationService: getLocalizationServiceFake(),
      subscriptionsService: getSubscriptionsServiceFake(),
      currentUser: getCurrentUserFake(),
      sites: getSitesFake(),
      mallCheckService: getMallCheckServiceFake(),
      operatingHoursService: getOperatingHoursFake(),
      dateRangeService: getDateRangeService()
    }
  }));

  describe('activate', function() {
    it('should set the $scope.tableData to an empty object', function() {
      createController();
      expect($scope.tableData).toBeDefined();
      var keys = _.keys($scope.tableData);
      expect(keys.length).toBe(0);
    });

    describe('operating hours', function() {
      it('should call operatingHoursService.getOperatingHoursSetting with the stateParams and the currentOrg', function() {
        var operatingHoursFake = getOperatingHoursFake();

        var spy = spyOn(operatingHoursFake, 'getOperatingHoursSetting');

        var overrideOptions = {
          'operatingHoursService': operatingHoursFake
        };

        createController(overrideOptions);

        var statePassed = spy.calls.mostRecent().args[0];
        var orgPassed = spy.calls.mostRecent().args[1];

        expect(statePassed.operatingHours).toBe('true');
        expect(orgPassed.organization_id).toBe(1234);
      });

      it('should set the $scope.operatingHours to true if the operatingHours service returns true', function() {
        createController();
        expect($scope.operatingHours).toBe(true);
      });

      it('should set the $scope.operatingHours to false if the operatingHours service returns false', function() {
        var operatingHoursFake = {
          getOperatingHoursSetting: function() {
            return false;
          }
        };

        var overrideOptions = {
          'operatingHoursService': operatingHoursFake
        };

        createController(overrideOptions);
        expect($scope.operatingHours).toBe(false);
      });
    });

    describe('showFilter', function() {
      it('should show the filter if the current org is not a mall and it has tags', function() {
        createController();
        expect($scope.showFilter).toBe(true);
      });

      it('should not show the filter if the current org is a mall', function() {
        var mallCheckService = {
          isNotMall: function() {
            return false;
          },
          hasTags: function() {
            return true;
          }
        };

        var overrideOptions = {
          'MallCheckService': mallCheckService
        };

        createController(overrideOptions);

        expect($scope.showFilter).toBe(false);
      });

      it('should not show the filter if the current org has no tags', function() {
        var mallCheckService = {
          isNotMall: function() {
            return true;
          },
          hasTags: function() {
            return false;
          }
        };

        var overrideOptions = {
          'MallCheckService': mallCheckService
        };

        createController(overrideOptions);

        expect($scope.showFilter).toBe(false);
      });
    });

    describe('LocalizationService', function() {
      it('should call LocalizationService.setUser', function() {
        var localizationService = getLocalizationServiceFake();

        var spy = spyOn(localizationService, 'setUser');

        var overrideOptions = {
          'LocalizationService': localizationService
        };

        createController(overrideOptions);

        var userPassed = spy.calls.mostRecent().args[0];

        expect(userPassed.username).toBe('test-user1');
      });

      it('should call LocalizationService.setOrganization', function() {
        var localizationService = getLocalizationServiceFake();

        var spy = spyOn(localizationService, 'setOrganization');

        var overrideOptions = {
          'LocalizationService': localizationService
        };

        createController(overrideOptions);

        var orgPassed = spy.calls.mostRecent().args[0];

        expect(orgPassed.organization_id).toBe(1234);
      });

      it('should set the current date format', function() {
        createController();
        expect($scope.dateFormat).toBe('MM/DD/YYYY');
      });

      it('should set the compareRange types', function() {
        createController();
        $timeout.flush();
        expect($scope.compareRange1Type).toBe('someCompareType');
        expect($scope.compareRange2Type).toBe('someCompareType');
      });
    })
  });

  function createController(overrideOptions) {
    var options = getOptions();

    var props = _.keys(overrideOptions);

    _.each(props, function(prop) {
      options[prop] = overrideOptions[prop]
    });

    return $controller('RetailOrganizationSummaryController', options);
  }

  function getOptions() {
    return {
      '$scope': $scope,
      '$stateParams': fakes.stateParams,
      '$state' : fakes.state,
      'currentOrganization': fakes.currentOrganization,
      'LocalizationService': fakes.localizationService,
      'SubscriptionsService': fakes.subscriptionsService,
      'currentUser': fakes.currentUser,
      'sites': fakes.sites,
      'MallCheckService': fakes.mallCheckService,
      'operatingHoursService': fakes.operatingHoursService,
      'dateRangeService' : fakes.dateRangeService
    };
  }

  function getFakeStateParams() {
    // stateParams values are always strings
    return {
      operatingHours: 'true'
    };
  }

  function getFakeState() {
    return {
      params : {
        dateRangeEnd : {
          diff: function(){
            return 1440;
          }
        }
      }
    };
  }

  function getCurrentOrgFake() {
    return {
      organization_id: 1234
    };
  }

  function getLocalizationServiceFake() {
    return {
      setUser: function(user) {
        angular.noop(user);
      },
      setOrganization: function(org) {
        angular.noop(org);
      },
      getCurrentDateFormat: function(org) {
        angular.noop(org);
        return 'MM/DD/YYYY';
      },
      getAllCalendars: function() {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      },
      getCurrentNumberFormatName: function(user, org) {
        angular.noop(user, org)
        return 'en-us';
      }
    };
  }

  function getSubscriptionsServiceFake() {
    return { 
      siteHasSales: function(org, site) {
        angular.noop(org, site);
        return true;
      },
      siteHasLabor: function(org, site) {
        angular.noop(org, site);
        return true;
      },
      siteHasInterior: function(org, site) {
        angular.noop(org, site);
        return true;
      },
      orgHasSalesCategories: function(org) {
        angular.noop(org);
        return true;
      }
    };
  }

  function getCurrentUserFake() {
    return {
      username: 'test-user1'
    };
  }

  function getSitesFake() {
    return [];
  }

  function getMallCheckServiceFake() {
    return {
      isNotMall: function(org) {
        angular.noop(org);
        return true;
      },
      hasTags: function(org) {
        angular.noop(org);
        return true;
      }
    }
  }

  function getOperatingHoursFake() {
    return {
      getOperatingHoursSetting: function(stateParams, currentOrganization) {
        angular.noop(stateParams, currentOrganization);
        return true;
      }
    }
  }

  function getDateRangeService() {
    return {
      getCompareType: function() {
        return 'someCompareType';
      },
      isSingleDaySelected: function() {
        return false
      }, 
      checkDateRangeIsValid: function(){
        return true;
      }
    };
  }
});
