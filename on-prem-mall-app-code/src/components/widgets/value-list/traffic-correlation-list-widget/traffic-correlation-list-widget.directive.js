(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('trafficCorrelationListWidget', trafficCorrelationListWidget);

  function trafficCorrelationListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/traffic-correlation-list-widget/traffic-correlation-list-widget.partial.html',
      scope: {
        orgId: '=',
        siteId: '=',
        locationId: '=',
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
