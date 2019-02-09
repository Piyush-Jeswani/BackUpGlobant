'use strict';

describe('scheduledReportWidget', function () {

  var $compile, $scope, $rootScope, $timeout, $state, $httpBackend;
  var apiUrl = 'https://api.url';
  var orgId = 1234;

  var mockedRequestManagerChartData = [
    {
      result: [{
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      }
      ]
    },
    {
      result: [{
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      }
      ]
    },
    {
      result: [{
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      },
      {
        locId: 3444,
        loyalty: [{ loyaltyDstr: ['1', '2'] }, { loyaltyDstr: ['1', '2'] }]
      }
      ]
    },
  ];

  var mockState = {
    current: {
      views: {
        analyticsMain: {
          controller: 'someController'
        }
      }
    }
  };

  var requestManagerMock = function ($q) {
    return {
      get: function (url, params) {
        var deferred = $q.defer();

        angular.noop(url, params);

        deferred.resolve({ result: angular.copy(mockedRequestManagerChartData) });

        return deferred.promise;
      }
    };
  }

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.value('$state', mockState);
    $provide.constant('apiUrl', apiUrl);
    $provide.factory('requestManager', requestManagerMock);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_,
    _$compile_, _$state_, _$timeout_, _$httpBackend_, _requestManager_) {
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $rootScope.pdf = true;
  }));

  describe('activate', function () {
    it('should call activate() function of directive and then firstDay set to 1 and dateRange null', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      vm.dateRange = null;
      vm.firstDay = 1;

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(vm.firstDay).toBe(1);
    });
  });

  describe('activate', function () {
    it('should call activate() function of directive and then firstDay set to 0', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      vm.firstDay = 0;

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(vm.firstDay).toBe(0);
    });
  });

  describe('activate', function () {
    it('should call activate() function of directive and then searchTextChanged event is generated', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      $scope.$broadcast('searchTextChanged');

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(vm.searchUsed).toBe(false);
    });
  });

  describe('activate', function () {
    it('should call activate() function of directive and then searchTextChanged event is generated with searchTermTimezone (len > 3) not equal to searchTextChanged', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      vm.searchTermTimezone = 'pppppppppp';
      $scope.$broadcast('searchTextChanged', 'xxxxxxxxxxx');

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(vm.searchTermTimezone).toBe('xxxxxxxxxxx');
    });
  });

  describe('activate', function () {
    it('should call activate() function of directive and then searchTextChanged event is generated with searchTermTimezone (len = 1) not equal to searchTextChanged', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      vm.searchTermTimezone = 'p';
      $scope.$broadcast('searchTextChanged', 'x');

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect($scope.groupBySetting).toBe(false);
    });
  });

  describe('activate', function () {
    it('should call activate() function of directive and then searchTextChanged event is generated with searchTermTimezone (len = 5) equal to searchTextChanged', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();
      vm.searchTermTimezone = 'xxxxx';
      $scope.$broadcast('searchTextChanged', 'xxxxx');

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      expect(vm.searchTermTimezone).toBe('xxxxx');
    });
  });

  describe('closeSchedulingForm', function () {
    it('should call closeSchedulingForm() when operatingHours are true in the schedule', function () {
      $scope.groupBySetting = false;
      $scope.siteId = 100;
      var vm = renderDirectiveAndDigest();

      vm.schedule = {
        data: {
          allLocations: false,
          ccAddress: [],
          comp_site: false,
          customTagId: null,
          groupBy: "day",
          hierarchyTagId: null,
          kpi: ['traffic'],
          locationId: null,
          message: "test pdf 1",
          operatingHours: true,
          orgId: orgId,
          reportEndOffset: 1,
          reportStartOffset: 7,
          sales_category_id: null,
          userId: 1,
          scheduleEndDate: moment()
        },
        lastModifiedBy: null,
        name: "kpis report (pdf)",
        nextRunAt: "2017-09-11T05:00:00.277Z",
        priority: 0,
        repeatInterval: "week",
        repeatTimezone: "Europe/Rome",
        type: "normal",
        _id: "59b29775f88680c0133393dd"
      };

      $timeout.flush();

      // Update Bindings and fire any watchers immediately
      $scope.$digest();

      vm.closeSchedulingForm();

      expect(vm.schedule.data.operatingHours).toBe(true);
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    var vm = element.isolateScope().vm;
    return vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<scheduled-report-widget ' +
      'org-id="1234" ' +
      'site-id="siteId" ' +
      'group-by-setting="groupBySetting" ' +
      'close-schedule="closeSchedule" ' +
      'schedule="schedule" ' +
      'date-range="dateRange" ' +
      '></scheduled-report-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/scheduled-report-widget/scheduled-report-widget.partial.html',
      '<div></div>'
    );
  }

});