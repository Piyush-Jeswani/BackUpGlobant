'use strict';

describe('salesCategoriesSelector', function () {

  var $rootScope;
  var $scope;
  var $compile;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function (_$rootScope_, $controller, _$compile_, _$httpBackend_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $compile = _$compile_;

    _$httpBackend_.expectGET('l10n/languages/en_US.json').respond(200);
  }));

  describe('the org contains no sales categories', function() {
    it('should not set the selected sales categories', function() {
      $scope.orgCategories = undefined;

      var salesCategorySelector = renderDirectiveAndDigest();
    
      expect(salesCategorySelector.selectedCategories).toBe(undefined);
    });
  });

  describe('the org contains only one sales category', function() {
    it('should not set the selected sales categories', function () {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'}
      ];

      var salesCategorySelector = renderDirectiveAndDigest();
      
      expect(salesCategorySelector.selectedCategories).toBe(undefined);
    });

    it('should not set the maxLength', function() {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'}
      ];

      var salesCategorySelector = renderDirectiveAndDigest();
      
      expect(salesCategorySelector.maxLength).toBeUndefined();
    });
  });

  describe('the org contains more than one sales category', function() {
    it('should set the selected category to Total Sales if it is not set', function () {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 1, name: 'Other Sales'}
      ];

      $scope.orgId = 1;

      $scope.currentUser = { preferences : { } };

      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.selectedCategories[0].id).toBe(0);
      expect(salesCategorySelector.selectedCategories[0].name).toBe('Total Sales');
    });

    it('should not set the selected categories if they are already set', function () {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 1, name: 'Other Sales'}
      ];

      $scope.selectedCategories = [
        {id: 1, name: 'Other Sales'}
      ]

      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.selectedCategories[0].id).toBe(1);
      expect(salesCategorySelector.selectedCategories[0].name).toBe('Other Sales');
    });

    it('should set the maxLength', function() {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 1, name: 'Other Sales'}
      ];

      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.maxLength).toBe(2);
    });

    it('should select the users default sales category if one is set', () => {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 800, name: 'Other Sales'}
      ];

      $scope.orgId = 1;

      $scope.currentUser = { preferences : { default_sales_categories : { 1: 800 } } };

      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.selectedCategories[0].id).toBe(800);
      expect(salesCategorySelector.selectedCategories[0].name).toBe('Other Sales');
    });

    it('should fallback to the total retail sales category if no preference for the specified org is found', () => {
      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 800, name: 'Other Sales'}
      ];

      $scope.orgId = 1;

      $scope.currentUser = { preferences : { default_sales_categories : { 2: 800 } } };

      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.selectedCategories[0].id).toBe(0);
      expect(salesCategorySelector.selectedCategories[0].name).toBe('Total Sales');
    });
  });

  describe('multipleSelect', function() {
    it('should default multipleSelect to false if not set', function() {
      var salesCategorySelector = renderDirectiveAndDigest();

      expect(salesCategorySelector.multipleSelect).toBe(true);
    });

    it('should set maxLength to 1 if multipleSelect is set to false', function() {
      var element = angular.element(
        '<sales-categories-selector' +
        ' selected-categories="selectedCategories"' +
        ' categories="orgCategories"' +
        ' multiple-select="multipleSelect"' +
        ' </sales-categories-selector>'
      );

      $scope.orgCategories = [
        {id: 0, name: 'Total Sales'},
        {id: 1, name: 'Other Sales'}
      ];

      $scope.multipleSelect = false;

      $compile(element)($scope);
      $scope.$digest();

      var salesCategorySelector = element.isolateScope().vm;

      expect(salesCategorySelector.maxLength).toBe(1);
    })
  });



  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.isolateScope().vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<sales-categories-selector' +
      ' selected-categories="selectedCategories"' +
      ' categories="orgCategories"' +
      ' org-id="orgId"' +
      ' current-user="currentUser"' +
      ' </sales-categories-selector>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/sales-categories-selector/sales-categories-selector.partial.html',
      '<div></div>'
    );
  }
});
