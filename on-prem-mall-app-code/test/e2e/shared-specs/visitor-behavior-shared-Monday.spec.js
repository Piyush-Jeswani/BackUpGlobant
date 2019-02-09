const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const visitorTrafficWidgetSpec = require('./components/vb-traffic-shared.spec.js');
const visitingFrequencyWidgetSpec = require('./components/pie-chart-with-summary-shared.spec');
const gshWidget = require('../pages/components/gross-shopping-hours-widget.js');
const dwellTimeWidget = require('../pages/components/dwell-time-widget.js');
const opportunityWidget = require('../pages/components/opportunity-widget.js');
const drawRateWidget = require('../pages/components/draw-rate-widget.js');
const shoppersVsOthersWidgetSpec = require('./components/vb-shoppers-vs-others-shared.spec');
const abandonmentRateWidget = require('../pages/components/abandonment-rate-widget.js');


module.exports = {


  visitorBehaviorSharedTestsMonday(timePeriod) {
    describe('Visitor behavior tab (shared tests)', () => {
      it('date picker should appear', () => {
        const datePicker = dateSelector.getDatePicker();

        expect(datePicker.isPresent()).toBe(true);
      });

      it('should have selected the correct date button', () => {
        let dateButton;

        if (timePeriod === 'week') {
          dateButton = dateSelector.getWeekButton();
        } else if (timePeriod === 'month') {
          dateButton = dateSelector.getMonthButton();
        } else if (timePeriod === 'year') {
          dateButton = dateSelector.getYearButton();
        }
        dateButton.then(button => {
          expect(button.getAttribute('class')).toMatch('active');
        });
      });

      describe('"Property overall"-level tests', () => {
        visitorTrafficWidgetSpec.mondayFunctionalTests();
        visitingFrequencyWidgetSpec.mondayFunctionalTests();
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(gshWidget, 'Gross shopping hours');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(dwellTimeWidget, 'Dwell time');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(opportunityWidget, 'Opportunity');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(drawRateWidget, 'Draw rate');
        shoppersVsOthersWidgetSpec.mondayFunctionalTests();
      });

      describe('"Single area"-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToTestArea();
          });
        });

        it('should have selected the correct date button', () => {
          let dateButton;

          if (timePeriod === 'week') {
            dateButton = dateSelector.getWeekButton();
          } else if (timePeriod === 'month') {
            dateButton = dateSelector.getMonthButton();
          } else if (timePeriod === 'year') {
            dateButton = dateSelector.getYearButton();
          }
          dateButton.then(button => {
            expect(button.getAttribute('class')).toMatch('active');
          });
        });
        visitorTrafficWidgetSpec.mondayFunctionalTests();
        visitingFrequencyWidgetSpec.mondayFunctionalTests();
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(gshWidget, 'Gross shopping hours');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(dwellTimeWidget, 'Dwell time');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(opportunityWidget, 'Opportunity');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(drawRateWidget, 'Draw rate');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(abandonmentRateWidget, 'Abandonment rate');
      });
    });
  }
};
