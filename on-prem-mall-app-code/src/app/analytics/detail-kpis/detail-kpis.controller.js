(function() {
  'use strict';

  angular.module('shopperTrak')
    .controller('DetailKPIsCtrl', DetailKPIsController);

  DetailKPIsController.$inject = [
    '$scope',
    '$q',
    '$stateParams',
    'currentOrganization',
    'currentLocation',
    'currentSite',
    'ExportService',
    '$state'
  ];

  function DetailKPIsController(
    $scope,
    $q,
    $stateParams,
    currentOrganization,
    currentLocation,
    currentSite,
    ExportService,
    $state
  ) {
    var vm = this;

    vm.currentSite = currentSite;
    vm.currentLocation = currentLocation;
    vm.dateRange = {
      start: $stateParams.dateRangeStart,
      end: $stateParams.dateRangeEnd
    };
    vm.comparisonDateRange = {
      start: $stateParams.comparisonDateRangeStart,
      end: $stateParams.comparisonDateRangeEnd
    };

    vm.exportWidget = exportWidget;
    vm.widgetIsExported = widgetIsExported;

    activate();

    function activate() {
      $scope.$on('scheduleExportCurrentViewToPdf', scheduleExportCurrentViewToPdf);
    }

    function scheduleExportCurrentViewToPdf() {
      angular.forEach($state.current.data.widgetsToExport, function(value) {
        ExportService.addToExportCartAndStore(getAreaKey(), vm.dateRange, vm.comparisonDateRange, value);
      });
      $state.go('pdfexport', {orgId: currentOrganization.organization_id, view: 'schedule'});
    }

    function getAreaKey() {
      var areaKey = currentSite.organization.id + '_' + currentSite.site_id;
      if (currentLocation) {
        areaKey += '_' + currentLocation.location_id;
      }
      return areaKey;
    }

    function exportWidget(metricKey) {
      ExportService.addToExportCartAndStore(
        getAreaKey(),
        { start: vm.dateRange.start, end: vm.dateRange.end },
        { start: vm.comparisonDateRange.start, end: vm.comparisonDateRange.end },
        metricKey
      );
    }

    function widgetIsExported(metricKey) {
      var dateRangeKey =
        vm.dateRange.start +
        ' - ' +
        vm.dateRange.end +
        ' - ' +
        vm.comparisonDateRange.start +
        ' - ' +
        vm.comparisonDateRange.end;

      return ExportService.isInExportCart(getAreaKey(), dateRangeKey, metricKey);
    }

  }
})();
