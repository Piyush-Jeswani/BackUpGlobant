(function(){
  'use strict';

  angular.module('shopperTrak')
  .directive('customDashboardAddWidget', function customDashboardAddWidget() {
    return {
      restrict: 'E',
      templateUrl: 'app/analytics/custom-dashboard/custom-dashboard-add-widget-modal.partial.html',
      bindToController: true,
      controller: 'customDashboardAddWidgetController',
      controllerAs: 'vm',
      scope: {
        currentUser: '=',
        customDashboards: '='
      }
    };
  })
  
})();