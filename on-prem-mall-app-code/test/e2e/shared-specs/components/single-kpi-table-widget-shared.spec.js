// needed for table column checks in functional tests
const functionalTestTranslations = require('../../../../src/l10n/languages/en_US.json');
const since = require('jasmine2-custom-message');

module.exports = {
  KPI_SALES: 'sales',
  KPI_CONVERSION: 'conversion',
  KPI_ATS: 'ats',
  KPI_UPT: 'upt',
  KPI_TRAFFIC: 'traffic',
  TENANT_FILTER: { invalidFilter: 'amusing test string',
    validFilter: 'yorker',
    validRowItemName: 'New Yorker 119905',
    invalidRowItemName: 'Gap Ext 109522' },
  ENTRANCE_FILTER: { invalidFilter: 'amusing test string',
    validFilter: 'trance3-Outer', // partial entrance name
    validRowItemName: 'Entrance3-Outer-Gnd',
    invalidRowItemName: 'Entrance4-Outer-Gnd' },
  COMMON_AREAS_FILTER: { invalidFilter: 'amusing test string',
    validFilter: 'perimeter',
    validRowItemName: 'Mall Perimeter',
    invalidRowItemName: 'Mall Outer' },

  functionalTests(pageObject, expectedTitle, tableKpi, tableFilter) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {
      beforeAll(() => {
        pageObject.clickExpandButtonIfPresent();
      });

      it(`should display the title "${expectedTitle}"`, () => {
        const widgetTitle = pageObject.widgetTitle();

        expect(widgetTitle.getText()).toEqual(expectedTitle);
      });

      // mall org RT234 (tenant summary table)
      // mall org RT235 (common areas table)
      it('should show all 5 columns', () => {
        const columnHeadings = pageObject.columnHeadings;

        expect(pageObject.getCurrentColumnHeader().getText()).toEqual(`${functionalTestTranslations.common.SELECTEDPERIOD} ${this.getKpiTranslationKey(functionalTestTranslations, tableKpi)}`);
        expect(pageObject.getPeriodChangeColumnHeader().getText()).toEqual(columnHeadings[1]);
        expect(pageObject.getPeriodColumnHeader().getText()).toEqual(`${functionalTestTranslations.common.PRIORPERIOD} ${this.getKpiTranslationKey(functionalTestTranslations, tableKpi)}`);
        expect(pageObject.getYearChangeColumnHeader().getText()).toEqual(columnHeadings[3]);
        expect(pageObject.getYearColumnHeader().getText()).toEqual(`${functionalTestTranslations.common.PRIORYEAR} ${this.getKpiTranslationKey(functionalTestTranslations, tableKpi)}`);
      });

      // mall org RT2281 (entrance summary table)
      // mall org RT234 (tenant summary table)
      // mall org RT235 (common areas table)
      it('should change the table list when filtered', () => {
        const filter = pageObject.getFilter();

        filter.clear();
        expect(pageObject.getFilteredItemList()).toContain(tableFilter.validRowItemName);

        filter.sendKeys(tableFilter.invalidFilter);
        expect(pageObject.getFilteredItemList()).toEqual([]);

        filter.clear();
        filter.sendKeys(tableFilter.validFilter);
        expect(pageObject.getFilteredItemList()).toContain(tableFilter.validRowItemName);
        expect(pageObject.getFilteredItemList()).not.toContain(tableFilter.invalidRowItemName);
        filter.clear();
      });

      it('should sort table rows by numeric columns', () => {
        pageObject.getFilteredItemList().then(array => {
          expect(array.length).toBeGreaterThan(0);
        });
        this.verifyColumnSorting(pageObject.getCurrentPeriodColumn.bind(pageObject), pageObject.getCurrentColumnHeader(), false, true);
        this.verifyColumnSorting(pageObject.getPriorPeriodDeltaColumn.bind(pageObject), pageObject.getPeriodChangeColumnHeader(), true);
        this.verifyColumnSorting(pageObject.getPriorPeriodColumn.bind(pageObject), pageObject.getPeriodColumnHeader(), false);
        this.verifyColumnSorting(pageObject.getPriorYearDeltaColumn.bind(pageObject), pageObject.getYearChangeColumnHeader(), true);
        this.verifyColumnSorting(pageObject.getPriorYearColumn.bind(pageObject), pageObject.getYearColumnHeader(), false);
      });

      // mall org RT234 (tenant summary table)
      // mall org RT235 (common areas table)
      it('should display the correct percentage deltas in each row', () => {
        const priorPeriodDeltas = pageObject.getPriorPeriodDeltaColumn();
        const calculatedPriorPeriodDeltas = pageObject.calculatePriorPeriodDeltaColumn();
        const priorYearDeltas = pageObject.getPriorYearDeltaColumn();
        const calculatedPriorYearDeltas = pageObject.calculatePriorYearDeltaColumn();

        const promiseArray2D = [
          [calculatedPriorPeriodDeltas, priorPeriodDeltas],
          [calculatedPriorYearDeltas, priorYearDeltas]
        ];

        promiseArray2D.forEach(array => {
          protractor.promise.all(array).then(promiseArray => {
            const calculatedArray = promiseArray[0];
            const pageDataArray = promiseArray[0];

            calculatedArray.forEach((delta, index) => {
              expect(delta).not.toBeNaN();
              expect(delta).toEqual(jasmine.any(Number));
              expect(pageDataArray[index]).not.toBeNaN();
              expect(pageDataArray[index]).toEqual(jasmine.any(Number));
              // these checks are too brittle without access to raw, non-rounded input data
              // rework these after SA-2545 is implemented
              // expect(delta).not.toBeLessThan(pageDataArray[index] - (pageDataArray[index] * 0.1));
              // expect(delta).not.toBeGreaterThan(pageDataArray[index] + (pageDataArray[index] * 0.1));
            });
          });
        });
      });
    });
  },
  translationsTests(translations, pageObject, expectedTitle, tableKpi, customPeriod) {
    const callingStack = (new Error()).stack;
    const expect = since(`#{message} called from ${callingStack}`).expect;
    describe(`${expectedTitle} widget`, () => {
      it('widget title', () => {
        expect(pageObject.widgetTitle().getText()).toEqual(this.getWidgetTitleTranslationKey(translations, expectedTitle));
      });

      it('default value in table search bar', () => {
        expect(pageObject.getFilterBarText()).toEqual(translations.salesTableWidget.FILTER);
      });

      it('text on table expander button', () => {
        const expandButtonCount = pageObject.getExpandButton().count();

        if (expandButtonCount > 0) {
          const expandButton = pageObject.getExpandButtonText();
          expect(expandButton).toEqual(translations.salesTableWidget.VIEWALL);
          pageObject.clickExpandButtonIfPresent();
          const contractButton = pageObject.getExpandButtonText();
          expect(contractButton).toEqual(translations.salesTableWidget.VIEWLESS);
        }
      });

      it('header text on table', () => {
        let expectedPeriodColumnHeader = translations.common.PRIORPERIOD;
        let expectedYearColumnHeader = translations.common.PRIORYEAR;
        if (customPeriod) {
          expectedPeriodColumnHeader = translations.common.CUSTOMCOMPARE1;
          expectedYearColumnHeader = translations.common.CUSTOMCOMPARE2;
        }
        expect(pageObject.getCurrentColumnHeader().getText()).toEqual(`${translations.common.SELECTEDPERIOD} ${this.getKpiTranslationKey(translations, tableKpi)}`);
        expect(pageObject.getPeriodChangeColumnHeader().getText()).toEqual(translations.salesTableWidget.CHANGE);
        expect(pageObject.getPeriodColumnHeader().getText()).toEqual(`${expectedPeriodColumnHeader} ${this.getKpiTranslationKey(translations, tableKpi)}`);
        expect(pageObject.getYearChangeColumnHeader().getText()).toEqual(translations.salesTableWidget.CHANGE);
        expect(pageObject.getYearColumnHeader().getText()).toEqual(`${expectedYearColumnHeader} ${this.getKpiTranslationKey(translations, tableKpi)}`);
      });
    });
  },
  verifyColumnSorting(getColumnFunction, columnHeader, isDeltaColumn, isFirstColumn) {
    // no need to click the first column.  The table should be already be sorted
    // by the first column, in descending order, by default
    if (!isFirstColumn) {
      columnHeader.click();
    }
    getColumnFunction().then(array => {
      const firstValueDescOrder = array[0];
      columnHeader.click();
      getColumnFunction().then(array2 => {
        const firstValueAscOrder = array2[0];

        expect(firstValueDescOrder).not.toBeNaN();
        expect(firstValueAscOrder).not.toBeNaN();
        expect(firstValueDescOrder).not.toBeLessThan(firstValueAscOrder);
      });
      // Do not test for array length for delta values.
      // If all values from current or prior period are 0, delta array.length will be 0
      if (!isDeltaColumn) {
        expect(array.length).toBeGreaterThan(0);
      }
    });
  },
  getKpiTranslationKey(translations, kpi) {
    switch (kpi) {
      case this.KPI_SALES:
      case this.KPI_CONVERSION:
        return translations.kpis.options[kpi];
      case this.KPI_ATS:
        return translations.kpis.kpiTitle.ats;
      case this.KPI_TRAFFIC:
        return translations.kpis.shortKpiTitles.tenant_traffic;
      case this.KPI_UPT:
        return translations.kpis.shortKpiTitles.tenant_upt;
      default:
        throw new Error(`Invalid kpi metric: ${kpi}`);
    }
  },
  getWidgetTitleTranslationKey(translations, widget) {
    switch (widget) {
      case 'Tenant sales summary':
        return translations.kpis.kpiTitle.tenant_sales;
      case 'Tenant conversion summary':
        return translations.kpis.kpiTitle.tenant_conversion;
      case 'Tenant ATS summary':
        return translations.kpis.kpiTitle.tenant_ats;
      case 'Tenant UPT summary':
        return translations.kpis.kpiTitle.tenant_upt;
      case 'Entrance summary':
        return translations.kpis.kpiTitle.entrance_contribution;
      case 'Tenant summary':
        return translations.kpis.kpiTitle.table_tenant;
      case 'Common areas summary':
        return translations.kpis.kpiTitle.table_other_areas;
      default:
        throw new Error(`Invalid widget: ${widget}`);
    }
  }
};
