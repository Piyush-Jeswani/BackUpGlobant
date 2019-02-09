'use strict';

describe('heatmapWidgetBodyDirective', function() {
  var $compile;
  var $httpBackend;
  var multiLocationKPIFetcher;
  var locationResponse;
  var values;
  var utils;

  var $scope;
  var apiUrl = 'https://api.url';

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module('shopperTrak.widgets.mock'));
  
  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));
  
  beforeEach(inject(putTemplateToTemplateCache));
  
  beforeEach(inject(function(
    $rootScope,
    _$compile_,
    _$httpBackend_,
    _multiLocationKPIFetcher_,
    _utils_
  ) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;

    utils = _utils_;

    // Mock service from shopperTrak.widgets.mock
    multiLocationKPIFetcher = _multiLocationKPIFetcher_;

    locationResponse = createLocationResponse();
    values = createValueResponse();

    $scope = $rootScope.$new();
    angular.extend($scope, {
      floorNum: 1,
      orgId: '1000',
      siteId: '2000',
      dateRangeStart: moment('2014-01-08'),
      dateRangeEnd: moment('2014-01-14'),
    });
  }));

  it('should show an error if location request fails', function() {
    expectValueRequest().respond(values);
    expectLocationRequest().respond(500);
    var vm = renderDirectiveAndDigest();
    multiLocationKPIFetcher.flush();
    $httpBackend.flush();
    expect(vm.locationRequestFailed).toBe(true);
  });

  it('should show an error if value request fails', function() {
    expectValueRequest().fail();
    expectLocationRequest().respond(locationResponse);
    var vm = renderDirectiveAndDigest();
    multiLocationKPIFetcher.flush();
    $httpBackend.flush();
    expect(vm.heatmapValueRequestFailed).toBe(true);
  });

  it('should not show an error if location request succeeds', function() {
    expectValueRequest().respond(values);
    expectLocationRequest().respond(locationResponse);
    var vm = renderDirectiveAndDigest();
    multiLocationKPIFetcher.flush();
    $httpBackend.flush();
    expect(vm.locationRequestFailed).toBe(false);
  });

  it('should not show an error if value request succeeds', function() {
    expectValueRequest().respond(values);
    expectLocationRequest().respond(locationResponse);
    var vm = renderDirectiveAndDigest();
    multiLocationKPIFetcher.flush();
    $httpBackend.flush();
    expect(vm.heatmapValueRequestFailed).toBe(false);
  });

  it('should show a loading indicator while loading data', function() {
    expectValueRequest().respond(values);
    expectLocationRequest().respond(locationResponse);
    var vm = renderDirectiveAndDigest();
    expect(vm.isLoadingHeatmapValues).toBe(true);
    multiLocationKPIFetcher.flush();
    $httpBackend.flush();
    expect(vm.isLoadingHeatmapValues).toBe(false);
  });

  describe('vm.locationHasHeatmapValue', function() {
    var vm;

    beforeEach(function() {
      expectValueRequest().respond(values);
      expectLocationRequest().respond(locationResponse);
      vm = renderDirectiveAndDigest();
      multiLocationKPIFetcher.flush();
      $httpBackend.flush();
    });

    it('should return true if location has a heatmap value', function() {
      expect(vm.locationHasHeatmapValue(
        locationResponse.result[3] // A non-floor
      )).toBe(true);
    });

    it('should return false if location has no heatmap value', function() {
      expect(vm.locationHasHeatmapValue({
        // A location id that is not found in values
        'location_id': 4001
      })).toBe(false);
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('heatmapWidgetBody');
  }

  function createDirectiveElement() {
    return angular.element(
      '<heatmap-widget-body' +
      ' org-id="orgId"' +
      ' site-id="siteId"' +
      ' location-id="locationId"' +
      ' date-range-start="dateRangeStart"' +
      ' date-range-end="dateRangeEnd"' +
      ' list-title="List Title"' +
      ' kpi="testKPI"' +
      ' floor="floorNum">' +
      '</heatmap-widget-body>'
    );
  }

  // Expect a value request based on scope values
  function expectValueRequest() {
    var params = {
      orgId: $scope.orgId,
      reportEndDate: utils.getDateStringForRequest($scope.dateRangeEnd),
      reportStartDate: utils.getDateStringForRequest($scope.dateRangeStart),
      siteId: $scope.siteId,
      locationType: undefined
    };

    if ($scope.locationId) {
      params.location = $scope.locationId;
    }

    return multiLocationKPIFetcher.expectCall('testKPI', params);
  }

  // Expect a location request based on scope values
  function expectLocationRequest() {
    return $httpBackend.expectGET(
      apiUrl + '/organizations/' +
      $scope.orgId + '/sites/' +
      $scope.siteId + '/locations'
    );
  }

  function createLocationResponse() {
    return {
      result: [
        {
          'location_id': 1000,
          'location_type': 'Floor',
          'floor': 1
        },
        {
          'location_id': 2000,
          'location_type': 'Floor',
          'floor': 2
        },
        new LocationMock(1001, 1),
        new LocationMock(1002, 1),
        new LocationMock(2001, 2),
        new LocationMock(2002, 2)
      ]
    };
  }

  function createValueResponse() {
    return {
      '1001': '10000',
      '1002': '20000',
      '2001': '30000',
      '2002': '40000'
    };
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/heatmap/heatmap-widget-body/heatmap-widget-body.partial.html',
      '<div></div>'
    );
  }

  function LocationMock(locationId, floor) {
    this.location_id = locationId;
    this.floor = floor;
    this.location_type = 'Store';
    this.geometry = {
      coordinates: [
        '[[-73.57217164719,45.50223825938],[-73.57213441729,45.50222066763],[-73.57212358685,45.50223163083],[-73.57210570137,45.5022232152],[-73.57204235819,45.5022887764],[-73.5720986742,45.50231537947],[-73.57217164719,45.50223825938]]'
      ],
      type: 'Polygon'
    };
  }
});
