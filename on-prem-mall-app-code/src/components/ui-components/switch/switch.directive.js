'use strict';

angular
  .module('shopperTrak')
  .directive('uiSwitch', uiSwitch);

function uiSwitch() {
  var directive = {
    restrict: 'EA',
    templateUrl: 'components/ui-components/switch/switch.partial.html',
    scope: {
      disabled: '=',
      chosen: '='
    },
    controller: uiSwitchController,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;
}

uiSwitchController.$inject = ['$scope'];

function uiSwitchController($scope) {
  var vm = this;

  vm.toggle = function() {
    if(vm.disabled) {
      return;
    }

    vm.chosen = !vm.chosen;

    if ($scope.$parent) {
      $scope.$parent.chosen = vm.chosen;
    }
  };

  vm.isChosen = function() {
    return vm.chosen;
  };

}
