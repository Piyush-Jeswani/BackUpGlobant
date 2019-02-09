'use strict';

describe('miUserPreferences', function() {
  var miUserPreferences;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function(_miUserPreferences_) {
    miUserPreferences = _miUserPreferences_;
  }));

  describe('segmentPreferencesAreConfigured', function() {
    it('should be exposed', function() {
      expect(typeof miUserPreferences.segmentPreferencesAreConfigured).toBe('function');
    });

    it('should return false if the userPreferences contain no marketIntelligence object', function() {
      var userPreferences = { };

      var result = miUserPreferences.segmentPreferencesAreConfigured(userPreferences);

      expect(result).toBe(false);
    });

    it('should return false if the userPreferences contain no segments', function() {
      var userPreferences = {
        market_intelligence: {
          segments: []
        }
      };

      var result = miUserPreferences.segmentPreferencesAreConfigured(userPreferences);

      expect(result).toBe(false);
    });

    it('should return false if the userPreferences contain no configured segments', function() {
      var userPreferences = {
        market_intelligence: {
          segments: [{ subscription: {}}]
        }
      };

      var result = miUserPreferences.segmentPreferencesAreConfigured(userPreferences);

      expect(result).toBe(false);
    });
  });

  describe('getConfiguredSegments', function() {
    it('should be exposed', function() {
      expect(typeof miUserPreferences.getConfiguredSegments).toBe('function');
    });

    it('should add a positionIndex property to each segment', function() {
      var userPreferences = {
        "market_intelligence": [{
          "orgId":1000003068,
          "segments": [
            {
              "subscription": {
                "someProp": "someVal"
              }
            }
          ]
        }]
      };

      var result = miUserPreferences.getConfiguredSegments(userPreferences, 1000003068);

      expect(result[0].positionIndex).toBe(0);
    });

    it('should return an empty array if no segments are configured', function() {
      var userPreferences = {
        "market_intelligence": [{
          "orgId":1000003068,
          "segments": [
            {
              "subscription": {}
            }
          ]
        }]
      };

      var result = miUserPreferences.getConfiguredSegments(userPreferences);

      expect(result.length).toBe(0);
    });

    it('should return an array with one item and it\'s position if one segment is configured', function() {

      var userPreferences = {
        "market_intelligence": [
          {
            "orgId": 1000003068, "segments": [
            {},
            {
              "subscription": {
                "someProp": "ok"
              }
            }
          ]
          }
        ]
      };

      var result = miUserPreferences.getConfiguredSegments(userPreferences, 1000003068);

      expect(result.length).toBe(1);
      expect(result[0].positionIndex).toBe(1);
    });
  });
});