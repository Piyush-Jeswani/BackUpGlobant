
(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('addeditreport', function addEditReport() {
      return {
        templateUrl: 'app/analytics/reports/modals/create-report/create-report.partial.html',
        scope: {
          currentUser: '=?',
          organizations: '=?',
          phase: '=?',
          availableWidgets: '=?',
          report: '=?',
          mode: '=?'
        },
        replace: true,
        bindToController: true,
        controller: 'createReportController',
        controllerAs: 'vm'
      };
    });
})();
