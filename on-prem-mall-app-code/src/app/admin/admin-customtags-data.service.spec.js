'use strict';

describe('adminCustomTagsData', function () {
  var $httpBackend;
  var stateMock;
  var apiUrl;
  var adminCustomTagsData;
  var callback;
  var orgId;
  var tagId;
  var customTagDataMock;
  var customTagData;
  var url;
  var errorMessage;
  var shouldBeSuperuser;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(function () {

    apiUrl = 'https://api.url';
    orgId = 6245;
    tagId = '588090a9b5e2e5c67787bde0';
    url = apiUrl + '/organizations/' + orgId + '/custom-tags';
    customTagData = null;
    customTagDataMock = null;
    errorMessage = null;
    callback = null;

    callback = {
      success: function (data) {
        customTagData = data;
      },
      failed: function (result) {
        errorMessage = result.data.statusText;
      }
    };

    customTagDataMock = [{
      'name': 'My New Tag',
      '_id': '588090a9b5e2e5c67787bde0',
      'supported_tags': [{
          'name': 'Supported Tag 1',
          '_id': '588090a9b5e2e5c67787bde3'
        },
        {
          'name': 'Supported Tag 2',
          '_id': '588090a9b5e2e5c67787bde2'
        },
        {
          'name': 'Supported Tag 3',
          '_id': '588090a9b5e2e5c67787bde1'
        }
      ]
    }]

    stateMock = {
      go: jasmine.createSpy('go')
    };

    module(function ($provide) {

      $provide.constant('apiUrl', apiUrl);

      $provide.factory('authService', function ($q) {

        var getCurrentUser = jasmine.createSpy('getCurrentUser').and.callFake(function () {
          if (shouldBeSuperuser) {
            return $q.when({
              superuser: true
            });
          } else {
            return $q.when({
              superuser: false
            });
          }
        });

        var hasAdminAccess = jasmine.createSpy('hasAdminAccess').and.callFake(function () {
          return true;
        });

        var isAdminForOrg = jasmine.createSpy('isAdminForOrg').and.callFake(function() { 
          return true;
        });

        return {
          getCurrentUser: getCurrentUser,
          hasAdminAccess: hasAdminAccess,
          isAdminForOrg : isAdminForOrg
        };
      });

      $provide.value('$state', stateMock);
    });

  });

  beforeEach(inject(function (_$httpBackend_,
    _adminCustomTagsData_, _$timeout_) {

    $httpBackend = _$httpBackend_;
    adminCustomTagsData = _adminCustomTagsData_;
  }));

  describe("user is a superuser creating custom tags", function () {
    beforeEach(function () {
      shouldBeSuperuser = true;
    });

    //We nest the rest of these test because they all require the user being a superuser.

    describe('getAllTags - testing call permutations', function () {

      //Success
      it('should call success callback on a successful http request', function () {
       
        $httpBackend.expectGET(url).respond(200, {
          result: customTagDataMock
        });
        
        adminCustomTagsData.getAllTags(orgId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(customTagData)).toEqual(JSON.stringify(customTagDataMock));
      });

      //Fail
      it('should call failed callback on an unsuccessful http request', function () {
       
        $httpBackend.expectGET(url).respond(500, {
          statusText: 'Request has failed.'
        });
        adminCustomTagsData.getAllTags(orgId, callback);
        $httpBackend.flush();

        expect(customTagData).toBe(null);
        expect(errorMessage).toBe('Request has failed.');
      });

      //Params - failed
      it('should throw an error when orgId is undefined or null', function () {
        var expectedError = new Error('getAllTags: orgId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.getAllTags(null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when callback is undefined or null', function () {

        var expectedError = new Error('getAllTags: callback is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.getAllTags(1, null);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

    });

    describe('getTag - testing call permutations', function () {

      //Call Succeed
      it('should call success callback on a successful http request', function () {
        $httpBackend.expectGET(url + '/' + tagId).respond(200, {
          result: customTagDataMock
        });
        adminCustomTagsData.getTag(orgId, tagId, callback);
        $httpBackend.flush();

        expect(JSON.stringify(customTagData.result)).toEqual(JSON.stringify(customTagDataMock));
      });

      //Call failed
      it('should call failed callback on an unsuccessful http request', function () {
        $httpBackend.expectGET(url + '/' + tagId).respond(500, {
          statusText: 'Request has failed.'
        });
        adminCustomTagsData.getTag(orgId, tagId, callback);
        $httpBackend.flush();

        expect(customTagData).toBe(null);
        expect(errorMessage).toBe('Request has failed.');
      });

      //Invalid Params
      it('should throw an error when orgId is undefined or null', function () {
        var expectedError = new Error('getTag: orgId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.getTag(null, tagId, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when tagId is undefined or null', function () {
        var expectedError = new Error('getTag: tagId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.getTag(orgId, null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when callback is undefined or null', function () {
        var expectedError = new Error('getTag: callback is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.getTag(orgId, tagId, null);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

    });

    describe('deleteTag - testing call permutations', function () {

      //Call failed
      it('should call failed callback on an unsuccessful http request', function () {
        $httpBackend.expectDELETE(url + '/' + tagId).respond(500, {
          statusText: 'Request has failed.'
        });
        adminCustomTagsData.deleteTag(orgId, tagId, callback);
        $httpBackend.flush();

        expect(customTagData).toBe(null);
        expect(errorMessage).toBe('Request has failed.');
      });

      //Invalid Params
      it('should throw an error when orgId is undefined or null', function () {
        var expectedError = new Error('deleteTag: orgId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.deleteTag(null, tagId, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when tagId is undefined or null', function () {
        var expectedError = new Error('deleteTag: tag is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.deleteTag(orgId, null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when callback is undefined or null', function () {
        var expectedError = new Error('deleteTag: callback is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.deleteTag(orgId, tagId, null);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });
    });

    describe('updateTag - testing call permutations', function () {

      //Invalid Params
      it('should throw an error when orgId is undefined or null', function () {
        var expectedError = new Error('updateTag: orgId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.updateTag(null, tagId, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when tagId is undefined or null', function () {
        var expectedError = new Error('updateTag: tagId is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.updateTag(orgId, null, callback);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });

      it('should throw an error when callback is undefined or null', function () {
        var expectedError = new Error('updateTag: callback is undefined');

        // Jasmine API weirdness
        var functionUnderTest = function () {
          adminCustomTagsData.updateTag(orgId, tagId, null);
        };

        expect(functionUnderTest).toThrow(expectedError);
      });
    });
  });
});
