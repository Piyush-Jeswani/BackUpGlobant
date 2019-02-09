
const dateSelector = require('../pages/components/time-period-picker.js');
const multiMetricLineChartWidgetSpec = require('./components/multi-metric-line-chart-shared.spec.js');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec.js');

module.exports = {

  trafficSharedTestsMonday(timePeriod) {
    describe('Traffic tab (shared tests)', () => {
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

      multiMetricLineChartWidgetSpec.mondayFunctionalTests();
      powerHoursWidgetSpec.mondayFunctionalTests();
      dailyAverageBarWidgetSpec.mondayFunctionalTests();
    });
  }
};

