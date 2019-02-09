(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('visitsAfterListWidget', visitsAfterListWidget);

  function visitsAfterListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/visits-after-list-widget/visits-after-list-widget.partial.html',
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
