const organizationSummaryWidget = require('../../pages/components/organization-summary-widget.js');
const orgData = require('../../data/orgs.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Org summary widget', () => {
      beforeAll(() => {
        organizationSummaryWidget.clickExpandButtonIfPresent();
      });

      it('should display the title "Organization summary"', () => {
        expect(organizationSummaryWidget.widgetTitle().getText()).toEqual('Organization summary');
      });

      it('should show all 6 data columns', () => {
        expect(organizationSummaryWidget.getKpiColumns()).toEqual(organizationSummaryWidget.columns);
      });

      // mall org RT207
      it('should change the site list when filtered', () => {
        const filter = organizationSummaryWidget.getFilter();

        filter.clear();
        expect(organizationSummaryWidget.getFilteredOrgList()).toContain('Mall of Arabia');

        filter.sendKeys('amusing text string');
        expect(organizationSummaryWidget.getFilteredOrgList()).toEqual([]);

        filter.clear();
        filter.sendKeys('Arabia');
        expect(organizationSummaryWidget.getFilteredOrgList()).not.toContain('Mall of Dhahran');
        expect(organizationSummaryWidget.getFilteredOrgList()).toContain('Mall of Arabia');
        filter.clear();
      });

      it('should sort sites by name, asc & desc', () => {
        const defaultOrgOrder = organizationSummaryWidget.getFilteredOrgList();

        const sortedOrgList = organizationSummaryWidget.clickSiteHeaderAndGetOrgList();
        const reverseSortedOrgList = organizationSummaryWidget.clickSiteHeaderAndGetOrgList();
        const clickedSortAgain = organizationSummaryWidget.clickSiteHeaderAndGetOrgList();

        const sortPromises = [defaultOrgOrder, sortedOrgList, reverseSortedOrgList, clickedSortAgain];


        defaultOrgOrder.then(orgList => {
          orgList.forEach(site => {
            expect(orgData.MSOrg.sites).toContain(site);
          });
        });

        sortedOrgList.then(orgList => {
          orgList.forEach(site => {
            expect(orgData.MSOrg.sites).toContain(site);
          });
        });

        reverseSortedOrgList.then(orgList => {
          orgList.forEach(site => {
            expect(orgData.MSOrg.sites).toContain(site);
          });
        });

        Promise.all(sortPromises).then(data => {
          const widgetSitesDefault = data[0];
          const widgetSitesSort1 = data[1];
          const widgetSitesSort2 = data[2];
          const widgetSitesSort3 = data[3];

          expect(widgetSitesDefault).to.not.equal(widgetSitesSort1);
          expect(widgetSitesDefault).to.not.equal(widgetSitesSort2);
          expect(widgetSitesDefault).to.not.equal(widgetSitesSort3);

          expect(widgetSitesSort1).to.equal(widgetSitesSort3);
          expect(widgetSitesSort1).to.not.equal(widgetSitesSort2);

          expect(widgetSitesSort1.reverse()).to.equal(widgetSitesSort2);
          expect(widgetSitesSort2.reverse()).to.equal(widgetSitesSort1);
        });
      });

      it('should have data in each column', () => {
        organizationSummaryWidget.getFilteredOrgList().then(array => {
          expect(array.length).toBeGreaterThan(0);
        });
        organizationSummaryWidget.getTrafficDeltaColumn().then(array => {
          expect(array.length).toBeGreaterThan(0);
        });
        organizationSummaryWidget.getCurrentOverallColumn().then(array => {
          expect(array.length).toBeGreaterThan(0);
        });
        organizationSummaryWidget.getPreviousOverallColumn().then(array => {
          expect(array.length).toBeGreaterThan(0);
        });
      });

      it('should display the correct percentage deltas in each row', () => {
        const trafficDeltas = organizationSummaryWidget.getTrafficDeltaColumn();
        const calculatedTrafficDeltas = organizationSummaryWidget.calculateTrafficDeltaColumn();
        // do not check GSH and visiting freq - no data for org Arabian Centres Mall
        protractor.promise.all([calculatedTrafficDeltas, trafficDeltas]).then(promiseArray => {
          const calculatedArray = promiseArray[0];
          const pageDataArray = promiseArray[1];
          calculatedArray.forEach((delta, index) => {
            expect(delta).not.toBeNaN();
            expect(delta).toEqual(jasmine.any(Number));
            expect(pageDataArray[index]).not.toBeNaN();
            expect(pageDataArray[index]).toEqual(jasmine.any(Number));
            // this does not work in year view because the calculated array is based on the values on the page which are rounded
            // and the actual array, pageDataArray, are the deltas, which are based on raw values
            //this is the root problem.
            // expect(delta).not.toBeLessThan(pageDataArray[index] - 50.0);
            // expect(delta).not.toBeGreaterThan(pageDataArray[index] += 50.0);
          });
        });
      });
    });
  },
  translationsTests(translations) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Org summary widget', () => {
      it('widget title', () => {
        expect(organizationSummaryWidget.widgetTitle().getText()).toEqual(translations.organizationSummaryWidget.HEADER);
      });

      it('prior period/year selector', () => {
        expect(organizationSummaryWidget.getDatePeriodButton().getText()).toEqual(
          [translations.common.PRIORPERIOD,
            translations.common.PRIORYEAR
          ]
        );
      });

      it('search bar placeholder', () => {
        expect(organizationSummaryWidget.getFilterDefaultValue()).toEqual(translations.organizationSummaryWidget.HEADER);
      });

      it('metric column headers', () => {
        expect(organizationSummaryWidget.getKpiColumns()).toEqual(
          [
            translations.common.SITE.toUpperCase(),
            translations.kpis.deltaLabel.traffic.toUpperCase(),
            translations.kpis.kpiTitle.traffic.toUpperCase(),
            translations.kpis.deltaLabel.gsh.toUpperCase(),
            translations.kpis.kpiTitle.gsh.toUpperCase(),
            translations.kpis.deltaLabel.loyalty.toUpperCase(),
            translations.kpis.kpiTitle.loyalty.toUpperCase()
          ]
        );
      });

      it('"no data" message', () => {
        // todo: add statement after refactor of org summary table
      });
    });
  }
};
