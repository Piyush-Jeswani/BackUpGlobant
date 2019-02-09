const sitePage = require('../pages/site-summary-page.js');
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
// shared tests for localization translations, using custom compare periods

  salesAndConversionSharedLangCustomPdTests(locale) {
    describe('Sales and Conversion tab (shared translation tests, custom periods)', () => {
      const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
      const translations = require(translationsFilePath);

      describe('"Property overall"-level tests', () => {
        singleKpiTableWidgetSpec.translationsTests(translations, tenantSalesWidget, 'Tenant sales summary', singleKpiTableWidgetSpec.KPI_SALES, true);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantConversionSumWidget, 'Tenant conversion summary', singleKpiTableWidgetSpec.KPI_CONVERSION, true);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantATSSumWidget, 'Tenant ATS summary', singleKpiTableWidgetSpec.KPI_ATS, true);
        singleKpiTableWidgetSpec.translationsTests(translations, tenantUPTSumWidget, 'Tenant UPT summary', singleKpiTableWidgetSpec.KPI_UPT, true);
      });

      describe('Zone-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToZone();
          });
        });

        it('test zone name', () => {
          const areaName = sitePage.getAreaName();

          expect(areaName).toMatch(orgData.MSOrgSite.testZone);
        });

        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneSalesWidget, 'Sales', true);
        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneConversionWidget, 'Conversion', true);
        singleMetricLineChartWidgetSpec.translationsTests(translations, averagePurchaseWidget, 'ATS', true);
        singleMetricLineChartWidgetSpec.translationsTests(translations, zoneUPTWidget, 'UPT', true);
      });
    });
  }
};
