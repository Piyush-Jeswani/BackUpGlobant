const multiMetricLineChartWidget = require('../../pages/components/site-traffic-widget.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const userData = require('../../data/users.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests(timePeriod, sumDataWindow, kpis) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    let kpiSummaryValues = { // to be used for checking 5-kpi metric widget values vs metric line chart widget summary values
      traffic: {},
      sales: {},
      conversion: {},
      ats: {},
      star: {}
    };
    describe('Multi-metric line chart widget', () => {
      describe('weather feature tests', () => {
        const weatherMetrics = multiMetricLineChartWidget.getWeatherMetrics();
        const weatherUnits = multiMetricLineChartWidget.getWeatherUnits();
        const temp = weatherMetrics[0];
        const highTemp = weatherMetrics[1];
        const windSpeed = weatherMetrics[6];
        const humidity = weatherMetrics[4];
        const degreesF = weatherUnits[0];
        const degreesC = weatherUnits[1];
        const mph = weatherUnits[2];
        const kph = weatherUnits[3];

        it('chart should show weather metric dropdown', () => {
          expect(multiMetricLineChartWidget.getWeatherDropdown().isPresent()).toBe(true);
        });

        it('by default, temperature metric is selected and appears on chart/in legend', () => {
          if (multiMetricLineChartWidget.getWidgetWeatherPermission()) {
            expect(multiMetricLineChartWidget.getActiveWeatherMetrics()).toMatch(temp);
            expect(multiMetricLineChartWidget.getWeatherMetricLine(3).isPresent()).toBe(true);
            expect(multiMetricLineChartWidget.getLegendTextLowerCase()).toMatch(temp);
            const tooltipText = multiMetricLineChartWidget.getTooltipText();
            expect(tooltipText).toMatch(temp);
            expect(tooltipText).toMatch(degreesC);
          }
        });

        it('should show all expected weather metric names in dropdown', () => {
          multiMetricLineChartWidget.getWeatherDropdown().click();
          const weatherMetricOptions = multiMetricLineChartWidget.getWeatherDropdown().getTextLowerCase();
          multiMetricLineChartWidget.getWeatherMetrics().forEach(metric => {
            expect(weatherMetricOptions).toMatch(metric);
          });
          multiMetricLineChartWidget.getWeatherDropdown().click();
        });

        it('should correctly add and remove other weather metrics from the chart', () => {
          multiMetricLineChartWidget.setWeatherMetric(temp);
          expect(multiMetricLineChartWidget.getActiveWeatherMetrics()).not.toMatch(temp);
          expect(multiMetricLineChartWidget.getWeatherMetricLine(3).isPresent()).not.toBe(true);
          expect(multiMetricLineChartWidget.getLegendTextLowerCase()).not.toMatch(temp);

          let tooltipText = multiMetricLineChartWidget.getTooltipText();
          expect(tooltipText).not.toMatch(temp);
          expect(tooltipText).not.toMatch(degreesC);
          expect(tooltipText).not.toMatch(kph);


          this.verifyWeatherMetricsOnChart(highTemp, degreesC, degreesF);
          this.verifyWeatherMetricsOnChart(windSpeed, kph, mph);
          this.verifyWeatherMetricsOnChart(humidity);
        });

        it('should disallow selection of greater than three weather metrics', () => {
          multiMetricLineChartWidget.getWeatherDropdown().click();
          const allDisplayedOptions = multiMetricLineChartWidget.getAllDisplayedWeatherOptions();
          const disabledOptions = allDisplayedOptions.filter(option => {
            return option.getAttribute('disabled').then(disabledAttr => {
              return disabledAttr === 'true';
            });
          });
          expect(allDisplayedOptions.count()).toEqual(7);
          expect(disabledOptions.count()).toEqual(4);
        });
      });
      // mall org RT227
      describe('chart data tests', () => {
        // loop through available metrics in line chart widget dropdown
        kpis.forEach(metric => {
          const metricKey = metric.toLowerCase(); // key for kpiSummaryValues

          describe(`( ${metric} metric):`, () => {
            beforeAll(() => {
              multiMetricLineChartWidget.selectMetric(metric);
            });

            it(`should display the title "${metric}"`, () => {
              const widgetTitle = multiMetricLineChartWidget.widgetTitle();
              expect(widgetTitle.getText()).toEqual(metric);
            });

            // checks that x-axis values fit within selected date range
            it('widget chart should display correct date range on x-axis', () => {
              const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
              const allXAxisDates = multiMetricLineChartWidget.getXAxisDates(userData.superUser.dateFormat);

              protractor.promise.all([reportPeriod, allXAxisDates]).then(promiseArray => {
                const reportArray = promiseArray[0];
                const chartDateArray = promiseArray[1];

                chartDateArray.forEach(dateItem => {
                  expect(dateItem).not.toBeLessThan(reportArray[0]);
                  expect(dateItem).not.toBeGreaterThan(reportArray[1]);
                });
              });
            });

            it('widget chart should display correct range on y-axis', () => {
              const selectedPeriodDataValues = multiMetricLineChartWidget.getSelectedPeriodDataValues();
              const priorPeriodDataValues = multiMetricLineChartWidget.getPriorPeriodDataValues();
              const priorYearDataValues = multiMetricLineChartWidget.getPriorYearDataValues();
              const highestYAxisValue = multiMetricLineChartWidget.getHighestYAxisValue();

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

            it('correct date range should appear in "overall visitors" frame', () => {
              const dateFormat = userData.superUser.dateFormat;

              const reportPeriod = dateSelector.getReportingPeriod(dateFormat);
              const priorReportPeriod = dateSelector.getPriorReportingPeriod(dateFormat);

              const selectedPeriodDate = multiMetricLineChartWidget.getSelectedPeriodDateRange(dateFormat);
              const priorPeriodDate = multiMetricLineChartWidget.getPriorPeriodDateRange(dateFormat);

              expect(selectedPeriodDate).toEqual(reportPeriod);
              expect(priorPeriodDate).toEqual(priorReportPeriod);

              if (timePeriod !== 'year') {
                const priorYearReportingPeriod = dateSelector.getPriorYearReportingPeriod(timePeriod, dateFormat);
                const priorYearDate = multiMetricLineChartWidget.getPriorYearDateRange(dateFormat);

                expect(priorYearDate).toEqual(priorYearReportingPeriod);
              }
            });

            it('correct percentage deltas should appear in "overall visitors" frame', () => {
              const priorPeriodDelta = multiMetricLineChartWidget.getPriorPeriodDelta();
              const calculatedPriorPeriodDelta = multiMetricLineChartWidget.calculatePriorPeriodDelta();
              const deltaDataWindow = 0.2;

              kpiSummaryValues[metricKey].priorPeriodDelta = priorPeriodDelta;

              if (metric !== 'STAR') {
                expect(calculatedPriorPeriodDelta).not.toBeLessThan(priorPeriodDelta - deltaDataWindow);
                expect(calculatedPriorPeriodDelta).not.toBeGreaterThan(priorPeriodDelta + deltaDataWindow);
              }

              if (timePeriod !== 'year') {
                const priorYearDelta = multiMetricLineChartWidget.getPriorYearDelta();
                kpiSummaryValues[metricKey].priorYearDelta = priorYearDelta;
                if (metric !== 'STAR') {
                  const calculatedPriorYearDelta = multiMetricLineChartWidget.calculatePriorYearDelta();
                  expect(calculatedPriorYearDelta).not.toBeLessThan(priorYearDelta - deltaDataWindow);
                  expect(calculatedPriorYearDelta).not.toBeGreaterThan(priorYearDelta + deltaDataWindow);
                }
              }
            });

            it('sum of a line\'s data points should equal the corresponding total displayed in "overall visitors" frame', () => {
              const selectedPeriodDataSum = multiMetricLineChartWidget.getSelectedPeriodDataSum();
              const priorPeriodDataSum = multiMetricLineChartWidget.getPriorPeriodDataSum();

              const selectedPeriodVisitors = multiMetricLineChartWidget.getSelectedPeriodOverall();
              const priorPeriodVisitors = multiMetricLineChartWidget.getPriorPeriodOverall();

              kpiSummaryValues[metricKey].selectedPeriod = selectedPeriodVisitors;
              kpiSummaryValues[metricKey].priorPeriod = priorPeriodVisitors;

              if (timePeriod !== 'year') {
                kpiSummaryValues[metricKey].priorYear = multiMetricLineChartWidget.getPriorYearOverall();
              }

              if (metric === 'Traffic' || metric === 'Sales') {
                expect(selectedPeriodDataSum).not.toBeGreaterThan(selectedPeriodVisitors + sumDataWindow);
                expect(selectedPeriodDataSum).not.toBeLessThan(selectedPeriodVisitors - sumDataWindow);

                expect(priorPeriodDataSum).not.toBeGreaterThan(priorPeriodVisitors + sumDataWindow);
                expect(priorPeriodDataSum).not.toBeLessThan(priorPeriodVisitors - sumDataWindow);

                if (timePeriod !== 'year') {
                  const priorYearDataSum = multiMetricLineChartWidget.getPriorYearDataSum();
                  const priorYearVisitors = kpiSummaryValues[metricKey].priorYear;
                  expect(priorYearDataSum).not.toBeGreaterThan(priorYearVisitors + sumDataWindow);
                  expect(priorYearDataSum).not.toBeLessThan(priorYearVisitors - sumDataWindow);
                }
              }
            });
          });
        });
      });
    });
    return kpiSummaryValues;
  },
  // todo: expand Monday test block to incorporate metrics other than traffic
  mondayFunctionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Traffic widget:', () => {
      // checks that x-axis values fit within selected date range
      it('widget chart should display correct date range on x-axis', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.mondayUser.dateFormat);
        const allXAxisDates = multiMetricLineChartWidget.getXAxisDates(userData.mondayUser.dateFormat);

        protractor.promise.all([reportPeriod, allXAxisDates]).then(promiseArray => {
          const reportArray = promiseArray[0];
          const chartDateArray = promiseArray[1];
          // first point on x-axis should match start date of time period
          expect(chartDateArray[0]).toEqual(reportArray[0]);
          chartDateArray.forEach(dateItem => {
            expect(dateItem).not.toBeLessThan(reportArray[0]);
            expect(dateItem).not.toBeGreaterThan(reportArray[1]);
          });
        });
      });

      it('correct date range should appear in "overall visitors" frame', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.mondayUser.dateFormat);
        const comparePeriod1 = dateSelector.getComparePeriod(userData.mondayUser.comparePd1WeeksBack, userData.mondayUser.dateFormat);

        const selectedPeriodDate = multiMetricLineChartWidget.getSelectedPeriodDateRange(userData.mondayUser.dateFormat);
        const priorPeriodDate = multiMetricLineChartWidget.getPriorPeriodDateRange(userData.mondayUser.dateFormat);

        const comparePeriod2 = dateSelector.getComparePeriod(userData.mondayUser.comparePd2WeeksBack, userData.mondayUser.dateFormat);
        const priorPeriod2Date = multiMetricLineChartWidget.getPriorYearDateRange(userData.mondayUser.dateFormat);


        expect(selectedPeriodDate).toEqual(reportPeriod);
        expect(priorPeriodDate).toEqual(comparePeriod1);
        expect(priorPeriod2Date).toEqual(comparePeriod2);
      });
    });
  },
  // todo: expand translation test block to incorporate metrics other than traffic
  translationsTests(translations, customPeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Traffic widget', () => {
      it('widget title', () => {
        expect(multiMetricLineChartWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.traffic);
      });

      it('date range titles in chart legend', () => {
        const legendText = multiMetricLineChartWidget.getLegendTextLowerCase();
        if (customPeriod) {
          expect(legendText).toEqual([translations.common.SELECTEDPERIOD.toLowerCase(), translations.common.CUSTOMCOMPARE1.toLowerCase(), translations.common.CUSTOMCOMPARE2.toLowerCase()]);
        } else {
          expect(legendText).toEqual([translations.common.SELECTEDPERIOD.toLowerCase(), translations.common.PRIORPERIOD.toLowerCase(), translations.common.PRIORYEAR.toLowerCase()]);
        }
      });

      it('date range titles in chart summary frame', () => {
        const selectedPeriodLabel = multiMetricLineChartWidget.getSummaryFrameSelectedPeriodLabel();
        const priorPeriodLabel = multiMetricLineChartWidget.getSummaryFrameCompare1Label();
        const priorYearLabel = multiMetricLineChartWidget.getSummaryFrameCompare2Label();

        expect(selectedPeriodLabel).toEqual(translations.common.SELECTEDPERIOD);
        if (customPeriod) {
          expect(priorPeriodLabel).toEqual(translations.common.CUSTOMCOMPARE1.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.CUSTOMCOMPARE2.toUpperCase());
        } else {
          expect(priorPeriodLabel).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.PRIORYEAR.toUpperCase());
        }
      });

      it('metric unit label in chart summary frame', () => {
        expect(multiMetricLineChartWidget.getSummaryFrameMetricLabel()).toEqual(translations.kpis.totalLabel.traffic.toUpperCase());
      });

      it('tooltip text', () => {
        const tooltipTotalText = multiMetricLineChartWidget.getTooltipTotalText();
        tooltipTotalText.then(textArray => {
          expect(textArray[0]).toEqual(translations.lineChartWidget.TOTAL);
        });
      });
    });
  },
  verifyWeatherMetricsOnChart(metric, expectedUnit, nonExpectedUnit) {
    multiMetricLineChartWidget.setWeatherMetric(metric);

    expect(multiMetricLineChartWidget.getActiveWeatherMetrics()).toMatch(metric);
    expect(multiMetricLineChartWidget.getWeatherMetricLine(3).isPresent()).toBe(true);
    expect(multiMetricLineChartWidget.getLegendTextLowerCase()).toMatch(metric);
    const tooltipText = multiMetricLineChartWidget.getTooltipText();
    expect(tooltipText).toMatch(metric);
    // if expectedUnit is present, nonExpectedUnit will be too
    if (expectedUnit) {
      expect(tooltipText).toMatch(expectedUnit);
      expect(tooltipText).not.toMatch(nonExpectedUnit);
    }
  }
};
