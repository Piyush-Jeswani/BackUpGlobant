(function () {
  'use strict';

  angular.module('shopperTrak')
    .directive('dateRangePicker', dateRangePicker);

  function dateRangePicker() {
    return {
      restrict: 'E',
      templateUrl: 'components/date-range-picker/date-range-picker.partial.html',
      scope: {
        visible: '=',
        align: '@',
        selectedRange: '=',
        compareRange1: '=?',
        compareRange2: '=?',
        dateFormatMask: '=?',
        currentOrganization: '=',
        organizationCalendars: '=?',
        allCalendars: '=?',
        currentUser: '=',
        language: '=',
        showCompareOptions: '=',
        realTimeDataShown: '=?',
        hasOnlyOneCompare:'=',
        activeShortcut: '=?'
      },
      link: linkPicker,
      bindToController: true,
      controller: dateRangePickerController,
      controllerAs: 'vm'
    };

    function linkPicker(scope, element, attrs) {
      if (scope.vm.align === 'left') {
        attrs.$set('class', 'date-range-picker align-left');
      } else {
        attrs.$set('class', 'date-range-picker');
      }
    }
  }

  dateRangePickerController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    'LocalizationService',
    'utils',
    'apiUrl',
    '$translate',
    '$filter',
    'comparisons',
    'ObjectUtils',
    'localStorageService',
    'googleAnalytics',
    'dateRangeService'
  ];

  function dateRangePickerController(
    $scope,
    $rootScope,
    $state,
    LocalizationService,
    utils,
    apiUrl,
    $translate,
    $filter,
    comparisons,
    ObjectUtils,
    localStorageService,
    googleAnalytics,
    dateRangeService
  ) {
    var vm = this;
    var internalDateFormat = 'YYYY-MM-DD';

    vm.touched = {
      'selected': false,
      'compare1': false,
      'compare2': false
    };

    vm.activeInput = 'start';
    vm.periodType = 'selected';
    vm.maxCompareWeeks = 200;
    vm.periodStart = {};
    vm.periodEnd = {};
    vm.weeksAgo = {};
    vm.useCustomCompare = {};
    vm.firstDaySetting = null;
    vm.defaults = {
      selected: {},
      compare1: {},
      compare2: {}
    };

    loadTranslations();

    vm.setActiveInput = setActiveInput;
    vm.dateIsInRange = dateIsInRange;
    vm.dateIsSelected = dateIsSelected;
    vm.dateIsInFuture = dateIsInFuture;
    vm.selectDate = selectDate;
    vm.navigateToPreviousMonth = navigateToPreviousMonth;
    vm.navigateToNextMonth = navigateToNextMonth;
    vm.applySelectedRange = applySelectedRange;
    vm.cancelSelection = cancelSelection;
    vm.changePeriod = changePeriod;
    vm.dateIsDisabled = dateIsDisabled;
    vm.miDateIsDisabled = miDateIsDisabled;
    vm.useShortCut = useShortCut;
    vm.canBeSavedAsDefault = canBeSavedAsDefault;
    vm.setTab = setTab;
    vm.getRangeDiffInDays = getRangeDiffInDays;
    vm.getSelectedDayTitle = getSelectedDayTitle;
    vm.getCurrentTime = getCurrentTime;
    var isRendered = false;

    activate();

    function activate() {
      vm.pickerRendered = false;

      vm.hideWeekNumsIfGreg = LocalizationService.isCurrentCalendarGregorian();

      LocalizationService.setOrganization(vm.currentOrganization);
      LocalizationService.setUser(vm.currentUser);

      vm.shortcuts = getShortCuts(vm.periodType);

      if (jQuery.isEmptyObject(LocalizationService.getWeeksAgo())) {
        copyUsersDefaultComparisonSetting();
      }
      vm.weeksAgo = angular.copy(LocalizationService.getWeeksAgo());
      vm.useCustomCompare = angular.copy(LocalizationService.getCustomCompareSetting());
      customCompareWeeksChanged();

      if (!angular.isDefined(vm.dateFormatMask)) {
        vm.dateFormatMask = 'MM/DD/YYYY';
      }

      configureWatches();

      setFirstDayOfWeek();

      loadSelectedDateRange();

      if (vm.compareRange1 !== undefined &&
        vm.periodStart.compare1 === undefined && vm.periodEnd.compare1 === undefined) {
        vm.periodStart.compare1 = moment(vm.compareRange1.start).startOf('day');
        vm.periodEnd.compare1 = moment(vm.compareRange1.end).startOf('day');
        vm.defaults.compare1 = {
          start: vm.periodStart.compare1,
          end: vm.periodEnd.compare1
        };
      }

      if (vm.compareRange2 !== undefined &&
        vm.periodStart.compare2 === undefined && vm.periodEnd.compare2 === undefined) {
        vm.periodStart.compare2 = moment(vm.compareRange2.start).startOf('day');
        vm.periodEnd.compare2 = moment(vm.compareRange2.end).startOf('day');
        vm.defaults.compare2 = {
          start: vm.periodStart.compare2,
          end: vm.periodEnd.compare2
        };
      }

      vm.compare1Period = vm.defaults.compare1;
      vm.compare2Period = vm.defaults.compare2;

      vm.startOfCalendar = LocalizationService.getStartOfCurrentCalendar();
      vm.endOfCalendar = LocalizationService.getEndOfCurrentCalendar();

      if ($state.miOpen) {
        loadDefaultCompareRanges();
      }
    }

    function configureWatches() {
      var unbindFunctions = [];

      if($state.miOpen) {
        var unbindDateRangeWatch = $scope.$on('dateRangesChanged', function (event, data, type) {
          updateSelectedDateRange(data, type);
        });

        unbindFunctions.push(unbindDateRangeWatch);
      }

      if($state.current.name === 'analytics.organization.marketIntelligence.dashboard') {
        var unbindResetDateRangeWatch = $scope.$on('resetDateRangesChanged', function () {
          setTab('selected');
          cancelSelection();
        });

        unbindFunctions.push(unbindResetDateRangeWatch);
      }

      var unbindSelectedRangeWatch = $scope.$watchCollection('vm.selectedRange', loadSelectedDateRange);
      unbindFunctions.push(unbindSelectedRangeWatch);

      var allCalendarsWatch = $scope.$watch('vm.allCalendars', function () {
        if (vm.allCalendars !== undefined) {
          LocalizationService.setAllCalendars(vm.allCalendars);
        }
      });
      unbindFunctions.push(allCalendarsWatch);

      var unbindCalendarWatch = $scope.$watchGroup(['vm.selectedMonth', 'vm.selectedYear', 'vm.organizationCalendars'], loadCalendarPicker);
      unbindFunctions.push(unbindCalendarWatch);

      var unbindWeeksAgoWatch = $scope.$watchCollection('vm.weeksAgo', customCompareWeeksChanged);
      unbindFunctions.push(unbindWeeksAgoWatch);

      var unbindUseCustomCompareWatch = $scope.$watchCollection('vm.useCustomCompare', customCompareWeeksChanged);
      unbindFunctions.push(unbindUseCustomCompareWatch);

      $scope.$on('$destroy', function() {
        _.each(unbindFunctions, function(unbindFunction) {
          if(angular.isFunction(unbindFunction)) {
            unbindFunction();
          }
        });
      });
    }

    function updateSelectedDateRange(passedRange, type) {
      vm.updated = true;

      if (!ObjectUtils.isNullOrUndefined(passedRange) && !ObjectUtils.isNullOrUndefined(passedRange.dateRangeStart)) {
        vm.periodStart.selected = moment(passedRange.dateRangeStart).startOf('day');
        vm.periodEnd.selected = moment(passedRange.dateRangeEnd).endOf('day');
        vm.defaults.selected = {
          start: vm.periodStart.selected,
          end: vm.periodEnd.selected
        };
      }
      if (!ObjectUtils.isNullOrUndefined(passedRange) && !ObjectUtils.isNullOrUndefined(passedRange.compareRange1Start)) {
        vm.periodStart.compare1 = moment(passedRange.compareRange1Start).startOf('day');
        vm.periodEnd.compare1 = moment(passedRange.compareRange1End).endOf('day');
        vm.defaults.compare1 = {
          start: vm.periodStart.compare1,
          end: vm.periodEnd.compare1
        };
      }
      customCompareWeeksChanged();
      
      if(type === 'year') {
        updateSelections();
      }    
    }

    function updateSelections() {
      vm.selectedMonth = vm.periodStart.selected.month();
      vm.selectedYear = vm.periodStart.selected.format('YYYY');
      if(vm.selectedMonth === 0 ) {
        vm.selectedMonth += 1;
      }

      vm.currentMonth = vm.selectedMonth;
      var renderedYear = Number(vm.selectedYear);
      vm.startMonth = LocalizationService.getFirstMonthOfYear(renderedYear);
      vm.firstDayOfYear = LocalizationService.getFirstDayOfYear(renderedYear);
      vm.firstDayOfMonth = LocalizationService.getFirstDayOfMonth(vm.selectedMonth, renderedYear);
      vm.calendarData = getMonthsToShow(vm.selectedMonth, renderedYear);
      vm.startOfSelection = getFirstDayOfSelection(vm.calendarData);
      vm.endOfSelection = getLastDayOfSelection(vm.calendarData);
      vm.endOfCurrentMonth = getLastDayOfCurrentMonth();

      setFirstDayOfWeek();
      setComparePeriodTitles();
    }

    function loadSelectedDateRange() {
      if (vm.updated) {
        return;
      }
      if (vm.selectedRange !== undefined && vm.selectedRange.start !== undefined &&
        vm.periodStart.selected === undefined && vm.periodEnd.selected === undefined) {
        vm.periodStart.selected = angular.copy(moment(vm.selectedRange.start).startOf('day'));
        vm.periodEnd.selected = angular.copy(moment(vm.selectedRange.end).endOf('day'));
        vm.defaults.selected = {
          start: vm.periodStart.selected,
          end: vm.periodEnd.selected
        };
      }
    }

    function setActiveInput(inputType) {
      if (inputType === vm.activeInput) {
        return;
      }

      vm.activeInput = inputType;
      setCssClassesForAllDays();
    }

    function dateIsPreviousMonth(date) {
      var week = weekOfMonth(date);

      if (week === 0 && date.format('D') > 23) {
        return true;
      }

      if (week > 2 && date.format('D') < 7) {
        return true;
      }
      return false;
    }

    function dateIsInRange(date) {
      if (vm.periodStart[vm.periodType] !== undefined && vm.periodEnd[vm.periodType] !== undefined &&
        date >= vm.periodStart[vm.periodType] && date <= vm.periodEnd[vm.periodType]) {
        return true;
      } else {
        return false;
      }
    }

    function dateIsSelected(date) {
      if (vm.periodStart[vm.periodType] !== undefined &&
        typeof date.isValid === 'function' && date.isValid() &&
        date.format('YY-MM-DD') === vm.periodStart[vm.periodType].format('YY-MM-DD')) {
        return true;
      } else if (vm.periodEnd[vm.periodType] !== undefined &&
        typeof date.isValid === 'function' && date.isValid() &&
        date.format('YY-MM-DD') === vm.periodEnd[vm.periodType].format('YY-MM-DD')) {
        return true;
      } else {
        return false;
      }
    }

    function selectDate(day) {
      //Its possible for the user to click an empty space in the calendar sometimes 
      //due to changing of the starting day of the week. When this happens we are returned an 
      //empty object. We check for this here and early out.

      if (Object.keys(day).length === 0)  return;

      if (day.cssClass.indexOf('disabled') >= 0) {
        return;
      }

      var date = angular.copy(day.dateObject);
      vm.touched[vm.periodType] = true;

      // @todo: This will be altered to use state's shortcut param in future after SA-1027 is merged
      localStorageService.set('currentDateRangeShortcut', null); // clear setting

      if (vm.activeInput === 'start') {
        if ((vm.periodEnd[vm.periodType] === undefined || date < vm.periodEnd[vm.periodType]) &&
          date !== '' && date < moment().subtract(1, 'day')) {
          vm.periodStart[vm.periodType] = date.startOf('day');
          vm.activeInput = 'end';
        }
      } else if (vm.activeInput === 'end') {
        if ((vm.periodStart[vm.periodType] === undefined || date >= vm.periodStart[vm.periodType]) &&
          date !== '' && date < moment().subtract(1, 'day')) {
          vm.periodEnd[vm.periodType] = date.endOf('day');
        }
      }

      if (vm.periodType === 'selected') {
        loadDefaultCompareRanges();
      } else {
        vm.useCustomCompare[vm.periodType] = false;
      }
      setComparePeriodTitles();
      setCssClassesForAllDays();
      setCompareRange1Message();
      vm.activeShortcut = undefined;
    }

    function setComparePeriodTitles() {
      var period1Comparison = getComparison(vm.periodStart.compare1, vm.periodEnd.compare1);
      
      switch (period1Comparison) {
        case 'priorPeriod':
          vm.compareRange1Title = 'common.PRIORPERIOD';
          break;
        case 'priorYear':
          vm.compareRange1Title = 'common.PRIORYEAR';
          break;
        case 'custom':
          vm.compareRange1Title = 'common.CUSTOMCOMPARE1';
          break;
      }

      var period2Comparison = getComparison(vm.periodStart.compare2, vm.periodEnd.compare2);
      switch (period2Comparison) {
        case 'priorPeriod':
          vm.compareRange2Title = 'common.PRIORPERIOD';
          break;
        case 'priorYear':
          vm.compareRange2Title = 'common.PRIORYEAR';
          break;
        case 'custom':
          vm.compareRange2Title = 'common.CUSTOMCOMPARE2';
          break;
      }
    }

    function setCompareRange1Message() {
      if(!isMarketIntelligence()) {
        vm.compareRange1Message = '';
        return;
      }

      var selectedRangeDays = utils.getDaysBetweenDates(vm.periodStart.selected, vm.periodEnd.selected);

      var selectedCompare1Days = utils.getDaysBetweenDates(vm.periodStart.compare1, vm.periodEnd.compare1);

      if(selectedRangeDays !== selectedCompare1Days) {
        vm.compareRange1Message = 'dateRangePicker.UNEQUALNUMBEROFDAYSSLEECTED'
        return;
      }

      vm.compareRange1Message = '';
      return;
    }

    function getComparison(periodStart, periodEnd) {
      var period = {
        start: periodStart,
        end: periodEnd
      };

      if(_.isUndefined(period.start) || _.isUndefined(period.end)) {
        return;
      }

      if(periodMatches('prior_period', period)) {
        return 'priorPeriod';
      }

      if(periodMatches('prior_year', period)) {
        return 'priorYear';
      }

      return 'custom';
    }

    function periodMatches(comparisonName, dates) {
      var selectedPeriod = {
        start: angular.copy(vm.periodStart.selected),
        end: angular.copy(vm.periodEnd.selected)
      };
      
      var periodName;
      
      if(isToDateShortcutActive(vm.activeShortcut)) {
        periodName = vm.activeShortcut;
      }

      var compareRange = dateRangeService.getCustomPeriod(selectedPeriod, vm.currentUser, vm.currentOrganization, periodName, null, comparisonName);
      
      var formatString = 'DD-MM-YYYY'; // Used for comparisons only. Not actually displayed anywhere
      
      return dates.start.format(formatString) === compareRange.start.format(formatString) &&
        dates.end.format(formatString) === compareRange.end.format(formatString)
    }

    function loadDefaultCompareRanges() {
      var numWeeks, periodType, comparePeriod;

      if(ObjectUtils.isNullOrUndefined(vm.periodStart.selected)) {
        return false;
      }

      if (vm.useCustomCompare.compare1) {
        numWeeks = vm.weeksAgo.compare1;
        vm.periodStart.compare1 = angular.copy(vm.periodStart.selected).subtract(numWeeks, 'weeks');
        vm.periodEnd.compare1 = angular.copy(vm.periodEnd.selected).subtract(numWeeks, 'weeks');
      } else if (vm.touched.compare1 === false) {
        periodType = vm.currentUser.preferences.custom_period_1.period_type;

        if(isMarketIntelligence()) {
          periodType = 'prior_year'
        }

        if (periodType !== 'custom') {
          comparePeriod = getComparisonDateRange(periodType);
          vm.periodStart.compare1 = comparePeriod.start;
          vm.periodEnd.compare1 = comparePeriod.end;
        }
      }

      if(vm.periodStart.compare1 < vm.startOfCalendar) {
        loadCompareRangeFromStart('compare1');
      }

      if (vm.useCustomCompare.compare2) {
        numWeeks = vm.weeksAgo.compare2;
        vm.periodStart.compare2 = angular.copy(vm.periodStart.selected).subtract(numWeeks, 'weeks');
        vm.periodEnd.compare2 = angular.copy(vm.periodEnd.selected).subtract(numWeeks, 'weeks');
      } else if (vm.touched.compare2 === false) {
        periodType = vm.currentUser.preferences.custom_period_2.period_type;
        if (periodType !== 'custom') {
          comparePeriod = getComparisonDateRange(periodType);
          vm.periodStart.compare2 = comparePeriod.start;
          vm.periodEnd.compare2 = comparePeriod.end;
        }
      }


      if(vm.periodStart.compare2 < vm.startOfCalendar || ObjectUtils.isNullOrUndefined(vm.periodStart.compare2)) {
        loadCompareRangeFromStart('compare2');
      }
    }

    function isMarketIntelligence() {
      return $state.current.name === 'analytics.organization.marketIntelligence.dashboard' || $state.miOpen;
    }

    function loadCompareRangeFromStart(type) {
      if(ObjectUtils.isNullOrUndefined(vm.periodStart[type])) {
        vm.periodStart[type] = '';
        vm.periodEnd[type] = '';
      }

      var length = vm.periodEnd.selected.diff(vm.periodStart.selected,'days');
      vm.periodStart[type] = vm.startOfCalendar;
      vm.periodEnd[type] = angular.copy(vm.startOfCalendar).add(length, 'days');
    }

    function getComparisonDateRange(type) {
      var selectedPeriod = {
        start: angular.copy(vm.periodStart.selected),
        end: angular.copy(vm.periodEnd.selected)
      };

      var periodName;

      if(isToDateShortcutActive(vm.activeShortcut)) {
        periodName = vm.activeShortcut;
      }

      var comparePeriod = dateRangeService.getCustomPeriod(selectedPeriod, vm.currentUser, vm.currentOrganization, periodName, null, type);

      return comparePeriod;
    }

    /* Do not load calendar picker until organization's calendars are provided for the directive. */
    function loadCalendarPicker() {
      if (vm.organizationCalendars !== undefined && vm.pickerRendered === false) {
        vm.allCalendars = vm.organizationCalendars;
        LocalizationService.setAllCalendars(vm.organizationCalendars);
        vm.pickerRendered = true;
        renderCalendarPicker();
      }
    }

    function renderCalendarPicker() {
      var showDate = LocalizationService.getSystemYearForDate(vm.selectedRange.start);

      if(!LocalizationService.hasMonthDefinitions()) {
        // Gregorian calendar hot mess
        showDate.month -= 1;
      }

      if (vm.selectedMonth === undefined) {
        if (Object.keys(showDate).length > 0) {
          vm.selectedMonth = showDate.month;
        } else if (typeof vm.selectedRange.start !== 'undefined') {
          vm.selectedMonth = vm.selectedRange.start.month();
        }
      }

      if (vm.selectedYear === undefined) {
        if (Object.keys(showDate).length > 0) {
          vm.selectedYear = showDate.year;
        } else if (typeof vm.selectedRange.start !== 'undefined') {
          vm.selectedYear = vm.selectedRange.start.format('YYYY');
        }
      }

      var isCustomCalendar = LocalizationService.hasMonthDefinitions();

      if (isCustomCalendar) {

        if(isRendered !== true) {

          if(vm.selectedMonth === 0 ) {
            vm.selectedMonth += 1;
          }

          vm.currentMonth = vm.selectedMonth;
          isRendered = true;
        }

        var renderedYear = Number(vm.selectedYear);

        vm.startMonth = LocalizationService.getFirstMonthOfYear(renderedYear);
        vm.firstDayOfYear = LocalizationService.getFirstDayOfYear(renderedYear);
        vm.firstDayOfMonth = LocalizationService.getFirstDayOfMonth(vm.selectedMonth, renderedYear);
        vm.calendarData = getMonthsToShow(vm.selectedMonth, renderedYear);
      } else { // greg
        vm.calendarData = getMonthsToShow(vm.selectedMonth, vm.selectedYear);

        if(isRendered !== true) {

          //adjust for 0 index
          if(vm.selectedMonth > 0 ) {
            vm.selectedMonth -= 1;
          }

          //year view adjustment - February in the middle
          if (vm.selectedMonth === 0 ) {
            vm.selectedMonth += 1;
          }

          vm.currentMonth = vm.selectedMonth;
          isRendered = true;

        }

      }

      vm.startOfSelection = getFirstDayOfSelection(vm.calendarData);
      vm.endOfSelection = getLastDayOfSelection(vm.calendarData);
      vm.endOfCurrentMonth = getLastDayOfCurrentMonth();

      setFirstDayOfWeek();
      setComparePeriodTitles();

      if($state.rangeSelected === 'year' && vm.hasOnlyOneCompare) {
        vm.compareRange1Title = 'common.PRIORYEAR';
      }

    }

    function getFirstDayOfSelection(calendarData) {
      var firstDay;
      var firstWeek = calendarData[0]['weeks'][0];

      if(!ObjectUtils.isNullOrUndefined(firstWeek)) {
        var days = angular.copy(firstWeek['days']);

        _.each(days, function (day) {
          if (!ObjectUtils.isNullOrUndefined(day) && ObjectUtils.isNullOrUndefined(firstDay)) {
            firstDay = day.dateObject;
          }
        });

        return firstDay;
      }
    }

    function getLastDayOfSelection(calendarData) {
      var lastDay;
      var lastWeek = calendarData[2]['weeks'][calendarData[2]['weeks'].length-1];

      if(!ObjectUtils.isNullOrUndefined(lastWeek)) {
        var days = angular.copy(lastWeek['days']).reverse();

        _.each(days, function (day) {
          if (!ObjectUtils.isNullOrUndefined(day) && ObjectUtils.isNullOrUndefined(lastDay)) {
            lastDay = day.dateObject;
          }
        });

        return lastDay.endOf('day');
      }
    }

    function getLastDayOfCurrentMonth() {
      return moment().endOf('month');
    }

    function setFirstDayOfWeek() {
      vm.firstDaySetting = LocalizationService.getCurrentCalendarFirstDayOfWeek();

      var weekdayLabels = LocalizationService.getDaysOfWeek(vm.firstDaySetting);

      var weekdayTranskeys = _.map(weekdayLabels, function(weekday) {
        return 'weekdaysShorter.' + weekday;
      });

      vm.weekdayLabels = weekdayTranskeys;

      $rootScope.firstDaySetting = vm.firstDaySetting;
    }

    function getMonthsToShow(selectedMonth, selectedYear) {
      var selectedMonthInt = selectedMonth !== -1 ? Number(selectedMonth) : 0;
      var selectedYearInt = Number(selectedYear);

      var calendarData = {}, selectedSpanMonthIndices = {}, desiredStartDateMonthIndex, jumpBy, index;

      var prev = getPreviousMonth(selectedMonthInt, selectedYearInt);
      var next = getNextMonth(selectedMonthInt, selectedYearInt);

      var months = [{
        month: prev.month,
        year: prev.year
      }, {
        month: selectedMonthInt,
        year: selectedYearInt
      }, {
        month: next.month,
        year: next.year
      }];

      var currentViewSpan = getPeriodRange(vm.periodType);
      var isCustomCalendar = LocalizationService.hasMonthDefinitions();

      if (isCustomCalendar) {
        vm.calType = 'custom';
        _.each(months, function (month, monthIndex) {
          updateCalDataForCustom(calendarData, month, monthIndex, currentViewSpan, selectedSpanMonthIndices);
        });
      } else {
        vm.calType = 'standard';
        _.each(months, function (month, monthIndex) {
          updateCalDataForStandard(calendarData, month, monthIndex, currentViewSpan, selectedSpanMonthIndices);
        });
      }

      desiredStartDateMonthIndex = getMonthIndexForStartDate(selectedSpanMonthIndices);
      if (desiredStartDateMonthIndex !== selectedSpanMonthIndices.startMonthIndex && !vm.hasUsedCalendar) {
        var jumpDirectionAhead = desiredStartDateMonthIndex - selectedSpanMonthIndices.startMonthIndex > 0;
        if (jumpDirectionAhead) {
          jumpBy = desiredStartDateMonthIndex - selectedSpanMonthIndices.startMonthIndex;
          for (index = 0; index < jumpBy; index++) {
            prev = jumpByOne(true, calendarData, isCustomCalendar, prev, 0, currentViewSpan, selectedSpanMonthIndices);
          }
        } else {
          jumpBy = selectedSpanMonthIndices.startMonthIndex - desiredStartDateMonthIndex;
          for (index = 0; index < jumpBy; index++) {
            next = jumpByOne(false, calendarData, isCustomCalendar, next, 2, currentViewSpan, selectedSpanMonthIndices);
          }
        }
      }
      vm.hasUsedCalendar = true;
      return calendarData;
    }

    function jumpByOne(jumpAhead, calendarData, isCustomCalendar, period, newindex, currentViewSpan, selectedSpanMonthIndices) {
      var updatedPeriod;
      if (jumpAhead) {
        calendarData['2'] = calendarData['1'];
        calendarData['1'] = calendarData['0'];
        calendarData['0'] = {};
        updatedPeriod = getPreviousMonth(period.month, period.year);
      } else {
        calendarData['0'] = calendarData['1'];
        calendarData['1'] = calendarData['2'];
        calendarData['2'] = {};
        updatedPeriod = getNextMonth(period.month, period.year);
      }
      if (isCustomCalendar) {
        updateCalDataForCustom(calendarData, updatedPeriod, newindex, currentViewSpan, selectedSpanMonthIndices);
      } else {
        updateCalDataForStandard(calendarData, updatedPeriod, newindex, currentViewSpan, selectedSpanMonthIndices);
      }
      return updatedPeriod;
    }

    function getMonthIndexForStartDate(spanMonthsIndices) {
      if (typeof spanMonthsIndices.startMonthIndex === 'undefined') {
        return 1;
      } else {
        if (typeof spanMonthsIndices.endMonthIndex === 'undefined') {
          return 0;
        }
      }
      if (spanMonthsIndices.endMonthIndex - spanMonthsIndices.startMonthIndex > 1) {
        return 0;
      }
      return 1;
    }

    function updateCalDataForStandard(calendarData, month, monthIndex, currentSelectedSpan, selectedSpanMonthIndices) {
      var day;
      var i = 0, j = 0;

      var m = Number(month.month);
      var y = Number(month.year);

      var lastDayOfMonth = LocalizationService.getLastDayOfMonth(m, y);

      var calendarMonth = m + 1; // Non zero indexed month
      var calendarYear = y;

      var monthString;

      if (calendarMonth < 10) {
        monthString = '0' + calendarMonth.toString();
      } else {
        monthString = calendarMonth.toString();
      }

      var date = moment(calendarYear + '-' + monthString + '-01', internalDateFormat);    

      var firstWeekDay = date.weekday();
      var numDays = lastDayOfMonth.diff(date, 'days') + 1;

      var k;

      calendarData[monthIndex] = initializeMonth();

      calendarData[monthIndex].weeks[0] = {
        weekNumber: null,
        days: []
      };

      // Fix Monday weeks by offsetting days by one
      if (LocalizationService.getCurrentCalendarFirstDayOfWeek() === 1) {
        k = firstWeekDay - 1;
        if (k < 0) { k = k + 7; }
      } else {
        k = firstWeekDay;
      }

      for (i = 0; i < k; i++) {
        calendarData[monthIndex].weeks[0].days.push({});
      }

      var date;
      var h = 0;

      for (j = 1; j <= numDays; j++) {
        if (j < 10) { day = '0' + j.toString(); } else { day = j; }
        if (k === 7) {
          k = 0;
          h++;
          calendarData[monthIndex].weeks[h] = {
            weekNumber: null,
            days: []
          };
        }
        k++;

        date = angular.copy(moment(calendarYear + '-' + calendarMonth + '-' + day, internalDateFormat));

        var dayObject = buildDay(date, j);

        calendarData[monthIndex].weeks[h].days.push(dayObject);
      }

      calendarData[monthIndex].weeks.forEach(function (week) {
        var daysInWeek = getDaysInWeek(week);
        week.weekNumber = LocalizationService.getWeekNumber(daysInWeek);
        if (foundInArray(daysInWeek, currentSelectedSpan.start)) {
          selectedSpanMonthIndices.startMonthIndex = monthIndex;
        }
        if (foundInArray(daysInWeek, currentSelectedSpan.end)) {
          selectedSpanMonthIndices.endMonthIndex = monthIndex;
        }
      });

      var lastDayOfFirstWeek = angular.copy(calendarData[monthIndex].weeks[0].days).pop();

      calendarData[monthIndex].monthKey = buildMonthKey(lastDayOfFirstWeek.dateObject);

      calendarData[monthIndex].monthLabel = buildMonthLabel(lastDayOfFirstWeek.dateObject);
    }

    function updateCalDataForCustom(calendarData, month, monthIndex, currentSelectedSpan, selectedSpanMonthIndices) {
      var day;
      var i = 0, j = 0;
      var year = month.year;

      var m = Number(month.month);

      var numberOfWeeks = LocalizationService.getWeekCountOfMonth(year, m);
      var firstDay = LocalizationService.getFirstDayOfMonth(m, year);

      calendarData[monthIndex] = initializeMonth();

      for (i = 0; i < numberOfWeeks; i++) {
        calendarData[monthIndex].weeks[i] = {
          weekNumber: null,
          days: []
        };

        for (j = 0; j < 7; j++) {
          day = angular.copy(firstDay);
          if (i === 1) {
            day.add(1, 'week');
          } else if (i > 1) {
            day.add(i, 'weeks');
          }

          if (j === 1) {
            day.add(1, 'day');
          } else if (j > 1) {
            day.add(j, 'days');
          }

          var dayObject = buildDay(day, j);

          calendarData[monthIndex].weeks[i].days[j] = dayObject;
        }

        var daysInWeek = getDaysInWeek(calendarData[monthIndex].weeks[i]);

        calendarData[monthIndex].weeks[i].weekNumber = LocalizationService.getWeekNumber(daysInWeek);

        if (foundInArray(daysInWeek, currentSelectedSpan.start)) {
          selectedSpanMonthIndices.startMonthIndex = monthIndex;
        }

        if (foundInArray(daysInWeek, currentSelectedSpan.end)) {
          selectedSpanMonthIndices.endMonthIndex = monthIndex;
        }
      }

      if(ObjectUtils.isNullOrUndefined(calendarData[monthIndex].weeks[1])) {
        calendarData[monthIndex].monthKey = 200;
        calendarData[monthIndex].monthLabel = '';
        return;
      }

      var lastDayOfSecondWeek = calendarData[monthIndex].weeks[1].days[6];

      calendarData[monthIndex].monthKey = buildMonthKey(lastDayOfSecondWeek.dateObject);
      calendarData[monthIndex].monthLabel = buildMonthLabel(lastDayOfSecondWeek.dateObject);
    }

    function foundInArray(array, item) {
      var foundinArray;
      _.each(array, function (arrayItem) {
        if (!foundinArray && typeof arrayItem !== 'undefined' && typeof item !== 'undefined') {
          foundinArray = arrayItem.date() === item.date() && arrayItem.month() === item.month() && arrayItem.year() === item.year();
        }
      });
      return foundinArray;
    }

    function weekOfMonth(date) {
      var prefixes = [0, 1, 2, 3, 4];
      return prefixes[0 | moment(date).date() / 7];  // eslint-disable-line no-bitwise
    }

    function initializeMonth() {
      return {
        monthKey: '',
        monthLabel: '',
        weeks: []
      };
    }

    function buildMonthKey(day) {
      var month = day.format('MM');
      var year = day.format('YYYY');
      return year + month;
    }

    function buildMonthLabel(day) {
      var monthName = day.format('MMMM').toLowerCase();

      var localMonthName = $filter('translate')('monthsLong.' + monthName);

      var year = day.format('YYYY');

      return localMonthName + ' ' + year;
    }

    function buildDay(date, index) {
      return {
        dateObject: date,
        label: date.format('D'),
        cssClass: getCssClassesForDay(date, index)
      };
    }

    function getCssClassesForDay(date) {
      if( ObjectUtils.isNullOrUndefined(date) ) {
        return '';
      }

      var cssClasses = [];

      if (dateIsPreviousMonth(date)) {
        cssClasses.push('prev-month');
      }

      if (dateIsInRange(date)) {
        cssClasses.push('in-range');
      }

      if (dateIsSelected(date)) {
        cssClasses.push('selected');
      }

      if (dateIsDisabled(date)) {
        cssClasses.push('disabled');
      }

      if(miDateIsDisabled(date)){
        cssClasses.push('disabled');
      }

      return cssClasses.join(' ');
    }

    function setCssClassesForAllDays() {
      var months = [];

      months.push(vm.calendarData[0]);
      months.push(vm.calendarData[1]);
      months.push(vm.calendarData[2]);

      // Using a for loop here as we need the speed
      for (var monthIndex = 0; monthIndex < 3; ++monthIndex) {
        var month = months[monthIndex];
        var weeksLength = month.weeks.length;
        for (var weekIndex = 0; weekIndex < weeksLength; ++weekIndex) {
          var week = month.weeks[weekIndex];
          var daysLength = week.days.length;
          for (var dayIndex = 0; dayIndex < daysLength; ++dayIndex) {
            var day = week.days[dayIndex];
            day.cssClass = getCssClassesForDay(day.dateObject, dayIndex);
          }
        }
      }
    }

    function getDaysInWeek(week) {
      return week.days.map(function (day) {
        return day.dateObject;
      });
    }

    function getPreviousMonth(month, year) {
      var previousMonth, previousYear;

      previousMonth = month - 1;

      if (previousMonth < 0) {
        previousMonth = 11;
        previousYear = year - 1;
      } else {
        previousYear = year;
      }
      return { month: previousMonth, year: previousYear };
    }

    function getNextMonth(month, year) {
      var nextMonth, nextYear;
      nextMonth = month + 1;

      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear = year + 1;
      } else {
        nextYear = year;
      }

      return { month: nextMonth, year: nextYear };
    }

    function navigateToPreviousMonth() {
      vm.pickerRendered = false;
      vm.selectedMonth = Number(vm.selectedMonth) - 1;
      if (vm.selectedMonth < 0) {
        vm.selectedMonth = 11;
        vm.selectedYear = Number(vm.selectedYear) - 1;
      }
    }

    function navigateToNextMonth() {
      vm.pickerRendered = false;
      vm.selectedMonth = Number(vm.selectedMonth) + 1;
      if (vm.selectedMonth > 11) {
        vm.selectedMonth = 0;
        vm.selectedYear = Number(vm.selectedYear) + 1;
      }
    }

    function applySelectedRange() {
      if (!ObjectUtils.isNullOrUndefined(vm.key)) {
        $state.customRange = vm.key;
      } else {
        $state.customRange = null;
      }
      vm.hasUsedCalendar = false;
      vm.selectedRange = {};
      vm.selectedRange.start = vm.periodStart.selected;
      vm.selectedRange.end = vm.periodEnd.selected;

      LocalizationService.setWeeksAgo(vm.weeksAgo);
      LocalizationService.setCustomCompareSetting(vm.useCustomCompare);

      vm.compareRange1 = {};
      vm.compareRange1.start = vm.periodStart.compare1;
      vm.compareRange1.end = vm.periodEnd.compare1;

      vm.compareRange2 = {};
      vm.compareRange2.start = vm.periodStart.compare2;
      vm.compareRange2.end = vm.periodEnd.compare2;

      $rootScope.$broadcast('dateSelectionChanged', {
        compare2End: vm.periodEnd.compare2,
        compare2Start: vm.periodStart.compare2,
        compareEnd: vm.periodEnd.compare1,
        compareStart: vm.periodStart.compare1,
        dateEnd: vm.periodEnd.selected,
        dateStart: vm.periodStart.selected,
        activeShortcut: vm.activeShortcut
      });

      vm.visible = false;
      vm.key = null;

    }

    function dateIsInFuture(date) {
      if (date !== undefined && date !== '') {
        var yesterday = angular.copy(date).add(1, 'day');
        if (yesterday > moment()) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }

    function cancelSelection() {
      var hasCompareOptions = vm.showCompareOptions === true;

      if (vm.weeksAgo !== LocalizationService.getWeeksAgo) {
        vm.weeksAgo = angular.copy(LocalizationService.getWeeksAgo());
      }

      if (vm.useCustomCompare !== LocalizationService.getCustomCompareSetting()) {
        vm.useCustomCompare = angular.copy(LocalizationService.getCustomCompareSetting());
      }

      //Reset date-ranges to default values.
      vm.periodStart.selected = vm.selectedRange.start;
      vm.periodEnd.selected = vm.selectedRange.end;

      if (hasCompareOptions) {
        vm.periodStart.compare1 = vm.compareRange1.start;
        vm.periodEnd.compare1 = vm.compareRange1.end;

        if(!vm.hasOnlyOneCompare) {
          vm.periodStart.compare2 = vm.compareRange2.start;
          vm.periodEnd.compare2 = vm.compareRange2.end;
        }
      }

      vm.touched = {
        'selected': false,
        'compare1': false,
        'compare2': false
      };
      vm.activeInput = 'start';
      vm.periodType = 'selected';
      vm.visible = false;

      if (hasCompareOptions) {
        setComparePeriodTitles();
      }
      setCssClassesForAllDays();

      setCompareRange1Message();
    }

    function dateIsDisabled(day) {
      return (vm.activeInput === 'start' && day > vm.periodEnd[vm.periodType] ||
        vm.activeInput === 'end' && day < vm.periodStart[vm.periodType]) ||
        vm.dateIsInFuture(day);
    }

    function miDateIsDisabled(day) {
      if (isMarketIntelligence()) {
        vm.maxCompareWeeks = 61;
        var noOfDaysToCheck = 427;
        if (!_.isUndefined(vm.activeInput) && !_.isUndefined(vm.periodType) && !_.isUndefined(vm.periodStart)) {
          if (vm.activeInput === 'start' && vm.periodType === 'compare1') {
            if (_.has(vm.periodStart, 'selected') && _.has(vm.periodStart, 'compare1')) {
              var diffDays = vm.periodStart.selected.diff(vm.periodStart.compare1, 'days');
              var daysToEnable = Math.abs(noOfDaysToCheck - diffDays);
              return moment(day) < moment(vm.periodStart[vm.periodType]).subtract(daysToEnable, 'day');
            }
          }
        }
      }
      return false;
    }

    function changePeriod(type) {
      vm.periodType = type;
      vm.activeInput = 'start';
    }

    function customCompareWeeksChanged() {
      var selectedStart = angular.copy(vm.periodStart.selected);
      var selectedEnd = angular.copy(vm.periodEnd.selected);

      if (vm.useCustomCompare[vm.periodType] === true && vm.weeksAgo[vm.periodType] > 0) {
        vm.periodStart[vm.periodType] = selectedStart.subtract(vm.weeksAgo[vm.periodType], 'weeks');
        vm.periodEnd[vm.periodType] = selectedEnd.subtract(vm.weeksAgo[vm.periodType], 'weeks')

        vm.pickerRendered = false;
        vm.selectedMonth = vm.periodStart[vm.periodType].month() - 1;
        vm.selectedYear = vm.periodStart[vm.periodType].year();
      }

      if (typeof vm.calendarData !== 'undefined') {
        setComparePeriodTitles();
        setCssClassesForAllDays();
        setCompareRange1Message();
      }
    }

    function getShortCuts(periodType) {
      var shortcuts;
      if (periodType === 'selected') {
        shortcuts = {
          wtd: 'dateRangePicker.WEEKTODATE',
          mtd: 'dateRangePicker.MONTHTODATE',
          qtd: 'dateRangePicker.QUARTERTODATE',
          ytd: 'dateRangePicker.YEARTODATE'
        };
      } else {
        shortcuts = {
          priorPeriod: 'common.PRIORPERIOD',
          priorYear: 'common.PRIORYEAR'
        };
      }
      return shortcuts;
    }

    function getCurrentTime() {
      return moment();
    }

    function useShortCut(key) {
      googleAnalytics.trackUserEvent('date shortcut', key);
      // @todo: This will be altered to use state's shortcut param in future after SA-1027 is merged
      localStorageService.set('currentDateRangeShortcut',key);

      vm.touched = {
        selected: false,
        compare1: false,
        compare2: false
      };

      switch (key) {
        case 'wtd':
        case 'mtd':
        case 'qtd':
        case 'ytd':
          var ranges = dateRangeService.getSelectedAndCompareRanges(key, vm.currentUser, vm.currentOrganization);

          vm.periodStart.selected = ranges.selectedPeriod.start;
          vm.periodEnd.selected = ranges.selectedPeriod.end;

          vm.periodStart.compare1 = ranges.comparePeriod1.start;
          vm.periodEnd.compare1 = ranges.comparePeriod1.end;

          vm.periodStart.compare2 = ranges.comparePeriod2.start;
          vm.periodEnd.compare2 = ranges.comparePeriod2.end;

          vm.activeShortcut = key;
          break;
        case 'priorPeriod':
          useComparePeriodShortcut(vm.periodType, 'prior_period');
          break;
        case 'priorYear':
          useComparePeriodShortcut(vm.periodType, 'prior_year');
          break;
        default:
          break;
      }

      vm.pickerRendered = false;
      setComparePeriodTitles();
      setCompareRange1Message();
      setCssClassesForAllDays();
      vm.key = key;

      var isYear = (key === 'ytd' || key === 'priorYear');

      if(vm.hasOnlyOneCompare && isYear) {
        vm.compareRange1Title = 'common.PRIORYEAR'
      }
    }

    function useComparePeriodShortcut(periodType, comparisonName) {
      var selectedPeriod = {
        start: vm.periodStart.selected,
        end: vm.periodEnd.selected
      };

      var periodName;

      if(isToDateShortcutActive(vm.activeShortcut)) {
        periodName = vm.activeShortcut;
      }

      var compareRange = dateRangeService.getCustomPeriod(selectedPeriod, vm.currentUser, vm.currentOrganization, periodName, null, comparisonName);

      vm.periodStart[periodType] = compareRange.start;
      vm.periodEnd[periodType] = compareRange.end;
      vm.useCustomCompare[periodType] = false;
      vm.weeksAgo[periodType] = null;
      vm.touched.compare1 = true;
      vm.touched.compare2 = true;
    }

    function isToDateShortcutActive(shortcut) {
      if(shortcut === 'ytd') {
        return true;
      }

      if(shortcut === 'qtd') {
        return true;
      }

      if(shortcut === 'mtd') {
        return true;
      }

      if(shortcut === 'wtd') {
        return true;
      }

      return false;
    }

    function canBeSavedAsDefault(type) {
      if (vm.weeksAgo[type] !== undefined && vm.weeksAgo[type] > 0 && vm.useCustomCompare[type]) {
        return true;
      } else {
        return false;
      }
    }

    function copyUsersDefaultComparisonSetting() {
      var preferences = vm.currentUser.preferences;
      var weeksAgo = {};
      var customCompare = {};

      var customPeriod = _.findWhere(comparisons, { valueKey: 'custom' });

      if (preferences.custom_period_1.period_type === customPeriod.value) {
        weeksAgo.compare1 = preferences.custom_period_1.num_weeks;
        customCompare.compare1 = true;
      }

      if (preferences.custom_period_2.period_type === customPeriod.value) {
        weeksAgo.compare2 = preferences.custom_period_2.num_weeks;
        customCompare.compare2 = true;
      }

      LocalizationService.setWeeksAgo(weeksAgo);
      LocalizationService.setCustomCompareSetting(customCompare);
    }

    function getPeriodRange(type) {
      switch (type) {
        case 'selected':
          return vm.selectedRange;
        case 'compare1':
          return vm.compare1Period;
        case 'compare2':
          return vm.compare2Period;
        default:
          return vm.selectedRange;
      }
    }

    function setTab(type) {
      if (vm.periodType === type) {
        return;
      }
      vm.periodType = type;

      vm.shortcuts = getShortCuts(type);

      var showDate = LocalizationService.getSystemYearForDate(vm.periodStart[type]);

      if(!LocalizationService.hasMonthDefinitions() ) {
        showDate.month -= 1;
      }

      var periodRange = getPeriodRange(type);

      if(!ObjectUtils.isNullOrUndefined(showDate.month)) {
        vm.selectedMonth = showDate.month;
      } else if (typeof periodRange.start !== 'undefined') {
        vm.selectedMonth = periodRange.start.month();
      } else {
        vm.selectedMonth = moment().month();
      }

      if(!ObjectUtils.isNullOrUndefined(showDate.year)) {
        vm.selectedYear = showDate.year;
      } else if (typeof periodRange.start !== 'undefined') {
        vm.selectedYear = periodRange.start.format('YYYY');
      } else {
        vm.selectedYear = moment().format('YYYY');
      }

      // @todo: check if selectedMonth and year are in the scope of defined years in calendar config (see MOMA fiscal)

      vm.pickerRendered = false;
      setCssClassesForAllDays();
    }

    function getRangeDiffInDays(start, end) {
      var rangeEnd = angular.copy(end).add(1, 'day');
      return rangeEnd.diff(start, 'days');
    }

    function loadTranslations() {
      $translate.use(vm.language);
    }

    function getSelectedDayTitle(date) {
      var dayOfWeek = date.format('ddd').toLowerCase();
      return $filter('translate')('weekdaysLong.' + dayOfWeek) + ', ' + date.format(vm.dateFormatMask);
    }

  }
})();
