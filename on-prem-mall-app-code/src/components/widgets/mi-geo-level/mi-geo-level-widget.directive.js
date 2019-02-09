(function () {
  'use strict';

  angular.module('shopperTrak')
  .directive('miGeoLevel', miGeoLevelDirective);

  function miGeoLevelDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/mi-geo-level/mi-geo-level.partial.html',
      scope: {
        subscriptionArray: '=',
        checkedItem: '='
      },
      controller: miGeoLevelController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  function miGeoLevelController() {
    var vm = this;
    activate();
    function activate() {
      vm.toggleOpen = toggleOpen;
      vm.isCountrySelected = isCountrySelected;
      vm.isRegionSelected = isRegionSelected;
      vm.isMetroSelected = isMetroSelected;
    }

    function toggleOpen(item) {

      if (angular.isUndefined(item.isOpen)) {
        item.isOpen = true;
        return;
      }
      item.isOpen = !item.isOpen;
    }

    function isCountrySelected(id) {
      if (!_.contains(vm.checkedItem.isCountrySelected, id)) {
        vm.checkedItem.isCountrySelected.push(id);
      }
      else {
        vm.checkedItem.isCountrySelected = _.without(vm.checkedItem.isCountrySelected, id);
      }
    }

    function isRegionSelected(id) {
      if (!_.contains(vm.checkedItem.isRegionSelected, id)) {
        vm.checkedItem.isRegionSelected.push(id);
      }
      else {
        vm.checkedItem.isRegionSelected = _.without(vm.checkedItem.isRegionSelected, id);
      }
    }

    function isMetroSelected(id) {
      if (!_.contains(vm.checkedItem.isMetroSelected, id)) {
        vm.checkedItem.isMetroSelected.push(id);
      }
      else {
        vm.checkedItem.isMetroSelected = _.without(vm.checkedItem.isMetroSelected, id);
      }
    }
  }
})();

