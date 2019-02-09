'use strict';

describe('EditMiController', function () {
  var $scope;
  var $q;
  var $controller;
  var $stateParamsMock;
  var currentOrganizationMock;
  var currentUserMock;
  var marketDataMock;
  var marketIntelligenceSubscriptionMock;
  var controller;
  var subData = "subscriptions data";
  var stateMock = {
    go: function (stateName) {
      angular.noop(stateName);
    },
    params: {}
  };

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function ($rootScope, _$q_, _$controller_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $controller = _$controller_;
    controller = null;
    $stateParamsMock = {
      orgId: 3068
    };
    marketDataMock = {
      'Categories': {},
      'Countries': {},
      'Mall types': {},
      'Segments': {},
      'Regions': [
        'West',
        'South',
        'Midwest',
        'Northeast',
        'ok'
      ]
    }

    currentOrganizationMock = {
      'organization_id': 123,
      'name': 'Foobar',
      'subscriptions': {
        'advanced': false,
        'campaigns': false,
        'labor': false,
        'sales': false,
        'market_intelligence': false,
        'qlik': false,
        'large_format_mall': true,
        'interior': false,
        'perimeter': true
      }
    };
    currentUserMock = {localization: {date_format: 'MM/DD/YYYY'}};

  }));

  beforeEach(function () {
    currentUserMock = {
      preferences: {
        market_intelligence: {}
      }
    };
  });

  describe('activate', function () {
    beforeEach(function () {
      stateMock.current = {
        name: 'analytics.organization.marketIntelligence.edit'
      }
    });

    it('should set saveButtonDisabled to true', function () {
      instantiateController();
      mISubscriptionPromise().then(function (data) {
        initializeScope();
        expect(controller.saveButtonDisabled).toBe(true);
      });

    });

    it('should set errorHeading to true', function () {
      instantiateController();
      mISubscriptionPromise().then(function (data) {
        initializeScope();
        expect(controller.errorHeading).toBe(false);
      });
    });

    it('should set isLoading to true', function () {
      instantiateController();
      mISubscriptionPromise().then(function (data) {
        initializeScope();
        expect(controller.isLoading).toBe(false);
      });

    });

    it('should set defaultResetButtons to false if the current state is not edit', function () {
      stateMock.current = {
        name: 'analytics.organization.marketIntelligence.notEdit'
      }
    });

  });
  function mISubscriptionPromise() {
    var deferred = $q.defer();
    deferred.resolve(subData);
    return deferred.promise;
  }

  function initializeScope() {

  }

  function instantiateController() {
    controller = $controller('EditMiController', {
      '$scope': $scope,
      '$state': stateMock,
      '$stateParams': $stateParamsMock,
      'currentOrganization': currentOrganizationMock,
      'currentUser': currentUserMock,
      'marketData': marketDataMock,
      'marketIntelligenceSubscription': marketIntelligenceSubscriptionMock
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});
