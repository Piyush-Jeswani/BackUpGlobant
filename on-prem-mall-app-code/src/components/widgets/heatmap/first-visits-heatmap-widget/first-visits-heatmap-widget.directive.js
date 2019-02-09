(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('firstVisitsHeatmapWidget', firstVisitsHeatmapWidget);

  function firstVisitsHeatmapWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/heatmap/first-visits-heatmap-widget/first-visits-heatmap-widget.partial.html',
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
        setSelectedWidget: '&',
        isLoading: '=?'
      },
      bindToController: true,
      controller: function() {},
      controllerAs: 'vm'
    };
  }
})();
