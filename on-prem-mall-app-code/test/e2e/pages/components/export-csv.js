'use strict';

module.exports = {

  scheduledReportFields: {
    sendToEmail: element(by.className('schedule-form-recipient-field')),
    reportName: element(by.className('schedule-form-report-name-field')),
    reportMessage: element(by.className('schedule-form-report-message')),
    saveButton: element(by.className('export-action-save-schedule')),
    cancelButton: element(by.className('export-action-cancel-schedule'))
  },

  getExportSiteName() {
    return element(by.className('organization-csv-site-name')).getText();
  },

  getExportPageTitle() {
    const pageTitles = element.all(by.className('organization-csv-subtitle'));
    return pageTitles.filter(elem => {
      return elem.isDisplayed();
    }).first().getText();
  },

  getDateTimeHeaderText() {
    return element(by.css('.organization-csv-section-title.date-time')).getText();
  },

  getSelectMetricsHeaderText() {
    return element(by.css('.organization-csv-section-title.metrics')).getText();
  },

  getMetricTypeButtonText() {
    return element(by.css('.organization-csv-section-title.metrics')).all(by.css('button')).getText();
  },

  setMetricType(type) {
    if (type.toLowerCase() === 'visitor behavior') {
      element(by.css('metric-switch-selector')).all(by.repeater('group in ::vm.groups')).last().click();
    } else {
      element(by.css('metric-switch-selector')).all(by.repeater('group in ::vm.groups')).first().click();
    }
  },

  getMetrics() {
    return element.all(by.className('csv-export-metric-selector'));
  },

  getOpHoursVisibleText() {
    return element(by.css('.csv-export-block.op-hours')).getText();
  },

  getOpHoursMenuOptions() {
    this.openOpHoursMenu();
    return element(by.className('op-hours-dropdown-options')).all(by.css('a'));
  },

  openOpHoursMenu() {
    const opHoursMenu = element(by.css('div.op-hours-selection-dropdown'));
    opHoursMenu.click();
  },

  // helper for refactor (due to translation tests) of setting exported CSV report "group by" value.  Some calls to
  // setExportGroupBy pass in a string, but function now expects a row number.
  getGroupByRowNum(frequency) {
    switch (frequency.toLowerCase()) {
      case 'hour':
        return 0;
      case 'day':
        return 1;
      case 'week':
        return 2;
      case 'month':
        return 3;
      case 'aggregate':
        return 4;
      default:
        throw new Error(`${frequency} is not a valid option for frequency`);
    }
  },

  getExportGroupByOption(frequency) {
    const frequencyRowNum = this.getGroupByRowNum(frequency);
    const groupByOption = element(by.css('div.groupby-selection-dropdown')).all(by.repeater('groupByChoice in vm.groupByChoices').row(frequencyRowNum));
    return groupByOption;
  },

  setExportGroupBy(frequency) {
    this.openExportGroupByMenu();
    this.getExportGroupByOption(frequency).click();
  },

  openExportGroupByMenu() {
    const groupByMenu = element(by.css('div.groupby-selection-dropdown'));
    groupByMenu.click();
  },

  getExportGroupByVisibleText() {
    return element(by.css('.csv-export-block.groupby')).getText();
  },

  getExportGroupByMenuOptions() {
    this.openExportGroupByMenu();
    return element(by.className('group-by-dropdown-options')).all(by.css('a'));
  },

  getTimeSelectorVisibleText() {
    return element(by.css('.csv-export-block.csv-time-period-selector')).getText();
  },

  getExportButton() {
    return element(by.className('csv-export-actions')).element(by.className('csv-export-action-export-csv'));
  },

  getScheduleReportButton() {
    return element(by.className('csv-export-actions')).element(by.className('csv-export-action-schedule-report'));
  },

  getEditScheduleSection() {
    return element(by.tagName('scheduled-report-widget'));
  },

  getEditScheduleInputPlaceholders() {
    return element(by.id('schedule-form')).all(by.css('input')).getAttribute('placeholder');
  },

  getEditScheduleMsgPlaceholder() {
    return element(by.id('schedule-form')).element(by.css('textarea')).getAttribute('placeholder');
  },

  getAreaPicker() {
    return element(by.className('csv-export-select-sites-dropdown-wrapper'));
  },

  getAreaPickerHeaderText(locationType) {
    let picker;
    if (locationType === 'zone') {
      picker = element(by.css('.organization-csv-section.export-zone-picker'));
    } else if (locationType === 'site') {
      picker = element(by.css('.organization-csv-section.export-site-picker'));
    } else { // location type is area
      picker = element(by.css('.organization-csv-section.export-area-picker'));
    }
    return picker.element(by.css('h2')).getText();
  },

  getPickerSearchBar(locationType) {
    if (locationType === 'zone') {
      return this.getAreaPicker().element(by.className('zone-selector-header')).element(by.model('vm.filter'));
    } else if (locationType === 'site') {
      return this.getAreaPicker().element(by.className('site-selector-header')).element(by.model('vm.keyword'));
    } else { // location type is area
      return this.getAreaPicker().element(by.className('location-selector-header')).element(by.model('vm.filter'));
    }
  },

  getSelectAllBtn(locationType) {
    let picker;
    if (locationType === 'zone') {
      picker =  this.getAreaPicker().element(by.className('zone-selector-content'));
    } else if (locationType === 'site') {
      picker =  this.getAreaPicker().element(by.className('site-selector-content'));
    } else { // location type is area
      picker =  this.getAreaPicker().element(by.className('location-selector-content'));
    }

    return picker.element(by.className('select-all')).element(by.tagName('button'));
  },

  getAreaPickerList(locationType) {
    if (locationType === 'zone') {
      return this.getAreaPicker().element(by.className('zone-selector-content')).all(by.repeater('zone in vm.allZones')).getText();
    } else if (locationType === 'site') {
      return this.getAreaPicker().element(by.className('site-selector-content')).all(by.repeater('site in vm.sites ')).getText();
    } else { // location type is area
      // the repeater "vm.getRootNodes..." below returns an array of arrays.  In order to comfirm that listInDropdown matches the list of areas on the page, the array must be flattened
      const listInDropdown = this.getAreaPicker().element(by.className('location-selector-content')).all(by.repeater('location in vm.getRootNodesThatShouldBeShown()')).getText();
      return listInDropdown.then(multiAreaArray => {
        let masterArray = [];
        multiAreaArray.forEach(multiAreaString => {
          const individualAreas = multiAreaString.split('\n');
          masterArray = masterArray.concat(individualAreas);
        });
        return masterArray;
      });
    }
  },

  getSelectedAreaList(locationType) {
    const showAllButton = element(by.className('csv-export-site-selector-show-hide-button'));

    if (locationType === 'zone') {
      return showAllButton.isDisplayed().then(isListCollapsed => {
        if (isListCollapsed) {
          showAllButton.click();
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('zoneId in vm.selectedZones track by $index')).getText();
        } else {
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('zoneId in vm.selectedZones track by $index')).getText();
        }
      });
    } else if (locationType === 'site') {
      return showAllButton.isDisplayed().then(isListCollapsed => {
        if (isListCollapsed) {
          showAllButton.click();
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('siteId in vm.selectedSites track by $index')).getText();
        } else {
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('siteId in vm.selectedSites track by $index')).getText();
        }
      });
    } else { // location type is area
      return showAllButton.isDisplayed().then(isListCollapsed => {
        if (isListCollapsed) {
          showAllButton.click();
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('locationId in vm.selectedLocations track by $index')).getText();
        } else {
          return element(by.className('csv-export-site-selector-wrapper')).all(by.repeater('locationId in vm.selectedLocations track by $index')).getText();
        }
      });
    }
  },

  setAreaPickerLocation(locationType, areaName) {
    const areaPicker = this.getAreaPicker();
    let testArea;
    if (locationType === 'area') {
      testArea = element(by.className('location-selector-popover')).element(by.partialLinkText(areaName));
    } else if (locationType === 'site') {
      testArea = element(by.className('site-selector-popover')).element(by.partialLinkText(areaName));
    } else {
      testArea = element(by.className('zone-selector-popover')).element(by.partialLinkText(areaName));
    }
    areaPicker.click();
    browser.waitForAngular();
    browser.sleep(5000);
    testArea.click();
    browser.executeScript('window.scrollTo(0,0);').then(() => {
      areaPicker.click();
    });
  },

  getFilterMenuTitleText() {
    return element(by.className('csv-export-tag-filter-widget')).element(by.css('h2')).getText();
  },

// acceptable "frequency" parameters include (case sensitive strings): 'Day', 'Week', 'Month', or 'Year'.  Corresponds to options in "frequency" dropdown in "edit schedule" section on export CSV page.
  scheduleTestCSV(frequency, siteName) {
    this.scheduledReportFields.sendToEmail.clear();
    this.scheduledReportFields.reportName.clear();
    this.scheduledReportFields.reportMessage.clear();
    this.scheduledReportFields.sendToEmail.sendKeys('jzimmerman@shoppertrak.com');
    this.scheduledReportFields.reportName.sendKeys(`test CSV report - ${siteName}`);
    this.scheduledReportFields.reportMessage.sendKeys('Beep Beep I am a test report message. I should be readable and not gibberish.');
    this.setScheduledFrequency(frequency);
    this.scheduledReportFields.saveButton.click();
  },

  getFrequencyRowNum(frequency) {
    switch (frequency.toLowerCase()) {
      case 'daily':
        return 0;
      case 'weekly':
        return 1;
      case 'monthly':
        return 2;
      case 'yearly':
        return 3;
      default:
        throw new Error(`${frequency} is not a valid value for frequency.`);
    }
  },

  openScheduledFrequencyMenu() {
    const frequencyPicker = element(by.id('export-frequency')).element(by.css('button'));
    frequencyPicker.click();
  },

  setScheduledFrequency(frequency) {
    const frequencyRowNum = this.getFrequencyRowNum(frequency);
    return this.setScheduledFrequencyRowNum(frequencyRowNum);
  },

  setScheduledFrequencyRowNum(frequencyRowNum) {
    this.openScheduledFrequencyMenu();
    const interval = element(by.id('export-frequency')).all(by.repeater('frequency in vm.frequencyChoices').row(frequencyRowNum));
    interval.click();
  },

// gets list items in "edit schedule" frequency dropdown (daily, weekly, etc.)
  getScheduledFrequencyOptions() {
    this.openScheduledFrequencyMenu();
    return element(by.id('export-frequency')).all(by.repeater('frequency in vm.frequencyChoices'));
  },

// returns label text for options displayed after selecting a frequency option in dropdown; works with getFrequencyOptions____Label functions
  getFrequencyOptionLabel(frequencyRowNum) {
    this.setScheduledFrequencyRowNum(frequencyRowNum);
    return element(by.id('export-frequency-options')).element(by.css('label'));
  },

// returns text for secondary frequency options shown after selecting a frequency in "edit schedule" dropdown
  getFrequencyOptionSettings() {
    return element(by.id('export-frequency-options')).all(by.css('button'));
  },

  getFrequencyOptionsWeeklyLabel() {
    return this.getFrequencyOptionLabel(1);
  },

  getFrequencyOptionsMonthlyLabel() {
    return this.getFrequencyOptionLabel(2);
  },

  getFrequencyOptionsYearlyLabel() {
    return this.getFrequencyOptionLabel(3);
  },

  getScheduledActiveOptions() {
    this.openScheduledActiveMenu();
    return element(by.id('export-active')).all(by.repeater('active in vm.activeChoices'));
  },

  getScheduledCSVs() {
    return element.all(by.repeater('schedule in vm.schedules'));
  },

  getScheduledReportsHeader() {
    return element(by.className('csv-export-schedules-title'));
  },

  getScheduledReportsEmptyListMsg() {
    return element(by.className('organization-csv-no-reports'));
  },

  getScheduledReportListHeaders() {
    return element(by.className('organization-csv-scheduled-reports-header'));
  },

  removeScheduledCSV() {
    const removeIcon = element(by.repeater('schedule in vm.schedules')).element(by.css('span.csv-export-remove-icon'));
    removeIcon.click();
  },

  exportCSV() {
    this.getExportButton().click();
  }
};
