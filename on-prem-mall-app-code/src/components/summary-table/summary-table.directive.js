(function () {
  'use strict';

  angular.module('shopperTrak').directive('summaryTable', summaryTable);

  function summaryTable() {
    return {
      restrict: 'E',
      templateUrl: 'components/summary-table/summary-table.partial.html',
      scope: {
        data: '=',
        cols: '=',
        numberFormatName: '=',
        filterText: '='
      },
      bindToController: true,
      controller: summaryTableController,
      controllerAs: 'vm'
    };
  }

  summaryTableController.$inject = [
    '$scope',
    '$filter',
    'ObjectUtils',
    '$parse',
    '$timeout'
  ];

  function summaryTableController($scope, $filter, ObjectUtils, $parse, $timeout) {
    var vm = this;
    vm.filterSites = filterSites;
    vm.sortTable = sortTable;
    vm.filterText = vm.filterText || '';

    activate();

    function activate() {
      var unbindDataWatch = $scope.$watchCollection('vm.data', batchLoad);
      var unbindColsLengthWatch = $scope.$watch('vm.cols.length', colsChanged);
      var unbindLoadMoreEventWatch = $scope.$on('load_more', updateBatchView);

        $scope.$on('$destroy', function() {
          unbind(unbindDataWatch);
          unbind(unbindColsLengthWatch);
          unbind(unbindLoadMoreEventWatch);
       });
    }

    function unbind(unbindFunction) {
      if (typeof unbindFunction === 'function') {
        unbindFunction();
      }
    }

    function sortTable(col) {
       if(vm.currentSort === col) {
         //toggle sort on same column
         if(vm.currentSort.sort === 'desc') {
           vm.currentSort.sort = 'asc';
         } else {
           vm.currentSort.sort = 'desc';
         }
       } else {
         //remove sort from current col
         if(!ObjectUtils.isNullOrUndefined(vm.currentSort) && !ObjectUtils.isNullOrUndefined(vm.currentSort.sort)) {
           delete vm.currentSort.sort;
         }

         vm.currentSort = col;
         vm.currentSort.sort = 'desc';
       }

       sortView(vm.currentSort.prop, vm.currentSort.sort);
    }

    function updateBatchView() {

      var currentPage = vm.pages.splice(0,1);

      if(!ObjectUtils.isNullOrUndefinedOrEmpty(currentPage)) {
        vm.batchView = vm.batchView.concat(currentPage[0]);
      }

    }

    function batchLoad() {
      splitToPages(vm.data);
    }

    function colsChanged() {
      vm.stRendered = null;
      $timeout(function () {
        vm.stRendered = true;
      });
    }

    function splitToPages(data) {
      var tableData = angular.copy(data);
      vm.pages = [];
      vm.batchView = [];

      while(tableData.length > 200) {
        vm.pages.push(tableData.splice(0,200));
      }

      vm.pages.push(tableData);

      updateBatchView();
    }

    function filterSites() {
      var filteredView = $filter('filter')(vm.data , vm.filterText);
      splitToPages(filteredView);
    }

    function sortView(prop, direction) {
      var sortedTable = _.sortBy(vm.data, function(dataRow) {
        if(direction === 'desc') {
          return -$parse(prop)(dataRow);
        } else {
          return $parse(prop)(dataRow);
        }

      });

      splitToPages(sortedTable);
    }

  }

})();
