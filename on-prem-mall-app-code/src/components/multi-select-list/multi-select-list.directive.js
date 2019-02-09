(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('multiSelectList', multiSelectList);

  function multiSelectList() {
    return {
      restrict: 'E',
      templateUrl: 'components/multi-select-list/multi-select-list.partial.html',
      scope: {
        options: '=',
        selectedItems: '=',
        callback: '<?',
        minLength: '=?',
        maxLength: '=',
        disabledIndex: '=',
        maxLengthMessage: '@',
        idProperty: '@',
        titleProperty: '@',
        placeholder: '@',
        translateTitles: '=?',
        toggleSelectionById: '=?',
        debounceDelay: '=?',
        defaultOptionId: '=?',
        dropdownClass: '=?',
        hideButtonTitle: '=?',
        showListTitle: '=?',
        listTitle: '=?',
        btnTooltip: '=?',
        buttonIcon: '=?',
        disabled: '=?',
        showSelectedItemsOnButton: '=?'
      },
      bindToController: true,
      controller: multiSelectListController,
      controllerAs: 'vm'
    };
  }

  multiSelectListController.$inject = [
    '$translate',
    '$q',
    '$scope',
    '$timeout',
    'ObjectUtils'
  ];
  
  function multiSelectListController($translate, $q, $scope, $timeout, ObjectUtils) {
    var vm = this;
    if (ObjectUtils.isNullOrUndefined(vm.showSelectedItemsOnButton)) {
      vm.showSelectedItemsOnButton = true;
    }
    vm.toggleSelection = toggleSelection;
    vm.items = angular.copy(vm.options);

    if (typeof vm.minLength === 'undefined') {
      vm.minLength = 0;
    }

    if (typeof vm.debounceDelay === 'undefined') {
      vm.debounceDelay = 0;
    }

    var selectionDebounce = _.debounce(setSelectedItems, vm.debounceDelay);
    var isLocalChange = false;
   
    let getSelectedCategoriesIndex = (categories, selectedCateIndex) => {
      if (!ObjectUtils.isNullOrUndefined(categories)) {
        categories.forEach((data, index) => {
          if (_.isEqual(data.id, selectedCateIndex)) {
            selectedCateIndex = index;
          }
        });
        return selectedCateIndex;
      }
      return selectedCateIndex;
    }

    activate();

    function activate() {
      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.buttonIcon)) {
        vm.buttonIcon = 'caret';
      }

      if (!ObjectUtils.isNullOrUndefined(vm.disabledIndex)) {
        let disabledIndex = getSelectedCategoriesIndex(vm.options, vm.disabledIndex);
        vm.items[disabledIndex].multiSelectDisabled = true;
      }

      var selectedItemsWatch = $scope.$watch('vm.selectedItems', commitSelections);

      $scope.$on('$destroy', function () {
        if (typeof selectedItemsWatch === 'function') {
          selectedItemsWatch();
        }
      });

      if (vm.translateTitles === true) {
        translateTitles().then(function () {
          initializeSelect();
          vm.toggleSelectionById = toggleSelectionById;
        });
      }
      else {
        initializeSelect();
        vm.toggleSelectionById = toggleSelectionById;
      }
    }

    function commitSelections(newVal, oldVal) {
      if (isLocalChange === true) {
        if(_.isFunction(vm.callback))vm.callback(newVal, oldVal);
        return;
      }
      if (ObjectUtils.isNullOrUndefinedOrEmpty(newVal)) {
        return clearSelections();
      }

      let newIds = _.pluck(newVal, vm.idProperty);
      let oldIds = _.pluck(oldVal, vm.idProperty);

      if (ObjectUtils.isNullOrUndefinedOrEmpty(oldVal) || 
        !angular.equals(newIds, oldIds)) {
        //only applicable to MCR selectors
        var selected = _.pluck(newVal, vm.idProperty);

        if (!_.contains(selected, undefined)) {

          _.map(vm.items, function (_item) {
              _item.selected = _.contains(selected, _item[vm.idProperty]);
          });

          buildTitle();
        }
        return;
      }
    }

    function translateTitles() {

      var promises = [];

      _.each(vm.items, function (item) {
        var deferred = $q.defer();

        $translate(item[vm.titleProperty]).then(function (translation) {
          item[vm.titleProperty] = translation;
          deferred.resolve();
        });

        promises.push(deferred);
      });

      return $q.all(promises);
    }

    function initializeSelect() {
      if (!vm.showSelectedItemsOnButton || ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedItems)) {
        vm.title = vm.placeholder;
        return;
      }
      vm.selectedItems.forEach(function (selectedItem) {
        var searchObject = {};

        if (typeof selectedItem === 'object') {
          searchObject[vm.idProperty] = selectedItem[vm.idProperty];
        } else {
          searchObject[vm.idProperty] = selectedItem;
        }

        var itemToSelect = _.findWhere(vm.items, searchObject);

        if (!ObjectUtils.isNullOrUndefined(itemToSelect)) {
          itemToSelect.selected = true;
        }
      });

      buildTitle();

      setMaxLengthStatus();

      buildTooltip();
    }

    function clearSelections() {
      _.each(vm.items, function (item) {
        item.selected = false;
      });
    }

    function toggleSelection(item) {
      if (vm.maxLength < 2) {
        clearSelections();
      }

      if(vm.maxLength === 1) {
        vm.menuOpen = false;
      }

      if(item.selectionType === 'single') {
        if(item.selected) {
          // Deselect other items
          _.each(vm.items, function (item) {
            if (item[vm.idProperty] !== item[vm.idProperty]) {
              item.selected = false;
            }
          });
        }
      }

      if (item.multiSelectDisabled !== true && !ObjectUtils.isNullOrUndefined(vm.disabledIndex)) {
        //find multiSelectDisabled item
        var oddItem = _.find(vm.items, function (_item) {
          return _item.multiSelectDisabled === true;
        });

        oddItem.selected = false;
      } else if (item.multiSelectDisabled === true) {
        clearSelections();
      }

      // Max number of selection
      if ((typeof item.selected === 'undefined' || item.selected === false) && (getSelectedItems().length === vm.maxLength)) {
        // Do not proceed with the selection
        return;
      }
      // Min number of selection
      if ((getSelectedItems().length === vm.minLength && item.selected === true)) {
        return;
      }

      item.selected = !item.selected;

      if (item.selectionType === 'single') {
        if (item.selected === true) {
          deselectOtherItems(item);
        }
      } else {
        deselectSingleSelectionItems();
      }

      setMaxLengthStatus();
      
      buildTitle();

      // Break all references and re-bind
      vm.items = angular.copy(vm.items);
      selectionDebounce();
    }

    function setSelectedItems() {
      $scope.$evalAsync(function () {
        isLocalChange = true;
        vm.selectedItems = getSelectedItems();

        $timeout(function () {
          isLocalChange = false;
        });
      });
    }

    function buildTitle() {
      if (vm.hideButtonTitle) {
        vm.title = '';
        return;
      }

      var selectedItems = getSelectedItems();

      var selectedLabels = selectedItems.map(function (item) {
        return item[vm.titleProperty];
      });
      if (!vm.showSelectedItemsOnButton || ObjectUtils.isNullOrUndefinedOrEmpty(selectedLabels)) {
        vm.title = vm.placeholder;
      } else {
        vm.title = selectedLabels.join(', ');
      }
    }

    function getSelectedItems() {
      return _.where(vm.items, { selected: true });
    }

    function setMaxLengthStatus() {
      vm.maxLengthReached = (getSelectedItems().length === vm.maxLength && vm.maxLength !== 1);
    }

    function buildTooltip() {
      vm.tooltip = {
        placement: 'top',
        trigger: 'hover',
        title: vm.maxLengthMessage
      };
    }

    function toggleSelectionById(id) {
      var item = findItem(id);

      toggleSelection(item);
    }

    function deselectOtherItems(itemToIgnore) {
      _.each(vm.items, function (item) {
        if (item[vm.idProperty] !== itemToIgnore[vm.idProperty]) {
          item.selected = false;
        }
      });
    }

    function deselectSingleSelectionItems() {
      var singleSelectionItems = _.where(vm.items, { selectionType: 'single' });

      _.each(singleSelectionItems, function (item) {
        item.selected = false;
      })
    }

    function findItem(id) {
      var search = {};

      search[vm.idProperty] = id;

      return _.findWhere(vm.items, search);
    }
  }
})();

