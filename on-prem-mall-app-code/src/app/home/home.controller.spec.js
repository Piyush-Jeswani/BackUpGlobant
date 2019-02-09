'use strict';

describe('HomeCtrl', function() {
  // These variables are set in the beforeEach block of this describe block
  var $rootScope;
  var $scope;
  var $controller;
  var $stateMock;
  var $q;
  var $timeout;
  var authServiceMock;

  var apiUrl = 'https://api.url';

  describe('with unauthenticated users', function() {
    var homeCtrl;

    beforeEach(function() {
      authServiceMock.isAuthenticated = function() {
        return false;
      };

      homeCtrl = $controller('HomeCtrl', {
        '$scope': $scope,
        '$state': $stateMock,
        'authService': authServiceMock
      });
    });

    it('should present an empty login form if user is not authenticated', function() {
      expect(homeCtrl.loginFormIsVisible).toBe(true);
      expect(homeCtrl.username).toBe('');
      expect(homeCtrl.password).toBe('');
      expect(homeCtrl.loginError).toBe(null);
    });

    it('should show the login form when "auth-logout-success" event is fired', function() {
      homeCtrl.loginFormIsVisible = false;
      $rootScope.$broadcast('auth-logout-success');
      expect(homeCtrl.loginFormIsVisible).toBe(true);
    });

    describe('handleLoginFormSubmit', function() {
      it('should not attempt to log user in if both username and password are empty', function() {
        spyOn(authServiceMock, 'login').and.callThrough();
        homeCtrl.handleLoginFormSubmit();
        expect(authServiceMock.login).not.toHaveBeenCalled();
      });

      it('should not attempt to log user in if the username is empty but password is filled', function() {
        homeCtrl.password = 'trustno1';
        spyOn(authServiceMock, 'login').and.callThrough();
        homeCtrl.handleLoginFormSubmit();
        expect(authServiceMock.login).not.toHaveBeenCalled();
      });

      it('should not attempt to log user in if the password is empty but username is filled', function() {
        homeCtrl.username = 'billmurray';
        spyOn(authServiceMock, 'login').and.callThrough();
        homeCtrl.handleLoginFormSubmit();
        expect(authServiceMock.login).not.toHaveBeenCalled();
      });

      it('should attempt to log user in if username and password are filled', function() {
        homeCtrl.username = 'billmurray';
        homeCtrl.password = 'trustno1';
        spyOn(authServiceMock, 'login').and.callThrough();
        homeCtrl.handleLoginFormSubmit();
        expect(authServiceMock.login).toHaveBeenCalledWith('billmurray', 'trustno1');
      });

      it('should display an error if login fails', function() {
        homeCtrl.username = 'billmurray';
        homeCtrl.password = 'trustno1';
        spyOn(authServiceMock, 'login').and.callFake(function() {
          var deferred = $q.defer();

          deferred.reject({status: 500});

          return deferred.promise;
        });
        homeCtrl.handleLoginFormSubmit();
        $timeout.flush();
        expect(authServiceMock.login).toHaveBeenCalledWith('billmurray', 'trustno1');
        expect(homeCtrl.loginError).not.toBe(null);
        expect(homeCtrl.loginError.length > 0).toBe(true);
      });
    });
  });

  it('should redirect an authenticated user to analytics', function() {
    authServiceMock.isAuthenticated = function() {
      return true;
    };
    $controller('HomeCtrl', {
      '$scope': $scope,
      '$state': $stateMock,
      'authService': authServiceMock
    });
    expect($stateMock.go).toHaveBeenCalledWith('analytics');
  });

  beforeEach(module('shopperTrak'));
  beforeEach(function() {
    module(function($provide) {
      $provide.constant('apiUrl', apiUrl);
    });
  });
  beforeEach(inject(function(_$rootScope_, _$controller_, _$q_, _$timeout_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;

    $stateMock = {
      go: jasmine.createSpy('go')
    };

    authServiceMock = {
      login: function() {
        return {
          then: function() {
            return {
              catch: function() { }
            }
          }
        };
      }
    };
  }));
});
