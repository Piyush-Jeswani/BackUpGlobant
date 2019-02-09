(function () {
  'use strict';

  angular.module('shopperTrak').directive('treeViewSelector', treeViewSelector);

  function treeViewSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/tree-view-selector/tree-view-selector.partial.html',
      controller: treeViewSelectorCtrl,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        items: '<',
        currentItem: '=',
        displayProperty: '@',
        onItemSelection: '=',
        parentDropDownClass: '@',
        placeholderLabel: '<?',
        currentFilterId: '<',
        configuration: '<'
      }
    };
  }

  treeViewSelectorCtrl.$inject = ['$scope', '$rootScope', 'ObjectUtils', 'marketIntelligenceService'];

  function treeViewSelectorCtrl($scope, $rootScope, ObjectUtils, marketIntelligenceService) {
    var vm = this;
    
    activate();

    vm.onClick = function () {
      vm.dropdownIsOpen = !vm.dropdownIsOpen;
    };

    vm.offClick = function () {
      vm.dropdownIsOpen = false;
    };

    function activate() {
      vm.dropdownIsOpen = false;
      vm.placeholderLabel = !ObjectUtils.isNullOrUndefined(vm.placeholderLabel) ? vm.placeholderLabel : 'Select';
      vm.configuration.currentFilterId = vm.currentFilterId;

      setupWatchers();
    }

    function setupWatchers() {
      var unbindFunctions = [];

      unbindFunctions.push($scope.$watch('vm.items', function() {
        vm.invalidSelection = true;
        if (!_.isEmpty(vm.currentItem)) {
          _.each(vm.items, function (item) {
            var filteredItem = marketIntelligenceService.getTreeLeafByName(item, vm.currentItem.name);
            if (!_.isUndefined(filteredItem)) {
              vm.invalidSelection = false;
            }
          });
        }
        if (vm.invalidSelection) {
          vm.currentItem = {};
        }
      }));

      unbindFunctions.push($rootScope.$on('selectionMade', function () {
        vm.dropdownIsOpen = false;
        vm.invalidSelection = false;
      }));

      $scope.$on('$destroy', function () {
        _.each(unbindFunctions, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }
  }
})();