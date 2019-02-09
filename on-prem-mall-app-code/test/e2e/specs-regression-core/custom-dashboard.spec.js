const orgData = require('../data/orgs.js');
const userData = require('../data/users.js');
const login = require('../pages/login.js');
const nav = require('../pages/components/nav-header.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const customDashboard = require('../pages/components/custom-dashboard.js');
const fiveKpiWidget = require('../pages/components/organization-performance-widget.js');
const userPreferences = require('../pages/components/user-preferences.js');
const siteTrafficWidget = require('../pages/components/site-traffic-widget.js');
const entranceSummaryWidget = require('../pages/components/entrance-summary-widget.js');
const entranceContributionWidget = require('../pages/components/entrance-contribution-widget.js');
const powerHoursWidget = require('../pages/components/power-hours-widget.js');
const dailyPerformanceWidget = require('../pages/components/daily-performance-widget.js');
const dailyAveragesWidget = require('../pages/components/daily-metric-averages-widget.js');
const exportPDFView = require('../pages/components/export-pdf-view.js');

describe('Custom dashboard:', () => {
  let userId;
  let token;
  const preferencesUrl = '#/account/';
  const testTrafficUrl = `#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=` +
    `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}`;

  beforeAll(done => {
    login.getUserWithToken(tokenAndId => {
      ({ token, userId } = tokenAndId);
      browser.get(`${testTrafficUrl}&token=${token}`);
      done();
    }, userData.superUser);
  });

  describe('Toggle weather on', () => {
    it('should be to toggle weather metric on from user perfernaces', () => {
      browser.sleep(500);
      browser.get(preferencesUrl);
      browser.sleep(500);
      userPreferences.getWeatherCheckbox().click();
      browser.sleep(500);
      userPreferences.clickSaveButton();
      expect(userPreferences.getWeatherCheckbox().isSelected()).toBe(true);
      browser.get(testTrafficUrl);
    });
  });

  // RT400-RT402 AND RT409-410 CUSTOM DASHBOARD DELETE FUNCTIONALITY
  describe('dashboard save and delete functions', () => {
    // Custom Dashboard RT400
    it('should be able to save a new dashboard', () => {
      fiveKpiWidget.getCustomDashboardButton().click();
      browser.sleep(100);
      customDashboard.getCustomDashboardInput().click();
      customDashboard.getCustomDashboardInputField().sendKeys('e2e Test');
      customDashboard.getCustomDashboardSaveNewButton().click();
      expect(customDashboard.getCustomDashboardListMenuItems().count()).toEqual(1);
    });

    // Custom Dashboard RT401
    it('should be able to add 10 widgets to custom dashboard', () => {
      // this steps should add 9 dashboards to the dashboard that was created in the steps above
      for (let i = 0; i < 9; i += 1) {
        fiveKpiWidget.getCustomDashboardButton().click();
        browser.sleep(500);
        customDashboard.getCustomDashboardLabel('e2e Test').click();
        customDashboard.getCustomDashboardSaveExistingButton().click();
      }
    });

    it('should not be able to add more than 10 Widgets to dashboard', () => {
      fiveKpiWidget.getCustomDashboardButton().click();
      browser.sleep(1000);
      expect(customDashboard.getCustomDashboardSaveExistingButton().isEnabled()).toBe(false);
      customDashboard.getCustomDashboardCancel().click();
    });

    // Custom Dashboard RT402
    it('should be able to create/add upto 5 custom dashboards', () => {
      // this step should add 4 additional custom dashboards
      for (let i = 2; i <= 5; i += 1) {
        fiveKpiWidget.getCustomDashboardButton().click();
        browser.sleep(500);
        customDashboard.getCustomDashboardInput().click();
        customDashboard.getCustomDashboardCreateNewDashboard().click();
        customDashboard.getCustomDashboardInputField().sendKeys(`e2e Tests ${i}`);
        customDashboard.getCustomDashboardSaveNewButton().click();
      }
      expect(customDashboard.getCustomDashboardListMenuItems().count()).toEqual(5);
    });

    it('should NOT be able to create more than 5 dashboards', () => {
      fiveKpiWidget.getCustomDashboardButton().click();
      browser.sleep(5000);
      expect(customDashboard.getCustomDashboardCreateNewDashboard().isPresent()).toBe(false);
      browser.sleep(5000);
      expect(customDashboard.getCustomDashboardSaveExistingButton().isEnabled()).toBe(false);
      customDashboard.getCustomDashboardCancel().click();
    });

    // Custom Dashboard RT409
    it('should be able to delete inidvidual widgets from dashboard page', () => {
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test').click();
      expect(customDashboard.getWidgetsOnCustomDashboard().count()).toEqual(10);
      customDashboard.getCustomDashboardEditButton().click();
      browser.sleep(500);
      customDashboard.getCustomDashboardWidgetDeleteButton().click();
      customDashboard.getCustomDashboardSaveChangesButton().click();
      expect(customDashboard.getWidgetsOnCustomDashboard().count()).toEqual(9);
      browser.sleep(500);
    });

    // Custom Dashboard RT410
    it('should be able edit, click on delete and cancel the delete request from the dashboard page', () => {
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test').click();
      customDashboard.getCustomDashboardEditButton().click();
      browser.sleep(200);
      customDashboard.getCustomDashboardDeleteEntireDashboard().click();
      browser.sleep(200);
      customDashboard.getCustomDashboardConfirmDeletionCancel().click();
      browser.sleep(500);
      expect(customDashboard.getCustomDashboardSaveChangesButton().isEnabled()).toBe(true);
    });

    it('should be able to delete the entire dashboard from the dashboard view page', () => {
      customDashboard.getCustomDashboardDeleteEntireDashboard().click();
      browser.sleep(200);
      customDashboard.getCustomDashboardConfirmDeletionOK().click();
      browser.sleep(500);
      expect(customDashboard.getCustomDashboardTitle('e2e Tests 2').getText()).toMatch('e2e Tests 2');
    });

    it('should be able to delete ALL dashboards from user preferences page', () => {
      browser.get('#/account/');
      browser.sleep(500);
      userPreferences.getDeleteAllDashboardsButton().click();
      browser.sleep(1000);
      let EC = protractor.ExpectedConditions;
      browser.wait(EC.alertIsPresent(), 5000, 'Alert is not appearing');
      browser.switchTo().alert().accept();
      browser.sleep(500);
      userPreferences.clickSaveButton();
      browser.sleep(500);
      browser.get(testTrafficUrl);
      expect(customDashboard.getCustomDashboardListMenuItems().count()).toEqual(0);
    });
  });

  // RT403 VERIFICATION OF SETTINGS
  describe('verifying widget setting persist to custom dashboard', () => {
    it('should be able to 5 kpi widget to the dashboard', () => {
      browser.get(testTrafficUrl);
      browser.sleep(100);
      fiveKpiWidget.getCustomDashboardButton().click();
      browser.sleep(100);
      customDashboard.getCustomDashboardInput().click();
      customDashboard.getCustomDashboardInputField().sendKeys('e2e Test');
      customDashboard.getCustomDashboardSaveNewButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      browser.sleep(500);
      expect(fiveKpiWidget.widgetTitle().getText()).toMatch('Site performance');
    });

    it('(may fail until SA-4268 is fixed) should be able to change settings to traffic widget and the settings persist to customdashboard', () => {
      browser.get(testTrafficUrl);
      dateSelector.clickMonthButton();
      siteTrafficWidget.selectMetric('sales');
      siteTrafficWidget.setWeatherMetric('high temperature');
      siteTrafficWidget.getCustomDashboardButton().click();
      browser.sleep(500);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      browser.sleep(1000);
      expect(siteTrafficWidget.widgetTitle().getText()).toMatch('Sales');
      const legendText = siteTrafficWidget.getLegendTextLowerCase();
      browser.sleep(1000);
      expect(siteTrafficWidget.getWeatherDropdown().isPresent()).toBe(true);
      browser.sleep(1000);
      expect(legendText).toMatch('temperature');
      expect(legendText).toMatch('high temperature');
      expect(customDashboard.getWidgetDateRangeOnDashboard(1).getText()).toMatch('Month');
    });

    it('should be able to add the entrance summary widget to custom dashboard', () => {
      browser.get(testTrafficUrl);
      dateSelector.clickYearButton();
      entranceSummaryWidget.getCustomDashboardButton().click();
      browser.sleep(700);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      expect(entranceSummaryWidget.widgetTitle().getText()).toMatch('Entrance summary');
      expect(customDashboard.getWidgetDateRangeOnDashboard(2).getText()).toMatch('Year');
    });

    it('should be able to add entrance contribution widget to custom dashboard', () => {
      browser.get(testTrafficUrl);
      entranceContributionWidget.getCustomDashboardButton().click();
      browser.sleep(700);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      expect(entranceContributionWidget.widgetTitle().getText()).toMatch('Entrance contribution');
    });

    it('should be able to change settings for PowerHours and it should render to custom dashboards', () => {
      browser.get(testTrafficUrl);
      powerHoursWidget.selectMetricDropdown('star', false);
      powerHoursWidget.getCustomDashboardButton().click();
      browser.sleep(700);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      browser.sleep(1000);
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      expect(powerHoursWidget.getMetricOptions().getText()).toMatch('STAR');
      browser.sleep(1000);
    });

    it('should be able to change settings and show table on Daily Performance indicators and it should render to custom dashboard', () => {
      const dayLabels = ['Sunday', 'Monday', 'Tuesday'];
      browser.get(testTrafficUrl);
      dailyPerformanceWidget.openDaySelectorDropdown();
      dailyPerformanceWidget.selectDay('Sunday');
      dailyPerformanceWidget.selectDay('Monday');
      dailyPerformanceWidget.selectDay('Tuesday');
      dailyPerformanceWidget.openDaySelectorDropdown();
      dailyPerformanceWidget.getExpandTableButton().click();
      dailyPerformanceWidget.getCustomDashboardButton().click();
      browser.sleep(700);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      browser.sleep(1000);
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      browser.sleep(100);
      expect(dailyPerformanceWidget.getChartXAxisLabels('left')).toEqual(dayLabels);
      expect(dailyPerformanceWidget.getChartXAxisLabels('right')).toEqual(dayLabels);
      // this step will fail until bug SA-3582 is resolved
      expect(dailyPerformanceWidget.isTableDisplayed()).toEqual(true);
      browser.sleep(1000);
    });

    it('should be able to change settings and show table on Daily Averages and it should render to custom Dashboard', () => {
      const dayLabels = ['Sunday', 'Monday', 'Tuesday'];
      browser.get(testTrafficUrl);
      dailyAveragesWidget.openDaySelectorDropdown();
      dailyAveragesWidget.selectDay('Sunday');
      dailyAveragesWidget.selectDay('Monday');
      dailyAveragesWidget.selectDay('Tuesday');
      dailyAveragesWidget.openDaySelectorDropdown();
      dailyAveragesWidget.getExpandTableButton().click();
      dailyAveragesWidget.getCustomDashboardButton().click();
      browser.sleep(700);
      customDashboard.getCustomDashboardLabel('e2e Test').click();
      browser.sleep(1000);
      customDashboard.getCustomDashboardSaveExistingButton().click();
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      customDashboard.getCustomDashboardTitle('e2e Test');
      browser.sleep(1000);
      expect(dailyAveragesWidget.isTableDisplayed()).toEqual(true);
      expect(dailyAveragesWidget.getXAxisLabels()).toEqual(dayLabels);
      expect(dailyAveragesWidget.getTableDayLabels()).toEqual(dayLabels);
      browser.sleep(1000);
    });
  });

  // RT404 DASHBOARD CHANGE SETTINGS OUTSIDE OF EDIT VIEW
  describe('dashboard change/save outside of edit mode', () => {
    it('should be able to make changes to traffic widget outside of edit mode', () => {
      browser.sleep(500);
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        siteTrafficWidget.selectMetric('conversion');
        siteTrafficWidget.setWeatherMetric('low temperature');
        expect(siteTrafficWidget.widgetTitle().getText()).toMatch('Conversion');
        const legendText = siteTrafficWidget.getLegendTextLowerCase();
        expect(siteTrafficWidget.getWeatherDropdown().isPresent()).toBe(true);
        browser.sleep(1000);
        expect(legendText).toMatch('temperature');
        expect(legendText).toMatch('high temperature');
        expect(legendText).toMatch('low temperature');
        browser.get(testTrafficUrl);
      });
    });

    it('(may fail until SA-4268 is fixed)settings changed outside of edit view should not persist after navigating away and back to dashboard', () => {
      customDashboard.getCustomDashboardNavigatetoDashboard().click();
      expect(siteTrafficWidget.widgetTitle().getText()).toMatch('Sales');
      const legendText = siteTrafficWidget.getLegendTextLowerCase();
      browser.sleep(1000);
      expect(siteTrafficWidget.getWeatherDropdown().isPresent()).toBe(true);
      browser.sleep(1000);
      expect(legendText).toMatch('temperature');
      expect(legendText).toMatch('high temperature');
      expect(customDashboard.getWidgetDateRangeOnDashboard(1).getText()).toMatch('Month');
    });
  });

  // RT405 DASHBOARD EDIT VIEW CHANGE/SAVE
  describe('dashboard edit view save changes', () => {
    it('should be able to change dashboard name in edit mode and save settings', () => {
      browser.sleep(1000);
      customDashboard.getCustomDashboardEditButton().click();
      customDashboard.getEditDashboardTitleinEditMode().clear();
      customDashboard.getEditDashboardTitleinEditMode().sendKeys('Test rename in edit mode');
      customDashboard.getCustomDashboardSaveChangesButton().click();
      browser.sleep(700);
      expect(customDashboard.getCustomDashboardTitle('Test rename in edit mode').getText()).toMatch('Test rename in edit mode');
    });

    it('should be able to change date range on 5 KPI widget in edit move and save settings', () => {
      browser.sleep(1000);
      customDashboard.getCustomDashboardEditButton().click();
      customDashboard.getDateSelectorWithinWidget(0).click();
      browser.sleep(500);
      customDashboard.getEditDateDropdownIndividualWidget(0, 'month to date').click();
      customDashboard.getCustomDashboardSaveChangesButton().click();
      browser.sleep(500);
      expect(customDashboard.getWidgetDateRangeOnDashboard(0).getText()).toMatch('Month to date');
    });

    it('should be able to change setting in site traffic widget in edit mode and save settings', () => {
      browser.sleep(1000);
      customDashboard.getCustomDashboardEditButton().click();
      siteTrafficWidget.selectMetric('conversion');
      siteTrafficWidget.setWeatherMetric('low temperature');
      customDashboard.getCustomDashboardSaveChangesButton().click();
      expect(siteTrafficWidget.widgetTitle().getText()).toMatch('Conversion');
      const legendText = siteTrafficWidget.getLegendTextLowerCase();
      expect(siteTrafficWidget.getWeatherDropdown().isPresent()).toBe(true);
      browser.sleep(1000);
      expect(legendText).toMatch('temperature');
      expect(legendText).toMatch('high temperature');
      expect(legendText).toMatch('low temperature');
    });

    it('should be able to change default page date range in edit mode and save changes', () => {
      browser.sleep(1000);
      customDashboard.getCustomDashboardEditButton().click();
      browser.sleep(500);
      customDashboard.getCustomDashboardSelectDatePeriodDropdown().click();
      customDashboard.getCustomDashboardDefaulPageDateRange('year to date').click();
      customDashboard.getCustomDashboardSaveChangesButton().click();
      browser.sleep(1000);
      for (let i = 0; i < 7; i += 1) {
        expect(customDashboard.getWidgetDateRangeOnDashboard(i).getText()).toMatch('Page Default');
      }
    });
  });

    // RT406 DOWNLOAD AND SCHEDULE PDF REPORTS
  describe('REPORTS: should be able to export and schedule individual widgets, current view', () => {
    it('(flaky on staging-could time out)PDF: should be able to click on export button on individual widget (Fails until SA-3893 is fixed)', () => {
      browser.sleep(1000);
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        for (let i = 0; i < 6; i += 1) {
          customDashboard.getCustomDashboardExportToPdf(i).click();
        }
        nav.navToExportSelected();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        browser.sleep(500);
        const orgSiteName = exportPDFView.getExportSiteName();
        expect(orgSiteName).toMatch('North Face / 10 North Face - Chicago');
        exportPDFView.exportPDF();
        exportPDFView.getExportBackButton().click();
        browser.sleep(1000);
        expect(customDashboard.getCustomDashboardTitle('Test rename in edit mode').getText()).toMatch('Test rename in edit mode');
      });
    });

    it('(flaky on staging-could time out)PDF: should be able to click on export current view and schedule/download pdf', () => {
      browser.sleep(500);
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        browser.sleep(500);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        const orgSiteName = exportPDFView.getExportSiteName();
        expect(orgSiteName).toMatch('North Face / 10 North Face - Chicago');
        exportPDFView.exportPDF();
        exportPDFView.getExportBackButton().click();
        expect(customDashboard.getCustomDashboardTitle('Test rename in edit mode').getText()).toMatch('Test rename in edit mode');
      });
    });

    it('PDF: should be able to schedule PDF', () => {
      browser.sleep(500);
      nav.navToExportPDFView();
      exportPDFView.getScheduleReportButton().click();
      exportPDFView.scheduleTestPDFView('Daily', 'North Face');
      exportPDFView.getExportBackButton().click();
      expect(customDashboard.getCustomDashboardTitle('Test rename in edit mode').getText()).toMatch('Test rename in edit mode');
    });
  });
});

afterAll(done => {
  nav.logout();
  login.deleteUser(done, userId);
});
