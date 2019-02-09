const entranceContributionWidget = require('../../pages/components/entrance-contribution-widget');
const orgData = require('../../data/orgs.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Entrance contribution widget:', () => {
      it('should display the title "Entrance contribution"', () => {
        const widgetTitle = entranceContributionWidget.widgetTitle();

        expect(widgetTitle.getText()).toEqual('Entrance contribution');
      });

      it('should show all entrances in site in list panel', () => {
        orgData.MSOrgSite.entrances.forEach(entrance => {
          expect(entranceContributionWidget.entranceListItem(entrance).getText()).toMatch(entrance);
          // RegEx matches number followed by % to confirm data is present
          expect(entranceContributionWidget.entranceListItem(entrance).getText()).toMatch(entranceContributionWidget.entranceRegEx(entrance));
        });
      });

      it('entrance percentages in list panel should sum to 100', () => {
        expect(entranceContributionWidget.getListPercentSum()).toEqual(100);
      });
    });
  },
  translationsTests(translations) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Entrance contribution widget', () => {
      it('widget title', () => {
        expect(entranceContributionWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.entrance_contribution_pie);
      });
    });
  }
};
