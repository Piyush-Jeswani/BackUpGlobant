(function () {
  'use strict';

  angular.module('shopperTrak').directive('customDashboard', function dashboardDirective() {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'app/analytics/custom-dashboard/custom-dashboard.partial.html',
      bindToController: true
    };
  });

})();
