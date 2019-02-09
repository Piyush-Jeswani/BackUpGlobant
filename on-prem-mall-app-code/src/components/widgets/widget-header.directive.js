(function() {
  'use strict';

  angular.module('shopperTrak.widgets')
    .directive('widgetHeader', widgetHeader)
    .controller('widgetHeaderController', function () {
      
    });

  function widgetHeader() {
    return {
      restrict: 'E',
      replace: true,
      transclude: {
        'left': '?left',
        'right': '?right'
      },
      templateUrl: 'components/widgets/widget-header.partial.html',
      scope: {
        title: '@widgetTitle',
        titleHref: '@',
        onExportClick: '&',
        setSelectedWidget: '&',
        exportIsDisabled: '=?disableExport',
        hideExportIcon: '=?',
        csvExport: '=?',
        onCsvExportClick: '&',
        icon: '@',
        hideLeftIcon:'=?',
        hideExportToCustomDashboardIcon:'=?',
        hideMiSettingsIcon:'=?'
      },
      controller: 'widgetHeaderController',
      controllerAs: 'vm',
      bindToController: true
    };
  }
})();
