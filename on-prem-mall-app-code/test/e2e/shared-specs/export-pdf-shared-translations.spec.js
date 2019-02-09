const moment = require('moment');
const orgData = require('../data/orgs.js');
const userData = require('../data/users.js');
const login = require('../pages/login.js');
const nav = require('../pages/components/nav-header.js');
const sitePage = require('../pages/site-summary-page.js');
const tabNav = require('../pages/components/tab-nav.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const exportPDFView = require('../pages/components/export-pdf-view.js');
const fs = require('fs');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  exportPDFSharedLangTests(locale) {
    describe('Export PDF tab (shared translation tests)', () => {
      const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
      const translations = require(translationsFilePath);

      describe('export cart text', () => {
        beforeAll(() => {
          nav.navToExportPDFView();
        });

        it('should show correct org/site name on export page', () => {
          const siteName = exportPDFView.getExportSiteName();
          expect(siteName).toMatch(orgData.MSOrg.name);
          expect(siteName).toMatch(orgData.MSOrgSite.name);
        });

        it('Export PDF page title', () => {
          const pageTitle = exportPDFView.getExportPageTitle();
          expect(pageTitle).toEqual(translations.pdfExportView.EXPORTPDF);
        });

        it('notice message', () => {
          const notice = exportPDFView.getNoticeMessage();
          expect(notice).toEqual(`${translations.pdfExportView.NOTICE} ${translations.pdfExportView.INFOTEXT}`);
        });

        it('export PDF button', () => {
          const exportButton = exportPDFView.getExportButton();
          expect(exportButton.getText()).toEqual(translations.pdfExportView.EXPORTPDF);
        });

        it('schedule report button', () => {
          const scheduleReportButton = exportPDFView.getScheduleReportButton();
          expect(scheduleReportButton.getText()).toEqual(translations.pdfExportView.SCHEDULEREPORT);
        });

        it('clear export link', () => {
          const clearExportLink = exportPDFView.getClearButton();
          expect(clearExportLink.getText()).toEqual(translations.pdfExportView.CLEAREXPORT);
        });
      });

      describe('"edit schedule" dialogue text', () => {
        it('(may fail until SA-4207 is resolved)"edit schedule" dialogue visible text', () => {
          exportPDFView.getScheduleReportButton().click();

          const editScheduleText = exportPDFView.getEditScheduleSection().getText();
          const translationArray = [
            translations.pdfExportView.EDITSCHEDULE,
            translations.scheduleReport.FROM,
            translations.scheduleReport.TO,
            translations.scheduleReport.RECIPIENT,
            translations.scheduleReport.ADDRECIPIENT,
            translations.scheduleReport.REPORTNAME,
            translations.scheduleReport.FREQUENCY,
            translations.common.WEEKLY,
            translations.scheduleReport.MESSAGE,
            translations.csvExportView.SAVESCHEDULE,
            translations.scheduleReport.CANCEL
          ];
          translationArray.forEach(translation => {
            expect(editScheduleText).toMatch(translation);
          });
        });

        it('input field placeholders', () => {
          const inputPlaceholders = exportPDFView.getEditScheduleInputPlaceholders();
          const messagePlaceholder = exportPDFView.getEditScheduleMsgPlaceholder();

          expect(inputPlaceholders).toEqual([
            'noreply@shoppertrak.com',
            'jzimmerman@shoppertrak.com',
            translations.scheduleReport.ADDONEEMAIL,
            '',
            ''
          ]);
          expect(messagePlaceholder).toEqual('');
        });

        it('frequency dropdown options', () => {
          const frequencyOptions = exportPDFView.getScheduledFrequencyOptions();
          expect(frequencyOptions.getText()).toEqual([
            translations.common.DAILY,
            translations.common.WEEKLY,
            translations.common.MONTHLY,
            translations.common.YEARLY
          ]);

          exportPDFView.openScheduledFrequencyMenu();
        });

        it('secondary frequency options - weekly', () => {
          const frequencyWeeklyHeader = exportPDFView.getFrequencyOptionsWeeklyLabel();
          const frequencyWeeklySettings = exportPDFView.getFrequencyOptionSettings();

          expect(frequencyWeeklyHeader.getText()).toEqual(translations.pdfExportView.DAYOFWEEK);
          expect(frequencyWeeklySettings.getText()).toEqual([
            translations.weekdaysLong.sun,
            translations.weekdaysLong.mon,
            translations.weekdaysLong.tue,
            translations.weekdaysLong.wed,
            translations.weekdaysLong.thu,
            translations.weekdaysLong.fri,
            translations.weekdaysLong.sat
          ]);
        });

        it('secondary frequency options - monthly', () => {
          const frequencyMonthlyHeader = exportPDFView.getFrequencyOptionsMonthlyLabel();
          const frequencyMonthlySettings = exportPDFView.getFrequencyOptionSettings();

          expect(frequencyMonthlyHeader.getText()).toEqual(translations.pdfExportView.DAYOFMONTH);
          expect(frequencyMonthlySettings.getText()).toEqual([
            translations.common.FIRST,
            translations.common['15TH']
          ]);
        });

        it('secondary frequency options - yearly', () => {
          const frequencyYearlyHeader = exportPDFView.getFrequencyOptionsYearlyLabel();
          const frequencyYearlySettings = exportPDFView.getFrequencyOptionSettings();

          expect(frequencyYearlyHeader.getText()).toEqual(translations.pdfExportView.MONTH);
          expect(frequencyYearlySettings.getText()).toEqual([
            translations.monthsLong.january,
            translations.monthsLong.february,
            translations.monthsLong.march,
            translations.monthsLong.april,
            translations.monthsLong.may,
            translations.monthsLong.june,
            translations.monthsLong.july,
            translations.monthsLong.august,
            translations.monthsLong.september,
            translations.monthsLong.october,
            translations.monthsLong.november,
            translations.monthsLong.december
          ]);
        });

        it('"save schedule" and "cancel" buttons', () => {
          const saveButton = exportPDFView.scheduledReportFields.saveButton.getText();
          const cancelButton = exportPDFView.scheduledReportFields.cancelButton.getText();

          expect(saveButton.getText()).toEqual(translations.csvExportView.SAVESCHEDULE);
          expect(cancelButton.getText()).toEqual(translations.scheduleReport.CANCEL);
        });

        it('"scheduled reports" list header', () => {
          const listHeader = exportPDFView.getScheduledReportsHeader();
          expect(listHeader.getText()).toEqual(translations.pdfExportView.SCHEDULEDPDFREPORTS);
        });

        it('"scheduled reports" list message, when list is empty', () => {
          // uncertain starting state - list may contain scheduled reports or may be empty

          const initialScheduledReports = exportPDFView.getScheduledPDFs();

          initialScheduledReports.then(list => {
            // check that scheduled report list is empty, otherwise element in expectation will not be present
            if (list.length !== 0) {
              list.forEach(() => {
                exportPDFView.removeScheduledPDF();
              });
            }
          });

          const emptyListMsg = exportPDFView.getScheduledReportsEmptyListMsg();
          expect(emptyListMsg.getText()).toEqual(translations.pdfExportView.NOSAVEDREPORTS);
        });
      });

      describe('translations of widgets queued for export', () => {
        it('from traffic tab, site-level', () => {
          const metrics = exportPDFView.getMetrics();
          // metrics from: org Arabian Centres Mall, site Mall of Dhahran, traffic tab
          expect(metrics).toEqual([
            translations.kpis.shortKpiTitles.tenant_traffic,
            translations.pdfExportView.METRICS.entrance_contribution,
            translations.pdfExportView.METRICS.entrance_contribution_pie,
            `${translations.pdfExportView.METRICS.power_hours} - ${translations.kpis.options.average_traffic}`,
            `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`,
            translations.pdfExportView.METRICS.tenant_traffic_table_widget,
            translations.pdfExportView.METRICS.other_areas_traffic_table_widget
          ]);
          exportPDFView.clearMetrics();
        });

        it('from traffic tab, zone-level', () => {
          // nav to: org Arabian Centres Mall, site Mall of Dhahran, zone New Yorker, traffic tab
          browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/${orgData.MSOrgSite.testZoneId}/traffic?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

          nav.navToExportPDFView();
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual([
            translations.pdfExportView.METRICS.kpi_summary_widget_container,
            translations.kpis.shortKpiTitles.tenant_traffic,
            translations.pdfExportView.METRICS.entrance_contribution,
            translations.pdfExportView.METRICS.entrance_contribution_pie,
            `${translations.pdfExportView.METRICS.power_hours} - ${translations.kpis.options.average_traffic}`,
            translations.pdfExportView.METRICS.daily_performance_widget,
            `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`
          ]);
          exportPDFView.clearMetrics();
        });

        it('from sales and conversion tab, site-level', () => {
          // nav to: org Arabian Centres Mall, site Mall of Dhahran, sales and conversion tab
          browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/sales-and-conversion?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

          nav.navToExportPDFView();
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual([
            translations.pdfExportView.METRICS.tenant_sales_table_widget,
            translations.pdfExportView.METRICS.tenant_conversion_table_widget,
            translations.pdfExportView.METRICS.tenant_ats_table_widget,
            translations.pdfExportView.METRICS.tenant_upt_table_widget
          ]);
          exportPDFView.clearMetrics();
        });

        it('from sales and conversion tab, zone-level', () => {
          // nav to: org Arabian Centres Mall, site Mall of Dhahran, zone New Yorker, sales and conversion tab
          browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/${orgData.MSOrgSite.testZoneId}/sales-and-conversion?dateRangeStart=` +
            `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
            `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
            `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

          nav.navToExportPDFView();
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual([
            translations.pdfExportView.METRICS.sales_widget,
            translations.pdfExportView.METRICS.conversion_widget,
            translations.pdfExportView.METRICS.ats_sales_widget,
            translations.pdfExportView.METRICS.upt_sales_widget
          ]);
          exportPDFView.clearMetrics();
        });

        it('from org summary page', () => {
          // nav to: org Arabian Centres Mall
          browser.get(`#/${orgData.MSOrg.id}/summary?dateRangeStart=${dateSelector.getURLDate('week', true)}&dateRangeEnd=` +
            `${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=` +
            `${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=` +
            `${dateSelector.getURLDate('week', false, 2)}`);

          nav.navToExportPDFView();
          const metrics = exportPDFView.getMetrics();
          expect(metrics).toEqual([
            translations.pdfExportView.METRICS.organization_summary,
            translations.pdfExportView.METRICS.site_performance,
            `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`
          ]);
          exportPDFView.clearMetrics();
        });
      });

      describe('Single-site org', () => {
        beforeAll(() => {
          // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, traffic tab
          browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
            `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
            `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
            `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
          nav.navToExportPDFView();
        });

        it('should show correct org/site name', () => {
          const siteName = exportPDFView.getExportSiteName();
          expect(siteName).toMatch(orgData.SSOrg.name);
          expect(siteName).toMatch(orgData.SSOrg.ssOrgSiteName);
          expect(nav.getSingleSiteName()).toEqual(orgData.SSOrg.ssOrgSiteName);
        });

        describe('testing translations of widgets queued for export', () => {
          it('from traffic tab, site-level', () => {
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.traffic,
              translations.pdfExportView.METRICS.entrance_contribution,
              translations.pdfExportView.METRICS.entrance_contribution_pie,
              `${translations.pdfExportView.METRICS.power_hours} - ${translations.kpis.options.average_traffic}`,
              `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`
            ]);
            exportPDFView.clearMetrics();
          });

          it('from visitor behavior tab, site-level', () => {
            // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, sales and conversion tab
            browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
              `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
              `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
              `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.VISITORBEHAVIOR + ' ' + translations.kpis.shortKpiTitles.tenant_traffic.toLowerCase(),
              translations.pdfExportView.METRICS.loyalty,
              translations.kpis.kpiTitle.gsh,
              translations.kpis.shortKpiTitles.tenant_dwell_time,
              translations.kpis.kpiTitle.opportunity,
              translations.kpis.kpiTitle.draw_rate,
              translations.kpis.kpiTitle.shoppers_vs_others
            ]);
            exportPDFView.clearMetrics();
          });

          it('from visitor behavior tab, area-level', () => {
            // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, area B1-128 Ri Ra Irish Pub, sales and conversion tab
            browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/${orgData.SSOrg.testAreaId}/visitor-behavior?dateRangeStart=` +
              `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
              `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
              `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.VISITORBEHAVIOR + ' ' + translations.kpis.shortKpiTitles.tenant_traffic.toLowerCase(),
              translations.pdfExportView.METRICS.loyalty,
              translations.kpis.kpiTitle.gsh,
              translations.kpis.shortKpiTitles.tenant_dwell_time,
              translations.kpis.kpiTitle.opportunity,
              translations.kpis.kpiTitle.draw_rate,
              translations.pdfExportView.METRICS.detail_abandonment_rate
            ]);
            exportPDFView.clearMetrics();
          });

          it('from usage of areas tab, site-level', () => {
            // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, usage of areas tab
            browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/usage-of-areas?dateRangeStart=` +
              `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
              `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
              `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.traffic_percentage_location,
              translations.pdfExportView.METRICS.first_visits,
              translations.pdfExportView.METRICS.one_and_done
            ]);
            exportPDFView.clearMetrics();
          });

          it('from usage of areas tab, area-level', () => {
            // nav to: org Mandalay bay, site The Shoppes at Mandalay Place, area B1-128 Ri Ra Irish Pub, usage of areas tab
            browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/${orgData.SSOrg.testAreaId}/usage-of-areas?dateRangeStart=` +
              `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
              `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
              `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);

            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.traffic_percentage_correlation,
              translations.pdfExportView.METRICS.locations_after,
              translations.pdfExportView.METRICS.locations_before
            ]);
            exportPDFView.clearMetrics();
          });
        });
      });

      describe('Retail org', () => {
        beforeAll(() => {
          // nav to: org North Face, retail org summary page
          browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}&dateRangeEnd=` +
            `${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=` +
            `${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=` +
            `${dateSelector.getURLDate('week', false, 2)}`);
          nav.navToExportPDFView();
        });

        it('should show correct site name on export page', () => {
          const orgName = exportPDFView.getExportSiteName();
          expect(orgName).toEqual(orgData.MSRetailOrg.name);
        });

        describe('testing translations of widgets queued for export', () => {
          it('from organization summary page, org-level', () => {
            const metrics = exportPDFView.getMetrics();
            //Organization Summary should not come while exporting the current view
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.kpi_summary_widget,
              `${translations.pdfExportView.METRICS.power_hours} - ${translations.kpis.options.average_traffic}`,
              translations.pdfExportView.METRICS.daily_performance_widget,
              `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`,
              translations.pdfExportView.METRICS.retail_store_summary
            ]);
            exportPDFView.clearMetrics();
          });

          it('from traffic tab, site-level', () => {
            // nav to: org North Face, site North Face - Chicago, traffic tab
            browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=` +
              `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
              `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
              `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
            nav.navToExportPDFView();

            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.kpi_summary_widget_container,
              translations.kpis.shortKpiTitles.tenant_traffic,
              translations.pdfExportView.METRICS.entrance_contribution,
              translations.pdfExportView.METRICS.entrance_contribution_pie,
              `${translations.pdfExportView.METRICS.power_hours} - ${translations.kpis.options.average_traffic}`,
              translations.pdfExportView.METRICS.daily_performance_widget,
              `${translations.pdfExportView.METRICS.traffic_per_weekday} - ${translations.kpis.shortKpiTitles.tenant_traffic}`
            ]);
            exportPDFView.clearMetrics();
          });

          it('from sales and conversion tab, site-level', () => {
            // nav to: org North Face, site North Face - Chicago, sales and conversion tab
            browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/sales-and-conversion?dateRangeStart=` +
              `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
              `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
              `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`);
            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.sales_widget,
              translations.pdfExportView.METRICS.conversion_widget,
              translations.pdfExportView.METRICS.ats_sales_widget,
              translations.pdfExportView.METRICS.upt_sales_widget
            ]);
            exportPDFView.clearMetrics();
          });

          it('from sales and conversion tab, site-level', () => {
            // nav to: org North Face, site North Face - Chicago, labor tab
            browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/labor?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
              `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=` +
              `${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}&compareRange2End=` +
              `${dateSelector.getURLDate('week', false, 2)}`);
            nav.navToExportPDFView();
            const metrics = exportPDFView.getMetrics();
            expect(metrics).toEqual([
              translations.pdfExportView.METRICS.labor_hours_widget,
              translations.pdfExportView.METRICS.star_labor_widget
            ]);
            exportPDFView.clearMetrics();
          });
        });
      });
    });
  }
};
