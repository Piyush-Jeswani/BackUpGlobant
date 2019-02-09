(function() {
  'use strict';

  angular.module('shopperTrak.auth')
  .factory('authHttpInterceptor', ['$q', '$rootScope', 'apiUrl', 'session', function($q, $rootScope, apiUrl, session) {
    return {
      request: function(config) {
        var token;
        if (
          config.url.substr(0, apiUrl.length) === apiUrl &&
          session.getToken() !== null && config.url !== apiUrl + '/auth'
        ) {
          token = session.getToken();
          if(token) {
            config.headers.Authorization = 'Bearer ' + token;
          }
        }
        return config;
      },
      responseError: function(rejection) {
        if (rejection.status === 419) {
          // TODO: Remove duplication of authService.logout
          session.clear();
          $rootScope.$broadcast('auth-logout-success');
        }
        return $q.reject(rejection);
      }
    };
  }]);
})();
