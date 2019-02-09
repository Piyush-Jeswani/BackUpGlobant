'use strict';

describe('leafletUtils', function() {
  var leafletUtils;

  beforeEach(module('shopperTrak.leaflet'));
  beforeEach(inject(function(_leafletUtils_) {
    leafletUtils = _leafletUtils_;
  }));

  function LayerMock() {}
  LayerMock.prototype.getBounds = function() {
    return new LatLngBoundsMock();
  };

  function LatLngBoundsMock() {}
  LatLngBoundsMock.prototype.extend = function() {};

  describe('getBounds', function() {
    it('should get the bounds of the layers passed as argument', function() {
      var layer1 = new LayerMock();
      var layer2 = new LayerMock();

      spyOn(layer1, 'getBounds').and.callThrough();
      spyOn(layer2, 'getBounds').and.callThrough();

      var bounds = leafletUtils.getBounds([layer1, layer2]);

      expect(layer1.getBounds).toHaveBeenCalled();
      expect(layer2.getBounds).toHaveBeenCalled();

      expect(bounds.constructor).toBe(LatLngBoundsMock);
    });
  });
});
