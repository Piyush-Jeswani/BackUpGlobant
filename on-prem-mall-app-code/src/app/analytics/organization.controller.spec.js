
'use strict';

describe('OrganizationController', function() {
  var $controller;
  var $scope;
  var $q;
  var $timeout;

  var subscriptionsService = {
    onlyMiSubscription: function () {
      return false;
    }
  };

  var translationsMock = {
    use: function(lang) {
      var deferred = $q.defer();
      angular.noop(lang);
      deferred.resolve();
      return deferred.promise;
    }
  };

  var metricNameServiceMock = {
    applyCustomMetricNames: function(org) {
      var deferred = $q.defer();
      angular.noop(org);
      deferred.resolve();
      return deferred.promise;
    }
  };

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function($rootScope, _$controller_, _$q_, _$timeout_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $q = _$q_;
    $timeout = _$timeout_;
  }));


  it('should redirect to MI Page if only subscription is market_intelligence', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization'
      }
    };

    $controller('OrganizationController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'sites': [{
        'site_id': 100
      }],
      'currentUser': { },
      'SubscriptionsService': {
        onlyMiSubscription: function () {
          return true;
        }
      },
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock
    });

    $timeout.flush();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).toHaveBeenCalledWith('analytics.organization.marketIntelligence.dashboard');
  });

  it('should redirect to site when analytics.organization state is entered if there is only one site', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization'
      }
    };

    $controller('OrganizationController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'sites': [{
        'site_id': 100
      }],
      'SubscriptionsService':subscriptionsService,
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).toHaveBeenCalledWith('analytics.organization.site', {
      'orgId': 10,
      'siteId': 100
    });
  });

  it('should redirect to organization summary when analytics.organization state is entered if there are multiple sites', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization'
      }
    };

    $controller('OrganizationController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'sites': [{
        'site_id': 100
      }, {
        'site_id': 200
      }],
      'SubscriptionsService':subscriptionsService,
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).toHaveBeenCalledWith('analytics.organization.summary');
  });

  it('should not redirect when a state other than analytics.organization is entered', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization.bogusState'
      }
    };

    $controller('OrganizationController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'sites': [{
        'site_id': 100
      }],
      'SubscriptionsService':subscriptionsService,
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).not.toHaveBeenCalled();
  });

  it('should store sites to viewmodel', function() {
    var $stateMock = {
      go: function() {},
      current: {
        name: 'analytics.organization'
      }
    };

    var sitesMock = [{
      'site_id': 100
    }];

    var controller = $controller('OrganizationController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'sites': sitesMock,
      'SubscriptionsService':subscriptionsService,
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    expect(controller.sites).toBe(sitesMock);
  });
});
