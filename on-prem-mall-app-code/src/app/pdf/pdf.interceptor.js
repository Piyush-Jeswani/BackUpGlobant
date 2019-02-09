(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('pdfInterceptor', ['$q', '$rootScope', 'apiUrl', function ($q, $rootScope, apiUrl) {
      return {
        request: function (config) {
          if ($rootScope.pdf && config.url.substr(0, apiUrl.length) === apiUrl) {
            if (config.params) {
              config.params.source = 'pdfExport';
            }
          }
          return config;
        },
        responseError: function (rejection) {
          return $q.reject(rejection);
        }
      };
    }]);
})();
