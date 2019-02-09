'use strict';

xdescribe('powerHoursWidgetCtrl', function () {
  var $scope;
  var $controller;
  var LocalizationService;
  var currentSalesCategoryService;
  var TranslateMock;
  var FilterMock;
  var http;
  var apiUrl = 'https://api.url';
  var httpBackend;
  var baseUrl = apiUrl + '/kpis/powerhours/organizations/';
  let $rootScope;
  var $timeout;

  var dow_names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module('shopperTrak.widgets.mock'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    var localStorageService = {
      set: function (key, value) {
        angular.noop(key, value);
      },
      get: function (key) {
        angular.noop(key);
        return undefined;
      },
      keys: function () {
        return [];
      }
    };

    $provide.value('localStorageService', localStorageService);

    var googleAnalytics = {
      sendRequestTime: function () {
        angular.noop()
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));

  beforeEach(inject(function (_$rootScope_, _$controller_,
    _LocalizationService_,
    _currentSalesCategoryService_,
    $translate, $filter, $http, $httpBackend,
    _$timeout_) {
    $rootScope = _$rootScope_;
    $rootScope.pdf = false;
    $scope = $rootScope.$new();
    http = $http;
    $controller = _$controller_;
    LocalizationService = _LocalizationService_;
    httpBackend = $httpBackend;
    TranslateMock = $translate;
    FilterMock = $filter;
    $timeout = _$timeout_;
    currentSalesCategoryService = _currentSalesCategoryService_;
    spyOn(LocalizationService, 'getCurrentDateFormat');

    _.debounce = function (func) {
      return function () {
        func();
      }
    }
  }));

  it('should create controller and init values', function () {
    var controller = createController();

    expect(controller.isLoading).not.toBe(true);

    expect(controller.requestFailed).toBe(false);
  });

  xit('should data from api and set hours for vm when setoption called', function () {
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    httpBackend.whenGET('https://api.url/organizations').respond({});

    setRequestParams(['sales']);

    var controller = createController(6240, 56976, false, false, true, true);

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'sales').respond(getMockData('sales'));

    controller.setOption(_.findWhere(controller.options, {name:'average_sales'}) );

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);

    expect(controller.summedAverage).toBe(17304);

    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
  });

  xit('should test directive constructor with $rootScope.pdf set to true it should listen isloading and set $rootScope.pdfExportsLoaded', function () {
    $rootScope.pdf = true;
    $rootScope.pdfExportsLoaded = 0;
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));


    var controller = createController(6240, 56976, false, false, true, true);

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    setRequestParams(['conversion']);

    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'conversion').respond(getMockData('conversion'));
    expectGet(apiUrl + '/kpis/sales?groupBy=day_of_week', 'conversion').respond(getMockedDayTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=hour_of_day', 'conversion').respond(getMockedHourTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=aggregate', 'conversion').respond(getMockedTotal('conversion'));

    controller.setOption(_.findWhere(controller.options, {name:'conversion'}));

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);

    expect(controller.summedAverage).toBe(17304);

    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);

    var params = {
      api: {
        sizeColumnsToFit: function() {
          return;
        },
        setRowData: () => {
          return;
        },
        setColumnDefs: () => {
          return;
        },
        forEachNode: () => {
          return;
        }

      }
    };
    $timeout.flush();
    spyOn(params.api, 'sizeColumnsToFit').and.callThrough();

    controller.gridOptions.onGridReady(params);
    expect(params.api.sizeColumnsToFit).toHaveBeenCalled();
    $timeout.flush();
    expect($rootScope.pdfExportsLoaded).toEqual(1);
  });

  xit('should get organization parameters when group watch fire and selected option is traffic it should set hour data', function () {
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true);

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(17304);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
  });

  xit('should data from api and set hours for vm when setoption called for calculated metrics', function () {
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    setRequestParams(['conversion']);

    var controller = createController(6240, 56976, false, false, true, true);

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'conversion').respond(getMockData('conversion'));
    expectGet(apiUrl + '/kpis/sales?groupBy=day_of_week', 'conversion').respond(getMockedDayTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=hour_of_day', 'conversion').respond(getMockedHourTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=aggregate', 'conversion').respond(getMockedTotal('conversion'));


    controller.setOption(_.findWhere(controller.options, {name:'conversion'}));

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);

    expect(controller.summedAverage).toBe(17304);

    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
  });

  xit('should data from api and set hours for vm when setoption called if active calendar setting first day is mon so it should order days with starting day and if each day has different starting hour it should find the smallest hour and order with it', function () {
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    setRequestParams(['traffic']);

    LocalizationService.getCurrentCalendarFirstDayOfWeek = function () {
      return 1;
    };

    var controller = createController(1154, 56976, false, false, true, true, 9);

    $scope.$apply();

    httpBackend.flush();

    expect(controller.days[0].day).toBe(1);
    expect(controller.hours[0].hourData[0].hour).toBe(9);
    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(17304);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
  });

  xit('should set color class same as traffic for non traffic data', function () {
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales').respond(getMockData('sales'));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    httpBackend.whenGET('https://api.url/organizations').respond({});

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true);

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(17304);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);

    var d1 = angular.copy(controller.hours[0].hourData[0].dayValues[0]);

    setRequestParams(['sales']);

    $scope.$digest();

    $scope.$apply();

    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales').respond(getMockData('sales'));

    controller.setOption(_.findWhere(controller.options, {name:'average_sales'}) );

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(17304);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);

    var d2 = controller.hours[0].hourData[0].dayValues[0];
    expect(d1.colorClass).toBe(d2.colorClass);
  });

  xit('should order hour data for org has 24 hours active time and starting time is  day start', function () {
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales').respond(getMockData('sales'));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));
    httpBackend.whenGET('https://api.url/organizations').respond({});

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true);

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(17304);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
    expect(controller.hours[0].hourData[0].hour).toBe(0);
  });

  xit('should order hour data for org has 24 hours active time and starting time is not day start', function () {
    let activityHours = [0,1];
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales').respond(getMockData('sales', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic', activityHours));
    httpBackend.whenGET('https://api.url/organizations').respond({});

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true, 3);

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(1442);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
    expect(controller.hours[0].hourData[0].hour).toBe(0);
  });

  xit('should order hour data for org has activity hours with starting time', function () {
    let activityHours = [8,9, 10, 11];
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales', 'operatingHours=true').respond(getMockData('sales', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true, 8);

    httpBackend.whenGET('https://api.url/organizations').respond({});

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(2884);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
    expect(controller.hours[0].hourData[0].hour).toBe(8)
  });

  xit('should setSelectedMetricForPdfIfNotSet when it is pdf but not selected metrics set', function () {
    $rootScope.pdf = true;
    $rootScope.pdfExportsLoaded = 0;
    let activityHours = [8,9, 10, 11];
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales', 'operatingHours=true').respond(getMockData('sales', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true, 8);

    httpBackend.whenGET('https://api.url/organizations').respond({});

    $scope.$apply();

    httpBackend.flush();
    expect(controller.requestFailed).toBe(false);

    controller.activeOption = ['average_traffic'];
    controller.selectedMetrics = null;
    $timeout.flush();
    $scope.$apply();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(2884);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
    expect(controller.hours[0].hourData[0].hour).toBe(8)
  });

  xit('should handleWatchSalesCategories when salescategory set', function () {
    $rootScope.pdf = true;
    $rootScope.pdfExportsLoaded = 0;
    let activityHours = [8,9, 10, 11];
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'sales', 'operatingHours=true').respond(getMockData('sales', activityHours));
    expectGet(baseUrl + '1154/sites/56976?basePercentage=0.15&countType=enters', 'traffic', 'operatingHours=true').respond(getMockData('traffic', activityHours));

    setRequestParams(['traffic']);

    var controller = createController(1154, 56976, false, false, true, true, 8);

    httpBackend.whenGET('https://api.url/organizations').respond({});

    $scope.$apply();

    httpBackend.flush();
    expect(controller.requestFailed).toBe(false);

    controller.activeOption = ['average_traffic'];
    controller.selectedMetrics = null;
    $timeout.flush();
    $scope.$apply();

    expect(controller.requestFailed).toBe(false);
    expect(controller.summedAverage).toBe(2884);
    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
    expect(controller.hours[0].hourData[0].hour).toBe(8)
  });

  xit('should data from api and set hours for vm when setoption called for calculated metrics And also it should set isSalesMetricSelected and setting sales category should update data', function () {
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    setRequestParams(['conversion']);

    var controller = createController(6240, 56976, false, false, true, true);

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'conversion').respond(getMockData('conversion'));
    expectGet(apiUrl + '/kpis/sales?groupBy=day_of_week', 'conversion').respond(getMockedDayTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=hour_of_day', 'conversion').respond(getMockedHourTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=aggregate', 'conversion').respond(getMockedTotal('conversion'));


    controller.setOption(_.findWhere(controller.options, {name:'conversion'}));

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);

    expect(controller.isSalesMetricSelected).toBe(true);

    expect(controller.summedAverage).toBe(17304);

    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);

    spyOn(controller, 'loadMetricData').and.callThrough();

    controller.handleWatchSalesCategories({name: "Upgrade", id: 789, selected: true}, {});

    $scope.$digest();

    $scope.$apply();

    expect(controller.loadMetricData).toHaveBeenCalled();

    httpBackend.flush();

    expect(controller.requestFailed).toBe(false);

    expect(controller.isSalesMetricSelected).toBe(true);

    expect(controller.summedAverage).toBe(17304);

    expect(controller.hours[0].hourData[0].dayValues[0].summedData).toBe(103);
  });

  it('should call setSalesCategoriesSelection when org has sales categories', function () {
    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'traffic').respond(getMockData('traffic'));

    setRequestParams(['conversion']);

    spyOn(currentSalesCategoryService, 'readSelection').and.callThrough();

    var controller = createController(6240, 56976, false, false, true, true, 9, true);

    $scope.$digest();

    $scope.$apply();

    httpBackend.flush();

    expectGet(baseUrl + '6240/sites/56976?basePercentage=0.15&countType=enters', 'conversion').respond(getMockData('conversion'));
    expectGet(apiUrl + '/kpis/sales?groupBy=day_of_week', 'conversion').respond(getMockedDayTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=hour_of_day', 'conversion').respond(getMockedHourTotal('conversion'));
    expectGet(apiUrl + '/kpis/report?groupBy=aggregate', 'conversion').respond(getMockedTotal('conversion'));
    expect(currentSalesCategoryService.readSelection).toHaveBeenCalledWith('power-hours-widget');
  });

  function setRequestParams(kpiList) {
    $scope.getRequestParams = function () {
      return getParams(kpiList);
    };

    $scope.$digest();

    $scope.$apply();
  }

  function getParams(kpiList) {
    return {
      kpi: kpiList,//_.pluck(kpiList, 'displayType'),
      countType: 'enters',
      reportStartDate: '2015-01-01T00:00:00Z.000',
      reportEndDate: '2015-01-31T00:00:00Z.000',
      orgId: 6240,
      siteId: 80029997,
      // Hard-code basePercentage. It is required by the API, but the
      // exact value does not matter, because this widget does not use
      // the power_hour_ind fields in the response whose values
      // the parameter affects.
      percentage: 0.15
    };
  }

  function expectGet(urlSearch, metric, urlSearch2) {
    return httpBackend.when('GET', function (url) {
      return url.indexOf(urlSearch) !== -1 && url.indexOf(metric) !== -1 && (!urlSearch2 || url.indexOf(urlSearch2) !== -1);
    })
  }

  function createController(orgId, siteId, interior, labor, sales, operatingHours, businessDayStartHour, hasSalesCategories) {
    var controller = $controller('powerHoursWidgetController', {
      '$rootScope': $rootScope,
      '$scope': $scope,
      '$http': http,
      'apiUrl': apiUrl,
      'LocalizationService': LocalizationService,
      '$translate': TranslateMock,
      '$filter': FilterMock
    });

    var organization = {
      _id: '56bd07cf 938c0a2323f7e8dd',
      organization_id: orgId,
      name: 'Delta Downs Racetrack Casino and Hotel',
      portal_settings: { currency: '$' },
      subscriptions: {
        interior: interior,
        labor: labor,
        sales: sales
      }
    };

    var salesCategories = [{name: "Upgrade", id: 789, selected: false}, {name: "Upgrade2", id: 788, selected: false}];

    if(hasSalesCategories) organization.portal_settings.sales_categories = salesCategories;

    var site = {
      site_id: siteId,
      business_day_start_hour: businessDayStartHour
    };

    controller.dateRangeStart = moment('2015-01-01');
    controller.dateRangeEnd = moment('2015-01-31').endOf('day');
    controller.currentOrganization = organization;
    controller.operatingHours = true;
    controller.currentSite = site;
    controller.lowThreshold = 0.005;
    controller.$onInit();

    return controller;
  }

  var getMockDayData = function (day, time, hour, metric) {
    if (metric === undefined || metric === '') {
      metric = 'sales';
    }
    var data = {
      dow_name: day,
      organization_id: 1154,
      period_start_date: time,//'2016-08-14T10:00:00.000Z'
      hour_of_day: hour,
      period_traffic_percent: 1.05112766608838,
      power_hour_ind: true,
      site_id: 80029997,
      zone_id: 420971
    };
    data['total_' + metric] = '103';
    data['hourly_' + metric] = 54;
    return data;
  };

  function getMockedDayTotal(metric) {
    var dataList = [];
    _.each(dow_names, function (dayName) {
      var data = {
        organization_id: 1154,
        period_end_date: dayName,
        period_start_date: dayName,
        sales_amount: 1647147.46,
        sales_category_id: 0
      }
      data[metric] = 16.3426463273089;
      dataList.push(data);
    });
    return { 'result': dataList };
  }

  function getMockedHourTotal(metric) {
    var dataList = [];
    for (var i = 0; i < 24; i++) {
      var data = {
        organization_id: 1154,
        period_end_date: i,
        period_start_date: i,
        sales_amount: 1647147.46,
        sales_category_id: 0
      }
      data[metric] = 16.3426463273089;
      dataList.push(data);
    };
    return { 'result': dataList };
  }

  function getMockedTotal(metric) {
    var data = {
      organization_id: 1154,
      period_end_date: 1,
      period_start_date: 1,
      sales_amount: 1647147.46,
      sales_category_id: 0
    }
    data[metric] = 103;

    return { 'result': [data] };
  }

  function set24HourDataForDay(metric, dateStart, day, dayName, data) {
    for (var hour = 0; hour < 24; hour++) {
      var time = dateStart + day + 'T';
      if (hour < 10) {
        time += '0';
      }
      time += hour + ':00:00.000Z';
      data.push(getMockDayData(dayName, time, hour, metric))
    }
  }

  function setActivityHourDataForDay(metric, dateStart, day, dayName, activityHours, data) {
    _.each(activityHours, activityHour => {
      var time = dateStart + day + 'T';
      if (activityHour < 10) {
        time += '0';
      }
      time += activityHour + ':00:00.000Z';
      data.push(getMockDayData(dayName, time, activityHour, metric))
    });
  }

  function getMockData(metric, activityHours) {
    var data = [];
    var dateStart = '2016-08-';
    var day = 12;
    _.each(dow_names, function (dayName) {
      day += 1;
      if(!activityHours) set24HourDataForDay(metric, dateStart, day, dayName, data);
      else setActivityHourDataForDay(metric, dateStart, day, dayName, activityHours, data);
    });

    let result = [{
      metric: metric,
      hourData: data
    }];

    return { 'result': result };
  };
});

