'use strict';

angular.module('shopperTrak.widgets').directive('kpiSummaryWidget', function () {
  return {
    templateUrl: 'components/widgets/summary-widgets/kpi-summary-widget/kpi-summary-widget.partial.html',
    controller: 'KpiSummaryWidgetController',
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      orgId:                  '=orgId',
      siteId:                 '=siteId',
      widgetTitle:            '=widgetTitle',
      dateRange:              '=dateRange',
      compareRange1:          '=compareRange1',
      compareRange2:          '=compareRange2',
      compareRange1Type:      '=compareRange1Type',
      compareRange2Type:      '=compareRange2Type',
      currentOrganization:    '=currentOrganization',
      currentSite:            '=currentSite',
      currentUser:            '=currentUser',
      dateRangeKeys:          '=dateRangeKeys',
      firstDayOfWeekSetting:  '=firstDayOfWeekSetting',
      displayUniqueReturning: '=displayUniqueReturning',
      operatingHours:         '=operatingHours',
      onExportClick:          '&onExportClick',
      exportIsDisabled:       '=?exportIsDisabled',
      hideExportIcon:         '=?hideExportIcon',
      widgetData:             '=?widgetData',
      isLoading:              '=?isLoading',
      selectedTags:           '=selectedTags',
      customTags:             '=customTags',
      hasLabor:               '=hasLabor',
      hasSales:               '=hasSales',
      compStores:             '=?compStores',   // used only by the PDF exports
      compStoresRange:        '=?',
      currencySymbol:         '=?currencySymbol',// used only by the PDF exports
      setSelectedWidget:      '&setSelectedWidget',
      salesCategories:        '=?',
      externalLoad:           '=?',
      hasError:               '=?',
      orgMetrics:             '=?' // This is passed in on the custom dashboard, and the PDF
    }
  };
});
