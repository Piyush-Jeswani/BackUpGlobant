(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('miListSelector', miListSelector);

  function miListSelector() {
    return {
      restrict: 'E',
      templateUrl: 'components/mi-list-selector/mi-list-selector.partial.html',
      scope: {
        noOfFilters:'=',
        segment: '=',
        subscriptionResponse: '=',
        rules: '=?',
        shouldResetOnCancel: '=?',
        shouldClear: '<',
        dropdownPosition: '<?',
        showSummary: '<',
        headerTitle: '<',
        onApplyFunc: '=?'
      },
      bindToController: true,
      controller: miListSelectorController,
      controllerAs: 'vm'
    };
  }

  miListSelectorController.$inject = [
    '$translate',
    '$q',
    'ObjectUtils',
    '$stateParams',
    'marketIntelligenceService',
    '$filter'
  ];

  function miListSelectorController(
    $translate,
    $q,
    ObjectUtils,
    $stateParams,
    marketIntelligenceService,
    $filter
  ) {
    var vm = this;
    var translation = {};
    activate();

    function initScope() {

      getMItranslations().then(function (translations) {
        vm.translations = translations;
        vm.dropdownPlaceholders = {
          dimensions: vm.translations.dimensions,
          rules: vm.translations.rules,
          values: vm.translations.values
        };
        configureSubscriptionArray();
        resetValidationFlags();
      });

      vm.addFilter = addFilter;
      vm.cancelFilters = cancelFilters;
      vm.showFilters = showFilters;
      vm.applyFilter = applyFilter;
      vm.clearFilters = clearFilters;
      vm.showSelected = [];
      vm.reduceFilters = reduceFilters;
      vm.removeFilter = removeFilter;
      vm.disableApplyBtn = disableApplyBtn;
      vm.hideAddFilter = hideAddFilter;
      vm.clearFlag = false;
    }

    function activate() {
      initScope();
    }

    function getMItranslations() {
      var deferred = $q.defer();
      var miTransKeys = [
        'marketIntelligence.DIMENSIONS',
        'marketIntelligence.RULES',
        'marketIntelligence.CONTAINS',
        'marketIntelligence.VALUES',
        'marketIntelligence.SELECTFILTERS',
        'marketIntelligence.CATEGORY',
        'marketIntelligence.GEOGRAPHY'
      ];

      $translate(miTransKeys).then(function (translations) {
        translation.dimensions = translations['marketIntelligence.DIMENSIONS'];
        translation.rules = translations['marketIntelligence.CONTAINS'];
        translation.contains = translations['marketIntelligence.CONTAINS'];
        translation.values = translations['marketIntelligence.VALUES'];
        translation.selectFilters = translations['marketIntelligence.SELECTFILTERS'];
        translation.category = translations['marketIntelligence.CATEGORY'];
        translation.geography = translations['marketIntelligence.GEOGRAPHY'];
        deferred.resolve(translation);
      });
      return deferred.promise;
    }

    function selectionHasNoCommonValues() {
      var selectedItems = getSelectionItems(vm.subscriptionArray);
      var subscriptionArray = marketIntelligenceService.getReducedSubscription(vm.subscriptionResponse, selectedItems, vm.noOfFilters, vm.translations);
      if (ObjectUtils.isNullOrUndefinedOrEmpty(subscriptionArray)) {
        return true;
      }
      var checkArray = _.reject(subscriptionArray, function (eachRejectItem) {
        return _.isEmpty(eachRejectItem.values);
      });
      return ObjectUtils.isNullOrUndefinedOrEmpty(checkArray);
    }

    function setDimensionAvailableFlag() {
      if (!selectionHasNoCommonValues()) {
        vm.noDimensionsError = false;
      } else {
        vm.noDimensionsError = true;
      }
    }

    function validationAddFilterError(objToCheck) {
      var checkErrorArray = [];

      _.each(objToCheck, function (item) {
        if (ObjectUtils.isNullOrUndefined(item['selectedDimension']) ||
            ObjectUtils.isNullOrUndefinedOrEmptyObject(item['selectedValue'])) {
          vm.showNoSelectionError = true;
          checkErrorArray.push('error');
        }
      });

      if (_.contains(checkErrorArray, 'error')) {
        return false;
      }
      else {
        return true;
        vm.showNoSelectionError = false;
      }
    }

    function validationApplyBtnError(objToCheck) {
      var checkErrorArray = [];
      var dimensions = {
        category: 0,
        geography: 0
      }
      resetValidationFlags();

      _.each(objToCheck, function (item) {
        if (!vm.clearFlag && ObjectUtils.isNullOrUndefined(item['selectedDimension']) || !vm.clearFlag && ObjectUtils.isNullOrUndefinedOrEmptyObject(item['selectedValue'])) {
          vm.showNoSelectionError = true;
          checkErrorArray.push('error');
        }
        if (!_.isUndefined(item.selectedDimension)) {
          dimensions[item.selectedDimension.name.toLowerCase()]++;
        }
      });

      if (!vm.clearFlag && dimensions.category === 0 || !vm.clearFlag && dimensions.geography === 0) {
        vm.showMissingDimensionError = true;
        checkErrorArray.push('error');
      }

      return !_.contains(checkErrorArray, 'error');
    }

    function resetValidationFlags() {
      vm.showMissingDimensionError = false;
      vm.showNoSelectionError = false;
      vm.noDimensionsError = false;
    }

    function addFilter(selectedSubscriptionArray) {
      resetValidationFlags();
      
      if (validationAddFilterError(selectedSubscriptionArray)) {
        vm.clearFlag = false;
        var selectedItems = [];
        _.each(selectedSubscriptionArray, function (item) {
          if (!ObjectUtils.isNullOrUndefined(item.selectedDimension) &&
              !ObjectUtils.isNullOrUndefinedOrEmptyObject(item.selectedValue)) {
            if (_.has(item.selectedDimension, 'name') &&
                _.has(item.selectedValue, 'name') &&
                _.has(item.selectedValue, 'src')) {
              selectedItems.push({
                selectedDimension: item.selectedDimension.name,
                selectedValue: item.selectedValue.src.name,
                selectedSrc: item.selectedValue.src
              });
            }
          }
        });

        if (vm.subscriptionArray.length < 3) {
          selectionHasNoCommonValues();
          setDimensionAvailableFlag();

          if (!vm.noDimensionsError) {
            vm.subscriptionArray.push(marketIntelligenceService.getReducedSubscription(vm.subscriptionResponse, selectedItems, vm.noOfFilters, vm.translations));
          }
        }
      }
    }

    function constructSegmentStructure(isDisableCheck) {
      var selectedSub = vm.noOfFilters > 2 ? [] : {};
      _.each(vm.subscriptionArray, function (item) {
        if (isValidSelection(item.selectedDimension, item.selectedValue)) {
          if (vm.noOfFilters > 2) {
            selectedSub.push({
              name: item.selectedDimension.name,
              orgId: $stateParams.orgId,
              rule: 'Contains',
              value: {
                name: item.selectedValue.name,
                src: item.selectedValue.src
              }
            });
          } else {
            var subscriptionName = constructPropNameToGeoType(item);
            selectedSub[item.selectedDimension.name.toLowerCase()] = {
              name: subscriptionName,
              orgId: $stateParams.orgId,
              rule: 'Contains',
              value: {
                name: item.selectedValue.name,
                src: item.selectedValue.src
              }
            };
          }
        }
      });

      if (!isDisableCheck) {
        vm.segment.subscription = selectedSub;
      }

      return selectedSub;
    }

    function applyFilter() {
      if (validationApplyBtnError(vm.subscriptionArray)) {
        constructSegmentStructure(false);
        showFilters();
        if (vm.showSummary) {
          setSelectionSummary();
        }
        if (_.isFunction(vm.onApplyFunc)) {
          vm.onApplyFunc(vm.segment);
        }
        vm.clearFlag = false;
      }
    }

    function cancelFilters() {
      vm.showFilterIsOpen = false;
      resetValidationFlags();
      configureSubscriptionArray();
    }

    function showFilters() {
      vm.showFilterIsOpen = !vm.showFilterIsOpen;
      if (vm.showFilterIsOpen) {
        resetValidationFlags();
        configureSubscriptionArray();
      }
    }

    function isValidSelection(dim, val) {
      return !ObjectUtils.isNullOrUndefined(dim) && !ObjectUtils.isNullOrUndefinedOrEmptyObject(val);
    }

    function clearFilters() {
      vm.subscriptionArray.splice(1, vm.subscriptionArray.length - 1);
      delete vm.subscriptionArray[0].selectedDimension;
      delete vm.subscriptionArray[0].selectedValue;
      vm.clearFlag = true;
      resetValidationFlags();
    }

    function hideAddFilter(arrayLength, noOfFilters) {

      return vm.clearFlag ? true : arrayLength === noOfFilters ? false : true;

    }

    function disableApplyBtn(passedArray) {
      var selectedSubscriptions = constructSegmentStructure(true);
      var disabled = false;

      if (angular.equals(selectedSubscriptions, vm.segment.subscription)) {
        disabled = true;
      } else if (vm.clearFlag) {
        disabled = false;
      } else if (vm.clearFlag === false && passedArray.length < 2) {
        disabled = true;
      } else if (vm.clearFlag === false && passedArray.length >= 2) {
        disabled = false;
      }

      return disabled;
    }

    function reduceFilters(selectedValue, selectedDimension, index) {
      vm.clearFlag = false;
      var nextFilter = vm.subscriptionArray[index + 1];
      if (!ObjectUtils.isNullOrUndefined(nextFilter)) {
        vm.subscriptionArray[index].selectedDimension = selectedDimension;
        vm.subscriptionArray[index].selectedValue = selectedValue;
        var selectionItems = getSelectionItems(vm.subscriptionArray, index);
        if (!ObjectUtils.isNullOrUndefinedOrEmptyObject(selectedValue) &&
            !ObjectUtils.isNullOrUndefined(nextFilter.selectedDimension)) {
          selectionItems.push({
            selectedDimension: selectedDimension.name,
            selectedValue: selectedValue.src.name
          });
          var reducedSubscription = marketIntelligenceService.getReducedSubscription(vm.subscriptionResponse, selectionItems, vm.noOfFilters, vm.translations);

          if (!selectionIsPossible(reducedSubscription)) {
            removeFilter(index + 1);
          }

          var dimension = _.findWhere(reducedSubscription, {name: nextFilter.selectedDimension.name});
        }

        if (!ObjectUtils.isNullOrUndefined(dimension) && !ObjectUtils.isNullOrUndefinedOrEmpty(dimension.values)) {
          var nextFilterCopy = _.omit(angular.copy(nextFilter), function (value, prop) {
            return prop === 'selectedDimension' && prop === 'selectedValue';
          });
          var numOfSubscriptions = _.keys(nextFilterCopy).length;
          if (numOfSubscriptions < _.keys(reducedSubscription).length) {
            numOfSubscriptions = _.keys(reducedSubscription).length;
          }
          for (var i = 0; i < numOfSubscriptions; i++) {
            if (!_.isUndefined(reducedSubscription[i])) {
              nextFilter[i] = reducedSubscription[i];
            } else {
              delete nextFilter[i];
            }
          }

          nextFilter.selectedDimension = dimension;
          
          if (dimension.values.length === 1 && _.isUndefined(dimension.values[0].children)) {
            dimension.values[0].isSelected = true;
            nextFilter.selectedValue = dimension.values[0];
            removeFilter(index + 2);
          }

          if ((dimension.values.length === 1 && !_.isUndefined(dimension.values[0].children) ||
            dimension.values.length > 1) && !ObjectUtils.isNullOrUndefinedOrEmptyObject(nextFilter.selectedValue)) {
            var selectionMatchesNewValues;
            _.each(dimension.values, function (dimensionValue) {
              var filteredItem = marketIntelligenceService.getTreeLeafByName(dimensionValue, nextFilter.selectedValue.name);
              if (!_.isUndefined(filteredItem)) {
                filteredItem.isSelected = true;
                selectionMatchesNewValues = filteredItem;
              }
            });
            nextFilter.selectedValue = !ObjectUtils.isNullOrUndefined(selectionMatchesNewValues) ? selectionMatchesNewValues : {};
            reduceFilters(nextFilter.selectedValue, nextFilter.selectedDimension, index + 1);
          }
        } else {
          removeFilter(index + 1);
        }
      }
      resetValidationFlags();
    };

    function getSelectionItems(subscriptionArray, index, returnFullName) {
      var length = !ObjectUtils.isNullOrUndefined(index) ? index : subscriptionArray.length;
      var selectionItems = [];
      for (var i = 0; i < length; i++) {
        if (!ObjectUtils.isNullOrUndefined(subscriptionArray[i].selectedDimension) &&
            !ObjectUtils.isNullOrUndefinedOrEmptyObject(subscriptionArray[i].selectedValue)) {
          var selectionObj = {
            selectedDimension: subscriptionArray[i].selectedDimension.name,
            selectedValue: subscriptionArray[i].selectedValue.src.name
          };
          if (returnFullName) {
            selectionObj.selectedValue = subscriptionArray[i].selectedValue.name
          }
          selectionItems.push(selectionObj);
        }
        
      }
      return selectionItems;
    }

    function selectionIsPossible(subscription) {
      var valid = false;
      _.each(subscription, function (dimension) {
        if (!ObjectUtils.isNullOrUndefinedOrEmpty(dimension.values)) {
          valid = true;
          return;
        }
      });
      return valid;
    }

    function removeFilter(index) {
      vm.subscriptionArray.splice(index, 1);
      vm.showNoSelectionError = false;
      vm.noDimensionsError = false;
    }

    function configureSubscriptionArray() {
      vm.subscriptionArray = [];
      vm.subscriptionArray.push(marketIntelligenceService.getReducedSubscription(vm.subscriptionResponse, undefined, undefined, vm.translations));
      if (!ObjectUtils.isNullOrUndefined(vm.segment.subscription)) {
        var i = 0;
        _.each(vm.segment.subscription, function (subscription) {
          if (i > 0) {
            var selectionItems = getSelectionItems(vm.subscriptionArray, i);
            vm.subscriptionArray.push(marketIntelligenceService.getReducedSubscription(vm.subscriptionResponse, selectionItems, vm.noOfFilters, vm.translations));
          }
          var dimension = _.findWhere(vm.subscriptionArray[i], { name: getSubscriptionType(subscription) });
          var value;
          _.each(dimension.values, function (dimensionValuesItem) {
            var filteredItem = marketIntelligenceService.getTreeLeafByName(dimensionValuesItem, subscription.value.name);
            if (!_.isUndefined(filteredItem)) {
              filteredItem.isSelected = true;
              value = filteredItem;
            }
          });
          vm.subscriptionArray[i].selectedDimension = dimension;
          vm.subscriptionArray[i].selectedValue = value;
          i++;
        });
        if (vm.showSummary) {
          setSelectionSummary();
        }        
      }
    }

    /**
     * Returns a subscription type
     * 
     * @param {any} subscription must have a value.src.geoType property
     * @returns {string} Geography as subscription name
     */
    function getSubscriptionType(subscription) {
      return !ObjectUtils.isNullOrUndefined(subscription) &&
             !ObjectUtils.isNullOrUndefinedOrEmptyObject(subscription.value) &&
             !ObjectUtils.isNullOrUndefined(subscription.value.src) &&
             _.has(subscription.value.src, 'geoType') ?
             'Geography' :
             'Category';
    }

    /**
     * Converts the "Geography" string to  value of geoType property 
     * 
     * @param {any} subscription must have a selectedDimension property
     * @returns Geo type as subscription name
     */
    function constructPropNameToGeoType(subscription) {
      return !ObjectUtils.isNullOrUndefined(subscription) &&
             !ObjectUtils.isNullOrUndefined(subscription.selectedDimension) &&
             !ObjectUtils.isNullOrUndefinedOrEmptyObject(subscription.selectedValue) &&
             subscription.selectedDimension.name === 'Geography' ?
             $filter('capitalize')(subscription.selectedValue.src.geoType) :
             subscription.selectedDimension.name;
    }
    function setSelectionSummary() {
      vm.showSelected = getSelectionItems(vm.subscriptionArray, undefined, true);
    }
  }
})();
