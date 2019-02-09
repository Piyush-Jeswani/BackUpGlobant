'use strict';

module.exports = {

  scheduledReportFields: {
    sendToEmail: element(by.className('schedule-form-recipient-field')),
    reportName: element(by.className('schedule-form-report-name-field')),
    reportMessage: element(by.className('schedule-form-report-message')),
    saveButton: element(by.className('export-action-save-schedule')),
    cancelButton: element(by.className('export-action-cancel-schedule'))
  },

  getExportPageTitle() {
    return element(by.className('pdf-export-page-title')).getText();
  },

  getExportSiteName() {
    return element(by.repeater('(areaKey,area) in exportList track by areaKey')).element(by.className('area-title')).getText();
  },

  getNoticeMessage() {
    return element(by.css('.alert-info.top-margin')).getText();
  },

  getMetrics() {
    let widgetArr = [];
    let str="";
    return element.all(by.css('ul.pdf-export-metric-list > li'))
      .map(parent => {
        return parent.all(by.css('span'))
          .map(child => {
            return child.getText()
          }).then(concatText => {
            return concatText.join('').replace('-', ' - ');
          }).then((val) => {
            widgetArr.push(val);
            return widgetArr;
          })
      }).then(() => {
        return widgetArr;
      })
  },

  getClearButton() {
    return element(by.className('pdf-export-clear-export'));
  },

  clearMetrics() {
    this.getClearButton().click();
  },

  getExportBackButton() {
    return element(by.css('div.modal-footer')).element(by.css('button.back-button'));
  },

  exportPDF() {
    this.getExportButton().click();
  },

  getExportButton() {
    return element(by.className('pdf-export-export-btn'));
  },

  isExportButtonEnabled() {
    return this.getExportButton().getAttribute('disabled')
      .then(disabledFlag => {
        return disabledFlag !== 'true';
      });
  },

  getScheduledPDFs() {
    return element.all(by.repeater('schedule in schedules'));
  },

  getScheduleReportButton() {
    return element(by.className('modal-footer')).element(by.className('pdf-export-schedule-report'));
  },

  isScheduleButtonEnabled() {
    return this.getScheduleReportButton().getAttribute('disabled')
      .then(disabledFlag => {
        return disabledFlag !== 'true';
      });
  },

  getEditScheduleSection() {
    return element(by.id('edit-schedule-form'));
  },

  getEditScheduleInputPlaceholders() {
    return element(by.id('edit-schedule-form')).all(by.css('input')).getAttribute('placeholder');
  },

  getEditScheduleMsgPlaceholder() {
    return element(by.id('edit-schedule-form')).element(by.css('textarea')).getAttribute('placeholder');
  },

  scheduleTestPDFView(frequency, siteName) {
    this.scheduledReportFields.sendToEmail.clear();
    this.scheduledReportFields.reportName.clear();
    this.scheduledReportFields.reportMessage.clear();
    this.scheduledReportFields.sendToEmail.sendKeys('jmahvish@shoppertrak.com');
    this.scheduledReportFields.reportName.sendKeys(`test PDF report - ${siteName}`);
    this.scheduledReportFields.reportMessage.sendKeys('Beep Beep I am a test report message. I should be readable and not gibberish.');
    this.setScheduledFrequency(frequency);
    this.scheduledReportFields.saveButton.click();
  },

  getEmptyCartMsg() {
    return element(by.className('pdf-export-status'));
  },

  getExportError() {
    return element(by.className('pdf-export-error'));
  },

  openScheduledFrequencyMenu() {
    element(by.id('export-frequency')).element(by.css('button')).click();
  },

  // helper for refactor (due to translation tests) of setting scheduled report frequency.  Some calls to setScheduledFrequency pass in a string,
  // but function now expects a row number.
  getFrequencyRowNum(frequency) {
    if (frequency === 'Daily') {
      return 0;
    } else if (frequency === 'Weekly') {
      return 1;
    } else if (frequency === 'Monthly') {
      return 2;
    } else if (frequency === 'Yearly') {
      return 3;
    } else {
      return frequency;
    }
  },

  setScheduledFrequency(frequency) {
    this.openScheduledFrequencyMenu();
    const frequencyRowNum = this.getFrequencyRowNum(frequency);
    element(by.id('export-frequency')).all(by.repeater('frequency in vm.frequencyChoices').row(frequencyRowNum)).click();
  },

  // gets list items in "edit schedule" frequency dropdown (daily, weekly, etc.)
  getScheduledFrequencyOptions() {
    this.openScheduledFrequencyMenu();
    return element(by.id('export-frequency')).all(by.repeater('frequency in vm.frequencyChoices'));
  },

  // returns label text displayed after selecting a frequency option in dropdown; works with getFrequencyOptions____Label functions
  getFrequencyOptionLabel(frequencyRowNum) {
    this.setScheduledFrequency(frequencyRowNum);
    return element(by.id('export-frequency-options')).element(by.css('label'));
  },

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

  getScheduledReportsHeader() {
    return element(by.className('pdf-export-schedules-title'));
  },

  getScheduledReportsEmptyListMsg() {
    return element(by.className('pdf-export-schedules-no-data'));
  },

  removeScheduledPDF() {
    var removeIcon = element(by.repeater('schedule in schedules')).element(by.css('.csv-export-remove-icon'));
    removeIcon.click();
  },

  clickWidgetExportButtons() {
    var buttonArray = element.all(by.css('div.export-widget:not(.csv):not(.add-to-custom-dashboard)'));
    return buttonArray.then(buttons => {
      buttons.forEach((item, index) => {
        buttons[index].click();
        browser.waitForAngular();
      });
    });
  }
};
