'use strict';

const moment = require('moment');

module.exports = {

  getGregorianCalDOWHeaders() {
    return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  },
  getMondayCalDOWHeaders() {
    return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  },

  getDatePicker() {
    return element(by.className('toolbar-section-date-range'));
  },

  toggleDatePicker() {
    this.getDatePicker().element(by.className('date-range-dropdown')).click();
  },

  getApplyOrCancelButton(buttonName) {
    if (buttonName.toLowerCase() === 'apply') {
      return element.all(by.className('date-range-picker-header')).first().element(by.className('date-apply'));
    } else if (buttonName.toLowerCase() === 'cancel') {
      return element.all(by.className('date-range-picker-header')).first().element(by.className('date-cancel'));
    }
  },

  clickApplyOrCancel(buttonName) {
    this.getApplyOrCancelButton(buttonName).click();
  },

  pickPickerTab(tabNumber) {
    element(by.className('date-range-picker-period-nav')).all(by.className('date-range-picker-period-nav-content')).get(tabNumber).click();
  },

  getDatePickerTabHeader() {
    return element(by.className('date-range-picker-period-nav')).element(by.css('a.selected')).getText();
  },

  getDOWHeaders() {
    return element(by.className('date-range-picker-body')).all(by.repeater('label in ::vm.weekdayLabels')).getText();
  },

  getDateInput() {
    return element.all(by.className('date-range-picker-header')).first();
  },

  getDateFieldHeaders(fromOrTo) {
    const headers = this.getDateInput().all(by.className('date-input-wrapper'));

    if (fromOrTo.toLowerCase() === 'from') {
      return headers.first().element(by.css('span.date-input-label'));
    } else if (fromOrTo.toLowerCase() === 'to') {
      return headers.last().element(by.css('span.date-input-label'));
    }
  },

  getDateFields(fromOrTo) {
    const inputFields = this.getDateInput().all(by.className('date-input'));

    if (fromOrTo.toLowerCase() === 'from') {
      return inputFields.first();
    } else if (fromOrTo.toLowerCase() === 'to') {
      return inputFields.last();
    }
  },

  getDateFieldValues(dateFormat) {
    let dateFieldRange = [];
    const fromDate = this.getDateFields('from').getText();
    const toDate = this.getDateFields('to').getText();

    return protractor.promise.all([fromDate, toDate]).then(promiseArray => {
      let start = promiseArray[0];
      let end = promiseArray[1];
      start = moment(start, `ddd, ${dateFormat}`).format(dateFormat);
      end = moment(end, `ddd, ${dateFormat}`).format(dateFormat);
      dateFieldRange.push(start);
      dateFieldRange.push(end);
      return dateFieldRange;
    });
  },

  getDateShortcutsMenu() {
    return element.all(by.className('date-range-picker-header')).first().element(by.css('.date-action.shortcut-selector'));
  },

  getDateShortcutsVisibleText() {
    return this.getDateShortcutsMenu().getText();
  },

  getDateShortcutsMenuOptions() {
    this.openDateShortcutsMenu();
    return this.getDateShortcutsMenu().element(by.className('dropdown-menu')).all(by.css('a'));
  },

  openDateShortcutsMenu() {
    this.getDateShortcutsMenu().element(by.css('button.dropdown-toggle')).click();
  },

  pickDateShortcut(timePeriod) {
    this.getDateShortcutsMenu().click();
    element.all(by.className('date-range-picker-header')).first().element(by.partialLinkText(timePeriod)).click();
  },

  getCompareWeeksBackText() {
    return element(by.css('date-range-picker')).element(by.className('compare-details')).getText();
  },

  setCompareWeeksBack(weeksBack) {
    const weeksBackCount = element(by.css('date-range-picker')).element(by.className('compare-details')).element(by.model('vm.weeksAgo[vm.periodType]'));
    const weeksBackCheckbox = element(by.css('date-range-picker')).element(by.className('compare-details')).element(by.model('vm.useCustomCompare[vm.periodType]'));

    weeksBackCheckbox.isSelected().then(isSelected => {
      if (isSelected === false) {
        weeksBackCheckbox.click();
      }
      weeksBackCount.clear();
      weeksBackCount.sendKeys(weeksBack);
    });
  },

  getReportingPeriod(dateFormat) {
    return this.getReportingPeriodText().then(dateTextString => {
      return this.makeDateArray(dateTextString, dateFormat);
    });
  },

  getReportingPeriodText() {
    return this.getDatePicker().element(by.className('date-range-dropdown')).getText();
  },

  getExportCSVDatePicker() {
    return element(by.className('csv-time-period-selector'));
  },

  toggleExportCSVDatePicker() {
    this.getExportCSVDatePicker().element(by.className('date-range-dropdown')).click();
  },

  getExportPDFViewDateRange(dateFormat) {
    const dateRange = element(by.className('date-ranges')).getText();
    return dateRange.then(dateTextString => {
      return this.makeDateArray(dateTextString, dateFormat);
    });
  },

  getExportCSVReportingPeriod(dateFormat) {
    const dropdown = this.getExportCSVDatePicker().element(by.css('button'));
    const datePeriod = dropdown.getText();
    return datePeriod.then(dateTextString => {
      return this.makeDateArray(dateTextString, dateFormat);
    });
  },

  // comparePeriodNumber helps to set the correct date range for "prior period" vs. "prior year" compare period:
  // comparePeriodNumber = 0 represents selected period
  // comparePeriodNumber = 1 represents prior period
  // comparePeriodNumber = 2 represents prior year
  getURLDate(_timePeriod, isStartDate, comparePeriodNumber, startDay) {
    return this.getDate(_timePeriod, isStartDate, comparePeriodNumber, startDay).format('YYYY-MM-DD');
  },

  getDate(_timePeriod, isStartDate, comparePeriodNumber, startDay) {
    let subtractCount = 1;
    let reportPeriod;
    const timePeriod = _timePeriod;
    if (comparePeriodNumber === 1 || (comparePeriodNumber === 2 && _timePeriod === 'year')) {
      subtractCount = 2;
    }

    if ((comparePeriodNumber === 2 && (_timePeriod === 'week' || _timePeriod === 'isoweek'))) {
      reportPeriod = moment().subtract(subtractCount, timePeriod).endOf('week');
    } else {
      reportPeriod = moment().subtract(subtractCount, timePeriod);
    }

    if (comparePeriodNumber === 2) {
      reportPeriod = reportPeriod.subtract(1, 'year');
    }
    const startOf = startDay || _timePeriod;
    if (isStartDate) {
      return reportPeriod.startOf(startOf).startOf('day');
    }
    return reportPeriod.endOf(startOf).startOf('day');
  },

  getPriorReportingPeriod(dateFormat) {
    return this.getReportingPeriod(dateFormat).then(reportPeriod => {
      let priorPeriod = [];
      const activeDateButton = this.getDatePicker().element(by.className('active'));

      return activeDateButton.isPresent().then(isActiveButtonPresent => {
        if (isActiveButtonPresent) {
          const buttonTextPromise = activeDateButton.getText();
          return buttonTextPromise.then(buttonText => {
            if (buttonText === 'Week') {
              // if reporting period is "week"
              reportPeriod.forEach((date, index) => {
                priorPeriod[index] = moment(date).subtract(1, 'week').toDate();
              });
              return priorPeriod;
            } else if (buttonText === 'Month') {
              // if reporting period is "month"
              reportPeriod.forEach((date, index) => {
                if (index === 1) {
                  priorPeriod[index] = moment(date).subtract(1, 'month').endOf('month').startOf('day').toDate();
                } else {
                  priorPeriod[index] = moment(date).subtract(1, 'month').toDate();
                }
              });
              return priorPeriod;
            } else if (buttonText === 'Year') {
              // if reporting period is "year"
              reportPeriod.forEach((date, index) => {
                priorPeriod[index] = moment(date).subtract(1, 'year').toDate();
              });
              return priorPeriod;
            } else if (buttonText === 'Day') {
              // if reporting period is "day"
              reportPeriod.forEach((date, index) => {
                priorPeriod[index] = moment(date).subtract(1, 'day').toDate();
              });
              return priorPeriod;
            }
          });
        }
          // custom date picker; not implemented yet
        throw new Error('custom date picker selected; functionality not implemented yet');
      });
    });
  },

  getComparePeriod(weeksBack, dateFormat) {
    return this.getReportingPeriod(dateFormat).then(reportPeriod => {
      let priorPeriod = [];
      reportPeriod.forEach((date, index) => {
        priorPeriod[index] = moment(date).subtract(weeksBack, 'week').toDate();
      });
      return priorPeriod;
    });
  },

  // reportingPeriod is expected to be an array containing two date strings.  1st date string is
  // the start of a date range, 2nd date string is the end of a date range
  getPriorYearReportingPeriod(reportingPeriod, dateFormat) {
    let priorYearPeriod = [];
    return this.getReportingPeriod(dateFormat).then(reportPeriod => {
      reportPeriod.forEach((date, index) => {
        priorYearPeriod[index] = date;

        if (reportingPeriod === 'week') {
          priorYearPeriod[index] = moment(date).subtract(52, 'weeks').toDate();
        } else if (reportingPeriod === 'month') {
          // endOf('month') accounts for leap years
          priorYearPeriod[index] = moment(date).subtract(1, 'year');
          if (index === 1) {
            priorYearPeriod[index] = priorYearPeriod[index].endOf('month').startOf('day');
          }
          priorYearPeriod[index] = priorYearPeriod[index].toDate();
        } else {
          priorYearPeriod[index] = moment(date).subtract(2, 'year').toDate();
        }
      });
      return priorYearPeriod;
    });
  },

  getTimePeriodButton(timePeriod) {
    return browser.executeScript('window.scrollTo(0,0);').then(() => {
      return this.getDatePicker().element(by.cssContainingText('button', timePeriod));
    });
  },

  getDayButton() {
    return this.getTimePeriodButton('Day');
  },

  clickDayButton() {
    this.getDayButton().then(button => {
      button.click();
    });
  },

  getWeekButton() {
    return this.getTimePeriodButton('Week');
  },

  clickWeekButton() {
    this.getWeekButton().then(button => {
      button.click();
    });
  },

  getMonthButton() {
    return this.getTimePeriodButton('Month');
  },

  clickMonthButton() {
    this.getMonthButton().then(button => {
      button.click();
    });
  },

  getYearButton() {
    return this.getTimePeriodButton('Year');
  },

  clickYearButton() {
    this.getYearButton().then(button => {
      button.click();
    });
  },

  makeDateArray(dateRange, dateFormat) {
    // RegEx removing spaces and dashes
    const charRemover = /\s*-|–\s*/;
    let dateArray = dateRange.split(charRemover);

    dateArray.forEach((dateItem, index) => {
      dateArray[index] = this.dateStringToObj(dateItem, dateFormat);
    });
    return dateArray;
  },

  dateRangeCalculator(dateArrayPromise) {
    return dateArrayPromise.then(dateArray => {
      return moment(dateArray[1]).diff(moment(dateArray[0]), 'days');
    });
  },

  dateStringToObj(dateString, dateFormat) { // dateFormat should be recognized by moment: 'MM/DD/YYYY' or 'D.M.YYYY'
    return moment(dateString, dateFormat).toDate();
  },

  // default params represent 10th - 16th of previous month to avoid selecting future dates
  pickCustomDateRange(startMonthIndex = 0, startDayText = '10', endMonthIndex = 0, endDayText = '16') {
    const fromField = this.getDateFields('from');
    const startDatePicker = element(by.className('date-range-picker-body')).all(by.className('month-wrapper')).get(startMonthIndex).element(by.css('tbody'))
      .all(by.cssContainingText('span', startDayText))
      .first();
    const endDatePicker = element(by.className('date-range-picker-body')).all(by.className('month-wrapper')).get(endMonthIndex).element(by.css('tbody'))
      .all(by.cssContainingText('span', endDayText))
      .first();

    fromField.click();
    startDatePicker.click();
    endDatePicker.click();
  },

  calculatePrevMonthDate(day, dateFormat) {
    return moment().set('date', day).subtract(1, 'month').format(dateFormat);
  },

  calculateWeeksBackDate(selectedDate, weeksBack, dateFormat) {
    return this.calculatePeriodBackDate('weeks', selectedDate, weeksBack, dateFormat);
  },

  calculateDaysBackDate(date, daysBack, dateFormat) {
    return this.calculatePeriodBackDate('days', date, daysBack, dateFormat);
  },

  calculatePeriodBackDate(period, date, unitsBack, dateFormat) { // period must be string value of 'days', 'weeks', 'months' etc.
    return this.calculatePeriodBackMoment(period, date, unitsBack, dateFormat).format(dateFormat);
  },

  calculatePeriodBackMoment(period, date, unitsBack, dateFormat) { // period must be string value of 'days', 'weeks', 'months' etc.
    return moment(date, `dddd, ${dateFormat}`).subtract(unitsBack, period);
  },

  checkMonth(monthName) {
    return element.all(by.css('span.month-title')).getText().then(visibleMonths => {
      const matchedMonth = visibleMonths.filter(singleVisibleMonth => {
        return singleVisibleMonth.match(monthName);
      });
      if (matchedMonth.length === 0) {
        element(by.css('a.prev-month-link')).click();
        return this.checkMonth(monthName);
      } else {
        return visibleMonths.indexOf(matchedMonth[0]);
      }
    });
  },

  clickDayInMonth(monthName, dayNumber) {
    return this.checkMonth(monthName).then(monthIndex => {
      return element(by.className('date-range-picker-body')).all(by.className('month-wrapper')).get(monthIndex).element(by.css('tbody'))
        .element(by.cssContainingText('span', dayNumber))
        .click();
    });
  },

  isDayInMonthEnabled(monthName, dayNumber) {
    return this.checkMonth(monthName).then(monthIndex => {
      return element(by.className('date-range-picker-body')).all(by.className('month-wrapper')).get(monthIndex).element(by.css('tbody'))
        .element(by.cssContainingText('td', dayNumber))
        .getAttribute('class');
    });
  },

  calculateCustomStartDate(endDate, daysInPeriod, dateFormat) {
    return [this.calculatePeriodBackMoment('days', endDate, daysInPeriod - 1, dateFormat).format('MMMM'), this.calculatePeriodBackMoment('days', endDate, daysInPeriod - 1, dateFormat).format('D')];
  },

  selectCustomStartDate(endDate, daysInPeriod, dateFormat) {
    const dateArray = this.calculateCustomStartDate(endDate, daysInPeriod, dateFormat);
    this.clickDayInMonth(dateArray[0], dateArray[1]);
  },

  getMiComparePeriodWarning() {
    return element(by.className('date-range-picker-period-nav')).element(by.css('a.selected')).element(by.className('date-range-picker-period-nav-content')).element(by.css('span.warning'));
  },

  calculateExpectedMiSubscriptionDates() {
    let expectedDateRange = [];
    expectedDateRange.push(moment().format('DD MMMM YYYY'));
    expectedDateRange.push(moment().add(1, 'y').add(1, 'd').format('DD MMMM YYYY'));
    return expectedDateRange;
  }
};
