(function() {
  'use strict';

  angular.module('shopperTrak.routing')
    .factory('routeUtils', ['LocalizationService', routeUtils]);

  function routeUtils(LocalizationService) {
    function getAncestorStateNames(stateName) {
      var stateNames = [];
      var parentStateName = getParentStateName(stateName);
      if (parentStateName) {
        stateNames.push(parentStateName);
        return stateNames.concat(
          getAncestorStateNames(parentStateName)
        );
      } else {
        return stateNames;
      }
    }

    function getParentStateName(stateName) {
      var index = stateName.lastIndexOf('.');
      if (index >= 0) {
        return stateName.substring(0, index);
      }
    }

    function getDefaultDateRangeParams() {
      var startOfWeek = LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week');

      var endOfWeek = LocalizationService.getLastDayOfCurrentWeek().subtract(1, 'week');

      return {
        dateRangeStart: startOfWeek,
        dateRangeEnd: endOfWeek
      };
    }

    function getDefaultDateRangeParamsWTD() {
      var startOfWeek = LocalizationService.getFirstDayOfCurrentWeek();

      var endOfWeek = moment().subtract(1, 'day').endOf('day');

      return {
        dateRangeStart: startOfWeek,
        dateRangeEnd: endOfWeek
      };
    }

    return {
      getAncestorStateNames: getAncestorStateNames,
      getDefaultDateRangeParams: getDefaultDateRangeParams,
      getDefaultDateRangeParamsWTD: getDefaultDateRangeParamsWTD
    };

  }
})();
