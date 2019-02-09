(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('visitsBeforeListWidget', visitsBeforeListWidget);

  function visitsBeforeListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/visits-before-list-widget/visits-before-list-widget.partial.html',
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
