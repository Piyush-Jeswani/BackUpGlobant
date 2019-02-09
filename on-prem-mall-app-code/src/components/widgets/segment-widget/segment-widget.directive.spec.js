describe('segmentWidget', () => {
  let $scope, $compile, mockMarketIntelligenceService, params, getIndexDataResponse, getUpdatedIndexDataResponse;
  let $q, authService, rootScopeMock, startDate, endDate, compareDateStart, compareDateEnd, segments, mockOrganizationResource, orgId;

  beforeEach(module('shopperTrak', ($translateProvider, $provide) => {
    $translateProvider.translations('en_US', {});
    $provide.factory('marketIntelligenceService', () => mockMarketIntelligenceService);
    $provide.factory('OrganizationResource', () => mockOrganizationResource)
  }));
  beforeEach(inject(putTemplateToTemplateCache));
  beforeEach(inject(($rootScope, _$compile_, _$q_, _authService_, _OrganizationResource_) => {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $q = _$q_;
    rootScopeMock = $rootScope;
    rootScopeMock.pdf = false;
    authService = _authService_;
    mockOrganizationResource = _OrganizationResource_;
  }));

  describe('loadData()', () => {
    it('should call getIndexData method', () => {
      spyOn(mockMarketIntelligenceService, 'getIndexData').and.callThrough();
      renderDirectiveAndDigest({ 'showOrgIndex': false });
      expect(mockMarketIntelligenceService.getIndexData).toHaveBeenCalled();
    });

    describe('vm.kpiSegmentsArray', () => {
      let vm;
      beforeEach(() => {
        spyOn(mockMarketIntelligenceService, 'getIndexData').and.callThrough();
        vm = renderDirectiveAndDigest({ 'showOrgIndex': false });
      });

      it('should load correct number of segments', () => {
        expect(vm.kpiSegmentsArray.length).toEqual(getIndexDataResponse.index.length);
      });

      it('should have an orgIndexChange property if vm.showOrgIndex is equal true', () => {
        vm = renderDirectiveAndDigest({ 'showOrgIndex': true });
        expect(vm.kpiSegmentsArray[0].orgIndexChange).toBeDefined();
      });

      it('should not have an orgIndexChange property if vm.showOrgIndex is equal false', () => {
        expect(vm.kpiSegmentsArray[0].orgIndexChange).toBeUndefined();
      });
    });
  });

  describe('update segment settings', () => {
    let vm;
    beforeEach(() => {
      updateParam();
      mockMarketIntelligenceService = {
        getIndexData() {
          const dfd = $q.defer();
          dfd.resolve(getUpdatedIndexDataResponse);
          return dfd.promise;
        },
        getFullGeoTitleByCode(string) {
          angular.noop(string);
          return 'US';
        }
      }
      spyOn(mockMarketIntelligenceService, 'getIndexData').and.callThrough();
      vm = renderDirectiveAndDigest({'showOrgIndex': false});
    });
    it('should load correct number of segments after update', () => {
      expect(params.subscriptions.length).toEqual(_.reject(vm.kpiSegmentsArray, {geographyName: 'Empty'}).length);
    });
    it('should load segments at correct position', () => {
      const geographyCategoryName = `${params.subscriptions[0].geography.name} ${params.subscriptions[0].category.name}`;
      expect(geographyCategoryName).toEqual(vm.kpiSegmentsArray[params.subscriptions[0].positionIndex].geographyName);
    });
  });

  describe('update Country code to Country name', () => {
    let vm;
    beforeEach(() => {
      updateParam();
      mockMarketIntelligenceService = {
        getIndexData() {
          const defer = $q.defer();
          defer.resolve(getUpdatedIndexDataResponse);
          return defer.promise;
        },
        getFullGeoTitleByCode(string) {
          angular.noop(string);
          return 'United States';
        }
      }
      spyOn(mockMarketIntelligenceService, 'getIndexData').and.callThrough();
      vm = renderDirectiveAndDigest({'showOrgIndex': false});
    });
    it('should convert US to United States', () => {
      const geographyCategoryName = `${params.subscriptions[0].geography.name} ${params.subscriptions[0].category.name}`;
      expect(geographyCategoryName).not.toBe('United States Home Furnishings');
      expect(vm.kpiSegmentsArray[params.subscriptions[0].positionIndex].geographyName).toBe('United States Home Furnishings');
    });
  });

  describe('Should load the details for the PDF report', () => {
    let vm;
    beforeEach(() => {
      const currentUserMock = {
        'username': 'foobar',
        'preferences': {
          'custom_dashboards': []
        }
      };
      authService.getCurrentUser = () => {
        const deferred  = $q.defer();
        deferred.resolve(currentUserMock);
        return deferred.promise;
      };
      mockMarketIntelligenceService = {
        getIndexData() {
          const dfd = $q.defer();
          dfd.resolve(getIndexDataResponse);
          return dfd.promise;
        },
        getSubscriptions() {
          const defer = $q.defer();
          defer.resolve(getSubscriptions());
          return defer.promise;
        },
        getFullGeoTitleByCode(string) {
          angular.noop(string);
          return 'United States';
        }
      };
      rootScopeMock.pdf = true;
      startDate = moment('2018-02-04');
      endDate = moment('2018-02-10');
      compareDateStart = moment('2017-02-05');
      compareDateEnd= moment('2017-02-11');
      orgId = '1000003068';
      segments = getSubscriptions();
      spyOn(authService, 'getCurrentUser').and.callThrough();
      spyOn(mockMarketIntelligenceService, 'getIndexData').and.callThrough();
      spyOn(mockMarketIntelligenceService, 'getSubscriptions').and.callThrough();
      vm = renderDirectiveAndDigest({'showOrgIndex': false});
    });

    it('should load correct number of segments for report', () => {
      expect(vm.kpiSegmentsArray.length).toEqual(getIndexDataResponse.index.length);
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
  };

  mockMarketIntelligenceService = {
    getIndexData() {
      const dfd = $q.defer();
      dfd.resolve(getIndexDataResponse);
      return dfd.promise;
    },
    getSubscriptions() {
      const defer = $q.defer();
      defer.resolve(getSubscriptions());
      return defer.promise;
    },
    getFullGeoTitleByCode(string) {
      angular.noop(string);
      return 'United States';
    }
  };

  mockOrganizationResource = {
    get() {
      const dfd = $q.defer();
      dfd.resolve([{
        'organization_id': 1000003068,
        'name': ' Retail Demo'
      }]);
      return {
        $promise: dfd.promise
      }
    }
  };


  function updateParam() {
    params.subscriptions = [
      {
        'positionIndex': 4,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'name': 'Home Furnishings',
          'childrenUuids': [

          ],
          'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
          'lastUpdated': '2018-02-11T14:16:15.014Z'
        },
        'geography': {
          'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'name': 'US',
          'geoType': 'COUNTRY',
          'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
          'childrenUuids': [
            'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
            'b662eb53-9a41-49f0-922a-fde4e4445e84',
            '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
          ]
        }
      }];
  }

  function renderDirectiveAndDigest(obj) {
    $scope.params = params;
    $scope.showOrgIndex = obj.showOrgIndex;
    $scope.currentOrganization = {
      organization_id: 1000003068,
      name: 'Retail Demo'
    };
    $scope.orgId = orgId;
    $scope.startDate = startDate;
    $scope.endDate = endDate;
    $scope.compareDateStart = compareDateStart;
    $scope.compareDateEnd= compareDateEnd;
    $scope.segments = segments;

    const element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();

    return element.controller('segmentWidget');
  }

  function createDirectiveElement() {

    return angular.element(
      '<segment-widget' +
      ' params="params"' +
      ' start-date="startDate"' +
      ' end-date="endDate"' +
      ' compare-date-start="compareDateStart"' +
      ' compare-date-end="compareDateEnd"' +
      ' org-id="orgId"' +
      ' number-format-name="::numberFormatName"' +
      ' org="::currentOrganization"' +
      ' on-export-click="exportWidget(component)"' +
      ' export-is-disabled="widgetIsExported(component, vm.viewData[component])"' +
      ' first-time-configure="firstTimeConfigure"' +
      ' show-org-index="::showOrgIndex"' +
      ' is-loading="widgetLoadingStatus[component]"' +
      '></segment-widget>'
    )
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'components/widgets/segment-widget/segment-widget.partial.html',
      '<div></div>'
    );
  }

  params = {
    'dateStart': '2017-12-31T00:00:00.000Z',
    'dateEnd': '2018-02-03T23:59:59.999Z',
    'compareStart': '2017-01-01T00:00:00.000Z',
    'compareEnd': '2017-01-28T23:59:59.999Z',
    'subscriptions': [
      {
        'positionIndex': 0,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'lastUpdated': '2018-02-11T14:16:15.014Z',
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
          'childrenUuids': [

          ],
          'name': 'Accessories'
        },
        'geography': {
          'childrenUuids': [
            '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
            'ada53770-aff9-4af5-b5a5-e0da4edf2779',
            'a59a2e37-521a-4123-8425-305974310a8f',
            '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
            '54e93ea1-6c4b-4477-9488-1970d245b16f',
            'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
            '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
            'deda9fa1-3947-446b-983a-2836bd10909a',
            '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
            '9bcbbb49-c394-41fa-9de7-125f0c88c930'
          ],
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'geoType': 'REGION',
          'name': 'Midwest',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b'
        }
      },
      {
        'positionIndex': 1,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'name': 'Accessories',
          'childrenUuids': [

          ],
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
          'lastUpdated': '2018-02-11T14:16:15.014Z'
        },
        'geography': {
          'uuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'name': 'West',
          'geoType': 'REGION',
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'childrenUuids': [
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
          ]
        }
      },
      {
        'positionIndex': 2,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'name': 'Accessories',
          'childrenUuids': [

          ],
          'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
          'lastUpdated': '2018-02-11T14:16:15.014Z'
        },
        'geography': {
          'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'name': 'Midwest',
          'geoType': 'REGION',
          'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'childrenUuids': [
            '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
            'ada53770-aff9-4af5-b5a5-e0da4edf2779',
            'a59a2e37-521a-4123-8425-305974310a8f',
            '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
            '54e93ea1-6c4b-4477-9488-1970d245b16f',
            'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
            '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
            'deda9fa1-3947-446b-983a-2836bd10909a',
            '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
            '9bcbbb49-c394-41fa-9de7-125f0c88c930'
          ]
        }
      },
      {
        'positionIndex': 3,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'name': 'Family Apparel',
          'childrenUuids': [

          ],
          'uuid': 'b8ad89ef-98ff-444a-a68c-e7ee9d4ec4ea',
          'lastUpdated': '2018-02-11T14:16:15.014Z'
        },
        'geography': {
          'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'name': 'US',
          'geoType': 'COUNTRY',
          'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
          'childrenUuids': [
            'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
            'b662eb53-9a41-49f0-922a-fde4e4445e84',
            '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
          ]
        }
      },
      {
        'positionIndex': 4,
        'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
        'lastUpdated': 0,
        'orgId': 1000003068,
        'timePeriod': 'None',
        'category': {
          'name': 'Home Furnishings',
          'childrenUuids': [

          ],
          'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
          'lastUpdated': '2018-02-11T14:16:15.014Z'
        },
        'geography': {
          'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
          'lastUpdated': '2018-02-11T14:15:53.747Z',
          'name': 'US',
          'geoType': 'COUNTRY',
          'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
          'childrenUuids': [
            'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
            'b662eb53-9a41-49f0-922a-fde4e4445e84',
            '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
          ]
        }
      }
    ]
  };

  getIndexDataResponse = {
    'index': [
      {
        'value': -0.25751277986679444,
        'valueAsString': '-25.75%',
        'siteCount': 409,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
              '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
              'ada53770-aff9-4af5-b5a5-e0da4edf2779',
              'a59a2e37-521a-4123-8425-305974310a8f',
              '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
              '54e93ea1-6c4b-4477-9488-1970d245b16f',
              'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
              '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
              'deda9fa1-3947-446b-983a-2836bd10909a',
              '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
              '9bcbbb49-c394-41fa-9de7-125f0c88c930'
            ],
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.09165608561581716,
        'valueAsString': '-9.17%',
        'siteCount': 526,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'West',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
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
            'uuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.25751277986679444,
        'valueAsString': '-25.75%',
        'siteCount': 409,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
              '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
              'ada53770-aff9-4af5-b5a5-e0da4edf2779',
              'a59a2e37-521a-4123-8425-305974310a8f',
              '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
              '54e93ea1-6c4b-4477-9488-1970d245b16f',
              'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
              '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
              'deda9fa1-3947-446b-983a-2836bd10909a',
              '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
              '9bcbbb49-c394-41fa-9de7-125f0c88c930'
            ],
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.0637082774990659,
        'valueAsString': '-6.37%',
        'siteCount': 4665,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Family Apparel',
            'childrenUuids': [

            ],
            'uuid': 'b8ad89ef-98ff-444a-a68c-e7ee9d4ec4ea',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.0823376230169802,
        'valueAsString': '-8.23%',
        'siteCount': 885,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Home Furnishings',
            'childrenUuids': [

            ],
            'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      }
    ],
    'org': [
      {
        'value': -0.08928178920760522,
        'valueAsString': '-8.93%',
        'siteCount': 27,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
              '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
              'ada53770-aff9-4af5-b5a5-e0da4edf2779',
              'a59a2e37-521a-4123-8425-305974310a8f',
              '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
              '54e93ea1-6c4b-4477-9488-1970d245b16f',
              'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
              '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
              'deda9fa1-3947-446b-983a-2836bd10909a',
              '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
              '9bcbbb49-c394-41fa-9de7-125f0c88c930'
            ],
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.1982827211245193,
        'valueAsString': '-19.83%',
        'siteCount': 30,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'West',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
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
            'uuid': '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.08928178920760522,
        'valueAsString': '-8.93%',
        'siteCount': 27,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Accessories',
            'childrenUuids': [

            ],
            'uuid': 'c35cb71f-5dcd-4ae3-86b3-d642208ad7f5',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'Midwest',
            'geoType': 'REGION',
            'parentUuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'childrenUuids': [
              '4b1d51e1-e8ba-4f2c-bb82-aca5d1dc9309',
              'ada53770-aff9-4af5-b5a5-e0da4edf2779',
              'a59a2e37-521a-4123-8425-305974310a8f',
              '06ac2c56-67ee-4b59-b0fe-d4ce6516f843',
              '54e93ea1-6c4b-4477-9488-1970d245b16f',
              'cd4ee5d6-02f1-4f98-8782-51d6e1d07536',
              '9e745d1e-e57a-4838-81f5-8fb9fe6da6bf',
              'deda9fa1-3947-446b-983a-2836bd10909a',
              '5f9ad8d0-55c3-4658-adad-0201a35b37c4',
              '9bcbbb49-c394-41fa-9de7-125f0c88c930'
            ],
            'uuid': 'ed6b04d2-c55d-418b-9274-77c05e745d4b',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.09590312924103533,
        'valueAsString': '-9.59%',
        'siteCount': 108,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Family Apparel',
            'childrenUuids': [

            ],
            'uuid': 'b8ad89ef-98ff-444a-a68c-e7ee9d4ec4ea',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      },
      {
        'value': -0.09590312924103533,
        'valueAsString': '-9.59%',
        'siteCount': 108,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Home Furnishings',
            'childrenUuids': [

            ],
            'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      }
    ]
  };

  getUpdatedIndexDataResponse = {
    'index': [
      {
        'value': -0.0823376230169802,
        'valueAsString': '-8.23%',
        'siteCount': 885,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Home Furnishings',
            'childrenUuids': [

            ],
            'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      }
    ],
    'org': [
      {
        'value': -0.09590312924103533,
        'valueAsString': '-9.59%',
        'siteCount': 108,
        'dateStart': '2018-02-04T00:00:00Z',
        'dateEnd': '2018-02-10T23:59:59.999Z',
        'compDateStart': '2017-02-05T00:00:00Z',
        'compDateEnd': '2017-02-11T23:59:59.999Z',
        'errorMessage': null,
        'subscription': {
          'orgId': 1000003068,
          'category': {
            'name': 'Home Furnishings',
            'childrenUuids': [

            ],
            'uuid': '0d550f49-d1db-49bc-9fc5-ba17fee86ae2',
            'lastUpdated': '2018-02-11T14:16:15.014Z'
          },
          'geography': {
            'name': 'US',
            'geoType': 'COUNTRY',
            'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
            'childrenUuids': [
              'ed6b04d2-c55d-418b-9274-77c05e745d4b',
              '102cc0f3-e297-4ce3-bb1e-cb192c68eaee',
              'b662eb53-9a41-49f0-922a-fde4e4445e84',
              '7f420fc1-f8fc-4fd5-8bae-50c3b22c1808'
            ],
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
            'lastUpdated': '2018-02-11T14:15:53.747Z'
          },
          'reportableSince': null,
          'uuid': '54c454be-f729-48f4-8ffd-5285b9c4103d',
          'lastUpdated': '1970-01-01T00:00:00Z'
        },
        'multiSeriesRequest': null,
        'siteIds': null,
        'debugCalculatorData': null,
        'valid': true
      }
    ]
  }
});
