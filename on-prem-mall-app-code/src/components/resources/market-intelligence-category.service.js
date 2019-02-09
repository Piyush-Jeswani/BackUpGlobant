//ToDo: Check if this file is still needed when MI work is completed
(function () {
  'use strict';

  angular.module('shopperTrak.resources').factory('MarketIntelligenceCategoryResource', ['createResource', 'apiUrl', function (createResource, apiUrl) {
    return createResource(apiUrl + '/mi/categories');
  }])

})();