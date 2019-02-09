'use strict';

describe('googleAnalytics', function () {
  var googleAnalytics;

  var fakeWindow;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    fakeWindow =  {
      ga: function(action, param1, param2) {
        // Do nothing
        angular.noop(action, param1, param2);
      }
    };

    $provide.value('$window', fakeWindow);
  }));

  beforeEach(inject(function(_googleAnalytics_) {
    googleAnalytics = _googleAnalytics_;
  }));

  describe('trackUserEvent', function() {
    it('should be exposed', function () {
      expect(typeof googleAnalytics.trackUserEvent).toBe('function');
    });

    it('should throw an error if a category is not passed in', function () {
      var expectedError = new Error('Category is required');

      var functionUnderTest = function () {
        googleAnalytics.trackUserEvent();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if an action is not passed in', function () {
      var expectedError = new Error('Action is required');

      var functionUnderTest = function () {
        googleAnalytics.trackUserEvent('Category');
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if google analytics object is not available', function() {
      fakeWindow.ga = null;

      var expectedError = new Error('Google Analytics is not loaded');

      var functionUnderTest = function() {
        googleAnalytics.trackUserEvent();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should set the event category and action', function () {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.trackUserEvent('category', 'action');

      var expectedObject = {
        hitType: 'event',
        eventCategory: 'category',
        eventAction: 'action',
        eventLabel: 'User Action',
        eventValue: 1
      };

      expect(fakeWindow.ga).toHaveBeenCalledWith('send', expectedObject);
    });
  });

  describe('sendPageView', function() {
    it('should be exposed', function() {
      expect(typeof googleAnalytics.sendPageView).toBe('function');
    });

    it('should throw an error if a routename is not specified', function() {
        var expectedError = new Error('Route name is required');

        var functionUnderTest = function() {
          googleAnalytics.sendPageView();
        };

        expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if google analytics object is not available', function() {
      fakeWindow.ga = null;

      var expectedError = new Error('Google Analytics is not loaded');

      var functionUnderTest = function() {
        googleAnalytics.sendPageView();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should record the page without metric1 if the loadTime is not passed in', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.sendPageView('some/page');

      expect(fakeWindow.ga).toHaveBeenCalledWith('send', 'pageview');
    });

    it('should set the current route', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.sendPageView('page two', 1000);

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'page', '/page two');
    });

    it('should send the page view and the load time in seconds', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.sendPageView('page two', 1000);

      expect(fakeWindow.ga).toHaveBeenCalledWith('send', 'pageview', { 'metric1': 1});
    });

    it('should not send the page view if the virtualPath is empty', function() {
      spyOn(fakeWindow, 'ga');
      
      googleAnalytics.sendPageView('/8507', 1000);

      expect(fakeWindow.ga).not.toHaveBeenCalled();
    });
  });

  describe('getVirtualPath', function() {
    it('should remove any numeric only parts from the URL', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.sendPageView('8400/traffic');

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'page', '/traffic');
    });
  })

  describe('setUserId', function() {
    it('should be exposed', function() {
      expect(typeof googleAnalytics.setUserId).toBe('function');
    });

    it('should throw an error if google analytics object is not available', function() {
      fakeWindow.ga = null;

      var expectedError = new Error('Google Analytics is not loaded');

      var functionUnderTest = function() {
        googleAnalytics.setUserId();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the userId is blank', function () {
      var expectedError = new Error('UserId is required');

      var functionUnderTest = function() {
        googleAnalytics.setUserId('');
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the userId is not a string', function() {
      var expectedError = new Error('UserId must be a string');

      var functionUnderTest = function() {
        googleAnalytics.setUserId(1234);
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should set the userId', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setUserId('1234');

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'userId', '1234');
    });

    it('should set the userId dimension (dimension3)', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setUserId('1234');

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'dimension3', '1234');
    });

    it('should not set the userId if it has already been set', function () {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setUserId('1234');

      googleAnalytics.setUserId('1234');

      googleAnalytics.setUserId('1234');

      expect(fakeWindow.ga.calls.count()).toBe(2);
    });
  });

  describe('resetUserIdSentStatus', function() {
    it('should be exposed', function() {
      expect(typeof googleAnalytics.resetUserIdSentStatus).toBe('function');
    });

    it('should reset the userId sent status', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setUserId('1234');

      expect(fakeWindow.ga.calls.count()).toBe(2);

      googleAnalytics.resetUserIdSentStatus();

      googleAnalytics.setUserId('1234');

      expect(fakeWindow.ga.calls.count()).toBe(4);
    });
  });

  describe('sendRequestTime', function() {
    it('should be exposed', function() {
      expect(typeof googleAnalytics.sendRequestTime).toBe('function');
    });

    it('should throw an error if google analytics object is not available', function() {
      fakeWindow.ga = null;

      var expectedError = new Error('Google Analytics is not loaded');

      var functionUnderTest = function() {
        googleAnalytics.sendRequestTime();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the apiUri is blank', function() {
      var expectedError = new Error('apiUri is required');

      var functionUnderTest = function() {
        googleAnalytics.sendRequestTime('', 'some-api-url', 1);
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the apiAddress is blank', function() {
      var expectedError = new Error('apiAddress is required');

      var functionUnderTest = function() {
        googleAnalytics.sendRequestTime('some-api-uri', '', 1);
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the requestTime is not a number', function() {
      var expectedError = new Error('requestTime must be a number');

      var functionUnderTest = function() {
        googleAnalytics.sendRequestTime('some-api-uri', 'some-api-url', '1');
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    describe('valid call', function() {
      var methodNameCalled;
      var paramsObjPassed;

      beforeEach(function() {
        fakeWindow.ga = function(methodName, paramsObj) {
          methodNameCalled = methodName;
          paramsObjPassed = paramsObj
        };

        googleAnalytics.sendRequestTime('some-api-uri', 'some-api-url?someParam=someVal', 1);
      });

      it('should call google analytics with a hitType of event', function() {
        expect(methodNameCalled).toBe('send');
        expect(paramsObjPassed.hitType).toBe('event');
      });

      it('should call google analytics with the apiUri as the eventCategory', function() {
        expect(methodNameCalled).toBe('send');
        expect(paramsObjPassed.eventCategory).toBe('some-api-uri');
      });

      it('should call google analytics with the apiAddress as the eventAction', function() {
        expect(methodNameCalled).toBe('send');
        expect(paramsObjPassed.eventAction).toBe('some-api-url?someParam=someVal');
      });

      it('should call google analytics with the eventLabel set', function() {
        expect(methodNameCalled).toBe('send');
        expect(paramsObjPassed.eventLabel).toBe('API Request Time');
      });

      it('should call google analytics with the eventValue set to the requestTime', function() {
        expect(methodNameCalled).toBe('send');
        expect(paramsObjPassed.eventValue).toBe(1);
      });
    });
  });

  describe('setOrg', function() {
    it('Should throw an error if ordId is invalid', function() {
      var expectedError = new Error('OrgId is required');
      
      var functionUnderTest = function() {
        googleAnalytics.setOrg();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('Should set the orgId dimension', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setOrg(100);

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'dimension1', '100');
    });

    it('Should not set the orgId if it has already been set', function() {    
      googleAnalytics.setOrg(100);

      spyOn(fakeWindow, 'ga');

      googleAnalytics.setOrg(100);

      expect(fakeWindow.ga).not.toHaveBeenCalledWith('set', 'dimension1', '100');
    });
  });

  describe('setUserRole', function() {
    it('Should throw an error if the userRole is invalid', function() {
      var expectedError = new Error('userRole is required');
      
      var functionUnderTest = function() {
        googleAnalytics.setUserRole();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('Should set the userRole dimension', function() {
      spyOn(fakeWindow, 'ga');

      googleAnalytics.setUserRole('ST Admin');

      expect(fakeWindow.ga).toHaveBeenCalledWith('set', 'dimension2', 'ST Admin');
    });
  });
});
