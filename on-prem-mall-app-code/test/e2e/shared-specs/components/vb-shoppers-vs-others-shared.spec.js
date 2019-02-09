const dateSelector = require('../../pages/components/time-period-picker.js');
const userData = require('../../data/users.js');
const singleMetricLineChart = require('./single-metric-line-chart-shared.spec');
const shoppersVsOthersWidget = require('../../pages/components/shoppers-vs-others-widget.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests(timePeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Shoppers vs others widget', () => {
      it('should display the title "Shoppers vs Others"', () => {
        const widgetTitle = shoppersVsOthersWidget.widgetTitle();

        expect(widgetTitle.getText()).toEqual('Shoppers vs others');
      });

      it('widget chart should display correct date range on x-axis', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        const allXAxisDates = shoppersVsOthersWidget.getXAxisDates(userData.superUser.dateFormat);

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
        const selectedPeriodDataValues = shoppersVsOthersWidget.getSelectedPeriodDataValues();
        const highestYAxisValue = shoppersVsOthersWidget.getHighestYAxisValue();

        expect(highestYAxisValue).not.toBeNaN();
        expect(highestYAxisValue).toEqual(jasmine.any(Number));

        selectedPeriodDataValues.then(dataArray => {
          expect(dataArray.length).toBeGreaterThan(0);
          dataArray.forEach(dataPoint => {
            expect(dataPoint).not.toBeLessThan(0);
            expect(dataPoint).not.toBeGreaterThan(highestYAxisValue);
          });
        });
      });

      it('correct date range should appear in summary frame', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        const priorReportPeriod = dateSelector.getPriorReportingPeriod(userData.superUser.dateFormat);
        const priorYearReportingPeriod = dateSelector.getPriorYearReportingPeriod(timePeriod, userData.superUser.dateFormat);
        const selectedPeriodDate = shoppersVsOthersWidget.getSelectedPeriodDateRange(userData.superUser.dateFormat);
        const priorPeriodDate = shoppersVsOthersWidget.getPriorPeriodDateRange(userData.superUser.dateFormat);
        const priorYearDate = shoppersVsOthersWidget.getPriorYearDateRange(userData.superUser.dateFormat);

        expect(selectedPeriodDate).toEqual(reportPeriod);
        expect(priorPeriodDate).toEqual(priorReportPeriod);
        expect(priorYearDate).toEqual(priorYearReportingPeriod);
      });

      it('"shoppers" and "others" percentages in summary frame should sum to 100', () => {
        const selectedPeriodShoppers = shoppersVsOthersWidget.getSelectedPeriodShoppers();
        const priorPeriodShoppers = shoppersVsOthersWidget.getPriorPeriodShoppers();
        const priorYearShoppers = shoppersVsOthersWidget.getPriorYearShoppers();
        const selectedPeriodOthers = shoppersVsOthersWidget.getSelectedPeriodOthers();
        const priorPeriodOthers = shoppersVsOthersWidget.getPriorPeriodOthers();
        const priorYearOthers = shoppersVsOthersWidget.getPriorYearOthers();

        selectedPeriodShoppers.then(shoppers => {
          selectedPeriodOthers.then(others => {
            expect(shoppers + others).toEqual(100);
          });
        });

        priorPeriodShoppers.then(shoppers => {
          priorPeriodOthers.then(others => {
            expect(shoppers + others).toEqual(100);
          });
        });

        priorYearShoppers.then(shoppers => {
          priorYearOthers.then(others => {
            expect(shoppers + others).toEqual(100);
          });
        });
      });
    });
  },
  mondayFunctionalTests() {
    describe('(may fail until SA-3274 is resolved)', () => {
      singleMetricLineChart.mondayFunctionalTests(shoppersVsOthersWidget, 'Shoppers vs Others');
    });
  },
  translationsTests(translations, customPd) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('(may fail until SA-3274 is resolved)', () => {
      singleMetricLineChart.translationsTests(translations, shoppersVsOthersWidget, 'Shoppers vs Others', customPd, true);
      it('metric unit label in chart summary frame', () => {
        expect(shoppersVsOthersWidget.getSummaryFrameMetricLabel('shoppers')).toEqual(translations.common.SHOPPERS.toUpperCase());
        expect(shoppersVsOthersWidget.getSummaryFrameMetricLabel('others')).toEqual(translations.common.OTHERS.toUpperCase());
      });

      it('tooltip text', () => {
        expect(shoppersVsOthersWidget.getTooltipTotalText('shoppers')).toEqual(translations.common.SHOPPERS);
        expect(shoppersVsOthersWidget.getTooltipTotalText('others')).toEqual(translations.common.OTHERS);
      });
    });
  }
};
