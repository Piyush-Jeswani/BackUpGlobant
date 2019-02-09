'use strict';
describe('Market Intelligence Widget', function () { 
  var $compile, $scope, $rootScope, $q, controller, selectedRange, compareRange, localStorage;

  var MarketIntelligenceService, localStorageService, AuthService, OrganizationResource;

  function getSelectedOptions() {
    return {
      'dateStart': moment('26/11/2017', 'DD/MM/YYYY'),
      'dateEnd': moment('30/12/2017', 'DD/MM/YYYY'),
      'compareStart': moment('27/11/2016', 'DD/MM/YYYY'),
      'compareEnd': moment('31/12/2016', 'DD/MM/YYYY'),
      'subscriptions': []
    }
  };

  function getSelectedWeekOptions() {
    return {
      'dateStart': moment('21/05/2018', 'DD/MM/YYYY'),
      'dateEnd': moment('27/05/2018', 'DD/MM/YYYY'),
      'compareStart': moment('22/05/2017', 'DD/MM/YYYY'),
      'compareEnd': moment('28/05/2017', 'DD/MM/YYYY'),
      'subscriptions': []
    }
  };

  function getSelectedMonthOptions() {
    return {
      'dateStart': moment('01/04/2018', 'DD/MM/YYYY'),
      'dateEnd': moment('30/04/2018', 'DD/MM/YYYY'),
      'compareStart': moment('01/04/2017', 'DD/MM/YYYY'),
      'compareEnd': moment('30/04/2017', 'DD/MM/YYYY'),
      'subscriptions': []
    }
  };

  function getSingleSubscription() {
    return [
      {
        'name': 'Geography',
        'orgId': 1000003068,
        'rule': 'Contains',
        'value': {
          'name': 'South',
          'src': {
            'childrenUuids': [
              '980acb1e-a8dc-407f-a2ba-7d32099a5a8f',
              '49806afc-386b-42d9-8208-a4d2ae6f621a',
              '8f001972-0ce0-4103-89ee-780a2c18f217',
              '64406551-e8c7-49cb-97e2-297afeb72607',
              'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc',
              '369b45ec-e411-4ea5-9cb3-81bdd14dee02',
              '5021fcd1-62fd-413a-b603-a4749e494199',
              'a7d7bfcc-8820-4ff2-ba95-e38b79459b8f',
              'c4bcd013-c9f9-4007-854d-3fa159a993b2',
              '3ce61bac-49c5-4f51-baff-b87e8dbc0f66',
              'b7afea16-75e8-4560-90af-68d4de2f50d1',
              '63e8cdc6-da54-407d-95b2-9fcc86e98bfe'
            ],
            'geoType': 'REGION',
            'lastUpdated': '2018-01-25T14:14:28.813Z',
            'name': 'South',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'uuid': 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          }
        }
      }, {
        'name': 'Category',
        'orgId': 1000003068,
        'rule': 'Contains',
        'value': {
          'name': 'Accessories',
          'src': {
            'childrenUuids': [],
            'lastUpdated': '2018-01-25T14:14:29.404Z',
            'name': 'Accessories',
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          }
        }
      }
    ];
  }

  function getMultipleSubscription() {
    return [
      {
        'name': 'Geography',
        'orgId': 1000003068,
        'rule': 'Contains',
        'value': {
          'name': 'South',
          'src': {
            'childrenUuids': [
              '980acb1e-a8dc-407f-a2ba-7d32099a5a8f',
              '49806afc-386b-42d9-8208-a4d2ae6f621a',
              '8f001972-0ce0-4103-89ee-780a2c18f217',
              '64406551-e8c7-49cb-97e2-297afeb72607',
              'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc',
              '369b45ec-e411-4ea5-9cb3-81bdd14dee02',
              '5021fcd1-62fd-413a-b603-a4749e494199',
              'a7d7bfcc-8820-4ff2-ba95-e38b79459b8f',
              'c4bcd013-c9f9-4007-854d-3fa159a993b2',
              '3ce61bac-49c5-4f51-baff-b87e8dbc0f66',
              'b7afea16-75e8-4560-90af-68d4de2f50d1',
              '63e8cdc6-da54-407d-95b2-9fcc86e98bfe'
            ],
            'geoType': 'REGION',
            'lastUpdated': '2018-01-25T14:14:28.813Z',
            'name': 'South',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'uuid': 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          }
        }
      }, {
        'name': 'Category',
        'orgId': 1000003068,
        'rule': 'Contains',
        'value': {
          'name': 'Accessories',
          'src': {
            'childrenUuids': [],
            'lastUpdated': '2018-01-25T14:14:29.404Z',
            'name': 'Accessories',
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          }
        }
      }, {
        'name': 'Category',
        'orgId': 1000003068,
        'rule': 'Contains',
        'value': {
          'name': 'Wireless',
          'src': {
            'childrenUuids': [],
            'lastUpdated': '2018-01-25T14:14:29.404Z',
            'name': 'Wireless',
            'uuid': '689fa51d-807b-4b46-a72c-b818979b5a6f'
          }
        }
      }
    ];
}

  var geography = [{
    childrenUuids: [
      '980acb1e-a8dc-407f-a2ba-7d32099a5a8f',
      '49806afc-386b-42d9-8208-a4d2ae6f621a',
      '8f001972-0ce0-4103-89ee-780a2c18f217',
      '64406551-e8c7-49cb-97e2-297afeb72607',
      'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc',
      '369b45ec-e411-4ea5-9cb3-81bdd14dee02',
      '5021fcd1-62fd-413a-b603-a4749e494199',
      'a7d7bfcc-8820-4ff2-ba95-e38b79459b8f',
      'c4bcd013-c9f9-4007-854d-3fa159a993b2',
      '3ce61bac-49c5-4f51-baff-b87e8dbc0f66',
      'b7afea16-75e8-4560-90af-68d4de2f50d1',
      '63e8cdc6-da54-407d-95b2-9fcc86e98bfe'
    ],
    geoType: 'REGION',
    lastUpdated: '2018-01-25T14:14:28.813Z',
    name: 'South',
    parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
    uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
  }, {
    childrenUuids: [
      '64dbc53a-022e-4659-bdd8-7d85efdb6d64',
      '9824e7e1-c0fc-401b-910c-ade18f946bf7',
      '55783060-3f03-438f-aa89-039eec4c0b61',
      'b8136528-ffbe-401c-9bfc-efa78f58f6cd',
      'a6010034-9eb4-4f2d-bf04-2e3ac752d1a7',
      '19098d55-fb25-4d66-a22c-c1a10dff2a22',
      'dcb2fe89-7a7c-49aa-9970-bb3b628e3b5e',
      '306ab1e9-ad38-4f18-95b8-a0d0b66e8afc',
      'fab2a14d-5c0c-4421-96fc-a83c84005823',
      '8ee97146-85d3-4ab4-b871-c3851fec704b'
    ],
    geoType: 'REGION',
    lastUpdated: '2018-01-25T14:14:28.813Z',
    name: 'West',
    parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
    uuid: '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
  }];

  beforeEach(module('shopperTrak'), function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  });
  beforeEach(inject(putTemplateToTemplateCache));
  beforeEach(inject(function (
    _$rootScope_,
    _$compile_,
    _$q_,
    _$timeout_,
    _marketIntelligenceService_,
    _authService_,
    _localStorageService_,
    _OrganizationResource_
  ) {
    $compile = _$compile_;
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $q = _$q_;
    MarketIntelligenceService = _marketIntelligenceService_;
    localStorageService = _localStorageService_;
    AuthService = _authService_;
    OrganizationResource = _OrganizationResource_;
  }));

  describe('with a single subscription', function () {
    beforeEach(function () {
      $scope.selectedOptions = getSelectedOptions();
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: [{
          name:'Geography',
          type: 'option',
          geoTypeKey: 'geography',
          cast: 'geo',
          id: 8
        }]
      };
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });
      spyOn(MarketIntelligenceService, 'getIndexData').and.callFake(getSingleSubscriptionIndexData);
      $scope.selectedOptions.subscriptions = getSingleSubscription();
      controller = renderDirectiveAndDigest();
    });

    it('should have multiSubscription flag set to false', function () {
      expect(controller.multiSubscription).toBeFalsy();
    });

    it('should display Advanced options selected items in the widget header', function() {
      expect(controller.selectionSummary[0].geography).toEqual('South');
      expect(controller.selectionSummary[0].category).toEqual('Accessories');
    });

    it('should display 5 items for South in the data table', function() {
      expect(controller.dataPoints.length).toEqual(5);
    });
  });

  describe('with a multiple subscription', function () {
    beforeEach(function () {
      $scope.selectedOptions = getSelectedOptions();
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: [{
          name:'Geography',
          type: 'option',
          geoTypeKey: 'geography',
          cast: 'geo',
          id: 8
        }]
      };
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });
      spyOn(MarketIntelligenceService, 'getIndexData').and.callFake(getMultiSubscriptionIndexData);
      $scope.selectedOptions.subscriptions = getMultipleSubscription();
      controller = renderDirectiveAndDigest();
    });

    it('should have multiSubscription flag set to true', function () {
      expect(controller.multiSubscription).toBeTruthy();
    });

    it('should display Advanced options selected items in the widget header', function() {
      expect(controller.selectionSummary[0].geography).toEqual('South');
      expect(controller.selectionSummary[0].category).toEqual('Accessories');
      expect(controller.selectionSummary[1].geography).toEqual('South');
      expect(controller.selectionSummary[1].category).toEqual('Wireless');
    });

    it('should display 2 items for South and  in the data table', function() {
      expect(controller.dataPoints.length).toEqual(2);
    });
  });

  describe('with a day grouping selected', function() {
    beforeEach(function () {
      $scope.selectedOptions = {
        dateStart: moment('2017-01-28', 'YYYY-MM-DD'),
        dateEnd: moment('2017-02-03', 'YYYY-MM-DD'),
        compareStart: moment('2017-01-29', 'YYYY-MM-DD'),
        compareEnd: moment('2017-02-04', 'YYYY-MM-DD')
      };;
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: [{
          name: 'Day',
          type: 'option',
          cast: 'time',
          period: 'day',
          id: 2
        }]
      };
      selectedRange = [
        { end: '2018-01-28T23:59:59.999Z', start: '2018-01-28T00:00:00.000Z' },
        { end: '2018-01-29T23:59:59.999Z', start: '2018-01-29T00:00:00.000Z' },
        { end: '2018-01-30T23:59:59.999Z', start: '2018-01-30T00:00:00.000Z' },
        { end: '2018-01-31T23:59:59.999Z', start: '2018-01-31T00:00:00.000Z' },
        { end: '2018-02-01T23:59:59.999Z', start: '2018-02-01T00:00:00.000Z' },
        { end: '2018-02-02T23:59:59.999Z', start: '2018-02-02T00:00:00.000Z' },
        { end: '2018-02-03T23:59:59.999Z', start: '2018-03-03T00:00:00.000Z' }
      ];
      compareRange = [
        { end: '2018-01-29T23:59:59.999Z', start: '2018-01-29T00:00:00.000Z' },
        { end: '2018-01-30T23:59:59.999Z', start: '2018-01-30T00:00:00.000Z' },
        { end: '2018-01-31T23:59:59.999Z', start: '2018-01-31T00:00:00.000Z' },
        { end: '2018-02-01T23:59:59.999Z', start: '2018-02-01T00:00:00.000Z' },
        { end: '2018-02-02T23:59:59.999Z', start: '2018-02-02T00:00:00.000Z' },
        { end: '2018-02-03T23:59:59.999Z', start: '2018-02-03T00:00:00.000Z' },
        { end: '2018-02-04T23:59:59.999Z', start: '2018-03-04T00:00:00.000Z' }
      ];
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });

      spyOn($q, 'all').and.callFake(function () {
        var defer = $q.defer();
        defer.resolve([{
          data: {
            result: selectedRange
          }
        }, {
          data: {
            result: compareRange
          }
        }]);
        return defer.promise;
      });
      spyOn(MarketIntelligenceService, 'getIndexData').and.callThrough();
    });

    describe('and a single subscription', function() {
      it('should call MarketIntelligenceService.getIndexData method with specific parameters', function() {
        var singleSubscription = getSingleSubscription();
        $scope.selectedOptions = {
          dateStart: moment('2017-01-28', 'YYYY-MM-DD'),
          dateEnd: moment('2017-02-03', 'YYYY-MM-DD'),
          compareStart: moment('2017-01-29', 'YYYY-MM-DD'),
          compareEnd: moment('2017-02-04', 'YYYY-MM-DD'),
          subscriptions: singleSubscription
        };
        controller = renderDirectiveAndDigest();
        var obj = $scope.selectedOptions;
        obj.subscriptions = [{
          'orgId': singleSubscription[0].orgId,
          'geography': singleSubscription[0].value.src,
          'category': singleSubscription[1].value.src
        }];
        obj.groupByDateRanges = selectedRange;
        obj.groupByCompareDateRanges = compareRange;
        expect(MarketIntelligenceService.getIndexData).toHaveBeenCalledWith(obj, true);
      });
    });

    describe('and a multiple subscription', function() {
      it('should call MarketIntelligenceService.getIndexData method with specific parameters', function() {
        var multiSubscription = getMultipleSubscription();
        $scope.selectedOptions = {
          dateStart: moment('2017-01-28', 'YYYY-MM-DD'),
          dateEnd: moment('2017-02-03', 'YYYY-MM-DD'),
          compareStart: moment('2017-01-29', 'YYYY-MM-DD'),
          compareEnd: moment('2017-02-04', 'YYYY-MM-DD'),
          subscriptions: multiSubscription
        };
        controller = renderDirectiveAndDigest();
        var obj = $scope.selectedOptions;
        obj.subscriptions = [{
          'orgId': multiSubscription[0].orgId,
          'geography': multiSubscription[0].value.src,
          'category': multiSubscription[1].value.src
        }, {
          'orgId': multiSubscription[0].orgId,
          'geography': multiSubscription[0].value.src,
          'category': multiSubscription[2].value.src
        }];
        obj.groupByDateRanges = selectedRange;
        obj.groupByCompareDateRanges = compareRange;
        expect(MarketIntelligenceService.getIndexData).toHaveBeenCalledWith(obj, true);
      });
    });
  });

  describe('Week Grouping', function () {
    beforeEach(function () {
      $scope.selectedOptions = getSelectedMonthOptions();
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: []
      };
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });
      spyOn(MarketIntelligenceService, 'getIndexData').and.callFake(getSingleSubscriptionIndexData);
      $scope.selectedOptions.subscription = getSingleSubscription();
      controller = renderDirectiveAndDigest();
    });

    it('should display data grouping in Week', function() {
      expect(controller.firstGroupingSelectedItems[0].period).toEqual('week');
    });
  });

  describe('Day Grouping', function () {
    beforeEach(function () {
      $scope.selectedOptions = getSelectedWeekOptions();
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: []
      };
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });
      spyOn(MarketIntelligenceService, 'getIndexData').and.callFake(getSingleSubscriptionIndexData);
      $scope.selectedOptions.subscriptions = getSingleSubscription();
      controller = renderDirectiveAndDigest();
    });

    it('should display data grouping in day', function() {
      expect(controller.firstGroupingSelectedItems[0].period).toEqual('day');
    });
  });

  describe('local storage data', function () {
    beforeEach(function () {
      $scope.selectedOptions = {
        'dateStart': moment('01/01/2017', 'DD/MM/YYYY'),
        'dateEnd': moment('31/12/2017', 'DD/MM/YYYY'),
        'compareStart': moment('01/01/2016', 'DD/MM/YYYY'),
        'compareEnd': moment('31/12/2016', 'DD/MM/YYYY'),
        'subscriptions': []
      };
      $scope.geography = geography;
      $scope.currentUser = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: []
          }
        }
      };
      $scope.currentOrganization = {
        organization_id: 1000003068
      };
      localStorage = {
        miFirstGroupingSelectedItems: [{
          name: 'Day',
          type: 'option',
          cast: 'time',
          period: 'day',
          id: 2
        }]
      };
      spyOn(localStorageService, 'get').and.callFake(function (key) {
        return localStorage[key];
      });
      
      spyOn(localStorageService, 'remove');
      spyOn(MarketIntelligenceService, 'getIndexData').and.callFake(getSingleSubscriptionIndexData);
      $scope.selectedOptions.subscriptions = getSingleSubscription();
      controller = renderDirectiveAndDigest();
    });

    it('should remove saved groupings if the item is an invalid grouping option', function() {
      expect(localStorageService.remove).toHaveBeenCalled();
    });
  });

  describe('on PDF export', function() {
    beforeEach(() => {
      $scope.pdfExportConfig = {};
      $rootScope.pdf = true;
      spyOn(MarketIntelligenceService, 'getSubscriptions').and.callFake(getSubscriptions);
      spyOn(AuthService, 'getCurrentUser').and.callFake(getCurrentUser);
      spyOn(OrganizationResource, 'get').and.callFake(getCurrentOrganization);
    });
    
    describe('with less than 21 days date range', function() {
      beforeEach(() => {
        $scope.selectedOptions = getSelectedWeekOptions();
        controller = renderDirectiveAndDigest();
      });

      it('should set firstGroupingSelectedItems in pdfExportConfig', function() {
        expect(controller.pdfExportConfig.firstGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.firstGroupingSelectedItems.length).toEqual(1);
        expect(controller.pdfExportConfig.firstGroupingSelectedItems[0]).toEqual(controller.firstGroupingDropdownArray[1]);
      });
        
      it('should set secondGroupingSelectedItems in pdfExportConfig', function() {
        expect(controller.pdfExportConfig.secondGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.secondGroupingSelectedItems.length).toEqual(0);
      });
    });

    describe('with greater than 21 days date range', function() {
      beforeEach(() => {
        $scope.selectedOptions = getSelectedMonthOptions();
        controller = renderDirectiveAndDigest();
      });

      it('should set firstGroupingSelectedItems in pdfExportConfig', function() {
        expect(controller.pdfExportConfig.firstGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.firstGroupingSelectedItems.length).toEqual(1);
        expect(controller.pdfExportConfig.firstGroupingSelectedItems[0]).toEqual(controller.firstGroupingDropdownArray[2]);
          
      });
        
      it('should set secondGroupingSelectedItems in pdfExportConfig', function() {
        expect(controller.pdfExportConfig.secondGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.secondGroupingSelectedItems.length).toEqual(0);
      });
    });
    
    describe('when first grouping changes', function() {
      beforeEach(() => {
        $scope.selectedOptions = getSelectedWeekOptions();
        controller = renderDirectiveAndDigest();
      });
      
      it('should set firstGroupingSelectedItems in pdfExportConfig accordingly', function() {
        expect(controller.pdfExportConfig.firstGroupingSelectedItems[0]).toEqual(controller.firstGroupingDropdownArray[1]);
        controller.applyFirstGrouping([controller.firstGroupingDropdownArray[2]]);
        expect(controller.pdfExportConfig.firstGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.firstGroupingSelectedItems.length).toEqual(1);
        expect(controller.pdfExportConfig.firstGroupingSelectedItems[0]).toEqual(controller.firstGroupingDropdownArray[2]);
      });
    });

    describe('when second grouping changes', function() {
      beforeEach(() => {
        $scope.selectedOptions = getSelectedWeekOptions();
        controller = renderDirectiveAndDigest();
      });
      
      it('should set secondGroupingSelectedItems in pdfExportConfig accordingly', function() {
        expect(controller.pdfExportConfig.secondGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.secondGroupingSelectedItems.length).toEqual(0);
        controller.applySecondGrouping([controller.secondGroupingDropdownArray[1]]);
        expect(controller.pdfExportConfig.secondGroupingSelectedItems).toBeDefined();
        expect(controller.pdfExportConfig.secondGroupingSelectedItems.length).toEqual(1);
        expect(controller.pdfExportConfig.secondGroupingSelectedItems[0]).toEqual(controller.secondGroupingDropdownArray[1]);
      });
    });
  });

  function getCurrentOrganization() {
    var defer = $q.defer();
    var response = $scope.currentOrganization;
    defer.resolve(response);
    return defer.promise;
  }

  function getCurrentUser() {
    var defer = $q.defer();
    var response = $scope.currentUser;
    defer.resolve(response);
    return defer.promise;
  }
  
  function getSubscriptions() {
    var totalRetailUuid = 'da815dbc-f066-4807-a6ac-ae145e6b6242';
    var defer = $q.defer();
    var response = [{
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
    defer.resolve(response);
    return defer.promise;
  }
    
  function getSingleSubscriptionIndexData() {
    var defer = $q.defer();
    var response = {
      index: [{
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:04.440Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'REGION',
            lastUpdated: '2018-01-31T10:58:00.093Z',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'e854df0a-1c1d-4fbd-b78f-d36007d62ac1'
        },
        value: -0.10702382224121354,
        valueAsString: '-10.70%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Atlanta',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: -0.19568051766182967,
        valueAsString: '-19.57%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Atlanta',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: -0.12414229916605088,
        valueAsString: '-12.41%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Dallas',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc'
        },
        value: -0.021785996728308797,
        valueAsString: '-2.18%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Dallas',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc'
        },
        value: 0.00848429576199754,
        valueAsString: '+0.85%'
      }],
      org: [{
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:04.440Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'REGION',
            lastUpdated: '2018-01-31T10:58:00.093Z',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'e854df0a-1c1d-4fbd-b78f-d36007d62ac1'
        },
        value: 0.03868791800715473,
        valueAsString: '+3.87%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Atlanta',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: 0.1353448275862069,
        valueAsString: '+13.53%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Atlanta',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: 0.0530931723877782,
        valueAsString: '+5.31%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Dallas',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc'
        },
        value: 0.20573108008817045,
        valueAsString: '+20.57%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            childrenUuids: [],
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            childrenUuids: [],
            geoType: 'METRO',
            lastUpdated: '2018-01-29T14:14:03.641Z',
            name: 'Dallas',
            parentUuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84',
            uuid: '980acb1e-a8dc-407f-a2ba-7d32099a5a8f'
          },
          uuid: 'a7a1dffc-d71b-4420-88b1-3976f4a0c6dc'
        },
        value: 0.1256858551102018,
        valueAsString: '+12.57%'
      }]
    };
    defer.resolve(response);
    return defer.promise;
  }

  function getMultiSubscriptionIndexData() {
    var defer = $q.defer();
    var response = {
      index: [{
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            geoType: 'REGION',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'e854df0a-1c1d-4fbd-b78f-d36007d62ac1'
        },
        value: -0.10702382224121354,
        valueAsString: '-10.70%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            name: 'Wireless',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            geoType: 'REGION',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: -0.09281066031425106,
        valueAsString: '-9.28%'
      }],
      org: [{
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            name: 'Accessories',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            geoType: 'REGION',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'e854df0a-1c1d-4fbd-b78f-d36007d62ac1'
        },
        value: 0.03868791800715473,
        valueAsString: '+3.87%'
      }, {
        compDateEnd: '2017-01-28T23:59:59.999Z',
        compDateStart: '2017-01-22T00:00:00Z',
        dateEnd: '2018-01-27T23:59:59.999Z',
        dateStart: '2018-01-21T00:00:00Z',
        subscription: {
          orgId: 1000003068,
          category: {
            name: 'Wireless',
            uuid: 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5'
          },
          geography: {
            geoType: 'REGION',
            name: 'South',
            parentUuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            uuid: 'b662eb53-9a41-49f0-922a-fde4e4445e84'
          },
          uuid: 'c361807e-dfcb-4328-b340-a1be2299571e'
        },
        value: 0.03868791800715473,
        valueAsString: '+3.87%'
      }]
    };
    defer.resolve(response);
    return defer.promise;
  }

  function renderDirectiveAndDigest() {
    $scope.numberFormatName = 'en-us';
    $scope.dateFormat = 'DD/MM/YYYY';
    $scope.showOrgIndex = true;
    $scope.isPriorYear = true;
    $scope.isLoading = false;
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('marketIntelligenceWidget');
  }

  function createDirectiveElement() {
    return angular.element(
      '<market-intelligence-widget' +
      ' selected-options="selectedOptions"' +
      ' geography="geography"' +
      ' number-format-name="::numberFormatName"' +
      ' current-user="::currentUser"' +
      ' date-format="::dateFormat"' +
      ' current-org="::currentOrganization"' +
      ' show-org-index="::showOrgIndex"' +
      ' is-prior-year="::isPriorYear"' +
      ' is-loading="isLoading"' +
      ' pdf-export-config="pdfExportConfig"' +
      '></market-intelligence-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/market-intelligence-widget/market-intelligence-widget.partial.html',
      '<div></div>'
    );
  }
})
