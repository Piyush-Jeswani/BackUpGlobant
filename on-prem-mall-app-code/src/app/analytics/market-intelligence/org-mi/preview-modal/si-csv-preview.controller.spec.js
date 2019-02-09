'use strict';

describe('siCsv', function() {
  var $scope, $compile, controller, $q, $stateParams;

  var marketIntelligenceService, mockMarketIntelligenceService;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));
  beforeEach(inject(putTemplateToTemplateCache));
  beforeEach(inject(function($rootScope, _$compile_, _$q_, _$stateParams_, _marketIntelligenceService_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    marketIntelligenceService = _marketIntelligenceService_;
  }));

  beforeEach(function () {
    $stateParams.orgId = 1000003068;
  });

  mockMarketIntelligenceService = {
    getSubscriptions: function (orgId, hasGlobals, isCached) {
      angular.noop(orgId, hasGlobals, isCached);
      var defer = $q.defer();
      defer.resolve(getSubscriptions());
      return defer.promise;
    }
  };

  describe('activate()', function() {
    beforeEach(function () {
      spyOn(marketIntelligenceService, 'getSubscriptions').and.callFake(mockMarketIntelligenceService.getSubscriptions);
      controller = renderDirectiveAndDigest();
    });

    it('should have geography tree accordion configuration setup', function() {
      expect(controller.geographyByCategory.displayProperty).toEqual('name');
      expect(controller.geographyByCategory.multiSelect).toEqual(true);
    });
    
    it('should call getSubscriptions with certain parameters', function() {
      expect(marketIntelligenceService.getSubscriptions).toHaveBeenCalledWith(1000003068, false, true);
    });
    
    it('should set vm.selectedCategory to the first category from the category list', function() {
      expect(controller.selectedCategory).toEqual(controller.subscribedCategories[0]);
    });
  });
  
  function getSubscriptions() {
    return [
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
          'name': 'Northeast',
          'geoType': 'REGION',
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
        },
        'uuid': '038f21b6-28c0-4f50-8d03-93f1ac45b76d'
      },
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': '9824e7e1-c0fc-401b-910c-ade18f946bf7',
          'name': 'Las Vegas',
          'geoType': 'METRO',
          'parentUuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
        },
        'uuid': 'c21e1fc2-72de-4446-83eb-5e7e32b10b20'
      },
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
          'name': 'Midwest',
          'geoType': 'REGION',
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
        },
        'uuid': 'ff897598-3849-4877-89df-d0f40b832f6c'
      },
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'name': 'US',
          'geoType': 'COUNTRY',
          'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae'
        },
        'uuid': '4bd3b913-c028-4555-ad7f-fe5c44858bdf'
      },
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
          'name': 'Chicago',
          'geoType': 'METRO',
          'parentUuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
        },
        'uuid': 'ae96c8f1-228d-45c3-83c6-bfdf1312a034'
      },
      {
        'orgId': 1000003068,
        'category': {
          'name': 'Accessories',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
        },
        'geography': {
          'uuid': 'b662eb53-9a41-49f0-922a-fde4e4445e84',
          'name': 'South',
          'geoType': 'REGION',
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
        },
        'uuid': 'ffef126b-e5ff-45f0-946f-a91d1ae9e97b'
      }
    ];
  }
  
  function renderDirectiveAndDigest() {
    $scope.currentUserMock = {
      'username': 'testUser',
      'preferences': {
        'market_intelligence': [
          {
            'orgId': 1000003068,
            'segments': [{
              'subscription': {}
            }]
          }
        ]
      },
      'subscriptions': {
        'mi_index': [
          1000003068
        ]
      }
    };
    $scope.currentOrganizationMock = {
      organization_id: 1000003068,
      name: 'Retail Demo'
    };
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('siCsv');
  }

  function createDirectiveElement() {
    return angular.element(
      '<si-csv' +
      ' current-user="currentUserMock"' +
      ' current-organization="currentOrganizationMock"' +
      '></si-csv>'
    )
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/analytics/market-intelligence/org-mi/preview-modal/si-csv-preview.partial.html',
      '<div></div>'
    );
  }
});
