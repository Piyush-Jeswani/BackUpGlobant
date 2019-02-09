(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('firstCampaignsToUseHeatmapWidget', firstCampaignsToUseHeatmapWidget);

  function firstCampaignsToUseHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-first-campaigns-to-use-heatmap-widget/first-campaigns-to-use-heatmap-widget.partial.html',
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
