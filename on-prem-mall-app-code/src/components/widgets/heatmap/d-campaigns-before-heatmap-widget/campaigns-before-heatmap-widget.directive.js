(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('campaignsBeforeHeatmapWidget', campaignsBeforeHeatmapWidget);

  function campaignsBeforeHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-campaigns-before-heatmap-widget/campaigns-before-heatmap-widget.partial.html',
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
