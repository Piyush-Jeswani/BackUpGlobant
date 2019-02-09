const dailyPerformanceWidget = require('../../pages/components/daily-performance-widget');
const since = require('jasmine2-custom-message');

module.exports = {
  KPI_TRAFFIC: 'Traffic',
  KPI_SALES: 'Sales',
  KPI_ATS: 'ATS',
  KPI_CONVERSION: 'Conversion',
  KPI_STAR: 'Star',
  functionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Daily performance indicators widget', () => {
      it('should display the title "Daily performance indicators"', () => {
        const widgetTitle = dailyPerformanceWidget.widgetTitle();
        expect(widgetTitle.getText()).toEqual('Daily performance indicators');
      });

      it('chart y-axes should be scaled correctly to the data', () => {
        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton

        const leftChartHighestYAxisValue = dailyPerformanceWidget.getHighestYAxisValue('left');
        const rightChartHighestLeftYAxisValue = dailyPerformanceWidget.getHighestYAxisValue('right', 'left');
        const rightChartHighestRightYAxisValue = dailyPerformanceWidget.getHighestYAxisValue('right', 'right');

        const salesDeltaValues = dailyPerformanceWidget.getColumnDataAsNumber('sales_contribution');
        const trafficDeltaValues = dailyPerformanceWidget.getColumnDataAsNumber('traffic_contribution');
        const laborDeltaValues = dailyPerformanceWidget.getColumnDataAsNumber('labor_hours_contribution');
        const transactionsDeltaValues = dailyPerformanceWidget.getColumnDataAsNumber('transactions_contribution');
        const conversionValues = dailyPerformanceWidget.getColumnDataAsNumber('conversion');
        const starValues = dailyPerformanceWidget.getColumnDataAsNumber('star');

        let promises = [salesDeltaValues, trafficDeltaValues, laborDeltaValues, transactionsDeltaValues];

        protractor.promise.all(promises)
          .then(columnValuesArrays => {
            expect(leftChartHighestYAxisValue).not.toBeNaN();
            expect(leftChartHighestYAxisValue).toEqual(jasmine.any(Number));

            columnValuesArrays.forEach(dataArray => {
              expect(dataArray.length).toBeGreaterThan(0);

              dataArray.forEach(dataPoint => {
                expect(dataPoint).not.toBeLessThan(0);
                expect(dataPoint).not.toBeGreaterThan(leftChartHighestYAxisValue);
              });
            });
          });

        conversionValues.then(dataArray => {
          expect(rightChartHighestLeftYAxisValue).not.toBeNaN();
          expect(rightChartHighestLeftYAxisValue).toEqual(jasmine.any(Number));
          expect(dataArray.length).toBeGreaterThan(0);

          dataArray.forEach(dataPoint => {
            expect(dataPoint).not.toBeLessThan(0);
            expect(dataPoint).not.toBeGreaterThan(rightChartHighestLeftYAxisValue);
          });
        });

        starValues.then(dataArray => {
          expect(rightChartHighestRightYAxisValue).not.toBeNaN();
          expect(rightChartHighestRightYAxisValue).toEqual(jasmine.any(Number));
          expect(dataArray.length).toBeGreaterThan(0);

          dataArray.forEach(dataPoint => {
            expect(dataPoint).not.toBeLessThan(0);
            expect(dataPoint).not.toBeGreaterThan(rightChartHighestRightYAxisValue);
          });
        });

        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton
      });

      it('table should show/hide when "show table" button is clicked', () => {
        expect(dailyPerformanceWidget.isTableDisplayed()).toEqual(false);
        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton

        expect(dailyPerformanceWidget.isTableDisplayed()).toEqual(true);
        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton

        expect(dailyPerformanceWidget.isTableDisplayed()).toEqual(false);
      });

      it('(may fail until SA-4104 is fixed)each table column should be sortable, ascending and descending', () => {
        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton

        let metrics = dailyPerformanceWidget.getTableHeaders();

        const testSort = currentIndex => {
          let metric = metrics[currentIndex];
          dailyPerformanceWidget.sortTableBy(metric)
            .then(() => {
              dailyPerformanceWidget.getColumnData(metric)
                .then(unsorted => {
                  dailyPerformanceWidget.sortTableBy(metric)
                    .then(() => {
                      dailyPerformanceWidget.getColumnData(metric)
                        .then(sorted => {
                          expect(sorted).not.toEqual(unsorted);
                          if (currentIndex !== (metrics.length - 1)) {
                            testSort(currentIndex + 1);
                          } else {
                            dailyPerformanceWidget.getExpandTableButton().click();
                            browser.sleep(2000);
                          }
                        });
                    });
                });
            });
        };

        testSort(0);
      });

      describe('charts and table update after selecting days', () => {
        // All tests in this block need to be run together.
        // Isolating a child describe block or it block will likely result in errors
        const leftChartMetrics = ['sales', 'traffic', 'labor', 'transactions'];
        const rightChartMetrics = ['conversion', 'star'];

        describe('all days (default selection)', () => {
          const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

          it('should show all chart series and each series should have 7 points', () => {
            leftChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('left', metric)).toEqual(7);
            });

            rightChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('right', metric)).toEqual(7);
            });
          });

          it('chart x-axes should show all 7 days', () => {
            expect(dailyPerformanceWidget.getChartXAxisLabels('left')).toEqual(dayLabels);
            expect(dailyPerformanceWidget.getChartXAxisLabels('right')).toEqual(dayLabels);
          });

          it('should show 7 days in the table', () => {
            dailyPerformanceWidget.getExpandTableButton().click();
            browser.sleep(2000); // Wait for transiton
            expect(dailyPerformanceWidget.getTableDayLabels()).toEqual(dayLabels);
          });
        });

        describe('weekends', () => {
          const dayLabels = ['Sunday', 'Saturday'];

          beforeAll(done => {
            let selectionPromises = [
              dailyPerformanceWidget.openDaySelectorDropdown(),
              dailyPerformanceWidget.selectDay('weekend')
            ];

            Promise.all(selectionPromises)
              .then(() => {
                dailyPerformanceWidget.openDaySelectorDropdown()
                  .then(() => {
                    done();
                  });
              });
          });

          it('should show all chart series and each series should have 2 points', () => {
            leftChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('left', metric)).toEqual(2);
            });

            rightChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('right', metric)).toEqual(2);
            });
          });

          it('chart x-axes should show both days', () => {
            expect(dailyPerformanceWidget.getChartXAxisLabels('left')).toEqual(dayLabels);
            expect(dailyPerformanceWidget.getChartXAxisLabels('right')).toEqual(dayLabels);
          });

          it('should show 2 days in the table', () => {
            expect(dailyPerformanceWidget.getTableDayLabels()).toEqual(dayLabels);
          });
        });

        describe('Monday, Wednesday, and Friday', () => {
          const dayLabels = ['Monday', 'Wednesday', 'Friday'];

          beforeAll(done => {
            let initialActions = [
              dailyPerformanceWidget.openDaySelectorDropdown()
            ];

            Promise.all(initialActions)
              .then(() => {
                let daySelections = [
                  dailyPerformanceWidget.selectDay('monday'),
                  dailyPerformanceWidget.selectDay('wednesday'),
                  dailyPerformanceWidget.selectDay('friday')
                ];

                Promise.all(daySelections)
                  .then(() => {
                    let dayDeselections = [
                      dailyPerformanceWidget.selectDay('weekend'),
                      dailyPerformanceWidget.openDaySelectorDropdown()
                    ];
                    Promise.all(dayDeselections)
                      .then(() => {
                        done();
                      });
                  });
              });
          });

          it('should show all chart series and each series should have 3 points', () => {
            leftChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('left', metric)).toEqual(3);
            });

            rightChartMetrics.forEach(metric => {
              expect(dailyPerformanceWidget.getChartLineLength('right', metric)).toEqual(3);
            });
          });

          it('chart x-axes should show all 3 days', () => {
            expect(dailyPerformanceWidget.getChartXAxisLabels('left')).toEqual(dayLabels);
            expect(dailyPerformanceWidget.getChartXAxisLabels('right')).toEqual(dayLabels);
          });

          it('should show 3 days in the table', () => {
            expect(dailyPerformanceWidget.getTableDayLabels()).toEqual(dayLabels);
          });
        });
      });
    });
  },
  translationsTests(translations) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Daily performance indicators widget', () => {
      it('widget title', () => {
        expect(dailyPerformanceWidget.widgetTitle().getText()).toEqual(translations.dailyPerformance.DAILYPERFORMANCEINDICATORS);
      });

      it('day selector dropdown options', () => {
        const options = dailyPerformanceWidget.getDaySelectorOptions();

        expect(options).toEqual(
          [translations.daySelector.ALLDAYS,
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

      it('table expander button', () => {
        expect(dailyPerformanceWidget.getExpandTableButton().getText()).toEqual(translations.dailyPerformance.SHOWTABLE.toUpperCase());
        dailyPerformanceWidget.getExpandTableButton().click();
        browser.sleep(2000); // Wait for transiton
        expect(dailyPerformanceWidget.getExpandTableButton().getText()).toEqual(translations.dailyPerformance.HIDETABLE.toUpperCase());
      });

      describe('left-hand chart text', () => {
        const position = 'left';

        it('left chart titles', () => {
          const title = dailyPerformanceWidget.getChartTitle(position);
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_sales.toUpperCase());
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_traffic.toUpperCase());
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_labor.toUpperCase());
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_transactions.toUpperCase());
          expect(title).toMatch(translations.dailyPerformance.BYDAYOFWEEK.toUpperCase());
        });

        it('left chart y-axis labels', () => {
          expect(dailyPerformanceWidget.getChartYAxisLabels(position)).toEqual('%');
        });

        it('left chart x-axis labels', () => {
          expect(dailyPerformanceWidget.getChartXAxisLabels(position)).toEqual(
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

        it('left chart legend labels', () => {
          expect(dailyPerformanceWidget.getChartLegend(position)).toEqual(
            [translations.kpis.shortKpiTitles.tenant_sales,
              translations.kpis.shortKpiTitles.tenant_traffic,
              translations.kpis.shortKpiTitles.tenant_labor,
              translations.kpis.shortKpiTitles.tenant_transactions
            ]
          );
        });

        it('left chart tooltip title', () => {
          const tooltipTitle = dailyPerformanceWidget.getChartTooltip(position);

          tooltipTitle.then(text => {
            const tooltip = text.map(metric => {
              return metric.toUpperCase();
            });
            expect(tooltip).toMatch(translations.kpis.shortKpiTitles.tenant_sales.toUpperCase());
            expect(tooltip).toMatch(translations.kpis.shortKpiTitles.tenant_traffic.toUpperCase());
            expect(tooltip).toMatch(translations.kpis.shortKpiTitles.tenant_labor.toUpperCase());
            expect(tooltip).toMatch(translations.kpis.shortKpiTitles.tenant_transactions.toUpperCase());
          });
        });
      });

      describe('right-hand chart text', () => {
        const position = 'right';

        it('right chart titles', () => {
          const title = dailyPerformanceWidget.getChartTitle(position);
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_conversion.toUpperCase());
          expect(title).toMatch(translations.kpis.shortKpiTitles.tenant_star.toUpperCase());
          expect(title).toMatch(translations.dailyPerformance.BYDAYOFWEEK.toUpperCase());
        });


        it('right chart y-axis labels', () => {
          const label = dailyPerformanceWidget.getChartYAxisLabels(position);
          expect(label).toMatch(translations.kpis.shortKpiTitles.tenant_conversion.toUpperCase());
          expect(label).toMatch(translations.kpis.shortKpiTitles.tenant_star.toUpperCase());
        });

        it('right chart x-axis labels', () => {
          expect(dailyPerformanceWidget.getChartXAxisLabels(position)).toEqual(
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

        it('right chart legend labels', () => {
          expect(dailyPerformanceWidget.getChartLegend(position)).toEqual(
            [translations.kpis.shortKpiTitles.tenant_conversion,
              translations.kpis.shortKpiTitles.tenant_star
            ]
          );
        });

        it('right chart tooltip title', () => {
          const tooltipTitle = dailyPerformanceWidget.getChartTooltip(position);

          tooltipTitle.then(array => {
            expect(array[0].toLowerCase()).toMatch(translations.kpis.shortKpiTitles.tenant_conversion.toLowerCase());
            expect(array[1].toLowerCase()).toMatch(translations.kpis.shortKpiTitles.tenant_star.toLowerCase());
          });
        });
      });

      describe('widget table', () => {
        it('table column header metrics', () => {
          expect(dailyPerformanceWidget.getTableHeaderMetricLabels()).toEqual(
            [translations.kpis.shortKpiTitles.tenant_sales,
              translations.kpis.shortKpiTitles.tenant_traffic,
              translations.kpis.shortKpiTitles.tenant_labor,
              translations.kpis.shortKpiTitles.tenant_transactions,
              translations.kpis.shortKpiTitles.tenant_conversion,
              translations.kpis.shortKpiTitles.tenant_star
            ]
          );
        });

        it('table row day labels', () => {
          expect(dailyPerformanceWidget.getTableDayLabels()).toEqual(
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
          expect(dailyPerformanceWidget.getTableFooterLabel()).toEqual(translations.common.AVERAGE.toUpperCase());
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
