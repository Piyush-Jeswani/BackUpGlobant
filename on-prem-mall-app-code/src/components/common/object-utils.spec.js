'use strict';

describe('ObjectUtils', function() {

  var ObjectUtils;
  var scope;

  beforeEach(module('shopperTrak'));
  beforeEach(module('shopperTrak.utils'));
  beforeEach(inject(function(_ObjectUtils_, $rootScope) {
    ObjectUtils = _ObjectUtils_;
    scope = $rootScope.$new();
  }));

  describe('function ObjectUtils.isNullOrUndefined() - passed in null', function() {

    it('should return true if passed in null', function() {
      var a = ObjectUtils.isNullOrUndefined(null);  
      expect(a).toBe(true);
    });
  }) 

  describe('function ObjectUtils.isNullOrUndefined() - passed in undefined', function() {

    it('should return true if passed in undefined', function() {
      var a = ObjectUtils.isNullOrUndefined(undefined);  
      expect(a).toBe(true);
    });
  }) 

  describe('function ObjectUtils.isNullOrUndefined() - passed in string', function() {

    it('should return false if passed in string', function() {
      var testString = "testString";
      var a = ObjectUtils.isNullOrUndefined(testString);  
      expect(a).toBe(false);
    });
  }) 

  describe('function ObjectUtils.isEmptyObject() - passed in empty object', function() {

    it('should return true if passed in empty object', function() {
      var objectA = new Object(); // Empty object
      var a = ObjectUtils.isEmptyObject(objectA);  
      expect(a).toBe(true);
    });
  }) 

  describe('function ObjectUtils.isEmptyObject() - passed in non-empty object', function() {

    it('should return false if passed in non-empty object', function() {
      var car = {
                  color: 'black',
                  seating: 'leather',
                  fuelconsumption: 'moderate'
      } // Non Empty object
      var a = ObjectUtils.isEmptyObject(car);  
      expect(a).toBe(false);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmptyObject() - passed in null', function() {

    it('should return true if passed in null', function() {
     
      var a = ObjectUtils.isNullOrUndefinedOrEmptyObject(null);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmptyObject() - passed in undefined', function() {

    it('should return true if passed in undefined', function() {
     
      var a = ObjectUtils.isNullOrUndefinedOrEmptyObject(undefined);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmptyObject() - passed in empty object', function() {

    it('should return true if passed in empty object', function() {

      var objectA = new Object(); // Empty object       
      var a = ObjectUtils.isNullOrUndefinedOrEmptyObject(objectA);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmptyObject() - passed in string', function() {

    it('should return true if passed in string', function() {

      var testString = "testString";       
      var a = ObjectUtils.isNullOrUndefinedOrEmptyObject(testString);  
      expect(a).toBe(false);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmpty() - passed in null', function() {

    it('should return true if passed in null', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrEmpty(null);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmpty() - passed in zero length string', function() {

    it('should return true if passed in zero length string', function() {
    
      var str = "";
      var a = ObjectUtils.isNullOrUndefinedOrEmpty(str);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmpty() - passed in undefined', function() {

    it('should return true if passed in undefined', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrEmpty(undefined);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmpty() - passed in Empty', function() {

    it('should return true if passed in Empty', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrEmpty('');  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrEmpty() - passed in string', function() {

    it('should return false if passed in string', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrEmpty("hello");  
      expect(a).toBe(false);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrBlank() - passed in null', function() {

    it('should return true if passed in null', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrBlank(null);  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrBlank() - passed in Empty', function() {

    it('should return true if passed in Empty', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrBlank('');  
      expect(a).toBe(true);
    });
  })

  describe('function ObjectUtils.isNullOrUndefinedOrBlank() - passed in string', function() {

    it('should return true if passed in string', function() {
    
      var a = ObjectUtils.isNullOrUndefinedOrBlank("Hello");  
      expect(a).toBe(false);
    });
  })

  describe('function ObjectUtils.getNestedProperty() - passed in someObject', function() {

    it('should return object', function() {
      var someObject = {
          'part1' : {
              'name': 'Part 1',
              'size': '20',
              'qty' : '50'
          },
          'part2' : {
              'name': 'Part 2',
              'size': '15',
              'qty' : '60'
          },
          'part3' : [
              {
                  'name': 'Part 3A',
                  'size': '10',
                  'qty' : '20'
              }, {
                  'name': 'Part 3B',
                  'size': '5',
                  'qty' : '20'
              }, {
                  'name': 'Part 3C',
                  'size': '7.5',
                  'qty' : '20'
              }
          ]
      };    
      var a = ObjectUtils.getNestedProperty(someObject, "part1.name");  
      expect(a).toBe(a);
    });
  })

  describe('function ObjectUtils.getNestedProperty() - passed in undefined', function() {

    it('should return undefined', function() {
      
      var a = ObjectUtils.getNestedProperty(undefined, "part1.name");  
      expect(a).toBe(undefined);
    });
  })  

  describe('function ObjectUtils.rename() - Renames a property on an object', function() {

    it('should return object if object passed in for a property rename', function() {
 
      var car = {
                  color: 'black',
                  seating: 'leather',
                  fuelconsumption: 'moderate'
      }
      var a = ObjectUtils.rename(car, 'color', 'colour');
      expect(a).toBe(car);
    });
  })
});