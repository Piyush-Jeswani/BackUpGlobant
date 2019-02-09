(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('confirmTagDeletionModal', confirmTagDeletionModal);

    function confirmTagDeletionModal() {
      return {
        restrict: 'EA',
        templateUrl: 'app/admin/modals/confirm-tag-deletion-modal/confirm-tag-deletion-modal.partial.html',
        scope: {
          usersAffected : '=',
          deleteItem : '&',
          message : '='
        },
        bindToController: true,
        controller: ConfirmTagDeletionModalController,
        controllerAs: 'vm'
      };
    }

    ConfirmTagDeletionModalController.$inject = [
      '$scope'
    ];

    function ConfirmTagDeletionModalController($scope) {

      var vm = this;

      $scope.deleteCustomTag = function () {
        vm.deleteItem();
      };
      
      $scope.message = vm.message;
      $scope.usersAffected = vm.usersAffected;
    }

})();