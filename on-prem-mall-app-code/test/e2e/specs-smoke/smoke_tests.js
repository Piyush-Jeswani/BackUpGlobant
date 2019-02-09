'use strict';
const login = require('../pages/login.js');
const nav = require('../pages/components/nav-header.js');
const orgPage = require('../pages/org-summary-page.js');
const orgData = require('../data/orgs.js');
const organizationSummaryWidget = require('../pages/components/organization-summary-widget.js');
const dailyAverageBarWidget = require('../pages/components/daily-metric-averages-widget');
const sitePerformanceWidget = require('../pages/components/site-performance-widget.js');
const exportPDFView = require('../pages/components/export-pdf-view.js');
const exportCSVPage = require('../pages/components/export-csv.js');
const sitePage = require('../pages/site-summary-page.js');
const userData = require('../data/users.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const fs = require('fs');
const moment = require('moment');

const translations = require('../../../src/l10n/languages/en_US.json');

describe('Smoke Tests', () => {

  describe('Organization Page', () => {
    beforeAll(() => {
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
    });

    // ST001
    it('Login as super user and select any org to verify organization page is loaded', () => {
      const title = orgPage.orgTitle();
      dateSelector.clickMonthButton();
      expect(title.getText()).toEqual(orgData.MSOrg.name);
      expect(organizationSummaryWidget.widgetTitle().getText()).toEqual('Organization summary');
      expect(organizationSummaryWidget.getKpiColumns()).toEqual(organizationSummaryWidget.columns);
    });

    // ST003
    it('verify all the widgets are displayed properly at org level', () => {
      const title = orgPage.orgTitle();
      const widgetTitle = dailyAverageBarWidget.widgetTitle();
      expect(title.getText()).toEqual(orgData.MSOrg.name);
      expect(widgetTitle.getText()).toEqual('Daily averages: Traffic');
      expect(sitePerformanceWidget.widgetTitle().getText()).toEqual('Sites performance');
    });

    describe('Export Pdf and Schedule reports at org level', () => {
      beforeAll(() => {
        nav.pickRetailOrg();
        nav.navToExportPDFView();
      });

      // ST004
      it('Verify that export pdf is displayed with correct header, widgets and data', () => {
        const pageTitle = exportPDFView.getExportPageTitle();
        const exportButton = exportPDFView.getExportButton();
        expect(pageTitle).toEqual(translations.pdfExportView.EXPORTPDF);
        expect(exportButton.getText()).toEqual(translations.pdfExportView.EXPORTPDF);
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
      });

      // ST005
      it('Verify schedule report at org level', () => {
        const scheduleReportButton = exportPDFView.getScheduleReportButton();
        const listHeader = exportPDFView.getScheduledReportsHeader();
        expect(scheduleReportButton.getText()).toEqual(translations.pdfExportView.SCHEDULEREPORT);
        exportPDFView.getScheduleReportButton().click();
        expect(listHeader.getText()).toEqual(translations.pdfExportView.SCHEDULEDPDFREPORTS);
      });
    });

    describe('Export CSV at org level', () => {
      beforeAll(() => {
        nav.navToExportCSV();
      });
      // ST006
      it('Click on export csv and verify that csv is generated', () => {
        exportCSVPage.setAreaPickerLocation('site', '10 North Face - Chicago');
        const metrics = exportCSVPage.getMetrics();
        metrics.then(array => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            return array[0].click();
          });
        });
        exportCSVPage.setExportGroupBy('Week');
        dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat).then(exportTabDate => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            exportCSVPage.exportCSV();
          });
          browser.waitForAngular();
          if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
            const fileName = `${browser.params.downloadPath}/report-site.csv`;
            let folderContents;

            browser.driver.wait(() => {
              // Wait until the file has been downloaded.
              // We need to wait thus as otherwise protractor has a nasty habit of
              // trying to do any following tests while the file is still being
              // downloaded and hasn't been moved to its final location.
              folderContents = fs.readdirSync(browser.params.downloadPath);
              let returnValue = false;
              folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
                if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                  returnValue = true;
                }
              });
              return returnValue;
            }, 30000).then(() => {
              console.log(fs.readFileSync(fileName, { encoding: 'utf8' }));
              let ranVar = 'organization_name,site_name,period_start_date,period_end_date,traffic\n' +
                `"${orgData.MSRetailOrg.name}","${orgData.MSRetailSiteExportCSV.testSiteName}",` +
                `"${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}",` +
                `"${orgData.MSRetailSiteExportCSV.weekTrafficId}"`;
              console.log(ranVar);
              expect(fs.readFileSync(fileName, { encoding: 'utf8' })).toMatch( // checks file content to make sure headers and org/site/zone/date info are correct
                'organization_name,site_name,period_start_date,period_end_date,traffic\n' +
                `"${orgData.MSRetailOrg.name}","${orgData.MSRetailSiteExportCSV.testSiteName}",` +
                `"${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}",` +
                `"${orgData.MSRetailSiteExportCSV.weekTrafficId}"\n`
              );
            });
          }
        });
      });
    });
    afterAll(() => {
      nav.logout();
    });
  });
  describe('Site Level', () => {
    beforeAll(() => {
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
      nav.navToMSOrgSite();
    });

    // ST007
    it('Select any other org and then select site .Ensure that page is loaded properly', () => {
      const tabHeading = sitePage.siteTitle();
      const datePicker = dateSelector.getDatePicker();
      dateSelector.clickMonthButton();
      expect(datePicker.isPresent()).toBe(true);
      expect(tabHeading.getText()).toEqual('SITE TRAFFIC');
    });

    // ST008
    it('Verify that user is able to export pdf at site level', () => {
      nav.navToExportPDFView();
      const siteName = exportPDFView.getExportSiteName();
      expect(exportPDFView.isExportButtonEnabled()).toBe(true);
      expect(siteName).toMatch(orgData.MSOrg.name);
      expect(siteName).toMatch(orgData.MSOrgSite.name);
    });

    // ST009
    it('Verify that user is able to schedule report  at site level', () => {
      nav.navToExportPDFView();
      const scheduleReportButton = exportPDFView.getScheduleReportButton();
      expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
      expect(scheduleReportButton.getText()).toEqual(translations.pdfExportView.SCHEDULEREPORT);
    });

    // ST010
    it('Verify user is able to export csv at site level', () => {
      nav.pickRetailOrg();
      nav.navToRetailOrgSite();
      dateSelector.clickWeekButton();
      nav.navToExportCSV();
      exportCSVPage.setAreaPickerLocation('zone', 'Total Property');
      const metrics = exportCSVPage.getMetrics();
      metrics.then(array => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          return array[0].click();
        });
      });
      exportCSVPage.setExportGroupBy('Week');
      dateSelector.getExportCSVReportingPeriod(userData.superUser.dateFormat).then(exportTabDate => {
        browser.executeScript('window.scrollTo(0,0);').then(() => {
          exportCSVPage.exportCSV();
        });
        browser.waitForAngular();
        if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
          const fileName = `${browser.params.downloadPath}/report-site.csv`;
          let folderContents;

          browser.driver.wait(() => {
            // Wait until the file has been downloaded.
            // We need to wait thus as otherwise protractor has a nasty habit of
            // trying to do any following tests while the file is still being
            // downloaded and hasn't been moved to its final location.
            folderContents = fs.readdirSync(browser.params.downloadPath);
            let returnValue = false;
            folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
              if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                returnValue = true;
              }
            });
            return returnValue;
          }, 30000).then(() => {
            expect(fs.readFileSync(fileName, { encoding: 'utf8' })).toMatch( // checks file content to make sure headers and org/site/zone/date info are correct
              'organization_name,site_name,period_start_date,period_end_date,traffic\n' +
              `"${orgData.MSRetailOrg.name}","${orgData.MSRetailSiteExportCSV.testSiteName}",` +
              `"${moment(exportTabDate[0]).format(userData.superUser.dateFormat)}","${moment(exportTabDate[1]).format(userData.superUser.dateFormat)}",` +
              `"${orgData.MSRetailSiteExportCSV.weekTrafficId}"\n`
            );
          });
        }
      });
    });
    afterAll(() => {
      nav.logout();
    });
  });
});
