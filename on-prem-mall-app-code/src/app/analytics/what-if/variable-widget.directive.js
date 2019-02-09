(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('variableWidget', variableWidget);

  function variableWidget() {
    return {
      restrict: 'E',
      templateUrl: 'app/analytics/what-if/variable-widget.partial.html',
      scope: {
        label: '@',
        kpi: '@',
        readOnly: '=',
        onValueChanged: '&',
        onFocus: '&',
      },
      bindToController: true,
      controller: VariableWidgetController,
      controllerAs: 'vm'
    };
  }

  VariableWidgetController.$inject = [
    '$scope',
    '$timeout',
    'variableMetrics',
  ];

  function VariableWidgetController($scope, $timeout, variableMetrics) {
    var vm = this;
    vm.toggleLock = toggleLock;
    vm.setIsEditing = setIsEditing;

    activate();

    function activate() {
      if(!_.isUndefined(vm.kpi)) {
        vm.model = variableMetrics.getModel(vm.kpi);
      }
    }

    function toggleLock(_val) {
      vm.model.setHold(_val);
    }

    function setIsEditing() {
      if( !_.isUndefined(vm.onFocus) ) {
        vm.onFocus({ isEditing: vm.model });
      }
    }


  }

})();
