'use strict';

describe('dataTableConfigController', function () {
  var $scope;
  var $rootScope;
  var $controller;
  var widgetLibraryService;
  var currentUserMock;
  var organizationsMock;
  var $httpBackend, $q, $timeout, ObjectUtils;
  var apiUrl = 'https://api.url';

  var controller;
  var customDashboardConstants;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'trace');
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

  beforeEach(inject(function (_$rootScope_, _$q_, _$timeout_, _$httpBackend_, _$controller_, _widgetLibraryService_, _ObjectUtils_, _customDashboardConstants_) {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_
    $controller = _$controller_;
    customDashboardConstants = _customDashboardConstants_;
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
    $scope.organizations = organizationsMock;
    $scope.currentUser = currentUserMock;
    $scope.$apply();
  }));

  describe('widget create new Actions', function () {
    it('should save the new widget', function () {
      instantiateController();
      expect(controller.widgets).not.toBeDefined;
      controller.widgets = [];
      var widget = getMockWidget('graph', 'widgetName1', '', '5891acb1f01125972d0f00ea');
      controller.editWidget = widget;
      $timeout.flush();
      var widgetConfig = controller.buildWidgetConfig();
      var widgetResult = { config:widget, hidden:false };

      controller.saveWidget();
      expectSaveNewWidgetQuery(widgetConfig).respond({ result: [widgetResult] });
      expect(controller.saving).toBeTruthy;
      $httpBackend.flush();
      expect(controller.saving).toBeFalsy;
      expect(controller.widgets.length).toEqual(1);
    });

    it('should save the new widget handle error and not add the widget into the list', function () {
      instantiateController();
      expect(controller.widgets).not.toBeDefined;
      controller.widgets = [];
      var widget = getMockWidget('graph', 'widgetName1', '', '5891acb1f01125972d0f00ea');
      controller.editWidget = widget;
      $timeout.flush();
      var widgetConfig = controller.buildWidgetConfig();

      controller.saveWidget();
      expectSaveNewWidgetQuery(widgetConfig).respond(500);
      expect(controller.saving).toBeTruthy;
      $httpBackend.flush();
      expect(controller.saving).toBeFalsy;
      expect(console.error).toHaveBeenCalledWith('save widget error', 500);
      expect(controller.widgets.length).toEqual(0);
    });

    it('should save the edited widget', function () {
      instantiateController();
      expect(controller.widgets).not.toBeDefined;
      var widget = getMockWidget('graph', 'widgetName1', '', '5891acb1f01125972d0f00ea');
      controller.widgets = [widget];
      controller.editWidget = widget;
      controller.editMode = true;
      $timeout.flush();
      var widgetConfig = controller.buildWidgetConfig();
      var widgetResult = { config:widget, hidden:false };
      spyOn(controller, 'close').and.callThrough();
      controller.saveWidget();
      expectUpdateWidgetQuery(widgetConfig).respond({ result: [widgetResult] });
      expect(controller.saving).toBeTruthy;
      $httpBackend.flush();
      expect(controller.saving).toBeFalsy;
      expect(controller.widgets.length).toEqual(1);
      expect(controller.close).toHaveBeenCalled;
    });

    it('should save the edited widget handle error', function () {
      instantiateController();
      expect(controller.widgets).not.toBeDefined;
      var widget = getMockWidget('graph', 'widgetName1', '', '5891acb1f01125972d0f00ed');
      controller.widgets = [widget];
      controller.editWidget = widget;
      controller.editMode = true;
      $timeout.flush();
      var widgetConfig = controller.buildWidgetConfig();
      spyOn(controller, 'close').and.callThrough();
      controller.saveWidget();
      expectUpdateWidgetQuery(widgetConfig).respond(500);
      expect(controller.saving).toBeTruthy;
      $httpBackend.flush();
      expect(controller.saving).toBeFalsy;
      expect(controller.widgets.length).toEqual(1);
      expect(console.error).toHaveBeenCalledWith('update widget error', 500);
      expect(controller.close).not.toHaveBeenCalled;
    });
  });

  function instantiateController() {
    controller = $controller('dataTableConfigController', {
      '$scope': $scope,
      'widgetLibraryService': widgetLibraryService,
      'customDashboardConstants': customDashboardConstants,
    });
    controller.organizations = organizationsMock;
    controller.currentUser = currentUserMock;

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }

  function expectSaveNewWidgetQuery(widget) {
    return $httpBackend.when('POST', function(url) {
      return url.indexOf( apiUrl + '/widget')> -1;
    });
  }

  function expectUpdateWidgetQuery(widget) {
    return $httpBackend.when('PUT', function(url) {
      return url.indexOf( apiUrl + '/widget/'+ widget._id)> -1;
    });
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
