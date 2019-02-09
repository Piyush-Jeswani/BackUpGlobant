const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const singleKpiTableWidgetSpec = require('./components/single-kpi-table-widget-shared.spec');
const entranceSummaryWidget = require('../pages/components/entrance-summary-widget.js');
const tenantSummaryWidget = require('../pages/components/tenant-traffic-summary-widget.js');
const entranceContributionWidgetSpec = require('./components/pie-chart-with-legend-shared.spec');
const commonAreasSummaryWidget = require('../pages/components/common-areas-summary-widget.js');
const powerHoursWidgetSpec = require('./components/power-hours-shared.spec.js');
const dailyAverageBarWidgetSpec = require('./components/daily-average-bar-chart-shared.spec.js');
const multiMetricLineChartWidgetSpec = require('./components/multi-metric-line-chart-shared.spec.js');
const lineChart = require('../pages/components/common/line-high-chart-widget.js');

module.exports = {


  trafficSharedTests(timePeriod) {
    describe('Traffic tab (shared tests)', () => {
      const dataWindow = lineChart.getSumDataWindow(timePeriod); // used for line chart widget sum checks

      it('should navigate to the correct site', () => {
        const title = nav.getSiteName();

        expect(title).toEqual(orgData.MSOrgSite.name);
      });
// mall org RT220
      it('should nav to "Site Traffic" tab when clicked', () => {
        const tabHeading = sitePage.siteTitle();

        expect(tabHeading.getText()).toEqual('SITE TRAFFIC');
      });

      it('date picker should appear', () => {
        const datePicker = dateSelector.getDatePicker();

        expect(datePicker.isPresent()).toBe(true);
      });

      describe('"Property overall"-level tests', () => {
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

        // mall org RT220
        // shared tests for the site-level traffic line chart
        multiMetricLineChartWidgetSpec.functionalTests(timePeriod, dataWindow, [
          'Traffic',
          'Sales',
          'Conversion',
          'ATS'
        ]);
        // mall org RT220
        singleKpiTableWidgetSpec.functionalTests(entranceSummaryWidget, 'Entrance summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, singleKpiTableWidgetSpec.ENTRANCE_FILTER);
        // mall org RT220
        entranceContributionWidgetSpec.functionalTests();
        // mall org RT220
        powerHoursWidgetSpec.functionalTests(orgData.MSOrgSite, [
          powerHoursWidgetSpec.KPI_TRAFFIC,
          powerHoursWidgetSpec.KPI_TRAFFICPCT
        ]);
        // mall org RT220
        dailyAverageBarWidgetSpec.functionalTests(
          [dailyAverageBarWidgetSpec.KPI_TRAFFIC],
          [dailyAverageBarWidgetSpec.COLUMN_HEADER_TRAFFIC_DELTA,
            dailyAverageBarWidgetSpec.KPI_TRAFFIC,
            dailyAverageBarWidgetSpec.COLUMN_HEADER_DAY]
        );
        // mall org RT220
        singleKpiTableWidgetSpec.functionalTests(tenantSummaryWidget, 'Tenant summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, singleKpiTableWidgetSpec.TENANT_FILTER);
        singleKpiTableWidgetSpec.functionalTests(commonAreasSummaryWidget, 'Common areas summary', singleKpiTableWidgetSpec.KPI_TRAFFIC, singleKpiTableWidgetSpec.COMMON_AREAS_FILTER);
      });

      // mall org RT238
      // mall org RT239
      describe('Zone-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToZone();
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

        it('should show the correct area name', () => {
          const areaName = sitePage.getAreaName();

          expect(areaName.getText()).toMatch(orgData.MSOrgSite.testZone);
        });

        describe('Tenant zone-level power hours widget', () => {
          powerHoursWidgetSpec.functionalTests(orgData.MSOrgSite, [
            powerHoursWidgetSpec.KPI_TRAFFIC,
            powerHoursWidgetSpec.KPI_TRAFFICPCT,
            powerHoursWidgetSpec.KPI_SALES,
            powerHoursWidgetSpec.KPI_CONVERSION,
            powerHoursWidgetSpec.KPI_ATS
          ]);
        });
      });
    });
  }
};
