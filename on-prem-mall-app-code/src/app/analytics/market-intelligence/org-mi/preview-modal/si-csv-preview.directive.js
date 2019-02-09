(function(){
  'use strict';

  angular.module('shopperTrak')
  .directive('siCsv', function siCsv() {
    return {
      restrict: 'E',
      templateUrl: 'app/analytics/market-intelligence/org-mi/preview-modal/si-csv-preview.partial.html',
      bindToController: true,
      controller: 'siCsvController',
      controllerAs: 'vm',
      scope: {
        currentUser:'=',
        currentOrganization:'='
      }
    };
  })
  
})();