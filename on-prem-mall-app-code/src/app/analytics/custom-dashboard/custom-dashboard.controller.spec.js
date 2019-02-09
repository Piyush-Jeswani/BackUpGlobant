'use strict';

xdescribe('CustomDashboardController', function() {
  var $controller;
  var $scope;
  var $rootScope;
  var $httpBackend;
  var $q;
  var controller;
  var $stateParams;
  var $state;
  var metricNameServiceMock, metricNameServiceErrorMock;

  var subscriptionsService = {
    onlyMiSubscription: function () {
      return false;
    },
    hasMarketIntelligence: function (org){
      return true;
    },
    userHasMarketIntelligence: function (user,orgId){
      return true;
    }
  };

  var LocalizationService;

  var siteMock = {
      site_id : 80030032,
      organization: {
      id : 10
    }
  };

  var organizationMock = {
    organization_id: 10,
    name: 'org',
    portal_settings: {
      organization_type: 'Retail'
    },
    subscriptions: {
      labor: true,
      sales: true,
      interior: false,
      perimeter: true
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
    dateRangeTypes:{
      default: {
        rangeType:'day'
      }
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
    dateRangeTypes:{
      default: {
        rangeType:'day'
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

  var $stateMock = {
    current: {
      name: 'analytics'
    },
    go: jasmine.createSpy('go')
  };

  var authService;
  var currentUserMock;
  var currentUserMockNoDashBoard;
  var currentUserMockWithDashboard;
  var currentOrganizationMock;
  var ExportService ;
  var $timeout;
  var utils;
  var objectUtils;
  var OrganizationResource, SiteResource;
  var $modal;
  var customDashboardService;

  var apiUrl = 'https://api.url';

  var  orgMetricsMock = [
    { kpi: 'traffic', value: 'traffic', shortTranslationLabel: 'trafficShortTranslationLabel', displayName: 'trafficShortTranslationLabel'},
    { kpi: 'traffic pct', value: 'traffic (pct)', shortTranslationLabel: 'trafficpctShortTranslationLabel', displayName: 'trafficpctShortTranslationLabel'},
    { kpi: 'average percent shoppers', value: 'average_percent_shoppers', shortTranslationLabel: 'apsShortTranslationLabel', displayName: 'apsShortTranslationLabel'},
    { kpi: 'sales', value: 'sales', shortTranslationLabel: 'salesShortTranslationLabel', displayName: 'salesShortTranslationLabel'},
    { kpi: 'peel_off', value: 'peel_off', shortTranslationLabel: 'peelOffShortTranslationLabel', displayName: 'peelOffShortTranslationLabel'}
  ];

  var confirm = function ($modal, $rootScope, $q, $translate) {
    return function(config) {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    }
  };

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    $provide.factory('$confirm', confirm);
  }));

  beforeEach(inject(function(_$rootScope_,
    _$httpBackend_,
    _$controller_,
    _$q_,
    _$modal_,
    $templateCache,
    _authService_,
    _$timeout_,
    _$state_,
    _$stateParams_,
    _OrganizationResource_,
    _SiteResource_,
    _ExportService_,
    _ObjectUtils_,
    _utils_,
   _customDashboardService_,
   _LocalizationService_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    authService = _authService_;
    $httpBackend = _$httpBackend_;
    $stateParams = _$stateParams_;
    ExportService = _ExportService_;
    LocalizationService = _LocalizationService_;
    $state = _$state_;
    $stateParams.position = 1;
    $q = _$q_;
    $modal = _$modal_;
    $timeout = _$timeout_;
    customDashboardService = _customDashboardService_;
    spyOn(console, 'error');

    OrganizationResource = _OrganizationResource_;
    SiteResource = _SiteResource_;
    utils = _utils_;
    objectUtils = _ObjectUtils_;
    $httpBackend.whenGET('https://api.url/organizations').respond(organizationMock);
    $httpBackend.whenGET('https://api.url/organizations/10').respond({result:[organizationMock]});

    $httpBackend.whenGET('https://api.url/organizations/10/sites/80030032').respond({result:[siteMock]});

    enableDynamicCustomCalendars();

    metricNameServiceMock = {
      getMetricNames: function(org) {
        var deferred = $q.defer();

        angular.noop(org);

        deferred.resolve(orgMetricsMock);

        return deferred.promise;
      }
    };
    metricNameServiceErrorMock= {
      getMetricNames: function(org) {
        var deferred = $q.defer();

        angular.noop(org);

        deferred.reject('get metric error');

        return deferred.promise;
      }
    };

    currentUserMockNoDashBoard = {
      _id:2,
      preferences: {
        calendar_id: 3,
        custom_dashboards: [],
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

    currentOrganizationMock = {
      organization_id: 10,
      calendar_id: 3
    };

    authService.getCurrentUser = function () {
      var defer = $q.defer();
      defer.resolve(currentUserMock);
      return defer.promise;
    };

    cacheTemplates($templateCache);
  }));

  it('should activate not set user if user with no dashboard', function() {
    instantiateController(currentUserMockNoDashBoard);

    expect($scope.vm.user).not.toBeDefined;
  });

  it('should activate  set org metrics properly', function() {
    instantiateController(currentUserMockWithDashboard);
    expect($scope.vm.dashboard.widgets[0].orgMetrics).toEqual(orgMetricsMock)
  });

  it('should activate  log error if it can not get org metrics properly', function() {
    instantiateController(currentUserMockWithDashboard, true);
    expect($scope.vm.dashboard.widgets[0].orgMetrics).not.toBeDefined();
    expect(console.error).toHaveBeenCalledWith('get metric error');
  });

  it('should loading complete remove loading flag watch', function() {
    instantiateController(currentUserMockWithDashboard, true);
    spyOn($rootScope, '$broadcast').and.callThrough();
    controller.isLoading = [false, false];
    $scope.$apply();
    $timeout.flush();
    expect($rootScope.$broadcast).toHaveBeenCalledWith('pageLoadFinished');
  });

  it('should activate  set user if user has dashboard', function() {
    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.currentUser._id).toBe(1);
  });

  it('should activate and set correct date range when dateRangeShortCut is day', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].dateRangeShortCut = 'day';
    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRange.start).toEqual(moment().startOf('day').subtract(1, 'day').startOf('day'));
  });

  it('should activate and set correct date range when dateRangeShortCut is week', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].dateRangeShortCut = 'week';
    instantiateController(currentUserMockWithDashboard);
    var firstDay = LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week');
    var zone = moment.locale();
    var newDateRange = {
      start: moment(firstDay).startOf('day').add('minutes', zone),
      end: LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week').endOf('day')
    };

    expect($scope.vm.dashboard.widgets[0].dateRange).toEqual(newDateRange);
  });

  it('should activate and set correct date range when dateRangeShortCut is month', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].dateRangeShortCut = 'month';
    instantiateController(currentUserMockWithDashboard);
    var newDateRange = getMonthShortcut();

    expect($scope.vm.dashboard.widgets[0].dateRange).toEqual(newDateRange);
  });

  it('should activate and set correct date range when dateRangeShortCut is custom but customRange is null', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].dateRangeShortCut = 'custom';
    dash.preferences.custom_dashboards[0].widgets[0].compare1Range = {
      start: '01-01-2016',
      end:'01-08-2016'
    }
    dash.preferences.custom_dashboards[0].widgets[0].compare2Range = {
      start: '01-01-2016',
      end:'01-08-2016'
    }
    dash.preferences.custom_dashboards[0].widgets[0].customRange = null;
    dash.preferences.custom_dashboards[0].widgets[0].deferStartDaysDateBy = 10;
    dash.preferences.custom_dashboards[0].widgets[0].dateDurationInDays = 3;
    instantiateController(dash);
    //var newDateRange = getMonthShortcut();

    //expect($scope.vm.dashboard.widgets[0].dateRange).toEqual(newDateRange);
  });

  it('should activate and set correct date range For .period_type of prior_period prior_year', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].dateRangeShortCut = 'month';
    currentUserMockWithDashboard.preferences.custom_period_1.period_type = 'prior_period';
    currentUserMockWithDashboard.preferences.custom_period_2.period_type = 'prior_year';
    instantiateController(currentUserMockWithDashboard);
    var widget = $scope.vm.currentUser.preferences.custom_dashboards[0].widgets[0];
    var dateRange = getMonthShortcut();
    var compare1Range = utils.getPreviousCalendarPeriodDateRange(dateRange,
      $scope.vm.currentUser,
      widget.currentOrganization,
      widget.dateRangeShortCut
    );

    var compareRange2 = utils.getEquivalentPriorYearDateRange(dateRange,
      widget.firstDayOfWeekSetting,
      $scope.vm.currentUser,
      widget.currentOrganization,
      widget.customRange
    );

    expect($scope.vm.dashboard.widgets[0].compare1Range).toEqual(compare1Range);
    expect($scope.vm.dashboard.widgets[0].compare2Range.toString()).toEqual(compareRange2.toString());
  });

  it('should activate and  correct date range when widget has new range month', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.MONTH'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('month');
  });

  it('should activate and  correct date range when widget has new range common.DAY', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.DAY'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('day');
  });

  it('should activate and set a date format to the widget', function(){
    instantiateController(currentUserMockWithDashboard);
    expect($scope.vm.dashboard.widgets[0].dateFormat).toBeDefined();
    expect($scope.vm.dashboard.widgets[0].dateFormat).toEqual('dd-mm-yyyy');
  });

  it('should activate and set widget.dateFormat to the user selected', function(){
    currentUserMockWithDashboard.localization.date_format.mask = 'MM/DD/YYYY';
    instantiateController(currentUserMockWithDashboard);
    expect($scope.vm.dashboard.widgets[0].dateFormat).toBeDefined();
    expect($scope.vm.dashboard.widgets[0].dateFormat).toEqual('MM/DD/YYYY');
  });

  it('should activate and  correct date range when widget has new range common.WEEK', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.WEEK'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('week');
  });

  it('should activate and  correct date range when widget has new range common.YEAR', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.YEAR'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('year');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.WEEKTODATE', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.WEEKTODATE'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('custom');
    expect($scope.vm.dashboard.widgets[0].dateRangeType).toEqual('wtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.MONTHTODATE', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.MONTHTODATE'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('custom');
    expect($scope.vm.dashboard.widgets[0].dateRangeType).toEqual('mtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.QUARTERTODATE', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.QUARTERTODATE'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('custom');
    expect($scope.vm.dashboard.widgets[0].dateRangeType).toEqual('qtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.YEARTODATE', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.YEARTODATE'
    },

    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('custom');
    expect($scope.vm.dashboard.widgets[0].dateRangeType).toEqual('ytd');
  });

  it('should activate and  correct date range when widget has new range but type is not matching any', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'custom',
      start: '01-01-2017',
      end:'01-08-2017'
    },

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].dateRangeShortCut).toEqual('custom');
    expect($scope.vm.dashboard.widgets[0].dateRangeType).toEqual('custom');

  });

  it('should activate and  correct date range when widget has new range common.DAY ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.DAY'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('day');
  });

  it('should activate and  correct date range when widget has new range common.WEEK ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.WEEK'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('week');
  });

  it('should activate and  correct date range when widget has new range common.MONTH ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.MONTH'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('month');
  });

  it('should activate and  correct date range when widget has new range common.YEAR ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'common.YEAR'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('year');
  });

  it('should activate and  correct date range when widget has new range wtd ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.WEEKTODATE'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('wtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.MONTHTODATE ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.MONTHTODATE'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('mtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.QUARTERTODATE ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.QUARTERTODATE'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('qtd');
  });

  it('should activate and  correct date range when widget has new range dateRangePicker.YEARTODATE ith widget type single or multi', function() {
    var dash = angular.copy(currentUserMockWithDashboard);
    dash.preferences.custom_dashboards[0].widgets[0].newRange = {
      rangeType: 'dateRangePicker.YEARTODATE'
    },
    dash.preferences.custom_dashboards[0].widgets[0].type = 'single';

    instantiateController(dash);

    expect($scope.vm.dashboard.widgets[0].compare.selected_date_range.period_type).toEqual('ytd');
  });

  it('should stateChangeStart', function() {
    instantiateController(currentUserMockWithDashboard);
    $scope.vm.saveLoadingIcon = true;
    var fakeStateEvent = {
      preventDefault: function() {}
    };
    var fakeState = {
      position: 1
    };
    $rootScope.$broadcast('$stateChangeStart', fakeStateEvent, fakeState);
    $timeout.flush();

    expect($stateMock.go).toHaveBeenCalled();
  });

  it('should activate and set widget zone when widget has zoneid', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].zoneId = 1;
    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.currentUser.preferences.custom_dashboards[0].widgets[0].zone).toBeDefined;
  });

  it('should activate and set widget location when widget has locationId', function() {
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].locationId = 1;
    instantiateController(currentUserMockWithDashboard);

    expect($scope.vm.currentUser.preferences.custom_dashboards[0].widgets[0].location).toBeDefined;
  });

  it('should export widget', function() {
    spyOn(ExportService, 'createExportAndStore').and.callThrough();

    instantiateController(currentUserMockWithDashboard);
    $rootScope.$broadcast('page-loaded');

    var pdfParams = getPdfParams(controller.dashboard.widgets[1]);

    controller.exportWidget(controller.dashboard.widgets[1]);
    expect(controller.widgetIsExported(controller.dashboard.widgets[1])).toBeTruthy;

    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams);
  });

  it('should export all widgets', function() {
    spyOn(ExportService, 'createExportAndStore').and.callThrough();

    instantiateController(currentUserMockWithDashboard);

    var pdfParams = getPdfParams(controller.dashboard.widgets[0]);
    var pdfParams1 = getPdfParams(controller.dashboard.widgets[1]);

    $rootScope.$broadcast('scheduleExportCurrentViewToPdf');

    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams);
    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams1);
  });

  it('should export org custom compare widget', function() {
    spyOn(ExportService, 'createExportAndStore').and.callThrough();

    instantiateController(currentUserMockWithDashboard);

    var pdfParams = getPdfParams(controller.dashboard.widgets[1]);

    controller.exportWidget(controller.dashboard.widgets[1]);

    expect(controller.compareWidgetIsExported(controller.dashboard.widgets[1])).toBeTruthy;

    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams);
  });

  it('should export retail_organization_table', function() {
    spyOn(ExportService, 'createExportAndStore').and.callThrough();
    spyOn(ExportService, 'isInExportCartSimple').and.callThrough();

    instantiateController(currentUserMockWithDashboard);
    $rootScope.$broadcast('page-loaded');
    controller.dashboard.widgets[1].name = 'retail_organization_table';

    var pdfParams = getPdfParams(controller.dashboard.widgets[1]);

    controller.exportWidget(controller.dashboard.widgets[1]);

    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams);
    expect(controller.widgetIsExported(controller.dashboard.widgets[1])).toBe(true);
  });

  it('should export widget with showWeatherMetrics', function() {
    spyOn(ExportService, 'createExportAndStore').and.callThrough();

    instantiateController(currentUserMockWithDashboard);
    controller.dashboard.widgets[1].showWeatherMetrics = true;
    controller.dashboard.widgets[1].selectedWeatherMetrics = [{kpi:'traffic'}]

    var pdfParams = getPdfParams(controller.dashboard.widgets[1]);

    controller.exportWidget(controller.dashboard.widgets[1]);

    expect(ExportService.createExportAndStore).toHaveBeenCalledWith(pdfParams);
  });

  it('should setAllDateRanges set all widgets date range', function() {
    instantiateController(currentUserMockWithDashboard);
    controller.dashboard.widgets[0].isHourly = false;
    controller.dashboard.widgets[0].dateRangeTypes = {
      default: {
        rangeType:'day'
      }
    };
    controller.dashboard.widgets[1].isHourly = true;
    controller.dashboard.widgets[1].dateRangeTypes = {
      default: {
        rangeType:'day'
      }
    }
    controller.setAllDateRanges({rangeType: 'week'});

    expect(controller.dashboard.widgets[0].dateRangeTypes.default.rangeType).toBe('common.WEEK');
  });



  it('should edit set editmode to true', function() {

    instantiateController(currentUserMockNoDashBoard);

    controller.edit();

    $timeout.flush();

    expect($scope.vm.editMode).toBeTruthy;
  });

  it('should cancel edit  set editmode to false', function() {

    instantiateController(currentUserMockWithDashboard);

    controller.edit();

    $timeout.flush();

    expect($scope.vm.editMode).toBeTruthy;

    controller.cancelEdit();

    expect($scope.vm.editMode).toBeFalsy;
  });

  it('should delete dashboard remove dashboard from controller', function() {

    instantiateController(currentUserMockWithDashboard);

    controller.deleteDashboard(controller.currentUser.preferences.custom_dashboards[0]);

    $timeout.flush();

    expect(controller.currentUser.preferences.custom_dashboards.length).toBe(1);
  });

  it('should delete widget from dashboard', function() {
    instantiateController(currentUserMockWithDashboard);

    controller.deleteWidget(1);

    expect(controller.dashboard.widgets.length).toBe(1);
  });

  it('should save changes', function() {
    spyOn(customDashboardService, 'updateDashboard').and.callThrough();
    instantiateController(currentUserMockWithDashboard);

    controller.editDashboardName= 'new Name';
    var oldDashboardName = controller.dashboard.name;
    controller.editMode = true;
    var url = apiUrl + '/users/' + currentUserMock._id;
    $httpBackend.whenPUT(url).respond({result:[currentUserMock]});

    controller.saveChanges();

    $httpBackend.flush();

    expect(customDashboardService.updateDashboard).toHaveBeenCalledWith(controller.dashboard, oldDashboardName, widgetOrgCustomCompareMock.organizationId);

    expect(controller.editMode).toBeFalsy;
  });

  it('should not get weather metrics', function(){
    currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].showWeatherMetrics = false;
    instantiateController(currentUserMockWithDashboard);
    expect(currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0].selectedWeatherMetrics).not.toBeDefined();
  })

  it('should get weather metrics', function(){
    var widget = currentUserMockWithDashboard.preferences.custom_dashboards[0].widgets[0];
    widget.showWeatherMetrics = true;
    widget.weather = [
      'Temperature'
    ];
    widget.selectedWeatherMetrics = undefined;
    instantiateController(currentUserMockWithDashboard);
    expect($scope.vm.dashboard.widgets[0].selectedWeatherMetrics).toBeDefined();
  })

  function getMonthShortcut() {
    var previousYear;
    var calendarInfo = LocalizationService.getSystemYearForDate(moment());
    if (!LocalizationService.hasMonthDefinitions()) calendarInfo.month -= 1;

    var currentMonth = calendarInfo.month;
    var currentYear = calendarInfo.year;
    var previousMonth = currentMonth - 1;
    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear = currentYear  - 1;
    } else {
      previousYear = currentYear ;
    }
    return {
      start: LocalizationService.getFirstDayOfMonth(previousMonth, previousYear),
      end: LocalizationService.getLastDayOfMonth(previousMonth, previousYear).endOf('day')
    };
  }

  function getPdfParams(widget) {
    var pdfParams = angular.copy(widget);
    pdfParams.orgName = pdfParams.currentOrganization.name;
    pdfParams.orgId = pdfParams.orgId ? pdfParams.orgId.toString() : pdfParams.organizationId.toString();

    if(pdfParams.showWeatherMetrics){
      pdfParams.weather = [];
      _.each(pdfParams.selectedWeatherMetrics, function(weatherMetric){
        pdfParams.weather.push(weatherMetric.kpi);
      });
      delete pdfParams.selectedWeatherMetrics;
    }
    if(pdfParams.name === 'org-custom-compare') {//all of the following is required for the compare widget to work in pdf export
      pdfParams.dateRange = pdfParams.dateRanges.dateRange;
      pdfParams.compare1Range = pdfParams.dateRanges.compare1Range;
      pdfParams.compare2Range = pdfParams.dateRanges.compare2Range;
      pdfParams.name = pdfParams.compare.chart_name;
      pdfParams.noTranslation = true;
      pdfParams.summaryKey = 'org-custom-compare';
      pdfParams.compareId = widget.chart_name + pdfParams.orgId;
      pdfParams.selectedMetrics = pdfParams.compare.activeSelectedMetrics;
      pdfParams.table = pdfParams.compare.showTable;
      pdfParams.selectedComparePeriod = pdfParams.compare.activeSelectedComparePeriods;
      pdfParams.compareId = pdfParams.compareId.replace(/[^a-zA-Z0-9]/g, '');
    }

    if(!objectUtils.isNullOrUndefinedOrEmpty(pdfParams.selectedMetrics)  && _.isObject(pdfParams.selectedMetrics[0])) {
      pdfParams.selectedMetrics = _.pluck(pdfParams.selectedMetrics, 'kpi');
    }

    if(pdfParams.name === 'traffic') {
      pdfParams.name = pdfParams.kpi;
    }

    // Strip out some props:
    removeParams(pdfParams);

    if(pdfParams.selectedDaysDailyPerformance) {
      _.each(pdfParams.selectedDaysDailyPerformance, function(day){
        delete day.transkey;
      })
    }

    if(pdfParams.selectedDaysTrafficPerWeekday) {
      _.each(pdfParams.selectedDaysTrafficPerWeekday, function(day){
        delete day.transkey;
      })
    }

    return pdfParams;
  }

  function removeParams(pdfParams) {
    var paramsToRemove = [
      'timePeriod',
      'currentOrganization',
      'dateRangeShortCut',
      'currentSite',
      'gridWidthClass',
      'dateRangeTypes',
      'sites',
      'orgMetrics'
    ];

    if(pdfParams.name === 'retail-organization-table') {
      paramsToRemove.push('currencySymbol');
      paramsToRemove.push('widgetData');
      paramsToRemove.push('tableData');
    }

    _.each(paramsToRemove, function(name){
      delete pdfParams[name];
    });
  }

  function instantiateController(currentUser, metricServiceError) {
    currentUserMock = currentUser;
    LocalizationService.setUser(currentUserMock);

    controller = $controller('CustomDashboardController', {
      '$scope': $scope,
      '$rootScope' : $rootScope,
      '$state': $stateMock,
      '$stateParams': $stateParams,
      'currentOrganization': currentOrganizationMock,
      'customDashboardService': customDashboardService,
      'sites': [{
        'site_id': 100
      }],
      'currentSite':null,
      'metricNameService': metricServiceError? metricNameServiceErrorMock:metricNameServiceMock,
      'ExportService': ExportService,
      'organizations':[currentOrganizationMock],
      'SiteResource': SiteResource,
      'OrganizationResource': OrganizationResource,
      'SubscriptionsService':subscriptionsService,
      'utils': utils
    });


    // Emulate the 'controllerAs' syntax:
    controller.dateFormat = 'dd-mm-yyyy';
    $scope.vm = controller;
    $timeout.flush();
    $httpBackend.flush();
  }

  // These calendars will auto generate as the year moves on
  function enableDynamicCustomCalendars() {
    var allCalendars = [
      {
        '_id': '56fc5f721a76b5921e3df217',
        'calendar_id': 1,
        'name': 'NRF Calendar',
        '__v': 360,
        'organization_ids': [

        ],
        'years': [
          {
            'year': Number(getFirstSunday(1).format('YYYY')) - 1,
            'start_date': getFirstSundayLastYear(1).toISOString(),
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSunday(1).format('YYYY')),
            'start_date': getFirstSunday(1).toISOString(),
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          }
        ],
        'global': true
      },

      {
        '_id': '1234',
        'calendar_id': 2,
        'name': 'A Saturday Calendar',
        'organization_ids': [

        ],
        'years': [
          {
            'year': 2015, // This is our un-dynamic safe year
            'start_date': moment.utc('07-02-2015', 'DD-MM-YYYY').toISOString(),
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSaturday(1).format('YYYY')) - 1,
            'start_date': getFirstSaturday(1).toISOString(),
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          },
          {
            'year': Number(getFirstSaturday(1).format('YYYY')),
            'start_date': getFirstSaturday(1).toISOString(),
            'start_month': 1, // Feb
            'month_mask': [
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4
            ]
          }
        ],
        'global': true
      },
      {
        '_id': '5706c4b6c6332ca9432667aa',
        'calendar_id': 3,
        'name': 'Standard Sunday Weeks',
        '__v': 1016,
        'organization_ids': [ ],
        'years': [
          {
            'year': 2015,
            'start_date': '2014-12-28T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          },
          {
            'year': 2016,
            'start_date': '2015-12-27T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          },
          {
            'year': 2017,
            'start_date': '2016-12-25T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5,
              4,
              4,
              5
            ]
          }
        ],
        'global': true
      }
    ];

    LocalizationService.setAllCalendars(allCalendars);
  }

  function getFirstSunday(month) {
    var startOfYear = moment().startOf('year');

    return findSunday(startOfYear, month);
  }

  function getFirstSundayLastYear(month) {
    var startOfYear = moment().add(-1, 'year').startOf('year');

    return findSunday(startOfYear, month);
  }

  function findSunday(startOfYear, month) {
    while (startOfYear.month() !== month && startOfYear.day() !== 0) {
      startOfYear.add(1, 'day');
    }

    return startOfYear;
  }

  function getFirstSaturday() {
    var startOfYear = moment().startOf('year');

    while (startOfYear.day() !== 6) {
      startOfYear.add(1, 'day');
    }

    return startOfYear;
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
