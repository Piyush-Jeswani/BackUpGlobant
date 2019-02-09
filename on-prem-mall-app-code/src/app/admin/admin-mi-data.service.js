(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('adminMIData', adminMIData);

  adminMIData.$inject = [
    '$http',
    'apiUrl',
    'authService'
  ];

  function adminMIData($http, apiUrl, authService) {

    function updateSubsciptionTree(data) {
      authService.getCurrentUser().then(function (currentUser) {
        if (currentUser.superuser) {
          var url = apiUrl + '/mi/subscriptiontree';
          $http.post(url, data)
          .then()
          .catch(function (err) {
            console.error(err)
          })
        }
      });
    }

    return {
      updateSubsciptionTree: updateSubsciptionTree,
    };
  }
})();
