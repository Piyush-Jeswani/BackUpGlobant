(function() {
  'use strict';

  angular.module('shopperTrak.widgets.mock', [])
    .factory('multiLocationKPIFetcher', createMultiLocationKPIFetcherMock);

  createMultiLocationKPIFetcherMock = [
    '$q'
  ];

  function createMultiLocationKPIFetcherMock($q) {
    var expectations = [];
    var fetches = [];

    return {
      expectCall: expectCall,
      fetchAggregate: fetchAggregate,
      flush: flush
    };

    function expectCall(kpi, params) {
      var expectation = new Expectation(kpi, params);
      expectations.push(expectation);
      return expectation;
    }

    function fetchAggregate(kpi, params) {
      var fetch = $q.defer();
      fetch.kpi = kpi;
      fetch.params = params;
      fetches.push(fetch);
      return {
        promise: fetch.promise
      };
    }

    function flush() {
      expectations.forEach(function(expectation, index) {
        expect(expectation.kpi).toBe(fetches[index].kpi);
        expect(expectation.params).toEqual(fetches[index].params);
        if (expectation.success) {
          fetches[index].resolve(expectation.response);
        } else {
          fetches[index].reject();
        }
      });
    }

    function Expectation(kpi, params) {
      var self = this;
      self.kpi = kpi;
      self.params = params;
      self.success = true;
      self.respond = function(response) {
        self.response = response;
      };
      self.fail = function() {
        self.success = false;
      }
    }

  }
})();
