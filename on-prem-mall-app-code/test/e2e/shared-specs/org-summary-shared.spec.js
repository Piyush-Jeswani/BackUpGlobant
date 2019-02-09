const orgData = require('../data/orgs.js');
const orgPage = require('../pages/org-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const organizationSummaryWidgetSpec = require('./components/multi-kpi-mall-table-widget-shared.spec');
const sitePerformanceWidgetSpec = require('./components/site-performance-bar-chart-shared.spec');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec');

module.exports = {
  orgSummarySharedTests(timePeriod) {
    describe('Org navigation (shared tests)', () => {
      describe('Multi-site org', () => {
        // mall org RT201
        it('should navigate to an org and display the correct org name', () => {
          const title = orgPage.orgTitle();

          expect(title.getText()).toEqual(orgData.MSOrg.name);
          expect(browser.getCurrentUrl()).toMatch(orgData.MSOrg.id.toString());
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

// mall org RT201
        it('should show all 3 org summary widgets on org summary page', () => {
          const orgSummaryWidget = orgPage.orgSummaryWidget();
          const sitePerformanceWidget = orgPage.sitePerformanceWidget();
          const orgTrafficWeekdayDistWidget = orgPage.trafficWeekdayDistWidget();

          expect(orgSummaryWidget.isPresent()).toBe(true);
          expect(sitePerformanceWidget.isPresent()).toBe(true);
          expect(orgTrafficWeekdayDistWidget.isPresent()).toBe(true);
        });
        // mall org RT201
        organizationSummaryWidgetSpec.functionalTests();

        // mall org RT201
        sitePerformanceWidgetSpec.functionalTests(timePeriod);

        // mall org RT201
        dailyAverageBarWidgetSpec.functionalTests(
          [dailyAverageBarWidgetSpec.KPI_TRAFFIC],
          [dailyAverageBarWidgetSpec.COLUMN_HEADER_TRAFFIC_DELTA,
            dailyAverageBarWidgetSpec.KPI_TRAFFIC,
            dailyAverageBarWidgetSpec.COLUMN_HEADER_DAY]
        );
      });
    });
  }
};
