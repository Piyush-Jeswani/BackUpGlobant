'use strict';

describe('resourceUtils', function() {
  var resourceUtils;
  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.resources'));
  beforeEach(inject(function(_resourceUtils_) {
    resourceUtils = _resourceUtils_;
  }));

  describe('locationHasGeometry', function() {
    it('should return false if location has no geometry property', function() {
      expect(resourceUtils.locationHasGeometry({})).toBe(false);
    });

    it('should return false if location\'s geometry propery has no coordinates property', function() {
      expect(resourceUtils.locationHasGeometry({
        geometry: {}
      })).toBe(false);
    });

    it('should return false if location\'s geometry.coordinates property is an empty array', function() {
      expect(resourceUtils.locationHasGeometry({
        geometry: {
          coordinates: []
        }
      })).toBe(false);
    });

    it('should return true if location has a valid geometry property', function() {
      expect(resourceUtils.locationHasGeometry({
        geometry: {
          coordinates: [
            '[[-115.17621467669,36.09350667934],[-115.17616570426,36.0934187308]]'
          ]
        }
      }));
    });
  });
});
