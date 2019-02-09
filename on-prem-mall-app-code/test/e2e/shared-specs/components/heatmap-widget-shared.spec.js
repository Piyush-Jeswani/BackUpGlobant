const sitePage = require('../../pages/site-summary-page.js');
const orgData = require('../../data/orgs.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests(pageObject, expectedTitle, isSingleArea) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {

      it(`should display the title "${expectedTitle}"`, () => {
        const widgetTitle = pageObject.widgetTitle();

        expect(widgetTitle.getText()).toEqual(expectedTitle);
      });

      it('should show a heatmap chart', () => {
        const heatmap = pageObject.getHeatmap();

        expect(heatmap.isPresent()).toBe(true);
      });

      it('should show all areas in widget list when "all" filter is active', () => {
        sitePage.clickAreaTypeFilter(sitePage.areaTypeFilterButtons[3]);
        const areaList = pageObject.getAreaList();

        expect(areaList).not.toEqual([]);

        areaList.then(areaListArray => {
          areaListArray.forEach(area => {
            expect(orgData.SSOrg.getAllAreas()).toContain(area);
          });
        });
      });

      it('should show all stores in widget list when "stores" filter is active', () => {
        sitePage.clickAreaTypeFilter(sitePage.areaTypeFilterButtons[0]);
        const areaList = pageObject.getAreaList();

        expect(areaList).not.toEqual([]);

        areaList.then(areaListArray => {
          areaListArray.forEach(area => {
            expect(orgData.SSOrg.stores).toContain(area);
          });
        });
      });

      if (!isSingleArea) {
        it('should show all corridors in widget list when "corridors" filter is active', () => {
          sitePage.clickAreaTypeFilter(sitePage.areaTypeFilterButtons[1]);
          const areaList = pageObject.getAreaList();

          expect(areaList).not.toEqual([]);

          areaList.then(areaListArray => {
            areaListArray.forEach(area => {
              expect(orgData.SSOrg.corridors).toContain(area);
            });
          });
        });

        it('should show all entrances in widget list when "entrances" filter is active', () => {
          sitePage.clickAreaTypeFilter(sitePage.areaTypeFilterButtons[2]);
          const areaList = pageObject.getAreaList();

          expect(areaList).not.toEqual([]);

          areaList.then(areaListArray => {
            areaListArray.forEach(area => {
              expect(orgData.SSOrg.entrances).toContain(area);
            });
          });
        });
      }
    });
  },
  translationsTests(translations, pageObject, expectedTitle, isSingleArea) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {
      it('widget title', () => {
        expect(pageObject.widgetTitle().getText()).toEqual(this.getWidgetTitleTranslationKey(translations, expectedTitle));
      });

      it('text in heatmap legend', () => {
        const textArray = pageObject.getLegendTextArray();

        if (isSingleArea) {
          expect(textArray).toEqual([translations.heatmapWidget.VISITORS, translations.heatmapWidget.LOW, translations.heatmapWidget.HIGH, translations.heatmapWidget.SELECTEDAREA]);
        } else {
          expect(textArray).toEqual([translations.heatmapWidget.VISITORS, translations.heatmapWidget.LOW, translations.heatmapWidget.HIGH]);
        }
      });

      it('percentage breakdown frame title', () => {
        expect(pageObject.getPercentageFrameTitle()).toEqual(this.getWidgetPercentTranslationKey(translations, expectedTitle));
        if (isSingleArea) {
          expect(pageObject.getPercentageFrameHeaderText()).toEqual(translations.heatmapWidget.CUSTOMERSWHOVISITED);
        }
      });
    });
  },
  getWidgetTitleTranslationKey(translations, widgetExpectedTitle) {
    switch (widgetExpectedTitle) {
      case 'Traffic distribution':
        return translations.kpis.kpiTitle.traffic_percentage;
      case 'First locations to visit':
        return translations.kpis.kpiTitle.first_visits;
      case 'One and done':
        return translations.kpis.kpiTitle.one_and_done;
      case 'Correlation heat map':
        return translations.kpis.kpiTitle.traffic_correlation;
      case 'Locations visited after':
        return translations.kpis.kpiTitle.locations_after;
      case 'Locations visited before':
        return translations.kpis.kpiTitle.locations_before;
      default:
        throw new Error(`Invalid widget: ${widgetExpectedTitle}`);
    }
  },
  getWidgetPercentTranslationKey(translations, widgetExpectedTitle) {
    switch (widgetExpectedTitle) {
      case 'Traffic distribution':
        return translations.kpis.totalLabel.traffic_percentage;
      case 'First locations to visit':
        return translations.kpis.totalLabel.first_visits;
      case 'One and done':
        return translations.kpis.totalLabel.one_and_done;
      case 'Correlation heat map':
        return translations.kpis.totalLabel.traffic_correlation;
      case 'Locations visited after':
        return translations.kpis.totalLabel.locations_after;
      case 'Locations visited before':
        return translations.kpis.totalLabel.locations_before;
      default:
        throw new Error(`Invalid widget: ${widgetExpectedTitle}`);
    }
  }
};
