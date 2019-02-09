const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyPerformanceWidgetSpec = require('./components/daily-performance-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec');

module.exports = {

  retailOrgSummarySharedTests(timePeriod) {
    describe('Retail org summary (shared tests)', () => {

      // retail org RT001
      it('should navigate to the correct org', () => {
        const title = nav.getOrgName();

        expect(title).toEqual(orgData.MSRetailOrg.name);
      });

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

      const powerHoursMetrics = [
        powerHoursWidgetSpec.KPI_TRAFFIC,
        powerHoursWidgetSpec.KPI_TRAFFICPCT,
        powerHoursWidgetSpec.KPI_SALES,
        powerHoursWidgetSpec.KPI_CONVERSION,
        powerHoursWidgetSpec.KPI_ATS,
        powerHoursWidgetSpec.KPI_STAR
      ];
      // retail org RT018
      powerHoursWidgetSpec.functionalTests(orgData.MSRetailSite, powerHoursMetrics, true);

      dailyPerformanceWidgetSpec.functionalTests();

      // retail org RT013
      dailyAverageBarWidgetSpec.functionalTests(
        [dailyAverageBarWidgetSpec.KPI_TRAFFIC,
          dailyAverageBarWidgetSpec.KPI_SALES,
          dailyAverageBarWidgetSpec.KPI_CONVERSION,
          dailyAverageBarWidgetSpec.KPI_ATS,
          dailyAverageBarWidgetSpec.KPI_STAR],
        [dailyAverageBarWidgetSpec.COLUMN_HEADER_SALES_DELTA,
          dailyAverageBarWidgetSpec.KPI_SALES,
          dailyAverageBarWidgetSpec.KPI_TRAFFIC,
          dailyAverageBarWidgetSpec.COLUMN_HEADER_TRAFFIC_DELTA,
          dailyAverageBarWidgetSpec.KPI_CONVERSION,
          dailyAverageBarWidgetSpec.KPI_ATS,
          dailyAverageBarWidgetSpec.COLUMN_HEADER_ATS_DELTA,
          dailyAverageBarWidgetSpec.KPI_STAR,
          dailyAverageBarWidgetSpec.COLUMN_HEADER_DAY]
      );
    });
  }
};
