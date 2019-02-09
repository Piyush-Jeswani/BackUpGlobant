'use strict';

describe('typeAheadCtrl', function () {


  var $rootScope;
  var $controller;
  var $scope;
  var $filter;
  var $timeout;
  var typeAheadCtrl;
  var items = [];
  items.push({ id: 1, name: 'Apple' });
  items.push({ id: 2, name: 'Banana' });
  items.push({ id: 3, name: 'Cherry' });
  items.push({ id: 4, name: 'Blueberry' });
  items.push({ id: 5, name: 'Blackberry' });

  beforeEach(module('shopperTrak', function($translateProvider) {
    $translateProvider.translations('en_US', {});
  }));

  beforeEach(inject(function (_$rootScope_, _$controller_, _$filter_, _$timeout_) {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $filter = _$filter_;
    $timeout =_$timeout_;

    typeAheadCtrl = $controller('typeAheadCtrl', {
      '$scope': $scope,
      '$filter': $filter,
      '$timeout': $timeout
    });
  }));


  it('should set a focus and stop dropdown from closing when clicked into the testbox', function () {
    $scope.focus = false;
    $scope.isInUse();
    expect($scope.focus).toBe(true);
  });

  it('should set focus to be false from true', function () {
    $scope.focus = true;
    $scope.outOfUse();
    expect($scope.focus).toBe(false);
  });
  
  it('should watch the search text that user types in and filter the items based on that text', function () {
    $scope.items = items;
    $scope.allitems = items;
    $scope.$digest();
    $scope.isBeingUsed();
    expect($scope.items).toBe(items);
    $scope.filterProperty = 'name';
    $scope.minSearchLength = 3;
    $scope.model = 'b';
    $scope.$digest();
    $timeout.flush();
    expect($scope.items).toBe(items);
    $scope.isBeingUsed();
    $scope.$digest();
    $scope.model = 'bana';
    $scope.$digest();
    $timeout.flush();

    var returnItems = [];
    returnItems.push(items[1]);
    expect($scope.items.length).toBe(returnItems.length);
    expect($scope.items[0].id).toBe(returnItems[0].id);
    expect($scope.items[0].name).toBe(returnItems[0].name);
  });

  it('should watch the search text that user types in and filter the items based on that text only if the length is greater than set max length', function () {
    $scope.items = items;
    $scope.allitems = items;
    $scope.$digest();
    $scope.isBeingUsed();
    expect($scope.items).toBe(items);
    $scope.filterProperty = 'name';
    $scope.minSearchLength = 3;
    $scope.model = 'b';
    $scope.$digest();
    $timeout.flush();
    expect($scope.items).toBe(items);
    $scope.isBeingUsed();
    $scope.$digest();
    $timeout.flush();
    $scope.model = 'ba';
    $scope.$digest();
    $timeout.flush();
    expect($scope.items).toBe(items);
  });

  it('should watch the search text that user types in and return all items if search text is blank', function () {
    $scope.items = items;
    $scope.allitems = items;
    $scope.$digest();
    $scope.isBeingUsed();
    expect($scope.items).toBe(items);
    $scope.filterProperty = 'name';
    $scope.minSearchLength = 3;
    $scope.model = 'b';
    $scope.$digest();
    $timeout.flush();
    expect($scope.items).toBe(items);
    $scope.isBeingUsed();
    $scope.$digest();
    $scope.model = 'bana';
    $scope.$digest();
    $timeout.flush();

    var returnItems = [];
    returnItems.push(items[1]);
    expect($scope.items.length).toBe(returnItems.length);
    expect($scope.items[0].id).toBe(returnItems[0].id);
    expect($scope.items[0].name).toBe(returnItems[0].name);

    $scope.model = '';
    $scope.$digest();
    $timeout.flush();
    expect($scope.items.length).toBe(items.length);

    expect($scope.items[0].id).toBe(items[0].id);
    expect($scope.items[0].name).toBe(items[0].name);
    expect($scope.items[1].id).toBe(items[1].id);
    expect($scope.items[1].name).toBe(items[1].name);
    expect($scope.items[2].id).toBe(items[2].id);
    expect($scope.items[2].name).toBe(items[2].name);
    expect($scope.items[3].id).toBe(items[3].id);
    expect($scope.items[3].name).toBe(items[3].name);
    expect($scope.items[4].id).toBe(items[4].id);
    expect($scope.items[4].name).toBe(items[4].name);
  });
});
