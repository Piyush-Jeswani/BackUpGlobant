'use strict';
describe('AdminMiSubscriptionController', function () {
  var $scope;
  var $q;
  var $controller;
  var $stateParamsMock = {};
  var mockAdminOrganizationsData;
  var mockAdminMIData;
  var mockMarketIntelligenceAdminSubscriptionResource;
  var $timeout;
  var vm;
  var $translate;
  var apiUrl = 'https://api.url';
  var $httpBackend;
  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));
  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));
  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$timeout_, _adminMIData_, _adminOrganizationsData_, _MarketIntelligenceAdminSubscriptionResource_, _$translate_, _$httpBackend_) {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;
    mockAdminMIData = _adminMIData_;
    mockAdminOrganizationsData = _adminOrganizationsData_;
    mockMarketIntelligenceAdminSubscriptionResource = _MarketIntelligenceAdminSubscriptionResource_;
    $stateParamsMock = {
      orgId : 3068,
      startDate : new Date('2018-03-24'),
      endDate : new Date('2019-03-25')
    };
    $translate = _$translate_;
    $httpBackend = _$httpBackend_;
  }));
  describe('Org Subscription Setting', function () {
    beforeEach(function() {
      getMockSubscriptionResource(false);
      spyOn(mockMarketIntelligenceAdminSubscriptionResource, 'search').and.callThrough();
      spyOn(mockAdminOrganizationsData, 'getOrganization').and.callThrough();
      spyOn(mockAdminOrganizationsData, 'updateSettings').and.callThrough();
    });
    it('should display subscription status as active', function () {
      getMockAdminOrganizationsData('active');
      getMockSubscriptionResource(false);
      vm = instantiateController();
      $timeout.flush();
      expect(vm.subscritpionStatusName).toEqual('active');
    });
    it('should display subscription status as enabled', function () {
      getMockAdminOrganizationsData('active');
      getMockSubscriptionResource(true);
      vm = instantiateController();
      $timeout.flush();
      expect(vm.subscritpionStatusName).toEqual('enabled');
    });
    it('should display subscription status as disabled', function () {
      getMockAdminOrganizationsData('disabled');
      getMockSubscriptionResource(false);
      vm = instantiateController();
      $timeout.flush();
      expect(vm.subscritpionStatusName).toEqual('disabled');
    });
  });
  describe('Org Subscription Setting Save and Close method', function () {
    beforeEach(function() {
      var userMock = {
        result: [{
          user : {
            localization: {
              date_format: 'MM/DD/YYYY'
            },
            title: 'Developer',
            username: 'development',
            superuser: true
          }
        }]
      };
      var orgMock = {
        result: [{
          'organization_id': 3068,
          'name': ' Retail Demo',
          'status_subscriptions': {
            'market_intelligence': [
              {
                'status': status,
                'end': '2019-03-25T18:30:00.000Z',
                'start': '2018-03-24T18:30:00.000Z'
              }
            ]
          }
        }]
      };
      spyOn(mockMarketIntelligenceAdminSubscriptionResource, 'search').and.callThrough();
      spyOn(mockAdminOrganizationsData, 'getOrganization').and.callThrough();
      spyOn(mockAdminOrganizationsData, 'updateSettings').and.callThrough();
      $httpBackend.whenGET(apiUrl + '/auth/currentUser').respond(userMock);
      $httpBackend.whenGET(apiUrl + '/organizations/3068').respond(orgMock);
    });
    it('should have correct param value passed to updateSettings call', function () {
      vm = instantiateController();
      $httpBackend.flush();
      $timeout.flush();
      vm.saveAndCloseEditOrgSubscription(false);
      expect(mockAdminOrganizationsData.updateSettings).toHaveBeenCalled();
    });
  });
  function instantiateController() {
    return $controller('AdminMiSubscriptionController', {
      '$scope': $scope,
      '$stateParams': $stateParamsMock,
      '$translate': $translate,
      'adminMIData': mockAdminMIData,
      'adminOrganizationsData': mockAdminOrganizationsData,
      'MarketIntelligenceAdminSubscriptionResource': mockMarketIntelligenceAdminSubscriptionResource
    });
    $timeout.flush();
  }
  function getMockAdminOrganizationsData(status) {
    var mockAdminOrganizations = {
      '_id': '58dc10e7e547d672dbbaa81d',
      'organization_id': 3068,
      'name': ' Retail Demo',
      'updated': '2018-03-26T12:37:43.804Z',
      'created': '2015-10-21T19:07:31.339Z',
      'status_subscriptions': {
        'market_intelligence': [
          {
            'status': status,
            'end': '2019-03-25T18:30:00.000Z',
            'start': '2018-03-24T18:30:00.000Z'
          }
        ]
      }
    };
    mockAdminOrganizationsData = {
      getOrganization: function() {
        var deferred = $q.defer();
        deferred.resolve(mockAdminOrganizations);
        return deferred.promise;
      },
      updateSettings: function() {
        var deferred = $q.defer();
        deferred.resolve({});
        return deferred.promise;
      }
    };
  }
  function getMockSubscriptionResource(hideSubscription) {
    var mockSubscriptionResource = {
      'orgId': 3068,
      'subscriptionNodes': [
        {
          'category': {
            'name': 'Total Retail'
          },
          'geographyNode': {
            'uuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'name': 'global',
            'geoType': 'GLOBAL',
            'available': false,
            'subscribed': false,
            'children': [
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'name': 'US',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': false,
                'children': [
                  {
                    'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                    'name': 'Midwest',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': true,
                    'children': [],
                    '$$hashKey': 'object:1379'
                  },
                  {
                    'uuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808',
                    'name': 'West',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1382'
                  }
                ],
                '$$hashKey': 'object:1335'
              },
              {
                'uuid': '4bc60233-93da-410f-87ca-5291e82b94d3',
                'name': 'CA',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': true,
                'children': [
                  {
                    'uuid': '98ae6cad-c7e7-4fd9-884a-da1510b7d909',
                    'name': 'Alberta',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1467'
                  },
                  {
                    'uuid': '73aca02d-5aa3-440f-b16a-08a0759b7158',
                    'name': 'British Columbia',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': true,
                    'children': [],
                    '$$hashKey': 'object:1468'
                  }
                ],
                '$$hashKey': 'object:1336'
              },
              {
                'uuid': 'd88b21d9-8410-416b-b42c-5b034e4c6f1e',
                'name': 'HK',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': false,
                'children': [],
                '$$hashKey': 'object:1348'
              }
            ]
          },
          'hide': false,
          '$$hashKey': 'object:1306'
        },
        {
          'category': {
            'name': 'Total Mall'
          },
          'geographyNode': {
            'uuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'name': 'global',
            'geoType': 'GLOBAL',
            'available': false,
            'subscribed': false,
            'children': [
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'name': 'US',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': [
                  {
                    'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                    'name': 'Midwest',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1585'
                  },
                  {
                    'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                    'name': 'Northeast',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1586'
                  }
                ],
                '$$hashKey': 'object:1541'
              },
              {
                'uuid': '4bc60233-93da-410f-87ca-5291e82b94d3',
                'name': 'CA',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': [
                  {
                    'uuid': '98ae6cad-c7e7-4fd9-884a-da1510b7d909',
                    'name': 'Alberta',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1667'
                  },
                  {
                    'uuid': '73aca02d-5aa3-440f-b16a-08a0759b7158',
                    'name': 'British Columbia',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': [],
                    '$$hashKey': 'object:1668'
                  }
                ],
                '$$hashKey': 'object:1542'
              },
              {
                'uuid': 'd88b21d9-8410-416b-b42c-5b034e4c6f1e',
                'name': 'HK',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': [],
                '$$hashKey': 'object:1554'
              }
            ]
          },
          'hide': false,
          '$$hashKey': 'object:1307'
        }
      ]
    };
    var mockSubscriptionResourceNoSelection = {
      'orgId': 3068,
      'subscriptionNodes': [
        {
          'category': {
            'name': 'Total Retail'
          },
          'geographyNode': {
            'uuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'name': 'global',
            'geoType': 'GLOBAL',
            'available': false,
            'subscribed': false,
            'children': [
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'name': 'US',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': false,
                'children': [
                  {
                    'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                    'name': 'Midwest',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': []
                  },
                  {
                    'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                    'name': 'Northeast',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': []
                  }
                ]
              },
              {
                'uuid': '4bc60233-93da-410f-87ca-5291e82b94d3',
                'name': 'CA',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': false,
                'children': [
                  {
                    'uuid': '98ae6cad-c7e7-4fd9-884a-da1510b7d909',
                    'name': 'Alberta',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': []
                  },
                  {
                    'uuid': '73aca02d-5aa3-440f-b16a-08a0759b7158',
                    'name': 'British Columbia',
                    'geoType': 'REGION',
                    'available': true,
                    'subscribed': false,
                    'children': []
                  }
                ]
              },
              {
                'uuid': 'd88b21d9-8410-416b-b42c-5b034e4c6f1e',
                'name': 'HK',
                'geoType': 'COUNTRY',
                'available': true,
                'subscribed': false,
                'children': []
              }
            ]
          },
          'hide': true,
          '$$hashKey': 'object:788'
        },
        {
          'category': {
            'name': 'Total Mall'
          },
          'geographyNode': {
            'uuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'name': 'global',
            'geoType': 'GLOBAL',
            'available': false,
            'subscribed': false,
            'children': [
              {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'name': 'US',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': [
                  {
                    'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
                    'name': 'Midwest',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': []
                  },
                  {
                    'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
                    'name': 'Northeast',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': []
                  }
                ]
              },
              {
                'uuid': '4bc60233-93da-410f-87ca-5291e82b94d3',
                'name': 'CA',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': [
                  {
                    'uuid': '98ae6cad-c7e7-4fd9-884a-da1510b7d909',
                    'name': 'Alberta',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': []
                  },
                  {
                    'uuid': '73aca02d-5aa3-440f-b16a-08a0759b7158',
                    'name': 'British Columbia',
                    'geoType': 'REGION',
                    'available': false,
                    'subscribed': false,
                    'children': []
                  }
                ]
              },
              {
                'uuid': 'd88b21d9-8410-416b-b42c-5b034e4c6f1e',
                'name': 'HK',
                'geoType': 'COUNTRY',
                'available': false,
                'subscribed': false,
                'children': []
              }
            ]
          },
          'hide': true,
          '$$hashKey': 'object:789'
        }
      ]
    };
    mockMarketIntelligenceAdminSubscriptionResource = {
      search: function() {
        var deferred = $q.defer();
        deferred.resolve(hideSubscription ? mockSubscriptionResourceNoSelection : mockSubscriptionResource);
        return deferred.promise;
      }
    };
  }
});
