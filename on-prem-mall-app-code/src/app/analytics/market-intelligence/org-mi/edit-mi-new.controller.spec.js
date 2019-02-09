'use strict';

describe('EditMiNewController', function () {
  var $scope;
  var $q;
  var $controller;
  var $stateParamsMock = {};
  var currentOrganizationMock;
  var currentUserMock;
  var subscriptionList;
  var mockMarketIntelligenceService;
  var $timeout;
  var vm;
  var currentUserCopy;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$timeout_, _marketIntelligenceService_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;
    mockMarketIntelligenceService = _marketIntelligenceService_;
    setResources();
  }));

  describe('Segments', function () {
    beforeEach(function() {
      subscriptionList = [];
      vm = instantiateController();
      $timeout.flush();
      currentUserCopy = angular.copy(currentUserMock.preferences.market_intelligence[0]);
    });
    it('should be equal to current user segment', function () {
      expect(currentUserMock.preferences.market_intelligence[0]).toEqual(currentUserCopy);
    });

    it('should not be equal to current user segment', function () {
      updateSegment(currentUserMock);
      expect(currentUserMock.preferences.market_intelligence[0]).not.toEqual(currentUserCopy);
    });

    it('should be equal to current user segment after cancel', function () {
      vm.showNoMiFooterCancel();
      expect(currentUserMock.preferences.market_intelligence[0]).toEqual(currentUserCopy);
    });

  });

  function updateSegment(currentUserMock) {
    currentUserMock.preferences.market_intelligence[0].segments[0].timePeriod = 'month';
    currentUserMock.preferences.market_intelligence[0].segments[0].subscription = {
      'geography': {
        'value': {
          'src': {
            'geoType': 'REGION',
            'name': 'United States'
          },
          'name': 'United States'
        },
        'rule': 'Contains',
        'orgId': 103068,
        'name': 'Region'
      },
      'category': {
        'value': {
          'src': {
            'name': 'Family Apparel'
          },
          'name': 'Family Apparel'
        },
        'rule': 'Contains',
        'orgId': 103068,
        'name': 'Category'
      }
    };
  }

  function setResources() {
    var totalRetailUuid = 'da815dbc-f066-4807-a6ac-ae145e6b6242';

    currentOrganizationMock = {
      '_id': '58dc10e7e547d672dbbaa81d',
      'organization_id': 103068,
      'name': ' Retail Demo',
      'subscriptions': {
        'market_intelligence': true,
        'qlik': false,
        'large_format_mall': false,
        'interior': true,
        'perimeter': true,
        'labor': false,
        'sales': true,
        'realtime_traffic': true,
        'realtime_sales': true,
        'realtime_labor': false,
        'advanced': true,
        'campaigns': false,
        'consumer_behavior': false,
        'what_if_analysis': true
      }
    };

    var segments = [
      {
        'subscription': {
          'geography': {
            'value': {
              'src': {
                'geoType': 'REGION',
                'name': 'East Midlands'
              },
              'name': 'East Midlands'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Region'
          },
          'category': {
            'value': {
              'src': {
                'name': 'Total Mall'
              },
              'name': 'Total Mall'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Category'
          }
        },
        'timePeriod': 'week',
        'positionIndex': 0
      },
      {
        'subscription': {},
        'timePeriod': '',
        'positionIndex': 1
      },
      {
        'subscription': {
          'geography': {
            'value': {
              'src': {
                'geoType': 'REGION',
                'name': 'South East England'
              },
              'name': 'South East England'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Region'
          },
          'category': {
            'value': {
              'src': {
                'name': 'Total Mall'
              },
              'name': 'Total Mall'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Category'
          }
        },
        'timePeriod': '',
        'positionIndex': 2
      },
      {
        'subscription': {},
        'timePeriod': '',
        'positionIndex': 3
      },
      {
        'subscription': {
          'geography': {
            'value': {
              'src': {
                'geoType': 'REGION',
                'name': 'United States'
              },
              'name': 'United States'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Region'
          },
          'category': {
            'value': {
              'src': {
                'name': 'Family Apparel'
              },
              'name': 'Family Apparel'
            },
            'rule': 'Contains',
            'orgId': 103068,
            'name': 'Category'
          }
        },
        'timePeriod': '',
        'positionIndex': 4
      }];

    currentUserMock = {
      'username': 'testUser',
      'preferences': {
        'market_intelligence': [
          {
            'orgId': 103068,
            'segments': segments
          }
        ],
        'market_intelligence_charts': []
      }
    };

    subscriptionList = [{
      geography: {
        name: 'US',
        uuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        geoType: 'REGION'
      },
      category: {
        name: 'Total Retail',
        uuid: totalRetailUuid
      }
    }, {
      geography: {
        name: 'Northeast',
        geoType: 'REGION',
        parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        uuid: '2222'
      },
      category: {
        name: 'Total Retail',
        uuid: totalRetailUuid
      }
    }, {
      geography: {
        name: 'Midwest',
        geoType: 'REGION',
        parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        uuid: '3333'
      },
      category: {
        name: 'Total Retail',
        uuid: totalRetailUuid
      }
    }, {
      geography: {
        name: 'West',
        geoType: 'REGION',
        parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        uuid: '4444'
      },
      category: {
        name: 'Total Retail',
        uuid: totalRetailUuid
      }
    }, {
      geography: {
        name: 'South',
        geoType: 'REGION',
        parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        uuid: '5555'
      },
      category: {
        name: 'Total Retail',
        uuid: totalRetailUuid
      }
    }];

    mockMarketIntelligenceService = {
      getSubscriptions: function (orgId, hasGlobals, isCached) {
        angular.noop(orgId, hasGlobals, isCached);
        var defer = $q.defer();
        defer.resolve(subscriptionList);
        return defer.promise;
      }
    };
  }

  function instantiateController() {
    return $controller('EditMiNewController', {
      '$scope': $scope,
      '$stateParams': $stateParamsMock,
      'currentOrganization': currentOrganizationMock,
      'currentUser': currentUserMock,
      'marketIntelligenceService': mockMarketIntelligenceService
    });
    $timeout.flush();
  }
});
