'use strict';

describe('Export current view (PDF) function:', () => {
  let moment = require('moment');
  let orgData = require('../../data/orgs.js');
  let userData = require('../../data/users.js');
  let login = require('../../pages/login.js');
  let nav = require('../../pages/components/nav-header.js');
  let sitePage = require('../../pages/site-summary-page.js');
  let tabNav = require('../../pages/components/tab-nav.js');
  let dateSelector = require('../../pages/components/time-period-picker.js');
  let exportPDFView = require('../../pages/components/export-pdf-view.js');
  let fs = require('fs');

  let userId;
  let token;

  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToTrafficTab();
      done();
    } else {
      login.getUserWithToken(tokenAndId => {
        ({ token, userId } = tokenAndId);
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`);
        done();
      }, userData.superUser);
    }
  });

  describe('Multi-site org', () => {
    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        let exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);
        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show correct org/site name on export page', () => {
      let siteName = exportPDFView.getExportSiteName();
      expect(siteName).toMatch(orgData.MSOrg.name);
      expect(siteName).toMatch(orgData.MSOrgSite.name);
    });

    describe('should show the correct metrics', () => {
      it('from the traffic tab, site-level', () => {
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSOrgSite.metrics.pdfView.trafficTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the traffic tab, from a specific zone', () => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/${orgData.MSOrgSite.testZoneId}/traffic?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        browser.sleep(3000);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSOrgSite.metrics.pdfView.zoneLevelTrafficTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the sales/conversion tab, site-level', () => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/sales-and-conversion?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSOrgSite.metrics.pdfView.salesConversionTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the sales/conversion tab, from a specific zone', () => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/${orgData.MSOrgSite.testZoneId}/sales-and-conversion?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSOrgSite.metrics.pdfView.zoneLevelSalesConversionTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the org summary page', () => {
        browser.get(`#/${orgData.MSOrg.id}/summary?dateRangeStart=${dateSelector.getURLDate('week', true)}&dateRangeEnd=${
          dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${
          dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${
          dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSOrg.metrics.pdfView.orgLevelView);
        // do not clear metrics - setting up export test
      });
    });

    // test works in firefox but not in chrome - known drag and drop bug
    // todo: see LFR-38
    // it('should drag and drop metrics correctly', function() {
    //  var firstMetric = exportPDFView.getMetrics().first();
    //
    //  browser.actions().dragAndDrop(firstMetric, {x:0, y:100}).perform().then(function() {
    //    var metrics = exportPDFView.getMetrics();
    //    expect(firstMetric.isDisplayed()).toBe(true);
    //    expect(metrics.getText()).not.toEqual(orgData.MSOrg.metrics.pdfView.trafficTab);
    //  });
    // });


    it('should schedule a report correctly', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let initialScheduledReports = exportPDFView.getScheduledPDFs();

      initialScheduledReports.then(list => {
        expect(list.length).toBe(0);     // check that scheduled report list is initially empty, otherwise expectations below will fail
        if (list.length > 0) {
          list.forEach(() => {
            exportPDFView.removeScheduledPDF();
          });
        }
      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Daily', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Weekly', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Monthly', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Yearly', orgData.MSOrgSite.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let scheduledReportList = exportPDFView.getScheduledPDFs();
      scheduledReportList.then(list => {
        expect(list[0].element(by.className('interval-value')).getText()).toMatch('Day');
        expect(list[1].element(by.className('interval-value')).getText()).toMatch('Week');
        expect(list[2].element(by.className('interval-value')).getText()).toMatch('Month');
        expect(list[3].element(by.className('interval-value')).getText()).toMatch('Year');

        list.forEach(() => {
          exportPDFView.removeScheduledPDF();
        });
      });
    });

    it('should export a PDF', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.exportPDF();
      });

      browser.waitForAngular();
      if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
        let fileName = new RegExp(`${moment().utc().format('YYYY-MM-DD')}_` + '\\d\\d-\\d\\d-\\d\\d_shoppertrak.pdf');
        // expect(fs.existsSync(fileName)).toBe(true);
        let folderContents;

        browser.driver.wait(() => {
          // Wait until the file has been downloaded.
          // We need to wait thus as otherwise protractor has a nasty habit of
          // trying to do any following tests while the file is still being
          // downloaded and hasn't been moved to its final location.
          folderContents =  fs.readdirSync(browser.params.downloadPath);
          let returnValue = false;
          folderContents.forEach(file => { // checks to make sure a PDF has been downloaded before proceeding
            if (file.indexOf('.pdf') > -1) {
              returnValue = true;
            }
          });
          return returnValue;
        }, 30000).then(() => {
          folderContents.forEach(file => {
            if (file.indexOf('.pdf') > -1) {
              expect(file).toMatch(fileName); // checks to make sure date is correct in PDF filename
            }
          });
        });
      }
      // if running remotely, no access to download folder - need a check to ensure a download occurred successfully
      browser.driver.wait(protractor.ExpectedConditions.presenceOf(exportPDFView.getEmptyCartMsg()), 30000);
      expect(exportPDFView.getExportError().isPresent()).toBe(false);
    });

    afterAll(() => {
      exportPDFView.clearMetrics();
      if (browser.params.localBrowser) {
        let folderContents = fs.readdirSync(browser.params.downloadPath);
        folderContents.forEach(file => {
          if (file.indexOf('.pdf') > -1) { // loop over download folder contents; delete any PDFs
            fs.unlinkSync(`${browser.params.downloadPath}/${file}`);
            console.log(`deleting ${browser.params.downloadPath}/${file}`);
          }
        });
      }
    });
  });

  describe('Single-site org', () => {
    beforeAll(() => {
      browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('week', true)}&dateRangeEnd=${
        dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${
        dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${
        dateSelector.getURLDate('week', false, 2)}&token=${token}`
      );
    });

    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);

        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show correct org/site name', () => {
      let siteName = exportPDFView.getExportSiteName();
      expect(siteName).toMatch(orgData.SSOrg.name);
      expect(siteName).toMatch(orgData.SSOrg.ssOrgSiteName);
      expect(nav.getSingleSiteName()).toEqual(orgData.SSOrg.ssOrgSiteName);
    });

    describe('should show the correct metrics', () => {
      it('should show the correct metrics from traffic tab', () => {
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.SSOrg.metrics.pdfView.trafficTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('should show the correct metrics from visitor behavior tab', () => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.SSOrg.metrics.pdfView.visitorBehaviorTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('should show the correct metrics from visitor behavior tab, from a specific area', () => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        sitePage.navToTestArea();
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.SSOrg.metrics.pdfView.areaLevelVisitorBehaviorTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('should show the correct metrics from usage of areas tab', () => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/usage-of-areas?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.SSOrg.metrics.pdfView.usageOfAreasTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('should show the correct metrics from usage of areas tab, from a specific area', () => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/usage-of-areas?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        sitePage.navToTestArea();
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.SSOrg.metrics.pdfView.areaLevelUsageOfAreasTab);
        // do not clear metrics - setting up export test
      });
    });

    // test works in firefox but not in chrome - known drag and drop bug
    // todo: see lfr-38
    // it('should drag and drop metrics correctly', function() {
    //  var firstMetric = exportPDFView.getMetrics().first();
    //
    //  browser.actions().dragAndDrop(firstMetric, {x:0, y:100}).perform().then(function() {
    //    var metrics = exportPDFView.getMetrics();
    //    expect(firstMetric.isDisplayed()).toBe(true);
    //    expect(metrics.getText()).not.toEqual(orgData.MSOrg.metrics.pdfView.trafficTab);
    //  });
    // });

    it('should schedule a report correctly', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let initialScheduledReports = exportPDFView.getScheduledPDFs();

      initialScheduledReports.then(list => {
        expect(list.length).toBe(0); // check that scheduled report list is initially empty, otherwise expectations below will fail
        if (list.length > 0) {
          list.forEach(() => {
            exportPDFView.removeScheduledPDF();
          });
        }
      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Daily', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Weekly', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Monthly', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Yearly', orgData.SSOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let scheduledReportList = exportPDFView.getScheduledPDFs();
      scheduledReportList.then(list => {
        expect(list[0].element(by.className('interval-value')).getText()).toMatch('Day');
        expect(list[1].element(by.className('interval-value')).getText()).toMatch('Week');
        expect(list[2].element(by.className('interval-value')).getText()).toMatch('Month');
        expect(list[3].element(by.className('interval-value')).getText()).toMatch('Year');

        list.forEach(() => {
          exportPDFView.removeScheduledPDF();
        });
      });
    });

    it('should export a PDF', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.exportPDF();
      });

      browser.waitForAngular();
      if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
        let fileName = new RegExp(`${moment().utc().format('YYYY-MM-DD')}_` + '\\d\\d-\\d\\d-\\d\\d_shoppertrak.pdf');
        let folderContents;

        browser.driver.wait(() => {
          // Wait until the file has been downloaded.
          // We need to wait thus as otherwise protractor has a nasty habit of
          // trying to do any following tests while the file is still being
          // downloaded and hasn't been moved to its final location.
          folderContents =  fs.readdirSync(browser.params.downloadPath);
          let returnValue = false;
          folderContents.forEach(file => { // checks to make sure a PDF has been downloaded before proceeding
            if (file.indexOf('.pdf') > -1) {
              returnValue = true;
            }
          });
          return returnValue;
        }, 30000).then(() => {
          folderContents.forEach(file => {
            if (file.indexOf('.pdf') > -1) {
              expect(file).toMatch(fileName); // checks to make sure date is correct in PDF filename
            }
          });
        });
      }
      // if running remotely, no access to download folder - need a check to ensure a download occurred successfully
      browser.driver.wait(protractor.ExpectedConditions.presenceOf(exportPDFView.getEmptyCartMsg()), 30000);
      expect(exportPDFView.getExportError().isPresent()).toBe(false);
    });

    afterAll(() => {
      exportPDFView.clearMetrics();
      if (browser.params.localBrowser) {
        let folderContents = fs.readdirSync(browser.params.downloadPath);
        folderContents.forEach(file => {
          if (file.indexOf('.pdf') > -1) {
            fs.unlinkSync(`${browser.params.downloadPath}/${file}`);
            console.log(`deleting ${browser.params.downloadPath}/${file}`);
          }
        });
      }
    });
  });

  describe('Retail org', () => {
    beforeAll(() => {
      browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=${
        dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
        dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
        dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`
      );
    });

    it('date range on metric tab should match range on export page', () => {
      dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);
        expect(exportTabDate).toEqual(metricTabDate);
      });
    });

    it('should show correct org/site name on export page', () => {
      let siteName = exportPDFView.getExportSiteName();
      expect(siteName).toMatch(orgData.MSRetailOrg.name);
      expect(siteName).toMatch(orgData.MSRetailSite.testSiteName);
    });

    describe('should show the correct metrics', () => {
      it('from the traffic tab, site-level', () => {
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelTrafficTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the sales/conversion tab, site-level', () => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/sales-and-conversion?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelSalesConversionTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the labor tab, site-level', () => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/labor?dateRangeStart=${
          dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${
          dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${
          dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelLaborTab);
        exportPDFView.clearMetrics();
        expect(exportPDFView.isExportButtonEnabled()).toBe(false);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
      });

      it('from the org summary page', () => {
        browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}&dateRangeEnd=${
          dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${
          dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${
          dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        nav.navToExportPDFView();
        expect(exportPDFView.isExportButtonEnabled()).toBe(true);
        expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
        let metrics = exportPDFView.getMetrics();
        expect(metrics.getText()).toEqual(orgData.MSRetailOrg.metrics.pdfView.orgLevelView);
        // do not clear metrics - setting up export test
      });
    });

    it('should schedule a report correctly', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let initialScheduledReports = exportPDFView.getScheduledPDFs();

      initialScheduledReports.then(list => {
        expect(list.length).toBe(0);     // check that scheduled report list is initially empty, otherwise expectations below will fail
        if (list.length > 0) {
          list.forEach(() => {
            exportPDFView.removeScheduledPDF();
          });
        }
      });

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Daily', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Weekly', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Monthly', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });
      exportPDFView.scheduleTestPDFView('Yearly', orgData.MSRetailOrg.name);

      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.getScheduleReportButton().click();
      });

      let scheduledReportList = exportPDFView.getScheduledPDFs();
      scheduledReportList.then(list => {
        expect(list[0].element(by.className('interval-value')).getText()).toMatch('Day');
        expect(list[1].element(by.className('interval-value')).getText()).toMatch('Week');
        expect(list[2].element(by.className('interval-value')).getText()).toMatch('Month');
        expect(list[3].element(by.className('interval-value')).getText()).toMatch('Year');

        list.forEach(() => {
          exportPDFView.removeScheduledPDF();
        });
      });
    });

    it('should export a PDF', () => {
      browser.executeScript('window.scrollTo(0,0);').then(() => {
        exportPDFView.exportPDF();
      });

      browser.waitForAngular();
      if (browser.params.localBrowser) { // different checks if testing locally vs testing remotely
        let fileName = new RegExp(`${moment().utc().format('YYYY-MM-DD')}_` + '\\d\\d-\\d\\d-\\d\\d_shoppertrak.pdf');
        let folderContents;

        browser.driver.wait(() => {
          // Wait until the file has been downloaded.
          // We need to wait thus as otherwise protractor has a nasty habit of
          // trying to do any following tests while the file is still being
          // downloaded and hasn't been moved to its final location.
          folderContents =  fs.readdirSync(browser.params.downloadPath);
          let returnValue = false;
          folderContents.forEach(file => { // checks to make sure a PDF has been downloaded before proceeding
            if (file.indexOf('.pdf') > -1) {
              returnValue = true;
            }
          });
          return returnValue;
        }, 30000).then(() => {
          folderContents.forEach(file => {
            if (file.indexOf('.pdf') > -1) {
              expect(file).toMatch(fileName); // checks to make sure date is correct in PDF filename
            }
          });
        });
      }
      // if running remotely, no access to download folder - need a check to ensure a download occurred successfully
      browser.driver.wait(protractor.ExpectedConditions.presenceOf(exportPDFView.getEmptyCartMsg()), 30000);
      expect(exportPDFView.getExportError().isPresent()).toBe(false);
    });

    afterAll(done => {
      exportPDFView.clearMetrics();
      if (browser.params.localBrowser) {
        let folderContents = fs.readdirSync(browser.params.downloadPath);
        folderContents.forEach(file => {
          if (file.indexOf('.pdf') > -1) {
            fs.unlinkSync(`${browser.params.downloadPath}/${file}`);
            console.log(`deleting ${browser.params.downloadPath}/${file}`);
          }
        });
      }
      nav.logout();
      login.deleteUser(done, userId);
    });
  });
});
