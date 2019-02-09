(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('visitsAfterHeatmapWidget', visitsAfterHeatmapWidget);

  function visitsAfterHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/visits-after-heatmap-widget/visits-after-heatmap-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationId: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        locationTypes: '=',
        floor: '=?',
        onLocationClick: '=?',
        hideExportIcon: '=',
        onExportClick: '&',
        exportIsDisabled: '=?',
        hideLocationList: '=?',
        numberFormatName: '=',
        language: '=',
        kpi: '@',
        isLoading: '=?',
        setSelectedWidget: '&'
      },
      bindToController: true,
      controller: function() {},
      controllerAs: 'vm'
    };
  }
})();
