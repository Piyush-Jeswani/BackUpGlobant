'use strict';

describe('requestManager', function() {
  var $httpBackend;
  var $timeout;
  var $httpParamSerializer;
  var requestManager;
  var apiUrl;
  var localStorageService;
  var session;
  var mockedLocalStorage = {};
  var addedKeys = [];
  var removedKeys = [];
  var currentUserId = 1;
  var googleAnalytics;
  var httpTimeOut = 45000;

  beforeEach(function() {
    apiUrl = 'https://api.url/some/endPoint';
  });

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(module('shopperTrak.httpRequests'));

  beforeEach(module(function($provide) {
    $provide.constant('apiUrl', apiUrl);
    httpTimeOut = 45000;

    $provide.constant('httpTimeOut', httpTimeOut);

    localStorageService = {
      set: function(key, value) {
        mockedLocalStorage[key] = value;
        addedKeys.push(key);
      },
      get: function(key) {
        return mockedLocalStorage[key];
      },
      remove: function(key) {
        removedKeys.push(key);
      },
      keys: function() {
        return addedKeys;
      }
    };

    $provide.value('localStorageService', localStorageService);

    session = {
      getUserId: function() {
        return currentUserId;
      },
      getToken: function() {
        return '';
      }
    };

    $provide.value('session', session);

    googleAnalytics = {
      sendRequestTime: function (apiUri, urlWithParams, requestTime) {
        angular.noop(apiUri, urlWithParams, requestTime);
      }
    };

    $provide.value('googleAnalytics', googleAnalytics);
  }));

  beforeEach(inject(function(_$httpBackend_, _$httpParamSerializer_, _$timeout_, _requestManager_) {
    $httpBackend = _$httpBackend_;
    $httpParamSerializer = _$httpParamSerializer_;
    $timeout = _$timeout_;
    requestManager = _requestManager_;
  }));

  it('should expose a get function', function() {
    expect(typeof requestManager.get).toBe('function');
  });

  describe('get', function() {
    mockedLocalStorage = {};

    it('should make a http get request', function() {
      var params = {
        property: 'val'
      };

      $httpBackend.whenGET(apiUrl).respond({result: {'someProp': 'someValue'}});

      requestManager.get(apiUrl, params);

      $httpBackend.flush();
    });

    it('should not make a secondary request if there is already and outstanding request to that url', function() {
      mockedLocalStorage = {};

      var params = {
        property: 'val'
      };

      $httpBackend.whenGET(apiUrl).respond({result: {'someProp': 'someValue'}});

      var promise1 = requestManager.get(apiUrl, params);

      var promise2 = requestManager.get(apiUrl, params);

      expect(promise1).toBe(promise2);

      $httpBackend.flush();

      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not make a request if the response is already held in localStorage', function() {
      mockedLocalStorage = {};

      mockedLocalStorage[getKey('https://api.url/some/cachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment()
      };

      mockedLocalStorage[getKey('https://api.url/some/staleCachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment().subtract(1, 'day')
      };

      var params = {
        property: 'val'
      };

      var url = 'https://api.url/some/cachedEndPoint';

      requestManager.get(url, params)
        .then(function(response) {
          expect(response.key).toBe('someValue');
        });

      $timeout.flush();

      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should add any new responses into localStorage', function() {
      mockedLocalStorage = {};

      mockedLocalStorage[getKey('https://api.url/some/cachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment()
      };

      mockedLocalStorage[getKey('https://api.url/some/staleCachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment().subtract(1, 'day')
      };

      var params = {
        property: 'val'
      };

      var url = 'https://api.url/some/otherUrl';

      $httpBackend.whenGET(url).respond({result: {'someProp': 'someValue'}});

      requestManager.get(url, params);

      $httpBackend.flush();

      var fullUrl = buildUrl(url, params);

      expect(mockedLocalStorage[getKey(fullUrl)]).toBeDefined();

      expect(mockedLocalStorage[getKey(fullUrl)].data.result.someProp).toBe('someValue');

      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should not use responses held in localStorage that are older than 4 hours', function() {
      mockedLocalStorage = {};

      mockedLocalStorage[getKey('https://api.url/some/cachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment()
      };

      mockedLocalStorage[getKey('https://api.url/some/staleCachedEndPoint?property=val')] = {
        data: {
          key: 'someValue'
        },
        cachedDate: moment().subtract(1, 'day')
      };

      var params = {
        property: 'val'
      };

      var url = 'https://api.url/some/staleCachedEndPoint';

      $httpBackend.whenGET(url).respond({result: {'someProp': 'someOtherValue'}});

      requestManager.get(url, params);

      $httpBackend.flush();

      var fullUrl = buildUrl(url, params);

      var storedItem = mockedLocalStorage[getKey(fullUrl)];

      expect(storedItem).toBeDefined;

      expect(storedItem.data.result.someProp).toBe('someOtherValue');

      var end = moment();

      var duration = moment.duration(end.diff(storedItem.cachedDate));

      var hours = duration.asHours();

      expect(hours).toBeLessThan(4);

      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should resolve the promise if the api call is ok', function() {
      mockedLocalStorage = {};

      var params = {
        property: 'val'
      };

      $httpBackend.whenGET(apiUrl).respond({'someObject': {'someProp': 'someValue'}});

      var promiseHandler = {
        onSuccess : function() {
          //Do Nothing
        },
        onReject: function() {
          //Do Nothing
        }
      };

      spyOn(promiseHandler, 'onSuccess');
      spyOn(promiseHandler, 'onReject');

      requestManager.get(apiUrl, params)
        .then(promiseHandler.onSuccess, promiseHandler.onReject);

      $httpBackend.flush();

      expect(promiseHandler.onSuccess).toHaveBeenCalled();
      expect(promiseHandler.onReject).not.toHaveBeenCalled();
    });

    it('should resolve the promise with the api response with the data object unwrapped', function() {
      mockedLocalStorage = {};

      var params = {
        property: 'val'
      };

      $httpBackend.whenGET(apiUrl).respond({'someObject': {'someProp': 'someValue'}});

      requestManager.get(apiUrl, params)
        .then(function(response) {
          expect(response.someObject.someProp).toBe('someValue');
        });

      $httpBackend.flush();
    });

    it('should reject the promise if the api call errors', function() {
      mockedLocalStorage = {};

      var params = {
        property: 'val'
      };

      $httpBackend.expectGET(apiUrl).respond(500, 'Error Message');

      var promiseHandler = {
        onSuccess : function() {
          //Do Nothing
        },
        onReject: function() {
          //Do Nothing
        }
      };

      spyOn(promiseHandler, 'onSuccess');
      spyOn(promiseHandler, 'onReject');

      requestManager.get(apiUrl, params)
        .then(promiseHandler.onSuccess, promiseHandler.onReject);

      $httpBackend.flush();

      expect(promiseHandler.onSuccess).not.toHaveBeenCalled();
      expect(promiseHandler.onReject).toHaveBeenCalled();
    });



    it('should reject the promise on failure with the full http response object', function() {
      mockedLocalStorage = {};

      var params = {
        property: 'val'
      };

      $httpBackend.expectGET(apiUrl).respond(500, 'Error Message');

      var onSuccess = function() {
        //Do Nothing
      };

      var onReject = function(rejection) {
        expect(rejection.data).toBe('Error Message');
        expect(rejection.status).toBe(500);
      };

      requestManager.get(apiUrl, params)
        .then(onSuccess, onReject);

      $httpBackend.flush();
    });
  });

  describe('get with timeout', function() {
    beforeEach(function() {
      httpTimeOut = 30;
    });

    it('should reject the promise if the api call timeout', function() {
      mockedLocalStorage = {};


      var params = {
        property: 'val'
      };

      //in the http timeout we get responce with status -1
      $httpBackend.expectGET(apiUrl).respond(-1, '');

      var promiseHandler = {
        onSuccess : function() {
          //Do Nothing
        },
        onReject: function() {
          //Do Nothing
        }
      };

      spyOn(promiseHandler, 'onSuccess').and.callThrough();
      spyOn(promiseHandler, 'onReject').and.callThrough();

      requestManager.get(apiUrl, params)
        .then(promiseHandler.onSuccess, promiseHandler.onReject);


      $timeout.flush();

      $httpBackend.flush();

      expect(promiseHandler.onSuccess).not.toHaveBeenCalled();
      expect(promiseHandler.onReject).toHaveBeenCalled();
    });
  });


  describe('clearCache', function() {
    it('should clear out the responses object from localStorage', function() {
      removedKeys = [];

      addedKeys = [
        getKey('https://api.url/some/cachedEndPoint?property=val'),
        getKey('https://api.url/some/staleCachedEndPoint?property=val')];

      requestManager.clearCache();

      expect(removedKeys[0]).toBe(getKey('https://api.url/some/cachedEndPoint?property=val'));

      expect(removedKeys[1]).toBe(getKey('https://api.url/some/staleCachedEndPoint?property=val'))
    });
  });

  describe('clearOtherUserCachedData', function() {
    it('should clear out the responses that are not from the currently logged in user', function() {
      removedKeys = [];

      addedKeys = [];

      mockedLocalStorage = {};

      localStorageService.set(getKey('https://api.url/some/cachedEndPoint?property=val'), {userId: 1});
      localStorageService.set(getKey('https://api.url/some/cachedEndPoint2?property=val'), {userId: 2});

      currentUserId = 2;

      requestManager.clearOtherUserCachedData();

      expect(removedKeys.length).toBe(1);
      expect(removedKeys[0]).toBe(getKey('https://api.url/some/cachedEndPoint?property=val'));
    });
  });

  function buildUrl(url, requestParams) {
    var serializedParams = $httpParamSerializer(requestParams);
    var urlWithParams = url + '?' + serializedParams;
    return urlWithParams;
  }

  function getKey(url) {
    return 'response-' + url;
  }
});
