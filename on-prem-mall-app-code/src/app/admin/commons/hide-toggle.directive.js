(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('hideToggle', hideToggle);

  function hideToggle() {
    return {
      restrict: 'E',
      template: '<span ng-click="vm.toggle()" class="icon " data-title="{{ \'admin.HIDEORUNHIDE\' | translate }}" bs-tooltip>\
                  <span class="sticon icon-hide-toggle" ng-class="{\'sticon-show\': !vm.isHidden, \'sticon-hide\': vm.isHidden}" ng-click="vm.editSite(site.id)"></span>\
                </span>',
      scope: {
        onToggle: '&',
        isHidden: '=?'
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
      vm.isHidden = !vm.isHidden;
      if(vm.onToggle) {
        vm.onToggle({hidden:vm.isHidden});
      }
    }

  }

})();
