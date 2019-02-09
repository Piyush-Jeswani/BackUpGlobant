'use strict';

describe('lineChartWidgetDirective', function () {
  var $compile;
  var $httpBackend;
  var utils;

  var $scope;
  var apiUrl = 'https://api.url';
  var lineChartWidget;
  var LocalizationService;
  var SubscriptionsService;
  var $translate;
  var metrics;
  var ObjectUtils;
  var currencyService;
  var currentOrganizationMock;
  var currentUserMock;
  var $q;
  var defaultCurrency = 'USD';

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module('shopperTrak.widgets.mock'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_,
    _$httpBackend_,
    _utils_,
    _LocalizationService_,
    _SubscriptionsService_,
    _$translate_,
    _metricConstants_,
    _ObjectUtils_,
    _currencyService_,
    _$q_) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    utils = _utils_;
    LocalizationService = _LocalizationService_;
    SubscriptionsService = _SubscriptionsService_;
    $translate = _$translate_;
    metrics = _metricConstants_;
    ObjectUtils = _ObjectUtils_;
    currencyService = _currencyService_;
    $q = _$q_;
    currentOrganizationMock = {
      organization_id: 1,
      portal_settings: { currency: '$' }
    };
    currentUserMock = {};
    $httpBackend.whenGET('https://api.url/organizations').respond(currentOrganizationMock);

    lineChartWidget = renderDirectiveAndDigest();
    spyOn(lineChartWidget, 'loadWidgetDefaults');
  }));

  describe('activate', function () {
    it('should load widget defaults if not provided', function () {
      expect(lineChartWidget.multiplier).toBe(1);
      expect(lineChartWidget.returnDataPrecision).toBe(0);
      expect(lineChartWidget.groupBy).toBe('day');
    });
  });

  describe('updateWidget', function () {
    it('should reset data variables', function () {
      expect(lineChartWidget.summaryData.length).toBe(3);
      expect(lineChartWidget.summaryData[0]).toBe(null);
      expect(lineChartWidget.chartData.series.length).toBe(3);
      expect(lineChartWidget.chartData.series[0].length).toBe(0);
    });
  });

  describe('getCommonRequestParams', function () {
    it('should load right parameters', function () {
      lineChartWidget.orgId = 1234;
      lineChartWidget.siteId = 567890;
      var params = lineChartWidget.getCommonRequestParams();
      expect(params.orgId).toBe(1234);
      expect(params.siteId).toBe(567890);
    });
  });

  describe('hasData', function () {
    it('should return false when data is not available', function () {
      lineChartWidget.chartData.series[0] = [];
      var status = lineChartWidget.hasData(0);
      expect(status).toBe(false);
    });
  });

  describe('calculateDelta', function () {
    it('should calculate correct delta', function () {
      var current = 375083;
      var compare = 402630;
      var delta = lineChartWidget.calculateDelta(current, compare);

      var manualCalculation = ((402630 - 375083) / 402630) * 100 * -1;
      expect(delta).toBe((manualCalculation));
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('lineChartWidget');
  }

  function createDirectiveElement() {
    return angular.element(
      '<line-chart-widget' +
      'org-id="1234"' +
      'site-id="56789"' +
      'date-range-start="dateRangeStart"' +
      'date-range-end="dateRangeEnd"' +
      'compare-range-1-start="compareRange1Start"' +
      'compare-range-1-end="compareRange1End"' +
      'compare-range-2-start="compareRange2Start"' +
      'compare-range-2-end="compareRange2End"' +
      'first-day-of-week-setting="1"' +
      'get-unique-returning="false"' +
      'separate-summary-requests="true"' +
      'summary-averages="true"' +
      'return-data-precision="1"' +
      'api-endpoint="kpis/fooKpi"' +
      'api-return-key="barKey"' +
      'show-metrics="false"' +
      'current-organization="currentOrganizationMock"' +
      'current-user="currentUserMock"' +
      '  </line-chart-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/line-chart-widget/line-chart-widget.partial.html',
      '<div></div>'
    );
  }

});
