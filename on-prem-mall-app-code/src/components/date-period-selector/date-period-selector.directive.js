(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('datePeriodSelector', datePeriodSelector);

  function datePeriodSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/date-period-selector/date-period-selector.partial.html',
      scope: {
        selectedItems: '=',
        isDisabled: '=?'
      },
      bindToController: true,
      controller: datePeriodSelectorController,
      controllerAs: 'vm'
    };
  }

  datePeriodSelectorController.$inject = [
    '$scope',
    'LocalizationService',
    'ObjectUtils',
    'datePeriods'
  ];

  function datePeriodSelectorController($scope, LocalizationService, ObjectUtils, datePeriods) {
    var vm = this;
    vm.trueVal = true;
    var isFirstLoad = true;

    activate();

    function activate() {
      if (ObjectUtils.isNullOrUndefined(vm.isDisabled)) {
        vm.isDisabled = false;
      }
      populateOptions();

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedItems)) {
        vm.unOrderedSelectedItems = vm.selectedItems;
      }

      configureWatches();
    }

    function populateOptions() {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.options)) {
        return;
      }
      vm.options = getDatePeriodData();
    }

    function getDatePeriodData() {
      var data = angular.copy(datePeriods);
      _.each(data, function (item) {
        item.selected = false;
      });
      return data;
    }

    function unorderedSelectedItemsChanged(newSelection) {
      if (ObjectUtils.isNullOrUndefined(newSelection)) {
        return;
      }

      if (!allOptionIsSelected(newSelection)) {
        return;
      }

      if (allOptionIsSelected(newSelection) && newSelection.length > 1) {
        unSelectAllOption();
      }
    }

    function configureWatches() {
      var unbindUnorderedItemSelectionWatch = $scope.$watch('vm.unOrderedSelectedItems', function (newSelection) {
        unorderedSelectedItemsChanged(newSelection);
        if (!ObjectUtils.isNullOrUndefined(vm.unOrderedSelectedItems) && isFirstLoad) {
          isFirstLoad = false;
        }
        vm.selectedItems = getOrderedItems();
      });

      $scope.$on('$destroy', function () {
        if (typeof unbindUnorderedItemSelectionWatch === 'function') {
          unbindUnorderedItemSelectionWatch();
        }
      });
    }

    function getOrderedItems() {
      var orderedSelectedItems = [];

      _.each(vm.unOrderedSelectedItems, function (selectedItem) {
        if (selectedItem.key === 'all') {
          orderedSelectedItems.push(selectedItem);
          return;
        }

        if (!isSelected(selectedItem, orderedSelectedItems)) {
          orderedSelectedItems.push(selectedItem);
        }
      });

      if (ObjectUtils.isNullOrUndefinedOrEmpty(orderedSelectedItems)) {
        return vm.unOrderedSelectedItems;
      }

      return orderedSelectedItems;
    }

    function isSelected(option, options) {
      var search = {
        key: option.key
      };

      var selection = _.findWhere(options, search);

      return typeof selection === 'object';
    }

    function allOptionIsSelected(selections) {
      var allOption = _.findWhere(selections, {
        key: 'all'
      });

      return !ObjectUtils.isNullOrUndefined(allOption);
    }

    function unSelectAllOption() {
      vm.toggleSelectionById('all');
    }
  }

})();
