(function () {
  'use strict';

  angular.module('shopperTrak').controller('OrgMiController', OrgMiController);

  OrgMiController.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    'currentOrganization',
    'currentUser',
    'miUserPreferences',
    'LocalizationService',
    'ObjectUtils',
    'utils',
    'SubscriptionsService',
    'sites'
  ];

  function OrgMiController(
    $scope,
    $state,
    $stateParams,
    $translate,
    currentOrganization,
    currentUser,
    miUserPreferences,
    LocalizationService,
    ObjectUtils,
    utils,
    SubscriptionsService,
    sites
  ) {
    var vm = this;

    activate();

    function initScope() {
      vm.dateRangesLoaded = angular.isDefined($state.params.compareRange1Start);
      vm.showDateRangePicker = true;
      vm.showDataAvailableUntilMessage = false;
      vm.headerTitle = '';
      vm.customMessage = '';

      vm.currentOrganization = currentOrganization;

      // Needed by the date range picker
      $scope.currentUser = currentUser;
      $scope.currentOrganization = currentOrganization;

      vm.currentUser = currentUser;

      vm.showEditMode = function () {
        $state.go('analytics.organization.marketIntelligence.edit');
      };

      vm.showNoMi = function () {
        $state.go('analytics.organization.marketIntelligence.dashboard');
      };

      vm.reset = reset();
    }

    function activate() {
      //Security check
      if (SubscriptionsService.userHasMarketIntelligence(currentUser, currentOrganization.organization_id) === false) {

        if(SubscriptionsService.onlyMiSubscription(currentOrganization, sites)) {
          vm.showAccessError = true;
        } else {
          $state.go('analytics');
        }

        return;
      }

      addListeners();

      initScope();

      LocalizationService.setUser(vm.currentUser);

      var dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);

      if(!ObjectUtils.isNullOrUndefined($stateParams.compareRange1Start) && !ObjectUtils.isNullOrUndefined($stateParams.compareRange1End)) {
        vm.comparePeriod = {
          start:$stateParams.compareRange1Start.format(dateFormat),
          end: $stateParams.compareRange1End.format(dateFormat)
        };

        vm.unequalNumberOfDaysSelected = areUnequalNumberOfDaysSelected();
      }

      vm.editDisabled = true; //ToDo: Wire this up with user settings

      vm.defaultResetButtons = ($state.current.name === 'analytics.organization.marketIntelligence.edit');

      configureWatches();

      vm.miExists = miUserPreferences.segmentPreferencesAreConfigured(vm.currentUser.preferences, currentOrganization.organization_id);
    }

    function addListeners() {
      // Stop those weird pointless redirects. Suspect they are caused by the href delegator, but it's a debugging nightmare
      var unbindStateChangeStartListener = $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if(toState.name.indexOf('analytics.organization.marketIntelligence') < 0) {
          return;
        }

        if(toState.name !== fromState.name) {
          return;
        }

        if(!paramsAreEqual(toParams, fromParams)) {
          return;
        }

        event.preventDefault();
      });

      $scope.$on('$destroy', function() {
        if(angular.isFunction(unbindStateChangeStartListener)) {
          unbindStateChangeStartListener();
        }
      })
    }

    function paramsAreEqual(toParams, fromParams) {
      var toParamKeys = _.keys(toParams);

      var fromParamKeys = _.keys(fromParams);

      var allKeys = _.union(toParamKeys, fromParamKeys);

      var firstNonMatch = _.find(allKeys, function(key) {
        var toParam = toParams[key];
        var fromParam = fromParams[key];

        if(moment.isMoment(toParam) && moment.isMoment(fromParam)) {
          return !toParam.isSame(fromParam);
        }
        return toParams[key] !== fromParams[key];
      });

      return angular.isUndefined(firstNonMatch);
    }

    function areUnequalNumberOfDaysSelected() {
      var selectedPeriodDays = utils.getDaysBetweenDates($stateParams.dateRangeStart, $stateParams.dateRangeEnd);

      var priorPeriodDays = utils.getDaysBetweenDates($stateParams.compareRange1Start, $stateParams.compareRange1End);

      return selectedPeriodDays !== priorPeriodDays;
    }

    function setPageProperties() {
      switch($state.current.name) {
        case 'analytics.organization.marketIntelligence.edit':
          vm.headerTitle = '.NEWMARKETINTELLIGENCE';
          vm.showDateRangePicker = false;
          break;
        default:
          vm.headerTitle = '.MARKETINTELLIGENCE';
          vm.showDateRangePicker = true;
          break;
      }
    }

    function configureWatches() {
      var unbindFunctions = [];

      var unbindStateChangeSuccess = $scope.$on('$stateChangeSuccess', setPageProperties);
      unbindFunctions.push(unbindStateChangeSuccess);

      var unbindSetMiExists = $scope.$on('setMiExists', function (event) {
        vm.miExists = miUserPreferences.segmentPreferencesAreConfigured(vm.currentUser.preferences, currentOrganization.organization_id);
        event.preventDefault();
      });
      setPageProperties();

      unbindFunctions.push(unbindSetMiExists);

      var unbindNoYestrdayData = $scope.$on('noDataForYesterday', function (event, data) {
        var dateFormat = LocalizationService.getCurrentDateFormat(currentOrganization);
        vm.showDataAvailableUntilMessage = true;
        $translate('marketIntelligence.DATAAVAILABLEINFO')
        .then(function (translation) {
          vm.customMessage = translation.concat(' ' + data.dateEnd.format(dateFormat));
        });
      });

      unbindFunctions.push(unbindNoYestrdayData);

      $scope.$on('$destroy', function () {
        _.each(unbindFunctions, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function reset() {
      $scope.$broadcast('resetToDefault');
    }
  }
})();
