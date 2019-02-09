const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const lineChart = require('../pages/components/common/line-chart-widget.js');
const visitorTrafficWidget = require('../pages/components/visitor-behavior-traffic-widget');
const visitorTrafficWidgetSpec = require('./components/vb-traffic-shared.spec.js');
const visitingFrequencyWidget = require('../pages/components/visiting-frequency-widget');
const visitingFrequencyWidgetSpec = require('./components/pie-chart-with-summary-shared.spec');
const gshWidget = require('../pages/components/gross-shopping-hours-widget.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const dwellTimeWidget = require('../pages/components/dwell-time-widget.js');
const opportunityWidget = require('../pages/components/opportunity-widget.js');
const drawRateWidget = require('../pages/components/draw-rate-widget.js');
const shoppersVsOthersWidgetSpec = require('./components/vb-shoppers-vs-others-shared.spec');
const abandonmentRateWidget = require('../pages/components/abandonment-rate-widget.js');

module.exports = {
  // shared tests for widgets on visitor behavior tab
  visitorBehaviorSharedTests(timePeriod) {
    describe('Visitor behavior tab (shared tests)', () => {
      const dataWindow = lineChart.getSumDataWindow(timePeriod); //  used for line chart widget sum checks

      it('should navigate to the correct site', () => {
        const title = nav.getSingleSiteName();

        expect(title).toEqual(orgData.SSOrg.ssOrgSiteName);
      });

      it('should nav to "Visitor behavior" tab when clicked', () => {
        const tabHeading = sitePage.siteTitle();

        expect(tabHeading.getText()).toMatch('SITE VISITOR BEHAVIOR');
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

      describe('"Property overall"-level tests', () => {
        visitorTrafficWidgetSpec.functionalTests(timePeriod, dataWindow);
        visitingFrequencyWidgetSpec.functionalTests(timePeriod);
        singleMetricLineChartWidgetSpec.functionalTests(gshWidget, 'Gross shopping hours', timePeriod, dataWindow);
        singleMetricLineChartWidgetSpec.functionalTests(dwellTimeWidget, 'Dwell Time', timePeriod, dataWindow, true);
        singleMetricLineChartWidgetSpec.functionalTests(opportunityWidget, 'Opportunity', timePeriod, dataWindow);
        singleMetricLineChartWidgetSpec.functionalTests(drawRateWidget, 'Draw rate', timePeriod, dataWindow, true, true);
        shoppersVsOthersWidgetSpec.functionalTests(timePeriod);
      });

      describe('"Single area"-level tests', () => {
        beforeAll(() => {
          browser.executeScript('window.scrollTo(0,0);').then(() => {
            sitePage.navToTestArea();
          });
        });

        it('should show the correct area name', () => {
          const areaName = sitePage.getAreaName();

          expect(areaName.getText()).toEqual(orgData.SSOrg.testArea);
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

        it('widgets shared with "property-overall" level should appear', () => {
          expect(visitorTrafficWidget.widgetTitle().isDisplayed()).toBe(true);
          expect(visitingFrequencyWidget.widgetTitle().isDisplayed()).toBe(true);
          expect(gshWidget.widgetTitle().isDisplayed()).toBe(true);
          expect(dwellTimeWidget.widgetTitle().isDisplayed()).toBe(true);
          expect(opportunityWidget.widgetTitle().isDisplayed()).toBe(true);
          expect(drawRateWidget.widgetTitle().isDisplayed()).toBe(true);
        });

        visitorTrafficWidgetSpec.functionalTests(timePeriod, dataWindow);
        visitingFrequencyWidgetSpec.functionalTests(timePeriod);
        singleMetricLineChartWidgetSpec.functionalTests(gshWidget, 'Gross shopping hours', timePeriod, dataWindow);
        singleMetricLineChartWidgetSpec.functionalTests(dwellTimeWidget, 'Dwell Time', timePeriod, dataWindow, true);
        singleMetricLineChartWidgetSpec.functionalTests(opportunityWidget, 'Opportunity', timePeriod, dataWindow);
        singleMetricLineChartWidgetSpec.functionalTests(drawRateWidget, 'Draw rate', timePeriod, dataWindow, true, true);
        singleMetricLineChartWidgetSpec.functionalTests(abandonmentRateWidget, 'Abandonment rate', timePeriod, dataWindow, true, true);
      });
    });
  }
};
