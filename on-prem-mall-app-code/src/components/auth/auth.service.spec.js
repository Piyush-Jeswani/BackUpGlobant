'use strict';

describe('authService', function () {
  var $rootScope;
  var $http;
  var $httpBackend;
  var authService;
  var googleAnalytics;
  var apiUrl;
  var session;
  var pdfInterceptor;
  var LocalizationService = {
    setUser: function () {
      return true;
    }
  };

  pdfInterceptor={};

  beforeEach(module('shopperTrak'));

  beforeEach(module('shopperTrak.auth'));

  beforeEach(module(function ($provide) {
    $provide.value('LocalizationService', LocalizationService);
    $provide.factory('pdfInterceptor', function () {
      return pdfInterceptor;
    });
  }));

  beforeEach(inject(function ($injector, _$http_, _$httpBackend_, _authService_, _session_, _apiUrl_, _googleAnalytics_) {
    $rootScope = $injector.get('$rootScope');
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    authService = _authService_;
    apiUrl = _apiUrl_;
    session = _session_;
    googleAnalytics = _googleAnalytics_;
    $httpBackend.expectGET('l10n/languages/en_US.json').respond(200);
  }));

  describe('login', function () {
    describe('successful authentication', function() {
      beforeEach(function() {
        var username = 'steve';
        var password = 'password123';

        $httpBackend.expectPOST(apiUrl + '/auth', {
          'username': username,
          'password': password
        }).respond(200, {
          result: [{
            'token': 'abcdefg1234',
            'user': {
              '_id': '54321'
            }
          }]
        });

        authService.login(username, password);
      });

      it('should reset the google analytics userid sent status', function() {
        spyOn(googleAnalytics, 'resetUserIdSentStatus');

        $httpBackend.flush();

        expect(googleAnalytics.resetUserIdSentStatus).toHaveBeenCalled();
      })

      it('should broadcast the auth-login-success event', function () {
        spyOn($rootScope, '$broadcast').and.callThrough();

        $httpBackend.flush();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('auth-login-success');
        expect(authService.isAuthenticated()).toBe(true);
      });

      it('should store the auth token in the session', function() {
        spyOn(session, 'setToken');

        $httpBackend.flush();

        expect(session.setToken).toHaveBeenCalledWith('abcdefg1234');
      });

      it('should store the userId in the session', function() {
        spyOn(session, 'setUserId');

        $httpBackend.flush();
        
        expect(session.setUserId).toHaveBeenCalledWith('54321');
      })
    });

    it('should not log user in if authentication fails', function () {
      var username = 'steve';
      var password = 'password123';

      spyOn($rootScope, '$broadcast').and.callThrough();

      $httpBackend.expectPOST(apiUrl + '/auth', {
        'username': username,
        'password': password
      }).respond(401);

      authService.login(username, password);

      $httpBackend.flush();

      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('auth-login-success');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should turn on data obfuscation if given "demouser" as username', inject(function (obfuscation) {
      spyOn(obfuscation, 'enableForSession');
      authService.login('demouser', 'trustno1');
      expect(obfuscation.enableForSession).toHaveBeenCalled();
    }));

    it('should turn on data obfuscation if given "DeMoUsEr" as username', inject(function (obfuscation) {
      spyOn(obfuscation, 'enableForSession');
      authService.login('DeMoUsEr', 'trustno1');
      expect(obfuscation.enableForSession).toHaveBeenCalled();
    }));

  });

  describe('loginWithToken', function () {
    it('should log user in', function () {
      spyOn($rootScope, '$broadcast').and.callThrough();
      authService.loginWithToken('abcdefg1234');
      expect($rootScope.$broadcast).toHaveBeenCalled();
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', function () {
    it('should log user out', function () {
      spyOn($rootScope, '$broadcast').and.callThrough();
      authService.logout();
      expect($rootScope.$broadcast).toHaveBeenCalledWith('auth-logout-success');
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('changePassword', function () {
    var password = 'trustno1';
    var authResponseMock = {
      result: [{
        'token': 'abcdefg1234'
      }]
    };

    beforeEach(function () {
      $httpBackend.expectPUT(apiUrl + '/auth/currentUser', {
        password: password
      }).respond(200, authResponseMock);
    });

    it('should request API for password change', function () {
      authService.changePassword(password);
      $httpBackend.flush();
    });

    it('should reset the authentication token', function () {
      authService.changePassword(password);
      spyOn(session, 'setToken');
      $httpBackend.flush();
      expect(session.setToken).toHaveBeenCalledWith(authResponseMock.result[0].token);
    });
  });

  it('should log user out when API returns 419', function () {
    authService.loginWithToken('abcdefg1234');

    expect(authService.isAuthenticated()).toBe(true);

    // Make a test request and respond with 419 (login expired)
    $httpBackend.expectGET(apiUrl + '/test').respond(419);
    $http.get(apiUrl + '/test');
    $httpBackend.flush();

    expect(authService.isAuthenticated()).toBe(false);
  });
});
