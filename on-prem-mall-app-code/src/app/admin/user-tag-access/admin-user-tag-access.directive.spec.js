'use strict';

describe('adminUserTagAccess', function () {
  var $timeout, $state, $rootScope, $scope, $compile, adminCustomTagsData, ObjectUtils, adminUsersData;
  var currentUser = { accessMap: { setup: { tags: 'x' } } };

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_, _$state_, _$timeout_, _ObjectUtils_, _$compile_, _adminCustomTagsData_, _adminUsersData_) {
    $timeout = _$timeout_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;
    adminCustomTagsData = _adminCustomTagsData_;
    ObjectUtils = _ObjectUtils_;
    adminUsersData = _adminUsersData_;
  }));

  describe('directive instantiation', function () {
    it('should call directive constructor and activate() with vm.enabled set to false and vm.edit set to edit', function () {
      spyOn(adminCustomTagsData, 'getAllTags').and.callThrough();
      spyOn(adminUsersData, 'getOrgUsers').and.callThrough();

      $state.params.orgId = 1010;
      $scope.enabled = false;
      $scope.mode = 'edit';

      var vm = renderDirectiveAndDigest();

      expect(vm.orgId).toEqual($state.params.orgId);
      expect(vm.loading).toEqual(true);
      expect(vm.enabled).toEqual(false);
      expect(vm.mode).toEqual('edit');
      expect(vm.available).toEqual([]);
      expect(vm.customTags).toEqual([]);
      expect(vm.chosenSelectedCustomTags).toEqual([]);
      expect(vm.chosenCustomTags).toEqual([]);
      expect(vm.selectedCustomTags).toEqual([]);
      expect(vm.availableTagSearch).toEqual('');
      expect(vm.chosenTagSearch).toEqual('');
      expect(adminCustomTagsData.getAllTags).toHaveBeenCalled();
      expect(adminUsersData.getOrgUsers).toHaveBeenCalled();
    });
  });

  describe('add()', function () {
    it('should call add() successfully for current user', function () {
      spyOn($rootScope, '$broadcast').and.callThrough();
      var vm = renderDirectiveAndDigest();

      vm.user = currentUser;
      vm.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];

      vm.add();

      expect(vm.user.accessMap.setup.tags).toEqual([]);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('custom-tag-access-changed');
      expect(vm.customTags).toEqual([{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }]);
    });
  });

  describe('remove()', function () {
    it('should call remove() successfully for current user', function () {
      spyOn($rootScope, '$broadcast').and.callThrough();
      var vm = renderDirectiveAndDigest();

      vm.user = currentUser;
      vm.customTags = [{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }];

      vm.remove();

      expect(vm.user.accessMap.setup.tags).toEqual([]);
      expect($rootScope.$broadcast).toHaveBeenCalledWith('custom-tag-access-changed');
      expect(vm.customTags).toEqual([{ name: 'North-East', orgTagType: 'x' }, { name: 'North-West', orgTagType: 'y' }]);
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
      '<admin-user-tag-access ' +
      'user="user" ' +
      'enabled="enabled" ' +
      'mode="mode" ' +
      '></admin-user-tag-access>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'app/admin/user-tag-access/admin-user-tag-access.partial.html',
      '<div></div>'
    );
  }
});