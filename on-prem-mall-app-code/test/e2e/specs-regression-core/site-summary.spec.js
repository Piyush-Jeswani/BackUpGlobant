'use strict';

describe('Site navigation', function() {

  var orgData = require('../data/orgs.js');
  var userData = require('../data/users.js');
  var login = require('../pages/login.js');
  var nav = require('../pages/components/nav-header.js');
  var tabNav = require('../pages/components/tab-nav.js');
  var dateSelector = require('../pages/components/time-period-picker.js');

  //do not implement direct page navigation - manual navigation (via org-/site-picker and clicking tabs) confirms functionality for users
  beforeAll(function() {
    login.go();
    login.loginAsSuperUser();
  });

  describe('Single-site org', function () {
    beforeAll(function() {
      nav.pickSSOrg();
    });

    it('should navigate to site summary page if org has only one site', function () {
      var siteSummaryWidgetBar = tabNav.widgetBar();
      expect(siteSummaryWidgetBar.isPresent()).toBe(true);
    });
  });

  describe('Multi-site org', function () {
    beforeAll(function() {
      nav.pickMSOrg();
      nav.navToMSOrgSite();
    });

    it('should navigate to a site', function () {
      var title = nav.getSiteName();

      expect(title).toEqual(orgData.MSOrgSite.name);
      expect(browser.getCurrentUrl()).toMatch(orgData.MSOrgSite.id.toString());
    });

    it('date picker should appear', function () {
      var datePicker = dateSelector.getDatePicker();

      expect(datePicker.isPresent()).toBe(true);
    });

    describe('date range shown on picker should correspond to the active date button', function () {

      it('when selected reporting period is "week"', function () {
        dateSelector.clickWeekButton();
        var currentDateRange = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        var dateInterval = dateSelector.dateRangeCalculator(currentDateRange);

        expect(dateInterval).toEqual(6);
      });

      it('when selected reporting period is "month"', function () {
        dateSelector.clickMonthButton();
        var currentDateRange = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        var dateInterval = dateSelector.dateRangeCalculator(currentDateRange);

        expect(dateInterval).not.toBeNaN();
        expect(dateInterval).toEqual(jasmine.any(Number));

        expect(dateInterval).not.toBeLessThan(27);
        expect(dateInterval).not.toBeGreaterThan(30);
      });

      it('when selected reporting period is "year"', function () {
        dateSelector.clickYearButton();
        var currentDateRange = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        var dateInterval = dateSelector.dateRangeCalculator(currentDateRange);

        expect(dateInterval).not.toBeNaN();
        expect(dateInterval).toEqual(jasmine.any(Number));

        expect(dateInterval).not.toBeLessThan(364);
        expect(dateInterval).not.toBeGreaterThan(365);

      });
    });
  });

  afterAll(function() {
    nav.logout();
  });

});

