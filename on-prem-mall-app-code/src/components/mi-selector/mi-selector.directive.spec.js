'use strict';

describe('miSelect', function () {  

  var $compile, $scope, controller, placeholder;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(putTemplateToTemplateCache));

  beforeEach(inject(function ($rootScope,
    _$compile_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();

    controller = renderDirectiveAndDigest();
  }));

  describe('activate', function() {
    it('should default the dropdown to closed', function() {
      expect(controller.dropdownIsOpen).toBe(false);
    });
  });

  describe('onClick', function() {
    it('should toggle the drop down open status', function() {
      controller.onClick();
      expect(controller.dropdownIsOpen).toBe(true);
      controller.onClick();
      expect(controller.dropdownIsOpen).toBe(false);
    });
  });

  describe('offClick', function() {
    it('should close the dropdown', function() {      
      controller.dropdownIsOpen = true;
      controller.offClick();      
      expect(controller.dropdownIsOpen).toBe(false);
    })
  })

  describe('onItemSelect', function() {
    it('should set the current item', function() {      
      var item = {
        name: 'someitem'
      };
      controller.onItemSelection = undefined;
      controller.onItemSelect(item);
      expect(controller.currentItem).toBe(item);
    });

    it('should call onItemSelection if it has been set', function() {
      controller.onItemSelection = angular.noop;
      spyOn(controller, 'onItemSelection');
      var item = {
        name: 'someitem'
      };
      controller.onItemSelect(item);
      expect(controller.onItemSelection).toHaveBeenCalled();
    });
  });
  
  describe('placeholder', function() {
    it('should display the right placeholder label', function() {
      placeholder = 'Dimensions';
      controller = renderDirectiveAndDigest();
      expect(controller.placeholderLabel).toEqual(placeholder);        
    });
    
    it('should display the Select if placeholder is empty', function() {
      placeholder = null;
      controller = renderDirectiveAndDigest();
      expect(controller.placeholderLabel).toEqual('Select');        
    });
  });
    
  function renderDirectiveAndDigest() {
    $scope.placeholder = placeholder;
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.controller('miSelector');
  }

  function createDirectiveElement() {
    return angular.element(
      '<mi-selector' +
      ' control-id="\'some-id\'"' +
      ' items="items"' +
      ' current-item="currentItem"' +
      ' display-property="\'name\'"' +
      ' on-item-selection="onItemSelection"' +
      ' parent-drop-down-class="\'parentDropDownClass\'"' +
      ' placeholder-label="placeholder"' +
      '></mi-selector>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/mi-selector/mi-selector.partial.html',
      '<div></div>'
    );
  }

});