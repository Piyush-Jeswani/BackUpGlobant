'use strict';

describe('addeditreport', function() {
  var $rootScope
  var $scope;
  var $compile;
  var controller;
  var currentUserMock;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function(_$rootScope_, $templateCache, _$compile_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();


    currentUserMock = {
      _id:1,
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

    $scope.currentUser = currentUserMock;

    var organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    $scope.organizations = [organizationMock];
    setMockWidgetData();
    $scope.activeReport = getNewReport(1, 1234, 'test pdf 11', 'pdf', 'month');
    $scope.mode = 'new';
    $scope.phase = 0;
    $scope.$apply();
    $scope.$digest();

    // Put an empty template to cache to prevent Angular from fetching it
    cacheTemplates($templateCache);

  }));

  describe('create', function() {
    it('should create and digest directive', function() {
      createDirective();
      expect(controller).not.toBeDefined;
    });


  });

  function createDirective() {
    var element = angular.element(
      '<addeditreport>' +
      ' current-user="currentUser"' +
      ' organizations="organizations"' +
      ' phase="phase"' +
      ' available-widgets="availableWidgets"' +
      ' report="activeReport"' +
      ' mode="mode"' +
      '<addeditreport>'
    );

    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('createReportController');
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

  function setMockWidgetData() {
    $scope.availableWidgets = [
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
  }

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/reports/modals/create-report/create-report.partial.html',
      '<div></div>'
    );
  }
});
