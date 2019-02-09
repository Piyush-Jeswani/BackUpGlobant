class monthCalendarCtrl {
  constructor (
    $scope,
    $timeout,
    $state,
    $stateParams,
    $rootScope,
    ObjectUtils,
    dateRangeService,
    localizationService,
    localStorageService
  ) {
    this.dateRangeService = dateRangeService;
    this.currentUser = $scope.$parent.currentUser;
    this.currentOrganization = $scope.$parent.currentOrganization;
    this.$timeout = $timeout;
    this.ObjectUtils = ObjectUtils;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.localizationService = localizationService;
    this.localStorageService = localStorageService;
    this.disabledMonths = {
      0: 'true',
      1: 'true',
      2: 'true',
      3: 'true',
      4: 'true',
      5: 'true',
      6: 'true',
      7: 'true',
      8: 'true',
      9: 'true',
      10: 'true',
      11: 'true'
    };
  }
  $onInit () {
    const yearMax = this.dateRangeService.getCurrentCalendarLatestDate();
    this.maxYear = yearMax.year();

    const yearMin = this.dateRangeService.getCurrentCalendarEarliestDate();
    this.minYear = yearMin.year();

    /* code to disable the future month buttons */
    this.currentMonthYear = this.localizationService.getSystemYearForDate(moment());
    const currentSettings = this.localizationService.getActiveCalendarSettings();
    if (this.localizationService.isGregorian(currentSettings)) {
      this.currentMonthYear.month = this.currentMonthYear.month - 1; //make month zero indexed for gregorian calendars
    } else {
      this.currentMonthYear.month = this.currentMonthYear.month;
    }

    this.monthLabels = this.getMonthLabels();

    this.setMonthAndYearOnLoad();
    this.formYearOptions(this.minYear, this.maxYear);
    this.disableFutureMonths();
  }

  setMonthAndYearOnLoad () {
    if (!this.ObjectUtils.isNullOrUndefined(this.localStorageService.get('prevYear'))) {
      if (this.$state.rangeSelected === 'custom' || this.$state.rangeSelected === 'month') {
        this.selectedlatestYear = this.localStorageService.get('prevYear');

        /* in case of custom calendars like NRF Calendar, Jan starts from feb 2,
          so can't relyon $stateParams.dateRangeStart to get the correct month highlighted.
          Hence using localStorage to always persist the previous selected month
        */
        this.selectedMonth = this.localStorageService.get('prevMonth');
      } else {
        this.selectedlatestYear = moment().year();
      }
    } else {
      this.selectedlatestYear = moment().year();
    }
  }

  formYearOptions (minValue, maxValue) {
    const yearOptions = [];
    for (let i = minValue; i <= maxValue; i++) {
      yearOptions.push(i);
    }
    this.availableYears = yearOptions.reverse();
    this.disableLeftRightArrows();
  }

  disableFutureYear (item) {
    return item > moment().year();
  }

  setYear (val) {
    if (this.disableFutureYear(val)) {
      return;
    }

    this.selectedlatestYear = val;
    this.highLightMonths();
    this.disableFutureMonths();
    this.disableLeftRightArrows();
  }

  decrementYear () {
    if (this.selectedlatestYear > this.minYear) {
      this.selectedlatestYear = this.selectedlatestYear - 1;
    }
    this.highLightMonths();
    this.disableFutureMonths();
    this.disableLeftRightArrows();

  }

  incrementYear () {
    if (this.selectedlatestYear < this.currentMonthYear.year) {
      this.selectedlatestYear = this.selectedlatestYear + 1;
    }
    this.highLightMonths();
    this.disableFutureMonths();
    this.disableLeftRightArrows();
  }

  highLightMonths () {
    const prevSelValues = {
      year: this.localStorageService.get('prevYear'),
      month: this.localStorageService.get('prevMonth')
    };
    if (this.$state.rangeSelected === 'custom') {
      if (prevSelValues) {
        if (this.selectedlatestYear === prevSelValues.year) {
          this.selectedMonth = prevSelValues.month;
        } else {
          this.selectedMonth = -1; //disable month highlight
        }
      } else {
        if (this.selectedlatestYear === this.$stateParams.dateRangeStart.year()) {
          this.selectedMonth = this.$stateParams.dateRangeStart.month();
        } else {
          this.selectedMonth = -1;
        }
      }
    }
  }

  disableLeftRightArrows () {
    if (this.selectedlatestYear === this.minYear) {
      this.disable_left_arrow = true;
      this.disable_right_arrow = false;
    }
    // do not allow to select future years
    if (this.selectedlatestYear > this.minYear && this.selectedlatestYear < this.currentMonthYear.year) {
      this.disable_left_arrow = false;
      this.disable_right_arrow = false;
    }
    if (this.selectedlatestYear === this.currentMonthYear.year) {
      this.disable_left_arrow = false;
      this.disable_right_arrow = true;
    }
  }

  onMonthClick (month) {
    this.selectedMonth = month;
    const yearSelected = this.selectedlatestYear;
    this.localStorageService.set('prevMonth', month);
    this.localStorageService.set('prevYear', yearSelected);
    if (this.$state.current.name.indexOf('marketIntelligence') !== -1) {
      this.hasOnlyOneCompare = true;
    }
    if (this.$state.miOpen) {
      // This is used when the MI csv export modal is open
      this.hasOnlyOneCompare = true;
    }
    const dateRangesForMonth =
    this.dateRangeService.getSelectedAndCompareRangesForMonth(month, yearSelected, this.currentUser, 
      this.currentOrganization, this.hasOnlyOneCompare);

    const newStateParams = {
      dateRangeStart: dateRangesForMonth.selectedPeriod.start,
      dateRangeEnd: dateRangesForMonth.selectedPeriod.end,
      compareRange1Start: dateRangesForMonth.comparePeriod1.start,
      compareRange1End: dateRangesForMonth.comparePeriod1.end,
      activeShortcut: undefined
    };

    this.$state.customRange = null;

    if (!_.isUndefined(dateRangesForMonth.comparePeriod2)) {
      newStateParams.compareRange2Start = dateRangesForMonth.comparePeriod2.start;
      newStateParams.compareRange2End = dateRangesForMonth.comparePeriod2.end;
    }
    if (this.$state.current.name === 'analytics.organization.marketIntelligence.dashboard') {
      this.$rootScope.$broadcast('resetDateRangesChanged');
    }
    //This is used when the MI csv export modal is open
    if (this.$state.miOpen) {
      this.selectedDateRange = {
        start: newStateParams.dateRangeStart,
        end: newStateParams.dateRangeEnd
      };
    /* pass this selecteddateRange to parent controller date-range-selctor.controller,
       so the selected date range gets updated in datepicker in mi csv report */
      this.onChange({
        selectedDateRangeForMi: this.selectedDateRange
      });

      // to get the csv report work properly
      return this.$rootScope.$broadcast('dateRangesChanged', newStateParams);
    }

    this.$timeout(() => {
      if (!this.ObjectUtils.isNullOrUndefined(newStateParams)) {
        let stateName = this.$state.$current.name;

        if (this.ObjectUtils.isNullOrUndefined(stateName)) {
          stateName = 'analytics.organization.retail';
        }

        this.$state.go(stateName, newStateParams);
      }
    });

  }
  /**
   *  user cannot select the future months. 
   *  Allow only to select till previous month
   * 
   */
  disableFutureMonths () {
    const no_of_months = 11;  //zero indexed
    const currentMonth = this.currentMonthYear.month;
    const months = this.disabledMonths;
    if (this.selectedlatestYear === this.currentMonthYear.year) {
      //disable from current month to last month(Dec)
      _.each(this.disabledMonths, (elem, index) => {
        if (index >= currentMonth && index <= no_of_months) {
          months[index] = true;
        } else {
          months[index] = false;
        }
      });
    } else {
      //enable all months - year selected less than current year
      _.each(this.disabledMonths, (elem, index) => {
        months[index] = false;
      });
    }
  }

  getMonthLabels () {
    let firstMonthOfYear = this.localizationService.getFirstMonthOfYear(this.currentMonthYear.year);
    
    const months = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ];

    const orderedMonths = [];

    while (firstMonthOfYear < months.length && orderedMonths.length < months.length) {
      const monthTransKey = `monthsShort.${months[firstMonthOfYear]}`;
      orderedMonths.push(monthTransKey);

      firstMonthOfYear = firstMonthOfYear + 1;

      if (firstMonthOfYear === months.length) {
        firstMonthOfYear = 0;
      } 
    }

    return orderedMonths;
  }
} //end of controller


  const calendarMonth = {
    templateUrl: 'components/month-component/calendar-month.html',
    bindings:{
      onChange : '&'
    },
    controller: 'monthCalendarCtrl as vm'
  };

angular.module('shopperTrak')
  .controller('monthCalendarCtrl', monthCalendarCtrl)
  .component('calendarMonth', calendarMonth);

monthCalendarCtrl.$inject = [
  '$scope',
  '$timeout',
  '$state',
  '$stateParams',
  '$rootScope',
  'ObjectUtils',
  'dateRangeService',
  'LocalizationService',
  'localStorageService'
];
