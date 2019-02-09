const dateSelector = require('../../pages/components/time-period-picker.js');
const userData = require('../../data/users.js');
const since = require('jasmine2-custom-message');

module.exports = {
  KPI_SALES: 'Sales',
  KPI_CONVERSION: 'Conversion',
  KPI_ATS: 'ATS',
  KPI_UPT: 'UPT',
  KPI_VB_TRAFFIC: 'Visitor behavior traffic',
  KPI_GSH: 'Gross shopping hours',
  KPI_DWELL_TIME: 'Dwell time',
  KPI_OPPORTUNITY: 'Opportunity',
  KPI_DRAW_RATE: 'Draw rate',
  KPI_SHOPPERS_VS_OTHERS: 'Shoppers vs Others',
  KPI_ABANDONMENT_RATE: 'Abandonment rate',

  functionalTests(pageObject, expectedTitle, timePeriod, dataWindow, calculatedMetric, percentageMetric) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {
      it(`should display the title "${expectedTitle}"`, () => {
        const widgetTitle = pageObject.widgetTitle();

        expect(widgetTitle.getText()).toEqual(expectedTitle);
      });

      // retail org RT034
      it('widget chart should display correct date range on x-axis', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        const allXAxisDates = pageObject.getXAxisDates(userData.superUser.dateFormat);

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
        const highestYAxisValue = pageObject.getHighestYAxisValue();
        const chartDataArray = [
          pageObject.getSelectedPeriodDataValues(),
          pageObject.getPriorPeriodDataValues(),
          pageObject.getPriorYearDataValues()
        ];

        chartDataArray.forEach(period => {
          period.then(dataArray => {
            expect(dataArray.length).toBeGreaterThan(0);
            dataArray.forEach(dataPoint => {
              expect(dataPoint).not.toBeLessThan(0);
              expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
            });
          });
        });

        expect(highestYAxisValue).not.toBeNaN();
        expect(highestYAxisValue).toEqual(jasmine.any(Number));
      });

      // retail org RT034
      it('correct date range should appear in summary frame', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        const priorReportPeriod = dateSelector.getPriorReportingPeriod(userData.superUser.dateFormat);
        const priorYearReportingPeriod = dateSelector.getPriorYearReportingPeriod(timePeriod, userData.superUser.dateFormat);
        const selectedPeriodDate = pageObject.getSelectedPeriodDateRange(userData.superUser.dateFormat);
        const priorPeriodDate = pageObject.getPriorPeriodDateRange(userData.superUser.dateFormat);
        const priorYearDate = pageObject.getPriorYearDateRange(userData.superUser.dateFormat);

        expect(selectedPeriodDate).toEqual(reportPeriod);
        expect(priorPeriodDate).toEqual(priorReportPeriod);
        expect(priorYearDate).toEqual(priorYearReportingPeriod);
      });

      // calculated metrics do not return a "total value" in line chart summary - they show overall average over the time period given
      // so it doesn't make sense to run certain checks on calculated widgets
      if (!calculatedMetric) {
        it(`sum of a line's data points should equal the corresponding total displayed in summary frame`, () => {
          const chartDataArray = [
            {
              sum: pageObject.getSelectedPeriodDataSum(),
              summary: pageObject.getSelectedPeriodOverall()
            },
            {
              sum: pageObject.getPriorPeriodDataSum(),
              summary: pageObject.getPriorPeriodOverall()
            },
            {
              sum: pageObject.getPriorYearDataSum(),
              summary: pageObject.getPriorYearOverall()
            }
          ];

          chartDataArray.forEach(periodData => {
            Object.keys(periodData).forEach(item => { // loop over all keys in object
              // check that all chart data are numbers
              expect(periodData[item]).not.toBeNaN();
              expect(periodData[item]).toEqual((jasmine.any(Number)));
            });
            // check that a line's sum approximately equals the line's summary value
            expect(periodData.sum).not.toBeGreaterThan(periodData.summary + dataWindow);
            expect(periodData.sum).not.toBeLessThan(periodData.summary - dataWindow);
          });
        });

        it('correct percentage deltas should appear in summary frame', () => {
          const deltaArray = [
            { calculated: pageObject.calculatePriorPeriodDelta(),
              actual: pageObject.getPriorPeriodDelta()
            },
            { calculated: pageObject.calculatePriorYearDelta(),
              actual: pageObject.getPriorYearDelta()
            }
          ];
          const deltaDataWindow = 0.2;

          deltaArray.forEach(periodData => {
            expect(periodData.calculated).not.toBeLessThan(periodData.actual - deltaDataWindow);
            expect(periodData.calculated).not.toBeGreaterThan(periodData.actual + deltaDataWindow);
          });
        });
      }

      if (percentageMetric) {
        // Catches issues such as SA-1048, , SA-1084, SA-2682
        it('metric percentages displayed in the summary frame should have two decimal places', () => {
          const selectedPeriodPercent = pageObject.getSelectedPeriodOverallAsText();
          const priorPeriodPercent = pageObject.getPriorPeriodOverallAsText();
          const priorYearPercent = pageObject.getPriorYearOverallAsText();

          expect(selectedPeriodPercent).toMatch(/^\d+,\d\d%$/);
          expect(priorPeriodPercent).toMatch(/^\d+,\d\d%$/);
          expect(priorYearPercent).toMatch(/^\d+,\d\d%$/);
        });

        // Catches issues such as SA-757
        it('metric percentages displayed in the summary frame should not be greater than 100%', () => {
          const selectedPeriodPercent = pageObject.getSelectedPeriodOverall();
          const priorPeriodPercent = pageObject.getPriorPeriodOverall();
          const priorYearPercent = pageObject.getPriorYearOverall();

          expect(selectedPeriodPercent).not.toBeGreaterThan(100);
          expect(priorPeriodPercent).not.toBeGreaterThan(100);
          expect(priorYearPercent).not.toBeGreaterThan(100);
        });
      }
    });
  },
  mondayFunctionalTests(pageObject, expectedTitle) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {
      it('widget chart should display correct date range on x-axis', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.mondayUser.dateFormat);
        const allXAxisDates = pageObject.getXAxisDates(userData.mondayUser.dateFormat);

        protractor.promise.all([reportPeriod, allXAxisDates]).then(promiseArray => {
          const reportArray = promiseArray[0];
          const chartDateArray = promiseArray[1];
          chartDateArray.forEach(dateItem => {
            expect(dateItem).not.toBeLessThan(reportArray[0]);
            expect(dateItem).not.toBeGreaterThan(reportArray[1]);
          });
        });
      });

      it('correct date range should appear in summary frame',  () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.mondayUser.dateFormat);
        const comparePeriod1 = dateSelector.getComparePeriod(userData.mondayUser.comparePd1WeeksBack, userData.mondayUser.dateFormat);

        const selectedPeriodDate = pageObject.getSelectedPeriodDateRange(userData.mondayUser.dateFormat);
        const priorPeriodDate = pageObject.getPriorPeriodDateRange(userData.mondayUser.dateFormat);

        const comparePeriod2 = dateSelector.getComparePeriod(userData.mondayUser.comparePd2WeeksBack, userData.mondayUser.dateFormat);
        const priorPeriod2Date = pageObject.getPriorYearDateRange(userData.mondayUser.dateFormat);

        browser.sleep(10000);
        expect(selectedPeriodDate).toEqual(reportPeriod);
        expect(priorPeriodDate).toEqual(comparePeriod1);
        expect(priorPeriod2Date).toEqual(comparePeriod2);
      });
    });
  },
  // multiSummaryValues flag applies to chart widgets with multiple values in the selected period summary frame
  // such as shoppers vs others and visitor behavior traffic
  translationsTests(translations, pageObject, metric, customPeriod, multiSummaryValue) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${metric} line chart widget`, () => {
      it('widget title', () => {
        expect(pageObject.widgetTitle().getText()).toEqual(this.getWidgetTitleTranslationKey(translations, metric));
      });

      it('date range titles in chart legend', () => {
        const legendText = pageObject.getLegendText();
        if (customPeriod) {
          expect(legendText).toEqual([translations.common.SELECTEDPERIOD.toLowerCase(), translations.common.CUSTOMCOMPARE1.toLowerCase(), translations.common.CUSTOMCOMPARE2.toLowerCase()]);
        } else {
          expect(legendText).toEqual([translations.common.SELECTEDPERIOD.toLowerCase(), translations.common.PRIORPERIOD.toLowerCase(), translations.common.PRIORYEAR.toLowerCase()]);
        }
      });

      it('date range titles in chart summary frame', () => {
        const selectedPeriodLabel = pageObject.getSummaryFrameSelectedPeriodLabel();
        const priorPeriodLabel = pageObject.getSummaryFrameCompare1Label();
        const priorYearLabel = pageObject.getSummaryFrameCompare2Label();

        expect(selectedPeriodLabel).toEqual(translations.common.SELECTEDPERIOD);
        if (customPeriod) {
          expect(priorPeriodLabel).toEqual(translations.common.CUSTOMCOMPARE1.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.CUSTOMCOMPARE2.toUpperCase());
        } else {
          expect(priorPeriodLabel).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.PRIORYEAR.toUpperCase());
        }
      });

      if (!multiSummaryValue) {
        it('metric unit label in chart summary frame', () => {
          expect(pageObject.getSummaryFrameMetricLabel()).toEqual(this.getWidgetTotalLabelTranslationKey(translations, metric).toUpperCase());
        });
      }

      if (!multiSummaryValue) {
        it('tooltip text', () => {
          const tooltipTotalText = pageObject.getTooltipTotalText();
          tooltipTotalText.then(textArray => {
            expect(textArray[0]).toEqual(translations.lineChartWidget.TOTAL);
          });
        });
      }
    });
  },
  getWidgetTitleTranslationKey(translations, widget) {
    switch (widget) {
      case this.KPI_SALES:
        return translations.kpis.kpiTitle.sales;
      case this.KPI_CONVERSION:
        return translations.kpis.kpiTitle.conversion;
      case this.KPI_ATS:
        return translations.kpis.kpiTitle.ats;
      case this.KPI_UPT:
        return translations.kpis.kpiTitle.upt;
      case this.KPI_VB_TRAFFIC:
        return translations.views.VISITORBEHAVIOR + ' ' + translations.kpis.shortKpiTitles.tenant_traffic.toLowerCase();
      case this.KPI_GSH:
        return translations.kpis.kpiTitle.gsh;
      case this.KPI_DWELL_TIME:
        return translations.kpis.kpiTitle.dwell_time;
      case this.KPI_OPPORTUNITY:
        return translations.kpis.kpiTitle.opportunity;
      case this.KPI_DRAW_RATE:
        return translations.kpis.kpiTitle.draw_rate;
      case this.KPI_SHOPPERS_VS_OTHERS:
        return translations.kpis.kpiTitle.shoppers_vs_others;
      case this.KPI_ABANDONMENT_RATE:
        return translations.kpis.kpiTitle.abandonment_rate;
      default:
        throw new Error(`Invalid widget: ${widget}`);
    }
  },
  getWidgetTotalLabelTranslationKey(translations, widget) {
    switch (widget) {
      case this.KPI_SALES:
        return translations.kpis.totalLabel.sales;
      case this.KPI_CONVERSION:
        return translations.kpis.totalLabel.conversion;
      case this.KPI_ATS:
        return translations.kpis.totalLabel.ats;
      case this.KPI_UPT:
        return translations.kpis.totalLabel.upt;
      case this.KPI_VB_TRAFFIC:
        return translations.kpis.totalLabel.visitor_behaviour_traffic;
      case this.KPI_GSH:
        return translations.kpis.totalLabel.gsh;
      case this.KPI_DWELL_TIME:
        return translations.kpis.totalLabel.dwell_time;
      case this.KPI_OPPORTUNITY:
        return translations.kpis.totalLabel.opportunity;
      case this.KPI_DRAW_RATE:
        return translations.kpis.totalLabel.draw_rate;
      case this.KPI_SHOPPERS_VS_OTHERS:
        return translations.kpis.totalLabel.shoppers_vs_others;
      case this.KPI_ABANDONMENT_RATE:
        return translations.kpis.totalLabel.abandonment_rate;
      default:
        throw new Error(`Invalid widget: ${widget}`);
    }
  }
};
