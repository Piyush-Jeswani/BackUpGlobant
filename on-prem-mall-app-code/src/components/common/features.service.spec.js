'use strict';

describe('featuresService', function() {

  var features;

  describe('isEnabled', function() {
    var mockFeatureConfig = {
      disabledFeature: false,
      enabledFeature: true,
      allFeaturesOn: false
    };

    beforeEach(module('shopperTrak'));

    beforeEach(module(function ($provide) {
      $provide.constant('featuresConfig', mockFeatureConfig);
      spyOn(console, 'error');
    }));

    beforeEach(inject(function(_features_) {
      features = _features_;
    }));


    it('should return false if no feature name is passed in', function() {
      var result = features.isEnabled('');

      expect(result).toEqual(false);
    });

    it('should return false if the feature is not enabled', function() {
      var result = features.isEnabled('disabledFeature');

      expect(result).toEqual(false);
    });

    it('should return true if the feature is enabled', function() {
      var result = features.isEnabled('enabledFeature');

      expect(result).toEqual(true);
    });

  });

  describe('allFeaturesEnabled on ', function() {
    var allFeatures;
    var anotherMockFeatureConfig = {
      disabledFeature: false,
      enabledFeature: true,
      allFeaturesOn: true
    };

    beforeEach(module('shopperTrak'));

    beforeEach(module(function ($provide) {
      $provide.constant('featuresConfig', anotherMockFeatureConfig);
    }));

    beforeEach(inject(function(_features_) {
      allFeatures = _features_;
    }));


    it('should return true if even the feature is disabled', function() {
      var result = allFeatures.isEnabled('disabledFeature');
      expect(result).toEqual(true);
    });
  })
});
