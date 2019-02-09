'use strict';

angular.module('shopperTrak')
  .controller('AdminSitesController', AdminSitesController);

AdminSitesController.$inject = [
  '$scope',
  '$state',
  '$timeout',
  'adminSiteData'
];

function AdminSitesController($scope, $state, $timeout, adminSiteData) {
  var vm = this;

  vm.org_Id = $state.params.orgId;

  function updateLocation(path) {
    var base = '#/admin/organizations/' + $state.params.orgId;
    location.hash = base + path;
  }

  function editSite(site_id) {

    $state.go('admin.organizations.edit.site', {
      siteId: site_id
    });
  }

  function addSite() {
    updateLocation('/sites/add');
  }

  function toggleHide(hidden, _site) {
    var params = {
      hidden: hidden
    };

    var callback = {
      success: function (result) {
        notifyStatus({success:true, message:'.SUCCESSFUL', result:result});
      },
      failed: function () {
        //error notification
        notifyStatus({error:true, message:''});
      }
    };

    adminSiteData.updateSiteSettings({
      orgId: vm.org_Id,
      siteId: _site.id,
      params,
      callback
    });
  }

  function notifyStatus(data) {
    $scope.success = data.success;
    $scope.successMessage = data.message;
    $scope.error = data.error;
    $scope.errorMessage = data.message;

    $timeout(function () {
      $scope.success = false;
      $scope.error = false;
    }, 5000);
  }

  vm.editSite = editSite;
  vm.addSite = addSite;
  vm.toggleHide = toggleHide;

}
