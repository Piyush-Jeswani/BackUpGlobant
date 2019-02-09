'use strict';

var operatingHoursService;

describe('operatingHoursService', function () {
  beforeEach(module('shopperTrak'));

  beforeEach(inject(function (_operatingHoursService_) {
    operatingHoursService = _operatingHoursService_;
  }));

  describe('getCompareMode and setCompareMode', function() {
    it('should set the compareMode', function() {
      operatingHoursService.setCompareMode(0);
      expect(operatingHoursService.getCompareMode()).toBe(0);
    });
  });

  describe('getOperatingHoursSetting', function() {
    it('should be exposed', function() {
      expect(typeof operatingHoursService.getOperatingHoursSetting).toBe('function');
    });

    it('should throw an error if the stateParams are not provided', function() {
      var expectedError = new Error('stateParams is required');
      
      var functionUnderTest = function () {
        operatingHoursService.getOperatingHoursSetting();
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should throw an error if the stateParams are not provided', function() {
      var expectedError = new Error('organization is required');
      
      var functionUnderTest = function () {
        operatingHoursService.getOperatingHoursSetting({});
      };

      expect(functionUnderTest).toThrow(expectedError);
    });

    it('should return true if the overrideOperatingHours has been set to true', function() {
      var fakeStateParams = {
        businessDays: 'true'
      };

      var fakeOrg = { };

      operatingHoursService.setOperatingHours(true);

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(true);
    });

    it('should return false if stateParams.businessDays is true', function() {
      var fakeStateParams = {
        businessDays: 'true'
      };

      var fakeOrg = { };

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(false);
    });

    it('should return true if stateParams.businessDays is false', function() {
      var fakeStateParams = {
        businessDays: 'false'
      };

      var fakeOrg = { };

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(true);
    });

    it('should return true if stateParams.businessDays is undefined and the org.operating_hours is true', function() {
      var fakeStateParams = { };

      var fakeOrg = { operating_hours: true };

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(true);
    });

    it('should return false if stateParams.businessDays is undefined and the org.operating_hours is false', function() {
      var fakeStateParams = { };

      var fakeOrg = { operating_hours: false };

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(false);
    });

    it('should return a default value of true if stateParams.businessDays is undefined and org.operating_hours is undefined', function() {
      var fakeStateParams = { };
      
      var fakeOrg = { };

      var operatingHours = operatingHoursService.getOperatingHoursSetting(fakeStateParams, fakeOrg);

      expect(operatingHours).toBe(true);
    });
  });
});