'use strict';

describe('NumberUtils', function() {

  var NumberUtils;
  var scope;

  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.utils'));
  beforeEach(inject(function(_NumberUtils_, $rootScope) {
    NumberUtils = _NumberUtils_;
    scope = $rootScope.$new();
  }));

  describe('function NumberUtils.getNumberValue() - passed in number in string format', function() {

    it('should return number passed in string format', function() {
      var a = NumberUtils.getNumberValue("64");  
      expect(a).toBe(64);
    });
  })

  describe('function NumberUtils.getNumberValue() - passed in integer number', function() {

    it('should return passed in integer number', function() {
      var a = NumberUtils.getNumberValue(32);  
      expect(a).toBe(32);
    });
  })  

  describe('function NumberUtils.isValidNonZeroNumber() - passed in integer number', function() {

    it('should return true if valid non-zero number passed in', function() {
      var a = NumberUtils.isValidNonZeroNumber(46);  
      expect(a).toBe(true);
    });
  })  

  describe('function NumberUtils.isValidNumber() - passed in valid number', function() {

    it('should return true if valid number passed in', function() {
      var a = NumberUtils.isValidNumber(80);  
      expect(a).toBe(true);
    });
  });

  describe('roundDown', function() {
    it('should round down correctly', function() {
      var number = 100.09;
      
      var result = NumberUtils.roundDown(number, 1);

      expect(result).toBe(100.00);
    });
  });

  describe('roundUp', function() {
    it('should round up correctly', function() {
      var number = 99.94;
      
      var result = NumberUtils.roundUp(number, 1);

      expect(result).toBe(100.00);
    });
  });
});