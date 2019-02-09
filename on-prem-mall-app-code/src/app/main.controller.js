(function() {
  'use strict';

  angular.module('shopperTrak').controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = [
    '$rootScope',
    '$state',
    '$cacheFactory',
    'authService',
    'ExportService',
    'compareStateManager',
    'redirectIfNecessary',
    'requestManager'
  ];

  function MainCtrl(
    $rootScope,
    $state,
    $cacheFactory,
    authService,
    ExportService,
    compareStateManager,
    redirectIfNecessary,
    requestManager
  ) {

    // isAuthenticated variable can be used to easily affect
    // views depending on login state.
    $rootScope.isAuthenticated = authService.isAuthenticated();
    $rootScope.$on('auth-login-success', function() {
      $rootScope.isAuthenticated = authService.isAuthenticated();
    });
    $rootScope.$on('auth-logout-success', function() {
      $state.go('home');
      $rootScope.isAuthenticated = authService.isAuthenticated();
      ExportService.clearExportCart();
      ExportService.deletePreviousExports();
      $cacheFactory.get('$http').removeAll();
      compareStateManager.clearAll();
    });

    // Bind state to root scope for access within template
    $rootScope.$state = $state;

    // Don't allow access to any other routes except 'home'
    // unless the user is authenticated.
    $rootScope.$on('$stateChangeStart', function (event, next) {

      //cancel all outstanding request to improve performance
      requestManager.cancelAllOutstandingRequests();

      if (next.name !=='home' && !authService.isAuthenticated()) {
        event.preventDefault();
        $state.go('home');
      }
    });

    $rootScope.$on('$stateChangeStart', redirectIfNecessary);
  }
})();
