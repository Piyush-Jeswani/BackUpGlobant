'use strict';

angular.module('shopperTrak')
  .controller('DateRangeSelectorCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$timeout',
    '$translate',
    '$q',
    'utils',
    'LocalizationService',
    'ObjectUtils',
    'SubscriptionsService',
    'localStorageService',
    'googleAnalytics',
    'dateRangeService',
    'operatingHoursService',
    function (
      $scope,
      $rootScope,
      $state,
      $stateParams,
      $timeout,
      $translate,
      $q,
      utils,
      LocalizationService,
      ObjectUtils,
      SubscriptionsService,
      localStorageService,
      googleAnalytics,
      dateRangeService,
      operatingHoursService
    ) {
      var now = moment();

      $scope.$state = $state;
      $scope.comparePeriodSelectorIsOpen = false;
      $scope.opHoursSelectorIsOpen = false;
      $scope.calendarsLoaded = false;
      $scope.showDateRangePicker = false;
      $scope.showRealTimeData = false;
      $scope.currentUser = $scope.$parent.currentUser;
      $scope.currentOrganization = $scope.$parent.currentOrganization;

      $scope.language = LocalizationService.getCurrentLocaleSetting();

      $state.rangeSelected = 'week';
      $scope.showMonthComponent = false;

      $scope.$on('dateSelectionChanged', dateRangeChanged);

      $scope.$on('$stateChangeSuccess', function () {
        configureRealTime();
      });

      $scope.setCustomRangeActive = setCustomRangeActive;
      $scope.dateRangeIsSetToCustom = dateRangeIsSetToCustom;
      $scope.setDateRange = setDateRange;
      $scope.changeOperatingHoursType = changeOperatingHoursType;
      $scope.sendToRealTime = sendToRealTime;
      $scope.showBusinessHourOption = getShowBusinessHours();
      $scope.setDateRangeChange = setDateRangeChange;
      $scope.updateDateRangeForMi = updateDateRangeForMi;

      activate();

      function activate () {
        loadTranslations().then(() => {
          getStandardShortcuts(); // This needs to be called first as the $scope.dateRangeShortcuts are used quite early
          configureRealTime();
          checkIfCurrentCalendarHasExpired();
          LocalizationService.setOrganization($scope.currentOrganization);
  
          if ($state.current.name.indexOf('marketIntelligence') !== -1) {
            $scope.hasOnlyOneCompare = true;
          }
  
          if ($state.miOpen) {
            // This is used when the MI csv export modal is open
            $scope.hasOnlyOneCompare = true;
          }
  
          if (ObjectUtils.isNullOrUndefined($scope.selectedDateRange)) {
            $scope.selectedDateRange = {
              start: $stateParams.dateRangeStart,
              end: $stateParams.dateRangeEnd
            };
          }
  
          if ($stateParams.compareRange1Start && $stateParams.compareRange1End) {
            $scope.compareRange1 = {
              start: $stateParams.compareRange1Start,
              end: $stateParams.compareRange1End
            };
          }
  
          if ($stateParams.compareRange2Start && $stateParams.compareRange2End) {
            $scope.compareRange2 = {
              start: $stateParams.compareRange2Start,
              end: $stateParams.compareRange2End
            };
          }
  
          if ($stateParams.activeShortcut) {
            $scope.activeShortcut = $stateParams.activeShortcut;
          }
  
          $scope.operatingHours = {
            selected: operatingHoursService.getOperatingHoursSetting($stateParams, $scope.currentOrganization)
          };
  
          loadCalendars();
          $scope.dateFormat = LocalizationService.getCurrentDateFormat($scope.currentOrganization);
        });
      }

      function getStandardShortcuts() {
        $scope.dateRangeShortcuts = [{
          'label': $scope.translatedLabels.day,
          'type': 'day'
        }, {
          'label': $scope.translatedLabels.week,
          'type': 'week'
        }, {
          'label': $scope.translatedLabels.month,
          'type': 'month'
        }, {
          'label': $scope.translatedLabels.year,
          'type': 'year'
        }];
      }

      function checkIfCurrentCalendarHasExpired() {
        if (LocalizationService.isCurrentCalendarGregorian(true)) {
          return;
        }

        $scope.currentCalendarIsExpired = LocalizationService.currentCalendarHasExpired();

        if ($scope.currentCalendarIsExpired) {
          $scope.calendarName = LocalizationService.getCurrentCalendarName();
        }
      }

      function loadCalendars() {
        LocalizationService.getAllCalendars().then(function (calendars) {
          $scope.allCalendars = LocalizationService.setAllCalendars(calendars.result);
          $scope.organizationCalendars = calendars.result;
          $scope.calendarsLoaded = true;

          setActiveDateRange();
        }).catch(error => {
          console.error(error);
        });
      }

      function setActiveDateRange() {
        if (localStorageService.get('calendarUpdateFlag') === 'true') {
          setDateRangeToWeek('week');
          localStorageService.set('calendarUpdateFlag', 'false');
          return;
        }

        // Any *-to date selections fall into this block
        if (!ObjectUtils.isNullOrUndefined($scope.activeShortcut)) {
          $scope.activeDateRange = 'custom';
          return;
        }

        if (dateRangeIsSetTo('week')) {
          $scope.activeDateRange = 'week';
          return;
        }

        if (dateRangeIsSetTo('day')) {
          $scope.activeDateRange = 'day';
          return;
        }

        if (dateRangeIsSetTo('month')) {
          $scope.activeDateRange = 'month';
          return;
        }

        if (dateRangeIsSetTo('year')) {
          $scope.activeDateRange = 'year';
          return;
        }

        if (dateRangeIsSetToCustom()) {
          $state.rangeSelected = 'custom';
          $scope.activeDateRange = 'custom';
        }
      }

      function dateRangeIsSetTo(type) {
        if ($scope.calendarsLoaded === false) {
          return false;
        }

        if (_.isUndefined($scope.currentUser)) {
          return false;
        }

        $state.rangeSelected = type;

        var ranges = dateRangeService.getSelectedAndCompareRanges(type, $scope.currentUser, $scope.currentOrganization, $scope.hasOnlyOneCompare);

        return ($scope.selectedDateRange.start.format('DD.MM.YYYY') === ranges.selectedPeriod.start.format('DD.MM.YYYY') &&
            $scope.selectedDateRange.end.format('DD.MM.YYYY') === ranges.selectedPeriod.end.format('DD.MM.YYYY')) ||
          $scope.selectedPreset === type;
      }

      function dateRangeIsSetToCustom() {
        for (var i in $scope.dateRangeShortcuts) {
          var shortcut = $scope.dateRangeShortcuts[i];
          if (dateRangeIsSetTo(shortcut.type)) {
            return false;
          }
        }
        return true;
      }

      function dateRangeChanged(event, data) {
        $scope.realTimeDataShown = false;
        if ($state.miOpen) {
          $state.csvParams = {
            dateRangeStart: data.dateStart,
            dateRangeEnd: data.dateEnd,
            compareRange1Start: data.compareStart,
            compareRange1End: data.compareEnd
          };
          return;
        }
        $timeout(function () {
          $state.go(getStateName(), {
            dateRangeStart: data.dateStart || $scope.selectedDateRange.start,
            dateRangeEnd: data.dateEnd || $scope.selectedDateRange.end,
            compareRange1Start: data.compareStart || $scope.compareRange1.start,
            compareRange1End: data.compareEnd || $scope.compareRange1.end,
            compareRange2Start: data.compare2Start || $scope.compareRange2.start,
            compareRange2End: data.compare2End || $scope.compareRange2.end,
            activeShortcut: data.activeShortcut || $scope.activeShortcut
          });
        });

      }

      function getStateName() {
        if ($scope.realTimeDataShown === true || !ObjectUtils.isNullOrUndefinedOrBlank($stateParams.returnState)) {
          return $stateParams.returnState;
        }
        return $state.$current.name;
      }

      function setDateRange(type) {
        googleAnalytics.trackUserEvent('date shortcut', type);
        $scope.activeDateRange = type;
        //show month component if month button clicked
        if (type === 'month') {
          $scope.showMonthComponent = true;
          return;
        } else {
          $scope.showMonthComponent = false;
        }

        var ranges = dateRangeService.getSelectedAndCompareRanges(type, $scope.currentUser, $scope.currentOrganization, $scope.hasOnlyOneCompare);

        var newStateParams = {
          dateRangeStart: ranges.selectedPeriod.start,
          dateRangeEnd: ranges.selectedPeriod.end,
          compareRange1Start: ranges.comparePeriod1.start,
          compareRange1End: ranges.comparePeriod1.end,
          activeShortcut: undefined
        };

        if (!_.isUndefined(ranges.comparePeriod2)) {
          newStateParams.compareRange2Start = ranges.comparePeriod2.start;
          newStateParams.compareRange2End = ranges.comparePeriod2.end;
        }

        if ($state.current.name === 'analytics.organization.marketIntelligence.dashboard') {
          $rootScope.$broadcast('resetDateRangesChanged');
        }

        if ($state.miOpen) {
          $scope.selectedDateRange = {
            start: newStateParams.dateRangeStart,
            end: newStateParams.dateRangeEnd
          };
          return $rootScope.$broadcast('dateRangesChanged', newStateParams);
        }

        $timeout(function () {
          if (!ObjectUtils.isNullOrUndefined(newStateParams)) {
            var stateName = getStateName();

            if (ObjectUtils.isNullOrUndefined(stateName)) {
              stateName = 'analytics.organization.retail';
            }

            $scope.realTimeDataShown = false;

            $state.go(stateName, newStateParams);
          }
          $scope.selectedPreset = type;
        });
      }

      function sendToRealTime() {
        if ($scope.realTimeDataShown === true || $stateParams.returnState === $state.$current.name) {
          return;
        }
        $scope.realTimeDataShown = true;
        var selectedDateRanges = {
          current: $scope.selectedDateRange,
          compare1: $scope.compareRange1,
          compare2: $scope.compareRange2
        };
        localStorageService.set('selectedDateRanges', JSON.stringify(selectedDateRanges));
        goToRealTimeData();
      }

      function goToRealTimeData() {
        var params = {
          realTimeDataShown: $scope.realTimeDataShown,
          returnState: $state.$current.name,
          dateRangeStart: utils.getDateStringForRequest(now),
          dateRangeEnd: utils.getDateStringForRequest(now.startOf('day').subtract(1, 'day')),
          compareRange1Start: $scope.compareRange1.start,
          compareRange1End: $scope.compareRange1.end,
          compareRange2Start: $scope.compareRange2.start,
          compareRange2End: $scope.compareRange2.end,
          businessDays: !$scope.operatingHours
        };

        $state.go(getRealTimeStateName(), params);
      }

      function getRealTimeStateName() {
        if ($state.$current.name.indexOf('site') < 0) {
          return 'analytics.organization.real-time-data';
        }
        return 'analytics.organization.site.real-time-data';
      }

      function setCustomRangeActive() {
        $scope.showDateRangePicker = !$scope.showDateRangePicker;
        $scope.activeDateRange = 'custom';
        $scope.showMonthComponent = false;
      }

      function changeOperatingHoursType() {
        operatingHoursService.setOperatingHours($scope.operatingHours.selected);

        var businessDays = !$scope.operatingHours.selected;

        if ($state.$current.name.indexOf('real-time') >= 0) {
          $rootScope.$broadcast('businessDayChanged', businessDays);
          return;
        }

        var params = {
          businessDays: businessDays,
        };

        var stateName = getStateName();

        if (stateName === 'analytics.organization.retail') {
          params.compareMode = operatingHoursService.getCompareMode();
        }

        $state.go(stateName, params);
      }

      function loadTranslations() {
        const deferred = $q.defer();
        $translate.use($scope.language);

        var transKeys = [
          'common.DAY',
          'common.WEEK',
          'common.MONTH',
          'common.YEAR'
        ];

        $scope.translatedLabels = {};

        $translate(transKeys).then(function (translations) {
          $scope.translatedLabels.day = translations[transKeys[0]];
          $scope.translatedLabels.week = translations[transKeys[1]];
          $scope.translatedLabels.month = translations[transKeys[2]];
          $scope.translatedLabels.year = translations[transKeys[3]];
          deferred.resolve();
        });

        return deferred.promise;
      }

      function configureRealTime() {
        if (ObjectUtils.isNullOrUndefined($scope.realTimeDataShown)) {
          $scope.realTimeDataShown = $stateParams.realTimeDataShown;
        }

        if (ObjectUtils.isNullOrUndefined($scope.realTimeDataShown)) {
          $scope.realTimeDataShown = false;
        }

        if ($state.miOpen) {
          $scope.showRealTimeData = false;
        } else {
          $scope.showRealTimeData = SubscriptionsService.hasRealTime($scope.currentOrganization) && !isCurrentStateMarketIntelligence();
        }

        //when current site selected if site's customer_site_id not defined site doesn't have real time data so api returns error so hide the button
        if (!ObjectUtils.isNullOrUndefined($scope.$parent.currentSite) &&
          ObjectUtils.isNullOrUndefined($scope.$parent.currentSite.customer_site_id)) {
          $scope.showRealTimeData = false;
        }
      }

      function isCurrentStateMarketIntelligence() {
        return $state.current.name.indexOf('marketIntelligence') > -1;
      }

      function getShowBusinessHours() {
        if ($state.current.data.title === 'Retail Organization Summary') {
          return true;
        }

        if ($state.current.data.title === 'Traffic') {
          return true;
        }

        if ($state.$current.name.indexOf('real-time') > -1) {
          return true;
        }

        if ($state.current.data.title === 'Hourly') {
          return true;
        }

        return false;
      }

      function setDateRangeChange(type) {
        this.setDateRange(type);
        localStorageService.set('calendarUpdateFlag', 'false')
      }

      function setDateRangeToWeek(type) {
        $state.rangeSelected = type;
        googleAnalytics.trackUserEvent('date shortcut', type);
        $scope.activeDateRange = type;

        var ranges = dateRangeService.getSelectedAndCompareRanges(type, $scope.currentUser, $scope.currentOrganization, $scope.hasOnlyOneCompare);
        var newStateParams = {
          dateRangeStart: ranges.selectedPeriod.start,
          dateRangeEnd: ranges.selectedPeriod.end,
          compareRange1Start: ranges.comparePeriod1.start,
          compareRange1End: ranges.comparePeriod1.end,
          activeShortcut: undefined
        };

        if (!_.isUndefined(ranges.comparePeriod2)) {
          newStateParams.compareRange2Start = ranges.comparePeriod2.start;
          newStateParams.compareRange2End = ranges.comparePeriod2.end;
        }
        $scope.selectedDateRange = {
          start: newStateParams.dateRangeStart,
          end: newStateParams.dateRangeEnd
        };
      }

      /**
       * This method gets called when we click any (Jan - dec) months in new month component
       * passing data from child component (calendar-month-component.js) to this parent controller
       * This method  updates the selectedDateRange with the newly selected date values
       * @param {input} selectedDateRangeForMi : newly selected date range values
       * 
       */
      function updateDateRangeForMi (selectedDateRangeForMi) {
        $scope.selectedDateRange = selectedDateRangeForMi;
      }

    }
  ]);
