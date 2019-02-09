'use strict';

describe('MainCtrl', function() {


  var $rootScope;
  var $scope;
  var MainCtrl;
  var ExportService;
  var authServiceMock;
  var compareStateManagerMock;
  var $stateMock;
  var redirectIfNecessary = jasmine.createSpy('redirectIfNecessary');
  var requestManager;

  beforeEach(module('shopperTrak'));
  beforeEach(module(function($provide) {
    $provide.factory('redirectIfNecessary', function() {
      return redirectIfNecessary;
    });
  }));
  beforeEach(inject(function(_$rootScope_, $controller, _ExportService_, _requestManager_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    ExportService = _ExportService_;
    requestManager = _requestManager_;
    authServiceMock = {
      _isAuthenticated: false,
      isAuthenticated: function() {
        return authServiceMock._isAuthenticated;
      },
      logout: function() {
        authServiceMock._isAuthenticated = false;
        $rootScope.$broadcast('auth-logout-success');
      }
    };

    compareStateManagerMock = {
      clearAll: jasmine.createSpy('clearAll')
    };

    $stateMock = {
      go: function() {}
    };
    redirectIfNecessary = jasmine.createSpy('redirectIfNecessary');

    spyOn(ExportService, 'clearExportCart');
    spyOn(ExportService, 'deletePreviousExports');
    spyOn(requestManager, 'cancelAllOutstandingRequests');

    MainCtrl = $controller('MainCtrl', {
      '$scope': $scope,
      '$state': $stateMock,
      'authService': authServiceMock,
      'compareStateManager': compareStateManagerMock
    });
  }));



  it('should clear export cart on log out', function() {
    authServiceMock.logout();
    expect(ExportService.clearExportCart).toHaveBeenCalled();
  });



  it('should clear export history on log out', function() {
    authServiceMock.logout();
    expect(ExportService.deletePreviousExports).toHaveBeenCalled();
  });



  it('should clear compare view state on log out', function() {
    authServiceMock.logout();
    expect(compareStateManagerMock.clearAll).toHaveBeenCalled();
  });



  it('should call redirectIfNecessary on $stateChangeStart', function() {
    var fakeStateEvent = {
      preventDefault: function() {}
    };
    var fakeState = {};

    expect(redirectIfNecessary).not.toHaveBeenCalled();
    $rootScope.$broadcast('$stateChangeStart', fakeStateEvent, fakeState);
    expect(redirectIfNecessary).toHaveBeenCalled();
  });

  it('should call cancel all outstanding request on $stateChangeStart', function() {
    var fakeStateEvent = {
      preventDefault: function() {}
    };
    var fakeState = {};

    expect(requestManager.cancelAllOutstandingRequests).not.toHaveBeenCalled();
    $rootScope.$broadcast('$stateChangeStart', fakeStateEvent, fakeState);
    expect(requestManager.cancelAllOutstandingRequests).toHaveBeenCalled();
  });


});
