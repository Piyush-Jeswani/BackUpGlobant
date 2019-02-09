'use strict';

describe('filters', function() {

  var $filter;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function(_$filter_) {
    $filter = _$filter_;
  }));

  describe('formatNumber', function() {
    it('should be able to handle falsy values', function() {
      expect($filter('formatNumber')(0)).toEqual('0');
      expect($filter('formatNumber')(false)).toEqual('');
      expect($filter('formatNumber')(null)).toEqual('');
      expect($filter('formatNumber')(undefined)).toEqual('');
      expect($filter('formatNumber')(0/0)).toEqual('');
    });

    it('should round to nearest integer with default values', function() {
      expect($filter('formatNumber')(0.49)).toEqual('0');
      expect($filter('formatNumber')(0.51)).toEqual('1');
      expect($filter('formatNumber')(2.01)).toEqual('2');

      expect($filter('formatNumber')(-0.49)).toEqual('0');
      expect($filter('formatNumber')(-0.51)).toEqual('-1');
      expect($filter('formatNumber')(-2.01)).toEqual('-2');
    });

    it('should round to nearest value with single digits', function() {
      expect($filter('formatNumber')(28.25, 1)).toEqual('28.3');
      expect($filter('formatNumber')(34.98, 1)).toEqual('35.0');
      expect($filter('formatNumber')(-11.65, 1)).toEqual('-11.7');
    });

    it('should return value as it is if it is not numberic', function() {
      expect($filter('formatNumber')('-', 1)).toEqual('-');
    });

    it('should round to nearest value with single digits and international format', function() {
      expect($filter('formatNumber')(28.25, 1, 'international')).toEqual('28,3');
      expect($filter('formatNumber')(-11.65, 1, 'international')).toEqual('-11,7');
    });

    it('should add zeros to digits with overprecision', function() {
      expect($filter('formatNumber')(28.25, 4)).toEqual('28.2500');
      expect($filter('formatNumber')(-11.65, 4)).toEqual('-11.6500');
    });

    it('should add thousands separators', function() {
      expect($filter('formatNumber')(100)).toEqual('100');
      expect($filter('formatNumber')(-100)).toEqual('-100');
      expect($filter('formatNumber')(1000)).toEqual('1,000');
      expect($filter('formatNumber')(-1000)).toEqual('-1,000');
      expect($filter('formatNumber')(100000)).toEqual('100,000');
      expect($filter('formatNumber')(1000000)).toEqual('1,000,000');
    });

    it('should combine thousands separators and digits precision', function() {
      expect($filter('formatNumber')(1000000.249, 2)).toEqual('1,000,000.25');
      expect($filter('formatNumber')(-1000000.249, 2)).toEqual('-1,000,000.25');
      expect($filter('formatNumber')(1000000.249, 4)).toEqual('1,000,000.2490');
    });

    it('should be able to handle exponent format', function() {
      expect($filter('formatNumber')(1.234e5)).toEqual('123,400');
    });
  });

  describe('Order by order property', function(){

    it('should reorder an array by the order object property', function() {
      var startArray = [
        {order: '8699.80042762.0.3343.1'},
        {order: '8699.80042762.0.0.7'},
        {order: '8699.80042762.0.3343.10'}
      ]

      var endArray = [
        {order: '8699.80042762.0.0.7'},
        {order: '8699.80042762.0.3343.1'},
        {order: '8699.80042762.0.3343.10'}
      ]

      var reverseArray = [
        {order: '8699.80042762.0.3343.10'},
        {order: '8699.80042762.0.3343.1'},
        {order: '8699.80042762.0.0.7'}
      ]

      expect($filter('orderByProperty')(startArray)).toEqual(endArray);
      expect($filter('orderByProperty')(startArray)).not.toEqual(reverseArray);

    });
  });

  describe('Replace special characters in a string', function(){
    it('should replace the following special characters with corresponding html entities', function(){
      var string = 'I am a string that should (always) work, 100% of the time. even after #1000 times & *note, even <now>.';
      var newString = 'I am a string that should &#40;always&#41; work, 100&#37; of the time&#46; even after &#35;1000 times &amp; &#42;note, even &lt;now&gt;&#46;'
      expect($filter('replaceSpecialChars')(string)).toEqual(newString);
    })
  })

});
