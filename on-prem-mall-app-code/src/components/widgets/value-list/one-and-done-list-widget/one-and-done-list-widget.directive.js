(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('oneAndDoneListWidget', oneAndDoneListWidget);

  function oneAndDoneListWidget() {
    return {
      restrict: 'E',
      templateUrl: 'components/widgets/value-list/one-and-done-list-widget/one-and-done-list-widget.partial.html',
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
