// This is a copy of multi-select-list directive. It has breaking changes due to which it could cause a regression if 
// not separated into it's own directive. 
// It was designed to update when vm.options change. If one of the options has a property "selected" set to true,
// the directive will automatically select this option.
// It allows for having a no option selection when single selection is active, which is useful when working as a filter.
// It also allows for option grouping. If an option has a type of "group" the directive will treat it as a header and 
// apply special styling.

(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('multiSelectDropdown', multiSelectDropdown);

  function multiSelectDropdown() {
    return {
      restrict: 'E',
      templateUrl: 'components/multi-select-dropdown/multi-select-dropdown.partial.html',
      scope: {
        options:                '=',
        selectedItems:          '=',
        minLength:              '=?',
        maxLength:              '=',
        disabledIndex:          '=',
        maxLengthMessage:       '@',
        idProperty:             '@',
        titleProperty:          '@',
        placeholder:            '<',
        translateTitles:        '=?',
        toggleSelectionById:    '=?',
        debounceDelay:          '=?',
        defaultOptionId:        '=?',
        dropdownClass:          '=?',
        hideButtonTitle:        '=?',
        showListTitle:          '=?',
        listTitle:              '=?',
        btnTooltip:             '=?',
        buttonIcon:             '=?',
        disabled:               '=?',
        onItemSelection:        '&?',
        allowOptionGrouping:    '<?',
        allowDeselectSingle:    '<?'
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

  function multiSelectListController(
    $translate,
    $q,
    $scope,
    $timeout,
    ObjectUtils
  ) {
    var vm = this;

    vm.toggleSelection = toggleSelection;
    vm.items = angular.copy(vm.options);

    if(typeof vm.minLength === 'undefined') {
      vm.minLength = 0;
    }

    if(typeof vm.debounceDelay === 'undefined') {
      vm.debounceDelay = 0;
    }
    var isLocalChange = false;

    activate();

    function activate() {
      if(ObjectUtils.isNullOrUndefinedOrEmpty(vm.buttonIcon)) {
        vm.buttonIcon = 'caret';
      }

      if( !ObjectUtils.isNullOrUndefined( vm.disabledIndex) ) {
        var disabledIndex = vm.disabledIndex;
        vm.items[disabledIndex].multiSelectDisabled = true;
      }

      var selectedItemsWatch = $scope.$watch('vm.selectedItems', commitSelections);

      $scope.$on('$destroy', function () {
        if (typeof selectedItemsWatch === 'function') {
          selectedItemsWatch();
        }
      });


      clearSelections();

      if(vm.translateTitles === true) {
        translateTitles().then(function() {
          initializeSelect();
          initScope();
        });
      }
      else {
        initializeSelect();
        initScope();
      }
    }

    function commitSelections(newVal, oldVal) {
      vm.items = angular.copy(vm.options);
      if (_.isUndefined(vm.selectedItems) || _.isEmpty(vm.selectedItems) && vm.buttonIcon !== 'caret') {
        vm.buttonIcon = 'caret';
      }

      if(isLocalChange === true) {
        return;
      }

      if( !angular.equals(newVal, oldVal) ) {
        //only applicable to MCR selectors
        var selected = _.pluck(newVal, 'id');

        if( !_.contains(selected, undefined) ) {

          _.map(vm.items, function(_item) {

            if( _.contains(selected, _item.id) ) {
              _item.selected = true;
            } else {
              _item.selected = false;
            }

          });

          buildTitle();
        }
      }
    }

    function translateTitles() {

      var promises = [];

      _.each(vm.items, function(item) {
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
      vm.selectedItems.forEach( function(selectedItem) {
        var searchObject = { };

        if(typeof selectedItem === 'object') {
          searchObject[vm.idProperty] = selectedItem[vm.idProperty];
        } else {
          searchObject[vm.idProperty] = selectedItem;
        }

        var itemToSelect = _.findWhere(vm.items, searchObject);

        if(!ObjectUtils.isNullOrUndefined(itemToSelect)) {
          itemToSelect.selected = true;
        }
      });

      buildTitle();

      setMaxLengthStatus();

      buildTooltip();
    }

    function initScope() {
      vm.toggleSelectionById = toggleSelectionById;
      vm.handleDropdownBehaviour = handleDropdownBehaviour;
    }

    function clearSelections(){
      _.each(vm.items, function(item){
        item.selected = false;
      });
    }

    function handleDropdownBehaviour() {
      if (vm.maxLength === 1 &&
          vm.maxLength === 1 &&
          vm.allowDeselectSingle &&
          vm.selectedItems &&
          vm.selectedItems[0] &&
          vm.selectedItems[0].selected
      ) {
        vm.items = angular.copy(vm.options);
        toggleSelection(vm.selectedItems[0]);
        setSelectedItems();
        return;
      }
      vm.menuOpen = !vm.menuOpen
    }

    function toggleSelection(item) {
      if (vm.allowOptionGrouping && item.type === 'group') {
        return;
      }

      if (vm.maxLength === 1 && vm.maxLength === 1 && vm.allowDeselectSingle) {
        if(!item.selected) {
          vm.buttonIcon = 'sticon sticon-circle-delete';
        } else {
          vm.buttonIcon = 'caret';
        }
      }
      
      if(vm.maxLength < 2) {
        deselectOtherItems(item);
      }

      if(vm.maxLength === 1) {
        vm.menuOpen = false;
      }

      if(item.selectionType === 'single') {
        if(item.selected) {
          // Deselect other items
          deselectOtherItems(item);
        }
      }

      if(item.multiSelectDisabled !== true && !ObjectUtils.isNullOrUndefined( vm.disabledIndex) ) {
        //find multiSelectDisabled item
        var oddItem = _.find(vm.items, function(_item) {
          return _item.multiSelectDisabled === true;
        });

        oddItem.selected = false;
      } else if (item.multiSelectDisabled === true) {
        clearSelections();
      }

      // Max number of selection
      if((typeof item.selected === 'undefined' || item.selected === false) && (getSelectedItems().length === vm.maxLength)) {
        // Do not proceed with the selection
        return;
      }
      // Min number of selection
      if(!vm.allowDeselectSingle && (getSelectedItems().length === vm.minLength && item.selected === true)) {
        return;
      }

      item.selected = !item.selected;

      if(item.selectionType === 'single') {
        if(item.selected === true) {
          deselectOtherItems(item);
        }
      } else {
        deselectSingleSelectionItems();
      }

      setMaxLengthStatus();

      buildTitle();
      if (typeof vm.onItemSelection === 'function') {
        vm.onItemSelection({ selectedItems: getSelectedItems() });
      }
    }

    function setSelectedItems() {
        isLocalChange = true;
        vm.selectedItems = getSelectedItems();

        $timeout(function() {
          isLocalChange = false;
        });
    }

    function buildTitle() {
      if(vm.hideButtonTitle) {
        vm.title = '';
        return;
      }

      var selectedItems = getSelectedItems();

      var selectedLabels = selectedItems.map( function(item) {
        return item[vm.titleProperty];
      });

      if(ObjectUtils.isNullOrUndefinedOrEmpty(selectedLabels)) {
        vm.title = vm.placeholder;
      } else {
        vm.title = selectedLabels.join(', ');
      }
    }

    function getSelectedItems() {
      return _.where(vm.items, {selected: true});
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
      _.each(vm.items, function(item) {
        if(item[vm.idProperty] !== itemToIgnore[vm.idProperty]) {
          item.selected = false;
        }
      });
    }

    function deselectSingleSelectionItems() {
      var singleSelectionItems = _.where(vm.items, {selectionType: 'single'});

      _.each(singleSelectionItems, function(item) {
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
