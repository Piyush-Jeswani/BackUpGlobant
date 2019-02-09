const sitePerformanceWidget = require('../../pages/components/site-performance-widget.js');
const orgData = require('../../data/orgs.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Site performance widget', () => {
      describe('when listing sites by highest percent traffic', () => {
        it('should display the title "Sites performance"', () => {
          expect(sitePerformanceWidget.widgetTitle().getText()).toEqual('Sites performance');
        });

        it('widget chart should display correct range on y-axis', () => {
          const highestYAxisValue = sitePerformanceWidget.getHighestYAxisValue();
          const selectedPeriodDataValues = sitePerformanceWidget.getSelectedPeriodDataValues();
          const priorPeriodDataValues = sitePerformanceWidget.getPriorPeriodDataValues();
          const priorYearDataValues = sitePerformanceWidget.getPriorYearDataValues();

          expect(highestYAxisValue).not.toBeNaN();
          expect(highestYAxisValue).toEqual(jasmine.any(Number));

          selectedPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorYearDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });
        });

        it('should display sites from the org along the x-axis', () => {
          const chartSites = sitePerformanceWidget.getXAxisSites();
          const uppercaseOrgList = [];

          orgData.MSOrg.sites.forEach(site => {
            uppercaseOrgList.push(site.toUpperCase());
          });

          return chartSites.then(siteArray => {
            siteArray.forEach(site => {
              expect(uppercaseOrgList).toContain(site);
            });
          });
        });
      });

      describe('when listing sites by highest percent traffic increase', () => {
        beforeAll(() => {
          sitePerformanceWidget.setChartDataOption('increase');
        });

        it('should display the title "Sites performance"', () => {
          expect(sitePerformanceWidget.widgetTitle().getText()).toEqual('Sites performance');
        });

        it('widget chart should display correct range on y-axis', () => {
          const highestYAxisValue = sitePerformanceWidget.getHighestYAxisValue();
          const selectedPeriodDataValues = sitePerformanceWidget.getSelectedPeriodDataValues();
          const priorPeriodDataValues = sitePerformanceWidget.getPriorPeriodDataValues();
          const priorYearDataValues = sitePerformanceWidget.getPriorYearDataValues();

          expect(highestYAxisValue).not.toBeNaN();
          expect(highestYAxisValue).toEqual(jasmine.any(Number));

          selectedPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorYearDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });
        });

        it('should display sites from the org along the x-axis', () => {
          const chartSites = sitePerformanceWidget.getXAxisSites();
          const uppercaseOrgList = [];

          orgData.MSOrg.sites.forEach(site => {
            uppercaseOrgList.push(site.toUpperCase());
          });

          return chartSites.then(siteArray => {
            siteArray.forEach(site => {
              expect(uppercaseOrgList).toContain(site);
            });
          });
        });
      });

      describe('when listing sites by highest percent traffic loss', () => {
        beforeAll(() => {
          sitePerformanceWidget.setChartDataOption('loss');
        });

        it('should display the title "Sites performance"', () => {
          expect(sitePerformanceWidget.widgetTitle().getText()).toEqual('Sites performance');
        });

        it('widget chart should display correct range on y-axis', () => {
          const highestYAxisValue = sitePerformanceWidget.getHighestYAxisValue();
          const selectedPeriodDataValues = sitePerformanceWidget.getSelectedPeriodDataValues();
          const priorPeriodDataValues = sitePerformanceWidget.getPriorPeriodDataValues();
          const priorYearDataValues = sitePerformanceWidget.getPriorYearDataValues();

          expect(highestYAxisValue).not.toBeNaN();
          expect(highestYAxisValue).toEqual(jasmine.any(Number));

          selectedPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorPeriodDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });

          priorYearDataValues.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });
        });

        it('should display sites from the org along the x-axis', () => {
          const chartSites = sitePerformanceWidget.getXAxisSites();
          const uppercaseOrgList = [];

          orgData.MSOrg.sites.forEach(site => {
            uppercaseOrgList.push(site.toUpperCase());
          });

          return chartSites.then(siteArray => {
            siteArray.forEach(site => {
              expect(uppercaseOrgList).toContain(site);
            });
          });
        });
      });
    });
  },
  translationsTests(translations) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('sites performance bar chart widget', () => {
      it('widget title', () => {
        expect(sitePerformanceWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.sites_performance);
      });

      it('chart data dropdown options', () => {
        expect(sitePerformanceWidget.getChartTypeDropdownOptions()).toEqual(
          [translations.kpis.kpiTitle.traffic_contribution,
            translations.kpis.kpiTitle.traffic_increase,
            translations.kpis.kpiTitle.traffic_loss
          ]
        );
      });

      it('chart legend labels', () => {
        expect(sitePerformanceWidget.getLegendTextLowerCase()).toEqual(
          [translations.common.SELECTEDPERIOD.toLowerCase(),
            translations.common.PRIORPERIOD.toLowerCase(),
            translations.common.PRIORYEAR.toLowerCase()
          ]
        );
      });

      it('(tooltip text', () => {
        expect(sitePerformanceWidget.getTooltipTotalText()).toEqual(
          [translations.common.SELECTEDPERIOD,
            translations.common.PRIORPERIOD,
            translations.common.PRIORYEAR
          ]
        );
      });
    });
  }
};
