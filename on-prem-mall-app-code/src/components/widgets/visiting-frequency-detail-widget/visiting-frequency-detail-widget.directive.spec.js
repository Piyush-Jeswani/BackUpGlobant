'use strict';

describe('visitingFrequencyDetailWidget', function () {

  var $compile, $scope, $rootScope, $timeout, $state, $httpBackend;
  var apiUrl = 'https://api.url';

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

  describe('directive instantiation', function () {
    it('should call directive constructor with groupBy set to false, site Id set to 100, location Id set to 100 and all date ranges set', function () {
      $scope.groupBy = false;
      $scope.siteId = 100;
      $scope.locationId = 100;
      $scope.dateRangeStart = moment('2017-08-01', 'YYYY-MM-DD');
      $scope.dateRangeEnd = moment('2017-08-30', 'YYYY-MM-DD');
      $scope.compareRange1Start = moment('01-01-2017', 'DD-MM-YYYY');
      $scope.compareRange1End = moment('07-01-2017', 'DD-MM-YYYY');
      $scope.compareRange2Start = moment('01-01-2017', 'DD-MM-YYYY');
      $scope.compareRange2End = moment('07-01-2017', 'DD-MM-YYYY');

      var vm = renderDirectiveAndDigest();

      expect($scope.groupBy).toBe(false);
      expect($scope.isLoading).toBe(false);
      expect($rootScope.pdf).toBe(true);
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
      '<visiting-frequency-detail-widget ' +
      'org-id="1234" ' +
      'site-id="siteId" ' +
      'location-id="locationId" ' +
      'data-date-range-start="dateRangeStart" ' +
      'data-date-range-end="dateRangeEnd" ' +
      'compare-range-1-start="compareRange1Start" ' +
      'compare-range-1-end="compareRange1End" ' +
      'compare-range-2-start="compareRange2Start" ' +
      'compare-range-2-end="compareRange2End" ' +
      'group-by="groupBy" ' +
      'is-loading="isLoading" ' +
      '></visiting-frequency-detail-widget>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/visiting-frequency-detail-widget/visiting-frequency-detail-widget.partial.html',
      '<div></div>'
    );
  }

});