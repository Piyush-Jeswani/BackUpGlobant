(function() {
  'use strict';

  angular.module('shopperTrak').service('sitesRequestsService', ['$http', '$q', 'ObjectUtils', function($http, $q, ObjectUtils) {
  var pending = [];
  function get(url, params) {

    var canceller = $q.defer();

    if(!ObjectUtils.isNullOrUndefined(params.site_search_term)) {
      var existingPendingRequests = getEarlierSearchRequests(params.site_search_term);

      cancelFiltered(existingPendingRequests);
    } else {
      cancelAll();
    }

    add({
      url: url,
      params: params,
      canceller: canceller
    });

    var requestPromise = $http.get(url, { params: params, timeout: canceller.promise });

    requestPromise.finally(function() {
      remove(url);
    });
    return requestPromise;
  }

  function add(requestUrl) {
    pending.push(requestUrl);
  }

  function remove(requestUrl) {
    pending = _.filter(pending, function(p) {
      return p.url !== requestUrl;
    });
  }

  function cancelFiltered (filteredRequests) {
    _.each(filteredRequests, function(p) {
      p.canceller.resolve();
    });
  }

  function cancelAll () {
    _.each(pending, function(p) {
      p.canceller.resolve();
    });
  }

  function getEarlierSearchRequests(searchTerm) {
    var filtered =  _.filter(angular.copy(pending), function(p) {
      return !isParamPresent(p.params, searchTerm);
    });

    return filtered;
  }

  function isParamPresent(params, value) {
    if(ObjectUtils.isNullOrUndefined(params)) {
      return false;
    }

    if(ObjectUtils.isNullOrUndefined(params.site_search_term)) {
      return false;
    }

    return params.site_search_term === value;
  }

  return {
    get: get
  };
}]);
})();
