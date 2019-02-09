
const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const lineChart = require('../pages/components/common/line-high-chart-widget.js');
const multiMetricLineChartWidgetSpec = require('./components/multi-metric-line-chart-shared.spec.js');
const fiveKpiWidgetSpec = require('./components/five-kpi-shared.spec.js');
const dailyPerformanceWidgetSpec = require('./components/daily-performance-shared.spec.js');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec');

module.exports = {

  retailTrafficSharedTests(timePeriod) {
    describe('Retail traffic tab (shared tests)', () => {
      const dataWindow = lineChart.getSumDataWindow(timePeriod); // used for line chart widget sum checks

      it('should navigate to the correct site', () => {
        const title = nav.getSiteName();
        expect(title).toEqual(orgData.MSRetailSite.testSiteName);
      });

      // retail org RT0191
      it('should nav to "Traffic" tab when clicked', () => {
        const tabHeading = sitePage.siteTitle();
        expect(tabHeading.getText()).toEqual('SITE TRAFFIC');
      });

      it('date picker should appear', () => {
        const datePicker = dateSelector.getDatePicker();
        expect(datePicker.isPresent()).toBe(true);
      });

      // retail org RT0191
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

      // multiMetricLineChartWidgetSpec.functionalTests returns object containing summary values for each metric
      // harvested from the line chart. Used for verifying data in 5-kpi widget.
      const kpiSummaryValues = multiMetricLineChartWidgetSpec.functionalTests(timePeriod, dataWindow, [
        'Traffic',
        'Sales',
        'Conversion',
        'ATS',
        'STAR'
      ]);

      fiveKpiWidgetSpec.functionalTests(timePeriod, [
        fiveKpiWidgetSpec.KPI_TRAFFIC,
        fiveKpiWidgetSpec.KPI_SALES,
        fiveKpiWidgetSpec.KPI_CONVERSION,
        fiveKpiWidgetSpec.KPI_ATS,
        fiveKpiWidgetSpec.KPI_STAR
      ], kpiSummaryValues);

      // retail org RT026
      powerHoursWidgetSpec.functionalTests(orgData.MSRetailSite, [
        powerHoursWidgetSpec.KPI_TRAFFIC,
        powerHoursWidgetSpec.KPI_TRAFFICPCT,
        powerHoursWidgetSpec.KPI_SALES,
        powerHoursWidgetSpec.KPI_CONVERSION,
        powerHoursWidgetSpec.KPI_ATS,
        powerHoursWidgetSpec.KPI_STAR
      ]);

      // retail org RT028
      dailyPerformanceWidgetSpec.functionalTests();

      // retail org RT027
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

