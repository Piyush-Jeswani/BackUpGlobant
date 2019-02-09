'use strict';

describe('loadingFlagsService', function () {
  var $rootScope, loadingFlagsService;

  beforeEach(module('shopperTrak', function () { }));

  beforeEach(inject(function (_$rootScope_,
    _loadingFlagsService_) {

      $rootScope = _$rootScope_;
      loadingFlagsService = _loadingFlagsService_;
  }));

  describe('onLoadingFlagsChange', function () {
    it('should be exposed', function() {
      expect(typeof loadingFlagsService.onLoadingFlagsChange).toBe('function');
    });

    it('should not do anything if no loadingFlags are provided', function() {
      spyOn($rootScope, '$broadcast');

      loadingFlagsService.onLoadingFlagsChange();

      expect($rootScope.$broadcast).not.toHaveBeenCalled();
    });

    it('should throw an error if an unbind function is not provided', function() {
      var expectedError = new Error('An unbind function must be provided');

      // Jasmine API weirdness
      var functionUnderTest = function () {
        loadingFlagsService.onLoadingFlagsChange({});
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should not do anything if all loading flags are not false', function() {
      var loadingFlags = {
        widgetOne: true,
        widgetTwo: false
      };

      spyOn($rootScope, '$broadcast');

      loadingFlagsService.onLoadingFlagsChange(loadingFlags, function() {});

      expect($rootScope.$broadcast).not.toHaveBeenCalled();
    });

    it('should broadcast the pageLoadFinished event if all loading flags are false', function() {
      var loadingFlags = {
        widgetOne: false,
        widgetTwo: false
      };

      spyOn($rootScope, '$broadcast');

      loadingFlagsService.onLoadingFlagsChange(loadingFlags, function() {});

      expect($rootScope.$broadcast).toHaveBeenCalled();
    });

    it('should call the unbind function if all loading flags are false', function() {
      var loadingFlags = {
        widgetOne: false,
        widgetTwo: false
      };

      // Jasmine API silliness
      var functionContainer = {
        unbindFunction: function() { }
      };

      spyOn(functionContainer, 'unbindFunction');

      loadingFlagsService.onLoadingFlagsChange(loadingFlags, functionContainer.unbindFunction);

      expect(functionContainer.unbindFunction).toHaveBeenCalled();
    });
  });
});
