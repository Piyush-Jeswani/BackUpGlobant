(function() {
  'use strict';

  angular.module('shopperTrak.auth')
  .service('session',
  ['localStorageService',
  function(localStorageService) {
    function setToken(authToken) {
      if(authToken && authToken.length > 0) {
        localStorageService.set('authToken', authToken);
      }
    }

    function clear() {
      localStorageService.remove('authToken');
      localStorageService.remove('calendars');
      localStorageService.remove('userId');
    }

    function getToken() {
      return localStorageService.get('authToken');
    }

    function setUserId(userId) {
      localStorageService.set('userId', userId);
    }

    function getUserId() {
      return localStorageService.get('userId');
    }

    return {
      setToken: setToken,
      getToken: getToken,
      setUserId: setUserId,
      getUserId: getUserId,
      clear: clear
    };
  }]);
})();
