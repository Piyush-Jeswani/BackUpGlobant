(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('trafficListWidget', trafficListWidget);

  function trafficListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/traffic-list-widget/traffic-list-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        dateRangeStart: '=',
        dateRangeEnd: '=',
        locationTypes: '=',
        numberFormatName: '=',
        floor: '=?',
        onLocationClick: '=?',
        hideExportIcon: '=',
        onExportClick: '&',
        exportIsDisabled: '=?',
        hideLocationList: '=?',
        isLoading: '=?',
        setSelectedWidget: '&'
      }
    };
  }
})();
