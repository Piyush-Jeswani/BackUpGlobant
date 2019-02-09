'use strict';

describe('AnalyticsController', function() {
  var $scope;
  var $controller;

  var organizations;

  var trackingMock = {
    sendPageView: function (page) {
      // do nothing
    }
  }

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;

    spyOn(_, 'debounce').and.callFake(function(cb) { 
      return function(event, toState, fromState) { 
        cb(event, toState, fromState);
      }
    });

    organizations = [{
      'organization_id': 1000
    }, {
      'organization_id': 2000
    }];
  }));

  it('should redirect to the first organization if state is analytics', function() {
    var $stateMock = {
      current: {
        name: 'analytics'
      },
      go: jasmine.createSpy('go')
    };

    $controller('AnalyticsController', {
      '$scope': $scope,
      '$state': $stateMock,
      'organizations': organizations,
      'googleAnalytics': trackingMock
    });

    expect($stateMock.go).not.toHaveBeenCalled();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).toHaveBeenCalledWith(
      'analytics.organization',
      { orgId: organizations[0].organization_id }
    );
  });

  it('should not redirect if state is not analytics', function() {
    var $stateMock = {
      current: {
        name: 'analytics.organization'
      },
      go: jasmine.createSpy('go')
    };

    $controller('AnalyticsController', {
      '$scope': $scope,
      '$state': $stateMock,
      'organizations': organizations,
      'googleAnalytics': trackingMock
    });

    expect($stateMock.go).not.toHaveBeenCalled();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).not.toHaveBeenCalled();
  });
});
