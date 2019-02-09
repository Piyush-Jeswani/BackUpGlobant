(function () {
  'use strict';

  angular.module('shopperTrak.auth')
    .factory('authService', authService);

  authService.$inject = [
    '$rootScope', 
    '$http', 
    '$q', 
    '$translate', 
    'session', 
    'apiUrl', 
    'obfuscation', 
    'LocalizationService', 
    'requestManager',
    'googleAnalytics',
    'ObjectUtils',
  ];

  function authService(
    $rootScope, 
    $http, 
    $q, 
    $translate, 
    session, 
    apiUrl, 
    obfuscation, 
    LocalizationService, 
    requestManager,
    googleAnalytics,
    ObjectUtils
  ) {

    var cachedCurrentUser = null;

    function loginWithToken(authToken) {
      session.setToken(authToken);
      $rootScope.$broadcast('auth-login-success');
    }

    function login(username, password) {
      var deferred = $q.defer();

      if (username.match(/^demo/gi)) {
        obfuscation.enableForSession();
      } else {
        obfuscation.disableForSession();
      }
      var loginRequest = $http.post(apiUrl + '/auth', {
        username: username,
        password: password
      });

      loginRequest.then(function (response) {
        var authToken = response.data.result[0].token;
        session.setToken(authToken);
        cachedCurrentUser = response.data.result[0].user;
        LocalizationService.setUser(cachedCurrentUser);
        session.setUserId(cachedCurrentUser._id);
        requestManager.clearOtherUserCachedData();
        googleAnalytics.resetUserIdSentStatus();
        $rootScope.$broadcast('auth-login-success');
        deferred.resolve();
      }, function (response) {
        session.clear();
        requestManager.clearCache();
        deferred.reject(response);
      });

      return deferred.promise;
    }

  /**
   * Updates the in memory user used by the app.
   * This function should be called after a PUT request to update a user
   *
   * @param {object<user>} user - The entire user object as returned by the API after a PUT
   */
    function updateCachedUser(user) {
      if(ObjectUtils.isNullOrUndefined(user)) {
        throw new Error('A user must be provided');
      }

      cachedCurrentUser = user;
      LocalizationService.setUser(user);
    }

    function updateUserPreferencesCustomCharts(charts) {
      if (cachedCurrentUser) {
        cachedCurrentUser.preferences.custom_charts = charts;
      }
    }

    function updateUserPreferencesCustomDashboards(dashboards) {
      if (cachedCurrentUser) {
        cachedCurrentUser.preferences.custom_dashboards = dashboards;
      }
    }

    function updateMarketIntelligence(segments){
      if (cachedCurrentUser) {
        cachedCurrentUser.preferences.market_intelligence = segments;
      }
    }
    function logout() {
      session.clear();
      cachedCurrentUser = null;
      $rootScope.$broadcast('auth-logout-success');
    }

    function isAuthenticated() {
      return session.getToken() !== null;
    }

    function getCurrentUser(disableCache, disableBatching) {
      var deferred = $q.defer();

      if (disableCache !== true && cachedCurrentUser) {
        deferred.resolve(cachedCurrentUser);
      } else {
        var endpoint = '/auth/currentUser';

        if (disableBatching === true) {
          endpoint += '?noBatch=true';
        }

        $http.get(apiUrl + endpoint).then(
          function onSuccess(result) {
            cachedCurrentUser = result.data.result[0].user;
            LocalizationService.setUser(result.data.result[0].user);
            deferred.resolve(cachedCurrentUser);
          },
          function onError() {
            deferred.reject();
          });
      }

      return deferred.promise;
    }

    function changePassword(newPassword) {
      var deferred = $q.defer();

      $http.put(apiUrl + '/auth/currentUser', {
        password: newPassword
      })
        .then(function (result) {
          session.setToken(result.data.result[0].token);
          cachedCurrentUser = null;
          deferred.resolve();
        }).catch(function () {
          deferred.reject();
        });

      return deferred.promise;
    }

    function isAdminForOrg(orgID, currentUser) {
        //A Superuser can do anything baby!!!
        if (isSuperUser(currentUser)) return true; 

        //Check we have some valid info - if not we just return false and deny access.
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(orgID)) return false;
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(currentUser) || (!currentUser.hasOwnProperty('accessMap'))) return false;

        //Check the current users access map
        return currentUser.accessMap.setup.orgs_admin.indexOf(orgID) !== -1;
    }

    function isSuperUser(currentUser) {

        if (!ObjectUtils.isNullOrUndefinedOrEmpty(currentUser)) return false;
        
        if (currentUser.hasOwnProperty('superuser')) {
            return currentUser.superuser;
        }
        return false;
    }

    function isOrgAdmin(currentUser) {
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(currentUser)) return false;
        return (currentUser.accessMap.setup.orgs_admin.length > 0);
    }

    //Checks to see if the user has Org Admin capabilities but does not
    //check the org explicitly. See isAdminForOrg for this.
    function hasAdminAccess(currentUser) {
      return isOrgAdmin(currentUser) || isSuperUser(currentUser);
    }

    return {
      login: login,
      logout: logout,
      isAuthenticated: isAuthenticated,
      isAdminForOrg: isAdminForOrg,
      isOrgAdmin : isOrgAdmin,
      isSuperUser: isSuperUser,
      hasAdminAccess: hasAdminAccess,
      loginWithToken: loginWithToken,
      changePassword: changePassword,
      getCurrentUser: getCurrentUser,
      updateUserPreferencesCustomCharts: updateUserPreferencesCustomCharts,
      updateUserPreferencesCustomDashboards: updateUserPreferencesCustomDashboards,
      updateMarketIntelligence: updateMarketIntelligence,
      updateCachedUser: updateCachedUser
    };
  }
})();
