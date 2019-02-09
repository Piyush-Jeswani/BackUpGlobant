describe('DashboardMiController', () => {
  let $rootScope;
  let $scope;
  let $q;
  let $timeout;
  let $controller;
  let $stateParamsMock = {};
  let $mockState;
  const storage = {};
  const noOfSegments = 5;

  const exportServiceMock = {

    getCart () {
      const cartObj = {
        '1000003068_-1': {}
      };
      const objKey = '2017-08-06T00:00:00.000Z - ' +
                     '2017-08-12T23:59:59.999Z - ' +
                     '2016-08-07T00:00:00.000Z - ' +
                     '2016-08-13T23:59:59.999Z - undefined - undefined';
      cartObj['1000003068_-1'][objKey] = {
        'start': '2017-08-06T00:00:00.000Z',
        'end': '2017-08-12T23:59:59.999Z',
        'compare1Start': '2016-08-07T00:00:00.000Z',
        'compare1End': '2016-08-13T23:59:59.999Z',
        'metrics': [{
          'compare1Type': 'prior_year',
          'compare2Type': {},
          'numberFormat': 'en-us',
          'name': 'segment',
          'hideCompare2Range': true,
          'dateFormat': 'DD|MM|YYYY',
          'showOrgIndex': true,
          'segments': [{}, {}, {}, {}, {}],
          'index': 0
        }],
        'groupBy': null
      };
      return cartObj;
    },
    createExportAndStore (params) {
      angular.noop(params);
    },

    isInExportCartWithSettings (params) {
      angular.noop(params);
    },
  };

  const currentOrganizationMock = {
    organization_id: 1000003068,
    localization: {
      number_format: 'en-us',
      date_format: {
        mask: 'DD-MM-YYYY'
      }
    },
  };

  let currentUserMock = {
    username: 'someone',
    preferences: { }
  };

  let subscriptionList;
  let subscriptionListGeoTitle;
  let mockViewData;
  let invalidSubscription;
  let validSubscription;
  let mockMiUserPreferences;
  let segmentPreferencesAreConfigured;
  let mockMarketIntelligenceService;
  let realMarketIntelligenceService;
  let mockLocalStorageService;

  beforeEach(module('shopperTrak', $translateProvider => {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject((
    _$rootScope_,
    _$controller_,
    _$q_,
    _$timeout_,
    _marketIntelligenceService_
  ) => {
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    $q = _$q_;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    realMarketIntelligenceService = _marketIntelligenceService_;
  }));

  beforeEach(() => {
    console.error = angular.noop;
  });

  describe('when creating pdf export config', () => {
    beforeEach(() => {
      resetResources();

      $stateParamsMock.dateRangeStart = moment.utc('2018-04-01');
      $stateParamsMock.dateRangeEnd = moment.utc('2018-04-30');

      $stateParamsMock.compareRange1Start = moment.utc('2017-04-01');
      $stateParamsMock.compareRange1End = moment.utc('2017-04-30');

      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: getSingleSubscription()
          }
        },
        localization: {
          number_format: 'en-us'
        },
        subscriptions: {
          mi_index: [currentOrganizationMock.organization_id]
        }
      };

      $mockState.advanceFilterSelectedSegment = validSubscription;

      segmentPreferencesAreConfigured = true;
    });
    
    it('should create a config for a number of widgets', () => {
      const vm = instantiateController();
      $timeout.flush();
      expect(vm.viewData['segment']).toBeDefined();
      expect(vm.viewData['market_intelligence']).toBeDefined();
    });
    
    it('should create a segment config', () => {
      const segment = {
        positionIndex: 0,
        category: {
          uuid: currentUserMock.preferences.market_intelligence.segments[0].subscription.category.value.src.uuid
        },
        geography: {
          uuid: currentUserMock.preferences.market_intelligence.segments[0].subscription.geography.value.src.uuid
        }
      };
      const vm = instantiateController();
      $timeout.flush();
      const exportConfig = vm.viewData.segment;
      const selectedRange = { start: $stateParamsMock.dateRangeStart, end: $stateParamsMock.dateRangeEnd };
      const compareRange1 = { start: $stateParamsMock.compareRange1Start, end: $stateParamsMock.compareRange1End };
      expect(exportConfig).toBeDefined();
      expect(exportConfig.orgId).toEqual(currentOrganizationMock.organization_id);
      expect(exportConfig.dateRange).toEqual(selectedRange);
      expect(exportConfig.compare1Range).toEqual(compareRange1);
      expect(_.isEmpty(exportConfig.compare2Range)).toEqual(true);
      expect(exportConfig.compare1Type).toEqual('prior_year');
      expect(_.isEmpty(exportConfig.compare2Type)).toEqual(true);
      expect(exportConfig.numberFormatName).toEqual(currentOrganizationMock.localization.number_format);
      expect(exportConfig.name).toEqual('segment');
      expect(exportConfig.hideCompare2Range).toEqual(true);
      expect(exportConfig.dateFormat).toEqual('DD-MM-YYYY');
      expect(exportConfig.showOrgIndex).toEqual(true);
      expect(exportConfig.segments[0]).toEqual(segment);
    });
    
    it('should create a market_intelligence config', () => {
      const selectedOptions = {
        dateStart: $stateParamsMock.dateRangeStart.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        dateEnd: $stateParamsMock.dateRangeEnd.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        compareStart: $stateParamsMock.compareRange1Start.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        compareEnd: $stateParamsMock.compareRange1End.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        subscriptions: [{
          'name': 'Geography',
          'value': { 'src': { 'name': 'Northeast' } }
        }, {
          'name': 'Category',
          'value': { 'src': { 'name': 'Total Retail' } }
        }]
      };
      const vm = instantiateController();
      $timeout.flush();
      const exportConfig = vm.viewData['market_intelligence'];
      expect(exportConfig).toBeDefined();
      const selectedRange = { start: $stateParamsMock.dateRangeStart, end: $stateParamsMock.dateRangeEnd };
      const compareRange1 = { start: $stateParamsMock.compareRange1Start, end: $stateParamsMock.compareRange1End };
      expect(exportConfig).toBeDefined();
      expect(exportConfig.orgId).toEqual(currentOrganizationMock.organization_id);
      expect(exportConfig.dateRange).toEqual(selectedRange);
      expect(exportConfig.compare1Range).toEqual(compareRange1);
      expect(_.isEmpty(exportConfig.compare2Range)).toEqual(true);
      expect(exportConfig.compare1Type).toEqual('prior_year');
      expect(_.isEmpty(exportConfig.compare2Type)).toEqual(true);
      expect(exportConfig.numberFormatName).toEqual(currentOrganizationMock.localization.number_format);
      expect(exportConfig.name).toEqual('market_intelligence');
      expect(exportConfig.hideCompare2Range).toEqual(true);
      expect(exportConfig.dateFormat).toEqual('DD-MM-YYYY');
      expect(exportConfig.showOrgIndex).toEqual(true);
      expect(exportConfig.selectedOptions).toEqual(selectedOptions);
      expect(_.isEmpty(exportConfig.pdfExportConfig)).toEqual(true);
        
    });
  });

  describe('exportAllWidgets', () => {
    beforeEach(() => {
      resetResources();

      $stateParamsMock.dateRangeStart = moment.utc('2017-01-01');
      $stateParamsMock.dateRangeEnd = moment.utc('2017-01-30');

      $stateParamsMock.compareRange1Start = moment.utc('2016-01-01');
      $stateParamsMock.compareRange1End = moment.utc('2016-01-30');

      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: getSingleSubscription()
          } 
        }
      };

      segmentPreferencesAreConfigured = true;
    });

    it('should redirect the user to the pdf view when the scheduleExportCurrentViewToPdf event is broadcast', () => {
      $mockState.advanceFilterSelectedSegment = validSubscription;
      instantiateController();

      $timeout.flush();

      spyOn($mockState, 'go');

      $rootScope.$broadcast('scheduleExportCurrentViewToPdf');

      expect($mockState.go).toHaveBeenCalledWith('pdfexport', { orgId: 1000003068, view: 'schedule'});
    });
  });

  describe('exportWidget', () => {
    beforeEach(() => {
      resetResources();

      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: getSingleSubscription()
          } 
        }
      };

      segmentPreferencesAreConfigured = true;
    });

    it('should add the segment widget to the export cart', () => {
      spyOn(exportServiceMock, 'createExportAndStore');
      
      const vm = instantiateController();

      $timeout.flush();

      vm.exportWidget('segment');

      expect(exportServiceMock.createExportAndStore).toHaveBeenCalled();
    });
  });

  describe('widgetIsExported', () => {
    beforeEach(() => {
      resetResources();

      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: getSingleSubscription()
          } 
        }
      };

      segmentPreferencesAreConfigured = true;
    });

    it('should call the export service to check if a widget is in the export cart', () => {
      spyOn(exportServiceMock, 'isInExportCartWithSettings');

      const vm = instantiateController();

      $timeout.flush();
      $rootScope.$broadcast('page-loaded');
      vm.widgetIsExported('segment', mockViewData.segment);

      expect(exportServiceMock.isInExportCartWithSettings).toHaveBeenCalled();
    });
  });

  describe('activate', () => {
    beforeEach(() => {
      resetResources();
    });

    it('should set isLoading to true', () => {
      const vm = instantiateController();
      expect(vm.isLoading).toBe(true);
    });

    it('should set market intelligence to unavailable if the miSubscription endpoint returns an error', () => {
      mockMarketIntelligenceService.getSubscriptions = () => {
        const defer = $q.defer();
        defer.reject('some error');
        return defer.promise;
      };

      const vm = instantiateController();

      $timeout.flush();

      expect(vm.isLoading).toBe(false);
      expect(vm.miAvailable).toBe(false);
    });

    it('should set market intelligence to unavailable if an empty list gets returned from the subscriptions service', () => {
      subscriptionList = [];

      const vm = instantiateController();

      $timeout.flush();

      expect(vm.isLoading).toBe(false);
      expect(vm.miAvailable).toBe(false);
    });

    it('should set market intelligence to unavailable if no subscriptions are returned for the org', () => {
      subscriptionList = [];
      mockMarketIntelligenceService.getSubscriptions = () => {
        const defer = $q.defer();
        defer.resolve(subscriptionList);
        return defer.promise;
      };

      $stateParamsMock = {
        orgId: 100
      };

      spyOn(console, 'error');

      const vm = instantiateController();

      $timeout.flush();

      expect(vm.isLoading).toBe(false);
      expect(vm.miAvailable).toBe(false);
      expect(console.error).toHaveBeenCalledWith('No ShopperTrak Index subscriptions found for orgId: 100');
    });

    describe('market intelligence is available', () => {
      it('should assign the date ranges to scope variables from the state', () => {
        $stateParamsMock.dateRangeStart = moment.utc('2017-01-01');
        $stateParamsMock.dateRangeEnd = moment.utc('2017-01-30');

        $stateParamsMock.compareRange1Start = moment.utc('2016-01-01');
        $stateParamsMock.compareRange1End = moment.utc('2016-01-30');

        const vm = instantiateController();

        $timeout.flush();

        expect(vm.periodSelected.start.toISOString()).toBe($stateParamsMock.dateRangeStart.toISOString());
        expect(vm.periodSelected.end.toISOString()).toBe($stateParamsMock.dateRangeEnd.toISOString());

        expect(vm.periodCompared.start.toISOString()).toBe($stateParamsMock.compareRange1Start.toISOString());
        expect(vm.periodCompared.end.toISOString()).toBe($stateParamsMock.compareRange1End.toISOString());
      });

      it('should set the current user', () => {
        currentUserMock = {
          username: 'test1'
        };

        const vm = instantiateController();

        $timeout.flush();

        expect(vm.currentUser.username).toBe('test1');
      });

      describe('First time MI configuration', () => {
        beforeEach(() => {
          segmentPreferencesAreConfigured = false;
          currentUserMock = {
            username: 'test1',
            preferences: { }
          };
        });

        it('should configure the default selected segments if the current user has no segments configured', () => {
          const vm = instantiateController();

          $timeout.flush();
          const defaultSegments = vm.getDefaultSegments();
          expect(defaultSegments.length).toBe(noOfSegments);
          expect(defaultSegments[0].subscription.geography.value.name).toBe('US');
          expect(defaultSegments[1].subscription.geography.value.name).toBe('Northeast');
          expect(defaultSegments[2].subscription.geography.value.name).toBe('Midwest');
          expect(defaultSegments[3].subscription.geography.value.name).toBe('West');
          expect(defaultSegments[4].subscription.geography.value.name).toBe('South');
        });

        it('should save the the default segments once set', () => {
          spyOn(mockMarketIntelligenceService, 'saveUserMarketIntelligence').and.callThrough();

          const vm = instantiateController();

          $timeout.flush();
          const defaultSegments = vm.getDefaultSegments();
          segmentPreferencesAreConfigured = true;

          expect(
            mockMarketIntelligenceService.saveUserMarketIntelligence
          ).toHaveBeenCalledWith(
            currentUserMock, defaultSegments, currentOrganizationMock.organization_id
          );
          expect(vm.firstTimeConfigure).toBe(false);
        });

        it('should emit setMiExists once market intelligence has been configured and saved for the first time', () => {
          spyOn($scope, '$emit');

          instantiateController();

          $timeout.flush();

          expect($scope.$emit).toHaveBeenCalledWith('setMiExists');
        });
      });

      describe('the user has market intelligence configured', () => {
        beforeEach(() => {
          currentUserMock = {
            username: 'test1',
            preferences: {
              market_intelligence : {
                segments: getSingleSubscription()
              } 
            }
          };

          segmentPreferencesAreConfigured = true;

          $stateParamsMock.dateRangeStart = moment.utc('2017-01-01');
          $stateParamsMock.dateRangeEnd = moment.utc('2017-01-30');

          $stateParamsMock.compareRange1Start = moment.utc('2016-01-01');
          $stateParamsMock.compareRange1End = moment.utc('2016-01-30');
        });

        it('should setup the params object', () => {
          const vm = instantiateController();

          $timeout.flush();

          expect(vm.params.dateStart.toISOString()).toBe($stateParamsMock.dateRangeStart.toISOString());
          expect(vm.params.dateEnd.toISOString()).toBe($stateParamsMock.dateRangeEnd.toISOString());
          expect(vm.params.subscriptions).toBeDefined();
        });

        it('should set the default segment for the advanced filter', () => {
          const vm = instantiateController();

          $timeout.flush();
          expect(vm.params.subscriptions[0].category.name).toBe('Total Retail');
          expect(vm.params.subscriptions[0].geography.name).toBe('US');
        });
        
        it('should reset to default segments after subscription changes', () => {
          let vm = instantiateController();
          $timeout.flush();
          expect(vm.params.subscriptions[0].category.name).toBe('Total Retail');
          expect(vm.params.subscriptions[0].geography.name).toBe('US');
          subscriptionList[0].geography.name = 'DE';
          currentUserMock = {
            username: 'test1',
            preferences: {
              market_intelligence : {
                segments: getDefaultSegmentsSubscription()
              } 
            }
          };
          vm = instantiateController();
          $timeout.flush();
          expect(vm.params.subscriptions.length).toBe(noOfSegments);
          expect(vm.params.subscriptions[0].geography.name).toBe('DE');
          expect(vm.params.subscriptions[1].geography.name).toBe('Northeast');
          expect(vm.params.subscriptions[2].geography.name).toBe('Midwest');
          expect(vm.params.subscriptions[3].geography.name).toBe('West');
          expect(vm.params.subscriptions[4].geography.name).toBe('South');
        });
        
        it('should reset to default segments after the number of subscriptions changes', () => {
          let vm = instantiateController();
          $timeout.flush();
          expect(vm.params.subscriptions[0].category.name).toBe('Total Retail');
          expect(vm.params.subscriptions[0].geography.name).toBe('US');
          const subscription = subscriptionList[4];
          subscriptionList.unshift(subscription);
          currentUserMock = {
            username: 'test1',
            preferences: {
              market_intelligence : {
                segments: getDefaultSegmentsSubscription()
              } 
            }
          };
          vm = instantiateController();
          $timeout.flush();
          expect(vm.params.subscriptions.length).toBe(noOfSegments);
          expect(vm.params.subscriptions[0].geography.name).toBe('South');
          expect(vm.params.subscriptions[1].geography.name).toBe('US');
          expect(vm.params.subscriptions[2].geography.name).toBe('Northeast');
          expect(vm.params.subscriptions[3].geography.name).toBe('Midwest');
          expect(vm.params.subscriptions[4].geography.name).toBe('West');
        });          
      });
    });
  });

  describe('setSegmentForAdvancedOptions', () => {
    describe('$state.advanceFilterSelectedSegment has an invalid subscription', () => {
      let vm;
      beforeEach(() => {
        $mockState.advanceFilterSelectedSegment = validSubscription;
        vm = instantiateController();
        $timeout.flush();
      });
      it('should set vm.segment to $state.advanceFilterSelectedSegment', () => {
        expect(vm.segment).toEqual($mockState.advanceFilterSelectedSegment);
      });
    });

    describe('$state.advanceFilterSelectedSegment has a valid subscription', () => {
      let vm;
      beforeEach(() => {
        $mockState.advanceFilterSelectedSegment = invalidSubscription;
        vm = instantiateController();
        $timeout.flush();
      });
      it('should set vm.segment.subscription to the first user defined segments', () => {
        const geography = currentUserMock.preferences.market_intelligence.segments[0].subscription.geography.value.src.name;
        const category = currentUserMock.preferences.market_intelligence.segments[0].subscription.category.value.src.name;
         expect(vm.segment.subscription[0].value.src.name).toEqual(geography);
         expect(vm.segment.subscription[1].value.src.name).toEqual(category);
      });
    });
  });

  describe('checkCurrentUserSegments', () => {
    beforeEach(() => {
      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: getDefaultSegmentsSubscription()
          } 
        }
      };
    });

    it('current user has invalid subscription', () => {
      spyOn(mockMarketIntelligenceService, 'saveUserMarketIntelligence').and.callThrough();
      
      const updatedSegmentsSubscription = getDefaultSegmentsSubscription();
      updatedSegmentsSubscription[4].subscription.category.value.src.name = 'DUMMYCATEGORY';
      updatedSegmentsSubscription[4].subscription.geography.value.src.name = 'DUMMYGEOGRAPHY';
      
      currentUserMock = {
        username: 'test1',
        preferences: {
          market_intelligence : {
            segments: updatedSegmentsSubscription
          } 
        }
      };

      const vm = instantiateController();
      $timeout.flush();
      vm.sourceSubscriptions = subscriptionList;
      const currentUserSegments = currentUserMock.preferences.market_intelligence.segments;

      expect(currentUserSegments.length).toBe(noOfSegments);
      expect(
        mockMarketIntelligenceService.saveUserMarketIntelligence
      ).toHaveBeenCalledWith(
        currentUserMock, currentUserSegments, currentOrganizationMock.organization_id
      );
      expect(vm.firstTimeConfigure).toBe(false);
    });

    it('current user has valid subscription', () => {
      const vm = instantiateController();
      $timeout.flush();
      vm.sourceSubscriptions = subscriptionList;

      expect(currentUserMock.preferences.market_intelligence.segments.length).toBe(noOfSegments);
      const category = currentUserMock.preferences.market_intelligence.segments[0].subscription.category.value.src.name;
      const geography = currentUserMock.preferences.market_intelligence.segments[0].subscription.geography.value.src.name;
      expect(vm.sourceSubscriptions[0].category.name).toBe(category);
      expect(vm.sourceSubscriptions[0].geography.name).toBe(geography);
    });
  });

  function resetResources () {
    const totalRetailUuid = 'da815dbc-f066-4807-a6ac-ae145e6b6242';

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

    subscriptionListGeoTitle = [{
      geography: {
        name: 'United States',
        uuid: '6d1175b8-eb06-45ee-9d11-9a63c072f728',
        geoType: 'Country'
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

    mockMiUserPreferences = {
      segmentPreferencesAreConfigured () {
        return segmentPreferencesAreConfigured;
      },
      getConfiguredSegments ({market_intelligence}) {
        return market_intelligence.segments;
      }
    };

    mockMarketIntelligenceService = {
      saveUserMarketIntelligence (currentUser, segments) {
        angular.noop(currentUser, segments);
        const defer = $q.defer();
        defer.resolve();
        return defer.promise;
      },
      getSubscriptions (orgId, hasGlobals, isCached) {
        angular.noop(orgId, hasGlobals, isCached);
        const defer = $q.defer();
        defer.resolve(subscriptionList);
        return defer.promise;
      },
      setSubscriptionGeoToFullName (res) {
        angular.noop(res);
        return subscriptionListGeoTitle;
      },
      getFullGeoTitleByCode (string) {
        angular.noop(string);
        return 'United States';
      },
      isSubscriptionValid: realMarketIntelligenceService.isSubscriptionValid,
      sliceSubscription: realMarketIntelligenceService.sliceSubscription
    };

    mockLocalStorageService = {
      get (key) {
        return storage[key];
      },
      set (key, value) {
        return storage[key] = `${value}`;
      },
      remove (key) {
        return delete storage[key]; 
      }
    };

    mockViewData = {
      'segment': {
        'orgId': 1000003068,
        'dateRange': {
          'start': '2017-08-06T00:00:00.000Z',
          'end': '2017-08-12T23:59:59.999Z'
        },
        'compare1Range': {
          'start': '2016-08-07T00:00:00.000Z',
          'end': '2016-08-13T23:59:59.999Z'
        },
        'compare2Range': {},
        'compare1Type': 'prior_year',
        'compare2Type': {},
        'numberFormat': 'en-us',
        'name': 'segment',
        'hideCompare2Range': true,
        'dateFormat': 'D.M.YYYY',
        'showOrgIndex': true,
        'segments': [{
          'positionIndex': 0,
          'category': {
            'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242'
          },
          'geography': {
            'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728'
          }
        }, {
          'positionIndex': 1,
          'category': {
            'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242'
          },
          'geography': {
            'uuid': '102cc0f3-e297-4ce3-bb1e-cb192c68eaee'
          }
        }]
      },
      'market_intelligence': {
        'orgId': 1000003068,
        'dateRange': {
          'start': '2017-08-06T00:00:00.000Z',
          'end': '2017-08-12T23:59:59.999Z'
        },
        'compare1Range': {
          'start': '2016-08-07T00:00:00.000Z',
          'end': '2016-08-13T23:59:59.999Z'
        },
        'compare2Range': {},
        'compare1Type': 'prior_year',
        'compare2Type': {},
        'numberFormat': 'en-us',
        'name': 'market-intelligence',
        'hideCompare2Range': true,
        'dateFormat': 'D.M.YYYY',
        'showOrgIndex': true
      }
    };

    invalidSubscription = {
      subscription: [
        {
          'name': 'Geography',
          'value': {
            'src': {
              'name': 'London'
            }
          }
        },
        {
          'name': 'Category',
          'value': {
            'src': {
              'name': 'Total Mall'
            }
          }
        }
      ]
    };

    validSubscription = {
      subscription: [
        {
          'name': 'Geography',
          'value': {
            'src': {
              'name': 'Northeast',
            }
          }
        },
        {
          'name': 'Category',
          'value': {
            'src': {
              'name': 'Total Retail'
            }
          }
        }
      ]
    };

    $mockState = {
      go (stateName) {
        angular.noop(stateName);
      },
      advanceFilterSelectedSegment: []
    };
  }

  function getSingleSubscription () {
    return [
      {
        'positionIndex': 0,
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': 'US',
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': 'US',
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': 'Total Retail',
              'src': {
                'name': 'Total Retail',
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }
    ];
  }

  function getDefaultSegmentsSubscription () {
    return [
      {
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[0].geography.name,
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': subscriptionList[0].geography.name,
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[0].category.name,
              'src': {
                'name': subscriptionList[0].category.name,
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }, {
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[1].geography.name,
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': subscriptionList[1].geography.name,
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[1].category.name,
              'src': {
                'name': subscriptionList[1].category.name,
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }, {
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[2].geography.name,
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': subscriptionList[2].geography.name,
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[2].category.name,
              'src': {
                'name': subscriptionList[2].category.name,
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }, {
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[3].geography.name,
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': subscriptionList[3].geography.name,
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[3].category.name,
              'src': {
                'name': subscriptionList[3].category.name,
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }, {
        'subscription': {
          'geography': {
            'orgId': 1000003068,
            'name': 'Country',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[4].geography.name,
              'src': {
                'uuid': '6d1175b8-eb06-45ee-9d11-9a63c072f728',
                'lastUpdated': '2017-07-03T09:00:00.033Z',
                'name': subscriptionList[4].geography.name,
                'geoType': 'COUNTRY',
                'parentUuid': '46a3b5b5-76b6-4419-8038-0b622bc9f7ae',
                
              }
            }
          },
          'category': {
            'orgId': 1000003068,
            'name': 'Category',
            'rule': 'Contains',
            'value': {
              'name': subscriptionList[4].category.name,
              'src': {
                'name': subscriptionList[4].category.name,
                'uuid': 'da815dbc-f066-4807-a6ac-ae145e6b6242',
                'lastUpdated': '2017-05-17T16:46:27.009Z'
              }
            }
          }
        }
      }
    ];
  }

  function instantiateController () {
    return $controller('DashboardMiController', {
      '$scope': $scope,
      '$state': $mockState,
      '$stateParams': $stateParamsMock,
      'currentOrganization': currentOrganizationMock,
      'currentUser': currentUserMock,
      'miUserPreferences': mockMiUserPreferences,
      'marketIntelligenceService': mockMarketIntelligenceService,
      'ExportService': exportServiceMock,
      'localStorageService': mockLocalStorageService
    });
  }
});
