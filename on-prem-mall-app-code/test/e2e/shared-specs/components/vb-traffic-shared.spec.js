const singleMetricLineChart = require('./single-metric-line-chart-shared.spec');
const visitorTrafficWidget = require('../../pages/components/visitor-behavior-traffic-widget');
const since = require('jasmine2-custom-message');

module.exports = {

  functionalTests(timePeriod, sumDataWindow) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    singleMetricLineChart.functionalTests(visitorTrafficWidget, 'Visitor behavior traffic', timePeriod, sumDataWindow);
    it('"unique" and "returning" data in summary frame should sum to "overall visitors" total', () => {
      const uniqueTraffic = visitorTrafficWidget.getUniqueVisitors();
      const returningTraffic = visitorTrafficWidget.getReturningVisitors();
      const selectedPeriodVisitors = visitorTrafficWidget.getSelectedPeriodOverall();

      protractor.promise.all([uniqueTraffic, returningTraffic, selectedPeriodVisitors]).then(promiseArray => {
        const unique = promiseArray[0];
        const returning = promiseArray[1];
        const visitors = promiseArray[2];

        expect(unique + returning).not.toBeLessThan(visitors - 1);
        expect(unique + returning).not.toBeGreaterThan(visitors + 1);
      });
    });
  },
  mondayFunctionalTests() {
    singleMetricLineChart.mondayFunctionalTests(visitorTrafficWidget, 'Visitor behavior traffic');
  },
  translationsTests(translations, customPd) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    singleMetricLineChart.translationsTests(translations, visitorTrafficWidget, 'Visitor behavior traffic', customPd, true);
    it('metric unit label in chart summary frame', () => {
      expect(visitorTrafficWidget.getSummaryFrameMetricLabel()).toEqual(translations.kpis.totalLabel.visitor_behaviour_traffic.toUpperCase());
      expect(visitorTrafficWidget.getSummaryFrameMetricLabel('unique')).toEqual(translations.lineChartWidget.UNIQUE.toUpperCase());
      expect(visitorTrafficWidget.getSummaryFrameMetricLabel('returning')).toEqual(translations.lineChartWidget.RETURNING.toUpperCase());
    });

    it('tooltip text', () => {
      const tooltipTotalText = visitorTrafficWidget.getTooltipTotalText('total');
      tooltipTotalText.then(textArray => {
        expect(textArray[0]).toEqual(translations.lineChartWidget.TOTAL);
      });
      const tooltipUniqueText = visitorTrafficWidget.getTooltipTotalText('unique');
      tooltipUniqueText.then(textArray => {
        expect(textArray[0]).toEqual(translations.lineChartWidget.UNIQUE);
      });
      const tooltipReturningText = visitorTrafficWidget.getTooltipTotalText('returning');
      tooltipReturningText.then(textArray => {
        expect(textArray[0]).toEqual(translations.lineChartWidget.RETURNING);
      });
    });
  }
};
