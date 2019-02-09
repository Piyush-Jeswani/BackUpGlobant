'use strict';

const usLocale = {
  locale: 'english (us)',
  rowNum: 5
};
const mxLocale = {
  locale: 'spanish (mexican)',
  rowNum: 7
};

module.exports = {

  clickSaveButton() {
    element(by.css('button.save-settings')).click();
  },

  getSettingSuccessAlert() {
    return element(by.css('div.alert-settings'));
  },

  getNumberFormat() {
    return element(by.css('custom-select[control-id=numberFormat-list-picker]')).element(by.css('ul.number-format-list-picker'));
  },

  getNumberFormatRowNum(format) {
    switch (format.toLowerCase()) {
      case 'default':
        return 0;
      case 'us':
        return 1;
      case 'europe':
        return 2;
      default:
        throw new Error(`${format} is not a valid option for format.`);
    }
  },

  setNumberFormat(format) {
    const rowNum = this.getNumberFormatRowNum(format);
    this.getNumberFormat().click().then(() => {
      this.getNumberFormat().all(by.repeater('item in items')).get(rowNum).click();
    });
  },

  getWeatherCheckbox() {
    return element(by.id('show-weather-metrics'));
  },

  getVelocityUnit() {
    return element(by.id('velocity-list-picker'));
  },

  getVelocityUnitRowNum(unit) {
    switch (unit.toLowerCase()) {
      case 'mph':
        return 0;
      case 'kph':
        return 1;
      default:
        throw new Error(`${unit} is not a valid option for unit.`);
    }
  },

  setVelocityUnit(unit) {
    const rowNum = this.getVelocityUnitRowNum(unit);
    this.getVelocityUnit().click().then(() => {
      this.getVelocityUnit().all(by.repeater('item in items')).get(rowNum).click();
    });
  },

  getTemperatureUnit() {
    return element(by.id('temp-list-picker'));
  },

  getTempUnitRowNum(unit) {
    switch (unit.toLowerCase()) {
      case '°c':
        return 0;
      case '°f':
        return 1;
      default:
        throw new Error(`${unit} is not a valid option for unit.`);
    }
  },

  setTempUnit(unit) {
    const rowNum = this.getTempUnitRowNum(unit);
    this.getTemperatureUnit().click().then(() => {
      this.getTemperatureUnit().all(by.repeater('item in items')).get(rowNum).click();
    });
  },

  getComparePeriodFormat(num) {
    const index = num - 1;
    return element.all(by.repeater('comparePeriod in comparePeriods')).get(index).element(by.id('period-picker'));
  },

  getComparePeriodRowNum(format) {
    switch (format.toLowerCase()) {
      case 'prior period':
        return 0;
      case 'prior year':
        return 1;
      case 'custom':
        return 2;
      default:
        throw new Error(`${format} is not a valid option for format.`);
    }
  },


  setComparePeriodFormat(num, format) {
    const rowNum = this.getComparePeriodRowNum(format);
    this.getComparePeriodFormat(num).click().then(() => {
      this.getComparePeriodFormat(num).all(by.repeater('item in items')).get(rowNum).click();
    });
  },

  getCompareWeeksBack(num) {
    const index = num - 1;
    return element.all(by.repeater('comparePeriod in comparePeriods')).get(index).element(by.model('comparePeriods[$index].comparePeriodWeeks'));
  },

  setCompareWeeksBack(num, weeksBack) {
    this.getCompareWeeksBack(num).clear();
    this.getCompareWeeksBack(num).sendKeys(weeksBack);
  },

  getDateFormat() {
    return element(by.css('custom-select[control-id=dateFormat-list-picker]')).element(by.id('dateFormat-list-picker'));
  },

  getDateFormatRowNum(dateFormat) {
    switch (dateFormat.toLowerCase()) {
      case 'default':
        return 0;
      case 'mm/dd/yyyy':
        return 1;
      case 'm/d/yy':
        return 2;
      case 'dd/mm/yyyy':
        return 3;
      case 'd.m.yyyy':
        return 4;
      case 'yyyy-mm-dd':
        return 5;
      default :
        throw new Error(`${dateFormat} is not a valid option for dateFormat.`);
    }
  },

  setDateFormat(dateFormat) {
    const rowNum = this.getDateFormatRowNum(dateFormat);
    this.getDateFormat().click().then(() => {
      this.getDateFormat().all(by.repeater('item in items')).get(rowNum).click();
    });
  },

  getLocale() {
    return element(by.css('custom-select[control-id=locale-selector]')).element(by.id('locale-selector'));
  },

  setLocale(locale) {
    this.getLocale().click();
    if (locale.toLowerCase() === usLocale.locale) {
      this.getLocale().all(by.repeater('item in items')).get(usLocale.rowNum).click();
    } else if (locale.toLowerCase() === mxLocale.locale) {
      this.getLocale().all(by.repeater('item in items')).get(mxLocale.rowNum).click();
    } else {
      throw new Error(`${locale} is not a valid option for locale.`);
    }
  },

  getCalendarSetting() {
    return element(by.css('custom-select[control-id=calendar-list-picker]')).element(by.id('calendar-list-picker'));
  },

  setCalendarSetting(calendar) {
    this.getCalendarSetting().click().then(() => {
      this.getCalendarSetting().element(by.cssContainingText('span', calendar)).click();
    });
  },

  getPasswordField(position) {
    if (position === 'first') {
      return element(by.model('credentials.password'));
    } else if (position === 'last') {
      return element(by.model('credentials.passwordConfirmation'));
    }
    throw new Error(`${position} is not a valid option for position.`);
  },

  clickPasswordSaveButton() {
    element(by.css('button.save-password')).click();
  },

  getPreferences() {
    return element(by.css('div.account-settings-form'));
  },

  getDeleteAllDashboardsButton() {
    return element(by.css('button.e2e-delete-all-custom-dashboards'));
  }
};
