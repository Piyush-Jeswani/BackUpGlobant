'use strict';

describe('AdminOrgEditController', function () {
  var $scope,
    $controller,
    $state,
    $timeout,
    $anchorScroll = function () { },
    $q,
    $filter,
    ObjectUtils,
    adminCustomTagsData,
    organization,
    editOrg;

  var adminOrganizationsData = {
    getOrganization: function (orgId, status) {
      angular.noop(orgId);
      angular.noop(status);

      var deferred = $q.defer();
      deferred.resolve(organization);
      return deferred.promise;
    },
    getOrganizationCalendars: function (orgId) {
      angular.noop(orgId);

      var deferred = $q.defer();
      var calendars = {};
      deferred.resolve(calendars);
      return deferred.promise;
    },
    updateSettings: function (orgId, params) {
      angular.noop(orgId);
      angular.noop(params);

      var deferred = $q.defer();
      deferred.resolve(editOrg);
      return deferred.promise;
    }
  };

  var controller;

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function ($rootScope, _$controller_, _$filter_, _$state_, _ObjectUtils_, _$q_, _$timeout_, _adminCustomTagsData_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    ObjectUtils = _ObjectUtils_;
    $q = _$q_;
    $timeout = _$timeout_;
    $filter = _$filter_;
    adminCustomTagsData = _adminCustomTagsData_;

    // Prevent accidentally using the same controller
    // instance in multiple it-blocks.
    controller = null;

    organization = {
      organization_id: 10,
      name: 'MetrcoPCS',
      type: 'Mall',
      default_calendar_id: 1,
      localization: { time_format: 'YYYY-MMM-DD h:mm A' },
      refresh_status: { status: 'refreshing' },
      status_subscriptions: ['Traffic', 'Sales']
    };
  }));

  describe('Controller instantiation', function () {
    it('should call activate() successfully for adminUIUpgrade false', function () {
      instantiateController();

      $timeout.flush();
      $scope.$digest();

      expect(controller.saveSuccessful).toEqual(false);
      expect(controller.saveFailed).toEqual(false);
      expect(controller.errorMessage).toEqual('');
      expect(controller.successMessage).toEqual('');
      expect(controller.onlyPositiveNumbers).toEqual(/^\d+$/);
      expect(controller.refreshState).toEqual('refreshing...');
      expect(controller.loading).toEqual(false);
      expect(controller.showExtraTags).toEqual([]);
      expect(controller.deleteMessage).toEqual('Deleting tags at the Organisation level will also delete these tags at Site level.');
      expect(controller.csvImportErrorMessage).toEqual('');
      expect(controller.csvImportDownloadErrors).toEqual(false);
      expect(controller.miAdmin).toEqual(true);
      expect(controller.dateFormat.items[0]).toEqual({
        value: 'M/D/YY',
        label: 'M/D/YY (' + $filter('date')(Date.now(), 'M/d/yy') + ')'
      });
      expect(controller.dateFormat.items[1]).toEqual({
        value: 'DD/MM/YYYY',
        label: 'DD/MM/YYYY (' + $filter('date')(Date.now(), 'dd/MM/yyyy') + ')'
      });
      expect(controller.timeFormat.items[0]).toEqual({
        value: '12',
        label: '12 Hour'
      });
      expect(controller.timeFormat.items[1]).toEqual({
        value: '24',
        label: '24 Hour'
      });

      expect(controller.id).toEqual(10);
      expect(controller.name).toEqual('MetrcoPCS');
      expect(controller.default_calendar_id).toEqual(1);
      expect(controller.status_subscriptions).toEqual(['Traffic', 'Sales']);
    });
  });

  describe('Controller instantiation', function () {
    it('should call activate() successfully for adminUIUpgrade true', function () {
      controller = $controller('AdminOrgEditController', {
        '$scope': $scope,
        '$state': $state,
        '$anchorScroll': $anchorScroll,
        'adminOrganizationsData': adminOrganizationsData,
        'currentAdminOrganization': {},
        'features': {
          isEnabled: function (adminUIUpgrade) {
            angular.noop(adminUIUpgrade);
            return true;
          }
        }
      });

      // Emulate the 'controllerAs' syntax:
      $scope.vm = controller;

      $timeout.flush();
      $scope.$digest();

      expect(controller.adminUIUpgrade).toEqual(true);
    });
  });


  describe('refresh()', function () {
    it('should call refresh() successfully when refresh_status is refreshing', function () {
      instantiateController();

      controller.refresh();

      $timeout.flush();
      $scope.$digest();

      expect(controller.saveSuccessful).toEqual(false);
      expect(controller.saveFailed).toEqual(false);
      expect(controller.errorMessage).toEqual('');
      expect(controller.successMessage).toEqual('');
      expect(controller.onlyPositiveNumbers).toEqual(/^\d+$/);
      expect(controller.refreshState).toEqual('refreshing...');
      expect(controller.loading).toEqual(false);
      expect(controller.showExtraTags).toEqual([]);
      expect(controller.deleteMessage).toEqual('Deleting tags at the Organisation level will also delete these tags at Site level.');
      expect(controller.csvImportErrorMessage).toEqual('');
      expect(controller.csvImportDownloadErrors).toEqual(false);
      expect(controller.miAdmin).toEqual(true);
      expect(controller.dateFormat.items[0]).toEqual({
        value: 'M/D/YY',
        label: 'M/D/YY (' + $filter('date')(Date.now(), 'M/d/yy') + ')'
      });
      expect(controller.dateFormat.items[1]).toEqual({
        value: 'DD/MM/YYYY',
        label: 'DD/MM/YYYY (' + $filter('date')(Date.now(), 'dd/MM/yyyy') + ')'
      });
      expect(controller.timeFormat.items[0]).toEqual({
        value: '12',
        label: '12 Hour'
      });
      expect(controller.timeFormat.items[1]).toEqual({
        value: '24',
        label: '24 Hour'
      });

      expect(controller.id).toEqual(10);
      expect(controller.name).toEqual('MetrcoPCS');
      expect(controller.default_calendar_id).toEqual(1);
      expect(controller.status_subscriptions).toEqual(['Traffic', 'Sales']);
    });
  });

  describe('saveChanges(dwellTimeForm)', function () {
    it('should call saveChanges(dwellTimeForm) successfully selected calendar format and subscriptions', function () {
      spyOn(adminOrganizationsData, 'updateSettings').and.callThrough();

      instantiateController();

      var dwellTimeForm = { $valid: true };
      var powerHoursForm = { $valid: true };
      controller.calendarFormat = { selectedItem: 6 };
      controller.subscriptions = ['Traffic', 'Sales'];
      $state.reload = function () { };

      controller.saveChanges(dwellTimeForm, powerHoursForm);

      expect(controller.saveSuccessful).toEqual(false);
      expect(controller.saveFailed).toEqual(false);
      expect(controller.errorMessage).toEqual('');
      expect(controller.successMessage).toEqual('');
      expect(controller.onlyPositiveNumbers).toEqual(/^\d+$/);
      expect(controller.refreshState).toEqual('');
      expect(controller.loading).toEqual(false);
      expect(controller.showExtraTags).toEqual([]);
      expect(controller.deleteMessage).toEqual('Deleting tags at the Organisation level will also delete these tags at Site level.');
      expect(controller.csvImportErrorMessage).toEqual('');
      expect(controller.csvImportDownloadErrors).toEqual(false);
      expect(controller.miAdmin).toEqual(true);
      expect(controller.dateFormat.items[0]).toEqual({
        value: 'M/D/YY',
        label: 'M/D/YY (' + $filter('date')(Date.now(), 'M/d/yy') + ')'
      });
      expect(controller.dateFormat.items[1]).toEqual({
        value: 'DD/MM/YYYY',
        label: 'DD/MM/YYYY (' + $filter('date')(Date.now(), 'dd/MM/yyyy') + ')'
      });
      expect(controller.timeFormat.items[0]).toEqual({
        value: '12',
        label: '12 Hour'
      });
      expect(controller.timeFormat.items[1]).toEqual({
        value: '24',
        label: '24 Hour'
      });

      expect(controller.id).toEqual(undefined);
      expect(controller.name).toEqual(undefined);
      expect(controller.default_calendar_id).toEqual(undefined);
      expect(controller.status_subscriptions).toEqual(undefined);

      expect(adminOrganizationsData.updateSettings).toHaveBeenCalled();
    });
  });

  describe('cancel()', function () {
    it('should call cancel() successfully', function () {
      var $stateMock = {
        go: jasmine.createSpy('go'),
        params:{
          orgId: 3068
        },
        current: {
          name: 'admin.organizations.add'
        }
      };

      controller = $controller('AdminOrgEditController', {
        '$scope': $scope,
        '$state': $stateMock,
        '$anchorScroll': $anchorScroll,
        'adminOrganizationsData': adminOrganizationsData,
        'currentAdminOrganization': {}
      });

      // Emulate the 'controllerAs' syntax:
      $scope.vm = controller;

      controller.cancel();

      expect($stateMock.go).toHaveBeenCalled();
    });
  });

  describe('showDeleteCustomTagModal(index)', function () {
    it('should call showDeleteCustomTagModal(index) successfully for index 0', function () {
      instantiateController();

      var index = 0;
      controller.showDeleteCustomTagModal(index);

      expect(controller.customTagDeleteIndex).toEqual(index);
    });
  });

  describe('editCustomTagItem()', function () {
    it('should call editCustomTagItem() successfully', function () {
      instantiateController();

      var index = 0;
      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      controller.editCustomTagItem(index);

      expect(controller.customTagMode).toEqual('Modify');
      expect(controller.customTagIndex).toEqual(index);
      expect(controller.customTag).toEqual(controller.customTags[index]);
    });
  });

  describe('addCustomTag()', function () {
    it('should call addCustomTag() successfully', function () {
      instantiateController();

      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      controller.addCustomTag();

      expect(controller.customTagMode).toEqual('Create');
    });
  });

  describe('updateTag()', function () {
    it('should call updateTag() successfully with index set to 0', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'updateTag').and.callThrough();

      instantiateController();

      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      var index = 0;
      var tag = 'South-East';
      controller.id = 10;
      controller.updateTag(tag, index);

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect(adminCustomTagsData.updateTag).toHaveBeenCalled();
    });
  });

  describe('updateTag()', function () {
    it('should call updateTag() successfully with undefined index', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'addTag').and.callThrough();

      instantiateController();

      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      var tag = 'South-East';
      controller.id = 10;
      controller.updateTag(tag);

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect(adminCustomTagsData.addTag).toHaveBeenCalled();
    });
  });

  describe('reverseTable()', function () {
    it('should call reverseTable() successfully', function () {
      instantiateController();

      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      controller.reverseTable();

      expect(controller.sortReverse).toEqual(true);
      expect(controller.customTags[0]).toEqual({ name: 'North-West', orgTagType: 'y' });
      expect(controller.customTags[1]).toEqual({ name: 'North-East', orgTagType: 'x' });
    });
  });

  describe('goToMiSubscription()', function () {
    it('should call goToMiSubscription() successfully', function () {
      var $stateMock = {
        go: jasmine.createSpy('go'),
        params:{
          orgId: 3068
        },
        current: {
          name: 'admin.organizations'
        }
      };

      controller = $controller('AdminOrgEditController', {
        '$scope': $scope,
        '$state': $stateMock,
        '$anchorScroll': $anchorScroll,
        'adminOrganizationsData': adminOrganizationsData,
        'currentAdminOrganization': {}
      });

      // Emulate the 'controllerAs' syntax:
      $scope.vm = controller;

      controller.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      var obj = { status: 'active' };
      var val = 6;
      controller.goToMiSubscription(val, obj);

      expect($stateMock.go).toHaveBeenCalled();
      expect($state.current.name).toEqual('');
    });
  });

  describe('uploadCustomTags(files)', function () {
    it('should call uploadCustomTags(files) successfully for csv files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'uploadCustomTags').and.callThrough();

      instantiateController();

      var files = [{ name: '1.csv' },
      { name: '2.csv' }
      ];

      $state.params.orgId = 10;
      controller.uploadCustomTags(files);

      expect(controller.tagImportFailed).toEqual(false);
      expect(controller.loading).toEqual(true);
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect(adminCustomTagsData.uploadCustomTags).toHaveBeenCalled();
    });
  });

  describe('uploadCustomTags(files)', function () {
    it('should call uploadCustomTags(files) successfully for non csv files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'uploadCustomTags').and.callThrough();

      instantiateController();

      var files = [{ name: '1.txt' },
      { name: '2.txt' }
      ];

      $state.params.orgId = 10;
      controller.uploadCustomTags(files);

      expect(controller.tagImportFailed).toEqual(false);
      expect(controller.loading).toEqual(false);
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalled();
      expect(adminCustomTagsData.uploadCustomTags).not.toHaveBeenCalled();
    });
  });

  describe('setPowerHoursThresholds', function() {
    it('should return the default power hours thresholds if the power_hours_thresholds does not exist on the org', function() {
      instantiateController();
      $timeout.flush();
      expect(controller.powerHoursLower).toBe(0.5);
      expect(controller.powerHoursUpper).toBe(1.5);
    });

    it('should lift the power hours settings from the org object if power_hours_thresholds exists and multiply it by 100', function() {
      organization.power_hours_thresholds = {
        lower: 0.1,
        upper: 0.2
      };

      instantiateController();
      $timeout.flush();
      expect(controller.powerHoursLower).toBe(10);
      expect(controller.powerHoursUpper).toBe(20);
    });

    it('should default the lower threshold if it is not set', function() {
      organization.power_hours_thresholds = {
        upper: 0.2
      };

      instantiateController();
      $timeout.flush();
      expect(controller.powerHoursLower).toBe(0.5);
      expect(controller.powerHoursUpper).toBe(20);
    });

    it('should default the upper threshold if it is not set', function() {
      organization.power_hours_thresholds = {
        lower: 0.2
      };

      instantiateController();
      $timeout.flush();
      expect(controller.powerHoursLower).toBe(20);
      expect(controller.powerHoursUpper).toBe(1.5);
    });
  });

  function instantiateController() {
    controller = $controller('AdminOrgEditController', {
      '$scope': $scope,
      '$state': $state,
      '$anchorScroll': $anchorScroll,
      'adminOrganizationsData': adminOrganizationsData,
      'currentAdminOrganization': {}
    });

    // Emulate the 'controllerAs' syntax:
    $scope.vm = controller;
  }
});
