'use strict';

angular.module('shopperTrak.widgets').directive('tenantTrafficTableWidget', function() {
  return {
    templateUrl: 'components/widgets/table-widget/tenant-traffic-table-widget/tenant-traffic-table-widget.partial.html',
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
      operatingHours:         '=',
      onExportClick:          '&',
      exportIsDisabled:       '=?',
      hideExportIcon:         '=?',
      zoneFilterQuery:        '=',
      activeFilterQuery:      '=',
      activeSortType:         '=?',
      widgetTitle:            '@',
      language:               '=',
      widgetIcon:             '@',
      currencySymbol:         '=?',
      comparisonColumnIndex:  '=?',
      childProperty:          '=?',
      sortType:               '=?',
      isLoading:              '=?',
      setSelectedWidget:      '&'
    }
  };
});
