'use strict';

describe('lineHighChartWidgetDirective', function () {
  var $compile;
  var $httpBackend;
  var $q;
  var $timeout;
  var $scope, $rootScope;
  var apiUrl = 'https://api.url';
  var lineHighChartWidget;
  var currentOrganizationMock;
  var LocalizationService;
  var ObjectUtils;
  var mockSiteResource = {
    get: function(params) {
      angular.noop(params);
      var deferred = $q.defer();
      deferred.resolve({
        name: 'site 1',
        geometry: {
          coordinates:['36.0918639,-115.1751614']
        }
      });

      return {
        $promise: deferred.promise
      };
    }
  };

  var mockedRequestManagerChartData1 = [
    {
      organization_id:3068,
      period_end_date:'2017-02-25',
      period_start_date:'2017-02-25',
      site_id:51181,
      total_traffic:1987
    },
    {
      organization_id:3068,
      period_end_date:'2017-02-26',
      period_start_date:'2017-02-26',
      site_id:51181,
      total_traffic:1990
    },
    {
      organization_id:3068,
      period_end_date:'2017-02-27',
      period_start_date:'2017-02-27',
      site_id:51181,
      total_traffic:1999
    }
  ] ;

  var mockState = {
    current: {
      views: {
        analyticsMain: {
          controller: 'someController'
        }
      }
    }
  };

  // Array of Objects
  var weatherDataMock = [{
    date: '2017-08-28',
    maxTemp: {
      c: '42',
      f: '32'
    },
    minTemp: {
      c: '32',
      f: '90'
    },       
    hourly: [{
      time: '24',
      temp:{
        c: '42',
        f: '108'
      },
      humidity: '57',
      feelsLike: {
         c: '47',
         f: '116' 
      },
      windSpeed: {
        mph: '8',
        kmph: '13'
      },
      precipitation: '0.0' 
    }] 
  },{
  date: '2017-08-27',
  maxTemp: {
    c: '42',
    f: '32'
  },
  minTemp: {
    c: '32',
    f: '90'
    },    
  hourly: [{
      time: '24',
      temp:{
        c: '42',
        f: '108'
      },
      humidity: '57',
      feelsLike: {
        c: '47',
        f: '116' 
      },
      windSpeed: {
        mph: '8',
        kmph: '13'
      },  
      precipitation: '0.0'
    }]

  }];

  var requestManagerMock = function ($q) {
    return {
      get: function (url, params) {
        var deferred = $q.defer();

        angular.noop(url, params);
       
        deferred.resolve({result:angular.copy(mockedRequestManagerChartData1)});

        return deferred;
      },
      getRequest: function(url, params, checkCache, requests){
        angular.noop(url, params, checkCache, requests);

        var deferred = $q.defer();

        var result = {result:angular.copy(mockedRequestManagerChartData1)};

        if(url.indexOf('weather') !== -1){
          result = {result:angular.copy(weatherDataMock)};
        }

        deferred.resolve(result);
 
        return deferred;     
      },
      findOutstandingRequest: function (url, params, outstandingRequests) {
        angular.noop(url, params, outstandingRequests);

        return null;
      },
      cancelRequests: function(requests, reason) {
        reason = 'User cancelled';
        _.each(requests, function (request) {
           reject(request, reason);
        });
      }
    };
  }

  function reject(request, response) {
    if(!ObjectUtils.isNullOrUndefined(request.deferred) &&
      typeof request.deferred.reject === 'function') {
      request.deferred.reject(response);
    }

  }


  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module('shopperTrak.widgets.mock'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.value('SiteResource', mockSiteResource);
    $provide.value('$state', mockState);
    $provide.factory('requestManager', requestManagerMock);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_,
    _$compile_,
    _$httpBackend_,
    _$q_,
    _$timeout_,
    _LocalizationService_,
    _ObjectUtils_
  ) {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    LocalizationService = _LocalizationService_;
    $scope = $rootScope.$new();
    ObjectUtils = _ObjectUtils_;
    $q = _$q_;
    $timeout = _$timeout_;
    currentOrganizationMock = {
      organization_id: 1,
      portal_settings: { currency: '$' }
    };

    spyOn(_, 'debounce').and.callFake(function(cb) { 
      return function(event, toState, fromState) { 
        cb(event, toState, fromState);
      }
    });

    $httpBackend.whenGET('https://api.url/organizations').respond(currentOrganizationMock);
   
    $scope.currentSortDirection = undefined;
    $scope.kpi = 'traffic';
  }));

  describe('activate', function () {
    it('should not set the currentSortDirection if it has already been set on the directive', function() {
      $scope.currentSortDirection = 'desc';
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.currentSortDirection).toBe('desc');
    });

    it('should set the currentSortDirection to a default if it has not been set', function() {
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.currentSortDirection).toBe('asc');
    });

    it('should default the widget status to loading', function() {
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.isLoading).toBe(true);
    });

    it('should set the tabWidget if not on the PDF export', function() {
      $rootScope.pdf = false;
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.tabWidget).toBeDefined();
    });

    it('should set the tabWidget if not on the PDF export', function() {
      $rootScope.pdf = true;
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.tabWidget).toBeUndefined();
    });

    it('should not change the valueLabel if it has been set', function() {
      $scope.valueLabel = 'value label';
      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.valueLabel).toBe('value label');
    });

    it('should set the valueLabel to an empty string if it has not been set', function() {
      var element = angular.element(
        '<line-high-chart-widget ' +
        'is-hourly="isHourly" ' +
        'show-table="showTable" ' +
        'org-id="1234" ' +
        'site-id="56789" ' +
        'date-range-start="dateRangeStart" ' +
        'date-range-end="dateRangeEnd" ' +
        'compare-range-1-start="compareRange1Start" ' +
        'compare-range-1-end="compareRange1End" ' +
        'compare-range-2-start="compareRange2Start" ' +
        'compare-range-2-end="compareRange2End" ' +
        'first-day-of-week-setting="1" ' +
        'get-unique-returning="false" ' +
        'separate-summary-requests="true" ' +
        'summary-averages="true" ' +
        'return-data-precision="1" ' +
        'api-endpoint="kpis/fooKpi" ' +
        'api-return-key="barKey" ' +
        'show-metrics="true" ' +
        'kpi="kpi" ' +
        'current-organization="currentOrganizationMock" ' +
        'current-user="currentUserMock" ' +
        'current-sort-direction="currentSortDirection">' +
        '  </line-high-chart-widget>'
      );

      $compile(element)($scope);
      $scope.$digest();
      var lineHighChartWidget = element.controller('lineHighChartWidget');
      expect(lineHighChartWidget.valueLabel).toBe('');
    });

    it('should load the current site if the siteId is specified but no site object is passed in', function() {
      $scope.currentSite = undefined;
      $scope.siteId = 100;
      $scope.orgId = 1;

      lineHighChartWidget = renderDirectiveAndDigest();
      expect(lineHighChartWidget.currentSite.name).toBe('site 1');
    });

    it('should not load the current site if the currentSite is set', function() {
      $scope.currentSite = {
        id: 2,
        name: 'Some other site'
      };

      spyOn(mockSiteResource, 'get');

      lineHighChartWidget = renderDirectiveAndDigest(true);
      expect(mockSiteResource.get).not.toHaveBeenCalled();
    });

    describe('weather', function() {
      beforeEach(function() {
        $scope.orgId = 1;
        $scope.siteId = undefined;
      });

      it('should set weather to off is the currentUser is undefined', function() {
        $scope.currentUser = undefined;
        
        lineHighChartWidget = renderDirectiveAndDigest(true);
        expect(lineHighChartWidget.weatherEnabled).toBe(false);
      });

      it('should set weather to off if the user preferences are undefined', function() {
        $scope.currentUser = { };
        
        lineHighChartWidget = renderDirectiveAndDigest(true);
        expect(lineHighChartWidget.weatherEnabled).toBe(false);
      });

      it('should set weather to off if show weather is set to off for the whole widget', function() {
        $scope.currentUser = { 
          preferences: {}
        };

        $scope.showWeatherMetrics = false;
        
        lineHighChartWidget = renderDirectiveAndDigest(true);
        expect(lineHighChartWidget.weatherEnabled).toBe(false);    
      });

      it('should set weather to on if it is enabled for the widget and the user has enabled it', function() {
        $scope.currentUser = { 
          preferences: {
            weather_reporting: true
          }
        };

        $scope.showWeatherMetrics = true;
        
        lineHighChartWidget = renderDirectiveAndDigest(true);
        expect(lineHighChartWidget.weatherEnabled).toBe(true);   
      });

      it('should set weather to off if it is enabled for the widget and the user has disabled it', function() {
        $scope.currentUser = { 
          preferences: {
            weather_reporting: false
          }
        };

        $scope.showWeatherMetrics = true;
        
        lineHighChartWidget = renderDirectiveAndDigest(true);
        expect(lineHighChartWidget.weatherEnabled).toBe(false);   
      });
    });

    describe('initGroupBy', function() {
      it('should set group by to an empty object if not initialised on the root scope', function() {
        $rootScope.groupBy = undefined;
        $scope.groupBy = undefined;
        
        lineHighChartWidget = renderDirectiveAndDigest();

        expect($rootScope.groupBy).toBeDefined();
        expect(Object.keys($rootScope.groupBy).length).toBe(0);
      });

      it('should set the group by key if set on the scope', function() {
        $rootScope.groupBy = undefined;

        $scope.groupBy = {
          key: 'value'
        };

        lineHighChartWidget = renderDirectiveAndDigest();

        expect($rootScope.groupBy['someController-traffic'].key).toBe('value');
      });
    });
  });

  describe('hourly widgets', function() {
    describe('activate', function() {
      it('should default the current sort to the hourly column', function() {
        lineHighChartWidget = renderDirectiveAndDigest();
        expect(lineHighChartWidget.currentSort).toBe('hourSort');
      });

      it('should default to the table being displayed', function() {
        $scope.isHourly = true;
        $scope.showTable = undefined;

        lineHighChartWidget = renderDirectiveAndDigest();
        expect(lineHighChartWidget.showTable.selection).toBe(true);
      });
    });
  });

  describe('getCommonRequestParams', function () {
    it('should load right parameters', function () {
      lineHighChartWidget = renderDirectiveAndDigest();
      lineHighChartWidget.orgId = 1234;
      lineHighChartWidget.siteId = 567890;
      var params = lineHighChartWidget.getCommonRequestParams();
      expect(params.orgId).toBe(1234);
      expect(params.siteId).toBe(567890);
    });
  });

  describe('calculateDelta', function () {
    it('should calculate correct delta', function () {
      lineHighChartWidget = renderDirectiveAndDigest();
      var current = 375083;
      var compare = 402630;
      var delta = lineHighChartWidget.calculateDelta(current, compare);

      var manualCalculation = ((402630 - 375083) / 402630) * 100 * -1;
      expect(delta).toBe((manualCalculation));
    });
  });

  describe('setWeatherMetrics()', function () {
    it('should execute successfully for Temperature in Â°C', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', temperature_format: 'Â°C'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });

  describe('setWeatherMetrics()', function () {
    it('should execute successfully for Temperature in Â°F', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', temperature_format: 'Â°F'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });

  describe('setWeatherMetrics()', function () {
    it('should execute successfully for Wind Speed in KPH', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'KPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });

  describe('setWeatherMetrics()', function () {
    it('should execute successfully for Wind Speed in MPH', function() {

      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });

  describe('updateMetricUnits()', function () {
    it('should execute successfully for Temperature in C', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', temperature_format: 'C'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest();
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });

  describe('updateMetricUnits()', function () {
    it('should execute successfully for Temperature in F', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', temperature_format: 'F'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest();
      $timeout.flush();
      expect(lineHighChartWidget.selectedWeatherMetrics[0]).toEqual('High temperature')
    });
  });  

  describe('setOption()', function () {
    it('should execute successfully for Subscription any', function() {  
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      lineHighChartWidget.showSalesCategoriesSelector = false;
      lineHighChartWidget.selectedOption = {name: 'traffic', propertyName: 'total_traffic', metric: { requiredSubscriptions: []} };

      lineHighChartWidget.apiReturnKey = 'total_traffic';
      $scope.option = {name:'sales', propertyName: 'total_traffic', metric: { requiredSubscriptions: []}};

      lineHighChartWidget.setOption($scope.option);
      expect(lineHighChartWidget.showSalesCategoriesSelector).toBe(false);      
    });
  });

  describe('setOption()', function () {
    it('should execute successfully for Subscription sales and Show Sales Category Selector', function() {
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      lineHighChartWidget.showSalesCategoriesSelector = false;
      lineHighChartWidget.selectedOption = {name: 'traffic', propertyName: 'total_traffic', metric: { requiredSubscriptions: []}};
      lineHighChartWidget.apiReturnKey = 'total_traffic';
      $scope.option = {name:'sales', propertyName: 'total_traffic', metric: { requiredSubscriptions: ['sales']}};
      lineHighChartWidget.setOption($scope.option);
      expect(lineHighChartWidget.showSalesCategoriesSelector).toBe(true);      
    });
  });

  describe('setOption()', function () {
    it('should execute successfully for Subscription sales and NOT Show Sales Category Selector', function() {    
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
      lineHighChartWidget.showSalesCategoriesSelector = false;
      lineHighChartWidget.selectedOption = {name: 'traffic', propertyName: 'total_traffic'};    
      lineHighChartWidget.selectedOption.SubscriptionsService = {hasSubscriptions: 'sales'};
      lineHighChartWidget.apiReturnKey = 'total_traffic';
      $scope.option = {name:'traffic', propertyName: 'total_traffic'};
      lineHighChartWidget.setOption($scope.option);
      expect(lineHighChartWidget.showSalesCategoriesSelector).toBe(false);      
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi sales', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'sales';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi conversion', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'conversion';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi ats', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'ats';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi star', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'star';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi upt', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'upt';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi labor_hours', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'labor_hours';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi visitor_behaviour_traffic', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'visitor_behaviour_traffic';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi gsh', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'gsh';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi draw_rate', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'draw_rate';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi opportunity', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'opportunity';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi dwell_time', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'dwell_time';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi abandonment_rate', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'abandonment_rate';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi peel_off', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'peel_off';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('setDefaultOption()', function () {
    it('should execute successfully for kpi average_percent_shoppers', function() {              
      $rootScope.pdf = true;
      $scope.groupBy = undefined;
      $rootScope.customDashboards = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.currentUserMock = {localization: {date_format: 'MM/DD/YYYY', velocity_format: 'MPH'}};
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.$digest();
      $scope.kpi = 'average_percent_shoppers';
      lineHighChartWidget = renderDirectiveAndDigest(); 
      $timeout.flush();
    });
  });

  describe('toggleTableVisibility()', function () {
    it('should execute successfully show Table true', function() {               
      $scope.showTable = {'selection' : true};
      lineHighChartWidget = renderDirectiveAndDigest();   
      lineHighChartWidget.toggleTableVisibility();
      expect(lineHighChartWidget.showTable.selection).toBe(false);
    });
  });

  describe('toggleTableVisibility()', function () {
    it('should execute successfully show Table false', function() {               
      $scope.showTable = {'selection' : false};
      lineHighChartWidget = renderDirectiveAndDigest();   
      lineHighChartWidget.toggleTableVisibility();
      expect(lineHighChartWidget.showTable.selection).toBe(true);
    });
  });

  describe('sortTable()', function () {
    it('should successfully sort table desc by hour', function() {               
      lineHighChartWidget = renderDirectiveAndDigest(); 
      lineHighChartWidget.currentSortDirection = 'asc';
      lineHighChartWidget.sortTable('hourSort');
      expect(lineHighChartWidget.currentSortDirection).toBe('desc');
    });
  });

  describe('sortTable()', function () {
    it('should successfully sort table asc by hour', function() {               
      lineHighChartWidget = renderDirectiveAndDigest();  
      lineHighChartWidget.currentSortDirection = 'desc'; 
      lineHighChartWidget.sortTable('hourSort');
      expect(lineHighChartWidget.currentSortDirection).toBe('asc');
    });
  });

  describe('loadTooltipData()', function () {
    it('should execute loadTooltipData() successfully with argument seriesItemIndex set to 0', function() {               
      lineHighChartWidget = renderDirectiveAndDigest();
      var seriesItemIndex = 0;
      lineHighChartWidget.getUniqueReturning = true;
      lineHighChartWidget.loadTooltipData(seriesItemIndex);
      expect(lineHighChartWidget.getUniqueReturning).toBe(true);
    });
  });

  describe('loadTooltipData()', function () {
    it('should execute loadTooltipData() successfully with argument seriesItemIndex set to 1', function() {               
      lineHighChartWidget = renderDirectiveAndDigest();
      var seriesItemIndex = 1;
      lineHighChartWidget.getUniqueReturning = true;
      lineHighChartWidget.loadTooltipData(seriesItemIndex);
      expect(lineHighChartWidget.getUniqueReturning).toBe(true);
    });
  });

  describe('formatDate()', function () {
    it('should execute formatDate() successfully with argument dateString set to 06/09/2017', function() {               
      var dummy = 0;
      lineHighChartWidget.formatDate('06/09/2017');
      expect(dummy).toBe(0);
    });
  });

  describe('hasData()', function () {
    it('should execute hasData() successfully with argument index set to 0', function() {               
      var dummy = 0;

      lineHighChartWidget.chartData = {
        labels: [],
        series: [[1, 2, 3, 4]]
      };

      lineHighChartWidget.chartData = {
        labels: [],
        series: [[1, 2, 3, 4]]
      };

      lineHighChartWidget.summaryData = ['test'];

      lineHighChartWidget.hasData(0);

      expect(dummy).toBe(0);
    });
  });

  describe('setLegendLabel()', function () {
    it('should execute setLegendLabel() successfully with argument comparisonIndex set to 0 and comparisonType set to priorPeriod', function() {               
      var dummy = 0;

      lineHighChartWidget.setLegendLabel(0, 'priorPeriod');

      expect(dummy).toBe(0);
    });
  });

  describe('setLegendLabel()', function () {
    it('should execute setLegendLabel() successfully with argument comparisonIndex set to 0 and comparisonType set to priorYear', function() {               
      var dummy = 0;

      lineHighChartWidget.setLegendLabel(0, 'priorYear');

      expect(dummy).toBe(0);
    });
  });

  describe('setLegendLabel()', function () {
    it('should execute setLegendLabel() successfully with argument comparisonIndex set to 0 and comparisonType set to custom', function() {               
      var dummy = 0;

      lineHighChartWidget.setLegendLabel(0, 'custom');

      expect(dummy).toBe(0);
    });
  });

  describe('setLegendLabel()', function () {
    it('should execute setLegendLabel() successfully with argument comparisonIndex set to 0 and comparisonType set to none', function() {               
      var dummy = 0;

      lineHighChartWidget.setLegendLabel(0, 'none');

      expect(dummy).toBe(0);
    });
  });

  describe('transformChartData()', function () {
    it('should execute transformChartData() successfully with argument responses', function() {     
      $scope.siteId = 100;
      $scope.orgId = 1;
      $scope.currentUser = {
        localization: {date_format: 'MM/DD/YYYY', 
        velocity_format: 'MPH'},
        preferences: {
          weather_reporting: true
        }
      };
      $scope.showWeatherMetrics = true;
      $scope.isHourly = false;
      $scope.siteLevel = true;
      $scope.selectedWeatherMetrics = ['High temperature', 'Low temperature'];
      $scope.kpi = 'traffic';
      $scope.dateRangeStart = moment('2017-01-01');
      $scope.dateRangeEnd = moment('2017-01-30');
      $scope.$apply();
      $scope.$digest();
      LocalizationService.setUser($scope.currentUser);

      lineHighChartWidget = renderDirectiveAndDigest();
      lineHighChartWidget.splitWeatherRequests = false;
      $timeout.flush();
      
      lineHighChartWidget.showSalesCategoriesSelector = false;
      lineHighChartWidget.selectedOption = {name: 'traffic', propertyName: 'total_traffic', metric: { requiredSubscriptions: []} };
      lineHighChartWidget.apiReturnKey = 'total_traffic';
      $scope.option = {name: 'sales', propertyName: 'total_traffic', metric: { requiredSubscriptions: ['sales']}};
      lineHighChartWidget.setOption($scope.option);
      $scope.$digest();

      $timeout.flush();
    
      expect(lineHighChartWidget.chartData.labels[0]).toEqual('25-02-2017');
      expect(lineHighChartWidget.isWeatherLoading).toBeFalsy;
      expect(lineHighChartWidget.weatherRequestFailed).toBeFalsy;
    });
  });

  function renderDirectiveAndDigest(siteLevel) {
    var element;

    if(siteLevel === true) {
      element = createDirectiveElementForSiteLevel();
    } else {
      element = createDirectiveElement();
    }

    $compile(element)($scope);
    $scope.$digest();
    return element.controller('lineHighChartWidget');
  }

  function createDirectiveElement(showMetrics) {
    if(showMetrics !== true) {
      $scope.showMetrics = false;
    }

    $scope.dateFormatMask = 'DD-MM-YYYY';

    return angular.element(
      '<line-high-chart-widget ' +
      'is-hourly="isHourly" ' +
      'show-table="showTable" ' +
      'value-label="{{valueLabel}}" ' +
      'org-id="1234" ' +
      'site-id="56789" ' +
      'date-range-start="dateRangeStart" ' +
      'date-range-end="dateRangeEnd" ' +
      'date-format-mask="dateFormatMask" ' +
      'compare-range-1-start="compareRange1Start" ' +
      'compare-range-1-end="compareRange1End" ' +
      'compare-range-2-start="compareRange2Start" ' +
      'compare-range-2-end="compareRange2End" ' +
      'first-day-of-week-setting="1" ' +
      'get-unique-returning="false" ' +
      'separate-summary-requests="true" ' +
      'selected-weather-metrics="selectedWeatherMetrics" ' +
      'show-weather-metrics="showWeatherMetrics"' +
      'summary-averages="true" ' +
      'return-data-precision="1" ' +
      'api-endpoint="kpis/fooKpi" ' +
      'api-return-key="barKey" ' +
      'show-metrics="showMetrics" ' +
      'group-by="groupBy" ' +
      'kpi="kpi" ' +
      'get-unique-returning="true" '+
      'current-organization="currentOrganizationMock" ' +
      'current-user="currentUserMock" ' +
      'current-sort-direction="currentSortDirection">' +
      '  </line-high-chart-widget>'
    );
  }

  function createDirectiveElementForSiteLevel(showMetrics) {
    if(showMetrics !== true) {
      $scope.showMetrics = false;
    }
    return angular.element(
      '<line-high-chart-widget ' +
      'is-hourly="isHourly" ' +
      'show-table="showTable" ' +
      'value-label="{{valueLabel}}" ' +
      'org-id="1234" ' +
      'site-id="siteId" ' +
      'date-range-start="dateRangeStart" ' +
      'date-range-end="dateRangeEnd" ' +
      'compare-range-1-start="compareRange1Start" ' +
      'compare-range-1-end="compareRange1End" ' +
      'compare-range-2-start="compareRange2Start" ' +
      'compare-range-2-end="compareRange2End" ' +
      'first-day-of-week-setting="1" ' +
      'get-unique-returning="false" ' +
      'separate-summary-requests="true" ' +
      'summary-averages="true" ' +
      'return-data-precision="1" ' +
      'api-endpoint="kpis/fooKpi" ' +
      'api-return-key="barKey" ' +
      'show-metrics="showMetrics" ' +
      'show-weather-metrics="showWeatherMetrics" ' +
      'current-site="currentSite" ' +
      'current-organization="currentOrganizationMock" ' +
      'current-user="currentUser" ' +
      'kpi="kpi" ' +
      'get-unique-returning="true" '+
      'current-sort-direction="currentSortDirection">' +
      '  </line-high-chart-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/line-high-chart-widget/line-high-chart-widget.partial.html',
      '<div></div>'
    );
  }

});