(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('orgDistributionSelector', orgDistributionSelector);

  function orgDistributionSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/org-distribution-selector/org-dist.partial.html',
      scope: {
        selectableOrgs: '=',
        selectedOrgs:'=?'
      },
      bindToController: true,
      controller: orgDistributionSelectorController,
      controllerAs: 'vm'
    };
  }

  orgDistributionSelectorController.$inject = [
    '$translate',
    '$q',
    '$scope',
    '$timeout',
    'ObjectUtils'
  ];

  function orgDistributionSelectorController(
    $translate, 
    $q, 
    $scope, 
    $timeout, 
    ObjectUtils) {
    var vm = this;

    activate();

    function activate() {
      vm.moveSelectedOrgs = moveSelectedOrgs;
    }

    /**
		* A collection of functions that take place when an org is moved beteween selected and selectable orgs list
		*/
    function moveSelectedOrgs() {
      addToSelectedOrgs();
      removeFromSelectedOrgs();
      setSelectableOrgsFalse();
      setSelectedOrgsFalse();
    }

    /**
		* Takes an org that has been selected from a list of all orgs and copies it over to the selected orgs list
		*/
    function addToSelectedOrgs() {

      var orgsToSelect = [];
      _.each(vm.selectableOrgs, function (org) {
        if (org.selected) {
          var newOrg = angular.copy(org);
          newOrg.selected = false;
          newOrg.disabled = false;
          orgsToSelect.push(newOrg);
          org.disabled = true;
        };
      })

      if (ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs) && orgsToSelect.length > 0) {
        vm.selectedOrgs = orgsToSelect;
      } else {
        vm.selectedOrgs = _.union(vm.selectedOrgs, orgsToSelect);
      }
    }

    /**
    * Checks each selected org in the selected org list and removes checked ones
    * removed the disabled attribute from those orgs removed from the selected org list
    */
    function removeFromSelectedOrgs() {
      if (!ObjectUtils.isNullOrUndefinedOrEmpty(vm.selectedOrgs)) {
        var orgsToRemove = [];
        _.each(vm.selectedOrgs, function (org) {
          if (org.selected === true) {
            orgsToRemove.push(org);
          }
        });

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(orgsToRemove)) {
          var newOrgList = _.reject(vm.selectedOrgs, function (org) { return org.selected === true });
          vm.selectedOrgs = newOrgList;
        }

        _.each(orgsToRemove, function (removeOrg) {
          var index = _.findIndex(vm.selectableOrgs, function (org) { return org.name === removeOrg.name });
          vm.selectableOrgs[index].disabled = false;
        })
      }
    }

    /**
		* Clears out all chosen selectable orgs
		* Loops of each selectable org and sets its selected property to false
		*/
    function setSelectableOrgsFalse() {
      _.each(vm.selectableOrgs, function (org) {
        org.selected = false;
      })
    }

    /**
		* Clears out all chosen selected orgs
		* Loops of each selected org and sets its selected property to false
		*/
    function setSelectedOrgsFalse() {
      _.each(vm.selected, function (org) {
        org.selected = false;
      });
    }
  }
})();
