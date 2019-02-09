(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('oneAndDoneHeatmapWidget', oneAndDoneHeatmapWidget);

  function oneAndDoneHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/one-and-done-heatmap-widget/one-and-done-heatmap-widget.partial.html',
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
