'use strict';

describe('linechartDirective', function() {
  var $scope;
  var $compile;
  var LocalizationService;

  var ChartistMock;

  var mockUtils = {
    isExisty: function isExisty(value) {
      return value !== null && value !== undefined;
    },
    hasExistyElements: function hasExistyElements(elements) {
      return elements.some(mockUtils.isExisty);
    }
  };

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.charts'));
  // Override leaflet service with a mock
  beforeEach(module(function($provide) {
    $provide.provider('Chartist', function() {
      this.$get = function() {
        return ChartistMock;
      };
    });
    $provide.value('utils', mockUtils);
  }));
  beforeEach(inject(function($templateCache, $rootScope, _$compile_, _LocalizationService_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    LocalizationService = _LocalizationService_;

    ChartistMock = {
      Line: ChartistLineMock
    };

    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put('components/charts/chart.partial.html', '<div></div>');
  }));

  it('should initialize Chartist if proper data is supplied', function() {
    spyOn(ChartistMock, 'Line').and.callThrough();

    $scope.chartData = {
      labels: ['test', 'test', 'test', 'test'],
      series: [[1, 2, 3, 4]]
    };
    renderDirective();
    $scope.$digest();

    expect(ChartistMock.Line).toHaveBeenCalled();
  });

  it('should not initialize Chartist with empty labels array', function() {
    spyOn(ChartistMock, 'Line').and.callThrough();

    $scope.chartData = {
      labels: [],
      series: [[1, 2, 3, 4]]
    };
    renderDirective();
    $scope.$digest();

    expect(ChartistMock.Line).not.toHaveBeenCalled();
  });

  it('should not initialize Chartist if all of the series only contains nulls or undefineds', function() {
    spyOn(ChartistMock, 'Line').and.callThrough();

    $scope.chartData = {
      labels: ['label0', 'label1', 'label2', 'label3'],
      series: [[null, undefined, null, undefined]]
    };
    renderDirective();
    $scope.$digest();

    expect(ChartistMock.Line).not.toHaveBeenCalled();
  });

  function renderDirective() {
    var element = angular.element(
      '<linechart' +
      ' data="chartData">' +
      '</linechart>'
    );
    $compile(element)($scope);
  }

  function ChartistLineMock() {
    this.on = function() {};
  }
});
