(function() {
  'use strict';

  angular.module('shopperTrak.httpRequests')
  .service('requestManager', [
    '$q',
    '$http',
    '$interval',
    '$rootScope',
    '$window',
    '$httpParamSerializer',
    'localStorageService',
    'ObjectUtils',
    'session',
    'googleAnalytics',
    'apiUrl',
    'SubscriptionsService',
    function (
      $q,
      $http,
      $interval,
      $rootScope,
      $window,
      $httpParamSerializer,
      localStorageService,
      ObjectUtils,
      session,
      googleAnalytics,
      apiUrl,
      SubscriptionsService
    ) {

      var outstandingRequests;
      var currentOrganization;

      activate();

      function activate() {
        outstandingRequests = [];

        removeExpiredResponses();

        $interval(removeExpiredResponses, 300000);
      }

      function get(url, params, checkCache) {
        if($rootScope.pdf) {
          return makeRequest(url, params);
        }

        if(isReportsEndpoint(url)) {
          var allReportEndpointMetrics = getAllReportEndpointMetrics(params.params.orgId);

          if(!ObjectUtils.isNullOrUndefined(allReportEndpointMetrics)) {
            params.params.kpi = allReportEndpointMetrics;
          }
        }

        if(checkCache !== false) {
          var cachedResponse = getCachedResponse(url, params);

          if(!ObjectUtils.isNullOrUndefined(cachedResponse)) {
            var cachedDeferred = $q.defer();

            cachedDeferred.resolve(cachedResponse, false);

            return cachedDeferred.promise;
          }
        }

        var outstandingRequest = getOutstandingRequest(url, params);

        if(!ObjectUtils.isNullOrUndefined(outstandingRequest)) {
          return outstandingRequest.deferred.promise;
        }

        return makeRequest(url, params);
      }

      function getRequest(url, params, checkCache, requests) {
        if($rootScope.pdf) {
          return createRequest(url, params);
        }

        if(checkCache !== false) {
          var cachedResponse = getCachedResponse(url, params);

          if(!ObjectUtils.isNullOrUndefined(cachedResponse)) {
            var cachedDeferred = $q.defer();

            cachedDeferred.resolve(cachedResponse, false);

            return cachedDeferred;
          }
        }

        var outstandingRequest = findOutstandingRequest(url, params, requests);

        if(!ObjectUtils.isNullOrUndefined(outstandingRequest)) {
          return outstandingRequest;
        }
        return createRequest(url, params);
      }

    /** Clears out cached responses
     *  Gets the current userId from the session service
     *  Public function
     **/
      function clearCache() {
        var keys = getAllCacheKeys();

        _.each(keys, function(key) {
          localStorageService.remove(key);
        });
      }

    /** Clears out cached responses for previously logged in users.
     *  The currently logged in user's response cache is not deleted.
     *  Gets the current userId from the session service
     *  Public function
     **/
      function clearOtherUserCachedData() {
        var keys = getAllCacheKeys();

        var currentUserId = session.getUserId();

        _.each(keys, function(key) {
          var cachedResponse = localStorageService.get(key);

          if(cachedResponse.userId !== currentUserId) {
            localStorageService.remove(key);
          }
        });
      }

    /** Stores a reference to the current organization in the request manager.
     *  Is used to gather a list of available metrics to the organization in order
     *  to make requests to some endpoints more re-useable.
     *  Public function
     *
     *  @param {object<Organization>} organization the current organization
     **/
      function setOrganization(organization) {
        currentOrganization = organization;
      }

      function createRequest(url, params) {
        var deferred = $q.defer();
        var canceller = $q.defer();
        var req;

        var cancel = function (reason) {
          canceller.resolve(reason, false);
        };

        var requestParams = angular.copy(params);

        requestParams.timeout = canceller.promise;

        var requestStartedTimer;

        if($window.performance) {
          requestStartedTimer = $window.performance.now();
        }

        var req;
        var promise = $http.get(url, requestParams)
          .then(
            function(response) {
              if($window.performance) {
                var requestFinishedTimer = $window.performance.now();
                var requestTime = Math.round(requestFinishedTimer - requestStartedTimer);
                var urlWithParams = getUrl(url, requestParams);
                var apiUri = url.replace(apiUrl, '');
                googleAnalytics.sendRequestTime(apiUri, urlWithParams, requestTime);
              }
              resolve(req, response, true);
            },
            function(response) { reject(req, response); }
          );

        req = {
          url: getUrl(url, params),
          deferred: deferred,
          promise: promise,
          cancel: cancel
        };
        return req;
      }

      function makeRequest(url, params) {
        var req = createRequest(url, params);

        outstandingRequests.push(req);

        return req.deferred.promise;
      }

      function resolve(request, response, cache) {
        request.deferred.resolve(response.data);

        if(response.status === 200 && cache && !$rootScope.pdf) {
          cacheResponse(request.url, response.data);
        }

        completeRequest(request);
      }

      function reject(request, response) {
        if(!ObjectUtils.isNullOrUndefined(request.deferred) &&
          typeof request.deferred.reject === 'function') {
          request.deferred.reject(response);
        }

        completeRequest(request);
      }

      function completeRequest(request) {
        outstandingRequests = _.without(outstandingRequests, _.findWhere(outstandingRequests, {
          url: request.url
        }));
      }

      function cacheResponse(url, data) {
        var key = getKey(url);

        var cachedResponse = {
          userId: session.getUserId(),
          data: data,
          cachedDate: moment().valueOf()
        };

        localStorageService.set(key, cachedResponse);
      }

      function getCachedResponse(endpoint, params) {
        var url = getUrl(endpoint, params);

        var key = getKey(url);

        var cachedResponse = localStorageService.get(key);

        if(ObjectUtils.isNullOrUndefined(cachedResponse)) {
          return undefined;
        }

        if(isOlderThanFourHours(cachedResponse.cachedDate)) {
          localStorageService.remove(key);
          return undefined;
        }

        return cachedResponse.data;
      }

      function isOlderThanFourHours(time) {
        var hours = getHoursAgo(time);

        return hours >= 4;
      }

      function getHoursAgo(time) {
        var end = moment();

        var duration = moment.duration(end.diff(time));

        return duration.asHours();
      }

      function getOutstandingRequest(url, params) {
        return findOutstandingRequest(url, params, outstandingRequests);
      }

      function findOutstandingRequest(url, params, outstandingRequests) {
        var search = { url: getUrl(url, params)};

        var req = _.findWhere(outstandingRequests, search);

        return req;
      }

      function removeExpiredResponses() {
        var keys = getAllCacheKeys();

        _.each(keys, function(key) {
          var cachedResponse = localStorageService.get(key);

          if(!ObjectUtils.isNullOrUndefined(cachedResponse)) {
            var hoursAgo = getHoursAgo(cachedResponse.cachedDate);

            if(hoursAgo >= 4) {
              localStorageService.remove(key);
            }
          }
        });
      }

      function getUrl(url, requestParams) {
        var params;

        if(_.isUndefined(requestParams.params)) {
          params = requestParams;
        } else {
          params = requestParams.params;
        }

        var serializedParams = $httpParamSerializer(params);

        var urlWithParams = url + '?' + serializedParams;

        return urlWithParams;
      }

      function getKey(url) {
        return 'response-' + url;
      }

      function getAllCacheKeys() {
        var matchedKeys = [];

        var keys = localStorageService.keys();

        _.each(keys, function(key) {
          if(key.substring(0, 9) === 'response-') {

            matchedKeys.push(key);
          }
        });

        return matchedKeys;
      }

      function cancelAllOutstandingRequests() {
        _.each(outstandingRequests, function (request) {
          cancelRequest(request);
        });
        outstandingRequests = [];
      }

      function cancelRequests(requests, reason) {
        _.each(requests, function (request) {
          cancelRequest(request, reason);
        });
      }

      function cancelRequest(request, reason) {
        if (ObjectUtils.isNullOrUndefinedOrBlank(reason)) {
          reason = 'User cancelled';
        }

        if (!ObjectUtils.isNullOrUndefinedOrBlank(request) && _.isFunction(request.cancel)) {
          request.cancel(reason);
        }

        reject(request, reason);
      }

    /** Checks to see if the URL being hit is the reports endpoint
     *
     *  @param {string} url the url
     *  @returns {boolean} A boolean
     **/
      function isReportsEndpoint(url) {
        var endpointToCheck = 'report';

        var endOfUrl = url.substr(url.length - endpointToCheck.length);

        return endOfUrl === endpointToCheck;
      }

      /**
       * Returns a list of all metrics that the current organization can access from the
       * Reports endpoint. Is used to make all reports endpoint requests the same, therefore
       * improving request sharing
       * Private function
       *
       * @param {number} orgId
       * @returns {array<string>} A list of the KPIs that can be sent to the reports endpoint for the current org
       */
      function getAllReportEndpointMetrics(orgId) {
        if(ObjectUtils.isNullOrUndefined(orgId)) {
          return;
        }

        if(ObjectUtils.isNullOrUndefined(currentOrganization)) {
          return;
        }

        if(currentOrganization.organization_id !== orgId) {
          return;
        }

        var orgMetrics = SubscriptionsService.getMetrics(currentOrganization);

        var metricsAcceptedByReportsEndpoint = ['traffic',
          'abandonment_rate',
          'draw_rate',
          'dwelltime',
          'gsh',
          'transactions',
          'loyalty',
          'opportunity',
          'labor_hours',
          'upt',
          'star',
          'conversion',
          'sales',
          'ats',
          'aur',
          'sps',
          'splh'];

        var kpis = _.pluck(orgMetrics, 'kpi');

        var requestKpis = _.intersection(metricsAcceptedByReportsEndpoint, kpis);

        return _.sortBy(requestKpis);
      }

      return {
        get: get,
        clearCache: clearCache,
        cancelAllOutstandingRequests: cancelAllOutstandingRequests,
        cancelRequest: cancelRequest,
        cancelRequests: cancelRequests,
        createRequest: createRequest,
        findOutstandingRequest: findOutstandingRequest,
        getRequest:getRequest,
        clearOtherUserCachedData: clearOtherUserCachedData,
        setOrganization: setOrganization
      };
    }]);
})();
