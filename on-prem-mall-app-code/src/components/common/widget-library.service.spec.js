'use strict';

describe('widgetLibraryService', function () {
  var $httpBackend;

  var apiUrl;
  var widgetLibraryService;
  var currentUserMock;
  var orgId = 1234;
  var $timeout;
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
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('googleAnalytics', function ($q) {
      var trackUserEvent = jasmine.createSpy('trackUserEvent').and.callFake(function () {
        //do nothing just mock
      });
      return {
        trackUserEvent: trackUserEvent
      };
    });
  }));

  beforeEach(inject(function (_$httpBackend_, _widgetLibraryService_, _$timeout_, _ObjectUtils_, _$location_, _session_) {
    $httpBackend = _$httpBackend_;
    widgetLibraryService = _widgetLibraryService_;
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

    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});

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

  describe('loadAvailableWidgetLibraries', function () {
    it('should do a correct query', function () {
      expectWidgetLbraryQuery().respond(500);
      widgetLibraryService.loadAvailableWidgetLibraries(currentUserMock, organizationsMock);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      var widget1 = getMockWidget('data-grid', 'widgetName1', '5891acb1f01125972d0f00ea');
      var widget2 = getMockWidget('data-grid', 'widgetName1', '5891acb1f01125972d0f00ea');
      var result1 = widget1;
      result1.config = widget1;
      var result2 = widget2;
      result2.config = widget2;
      var result =[result1,result2];
      expectWidgetLbraryQuery().respond({result:result});
      widgetLibraryService.loadAvailableWidgetLibraries(currentUserMock, organizationsMock).then(function (response) {
        expect(response[0].widgetType).toEqual('data-grid');
        expect(response[0].hidden).toBeFalsy;
        expect(response[0].distributedOrgs).toEqual(organizationsMock);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should transform data  when it has empty data list', function () {
      expectWidgetLbraryQuery().respond({result:[]});
      widgetLibraryService.loadAvailableWidgetLibraries(currentUserMock, organizationsMock).then(function (response) {
        expect(response).toEqual([]);
      });

      $httpBackend.flush();
      $timeout.flush();
    });

    it('should transform empty list data  when it has not got valid data', function () {
      expectWidgetLbraryQuery().respond(null);
      widgetLibraryService.loadAvailableWidgetLibraries(currentUserMock, organizationsMock).then(function (response) {
        expect(response).toEqual([]);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('updateWidget', function () {
    it('should do a correct query', function () {
      var widget = angular.copy(availableWidgetsMock[0]);
      expectUpdateWidgetQuery(widget).respond(500);
      widgetLibraryService.updateWidget(widget);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      var widget = angular.copy(availableWidgetsMock[0]);
      expectUpdateWidgetQuery(widget).respond({ result: [widget] });
      widgetLibraryService.updateWidget(widget).then(function (response) {
        expect(result.data.result[0]).toEqual(widget);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('saveNewWidget', function () {
    it('should do a correct query', function () {
      var widget = getMockWidget('data-grid', 'test data grid 1');
      expectSaveNewWidgetQuery(widget).respond(500);
      widgetLibraryService.saveNewWidget(widget);
      $httpBackend.flush();
    });

    it('should transform data  when it has data', function () {
      var widget = getMockWidget('data-grid', 'test data grid 1');
      var widgetResult =angular.copy(widget);
      widgetResult.config = widget;
      expectSaveNewWidgetQuery(widget).respond({ result: [widgetResult] });
      widgetLibraryService.saveNewWidget(widget).then(function (response) {
        expect(result.data.result[0]).toEqual(widget);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  describe('deletewidget', function () {
    it('should do a correct query', function () {
      var widget = angular.copy(availableWidgetsMock[0]);
      expectDeleteWidgetQuery(widget).respond(500);
      widgetLibraryService.deleteWidget(widget);
      $httpBackend.flush();
    });

    it('should transform data  when it succesfully deletes the widget', function () {
      var widget = angular.copy(availableWidgetsMock[0]);
      expectDeleteWidgetQuery(widget).respond(true);
      widgetLibraryService.deleteWidget(widget).then(function (response) {
        expect(response.data).toEqual(true);
        expect(response.status).toEqual(200);
      });

      $httpBackend.flush();
      $timeout.flush();
    });
  });

  it('should build graph config', function () {
    var widget = getMockWidget('data-grid', 'widgetName1', '5891acb1f01125972d0f00ea');
    var widget2 = getMockWidget('graph', 'widgetName2', '5891acb1f01125972d0f00ed');
    var config1 = widgetLibraryService.buildWidgetConfig(widget, currentUserMock);
    var config2 = widgetLibraryService.buildWidgetConfig(widget2, currentUserMock);
    expect(config1.widgetType).toEqual('data-grid');
    expect(config2.widgetType).toEqual('graph');
    $httpBackend.flush();
  });

  function getMockWidgetData() {
    var availableWidgets = [getMockWidget(' data-grid', 'widgetName1', '5891acb1f01125972d0f00ea'), getMockWidget('graph', 'widgetName2', '5891acb1f01125972d0f00ed')];
    return availableWidgets;
  }

  function getMockWidget(widgetType, widgetName, id) {
    if(!id) {
      id = '1505721065401_5891acb1f01125972d0f00ed';
    }
    return {
      _id: id, //id made from creator id and the unix second it was created
      widgetType: widgetType, // data-grid or graph
      widgetName: widgetName, //any string
      widgetDescription: 'A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation.A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation. A widget that shows Traffic, Sales and Conversion summaries across an Organisation',
      distributedOrgs: organizationsMock,
      columns: [	//kpi list for the data-grid only
        'traffic',
        'conversion',
        'sales'
      ],
      controls: [ //a list of controls for the data grid only
        { name: 'filter' },
        { name: 'sorting' }
      ],
      xAxis: 'week', //x axis group by for graph widget
      yAxis: [ // a list of information for each metric added to the y-axis of the graph widget
        {
          chartType: 'bar', //can be bar or list
          selectedMetric: 'traffic', //kpi value
          selectedPeriod: 'selectedPeriod', // can be selectedPeriod, priorPeriod, priorYear, customPeriod1, customPeriod2
        }
      ],
      orgLevel: true, //can be true or false
      overrideRange: 'month', //can be day, week, month, year, wtd, mtd, qtd, ytd or undefined (default will be undefined)
      auditTrail: { //an object containing information around who created the widget, when and any information around when it was edited.
        creator: '5891acb1f01125972d0f00ed',//creator userID
        creatorName: 'Dean Hand',//full name of creator
        creationDate: '2017-09-11T10:39:54.682Z',//date created
        edits: [
          {
            editedBy: 'Reside Orzoy',// full name of editor,
            editorId: '6781eh1f01136572d0f00rb', //id of editor
            editedOn: '2017-09-18T09:02:54.682Z',// date edited
            editType: 'addedMetric' //translation key
          }
        ]
      },
      hidden: false
    };

  }

  function expectSaveNewWidgetQuery(widget) {
    return $httpBackend.expectPOST(apiUrl + '/widget', {
      config_object: widget
    });
  }

  function expectUpdateWidgetQuery(widget) {
    return $httpBackend.expectPUT(apiUrl + '/widget/'+ widget._id, {
      config_object: widget
    });
  }

  function expectDeleteWidgetQuery(widget) {
    return $httpBackend.expectDELETE(apiUrl + '/widget/' + widget._id);
  }

  function expectWidgetLbraryQuery() {
    return $httpBackend.expectGET(apiUrl + '/widget/');
  }
});
