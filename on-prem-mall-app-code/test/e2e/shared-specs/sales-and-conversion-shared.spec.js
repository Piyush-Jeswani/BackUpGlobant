const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const lineChart = require('../pages/components/common/line-chart-widget.js');
const singleKpiTableWidgetSpec = require('./components/single-kpi-table-widget-shared.spec');
const tenantSalesWidget = require('../pages/components/tenant-sales-summary-widget.js');
const tenantConversionSumWidget = require('../pages/components/tenant-conversion-summary-widget.js');
const tenantATSSumWidget = require('../pages/components/tenant-ats-summary-widget.js');
const tenantUPTSumWidget = require('../pages/components/tenant-upt-summary-widget.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const zoneSalesWidget = require('../pages/components/zone-sales-widget.js');
const zoneConversionWidget = require('../pages/components/zone-conversion-widget.js');
const averagePurchaseWidget = require('../pages/components/average-purchase-widget.js');
const zoneUptWidget = require('../pages/components/zone-units-per-transaction-widget');

module.exports = {


  salesAndConversionSharedTests(timePeriod) {
    describe('Sales and Conversion tab (shared tests)', () => {
      const dataWindow = lineChart.getSumDataWindow(timePeriod); //  used for line chart widget sum checks

      describe('Mall org site', () => {
        it('should navigate to the correct site', () => {
          const title = nav.getSiteName();

          expect(title).toEqual(orgData.MSOrgSite.name);
        });

        it('should nav to "Site Sales and conversion" tab when clicked', () => {
          const tabHeading = sitePage.siteTitle();

          expect(tabHeading.getText()).toMatch('SITE SALES AND CONVERSION');
        });

        it('date picker should appear', () => {
          const datePicker = dateSelector.getDatePicker();

          expect(datePicker.isPresent()).toBe(true);
        });

        describe('"Property overall"-level tests', () => {
          it('should have selected the correct date button', () => {
            let dateButton;

            if (timePeriod === 'week') {
              dateButton = dateSelector.getWeekButton();
            } else if (timePeriod === 'month') {
              dateButton = dateSelector.getMonthButton();
            } else if (timePeriod === 'year') {
              dateButton = dateSelector.getYearButton();
            }
            dateButton.then(button => {
              expect(button.getAttribute('class')).toMatch('active');
            });
          });

          it('"page title should show the correct location" area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName.getText()).toEqual(orgData.MSOrgSite.name);
          });
          singleKpiTableWidgetSpec.functionalTests(tenantSalesWidget, 'Tenant sales summary', singleKpiTableWidgetSpec.KPI_SALES, singleKpiTableWidgetSpec.TENANT_FILTER);
          singleKpiTableWidgetSpec.functionalTests(tenantConversionSumWidget, 'Tenant conversion summary', singleKpiTableWidgetSpec.KPI_CONVERSION, singleKpiTableWidgetSpec.TENANT_FILTER);
          singleKpiTableWidgetSpec.functionalTests(tenantATSSumWidget, 'Tenant ATS summary', singleKpiTableWidgetSpec.KPI_ATS, singleKpiTableWidgetSpec.TENANT_FILTER);
          singleKpiTableWidgetSpec.functionalTests(tenantUPTSumWidget, 'Tenant UPT summary', singleKpiTableWidgetSpec.KPI_UPT, singleKpiTableWidgetSpec.TENANT_FILTER);
        });
      });

      describe('Retail org site', () => {
        beforeAll(() => {
          browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/sales-and-conversion?dateRangeStart=${dateSelector.getURLDate(timePeriod, true)}` +
            `&dateRangeEnd=${dateSelector.getURLDate(timePeriod, false)}&compareRange1Start=${dateSelector.getURLDate(timePeriod, true, 1)}` +
            `&compareRange1End=${dateSelector.getURLDate(timePeriod, false, 1)}&compareRange2Start=${dateSelector.getURLDate(timePeriod, true, 2)}` +
            `&compareRange2End=${dateSelector.getURLDate(timePeriod, false, 2)}`
          );
        });

        it('should navigate to the correct site', () => {
          const title = nav.getSiteName();

          expect(title).toEqual(orgData.MSRetailSite.testSiteName);
        });

        // retail org RT033
        it('should nav to "Site Sales and conversion" tab when clicked', () => {
          const tabHeading = sitePage.siteTitle();

          expect(tabHeading.getText()).toMatch('SITE SALES AND CONVERSION');
        });

        it('date picker should appear', () => {
          const datePicker = dateSelector.getDatePicker();

          expect(datePicker.isPresent()).toBe(true);
        });

        // retail org RT033
        it('should have selected the correct date button', () => {
          let dateButton;

          if (timePeriod === 'week') {
            dateButton = dateSelector.getWeekButton();
          } else if (timePeriod === 'month') {
            dateButton = dateSelector.getMonthButton();
          } else if (timePeriod === 'year') {
            dateButton = dateSelector.getYearButton();
          }
          dateButton.then(button => {
            expect(button.getAttribute('class')).toMatch('active');
          });
        });

        // retail org RT033
        // retail org RT034
        singleMetricLineChartWidgetSpec.functionalTests(zoneSalesWidget, 'Sales', timePeriod, dataWindow);
        singleMetricLineChartWidgetSpec.functionalTests(zoneConversionWidget, 'Conversion', timePeriod, dataWindow, true, true);
        singleMetricLineChartWidgetSpec.functionalTests(averagePurchaseWidget, 'ATS', timePeriod, dataWindow, true, false);
        singleMetricLineChartWidgetSpec.functionalTests(zoneUptWidget, 'UPT', timePeriod, dataWindow, true, false);
      });
    });
  },
};
