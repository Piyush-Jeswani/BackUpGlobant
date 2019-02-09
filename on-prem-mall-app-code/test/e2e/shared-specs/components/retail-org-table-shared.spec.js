const retailStoreChartWidget = require('../../pages/components/retail-store-chart-widget');
const since = require('jasmine2-custom-message');

module.exports = {
  // no functional tests yet
  translationsTests(translations) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe('Retail store summary table widget', () => {
      it('widget title', () => {
        expect(retailStoreChartWidget.widgetTitle().getText()).toEqual(translations.kpis.kpiTitle.retail_store_summary);
      });

      it('store category dropdown options', () => {
        expect(retailStoreChartWidget.getStoreCategoryOptions()).toEqual(
          [translations.retailOrganization.ALLSTORES,
            translations.retailOrganization.OUTOFSTOREOPPORTUNITY,
            translations.retailOrganization.HIGHPERFORMERS,
            translations.retailOrganization.INSTOREOPPORUNITY,
            translations.retailOrganization.POORPERFORMERS
          ]
        );
        retailStoreChartWidget.openStoreCategoryDropdown();
      });

      it('metric dropdown options', () => {
        expect(retailStoreChartWidget.getMetricOptions()).toEqual(
          [translations.kpis.kpiTitle.conversion,
            translations.kpis.kpiTitle.sales
          ]
        );
        retailStoreChartWidget.openMetricSelectorDropdown();
      });

      it('default search string', () => {
        expect(retailStoreChartWidget.getSearchBarPlaceholder()).toEqual(translations.retailOrganization.FILTERSITES);
      });

      it('"extreme values" checkbox label', () => {
        expect(retailStoreChartWidget.getExtremeCheckboxLabel()).toEqual(translations.retailOrganization.EXTREMEVALUES);
      });

      it('chart quadrant and axis labels (conversion metric)', () => {
        expect(retailStoreChartWidget.getChartText()).toEqual(
          [translations.retailOrganization.POORPERFORMERS.toUpperCase(),
            translations.retailOrganization.INSTOREOPPORUNITY.toUpperCase(),
            translations.retailOrganization.OUTOFSTOREOPPORTUNITY.toUpperCase(),
            translations.retailOrganization.HIGHPERFORMERS.toUpperCase(),
          ]
        );
        expect(retailStoreChartWidget.getChartAxisTitle()).toEqual(
          [translations.retailOrganization.DAILYTRAFFIC.toUpperCase(),
            translations.kpis.kpiTitle.conversion.toUpperCase()
          ]
        );
      });

      it('chart quadrant and axis labels (sales metric)', () => {
        retailStoreChartWidget.setMetricOption('sales');
        expect(retailStoreChartWidget.getChartText()).toEqual(
          [translations.retailOrganization.POORPERFORMERS.toUpperCase(),
            translations.retailOrganization.INSTOREOPPORUNITY.toUpperCase(),
            translations.retailOrganization.OUTOFSTOREOPPORTUNITY.toUpperCase(),
            translations.retailOrganization.HIGHPERFORMERS.toUpperCase(),
          ]
        );
        expect(retailStoreChartWidget.getChartAxisTitle()).toEqual(
          [translations.retailOrganization.DAILYTRAFFIC.toUpperCase(),
            translations.kpis.kpiTitle.sales.toUpperCase()
          ]
        );
      });

      it('should translate chart tooltip text', () => {
        expect(retailStoreChartWidget.getChartTooltipMetrics()).toEqual(
          [`${translations.kpis.kpiTitle.traffic}:`,
            `${translations.kpis.kpiTitle.sales}:`,
            `${translations.kpis.kpiTitle.conversion}:`,
            `${translations.kpis.kpiTitle.transactions}:`,
            `${translations.kpis.kpiTitle.ats}:`,
            `${translations.kpis.shortKpiTitles.tenant_aur}:`,
            `${translations.kpis.shortKpiTitles.tenant_sps}:`,
            `${translations.kpis.kpiTitle.star}:`,
            `${translations.kpis.shortKpiTitles.tenant_splh}:`
          ]
        );
      });
    });
  }
};
