(function () {
  'use strict';
  angular
  .module('shopperTrak')
  .service('MiService', ['$http', '$q', '$rootScope', '$stateParams', MiService]);

  function MiService($http, $q, $rootScope, $stateParams, MiService) {
    $rootScope.$watchCollection(function () {
      return $stateParams;
    }, function () {
      MiService.getNationalIndex('US')
    });
    var MiService = this;
    MiService.indexChange = 2.09;
    
    MiService.getNationalIndex = function (passedIndex) {
      var defer = $q.defer();
      var httpObject = {
        passedObj: {
          'dateStart': $stateParams.dateRangeStart,
          'dateEnd': $stateParams.dateRangeEnd,
          'filterBy': {
            'country': passedIndex
          }
        },
        successRes: function (response) {
          MiService.indexChange = response.data.valueAsString;
          defer.resolve(response)
        },
        errorRes: function (error) {
          defer.reject(error)
        }
      };
      $http({
        method: 'POST',
        url: 'https://rdc-api-staging.shoppertrak.com/api/v1/mi/index',
        data: httpObject.passedObj
      }).then(httpObject.successRes, httpObject.errorRes);
      return defer.promise;
    };
    return MiService;
  }
})();
