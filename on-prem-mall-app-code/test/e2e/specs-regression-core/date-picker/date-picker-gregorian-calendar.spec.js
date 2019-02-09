'use strict';

describe('Date picker functions:', function() {
  var moment = require('moment');
  var orgData = require('../../data/orgs.js');
  var userData = require('../../data/users.js');
  var login = require('../../pages/login.js');
  var nav = require('../../pages/components/nav-header.js');
  var tabNav = require('../../pages/components/tab-nav.js');
  var dateSelector = require('../../pages/components/time-period-picker.js');

  beforeAll(function (done) {
    if (browser.params.indirectNav){
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
      done();
    } else {
      login.getToken(function(token) {
        browser.get('#/' + orgData.MSOrg.id + '/summary?dateRangeStart=' + dateSelector.getURLDate('week', true) +
          '&dateRangeEnd=' + dateSelector.getURLDate('week', false) + '&compareRange1Start=' + dateSelector.getURLDate('week', true, 1) +
          '&compareRange1End=' + dateSelector.getURLDate('week', false, 1) + '&compareRange2Start=' + dateSelector.getURLDate('week', true, 2) +
          '&compareRange2End=' + dateSelector.getURLDate('week', false, 2) + '&token=' + token);
        done();
      });
    }
  });

  describe('Gregorian calendar', function(){

    describe('Selected period tab:', function() {

      it('should display the correct DOW in the calendar headers', function () {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();

        expect(dayHeaders).toEqual(dateSelector.getGregorianCalDOWHeaders());
        dateSelector.clickApplyOrCancel('cancel');
      });

      it('month/week/year-to-date shortcuts should work correctly and tab header should update', function () {
        var yesterday = moment().startOf('day').subtract(1, 'days').format(userData.superUser.dateFormat);
        var monthToDateRange = [moment(yesterday, userData.superUser.dateFormat).startOf('month').format(userData.superUser.dateFormat), yesterday];
        var weekToDateRange = [moment(yesterday, userData.superUser.dateFormat).startOf('week').format(userData.superUser.dateFormat), yesterday];
        var yearToDateRange = [moment(yesterday, userData.superUser.dateFormat).startOf('year').format(userData.superUser.dateFormat), yesterday];

        dateSelector.toggleDatePicker();

        dateSelector.pickDateShortcut('Month');
        var shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
        var newTabHeader = dateSelector.getDatePickerTabHeader();
        expect(shortcutDateFieldRange).toEqual(monthToDateRange);
        expect(newTabHeader).toMatch(monthToDateRange.join(' - '));

        dateSelector.pickDateShortcut('Week');
        shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
        newTabHeader = dateSelector.getDatePickerTabHeader();
        expect(shortcutDateFieldRange).toEqual(weekToDateRange);
        expect(newTabHeader).toMatch(weekToDateRange.join(' - '));

        dateSelector.pickDateShortcut('Year');
        shortcutDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
        newTabHeader = dateSelector.getDatePickerTabHeader();
        expect(shortcutDateFieldRange).toEqual(yearToDateRange);
        expect(newTabHeader).toMatch(yearToDateRange.join(' - '));

        dateSelector.clickWeekButton();
      });

      it('should update date fields and tab header correctly when given a custom date', function () {
        dateSelector.toggleDatePicker();
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);

        // generate moments for 10th and 16th of previous month to avoid selecting future dates
        initialDateFieldRange.then(function (dateRange) {

          var calcStartDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 10).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calcEndDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 16).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calculatedDateRange = [calcStartDate, calcEndDate];
          dateSelector.pickCustomDateRange();
          var dateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
          var newTabHeader = dateSelector.getDatePickerTabHeader();


          expect(dateFieldRange).toEqual(calculatedDateRange);
          expect(newTabHeader).not.toEqual(priorTabHeader);

          dateSelector.clickApplyOrCancel('cancel');
        });
      });
    });

    describe('Compare tab 1:', function() {
      var tabNumber = 1;

      it('should display the correct DOW in the calendar headers', function () {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();
        dateSelector.pickPickerTab(tabNumber);

        expect(dayHeaders).toEqual(dateSelector.getGregorianCalDOWHeaders());
        dateSelector.clickApplyOrCancel('cancel');
      });

      it('should update date fields and tab header correctly when comparing X weeks back', function () {
        var weeksBack = '4';
        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
        var calculatedWeeksBackDateRange = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function (dateRange) {
          dateRange.forEach(function (selectedDate) {
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, weeksBack, userData.superUser.dateFormat);
            calculatedWeeksBackDateRange.push(newDate);
          });

          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.setCompareWeeksBack(weeksBack);
          var newTabHeader = dateSelector.getDatePickerTabHeader();
          var weeksBackDateRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);

          expect(weeksBackDateRange).toEqual(calculatedWeeksBackDateRange);

          weeksBackDateRange.then(function (array) {
            expect(moment(array[0], userData.superUser.dateFormat).format('dddd')).toMatch('Sunday');
            expect(moment(array[0], userData.superUser.dateFormat).format('dddd')).not.toMatch('Monday');
            expect(moment(array[1], userData.superUser.dateFormat).format('dddd')).toMatch('Saturday');
            expect(moment(array[1], userData.superUser.dateFormat).format('dddd')).not.toMatch('Sunday');
          });

          expect(newTabHeader).not.toEqual(priorTabHeader);
          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      it('should update date fields and tab header correctly when given a custom date', function () {
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(tabNumber);
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);

        // generate moments for 10th and 16th of previous month to avoid selecting future dates
        initialDateFieldRange.then(function (dateRange) {

          var calcStartDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 10).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calcEndDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 16).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calculatedDateRange = [calcStartDate, calcEndDate];
          dateSelector.pickCustomDateRange();
          var dateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
          var newTabHeader = dateSelector.getDatePickerTabHeader();

          expect(dateFieldRange).toEqual(calculatedDateRange);
          expect(newTabHeader).not.toEqual(priorTabHeader);

          dateSelector.clickApplyOrCancel('cancel');
        });
      });
    });

    describe('Compare tab 2:', function() {
      var tabNumber = 2;

      it('should display the correct DOW in the calendar headers', function () {
        dateSelector.toggleDatePicker();
        var dayHeaders = dateSelector.getDOWHeaders();
        dateSelector.pickPickerTab(tabNumber);

        expect(dayHeaders).toEqual(dateSelector.getGregorianCalDOWHeaders());
        dateSelector.clickApplyOrCancel('cancel');
      });

      it('should update date fields and tab header correctly when comparing X weeks back', function () {
        var weeksBack = '4';
        dateSelector.toggleDatePicker();
        var selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
        var calculatedWeeksBackDateRange = [];

        //do moment() math on selectedPeriodDateRange to derive expected values
        selectedPeriodDateRange.then(function (dateRange) {
          dateRange.forEach(function (selectedDate) {
            var newDate = dateSelector.calculateWeeksBackDate(selectedDate, weeksBack, userData.superUser.dateFormat);
            calculatedWeeksBackDateRange.push(newDate);
          });


          dateSelector.pickPickerTab(tabNumber);
          var priorTabHeader = dateSelector.getDatePickerTabHeader();

          dateSelector.setCompareWeeksBack(weeksBack);
          var newTabHeader = dateSelector.getDatePickerTabHeader();
          var weeksBackDateRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);

          expect(weeksBackDateRange).toEqual(calculatedWeeksBackDateRange);

          weeksBackDateRange.then(function (array) {
            expect(moment(array[0], userData.superUser.dateFormat).format('dddd')).toMatch('Sunday');
            expect(moment(array[0], userData.superUser.dateFormat).format('dddd')).not.toMatch('Monday');
            expect(moment(array[1], userData.superUser.dateFormat).format('dddd')).toMatch('Saturday');
            expect(moment(array[1], userData.superUser.dateFormat).format('dddd')).not.toMatch('Sunday');
          });

          expect(newTabHeader).not.toEqual(priorTabHeader);
          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      it('should update date fields and tab header correctly when given a custom date', function () {
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(tabNumber);
        var priorTabHeader = dateSelector.getDatePickerTabHeader();
        var initialDateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);

        // generate moments for 10th and 16th of previous month to avoid selecting future dates
        initialDateFieldRange.then(function (dateRange) {
          var calcStartDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 10).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calcEndDate = moment(dateRange[0], 'dddd, ' + userData.superUser.dateFormat).set('date', 16).subtract(1, 'month').format(userData.superUser.dateFormat);
          var calculatedDateRange = [calcStartDate, calcEndDate];

          dateSelector.pickCustomDateRange();
          var dateFieldRange = dateSelector.getDateFieldValues(userData.superUser.dateFormat);
          var newTabHeader = dateSelector.getDatePickerTabHeader();

          expect(dateFieldRange).toEqual(calculatedDateRange);
          expect(newTabHeader).not.toEqual(priorTabHeader);

          dateSelector.clickApplyOrCancel('cancel');
        });
      });
    });
  });

  afterAll(function() {
    nav.logout();
  });


});
