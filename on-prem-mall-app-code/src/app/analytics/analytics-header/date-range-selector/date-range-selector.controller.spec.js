'use strict';

describe('DateRangeSelectorCtrl', function() {
  var $scope;
  var $rootScope;
  var $controller;
  var $httpBackend;
  var $timeout;
  var LocalizationService;
  var calendarsMock;
  var apiUrl = 'https://api.url';
  var $q;

  var currentUserMock = {
    'username': 'foobar',
    'preferences': {
      'custom_dashboards': [],
      'custom_period_1': {
        'period_type': 'prior_period'
      },
      'custom_period_2': {
        'period_type': 'prior_year'
      }
    }
  };

  var currentOrganizationMock = {
    organization_id: 1,
    subscriptions: {
      'interior': true,
      'perimeter': true,
      'real-time': true
    },
    portal_settings: { currency: '$' },
    default_calendar_id: 1

  };

  var $stateMock = {
    current: {
      data: {
        title: 'Traffic'
        },
      name: 'marketIntelligence'
    },
    $current: {
      name: 'real-time'
    },
    miOpen: true,
    go: jasmine.createSpy('go')
  };

  var $stateMock2 = {
    current: {
      data: {
        title: 'traffic'
        },
      name: 'marketIntelligence'
    },
    $current: {
      name: 'real-time'
    },
    miOpen: true,
    go: jasmine.createSpy('go')
  };

  var $stateMock3 = {
    current: {
      data: {
        title: 'traffic'
        },
      name: 'analytics.organization.marketIntelligence.dashboard'
    },
    $current: {
      name: 'real-time'
    },
    miOpen: true,
    go: jasmine.createSpy('go')
  };

  var mockStateParams = {
    compareRange1Start: '01-01-2016',
    compareRange1End: '30-01-2016',
    compareRange2Start: '01-01-2016',
    compareRange2End: '30-01-2016',
    businessDays: 'false'
  };

  var mockStateParams2 = {
    compareRange1Start: '01-01-2016',
    compareRange1End: '30-01-2016',
    compareRange2Start: '01-01-2016',
    compareRange2End: '30-01-2016',
    businessDays: 'true'
  };

  it('should test the successful creation of the DateRangeSelectorCtrl with StateParams businessDays false', function() {
    createController({
      $state: $stateMock,
      $stateParams: mockStateParams
    });

    $timeout.flush();

    $scope.$digest();

    expect(mockStateParams.businessDays).toBe('false');
  });

  it('should test the successful creation of the DateRangeSelectorCtrl with StateParams businessDays true', function() {
    createController({
      $state: $stateMock,
      $stateParams: mockStateParams2
    });

    $timeout.flush();

    $scope.$digest();

    expect(mockStateParams2.businessDays).toBe('true');
  });

  describe('changeOperatingHoursType', function() {
    it('should redirect the user to the same page but with the businessHours param set to true if operatingHours is false', function() {
      $stateMock.$current.name = 'some-state-name';
      
      createController({
        $state: $stateMock
      });

      $timeout.flush();

      $scope.operatingHours = {selected: false };

      $scope.changeOperatingHoursType();

      expect($stateMock.go).toHaveBeenCalledWith('some-state-name', { businessDays: true})
    });

    it('should redirect the user to the same page but with the businessHours param set to false if operatingHours is true', function() {
      $stateMock.$current.name = 'some-state-name';
      
      createController({
        $state: $stateMock
      });

      $timeout.flush();

      $scope.operatingHours = {selected: true };

      $scope.changeOperatingHoursType();

      expect($stateMock.go).toHaveBeenCalledWith('some-state-name', { businessDays: false})
    });

    it('should broadcast businessDayChanged if the current state is real time', function() {
      $stateMock.$current.name = 'real-time';

      spyOn($rootScope, '$broadcast').and.callThrough();
      
      createController({
        $state: $stateMock
      });

      $timeout.flush();

      $scope.operatingHours = {selected: true };

      $scope.changeOperatingHoursType();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('businessDayChanged', false);
    });
  });

  it('should load calendars', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);

    LocalizationService.getAllCalendars= function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });

    $timeout.flush();

    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    expect($scope.organizationCalendars).toEqual(calendarsMock);
  });

  it('should broadcast resetDateRangesChanged if the current state is marketIntelligence', function(){
    spyOn($rootScope, '$broadcast').and.callThrough();

    createController({
      $state: $stateMock3
    });

    $timeout.flush();

    $scope.$digest();

    $scope.setDateRange('week');

    expect($scope.activeDateRange).toBe('week');
    expect($rootScope.$broadcast).toHaveBeenCalledWith('resetDateRangesChanged');
  });

  it('should test the successful call to setDateRange(\'day\')', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);

    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });

    $timeout.flush();

    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.setDateRange('day');

    expect($scope.activeDateRange).toBe('day');
  });   

  it('should test the successful call to setDateRange(\'week\')', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();
    
    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.setDateRange('week');

    expect($scope.activeDateRange).toBe('week');
  });   

  it('should test the successful call to setDateRange(\'month\')', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();
    
    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.setDateRange('month');

    expect($scope.activeDateRange).toBe('month');
  });   

  it('should test the successful call to setDateRange(\'year\')', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();
    
    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.setDateRange('year');

    expect($scope.activeDateRange).toBe('year');
  });

  it('should test the successful call to sendToRealTime()', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();
    
    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.sendToRealTime();

    expect($scope.realTimeDataShown).toBe(true);
    expect($stateMock2.go).toHaveBeenCalled();
  });   

  it('should test the successful call to setCustomRangeActive()', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();
    
    // Update Bindings and fire any watchers immediately
    $scope.$digest();

    $scope.setCustomRangeActive();

    expect($scope.activeDateRange).toBe('custom');
  });   

  it('should test the successful generation of stateChangeSuccess event', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);
    
    LocalizationService.getAllCalendars = function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    createController({
      $state: $stateMock2
    });
    
    $timeout.flush();

    $scope.$digest();

    $scope.$broadcast('$stateChangeSuccess');

    expect($scope.showRealTimeData).toBe(false);
  });   

  beforeEach(module('shopperTrak'));
  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    var googleAnalytics = {
      trackUserEvent: function (shortcut, type) { 
        angular.noop(shortcut, type);
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));
  beforeEach(inject(function(_$rootScope_, _$controller_,_LocalizationService_,_$timeout_,_$httpBackend_,_$q_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    
    LocalizationService = _LocalizationService_;
    $timeout = _$timeout_; 
    LocalizationService.setUser(currentUserMock);
    $scope.firstDay = 0;
    $q = _$q_;

    $scope.$parent.currentUser = currentUserMock;
    $scope.$parent.currentOrganization = currentOrganizationMock;
    $scope.selectedDateRange = {start: moment('20.09.2017', 'DD.MM.YYYY'),
                                end: moment('20.09.2018', 'DD.MM.YYYY')};

    LocalizationService.isCurrentCalendarGregorian = function (value) {
      angular.noop(value);
      return false;
    }

    LocalizationService.currentCalendarHasExpired = function () {
      return true;
    }

    LocalizationService.setAllCalendars(undefined);
    
    calendarsMock = [{
          '_id': '56fc5f721a76b5921e3df217',
          'calendar_id': 1,
          'name': 'NRF Calendar',
          '__v': 100,
          'organization_ids': [
            5798,
            6177,
            5947,
            5210,
            8695,
            5198,
            8882,
            1224,
            6240,
            6751,
            5349,
            8699,
            5178,
            6339
          ],
          'years': [
            {
              'year': 2001,
              'start_date': '2001-02-04T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2002,
              'start_date': '2002-02-03T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2003,
              'start_date':
                '2003-02-02T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2004,
              'start_date': '2004-02-01T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2005,
              'start_date': '2005-01-30T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            }, {
              'year': 2006,
              'start_date': '2006-01-29T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
            },
            {
              'year': 2007,
              'start_date': '2007-02-04T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2008,
              'start_date': '2008-02-03T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2009,
              'start_date': '2009-02-01T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2010,
              'start_date': '2010-01-31T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2011,
              'start_date': '2011-01-30T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2012,
              'start_date': '2012-01-29T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
            },
            {
              'year': 2013,
              'start_date': '2013-02-03T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2014,
              'start_date': '2014-02-02T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2015,
              'start_date': '2015-02-01T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            },
            {
              'year': 2016,
              'start_date': '2016-01-31T00:00:00.000Z',
              'start_month': 1,
              'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
            }
          ],
          'global': true
        },
          {
            '_id': '56fe81f9be710b6025f897d5',
            'calendar_id': 2826,
            'name': 'Lucky Brand Calendar',
            '__v': 3,
            'organization_ids': [8925],
            'years': [
              {
                'year': 2012,
                'start_date': '2012-01-01T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
              },
              {
                'year': 2013,
                'start_date': '2013-01-06T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
              },
              {
                'year': 2014,
                'start_date': '2014-01-05T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
              },
              {
                'year': 2015,
                'start_date': '2015-01-04T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
              },
              {
                'year': 2016,
                'start_date': '2016-01-03T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
              }
            ],
            'global': false
          },
          {
            '_id': '570d418480dee428210d4e8e',
            'calendar_id': 2146,
            'name': 'Bare Escentuals NEW',
            '__v': 0,
            'organization_ids': [],
            'years': [
              {
                'year': 2011,
                'start_date': '2011-01-03T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              },
              {
                'year': 2012,
                'start_date': '2012-01-02T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              },
              {
                'year': 2013,
                'start_date': '2012-12-31T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              },
              {
                'year': 2014,
                'start_date': '2013-12-30T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              },
              {
                'year': 2015,
                'start_date': '2014-12-29T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 6]
              },
              {
                'year': 2016,
                'start_date': '2016-01-04T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              }
            ],
            'global': false
          },
          {
            '_id': '570d41a680dee428210d4fae',
            'calendar_id': 3226,
            'name': 'Mall LFL 2015',
            '__v': 0,
            'organization_ids': [],
            'years': [
              {
                'year': 2015,
                'start_date': '2015-01-05T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              },
              {
                'year': 2016,
                'start_date': '2016-01-04T00:00:00.000Z',
                'start_month': 0,
                'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
              }
            ],
            'global': false
          }];
  }));

  function createController(args) {
    return $controller('DateRangeSelectorCtrl', angular.extend({
      '$scope': $scope,
      '$state': { current: {} },
      '$stateParams': mockStateParams
    }, args));
  }
});