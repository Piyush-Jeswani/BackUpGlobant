(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('multipleSelector', multipleSelectorDirective);

  function multipleSelectorDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'components/widgets/multiple-selector-widget/multiple-selector-widget.partial.html',
      scope: {
        items: '=',
        orderBy: '=',
        showSelectAllButton: '=',
        selectedItems: '=',
        selectItem: '&?'
      },
      controller: MultipleSelectorController,
      controllerAs: 'vm',
      bindToController: true,
    };
  }

  MultipleSelectorController.$inject = [
    'ObjectUtils'
  ];

  function MultipleSelectorController(ObjectUtils) {
    var vm = this;
    vm.toggleItem = toggleItem;
    vm.toggleAllItems = toggleAllItems;
    vm.isSelected = isSelected;
    vm.allSelected = false;
    vm.filter = '';

    function isSelected(itemId) {
      return _.contains(vm.selectedItems, itemId);
    }

    function toggleItem(itemId) {
      if(_.contains(vm.selectedItems, itemId)) {
        var index = _.indexOf(vm.selectedItems, itemId);
        vm.selectedItems.splice(index, 1);
      } else {
        vm.selectedItems.push(itemId);
      }

      if(!ObjectUtils.isNullOrUndefined(vm.selectItem)) {
        vm.selectItem();
      }
    }

    function toggleAllItems() {
      var selectedItems = vm.selectedItems;
      var totalLength = vm.items.length;

      if (selectedItems.length !== totalLength || selectedItems.length === 0) {
        pushAllItems();
      } else {
        vm.selectedItems = [];
      }

      if(!ObjectUtils.isNullOrUndefined(vm.selectItem)) {
        vm.selectItem();
      }
    }

    function pushAllItems() {
      vm.selectedItems = [];
      _.each(vm.items, function(item) {
        vm.selectedItems.push(item.id);
      });
    }
  }
})();
