(function () {
  'use strict';

  angular.module('shopperTrak')
    .factory('httpInterceptor', ['$q', '$rootScope', 'ObjectUtils', 'apiUrl', 'httpTimeOut', function ($q, $rootScope, ObjectUtils, apiUrl, httpTimeOut) {
      return {
        request: function (config) {
          if (config.url.substr(0, apiUrl.length) === apiUrl &&
            !config.url.includes('pdf') &&
            !config.url.includes('batch') &&
            !config.url.includes('auth') &&
            !config.url.includes(apiUrl + '/organizations')) {
            config.timeout = httpTimeOut;
            if(config.setTimeOut) config.timeout = httpTimeOut * config.setTimeOut;
          }
          return config;
        },
        responseError: function (rejection) {
          if(rejection.status <= 0)rejection.timedOut = true;
          return $q.reject(rejection);
        }
      };
    }]);
})();
