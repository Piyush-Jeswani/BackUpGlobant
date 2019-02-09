describe('organizationFilterWidget', () => {
  let $compile;
  let $scope;
  let $rootScope;
  let $timeout;
  let $state;
  const apiUrl = 'https://api.url';

  const mockedRequestManagerDataOrgSites = [
    {
      business_day_start_hour: 0,
      customer_site_id: 'MPCS9102',
      fullAccess: true,
      location_id: 5649,
      name: 'MPCS9102Flatbush',
      organization: { id: 1224, name: 'MetroPCS' },
      site_id: 80067024
    }
  ];

  const mockedRequestManagerDataOrgCustTags = [
    {
      _id: '59667aefbf3d5816fdee94e5', name: 'Adam Payne', tag_type: 'Account Manager', site_count: 0
    },
    {
      _id: '59667aefbf3d5816fdee9525', name: 'Adam Vasquez', tag_type: 'Account Manager', site_count: 0
    }
  ];

  const requestManagerMock = $q => ({
    get (url, params) {
      const deferred = $q.defer();

      angular.noop(url, params);

      if (url.includes('custom-tags')) {  
        deferred.resolve({ result: angular.copy(mockedRequestManagerDataOrgCustTags) });
      } else {
        deferred.resolve({ result: angular.copy(mockedRequestManagerDataOrgSites) });
      }

      return deferred.promise;
    }
  });

  beforeEach(module('shopperTrak'));

  beforeEach(module($provide => {
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('requestManager', requestManagerMock);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject((_$rootScope_, _$compile_, _$state_, _$timeout_, _requestManager_) => {
    $timeout = _$timeout_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }));

  describe('directive instantiation', () => {
    it('should test directive constructor with selectedTagData set to empty array for current org', () => {
      $scope.selectedTagData = [];

      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: ['test', 'test2'] },
        site_count: 14
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.selectedTagData).toEqual([]);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(0);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.ranApplyFilters).toBe(false);
      expect(vm.openFilters).toBe(false);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.customTagsSelected).toEqual({});
      expect(vm.selectedTagNames).toEqual({});
      expect(vm.selectedTagsInGroup).toEqual({});
    });
  });

  describe('directive instantiation', () => {
    it('should test directive constructor with selectedTagData set to empty array and openMain set to true for current org', () => {
      $scope.selectedTagData = [];
      $scope.openMain = true;

      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: ['test', 'test2'] },
        site_count: 14
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.openMain).toBe(true);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(0);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.ranApplyFilters).toBe(false);
      expect(vm.openFilters).toBe(true);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.customTagsSelected).toEqual({});
      expect(vm.selectedTagNames).toEqual({});
      expect(vm.selectedTagsInGroup).toEqual({});
    });
  });

  describe('directive instantiation', () => {
    it('should test selectedTagData set to empty array, openMain set to true and preselectedTags set for current org', () => {
      $scope.selectedTagData = [];
      $scope.openMain = true;
      $scope.preselectedTags = [{ corporate: 'x' }, { district: 'y' }, { store: 'z' }];

      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: ['test', 'test2'] },
        site_count: 14
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.openMain).toBe(true);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(0);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.ranApplyFilters).toBe(false);
      expect(vm.openFilters).toBe(true);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.customTagsSelected).toEqual({});
      expect(vm.selectedTagNames).toEqual({});
      expect(vm.selectedTagsInGroup).toEqual({});
    });
  });

  describe('directive instantiation', () => {
    it('should test selectedTagData set to empty array, openMain set to true, preselectedTags set for current organization', () => {
      $scope.selectedTagData = [];
      $scope.openMain = true;
      $scope.preselectedTags = [{ corporate: 'x' }, { district: 'y' }, { store: 'z' }];
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: 'test' },
        site_count: 14
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.openMain).toBe(true);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(0);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.ranApplyFilters).toBe(false);
      expect(vm.openFilters).toBe(true);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.customTagsSelected).toEqual({});
      expect(vm.selectedTagNames).toEqual({});
      expect(vm.selectedTagsInGroup).toEqual({});
    });
  });

  describe('directive instantiation', () => {
    it('should test selectedTagData set to empty array, openMain set to true, preselectedTags, organization and activeFilters set for current org', () => {
      $scope.selectedTagData = [];
      $scope.openMain = true;
      $scope.preselectedTags = [{ corporate: 'x' }, { district: 'y' }, { store: 'z' }];
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: 'test' }
      };
      $scope.activeFilters = [{
        group: 'Dealer',
        tag: {
          filter_type: 'custom',
          name: '0 Mile Communications',
          site_count: 0,
          tag_type: 'Dealer',
          _id: '59667aefbf3d5816fdee9a90'
        }
      }];

      const vm = renderDirectiveAndDigest();

      expect(vm.openMain).toBe(true);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(1);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.ranApplyFilters).toBe(true);
      expect(vm.openFilters).toBe(true);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.filterHasChanged).toBe(false);
      expect(vm.selectedTagData[0]).toEqual([]);
      expect(vm.selectedTagData[2].Dealer).toBe(1);
    });
  });

  describe('directive instantiation', () => {
    it('should test selectedTagData set to empty array, openMain set to true, preselectedTags set, organization set and activeFilters set with Id', () => {
      $scope.selectedTagData = [];
      $scope.openMain = true;
      $scope.preselectedTags = [{ corporate: 'x' }, { district: 'y' }, { store: 'z' }];
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: 'test' }
      };
      $state.activeFilterId = 10;
      $state.activeFilters = [{
        group: 'Dealer',
        tag: {
          filter_type: 'custom',
          name: '0 Mile Communications',
          site_count: 0,
          tag_type: 'Dealer',
          _id: '59667aefbf3d5816fdee9a90'
        }
      }];
      const vm = renderDirectiveAndDigest();

      expect(vm.openMain).toBe(true);
      expect(vm.organizationTags).toBe(undefined);
      expect(vm.organizationTagsIsNull).toBe(undefined);
      expect(vm.isOpenGroup).toEqual([]);
      expect(vm.isOpenLevel).toEqual([]);
      expect(vm.totalTagsSelected).toEqual(0);
      expect(vm.filterHasChanged).toBe(true);
      expect(vm.ranApplyFilters).toBe(false);
      expect(vm.openFilters).toBe(true);
      expect(vm.selectedTags).toEqual([]);
      expect(vm.filterHasChanged).toBe(true);
      expect(vm.selectedTagData[0]).toEqual(undefined);
    });
  });

  describe('configureWatches()', () => {
    it('should test event stateChangeSuccess generation on the rootScope when current organization is set and activeFilters have an id', () => {
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: 'test' }
      };
      $state.activeFilterId = 10;
      $state.activeFilters = [{
        group: 'Dealer',
        tag: {
          filter_type: 'custom',
          name: '0 Mile Communications',
          site_count: 0,
          tag_type: 'Dealer',
          _id: '59667aefbf3d5816fdee9a90'
        }
      }];

      const vm = renderDirectiveAndDigest();

      const fakeRouteParams = {
        dateRangeEnd: undefined,
        dateRangeStart: undefined,
        compareRange1Start: undefined,
        compareRange1End: undefined,
        compareRange2Start: undefined,
        compareRange2End: undefined
      };

      $rootScope.$broadcast('$stateChangeSuccess', null, fakeRouteParams);

      expect($state.activeFilters).toBe(undefined);
      expect($state.activeFilterId).toBe(undefined);
    });
  });

  describe('configureWatches()', () => {
    it('should test event clearFilter generation on the $scope when current organization is set', () => {
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: 'test' }
      };

      const vm = renderDirectiveAndDigest();

      const fakeData = {
        dateRangeEnd: undefined,
        dateRangeStart: undefined,
        compareRange1Start: undefined,
        compareRange1End: undefined,
        compareRange2Start: undefined,
        compareRange2End: undefined
      };

      $scope.$broadcast('clearFilter', fakeData);

      expect(vm.selectedTags).toEqual([]);
      expect(vm.customTagsSelected).toEqual({});
      expect(vm.selectedTagNames).toEqual({});
      expect(vm.selectedTagsInGroup).toEqual({});
      expect(vm.totalTagsSelected).toEqual(0);
    });
  });

  describe('separateTagsIntoColumns(tags)', () => {
    it('should test separateTagsIntoColumns(tags) with current organization set and separation of tags to a maximum of 6 columns', () => {
      $scope.currentOrganization = {
        organization_id: 10,
        site_count: 0,
        portal_settings: { 
          group_structures: [{ 
            levels: [{ 
              description: 'x', 
              possible_values: [{
                name: 'A name',
                levels: [{name: 'a some level name'}]
              }, {
                name: 'b name',
                levels: [{name: 'b some level name'}]
              }]
            }] 
          }] 
        }
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.separatedTags[0][0].name).toBe('x');
      expect(vm.separatedTags[1]).toEqual([]);
      expect(vm.separatedTags[2]).toEqual([]);
      expect(vm.separatedTags[3]).toEqual([]);
      expect(vm.separatedTags[4]).toEqual([]);
      expect(vm.separatedTags[5]).toEqual([]);
      expect(vm.separatedTags[6]).toEqual(undefined);
    });

    it('should not assign any seperated tags if there are no group_structures or custom_tags on the org', () => {
      $scope.currentOrganization = {
        organization_id: 10,
        site_count: 0,
        portal_settings: { group_structures: null }
      };

      const vm = renderDirectiveAndDigest();

      expect(vm.separatedTags).toBeUndefined();
    });
  });

  describe('toggleLevel(group, level)', () => {
    it('should test call to toggleLevel(group, level) with isOpenLevel not set', () => {
      const vm = renderDirectiveAndDigest();

      const group = 0;
      const level = 1;
      vm.toggleLevel(group, level);

      expect(vm.isOpenLevel[0][1]).toEqual(true);
    });
  });

  describe('toggleLevel(group, level)', () => {
    it('should test call to toggleLevel(group, level) with isOpenLevel set', () => {
      const vm = renderDirectiveAndDigest();

      const group = 0;
      const level = 1;
      vm.isOpenLevel = [
        [true, true],
        [true, true],
        [true, true]
      ];

      vm.toggleLevel(group, level);

      expect(vm.isOpenLevel[0][1]).toEqual(false);
    });
  });

  describe('toggleGroup(number)', () => {
    it('should test call to toggleGroup(number) with isOpenGroup not set', () => {
      const vm = renderDirectiveAndDigest();

      const group = 0;

      vm.toggleGroup(0);

      expect(vm.isOpenGroup[0]).toEqual(true);
    });
  });

  describe('toggleGroup(number)', () => {
    it('should test call to toggleGroup(number) with isOpenGroup set', () => {
      const vm = renderDirectiveAndDigest();

      const group = 0;
      vm.isOpenGroup = [];
      vm.isOpenGroup[0] = true;

      vm.toggleGroup(0);

      expect(vm.isOpenGroup[0]).toEqual(false);
    });
  });

  describe('clearFilters()', () => {
    it('should test call to clearFilters() with ranApplyFilters set to true and setSelectedTagsSites set to function', () => {
      const vm = renderDirectiveAndDigest();

      vm.ranApplyFilters = true;
      vm.setSelectedTagsSites = setSelectedTagsSites;
      spyOn(vm, 'setSelectedTagsSites').and.callThrough();

      vm.clearFilters();

      expect(vm.ranApplyFilters).toEqual(false);
      expect(vm.selectedTagData).toBeDefined();
      expect(vm.setSelectedTagsSites).toHaveBeenCalled();
    });
  });

  describe('toggleFilters()', () => {
    it('should test call to toggleFilters() with openFilters set to true', () => {
      const vm = renderDirectiveAndDigest();

      vm.openFilters = true;

      vm.toggleFilters();

      expect(vm.openFilters).toEqual(false);
    });
  });

  describe('toggleFilters()', () => {
    it('should test call to toggleFilters() with openFilters set to false', () => {
      const vm = renderDirectiveAndDigest();

      vm.openFilters = false;

      vm.toggleFilters();

      expect(vm.openFilters).toEqual(true);
    });
  });

  describe('toggleTag', () => {
    describe('custom tags', () => {
      it('should mark the tag as selelected', () => {
        const vm = renderDirectiveAndDigest();
        
        const customTag = {
          filter_type: 'test',
          name: 'Test Tag',
          _id: '1234'
        };

        vm.cachedFilters = [];

        vm.toggleTag(customTag, 'somegroup');

        expect(vm.customTagsSelected['1234']).toBe(true);
        expect(vm.selectedTagsInGroup['somegroup']).toBe(1);
      });

      it('should unselect the tag if it was previously selected', () => {
        const vm = renderDirectiveAndDigest();
        
        const customTag = {
          filter_type: 'test',
          name: 'Test Tag',
          _id: '1234'
        };

        vm.cachedFilters = [];
        vm.customTagsSelected['1234'] = true;
        vm.selectedTagsInGroup['somegroup'] = 1;

        vm.toggleTag(customTag, 'somegroup');

        expect(vm.customTagsSelected['1234']).toBe(false);
        expect(vm.selectedTagsInGroup['somegroup']).toBe(0);
      });

      it('should add selected tags to the cachedFilters', () => {
        const vm = renderDirectiveAndDigest();
        
        const customTag = {
          filter_type: 'test',
          name: 'Test Tag',
          _id: '1234'
        };

        vm.cachedFilters = [];

        vm.toggleTag(customTag, 'somegroup');
        expect(vm.cachedFilters[0].tag._id).toBe('1234');
        expect(vm.cachedFilters[0].group).toBe('somegroup');
      });

      it('should remove deselected tags from the cachedFilters', () => {
        const vm = renderDirectiveAndDigest();
        
        const customTag = {
          filter_type: 'test',
          name: 'Test Tag',
          _id: '1234'
        };

        vm.cachedFilters = [{ tag: customTag, group: 'somegroup' }];
        vm.customTagsSelected['1234'] = true;

        vm.toggleTag(customTag, 'somegroup');
        
        expect(vm.cachedFilters.length).toBe(0);
      });
    });
  });

  describe('filterRelatedCustomTags', () => {
    beforeEach(() => {
      $scope.currentOrganization = {
        organization_id: 10,
        portal_settings: { group_structures: ['test', 'test2'] },
        site_count: 14,
        custom_tags: [
          { tag_type: 'Type1', _id: '1', name: 'Type 1 Tag 1', linked_tags: [], site_count: 10 },
          { tag_type: 'Type1', _id: '2', name: 'Type 1 Tag 2', linked_tags: ['3'], site_count: 12 },
          { tag_type: 'Type2', _id: '3', name: 'Type 2 Tag 1', linked_tags: ['2'], site_count: 13 },
          { tag_type: 'Type2', _id: '4', name: 'Type 2 Tag 2', linked_tags: [], site_count: 11 },
          { tag_type: 'Type3', _id: '5', name: 'Type 3 Tag 1', linked_tags: [], site_count: 15 },
          { tag_type: 'Type4', _id: '6', name: 'Type 4 Tag 1', linked_tags: [], site_count: 14 },
        ]
      };
    });

    it('should filter down to linked tags when a custom tag is selected', () => {
      const separatedTagsLength = 2;
      const vm = renderDirectiveAndDigest();

      const tag = _.findWhere($scope.currentOrganization.custom_tags, {_id:'2'});     

      vm.cachedFilters = [];

      vm.toggleTag(tag, 'Type1');

      expect(vm.separatedTags.length).toBe(separatedTagsLength);

      expect(vm.separatedTags[0][0].name).toBe('Type1');
      expect(vm.separatedTags[0][0].levels[0].name).toBe('Type 1 tag 2');

      const newTag = _.findWhere($scope.currentOrganization.custom_tags, {_id:'3'});      

      vm.cachedFilters = [];

      vm.toggleTag(newTag, 'Type1');

      expect(vm.separatedTags.length).toBe(separatedTagsLength);
      
      expect(vm.separatedTags[1][0].name).toBe('Type2');
      expect(vm.separatedTags[1][0].levels[0].name).toBe('Type 2 tag 1');
    });
  });

  function setSelectedTagsSites (arg) {
    angular.noop(arg);
  }

  function renderDirectiveAndDigest () {
    const element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    const vm = element.isolateScope().vm;
    return vm;
  }

  function createDirectiveElement () {
    return angular.element(
      '<organization-filter-widget ' +
      'current-organization="currentOrganization" ' +
      'open-main="openMain" ' +
      'selected-tag-data="selectedTagData" ' +
      'preselected-tags="preselectedTags" ' +
      'set-selected-tags-sites="setSelectedTagsSites" ' +
      'active-filters="activeFilters" ' +
      '></organization-filter-widget>'
    );
  }

  function putTemplateToTemplateCache ($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/filter-widget/organization-filter-widget.partial.html',
      '<div></div>'
    );
  }
});
