'use strict';

describe('shoppersVsOthersDetailWidget', function () {

  var $compile, $scope, $rootScope, $timeout, $state, $httpBackend, utils;
  var apiUrl = 'https://api.url';

  var mockedRequestManagerChartData = [
    {
      result: [{
        location_id: 3222,
        others: 73,
        others_percent: 62.3932,
        period_end_date: "2017-10-09 23:59:59",
        period_start_date: "2017-10-09",
        shopper_percent: 37.6068,
        shoppers: 44,
        total_devices: 117
      },
      {
        location_id: 3222,
        others: 112,
        others_percent: 65.8824,
        period_end_date: "2017-10-10 23:59:59",
        period_start_date: "2017-10-10",
        shopper_percent: 34.1176,
        shoppers: 58,
        total_devices: 170
      },
      {
        location_id: 3222,
        others: 97,
        others_percent: 64.2384,
        period_end_date: "2017-10-11 23:59:59",
        period_start_date: "2017-10-11",
        shopper_percent: 35.7616,
        shoppers: 54,
        total_devices: 151
      }
      ]
    },
    {
      result: [{
        location_id: 3222,
        others: 73,
        others_percent: 62.3932,
        period_end_date: "2017-10-09 23:59:59",
        period_start_date: "2017-10-09",
        shopper_percent: 37.6068,
        shoppers: 44,
        total_devices: 117
      },
      {
        location_id: 3222,
        others: 112,
        others_percent: 65.8824,
        period_end_date: "2017-10-10 23:59:59",
        period_start_date: "2017-10-10",
        shopper_percent: 34.1176,
        shoppers: 58,
        total_devices: 170
      },
      {
        location_id: 3222,
        others: 97,
        others_percent: 64.2384,
        period_end_date: "2017-10-11 23:59:59",
        period_start_date: "2017-10-11",
        shopper_percent: 35.7616,
        shoppers: 54,
        total_devices: 151
      }
      ]
    },
    {
      result: [{
        location_id: 3222,
        others: 73,
        others_percent: 62.3932,
        period_end_date: "2017-10-09 23:59:59",
        period_start_date: "2017-10-09",
        shopper_percent: 37.6068,
        shoppers: 44,
        total_devices: 117
      },
      {
        location_id: 3222,
        others: 112,
        others_percent: 65.8824,
        period_end_date: "2017-10-10 23:59:59",
        period_start_date: "2017-10-10",
        shopper_percent: 34.1176,
        shoppers: 58,
        total_devices: 170
      },
      {
        location_id: 3222,
        others: 97,
        others_percent: 64.2384,
        period_end_date: "2017-10-11 23:59:59",
        period_start_date: "2017-10-11",
        shopper_percent: 35.7616,
        shoppers: 54,
        total_devices: 151
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
    _$compile_, _$state_, _$timeout_, _$httpBackend_, _requestManager_, _utils_) {
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $rootScope.pdf = true;
    utils = _utils_;
  }));

  beforeEach(function () {
    utils.getDateStringForRequest = function (date) {
      angular.noop(date);
      return date;
    }
  });


  describe('directive instantiation', function () {
    it('should call directive constructor with groupBy set to false, site Id set to 100 and location Id set to 100', function () {
      $scope.groupBy = false;
      $scope.siteId = 100;
      $scope.locationId = 100;

      var vm = renderDirectiveAndDigest();

      expect($scope.siteId).toBe(100);
      expect($scope.locationId).toBe(100);
      expect($scope.groupBy).toBe('day');
      expect($scope.isLoading).toBe(false);
      expect($rootScope.pdf).toBe(true);
    });
  });

  describe('directive instantiation', function () {
    it('should call directive constructor with groupBy set to week, site Id set to 100 and location Id set to 100', function () {
      $scope.groupBy = 'week';
      $scope.siteId = 100;
      $scope.locationId = 100;

      var vm = renderDirectiveAndDigest();

      expect($scope.siteId).toBe(100);
      expect($scope.locationId).toBe(100);
      expect($scope.groupBy).toBe('week');
      expect($scope.isLoading).toBe(false);
      expect($rootScope.pdf).toBe(true);
    });
  });

  describe('directive instantiation', function () {
    it('should call directive constructor with groupBy set to month, site Id set to 100 and location Id set to 100', function () {
      $scope.groupBy = 'month';
      $scope.siteId = 100;
      $scope.locationId = 100;

      var vm = renderDirectiveAndDigest();

      expect($scope.siteId).toBe(100);
      expect($scope.locationId).toBe(100);
      expect($scope.groupBy).toBe('month');
      expect($scope.isLoading).toBe(false);
      expect($rootScope.pdf).toBe(true);
    });
  });

  describe('directive instantiation', function () {
    beforeEach(function () {
      $rootScope.pdf = false;
    });

    afterEach(function () {
      $rootScope.pdf = true;
    });

    it('should call directive constructor with $rootScope.pdf set to false', function () {
      var vm = renderDirectiveAndDigest();

      expect($scope.isLoading).toBe(true);
      expect($rootScope.pdf).toBe(false);
      expect($state.current.views).toBeDefined;
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
      '<shoppers-vs-others-detail-widget ' +
      'org-id="1234" ' +
      'site-id="siteId" ' +
      'location-id="locationId" ' +
      'group-by="groupBy" ' +
      'is-loading="isLoading" ' +
      '></shoppers-vs-others-detail-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/shoppers-vs-others-detail-widget/shoppers-vs-others-detail-widget.partial.html',
      '<div></div>'
    );
  }

});