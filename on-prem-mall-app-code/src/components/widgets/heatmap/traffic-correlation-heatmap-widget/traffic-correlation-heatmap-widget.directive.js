(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('trafficCorrelationHeatmapWidget', trafficCorrelationHeatmapWidget);

  function trafficCorrelationHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/traffic-correlation-heatmap-widget/traffic-correlation-heatmap-widget.partial.html',
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
