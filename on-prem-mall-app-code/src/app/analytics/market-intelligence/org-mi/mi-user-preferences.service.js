(function() {
  'use strict';

  angular.module('shopperTrak')
  .service('miUserPreferences', [
    'ObjectUtils',
    function (
      ObjectUtils
    ) {

      function segmentPreferencesAreConfigured(userPreferences, orgId) {
        if (ObjectUtils.isNullOrUndefinedOrEmpty(userPreferences.market_intelligence)) {
          return false;
        }

        var configuredSegments = getConfiguredSegments(userPreferences, orgId);

        if(configuredSegments.length === 0) {
          return false;
        }

        return true;
      }

      function getConfiguredSegments(userPreferences, orgId) {

        var selectedOrgSegment = _.findWhere(userPreferences.market_intelligence, {orgId: orgId});

        if (!ObjectUtils.isNullOrUndefined(selectedOrgSegment)) {
         var userSegments = selectedOrgSegment.segments;
        }

        if (!ObjectUtils.isNullOrUndefined(userSegments)) {
          var segmentsWithPositions = _.map(userSegments, function(segment, i) {
            if (!ObjectUtils.isNullOrUndefined(segment)) {
              segment.positionIndex = i;
            }

            return segment;
          });

        }

        return _.filter(segmentsWithPositions, function(segment) {
          return !ObjectUtils.isNullOrUndefined(segment) &&
                  !ObjectUtils.isNullOrUndefinedOrEmptyObject(segment.subscription);
        });
      }

      return {
        segmentPreferencesAreConfigured: segmentPreferencesAreConfigured,
        getConfiguredSegments: getConfiguredSegments
      };
    }]);
})();
