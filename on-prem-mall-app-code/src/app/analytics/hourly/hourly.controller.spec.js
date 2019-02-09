'use strict';

describe('HourlyController', function () {
  var $controller;
  var $scope;
  var $rootScope;
  var currentZone;
  var $httpBackend;
  var calendarsMock;
  var LocalizationService;
  var ExportService;
  var apiUrl = 'https://api.url';
  var $q;
  var $timeout;
  var sitesMock = [{ name: 'a site' }];
  var features;
  var zoneId = 1000;
  var currentZoneMock = {
    'id': zoneId
  };

  var customDashboardServiceMock = {
    setSelectedWidget: function (params) {
      angular.noop(params);
    },
    getDashboards: function (currentUser) {
      return currentUser.preferences.custom_dashboards;
    }
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

  var mockStateParams3 = {
    compareRange1Start: '01-01-2016',
    compareRange1End: '30-01-2016',
    compareRange2Start: '01-01-2016',
    compareRange2End: '30-01-2016',
    businessDays: undefined
  };

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_, _LocalizationService_, _$q_, _$timeout_,_ExportService_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller = _$controller_;  
    $httpBackend = _$httpBackend_;
    LocalizationService = _LocalizationService_;
    ExportService = _ExportService_;
    $timeout = _$timeout_;
    _LocalizationService_.setUser({ preferences: { calendar_id: 1 } });
    $scope.vm = {};
    $scope.vm.customDashboards = function () { };

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

  describe('HourlyController', function () {
    var siteUserHasFullAccessTo = {
      'fullAccess': true,
      'organization': {
        'id': 1000
      }
    };

    var currentUserMock = {
      'username': 'foobar',
      'preferences': {
        'custom_dashboards': []
      }
    };

    it('should check successful call to the activate() function and test associated properties when businessDays set to false', function () {
       var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
        'portal_settings': {
          'organization_type': 'Mall'
        }
      };

      var controller = $controller('HourlyController', {
        '$scope': $scope,
        '$rootScope': $rootScope,
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'sites': sitesMock,
        'customDashboardService': customDashboardServiceMock,
        '$stateParams': mockStateParams
      });

      // Get past any 'then'-ables. Flush all queues on the client side.
      $timeout.flush();
      
      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect($scope.vm.chartSegments).toBe(null);
      expect($rootScope.customDashboards).toBe(false);
      expect($scope.kpi.name).toBe('traffic');
      expect($scope.groupBy).toBe('hour');
      expect($scope.salesCategoriesTraffic.selection).toEqual([]);
      expect($scope.salesCategoriesDailyPerf.selection).toEqual([]);
      expect($scope.salesCategoriesTrafficWeekday.selection).toEqual([]);
      expect($scope.trafficOption).toEqual({});
      expect($scope.operatingHours).toBe(true);
      expect($scope.isRetail).toBe(false);
      expect($scope.metricsToShow[0]).toBe('traffic');
    });

    it('should check successful call to the activate() function and test associated properties when businessDays set to true', function () {
      var organizationWithInteriorSubscription = {
       'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
       'portal_settings': {
         'organization_type': 'Mall'
       }
     };

     var controller = $controller('HourlyController', {
       '$scope': $scope,
       '$rootScope': $rootScope,
       'currentOrganization': organizationWithInteriorSubscription,
       'currentSite': siteUserHasFullAccessTo,
       'currentZone': currentZoneMock,
       'currentUser': currentUserMock,
       'sites': sitesMock,
       'customDashboardService': customDashboardServiceMock,
       '$stateParams': mockStateParams2
     });

     // Get past any 'then'-ables. Flush all queues on the client side.
     $timeout.flush();
     
     // Update Bindings and fire any watchers immediately
     $scope.$digest();

     expect($scope.vm.chartSegments).toBe(null);
     expect($rootScope.customDashboards).toBe(false);
     expect($scope.kpi.name).toBe('traffic');
     expect($scope.groupBy).toBe('hour');
     expect($scope.salesCategoriesTraffic.selection).toEqual([]);
     expect($scope.salesCategoriesDailyPerf.selection).toEqual([]);
     expect($scope.salesCategoriesTrafficWeekday.selection).toEqual([]);
     expect($scope.trafficOption).toEqual({});
     expect($scope.operatingHours).toBe(false);
     expect($scope.isRetail).toBe(false);
     expect($scope.metricsToShow[0]).toBe('traffic');
   });

    it('should check successful call to the activate() function and test associated properties when businessDays set to undefined', function () {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
        'portal_settings': {
          'organization_type': 'Mall'
        }
      };

      var controller = $controller('HourlyController', {
        '$scope': $scope,
        '$rootScope': $rootScope,
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'sites': sitesMock,
        'customDashboardService': customDashboardServiceMock,
        $stateParams: mockStateParams3
      });

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect($scope.vm.chartSegments).toBe(null);
      expect($rootScope.customDashboards).toBe(false);
      expect($scope.kpi.name).toBe('traffic');
      expect($scope.groupBy).toBe('hour');
      expect($scope.salesCategoriesTraffic.selection).toEqual([]);
      expect($scope.salesCategoriesDailyPerf.selection).toEqual([]);
      expect($scope.salesCategoriesTrafficWeekday.selection).toEqual([]);
      expect($scope.trafficOption).toEqual({});
      expect($scope.operatingHours).toBe(true);
      expect($scope.isRetail).toBe(false);
      expect($scope.metricsToShow[0]).toBe('traffic');
      expect(mockStateParams.businessDays).toBe('false');
    });

    it('should check successful call to updateSelectedWeatherMetrics(metric) for metric set to traffic', function () {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
        'portal_settings': {
          'organization_type': 'Mall'
        }
      };

      var controller = $controller('HourlyController', {
        '$scope': $scope,
        '$rootScope': $rootScope,
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'sites': sitesMock,
        'customDashboardService': customDashboardServiceMock,
        $stateParams: mockStateParams2
      });

      // Get past any 'then'-ables. Flush all queues on the client side.
      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      $scope.updateSelectedWeatherMetrics('traffic');

      expect($scope.selectedWeatherMetrics).toBe('traffic');
    });

    it('should check successful call to setSelectedWidget(title) for title set to traffic', function () {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
        'portal_settings': {
          'organization_type': 'Mall'
        }
      };

      $scope.trafficOption = { selectedMetric: 'traffic' };
      var controller = $controller('HourlyController', {
        '$scope': $scope,
        '$rootScope': $rootScope,
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'sites': sitesMock,
        'customDashboardService': customDashboardServiceMock,
        $stateParams: mockStateParams2
      });

      // Get past any 'then'-ables. Flush all queues on the client side.
      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      $scope.trafficOption = { selectedMetric: 'traffic' };
      spyOn(customDashboardServiceMock, 'setSelectedWidget').and.callThrough();
      $scope.setSelectedWidget('traffic');

      expect($scope.trafficOption.selectedMetric).toBe('traffic');
      expect(customDashboardServiceMock.setSelectedWidget).toHaveBeenCalled(); 
    });

    it('should check successful call to exportWidget(metricKey, toDashboard) for metric key traffic and export to pdf-csv', function () {
      var organizationWithInteriorSubscription = {
        'subscriptions': { 'interior': true, 'perimeter': true, 'market_intelligence': true },
        'portal_settings': {
          'organization_type': 'Mall'
        }
      };

      $scope.trafficOption = { selectedMetric: 'traffic' };
      var controller = $controller('HourlyController', {
        '$scope': $scope,
        '$rootScope': $rootScope,
        'currentOrganization': organizationWithInteriorSubscription,
        'currentSite': siteUserHasFullAccessTo,
        'currentZone': currentZoneMock,
        'currentUser': currentUserMock,
        'sites': sitesMock,
        'customDashboardService': customDashboardServiceMock,
        $stateParams: mockStateParams2
      });

      // Get past any 'then'-ables. Flush all queues on the client side.
      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      $scope.trafficOption = { selectedMetric: 'traffic' };
      spyOn(ExportService, 'createExportAndStore').and.callThrough();
      $scope.exportWidget('traffic', false);

      expect($scope.trafficOption.selectedMetric).toBe('traffic');
      expect(ExportService.createExportAndStore).toHaveBeenCalled();
    });
  });
});
