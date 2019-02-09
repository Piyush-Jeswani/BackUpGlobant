'use strict';

describe('compareWidgetReplaceDropdown', function() {
  var $scope;
  var controller;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function($rootScope, $templateCache, $compile) {
    $scope = $rootScope.$new();
    $scope.widgets = [{
      title: 'Widget 1',
      type: 'widget-1'
    }, {
      title: 'Widget 2',
      type: 'widget-2'
    }];
    $scope.handleSelect = jasmine.createSpy('handleSelect');

    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/analytics/compare/compare-widget-replace-dropdown.partial.html',
      '<div></div>'
    );

    var element = angular.element(
      '<compare-widget-replace-dropdown' +
      ' widgets="widgets"' +
      ' selected="widgets[0]"' +
      ' on-select="handleSelect(selected)">' +
      '</compare-widget-replace-dropdown>'
    );

    $compile(element)($scope);
    $scope.$digest();
    controller = element.controller('compareWidgetReplaceDropdown');
  }));

  describe('toggle', function() {
    it('should open the dropdown if it is closed', function() {
      controller.isOpen = false;
      controller.toggle();
      expect(controller.isOpen).toBe(true);
    });

    it('should close the dropdown if it is open', function() {
      controller.isOpen = true;
      controller.toggle();
      expect(controller.isOpen).toBe(false);
    });
  });

  describe('close', function() {
    it('should close the dropdown', function() {
      controller.isOpen = true;
      controller.close();
      expect(controller.isOpen).toBe(false);
    });
  });

  describe('selectWidget', function() {
    it('should evaluate the select handler expression and pass the widget to it', function() {
      expect($scope.handleSelect).not.toHaveBeenCalled();
      controller.selectWidget($scope.widgets[1]);
      expect($scope.handleSelect).toHaveBeenCalledWith($scope.widgets[1]);
    });
  });
});
