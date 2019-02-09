'use strict';

angular.module('shopperTrak.widgets').directive('otherAreasTrafficTableWidget', function() {
  return {
    templateUrl: 'components/widgets/table-widget/other-areas-traffic-table-widget/other-areas-traffic-table-widget.partial.html',
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
      currentOrganization:    '=',
      currentUser:            '=',
      firstDayOfWeekSetting:  '=',
      operatingHours:         '=',
      onExportClick:          '&',
      exportIsDisabled:       '=?',
      hideExportIcon:         '=?',
      zoneFilterQuery:        '=',
      activeFilterQuery:      '=',
      activeSortType:         '=?',
      widgetTitle:            '@',
      widgetIcon:             '@',
      language:               '=',
      comparisonColumnIndex:  '=?',
      childProperty:          '=?',
      sortType:               '=?',
      isLoading:              '=?',
      setSelectedWidget:      '&',
      orgMetrics:             '=?' // This is passed in on the custom dashboard, and the PDF
    }
  };
});
