const sitePage = require('../pages/site-summary-page.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const heatmapWidgetSpec = require('./components/heatmap-widget-shared.spec');
const trafficHeatmapWidget = require('../pages/components/traffic-heatmap-widget.js');
const firstVisitsHeatmapWidget = require('../pages/components/first-visits-heatmap-widget.js');
const oneAndDoneHeatmapWidget = require('../pages/components/one-done-heatmap-widget.js');
const correlationHeatmapWidget = require('../pages/components/correlation-heatmap-widget.js');
const visitsAfterHeatmapWidget = require('../pages/components/visits-after-heatmap-widget.js');
const visitsBeforeHeatmapWidget = require('../pages/components/visits-before-heatmap-widget.js');


module.exports = {
// shared tests for localization translations, using prior period/prior year date ranges

  usageOfAreasSharedLangTests(locale) {
    const translationsFilePath = `../../../src/l10n/languages/${locale}.json`; // sets up filepath for required translations file
    const translations = require(translationsFilePath);

    describe('Usage of Areas tab (shared translation tests)', () => {
      it('should navigate to the correct site', () => {
        const title = nav.getSingleSiteName();

        expect(title).toEqual(orgData.SSOrg.ssOrgSiteName);
      });

      describe('"Property overall"-level tests', () => {
        describe('Page title and tab sidebar checks', () => {
          it('"Site Usage of areas" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.SITE.toUpperCase()} ${translations.views.USAGEOFAREAS.toUpperCase()}`);
          });

          it('"page title should show the correct location" area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName.getText()).toEqual(orgData.SSOrg.ssOrgSiteName);
          });

          it('"select area" picker title', () => {
            const pickerTitle = sitePage.getZonePickerTitleText();

            expect(pickerTitle).toEqual(translations.analyticsHeader.SELECTAREA.toUpperCase());
          });

          it('default value in area-picker search bar', () => {
            const pickerTitle = sitePage.getAreaPickerSearchText();

            expect(pickerTitle).toEqual(translations.locationSelector.SEARCH);
          });

          it('area-type filter buttons', () => {
            const buttons = sitePage.areaTypeFilterButtons;

            expect(sitePage.getAreaTypeFilter(buttons[0]).getText()).toEqual(translations.usageOfAreasView.STORES.toUpperCase());
            expect(sitePage.getAreaTypeFilter(buttons[1]).getText()).toEqual(translations.usageOfAreasView.CORRIDORS.toUpperCase());
            expect(sitePage.getAreaTypeFilter(buttons[2]).getText()).toEqual(translations.usageOfAreasView.ENTRANCES.toUpperCase());
            expect(sitePage.getAreaTypeFilter(buttons[3]).getText()).toEqual(translations.usageOfAreasView.ALL.toUpperCase());
          });
        });
        heatmapWidgetSpec.translationsTests(translations, trafficHeatmapWidget, 'Traffic distribution');
        heatmapWidgetSpec.translationsTests(translations, firstVisitsHeatmapWidget, 'First locations to visit');
        heatmapWidgetSpec.translationsTests(translations, oneAndDoneHeatmapWidget, 'One and done');
      });

      describe('Area-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToTestArea();
          });
        });

        describe('Page title and tab sidebar checks', () => {
          it('"Usage of areas" tab title', () => {
            const tabHeading = sitePage.siteTitle();

            expect(tabHeading.getText()).toEqual(`${translations.common.AREA.toUpperCase()} ${translations.views.USAGEOFAREAS.toUpperCase()}`);
          });

          it('test area name', () => {
            const areaName = sitePage.getAreaName();

            expect(areaName).toMatch(orgData.SSOrg.testArea);
          });
        });
        heatmapWidgetSpec.translationsTests(translations, correlationHeatmapWidget, 'Correlation heat map', true);
        heatmapWidgetSpec.translationsTests(translations, visitsAfterHeatmapWidget, 'Locations visited after', true);
        heatmapWidgetSpec.translationsTests(translations, visitsBeforeHeatmapWidget, 'Locations visited before', true);
      });
    });
  }
};
