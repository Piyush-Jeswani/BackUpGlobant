'use strict';

describe('ZoneHelperService', function() {

  var $ZoneHelperService;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function(_ZoneHelperService_) {
    $ZoneHelperService = _ZoneHelperService_;
  }));

  describe('ZoneHelperService', function() {

    it('should remove the leading x when lowercase', function() {
      var name = $ZoneHelperService.removeLeadingX('xNew Yorker 119905');
      expect(name).not.toBe('xNew Yorker 119905');
      expect(name).toBe('New Yorker 119905');
    });

    it('should not remove the leading x when uppercase', function() {
      var XName = $ZoneHelperService.removeLeadingX('XLa Senza (E9) MD15');
      expect(XName).not.toBe('La Senza (E9) MD15');
      expect(XName).toBe('XLa Senza (E9) MD15');
    });

    it('should not remove the leading character when lowercase and not an x', function() {
      var iName = $ZoneHelperService.removeLeadingX('iNew Yorker 119905');
      expect(iName).not.toBe('New Yorker 119905');
      expect(iName).toBe('iNew Yorker 119905');
    });

    it('should expect null when an empty value is given', function() {
      var empty = $ZoneHelperService.removeLeadingX();
      expect(empty).toBe(null);
      expect(empty).not.toBe(undefined);
    });

  });

});
