(function () {
  'use strict';

  angular.module('shopperTrak')
  .controller('customDashboardAddWidgetController',[
    '$scope',
    '$timeout',
    'customDashboardService',
    'customDashboardConstants',
    '$state',
    function customDashboardAddWidgetController(
      $scope,
      $timeout,
      customDashboardService,
      constants,
      $state
    ) {

    var vm = this;

    // Constants:
    vm.form = $scope.dashboardModalForm; // FormController object ($error etc)
    vm.formEl = document.forms.dashboardModalForm; // <form>
    vm.dashboardNameMaxlength = constants.MAX_NAME_LENGTH;
    vm.MAXIMUM_WIDGETS_PER_DASHBOARD = constants.MAX_WIDGETS_PER_DASHBOARD;
    vm.MAX_DASHBOARDS = constants.MAX_DASHBOARDS;

    // Methods:
    vm.closeModal = closeModal;
    vm.submitModalForm = submitModalForm;
    vm.toggleCreateDashboardRadioFocus = toggleCreateDashboardRadioFocus;
    vm.updateSelectedDashboardName = updateSelectedDashboardName;

    // Models & States:
    vm.hasMaximumWidgets = false;
    vm.isCreateDashboardRadioFocused = false;
    vm.wasSubmitted = false;
    vm.selectedDashboardName = vm.selectedDashboardName || '';

    activate();

    function updateSelectedDashboardName(name) {
      if(name !== vm.selectedDashboardName) vm.selectedDashboardName = name;
    }

    function saveWidgetToDashboard() {
      customDashboardService
      .saveWidgetToDashboard(customDashboardService.getSelectedWidget(), vm.selectedDashboardName, $state.params.orgId)
      .then(closeModal)
      .catch(function (error) {
        vm.wasSubmitted = false;
        vm.errorMessage = error;
      });
    }

    function createDashboardAndSaveWidget() {
      customDashboardService
      .saveNewDashboard(vm.newDashboardName, customDashboardService.getSelectedWidget(), vm.currentUser, $state.params.orgId)
      .then(closeModal)
      .catch(function (error) {
        vm.wasSubmitted = false;
        vm.errorMessage = error;
      });
    }

    function submitModalForm() {
      vm.wasSubmitted = true;
      if (vm.selectedDashboardName === '__newdashboard__') {
        $('#addToDashboardModal dashboard-list .btn').removeClass('active'),
        $('#addToDashboardModal .dashboard-list__create').addClass('hide'); // hide dupe
        createDashboardAndSaveWidget();
      } else {
        saveWidgetToDashboard();
      }
    }

    function closeModal() {
      $('#addToDashboardModal').modal('hide');
      $timeout(resetModal, 1000);
    }

    function resetModal() {
      // Models and values:
      vm.isCreateDashboardRadioFocused = false;
      vm.errorMessage = null;
      vm.newDashboardName = '';
      vm.selectedDashboardName = '';
      vm.wasSubmitted = false;
      vm.formEl.reset();
      // Visual state:
      if ($scope.dashboardModalForm) {
        $scope.dashboardModalForm.$setPristine();
        $scope.dashboardModalForm.$setUntouched();
      }
      $('#addToDashboardModal .dashboard-list .btn').removeClass('active');
      $('#addToDashboardModal .dashboard-list__create').removeClass('hide'); // hide dupe
      // Focus:
      $(document.activeElement).blur();
    }

    function toggleCreateDashboardRadioFocus(toggle) {
      vm.isCreateDashboardRadioFocused = toggle;
      if (toggle) vm.formEl.dashboardName.focus();
    }

    function getDashboardNames(dashboards) {
      return _.pluck(dashboards, 'name');
    }

    function getWidgetCount() {
      var count = 0;
      _.each(vm.customDashboards, function(dashboard){
        count += dashboard.widgets.length;
      });
      return count;
    }

    function activate() {

      // Update custom dashboards when a widget has been added or removed:
      $scope.$watch('vm.currentUser', function() {
        vm.customDashboards = customDashboardService.getDashboards(vm.currentUser);
        vm.customDashboardNames = getDashboardNames(vm.customDashboards);
        vm.hasMaximumWidgets = getWidgetCount() === (vm.MAX_DASHBOARDS * vm.MAXIMUM_WIDGETS_PER_DASHBOARD);
      }, true);

      // Attach event handlers
      $('#addToDashboardModal').on('hide.bs.modal', function(){
        $timeout(resetModal, 1000);
      });
    }
  }]);

})();
