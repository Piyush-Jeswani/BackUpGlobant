(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('campaignCorrelationHeatmapWidget', campaignCorrelationHeatmapWidget);

  function campaignCorrelationHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-campaign-correlation-heatmap-widget/campaign-correlation-heatmap-widget.partial.html',
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
        numberFormatName: '='
      },
      bindToController: true,
      controller: function() {},
      controllerAs: 'vm'
    };
  }
})();
