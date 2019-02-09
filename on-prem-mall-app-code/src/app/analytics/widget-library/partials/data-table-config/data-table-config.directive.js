(function () {
  'use strict';

	angular.module('shopperTrak')
	.directive('datatableconfig', function dataTableConfig() {
    return {
      scope: {
        organizations: '=',
        metricList: '=',
        currentUser: '=',
        configType: '=',
        editWidget: '=?',
        mode: '=?',
        widgets: '=',
        superuser: '=?'
      },
      replace: true,
      templateUrl: 'app/analytics/widget-library/partials/data-table-config/data-table-config.partial.html',
      bindToController: true,
      controller: 'dataTableConfigController',
      controllerAs: 'vm'
    };
  });

})();
