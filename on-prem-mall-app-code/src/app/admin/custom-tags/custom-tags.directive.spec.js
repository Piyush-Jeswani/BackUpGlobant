'use strict';

describe('customTags', function () {
  var $timeout, $state, $rootScope, $scope, $compile, adminCustomTagsData, ObjectUtils;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_, _$state_, _$timeout_, _ObjectUtils_, _$compile_, _adminCustomTagsData_) {
    $timeout = _$timeout_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    adminCustomTagsData = _adminCustomTagsData_;
    ObjectUtils = _ObjectUtils_;
  }));

  describe('directive instantiation', function () {
    it('should call directive constructor and activate()', function () {
      spyOn(adminCustomTagsData, 'getAllTags').and.callThrough();
      $state.params.orgId = 1001;

      var vm = renderDirectiveAndDigest();

      expect(vm.id).toEqual(1001);
      expect(adminCustomTagsData.getAllTags).toHaveBeenCalled();
      expect(vm.customTags).toEqual([]);
    });
  });

  describe('editCustomTagItem(index)', function () {
    it('should call editCustomTagItem(index) successfully with index 0', function () {
      var vm = renderDirectiveAndDigest();

      var index = 0;
      vm.editCustomTagItem(index);

      expect(vm.customTagMode).toEqual('Modify');
      expect(vm.customTagIndex).toEqual(index);
      expect(vm.customTag).toEqual(vm.customTags[index]);
    });
  });

  describe('addCustomTag()', function () {
    it('should call addCustomTag() successfully', function () {
      var vm = renderDirectiveAndDigest();

      vm.addCustomTag();

      expect(vm.customTagMode).toEqual('Create');
    });
  });

  describe('updateCustomTag(tag, index)', function () {
    it('should call updateCustomTag(tag, index) successfully for index 0', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'updateTag').and.callThrough();

      var vm = renderDirectiveAndDigest();

      var index = 0;
      var tag = 'South-East';
      vm.id = 10;
      vm.updateCustomTag(tag, index);

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalledWith(index);
      expect(adminCustomTagsData.updateTag).toHaveBeenCalled();
    });
  });

  describe('updateCustomTag(tag, index)', function () {
    it('should call updateCustomTag(tag, index) successfully for index undefined', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'addTag').and.callThrough();

      var vm = renderDirectiveAndDigest();

      var tag = 'South-East';
      vm.id = 10;
      vm.updateCustomTag(tag);

      // index is undefined
      var index = undefined;
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalledWith(index);
      expect(adminCustomTagsData.addTag).toHaveBeenCalled();
      expect(vm.customTags).toEqual([]);
    });
  });

  describe('reverseTable()', function () {
    it('should call reverseTable() successfully', function () {
      var vm = renderDirectiveAndDigest();

      vm.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      vm.reverseTable();

      expect(vm.sortReverse).toEqual(true);
      expect(vm.customTags[0]).toEqual({ name: 'North-West', orgTagType: 'y' });
      expect(vm.customTags[1]).toEqual({ name: 'North-East', orgTagType: 'x' });
    });
  });

  describe('showDeleteCustomTagModal(index)', function () {
    it('should call showDeleteCustomTagModal(index) successfully for index 0', function () {
      var vm = renderDirectiveAndDigest();

      var index = 0;

      vm.showDeleteCustomTagModal(index);

      expect(vm.customTagDeleteIndex).toEqual(index);
    });
  });

  describe('deleteCustomTagItem()', function () {
    it('should call deleteCustomTagItem() successfully', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'deleteTag').and.callThrough();

      var vm = renderDirectiveAndDigest();

      vm.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];
      vm.customTagDeleteIndex = 1;
      vm.id = 10;

      vm.deleteCustomTagItem();

      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalledWith(vm.customTags[vm.customTagDeleteIndex]);
      expect(adminCustomTagsData.deleteTag).toHaveBeenCalled();
      expect(vm.customTagDeleteIndex).toEqual(null);
      expect(vm.customTags.length).toEqual(1);
      expect(vm.customTags[0].name).toEqual('North-East');
      expect(vm.customTags[0].orgTagType).toEqual('x');
    });
  });

  describe('uploadCustomTags(files)', function () {
    it('should call uploadCustomTags(files) successfully for csv files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'uploadCustomTags').and.callThrough();

      var vm = renderDirectiveAndDigest();

      var files = [{ name: '1.csv' },
      { name: '2.csv' }
      ];

      $state.params.orgId = 10;
      vm.uploadCustomTags(files);

      expect(vm.tagImportFailed).toEqual(false);
      expect(vm.loading).toEqual(true);
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalledWith(files);
      expect(adminCustomTagsData.uploadCustomTags).toHaveBeenCalled();
    });
  });

  describe('uploadCustomTags(files)', function () {
    it('should call uploadCustomTags(files) successfully for non csv files', function () {
      spyOn(ObjectUtils, 'isNullOrUndefined').and.callThrough();
      spyOn(adminCustomTagsData, 'uploadCustomTags').and.callThrough();

      var vm = renderDirectiveAndDigest();

      var files = [{ name: '1.txt' },
      { name: '2.txt' }
      ];

      $state.params.orgId = 10;
      vm.uploadCustomTags(files);

      expect(vm.tagImportFailed).toEqual(false);
      expect(vm.loading).toEqual(undefined);
      expect(ObjectUtils.isNullOrUndefined).toHaveBeenCalledWith(files);
      expect(adminCustomTagsData.uploadCustomTags).not.toHaveBeenCalled();
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    var vm = element.isolateScope().vm;
    return vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<custom-tags ' +
      '></custom-tags>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'app/admin/custom-tags/custom-tags.partial.html',
      '<div></div>'
    );
  }

});