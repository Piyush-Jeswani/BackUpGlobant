'use strict';

describe('ReportsController', function () {
  var $scope;
  var $rootScope;
  var $httpBackend;
  var $controller;
  var $compile;
  var features;
  var currentUserMock;
  var organizationsMock;
  var $q;
  var $state;
  var apiUrl = 'https://api.url';
  var $timeout;
  var reportsData;
  var $element;
  var reportsMock;
  var $rootScope;
  var $modal;
  var controller;
  var ObjectUtils;
  var datePeriods;
  var csvExportConstants;
  var currentOrganizationMock;
  var $mdDialog;
  var $rootElement;

  var confirm = function ($modal, $rootScope, $q, $translate) {
    return function (config) {
      var deferred = $q.defer();
      deferred.resolve(true);
      return deferred.promise;
    }
  };

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    spyOn(console, 'error');
    spyOn(console, 'warn');
    $provide.factory('$confirm', confirm);
    $provide.factory('googleAnalytics', function ($q) {
      var trackUserEvent = jasmine.createSpy('trackUserEvent').and.callFake(function () {
        //do nothing just mock
      });
      return {
        trackUserEvent: trackUserEvent
      };
    });
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_,
    _$httpBackend_,
    _$modal_,
    _$controller_,
    _features_,
    _$compile_,
    _$state_,
    _$timeout_,
    _$q_,
    _$mdDialog_,
    _$rootElement_,
    _reportsData_,
    _ObjectUtils_,
    _datePeriods_,
    _csvExportConstants_) {
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $state = _$state_;
    $modal = _$modal_;
    reportsData = _reportsData_;
    $q = _$q_;
    $timeout = _$timeout_;
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    features = _features_;
    ObjectUtils = _ObjectUtils_;
    datePeriods = _datePeriods_;
    $mdDialog = _$mdDialog_;
    $rootElement =  _$rootElement_;
    csvExportConstants = _csvExportConstants_;
    currentOrganizationMock = { organization_id: 1234 };

    controller = null;
    $state.params = { orgId: 1234 };

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
      localization: { date_format: 'MM/DD/YYYY' },
      superuser: true
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
    setMockReport();

    features.isEnabled = function (type) {
      return true;
    };
  }));

  describe('loadSchedules', function () {
    it('should do a correct query for the org and handle error', function () {
      expectQuery().respond(500);
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(false);
    });

    it('should transform data for org when it has data', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
    });

    it('should transform data as empty list for org when it has not got data', function () {
      expectQuery().respond(null);
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports).toEqual([]);
      expect(controller.reports.length).toBe(0);
    });

    it('should not have scheduledReports if feature is not enabled', function () {
      features.isEnabled = function (type) {
        return false;
      };
      instantiateController();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.reports).not.toBeDefined();
    });

    it('should transform data for org when it has data when refresh called', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      controller.refresh();
      expect(controller.isLoading).toBe(true);
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
    });
  });

  describe('delete Report', function () {
    it('should do a correct query for the report and remove deleted report from the list', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectDeleteReportQuery(controller.reports[0]._id).respond(200);
      expectDeleteScheduleQuery(controller.reports[0]).respond(200);
      controller.deleteReport(controller.reports[0]);
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.reports.length).toBe(1);
    });

    it('should do a correct query for the report and remove deleted report from the list and delte schedule', function () {
      setPhase23(reportsMock[0], 'a');
      setPhase23(reportsMock[1], 'b');
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.reports.length).toBe(2);

      expectDeleteReportQuery(controller.reports[0]._id).respond(200);
      expectDeleteScheduleQuery(controller.reports[0]).respond(200);
      controller.deleteReport(controller.reports[0]);
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.reports.length).toBe(1);
    });

    it('should not delete if report not defined', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      controller.deleteReport();

      expect(controller.reports.length).toBe(2);
      expect(confirm).not.toHaveBeenCalled;
    });

    it('should do a correct query for the report and handle error', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectDeleteReportQuery(controller.reports[0]._id).respond(500);
      controller.deleteReport(controller.reports[0]);
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.reports.length).toBe(2);
      expect(controller.deleteLoading).toBe(false);
      expect(controller.deleteFailed).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('delete Reports', function () {
    it('should do a correct query for the report and remove deleted reports from the list', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectDeleteReportsQuery().respond(200);
      controller.deleteAllReportsForUser();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.reports.length).toBe(0);
    });

    it('should do a correct query for the report and handle error', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectDeleteReportsQuery().respond(500);
      controller.deleteAllReportsForUser();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.reports.length).toBe(2);
      expect(controller.deleteLoading).toBe(false);
      expect(controller.deleteFailed).toBe(true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('sort Reports', function () {
    it('should sort data by report name', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
      controller.sortReports('name');
      expect(controller.reports[0].name).toEqual('test pdf 1');
    });

    it('should sort data by repeatInterval', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
      expect(controller.reports[0].period_type).toEqual('week');
      controller.sortReports('period_type');
      controller.sortReports('period_type');
      expect(controller.reports[0].period_type).toEqual('day');
      controller.sortReports('period_type');
      expect(controller.reports[0].period_type).toEqual('week');
    });

    it('should sort data by type', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
      expect(controller.reports[0].report_type).toEqual('csv');
      controller.sortReports('report_type');
      expect(controller.reports[0].report_type).toEqual('pdf');
    });

  });

  describe('events', function () {
    it('should add report into the reports if reportAdded', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      $rootScope.$broadcast('reportAdded', { report: getNewReport(1, 1234, 'test pdf 11', 'pdf', 'month') });
      expect(controller.reports.length).toBe(3);
    });

    it('should update phase when phaseUpdated', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      $rootScope.$broadcast('phaseUpdated', { phase: 1 });
      expect(controller.phase).toBe(1);
    });

    it('should update phase when phaseUpdated should clear activeReport.report_type in case new mode and phase <0', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      controller.mode = 'new';
      $rootScope.$broadcast('phaseUpdated', { phase: 0 });
      expect(controller.phase).toBe(0);
      expect(controller.activeReport.report_type).toBe('');
    });

    it('should update report when report updated event fired', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expect(controller.reports[0].name).toEqual('test csv 1');
      controller.activeReport = angular.copy(controller.reports[0]);
      $scope.$apply();
      var updatedReport = angular.copy(controller.reports[0]);
      updatedReport.name = 'test csv 1 updated';
      $rootScope.$broadcast('reportUpdated', { report: updatedReport });
      expect(controller.reports[0].name).toEqual(updatedReport.name);
    });

    it('should destroy events on destroy', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      $rootScope.$broadcast('$destroy');
      $scope.$digest();
      expect(controller.phase).not.toBeDefined;
    });
  });

  describe('PDF actions', function () {
    it('should download pdf for the report', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectExportReportToPdf(controller.reports[1], true)

      controller.downloadReport(controller.reports[1]);
      $timeout.flush();
      expect(controller.exportError).toBe(false);
    });

    it('should handle error if download pdf for the report fails', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectExportReportToPdf(controller.reports[1], false)

      controller.downloadReport(controller.reports[1]);
      $timeout.flush();
      expect(controller.exportError).toBe(true);
    });

    it('should toggle schedule for the report', function () {
      setPhase23(reportsMock[0]);
      setPhase23(reportsMock[1]);

      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      controller.reports[0].is_schedule_paused = false;
      var reportResult = angular.copy(controller.reports[0]);
      reportResult.disabled = true;
      reportResult.is_schedule_paused = true;
      expectSaveScheduleQuery(controller.reports[0]).respond({ result: [reportResult] });
      expectSaveReportQuery(controller.reports[0]).respond({ result: [reportResult] });
      controller.toggleReportScheduleEnabled(controller.reports[0]);
      $httpBackend.flush();
      expect(controller.toggleReportScheduleEnabledError).toBeFalsy;
      expect(controller.reports[0].is_schedule_paused).toBeTruthy;

      var reportResult = angular.copy(controller.reports[0]);
      reportResult.disabled = false;
      reportResult.is_schedule_paused = false;
      expectSaveScheduleQuery(controller.reports[0]).respond({ result: [reportResult] });
      expectSaveReportQuery(controller.reports[0]).respond({ result: [reportResult] });
      controller.toggleReportScheduleEnabled(controller.reports[0]);
      $httpBackend.flush();
      expect(controller.toggleReportScheduleEnabledError).toBeFalsy;
      expect(controller.reports[0].is_schedule_paused).toBeFalsy;
    });

    it('should toggle schedule for the report should not update report and handle error if saving schedule fails', function () {
      setPhase23(reportsMock[0]);
      setPhase23(reportsMock[1]);

      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      controller.reports[0].is_schedule_paused = false;
      var reportResult = angular.copy(controller.reports[0]);
      reportResult.disabled = true;
      reportResult.is_schedule_paused = true;
      expectSaveScheduleQuery(controller.reports[0]).respond(500);
      controller.toggleReportScheduleEnabled(controller.reports[0]);
      $timeout.flush();
      $httpBackend.flush();
      expect(controller.toggleReportScheduleEnabledError).toBeTruthy;
      expect(console.error).toHaveBeenCalled();
      expect(controller.reports[0].is_schedule_paused).toBeFalsy;
    });

    it('should toggle schedule for the report should not update report and handle error if saving schedule completes succesfully but not save report', function () {
      setPhase23(reportsMock[0], 'a');
      setPhase23(reportsMock[1], 'ab');

      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.reports.length).toBe(2);
      controller.reports[0].is_schedule_paused = false;
      var reportResult = angular.copy(controller.reports[0]);
      reportResult.disabled = true;
      reportResult.is_schedule_paused = true;
      expectSaveScheduleQuery(controller.reports[0]).respond({ result: [reportResult] });
      expectSaveReportQuery(controller.reports[0]).respond(500);
      controller.toggleReportScheduleEnabled(controller.reports[0]);
      $timeout.flush();
      $httpBackend.flush();
      expect(controller.toggleReportScheduleEnabledError).toBeFalsy;
      expect(controller.reports[0].is_schedule_paused).toBeFalsy;
      expect(controller.toggleReportScheduleEnabledError).toBeTruthy;
      expect(console.error).toHaveBeenCalled();
    });

    it('should runReportToEmail call api to run istantly the report and email should handle error', function () {
      setPhase23(reportsMock[0]);
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      controller.runReportToEmail(controller.reports[1]);
      $timeout.flush();
      expect(controller.runReportToEmailError).toBe(true);
    });

    it('should runReportToEmail call api to run istantly the report and email', function () {
      setPhase23(reportsMock[0], 'a');
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectRunReportToEmailQuery(controller.reports[1]).respond(200);
      controller.runReportToEmail(controller.reports[1]);
      $timeout.flush();
      $httpBackend.flush();
      expect(controller.runReportToEmailError).toBe(false);
    });
  })

  describe('CSV actions', function () {
    it('should download CSV for the report', function () {

      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);
      expectExportReportToCSV(controller.reports[0], true)

      controller.downloadReport(controller.reports[0]);
      $timeout.flush();
      expect(controller.exportError).toBe(false);
    });

    it('should handle error if download CSV for the report fails', function () {
      expectQuery().respond({ result: reportsMock });
      expectWidgetLbraryQuery().respond(getMockWidgetData());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBe(false);
      expect(controller.allRequestsSucceeded).toBe(true);
      expect(controller.reports.length).toBe(2);

      expectExportReportToCSV(controller.reports[0], false)

      controller.downloadReport(controller.reports[0]);
      $timeout.flush();
      expect(controller.exportError).toBe(true);
    });
  })

  it('should set report type as pdf', function () {
    expectQuery().respond({ result: reportsMock });
    expectWidgetLbraryQuery().respond(getMockWidgetData());
    instantiateController();
    $httpBackend.flush();
    $timeout.flush();
    expect(controller.isLoading).toBe(false);
    expect(controller.allRequestsSucceeded).toBe(true);
    expect(controller.reports.length).toBe(2);
    expect(controller.reports[0].name).toEqual('test csv 1');
    controller.setReportType('pdf');
    expect(controller.activeReport.report_type).toEqual('pdf');
    expect(controller.modalTitle).toEqual('scheduleReport.CREATENEWPDFREPORT');
  });

  it('should set report type as csv', function () {
    expectQuery().respond({ result: reportsMock });
    expectWidgetLbraryQuery().respond(getMockWidgetData());
    instantiateController();
    $httpBackend.flush();
    $timeout.flush();
    expect(controller.isLoading).toBe(false);
    expect(controller.allRequestsSucceeded).toBe(true);
    expect(controller.reports.length).toBe(2);
    expect(controller.reports[0].name).toEqual('test csv 1');
    controller.setReportType('csv');
    expect(controller.activeReport.report_type).toEqual('csv');
    expect(controller.modalTitle).toEqual('scheduleReport.CREATENEWCSVREPORT');
  });

  it('should set active report when editreport called for csv', function () {
    expectQuery().respond({ result: reportsMock });
    expectWidgetLbraryQuery().respond(getMockWidgetData());
    instantiateController();
    $httpBackend.flush();
    $timeout.flush();
    expect(controller.isLoading).toBe(false);
    expect(controller.allRequestsSucceeded).toBe(true);
    expect(controller.reports.length).toBe(2);
    expect(controller.reports[0].name).toEqual('test csv 1');
    controller.editReport(controller.reports[0]);
    expect(controller.activeReport).toEqual(controller.reports[0]);
    expect(controller.mode).toEqual('editReport');
    expect(controller.phase).toEqual(1);
    expect(controller.modalTitle).toEqual('scheduleReport.EDITCSVREPORT');
  });

  it('should set active report when editreport called for pdf', function () {
    expectQuery().respond({ result: reportsMock });
    expectWidgetLbraryQuery().respond(getMockWidgetData());
    instantiateController();
    $httpBackend.flush();
    $timeout.flush();
    expect(controller.isLoading).toBe(false);
    expect(controller.allRequestsSucceeded).toBe(true);
    expect(controller.reports.length).toBe(2);
    expect(controller.reports[0].name).toEqual('test csv 1');
    controller.editReport(controller.reports[1]);
    expect(controller.activeReport).toEqual(controller.reports[1]);
    expect(controller.mode).toEqual('editReport');
    expect(controller.phase).toEqual(1);
    expect(controller.modalTitle).toEqual('scheduleReport.EDITPDFREPORT');
  });

  it('should set active report as new one when setode called with new', function () {
    expectQuery().respond({ result: reportsMock });
    expectWidgetLbraryQuery().respond(getMockWidgetData());
    instantiateController();
    $httpBackend.flush();
    $timeout.flush();
    expect(controller.isLoading).toBe(false);
    expect(controller.allRequestsSucceeded).toBe(true);
    expect(controller.reports.length).toBe(2);
    expect(controller.reports[0].name).toEqual('test csv 1');
    controller.setMode('new', 0);
    expect(controller.activeReport.name).toEqual('');
    expect(controller.mode).toEqual('new');
    expect(controller.phase).toEqual(0);
  });

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
        _id: 'a',
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
          repeats: false,
          type: '',
          secondary: ''
        },
      },
      {
        _id: 'b',
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
          repeats: false,
          type: '',
          secondary: ''
        },
      }
    ];

  }

  function setPhase23(report, scheduleId) {
    if (scheduleId) {
      report.scheduleId = scheduleId;
    }
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
        secondary: ''
      },
    }

  }

  function expectQuery() {
    return $httpBackend.expectGET(apiUrl + '/report');
  }

  function expectDeleteScheduleQuery(report) {
    return $httpBackend.when('DELETE', function (url) {
      return url.indexOf(apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId) !== -1;
    })
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

  function expectSaveReportQuery(report) {
    return $httpBackend.when('POST', function (url) {
      return url.indexOf(apiUrl + '/report/') !== -1;
    })
  }

  function expectWidgetLbraryQuery() {
    return $httpBackend.expectGET(apiUrl + '/widget/');
  }

  function expectDeleteReportsQuery() {
    return $httpBackend.expectDELETE(apiUrl + '/reports');
  }

  function expectDeleteReportQuery(reportId) {
    return $httpBackend.expectDELETE(apiUrl + '/report/' + reportId);
  }

  function expectRunReportToEmailQuery(report) {
    return $httpBackend.expectPOST(apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId + '/execute');
  }

  function expectDeleteScheduleQuery(report) {
    return $httpBackend.when('DELETE', function (url) {
      return url.indexOf(apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId) !== -1;
    })
  }

  function instantiateController() {
     controller =  createDirectiveElement() ;

     $scope.vm = controller;
  }

  function createDirectiveElement() {
    $scope.organizations = organizationsMock;
    $scope.currentUser = currentUserMock;
    $scope.currentOrganization = currentOrganizationMock;
    $scope.organizations = organizationsMock;
    $scope.sites = [];
    let element = angular.element(
      ' <reports-collections' +
      ' current-user="currentUser"' +
      ' current-organization="currentOrganization"' +
      ' organizations="organizations" sites="sites">' +
      ' </reports-collections>'
    );
    $compile(element)($scope);
    $scope.$digest();

    return element.controller('reportsCollections');
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/analytics/reports/reports.partial.html',
      '<div></div>'
    );
  }
});
