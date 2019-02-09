'use strict';

describe('customSelectCtrl', function () {


  var $rootScope;
  var $scope;
  var selectCtrl;

  beforeEach(module('shopperTrak'));

  beforeEach(inject(function (_$rootScope_, $controller) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    selectCtrl = $controller('customSelectCtrl', {
      '$scope': $scope
    });
  }));


  it('should set a scope variable for view to keep drop down open', function () {
    var $event = {
      target: 'some target'
    };
    $scope.dropdownIsOpen = false;
    $scope.onClick($event);
    expect($scope.dropdownIsOpen).toBe(true);
  });

  it('should set a scope variable for view to close the drop down', function () {
    $scope.dropdownIsOpen = true;
    $scope.offClick();
    expect($scope.dropdownIsOpen).toBe(false);
  });
});
