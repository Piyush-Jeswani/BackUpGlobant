(function () {
  'use strict';

  angular.module('shopperTrak')
  .directive('miAdminGeoLevel', miAdminGeoLevelDirective);

  function miAdminGeoLevelDirective() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/mi-admin-geo-level/mi-admin-geo-level.partial.html',
      scope: {
        selectedCategory: '=',
        subscriptionArray: '=',
        adminSubscription:'=',
        adminSubscriptionAddMode:'=',
        miAdminDataSetMode: '=',
        checkedItem: '=',
        checkedEditItem:'='
      },
      controller: miAdminGeoLevelController,
      controllerAs: 'vm',
      bindToController: true
    };
  }

  function miAdminGeoLevelController() {

    var vm = this;

    activate();

    function activate() {
      vm.toggleOpen = toggleOpen;
      vm.isCountrySelected = isCountrySelected;
      vm.isRegionSelected = isRegionSelected;
      vm.isMetroSelected = isMetroSelected;
      vm.checkMetrosExists = checkMetrosExists;

    }

    function toggleOpen(item) {
      if (angular.isUndefined(item.isOpen)) {
        item.isOpen = true;
        return;
      }
      item.isOpen = !item.isOpen;
    }

    function checkedSelectedItem(passedObj, propertyToCheck, passedName) {
      if (!_.contains(passedObj[propertyToCheck], passedName)) {
        passedObj[propertyToCheck].push(passedName);
      }
      else {
        passedObj[propertyToCheck] = _.without(passedObj[propertyToCheck], passedName);
      }
    }

    function isCountrySelected(name) {
      if(vm.miAdminDataSetMode==='add'){
        checkedSelectedItem(vm.checkedItem, 'isCountrySelected', name);
      }
     else if(vm.miAdminDataSetMode==='edit'){
        checkedSelectedItem(vm.checkedEditItem, 'isCountrySelected', name);
      }
    }

    function isRegionSelected(name) {
      if(vm.miAdminDataSetMode==='add'){
        checkedSelectedItem(vm.checkedItem, 'isRegionSelected', name);
      }
      else if(vm.miAdminDataSetMode==='edit'){
        checkedSelectedItem(vm.checkedEditItem, 'isRegionSelected', name);
      }
    }

    function isMetroSelected(name) {
      if(vm.miAdminDataSetMode==='add'){
        checkedSelectedItem(vm.checkedItem, 'isMetroSelected', name);
      }
      else if(vm.miAdminDataSetMode==='edit'){
        checkedSelectedItem(vm.checkedEditItem, 'isMetroSelected', name);
      }
    }

    function checkMetrosExists(arrayToCheck) {
      return _.some(arrayToCheck,function (itemToCheck) {
        return itemToCheck.available;
      });
    }

  }
})();

