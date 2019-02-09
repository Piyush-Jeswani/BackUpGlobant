angular.module('shopperTrak').component('widgetLibraryGraph', {
  templateUrl: 'components/widgets/widget-library-graph/widget-library-graph.partial.html',
  controller: 'WidgetLibraryGraphController',
  controllerAs: 'vm',
  bindings: {
    groupBy: '<',
    dateRange: '<',
    dateRangePeriod: '<?',
    widgetid: '<',
    widgetTitle: '<',
    widgetIcon: '<',
    hideExportIcon: '<',
    hideExportToCustomDashboardIcon: '<',
    exportIsDisabled: '<',
    onExportClick: '&',
    showmetrics: '<',
    currentUser: '<',
    widgetConfig: '<',
    selectedOrg: '<',
    superuser: '<?'
  }
});
