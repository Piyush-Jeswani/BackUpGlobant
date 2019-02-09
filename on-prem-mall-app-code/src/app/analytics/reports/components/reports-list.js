
(function () {
  'use strict';

  var reportsCollectionsComponent = {
    templateUrl: 'app/analytics/reports/reports.partial.html',
    controller: 'reportsController',
    controllerAs: 'vm',
    bindings: {
      currentUser: '=',
      organizations: '=',
      currentOrganization: '=',
      sites: '='
    }
  };

  angular.module('shopperTrak').component('reportsCollections', reportsCollectionsComponent);
})();
