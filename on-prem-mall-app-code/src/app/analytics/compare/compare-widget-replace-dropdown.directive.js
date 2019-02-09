(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('compareWidgetReplaceDropdown', compareWidgetReplaceDropdown);

  function compareWidgetReplaceDropdown() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/analytics/compare/compare-widget-replace-dropdown.partial.html',
      scope: {
        handleSelect: '&onSelect',
        widgets: '=',
        selected: '='
      },
      controller: CompareWidgetReplaceDropdownController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  function CompareWidgetReplaceDropdownController() {
    var vm = this;

    vm.isOpen = false;
    vm.toggle = toggle;
    vm.close = close;
    vm.selectWidget = selectWidget;

    function toggle() {
      vm.isOpen = !vm.isOpen;
    }

    function close() {
      vm.isOpen = false;
    }

    function selectWidget(widget) {
      vm.handleSelect({
        selected: widget
      });
    }
  }
})();
