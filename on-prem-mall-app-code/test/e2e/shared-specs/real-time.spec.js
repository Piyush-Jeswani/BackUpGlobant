const login = require('../pages/login.js');
const realTime = require('../pages/components/real-time.js');
const nav = require('../pages/components/nav-header.js');
const users = require('../data/users');
const orgData = require('../data/orgs.js');
const dateSelector = require('../pages/components/time-period-picker.js');


module.exports = {
  realTimeScenarios() {

    describe('As a Org Admin user Validate the functionality of widgets for Real Time data on Organisation Level', () => {

      it('Validate the landing page to be Traffic on North Face', () => {
        browser.waitForAngular();
        realTime.getPageHeader().then(text => {
          expect(text).toBe(realTime.specParams.pageHeader);
        });
        browser.waitForAngular();
        realTime.getPageTitle().then(text => {
          expect(text).toBe(realTime.specParams.pageTitle);
        });
      });

      it('Click on the Show Real Time Data button', () => {
        realTime.clickShowRealTimeData().then(() => {
          browser.waitForAngular();
        })
      });

      it('Check if the Show Real Time Data button is Disabled', () => {
        expect(realTime.validateShowRealTimeDataButton()).toBe(true);
      });

      it('Validate the Real Time Page Title', () => {
        expect(realTime.getPageTitle()).toBe(realTime.specParams.realTimePageTitle);
        expect(realTime.getPageHeader()).toBe(realTime.specParams.pageHeader);
      });

      it('Validate that the Clear Button is Disabled until any site is selected', () => {
        expect(realTime.validateClearButtonDisabled()).toBe(true);
      });

      it('Validate the presence of Select All button on the Site Selector Popover', () => {
        realTime.clickSelectSitesButton();
        expect(realTime.validateSelectAllButton()).toBe(true);
      });

      it('On clicking the Select All button all the sites should get selected', () => {
        realTime.clickSelectAllButton();
        expect(realTime.validateSelectedSiteCount()).toEqual(realTime.specParams.siteCount);
      });

      it('On clicking the Select All button again all the site should get unselected', () => {
        realTime.clickSelectAllButton();
        expect(realTime.validateUnSelectedSiteCount()).toEqual(realTime.specParams.siteCount);
      });


      it('On selecting one of the sites from the Site selector popover the page header should change to the selected site name', () => {
        realTime.selectSiteByName(realTime.specParams.site1Name);
        realTime.clickSelectSitesButton();
        expect(realTime.validateSelectedSite(realTime.specParams.site1Name)).toBe(true);
      });

      it('On selecting more than one site from the Site selector popover the page header should be changed to blank', () => {
        realTime.clickSelectSitesButton();
        realTime.selectSiteByName(realTime.specParams.site2Name);
        realTime.clickSelectSitesButton();
        expect(realTime.validateBlankPageHeaderForMultipleSitesSelected()).toBe(false);
      });

      it('Validate that the Clear Button is Enabled', () => {
        expect(realTime.validateClearButtonEnabled()).toBe(true);
        realTime.ClickClearButton();
      });

      it('Validate the Real Time Reporting Widget', () => {
        expect(realTime.validateRealTimeReportingWidget()).toBe(true);
      });

      it('Validate the Real Time Data by Site Widget', () => {
        expect(realTime.validateRealTimeDataBySiteWidget()).toBe(true);
      });

    });

    describe('As a Org Admin user Validate the functionality of widgets for Real Time data on Site Level', () => {

      it('Navigate to any site under North Face', () => {
        realTime.navigateToSite(realTime.specParams.site2Name);
      });

      it('Click on the Show Real Time Data button', () => {
        realTime.clickShowRealTimeData().then(() => {
          browser.waitForAngular();
        })
      });

      it('Validate the landing page', () => {
        realTime.getPageHeader().then(text => {
          expect(text).toBe(realTime.specParams.site2Name);
        });
        realTime.getPageTitleForSiteNavigation().then(text => {
          expect(`${text[0]} ${text[1]}`).toBe(realTime.specParams.realTimePageTitleForSite);
        });
      });

      it('Validate the Real Time Reporting Widget', () => {
        expect(realTime.validateRealTimeReportingWidget()).toBe(true);
      });

      it('Validate the Real Time Data by Site Widget', () => {
        expect(realTime.validateRealTimeDataBySiteWidget()).toBe(true);
      });

    });

  }
};
