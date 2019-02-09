'use strict';

angular.module('shopperTrak.widgets').directive('bulkActionWidget', BulkActionWidget);

function BulkActionWidget() {
  return {
    templateUrl: 'components/widgets/bulk-action-widget/bulk-action-widget.partial.html',
    controller: BulkActionWidgetController,
    controllerAs: 'vm',
    bindToController: true,
    scope: {
      bulkActions: '=',
      actionSelected: '=',
      showClearButton: '=',
      bulkActionApply: '&',
      clearActionApply: '&'
    }
  };
}

BulkActionWidgetController.$inject = [];

function BulkActionWidgetController() {
  var vm = this;
  
  vm.dropdownIsOpen = false;
  vm.selectAction = selectAction;
  vm.applyAction = applyAction;
  vm.actionSelected = 'Bulk actions';

  function applyAction() {
    vm.bulkActionApply();
  }
  
  function selectAction(action) {
    if(action === 'Deselect') {
      vm.actionSelected = 'Bulk actions';
    } else {
      vm.actionSelected = action;
    }
  }
}