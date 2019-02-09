(function () {
  'use strict';

  angular.module('shopperTrak').controller('EditMiNewController', EditMiNewController);

  EditMiNewController.$inject = [
    '$scope',
    '$q',
    '$stateParams',
    '$state',
    '$timeout',
    '$translate',
    'currentOrganization',
    'currentUser',
    'marketIntelligenceService',
    'ObjectUtils',
    'timeperiodConstants'
  ];

  function EditMiNewController(
    $scope,
    $q,
    $stateParams,
    $state,
    $timeout,
    $translate,
    currentOrganization,
    currentUser,
    marketIntelligenceService,
    ObjectUtils,
    timeperiodConstants
  ) {

    var vm = this;
    var translation = {};
    var currentOrgOriginalCopyMISegments;
    var currentOrgSegments;
    activate();

    function activate() {
      currentOrgSegments = _.findWhere(currentUser.preferences.market_intelligence, {orgId: currentOrganization.organization_id});
      currentOrgOriginalCopyMISegments = angular.copy(currentOrgSegments);
      getMISettingsTranslations().then(function (translations) {
        vm.translations = translations;
        vm.timeSelectionPlaceholders = {
          time: vm.translations.addtimeperiod
        };
      });

      vm.timeDimensions = timeperiodConstants.timeperiod;

      marketIntelligenceService.getSubscriptions($stateParams.orgId, false, false).then(function (res) {
        vm.subscriptionResponse = res;
        initializeScope();
        buildConfiguration();
        buildTimePeriodConfig(vm.segments, vm.timeDimensions);
      });
    }

    function buildTimePeriodConfig(segments, timePeriodObj) {
      _.each(segments, function (item) {
        item.timePeriod = _.findWhere(timePeriodObj, {period: item.timePeriod});
        if (item.timePeriod.period === 'none') {
          item.timePeriod = '';
        }
      });
    }

    function getMISettingsTranslations() {

      var deferred = $q.defer();

      var miSettingsTransKeys = [
        'marketIntelligence.ADDTIMEPERIOD'
      ];

      $translate(miSettingsTransKeys).then(function (translations) {
        translation.addtimeperiod = translations['marketIntelligence.ADDTIMEPERIOD'];
        deferred.resolve(translation);
      });

      return deferred.promise;
    }

    function initializeScope() {
      vm.saveButtonDisabled = true;
      vm.errorHeading = false;
      vm.isLoading = false;
      vm.rules = [{name: 'Contains'}];
      vm.title = 'ShopperTrak Index';
      vm.currentOrganization = currentOrganization;
      vm.showNoMiFooterCancel = showNoMiFooterCancel;
      vm.save = save;
      vm.segmentConfig = {
        title: '.FILTERMARKETDATA',
        showSummary: true,
        shouldClear: true,
        position: 'left'
      };
    }

    function initializeSegments() {
      for (var index = 0; index < vm.noOfSegments; index++) {
        if (ObjectUtils.isNullOrUndefined(vm.segments[index])) {
          vm.segments.push({ subscription: {} });
        }
      }
    }

    function configureSegmentChangeWatch() {
      var unbindSegmentsWatch = $scope.$watch('vm.segments', function (segments, oldSegments) {
        if(angular.equals(segments, oldSegments)) {
          return;
        }
        vm.saveButtonDisabled = false;
      }, true);

      $scope.$on('$destroy', function() {
        if(angular.isFunction(unbindSegmentsWatch)) {
          unbindSegmentsWatch();
        }
      });
    }

    function showNoMiFooterCancel() {
      //Reverting the Current Updated Org preference with Original preferences Values on Cancel
      currentOrgSegments.segments = currentOrgOriginalCopyMISegments.segments;
      $state.go('analytics.organization.marketIntelligence.dashboard');
    }

    function save() {
      vm.isLoading = true;
      var segmentsCopy = angular.copy(vm.segments);
      _.each(segmentsCopy,function (item) {
        if (_.has(item,'timePeriod') && _.has(item.timePeriod,'period') && !_.isUndefined(item.timePeriod.period)) {
          item.timePeriod = item.timePeriod.period;
        }

      });

      marketIntelligenceService.saveUserMarketIntelligence(currentUser, prepForSaveEndPoint(segmentsCopy), vm.currentOrganization.organization_id).then(function (res) {
        vm.isLoading = false;
        var responseSegments = _.findWhere(res, {orgId: vm.currentOrganization.organization_id});
        if (!ObjectUtils.isNullOrUndefined(responseSegments) && _.has(responseSegments, 'segments')) {
          if (responseSegments.segments.length > 0) {
            $state.go('analytics.organization.marketIntelligence.dashboard');
          } else {
            vm.errorHeading = true;
          }
        } else {
          vm.errorHeading = true;
        }
      });
    }

    function prepForSaveEndPoint(array) {
      var result = [];
      _.each(array, function (item) {
        result.push(_.isEmpty(item.subscription) ? {} : item);
      });
      return marketIntelligenceService.setSegmentGeoToFullName(result, 'title', 'code');
    }

    function buildConfiguration() {
      vm.segments = [];
      vm.noOfSegments = 5;
      var selectedOrgSegments = _.findWhere(currentUser.preferences.market_intelligence, {orgId: $stateParams.orgId});

      if (!ObjectUtils.isNullOrUndefined(selectedOrgSegments)) {
        var userSegments = selectedOrgSegments.segments;
      }

      if (!ObjectUtils.isNullOrUndefinedOrEmpty(userSegments)) {
        vm.segments = marketIntelligenceService.setSegmentGeoToFullName(userSegments, 'code','title');
      }
      initializeSegments();
      configureSegmentChangeWatch();
    }
  }
})();
