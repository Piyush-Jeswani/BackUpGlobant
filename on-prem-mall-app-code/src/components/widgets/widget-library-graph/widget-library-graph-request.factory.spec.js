'use strict';
describe('Widget libray graph request factory', function () {
  var widgetLibraryGraphRequestFactory;
  var $q;
  var $rootScope;


  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.httpRequests'));
  describe('graph requests', function () {
    beforeEach(module(function ($provide) {
      // Fake request manager Implementation returning a promise
      $provide.value('requestManager', {
        get: function (fullUrl, params, cache) {
          return {
            then: function (callback) { return callback([{ result: [5, 7] }, { result: [6, 7] }]); }
          };
        },
      });
    }));

    beforeEach(
      inject(function (
      _requestManager_,
      _WidgetLibraryGraphRequestFactory_,
      _$q_,
      _$rootScope_) {
        widgetLibraryGraphRequestFactory = _WidgetLibraryGraphRequestFactory_;
        $q = _$q_;
        $rootScope = _$rootScope_;
    }));

    it('should get chart requests', function () {
      // Arrange
      var metricList = [
        {
          kpi: 'sales',
          dateRange : {
            start: '01/09/2017',
            end: '31/09/2017'
          }
        },
        {
          kpi : 'traffic',
          dateRange : {
            start: '01/09/2017',
            end: '31/09/2017'
          }
        }
      ];

      var dateRange = {
        start: '01/09/2017',
        end: '31/09/2017'
      }

      var groupBy = 'week';

      var orgId = 123;
      var pizzaOrderFulfillment = $q.defer();

      // Act
      var result = widgetLibraryGraphRequestFactory.getChartRequests(metricList, orgId, dateRange, groupBy);

      expect(result.length > 0).toBeTruthy();
      result[0].then(function (response) {
        expect(response.length > 0).toBeTruthy();
      }, function (error) {
        console.log(error);
        expect((error + '').length > 0).toBeTruthy();
      });
      pizzaOrderFulfillment.resolve('resolved');
      $rootScope.$digest();
    });
  });

  it('should not get chart requests', function () {
    // Arrange
    var metricList = [];
    var orgId = 123;

    // Act
    var result = widgetLibraryGraphRequestFactory.getChartRequests(metricList, orgId);
    expect(result.length === 0).toBeTruthy();
  });
});
