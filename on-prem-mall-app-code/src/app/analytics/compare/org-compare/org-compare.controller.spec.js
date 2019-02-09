'use strict';

describe('OrgCompareController', function() {
  var $scope;
  var $rootScope;
  var $controller;
  var $stateParamsMock;
  var $httpBackend;


  var $translate;
  var $timeout;
  var orgCompareService;
  var ExportService;
  var SubscriptionsService;
  var LocalizationService;
  var ObjectUtils;
  var dateRangeHelper;
  var apiUrl = 'https://api.url';

  var currentOrganizationMock;
  var currentUserMock;
  var sitesMock;
  var controller;
  var calendarsMock;

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(inject(function(_$httpBackend_, _$rootScope_, $templateCache, _$controller_, _$translate_, _$timeout_, _orgCompareService_, _ExportService_, _SubscriptionsService_, _LocalizationService_, _ObjectUtils_, _dateRangeHelper_) {
    $scope = _$rootScope_.$new();
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    $controller = _$controller_;
    $translate = _$translate_;

    $timeout = _$timeout_;
    orgCompareService = _orgCompareService_;

    ExportService = _ExportService_;
    SubscriptionsService = _SubscriptionsService_;
    LocalizationService = _LocalizationService_;
    ObjectUtils = _ObjectUtils_;
    dateRangeHelper = _dateRangeHelper_;
    // Prevent accidentally using the same controller
    // instance in multiple it-blocks.
    controller = null;

     calendarsMock = [ {
      "calendar_id": 1,
      "name": "Foo Calendar",
      "years": null
    }];

    LocalizationService.setAllCalendars(calendarsMock);

    $stateParamsMock = {
      orgId: 1000,
      siteId: 10000
    };

    currentOrganizationMock = {
      'organization_id': 123,
      'name': 'Foobar',
      'default_calendar_id': 1,
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

    sitesMock = [{
      'site_id': 100
    }];

    currentUserMock = {
      _id: 1234,
      localization: {
        date_format: 'MM/DD/YYYY'
      },
      preferences: {
        calendar_id: 1,
        custom_charts: [{
          chart_name: 'test',
          compare_period_1: {
            custom_end_date: '',
            custom_start_date: '',
            period_type: 'prior_period'
          },
          compare_period_2: {
            custom_end_date: '',
            custom_start_date: '',
            period_type: 'prior_year'
          },
          hierarchy_tag_ids: ['576d54845f8731540e48bbaf'],
          metrics: ['traffic'],
          sites: [100],
          type: 'single',
          organization_id: 123,
          selected_date_range: {
            custom_end_date: '',
            custom_start_date: '',
            period_type: 'year'
          }
        }]

      }
    };

    cacheTemplates($templateCache);

  }));

  it('should expose $stateParams and init the controller', function() {
    spyOn(orgCompareService, 'setMetricLookup').and.callThrough();
    spyOn(LocalizationService, 'setUser').and.callThrough();
    instantiateController();
    expect(controller.stateParams).toBe($stateParamsMock);
    expect(controller.dateFormat).toBe('MM/DD/YYYY');
    expect(orgCompareService.setMetricLookup).toHaveBeenCalledWith(currentOrganizationMock);
    expect(LocalizationService.setUser).toHaveBeenCalledWith(currentUserMock);
    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length);
  });

  it('should set mode should set the title translation key', function() {
    instantiateController();
    controller.setMode('new');
    expect(controller.title).toBe('customCompare.NEWCOMPARE');
    controller.setMode('edit');
    expect(controller.title).toBe('customCompare.EDITCOMPARE');
    controller.setMode('editCompare');
    expect(controller.title).toBe('customCompare.EDITCOMPARE');
  });

  it('should set mode should set the title translation key if it is empty mode so show export', function() {
    instantiateController();
    controller.setMode('');
    expect(controller.title).toBe('customCompare.COMPARE');
    expect(controller.hideExportIcon).toBe(false);

  });

   it('should set  mode as added should set the title translation key and add new compare into list', function() {
    instantiateController();
    var compare = {
      chart_name: 'test add',
      compare_period_1: {
        custom_end_date: '',
        custom_start_date: '',
        period_type: 'prior_period'
      }
    };
    controller.setMode('added', compare);
    expect(controller.title).toBe('customCompare.COMPARE');
    expect(controller.editMode).toBe('');
    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length + 1);
    expect(_.last(controller.customCharts).chart_name).toBe('test add');
  });

   it('should set  mode as editCompareCompleted should set the title translation key and update compare in the list', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    compare.compare_period_1.period_type ='perior-year';
    controller.setMode('editCompareCompleted', compare);
    $timeout.flush();

    expect(controller.title).toBe('customCompare.EDITCOMPARE');
    expect(controller.editMode).toBe('edit');
    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length);
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('perior-year');
  });

  it('should set  mode as editCompareCompleted then cancel should set the title translation key and set charts as cached user charts', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    compare.compare_period_1.period_type ='perior-year';
    controller.setMode('editCompareCompleted', compare);
    $timeout.flush();

    expect(controller.title).toBe('customCompare.EDITCOMPARE');
    expect(controller.editMode).toBe('edit');
    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length);
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('perior-year');

    controller.cancelEdit();
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('prior_period');
  });

  it('should set cancel set edit mode to edit if it is editCompare', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    compare.compare_period_1.period_type ='perior-year';
    controller.updateCompare(compare);

    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length);
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('perior-year');
    controller.editMode = 'editCompare';

    controller.cancelEdit();
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('prior_period');
    expect(controller.editMode).toBe('edit');
  });

  it('should set delete compare remove compare from list', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    controller.deleteCompare(compare);

    expect(controller.customCharts.length).toBe(0);
  });

  it('should export compare widget', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    controller.exportWidget(compare, true);
    var isExported = controller.widgetIsExported(compare);

    expect(isExported).toBe(true);
  });

  it('should add compare init chart list if it is null or undefined', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    controller.customCharts = null;
    controller.setMode('added', compare);

    expect(controller.customCharts.length).toBe(1);
  });

  it('should not export compare widget is null or undefined', function() {
    instantiateController();
    spyOn(ExportService, 'createExportAndStore').and.callThrough();
    var compare;
    controller.exportWidget(compare, true);
    expect(ExportService.createExportAndStore).not.toHaveBeenCalled();
  });

  it('should  editCompare should set edit mode and actiive compare', function() {
    instantiateController();
    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    controller.editCompare(compare);
    expect(controller.activeCompare.chart_name).toBe(compare.chart_name);

    expect(controller.editMode).toBe('editCompare');
  });

  it('should set  mode as editCompareCompleted and save changes should set the title translation key and update compare in the list and should call service to save', function() {
    instantiateController();

    var compare = angular.copy(currentUserMock.preferences.custom_charts[0]);
    compare.compare_period_1.period_type ='perior-year';
    controller.setMode('editCompareCompleted', compare);
    $timeout.flush();

    expect(controller.title).toBe('customCompare.EDITCOMPARE');
    expect(controller.editMode).toBe('edit');
    expect(controller.customCharts.length).toBe(currentUserMock.preferences.custom_charts.length);
    expect(_.first(controller.customCharts).compare_period_1.period_type).toBe('perior-year');
    spyOn(orgCompareService, 'saveUserCustomCompare').and.callThrough();
    controller.saveChanges();

    var user = angular.copy(controller.currentUser);
    user.preferences.custom_charts = controller.customCharts;
    var url = apiUrl + '/users/1234';

    $httpBackend.whenPUT(url).respond({result:[user]});
    expect(orgCompareService.saveUserCustomCompare).toHaveBeenCalledWith(controller.currentUser, controller.customCharts, currentOrganizationMock.organization_id);
    $httpBackend.flush();
    expect(_.first(controller.cachedUser.preferences.custom_charts).compare_period_1.period_type).toBe('perior-year');
  });

  function instantiateController() {
    var url = apiUrl + '/organizations';

    $httpBackend.whenGET(url).respond({result:[currentOrganizationMock]});

    var url2 = apiUrl + '/auth/currentUser';

    $httpBackend.whenGET(url2).respond({result:[{user: currentUserMock}]});

    controller = $controller('OrgCompareController', {
      '$scope': $scope,
      '$rootScope': $rootScope,
      '$stateParams': $stateParamsMock,
      '$translate': $translate,
      '$timeout': $timeout,
      'orgCompareService': orgCompareService,
      'currentOrganization': currentOrganizationMock,
      'sites': sitesMock,
      'currentUser': currentUserMock,
      'ExportService': ExportService,
      'SubscriptionsService': SubscriptionsService,
      'LocalizationService' : LocalizationService,
      'ObjectUtils': ObjectUtils,
      'dateRangeHelper': dateRangeHelper,
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
    $httpBackend.flush();
  }

  function cacheTemplates($templateCache) {
    // Put an empty template to cache to prevent Angular from fetching it
    $templateCache.put(
      'app/header/header.html',
      '<div></div>'
    );

    $templateCache.put(
      'app/analytics/analytics.partial.html',
      '<div></div>'
    );
  }
});
