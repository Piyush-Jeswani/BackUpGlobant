(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('atsComparisonWidget', atsComparisonWidget);

  function atsComparisonWidget() {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'components/widgets/comparison-widgets/kpi-compare-widgets/ats-comparison-widget.partial.html',
      scope: {
        orgId:                  '=',
        siteId:                 '=',
        zoneIds:                '=',
        dateRangeStart:         '=',
        dateRangeEnd:           '=',
        dateFormatMask:         '=',
        numberFormatName:       '=',
        onExportButtonClick:    '&onExportClick',
        exportButtonIsDisabled: '=?exportIsDisabled',
        exportButtonIsHidden:   '=?hideExportIcon',
        selectButtonVisibility: '=',
        availableWidgets:       '=?',
        setAreas:               '&',
        selectedAreas:          '=?',
        isLoading:              '=?',
        language:               '='
      },
      controller: function(){
        var vm = this;
        vm.passWidgetAreas = passWidgetAreas;
        function passWidgetAreas(copyFrom, copyTo) {
          vm.setAreas({copyFrom: copyFrom, copyTo: copyTo});
        }
      },
      controllerAs: 'vm',
      bindToController: true
    };
  }
})();
