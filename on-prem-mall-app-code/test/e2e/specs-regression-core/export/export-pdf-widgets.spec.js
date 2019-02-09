
const orgData = require('../../data/orgs.js');
const userData = require('../../data/users.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const exportPDFView = require('../../pages/components/export-pdf-view.js');

describe('Export of individual widgets:', () => {
  beforeAll(done => {
    login.getToken(token => {
      browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=` +
        `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start='` +
        `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start='` +
        `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`);
      done();
    });
  });

  describe('Export individual widgets', () => {
    describe('Multi-site org', () => {
      beforeAll(() => {
        exportPDFView.clickWidgetExportButtons();
      });

      it('date range on metric tab should match range on export page', () => {
        dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
          nav.navToExportSelected();
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);

          expect(exportTabDate).toEqual(metricTabDate);
        });
      });

      it('should show correct org/site name on export page', () => {
        const siteName = exportPDFView.getExportSiteName();
        expect(siteName).toMatch(orgData.MSOrg.name);
        expect(siteName).toMatch(orgData.MSOrgSite.name);
      });

      describe('should show the correct metrics', () => {
        it('from traffic tab, site-level', () => {
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSOrgSite.metrics.pdfView.trafficTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from sales/conversion tab, site-level', () => {
          browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/sales-and-conversion?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSOrgSite.metrics.pdfView.salesConversionTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from sales/conversion tab, from a specific zone', () => {
          browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/${orgData.MSOrgSite.testZoneId}/sales-and-conversion?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSOrgSite.metrics.pdfView.zoneLevelSalesConversionTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from org summary page', () => {
          browser.get(`#/${orgData.MSOrg.id}/summary?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          expect(nav.isExportSelectedEnabled()).toBe(true);
          nav.navToExportSelected();
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();

          expect(metrics).toEqual(orgData.MSOrg.metrics.pdfView.orgLevelView);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });
      });
    });

    describe('Single-site org', () => {
      beforeAll(() => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/traffic?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
          `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
          `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        exportPDFView.clickWidgetExportButtons();
      });

      it('date range on metric tab should match range on export page', () => {
        dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
          expect(nav.isExportSelectedEnabled()).toBe(true);
          nav.navToExportSelected();
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);

          expect(exportTabDate).toEqual(metricTabDate);
        });
      });

      it('should show correct org/site name', () => {
        const siteName = exportPDFView.getExportSiteName();
        expect(siteName).toMatch(orgData.SSOrg.name);
        expect(siteName).toMatch(orgData.SSOrg.ssOrgSiteName);
        expect(nav.getSingleSiteName()).toEqual(orgData.SSOrg.ssOrgSiteName);
      });

      describe('should show the correct metrics', () => {
        it('from traffic tab, site-level', () => {
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.SSOrg.metrics.pdfView.trafficTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from visitor behavior tab, site-level', () => {
          browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}'&dateRangeEnd=' + ${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.SSOrg.metrics.pdfView.visitorBehaviorTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from visitor behavior tab, from a specific area', () => {
          browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/${orgData.SSOrg.testAreaId}/visitor-behavior?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.SSOrg.metrics.pdfView.areaLevelVisitorBehaviorTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from usage of areas tab, site-level', () => {
          browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/usage-of-areas?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.SSOrg.metrics.pdfView.usageOfAreasTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from usage of areas tab, from a specific area', () => {
          browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/${orgData.SSOrg.testAreaId}/usage-of-areas?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.SSOrg.metrics.pdfView.areaLevelUsageOfAreasTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });
      });
    });

    describe('Retail org', () => {
      beforeAll(() => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
          `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
          `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
        expect(nav.isExportSelectedEnabled()).toBe(false);
        exportPDFView.clickWidgetExportButtons();
      });

      it('date range on metric tab should match range on export page', () => {
        dateSelector.getReportingPeriod(userData.superUser.dateFormat).then(metricTabDate => {
          expect(nav.isExportSelectedEnabled()).toBe(true);
          nav.navToExportSelected();
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const exportTabDate = dateSelector.getExportPDFViewDateRange(userData.superUser.dateFormat);

          expect(exportTabDate).toEqual(metricTabDate);
        });
      });

      it('should show correct org/site name on export page', () => {
        const siteName = exportPDFView.getExportSiteName();
        expect(siteName).toMatch(orgData.MSRetailOrg.name);
        expect(siteName).toMatch(orgData.MSRetailSite.testSiteName);
      });

      describe('should show the correct metrics', () => {
        it('from traffic tab, site-level', () => {
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelTrafficTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from sales/conversion tab, site-level', () => {
          browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/sales-and-conversion?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelSalesConversionTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from labor tab, site-level', () => {
          browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/labor?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSRetailSite.metrics.pdfView.siteLevelLaborTab);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });

        it('from org summary page', () => {
          browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
            `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
            `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
            `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          expect(nav.isExportSelectedEnabled()).toBe(false);
          exportPDFView.clickWidgetExportButtons();
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            expect(nav.isExportSelectedEnabled()).toBe(true);
            nav.navToExportSelected();
          });
          expect(exportPDFView.isExportButtonEnabled()).toBe(true);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(true);
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual(orgData.MSRetailOrg.metrics.pdfView.orgLevelView);
          exportPDFView.clearMetrics();
          expect(exportPDFView.isExportButtonEnabled()).toBe(false);
          expect(exportPDFView.isScheduleButtonEnabled()).toBe(false);
        });
      });
    });

    afterAll(() => {
      exportPDFView.clearMetrics();
      nav.logout();
    });
  });
});
