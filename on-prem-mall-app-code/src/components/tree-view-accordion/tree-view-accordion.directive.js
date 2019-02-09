(function () {
  'use strict';

  angular.module('shopperTrak').directive('treeViewAccordion', ['$compile', treeViewAccordion]);

  var compile;

  function treeViewAccordion($compile) {
    compile = $compile;

    return {
      restrict: 'E',
      link: linkFunction,
      controller: treeViewAccordionCtrl,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        items: '<',
        displayProperty: '<',
        currentItem: '=',
        parentStylingClass: '@',
        onItemSelection: '<?',
        configuration: '<?',
        multiSelect: '<?'
      }
    };
  }

  function linkFunction(scope, element) {
    scope.$watch(function () { return scope.vm.items }, function () { buildAccordion(scope, element) });
  }

  function buildAccordion(scope, element) {
    var topLevel = angular.element('<ul class="{{vm.parentStylingClass}} tree-view-accordion">' +
      '<li ng-repeat="topLevel in vm.items track by $index">' +
        '<label ng-class="{\'is-selected\': topLevel.isSelected}" class="top-level leaf-title">'+
          '<input class="cb-item" type="checkbox" ng-model="topLevel.isSelected" ng-change="vm.onItemSelect(topLevel)"/>'+
          '<span>{{topLevel[vm.displayProperty]}}</span>'+
        '</label>' +
        '<span ng-if="!!topLevel.children" ng-click="vm.toggleAccordion(topLevel)" class="caret" ng-class="{\'caret-inverted\': topLevel.isOpen}" aria-hidden="true"></span>' +
      '</li>' +
    '</ul>');

    var topLevelChildren = _.filter(scope.vm.items, function (item) {
      return !_.isUndefined(item.children);
    });

    if (!_.isUndefined(topLevelChildren) && !_.isEmpty(topLevelChildren)) {
      var firstChildLevel = angular.element('<ul ng-show="topLevel.isOpen">' +
        '<li ng-repeat="firstChildLevel in topLevel.children track by $index">' +
          '<label ng-class="{\'is-selected\': firstChildLevel.isSelected}" class="first-child-level leaf-title">'+
            '<input class="cb-item" type="checkbox" ng-model="firstChildLevel.isSelected" ng-change="vm.onItemSelect(firstChildLevel)"/>'+
            '<span>{{firstChildLevel[vm.displayProperty]}}</span>'+
          '</label>' +
          '<span ng-if="!!firstChildLevel.children" ng-click="vm.toggleAccordion(firstChildLevel)" class="caret" ng-class="{\'caret-inverted\': firstChildLevel.isOpen}" aria-hidden="true"></span>' +
        '</li>' +
      '</ul>');

      var firstChildLevelChildren = [];

      _.each(topLevelChildren, function (child) {
        if (!_.isUndefined(child.children) && _.isEmpty(firstChildLevelChildren)) {
          firstChildLevelChildren = child.children;
        }
      });

      if (!_.isEmpty(firstChildLevelChildren)) {
        var secondChildLevel = angular.element('<ul ng-show="firstChildLevel.isOpen">' +
          '<li ng-repeat="secondChildLevel in firstChildLevel.children track by $index">' +
            '<label ng-class="{\'is-selected\': secondChildLevel.isSelected}" class="second-child-level leaf-title">'+
              '<input class="cb-item" type="checkbox" ng-model="secondChildLevel.isSelected" ng-change="vm.onItemSelect(secondChildLevel)"/>'+
              '<span>{{secondChildLevel[vm.displayProperty]}}</span>'+
            '</label>' +
          '</li>' +
        '</ul>');

        firstChildLevel.children().append(secondChildLevel).end();
      }

      topLevel.children().append(firstChildLevel).end();
    }
    var newHtml = element.html(topLevel);
    compile(newHtml.contents())(scope);
  }

  treeViewAccordionCtrl.$inject = [
    '$rootScope',
    '$scope',
    '$timeout',
    'ObjectUtils'
  ];

  function treeViewAccordionCtrl(
    $rootScope,
    $scope,
    $timeout,
    ObjectUtils
  ) {
    var vm = this;

    activate();

    function activate() {
      if (currentItemIsInCorrectFormat(vm.currentItem, vm.multiSelect, vm)) {
        vm.toggleAccordion = toggleBranch;
        vm.onItemSelect = onItemSelect;
        setupWatchers();
      }
    }

    function currentItemIsInCorrectFormat(currentItem, multiSelect) {
      var valid = false;
      if (!_.isUndefined(multiSelect) && multiSelect) {
        if (_.isArray(currentItem)) {
          valid = true;
        } else {
          console.error('Current item appears to be of a wrong type. Current item should be type of Array');
        }
      }

      if (_.isUndefined(multiSelect)) {
        if (typeof currentItem === 'object' && currentItem.constructor === Object) {
          valid = true;
        } else {
          console.error('Current item appears to be of a wrong type. Current item should be type of Object');
        }
      }

      return valid;
    }

    function onItemSelect(item) {
      if (_.isUndefined(vm.multiSelect) || !vm.multiSelect) {
        initiateSingleSelect(item);
      } else {
        initiateMultiSelect(item);
      }
      
      setTreeSelectedState(vm.items);
      
      if (typeof vm.onItemSelection === 'function' &&
          !_.isUndefined(vm.configuration) &&
          !_.isUndefined(vm.configuration.selectedDimension) && 
          !_.isUndefined(vm.configuration.currentFilterId)) {
        vm.onItemSelection(vm.currentItem, vm.configuration.selectedDimension, vm.configuration.currentFilterId);
      }
      
      $rootScope.$emit('selectionMade');
    };

    function initiateSingleSelect(item) {
      deselectItems(vm.items);
      item.isSelected = true;
      vm.currentItem = item;
    }

    function initiateMultiSelect(item) {
      if (!_.isUndefined(item.isSelected) && item.isSelected) {
        vm.currentItem.push(item);
      } else {
        vm.currentItem.splice(vm.currentItem.indexOf(item), 1);
      }
    }

    function deselectItems(items) {
      _.each(items, function (singleItem) {
        delete singleItem.isSelected;

        if (!_.isUndefined(singleItem.children)) {
          deselectItems(singleItem.children);
        }
      });
    }

    function setTreeSelectedState(items) {
      var branchesOpen = false;
      if (!_.isUndefined(vm.configuration) && vm.configuration.shouldResetStateOnSelect) {
        closeBranches(items);
      }
      startTreeWalker(items);
      
      function startTreeWalker(items) {
        _.each(items, function (item) {
          if (branchesOpen) {
            return;
          }

          if (!_.isUndefined(item.isSelected) && item.isSelected && !_.isUndefined(item.parent)) {
            openBranches(item);
            if (!_.isUndefined(item.children)) {
              _.each(item.children, function (child) {
                child.parent = item;
              });
              startTreeWalker(item.children);
            }
            if (_.isUndefined(vm.multiSelect) || !vm.multiSelect) {
              branchesOpen = true;
            }
          } else {
            if (!_.isUndefined(item.children)) {
              _.each(item.children, function (child) {
                child.parent = item;
              });
              startTreeWalker(item.children);
            }
          }
        });
      }
    }

    function closeBranches(items) {
      _.each(items, function (item) {
        if (!_.isUndefined(item.children)) {
          if (!_.isUndefined(item.isOpen) && item.isOpen) {
            toggleBranch(item);
          }
          closeBranches(item.children);
        }
      });
    }

    function openBranches(obj) {
      if (!_.isUndefined(obj.parent)) {
        if (_.isUndefined(obj.parent.isOpen) || !obj.parent.isOpen) {
          toggleBranch(obj.parent);
        }
        openBranches(obj.parent);
      }
    }

    function toggleBranch(branch) {
      branch.isOpen = !branch.isOpen;
    }

    function setCurrentItem(categories, isAllSelected){
      _.each(categories, function(item){
        if(isAllSelected && (item.isSelected === false || _.isUndefined(item.isSelected))){
          item.isSelected = true;
          onItemSelect(item);
        }
        if(isAllSelected === false && item.isSelected === true){
          delete item.isSelected;
          onItemSelect(item);
        }
        
        if (!_.isUndefined(item.children)){
          setCurrentItem(item.children, isAllSelected);
        }
      });
      if (isAllSelected === false) {
        closeBranches(vm.items);
      }
    }

    function setupWatchers() {
      var unbindFunctions = [];

      unbindFunctions.push($scope.$watch('vm.items', function () {
        setTreeSelectedState(vm.items);
        if (ObjectUtils.isNullOrUndefinedOrEmptyObject(vm.currentItem)) {
          deselectItems(vm.items);
          closeBranches(vm.items);
        }
      }));

      unbindFunctions.push($scope.$on('toggleAllGeographies', function(event, allItemsSelected){
        $timeout(function () {
          setCurrentItem(vm.items, allItemsSelected);
        });
      }));

      $scope.$on('$destroy', function () {
        _.each(unbindFunctions, function (unbindFunction) {
          if (angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }
  }
})();