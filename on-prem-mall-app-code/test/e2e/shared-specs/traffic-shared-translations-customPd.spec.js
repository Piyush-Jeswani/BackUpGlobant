// shared tests for localization translations, using custom compare periods

const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const entranceSummaryWidget = require('../pages/components/entrance-summary-widget.js');
const tenantSummaryWidget = require('../pages/components/tenant-traffic-summary-widget.js');
const commonAreasSummaryWidget = require('../pages/components/common-areas-summary-widget.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec.js');
const multiMetricLineChartWidgetSpec = require('./components/multi-metric-line-chart-shared.spec.js');
const singleKpiTableWidgetSpec = require('./components/single-kpi-table-widget-shared.spec');

module.exports = {

  trafficSharedLangCustomPdTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`;
    const translations = require(translationsFilePath);

    describe('Traffic tab (shared translation tests, custom periods)', () => {
      it('should navigate to the correct site', () => {
        const title = nav.getSiteName();

        expect(title).toEqual(orgData.MSOrgSite.name);
      });

      multiMetricLineChartWidgetSpec.translationsTests(translations, true);
      singleKpiTableWidgetSpec.translationsTests(translations, entranceSummaryWidget, 'Entrance summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, true);
      // no add'l custom pd entrance contribution translation tests
      // no add'l custom pd power hours translation tests
      dailyAverageBarWidgetSpec.translationsTests(translations, [dailyAverageBarWidgetSpec.KPI_TRAFFIC], true);
      singleKpiTableWidgetSpec.translationsTests(translations, tenantSummaryWidget, 'Tenant summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, true);
      singleKpiTableWidgetSpec.translationsTests(translations, commonAreasSummaryWidget, 'Common areas summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, true);
    });
  }
};
