'use strict';

angular.module('shopperTrak').directive('confirmationModal', ConfirmationModal);

function ConfirmationModal() {
  return {
    templateUrl: 'app/admin/modals/confirmation-modal/confirmation-modal.partial.html',
    restrict: 'E',
    scope: {
      action: '=',
      resource: '=',
      cancelButtonText: '=?',
      confirmAction: '&'
    },
    bindToController: true,
    controller: ConfirmationModalController,
    controllerAs: 'vm'
  };
}

ConfirmationModalController.$inject = [];

function ConfirmationModalController() {
  var vm = this;

  if (!vm.cancelButtonText) {
    vm.cancelButtonText = '.CANCEL';
  }
}