'use strict';

describe('Date picker functions:', function() {
  var moment = require('moment');
  var orgData = require('../../data/orgs.js');
  var userData = require('../../data/users.js');
  var login = require('../../pages/login.js');
  var nav = require('../../pages/components/nav-header.js');
  var tabNav = require('../../pages/components/tab-nav.js');
  var dateSelector = require('../../pages/components/time-period-picker.js');

  beforeAll(function () {
    login.go();
    login.loginAsMondayUser();
    nav.pickMSOrg();
  });

  describe('Standard Monday calendar', function () {

    describe('Selected period tab:', function () {

      it('should display the correct DOW in the calendar headers', function () {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();

        expect(dayHeaders).toEqual(dateSelector.getMondayCalDOWHeaders());
        dateSelector.toggleDatePicker();
      });

      it('week-to-date shortcut should work correctly and tab header should update', function() {
        //difficult to test month/year-to-date shortcuts with non-standard calendars - months and years do not start
        // on the 1st of the month/year

        var yesterday = moment().startOf('day').subtract(1, 'days').format(userData.mondayUser.dateFormat);
        var weekToDateRange = [moment(yesterday, userData.mondayUser.dateFormat).startOf('isoweek').format(userData.mondayUser.dateFormat), yesterday];

        dateSelector.toggleDatePicker();

        dateSelector.pickDateShortcut('Week');
        var shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var newTabHeader = dateSelector.getDatePickerTabHeader();
        expect(shortcutDateFieldRange).toEqual(weekToDateRange);
        expect(newTabHeader).toMatch(weekToDateRange.join(' - '));

        dateSelector.clickApplyOrCancel('cancel');
      });

      it('should update date fields and tab header when given a custom date', function () {
        dateSelector.toggleDatePicker();
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);

        dateSelector.pickCustomDateRange();

        var newDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var newTabHeader = dateSelector.getDatePickerTabHeader();

        expect(newDateFieldRange).not.toEqual(initialDateFieldRange);
        expect(newTabHeader).not.toEqual(priorTabHeader);

        dateSelector.clickApplyOrCancel('cancel');
      });
    });

    describe('Compare tab 1:', function() {
      var tabNumber = 1;

      it('should display the correct DOW in the calendar headers', function() {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();
        dateSelector.pickPickerTab(tabNumber);

        expect(dayHeaders).toEqual(dateSelector.getMondayCalDOWHeaders());
        dateSelector.clickApplyOrCancel('cancel');
      });

      it('prior period/prior year shortcuts should work correctly and tab header should update', function() {

        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var calculatedPriorPeriod = [];
        var calculatedPriorYearPeriod = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function(dateRange) {
          dateRange.forEach(function(selectedDate){
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, 1, userData.mondayUser.dateFormat);
            calculatedPriorPeriod.push(newDate);

            newDate = dateSelector.calculateWeeksBackDate(selectedDate, 52, userData.mondayUser.dateFormat);
            calculatedPriorYearPeriod.push(newDate);
          });

          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();


          dateSelector.pickDateShortcut('Prior year');
          var shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
          var newTabHeader = dateSelector.getDatePickerTabHeader();

          expect(shortcutDateFieldRange).toEqual(calculatedPriorYearPeriod);
          expect(newTabHeader).not.toEqual(priorTabHeader);
          priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.pickDateShortcut('Prior period');
          shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
          newTabHeader = dateSelector.getDatePickerTabHeader();
          expect(shortcutDateFieldRange).toEqual(calculatedPriorPeriod);
          expect(newTabHeader).not.toEqual(priorTabHeader);

          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      it('should update date fields and tab header correctly when comparing X weeks back', function (){
        var weeksBack = '3';
        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var calculatedWeeksBackDateRange = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function(dateRange) {
          dateRange.forEach(function(selectedDate){
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, weeksBack, userData.mondayUser.dateFormat);
            calculatedWeeksBackDateRange.push(newDate);
          });


          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.setCompareWeeksBack(weeksBack);
          var newTabHeader = dateSelector.getDatePickerTabHeader();
          var weeksBackDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);

          expect(weeksBackDateRange).toEqual(calculatedWeeksBackDateRange);

          weeksBackDateRange.then(function(array){
            expect(moment(array[0], userData.mondayUser.dateFormat).format('dddd')).toMatch('Monday');
            expect(moment(array[0], userData.mondayUser.dateFormat).format('dddd')).not.toMatch('Tuesday');
            expect(moment(array[1], userData.mondayUser.dateFormat).format('dddd')).toMatch('Sunday');
            expect(moment(array[1], userData.mondayUser.dateFormat).format('dddd')).not.toMatch('Monday');
          });

          expect(newTabHeader).not.toEqual(priorTabHeader);
          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      it('should update date fields and tab header correctly when given a custom date', function () {
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(tabNumber);
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);

        dateSelector.pickCustomDateRange();

        var newDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var newTabHeader = dateSelector.getDatePickerTabHeader();

        expect(newDateFieldRange).not.toEqual(initialDateFieldRange);
        expect(newTabHeader).not.toEqual(priorTabHeader);

        dateSelector.clickApplyOrCancel('cancel');
      });
    });

    describe('Compare tab 2:', function() {
      var tabNumber = 2;

      it('should display the correct DOW in the calendar headers', function() {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();
        dateSelector.pickPickerTab(tabNumber);

        expect(dayHeaders).toEqual(dateSelector.getMondayCalDOWHeaders());
        dateSelector.clickApplyOrCancel('cancel');
      });

      it('prior period/prior year shortcuts should work correctly and tab header should update', function() {

        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var calculatedPriorPeriod = [];
        var calculatedPriorYearPeriod = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function(dateRange) {
          dateRange.forEach(function(selectedDate){
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, 1, userData.mondayUser.dateFormat);
            calculatedPriorPeriod.push(newDate);

            newDate = dateSelector.calculateWeeksBackDate(selectedDate, 52, userData.mondayUser.dateFormat);
            calculatedPriorYearPeriod.push(newDate);
          });

          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.pickDateShortcut('Prior year');
          var shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
          var newTabHeader = dateSelector.getDatePickerTabHeader();

          expect(shortcutDateFieldRange).toEqual(calculatedPriorYearPeriod);
          expect(newTabHeader).not.toEqual(priorTabHeader);
          priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.pickDateShortcut('Prior period');
          shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
          newTabHeader = dateSelector.getDatePickerTabHeader();
          expect(shortcutDateFieldRange).toEqual(calculatedPriorPeriod);
          expect(newTabHeader).not.toEqual(priorTabHeader);

          dateSelector.clickApplyOrCancel('cancel');
        });
      });


      it('should update date fields and tab header correctly when comparing X weeks back', function (){
        var weeksBack = '3';
        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var calculatedWeeksBackDateRange = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function(dateRange) {
          dateRange.forEach(function(selectedDate){
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, weeksBack, userData.mondayUser.dateFormat);
            calculatedWeeksBackDateRange.push(newDate);
          });

          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.setCompareWeeksBack(weeksBack);
          var newTabHeader = dateSelector.getDatePickerTabHeader();
          var weeksBackDateRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);

          expect(weeksBackDateRange).toEqual(calculatedWeeksBackDateRange);

          weeksBackDateRange.then(function(array){
            expect(moment(array[0], userData.mondayUser.dateFormat).format('dddd')).toMatch('Monday');
            expect(moment(array[0], userData.mondayUser.dateFormat).format('dddd')).not.toMatch('Tuesday');
            expect(moment(array[1], userData.mondayUser.dateFormat).format('dddd')).toMatch('Sunday');
            expect(moment(array[1], userData.mondayUser.dateFormat).format('dddd')).not.toMatch('Monday');
          });

          expect(newTabHeader).not.toEqual(priorTabHeader);
          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      it('should update date fields and tab header correctly when given a custom date', function () {
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(tabNumber);
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);

        dateSelector.pickCustomDateRange();

        var newDateFieldRange = dateSelector.getDateFieldValues(userData.mondayUser.dateFormat);
        var newTabHeader = dateSelector.getDatePickerTabHeader();

        expect(newDateFieldRange).not.toEqual(initialDateFieldRange);
        expect(newTabHeader).not.toEqual(priorTabHeader);

        dateSelector.clickApplyOrCancel('cancel');
      });
    });
  });

  afterAll(function() {
    nav.logout();
  });
});
