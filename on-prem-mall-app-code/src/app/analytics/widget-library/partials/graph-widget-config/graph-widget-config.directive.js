(function () {
  'use strict';
	angular.module('shopperTrak')
	.directive('graphwidgetconfig', function graphWidgetConfig() {
    return {
      scope: {
        organizations: '=',
        metricList: '=',
        currentUser: '=',
        configType: '=',
        mode: '=?',
        editWidget: '=?',
        widgets: '=',
        superuser: '<?'
      },
      replace: true,
      templateUrl: 'app/analytics/widget-library/partials/graph-widget-config/graph-widget-config.partial.html',
      bindToController: true,
      controller: 'graphWidgetConfigController',
      controllerAs: 'vm'
    };
  });
})();
