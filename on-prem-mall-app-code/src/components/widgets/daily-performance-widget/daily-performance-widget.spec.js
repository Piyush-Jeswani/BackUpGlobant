'use strict';

describe('dailyPerformanceWidgetDirective', function () {

  var $compile, $httpBackend, $scope, $q, $timeout, dayOfWeekDataService;
  var currentOrganizationMock;
  var mockOrganisationResource = {
    get: function(params) {
      angular.noop(params);
      var deferred = $q.defer();
      deferred.resolve({
        orgId: 1000
      });

      return {
        $promise: deferred.promise
      };
    }
  };

  var mockSiteResource = {
    get: function(params) {
      angular.noop(params);
      var deferred = $q.defer();
      deferred.resolve({
        orgId: 2000,
        siteId: 1000
      });

      return {
        $promise: deferred.promise
      };
    }
  };


  var apiUrl = 'https://api.url';

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('dayOfWeekDataService', getMockdayOfWeekDataService);
    $provide.value('OrganizationResource', mockOrganisationResource);
    $provide.value('SiteResource', mockSiteResource);

    $provide.factory('currencyService', function ($q) {
      var getCurrencySymbol = jasmine.createSpy('getCurrencySymbol').and.callFake(function () {
        return $q.when({
          currencySymbol: '$'
        });
      });

      return {
        getCurrencySymbol: getCurrencySymbol
      };
    });
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_,
    _$httpBackend_,
    _utils_,
    _$translate_,
    _$timeout_,
    _metricConstants_,
    _ObjectUtils_,
    _$q_,
    _OrganizationResource_,
    _dayOfWeekDataService_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $q = _$q_;

    $rootScope.pdf = true;

    dayOfWeekDataService = _dayOfWeekDataService_;

    $scope.hasLabor = true;
    $scope.hasSales = true;
    $scope.dateRange = {
      start: moment('2016-01-01'),
      end: moment('2016-01-31')
    };

    currentOrganizationMock = {
      organization_id: 1234
    };

    $httpBackend.whenGET('https://api.url/organizations/1234').respond(currentOrganizationMock);

    addMetricDisplayNames(_metricConstants_);
  }));


  describe('getMetricDisplayInformation', function() {

    it('should display all metrics if hasLabor is true', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      expect(dailyPerformanceWidget.metricDisplayInfo.length).toBe(6);
    });

    it('should display all metrics if hasLabor is true and orderBy traffic desc', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      dailyPerformanceWidget.tableData = [];
      dailyPerformanceWidget.tableData[0] = {'traffic': 100};

      dailyPerformanceWidget.orderBy('traffic');

      expect(dailyPerformanceWidget.metricDisplayInfo.length).toBe(6);
      expect(dailyPerformanceWidget.currentSort).toBe('traffic');
      expect(dailyPerformanceWidget.currentSortDirection).toBe('desc');
      expect(dailyPerformanceWidget.tableData[0].traffic).toEqual(100);
    });

    it('should display all metrics if hasLabor is true and orderBy dayOfWeekIndex asc', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      dailyPerformanceWidget.tableData = [];
      dailyPerformanceWidget.tableData[0] = {'dayOfWeekIndex': 'Tue'};

      dailyPerformanceWidget.orderBy('dayOfWeekIndex');

      expect(dailyPerformanceWidget.metricDisplayInfo.length).toBe(6);
      expect(dailyPerformanceWidget.currentSort).toBe('dayOfWeekIndex');
      expect(dailyPerformanceWidget.currentSortDirection).toBe('asc');
      expect(dailyPerformanceWidget.tableData[0].dayOfWeekIndex).toEqual('Tue');
    });

    it('should not display metrics that require labor if hasLabor is false', function() {
      $scope.hasLabor = false;

      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      expect(dailyPerformanceWidget.metricDisplayInfo.length).toBe(4);

      _.each(dailyPerformanceWidget.metricDisplayInfo, function(metricDisplayInfo) {
        var requiresLabor = _.contains(metricDisplayInfo.requiredSubscriptions, 'labor');
        expect(requiresLabor).toBe(false);
      });
    });

    it('should test no labor and no sales and so return from activate() prematurely', function() {
        var dailyPerformanceWidget = renderDirectiveAndDigestNoLaborNoSales();

        expect(dailyPerformanceWidget.siteHasLabor).toBe(false);
        expect(dailyPerformanceWidget.siteHasSales).toBe(false);
        expect(dailyPerformanceWidget.hasLabor).toBe(false);
        expect(dailyPerformanceWidget.hasSales).toBe(false);
        expect(dailyPerformanceWidget.loaded).toBe(true);
        expect(dailyPerformanceWidget.isLoading).toBe(false);
    });

    it('should set currentOrganization for currentSite', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigestSetCurrentOrg();

      expect(dailyPerformanceWidget.currentOrganization.organization_id).toBe(1234);
      expect(dailyPerformanceWidget.currentSite.siteId).toBe(1000);
      expect(dailyPerformanceWidget.numberFormatName).toBe('en-us');
    });
  });

  describe('getMetricInfo', function() {
    it('should assign sales, traffic, labor and transactions to the left chart', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      var leftChartMeasures = _.where(dailyPerformanceWidget.metricDisplayInfo, {chartLocation: 'left'});

      expect(leftChartMeasures.length).toBe(4);

      expect(_.findWhere(leftChartMeasures, {value: 'sales'})).toBeDefined();
      expect(_.findWhere(leftChartMeasures, {value: 'traffic'})).toBeDefined();
      expect(_.findWhere(leftChartMeasures, {value: 'labor'})).toBeDefined();
      expect(_.findWhere(leftChartMeasures, {value: 'transactions'})).toBeDefined();
    });

    it('should assign conversion and STAR to the right chart', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      var leftChartMeasures = _.where(dailyPerformanceWidget.metricDisplayInfo, {chartLocation: 'right'});

      expect(leftChartMeasures.length).toBe(2);

      expect(_.findWhere(leftChartMeasures, {value: 'conversion'})).toBeDefined();
      expect(_.findWhere(leftChartMeasures, {value: 'star'})).toBeDefined();
    });
  });

  describe('buildChartTitle', function() {
    it('should build the left chart title', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      $timeout.flush();

      var expectedTitle = 'kpis.shortKpiTitles.tenant_sales, ' +
       'kpis.shortKpiTitles.tenant_traffic, ' +
       'kpis.shortKpiTitles.tenant_labor & ' +
       'kpis.shortKpiTitles.tenant_transactions';

      expect(dailyPerformanceWidget.leftChartTitle).toBe(expectedTitle);
    });

    it('should build the right chart title', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      $timeout.flush();

      var expectedTitle = 'kpis.shortKpiTitles.tenant_conversion & ' +
       'kpis.shortKpiTitles.tenant_star';

      expect(dailyPerformanceWidget.rightChartTitle).toBe(expectedTitle);
    });
  });

  describe('setupWatch', function() {
    it('should load data if the day selection changes', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      spyOn(dayOfWeekDataService, 'getContributionDataForChart').and.callThrough();

      dailyPerformanceWidget.selectedDays = [
        { key: 'all', transkey: 'daySelector.ALLDAYS'}
      ];
      $scope.$digest();

      expect(dayOfWeekDataService.getContributionDataForChart).toHaveBeenCalled();
    });

    it('should load data if the sales categories change', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      dailyPerformanceWidget.selectedDays = [
        { key: 'all', transkey: 'daySelector.ALLDAYS'}
      ];
      $scope.$digest();

      spyOn(dayOfWeekDataService, 'getContributionDataForChart').and.callThrough();

      dailyPerformanceWidget.salesCategories = [
        { id: 1, name: 'test'}
      ];
      $scope.$digest();

      expect(dayOfWeekDataService.getContributionDataForChart).toHaveBeenCalled();
    });
  });

  describe('buildHightchartConfig', function() {
    it('should set and configure the right highchart', function() {
      var dailyPerformanceWidget = renderDirectiveAndDigest($scope.hasLabor);

      dailyPerformanceWidget.chartDataRight = {
        labels: ['Monday', 'Tuesday', 'Wednesday'],
        metricsWithData: ['kpis.shortKpiTitles.tenant_traffic', 'kpis.shortKpiTitles.tenant_labor'],
        series: [
          [10, 20, 10],
          [1, 2, 8]
        ]
      };

      dailyPerformanceWidget.chartRightConfig = dailyPerformanceWidget.buildHighchartConfig(dailyPerformanceWidget.chartDataRight);

      expect(dailyPerformanceWidget.chartRightConfig.series.length).toBe(2);

      expect(dailyPerformanceWidget.chartRightConfig.series[0].data[0]).toBe(10);
      expect(dailyPerformanceWidget.chartRightConfig.series[0].name).toBe('kpis.shortKpiTitles.tenant_traffic');

      expect(dailyPerformanceWidget.chartRightConfig.series[1].data[0]).toBe(1);
      expect(dailyPerformanceWidget.chartRightConfig.series[1].name).toBe('kpis.shortKpiTitles.tenant_labor');
    });
  });

  function getMockdayOfWeekDataService() {
    return {
      getContributionDataForChart: function(measures) {
        angular.noop(measures);
        var deferred = $q.defer();

        var chartData = {};

        deferred.resolve(chartData);

        return deferred.promise;
      },

      getDataForChart: function(measures) {
        angular.noop(measures);
        var deferred = $q.defer();

        var chartData = {};

        deferred.resolve(chartData);

        return deferred.promise;
      },

      getMetricContributionDataForTable: function(measures) {
        angular.noop(measures);
        var deferred = $q.defer();

        var chartData = {};

        deferred.resolve(chartData);

        return deferred.promise;
      }
    }
  }


  function renderDirectiveAndDigest(siteHasNoLabor) {
    var element = createDirectiveElement(siteHasNoLabor);

    if (siteHasNoLabor) {
      element = createDirectiveElement();
    }
    else {
      element = createDirectiveElementSiteHasNoLabor();
    }

    $compile(element)($scope);
    $scope.$digest();

    var vm = element.controller('dailyPerformanceWidget');

    vm.currentOrganization = {
      organization_id: 1234
    };
    vm.selectedCategories = [
      {id:0 , name : 'all'}
    ];
    return vm;
  }

  function renderDirectiveAndDigestNoLaborNoSales() {
    var element = createDirectiveElementSiteHasNoLaborNoSales();

    $compile(element)($scope);
    $scope.$digest();

    var vm = element.controller('dailyPerformanceWidget');

    vm.currentOrganization = {
      organization_id: 1234
    };
    vm.selectedCategories = [
      {id:0 , name : 'all'}
    ];
    return vm;
  }

  function renderDirectiveAndDigestSetCurrentOrg() {
    var element = createDirectiveElementSiteHasSetCurrentOrg();

    $compile(element)($scope);
    $scope.$digest();

    var vm = element.controller('dailyPerformanceWidget');

    vm.currentOrganization = {
      organization_id: 1234
    };
    vm.selectedCategories = [
      {id:0 , name : 'all'}
    ];
    return vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<daily-performance-widget ' +
      'org-id="1234" ' +
      'date-range="dateRange" ' +
      'current-user="user" ' +
      'has-sales="hasSales" ' +
      'has-labor="hasLabor"> ' +
      '  </daily-performance-widget>'
    );
  }

  function createDirectiveElementSiteHasNoLabor() {
    return angular.element(
      '<daily-performance-widget ' +
      'org-id="1234" ' +
      'date-range="dateRange" ' +
      'current-user="user" ' +
      'has-sales="hasSales" ' +
      'has-labor="hasLabor" ' +
      'site-has-labor="false" ' +
      'show-table="false" ' +
      'site-has-sales="true"> ' +
      '  </daily-performance-widget>'
    );
  }

  function createDirectiveElementSiteHasNoLaborNoSales() {
      return angular.element(
        '<daily-performance-widget ' +
        'org-id="1234" ' +
        'date-range="dateRange" ' +
        'current-user="user" ' +
        'has-labor="hasLabor" ' +
        'site-has-labor="false" ' +
        'show-table="false" ' +
        'site-has-sales="false"> ' +
        '  </daily-performance-widget>'
      );
  }

  function createDirectiveElementSiteHasSetCurrentOrg() {
    return angular.element(
      '<daily-performance-widget ' +
      'current-organization="1202" ' +
      'site-id="1777" ' +
      'org-id="1234" ' +
      'date-range="dateRange" ' +
      'current-user="user" ' +
      'has-labor="hasLabor" ' +
      'site-has-labor="false" ' +
      'show-table="false" ' +
      'site-has-sales="true"> ' +
      '  </daily-performance-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/daily-performance-widget/daily-performance-widget.partial.html',
      '<div></div>'
    );
  }

  function addMetricDisplayNames(metricConstants) {
    _.each(metricConstants.metrics, function(metric) {
      metric.displayName = metric.shortTranslationLabel;
    });
  }

});
