(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('campaignAnalyticsHeatmapWidget', campaignAnalyticsHeatmapWidget);

  function campaignAnalyticsHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-campaign-analytics-heatmap-widget/campaign-analytics-heatmap-widget.partial.html',
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
        numberFormatName: '=',
        hideLocationList: '=?'
      },
      bindToController: true,
      controller: function() {},
      controllerAs: 'vm'
    };
  }
})();
