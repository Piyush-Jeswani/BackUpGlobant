(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('campaignsAfterHeatmapWidget', campaignsAfterHeatmapWidget);

  function campaignsAfterHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-campaigns-after-heatmap-widget/campaigns-after-heatmap-widget.partial.html',
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
        numberFormatName: '=',
        hideLocationList: '=?'
      },
      bindToController: true,
      controller: function() {},
      controllerAs: 'vm'
    };
  }
})();
