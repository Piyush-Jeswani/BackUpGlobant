const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const visitorTrafficWidgetSpec = require('./components/vb-traffic-shared.spec.js');
const visitingFrequencyWidgetSpec = require('./components/pie-chart-with-summary-shared.spec');
const gshWidget = require('../pages/components/gross-shopping-hours-widget.js');
const dwellTimeWidget = require('../pages/components/dwell-time-widget.js');
const opportunityWidget = require('../pages/components/opportunity-widget.js');
const drawRateWidget = require('../pages/components/draw-rate-widget.js');
const shoppersVsOthersWidgetSpec = require('./components/vb-shoppers-vs-others-shared.spec');
const abandonmentRateWidget = require('../pages/components/abandonment-rate-widget.js');

module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  visitorBehaviorSharedLangTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
    const translations = require(translationsFilePath);

    describe('Visitor behavior tab (shared translation tests)', () => {
      it('should navigate to the correct site', () => {
        const title = nav.getSingleSiteName();

        expect(title).toEqual(orgData.SSOrg.ssOrgSiteName);
      });

      describe('"Property overall"-level tests', () => {
        describe('Page title and tab sidebar checks', () => {
          it('"Site Visitor behavior" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.SITE.toUpperCase()} ${translations.views.VISITORBEHAVIOR.toUpperCase()}`);
          });

          it('"page title should show the correct location" area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName).toEqual(orgData.SSOrg.ssOrgSiteName);
          });

          it('"select area" picker title', () => {
            const pickerTitle = sitePage.getZonePickerTitleText();

            expect(pickerTitle).toEqual(translations.analyticsHeader.SELECTAREA.toUpperCase());
          });

          it('default value in area-picker search bar', () => {
            const pickerTitle = sitePage.getAreaPickerSearchText();

            expect(pickerTitle).toEqual(translations.locationSelector.SEARCH);
          });
        });
        visitorTrafficWidgetSpec.translationsTests(translations);
        visitingFrequencyWidgetSpec.translationsTests(translations);
        singleMetricLineChartWidgetSpec.translationsTests(translations, gshWidget, 'Gross shopping hours');
        singleMetricLineChartWidgetSpec.translationsTests(translations, dwellTimeWidget, 'Dwell time');
        singleMetricLineChartWidgetSpec.translationsTests(translations, opportunityWidget, 'Opportunity');
        singleMetricLineChartWidgetSpec.translationsTests(translations, drawRateWidget, 'Draw rate');
        shoppersVsOthersWidgetSpec.translationsTests(translations);
      });

      describe('Area-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToTestArea();
          });
        });

        describe('Page title and tab sidebar checks', () => {
          it('"Visitor behavior" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.AREA.toUpperCase()} ${translations.views.VISITORBEHAVIOR.toUpperCase()}`);
          });

          it('test area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName).toMatch(orgData.SSOrg.testArea);
          });

          visitorTrafficWidgetSpec.translationsTests(translations);
          singleMetricLineChartWidgetSpec.translationsTests(translations, gshWidget, 'Gross shopping hours');
          singleMetricLineChartWidgetSpec.translationsTests(translations, dwellTimeWidget, 'Dwell time');
          singleMetricLineChartWidgetSpec.translationsTests(translations, opportunityWidget, 'Opportunity');
          singleMetricLineChartWidgetSpec.translationsTests(translations, drawRateWidget, 'Draw rate');
          singleMetricLineChartWidgetSpec.translationsTests(translations, abandonmentRateWidget, 'Abandonment rate');
        });
      });
    });
  }
};
