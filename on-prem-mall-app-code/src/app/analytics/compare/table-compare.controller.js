(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('TableCompareController', TableCompareController);

  TableCompareController.$inject = [
    '$stateParams'
  ];

  function TableCompareController($stateParams) {
    var vm = this;

    vm.columns = [];
    vm.stateParams = $stateParams;
  }
})();
