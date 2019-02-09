'use strict';

describe('MallCheckService', function() {

  var MallCheckService;

  beforeEach(module('shopperTrak'));
  beforeEach(inject(function(_MallCheckService_) {
    MallCheckService = _MallCheckService_;
  }));

  describe('isNotMall', function() {


    it('should return false for Mall org', function() {

      var organizationMock = {
        portal_settings: {
          organization_type: 'Mall'
        }
      };

      var result = MallCheckService.isNotMall(organizationMock);

      expect(result).toEqual(false);

    });

    it('should return false for Mall site type', function() {

      var siteMock = {
        type: 'Mall'
      };

      var ZoneMock = null;

      var result = MallCheckService.isNotMall(siteMock, ZoneMock);

      expect(result).toEqual(false);

    });

    it('should return true for Mall site type if zone type is TenantCommon', function() {

      var siteMock = {
        type: 'Mall'
      };

      var ZoneMock = {
        type: 'TenantCommon'
      };

      var result = MallCheckService.isNotMall(siteMock, ZoneMock)

      expect(result).toEqual(true);
    });


    it('should return true for non Mall org', function() {

      var organizationMock = {
        portal_settings: {
          organization_type: 'NOT Mall'
        }
      };

      var result = MallCheckService.isNotMall(organizationMock);

      expect(result).toEqual(true);

    });

    it('should return true for non Mall site type', function() {

      var siteMock = {
        type: 'NOT Mall'
      };

      var ZoneMock = null;

      var result = MallCheckService.isNotMall(siteMock, ZoneMock);

      expect(result).toEqual(true);

    });


    it('should return true for non Mall site type if zone type is not TenantCommon', function() {

      var siteMock = {
        type: 'NOT Mall'
      };

      var ZoneMock = {
        type: 'NOT TenantCommon'
      };

      var result = MallCheckService.isNotMall(siteMock, ZoneMock);

      expect(result).toEqual(true);
    });

    it('should return false for Mall site type if zone type is not TenantCommon', function() {

      var siteMock = {
        type: 'Mall'
      };

      var ZoneMock = {
        type: 'NOT TenantCommon'
      };

      var result = MallCheckService.isNotMall(siteMock, ZoneMock);

      expect(result).toEqual(false);
    });


  });


});
