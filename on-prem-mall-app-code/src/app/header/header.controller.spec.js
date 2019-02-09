'use strict';

describe('HeaderController', function() {
  var $scope;
  var $controller;
  var $timeout;
  var $httpBackend;
  var apiUrl;

  var organizations;

  var trackingMock = {
    sendPageView: function (page) {
      angular.noop(page);
    },
    setUserId: function (userId) {
      angular.noop(userId);
    },
    setUserRole: function (userRole) {
      angular.noop(userRole);
    }
  };

  beforeEach(function () {
    apiUrl = 'https://api.url';
    spyOn(console, 'error');
  });

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_, _$timeout_, _$httpBackend_,_LocalizationService_) {
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $timeout = _$timeout_;
    _LocalizationService_.setUser({ preferences: { calendar_id: 1}});

    spyOn(_, 'debounce').and.callFake(function(cb) {
      return function(event, toState, fromState) {
        cb(event, toState, fromState);
      }
    });

    organizations = [{
      'organization_id': 1000
    }, {
      'organization_id': 2000
    }];
  }));

  describe('activate', function() {

    var stateMock;
    var mockLocation;

    beforeEach(function() {
      stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      mockLocation = {
        $$path: '/traffic/1234'
      };
    });

    it('should send the current userId to googleAnalytics', function() {
      spyOn(trackingMock, 'setUserId');

      getController(stateMock, mockLocation, organizations, trackingMock);

      expect(trackingMock.setUserId).toHaveBeenCalledWith('1234');
    });
  });

  describe('Export Option', function() {
    var stateMock;
    var mockLocation;
    beforeEach(function() {
      stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };
      mockLocation = {
        $$path: '/traffic/1234'
      };
    });

    it('should display Export CSV', function() {
      spyOn(trackingMock, 'setUserId');
      getController(stateMock, mockLocation, organizations, trackingMock);
      expect($scope.isRestrictedUser).toEqual(false);
    });

    it('should not display Export CSV, Only MI Subscribed', function() {
      spyOn(trackingMock, 'setUserId');
      var orgWithMI = [{
        'organization_id': 1000,
        'status_subscriptions': {
          'market_intelligence': [
            {
              'status': 'active',
              'end': '2019-02-28T06:00:00.000Z',
              'start': '2018-02-27T06:00:00.000Z'
            }
          ]
        }
      }];
      getController(stateMock, mockLocation, orgWithMI, trackingMock);
      expect($scope.isRestrictedUser).toEqual(true);
    });
  });

  describe('trackStateChange', function() {
    it('should set the current route to the page and the start time that the load was initialized', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      getController($stateMock, mockLocation, organizations, trackingMock);

      $scope.$broadcast('$stateChangeSuccess', null, {dateRangeStart: moment('2017-01-01')});

      expect($scope.currentLoadingView.path).toBe('/traffic/1234');
      expect(angular.isNumber($scope.currentLoadingView.loadStartTime)).toBe(true);
    });

    it('should not set the current route if the base url is blank', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: ''
      };

      getController($stateMock, mockLocation, organizations, trackingMock);

      $scope.$broadcast('$stateChangeSuccess', null, {dateRangeStart: moment('2017-01-01')});

      expect($scope.currentLoadingView).toBeUndefined();
    });

    it('should not send the current route to the page tracking service if the route requires date ranges but they have not been set', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      getController($stateMock, mockLocation, organizations, trackingMock);

      var fakeRouteParams = {
        dateRangeEnd: undefined,
        dateRangeStart: undefined,
        compareRange1Start: undefined,
        compareRange1End: undefined,
        compareRange2Start: undefined,
        compareRange2End: undefined
      };

      $scope.$broadcast('$stateChangeSuccess', null, fakeRouteParams);

      expect($scope.currentLoadingView).toBeUndefined();
    });

    it('should set the current route if the route requires date ranges and they have been set', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      getController($stateMock, mockLocation, organizations, trackingMock);

      var fakeRouteParams = {
        dateRangeEnd: moment(),
        dateRangeStart: moment(),
        compareRange1Start: moment(),
        compareRange1End: moment(),
        compareRange2Start: moment(),
        compareRange2End: moment()
      };

      $scope.$broadcast('$stateChangeSuccess', null, fakeRouteParams);

      expect($scope.currentLoadingView.path).toBe('/traffic/1234');
      expect(angular.isNumber($scope.currentLoadingView.loadStartTime)).toBe(true);
    });

    it('should not set the current route if the window.performance object is not available', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      var windowMock = { };

      getController($stateMock, mockLocation, organizations, trackingMock, windowMock);

      $scope.$broadcast('$stateChangeSuccess', null, {dateRangeStart: moment('2017-01-01')});

      expect($scope.currentLoadingView).toBeUndefined();
    });

    it('should not record a load time if the previous page load has not yet been completed', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      spyOn(trackingMock, 'sendPageView');

      getController($stateMock, mockLocation, organizations, trackingMock);

      $scope.currentLoadingView = {
        path: 'some/previous/page',
        loadStartTime: 0
      };

      $scope.$broadcast('$stateChangeSuccess', null, {dateRangeStart: moment('2017-01-01')});

      expect(trackingMock.sendPageView).toHaveBeenCalledWith('some/previous/page');
    });
  });

  describe('onPageLoadFinished', function() {
    it('should calculate the load time in milliseconds', function() {
      var widget1 = getMockWidget('data-grid', 'widgetName1', '5891acb1f01125972d0f00ea');
      var widget2 = getMockWidget('data-grid', 'widgetName1', '5891acb1f01125972d0f00ea');
      var result1 = widget1;
      result1.config = widget1;
      var result2 = widget2;
      result2.config = widget2;
      var result =[result1,result2];
      expectWidgetLbraryQuery().respond({result:result});
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: '/traffic/1234'
      };

      var windowMock = {
        performance: {
          now: function() {
            return 5000;
          }
        }
      };

      spyOn(trackingMock, 'sendPageView');

      getController($stateMock, mockLocation, organizations, trackingMock, windowMock);

      $scope.currentLoadingView = {
        path: 'some/previous/page',
        loadStartTime: 0
      };

      $scope.$broadcast('pageLoadFinished');
      $timeout.flush();

      expect(trackingMock.sendPageView).toHaveBeenCalledWith('some/previous/page', 5000);
    });

    it('should clear out the currentLoadingViewObject after tracking the page view', function() {
      var $stateMock = {
        current: {
          name: 'analytics.organization'
        },
        go: jasmine.createSpy('go')
      };

      var mockLocation = {
        $$path: ''
      };

      var windowMock = {
        performance: {
          now: function() {
            return 5000;
          }
        }
      };

      getController($stateMock, mockLocation, organizations, trackingMock, windowMock);

      $scope.currentLoadingView = {
        path: 'some/previous/page',
        loadStartTime: 0
      };

      $scope.$broadcast('pageLoadFinished');
      $timeout.flush();

      expect($scope.currentLoadingView).toBeUndefined();
    });

  });

  function expectWidgetLbraryQuery() {
    return $httpBackend.expectGET(apiUrl + '/widget/');
  }

  function getMockWidget(widgetType, widgetName, id) {
    if(!id) {
      id = '1505721065401_5891acb1f01125972d0f00ed';
    }
    return {
      _id: id, //id made from creator id and the unix second it was created
      widgetType: widgetType, // data-grid or graph
      widgetName: widgetName, //any string
      widgetDescription: 'A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation.A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation',
      distributedOrgs: organizations,
      columns: [	//kpi list for the data-grid only
        'traffic',
        'conversion',
        'sales'
      ],
      controls: [ //a list of controls for the data grid only
        { name: 'filter' },
        { name: 'sorting' }
      ],
      xAxis: 'week', //x axis group by for graph widget
      yAxis: [ // a list of information for each metric added to the y-axis of the graph widget
        {
          chartType: 'bar', //can be bar or list
          selectedMetric: 'traffic', //kpi value
          selectedPeriod: 'selectedPeriod', // can be selectedPeriod, priorPeriod, priorYear, customPeriod1, customPeriod2
        }
      ],
      orgLevel: true, //can be true or false
      overrideRange: 'month', //can be day, week, month, year, wtd, mtd, qtd, ytd or undefined (default will be undefined)
      auditTrail: { //an object containing information around who created the widget, when and any information around when it was edited.
        creator: '5891acb1f01125972d0f00ed',//creator userID
        creatorName: 'Dean Hand',//full name of creator
        creationDate: '2017-09-11T10:39:54.682Z',//date created
        edits: [
          {
            editedBy: 'Reside Orzoy',// full name of editor,
            editorId: '6781eh1f01136572d0f00rb', //id of editor
            editedOn: '2017-09-18T09:02:54.682Z',// date edited
            editType: 'addedMetric' //translation key
          }
        ]
      },
      hidden: false
    };

  }

  function getController(stateMock, locationMock, organizations, trackingMock, windowMock) {
    stateMock.params =  {orgId : 1000};

    var paramsObject = {
      '$scope': $scope,
      '$state': stateMock,
      '$location' : locationMock,
      'organizations': organizations,
      'googleAnalytics': trackingMock,
      'currentUser': {
        _id: '1234',
        accessMap: {
          setup: {
            orgs_admin: [1000,2000],
            tag : [],
            mi_org : []
          },
          actual: {
            sites : []
          }
        }
      }
    }

    if(windowMock) {
      paramsObject['$window'] = windowMock;
    }

    return $controller('HeaderCtrl', paramsObject);
  }
});
