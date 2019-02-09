'use strict';

describe('dateRangePickerDirective', function () {
  var $compile;
  var $httpBackend;
  var utils;
  var fakeWindow;
  var $state;

  var $scope;
  var apiUrl = 'https://api.url';
  var dateRangePicker;
  var LocalizationService;
  var currentOrganizationMock;
  var currentUserMock;
  var yearsList = {
    years: [
      '2001', '2002', '2003', '2004', '2005',
      '2006', '2007', '2008', '2009', '2010',
      '2011', '2012', '2013', '2014', '2015',
      '2016', '2017'
    ]
  };

  beforeEach(module('shopperTrak', function ($translateProvider) {
    $translateProvider.translations('en_US', {});
    $translateProvider.translations('en-GB', {});
  }));

  beforeEach(module(function ($provide) {
    $provide.constant('apiUrl', apiUrl);
  }));

  beforeEach(module(function ($provide) {
    fakeWindow =  {
      ga: function(action, param1, param2) {
        // Do nothing
        angular.noop(action, param1, param2);
      }
    };

    $provide.value('$window', fakeWindow);
  }));

  beforeEach(inject(putTemplateToTemplateCache));


  beforeEach(inject(function ($rootScope,
    _$compile_,
    _$httpBackend_,
    _utils_,
    _LocalizationService_,
    _$state_
    ) {
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    utils = _utils_;
    LocalizationService = _LocalizationService_;
    $state = _$state_;

    // This NRF calendar data needs updating every year
    var calendarsMock = [
      {
        '_id': '56fc5f721a76b5921e3df217',
        'calendar_id': 1,
        'name': 'NRF Calendar', '__v': 100,
        'organization_ids': [5798, 6177, 5947, 5210, 8695, 5198, 8882, 1224, 6240, 6751, 5349, 8699, 5178, 6339],
        'years': [
          { 'year': 2001, 'start_date': '2001-02-04T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2002, 'start_date': '2002-02-03T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2003, 'start_date': '2003-02-02T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2004, 'start_date': '2004-02-01T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2005, 'start_date': '2005-01-30T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2006, 'start_date': '2006-01-29T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5] },
          { 'year': 2007, 'start_date': '2007-02-04T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2008, 'start_date': '2008-02-03T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2009, 'start_date': '2009-02-01T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2010, 'start_date': '2010-01-31T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2011, 'start_date': '2011-01-30T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2012, 'start_date': '2012-01-29T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 5] },
          { 'year': 2013, 'start_date': '2013-02-03T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2014, 'start_date': '2014-02-02T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2015, 'start_date': '2015-02-01T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2016, 'start_date': '2016-01-31T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2017, 'start_date': '2017-01-31T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2018, 'start_date': '2018-01-30T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2019, 'start_date': '2019-01-31T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2020, 'start_date': '2020-01-31T00:00:00.000Z', 'start_month': 1, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] }

        ], 'global': true
      },
      {
        '_id': '56fe81f9be710b6025f897d5',
        'calendar_id': 2826,
        'name': 'Lucky Brand Calendar',
        '__v': 3,
        'organization_ids': [8925],
        'years': [
          { 'year': 2012, 'start_date': '2012-01-01T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2013, 'start_date': '2013-01-06T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2014, 'start_date': '2014-01-05T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2015, 'start_date': '2015-01-04T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2016, 'start_date': '2016-01-03T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] },
          { 'year': 2017, 'start_date': '2017-01-03T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5, 4] }
        ], 'global': false
      },
      {
        '_id': '570d418480dee428210d4e8e',
        'calendar_id': 2146,
        'name': 'Bare Escentuals NEW',
        '__v': 0,
        'organization_ids': [],
        'years': [
          { 'year': 2011, 'start_date': '2011-01-03T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2012, 'start_date': '2012-01-02T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2013, 'start_date': '2012-12-31T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2014, 'start_date': '2013-12-30T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2015, 'start_date': '2014-12-29T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 6] },
          { 'year': 2016, 'start_date': '2016-01-04T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2017, 'start_date': '2017-01-04T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] }
        ],'global': false
      },
      {
        '_id': '570d41a680dee428210d4fae',
        'calendar_id': 3226,
        'name': 'Mall LFL 2015',
        '__v': 0,
        'organization_ids': [],
        'years': [
          { 'year': 2015, 'start_date': '2015-01-05T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2016, 'start_date': '2016-01-04T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] },
          { 'year': 2017, 'start_date': '2017-01-01T00:00:00.000Z', 'start_month': 0, 'month_mask': [4, 4, 5, 4, 4, 5, 4, 4, 5, 4, 4, 5] }
        ], 'global': false
      }
    ];

    LocalizationService.setAllCalendars(calendarsMock);

    $scope.allCalendars = calendarsMock;
    $scope.organizationCalendars = calendarsMock;

    currentOrganizationMock = {
      organization_id: 1,
      portal_settings: { currency: '$' },
      default_calendar_id: 1
    };
    $scope.currentOrganization = currentOrganizationMock;

    currentUserMock = {
      preferences: {
        custom_period_1:
        {
          period_type: 'priorPeriod',
          num_weeks: 5
        },
        custom_period_2:
        {
          period_type: 'priorPeriod',
          num_weeks: 5
        }
      }
    };

    $scope.compareRange1 = {
      start: moment(),
      end: moment().subtract(1, 'week')

    };

    $scope.selectedDateRange = $scope.compareRange1;

    $scope.compareRange2 = {
      start: moment().subtract(1, 'week'),
      end: moment().subtract(1, 'month')
    };

    $httpBackend.whenGET('https://api.url/organizations').respond(currentOrganizationMock);
    $scope.showDateRangePicker = true;
    $scope.currentOrganization = currentOrganizationMock;
    $scope.currentUser = currentUserMock;
    $scope.language = 'en_US';
    spyOn(LocalizationService, 'setAllCalendars');
    dateRangePicker = renderDirectiveAndDigest();
    expect(LocalizationService.setAllCalendars).toHaveBeenCalledWith(calendarsMock);
    spyOn(dateRangePicker, 'dateIsInRange');
  }));

  describe('activate', function () {
    it('should load directive defaults if not provided', function () {
      expect(dateRangePicker.compareRange1 === 'MM/DD/YYYY');
      expect(dateRangePicker.compareRange1 === $scope.compareRange1);
      expect(dateRangePicker.periodStart.compare1 === moment($scope.compareRange1.start).startOf('day'));
    });
  });

  describe('loadSelectedDateRange', function () {
    it('should set SelectedDateRange defaults.selected', function () {
      expect(dateRangePicker.selectedRange === $scope.selectedDateRange);
      expect(dateRangePicker.defaults.selected === {});
    });
  });

  describe('setFirstDayOfWeek', function () {
    it('should set setFirstDayOfWeek', function () {
      expect(dateRangePicker.firstDaySetting).toBe(LocalizationService.getCurrentCalendarFirstDayOfWeek());
    });
  });

  it('should shift wtd to previous week for wtd if it is first day of week', function () {
    dateRangePicker.getCurrentTime = LocalizationService.getFirstDayOfCurrentWeek;
    dateRangePicker.useShortCut('wtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === LocalizationService.getFirstDayOfCurrentWeek().subtract(1, 'week'));
  });

  it('should set wtd to current week for wtd if it is not first day of week', function () {
    dateRangePicker.getCurrentTime = function () {
      return LocalizationService.getFirstDayOfCurrentWeek().add(1, 'day');
    }
    dateRangePicker.useShortCut('wtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === LocalizationService.getFirstDayOfCurrentWeek());
  });

  it('should shift mtd to previous month for mtd if it is first day of month', function () {
    dateRangePicker.getCurrentTime = function () {
      var currentMonth, currentYear;
      currentYear = LocalizationService.getCurrentYear();
      currentMonth = LocalizationService.getCurrentMonth();
      return LocalizationService.getFirstDayOfMonth(currentMonth, currentYear);
    }
    var firstDay = LocalizationService.getFirstDayOfMonth(LocalizationService.getCurrentMonth(), LocalizationService.getCurrentYear())
    dateRangePicker.useShortCut('mtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === firstDay.subtract(1, 'month'));
  });

  it('should set mtd to current month for mtd if it is not first day of month', function () {
    dateRangePicker.getCurrentTime = function () {
      var currentMonth, currentYear;
      currentYear = LocalizationService.getCurrentYear();
      currentMonth = LocalizationService.getCurrentMonth();
      return LocalizationService.getFirstDayOfMonth(currentMonth, currentYear).add(1, 'day');
    }
    var firstDay = LocalizationService.getFirstDayOfMonth(LocalizationService.getCurrentMonth(), LocalizationService.getCurrentYear())
    dateRangePicker.useShortCut('mtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === firstDay);
  });

  it('should shift qtd to previous quarter for qtd if it is first day of quarter', function () {
    dateRangePicker.getCurrentTime = getFirstDayOfQuarter;
    var firstDay = getFirstDayOfPreviousQuarter();
    dateRangePicker.useShortCut('qtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === firstDay);
  });

  it('should set qtd to current quarter for qtd if it is not first day of quarter', function () {
    dateRangePicker.getCurrentTime = function () {
      return getFirstDayOfQuarter().add(1, 'day');
    }
    var firstDay = getFirstDayOfQuarter();
    dateRangePicker.useShortCut('qtd');
    expect(dateRangePicker.periodStart[dateRangePicker.periodType] === firstDay);
  });

  // This test is very brittle and needs fixing
  xit('should set ytd to current year for ytd if it is not first day of year', function () {
    dateRangePicker.getCurrentTime = function () {
      return LocalizationService.getFirstDayOfYear(LocalizationService.getCurrentYear()).add(1, 'day');
    };
    var firstDay = LocalizationService.getFirstDayOfYear(LocalizationService.getCurrentYear());

    dateRangePicker.useShortCut('ytd');

    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], firstDay)).toBe(0);
  });

  it('should shift to previous month', function () {
    dateRangePicker.useShortCut('mtd');
    var month = 5;
    dateRangePicker.selectedMonth = month;
    dateRangePicker.navigateToPreviousMonth();
    expect(dateRangePicker.selectedMonth).toBe(month - 1);
  });

  it('should shift to previous year first month if selected month is first month of the year', function () {
    var month = 0; // Zero indexed
    var year = 2016;
    dateRangePicker.selectedMonth = month;
    dateRangePicker.selectedYear = year;
    dateRangePicker.navigateToPreviousMonth();
    expect(dateRangePicker.selectedMonth).toBe(11);
    expect(dateRangePicker.selectedYear).toBe(2015);
  });

  it('should shift to next month', function () {
    var month = 5;
    dateRangePicker.selectedMonth = month;
    dateRangePicker.navigateToNextMonth();
    expect(dateRangePicker.selectedMonth).toBe(month + 1);
  });

  it('should shift to next year first month', function () {
    var month = 11; // Zero indexed
    var year = 2014;
    dateRangePicker.selectedMonth = month;
    dateRangePicker.selectedYear = year;
    dateRangePicker.navigateToNextMonth();
    expect(dateRangePicker.selectedMonth).toBe(0);
    expect(dateRangePicker.selectedYear).toBe(2015);
  });

  it('should set priorPeriod', function () {
    dateRangePicker.useShortCut('priorPeriod');
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], moment())).toBe(1);
  });

  it('should set priorYear', function () {
    dateRangePicker.useShortCut('priorYear');
    expect(dateRangePicker.useCustomCompare[dateRangePicker.periodType] === false);
  });

  it('should set date', function () {
    var testDay = dateRangePicker.calendarData[0].weeks[0].days[0];
    testDay.cssClass = ['green', 'gray'];
    testDay.dateObject = moment();
    dateRangePicker.selectDate(testDay);
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], testDay.dateObject)).toBe(0);
  });

  it('should set date with activeInput set to end', function () {
    var testDay = dateRangePicker.calendarData[0].weeks[0].days[0];
    testDay.cssClass = ['green', 'gray'];
    testDay.dateObject = moment();
    dateRangePicker.activeInput = 'end';
    dateRangePicker.selectDate(testDay);
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], testDay.dateObject)).toBe(0);
    expect(dateRangePicker.touched[dateRangePicker.periodType]).toBe(true);
    expect(dateRangePicker.activeInput).toBe('end');
    expect(dateRangePicker.periodType).toBe('selected');
  });

  it('should set date with testDay css disabled', function () {
    var testDay = dateRangePicker.calendarData[0].weeks[0].days[0];
    testDay.cssClass = ['disabled'];
    testDay.dateObject = moment();
    dateRangePicker.selectDate(testDay);
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], testDay.dateObject)).toBe(0);
    expect(dateRangePicker.touched[dateRangePicker.periodType]).toBe(false);
    expect(dateRangePicker.activeInput).toBe('start');
    expect(dateRangePicker.periodType).toBe('selected');
  });

  it('should set date with periodType set to none', function () {
    var testDay = dateRangePicker.calendarData[0].weeks[0].days[0];
    testDay.cssClass = ['green', 'gray'];
    testDay.dateObject = moment.utc();
    dateRangePicker.periodType = 'none';
    dateRangePicker.selectDate(testDay);
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], testDay.dateObject)).toBe(0);
    expect(dateRangePicker.touched[dateRangePicker.periodType]).toBe(true);
    expect(dateRangePicker.activeInput).toBe('start');
    expect(dateRangePicker.periodType).toBe('none');
  });

  it('should set date with activeInput set to none', function () {
    var testDay = dateRangePicker.calendarData[0].weeks[0].days[0];
    testDay.cssClass = ['green', 'gray'];
    testDay.dateObject = moment();
    dateRangePicker.activeInput = 'none';
    dateRangePicker.selectDate(testDay);
    expect(compareDate(dateRangePicker.periodStart[dateRangePicker.periodType], testDay.dateObject)).toBe(0);
    expect(dateRangePicker.touched[dateRangePicker.periodType]).toBe(true);
    expect(dateRangePicker.activeInput).toBe('none');
    expect(dateRangePicker.periodType).toBe('selected');
  });

  it('should cancel selection', function () {
    dateRangePicker.cancelSelection();
    expect(dateRangePicker.weeksAgo === angular.copy(LocalizationService.getWeeksAgo()));
    expect(dateRangePicker.periodStart.selected === dateRangePicker.selectedRange.start);
  });

  describe('display', function () {
    it('should set the compare periods for the calendar', function () {
      var controller = renderDirectiveAndDigest2();
      expect(controller.compare1Period.start.format('DD/MM/YYYY')).toBe('02/01/2015');
      expect(controller.compare1Period.end.format('DD/MM/YYYY')).toBe('25/02/2015');
      expect(controller.compare2Period.start.format('DD/MM/YYYY')).toBe('01/03/2014');
      expect(controller.compare2Period.end.format('DD/MM/YYYY')).toBe('27/03/2014');
    });

    it('should load the selected date range for the 3 tabs i.e. Current period, Compare period1 and Compare period 2', function () {
      var controller = renderDirectiveAndDigest2();
      expect(controller.defaults.selected.start.format('DD/MM/YYYY')).toBe('01/03/2015');
      expect(controller.defaults.selected.end.format('DD/MM/YYYY')).toBe('27/03/2015');
      expect(controller.defaults.compare1.start.format('DD/MM/YYYY')).toBe('02/01/2015');
      expect(controller.defaults.compare1.end.format('DD/MM/YYYY')).toBe('25/02/2015');
      expect(controller.defaults.compare2.start.format('DD/MM/YYYY')).toBe('01/03/2014');
      expect(controller.defaults.compare2.end.format('DD/MM/YYYY')).toBe('27/03/2014');
    });

    it('should display the tab that user selected to display', function () {

      var controller = renderDirectiveAndDigest2();

      /* The expected month is zero based from the current calendar, not the year.
      *  So, our calendar used in this test starts in february. It is our start month.
      *  Out selected date range start is the 1st of March 2015, which falls into Month 2 of our calendar
      *  Which is at index position 1

      */
      expect(controller.selectedMonth).toBe(1);
      expect(controller.selectedYear).toBe(2015);

      controller.setTab('compare2');
      expect(controller.selectedMonth).toBe(0);
      expect(controller.selectedYear).toBe(2014);
    });

  });

  describe('respond', function () {
    it('should show the month for the selected period in the middle of the 3 displayed months if selected span is speard under 2 months', function () {
      var controller = renderDirectiveAndDigest2();
      controller.selectedMonth = 2;
      controller.selectedYear = '2015';

      $scope.$digest();

      expect(controller.calendarData[0].monthKey).toBe('201502');
      expect(controller.calendarData[0].monthLabel.replace('monthsLong.', '')).toBe('february 2015');
      expect(controller.calendarData[1].monthKey).toBe('201503');
      expect(controller.calendarData[1].monthLabel.replace('monthsLong.', '')).toBe('march 2015');
      expect(controller.calendarData[2].monthKey).toBe('201504');
      expect(controller.calendarData[2].monthLabel.replace('monthsLong.', '')).toBe('april 2015');
    });

    it('should show the month for the selected period in the middle of the 3 displayed months if selected span is speard over 2 months', function () {
      var controller = renderDirectiveAndDigest2();
      controller.selectedMonth = 3;
      controller.selectedYear = '2015';
      controller.selectedDateRange = {
        start: moment('05/04/2015'),
        end: moment('08/27/2015')
      };

      controller.pickerRendered = false;
      $scope.$digest();

      LocalizationService.getCurrentMonth = function () {
        return 5;
      };

      expect(controller.calendarData[0].monthKey).toBe('201504');
      expect(controller.calendarData[0].monthLabel.replace('monthsLong.', '')).toBe('april 2015');
      expect(controller.calendarData[1].monthKey).toBe('201505');
      expect(controller.calendarData[1].monthLabel.replace('monthsLong.', '')).toBe('may 2015');
      expect(controller.calendarData[2].monthKey).toBe('201506');
      expect(controller.calendarData[2].monthLabel.replace('monthsLong.', '')).toBe('june 2015');
    });

    it('should test generation of event dateRangesChanged', function () {
      $state.miOpen = true;

      var controller = renderDirectiveAndDigest2();

      var pR = {
        dateRangeStart: moment('2017-01-01'),
        dateRangeEnd: moment('2017-01-06'),
        compareRange1Start: moment('2017-01-02'),
        compareRange1End: moment('2017-01-07')
      };
      var t  = 'year';

      controller.setActiveInput({});

      $scope.$broadcast('dateRangesChanged', pR, t);

      expect(controller.activeInput).toEqual({});
      expect(controller.updated).toBe(true);
      expect(controller.periodStart.selected).toEqual(moment(pR.dateRangeStart).startOf('day'));
      expect(controller.periodEnd.selected).toEqual(moment(pR.dateRangeEnd).endOf('day'));
      expect(controller.defaults.selected.start).toEqual(controller.periodStart.selected);
      expect(controller.defaults.selected.end).toEqual(controller.periodEnd.selected);
      expect(controller.periodStart.compare1).toEqual(moment(pR.compareRange1Start).startOf('day'));
      expect(controller.periodEnd.compare1).toEqual(moment(pR.compareRange1End).endOf('day'));
      expect(controller.defaults.compare1.start).toEqual(controller.periodStart.compare1);
      expect(controller.defaults.compare1.end).toEqual(controller.periodEnd.compare1);
    });

    it('should reset date range to previously selected when resetDateRangesChanged called', function(){
      $state.current.name = 'analytics.organization.marketIntelligence.dashboard';
      
      var controller = renderDirectiveAndDigest2();
      
      controller.periodStart.selected = moment('20/03/2015', 'DD/MM/YYYY');
      controller.periodEnd.selected = moment('26/03/2015', 'DD/MM/YYYY');

      controller.periodStart.compare1 = moment('01/04/2015', 'DD/MM/YYYY');
      controller.periodEnd.compare1 = moment('25/04/2015', 'DD/MM/YYYY');
      
      $scope.$broadcast('resetDateRangesChanged');
      
      expect(controller.periodStart.selected === controller.selectedRange.start);
      expect(controller.periodEnd.selected === controller.selectedRange.end);
      
      expect(controller.periodStart.compare1 === controller.compareRange1.start);
      expect(controller.periodEnd.compare1 === controller.compareRange1.end);
    });

    it('should test call to setActiveInput()', function () {

      var controller = renderDirectiveAndDigest2();

      controller.setActiveInput('start');

      expect(controller.activeInput).toBe('start');
    });

    it('should test successfull call to applySelectedRange() with key set', function () {

      var controller = renderDirectiveAndDigest2();

      controller.key = {};
      controller.applySelectedRange();

      expect(controller.hasUsedCalendar).toBe(false);
      expect(controller.selectedRange.start).toEqual(controller.periodStart.selected);
      expect(controller.selectedRange.end).toEqual(controller.periodEnd.selected);
      expect(controller.compareRange1.start).toEqual(controller.periodStart.compare1);
      expect(controller.compareRange1.end).toEqual(controller.periodEnd.compare1);
      expect(controller.compareRange2.start).toEqual(controller.periodStart.compare2);
      expect(controller.compareRange2.end).toEqual(controller.periodEnd.compare2);
      expect(controller.visible).toBe(false);
      expect(controller.key).toBe(null);
    });

    it('should test successfull call to applySelectedRange() with no key set', function () {

      var controller = renderDirectiveAndDigest2();

      controller.applySelectedRange();

      expect(controller.hasUsedCalendar).toBe(false);
      expect(controller.selectedRange.start).toEqual(controller.periodStart.selected);
      expect(controller.selectedRange.end).toEqual(controller.periodEnd.selected);
      expect(controller.compareRange1.start).toEqual(controller.periodStart.compare1);
      expect(controller.compareRange1.end).toEqual(controller.periodEnd.compare1);
      expect(controller.compareRange2.start).toEqual(controller.periodStart.compare2);
      expect(controller.compareRange2.end).toEqual(controller.periodEnd.compare2);
      expect(controller.visible).toBe(false);
      expect(controller.key).toBe(null);
    });

    it('should test successfull call to changePeriod(type) for year', function () {

      var controller = renderDirectiveAndDigest2();

      controller.changePeriod('year');

      expect(controller.activeInput).toBe('start');
      expect(controller.periodType).toBe('year');
    });
  });

  function renderDirectiveAndDigest2() {
    var element = angular.element(
      '<date-range-picker ' +
      'ng-show="showDateRangePicker" ' +
      'id="date-range-picker" ' +
      'off-click="showDateRangePicker=false" ' +
      'selected-range="selectedDateRange" ' +
      'compare-range1="compareRange1" ' +
      'compare-range2="compareRange2" ' +
      'date-format-mask="dateFormat" ' +
      'current-organization="currentOrganization" ' +
      'organization-calendars="organizationCalendars" ' +
      'all-calendars="allCalendars" ' +
      'current-user="currentUser" ' +
      'visible="showDateRangePicker" ' +
      'show-compare-options="true" ' +
      'language="language"> ' +
      '</date-range-picker> '
    );

    $scope.selectedDateRange = {
      start: moment('01/03/2015', 'DD/MM/YYYY'),
      end: moment('27/03/2015', 'DD/MM/YYYY')
    };

    $scope.compareRange1 = {
      start: moment('02/01/2015', 'DD/MM/YYYY'),
      end: moment('25/02/2015', 'DD/MM/YYYY')
    };

    $scope.compareRange2 = {
      start: moment('01/03/2014', 'DD/MM/YYYY'),
      end: moment('27/03/2014', 'DD/MM/YYYY')
    };

    $scope.dateFormat = null;
    $scope.currentOrganization = { id: 1, name: 'test org' };
    $scope.organizationCalendars = [];
    $scope.currentUser = {
      preferences: {
        custom_period_1: {
          period_type: 'custom',
          weeks_ago: 5
        },
        custom_period_2: {
          period_type: 'period_year'
        }
      }
    };
    $scope.allCalendars = [];
    $scope.language = 'en-GB';
    $scope.currentCalendarSettings = {
      years: yearsList
    };
    $scope.selectedRange = {
      start: moment('01/03/2015'),
      end: moment('27/03/2015')
    };
    $compile(element)($scope);
    $scope.$digest();
    return element.isolateScope().vm;
  }

  function getFirstDayOfQuarter() {
    var currentMonth, currentYear;
    currentYear = LocalizationService.getCurrentYear();
    currentMonth = LocalizationService.getCurrentMonth();
    var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
    var getFirstMonthInQuarter = utils.getFirstMonthInQuarter(currPeriod);
    return LocalizationService.getFirstDayOfMonth(getFirstMonthInQuarter, currentYear);
  }

  function compareDate(dateTimeA, dateTimeB) {
    var momentA = moment(dateTimeA, 'DD/MM/YYYY');
    var momentB = moment(dateTimeB, 'DD/MM/YYYY');
    if (momentA.isAfter(momentB, 'day')) {
      return 1;
    }
    else if (momentB.isAfter(momentA, 'day')) {
      return -1;
    }
    return 0;
  }

  function getFirstDayOfPreviousQuarter() {
    var currentMonth, currentYear;
    currentYear = LocalizationService.getCurrentYear();
    currentMonth = LocalizationService.getCurrentMonth();
    var currPeriod = Math.floor((currentMonth - 1) / 3) + 1;
    if (currPeriod === 1) {
      currPeriod = 4;
      currentYear += -1;
      currentMonth = 12;
    }
    else {
      currPeriod += -1;
      currentMonth += -1;
    }
    return LocalizationService.getFirstDayOfMonth(currPeriod * 3 - 2, currentYear);
  }

  function renderDirectiveAndDigest() {
    var element = createDirectiveElement();
    $compile(element)($scope);
    $scope.$digest();
    return element.isolateScope().vm;
  }

  function createDirectiveElement() {
    return angular.element(
      '<date-range-picker' +
      ' ng-show="showDateRangePicker"' +
      ' id="date-range-picker"' +
      ' off-click="showDateRangePicker=false"' +
      ' selected-range="selectedDateRange"' +
      ' compare-range1="compareRange1"' +
      ' compare-range2="compareRange2"' +
      ' date-format-mask="dateFormat"' +
      ' current-organization="currentOrganization"' +
      ' organization-calendars="organizationCalendars"' +
      ' all-calendars="allCalendars"' +
      ' current-user="currentUser"' +
      ' visible="showDateRangePicker"' +
      ' show-compare-options="true"' +
      ' language="language">' +
      ' </date-range-picker>'
    );
  }

  function putTemplateToTemplateCache($templateCache) {
    // Put an empty template to the template cache to prevent Angular from
    // trying to fetch it. We are only testing the controller here, so the
    // actual template is not needed.
    $templateCache.put(
      'components/date-range-picker/date-range-picker.partial.html',
      '<div></div>'
    );
  }

  function getFirstSunday() {
    var startOfYear = moment().startOf('year');

    while(startOfYear.day() !== 0) {
      startOfYear.add(1, 'day');
    }

    return startOfYear;
  }

});
