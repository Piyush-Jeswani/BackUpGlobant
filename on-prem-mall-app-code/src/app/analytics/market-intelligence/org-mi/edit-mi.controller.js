(function () {
  'use strict';

  angular.module('shopperTrak').controller('EditMiController', EditMiController);

  EditMiController.$inject = [
    '$scope',
    '$q',
    '$stateParams',
    '$state',
    '$timeout',
    'currentOrganization',
    'currentUser',
    'marketIntelligenceService',
    'ObjectUtils',
    'MarketIntelligenceSubscriptionResource'
  ];

  function EditMiController(
    $scope,
    $q,
    $stateParams,
    $state,
    $timeout,
    currentOrganization,
    currentUser,
    marketIntelligenceService,
    ObjectUtils,
    MarketIntelligenceSubscriptionResource
  ) {

    var vm = this;

    var initializedListCount = 0;

    activate();

    function activate() {
      mISubscriptionPromise().then(function (res) {
        initializeScope();
        configureSubscriptionData(res);
      });
    }

    function mISubscriptionPromise() {
      var deferred = $q.defer();
      MarketIntelligenceSubscriptionResource.query({
        orgId: $stateParams.orgId
      }).$promise
      .then(function (data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    }

    function initializeScope() {
      vm.saveButtonDisabled = true;

      vm.errorHeading = false;

      vm.isLoading = false;

      vm.userSegments = currentUser.preferences.market_intelligence.segments;

      vm.segments = []; // This is set by the mi-list directive

      vm.rules = [{name: 'Contains'}];

      vm.selectedItem = 'Geography';

      vm.title = 'ShopperTrak Index';

      vm.currentOrganization = currentOrganization;

      vm.showNoMiFooterCancel = showNoMiFooterCancel;

      vm.save = save;

      vm.listInitialized = listInitialized;

    }

    function listInitialized() {
      initializedListCount += 1;

      if(initializedListCount === 5) {
        $timeout(function() {
          configureSegmentChangeWatch();
        });
      }
    }

    function configureSegmentChangeWatch() {
      var unbindSegmentsWatch = $scope.$watchCollection('vm.segments', function (newSegments, oldSegments) {
        if(angular.equals(newSegments, oldSegments)) {
          return;
        }
        vm.saveButtonDisabled = false;
      });

      $scope.$on('$destroy', function() {
        if(angular.isFunction(unbindSegmentsWatch)) {
          unbindSegmentsWatch();
        }
      });
    }

    function sortObjectByKeys(anObj) {
      var sortedKeysArray = [];
      var createSortedObj = {};
      for (var key in anObj) {
        sortedKeysArray.push(key);
      }
      sortedKeysArray.sort();

      for (var i = 0; i < sortedKeysArray.length; i++) {
        var sortedKey = sortedKeysArray[i];
        createSortedObj[sortedKey] = anObj[sortedKey];
      }
      return createSortedObj;
    }

    function configureSubscriptionData(marketIntelligenceSubs) {
      vm.subscription = marketIntelligenceSubs;

      var createObj = {
        'Category': {
          values: {}
        }
      };


      if(!ObjectUtils.isNullOrUndefinedOrEmpty(vm.subscription)){
        _.each(vm.subscription,function (item) {

          createObj[item.geography.geoType] = createObj[item.geography.geoType] || { values: {} };

          createObj[item.geography.geoType].values[item.geography.name] = { uuid: item.geography.uuid, sourceObj: item.geography };

          createObj['Category'].values[item.category.name] = { uuid: item.category.uuid, sourceObj: item.category };
        });
      }


      var createObjSorted = sortObjectByKeys(createObj);

      function changeCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
      }

      vm.flatSubscription = Object.keys(createObjSorted).map(function(item) {
        return {
          name: changeCase(item),
          values: Object.keys(createObjSorted[item].values).map(function(val) {
            return {
              name:val,
              src: createObjSorted[item].values[val].sourceObj
            };
          })
        }
      });
    }

    function showNoMiFooterCancel() {
      $state.go('analytics.organization.marketIntelligence.dashboard');
    }

    function save() {
      vm.isLoading = true;

      marketIntelligenceService.saveUserMarketIntelligence(currentUser, vm.segments).then(function (res) {
        vm.isLoading = false;
        if (_.has(res,'segments')) {
          if (res.segments.length > 0) {
            $state.go('analytics.organization.marketIntelligence.dashboard');
          } else {
            vm.errorHeading = true;
          }
        }
      });
    }
  }
})();
