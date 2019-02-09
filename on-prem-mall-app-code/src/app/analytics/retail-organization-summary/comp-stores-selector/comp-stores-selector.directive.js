'use strict';

angular.module('shopperTrak').directive('compStoresSelector', function() {
  return {
    templateUrl: 'app/analytics/retail-organization-summary/comp-stores-selector/comp-stores-selector.partial.html',
    scope: {
      label: '@',
      selected: '='
    },
    controller: function(){

    },
    controllerAs: 'vm',
    bindToController: true
  };

});
