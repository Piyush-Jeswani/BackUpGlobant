const dailyAverageBarWidget = require('../../pages/components/daily-metric-averages-widget');
const since = require('jasmine2-custom-message');
const _ = require('underscore');

module.exports = {
  KPI_TRAFFIC: 'Traffic',
  KPI_SALES: 'Sales',
  KPI_ATS: 'ATS',
  KPI_CONVERSION: 'Conversion',
  KPI_STAR: 'STAR',

  functionalTests(kpis) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Daily average metric widget', () => {
      // loop through available metrics in bar chart widget dropdown
      kpis.forEach(metric => {
        describe(`${metric} metric`, () => {
          if (kpis.length > 1) {
            beforeAll(() => {
              dailyAverageBarWidget.selectMetric(metric);
            });
          }

          it(`should display the title "Daily averages: ${metric}"`, () => {
            const widgetTitle = dailyAverageBarWidget.widgetTitle();

            expect(widgetTitle.getText()).toEqual(`Daily averages: ${metric}`);
          });

          it('widget chart should have data for each day and should display correct range on y-axis', () => {
            const highestYAxisValue = dailyAverageBarWidget.getHighestYAxisValue();
            const selectedPeriodDataValues = dailyAverageBarWidget.getSelectedPeriodDataValues();
            const priorPeriodDataValues = dailyAverageBarWidget.getPriorPeriodDataValues();
            const priorYearDataValues = dailyAverageBarWidget.getPriorYearDataValues();

            expect(highestYAxisValue).not.toBeNaN();
            expect(highestYAxisValue).toEqual(jasmine.any(Number));

            selectedPeriodDataValues.then(dataArray => {
              expect(dataArray.length).toBeGreaterThan(0);
              dataArray.forEach(dataPoint => {
                expect(dataPoint).not.toBe(0);
                expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
              });
            });

            priorPeriodDataValues.then(dataArray => {
              expect(dataArray.length).toBeGreaterThan(0);
              dataArray.forEach(dataPoint => {
                expect(dataPoint).not.toBe(0);
                expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
              });
            });

            priorYearDataValues.then(dataArray => {
              expect(dataArray.length).toBeGreaterThan(0);
              dataArray.forEach(dataPoint => {
                expect(dataPoint).not.toBe(0);
                expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
              });
            });
          });
        });
      });

      // mall org RT208 (mall org-level widget)
      // mall org RT233 (mall site-level widget)
      describe('charts and table update after selecting days', () => {
        beforeAll(() => {
          dailyAverageBarWidget.getExpandTableButton().click();
        });

        kpis.forEach(metric => {
          describe(`${metric} metric`, () => {
            if (kpis.length > 1) {
              beforeAll(() => {
                dailyAverageBarWidget.selectMetric(metric);
              });
            }

            describe('all days (default selection)', () => {
              const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

              // 7 day data integrity checks handled above
              it('chart x-axis should show all 7 days', () => {
                expect(dailyAverageBarWidget.getXAxisLabels()).toEqual(dayLabels);
              });

              it('should show 7 days in the table', () => {
                expect(dailyAverageBarWidget.getTableDayLabels()).toEqual(dayLabels);
              });
            });

            describe('weekends', () => {
              const dayLabels = ['Sunday', 'Saturday'];

              beforeAll(() => {
                dailyAverageBarWidget.openDaySelectorDropdown();
                dailyAverageBarWidget.selectDay('weekend');
                dailyAverageBarWidget.openDaySelectorDropdown();
              });

              it('should show 2 days of data', () => {
                const selectedPeriodDataValues = dailyAverageBarWidget.getSelectedPeriodDataValues();
                const priorPeriodDataValues = dailyAverageBarWidget.getPriorPeriodDataValues();
                const priorYearDataValues = dailyAverageBarWidget.getPriorYearDataValues();

                selectedPeriodDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(2);
                });

                priorPeriodDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(2);
                });

                priorYearDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(2);
                });
              });

              it('chart x-axis should show both days', () => {
                expect(dailyAverageBarWidget.getXAxisLabels()).toEqual(dayLabels);
              });

              it('should show 2 days in the table', () => {
                expect(dailyAverageBarWidget.getTableDayLabels()).toEqual(dayLabels);
              });
            });

            describe('Monday, Wednesday, and Friday', () => {
              const dayLabels = ['Monday', 'Wednesday', 'Friday'];

              beforeAll(done => {
                let initialActions = [
                  dailyAverageBarWidget.openDaySelectorDropdown()
                ];

                Promise.all(initialActions)
                  .then(() => {
                    let daySelections = [
                      dailyAverageBarWidget.selectDay('monday'),
                      dailyAverageBarWidget.selectDay('wednesday'),
                      dailyAverageBarWidget.selectDay('friday')
                    ];

                    Promise.all(daySelections)
                      .then(() => {
                        let dayDeselections = [
                          dailyAverageBarWidget.selectDay('weekend'),
                          dailyAverageBarWidget.openDaySelectorDropdown()
                        ];
                        Promise.all(dayDeselections)
                          .then(() => {
                            done();
                          });
                      });
                  });
              });

              it('should show 3 days of data', () => {
                browser.sleep(1000);
                const selectedPeriodDataValues = dailyAverageBarWidget.getSelectedPeriodDataValues();
                const priorPeriodDataValues = dailyAverageBarWidget.getPriorPeriodDataValues();
                const priorYearDataValues = dailyAverageBarWidget.getPriorYearDataValues();

                selectedPeriodDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(3);
                });

                priorPeriodDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(3);
                });

                priorYearDataValues.then(dataArray => {
                  expect(dataArray.length).toEqual(3);
                });
              });

              it('chart x-axis should show 3 days', () => {
                browser.sleep(1000);
                expect(dailyAverageBarWidget.getXAxisLabels()).toEqual(dayLabels);
              });

              it('should show 3 days in the table', () => {
                browser.sleep(1000);
                expect(dailyAverageBarWidget.getTableDayLabels()).toEqual(dayLabels);
              });

              // todo: modify teardown after sa-610 is fixed
              afterAll(() => {
                dailyAverageBarWidget.openDaySelectorDropdown();
                // SA-1888: Selecting the all option removes the other selections automatically
                dailyAverageBarWidget.selectDay('all');
                dailyAverageBarWidget.openDaySelectorDropdown();
              });
            });
          });
        });

        afterAll(() => {
          dailyAverageBarWidget.getExpandTableButton().click();
        });
      });

      it('table should show/hide when "show table" button is clicked', () => {
        expect(dailyAverageBarWidget.isTableDisplayed()).toEqual(false);
        dailyAverageBarWidget.getExpandTableButton().click();
        expect(dailyAverageBarWidget.isTableDisplayed()).toEqual(true);
      });

      it('each table column should be sortable, ascending and descending', () => {
        browser.sleep(4000); // Wait for transiton

        dailyAverageBarWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton

        let metrics = dailyAverageBarWidget.getTableHeaders();

        const testSort = currentIndex => {
          let metric = metrics[currentIndex];
          dailyAverageBarWidget.sortTableBy(metric)
            .then(() => {
              dailyAverageBarWidget.getColumnData(metric)
                .then(unsorted => {
                  dailyAverageBarWidget.sortTableBy(metric)
                    .then(() => {
                      dailyAverageBarWidget.getColumnData(metric)
                        .then(sorted => {
                          expect(sorted).not.toEqual(unsorted);
                          if (currentIndex !== (metrics.length - 1)) {
                            testSort(currentIndex + 1);
                          } else {
                            dailyAverageBarWidget.getExpandTableButton().click();
                            browser.sleep(2000);
                          }
                        });
                    });
                });
            });
        };

        testSort(0);
      });
    });
  },
  mondayFunctionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Daily average metric widget', () => {
      it('should display 7 days along the x-axis beginning with Monday', () => {
        expect(dailyAverageBarWidget.getXAxisLabels()).toEqual(dailyAverageBarWidget.getMondayHeaders());
      });

      it('should display 7 days beginning with Monday in the table', () => {
        dailyAverageBarWidget.getExpandTableButton().click();
        expect(dailyAverageBarWidget.getColumnData('day')).toEqual(dailyAverageBarWidget.getMondayHeaders());
      });

      it('should sort days in the correct inverse order in the table', () => {
        dailyAverageBarWidget.sortTableBy('day');
        expect(dailyAverageBarWidget.getColumnData('day')).toEqual(dailyAverageBarWidget.sortedMondayHeaders());
      });
    });
  },
  translationsTests(translations, kpis, customPeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Daily averages widget', () => {
      const expectedKpis = [];
      kpis.forEach(metric => {
        expectedKpis.push(this.getKpiTranslationKey(translations, metric));
      });

      it('widget title', () => {
        expect(dailyAverageBarWidget.widgetTitle().getText()).toEqual(`${translations.trafficPerWeekdayWidget.DAILYAVERAGES}: ${translations.kpis.kpiTitle.traffic}`);
      });

      it('day selector dropdown options', () => {
        const options = dailyAverageBarWidget.getDaySelectorOptions();
        expect(options).toEqual(
          [translations.daySelector.HOURS,
            translations.daySelector.ALLDAYS,
            translations.daySelector.WEEKENDS,
            translations.weekdaysLong.sun,
            translations.weekdaysLong.mon,
            translations.weekdaysLong.tue,
            translations.weekdaysLong.wed,
            translations.weekdaysLong.thu,
            translations.weekdaysLong.fri,
            translations.weekdaysLong.sat
          ]
        );
      });

      if (kpis.length > 1) {
        it('metric selector dropdown options', () => {
          expect(dailyAverageBarWidget.getMetricSelectorOptions()).toEqual(expectedKpis);
        });
      }

      it('table expander button', () => {
        expect(dailyAverageBarWidget.getExpandTableButton().getText()).toEqual(translations.trafficPerWeekdayWidget.SHOWTABLE.toUpperCase());
        dailyAverageBarWidget.getExpandTableButton().click();
        expect(dailyAverageBarWidget.getExpandTableButton().getText()).toEqual(translations.trafficPerWeekdayWidget.HIDETABLE.toUpperCase());
      });

      describe('widget chart', () => {
        it('day labels on chart x-axis', () => {
          expect(dailyAverageBarWidget.getXAxisLabels()).toEqual(
            [translations.weekdaysLong.sun,
              translations.weekdaysLong.mon,
              translations.weekdaysLong.tue,
              translations.weekdaysLong.wed,
              translations.weekdaysLong.thu,
              translations.weekdaysLong.fri,
              translations.weekdaysLong.sat
            ]
          );
        });

        it('chart legend', () => {
          if (customPeriod) {
            expect(dailyAverageBarWidget.getLegendTextLowerCase()).toEqual(
              [translations.common.SELECTEDPERIOD.toLowerCase(),
                translations.common.CUSTOMCOMPARE1.toLowerCase(),
                translations.common.CUSTOMCOMPARE2.toLowerCase()
              ]
            );
          } else {
            expect(dailyAverageBarWidget.getLegendTextLowerCase()).toEqual(
              [translations.common.SELECTEDPERIOD.toLowerCase(),
                translations.common.PRIORPERIOD.toLowerCase(),
                translations.common.PRIORYEAR.toLowerCase()
              ]
            );
          }
        });

        it('tooltip text', () => {
          if (customPeriod) {
            expect(dailyAverageBarWidget.getTooltipTotalText()).toEqual(
              [translations.common.SELECTEDPERIOD,
                translations.common.CUSTOMCOMPARE1,
                translations.common.CUSTOMCOMPARE2
              ]
            );
          } else {
            expect(dailyAverageBarWidget.getTooltipTotalText()).toEqual(
              [translations.common.SELECTEDPERIOD,
                translations.common.PRIORPERIOD,
                translations.common.PRIORYEAR
              ]
            );
          }
        });
      });

      describe('widget table', () => {
        it('table column header metrics', () => {
          const expectedKpisUppercase = expectedKpis.map(kpi => {
            return kpi.toUpperCase();
          });
          dailyAverageBarWidget.getTableHeaderMetricLabels().then((text) => {
            let actualKpis = _.without(text, '');
            expect(actualKpis).toEqual(expectedKpisUppercase);
          })
        });

        it('table row day labels', () => {
          expect(dailyAverageBarWidget.getTableDayLabels()).toEqual(
            [translations.weekdaysLong.sun,
              translations.weekdaysLong.mon,
              translations.weekdaysLong.tue,
              translations.weekdaysLong.wed,
              translations.weekdaysLong.thu,
              translations.weekdaysLong.fri,
              translations.weekdaysLong.sat
            ]
          );
        });

        it('table footer row label', () => {
          expect(dailyAverageBarWidget.getTableFooterLabel()).toEqual(translations.trafficPerWeekdayWidget.AVERAGE.toUpperCase());
        });
      });
    });
  },
  getKpiTranslationKey(translations, kpi) {
    switch (kpi) {
      case this.KPI_TRAFFIC:
        return translations.kpis.kpiTitle.traffic;
      case this.KPI_SALES:
        return translations.kpis.kpiTitle.sales;
      case this.KPI_CONVERSION:
        return translations.kpis.kpiTitle.conversion;
      case this.KPI_ATS:
        return translations.kpis.kpiTitle.ats;
      case this.KPI_STAR:
        return translations.kpis.kpiTitle.star;
      default:
        throw new Error(`Invalid kpi metric: ${kpi}`);
    }
  }
};
