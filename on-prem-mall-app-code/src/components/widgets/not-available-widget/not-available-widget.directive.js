'use strict';

angular.module('shopperTrak.widgets').directive('notAvailableWidget',
[function() {
  return {
    templateUrl: 'components/widgets/not-available-widget/not-available-widget.partial.html',
    transclude: true,
    scope: {
      widgetTitle:      '@widgetTitle',
      widgetIcon:       '@widgetIcon',
      exportIsDisabled: '=?exportIsDisabled',
      size:             '@?size',
      hideExportIcon:   '=?hideExportIcon',
      language:         '=language'
    },
    link: function(scope) {
      if (!angular.isDefined(scope.size)) {
        scope.size = 'small';
      }
    }
  };
}]);
