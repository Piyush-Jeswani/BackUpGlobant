describe('SiteController', function() {
  var $controller;
  var $scope;
  var $q;
  var $timeout;

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


  it('should not redirect when a state other than analytics.organization.site is entered', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization.rubishState'
      }
    };

    $controller('SiteController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10
      },
      'currentSite': {
        'fullAccess': true
      },
      'locations': {
        'location_id': 3936
      },
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).not.toHaveBeenCalled();
  });

  it('should redirect analytics.organization.site.summary if locationIds', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization.site'
      }
    };

    $controller('SiteController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10,
        'subscriptions': {
          'interior': false
        }
      },
      'currentSite': {
        'site_id': 80045916,
        'fullAccess': true
      },
      'locations': [{
        'location_id': 3936
      }],
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    $scope.$broadcast('$stateChangeSuccess');

    expect($stateMock.go).toHaveBeenCalled();
  });

  it('should not route if no current access rights', function() {
    var $stateMock = {
      go: jasmine.createSpy('go'),
      current: {
        name: 'analytics.organization.site'
      }
    };

    $controller('SiteController', {
      '$scope': $scope,
      '$state': $stateMock,
      'currentOrganization': {
        'organization_id': 10,
        'subscriptions': {
          'interior': false
        }
      },
      'currentSite': {
        'site_id': 80045916,
        'fullAccess': false
      },
      'locations': [],
      '$translate' : translationsMock,
      'metricNameService': metricNameServiceMock,
      'currentUser': { }
    });

    $timeout.flush();

    expect(function() {
      $scope.$broadcast('$stateChangeSuccess');
    }).toThrow(new Error('No routes available with current access rights.'));

  });


});
