'use strict';

describe('GraphCompareController', function() {
  var $scope;
  var $controller;
  var $stateParams;
  var $stateParamsMock;
  var $stateParamsMock2;
  var customDashboardService;
  var ExportService;
  var compareStateManagerMock;
  var currentSite = {
    'site_id': 1000,
    'organization': {
      'id': 1000
    },
    'type': 'Mall'
  };

  var currentOrganizationMock;
  var currentUserMock;
  var controller;

  var subscriptionServiceMock2 = {
    siteHasInterior: function(currentOrganization, currentSite) {
      angular.noop(currentOrganization, currentSite);
      return true;
    },
    siteHasSales: function (currentOrganization, currentSite) {
      angular.noop(currentOrganization, currentSite);
      return true;
    },
    siteHasLabor: function (currentOrganization, currentSite) {
      angular.noop(currentOrganization, currentSite);
      return true;     
    },
    siteHasPerimeter: function (currentOrganization, currentSite) {
      angular.noop(currentOrganization, currentSite);
      return true;
    }
  } 

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function ($rootScope, _$controller_,
    _customDashboardService_, _ExportService_,_$stateParams_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    // Prevent accidentally using the same controller
    // instance in multiple it-blocks.
    controller = null;

    customDashboardService = _customDashboardService_;

    ExportService = _ExportService_;

    $stateParamsMock = {
      orgId: 1000,
      siteId: 10000
    };

    $stateParamsMock2 = {
      orgId: 1000,
      siteId: 10000,
      dateRangeStart: moment.utc('2016-01-01'),
      dateRangeEnd: moment.utc('2016-01-31').endOf('day')
    };

    compareStateManagerMock = {
      loadWidgets: function() { return []; },
      saveWidgets: function() {}
    };

    currentOrganizationMock = {
      'organization_id': 123,
      'name': 'Foobar',
      'subscriptions': {
        'advanced': false,
        'campaigns': false,
        'labor': false,
        'sales': false,
        'market_intelligence': false,
        'qlik': false,
        'large_format_mall': true,
        'interior': false,
        'perimeter': true
      }
    };

    currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};

  }));

  it('should expose $stateParams', function() {
    instantiateController();
    expect(controller.stateParams).toBe($stateParamsMock);
  });

  it('should load widgets from compareStateWidgetManager service', function() {
    var savedWidgetsMock = [];
    spyOn(compareStateManagerMock, 'loadWidgets').and.callFake(function() {
      return savedWidgetsMock;
    });
    instantiateController();
    expect(compareStateManagerMock.loadWidgets).toHaveBeenCalledWith(
      $stateParamsMock.orgId,
      $stateParamsMock.siteId
    );
    expect(controller.widgets).toBe(savedWidgetsMock);
  });

  it('should save widgets whenever widgets array is changed', function() {
    spyOn(compareStateManagerMock, 'saveWidgets').and.callThrough();
    instantiateController({'SubscriptionsService': subscriptionServiceMock2});
    $scope.$digest();

    controller.addWidgetAndCloseDropdown('traffic-comparison-widget');
    $scope.$digest();

    controller.widgets[0].locationIds.push(123);
    $scope.$digest();

    expect(compareStateManagerMock.saveWidgets.calls.count()).toBe(2);
    expect(compareStateManagerMock.saveWidgets).toHaveBeenCalledWith(
      $stateParamsMock.orgId,
      $stateParamsMock.siteId,
      controller.widgets
    );
  });

  it('should not save widgets on initial $digest cycle', function() {
    spyOn(compareStateManagerMock, 'saveWidgets').and.callThrough();
    instantiateController();
    $scope.$digest();
    expect(compareStateManagerMock.saveWidgets).not.toHaveBeenCalled();
  });

  describe('addWidgetAndCloseDropdown', function() {
    it('should add a widget to the widgets array', function() {
      instantiateController();
      expect(controller.widgets.length).toBe(0);
      controller.addWidgetAndCloseDropdown('traffic-comparison-widget');
      expect(controller.widgets[0]).toEqual({
        type: 'traffic-comparison-widget',
        locationIds: []
      });
    });

    it('should close the dropdown', function() {
      instantiateController();
      controller.widgetDropdownIsOpen = true;
      controller.addWidgetAndCloseDropdown('traffic-comparison-widget');
      expect(controller.widgetDropdownIsOpen).toBe(false);
    });
  });

  describe('removeWidget', function() {
    it('should remove widget from the widgets array', function() {
      var widgets = [
        'traffic-comparison-widget',
        'dwell-time-comparison-widget',
        'gross-shopping-hours-comparison-widget'
      ];

      instantiateController();

      expect(controller.widgets.length).toBe(0);
      widgets.forEach(controller.addWidgetAndCloseDropdown);
      expect(controller.widgets.length).toBe(widgets.length);
      expect(_(controller.widgets).pluck('type')).toEqual(widgets);

      controller.removeWidget(controller.widgets[1]);
      expect(controller.widgets.length).toBe(widgets.length - 1);

      var newWidgets = widgets.slice();
      newWidgets.splice(1, 1);
      expect(_(controller.widgets).pluck('type')).toEqual(newWidgets);
    });
  });

  describe('changeWidgetType', function() {
    it('should change the widget type', function() {
      instantiateController();
      var widget = {
        'title': 'Foo Bar',
        'type': 'bogus-type'
      };
      controller.changeWidgetType(widget, 'different-type');
      expect(widget.type).toBe('different-type');
    });
  });

  describe('getAvailableWidgetByType', function() {
    it('should return the correct widget', function() {
      instantiateController();
      var firstWidget = _(controller.availableWidgets).first();
      var lastWidget = _(controller.availableWidgets).last();

      expect(controller.getAvailableWidgetByType(firstWidget.type))
        .toBe(firstWidget);
      expect(controller.getAvailableWidgetByType(lastWidget.type))
        .toBe(lastWidget);
    });
  });

  describe('setSelectedWidget', function() {
    it('should call setSelectedWidget() successfully and export widget to custom dashboard', function() {
      instantiateController();
       
      controller.addWidgetAndCloseDropdown('traffic-comparison-widget');

      spyOn(customDashboardService, 'setSelectedWidget').and.callThrough();

      controller.setSelectedWidget('traffic-comparison-widget'); 

      expect(customDashboardService.setSelectedWidget).toHaveBeenCalled();  
    });
  });

  describe('onExportButtonClick', function() {
    it('should call onExportButtonClick() successfully and export widget to custom dashboard', function() {
      instantiateController();
       
      controller.addWidgetAndCloseDropdown('traffic-comparison-widget');

      spyOn(customDashboardService, 'setSelectedWidget').and.callThrough();

      controller.onExportButtonClick('traffic-comparison-widget', true); 

      expect(customDashboardService.setSelectedWidget).toHaveBeenCalled();  
    });
  });

  describe('onExportButtonClick', function() {
    it('should call onExportButtonClick() successfully and export widget to pdf-csv', function() {
      instantiateController();
       
      controller.addWidgetAndCloseDropdown('traffic-comparison-widget');

      spyOn(ExportService, 'createExportAndStore').and.callThrough();

      controller.onExportButtonClick('traffic-comparison-widget', false); 

      expect(ExportService.createExportAndStore).toHaveBeenCalled();  
    });
  });

  describe('setAreas', function() {
    it('should call setAreas() successfully and test vm.selectedAreas[0] values', function() {
      instantiateController({'$stateParams': $stateParamsMock2});

      // Test where vm.selectedAreas[copyTo] is not equal to vm.selectedAreas[copyFrom]
      // In this use case: vm.selectedAreas[copyTo] = vm.selectedAreas[copyFrom];
      // So we test for this:
      controller.selectedAreas = [2,4,7];      
      controller.setAreas(1/*src = 4*/, 0/*dst = 2*/);
      expect(controller.selectedAreas[0]).toBe(4)

      // Test where vm.selectedAreas[copyTo] is equal to vm.selectedAreas[copyFrom]
      // In this use case: vm.selectedAreas[copyTo] = vm.selectedAreas[copyFrom] is NOT executed.
      // So we test for this:
      controller.selectedAreas = [5,5,7];
      controller.setAreas(1/*src = 5*/, 0/*dst = 5*/);
      expect(controller.selectedAreas[0]).toBe(controller.selectedAreas[1])
    });
  });

  describe('widgetIsExported', function() {
    it('should call widgetIsExported(metricKey) successfully and test where metricKey equals perimeter-traffic-comparison-widget', function() {
      instantiateController({'$stateParams': $stateParamsMock2});

      controller.addWidgetAndCloseDropdown('perimeter-traffic-comparison-widget');

      $stateParams.dateRangeStart = moment.utc('2016-01-01');
      $stateParams.dateRangeEnd = moment.utc('2017-01-01');
      spyOn(ExportService, 'isInExportCart').and.callThrough();
      controller.widgetIsExported('perimeter-traffic-comparison-widget');

      expect($stateParams.dateRangeStart.valueOf()).toBe(moment.utc('2016-01-01').valueOf()); 
      expect($stateParams.dateRangeEnd.valueOf()).toBe(moment.utc('2017-01-01').valueOf()); 
      expect(ExportService.isInExportCart).toHaveBeenCalled();  
    });
  });

  describe('toggleWidgetDropdown', function() {
    it('should call toggleWidgetDropdown() successfully and test vm.widgetDropdownIsOpen', function() {
      instantiateController({'$stateParams': $stateParamsMock2});

      controller.toggleWidgetDropdown();
      expect(controller.widgetDropdownIsOpen).toBe(true); 
    });
  });  

  function instantiateController(args) {
    controller = $controller('GraphCompareController', angular.extend({
      '$scope': $scope,
      '$stateParams': $stateParamsMock,
      'compareStateManager': compareStateManagerMock,
      'currentSite' : currentSite,
      'currentOrganization' : currentOrganizationMock,
      'currentUser' : currentUserMock
    }, args));

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});
