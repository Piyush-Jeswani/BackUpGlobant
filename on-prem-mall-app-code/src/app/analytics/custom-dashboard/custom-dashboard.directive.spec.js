'use strict';

describe('customDashboard', function() {
  var $scope;
  var $compile;
  var controller;

  var currentUserMockWithDashboard;

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
    firstDayOfWeekSetting: 0
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

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function($rootScope, $templateCache, _$compile_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    
    var newDashboard = {
      widgets: [widgetMock, widgetOrgCustomCompareMock],
      name: 'neDashboardTest1',
      position: 1
    };

    currentUserMockWithDashboard = {
      _id:1,
      preferences: {
        calendar_id: 3,
        custom_dashboards: [newDashboard],
        market_intelligence: { },
        custom_period_1: {
          period_type: 'custom'
        },
        custom_period_2: {
          period_type: 'custom'
        }
      },
      localization: {
        locale: 'en-us',
        date_format:{
          mask: 'dd-mm-yyyy'
        }
      }
    };

    $scope.currentUser = currentUserMockWithDashboard;
    $scope.customDashboards = newDashboard;

    // Put an empty template to cache to prevent Angular from fetching it
    cacheTemplates($templateCache); 

  }));

  describe('create', function() {
    it('should create and digest directive', function() {  
      createDirective();
      expect(controller).not.toBeDefined;
    });

    
  });

  function createDirective() {
    var element = angular.element(
      '<custom-dashboard>' +
      '</custom-dashboard>'
    );

    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('customDashboard');
  }

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/custom-dashboard/custom-dashboard.partial.html',
      '<div></div>'
    );
  }
});
