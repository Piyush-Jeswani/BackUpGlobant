'use strict';

describe('createReportController', function () {
  var $scope;
  var $rootScope;
  var $http;
  var $httpBackend;
  var $controller;
  var features;
  var currentUserMock;
  var organizationsMock;
  var $q;
  var apiUrl = 'https://api.url';
  var $timeout;
  var reportsData;
  var $element;
  var reportsMock;
  var $rootScope;
  var $modal;
  var controller;
  var ObjectUtils;
  var LocalizationService, ExportService, localStorageService, csvExportConstants, datePeriods;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);

    spyOn(console, 'error');
    $provide.factory('googleAnalytics', function ($q) {
      var trackUserEvent = jasmine.createSpy('trackUserEvent').and.callFake(function () {
        //do nothing just mock
      });
      return {
        trackUserEvent: trackUserEvent
      };
    });
  }));

  beforeEach(inject(function (
    _$rootScope_,
    _$http_,
    _$httpBackend_,
    _$modal_,
    _$controller_,
    _features_,
    _$timeout_,
    _$q_,
    _reportsData_,
    _ObjectUtils_,
    _LocalizationService_,
    _ExportService_,
    _localStorageService_,
    _csvExportConstants_,
    _datePeriods_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $http = _$http_;
    $modal = _$modal_;
    ObjectUtils = _ObjectUtils_;
    reportsData = _reportsData_;
    $q = _$q_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    features = _features_;
    LocalizationService = _LocalizationService_;
    ExportService = _ExportService_;
    localStorageService = _localStorageService_;
    csvExportConstants = _csvExportConstants_;
    datePeriods = _datePeriods_;

    controller = null;
    currentUserMock = {
      _id: 1,
      username: 'test User',
      preferences: {
        calendar_id: 3,
        custom_dashboards: [],
        market_intelligence: {},
        custom_period_1: {
          period_type: 'custom'
        },
        custom_period_2: {
          period_type: 'custom'
        }
      },
      localization: { date_format: 'MM/DD/YYYY' }
    };

    $element = {
      find: function (id) {
        return { on: function (type, func) { return func } };
      }
    };

    var organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    organizationsMock = [organizationMock];
    $scope.currentUser = currentUserMock;
    $scope.organizations = organizationsMock;
    $scope.availableWidgets = getMockWidgetData();
    setMockReport();

    features.isEnabled = function (type) {
      return true;
    };
  }));

  it('should set report when controller created', function () {
    $scope.report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'month');
    $scope.mode = 'new';
    $scope.phase = 0;
    $scope.$apply();
    $scope.$digest();
    $timeout.flush();
    instantiateController();
    expect(controller.report.report_type).toEqual('pdf');
  });

  it('should save after setting phase1 parameters when it is not isscheduled and week period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', 'week');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'week',
      shortTranslationLabel: 'datePeriodSelector.WEEK',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    expect(controller.isDisabledSaveButton).toBe(false);
    controller.saveReport('#reportConfigModal');

    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save report and schedule after setting phase123 parameters when it is isscheduled and week period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', 'week');
    setPhase23($scope.report);
    $scope.mode = 'new';
    $scope.phase = 3;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();
    spyOn(reportsData, 'saveSchedule').and.callThrough();
    var reportResult = angular.copy(controller.report);
    reportResult._id = 'ab';
    var reportResult = angular.copy($scope.report);
    reportResult._id = 'adddf';

    expectSaveNewReportQuery(reportResult, true);
    expectSaveScheduleQuery(controller.report).respond({ result: [reportResult] });

    var period = {
      key: 'week',
      shortTranslationLabel: 'datePeriodSelector.WEEK',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');

    $timeout.flush();
    expect(reportsData.saveSchedule).toHaveBeenCalledWith(controller.report, controller.dateRange, controller.selectedOrgs[0],
      controller.operatingHours, controller.weekDays,
      controller.availableWidgets, controller.activeGroup,
      controller.groupBySetting
    );
    $httpBackend.flush();
    expect(controller.report.scheduleId).toEqual(reportResult._id);
  });

  it('should save report and schedule after setting phase123 parameters when it is isscheduled and week period handle saveschedule error', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', 'week');
    setPhase23($scope.report);
    $scope.mode = 'new';
    $scope.phase = 3;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();
    spyOn(reportsData, 'saveSchedule').and.callThrough();

    var reportResult = angular.copy($scope.report);
    reportResult._id = 'adddf';

    expectSaveNewReportQuery(reportResult, true);
    expectSaveScheduleQuery(controller.report).respond(500);

    var period = {
      key: 'week',
      shortTranslationLabel: 'datePeriodSelector.WEEK',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    $httpBackend.flush();
    expect(controller.report.scheduleId).toEqual(null);
    expect(controller.saveScheduleError).toBe(true);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and day period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'day',
      shortTranslationLabel: 'datePeriodSelector.DAY',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and month period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'month',
      shortTranslationLabel: 'datePeriodSelector.MONTH',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and year period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'year',
      shortTranslationLabel: 'datePeriodSelector.YEAR',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and quarter period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'quarter',
      shortTranslationLabel: 'datePeriodSelector.QUARTER',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and  week_to_date period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'week_to_date',
      shortTranslationLabel: 'datePeriodSelector. week_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and  month_to_date period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'month_to_date',
      shortTranslationLabel: 'datePeriodSelector.month_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and  quarter_to_date period', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $scope.$digest();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();

    var period = {
      key: 'quarter_to_date',
      shortTranslationLabel: 'datePeriodSelector.quarter_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();

    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(false);
    expect(reportsData.saveNewReport).toHaveBeenCalledWith(controller.report);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to false in success case', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectSaveNewReportQuery(report, true)

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    expect(controller.saveError).toBe(false);
  });

  it('should save after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to true in error case', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectSaveNewReportQuery(report, false)

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    expect(controller.saveError).toBe(true);

  });

  it('should save after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to true in error case when edit mode it hould update', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');

    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    controller.report = report;
    controller.mode = 'edit'
    expectSaveReportQuery(report, false)

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    expect(controller.saveError).toBe(true);

  });

  it('should save after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to false in error case when edit mode it hould update', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');

    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    controller.report = report;
    controller.mode = 'edit'
    expectSaveReportQuery(report, true)

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    expect(controller.saveError).toBe(false);

  });

  it('should download pdf after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to false in success case', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectExportReportToPdf(report, true)

    controller.downloadReport();
    $timeout.flush();
    expect(controller.exportError).toBe(false);
  });

  it('should download csv after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to true in error case', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectExportReportToPdf(report, false)

    controller.downloadReport();
    $timeout.flush();
    expect(controller.exportError).toBe(true);
  });

  it('should download csv after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to false in success case', function () {
    $scope.report = getNewReport(1, 1234, 'test csv 11', 'csv', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('csv');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test csv 11', 'csv', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectExportReportToCSV(report, true)

    controller.downloadReport();
    $timeout.flush();
    expect(controller.exportError).toBe(false);
  });

  it('should download csv after setting phase1 parameters when it is not isscheduled and  year_to_date period and should set saveError to true in error case', function () {
    $scope.report = getNewReport(1, null, 'test csv 11', 'csv', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('csv');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();
    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');
    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    expectExportReportToCSV(report, false)

    controller.downloadReport();
    $timeout.flush();
    expect(controller.exportError).toBe(true);
  });

  it('should save after setting all phase parameters when it is not isscheduled and  year_to_date period and should set saveError to true in error case when edit mode it should update', function () {
    $scope.report = getNewReport(1, null, 'test pdf 11', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('pdf');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    controller.unOrderedSelectedFrequencyChoices = [controller.frequencyChoices[0]];
    $scope.$digest();
    $timeout.flush();
    controller.nextPhase();

    var report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'year_to_date');

    report.widget_ids = ['1505721065401_5891acb1f01125972d0f00ed'];
    controller.report = report;
    controller.mode = 'edit'
    setPhase23(report);
    controller.nextPhase();
    expectSaveReportQuery(report, false)

    controller.saveReport('#reportConfigModal');
    $timeout.flush();
    expect(controller.saveError).toBe(true);

  });

  it('should prepare report for preview when  prepPreview called and should switch oof previewmode when endPreview', function () {
    $scope.report = getNewReport(1, null, 'test csv 11', 'csv', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    expect(controller.report.report_type).toEqual('csv');

    var period = {
      key: 'year_to_date',
      shortTranslationLabel: 'datePeriodSelector.year_to_date',
      selected: false
    };
    controller.unOrderedSelectedWidgets = [$scope.availableWidgets[0]];
    controller.selectedDatePeriod = [period];
    controller.selectedOrgs = [organizationsMock[0]];
    $scope.$digest();
    $timeout.flush();

    controller.prepPreview();
    expect(controller.previewWidgetsScreen).toBe(true);
    expect(controller.report.widget_ids).toEqual([$scope.availableWidgets[0]._id]);
    controller.endPreview();
    expect(controller.previewWidgetsScreen).toBe(false);
  });

  it('should not save report if not valid yet', function () {
    $scope.report = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'month');
    $scope.mode = 'new';
    $scope.phase = 0;
    $scope.$apply();
    $scope.$digest();
    $timeout.flush();
    instantiateController();
    controller.selectedOrgs = [organizationsMock[0]];
    expect(controller.report.report_type).toEqual('pdf');
    spyOn(reportsData, 'saveNewReport').and.callThrough();
    controller.saveReport('#reportConfigModal');
    expect(controller.isDisabledSaveButton).toBe(true);
    expect(reportsData.saveNewReport).not.toHaveBeenCalled;

  });

  it('should goback update phase ', function () {
    $scope.report = getNewReport(1, null, '', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();

    controller.goBack();
    expect(controller.phase).toEqual(0);
  });

  it('should searchTextChanged update rootScope searchTermTimezone ', function () {
    $scope.report = getNewReport(1, null, '', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();

    $rootScope.$broadcast('searchTextChanged', 'london');

    expect($rootScope.savedSearchterm).toEqual('london');
  });


  it('should goback update set phase to 1 and clear errors after save error ', function () {
    $scope.report = getNewReport(1, null, '', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();
    controller.saveScheduleError = true;
    controller.saveError = true;
    controller.phase = 3;

    controller.goBack();
    expect(controller.phase).toEqual(1);
    expect(controller.saveScheduleError).toBe(false);
  });

  it('should cancel update phase ', function () {
    $scope.report = getNewReport(1, null, '', 'pdf', '');
    $scope.mode = 'new';
    $scope.phase = 1;
    $scope.$apply();
    $scope.$digest();
    instantiateController();
    $timeout.flush();

    controller.cancel();
    expect(controller.phase).toEqual(0);
  });

  function setPhase23(report) {
    report.is_scheduled = true;
    report.email.has_email = true;
    report.email.to = 'to@yahoo.com';
    report.sftp.upload.has_upload = true;
    report.sftp.upload.server = 'server1';
    report.sftp.upload.path = 'path1'
    report.sftp.upload.port = 'port1'
    report.sftp.upload.user_name = ' user name1';
    report.sftp.upload.password = 'pass1';
    report.sftp.download.has_download = true
    report.sftp.download.server = 'server1';
    report.sftp.download.path = 'path1';
    report.sftp.download.port = 'port1';
    report.sftp.download.user_name = 'user1';
    report.sftp.download.password = 'pass1';
    report.frequency.repeats = true;
    report.frequency.type = 'month';
    report.frequency.secondary = 'first';
    report.frequency.time = {
      hour: '0',
      minute: '0',
      type: 'AM',
      timeZone: 'GMT'
    };
    report.frequency.messages = 'hello';
  }

  function getMockWidgetData() {
    var availableWidgets = [
      {
        '_id': '1505721065401_5891acb1f01125972d0f00ed', //id made from creator id and the unix second it was created
        'widgetType': 'data-grid', // data-grid or graph
        'widgetName': 'Example Widget', //any string
        'widgetDescription': 'A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation.A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation',
        'distributedOrgs': [ // a list of org id that the widget is avaliable for
          5210,
          5440,
          3068
        ],
        'columns': [	//kpi list for the data-grid only
          'traffic',
          'conversion',
          'sales'
        ],
        'controls': [ //a list of controls for the data grid only
          { 'name': 'filter' },
          { 'name': 'sorting' }
        ],
        'xAxis': 'week', //x axis group by for graph widget
        'yAxis': [ // a list of information for each metric added to the y-axis of the graph widget
          {
            'chartType': 'bar', //can be bar or list
            'selectedMetric': 'traffic', //kpi value
            'selectedPeriod': 'selectedPeriod', // can be selectedPeriod, priorPeriod, priorYear, customPeriod1, customPeriod2
          }
        ],
        'orgLevel': true, //can be true or false
        'overrideRange': 'month', //can be day, week, month, year, wtd, mtd, qtd, ytd or undefined (default will be undefined)
        'auditTrail': { //an object containing information around who created the widget, when and any information around when it was edited.
          'creator': '5891acb1f01125972d0f00ed',//creator userID
          'creatorName': 'Dean Hand',//full name of creator
          'creationDate': '2017-09-11T10:39:54.682Z',//date created
          'edits': [
            {
              'editedBy': 'Reside Orzoy',// full name of editor,
              'editorId': '6781eh1f01136572d0f00rb', //id of editor
              'editedOn': '2017-09-18T09:02:54.682Z',// date edited
              'editType': 'addedMetric' //translation key
            }
          ]
        }
      },
      {
        '_id': '1505748562452_5891acb1f01125972d0f00eg',
        'widgetType': 'data-grid',
        'widgetName': 'Example Widget',
        'widgetDescription': 'A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation.A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation',
        'distributedOrgs': [
          { 'organization_id': 5210 },
          { 'organization_id': 5440 },
          { 'organization_id': 3068 }
        ],
        'columns': [
          'traffic',
          'conversion',
          'sales'
        ],
        'rowTypeOrg': false,
        'overrideRange': 'month',
        'controls': [
          {
            name: 'Filter',
            selected: false,
            disabled: false
          }, {
            name: 'Sorting',
            selected: true,
            disabled: false
          }, {
            name: 'Column Resize',
            selected: false,
            disabled: false
          }, {
            name: 'Column Re-ordering',
            selected: true,
            disabled: false
          }
        ],
        'auditTrail': {
          'creator': '5891acb1f01125972d0f00ed',
          'creatorName': 'Dean Hand',
          'creationDate': '2017-09-11T10:39:54.682Z',
          'edits': []
        }
      },
      {
        '_id': '1505748562452_5891acb1f01125972d0f00ed',
        'widgetType': 'graph',
        'widgetName': 'My New Graph Widget',
        'widgetDescription': 'A nice little description',
        'overrideRange': 'wtd',
        'distributedOrgs': [
          { 'organization_id': 5326 },
          { 'organization_id': 8913 },
          { 'organization_id': 1092 },
          { 'organization_id': 5136 },
          { 'organization_id': 5455 },
          { 'organization_id': 6490 }
        ],
        'xAxis': 'Hour',
        'yAxis': [
          {
            'selectedMetric': 'traffic',
            'selectedPeriod': {
              'periodInfo': 'selectedPeriod'
            },
            'chartType': 'bar'
          },
          {
            'selectedMetric': 'dwelltime',
            'selectedPeriod': {
              'periodInfo': 'selectedPeriod'
            },
            'chartType': 'line'
          }, {
            'selectedMetric': 'traffic',
            'selectedPeriod': {
              'periodInfo': {
                'num_weeks': 4, 'period_type': 'custom'
              }
            },
            'chartType': 'bar'
          },
          {
            'selectedMetric': 'traffic',
            'selectedPeriod': {
              'periodInfo': {
                'num_weeks': 8, 'period_type': 'custom'
              }
            },
            'chartType': 'bar'
          },
          {
            'selectedMetric': 'dwelltime',
            'selectedPeriod': {
              'periodInfo': {
                'num_weeks': 4, 'period_type': 'custom'
              }
            },
            'chartType': 'line'
          }
        ],
        'auditTrail':
          {
            'creator': '5891acb1f01125972d0f00ed',
            'creatorName': 'Dean Hand',
            'creationDate': 'Sep 18, 2017',
            'edits': []
          }
      }
    ];
    return availableWidgets;
  }

  function setMockReport() {
    reportsMock = [
      {
        userId: 1,
        name: 'test pdf 1',
        report_type: 'pdf',
        organization_id: 1234,
        widget_ids: [],
        period_type: 'day',
        is_scheduled: false,
        email: {
          has_email: false,
          to: '',
          cc: '',
          bcc: ''
        },
        sftp: {
          upload: {
            has_upload: false,
            server: '',
            path: '',
            port: '',
            user_name: '',
            password: ''
          },
          download: {
            has_download: false,
            server: '',
            path: '',
            port: '',
            user_name: '',
            password: ''
          },
        },
        frequency: {
          repeats: true,
          type: 'weekly',
          secondary: 'mon',
          time: {
            hour: '0',
            minute: '0',
            type: 'AM',
            timeZone: 'GMT'
          },
          messages: 'hello'
        },
      },
      {
        userId: 1,
        name: 'test csv 1',
        report_type: 'csv',
        organization_id: 1234,
        widget_ids: [],
        period_type: 'week',
        is_scheduled: false,
        email: {
          has_email: false,
          to: '',
          cc: '',
          bcc: ''
        },
        sftp: {
          upload: {
            has_upload: false,
            server: '',
            path: '',
            port: '',
            user_name: '',
            password: ''
          },
          download: {
            has_download: false,
            server: '',
            path: '',
            port: '',
            user_name: '',
            password: ''
          },
        },
        frequency: {
          repeats: true,
          type: 'month',
          secondary: 'jan',
          time: {
            hour: '0',
            minute: '0',
            type: 'AM',
            timeZone: 'GMT'
          },
          messages: 'hello'
        },
      }
    ];

  }

  function getNewReport(userId, orgId, name, report_type, period_type) {
    return {
      userId: userId,
      name: name,
      report_type: report_type,
      organization_id: orgId,
      widget_ids: ['1505721065401_5891acb1f01125972d0f00ed'],
      period_type: period_type,
      is_scheduled: false,
      email: {
        has_email: false,
        to: '',
        cc: '',
        bcc: ''
      },
      sftp: {
        upload: {
          has_upload: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
        download: {
          has_download: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
      },
      frequency: {
        repeats: false,
        type: '',
        secondary: '',
        time: {
          hour: '0',
          minute: '0',
          type: 'AM',
          timeZone: 'GMT'
        },
        messages: 'hello'
      },
    }
  }

  function expectQuery() {
    return $httpBackend.expectGET(apiUrl + '/reports');
  }

  function expectSaveNewReportQuery(report, success) {
    reportsData.saveNewReport = function (report) {
      var deferred = $q.defer();
      if (success) { deferred.resolve({ data: { result: [report] } }); }
      else { deferred.reject('err'); }
      return deferred.promise;
    }
  }

  function expectSaveReportQuery(report, success) {
    reportsData.updateReport = function (report) {
      var deferred = $q.defer();
      if (success) { deferred.resolve(report); }
      else { deferred.reject('err'); }
      return deferred.promise;
    }
  }

  function expectSaveScheduleQuery(report) {
    if (!ObjectUtils.isNullOrUndefined(report.scheduleId)) {
      return $httpBackend.when('PUT', function (url) {
        return url.indexOf(apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId) !== -1;
      })
    }
    return $httpBackend.when('POST', function (url) {
      return url.indexOf(apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports') !== -1;
    })
  }

  function expectExportReportToPdf(report, success) {
    reportsData.exportReportToPdf = function (report, dateRange, availableWidgets, org) {
      var deferred = $q.defer();
      if (success) { deferred.resolve(report.name + '.pdf'); }
      else { deferred.reject('err'); }
      return deferred.promise;
    }
  }

  function expectExportReportToCSV(report, success) {
    reportsData.doCSVExport = function (report, dateRange, availableWidgets) {
      var deferred = $q.defer();
      if (success) { deferred.resolve(report.name + '.csv'); }
      else { deferred.reject('err'); }
      return deferred.promise;
    }
  }

  function instantiateController() {
    controller = $controller('createReportController', {
      '$rootScope': $rootScope,
      '$scope': $scope,
      '$http': $http,
      '$q': $q,
      '$element': $element,
      '$timeout': $timeout,
      'ObjectUtils': ObjectUtils,
      'reportsData': reportsData,
      'LocalizationService': LocalizationService,
      'ExportService': ExportService,
      'localStorageService': localStorageService,
      'csvExportConstants': csvExportConstants,
      'datePeriods': datePeriods
    });
    $scope.vm = controller;
  }

});
