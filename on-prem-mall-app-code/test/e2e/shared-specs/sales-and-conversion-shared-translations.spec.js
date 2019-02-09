const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const singleKpiTableWidgetSpec = require('./components/single-kpi-table-widget-shared.spec.js');
const tenantSalesWidget = require('../pages/components/tenant-sales-summary-widget.js');
const tenantConversionSumWidget = require('../pages/components/tenant-conversion-summary-widget.js');
const tenantATSSumWidget = require('../pages/components/tenant-ats-summary-widget.js');
const tenantUPTSumWidget = require('../pages/components/tenant-upt-summary-widget.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const zoneSalesWidget = require('../pages/components/zone-sales-widget.js');
const zoneConversionWidget = require('../pages/components/zone-conversion-widget.js');
const averagePurchaseWidget = require('../pages/components/average-purchase-widget.js');
const zoneUPTWidget = require('../pages/components/zone-units-per-transaction-widget.js');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  salesAndConversionSharedLangTests(locale) {
    describe('Sales and Conversion tab (shared translation tests)', () => {
      const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
      const translations = require(translationsFilePath);

      it('should navigate to the correct site', () => {
        const title = nav.getSiteName();

        expect(title).toEqual(orgData.MSOrgSite.name);
      });

      describe('"Property overall"-level tests', () => {
        describe('Page title and tab sidebar checks', () => {
          it('"Site Sales and Conversion" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.SITE.toUpperCase()} ${translations.views.SALES.toUpperCase()}`);
          });

          it('"page title should show the correct location" area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName.getText()).toEqual(orgData.MSOrgSite.name);
          });

          it('"select zone" picker title', () => {
            const pickerTitle = sitePage.getZonePickerTitleText();

            expect(pickerTitle).toEqual(translations.analyticsHeader.SELECTZONE.toUpperCase());
          });

          it('default value in zone-picker search bar', () => {
            const pickerTitle = sitePage.getZonePickerSearchText();

            expect(pickerTitle).toMatch(translations.locationSelector.SEARCH);
          });
        });
        singleKpiTableWidgetSpec.translationsTests(translations, tenantSalesWidget, 'Tenant sales summary', singleKpiTableWidgetSpec.KPI_SALES);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantConversionSumWidget, 'Tenant conversion summary', singleKpiTableWidgetSpec.KPI_CONVERSION);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantATSSumWidget, 'Tenant ATS summary', singleKpiTableWidgetSpec.KPI_ATS);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantUPTSumWidget, 'Tenant UPT summary', singleKpiTableWidgetSpec.KPI_UPT);
      });

      describe('Zone-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToZone();
          });
        });

        describe('Page title and tab sidebar checks', () => {
          it('"Sales and Conversion" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.ZONE.toUpperCase()} ${translations.views.SALES.toUpperCase()}`);
          });

          it('test zone name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName).toMatch(orgData.MSOrgSite.testZone);
          });
        });
        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneSalesWidget, 'Sales');
        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneConversionWidget, 'Conversion');
        singleMetricLineChartWidgetSpec.translationsTests(translations, averagePurchaseWidget, 'ATS');
        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneUPTWidget, 'UPT');
      });
    });
  }
};
