'use strict';

angular.module('shopperTrak').directive('bulkActionModal', BulkActionModal);

function BulkActionModal() {
  return {
    templateUrl: 'app/admin/modals/bulk-action-modal/bulk-action-modal.partial.html',
    restrict: 'E',
    scope: {
      selectedIds: '=',
      selectedNames: '=',
      actionValid: '=',
      action: '='
    },
    bindToController: true,
    controller: BulkActionModalController,
    controllerAs: 'vm'
  };
}

BulkActionModalController.$inject = [
  '$state',
  'ObjectUtils',
  'adminUsersData'
];

// maybe we just send usernamesSelected, userids, valid, action
function BulkActionModalController($state, ObjectUtils, adminUsersData) {
  var vm = this;
  vm.applyAction = applyAction;
  vm.applyWasCalled = false;

  $('#bulkActionModal').on('hidden.bs.modal', function() {
    if(vm.applyWasCalled) {
      $state.reload('admin.usermanagement');
    }
  });

  function applyAction() {
    vm.applyWasCalled = true;

    _.each(vm.selectedIds, function(id) {
      deleteUser(id);
    });
  }

  function deleteUser(id) {
    if(!ObjectUtils.isNullOrUndefined(id)) {
      var callback = {
        success: function() {
          addUserAttribute(id, 'success');
        },
        failed: function(error) {
          addUserAttribute(id, error.data.message);
        }
      };

      adminUsersData.deleteUser(id, callback);
    }
  }

  function addUserAttribute(id, status) {
    var index = _.findIndex(vm.selectedNames, function(user) {
      return user._id === id;
    });

    vm.selectedNames[index].status = status;
  }
}