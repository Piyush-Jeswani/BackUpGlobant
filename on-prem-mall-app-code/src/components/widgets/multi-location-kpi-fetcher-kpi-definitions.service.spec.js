'use strict';

describe('multiLocationKPIFetcherKPIDefinitions', function() {
  var $q;
  var $rootScope;
  var kpiDefinitions;
  var LocationResourceMock;

  beforeEach(module('shopperTrak.widgets'));
  beforeEach(module(function($provide) {
    $provide.factory('LocationResource', createLocationResourceMock);
  }));
  beforeEach(inject(function(_$q_, _$rootScope_, multiLocationKPIFetcherKPIDefinitions) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    kpiDefinitions = multiLocationKPIFetcherKPIDefinitions;
  }));

  describe('oneAndDone.prefetch', function() {
    it('should fetch all locations of requested site', function() {
      var orgId = 1234;
      var siteId = 5678;

      spyOn(LocationResourceMock, 'query').and.callThrough();

      kpiDefinitions.oneAndDone.prefetch({
        orgId: orgId,
        siteId: siteId
      });
      expect(LocationResourceMock.query).toHaveBeenCalledWith({
        orgId: orgId,
        siteId: siteId
      }, null);
    });

    it('should add locationIds of all locations to query parameters', function() {
      var params = {
        orgId: 1234,
        siteId: 5678
      };
      var locations = [{
        location_id: 123,
        location_type: 'Store'
      }, {
        location_id: 456,
        location_type: 'Corridor'
      }, {
        location_id: 789,
        location_type: 'Store'
      }];
      var expectedLocations = [{
        location_id: 123,
        location_type: 'Store'
      }, {
        location_id: 456,
        location_type: 'Corridor'
      }];

      var transformedParams;

      kpiDefinitions.oneAndDone.prefetch(params)
        .then(function(_transformedParams_) {
          transformedParams = _transformedParams_;
        });

      // Resolve promises created with $q
      LocationResourceMock.deferred.resolve(locations);
      $rootScope.$digest();

      expect(transformedParams.orgId).toBe(params.orgId);
      expect(transformedParams.siteId).toBe(params.siteId);
      expect(transformedParams.locationType)
        .toEqual(_(expectedLocations).pluck('location_type'));
    });

    it('should reject promise if location request fails', function() {
      var wasRejected = false;
      kpiDefinitions.oneAndDone.prefetch({ orgId: 1234, siteId: 5678 })
        .catch(function() {
          wasRejected = true;
        });
      LocationResourceMock.deferred.reject();
      $rootScope.$digest();
      expect(wasRejected).toBe(true);
    });
  });

  function createLocationResourceMock() {
    LocationResourceMock = {
      query: function() {
        LocationResourceMock.deferred = $q.defer();
        return {
          $promise: LocationResourceMock.deferred.promise
        };
      }
    };
    return LocationResourceMock;
  }
});
