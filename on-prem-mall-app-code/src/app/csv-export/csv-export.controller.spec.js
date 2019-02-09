'use strict';

describe('CSVExportCtrl', function() {
  var $scope;
  var $controller;
  var $httpBackend;
  var $httpParamSerializer;

  var apiUrl;
  var constants;
  var organizationMock;
  var currentSiteMock;
  var viewController;
  var currentUserMock;
  var zoneResourceMock;
  var locationResourceMock;
  var calendarsMock;
  var localizationService;
  var activeFiltersMock = 'week';
  var activeShortcutMock;
  var $timeout;
  var $q;
  var utils;
  var trackingMock = {
    sendPageView: function (page) {
      angular.noop(page);
      // do nothing
    },
    trackUserEvent: function (param1,param2) {
      angular.noop(param1, param2);
      // do nothing
    },
  };

  beforeEach(function() {
    apiUrl = 'https://api.url';
    constants = {
      subscriptions: [
        {
          name: 'perimeter',
          translation_label: 'Perimeter'
        },
        {
          name: 'interior',
          translation_label: 'Interior'
        }
      ],
      metrics: [
        {
          kpi: 'foo',
          icon: 'foo-icon',
          group: 'perimeter',
          subscription: 'interior',
          translation_label: 'fooLabel',
          requiredSubscriptions: []
        },
        {
          kpi: 'sales',
          icon: 'bar-icon',
          group: 'perimeter',
          subscription: 'perimeter',
          translation_label: 'barLabel',
          requiredSubscriptions: []
        }
      ],
      groups: [
        {
          name: 'perimeter',
          subscription: 'any',
          translation_label: 'csvExportView.PERIMETER'
        },
        {
          name: 'interior',
          subscription: 'interior',
          translation_label: 'csvExportView.VISITORBEHAVIOR'
        }
      ],
      groupByChoices: [
        {
          name: 'hour'
        },
        {
          name: 'day'
        }
      ],
      frequencyChoices: [{
        value: 'day'
      },{
        value: 'week'
      }],
      activeChoices: [
        6, 12, 18
      ]
    };

    organizationMock = {
      organization_id: 1234,
      portal_settings: {
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    currentSiteMock =  {
      site_id: 1234,
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    }

  });
  var sitesMock =[{
    name: 'site 1',
    site_id:1
  }];

   var mockSiteResource = {
    get: function(params) {
      angular.noop(params);
      return  sitesMock

    },
    query: function(params) {
      angular.noop(params);
      return sitesMock;
    },
    search: function(params) {
      var deferred = $q.defer();
      angular.noop(params);
      deferred.resolve({});
      return deferred.promise;
    }
  };

  var locationMock = [{
    location_id: 1,
    description: 'location 1',
    geometry: {
      'coordinates': [[]]
    }
  }];

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
    $provide.constant('csvExportConstants', constants)
    $provide.value('SiteResource', mockSiteResource);
  }));

  beforeEach(inject(function($rootScope, _$controller_, _$httpBackend_, _LocalizationService_, _$timeout_, _$q_, _$httpParamSerializer_, _utils_) {
    $scope = $rootScope.$new();
    $scope.log = true;

    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    localizationService = _LocalizationService_;
    $timeout = _$timeout_;
    $q = _$q_;
    $httpParamSerializer = _$httpParamSerializer_;
    utils = _utils_;

    localizationService.setAllCalendars(undefined);

    spyOn(localizationService, 'getCurrentYear').and.callFake(getCurrentYear);

    calendarsMock = [{
      '_id': '56fc5f721a76b5921e3df217',
      'calendar_id': 1,
      'name': 'NRF Calendar',
      '__v': 100,
      'organization_ids': [
        5798,
        6177,
        5947,
        5210,
        8695,
        5198,
        8882,
        1224,
        6240,
        6751,
        5349,
        8699,
        5178,
        6339
      ],
      'years': [
        {
          'year': 2001,
          'start_date': '2001-02-04T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2002,
          'start_date': '2002-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2003,
          'start_date':
            '2003-02-02T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2004,
          'start_date': '2004-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2005,
          'start_date': '2005-01-30T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        }, {
          'year': 2006,
          'start_date': '2006-01-29T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
        },
        {
          'year': 2007,
          'start_date': '2007-02-04T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2008,
          'start_date': '2008-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2009,
          'start_date': '2009-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2010,
          'start_date': '2010-01-31T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2011,
          'start_date': '2011-01-30T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2012,
          'start_date': '2012-01-29T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5]
        },
        {
          'year': 2013,
          'start_date': '2013-02-03T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2014,
          'start_date': '2014-02-02T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2015,
          'start_date': '2015-02-01T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2016,
          'start_date': '2016-01-31T00:00:00.000Z',
          'start_month': 1,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        },
        {
          'year': 2018,
          'start_date': '2017-12-31T00:00:00.000Z',
          'start_month': 0,
          'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
        }
      ],
      'global': true
    },
      {
        '_id': '56fe81f9be710b6025f897d5',
        'calendar_id': 2826,
        'name': 'Lucky Brand Calendar',
        '__v': 3,
        'organization_ids': [8925],
        'years': [
          {
            'year': 2012,
            'start_date': '2012-01-01T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2013,
            'start_date': '2013-01-06T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2014,
            'start_date': '2014-01-05T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2015,
            'start_date': '2015-01-04T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          },
          {
            'year': 2016,
            'start_date': '2016-01-03T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4]
          }
        ],
        'global': false
      },
      {
        '_id': '570d418480dee428210d4e8e',
        'calendar_id': 2146,
        'name': 'Bare Escentuals NEW',
        '__v': 0,
        'organization_ids': [],
        'years': [
          {
            'year': 2011,
            'start_date': '2011-01-03T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          },
          {
            'year': 2012,
            'start_date': '2012-01-02T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          },
          {
            'year': 2013,
            'start_date': '2012-12-31T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          },
          {
            'year': 2014,
            'start_date': '2013-12-30T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          },
          {
            'year': 2015,
            'start_date': '2014-12-29T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 6]
          },
          {
            'year': 2016,
            'start_date': '2016-01-04T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          }
        ],
        'global': false
      },
      {
        '_id': '570d41a680dee428210d4fae',
        'calendar_id': 3226,
        'name': 'Mall LFL 2015',
        '__v': 0,
        'organization_ids': [],
        'years': [
          {
            'year': 2015,
            'start_date': '2015-01-05T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          },
          {
            'year': 2016,
            'start_date': '2016-01-04T00:00:00.000Z',
            'start_month': 0,
            'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5]
          }
        ],
        'global': false
      },
      {
        '_id': '577ce4b11f4b300370ac604d',
        'calendar_id': 65,
        'name': 'Standard Monthly',
        'organization_ids': [ ],
        'years': null,
        'global': true
      }
    ];

      var zonesMock = [{id:1},{id:2}]

     zoneResourceMock = function() {
      function query() {
        return zonesMock;
      }
      return {
        query: query
      };
    };



    locationResourceMock = {
      query: function(orgId, siteId) {
        return locationMock;
      },
      get: function(params) {
        angular.noop(params);
        return  locationMock;
      },
      search: function (params) {
        var deferred = $q.defer();
        angular.noop(params);
        deferred.resolve({});
        return deferred.promise;
      }
    };

    currentUserMock = {
      localization: {
        date_format: 'MM/DD/YYYY'
      }, 
      preferences: {
        calendar_id: 1,
        custom_period_1 : {
          period_type : 'prior_period'
        },
        custom_period_2 : {
          period_type : 'prior_year'
        }
      }
    };
  }));

  describe('when initialising the page', function(){

    beforeEach(function() {
      viewController = createController(organizationMock, currentSiteMock);
    });

    it('should initialise the scope', function(){
      expect(viewController.currentOrganization).toBeDefined();
      expect(viewController.currentSite).toBeDefined();
      expect(viewController.currentUser).toBeDefined();
      expect(viewController.groups).toBeDefined();
      expect(viewController.groupByChoices).toBeDefined();
      expect(viewController.frequencyChoices).toBeDefined();
      expect(viewController.activeChoices).toBeDefined();
      expect(viewController.activeFilters).toBeDefined();
      expect(viewController.activeGroup).toBeDefined();

      expect(viewController.translationsLoaded).toEqual(false);
      expect(viewController.businessHours).toEqual(true);
      expect(viewController.hoursDisabled).toEqual(false);
    })

  })

  it('should set calendars', function() {
    $httpBackend.whenGET(apiUrl+'/calendars', {}).respond([{result: calendarsMock }]);

    localizationService.getAllCalendars= function() {
      var deferred = $q.defer();
      deferred.resolve({result: calendarsMock });
      return deferred.promise;
    };
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    expect(viewController.organizationCalendars).toEqual(calendarsMock);
  });

  it('should set sales categories and if sales categories length<=1 vm.showSalesCategories should be false', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };
    viewController = createController(org, currentSiteMock);
    expect(viewController.showSalesCategories).toBeFalsy;

  });

  xit('should set when there is scheduled reports', function() {
    var org = {
      organization_id: 12,
      portal_settings: {
        sales_categories: [{id:1}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    var now = moment().utc();

    var authService = {
      getCurrentUser: function () {
        var deffered = $q.defer();

        var mockUserObj = {username:'test1'};

        deffered.resolve(mockUserObj);

        return deffered.promise;
      }
    };

    var schedules = [{data:{
      userId:111,
      scheduleEndDate: moment(now).add(5,'week')
    }},
    {data:{
      userId:222,
      scheduleEndDate: moment(now).add(8,'week')
    }} ];
    var scheduleData = [{username:'test1'}];
    var scheduleData2 = [{username:'test2'}];

    $httpBackend.whenGET(apiUrl+'/organizations/'+org.organization_id+'/scheduled-reports?exportType=csv').respond({result: schedules});

    $httpBackend.whenGET(apiUrl + '/users/111').respond({result: scheduleData});
    $httpBackend.whenGET(apiUrl + '/users/222').respond({result: scheduleData2});

    var stateParams = {
      'orgId': org.organization_id
    };
    viewController = createController(org, currentSiteMock, stateParams, authService);
    $timeout.flush();
    $httpBackend.flush();
    expect(viewController.schedules[0].data.username).toEqual('test1');

  });

  xit('should delete schedule set when there is scheduled reports', function() {
    var org = {
      organization_id: 121,
      portal_settings: {
        sales_categories: [{id:1}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    var now = moment().utc();

    var schedules = [{data:{
      _id:1,
      orgId:org.organization_id,
      userId:111,
      scheduleEndDate: moment(now).add(5,'week')
    }},
    {data:{
      _id:2,
      orgId:org.organization_id,
      userId:222,
      scheduleEndDate: moment(now).add(8,'week')
    }} ];
    var scheduleData = [{username:'test1'}];
    var scheduleData2 = [{username:'test2'}];
    var schedule = schedules[0];
    $httpBackend.whenGET(apiUrl+'/organizations/'+org.organization_id+'/scheduled-reports?exportType=csv').respond({result: schedules});


    $httpBackend.whenGET(apiUrl + '/users/111').respond({result: scheduleData});
    $httpBackend.whenGET(apiUrl + '/users/222').respond({result: scheduleData2});

    var stateParams = {
      'orgId': org.organization_id
    };
    viewController = createController(org, currentSiteMock, stateParams);
    $timeout.flush();
    $httpBackend.flush();
    $httpBackend.when('DELETE',apiUrl + '/organizations/' + schedule.data.orgId + '/scheduled-reports/' + schedule._id).respond(200);
    viewController.deleteSchedule(schedules[0])
    $timeout.flush();
    $httpBackend.flush();
    expect(viewController.schedules[0].data.username).toEqual('test1');
  });

  it('should set sales categories and if sales categories length>1 vm.showSalesCategories should be true', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };
    viewController = createController(org, currentSiteMock);
    expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
    expect(viewController.showSalesCategories).toBeTruthy;
  });

  it('should set sales categories and if sales categories length>1 vm.showSalesCategories should be true also it should select those categories defined in stateparams', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    var stateParams = {
      salesCategories: [1]
    };
    viewController = createController(org, currentSiteMock, stateParams);
    expect(viewController.selectedSalesCategories).toEqual({1: true, 2: false});
    expect(viewController.showSalesCategories).toBeTruthy;
    expect(viewController.organizationIsTypeRetail()).toBeTruthy;
  });

  it('should  remove all sites', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.removeAllSites();
    expect(viewController.selectedSites).toEqual([]);
  });

  it('should  remove all tags', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.removeAllTags();
    expect(viewController.tags).toEqual([]);
  });

  it('should  selectAllZones in org level select and unselect', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.selectAllZones();
    expect(viewController.selectedZones).toEqual([1,2]);
    expect(viewController.zoneIsSelected(1)).toBeTruthy;
    viewController.selectAllZones();
    expect(viewController.selectedZones).toEqual([]);
  });

  it('should  toggle Zone', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.toggleZone(1);
    expect(viewController.zoneIsSelected(1)).toBeTruthy;
    viewController.toggleZone(1);
    expect(viewController.zoneIsSelected(1)).toBeFalsy;
  });

  it('should  toggle Zone and remove  removeAllZones', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.toggleZone(1);
    expect(viewController.zoneIsSelected(1)).toBeTruthy;
    viewController.removeAllZones();
    expect(viewController.zoneIsSelected(1)).toBeFalsy;
  });

  it('should  toggle location', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.toggleLocation(1);
    expect(viewController.locationIsSelected(1)).toBeTruthy;
    viewController.toggleLocation(1);
    expect(viewController.locationIsSelected(1)).toBeFalsy;
  });

  it('should  selectAllSites in org level', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, null);
    viewController.selectAllSites();
    expect(viewController.allSelected).toBeTruthy;
    expect(viewController.selectedSites).toEqual([1]);
  });

  it('should  selectAllSites in org level and togglesite should unselect', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, null);
    $timeout.flush();
    viewController.selectAllSites();
    expect(viewController.allSelected).toBeTruthy;
    viewController.toggleSite(1);
    expect(viewController.isAllSitesSelected()).toBeFalsy;
    expect(viewController.siteIsSelected(1)).toBeFalsy;
  });

  it('should  selectAllSites in org level and calling selectAllSites again  should unselect', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, null);
    $timeout.flush();
    viewController.selectAllSites();
    expect(viewController.allSelected).toBeTruthy;
    viewController.selectAllSites();
    expect(viewController.isAllSitesSelected()).toBeFalsy;
    expect(viewController.siteIsSelected(1)).toBeFalsy;
  });

  it('should  remove all Locations', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    viewController = createController(org, currentSiteMock);
    viewController.removeAllLocations();
    expect(viewController.selectedLocations).toEqual([]);
  });

  it('should set sales categories and if sales categories length>1 vm.showSalesCategories should be true also it should select those categories defined in stateparams as string', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      },
      subscriptions: {
        labor: true,
        sales: true,
        interior: false,
        perimeter: true
      }
    };

    var stateParams = {
      salesCategories: '1'
    };
    viewController = createController(org, currentSiteMock, stateParams);
    expect(viewController.selectedSalesCategories).toEqual({1: true, 2: false});
    expect(viewController.showSalesCategories).toBeTruthy;
  });

  it('should set state params site', function() {
    var stateParams = {
       site: [{1: true}, {2: false}]
    };
    viewController = createController(organizationMock, null, stateParams);
    expect(viewController.selectedSites).toEqual(stateParams.site);
  });

  it('should set state params site when it is string', function() {
    var stateParams = {
      site: '1'
    };
    viewController = createController(organizationMock, null, stateParams);
    expect(viewController.selectedSites).toEqual(stateParams.site);
  });

  it('should set state params kpi', function() {
    var stateParams = {
      kpi: ['sales']
    };
    viewController = createController(organizationMock, null, stateParams);
    expect(viewController.selectedMetrics).toEqual(stateParams.kpi);
  });

  it('should set state params kpi even if it is string', function() {
    var stateParams = {
      kpi: 'sales'
    };
    viewController = createController(organizationMock, null, stateParams);
    expect(viewController.selectedMetrics).toEqual(stateParams.kpi);
  });

  it('should set state params tag', function() {
    var stateParams = {
      tag: [{1: true}, {2: false}]
    };
    viewController = createController(organizationMock, currentSiteMock, stateParams);
    expect(viewController.tags).toEqual(stateParams.tag);
  });

  it('should set site level as false when currentsite not defined', function() {
    viewController = createController(organizationMock, null);
    expect(viewController.siteLevel).toBeFalsy;
  });

  it('should set state params tag even if it is string', function() {
    var stateParams = {
      tag: '1'
    };
    viewController = createController(organizationMock, currentSiteMock, stateParams);
    expect(viewController.tags).toEqual(stateParams.tag);
  });

  it('should place metrics from config to vm.metrics model', function() {
    viewController = createController(organizationMock, currentSiteMock);
    expect(viewController.metrics.length).toBe(1);
  });

  it('should set group and hour settings when activeGroup set as interior', function() {
    viewController = createController(organizationMock, currentSiteMock);
    viewController.activeGroup = 'interior';

    $timeout.flush();

    expect(viewController.hoursDisabled).toBeTruthy;
    expect(viewController.businessHours).toBeFalsy;
    expect(viewController.groupBySetting).toEqual('day')
  });

  it('should set group and hour settings when activeGroup set as interior and it should reset groupBySetting as day', function() {
    viewController = createController(organizationMock, currentSiteMock);
    viewController.groupBySetting = 'hour';
    viewController.activeGroup = 'interior';

    $timeout.flush();

    expect(viewController.hoursDisabled).toBeTruthy;
    expect(viewController.businessHours).toBeFalsy;
    expect(viewController.groupBySetting).toEqual('day')
  });

  it('should select metric', function() {
    viewController = createController(organizationMock, currentSiteMock);

    $timeout.flush();
    viewController.selectMetric('sales');
    expect(viewController.selectedMetrics['sales']).toBeTruthy;
  });

  it('should select allLocationsList', function() {
    viewController = createController(organizationMock, currentSiteMock);

    $timeout.flush();
    spyOn(viewController,'toggleLocation').and.callThrough();
    var allLocationsList = [{location_id:1,sublist:[{location_id:11},{location_id:12}] }];
    viewController.selectAllLocations(allLocationsList);
    expect(viewController.toggleLocation).toHaveBeenCalledWith(1);
    expect(viewController.toggleLocation).toHaveBeenCalledWith(11);
    expect(viewController.toggleLocation).toHaveBeenCalledWith(12)
  });



  it('should toggle form', function() {
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    viewController.toggleSchedulingForm();
    expect(viewController.formIsVisible).toBeTruthy;
    viewController.toggleSchedulingForm();
    expect(viewController.formIsVisible).toBeFalsy;
  });

  it('should addEMail and removeEmail', function() {
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    viewController.addEMail();
    expect(viewController.mailCC.length).toBe(2);
    viewController.removeEmail(0);
    expect(viewController.mailCC.length).toBe(1);
  });

  it('should setSelectedFilters', function() {
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    var filters = [
      { '5886838dcd5144965a73cb8e': true },
      { '5886838dcd5144965a73cb8e':"Z- West" },
      { District:1 }
    ]
    viewController.setSelectedFilters(filters);
    expect(viewController.tags).toEqual([ '5886838dcd5144965a73cb8e' ])
  });

  it('should setSelectedFilters with custom tags', function() {
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    var filters = [
      { '5886838dcd5144965a73cb8e': true },
      { '5886838dcd5144965a73cb8e':"Z- West" },
      { District:1 }
    ]
    viewController.setSelectedFilters(filters, filters[0]);
    expect(viewController.tags).toEqual([ '5886838dcd5144965a73cb8e' ]);
  });

  it('should get correct subscription', function() {
    viewController = createController(organizationMock, currentSiteMock);
    $timeout.flush();
    expect(viewController.hasSubscription('sales')).toBeTruthy;
    expect(viewController.hasSubscription('labor')).toBeTruthy;

  });

  it('should get correct subscription', function() {
    viewController = createController(organizationMock, null);
    $timeout.flush();
    expect(viewController.hasSubscription('sales')).toBeTruthy;
    expect(viewController.hasSubscription('labor')).toBeTruthy;

  });

  it('should not select metric', function() {
    viewController = createController(organizationMock, currentSiteMock);
    viewController.groupBySetting = 'hour';
    viewController.selectedMetrics = [];

    $timeout.flush();
    viewController.selectMetric('sales');
    expect(viewController.selectedMetrics).toEqual([]);
  });

  it('should set state params startDate and endDate', function() {
    var now = moment().utc(); // State params are ignorant of timezone
    var stateParams = {
      startDate: moment(now).startOf('week').subtract(1, 'week').add(1, 'days'),
      endDate: moment(now).startOf('week').subtract(1, 'week').endOf('week').add(1, 'days')
    };
    viewController = createController(organizationMock, null, stateParams);
    expect(viewController.dateRange.start).toEqual(stateParams.startDate);
    expect(viewController.selectedDateRange.start).toEqual(stateParams.startDate);
  });

  it('should set daterange when first day described as 1 but not date range', function() {
    var now = moment();

    localizationService.getCurrentCalendarFirstDayOfWeek = function() {
      return 1;
    };

    viewController = createController(organizationMock, currentSiteMock);
    viewController.siteLevel = true;
    viewController.firstDay = 1; //NO.

    var dateRange = {
      start: moment(now).startOf('week').subtract(1, 'week').add(1, 'days'),
      end: moment(now).startOf('week').subtract(1, 'week').endOf('week').add(1, 'days')
    };
    $timeout.flush();

    expect(viewController.dateRange).toEqual(dateRange);
  });

  it('should set daterange when first day described but not as 1 but not date range', function() {
    var now = moment();
    viewController = createController(organizationMock, currentSiteMock);
    viewController.siteLevel = true;
    viewController.firstDay = 0;
    var dateRange = {
      start: moment(now).startOf('week').subtract(1, 'week'),
      end: moment(now).startOf('week').subtract(1, 'week').endOf('week')
    };
    $timeout.flush();

    expect(viewController.dateRange).toEqual(dateRange);
  });

  it('should set active filters when there is', function() {
    var now = moment();
    activeFiltersMock= [{
      group:"Dealer",
      tag: {
        filter_type:"custom",
        name:"0 Mile Communications",
        site_count:0,
        tag_type:"Dealer",
        _id:"59667aefbf3d5816fdee9a90"
      }
    }]

    viewController = createController(organizationMock, currentSiteMock);
    viewController.siteLevel = true;
    viewController.dateRange = {
        start: now,
        end: now
      };

      expect(viewController.activeFilters).toEqual(activeFiltersMock);
  });

  it('should have param to return site names', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*includeZoneNames=true.*/).respond([{}]);
      viewController = createController(organizationMock, currentSiteMock);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      viewController.doExport();
      $httpBackend.flush();
  });

  it('should load scheduled exports for user', function() {
    $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
    $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
    viewController = createController(organizationMock, currentSiteMock);
    $httpBackend.flush();
  });

  describe('doExport', function() {


    it('should create correct API request', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      viewController = createController(organizationMock, currentSiteMock);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      viewController.doExport();
      $httpBackend.flush();
    });

    it('should include compare dates in the API request if they have been set', function() {
      var now = moment();
      var yesterday = moment(now).add(-1, 'day');

      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);

      var expectedApiParams = {
        groupBy: 'day',
        orgId: 1234,
        siteId: 1234,
        reportStartDate: utils.getDateStringForRequest(now),
        reportEndDate: utils.getDateStringForRequest(now),
        compare1StartDate: utils.getDateStringForRequest(yesterday),
        compare1EndDate: utils.getDateStringForRequest(yesterday),
        dateRangeType: 'custom',
        kpi: [],
        zoneId: [],
        operatingHours: true,
        includeSiteNames: true,
        includeZoneNames: true
      };

      var serializedParams = $httpParamSerializer(expectedApiParams);

      var urlWithParams = apiUrl + '/kpis/report?' + serializedParams;

      $httpBackend.expectGET(urlWithParams).respond([{}]);

      viewController = createController(organizationMock, currentSiteMock);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      viewController.compareDateRange1 = {
        start: yesterday,
        end: yesterday
      }
      viewController.doExport();
      $httpBackend.flush();
    });

    it('should include sales categories in the API request if they have been set', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);

      var expectedApiParams = {
        groupBy: 'day',
        orgId: 1234,
        siteId: 1234,
        reportStartDate: utils.getDateStringForRequest(now),
        reportEndDate: utils.getDateStringForRequest(now),
        dateRangeType: 'custom',
        kpi: ['sales'],
        zoneId: [],
        operatingHours: true,
        includeSiteNames: true,
        includeZoneNames: true,
        sales_category_id: ['750']
      };

      var serializedParams = $httpParamSerializer(expectedApiParams);

      var urlWithParams = apiUrl + '/kpis/report?' + serializedParams;

      $httpBackend.expectGET(urlWithParams).respond([{}]);

      viewController = createController(organizationMock, currentSiteMock);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      viewController.salesCategories = [
        { '750' : true}
      ];

      viewController.selectedSalesCategories = { '750' : true};

      viewController.metrics = [{
        kpi: 'sales',
        subscription: 'sales',
        requiredSubscriptions: ['sales']
      }];
      
      viewController.selectedMetrics = {'sales': false};
      
      viewController.selectMetric('sales');

      viewController.doExport();
    });

    it('should create correct API request when canBeExported with interior and location selected', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      var site = angular.copy(currentSiteMock);
      site.subscriptions.interior = true;
      viewController = createController(org, site);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
      expect(viewController.showSalesCategories).toBeTruthy;
      viewController.toggleLocation(1);
      expect(viewController.canBeExported()).toBeTruthy;
      viewController.doExport();
      $httpBackend.flush();
    });

    it('should create correct API request when canBeExported with perimeter and zone selected', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      var site = angular.copy(currentSiteMock);
      site.subscriptions.perimeter = true;
      viewController = createController(org, site);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
      expect(viewController.showSalesCategories).toBeTruthy;
      viewController.selectMetric('sales');
      viewController.toggleZone(1);
      expect(viewController.zoneIsSelected(1)).toBeTruthy;
      expect(viewController.canBeExported()).toBeTruthy;
      viewController.doExport();
      viewController.getZoneNameById(1);
      $httpBackend.flush();
    });

    it('should create correct API request when canBeExported site level', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      viewController = createController(org, currentSiteMock);
      viewController.siteLevel = true;
      viewController.dateRange = {
        start: now,
        end: now
      };
      expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
      expect(viewController.showSalesCategories).toBeTruthy;
      viewController.selectMetric('sales');
      var filters = [
        { '5886838dcd5144965a73cb8e': true },
        { '5886838dcd5144965a73cb8e':"Z- West" },
        { District:1 }
      ];
      viewController.setSelectedFilters(filters, filters[0]);
      expect(viewController.tags).toEqual([ '5886838dcd5144965a73cb8e' ])
      expect(viewController.canBeExported()).toBeTruthy;
      viewController.doExport();
      $httpBackend.flush();
    });

    it('should create correct API request when canBeExported with pnot site level', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      viewController = createController(org, null);
      viewController.dateRange = {
        start: now,
        end: now
      };
      expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
      expect(viewController.showSalesCategories).toBeTruthy;
      viewController.selectMetric('sales');
      var filters = [
        { '5886838dcd5144965a73cb8e': true },
        { '5886838dcd5144965a73cb8e':"Z- West" },
        { District:1 }
      ];
      viewController.setSelectedFilters(filters, filters[0]);
      expect(viewController.tags).toEqual([ '5886838dcd5144965a73cb8e' ])
      expect(viewController.canBeExported()).toBeTruthy;
      viewController.doExport();
      $httpBackend.flush();
    });

     it('should create correct API request when not canBeExported if no metric selected', function() {
      var now = moment();
      $httpBackend.expectGET(apiUrl+'/organizations/'+organizationMock.organization_id+'/scheduled-reports?exportType=csv').respond([{result: { }}]);
      $httpBackend.expectGET(apiUrl+'/calendars').respond([{result: calendarsMock }]);
      $httpBackend.expectGET(/.*\/kpis\/report\?.*/).respond([{}]);
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      viewController = createController(org, null);
      viewController.dateRange = {
        start: now,
        end: now
      };
      expect(viewController.selectedSalesCategories).toEqual({1: false, 2: false});
      expect(viewController.showSalesCategories).toBeTruthy;

      expect(viewController.canBeExported()).toBeFalsy;
      viewController.doExport();
      $httpBackend.flush();
    });

    it('should test successful call to tagDropdownIsDisabled() with all sites selected', function() {
      var org = {
        organization_id: 1234,
        portal_settings: {
          sales_categories: [{id:1},{id:2}],
          organization_type: 'Retail'
        },
        subscriptions: {
          labor: true,
          sales: true,
          interior: false,
          perimeter: true
        }
      };
      viewController = createController(org, null);

      viewController.selectAllSites();
      expect(viewController.tagDropdownIsDisabled()).toBe(true);
    });

  });

  describe('toggleReport', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    describe('isReportOpen is undefined', function() {
      it('should initialize the array', function() {
        var controller = createController(org);

        controller.toggleReport(0);

        expect(controller.isOpenReport).toBeDefined();
        expect(angular.isArray(controller.isOpenReport)).toBe(true);
      });

      it('should set the specified index to true', function() {
        var controller = createController(org);

        controller.toggleReport(0);

        expect(controller.isOpenReport[0]).toBe(true);
      });
    });

    describe('isReportOpen is defined', function() {
      it('should set the status to false if it is open', function() {
        var controller = createController(org);

        controller.toggleReport(0);
        controller.toggleReport(0);

        expect(controller.isOpenReport[0]).toBe(false);
      });
    });
  });

  describe('clearSitesAndFilters', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    it('should set selectedTagData to an empty array', function() {
      var controller = createController(org);

      controller.clearSitesAndFilters();

      expect(controller.clearSitesAndFilters.length).toBe(0);
    });
  });

  describe('removeAllSites', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    it('should set selectedSites to an empty array', function() {
      var controller = createController(org);

      controller.removeAllSites();

      expect(controller.selectedSites.length).toBe(0);
    });
  });

  describe('removeAllTags', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    it('should set tags to an empty array', function() {
      var controller = createController(org);

      controller.removeAllTags();

      expect(controller.tags.length).toBe(0);
    });

    it('should set customTags to an empty array', function() {
      var controller = createController(org);

      controller.removeAllTags();

      expect(controller.customTags.length).toBe(0);
    });

    it('should set selectedTagData to an empty array', function() {
      var controller = createController(org);

      controller.removeAllTags();

      expect(controller.selectedTagData.length).toBe(0);
    });
  });

  describe('selectComparePeriod', function() {
    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    var dateFormat = 'YYYY-MM-DD';

    it('should not set the compare period if the prior period is "none"', function() {
      var controller = createController(org);

      var priorPeriod = {
        key: 'none'
      };

      controller.dateRange = {
        start: moment.utc('2017-10-29', dateFormat),
        end: moment.utc('2017-11-03', dateFormat)
      };

      controller.selectComparePeriod(priorPeriod);

      expect(controller.compareDateRange).toBeUndefined(); 
    });

    describe('Standard Gregorian Sunday', function() {
      beforeEach(function() {
        currentUserMock.preferences.calendar_id = 65; // Standard Gregorian
      });

      describe('prior year', function() {
        var priorPeriod =[ {
          key: 'prior_year',
          selected: true
        }];

       describe('week to date', function() {
          it('should set the correct compare period', function() {
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-11-05', dateFormat),
              end: moment.utc('2017-11-06', dateFormat)
            };

            controller.activeShortcut = 'wtd';

            $scope.$digest();

            controller.selectComparePeriod(priorPeriod);
            
            expect(controller.compareDateRange2.start.format(dateFormat)).toBe('2016-11-06');
            expect(controller.compareDateRange2.end.format(dateFormat)).toBe('2016-11-07');
          });
        });

        describe('month to date', function() {
          //ToDo: Fix this when we know how Month To Date compare periods are ACTUALLY supposed to work
          xit('should set the correct compare period', function() {
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-10-01', dateFormat),
              end: moment.utc('2017-11-03', dateFormat)
            };

            controller.activeShortcut = 'mtd';

            controller.selectComparePeriod(priorPeriod);

            expect(controller.compareDateRange.start.format(dateFormat)).toBe('2016-10-01');
            expect(controller.compareDateRange.end.format(dateFormat)).toBe('2016-10-06');
          });
        });

        describe('quarter to date', function() {
          it('should set the correct compare period', function() {
            spyOn(localizationService, 'getSystemYearForDate').and.callFake(function () {
              return getSystemYearForDate(10);
            });

            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-10-01', dateFormat),
              end: moment.utc('2017-11-05', dateFormat)
            };

            controller.activeShortcut = 'qtd';

            controller.selectComparePeriod(priorPeriod);

            expect(controller.compareDateRange2.start.format(dateFormat)).toBe('2016-10-01');
            expect(controller.compareDateRange2.end.format(dateFormat)).toBe('2016-11-05');
          });
        });

        describe('year to date', function() {
          it('should set the correct compare period', function() {
            spyOn(localizationService, 'getSystemYearForDate').and.callFake(function () {
              return getSystemYearForDate(11);
            });
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-01-01', dateFormat),
              end: moment.utc('2017-11-05', dateFormat)
            };

            controller.activeShortcut = 'ytd';

            controller.selectComparePeriod(priorPeriod);
            
            expect(controller.compareDateRange2.start.format(dateFormat)).toBe('2015-01-01');
            expect(controller.compareDateRange2.end.format(dateFormat)).toBe('2015-11-05');
          });
        });
      });

       describe('prior period', function() {
        var priorPeriod = [{
          key: 'prior_period',
          transkey: 'common.PRIORPERIOD',
          selected: true
        }];

        describe('week to date', function() {
          it('should set the correct compare period', function() {
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-11-05', dateFormat),
              end: moment.utc('2017-11-06', dateFormat)
            };

            controller.activeShortcut = 'wtd';
            
            controller.selectComparePeriod(priorPeriod);
            
            expect(controller.compareDateRange1.start.format(dateFormat)).toBe('2017-10-29');
            expect(controller.compareDateRange1.end.format(dateFormat)).toBe('2017-10-30');
          });
        });

        describe('month to date', function() {
          it('should set the correct compare period', function() {
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-10-29', dateFormat),
              end: moment.utc('2017-11-03', dateFormat)
            };

            controller.activeShortcut = 'mtd';

            controller.selectComparePeriod(priorPeriod);

            expect(controller.compareDateRange1.start.format(dateFormat)).toBe('2017-10-01');
            expect(controller.compareDateRange1.end.format(dateFormat)).toBe('2017-10-06');
          });
        });

        describe('quarter to date', function() {
          it('should set the correct compare period', function() {
            spyOn(localizationService, 'getSystemYearForDate').and.callFake(function () {
              return getSystemYearForDate(7);
            });

            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-10-01', dateFormat),
              end: moment.utc('2017-11-05', dateFormat)
            };

            controller.activeShortcut = 'qtd';

            controller.selectComparePeriod(priorPeriod);

            expect(controller.compareDateRange1.start.format(dateFormat)).toBe('2017-04-01');
            expect(controller.compareDateRange1.end.format(dateFormat)).toBe('2017-05-06');
          });
        });

        describe('year to date', function() {
          it('should set the correct compare period', function() {
            var controller = createController(org);

            var dateFormat = 'YYYY-MM-DD';

            controller.dateRange = {
              start: moment.utc('2017-01-01', dateFormat),
              end: moment.utc('2017-11-05', dateFormat)
            };

            controller.activeShortcut = 'ytd';

            controller.selectComparePeriod(priorPeriod);

            expect(controller.compareDateRange1.start.format(dateFormat)).toBe('2016-01-01');
            expect(controller.compareDateRange1.end.format(dateFormat)).toBe('2016-11-04');
          });
        }); 
        
      });

      describe('multiple compare periods selection', function(){
        var comparePeriods = [
          {
            key: 'prior_period',
            selected: true
          },
          {
            key: 'prior_year',
            selected: true
          }
        ];
        it('should set both compareDateRange1 and compareDateRange2', function(){
          var controller = createController(org);

          var dateFormat = 'YYYY-MM-DD';

          controller.dateRange = {
              start: moment.utc('2017-01-01', dateFormat),
              end: moment.utc('2017-11-05', dateFormat)
            };

          controller.activeShortcut = 'ytd';

          controller.selectComparePeriod(comparePeriods);

          // prior year.
          expect(controller.compareDateRange2.start.format(dateFormat)).toBe('2015-01-01');
          expect(controller.compareDateRange2.end.format(dateFormat)).toBe('2015-11-05');

          controller.activeShortcut = 'wtd';
          controller.selectComparePeriod(comparePeriods);
          expect(controller.compareDateRange1.start.format(dateFormat)).toBe('2016-12-25');
          expect(controller.compareDateRange1.end.format(dateFormat)).toBe('2017-10-29');
          
        });
      });

    });
  });

  describe('when a change is made to the site or zone ', function() {

    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    it('should select all zones', function(){
      var controller = createController(org);
      controller.zones = [{id:1},{id:2}];
      controller.selectAllZones()
      expect(controller.selectedZones).toBeDefined();
      expect(controller.selectedSites).toBeDefined();
    });

    it('should select TMPS when zone level', function(){
      var controller = createController(org);
      controller.zones = [{id:1},{id:2}];
      controller.zoneLevel = true;
      $scope.$digest();
      expect(controller.selectedTmps).toBeDefined();
    });

  });

  describe('when changing manual settings', function(){

    var org = {
      organization_id: 1234,
      portal_settings: {
        sales_categories: [{id:1},{id:2}],
        organization_type: 'Retail'
      }
    };

    it('should set the active group', function(){
      var controller = createController(org);
      var group = {id : 'group 1'};
      controller.activeGroup = null;
      controller.setActiveGroup(group);

      expect(controller.activeGroup).toBe(group);
    });

    it('should set the active setting', function(){
      var controller = createController(org);
      var setting = 'a';
      controller.activeSetting = null;
      controller.setActive(setting);

      expect(controller.activeSetting).toBe(setting);
    });

    it('should set the weekday', function(){
      var controller = createController(org);
      var day = 'tuesday';
      controller.weekDaySetting = null;
      controller.setWeekDay(day);

      expect(controller.weekDaySetting).toBe(day);
    });

    it('should set the month day', function(){
      var controller = createController(org);
      var day = 'thursday';
      controller.monthDaySetting = null;
      controller.setMonthDay(day);

      expect(controller.monthDaySetting).toBe(day);
    });

    it('should set the group by', function(){
      var controller = createController(org);
      var groupBy = 'day';
      controller.groupBySetting = null;
      controller.setGroupBy(groupBy);

      expect(controller.groupBySetting).toBe(groupBy);
    });

    it('should set the group by to hour and select the compare period to None and it should be disabled', function(){
      var controller = createController(org);
      var groupBy = 'hour';
      controller.groupBySetting = null;
      controller.setGroupBy(groupBy);

      expect(controller.groupBySetting).toBe(groupBy);
      
      expect(controller.selectedComparePeriods[0].key).toBe('none');

      expect(controller.disabled).toBe(true);
    });

    it('should set the month', function(){
      var controller = createController(org);
      var month = 4;
      controller.monthSetting = null;
      controller.setMonth(month);

      expect(controller.monthSetting).toBe(month);
    });

    it('should get the site name from its ID', function(){
      var controller = createController(org);
      controller.sites = [
        {site_id:1, name: 'site one'},
        {site_id:2,  name: 'site two'}
      ];
      var siteName = controller.getSiteNameById(2);

      expect(siteName).toEqual('site two');
    });

    it('should get the TMP name name from its ID', function(){
      var controller = createController(org);
      controller.selectedZone = {
        name: 'zone one',
        id: 1,
        tmps: [
          {id:1.1, name: 'entrance one'},
          {id:1.2,  name: 'entrance two'}
        ]
      };
      var tmpName = controller.getTmpById(1.1);

      expect(tmpName).toEqual('entrance one');
    });

    it('should get the Location name from its ID', function(){
      var controller = createController(org);
      controller.locations = [
        {location_id:1, name: 'location one', description : 'an area called location one'},
        {location_id:2,  name: 'location two', description : 'an area called location two'}
      ];
      var locationName = controller.getLocationNameById(2);

      expect(locationName).toEqual('an area called location two');
    });

  });

  it('should set weekDaySetting ', function(){
    viewController = createController(organizationMock, currentSiteMock);
    viewController.setWeekDay('sun');
    expect(viewController.weekDaySetting).toEqual('sun');
    expect(viewController.weekDayIsSetTo('sun')).toEqual(true);
    expect(viewController.weekDayIsSetTo('mon')).toEqual(false);
  });

  it('should set monthDaySetting', function(){
    viewController = createController(organizationMock, currentSiteMock);
    viewController.setMonthDay('mon');
    expect(viewController.monthDaySetting).toEqual('mon');
    expect(viewController.dayIsSetTo('mon')).toEqual(true);
    expect(viewController.dayIsSetTo('sun')).toEqual(false);
  });

  it('should set monthSetting', function(){
    viewController = createController(organizationMock, currentSiteMock);
    viewController.setMonth(1);
    expect(viewController.monthSetting).toEqual(1);
    expect(viewController.monthIsSetTo(1)).toEqual(true);
    expect(viewController.monthIsSetTo(3)).toEqual(false);
  });

  it('should set exportSiteOverall', function(){
    viewController = createController(organizationMock, currentSiteMock);
    viewController.setExportSiteOverall(false)
    expect(viewController.exportSiteOverall).toEqual(false);

    viewController.setExportSiteOverall(true)
    expect(viewController.exportSiteOverall).toEqual(true);
  });

  it('should check if the site dropdown is disabled', function(){
    viewController = createController(organizationMock, currentSiteMock);

    expect(viewController.siteDropdownIsDisabled()).toEqual(false);

    viewController.tags = [{
      tagId: 1234
    }];
    expect(viewController.siteDropdownIsDisabled()).toEqual(true);
  });

  function createController(orgMock, currentSite, stateParams, setHttpBackend, authService) {
    if(!stateParams) {
      stateParams = {
        'orgId': orgMock.organization_id
      };
      $scope.log = false;
    }
    return $controller('CSVExportCtrl', {
      '$scope': $scope,
      '$stateParams': stateParams,
      'currentOrganization': orgMock,
      'currentSite' : currentSite,
      'currentUser': currentUserMock,
      'ZoneResource' : zoneResourceMock,
      'LocationResource' : locationResourceMock,
      'googleAnalytics': trackingMock,
      'activeFilters': activeFiltersMock,
      'SiteResource' : mockSiteResource,
      'authService':authService,
      'activeShortcut' : activeShortcutMock
    });
  }

  function getSystemYearForDate(number) {
    return {
      month: number,
      year: 2017
    }
  }
  function getCurrentYear(number) {
    return 2017;
  }
  function getMomentOf(dateString) {
    return moment(dateString, 'DD/MM/YYYY');
  }
});

