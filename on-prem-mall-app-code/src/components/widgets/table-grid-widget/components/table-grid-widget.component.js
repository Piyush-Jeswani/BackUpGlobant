(function () {
  'use strict';

  var widgetComponent = {
    templateUrl: 'components/widgets/table-grid-widget/views/partials/table-grid-widget.partial.html',
    controller: 'TableGridWidgetController as vm',
    bindings: {
      config: '<',
      widgetIcon: '<',
      hideExportIcon: '<?',
      exportIsDisabled: '<?',
      dateRangeStart: '<',
      dateRangeEnd: '<',
      currentUser: '<',
      currentOrg: '=',
      hideExportToCustomDashboardIcon: '<?',
      superuser: '<?'
    }
  };

  angular.module('shopperTrak.tableGridWidget').component('tableGridWidget', widgetComponent);
})();