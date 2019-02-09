const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const singleMetricLineChartWidgetSpec = require('./components/single-metric-line-chart-shared.spec.js');
const zoneSalesWidget = require('../pages/components/zone-sales-widget.js');
const zoneConversionWidget = require('../pages/components/zone-conversion-widget.js');
const averagePurchaseWidget = require('../pages/components/average-purchase-widget.js');
const zoneUPTWidget = require('../pages/components/zone-units-per-transaction-widget.js');

module.exports = {

  salesAndConversionSharedTestsMonday(timePeriod) {
    describe('Sales and Conversion tab (shared tests)', () => {
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
        // no additional tenant table widget checks for Monday-based calendar
      });

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

        singleMetricLineChartWidgetSpec.mondayFunctionalTests(zoneSalesWidget, 'Sales');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(zoneConversionWidget, 'Conversion');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(averagePurchaseWidget, 'ATS');
        singleMetricLineChartWidgetSpec.mondayFunctionalTests(zoneUPTWidget, 'UPT');
      });
    });
  }
};

