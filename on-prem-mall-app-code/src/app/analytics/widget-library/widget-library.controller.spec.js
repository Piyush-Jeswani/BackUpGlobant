'use strict';

describe('WidgetLibraryController', function () {
  var $scope;
  var $rootScope;
  var $controller;
  var features;
  var widgetLibraryService;
  var currentUserMock;
  var organizationsMock;
  var $httpBackend, $q, $timeout, ObjectUtils;
  var apiUrl = 'https://api.url';

  var controller;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'trace');
    $provide.factory('$confirm', confirm);
    var stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        data: { isExportableAsPdf: true}
      }
    };
    $provide.value('$state', stateMock);
    $provide.factory('googleAnalytics', function ($q) {
      var trackUserEvent = jasmine.createSpy('trackUserEvent').and.callFake(function () {
        //do nothing just mock
      });
      return {
        trackUserEvent: trackUserEvent
      };
    });
  }));

  beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$httpBackend_, _$controller_, _widgetLibraryService_, _features_, _ObjectUtils_) {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_
    $controller = _$controller_;
    features = _features_,
      controller = null;
    widgetLibraryService = _widgetLibraryService_;
    $q = _$q_;
    $timeout = _$timeout_;
    $httpBackend = _$httpBackend_;
    ObjectUtils = _ObjectUtils_;
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
    var organizationMock = {
      organization_id: 1234,
      name: 'Test Org 1',
      portal_settings: 'test',
      subscriptions: {
        interior: true
      }
    };

    organizationsMock = [organizationMock];

    features.isEnabled = function (type) {
      return true;
    };

  }));

  describe('loadAvailableWidgetLibraries', function () {
    it('should do a correct query for http request to pull widgets', function () {
      expectWidgetLbraryQuery().respond(500);
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets).toEqual([]);
    });

    it('should have widgets list data  when there is widget data', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
    });
  });

  describe('widget duplicate Actions', function () {
    it('should duplicate the widget', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
      controller.duplicate(controller.widgets[0]);
      expect(controller.widgets.length).toEqual(4);
    });

    it('should duplicate the widget and save when save duplicate called', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
      controller.duplicate(controller.widgets[0]);
      expect(controller.widgets.length).toEqual(4);
      var widget = angular.copy(controller.widgets[0]);
      var widgetConfig = widgetLibraryService.buildWidgetConfig(widget, currentUserMock);
      var widgetResult = { config:widget, hidden:false };
      expectSaveNewWidgetQuery(widgetConfig).respond({ result: [widgetResult] });
      controller.saveDuplicatedWidget(widget);
      $timeout.flush();
      expect(widget.screenType).toEqual('saving');
      $httpBackend.flush();
      expect(widget.screenType).toEqual('main');
    });

    it('should duplicate the widget and handle error when save duplicate called', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
      controller.duplicate(controller.widgets[0]);
      expect(controller.widgets.length).toEqual(4);
      var widget = angular.copy(controller.widgets[0]);
      var widgetConfig = widgetLibraryService.buildWidgetConfig(widget, currentUserMock);
      expectSaveNewWidgetQuery(widgetConfig).respond(500);
      controller.saveDuplicatedWidget(widget);
      $timeout.flush();
      $httpBackend.flush();
      expect(widget.screenType).toEqual('error');
      expect(console.error).toHaveBeenCalledWith('save widget error', 500);
    });
  });

  describe('widget delete Actions', function () {
    it('should delete the widget and  remove it from the list', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
      var widgetResult = { config: angular.copy(controller.widgets[0]), hidden:false };
      expectDeleteWidgetQuery(controller.widgets[0]).respond({ result: [widgetResult] });
      controller.deleteWidget(controller.widgets[0]);

      $timeout.flush();
      $httpBackend.flush();
      expect(controller.widgets.length).toEqual(2);
    });

    it('should delete  widget handle the error and not remove the widget from the list', function () {
      expectWidgetLbraryQuery().respond(getWidgetsResult());
      instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      expect(controller.isLoading).toBeFalsy;
      expect(controller.allRequestsSucceeded).toBeTruthy;
      expect(controller.widgets.length).toEqual(3);
      expectDeleteWidgetQuery(controller.widgets[0]).respond(500);
      controller.deleteWidget(controller.widgets[0]);

      $timeout.flush();
      $httpBackend.flush();
      expect(controller.widgets.length).toEqual(3);
      expect(console.error).toHaveBeenCalledWith('delete widget error', 500);
    });
  });


  //TODO: Replace with real tests
  it('should return a test string', function () {
    //Place tests inside this if block
    if (features.isEnabled('widgetLibrary')) {

    }
  });

  function instantiateController() {

    controller = $controller('WidgetLibraryController', {
      '$scope': $scope,
      'organizations': organizationsMock,
      'currentUser': currentUserMock
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }

  function expectWidgetLbraryQuery() {
    return $httpBackend.expectGET(apiUrl + '/widget/');
  }

  function expectSaveNewWidgetQuery(widget) {
    return $httpBackend.when('POST', function(url) {
      return url.indexOf( apiUrl + '/widget')> -1;
    });
  }

  function expectDeleteWidgetQuery(widget) {
    return $httpBackend.expectDELETE(apiUrl + '/widget/' + widget._id);
  }

  function getWidgetsResult() {
    var widget1 = { config: getMockWidget('data-grid', 'widgetName1', '', '5891acb1f01125972d0f00ea') };
    widget1.hidden = widget1.config.hidden;
    widget1._id = widget1.config._id;
    var widget2 = { config: getMockWidget('graph', 'widgetName1', 'bar', '5891acb1f01125972d0f00eb') };
    widget2.hidden = widget1.config.hidden;
    widget2._id = widget2.config._id;
    var widget3 = { config: getMockWidget('graph', 'widgetName1', 'line', '5891acb1f01125972d0f00ec') };
    widget3.hidden = widget3.config.hidden;
    widget3._id = widget3.config._id;
    return { result: [widget1, widget2, widget3] };
  }

  function getMockWidget(widgetType, widgetName, chartType, id) {
    if (!id) {
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
          chartType: chartType, //can be bar or list
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

});
