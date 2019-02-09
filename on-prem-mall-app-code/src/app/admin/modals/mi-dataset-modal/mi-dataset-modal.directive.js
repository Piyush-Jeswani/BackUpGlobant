(function () {
  'use strict';

  angular.module('shopperTrak')
  .directive('miDatasetModal', miDatasetModal);

  function miDatasetModal() {
    return {
      restrict: 'EA',
      templateUrl: 'app/admin/modals/mi-dataset-modal/mi-dataset-modal.partial.html',
      scope: {
        marketIntelligenceAdminSubscription: '=',
        selectedIndex: '=',
        miAdminDataSetMode: '=',
        adminSubscription: '=',
        adminSubscriptionAddMode: '=',
        hideCategory: '=',
        checkedEditItem:'=',
        checkedItem:'='
      },
      link: function () {
      },
      bindToController: true,
      controller: miDatasetModalController,
      controllerAs: 'vm'
    };
  }

  miDatasetModalController.$inject = [
    '$timeout',
    '$rootScope',
    'adminMIData'
  ];

  function miDatasetModalController($timeout, $rootScope, adminMIData) {

    var vm = this;

    activate();

    function activate() {
      vm.setSelected = setSelected;
      vm.selectedUuid = null;
      vm.selectedCategory = [];
      vm.closeModal = closeModal;
      vm.disablingContinueBtn = disablingContinueBtn;
      vm.disablingContinueEditBtn = disablingContinueEditBtn;
      vm.addNewMiDataset = addNewMiDataset;

    }

    function disablingContinueBtn(selectedMode) {
      if (selectedMode === 'add') {
        vm.unionCheckedItem = _.zip(vm.checkedItem.isCountrySelected, vm.checkedItem.isRegionSelected, vm.checkedItem.isMetroSelected);
        return _.isEmpty(vm.unionCheckedItem);
      }
    }
    
    function disablingContinueEditBtn(selectedMode) {
      if (selectedMode === 'edit') {
        vm.unionEditCheckedItem = _.zip(vm.checkedEditItem.isCountrySelected, vm.checkedEditItem.isRegionSelected, vm.checkedEditItem.isMetroSelected);
        return _.isEmpty(vm.unionEditCheckedItem);
      }
    }

    function setSelected(cat) {
      vm.categorySelected = true;
      vm.selectedUuid = cat.category.uuid;
      vm.adminSubscription = cat;
      vm.adminSubscriptionAddMode = cat;
    }

    function closeModal(mode) {
      if (mode === 'add') {
        for (var key in vm.checkedItem) {
          vm.checkedItem[key].length = 0
        }
      }

      $('#miDatasetModal').modal('hide');
      $timeout(resetModal(mode), 1000);
    }

    function resetModal(mode) {
      vm.adminSubscription = [];
      vm.selectedUuid = '';
      $rootScope.$broadcast('cancelmodel', mode);
    }

    function addNewMiDataset() {

      var emptyRow = [];
      _.each(vm.adminSubscription.geographyNode.children, function (country) {
        emptyRow.push(country.subscribed);
        _.each(country.children, function (region) {
          emptyRow.push(region.subscribed);
          _.each(region.children, function (metro) {
            emptyRow.push(metro.subscribed);
          })
        })
      });

      _.each(vm.adminSubscription.geographyNode.children, function (item) {
        delete item['isOpen'];
        _.each(item.children, function (subitem) {
          delete subitem['isOpen']
        })
      });

      _.each(vm.marketIntelligenceAdminSubscription.subscriptionNodes, function (item, index) {
        delete item['hide'];
        if (item.category.uuid === vm.adminSubscription.category.uuid) {
          delete vm.adminSubscription['hide'];
          vm.marketIntelligenceAdminSubscription.subscriptionNodes[index] = vm.adminSubscription;
        }
      });

      adminMIData.updateSubsciptionTree(vm.marketIntelligenceAdminSubscription);

      $rootScope.$broadcast('added');

      $('#miDatasetModal').modal('hide');
    }

  }
})();
