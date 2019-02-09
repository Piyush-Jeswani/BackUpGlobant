(function () {
  'use strict';
  angular.module('shopperTrak')
    .controller('miSelectorCtrl', miSelectorCtrl);

  miSelectorCtrl.$inject = ['$scope', 'ObjectUtils'];

  function miSelectorCtrl($scope, ObjectUtils) {
    var vm = this;
    
    activate();

    vm.onClick = function () {
      vm.dropdownIsOpen = !vm.dropdownIsOpen;
    };

    vm.offClick = function () {
      vm.dropdownIsOpen = false;
    };

    vm.onItemSelect = function (item) {
      vm.currentItem = item;
      if (typeof vm.onItemSelection === 'function') {
        vm.onItemSelection(vm.selectedDimension, item, vm.currentFilterId);
      }
    };

    function activate() {
      vm.dropdownIsOpen = false;
      vm.placeholderLabel = !ObjectUtils.isNullOrUndefined(vm.placeholderLabel) ? vm.placeholderLabel : 'Select';
    }

    $scope.$watch('vm.items', function() {
      var invalidSelection = ObjectUtils.isNullOrUndefined(_.findWhere(vm.items, vm.currentItem));
      if (invalidSelection) {
        vm.currentItem = null;
      }
    });    
  }
})();
