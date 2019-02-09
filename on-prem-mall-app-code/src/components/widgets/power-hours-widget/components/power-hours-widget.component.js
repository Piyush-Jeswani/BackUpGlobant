(function () {
  'use strict';

  var powerHoursWidgetComponent = {
    templateUrl: 'components/widgets/power-hours-widget/views/power-hours-widget.partial.html',
    controller: 'powerHoursWidgetController as vm',
    bindings: {
      zoneId: '=',
      dateRangeStart: '=',
      dateRangeEnd: '=',
      compStores: '=?',
      compStoresRange: '=?',
      activeOption: '=?',
      pdfOrientation:'=?',
      currentUser: '=',
      orgId: '=?',
      currentOrganization: '=?',
      siteId: '=?',
      currentSite: '=?',
      operatingHours: '=',
      language: '=',
      hideExportIcon: '=',
      onExportClick: '&',
      exportIsDisabled: '=?',
      summaryKey: '@',
      currencySymbol: '=?',
      isExport: '=?',
      setSelectedWidget: '&',
      isLoading: '=?',
      salesCategories: '=?',
      customTags: '=?',
      selectedTags: '=?',
      isSalesMetricSelected: '=?',
      orgMetrics: '=?' // This is passed in on the custom dashboard, and the PDF
    }
  };

  angular.module('shopperTrak.widgets').component('powerHoursWidget', powerHoursWidgetComponent);
})();
