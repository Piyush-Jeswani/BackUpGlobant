(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('salesSwitchSelector', salesSwitchSelector);

  function salesSwitchSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/sales-categories-switch/sales-switch-selector.partial.html',
      scope: {
        salesCategories: '=',
        selectedSalesCategories: '=',
        totalCategory: '=?' //optional: index for exclusive category
      },
      bindToController: true,
      controller: salesSwitchSelectorController,
      controllerAs: 'vm'
    };
  }

  salesSwitchSelectorController.$inject = ['ObjectUtils'];

  function salesSwitchSelectorController(ObjectUtils) {


    var vm = this;
    vm.selectSalesCategory = selectSalesCategory;

    activate();

    function activate() {
      vm.selectedSalesCategories = {};
      vm.selectedSalesCategories[0] = true;

      if( !ObjectUtils.isNullOrUndefined( vm.totalCategory) ) {
        var disabledIndex = vm.totalCategory;
        vm.salesCategories[disabledIndex].multiSelectDisabled = true;
      }
    }


    function selectSalesCategory(salesCategoryId) {
      var disabledIndex = vm.totalCategory;
      var currentSelection = _.find(vm.salesCategories, function (_cat) {
        return _cat.id === salesCategoryId;
      });

      if(currentSelection.multiSelectDisabled !== true && !ObjectUtils.isNullOrUndefined(disabledIndex) ) {
        vm.selectedSalesCategories[disabledIndex] = false;
      } else if (currentSelection.multiSelectDisabled === true) {
        //remove all previously selected Items
        vm.selectedSalesCategories = {};
      }

      vm.selectedSalesCategories[salesCategoryId] = !vm.selectedSalesCategories[salesCategoryId];
    }

  }

})();
