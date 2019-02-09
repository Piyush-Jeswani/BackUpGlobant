(function() {
  'use strict';

  angular.module('shopperTrak')
    .directive('deleteCustomTagsModal', deleteCustomTagsModal);

    function deleteCustomTagsModal() {
      return {
        restrict: 'EA',
        templateUrl: 'app/admin/modals/delete-customtags-modal/delete-customtags-modal.partial.html',
        scope: {
          deleteItem : '&',
          message : '='
        },
        bindToController: true,
        controller: DeleteCustomTagsModalController,
        controllerAs: 'vm'
      };
    }

    DeleteCustomTagsModalController.$inject = [
      '$scope'
    ];

    function DeleteCustomTagsModalController($scope) {

      var vm = this;

      $scope.deleteCustomTag = function () {
        vm.deleteItem();
      };
      
      $scope.message = vm.message;
    }

})();
