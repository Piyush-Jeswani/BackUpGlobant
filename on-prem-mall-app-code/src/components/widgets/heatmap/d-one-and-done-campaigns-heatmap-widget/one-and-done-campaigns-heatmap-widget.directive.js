(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('oneAndDoneCampaignsHeatmapWidget', oneAndDoneCampaignsHeatmapWidget);

  function oneAndDoneCampaignsHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/d-one-and-done-campaigns-heatmap-widget/one-and-done-campaigns-heatmap-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationTypes: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
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
