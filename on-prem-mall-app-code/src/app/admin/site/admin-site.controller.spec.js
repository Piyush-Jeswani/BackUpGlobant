'use strict';

describe('AdminSiteEditController', function () {
  var $scope,
    $controller,
    $state,
    $timeout,
    $anchorScroll = function () { },
    $q,
    ObjectUtils,
    authService,
    adminSiteData;

  var currentOrganizationMock = {
    'organization_id': 123,
    'name': 'Foobar',
    'subscriptions': {
      'advanced': false,
      'campaigns': false,
      'labor': false,
      'sales': false,
      'market_intelligence': false,
      'qlik': false,
      'large_format_mall': true,
      'interior': false,
      'perimeter': true
    }
  };

  var controller;

  var currentSite = {
    'site_id': 1000,
    'organization': {
      'id': 1000
    },
    'type': 'Mall'
  };

  var currentUserMockNoDashBoard = {
    _id:2,
    preferences: {
      calendar_id: 3,
      custom_dashboards: [],
      market_intelligence: { },
      custom_period_1: {
        period_type: 'custom'
      },
      custom_period_2: {
        period_type: 'custom'
      }
    },
    localization: {
      locale: 'en-us',
      date_format:{
        mask: 'dd-mm-yyyy'
      }
    }
  };

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_,_$q_, _$timeout_,_ObjectUtils_,_adminSiteData_,_authService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    ObjectUtils = _ObjectUtils_;
    $q = _$q_;
    $timeout = _$timeout_;
    adminSiteData = _adminSiteData_;
    authService = _authService_;

    // Prevent accidentally using the same controller
    // instance in multiple it-blocks.
    controller = null;
  }));

  beforeEach(function () {
    authService.getCurrentUser = function () {
      var deferred  = $q.defer();
      deferred.resolve(currentUserMockNoDashBoard);
      return deferred.promise;
    }
  });

  beforeEach(function () {
    authService.isAdminForOrg = function (orgId, currentUser) {
      angular.noop(orgId);
      angular.noop(currentUser);

      return true;
    }
  });
  
  describe('Controller instantiation', function () {
    it('should call activate() successfully', function () {
      spyOn(adminSiteData, 'getSiteSettings').and.callThrough();
      spyOn(adminSiteData, 'getCustomTags').and.callThrough();
      spyOn(authService, 'getCurrentUser').and.callThrough();
      spyOn(authService, 'isAdminForOrg').and.callThrough();

      instantiateController();

      $timeout.flush();
      $scope.$digest();

      expect(controller.saveSuccessful).toEqual(false);
      expect(controller.saveFailed).toEqual(false);
      expect(controller.orgTagsExists).toEqual(false);
      expect(controller.errorMessage).toEqual(undefined);
      expect(controller.onlyPositiveNumbers).toEqual(/^\d+$/);
      expect(controller.dirty).toEqual(false);
      expect(controller.sortReverse).toEqual(false);
      expect(controller.deleteMessage).toEqual('');
      expect(controller.siteCustomTags).toEqual([]);

      expect(controller.site_Name).toEqual(currentSite.name);
      expect(controller.org_Id).toEqual(currentSite.organization.id);
      expect(controller.site_Id).toEqual(currentSite.site_id);
      expect(controller.site_Type).toEqual(currentSite.type);

      expect(controller.siteCustomTags).toEqual([]);
      expect(controller.selectedCustomTagValues).toEqual([]);
      expect(controller.tagExists).toEqual(false);

      expect(controller.siteSubscriptions).toEqual(undefined);

      expect(adminSiteData.getSiteSettings).toHaveBeenCalled();
      expect(adminSiteData.getCustomTags).toHaveBeenCalled();
      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(authService.isAdminForOrg).toHaveBeenCalled();
    });
  });

  describe('selectedCustomTagChanged(index)', function () {
    it('should call selectedCustomTagChanged(index) successfully for site and custom tags set', function () {
      instantiateController();

      var index = 0;
      controller.siteCustomTags = [{orgTagType: 'North-East'}, {orgTagType: 'North-West'}];
      controller.customTags = ['Clothing', 'Menswear', 'Ladieswear'];
      controller.selectedCustomTagChanged(index);

      expect(controller.selectedCustomTagValues).toEqual(controller.customTags[0].orgTagValues);
    });
  });

  describe('saveSelectedCustomTag(index)', function () {
    it('should call saveSelectedCustomTag(index) successfully for site and custom tags set', function () {
      spyOn(adminSiteData, 'addCustomTag').and.callThrough();
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();

      instantiateController();

      var index = 0;
      controller.siteCustomTags = [{orgTagType: 'North-East', orgTagValue: 454}, {orgTagType: 'North-West', orgTagValue: 900}];
      controller.customTags = ['Clothing', 'Menswear', 'Ladieswear'];
      controller.saveSelectedCustomTag(index);

      expect(adminSiteData.addCustomTag).toHaveBeenCalled();
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
    });
  });

  describe('saveChanges()', function () {
    it('should call saveChanges() successfully', function () {
      spyOn(adminSiteData, 'updateSiteSettings').and.callThrough();

      instantiateController();

      controller.saveChanges();

      expect(adminSiteData.updateSiteSettings).toHaveBeenCalled();
    });
  });
  
  describe('addSiteCustomTag()', function () {
    it('should call addSiteCustomTag() successfully for site and custom tags set', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();

      instantiateController();

      controller.siteCustomTags = [{orgTagType: 'North-East', orgTagValue: 454}, {orgTagType: 'North-West', orgTagValue: 900}];
      controller.customTags = ['Clothing', 'Menswear', 'Ladieswear'];      
      controller.addSiteCustomTag();

      expect(controller.tagExists).toEqual(false);
      expect(controller.siteCustomTags.length).toEqual(3);
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();

      var item = controller.siteCustomTags.pop();
      expect(item.orgTagType).toEqual(null);
      expect(item.orgTagValues).toEqual(null);
      expect(item._id).toEqual(undefined);
      expect(item.siteCustomTagEditMode).toEqual(true);      
    });
  });

  describe('showSiteCustomTagDeleteModal(index)', function () {
    it('should call showSiteCustomTagDeleteModal(index) successfully for site and custom tags set', function () {
      instantiateController();

      var index = 0;
      controller.showSiteCustomTagDeleteModal(index);
 
      expect(controller.deleteIndex).toEqual(index); 
    });
  });

  describe('confirmSiteDeleteTag()', function () {
    it('should call confirmSiteDeleteTag() successfully', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminSiteData, 'deleteCustomTag').and.callThrough();

      instantiateController();

      var index = 1;
      controller.siteCustomTags = [{orgTagType: 'North-East', orgTagValue: 454}, {orgTagType: 'North-West', orgTagValue: 900}];
      controller.customTags = ['Clothing', 'Menswear', 'Ladieswear'];
      controller.deleteIndex = index;
      controller.confirmSiteDeleteTag();
 
      expect(controller.deleteIndex).toEqual(index);
      expect(controller.tagExists).toEqual(false);
      expect(adminSiteData.deleteCustomTag).toHaveBeenCalled();
    });
  });

  describe('cancel()', function () {
    it('should call cancel() successfully', function () {
      instantiateController();

      controller.cancel();
 
      expect($state.current.name).toEqual('');
    });
  });
  
  describe('refresh()', function () {
    it('should call refresh() successfully', function () {
      spyOn(adminSiteData, 'getSiteSettings').and.callThrough();
      instantiateController();

      controller.refresh();
 
      expect(adminSiteData.getSiteSettings).toHaveBeenCalled();
    });
  });

  describe('reverseTable()', function () {
    it('should call reverseTable() successfully with siteCustomTags set', function () {
      instantiateController();

      controller.siteCustomTags = [{orgTagType: 'North-East', orgTagValue: 454}, {orgTagType: 'North-West', orgTagValue: 900}];

      controller.reverseTable();

      expect(controller.sortReverse).toEqual(true);
      expect(controller.siteCustomTags.reverse()).toEqual([{ orgTagType: 'North-East', orgTagValue: 454 },
        { orgTagType: 'North-West', orgTagValue: 900 }]);
    });
  });

  describe('uploadOSMFile()', function () {
    it('should call uploadOSMFile() successfully for osm files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn($q, 'all').and.callThrough();

      instantiateController();

      controller.osm = [{ file: { name: '1.osm' }, hasError: true, errorMessage: 'test', successful: 'true' },
      { file: { name: '2.osm' }, hasError: true, errorMessage: 'test', successful: 'true' }
      ];
      controller.uploadOSMFile();

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect($q.all).toHaveBeenCalled();

      expect(controller.osm[0].hasError).toEqual(false);
      expect(controller.osm[0].errorMessage).toEqual('');
      expect(controller.osm[0].successful).toEqual(false);

      expect(controller.osm[1].hasError).toEqual(false);
      expect(controller.osm[1].errorMessage).toEqual('');
      expect(controller.osm[1].successful).toEqual(false);        
    });
    it('should call uploadOSMFile() successfully for non-osm files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn($q, 'all').and.callThrough();

      instantiateController();

      controller.osm = [{ file: { name: '1.txt' }, hasError: true, errorMessage: 'test', successful: true },
      { file: { name: '2.txt' }, hasError: true, errorMessage: 'test', successful: true }
      ];
      controller.uploadOSMFile();

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect($q.all).toHaveBeenCalled();

      expect(controller.osm[0].hasError).toEqual(true);
      expect(controller.osm[0].errorMessage).toEqual('This is not an OSM file');
      expect(controller.osm[0].successful).toEqual(true);

      expect(controller.osm[1].hasError).toEqual(true);
      expect(controller.osm[1].errorMessage).toEqual('This is not an OSM file');
      expect(controller.osm[1].successful).toEqual(true);
    });
  });

  describe('timeoutReset()', function () {
    it('should call timeoutReset() successfully for index 0', function () {
      instantiateController();

      controller.osm = [{ file: { name: '1.txt' }, hasError: true, errorMessage: 'test', successful: true },
      { file: { name: '2.txt' }, hasError: true, errorMessage: 'test', successful: true }
      ];

      var index = 0;
      controller.timeoutReset(index);

      $timeout.flush();
      $scope.$digest();

      expect(controller.osm).toEqual([{ file: { name: '2.txt' }, hasError: true, errorMessage: 'test', successful: true }]);
    });
  });

  describe('success(index)', function () {
    it('should call success(index) successfully for index 0', function () {
      instantiateController();

      controller.osm = [{ file: { name: '1.txt' }, hasError: true, errorMessage: 'test', successful: true },
      { file: { name: '2.txt' }, hasError: true, errorMessage: 'test', successful: true }
      ];

      var index = 0;
      controller.success(index);

      $timeout.flush();
      $scope.$digest();
      
      expect(controller.osm[0].successful).toEqual(true);
      expect(controller.osm).toEqual([{ file: { name: '2.txt' }, hasError: true, errorMessage: 'test', successful: true }]);
    });
  });

  describe('failed(error, index)', function () {
    it('should call failed(error, index) successfully for index 0', function () {
      instantiateController();

      controller.osm = [{ file: { name: '1.txt' }, hasError: false, errorMessage: 'test', successful: false },
      { file: { name: '2.txt' }, hasError: false, errorMessage: 'test', successful: false }
      ];

      var index = 0;
      var error = {data: {message: 'there is an error'}};
      controller.failed(error, index);

      $timeout.flush();
      $scope.$digest();
      
      expect(controller.osm[index].hasError).toEqual(true);
      expect(controller.osm[index].errorMessage).toEqual(error.data.message);
    });
  });

  function instantiateController() {
    controller = $controller('AdminSiteEditController', {
      '$scope': $scope,
      '$state': $state,
      '$anchorScroll': $anchorScroll,
      'currentSite': currentSite,
      'currentOrganization': currentOrganizationMock
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});