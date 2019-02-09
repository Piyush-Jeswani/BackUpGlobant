'use strict';

angular.module('shopperTrak.widgets').directive('realTimeDataWidget', function () {
  return {
    templateUrl: 'components/widgets/real-time-data-widget/real-time-data-widget.partial.html',
    controller: 'realTimeDataWidgetCtrl',
    scope: {
      orgId: '=orgId',
      siteId: '=siteId',
      sites: '=?',
      selectedSites: '=?',
      selectedSitesInfo: '=?',
      singleSite: '=?',
      refreshData: '=?',
      hierarchyTagId: '=?',
      selectedTags: '=?',
      selectedTagsSites: '=?',
      zoneId: '=?',
      widgetTitle: '=widgetTitle',
      currentOrganization: '=currentOrganization',
      currentSite: '=currentSite',
      currentUser: '=currentUser',
      operatingHours: '=operatingHours',
      onExportClick: '&onExportClick',
      exportIsDisabled: '=?exportIsDisabled',
      hideExportIcon: '=?hideExportIcon',
      widgetData: '=?widgetData',
      isLoading: '=?isLoading',
      hasLabor: '=hasLabor',
      hasSales: '=hasSales',
      showCompareTimePeriod: '=?',
      compStores: '=?compStores',   // used only by the PDF exports
      currencySymbol: '=?currencySymbol',// used only by the PDF exports
      enterExit:'=?',
      hideExportToCustomDashboardIcon:'=?',
      orgMetrics: '=?'
    }
  };
});
