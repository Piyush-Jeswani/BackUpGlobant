(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('trafficHeatmapWidget', trafficHeatmapWidget);

  function trafficHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/traffic-heatmap-widget/traffic-heatmap-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
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
