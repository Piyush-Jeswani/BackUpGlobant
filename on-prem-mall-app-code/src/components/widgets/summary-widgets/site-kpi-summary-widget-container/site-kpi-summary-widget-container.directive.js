(function () {
  'use strict';

  angular
    .module('shopperTrak.widgets')
    .directive('kpiSummaryWidgetContainer', kpiSummaryWidgetContainer);

  function kpiSummaryWidgetContainer() {
    return {
      templateUrl: 'components/widgets/summary-widgets/site-kpi-summary-widget-container/site-kpi-summary-widget-container.partial.html',
      scope: {
        orgId:                 '=',
        siteId:                '=',
        zoneId:                '=',
        dateRange:             '=',
        compareRange1:         '=',
        compareRange1Type:     '=',
        compareRange2:         '=',
        compareRange2Type:     '=',
        operatingHours:        '=',
        firstDayOfWeekSetting: '=',
        multiplier:            '=?',
        widgetIcon:            '@',
        kpiDataLoaded:         '&',
        onExportClick:         '&',
        exportIsDisabled:      '=?',
        siteHasLabor:          '=',
        siteHasSales:          '=',
        currentOrganization:   '=',
        currentSite:           '=',
        currentUser:           '=',
        isLoading:             '=?',
        hideExportIcon:        '=?',// used only by the PDF exports
        currencySymbol:        '=?', // used only by the PDF exports
        setSelectedWidget:     '&?',
        salesCategories:       '=?',
        orgMetrics:            '=?' // This is passed in on the custom dashboard, and the PDF
      },
      controller: 'KpiSummaryWidgetContainerController',
      bindToController: true,
      controllerAs: 'vm'
    };
  }
})();

