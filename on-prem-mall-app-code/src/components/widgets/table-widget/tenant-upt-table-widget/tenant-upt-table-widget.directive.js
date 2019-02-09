'use strict';

angular.module('shopperTrak.widgets').directive('tenantUptTableWidget', function() {
  return {
    templateUrl: 'components/widgets/table-widget/tenant-upt-table-widget/tenant-upt-table-widget.partial.html',
    scope: {
      orgId:                  '=',
      siteId:                 '=?',
      site:                   '=?',
      zoneId:                 '=',
      dateRangeStart:         '=',
      dateRangeEnd:           '=',
      compareRange1Start:     '=',
      compareRange1End:       '=',
      compareRange1Type:      '=',
      compareRange2Start:     '=',
      compareRange2End:       '=',
      compareRange2Type:      '=',
      currentUser:            '=',
      currentOrganization:    '=',
      firstDayOfWeekSetting:  '=',
      onExportClick:          '&',
      exportIsDisabled:       '=?',
      hideExportIcon:         '=?',
      orderByString:          '=?',
      zoneFilterQuery:        '=',
      activeSortType:         '=',
      activeFilterQuery:      '=',
      widgetTitle:            '@',
      language:               '=',
      widgetIcon:             '@',
      currencySymbol:         '=?',
      isLoading:              '=?',
      widgetIsLoading:        '=?',
      setSelectedWidget:      '&', // Custom Dashboards
      currentView:            '=?'
    }
  };
});
