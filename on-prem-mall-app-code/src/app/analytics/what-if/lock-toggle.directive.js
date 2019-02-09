(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('lockToggle', lockToggle);

  function lockToggle() {
    return {
      restrict: 'E',
      template: '<div ng-click="vm.toggle()" class="lock-toggle" > \
                  <i ng-if="vm.isLocked" class="sticon sticon-lock-closed" ></i> \
                  <i ng-if="!vm.isLocked"  class="sticon sticon-lock-open" ></i> \
                </div>',
      scope: {
        onToggle: '&',
        isLocked: '=?'
      },
      bindToController: true,
      controller: LockToggleController,
      controllerAs: 'vm'
    };
  }

  LockToggleController.$inject = [];

  function LockToggleController() {

    var vm = this;

    activate();

    function activate() {
      vm.toggle = toggle;
    }

    function toggle() {
      vm.isLocked = !vm.isLocked;
      if(vm.onToggle) {
        vm.onToggle({value:vm.isLocked});
      }
    }

  }

})();
