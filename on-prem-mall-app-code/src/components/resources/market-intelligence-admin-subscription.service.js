(function () {
  'use strict';
  angular.module('shopperTrak.resources').factory('MarketIntelligenceAdminSubscriptionResource', ['createResource', 'apiUrl', function (createResource, apiUrl ) {
    return createResource(apiUrl + '/mi/subscriptiontree?orgId=:orgId');
  }])
})();