'use strict';
const sitePage = require('../pages/site-summary-page.js');
const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const heatmapWidgetSpec = require('./components/heatmap-widget-shared.spec');
const trafficHeatmapWidget = require('../pages/components/traffic-heatmap-widget.js');
const firstVisitsHeatmapWidget = require('../pages/components/first-visits-heatmap-widget.js');
const oneAndDoneHeatmapWidget = require('../pages/components/one-done-heatmap-widget.js');
const correlationHeatmapWidget = require('../pages/components/correlation-heatmap-widget.js');
const visitsAfterHeatmapWidget = require('../pages/components/visits-after-heatmap-widget.js');
const visitsBeforeHeatmapWidget = require('../pages/components/visits-before-heatmap-widget.js');

module.exports = {
  usageOfAreasSharedTests(timePeriod) {
    describe('Usage of Areas tab (shared tests)', () => {
      it('should navigate to the correct site', () => {
        const title = nav.getSingleSiteName();

        expect(title).toEqual(orgData.SSOrg.ssOrgSiteName);
      });

      it('should nav to "Site Usage of areas" tab when clicked', () => {
        const tabHeading = sitePage.siteTitle();

        expect(tabHeading.getText()).toMatch('SITE USAGE OF AREAS');
      });

      it('date picker should appear', () => {
        const datePicker = dateSelector.getDatePicker();

        expect(datePicker.isPresent()).toBe(true);
      });

      it('area-type filter buttons should appear', () => {
        const filterButtons = sitePage.areaTypeFilterButtons;

        filterButtons.forEach(button => {
          expect(sitePage.getAreaTypeFilter(button).isPresent()).toBe(true);
        });
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

        it('"page title should show the correct location" area name', () => {
          const areaName = sitePage.getAreaName();

          expect(areaName.getText()).toEqual(orgData.SSOrg.ssOrgSiteName);
        });
        heatmapWidgetSpec.functionalTests(trafficHeatmapWidget, 'Traffic distribution');
        heatmapWidgetSpec.functionalTests(firstVisitsHeatmapWidget, 'First locations to visit');
        heatmapWidgetSpec.functionalTests(oneAndDoneHeatmapWidget, 'One and done');
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
        heatmapWidgetSpec.functionalTests(correlationHeatmapWidget, 'Correlation heat map', true);
        heatmapWidgetSpec.functionalTests(visitsAfterHeatmapWidget, 'Locations visited after', true);
        heatmapWidgetSpec.functionalTests(visitsBeforeHeatmapWidget, 'Locations visited before', true);
      });
    });
  }
};
