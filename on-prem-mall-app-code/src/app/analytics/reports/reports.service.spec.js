'use strict';

describe('reportsData', function () {
  var $httpBackend;

  var apiUrl;
  var reportsData;
  var currentUserMock;
  var orgId = 1234;
  var $timeout;
  var reportMock;
  var availableWidgetsMock;
  var dateRangeMock;
  var organizationMock;
  var organizationsMock;
  var ObjectUtils;
  var $location;
  var session;
  var provide;
  var generatePdf = true;
  var weekDays = {
    'sunday': 'weekdaysShort.sun',
    'monday': 'weekdaysShort.mon',
    'tuesday': 'weekdaysShort.tue',
    'wednesday': 'weekdaysShort.wed',
    'thursday': 'weekdaysShort.thu',
    'friday': 'weekdaysShort.fri',
    'saturday': 'weekdaysShort.sat'
  };

  beforeEach(function () {
    apiUrl = 'https://api.url';
    spyOn(console, 'error');
  });

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    provide = $provide;
    $provide.constant('generatePdf', generatePdf);
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('googleAnalytics',  function ($q) {
      var trackUserEvent = jasmine.createSpy('trackUserEvent').and.callFake(function () {
        //do nothing just mock
      });
      return {
        trackUserEvent: trackUserEvent
      };
    });
  }));

  beforeEach(inject(function (_$httpBackend_, _reportsData_, _$timeout_, _ObjectUtils_, _$location_, _session_) {
    $httpBackend = _$httpBackend_;
    reportsData = _reportsData_;
    $timeout = _$timeout_;
    ObjectUtils = _ObjectUtils_;
    $location = _$location_;
    session = _session_;
    currentUserMock = {
      _id: 1,
      username: 'test User',
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
      localization: {date_format: 'MM/DD/YYYY'}
    };

    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});

    reportMock = getNewReport(1, 'test pdf 11', 'pdf', 'month');
    availableWidgetsMock = getMockWidgetData();
    dateRangeMock = {
      start: moment.utc().startOf('day').subtract(1, 'day').startOf('day'),
      end: moment.utc().startOf('day').subtract(1, 'day').endOf('day')
    };

    organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    organizationsMock = [organizationMock];
  }));


  describe('loadReports', function () {
    it('should do a correct query for the user', function () {
      expectQuery().respond(500);
      reportsData.loadReports(currentUserMock, organizationsMock);
      $httpBackend.flush();
    });

    it('should transform data for user when it has data', function () {
      expectQuery().respond( {result:reportsMockPDF});
      reportsData.loadReports(currentUserMock, organizationsMock) .then(function (response){
        expect(response[0].name).toEqual('test pdf 1');
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should return all reports for super user when it has data', function () {
      var reports = [ getReportToSchedule(1, 'test pdf 11', 'pdf', 'month', orgId),getReportToSchedule(1, 'test pdf 12', 'pdf', 'month', 5)];
      var user = angular.copy(currentUserMock);
      user.superuser = true;
      expectQuery().respond( {result:reports});
      reportsData.loadReports(user, organizationsMock) .then(function (response){
        expect(response[0].name).toEqual('test pdf 11');
        expect(response.length).toEqual(2);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should return only reports that user can access when it has data', function () {
      var reports = [
        getReportToSchedule(1, 'test pdf 11', 'pdf', 'month', orgId),
        getReportToSchedule(1, 'test pdf 12', 'pdf', 'month', 5),
        getReportToSchedule(1, 'test pdf 12', 'pdf', 'month', 5),
        getReportToSchedule(2, 'test pdf 12', 'pdf', 'month', 5),
        getReportToSchedule(2, 'test pdf 12', 'pdf', 'month', 6)
      ];
      var user = angular.copy(currentUserMock);
      user.superuser = false;
      expectQuery().respond( {result:reports});
      reportsData.loadReports(user, organizationsMock) .then(function (response){
        expect(response[0].name).toEqual('test pdf 11');
        expect(response.length).toEqual(5);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should transform empty list data for org when it has not got valid data', function () {
      expectQuery().respond( {result:null});
      reportsData.loadReports( currentUserMock, organizationsMock) .then(function (response){
        expect(response).toEqual([]);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('deleteReports', function () {
    it('should do a correct query', function () {
      expectDeleteReportsQuery().respond(500);
      reportsData.deleteReports();
      $httpBackend.flush();
    });

    it('should transform data  when it succesfully deletes all reports', function () {
      expectDeleteReportsQuery().respond( true);
      reportsData.deleteReports() .then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('updateReport', function () {
    it('should do a correct query', function () {
      var report = getNewReport(1, 'test pdf 11', 'pdf', 'month');
      expectUpdateReportQuery(report).respond(500);
      reportsData.updateReport(report);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      var report = getNewReport(1, 'test pdf 11', 'pdf', 'month');
      expectUpdateReportQuery(report).respond( {result:[report]});
      reportsData.updateReport(report) .then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('saveNewReports', function () {
    it('should do a correct query', function () {
      var report = getNewReport(1, 'test pdf 11', 'pdf', 'month');
      expectSaveNewReportQuery(report).respond(500);
      reportsData.saveNewReport(report);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      var report = getNewReport(1, 'test pdf 11', 'pdf', 'month');
      expectSaveNewReportQuery(report).respond( {result:[report]});
      reportsData.saveNewReport(report) .then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should save schedule handle error whet it fails for the report', function () {
      var report = getReportToSchedule(1, 'test pdf 11', 'pdf', 'month');
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, [organizationMock], currentUserMock);
      var reportResult = angular.copy(report);
      reportResult.scheduleId = 'ab';
      expectSaveScheduleQuery(report).respond(500);
      reportsData.saveSchedule(report, dateRange, organizationMock, true, weekDays, availableWidgetsMock, 'perimeter', 'day');

      $httpBackend.flush();
      $timeout.flush();
      expect(console.error).toHaveBeenCalledWith('saveSchedule error', 500);
    });

    it('should save schedule transform data  when it has data for pdf report', function () {
      var report = getReportToSchedule(1, 'test pdf 11', 'pdf', 'month');
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, [organizationMock], currentUserMock);
      var reportResult = angular.copy(report);
      reportResult.scheduleId = 'ab';
      expectSaveScheduleQuery(report).respond( {result:[reportResult]});
      reportsData.saveSchedule(report, dateRange, organizationMock, true, weekDays, availableWidgetsMock, 'perimeter', 'day') .then(function (response){
        expect(result.data.result[0] ).toEqual(reportResult);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should save schedule transform data  when it has data for pdf report for existing schedule', function () {
      var report = getReportToSchedule(1, 'test pdf 11', 'pdf', 'month');
      report.scheduleId = 'ab';
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, [organizationMock], currentUserMock);
      var reportResult = angular.copy(report);
      expectSaveScheduleQuery(report).respond( {result:[reportResult]});
      reportsData.saveSchedule(report, dateRange, organizationMock, true, weekDays, availableWidgetsMock, 'perimeter', 'day') .then(function (response){
        expect(result.data.result[0] ).toEqual(reportResult);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should save schedule transform data  when it has data for csv report', function () {
      var report = getReportToSchedule(1, 'test csv 11', 'csv', 'month');
      var dateRange = reportsData.getDateRangeFromReportPeriodType(report, [organizationMock], currentUserMock);
      var reportResult = angular.copy(report);
      reportResult.scheduleId = 'ab';
      expectSaveScheduleQuery(report).respond( {result:[reportResult]});
      reportsData.saveSchedule(report, dateRange, organizationMock, true, weekDays, availableWidgetsMock, 'perimeter', 'day') .then(function (response){
        expect(result.data.result[0] ).toEqual(reportResult);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('deleteReport', function () {
    it('should do a correct query', function () {
      var reportId = 'aasedre';
      expectDeleteReportQuery(reportId).respond(500);
      reportsData.deleteReport(reportId);
      $httpBackend.flush();
    });

    it('should transform data  when it succesfully deletes the report', function () {
      var reportId = 'aasedre';
      expectDeleteReportQuery(reportId).respond( true);
      reportsData.deleteReport(reportId).then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should delete schedules when deleting the report has scheduled', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');
      var reportId = 'aasedre';
      expectDeleteReportQuery(reportId).respond( true);
      expectDeleteScheduleQuery(report).respond( true);
      reportsData.deleteSchedule(report).then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });
      reportsData.deleteReport(reportId).then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should delete schedules when deleting the report has scheduled', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');
      var reportId = 'aasedre';
      expectDeleteReportQuery(reportId).respond( true);
      expectDeleteScheduleQuery(report).respond( 500);
      reportsData.deleteSchedule(report).then(function (response){
        expect(response.data).toEqual(false);
        expect(response.status).toEqual(500);
      });
      reportsData.deleteReport(reportId).then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
      expect(console.error).toHaveBeenCalledWith('deleteSchedule error',500);
    });

    it('should not delete schedules when deleting the report has not scheduled', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');
      report.scheduleId = null;
      var reportId = 'aasedre';
      expectDeleteReportQuery(reportId).respond( true);
      reportsData.deleteSchedule(report).then(function (response){
        expect(response.status).toEqual(500);
      });
      reportsData.deleteReport(reportId).then(function (response){
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
      expect(console.error).toHaveBeenCalledWith('deleteSchedule error report does not have scheduleId');
    });
  });

  describe('runReportToEmail', function () {
    it('should do a correct query', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');

      expectRunReportToEmailQuery(report).respond(500);
      reportsData.runReportToEmail(report);
      $httpBackend.flush();
    });

    it('should throw error if report doesnt have valid scheduled id', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');
      report.scheduleId = null;

      reportsData.runReportToEmail(report);
      expect(console.error).toHaveBeenCalledWith('report is not scheduled so cannot be run');
      $httpBackend.flush();
    });

    it('should transform data  when it succesfully deletes the report', function () {
      var report = getScheduledReport(1, 'test pdf 11', 'pdf', 'month');
      expectRunReportToEmailQuery(report).respond( true);
      reportsData.runReportToEmail(report).then(function (response){
        expect(response.data.name).not.toBe('');
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('exportReportToPdf', function () {
    it('should do a correct query', function () {
      expectExportReportToPdfQuery(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).respond(500);
      reportsData.exportReportToPdf(reportMock, dateRangeMock, availableWidgetsMock, organizationMock);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      expectExportReportToPdfQuery(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).respond( {result:[reportMock]});
      reportsData.exportReportToPdf(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should transform data  when it has data when not to generate pdf', function () {
      expectExportReportToPdfQuery(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).respond( {result:[reportMock]});
      reportsData.exportReportToPdf(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('exportReportToPdf without generatePdf', function () {
    it('should transform data and call window open with baseurl when it has data and generatePdf is false ', function () {
      expectExportReportToPdfQuery(reportMock, dateRangeMock, availableWidgetsMock, organizationMock).respond( {result:[reportMock]});
      reportsData.exportReportToPdf(reportMock, dateRangeMock, availableWidgetsMock, organizationMock, false).then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

  });

  describe('exportReportToCSV', function () {
    it('should do a correct query', function () {
      expectExportReportToCSVQuery().respond(500);
      reportsData.doCSVExport(reportMock, dateRangeMock, availableWidgetsMock);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      expectExportReportToCSVQuery().respond( {result:[reportMock]});
       reportsData.doCSVExport(reportMock, dateRangeMock, availableWidgetsMock).then(function (response){
        expect(result.data.result[0] ).toEqual(report);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

  });

  function getSummaryKey(widget) {
    if(widget.widgetType === 'graph' ) {

    }
    return 'table-grid-widget';
  }

  function buildPdfUrl(report) {
    var widgetData = {
      userId: report.userId,
      reportId: report.reportId
    };

    var url = $location.absUrl().split('#')[0] + '#/pdf/';

    var encodedWidgetData = encodeURIComponent(JSON.stringify(widgetData));

    return {
      fullPdfUrl: encodeURIComponent(url) + encodedWidgetData,
      basePdfUrl: url,
      encodedWidgetData: encodedWidgetData
    };
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

  function getNewReport(userId, name, report_type, period_type, org_Id) {
    if(!org_Id) {
      org_Id = orgId;
    }
    return {
      _id:'dsfdffdgfh',
      userId:userId,
      name: name,
      report_type: report_type,
      organization_id: org_Id,
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
        upload:{
          has_upload: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
        download:{
          has_download: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
      },
      frequency:{
        repeats: false,
        type: '',
        secondary: ''
      },
    }

  }

  function getScheduledReport(userId, name, report_type, period_type, orgId) {
    var report = getNewReport(userId, name, report_type, period_type, orgId);
    report.is_scheduled = true;
    report.scheduleId = 'a';
    return report;
  }

  function getReportToSchedule(userId, name, report_type, period_type, org_Id) {
    var report = getNewReport(userId, name, report_type, period_type, org_Id);
    report.is_scheduled = true;
    report.frequency = {
      repeats: true,
      type: 'day',
      secondary: '',
      time: {
        hour: '00',
        minute: '00',
        type: 'AM',
        timeZone: 'GMT'
      },
      messages: 'test'
    };
    report.email = {
      has_email: true,
      to: 'to@test.com',
      cc: 'to@test.com',
      bcc: 'to@test.com'
    }
    return report;
  }

  /**
  * makes widget list to pass to create pdf from them
  * @param {object} report to find widget ids
  * @param {Array} availableWidgets to find widgets in report widgets
  * @return {Array} widget list to create pdf
  */
  function getWidgets(report, availableWidgets) {
    var widgets = [];
    _.each(report.widget_ids, function (id) {
      var widget = _.findWhere(availableWidgets, { _id: id });
      if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(widget)) {
        widgets.push(widget);
      }
    });
    return widgets;
  }

  var reportsMockPDF = [
    {
      userId:1,
      name: 'test pdf 1',
      report_type: 'pdf',
      organization_id: orgId,
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
        upload:{
          has_upload: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
        download:{
          has_download: false,
          server: '',
          path: '',
          port: '',
          user_name: '',
          password: ''
        },
      },
      frequency:{
        repeats: false,
        type: '',
        secondary: ''
      },
    }
  ];

  function expectExportReportToPdfQuery(report, dateRange, availableWidgets, org) {
    var pdfInfo = buildPdfUrl(report);

    return $httpBackend.when('GET', function(url) {
      return url.indexOf( pdfInfo.fullPdfUrl) !== -1;
    })
  }

  function expectExportReportToCSVQuery() {
    return $httpBackend.when('GET', function(url) {
      return url.indexOf( apiUrl + '/kpis/report?dateRangeType') !== -1;
    })
  }

  function expectSaveNewReportQuery(report) {
    return $httpBackend.expectPOST( apiUrl + '/report/',{
      config_object: report
    });
  }

  function expectSaveScheduleQuery(report) {
    if(!ObjectUtils.isNullOrUndefined(report.scheduleId)) {
      return $httpBackend.when('PUT', function(url) {
        return url.indexOf( apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId) !== -1;
      })
    }
    return $httpBackend.when('POST', function(url) {
      return url.indexOf( apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports') !== -1;
    })
  }

  function expectUpdateReportQuery(report) {
    return $httpBackend.expectPUT( apiUrl + '/report/' + report._id,{
      config_object: report
    });
  }

  function expectRunReportToEmailQuery(report) {
    return $httpBackend.expectPOST( apiUrl + '/organizations/' + report.organization_id + '/scheduled-reports/' + report.scheduleId + '/execute');
  }

  function expectDeleteReportQuery(reportId) {
    return $httpBackend.expectDELETE( apiUrl + '/report/'+ reportId);
  }

  function expectDeleteScheduleQuery(report) {
    return $httpBackend.when('DELETE', function(url) {
      return url.indexOf( apiUrl +'/scheduled-reports/' + report.scheduleId) !== -1;
    })
  }

  function expectDeleteReportsQuery() {
    return $httpBackend.expectDELETE( apiUrl + '/reports');
  }

  function expectQuery() {
    return $httpBackend.expectGET( apiUrl + '/report');
  }

  function expectWidgetLbraryQuery() {
    return $httpBackend.expectGET( apiUrl + '/widget/');
  }
});
