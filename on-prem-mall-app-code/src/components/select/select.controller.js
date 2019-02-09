(function () {
  'use strict';
  angular.module('shopperTrak')
    .controller('customSelectCtrl', ['$scope', function ($scope) {
      var cleanUpRepeatLast, cleanUpSearchtextChanged;
      activate();

      if (typeof $scope.disabled === 'undefined' || $scope.disabled === '') {
        $scope.disabled = false;
      }

      if (typeof $scope.orderBy !== 'undefined' && $scope.orderBy !== '') {
        $scope.items = _.sortBy($scope.items, $scope.orderBy);
        if (typeof $scope.order !== 'undefined' && $scope.order !== '' && $scope.order === 'desc') {
          $scope.items = $scope.items.reverse();
        }
      }

      cleanUpRepeatLast = $scope.$on('onRepeatLast', function () {
        $scope.switchOnScroll = true;
      });

      cleanUpSearchtextChanged = $scope.$on('searchTextChanged', function(event, searchValue) {
        $scope.searchText = searchValue;
      });

      $scope.$on('$destroy', function () {
        if (typeof cleanUpRepeatLast === 'function') {
          cleanUpRepeatLast();
        }

        if (typeof cleanUpSearchtextChanged === 'function') {
          cleanUpSearchtextChanged();
        }
      });

      $scope.onClick = function ($event) {
        if (typeof $event.target.tagName === 'undefined' || !isExcludedElement($event.target)) {
          $scope.dropdownIsOpen = !$scope.dropdownIsOpen;
        }
      };

      $scope.offClick = function () {
        $scope.dropdownIsOpen = false;
      };

      $scope.onItemSelect = function (item) {
        $scope.currentItem = item;
        if (typeof $scope.onItemSelection === 'function') {
          $scope.onItemSelection();
        }
      };

      $scope.getDropdownClass = function () {
        if ($scope.isSearching) {
          return 'searching';
        } else {
          return $scope.useTypeahead ? 'include-search' : '';
        }
      };

      $scope.onPerfectScroll = function () {
        $scope.loadMore = true;
      };

      /* LFR-487: Disabled function as it's not used currently.
         It will be fixed later with LFR-438.

      $scope.getItemClass = function (idProperty, item, currentItem) {
        var outputClass = '';
        if (idProperty && (currentItem[idProperty] === item[idProperty])) {
          outputClass = 'active';
        }
        return outputClass + ' ' + ($scope.isUsingSearch() ? 'searching-on' : '');
      };
      */

      $scope.isUsingSearch = function() {
        return typeof $scope.searchText !== 'undefined' && $scope.searchText.length > 3 && $scope.isSearching && !$scope.loadMore;
      };

      function activate() {
        $scope.dropdownIsOpen = false;
        $scope.selectSetting = {};
        $scope.switchOnScroll = false;
      }

      function isExcludedElement(element) {
        return element.tagName.toUpperCase() === 'INPUT' ||
          (element.tagName.toUpperCase() === 'SPAN' && element.className.toLowerCase() === 'close-x') ||
          element.className.toLowerCase() === 'close-icon';
      }
    }]);
})();
