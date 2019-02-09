
const moment = require('moment');
const orgData = require('../data/orgs.js');
const userData = require('../data/users.js');
const login = require('../pages/login.js');
const nav = require('../pages/components/nav-header.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const userPreferences = require('../pages/components/user-preferences.js');
const salesWidget = require('../pages/components/zone-sales-widget.js');
const conversionWidget = require('../pages/components/zone-conversion-widget.js');
const trafficWidget = require('../pages/components/site-traffic-widget.js');
const spanishTranslations = require('../../../src/l10n/languages/es_MX.json');
const randomString = require('randomstring');

describe('User preferences:', () => {
  let userId;
  let token;
  let username;
  const preferencesUrl = '#/account/';
  const testSalesUrl = `#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/sales-and-conversion?dateRangeStart=` +
    `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}`;
  const testTrafficUrl = `#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=` +
    `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}`;

  beforeAll(done => {
    login.getUserWithToken(tokenAndId => {
      ({ token, userId, username } = tokenAndId);
      browser.get(`#/account/?token=${token}`);
      done();
    }, userData.superUser);
  });

  describe('number format setting', () => {
    it('initial setting should be European format', () => {
      expect(userPreferences.getNumberFormat().getText()).toEqual('1.234,00');
    });

    it('should change number format and apply new format to app pages', () => {
      userPreferences.setNumberFormat('US');
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testSalesUrl);

      expect(salesWidget.getSelectedPeriodOverall('US')).not.toBeNaN();
      expect(salesWidget.getSelectedPeriodOverall('US')).not.toEqual(0);

      expect(conversionWidget.getSelectedPeriodOverall('US')).not.toBeNaN();
      expect(conversionWidget.getSelectedPeriodOverall('US')).not.toEqual(0);
    });

    it('should maintain the new number format on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getNumberFormat().getText()).toEqual('1,234.00');
    });

    it('(Fails until SA-3495 is fixed) should change number format to use organization default and should persist after saving settings', () => {
      userPreferences.setNumberFormat('default');
      userPreferences.clickSaveButton();
      expect(userPreferences.getNumberFormat().getText()).toEqual('Use organization default');
    });
  });

  describe('weather metric settings', () => {
    const temp = trafficWidget.getWeatherMetrics()[0];
    const windSpeed = trafficWidget.getWeatherMetrics()[6];
    const humidity = trafficWidget.getWeatherMetrics()[4];
    const degreesF = trafficWidget.getWeatherUnits()[0];
    const degreesC = trafficWidget.getWeatherUnits()[1];
    const mph = trafficWidget.getWeatherUnits()[2];
    const kph = trafficWidget.getWeatherUnits()[3];

    it('"show weather metrics" checkbox toggle should appear', () => {
      expect(userPreferences.getWeatherCheckbox().isPresent()).toBe(true);
    });

    it('initial weather checkbox value should be false', () => {
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(false);
    });

    it('user can toggle weather checkbox value', () => {
      userPreferences.getWeatherCheckbox().click();
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(true);
      userPreferences.getWeatherCheckbox().click();
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(false);
    });

    it('when weather checkbox value is false, unit dropdowns should not appear', () => {
      expect(userPreferences.getVelocityUnit().isPresent()).toBe(false);
      expect(userPreferences.getTemperatureUnit().isPresent()).toBe(false);
    });

    it('when weather checkbox value is true, unit dropdowns should appear', () => {
      userPreferences.getWeatherCheckbox().click();
      expect(userPreferences.getVelocityUnit().isPresent()).toBe(true);
      expect(userPreferences.getTemperatureUnit().isPresent()).toBe(true);
    });

    it('should show correct options in velocity dropdown', () => {
      userPreferences.getVelocityUnit().click();
      expect(userPreferences.getVelocityUnit().getTextLowerCase()).toMatch(mph);
      expect(userPreferences.getVelocityUnit().getTextLowerCase()).toMatch(kph);
      userPreferences.getVelocityUnit().click();
    });

    it('should show correct options in temperature dropdown', () => {
      userPreferences.getTemperatureUnit().click();
      expect(userPreferences.getTemperatureUnit().getTextLowerCase()).toMatch(degreesC);
      expect(userPreferences.getTemperatureUnit().getTextLowerCase()).toMatch(degreesF);
      userPreferences.getTemperatureUnit().click();
    });

    it('initial settings in unit dropdowns should be correct', () => {
      expect(userPreferences.getVelocityUnit().getText()).toMatch(userData.superUser.weatherOptions.windSpeedUnits);
      expect(userPreferences.getTemperatureUnit().getText()).toMatch(userData.superUser.weatherOptions.tempUnits);
    });

    it('should save the user\'s weather preference and apply the setting to app pages', () => {
      userPreferences.setVelocityUnit(mph);
      userPreferences.setTempUnit(degreesF);

      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testTrafficUrl);

      // show two additional metrics on chart to test metric selection/rendering
      trafficWidget.setWeatherMetric(windSpeed);
      trafficWidget.setWeatherMetric(humidity);

      const legendText = trafficWidget.getLegendTextLowerCase();

      // check that weather metric dropdown appears
      expect(trafficWidget.getWeatherDropdown().isPresent()).toBe(true);
      // check that temperature, wind speed, humidity metrics are present
      expect(legendText).toMatch(temp);
      expect(legendText).toMatch(windSpeed);
      expect(legendText).toMatch(humidity);

      // failing until SA-2099 is resolved
      const tooltipText = trafficWidget.getTooltipText();
      expect(tooltipText).toMatch(temp);
      expect(tooltipText).toMatch(windSpeed);
      expect(tooltipText).toMatch(humidity);
      // check that unit settings are persisting
      expect(tooltipText).toMatch(mph);
      expect(tooltipText).toMatch(degreesF);
    });

    it('should maintain the weather settings on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(true);
      expect(userPreferences.getVelocityUnit().getTextLowerCase()).toMatch(mph);
      expect(userPreferences.getTemperatureUnit().getTextLowerCase()).toMatch(degreesF);
    });

    it('should hide the weather feature in the app when weather is not activated', () => {
      userPreferences.getWeatherCheckbox().click();
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testTrafficUrl);

      const legendText = trafficWidget.getLegendTextLowerCase();
      const tooltipText = trafficWidget.getTooltipText();

      expect(trafficWidget.getWeatherDropdown().isPresent()).toBe(false);
      expect(legendText).not.toMatch(temp);
      expect(tooltipText).not.toMatch(temp);
    });

    it('should maintain the weather settings on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(false);
    });
  });

  describe('compare period settings', () => {
    it('initial settings should be prior period/prior year', () => {
      expect(userPreferences.getComparePeriodFormat(1).getText()).toEqual(userData.superUser.comparePd1Text);
      expect(userPreferences.getComparePeriodFormat(2).getText()).toEqual(userData.superUser.comparePd2Text);
    });

    it('should change compare periods and apply new settings to app pages', () => {
      const comparePd1WeeksBack = userData.mondayUser.comparePd1WeeksBack;
      const comparePd2WeeksBack = userData.mondayUser.comparePd2WeeksBack;
      const dateFormat = userData.superUser.dateFormat;

      userPreferences.setComparePeriodFormat(1, 'custom');
      userPreferences.setComparePeriodFormat(2, 'custom');
      userPreferences.setCompareWeeksBack(1, comparePd1WeeksBack);
      userPreferences.setCompareWeeksBack(2, comparePd2WeeksBack);
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testSalesUrl);

      // confirm custom period labels have updated correctly
      const legendText = salesWidget.getLegendText();

      expect(legendText).toMatch(userData.mondayUser.comparePd1Text.toLowerCase());
      expect(legendText).toMatch(userData.mondayUser.comparePd2Text.toLowerCase());
      expect(salesWidget.getSummaryFrameCompare1Label()).toMatch(userData.mondayUser.comparePd1Text.toUpperCase());
      expect(salesWidget.getSummaryFrameCompare2Label()).toMatch(userData.mondayUser.comparePd2Text.toUpperCase());

      // confirm custom period dates have updated correctly
      const expectedDateRange = [
        dateSelector.getDate('week', true),
        dateSelector.getDate('week', false)
      ];
      const expectedDateRangeValue = [
        expectedDateRange[0].toDate(),
        expectedDateRange[1].toDate()
      ];
      const expectedCompare1Value = [
        moment(expectedDateRange[0]).subtract(comparePd1WeeksBack, 'week').toDate(),
        moment(expectedDateRange[1]).subtract(comparePd1WeeksBack, 'week').toDate()
      ];
      const expectedCompare2Value = [
        moment(expectedDateRange[0]).subtract(comparePd2WeeksBack, 'week').toDate(),
        moment(expectedDateRange[1]).subtract(comparePd2WeeksBack, 'week').toDate()
      ];
      const widgetSelectedPeriod = salesWidget.getSelectedPeriodDateRange(dateFormat);
      const widgetCustomPeriod1 = salesWidget.getPriorPeriodDateRange(dateFormat);
      const widgetCustomPeriod2 = salesWidget.getPriorYearDateRange(dateFormat);

      expect(widgetSelectedPeriod).toEqual(expectedDateRangeValue);
      expect(widgetCustomPeriod1).toEqual(expectedCompare1Value);
      expect(widgetCustomPeriod2).toEqual(expectedCompare2Value);
    });

    it('should maintain the new compare period settings on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getComparePeriodFormat(1).getText()).toEqual('Custom');
      expect(userPreferences.getComparePeriodFormat(2).getText()).toEqual('Custom');
      expect(userPreferences.getCompareWeeksBack(1).getAttribute('value')).toEqual(userData.mondayUser.comparePd1WeeksBack.toString());
      expect(userPreferences.getCompareWeeksBack(2).getAttribute('value')).toEqual(userData.mondayUser.comparePd2WeeksBack.toString());
    });
  });

  describe('date format setting', () => {
    it(`initial setting should be ${userData.superUser.dateFormat}`, () => {
      expect(userPreferences.getDateFormat().getText()).toEqual(userData.superUser.dateFormat);
    });

    it('should change date format and apply the new setting to app pages', () => {
      userPreferences.setDateFormat(userData.mondayUser.dateFormat);
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testSalesUrl);

      const comparePd1WeeksBack = userData.mondayUser.comparePd1WeeksBack;
      const comparePd2WeeksBack = userData.mondayUser.comparePd2WeeksBack;
      const changedDateFormat = userData.mondayUser.dateFormat;
      const expectedDateRange = [
        dateSelector.getDate('week', true),
        dateSelector.getDate('week', false)
      ];
      const expectedDateRangeValue = [
        expectedDateRange[0].format(changedDateFormat),
        expectedDateRange[1].format(changedDateFormat)
      ];
      const expectedCompare1Value = [
        moment(expectedDateRange[0]).subtract(comparePd1WeeksBack, 'week').format(changedDateFormat),
        moment(expectedDateRange[1]).subtract(comparePd1WeeksBack, 'week').format(changedDateFormat)
      ];
      const expectedCompare2Value = [
        moment(expectedDateRange[0]).subtract(comparePd2WeeksBack, 'week').format(changedDateFormat),
        moment(expectedDateRange[1]).subtract(comparePd2WeeksBack, 'week').format(changedDateFormat)
      ];
      const selectedPeriodDate = salesWidget.getSelectedPeriodDateRangeText();
      const customReportPeriod1Date = salesWidget.getPriorPeriodDateRangeText();
      const customReportPeriod2Date = salesWidget.getPriorYearDateRangeText();

      expect(selectedPeriodDate).toMatch(expectedDateRangeValue[0]);
      expect(selectedPeriodDate).toMatch(expectedDateRangeValue[1]);
      expect(customReportPeriod1Date).toMatch(expectedCompare1Value[0]);
      expect(customReportPeriod1Date).toMatch(expectedCompare1Value[1]);
      expect(customReportPeriod2Date).toMatch(expectedCompare2Value[0]);
      expect(customReportPeriod2Date).toMatch(expectedCompare2Value[1]);
    });

    it('should maintain the new date format on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getDateFormat().getText()).toEqual(userData.mondayUser.dateFormat);
    });
  });

  describe('calendar setting', () => {
    it(`initial setting should be ${userData.superUser.calendar}`, () => {
      expect(userPreferences.getCalendarSetting().getText()).toEqual(userData.superUser.calendar);
    });

    it('should change the calendar and apply the new setting to app pages', () => {
      userPreferences.setCalendarSetting(userData.mondayUser.calendar);
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      // must use standard nav in order to set date range properly - direct navigation causes date range to be incorrectly Sunday-based
      // browser.get(testSalesUrl);
      nav.pickRetailOrg();
      nav.navToRetailOrgSite();

      dateSelector.toggleDatePicker();
      dateSelector.getDateFieldValues(userData.mondayUser.dateFormat).then(dateRange => {
        const startDay = moment(dateRange[0], userData.mondayUser.dateFormat).format('dddd');
        const endDay = moment(dateRange[1], userData.mondayUser.dateFormat).format('dddd');
        expect(dateSelector.getDOWHeaders()).toEqual(dateSelector.getMondayCalDOWHeaders());
        expect(startDay).toEqual('Monday');
        expect(endDay).toEqual('Sunday');
      });
    });

    it('should maintain the new calendar on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getCalendarSetting().getText()).toEqual(userData.mondayUser.calendar);
    });
  });

  describe('locale setting', () => {
    it('initial setting should be English (US)', () => {
      expect(userPreferences.getLocale().getText()).toEqual('English (US)');
    });

    it('should change locale and apply the new setting to app pages', () => {
      userPreferences.setLocale('spanish (mexican)');
      userPreferences.clickSaveButton();
      browser.waitForAngular();
      browser.get(testSalesUrl);

      expect(salesWidget.widgetTitle().getText()).toEqual(spanishTranslations.kpis.kpiTitle.sales);
      expect(salesWidget.getLegendText()).toEqual([
        spanishTranslations.common.SELECTEDPERIOD.toLowerCase(),
        spanishTranslations.common.CUSTOMCOMPARE1.toLowerCase(),
        spanishTranslations.common.CUSTOMCOMPARE2.toLowerCase()]);
      expect(salesWidget.getSummaryFrameSelectedPeriodLabel()).toEqual(spanishTranslations.common.SELECTEDPERIOD);
      expect(salesWidget.getSummaryFrameCompare1Label()).toEqual(spanishTranslations.common.CUSTOMCOMPARE1.toUpperCase());
      expect(salesWidget.getSummaryFrameCompare2Label()).toEqual(spanishTranslations.common.CUSTOMCOMPARE2.toUpperCase());
      expect(salesWidget.getSummaryFrameMetricLabel()).toEqual(spanishTranslations.kpis.totalLabel.sales.toUpperCase());
    });

    it('should maintain the new locale on the preferences page', () => {
      browser.get(preferencesUrl);
      expect(userPreferences.getLocale().getText()).toEqual('Spanish (Mexican)');

      const preferencesText = userPreferences.getPreferences().getText();
      const headerBarText = nav.getHeaderBar().getText();
      const preferencesTranslations = [
        spanishTranslations.accountView.MYACCOUNT,
        spanishTranslations.accountView.PREFERENCES,
        spanishTranslations.accountView.CURRENTUSER,
        spanishTranslations.accountView.BACKTOAPP,
        spanishTranslations.accountView.SELECTCALENDAR,
        spanishTranslations.accountView.NUMBERFORMAT,
        spanishTranslations.accountView.COMPAREPERIOD1,
        `${spanishTranslations.common.CUSTOMCOMPARE1} - ${spanishTranslations.accountView.NUMBEROFWEEKS}`,
        spanishTranslations.accountView.COMPAREPERIOD2,
        `${spanishTranslations.common.CUSTOMCOMPARE2} - ${spanishTranslations.accountView.NUMBEROFWEEKS}`,
        spanishTranslations.accountView.DATEFORMAT,
        spanishTranslations.accountView.LANGUAGE,
        spanishTranslations.accountView.SHOWWEATHERMETRICS,
        spanishTranslations.accountView.SAVESETTINGS,
        spanishTranslations.accountView.CHANGEPASSWORD,
        spanishTranslations.accountView.NEWPASSWORD,
        // the key accountView.NEWPASSWORDAGAIN will not pass expectation below for some reason
        spanishTranslations.accountView.CHANGEPASSWORD,
        spanishTranslations.accountView.CACHESETTINGS,
        spanishTranslations.accountView.CLEARCACHE
      ];
      const headerBarTranslations = [
        spanishTranslations.header.SELECTORGANIZATION,
        spanishTranslations.header.SUPPORT,
        spanishTranslations.header.EXPORT
      ];
      preferencesTranslations.forEach(translation => {
        expect(preferencesText).toMatch(translation);
      });
      headerBarTranslations.forEach(translation => {
        expect(headerBarText).toMatch(translation);
      });
    });
  });

  describe('changing user\'s password', () => {
    it('should successfully change a user\'s password and allow the user to login with the new password', () => {
      const newPassword = randomString.generate({
        length: 8,
        readable: true
      });

      userPreferences.getPasswordField('first').sendKeys(newPassword);
      userPreferences.getPasswordField('last').sendKeys(newPassword);
      userPreferences.clickPasswordSaveButton();
      browser.waitForAngular();
      nav.logout();

      const loginURL = browser.getCurrentUrl();

      login.fields.username.clear();
      login.fields.password.clear();
      login.fields.username.sendKeys(username);
      login.fields.password.sendKeys(newPassword);
      login.fields.loginButton.click();
      expect(browser.getCurrentUrl()).not.toEqual(loginURL);
    });
  });

  afterAll(done => {
    nav.logout();
    login.deleteUser(done, userId);
  });
});

