const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const entranceSummaryWidget = require('../pages/components/entrance-summary-widget.js');
const tenantSummaryWidget = require('../pages/components/tenant-traffic-summary-widget.js');
const entranceContributionWidgetSpec = require('./components/pie-chart-with-legend-shared.spec');
const commonAreasSummaryWidget = require('../pages/components/common-areas-summary-widget.js');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec');
const multiMetricLineChartWidgetSpec = require('./components/multi-metric-line-chart-shared.spec.js');
const singleKpiTableWidgetSpec = require('./components/single-kpi-table-widget-shared.spec');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  trafficSharedLangTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
    const translations = require(translationsFilePath);

    describe('Traffic tab (shared translation tests)', () => {
      it('should navigate to the correct site', () => {
        const title = nav.getSiteName();

        expect(title).toEqual(orgData.MSOrgSite.name);
      });

      describe('Page title and tab sidebar checks', () => {
        it('"Site Traffic" tab title', () => {
          const tabHeading = sitePage.siteTitle();

          expect(tabHeading.getText()).toEqual(`${translations.common.SITE.toUpperCase()} ${translations.views.TRAFFIC.toUpperCase()}`);
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

        it('"operating hours" switch title', () => {
          const hoursText = sitePage.getHoursSwitchTitleText();

          expect(hoursText).toEqual(translations.analyticsHeader.OPERATINGHOURS.toUpperCase());
        });
      });

      multiMetricLineChartWidgetSpec.translationsTests(translations);
      singleKpiTableWidgetSpec.translationsTests(translations, entranceSummaryWidget, 'Entrance summary', singleKpiTableWidgetSpec.KPI_TRAFFIC);
      entranceContributionWidgetSpec.translationsTests(translations);
      powerHoursWidgetSpec.translationsTests(translations, [
        powerHoursWidgetSpec.KPI_TRAFFIC,
        powerHoursWidgetSpec.KPI_TRAFFICPCT,
        powerHoursWidgetSpec.KPI_SALES,
        powerHoursWidgetSpec.KPI_CONVERSION,
        powerHoursWidgetSpec.KPI_ATS
      ]);
      dailyAverageBarWidgetSpec.translationsTests(translations, [dailyAverageBarWidgetSpec.KPI_TRAFFIC]);
      singleKpiTableWidgetSpec.translationsTests(translations, tenantSummaryWidget, 'Tenant summary', singleKpiTableWidgetSpec.KPI_TRAFFIC);
      singleKpiTableWidgetSpec.translationsTests(translations, commonAreasSummaryWidget, 'Common areas summary', singleKpiTableWidgetSpec.KPI_TRAFFIC);
    });
  }
};
