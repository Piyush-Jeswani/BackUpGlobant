'use strict';

describe('AccountCtrl', function() {

  var $state;
  var $scope;
  var authServiceMock;
  var $q;
  var $controller;
  var $rootScope;
  var $timeout;
  var organizations = [];

  var requestManagerMock = {
    clearCache: function () {
      angular.noop();
    }
  };

  var localStorageServiceMock = {
    remove: function (params) {
      angular.noop(params);
      return params;
    },
    set: function(currentCalendarId, calendarId)
    {
      angular.noop(currentCalendarId, calendarId);
    }
  };

  var widgetOrgCustomCompareMock = {
    name:'org-custom-compare',
    activeSelectedMetrics:{0:'traffic'},
    chart_name:'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type:"prior_period"
      }
    },
    siteId: 80030032,
    dateRangeShortCut:'year',
    dateRanges: {
      dateRange: {
        start: '01-01-2017',
        end:'01-08-2017'
      },
      compare1Range: {
        start: '01-01-2016',
        end:'01-08-2016'
      },
      compare2Range: {
        start: '01-01-2016',
        end:'01-08-2016'
      }
      
    },
    compareSites:{
      0:80030032,
      1:80029911
    },
    dateRange: {
      start: '01-01-2017',
      end:'01-08-2017'
    },
    compare_period_1:{
      custom_end_date:'',
      custom_start_date:'',
      period_type:"prior_period"
    },
    compare_period_2: {
      custom_end_date:'',
      custom_start_date:'',
      period_type:'prior_year'
    },
    firstDayOfWeekSetting: 0,
    metrics: ['Traffic']
  };

  var widgetMock = {
    name:'org-compare',
    activeSelectedMetrics:{0:'traffic'},
    chart_name:'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
    organizationId: 10,
    currentOrganization: {
      name: 'org'
    },
    compare: {
      chart_name: 'Traffic Comparison Mall of Arabia vs Mall of Dharan over the last year',
      selected_date_range: {
        period_type:"prior_period"
      }
    },
    siteId: 80030032,
    dateRangeShortCut:'year',
    compareSites:{
      0:80030032,
      1:80029911
    },
    dateRange: {
      start: '01-01-2017',
      end:'01-08-2017'
    },
    compare_period_1:{
      custom_end_date:'',
      custom_start_date:'',
      period_type:"prior_period"
    },
    compare_period_2: {
      custom_end_date:'',
      custom_start_date:'',
      period_type:'prior_year'
    },
    firstDayOfWeekSetting: 0
  };

  var newDashboard = {
    widgets: [widgetMock, widgetOrgCustomCompareMock],
    name: 'neDashboardTest1',
    position: 1
  };

  var currentUserMockWithDashboard = {
    _id: 1,
    preferences: {
      calendar_id: 3,
      custom_dashboards: [newDashboard],
      market_intelligence: {},
      custom_period_1: {
        period_type: 'custom'
      },
      custom_period_2: {
        period_type: 'custom'
      }
    },
    localization: {
      locale: 'en-us',
      date_format: {
        mask: 'dd-mm-yyyy'
      }
    }
  };

  var customDashboardServiceMock = {
    getDashboards: function (currentUser) {
      return currentUser.preferences.custom_dashboards;
    },
    deleteAllDashboards: function (currentUser) {
      angular.noop(currentUser);
    }
  };

  beforeEach(module('shopperTrak'));
  beforeEach(module(function($provide) {
    $provide.provider('organizations', function() {
      this.$get = function() {
        return organizations;
      };
    });
  }));
  beforeEach(inject(function(_$rootScope_, _$controller_, _$q_,_$timeout_,_$state_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_; 
    $scope = $rootScope.$new();
    $state = _$state_;
    $q = _$q_;
    authServiceMock = {
      _isAuthenticated: true,
      isAuthenticated: function() {
        return authServiceMock._isAuthenticated;
      },
      logout: function() {
        authServiceMock._isAuthenticated = false;
        $rootScope.$broadcast('auth-logout-success');
      },
      changePassword: function(password) {
        angular.noop(password);
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
      },
      getCurrentUser: function () {
        var defer = $q.defer();
        defer.resolve(currentUserMockWithDashboard);
        return defer.promise;
      }
    };
  }));

  describe('submitForm', function() {  
    it('should verify that submitForm(type) can be called with preferences and user locale set to null', function() { 
      createController();   
      $scope.password = 'password1234';
      $scope.passwordConfirmation = 'password1234';
      $scope.currentUserId = 1;
      $scope.data = {calendar: {calendar_id: 1}};
      $scope.requestIsPending = false;
      $scope.data.locale = null;
      $scope.settingsLoaded = true;
      $scope.submitForm('preferences');
    
      expect($scope.requestIsPending).toBe(false);
      expect($scope.data.locale).toBe(null);
      expect($scope.settingsLoaded).toBe(true);
     });
  });

  describe('submitForm', function() {   
    describe('password', function() {
      describe('valid password', function() {
        it('should change the password if the passwords match and are valid', function() {
          spyOn(authServiceMock, 'changePassword').and.callThrough();
          createController();
  
          $scope.credentials.password = 'testxxxxxxxxxxx';
          $scope.credentials.passwordConfirmation = 'testxxxxxxxxxxx';
          $scope.submitForm('password');
  
          expect(authServiceMock.changePassword).toHaveBeenCalledWith('testxxxxxxxxxxx');
        });
  
        it('should wipe out both password fields after a password change submission', function() {
          createController();
  
          $scope.credentials.password = 'testxxxxxxxxxxx';
          $scope.credentials.passwordConfirmation = 'testxxxxxxxxxxx';
          $scope.submitForm('password');
  
          expect($scope.credentials.password).toBe('');
          expect($scope.credentials.passwordConfirmation).toBe('');
        });
      });

      describe('invalid passwords', function() {
        beforeEach(function() {
          createController();
          $scope.displayMessages = {
            'accountView.VALIDATIONMESSAGES.PASSWORDLENGTH': 'Invalid length',
            'accountView.VALIDATIONMESSAGES.PASSWORDMATCH': 'No match'
          };
        });

        it('should display a password length validation error if the password is less than 8 characters', function() {         
          $scope.credentials.password = '123456';
          $scope.credentials.passwordConfirmation = '123456';
          $scope.submitForm('password');

          expect($scope.errorMessages.length).toBe(1);
          expect($scope.errorMessages[0]).toBe('Invalid length');
        });

        it('should display a password match validation error if the passwords do not match', function() {
          $scope.credentials.password = '12345678';
          $scope.credentials.passwordConfirmation = '123456789';
          $scope.submitForm('password');

          expect($scope.errorMessages.length).toBe(1);
          expect($scope.errorMessages[0]).toBe('No match');
        });     
      });  
    });
  });

  describe('submitForm', function() {
    it('should verify that submitForm(type) can be called with password 123456789 and same password confirmation', function() {   
      createController();
      $scope.credentials.passwordConfirmation = '123456789';
      $scope.credentials.password = '123456789';
      $scope.submitForm('password');

      expect($scope.credentials.password).toBe('');
      expect($scope.credentials.passwordConfirmation).toBe('');
     });
  });

  describe('deleteAllDashboardsHandler', function() {
    it('should verify that deleteAllDashboardsHandler() is called for current user with Dashboard', function() {   
      createController();
      
      $scope.deleteAllDashboardsHandler();

      $scope.currentUser = currentUserMockWithDashboard;

      spyOn(customDashboardServiceMock, 'getDashboards').and.callThrough();
      spyOn(customDashboardServiceMock, 'deleteAllDashboards').and.callThrough();

      // get past then'able' by flushing queue
      $timeout.flush();

      expect($scope.currentUser).toBe(currentUserMockWithDashboard);
      expect(customDashboardServiceMock.getDashboards).toHaveBeenCalledWith($scope.currentUser);
      expect(customDashboardServiceMock.deleteAllDashboards).toHaveBeenCalledWith($scope.currentUser);
     });
  });

  describe('toggleComparePeriodDetails', function() { 
    it('should invert the boolean property on compareRangeIsYear that is passed in', function() {
      createController();

      $scope.compareRangeIsYear = {
        someId: true
      };

       $scope.toggleComparePeriodDetails('someId');
    
       expect($scope.compareRangeIsYear.someId).toBe(false);
    });
  });  

  describe('clearCache', function () {
    it('should verify that clearCache() can be called successfully', function () {
      createController();

      spyOn(requestManagerMock, 'clearCache');
      spyOn(localStorageServiceMock, 'remove');

      $scope.clearCache();

      expect($scope.cacheClearedOk).toBe(true);
      expect(requestManagerMock.clearCache).toHaveBeenCalled();
      expect(localStorageServiceMock.remove).toHaveBeenCalled();
    });
  });  

  describe('back', function() {
    it('should verify that back() can be called successfully', function() {
      createController();
       $state.current.name = 'home';
       $scope.back();
    
       expect($state.current.name).toBe('home');
    });
  });

  function createController() {
    return $controller('AccountCtrl', {
      '$scope': $scope,
      'authService': authServiceMock,
      'localStorageService': localStorageServiceMock,
      'requestManager': requestManagerMock,
      'customDashboardService': customDashboardServiceMock
    });
  }
});
