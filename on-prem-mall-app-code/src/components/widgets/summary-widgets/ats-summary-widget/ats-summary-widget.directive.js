'use strict';

angular.module('shopperTrak.widgets').directive('atsSummaryWidget', function() {
  return {
    templateUrl: 'components/widgets/summary-widgets/ats-summary-widget/ats-summary-widget.partial.html',
    scope: {
      orgId:          '=orgId',
      siteId:         '=siteId',
      dateRangeStart: '=dateRangeStart',
      dateRangeEnd:   '=dateRangeEnd',
      compareRange1Start: '=compareRange1Start',
      compareRange1End: '=compareRange1End',
      compareRange2Start: '=compareRange2Start',
      compareRange2End: '=compareRange2End',
      currentOrganization: '=currentOrganization',
      currentUser: '=currentUser',
      firstDayOfWeekSetting: '=firstDayOfWeekSetting',
      displayUniqueReturning: '=displayUniqueReturning',
      operatingHours:   '=operatingHours',
      onExportClick:    '&onExportClick',
      exportIsDisabled: '=?exportIsDisabled',
      hideExportIcon:   '=?hideExportIcon',
      widgetData:       '=?widgetData',
      isLoading:        '=isLoading',
      selectedTags:     '=selectedTags',
      language:         '=language'
    }
  };
});
