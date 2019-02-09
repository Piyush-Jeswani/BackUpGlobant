// shared tests for localization translations, using prior period/prior year date ranges

const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const organizationSummaryWidgetSpec = require('./components/multi-kpi-mall-table-widget-shared.spec');
const sitePerformanceWidgetSpec = require('./components/site-performance-bar-chart-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec.js');

module.exports = {

  mallOrgSummarySharedLangTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`;
    const translations = require(translationsFilePath);

    describe('Mall org summary page (shared translation tests)', () => {
      it('should navigate to the correct org', () => {
        const title = nav.getOrgName();

        expect(title).toEqual(orgData.MSOrg.name);
      });

      it('page title', () => {
        const tabHeading = sitePage.siteTitle();

        expect(tabHeading.getText()).toEqual(translations.views.ORGANIZATIONSUMMARY.toUpperCase());
      });

      organizationSummaryWidgetSpec.translationsTests(translations);
      sitePerformanceWidgetSpec.translationsTests(translations);
      dailyAverageBarWidgetSpec.translationsTests(translations, [dailyAverageBarWidgetSpec.KPI_TRAFFIC]);
    });
  }
};
