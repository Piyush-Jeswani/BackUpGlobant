const visitingFrequencyWidget = require('../../pages/components/visiting-frequency-widget');
const dateSelector = require('../../pages/components/time-period-picker.js');
const userData = require('../../data/users.js');
const since = require('jasmine2-custom-message');

module.exports = {
  functionalTests(timePeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Visiting frequency widget', () => {
      it('should display the title "Visiting frequency"', () => {
        const widgetTitle = visitingFrequencyWidget.widgetTitle();

        expect(widgetTitle.getText()).toEqual('Visiting frequency');
      });

      it('(may fail until SA-3325 is resolved) correct date range should appear in summary frame', () => {
        const reportPeriod = dateSelector.getReportingPeriod(userData.superUser.dateFormat);
        const priorReportPeriod = dateSelector.getPriorReportingPeriod(userData.superUser.dateFormat);
        const priorYearReportingPeriod = dateSelector.getPriorYearReportingPeriod(timePeriod, userData.superUser.dateFormat);
        const selectedPeriodDate = visitingFrequencyWidget.getSelectedPeriodDateRange(userData.superUser.dateFormat);
        const priorPeriodDate = visitingFrequencyWidget.getPriorPeriodDateRange(userData.superUser.dateFormat);
        const priorYearDate = visitingFrequencyWidget.getPriorYearDateRange(userData.superUser.dateFormat);

        expect(selectedPeriodDate).toEqual(reportPeriod);
        expect(priorPeriodDate).toEqual(priorReportPeriod);
        expect(priorYearDate).toEqual(priorYearReportingPeriod);
      });

      it('percentages around pie chart should sum to 100', () => {
        const percents = visitingFrequencyWidget.getPiePercentSum();
        browser.sleep(10000);
        expect(percents).toEqual(100);
      });
    });
  },
  mondayFunctionalTests() {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    it('correct date range should appear in summary frame', () => {
      const selectedPeriodDate = visitingFrequencyWidget.getSelectedPeriodDateRange(userData.mondayUser.dateFormat);
      const priorPeriodDate = visitingFrequencyWidget.getPriorPeriodDateRange(userData.mondayUser.dateFormat);
      const priorPeriod2Date = visitingFrequencyWidget.getPriorYearDateRange(userData.mondayUser.dateFormat);
      const reportPeriod = dateSelector.getReportingPeriod(userData.mondayUser.dateFormat);
      const comparePeriod1 = dateSelector.getComparePeriod(userData.mondayUser.comparePd1WeeksBack, userData.mondayUser.dateFormat);
      const comparePeriod2 = dateSelector.getComparePeriod(userData.mondayUser.comparePd2WeeksBack, userData.mondayUser.dateFormat);

      expect(selectedPeriodDate).toEqual(reportPeriod);
      expect(priorPeriodDate).toEqual(comparePeriod1);
      expect(priorPeriod2Date).toEqual(comparePeriod2);
    });
  },
  translationsTests(translations, customPeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Visiting frequency widget', () => {
      it('widget title', () => {
        expect(visitingFrequencyWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.visiting_frequency);
      });

      it('frequency text in chart legend', () => {
        const legendArray = visitingFrequencyWidget.getPieChartLegendText();

        // # of legend text entries is constiable for this widget.  1st and last entries in legend should pass checks below:
        legendArray.then(legendText => {
          expect(legendText[0]).toEqual(translations.visitingFrequencyDetailWidget.ONEVISIT);
          expect(legendText[legendText.length - 1]).toContain(translations.visitingFrequencyDetailWidget.ORMOREVISITS);

          // checks for translations in "middle" legend entries
          if (legendText.length > 2) {
            for (let i = 1; i < legendText.length - 1; i += 1) {
              expect(legendText[i]).toContain(translations.visitingFrequencyDetailWidget.VISITS);
            }
          }
        });
      });

      it('date range titles in chart summary frame', () => {
        const selectedPeriodLabel = visitingFrequencyWidget.getSummaryFrameSelectedPeriodLabel();
        const priorPeriodLabel = visitingFrequencyWidget.getSummaryFrameCompare1Label();
        const priorYearLabel = visitingFrequencyWidget.getSummaryFrameCompare2Label();

        if (customPeriod) {
          expect(selectedPeriodLabel).toEqual(translations.common.SELECTEDPERIOD);
          expect(priorPeriodLabel).toEqual(translations.common.CUSTOMCOMPARE1.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.CUSTOMCOMPARE2.toUpperCase());
        } else {
          expect(selectedPeriodLabel).toEqual(translations.common.SELECTEDPERIOD);
          expect(priorPeriodLabel).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(priorYearLabel).toEqual(translations.common.PRIORYEAR.toUpperCase());
        }
      });

      it('metric unit label in chart summary frame', () => {
        expect(visitingFrequencyWidget.getSummaryFrameMetricLabel()).toEqual(translations.kpis.totalLabel.visiting_frequency.toUpperCase());
      });
    });
  }
};

