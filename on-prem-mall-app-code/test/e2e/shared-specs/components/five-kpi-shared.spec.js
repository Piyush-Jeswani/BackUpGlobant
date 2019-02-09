const fiveKpiWidget = require('../../pages/components/organization-performance-widget.js');
const since = require('jasmine2-custom-message');

module.exports = {
  KPI_TRAFFIC: 'Traffic',
  KPI_SALES: 'Sales',
  KPI_CONVERSION: 'Conversion',
  KPI_ATS: 'ATS',
  KPI_STAR: 'Star',
  functionalTests(timePeriod, kpis, kpiSummaryValues) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('5-kpi site performance widget', () => {
      it('should display the title "Site performance"', () => {
        const widgetTitle = fiveKpiWidget.widgetTitle();
        expect(widgetTitle.getText()).toEqual('Site performance');
      });

      kpis.forEach(metric => {
        const metricKey = metric.toLowerCase(); // used for pushing values to kpiSummaryValues

        it(`should show the same ${metric} data as the metric line chart widget`, () => {
          const selectedPeriod = fiveKpiWidget.getSelectedPeriodValue(metric);
          const priorPeriod = fiveKpiWidget.getPriorPeriodValue(metric);
          const priorPeriodDelta = fiveKpiWidget.getPriorPeriodDelta(metric);

          expect(selectedPeriod).toEqual(kpiSummaryValues[metricKey].selectedPeriod);
          expect(priorPeriod).toEqual(kpiSummaryValues[metricKey].priorPeriod);
          expect(priorPeriodDelta).toEqual(kpiSummaryValues[metricKey].priorPeriodDelta);

          if (timePeriod !== 'year') {
            const priorYear = fiveKpiWidget.getPriorYearValue(metric);
            const priorYearDelta = fiveKpiWidget.getPriorYearDelta(metric);

            expect(priorYear).toEqual(kpiSummaryValues[metricKey].priorYear);
            expect(priorYearDelta).toEqual(kpiSummaryValues[metricKey].priorYearDelta);
          }
        });
      });
    });
  },
  translationsTests(translations) {// todo: add Monday/custom pd translation tests for this and other refactored shared widgets
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Organization performance widget', () => {
      it('widget title', () => {
        expect(fiveKpiWidget.widgetTitle().getText()).toEqual(translations.summaryKpiWidget.ORGPERFORMANCE);
      });

      it('KPI titles', () => {
        fiveKpiWidget.getKpiLabels().then((text) => {
          expect(text).toEqual(
            [translations.kpis.shortKpiTitles.tenant_sales.toUpperCase(),
              translations.kpis.shortKpiTitles.tenant_traffic.toUpperCase(),
              translations.kpis.shortKpiTitles.tenant_conversion.toUpperCase(),
              translations.kpis.kpiTitle.ats.toUpperCase(),
              translations.kpis.shortKpiTitles.tenant_star.toUpperCase()
            ]);
        })
      });

      it('KPI total titles', () => {
        expect(fiveKpiWidget.getKpiTotalLabels()).toEqual(
          [translations.kpis.totalLabel.sales.toUpperCase(),
            translations.kpis.totalLabel.traffic.toUpperCase(),
            translations.kpis.totalLabel.conversion.toUpperCase(),
            translations.kpis.totalLabel.ats.toUpperCase(),
            translations.kpis.totalLabel.star.toUpperCase()
          ]);
      });

      it('compare period 2 label', () => {
        expect(fiveKpiWidget.getKpiVarianceLabels()).toEqual(
          [translations.common.FROMPRIORYEAR.toUpperCase(),
            translations.common.FROMPRIORYEAR.toUpperCase(),
            translations.common.FROMPRIORYEAR.toUpperCase(),
            translations.common.FROMPRIORYEAR.toUpperCase(),
            translations.common.FROMPRIORYEAR.toUpperCase()
          ]);
      });

      describe('upper tooltip text', () => {
        it('compare period labels', () => {
          expect(fiveKpiWidget.getTooltipCompareLabel('sales', 'upper')).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('traffic', 'upper')).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('conversion', 'upper')).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('ats', 'upper')).toEqual(translations.common.PRIORPERIOD.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('star', 'upper')).toEqual(translations.common.PRIORPERIOD.toUpperCase());
        });

        it('KPI total titles', () => {
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('sales', 'upper')).toEqual(translations.kpis.totalLabel.sales.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('traffic', 'upper')).toEqual(translations.kpis.totalLabel.traffic.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('conversion', 'upper')).toEqual(translations.kpis.totalLabel.conversion.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('ats', 'upper')).toEqual(translations.kpis.totalLabel.ats.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('star', 'upper')).toEqual(translations.kpis.totalLabel.star.toUpperCase());
        });
      });

      describe('lower tooltip text', () => {
        it('compare period labels', () => {
          expect(fiveKpiWidget.getTooltipCompareLabel('sales', 'lower')).toEqual(translations.common.PRIORYEAR.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('traffic', 'lower')).toEqual(translations.common.PRIORYEAR.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('conversion', 'lower')).toEqual(translations.common.PRIORYEAR.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('ats', 'lower')).toEqual(translations.common.PRIORYEAR.toUpperCase());
          expect(fiveKpiWidget.getTooltipCompareLabel('star', 'lower')).toEqual(translations.common.PRIORYEAR.toUpperCase());
        });

        it('KPI total titles', () => {
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('sales', 'lower')).toEqual(translations.kpis.totalLabel.sales.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('traffic', 'lower')).toEqual(translations.kpis.totalLabel.traffic.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('conversion', 'lower')).toEqual(translations.kpis.totalLabel.conversion.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('ats', 'lower')).toEqual(translations.kpis.totalLabel.ats.toUpperCase());
          expect(fiveKpiWidget.getTooltipKpiTotalLabel('star', 'lower')).toEqual(translations.kpis.totalLabel.star.toUpperCase());
        });
      });
    });
  },
};
