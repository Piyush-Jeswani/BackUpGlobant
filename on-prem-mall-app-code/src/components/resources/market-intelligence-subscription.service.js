(function () {
  'use strict';

  angular.module('shopperTrak.resources').factory('MarketIntelligenceSubscriptionResource', ['createResource', 'apiUrl', function (createResource, apiUrl ) {
    return createResource(apiUrl + '/mi/subscription?orgId=:orgId');
  }])

})();