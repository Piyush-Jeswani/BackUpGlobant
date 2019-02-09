const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const filterPicker = require('../pages/components/filter-picker.js');
const fiveKpiWidgetSpec = require('./components/five-kpi-shared.spec');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyPerformanceWidgetSpec = require('./components/daily-performance-shared.spec');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec.js');
const retailStoreChartWidgetSpec = require('./components/retail-org-table-shared.spec');
const login = require('../pages/login.js');
const users = require('../data/users');
const apiCall = require('../pages/api-calls.js');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  retailOrgSummarySharedLangTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
    const translations = require(translationsFilePath);

    describe('Retail org summary page (shared translation tests)', () => {

      it('should navigate to the correct org', () => {
        const title = nav.getOrgName();

        expect(title).toEqual(orgData.MSRetailOrg.name);
      });

      it('page title', () => {
        const tabHeading = sitePage.siteTitle();

        expect(tabHeading.getText()).toEqual(translations.views.RETAILORGANIZATIONSUMMARY.toUpperCase());
      });

      it('comp/all stores selector text', () => {
        const selectorText = sitePage.getCompStoresSelectorText();

        expect(selectorText).toMatch(translations.retailOrganizationSummary.COMPAREMODE.toUpperCase());
        expect(selectorText).toMatch(translations.retailOrganizationSummary.COMPSTORES);
        expect(selectorText).toMatch(translations.retailOrganizationSummary.ALLSTORES);
      });

      describe('filter picker', () => {
        it('filter picker body text', () => {
          filterPicker.getFilterMenuText().then((textArray) => {
            console.log(textArray);
            expect(textArray[0]).toEqual(translations.common.FILTERS);
            expect(textArray[1]).toMatch(translations.common.FILTERSAPPLIED.toUpperCase());
            expect(textArray[2]).toMatch(translations.common.SHOWING.toUpperCase());
            expect(textArray[5]).toMatch(translations.common.SITES.toUpperCase());
          });
        });

        it('filter picker button text', () => {
          filterPicker.openFilterMenu();

          const applyBtn = filterPicker.getFilterMenuApplyBtn();
          const cancelBtn = filterPicker.getFilterMenuClearBtn();

          expect(applyBtn.getText()).toEqual(translations.common.APPLY);
          expect(cancelBtn.getText()).toEqual(translations.common.CLEAR);
        });

        // retail org RT006 confirms that a filter can be applied
        it('"selected filter" label', () => {
          filterPicker.applyFilter();
          const selectedFilterLabel = filterPicker.getSelectedFiltersLabelText();

          expect(selectedFilterLabel).toEqual(translations.retailOrganizationSummary.SELECTEDFILTERS.toUpperCase());

          filterPicker.getFilterMenuClearBtn().click();
        });
      });

      fiveKpiWidgetSpec.translationsTests(translations);

      powerHoursWidgetSpec.translationsTests(translations, [
        powerHoursWidgetSpec.KPI_TRAFFIC,
        powerHoursWidgetSpec.KPI_AVGTRAFFICPERSITE,
        powerHoursWidgetSpec.KPI_TRAFFICPCT,
        powerHoursWidgetSpec.KPI_SALES,
        powerHoursWidgetSpec.KPI_AVGSALESPERSITE,
        powerHoursWidgetSpec.KPI_CONVERSION,
        powerHoursWidgetSpec.KPI_ATS,
        powerHoursWidgetSpec.KPI_STAR]);

      dailyPerformanceWidgetSpec.translationsTests(translations);

      dailyAverageBarWidgetSpec.translationsTests(translations, [
        dailyAverageBarWidgetSpec.KPI_TRAFFIC,
        dailyAverageBarWidgetSpec.KPI_SALES,
        dailyAverageBarWidgetSpec.KPI_CONVERSION,
        dailyAverageBarWidgetSpec.KPI_ATS,
        dailyAverageBarWidgetSpec.KPI_STAR]);

      retailStoreChartWidgetSpec.translationsTests(translations);

      it('API Test : Delete the new Tag', (done) => {
        login.getToken(async (token) => {
          let doIt =  await apiCall.deleteTag(token,users.testLanguageUsers.es_MX.tag1Value,users.testLanguageUsers.es_MX.orgId);
        });
        done();
      });

    });
  }
};
