(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('firstVisitsListWidget', firstVisitsListWidget);

  function firstVisitsListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/first-visits-list-widget/first-visits-list-widget.partial.html',
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
