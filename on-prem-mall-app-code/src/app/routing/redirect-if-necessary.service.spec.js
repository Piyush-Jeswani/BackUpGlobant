'use strict';

describe('redirectIfNecessary', function () {
  var redirectIfNecessary;

  var $timeout;
  var fillDefaultDateRangeParamsStub;
  var $stateMock;
  var eventMock;
  var $httpBackend;
  var LocalizationServiceMock;
  var fakeMetrics;
  var pdfInterceptor;

  fakeMetrics = {};
  pdfInterceptor= {};
  
  beforeEach(module('shopperTrak'));

  beforeEach(module('shopperTrak.routing'));

  beforeEach(module(function ($provide) {
    fillDefaultDateRangeParamsStub = jasmine.createSpy();
    $stateMock = {
      go: jasmine.createSpy('go')
    };
    eventMock = {
      preventDefault: jasmine.createSpy('preventDefault')
    };
    LocalizationServiceMock = {};

    $provide.factory('fillDefaultDateRangeParams', function () {
      return fillDefaultDateRangeParamsStub;
    });

    $provide.factory('LocalizationService', function () {
      return LocalizationServiceMock;
    });

    $provide.factory('$state', function () {
      return $stateMock;
    });

    $provide.factory('metricConstants', function () {
      return fakeMetrics;
    });

    $provide.factory('pdfInterceptor', function () {
      return pdfInterceptor;
    });
  }));
  beforeEach(inject(function (_$timeout_, _redirectIfNecessary_, _$httpBackend_) {
    $timeout = _$timeout_;
    redirectIfNecessary = _redirectIfNecessary_;
    $httpBackend = _$httpBackend_;
  }));

  it('should not do a redirect if fillDefaultDateRangeParams return same params', function () {
    var fakeState = { name: 'test' };
    var oldParams = { bogusParam: 'bogusParam' };
    var newParams = { bogusParam: 'bogusParam' };

    fillDefaultDateRangeParamsStub.and.callFake(function () {
      return newParams;
    });

    expect(fillDefaultDateRangeParamsStub).not.toHaveBeenCalled();
    expect(eventMock.preventDefault).not.toHaveBeenCalled();

    redirectIfNecessary(eventMock, fakeState, oldParams, fakeMetrics);

    expect(eventMock.preventDefault).not.toHaveBeenCalled();
    expect($stateMock.go).not.toHaveBeenCalled();
  });
});
