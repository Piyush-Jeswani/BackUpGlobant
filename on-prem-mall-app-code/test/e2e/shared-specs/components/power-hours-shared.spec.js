const powerHoursWidget = require('../../pages/components/power-hours-widget.js');
const since = require('jasmine2-custom-message');

module.exports = {
  KPI_TRAFFIC: 'Average Traffic',
  KPI_AVGTRAFFICPERSITE: 'Average Traffic per site',
  KPI_TRAFFICPCT: 'Traffic %',
  KPI_SALES: 'Sales',
  KPI_AVGSALESPERSITE: 'Average Sales per site',
  KPI_ATS: 'ATS',
  KPI_CONVERSION: 'Conversion',
  KPI_STAR: 'Star',
  mondayFunctionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Power hours widget (Monday calendar):', () => {
      it('should display 7 Monday-based day columns', () => {
        expect(powerHoursWidget.getDayHeaders()).toEqual(powerHoursWidget.getExpectedMondayHeaders());
      });
    });
  },
  functionalTests(site, kpis, isOrgLevel = false) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Power hours widget:', () => {
      it('should display the title "Power hours"', () => {
        const widgetTitle = powerHoursWidget.widgetTitle();
        expect(widgetTitle.getText()).toEqual('Power hours');
      });

      // mall org RT232
      kpis.forEach(metric => {
        describe(`${metric} metric`, () => {
          beforeAll(() => {
            powerHoursWidget.selectMetricDropdown(metric, isOrgLevel);
          });

          it('should display 7 day columns and right-most/left-most columns', () => {
            expect(powerHoursWidget.getDayHeaders()).toEqual(powerHoursWidget.getExpectedDayHeaders());
            expect(powerHoursWidget.getTotalHeader().isPresent()).toBe(true);
          });

          it('(may fail until SA-4102 is fixed)should display 24 hour rows and 1 total row', () => {
            expect(powerHoursWidget.getRowHeaders()).toEqual(powerHoursWidget.getExpectedHours());
            expect(powerHoursWidget.getTotalRow().isPresent()).toBe(true);
          });
        });
      });

      if (kpis.includes(this.KPI_TRAFFICPCT)) {
        describe('widget tests using traffic percentage data', () => {
          beforeAll(() => {
            powerHoursWidget.selectMetricDropdown('Traffic%', isOrgLevel);
          });

          it('should display percentage data', () => {
            expect(powerHoursWidget.getTotalRow().getText()).toMatch(/%/);
          });

          // add support for this test
          // it('no cell should exceed 100%', () => {
          //
          // });

          it('"Daily total" row should sum to the total traffic cell', () => {
            const rowSum = powerHoursWidget.getTotalRowSum();
            const totalTraffic = powerHoursWidget.getWeeklyTotalTraffic();

            expect(rowSum).not.toBeNaN();
            expect(rowSum).toEqual((jasmine.any(Number)));
            expect(rowSum).not.toBeGreaterThan(totalTraffic + 5);
            expect(rowSum).not.toBeLessThan(totalTraffic - 5);
          });

          it('the total traffic cell should not exceed ~100%', () => {
            expect(powerHoursWidget.getWeeklyTotalTraffic()).not.toBeGreaterThan(101);
          });

          it('each row should sum to the total shown in the right-hand "Total" column', () => {
            function checkRow(powerHoursWidget, totalColumn, index) {
              powerHoursWidget.getHourRowSum(index).then(rowSum => {
                expect(totalColumn[index]).not.toBeNaN();
                expect(totalColumn[index]).toEqual((jasmine.any(Number)));
                expect(totalColumn[index]).not.toBeGreaterThan(rowSum + 1);
                expect(totalColumn[index]).not.toBeLessThan(rowSum - 1);
              });
            }

            powerHoursWidget.getTotalColumnArray().then(totalColumn => {
              let i = 0;
              do {
                checkRow(powerHoursWidget, totalColumn, i);
                i += 1;
              } while (i <= 23);
            });
          });

          it('"Total" column should sum to sum to the total traffic cell', () => {
            const weeklyTotalTraffic = powerHoursWidget.getWeeklyTotalTraffic();
            const columnSum = powerHoursWidget.getTotalColumnSum();

            expect(columnSum).not.toBeNaN();
            expect(columnSum).not.toBeGreaterThan(weeklyTotalTraffic + 5);
            expect(columnSum).not.toBeLessThan(weeklyTotalTraffic - 5);
          });
        });
      }

      [this.KPI_TRAFFIC, this.KPI_SALES].forEach(metric => {
        if (kpis.includes(metric)) {
          describe(`widget tests using ${metric} data.`, () => {
            beforeAll(() => {
              powerHoursWidget.selectMetricDropdown(metric, isOrgLevel);
            });

            it(`should display ${metric} data (Fails until SA-3901 is fixed)`, () => {
              expect(powerHoursWidget.getTotalRow().getText()).not.toMatch(/%/);
            });

            it('"Daily total" row should sum to the total shown in the right-hand "Total" column', () => {
              const rowSum = powerHoursWidget.getTotalRowSum();
              expect(rowSum).not.toBeNaN();
              expect(rowSum).toEqual((jasmine.any(Number)));
              const weeklyTotalTraffic = powerHoursWidget.getWeeklyTotalTraffic();


              expect(rowSum).not.toBeGreaterThan(weeklyTotalTraffic + 5);
              expect(rowSum).not.toBeLessThan(weeklyTotalTraffic - 5);
            });

            it('each row should sum to the total shown in the right-hand "Total" column', () => {
              function checkRow(powerHoursWidget, totalColumnRow, index) {
                powerHoursWidget.getHourRowSum(index).then(rowSum => {
                  expect(totalColumnRow).not.toBeNaN();
                  expect(totalColumnRow).toEqual(jasmine.any(Number));
                  expect(totalColumnRow).not.toBeGreaterThan(rowSum + 3);
                  expect(totalColumnRow).not.toBeLessThan(rowSum - 3);
                });
              }

              powerHoursWidget.getColumnData('total').then(totalColumn => {
              let i = 0;
                do {
                  const index = i;
                  checkRow(powerHoursWidget, totalColumn, i);
                  i += 1;
                } while (i <= 23);
              });
            });

            it('"Total" column should sum to correct value shown in "Daily total" row', () => {
              const weeklyTotalTraffic = powerHoursWidget.getWeeklyTotalTraffic();
              const columnSum = powerHoursWidget.getTotalColumnSum();

              expect(columnSum).not.toBeNaN();
              expect(columnSum).not.toBeGreaterThan(weeklyTotalTraffic + 3);
              expect(columnSum).not.toBeLessThan(weeklyTotalTraffic - 3);
            });
          });
        }
      });
    });
  },
  translationsTests(translations, kpis) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Power hours widget', () => {
      it('widget title', () => {
        expect(powerHoursWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.power_hours);
      });

      it('metric options', () => {
        const expectedKpis = [];
        kpis.forEach(metric => {
          expectedKpis.push(this.getKpiTranslationKey(translations, metric));
        });
        expect(powerHoursWidget.getMetricOptions()).toEqual(expectedKpis);
      });

      it('column headers', () => {
        expect(powerHoursWidget.getDayHeaders()).toEqual(
          [translations.weekdaysShort.sun.toUpperCase(),
            translations.weekdaysShort.mon.toUpperCase(),
            translations.weekdaysShort.tue.toUpperCase(),
            translations.weekdaysShort.wed.toUpperCase(),
            translations.weekdaysShort.thu.toUpperCase(),
            translations.weekdaysShort.fri.toUpperCase(),
            translations.weekdaysShort.sat.toUpperCase()
          ]
        );

        expect(powerHoursWidget.getTotalHeader().getText()).toEqual(translations.powerHoursWidget.TOTAL.toUpperCase());
      });

      it('total row header', () => {
        expect(powerHoursWidget.getTotalRowHeader().getText()).toEqual(translations.powerHoursWidget.DAILYAVERAGE.toUpperCase());
      });

      it('text in chart legend', () => {
        expect(powerHoursWidget.getChartLegendText('medium')).toMatch(translations.powerHoursWidget.TRAFFIC);
        expect(powerHoursWidget.getChartLegendText('high')).toMatch(translations.powerHoursWidget.TRAFFIC);
      });
    });
  },
  getKpiTranslationKey(translations, kpi) {
    switch (kpi) {
      case this.KPI_TRAFFIC:
        return translations.kpis.options.average_traffic;
      case this.KPI_AVGTRAFFICPERSITE:
        return translations.kpis.options.traffic_per_site;
      case this.KPI_TRAFFICPCT:
        return translations.kpis.shortKpiTitles.tenant_traffic_pct;
      case this.KPI_SALES:
        return translations.kpis.options.average_sales;
      case this.KPI_AVGSALESPERSITE:
        return translations.kpis.options.sales_per_site;
      case this.KPI_CONVERSION:
        return translations.kpis.shortKpiTitles.tenant_conversion;
      case this.KPI_ATS:
        return translations.kpis.kpiTitle.ats;
      case this.KPI_STAR:
        return translations.kpis.shortKpiTitles.tenant_star;
      default:
        throw new Error(`Invalid kpi metric: ${kpi}`);
    }
  }
};
