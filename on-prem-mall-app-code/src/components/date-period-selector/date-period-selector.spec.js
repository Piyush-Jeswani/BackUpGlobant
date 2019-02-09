'use strict';

describe('datePeriodSelector', function () {

  var $compile, $scope, LocalizationService, ObjectUtils;
  var $httpBackend;

  beforeEach(module('shopperTrak'));

  beforeEach(module(function ($provide) {
    $provide.factory('LocalizationService', getMockLocalizationService);
  }));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_,
    _ObjectUtils_,
    _LocalizationService_,
    _$httpBackend_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    ObjectUtils = _ObjectUtils_;
    LocalizationService = _LocalizationService_;
    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('l10n/languages/en_US.json').respond({});
  }));

  describe('populateOptions', function() {

    it('should have options', function() {
      var itemsSelected = false;
      var selector = renderDirectiveAndDigest(itemsSelected);

      expect(selector.options[0].key).toBe('day');
    });

    it('should have selected item', function() {
      var itemsSelected = true;
      var selector = renderDirectiveAndDigest(itemsSelected);

      expect(selector.options[0].key).toBe('day');
      expect(selector.unOrderedSelectedItems).toEqual(selector.selectedItems);
    });
  });

  function renderDirectiveAndDigest(itemsSelected) {
    var element;

    if (itemsSelected) {
      element = createDirectiveElementItemsSelected();
    }
    else {
      element = createDirectiveElement();
    }

    $compile(element)($scope);
    $scope.$digest();
    var vm = element.isolateScope().vm;
    return vm;
  }

  function getMockLocalizationService() {
    return {
      getCurrentOrganizationDaysOfWeek: function() {
        return ['mon','tue','wed','thu','fri','sat','sun'];
      }
    }
  }

  function createDirectiveElement() {
    return angular.element(
      '<date-period-selector ' +
      'selected-items="selectedItems" ' +
      '  </date-period-selector>'
    );
  }

  function createDirectiveElementItemsSelected() {
    return angular.element(
      '<date-period-selector ' +
      'selected-items="[{item},{item2}]" ' +
      '  </date-period-selector>'
    );
  }  

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/date-period-selector/date-period-selector.partial.html',
      '<div></div>'
    );
  }

});
