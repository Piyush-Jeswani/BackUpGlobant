'use strict';

describe('WhatifCtrl', function () {
  var currentOrganizationMock = {},
  currentSiteMock = {},
  $scope,
  $controller,
  $timeout,
  $window,
  $filter,
  $q,
  $state,
  $stateParams,
  retailOrganizationSummaryData,
  ExportService,
  utils,
  ObjectUtils,
  metricConstants,
  customDashboardService,
  dateRangeService,
  variableParam,
  variableMetrics,
  metricNameService,
  metricConstants,
  variableParam,
  variableMetrics,
  LocalizationService;

  var currentUserMock = {
    localization: { date_format: 'MM/DD/YYYY' }
  };

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function(
    $rootScope,
    _$controller_,
    _$state_,
    _ObjectUtils_,
    _retailOrganizationSummaryData_,
    _$q_,
    _$timeout_,
    _metricNameService_,
    _LocalizationService_,
    _metricConstants_,
    _variableParam_,
    _variableMetrics_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    $timeout = _$timeout_;
    metricNameService = _metricNameService_;
    LocalizationService = _LocalizationService_;
    metricConstants = _metricConstants_;
    variableParam = _variableParam_;
    variableMetrics = _variableMetrics_;

    spyOn(metricNameService, "applyCustomMetricNames").and.callFake(function() {
      var deferred = $q.defer();
      deferred.resolve('applyCustomMetricNames');
      return deferred.promise;
    });

    spyOn(variableMetrics, "setIsEditing");
  }));

  describe('Controller initialization', function () {
    it('should call activate() and set defaults', function () {
      var controller = createController();
      var metricKeys = ['transactions', 'sales', 'ats', 'conversion', 'traffic', 'aur', 'upt', 'sps'];

      $scope.$apply();
      expect(controller.currentOrganization).toEqual(currentOrganizationMock);
      expect(controller.allKpis).toEqual(metricKeys);
      expect(metricNameService.applyCustomMetricNames).toHaveBeenCalled();
    });
  });

  describe('Controller should set all variableMetrics status', function () {
    it('should set variableMetrics isEditing', function () {
      var controller = createController();
      controller.onFocus(true);
      expect(variableMetrics.setIsEditing).toHaveBeenCalled();
    })
  });


  function createController() {
    return $controller('WhatifCtrl', {
      '$scope': $scope,
      '$window': $window,
      '$stateParams': $stateParams,
      'currentOrganization': currentOrganizationMock,
      'currentSite': currentSiteMock,
      'retailOrganizationSummaryData': retailOrganizationSummaryData,
      'currentUser': currentUserMock ,
      'ExportService': ExportService,
      'utils': utils,
      'ObjectUtils': ObjectUtils,
      'customDashboardService': customDashboardService,
      'dateRangeService': dateRangeService,
    });
  }

});
