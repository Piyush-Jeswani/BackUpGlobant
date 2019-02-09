'use strict';

describe('miGeoLevel', function () {  

  var $compile, $scope

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }));

  describe('activate', function() {
    it('should expose a toggleOpen function', function() {
      var vm = renderDirectiveAndDigest();
      expect(typeof vm.toggleOpen).toBe('function');
    });
  });

  describe('toggleOpen', function() {
    it('should set isOpen to true if isOpen is undefined', function() {
      var vm = renderDirectiveAndDigest();

      var item = { };

      vm.toggleOpen(item);

      expect(item.isOpen).toBe(true);
    });

    it('should set isOpen to true if isOpen is false', function() {
      var vm = renderDirectiveAndDigest();
      
      var item = {
        isOpen: false
      };

      vm.toggleOpen(item);

      expect(item.isOpen).toBe(true);
    });

    it('should set isOpen to false if isOpen is true', function() {
      var vm = renderDirectiveAndDigest();
      
      var item = {
        isOpen: true
      };

      vm.toggleOpen(item);

      expect(item.isOpen).toBe(false);
    });

    it('should expose a isCountrySelected function', function() {
      var vm = renderDirectiveAndDigest();
      
      vm.isCountrySelected(1033);

      expect(typeof vm.isCountrySelected).toBe('function');
    });

    it('should expose a isRegionSelected function', function() {
      var vm = renderDirectiveAndDigest();
      
      vm.isRegionSelected(1033);

      expect(typeof vm.isRegionSelected).toBe('function');
    });

    it('should expose a isMetroSelected function', function() {
      var vm = renderDirectiveAndDigest();
      
      vm.isMetroSelected(1033);

      expect(typeof vm.isMetroSelected).toBe('function');
    });
  });

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.isolateScope().vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<mi-geo-level' +
      ' subscription-array="subscriptions"' +
      ' checked-item="{isMetroSelected: [{0: 1033}, {1: 1067}, {2: 0999}], isRegionSelected: [{0: 1033}, {1: 1067}, {2: 0999}], isCountrySelected: [{0: 1033}, {1: 1067}, {2: 0999}]}"' +
      '></mi-geo-level>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/widgets/mi-geo-level/mi-geo-level.partial.html',
      '<div></div>'
    );
  }

});