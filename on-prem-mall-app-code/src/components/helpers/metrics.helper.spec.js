
'use strict';
describe('metricsHelper', function () {

  // Test data
  var areNumbers = [
      [0, 0],
      [1, 0],
      [1.1, 1],
      [1.01, 2],
      [1.001, 3],
      [1.0001, 4],
      [1.00001, 5],
      [1.000001, 6],
      [1.0000001, 7],
      [1.00000001, 8],
      [1.000000001, 9],
      [1.0000000001, 10],
      [1.00000000001, 11],
      [1.000000000001, 12],
      [1.0000000000001, 13],
      [1.00000000000001, 14],
      [1.000000000000001, 15], // 1.00000000000001,
      [0.000000000000001, 15], // 1e-15,
      [10.00000000000001, 14], //10.00000000000001
      [127.00000000000001, 14], //127.00000000000001
      [9007199254740991, 0], // = Number.MAX_SAFE_INTEGER  
      [-0, 0],
      [-1, 0],
      [-1.1, 1],
      [-1.01, 2],
      [-1.001, 3],
      [-1.0001, 4],
      [-1.00001, 5],
      [-1.000001, 6],
      [-1.0000001, 7],
      [-1.00000001, 8],
      [-1.000000001, 9],
      [-1.0000000001, 10],
      [-1.00000000001, 11],
      [-1.000000000001, 12],
      [-1.0000000000001, 13],
      [-1.00000000000001, 14],
      [-1.000000000000001, 15], // -1.000000000000001,
      [-0.000000000000001, 15], // -1e-15,
      [-10.00000000000001, 14], //-10.00000000000001
      [-127.00000000000001, 14], //-127.00000000000001
      [-9007199254740991, 0] // = Number.MIN_SAFE_INTEGER  
    ];
var notNumbers = [ null, undefined, true, false, NaN, {}, [] ];

var stringNumbers = ['300', '300.1'];


  // External test data
  var randomNumbers;
  var randomNumbersRounded;
  var dividedNumbers;
  var dividedNumbersRounded;
  var metrics;
  var metricsLookup;
  beforeEach(function() {
    randomNumbers = getServedJSON('_randomNumbers.json').data;
    randomNumbersRounded = getServedJSON('_randomNumbersRounded.json').data;
    dividedNumbers = getServedJSON('_dividedNumbers.json').data;
    dividedNumbersRounded = getServedJSON('_dividedNumbersRounded.json').data;
    metrics = getServedJSON('metricsHelper-metrics.json').data;
    metricsLookup = getServedJSON('metricsHelper-metricsLookup.json').data;
  });


  // Module dependencies
  beforeEach(module('shopperTrak'));
  var metricsHelper;
  beforeEach(inject(function (_metricsHelper_) { metricsHelper = _metricsHelper_; }));
  var ObjectUtils;
  beforeEach(inject(function (_ObjectUtils_) { ObjectUtils = _ObjectUtils_; }));



  describe('getDecimalPlacesLength', function(){
    it('should correctly return the number of decimal places in a number', function(){
      var result;
      areNumbers.forEach(function(value){
        result = metricsHelper.getDecimalPlacesLength(value[0]);
        expect(result).toEqual(value[1]);
      });
    });
  });

  describe('getRoundedNumber', function(){
    it('should correctly round numbers to specified decimal place', function(){
      randomNumbersRounded.forEach(function(values){
        var result;
        var iterationCount = 0;
        while (iterationCount < 15) {
          iterationCount++;
          result = metricsHelper.getRoundedNumber(values[0], 15 - iterationCount);
          expect(result).toBe(values[iterationCount]);
        }
      });
    });
  });

  describe('getValidNumber', function(){
    it('should always return a real number', function(){
      areNumbers.forEach(function(value){
        var result = metricsHelper.getValidNumber(value[0]);
        expect(result).toBe(value[0]);
      });
      notNumbers.forEach(function(value){
        var result = metricsHelper.getValidNumber(value);
        expect(result).toBe(0);
      });
      stringNumbers.forEach(function(value){
        var result = metricsHelper.getValidNumber(value);
        expect(result).toBe(Number(value));
      });
    });
  });

  describe('getStar', function(){
    it('should return a whole rounded number', function(){
      dividedNumbers.forEach(function(value){
        var result = metricsHelper.getStar(value[0], value[1]);
        expect(result).toBe(parseFloat(value[2].toFixed()));
      });
    });
  });

  describe('getAts', function(){
    it('should return a number', function(){
      dividedNumbers.forEach(function(value){
        var result = metricsHelper.getAts(value[0], value[1]);
        expect(result).toBe(value[2]);
      });
    });
  });

  describe('getConversion', function(){
    it('should return a number', function(){
      dividedNumbers.forEach(function(value){
        var result = metricsHelper.getConversion(value[1], value[0]);
        expect(result).toBe(value[2] * 100);
      });
    });
  });

  describe('getSps', function(){
    it('should return a number', function(){
      dividedNumbers.forEach(function(value){
        var result = metricsHelper.getSps(value[0], value[1]);
        expect(result).toBe(value[2]);
      });
    });
  });

  describe('getSplh', function(){
    it('should return a number', function(){
      dividedNumbers.forEach(function(value){
        var result = metricsHelper.getSplh(value[0], value[1]);
        expect(result).toBe(value[2]);
      });
    });
  });

  describe('getMetricValue', function(){
    it('should return a number from an api result item object', function(){
      var metricObj = {
        someProperty : 90.4323523523
      };

      var result = metricsHelper.getMetricValue(metricObj, 'someProperty');
      expect(result).toBe(90.4323523523);

      result = metricsHelper.getMetricValue(metricObj,'nonExistantProperty');
      expect(result).toBe(0);
    });
  });


  //** Helper function to get .json files served by Karma */
  function getServedJSON(filename) {
    var providerName = filename.replace('.json', '');
    providerName = providerName.replace(/-([a-z])/g, function(s){ return s.toUpperCase()[1]; });
    providerName = providerName[0].toUpperCase() + providerName.slice(1);
    if (filename[0] === '_') {
      providerName = '/' + providerName; // to match ngJs2Json naming
    }
    providerName = 'served' + providerName;
    return angular.injector(['ng', 'served/'+ filename ]).get(providerName);
  }

});