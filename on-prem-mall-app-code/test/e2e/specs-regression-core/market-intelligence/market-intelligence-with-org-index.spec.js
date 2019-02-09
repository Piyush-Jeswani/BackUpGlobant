const login = require('../../pages/login.js');
const userData = require('../../data/users.js');
const orgData = require('../../data/orgs.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const nav = require('../../pages/components/nav-header.js');
const miSubscriptionPage = require('../../pages/components/mi-admin-subscription-page.js');
const miTrendSummary = require('../../pages/components/mi-trend-summary-widget.js');
const miTrendAnalysis = require('../../pages/components/mi-trend-analysis-widget.js');
const fs = require('fs');

let defaultOrgSubscriptions; // gathered from admin tool tests, used to test MI RT344 (default filters show alphabetically based on category)

// tests are disabled until there is a Market Intelligence is stable to test against.

xdescribe('Market intelligence tests', () => {
  describe('Market intelligence admin: index subscription tests', () => {
    // must do in same spec as functional tests b/c those tests will reference defaultOrgSubscriptions
    // gathered from MI admin UI
    beforeAll(done => {
      login.getToken(token => { // login with superuser to run admin tests
        browser.get(`#/admin/misubscriptionpage?token=${token}`);
        done();
      });
    });

    it('should navigate to MI subscription settings page', () => {
      const pageName = element(by.css('div.mi-admin-subscription-page')).element(by.css('div.mi-admin-breadcrumb')).getText();
      expect(pageName).toEqual('Market Intelligence Settings');
    });

    it(`logging MI subscriptions on test org ${orgData.MSRetailOrg.name} for use in MI RT344`, () => {
      miSubscriptionPage.getSearchOrgField().clear();
      miSubscriptionPage.getSearchOrgField().sendKeys(orgData.MSRetailOrg.name);
      miSubscriptionPage.goToOrgSubscriptionPage();
      const subscriptionSettingsText = miSubscriptionPage.getSubscriptionTableRows().getText();
      subscriptionSettingsText.then(text => {
        defaultOrgSubscriptions = miSubscriptionPage.buildExpectedTrendSummaryDefaults(text);
      });
      browser.get('#/admin/misubscriptionpage');
    });

    // MI RT329
    it('should be possible to search for an org by org name', () => {
      miSubscriptionPage.getSearchOrgField().clear();
      const allOrgsCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSearchOrgField().sendKeys('Mall');
      const someOrgsCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSearchOrgField().clear();
      miSubscriptionPage.getSearchOrgField().sendKeys(orgData.MSRetailOrg.name);
      const oneOrgCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSearchOrgField().clear();
      miSubscriptionPage.getSearchOrgField().sendKeys('should return zero');
      const noOrgCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSearchOrgField().clear();  // test cleanup - clear search field

      expect(someOrgsCount).toBeLessThan(allOrgsCount);
      expect(someOrgsCount).toBeGreaterThan(1);
      expect(oneOrgCount).toEqual(1);
      expect(noOrgCount).toEqual(0);
      expect(miSubscriptionPage.getRowsInOrgList().count()).toEqual(allOrgsCount); // ensure list returns all orgs when search field cleared
    });

    // MI RT329
    it('should be possible to search for an org by MI subscription status', () => {
      miSubscriptionPage.getSubscriptionStatusFilter().click();
      miSubscriptionPage.selectSubscriptionStatusOption('All');
      miSubscriptionPage.getSearchOrgField().clear();
      miSubscriptionPage.getSearchOrgField().sendKeys('Mall'); // assumes searching by org name functions correctly (tested above)
      const allMallCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSubscriptionStatusFilter().click();
      miSubscriptionPage.selectSubscriptionStatusOption('Active');
      const activeMallCount = miSubscriptionPage.getRowsInOrgList().count();
      miSubscriptionPage.getSubscriptionStatusFilter().click();
      miSubscriptionPage.selectSubscriptionStatusOption('Disabled');
      const inactiveMallCount = miSubscriptionPage.getRowsInOrgList().count();

      miSubscriptionPage.getSubscriptionStatusFilter().click(); // test cleanup - return list to show "all" MI orgs
      miSubscriptionPage.selectSubscriptionStatusOption('All');

      expect(activeMallCount).toBeLessThan(allMallCount);
      expect(inactiveMallCount).toBeLessThan(allMallCount);
    });

//     MI RT330
    it('(fails until SA-3410/SA-3344 are resolved) should show the correct default dates on an org\'s MI subscription page', () => {
      // default start date should be today
      // default end date should be today + 1 year + 1 day
      // must activate subscription via org edit page --> "advanced options" tab
      const expectedDefaultDates = dateSelector.calculateExpectedMiSubscriptionDates();
      browser.get('#/admin/organizations/5190');
      miSubscriptionPage.getAdvancedOptionsTab().click();
      browser.sleep(1000); // workaround for brutally inconsistent admin tab timing
      const miToggleStatus = miSubscriptionPage.getStatusMiToggle();
      miToggleStatus.then(status => {
        if (status) { // test prep: since org data is subject to change, toggle may initially be "on"
          miSubscriptionPage.getMiSubscriptionToggle().click();
          browser.sleep(3000);
          miSubscriptionPage.getSaveOrgSettingsButton().click();
          browser.sleep(3000);
          miSubscriptionPage.getAdvancedOptionsTab().click();
          browser.sleep(1000);
        }

        miSubscriptionPage.getMiSubscriptionToggle().click();
        browser.sleep(3000);
        miSubscriptionPage.getSaveOrgSettingsButton().click();
        browser.sleep(3000);
        miSubscriptionPage.getAdvancedOptionsTab().click();
        browser.sleep(1000);
        miSubscriptionPage.getMiSettingsButton().click();
        const subscriptionStartDate = miSubscriptionPage.getSubscriptionStartDate().getAttribute('value');
        const subscriptionEndDate = miSubscriptionPage.getSubscriptionEndDate().getAttribute('value');

        // restore test subscription state to "off"
        browser.get('#/admin/organizations/5190');
        miSubscriptionPage.getAdvancedOptionsTab().click();
        browser.sleep(1000);
        miSubscriptionPage.getMiSubscriptionToggle().click();
        browser.sleep(3000);
        miSubscriptionPage.getSaveOrgSettingsButton().click();
        browser.sleep(3000);
        browser.get('#/admin/misubscriptionpage'); // cleanup - return user to MI subscription page
        expect(subscriptionStartDate).toMatch(expectedDefaultDates[0]);
        expect(subscriptionEndDate).toMatch(expectedDefaultDates[1]);
      });
    });

    describe('adding/removing subscriptions from an org', () => {
      // MI RT331 and MI RT332 must be run together for correct setup/cleanup
      let newCategoryName;
      let newGeographyName;
      // MI RT331
      it('should be possible to add a new MI subscription (category and geography) to an org', () => {
        miSubscriptionPage.getSearchOrgField().clear();
        miSubscriptionPage.getSearchOrgField().sendKeys(orgData.MSRetailOrg.name);
        miSubscriptionPage.goToOrgSubscriptionPage();
        miSubscriptionPage.getAddNewIndexLink().click();
        const saveButton = miSubscriptionPage.getSaveNewSubscriptionButton();
        browser.sleep(1000);  // necessary to allow geography to populate
        miSubscriptionPage.getNewSubscriptionCategoryButton(0).click();
        newCategoryName = miSubscriptionPage.getNewSubscriptionCategory(0).getText();
        miSubscriptionPage.getNewSubscriptionGeographyButton(0).click();
        newGeographyName = miSubscriptionPage.getNewSubscriptionGeography(0).getText();
        expect(saveButton.isEnabled()).toBe(true);
        saveButton.click();
        // should be one row containing new category
        expect(miSubscriptionPage.getCategoryCellsByName(newCategoryName).count()).toBe(1);
        // the row containing new category should contain new geography
        expect(miSubscriptionPage.getSubscriptionRowByCategory(newCategoryName).getText()).toMatch(newGeographyName);
      });
      // MI RT332
      it('should be possible to remove an MI subscription from an org', () => {
        // removes filter added in previous test - MI RT331 and MI RT332 must be run together
        miSubscriptionPage.getSubscriptionRowDeleteButton(newCategoryName).click();
        const deleteModalWarning = miSubscriptionPage.getDeleteConfirmModal().getText();
        miSubscriptionPage.getDeleteSubscriptionConfirmButton().click();
        expect(deleteModalWarning).toMatch(newCategoryName);
        expect(miSubscriptionPage.getCategoryCellsByName(newCategoryName).count()).toBe(0);
      });
    });

    afterAll(() => {
      nav.logout();
    });
  });

  describe('Market intelligence tests for MI user with org index configured', () => {
    let userId;
    let miUrl;
    const expectedTrendSummaryFiltersCount = 5;

    beforeAll(done => {
      login.getOrgUserWithToken(tokenAndId => {
        let token = tokenAndId.token;
        userId = tokenAndId.userId;
        miUrl = `#/${userData.testMiUser.defaultOrgId}/market-intelligence?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&token=${token}`;
        browser.get(miUrl);
        done();
      }, userData.testMiUser, true); // start suite by creating MI user with org index - sets up index checks
    }); // covers API functionality for MI RT 321

    it('should navigate to MI page', () => {
      const pageName = element(by.className('mi-title')).element(by.className('title')).getText();
      expect(pageName).toEqual('Market Intelligence');
    });

    // covers MI RT339: protractor starts browser instance completely cold
    it('(fails until SA-3387 is resolved) date picker should appear', () => {
      browser.refresh(); // REMOVE ONCE SA-3387 IS RESOLVED
      const datePicker = dateSelector.getDatePicker();
      expect(datePicker.isPresent()).toBe(true);
    });

    // MI RT324
    it('test user should see the org index in the trend summary widget', () => {
      expect(miTrendSummary.getOrgIndexSegments().count()).toEqual(expectedTrendSummaryFiltersCount);
    });

    describe('MI time period', () => {
      // MI RT337
      // note workaround (browser.refresh()) for SA-3387 in test above for RT339
      describe('confirm default compare period is "prior year"', () => {
        function checkComparePeriodHeader() {
          dateSelector.toggleDatePicker();
          dateSelector.pickPickerTab(1);
          expect(dateSelector.getDatePickerTabHeader()).toMatch('Prior year');
        }
        it('when using datepicker shortcut button "week"', () => {
          checkComparePeriodHeader();
        });

        it('when using datepicker shortcut button "day"', () => {
          dateSelector.clickDayButton();
          checkComparePeriodHeader();
        });

        it('when using datepicker shortcut button "month"', () => {
          dateSelector.clickMonthButton();
          checkComparePeriodHeader();
        });

        it('when using datepicker shortcut button "year"', () => {
          dateSelector.clickYearButton();
          checkComparePeriodHeader();
        });
      });

      // MI RT333
      it('when selected period is 46+ days, "day" option should not be present in 1st grouping dropdown ("group by") on trend analysis widget', () => {
        dateSelector.clickWeekButton();
        dateSelector.toggleDatePicker();
        const selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
        selectedPeriodDateRange.then(dateRange => {
          dateSelector.selectCustomStartDate(dateRange[1], 45, userData.testMiUser.dateFormat);
          dateSelector.clickApplyOrCancel('apply');
          expect(miTrendAnalysis.getFirstGroupingDropdownOptionsText()).toMatch('Day');

          dateSelector.toggleDatePicker();
          dateSelector.selectCustomStartDate(dateRange[1], 46, userData.testMiUser.dateFormat);
          dateSelector.clickApplyOrCancel('apply');
          expect(miTrendAnalysis.getFirstGroupingDropdownOptionsText()).not.toMatch('Day');
        });
      });

      // MI RT334
      it('when selected period and compare period are different in length, should show "Unequal number of days selected" warning', () => {
        dateSelector.clickWeekButton();
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(1);

        const comparePeriodDateRange = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
        comparePeriodDateRange.then(dateRange => {
          dateSelector.selectCustomStartDate(dateRange[1], 10, userData.testMiUser.dateFormat);
          expect(dateSelector.getMiComparePeriodWarning().isDisplayed()).toBe(true);
          dateSelector.clickApplyOrCancel('cancel');
        });
      });

      // MI RT336
      it('compare period dates >61 weeks (428 days) back from selected period should be disabled', () => {
        dateSelector.clickWeekButton();
        dateSelector.toggleDatePicker();
        const selectedPeriodDateRange = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);

        selectedPeriodDateRange.then(dateRange => {
          let targetDateArray = dateSelector.calculateCustomStartDate(dateRange[0], 428, userData.testMiUser.dateFormat);
          dateSelector.pickPickerTab(1);

          expect(dateSelector.isDayInMonthEnabled(targetDateArray[0], targetDateArray[1])).not.toMatch('disabled');

          targetDateArray = dateSelector.calculateCustomStartDate(dateRange[0], 429, userData.testMiUser.dateFormat);
          expect(dateSelector.isDayInMonthEnabled(targetDateArray[0], targetDateArray[1])).toMatch('disabled');

          targetDateArray = dateSelector.calculateCustomStartDate(dateRange[0], 450, userData.testMiUser.dateFormat);
          expect(dateSelector.isDayInMonthEnabled(targetDateArray[0], targetDateArray[1])).toMatch('disabled');
          dateSelector.clickApplyOrCancel('Cancel');
          dateSelector.clickWeekButton();
        });
      });
    });

    describe('MI trend summary filters', () => {
      // MI RT344
      it('when logging in as a new MI user for the first time, trend summary should show filters alphabetically based on category', () => {
        // do this test 1st - current e2e test user is 1st time MI user
        const defaultFilterText = miTrendSummary.getCurrentIndexTitles().getText();
        expect(defaultFilterText).toEqual(defaultOrgSubscriptions);
      });

      // MI RT341
      it('should be able to create a trend summary filter consisting of a Category and Geography', () => {
        miTrendSummary.clickEditFiltersPageButton();
        miTrendSummary.clickFilterDropdown(0);
        miTrendSummary.clickFilterClearButton();
        miTrendSummary.clickFilterRuleDropdown(0, 0);
        miTrendSummary.getFilterRuleOption('Category').click();
        miTrendSummary.clickFilterRuleDropdown(0, 2);
        miTrendSummary.getFilterRuleOption('Shoes').click();
        miTrendSummary.getAddFilterLink().click();
        miTrendSummary.clickFilterRuleDropdown(1, 0);
        miTrendSummary.getFilterRuleOption('Geography').click();
        miTrendSummary.clickFilterRuleDropdown(1, 2);
        miTrendSummary.getFilterRuleOption('').click();
        expect(miTrendSummary.getFilterOptionsPanelButton('Apply').isEnabled()).toBe(true);
        miTrendSummary.clickFilterApplyButton();
        expect(miTrendSummary.getFilterName(0)).toMatch('SHOES');
        miTrendSummary.clickEditFiltersSaveButton();
        expect(miTrendSummary.getCurrentIndexSegments().get(0).getText()).toMatch('SHOES');
      });

      // MI RT343
      it('(fails until SA-3419 is resolved) should be possible to remove a filter', () => {
        // remove one and confirm
        expect(miTrendSummary.getCurrentIndexSegments().count()).toBe(5);
        expect(miTrendSummary.getEmptyIndexSegments().count()).toBe(0);

        miTrendSummary.clickEditFiltersPageButton();
        miTrendSummary.clickFilterDropdown(1);
        miTrendSummary.clickFilterClearButton();
        miTrendSummary.clickFilterApplyButton();
        miTrendSummary.clickEditFiltersSaveButton();

        expect(miTrendSummary.getCurrentIndexSegments().count()).toBe(4);
        expect(miTrendSummary.getEmptyIndexSegments().count()).toBe(1);

        // remove all but one and confirm
        miTrendSummary.clickEditFiltersPageButton();
        miTrendSummary.clickFilterDropdown(2);
        miTrendSummary.clickFilterClearButton();
        miTrendSummary.clickFilterApplyButton();
        miTrendSummary.clickFilterDropdown(3);
        miTrendSummary.clickFilterClearButton();
        miTrendSummary.clickFilterApplyButton();
        miTrendSummary.clickFilterDropdown(4);
        miTrendSummary.clickFilterClearButton();
        miTrendSummary.clickFilterApplyButton();
        miTrendSummary.clickEditFiltersSaveButton();

        expect(miTrendSummary.getCurrentIndexSegments().count()).toBe(1);
        expect(miTrendSummary.getEmptyIndexSegments().count()).toBe(4);
      });

      it('should not be able to create an incomplete trend summary filter', () => {
        // can't apply a filter w/o a value
        miTrendSummary.clickEditFiltersPageButton();
        miTrendSummary.clickFilterDropdown(1);
        miTrendSummary.clickFilterRuleDropdown(0, 0);
        miTrendSummary.getFilterRuleOption('Category').click();
        expect(miTrendSummary.getFilterOptionsPanelButton('Apply').isEnabled()).toBe(false);
        miTrendSummary.clickFilterRuleDropdown(0, 0);
        miTrendSummary.getFilterRuleOption('Geography').click();
        expect(miTrendSummary.getFilterOptionsPanelButton('Apply').isEnabled()).toBe(false);
        // can't apply a filter with only one key
        miTrendSummary.clickFilterRuleDropdown(0, 2);
        miTrendSummary.getFilterRuleOption('').click(); // specific value not important
        expect(miTrendSummary.getFilterOptionsPanelButton('Apply').isEnabled()).toBe(false);
        miTrendSummary.clickFilterRuleDropdown(0, 0);
        miTrendSummary.getFilterRuleOption('Category').click();
        miTrendSummary.clickFilterRuleDropdown(0, 2);
        miTrendSummary.getFilterRuleOption('').click(); // specific value not important
        expect(miTrendSummary.getFilterOptionsPanelButton('Apply').isEnabled()).toBe(false);
        miTrendSummary.clickFilterCancelButton();
        miTrendSummary.clickEditFiltersCancelButton();
      });

      // MI RT342
      it('should not be able to create a trend summary filter consisting of a Category and Category', () => {
        miTrendSummary.clickEditFiltersPageButton();
        miTrendSummary.clickFilterDropdown(1);
        miTrendSummary.clickFilterRuleDropdown(0, 0);
        miTrendSummary.getFilterRuleOption('Category').click();
        miTrendSummary.clickFilterRuleDropdown(0, 2);
        miTrendSummary.getFilterRuleOption('').click();
        miTrendSummary.getAddFilterLink().click();
        miTrendSummary.clickFilterRuleDropdown(1, 0);
        expect(miTrendSummary.getFilterRuleDropdown(1, 0).getText()).not.toMatch('Category');
        miTrendSummary.getFilterRuleOption('').click(); // collapse dropdown
        miTrendSummary.clickFilterCancelButton();
        miTrendSummary.clickEditFiltersCancelButton();
      });

      // MI RT340
      it('when trend summary widget filters are updated the new settings should be present on subsequent logins by default', () => {
        // do this expectation last - widget filters will already have changed from default by testing MI RT 343 and etc
        nav.logout();
        browser.get(miUrl); // log back in as same throwaway MI user
        expect(miTrendSummary.getCurrentIndexSegments().get(0).getText()).toMatch('SHOES'); // should match category of filter created in MI RT341
        expect(miTrendSummary.getEmptyIndexSegments().count()).toBe(4);
        expect(miTrendSummary.getCurrentIndexSegments().count()).toBe(1);
      });

      describe('time period dimension', () => {
        beforeAll(() => {
          miTrendSummary.clickEditFiltersPageButton();
        });
        // MI RT3442
        it(`trend summary filter page should show ${expectedTrendSummaryFiltersCount} "time period" dropdown menus`, () => {
          expect(miTrendSummary.getFilterTimePeriodDropdowns().count()).toEqual(expectedTrendSummaryFiltersCount);  // should be 5 time period menus
        });

        // check options for every time period menu
        for (let index = 0; index < expectedTrendSummaryFiltersCount; index += 1) {
          // MI RT3442
          it(`on trend summary filter page, the index ${index} filter "time period" dropdown should contain the correct options`, () => {
            miTrendSummary.getOneTimePeriodDropdown(index).click();
            const dropdownText = miTrendSummary.getTimePeriodDropdownOptionsByIndex(index).getText();
            dropdownText.then(textArray => {
              const lowercaseText = textArray.map(menuOption => {
                return menuOption.toLowerCase();
              });
              expect(lowercaseText).toEqual(miTrendSummary.expectedFilterTimePeriodOptions());
            });
            miTrendSummary.getOneTimePeriodDropdown(index).click();
          });
        }
        // MI RT3443 (reference test case for explanatory screenshot)
        it('"time period" dimension should set the correct date range in the resulting filter', () => {
          const testCategory = 'Total Retail';
          const testGeography = 'United States';
          const testTimePeriods = [
            'None',
            'Yesterday',
            'Last week',
            'Last month',
            'Last year'
          ];
          // filters setup
          for (let index = 0; index < expectedTrendSummaryFiltersCount; index += 1) {
            miTrendSummary.clickFilterDropdown(index);
            miTrendSummary.clickFilterClearButton();
            miTrendSummary.clickFilterRuleDropdown(0, 0);
            miTrendSummary.getFilterRuleOption('Category').click();
            miTrendSummary.clickFilterRuleDropdown(0, 2);
            miTrendSummary.getFilterRuleOption(testCategory).click();
            miTrendSummary.getAddFilterLink().click();
            miTrendSummary.clickFilterRuleDropdown(1, 0);
            miTrendSummary.getFilterRuleOption('Geography').click();
            miTrendSummary.clickFilterRuleDropdown(1, 2);
            miTrendSummary.getFilterRuleOption(testGeography).click();
            miTrendSummary.clickFilterApplyButton();
            expect(miTrendSummary.getFilterName(index)).toMatch('TOTAL RETAIL / UNITED STATES');
          }

          for (let index = 0; index < expectedTrendSummaryFiltersCount; index += 1) {
            miTrendSummary.getOneTimePeriodDropdown(index).click();
            miTrendSummary.setTimePeriodDropdownOption(index, testTimePeriods[index]);
          }
          miTrendSummary.clickEditFiltersSaveButton();
          // checking filter date ranges by comparing segment data to filter with time period "none"
          // filter with time period "none" takes on date range showing in date-picker
          // check "last week" time period
          const segmentTestParams = [
            {
              dateRange: dateSelector.clickWeekButton.bind(dateSelector),
              testSegmentIndex: 2
            },
            {
              dateRange: dateSelector.clickMonthButton.bind(dateSelector),
              testSegmentIndex: 3
            },
            {
              dateRange: dateSelector.clickYearButton.bind(dateSelector),
              testSegmentIndex: 4
            }
          ];

          segmentTestParams.forEach(testParamObject => {
            testParamObject.dateRange();

            const checkSegmentCurrentDelta = miTrendSummary.getIndexSegmentDelta('current', 0);
            const checkSegmentOrgDelta = miTrendSummary.getIndexSegmentDelta('org', 0);
            const testSegmentCurrentDelta = miTrendSummary.getIndexSegmentDelta('current', testParamObject.testSegmentIndex);
            const testSegmentOrgDelta = miTrendSummary.getIndexSegmentDelta('org', testParamObject.testSegmentIndex);

            expect(checkSegmentCurrentDelta).not.toEqual('');
            expect(checkSegmentOrgDelta).not.toEqual('');
            expect(testSegmentCurrentDelta).toMatch(checkSegmentCurrentDelta);
            expect(testSegmentOrgDelta).toMatch(checkSegmentOrgDelta);
          });
          dateSelector.clickWeekButton();
        });

        // MI RT3444
        it('(may fail until SA-3474 is resolved) should be possible to update category/geography/time for an existing filter', () => {
          const testFilterIndex = 4;
          const finalFilterText = miTrendSummary.getIndexSegments().get(testFilterIndex).getText();
          const newTestCategory = 'Total Mall';
          const newTestGeography = 'United Kingdom';
          const newTestTime = 'Last week';
          miTrendSummary.clickEditFiltersPageButton();
          miTrendSummary.clickFilterDropdown(testFilterIndex);
          miTrendSummary.clickFilterRuleDropdown(0, 2);
          miTrendSummary.getFilterRuleOption(newTestCategory).click();
          miTrendSummary.clickFilterRuleDropdown(1, 2);
          miTrendSummary.getFilterRuleOption(newTestGeography).click();
          miTrendSummary.clickFilterApplyButton();

          miTrendSummary.getOneTimePeriodDropdown(testFilterIndex).click();
          miTrendSummary.setTimePeriodDropdownOption(testFilterIndex, newTestTime);
          miTrendSummary.clickEditFiltersSaveButton();
          const finalFilterUpdatedText = miTrendSummary.getIndexSegments().get(testFilterIndex).getText();

          expect(finalFilterUpdatedText).not.toMatch(finalFilterText);
          expect(finalFilterUpdatedText).toMatch(newTestCategory.toUpperCase());
          expect(finalFilterUpdatedText).toMatch('GB');
          expect(finalFilterUpdatedText).toMatch(newTestTime);
        });

        // MI RT3446
        it('(may fail until SA-3420 is resolved) should not update time dimension if "cancel" is clicked instead of "apply" on filter settings page', () => {
          const testFilterIndex = 4;
          const finalFilterText = miTrendSummary.getIndexSegments().get(testFilterIndex).getText();
          const newTestTime = 'Last month';
          miTrendSummary.clickEditFiltersPageButton();
          miTrendSummary.getOneTimePeriodDropdown(testFilterIndex).click();
          miTrendSummary.setTimePeriodDropdownOption(testFilterIndex, newTestTime);
          miTrendSummary.clickEditFiltersCancelButton();
          const finalFilterUpdatedText = miTrendSummary.getIndexSegments().get(testFilterIndex).getText();

          expect(finalFilterUpdatedText).toMatch(finalFilterText);
          expect(finalFilterUpdatedText).not.toMatch(newTestTime);
        });

        // MI RT3445
        it('(may fail until SA-3474/SA-3419 is resolved) should be possible to successfully clear a segment with a time dimension', () => {
          const testFilterIndex = 4;
          miTrendSummary.clickEditFiltersPageButton();
          miTrendSummary.clickFilterDropdown(testFilterIndex);
          miTrendSummary.clickFilterClearButton();
          miTrendSummary.clickFilterApplyButton();
          miTrendSummary.clickEditFiltersSaveButton();
          expect(miTrendSummary.getEmptyIndexSegments().count()).toBe(1);
          expect(miTrendSummary.getIndexSegments().get(testFilterIndex).getText()).toMatch('Add data');
        });

        afterAll(() => {
          browser.get(miUrl);
        });
      });
    });

    describe('MI trend analysis', () => {
      const firstGroupingOptions = [
        'Geography', // default option when navigating to MI dashboard
        'Day',
        'Week',
        'Month',
        'Quarter',
        'Year',
        'Period to Date'
      ];

      function checkCellValues(columnFunction, expectedValue) {
        columnFunction.then(columnValues => {
          columnValues.forEach(cellValue => {
            expect(cellValue).toMatch(expectedValue);
          });
        });
      }

      const filterTestSettings = {
        testCategory: 'Total Mall',
        testGeography: 'United Kingdom',
        newTestCategory: 'Total Retail',
        newTestGeography: 'United States'
      };

      // MI RT348
      it('chart should not have "year" selected in 2nd grouping dropdown by default', () => {
        expect(miTrendAnalysis.getSecondGroupingDropdown().getText()).not.toMatch('Year');
      });

      // MI RT345
      it('when changing advanced options and changing date period the advanced options are applied to the chart and persist', () => {
        miTrendAnalysis.clickAdvancedOptionsDropdown();
        miTrendAnalysis.clickFilterRuleDropdown(0, 2);

        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testCategory).click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);

        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testGeography).click();
        miTrendAnalysis.clickFilterApplyButton();

        checkCellValues(miTrendAnalysis.getCategoryColumnValues(), filterTestSettings.testCategory);
        checkCellValues(miTrendAnalysis.getGeographyNameCategoryValues(), filterTestSettings.testGeography);

        dateSelector.clickMonthButton();
        checkCellValues(miTrendAnalysis.getCategoryColumnValues(), filterTestSettings.testCategory);
        checkCellValues(miTrendAnalysis.getGeographyNameCategoryValues(), filterTestSettings.testGeography);

        dateSelector.clickYearButton();
        checkCellValues(miTrendAnalysis.getCategoryColumnValues(), filterTestSettings.testCategory);
        checkCellValues(miTrendAnalysis.getGeographyNameCategoryValues(), filterTestSettings.testGeography);
// do not test day - no data, expectation errors b/c no chart renders
      });

      it('data table "selected period" column dates should match the datepicker', () => {
        dateSelector.clickWeekButton();
        dateSelector.toggleDatePicker();
        const selectedPeriodDateRangePromise = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
        dateSelector.toggleDatePicker();

        const selectedPeriodColumn = miTrendAnalysis.getSelectedPeriodCategoryValues();
        selectedPeriodDateRangePromise.then(dateRange => {
          checkCellValues(selectedPeriodColumn, dateRange[0]);
          checkCellValues(selectedPeriodColumn, dateRange[1]);
        });
      });

      // MI RT346
      it('data table "compare period" column dates should match the datepicker', () => {
        dateSelector.clickWeekButton();
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(1);
        const comparePeriodDateRangePromise = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
        dateSelector.toggleDatePicker();

        const comparePeriodColumn = miTrendAnalysis.getComparePeriodCategoryValues();
        comparePeriodDateRangePromise.then(dateRange => {
          checkCellValues(comparePeriodColumn, dateRange[0]);
          checkCellValues(comparePeriodColumn, dateRange[1]);
        });
      });

      // MI RT347
      it('data table "compare period" column dates should match the datepicker when compare period is custom', () => {
        dateSelector.clickMonthButton();
        dateSelector.toggleDatePicker();
        dateSelector.pickPickerTab(1);

        const comparePeriodDateRangePromise = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
        comparePeriodDateRangePromise.then(initialDateRange => {
          dateSelector.selectCustomStartDate(initialDateRange[1], 10, userData.testMiUser.dateFormat);
          const updatedCompareDateRangePromise = dateSelector.getDateFieldValues(userData.testMiUser.dateFormat);
          dateSelector.clickApplyOrCancel('apply');
          const comparePeriodColumn = miTrendAnalysis.getComparePeriodCategoryValues();
          updatedCompareDateRangePromise.then(updatedDateRange => {
            checkCellValues(comparePeriodColumn, updatedDateRange[0]);
            checkCellValues(comparePeriodColumn, updatedDateRange[1]);
          });
        });
        dateSelector.clickWeekButton();
      });

      // MI RT3471
      it('should be possible to configure filters with 2 categories and 1 geography, with the combination shown in the widget header', () => {
        miTrendAnalysis.clickAdvancedOptionsDropdown();
        miTrendAnalysis.clickFilterRuleDropdown(0, 0);
        miTrendAnalysis.getFilterRuleOption('Category').click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testCategory).click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testGeography).click();
        miTrendAnalysis.getAddFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 0);
        miTrendAnalysis.getFilterRuleOption('Category').click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.newTestCategory).click();
        miTrendAnalysis.clickFilterApplyButton();

        const activeFilters = miTrendAnalysis.getFilterTextInWidgetHeader();
        expect(activeFilters).toMatch(filterTestSettings.newTestCategory.toUpperCase());
        expect(activeFilters).toMatch(filterTestSettings.testCategory.toUpperCase());
        expect(activeFilters).toMatch(filterTestSettings.testGeography.toUpperCase());
      });

      // MI RT3472
      it('should be possible to configure filters with 2 geographies and 1 category, with the combination shown in the widget header', () => {
        miTrendAnalysis.clickAdvancedOptionsDropdown();
        miTrendAnalysis.getRemoveFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 0);
        miTrendAnalysis.getFilterRuleOption('Category').click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.newTestCategory).click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testGeography).click();
        miTrendAnalysis.getAddFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.newTestGeography).click();
        miTrendAnalysis.clickFilterApplyButton();

        const activeFilters = miTrendAnalysis.getFilterTextInWidgetHeader();
        expect(activeFilters).toMatch(filterTestSettings.newTestGeography.toUpperCase());
        expect(activeFilters).toMatch(filterTestSettings.newTestCategory.toUpperCase());
        expect(activeFilters).toMatch(filterTestSettings.testGeography.toUpperCase());
      });

      // MI RT3473
      it('should not be possible to configure a filter with 3 categories or 3 geographies', () => {
        miTrendAnalysis.clickAdvancedOptionsDropdown();
        miTrendAnalysis.getRemoveFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.newTestGeography).click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);
        miTrendAnalysis.getFilterRuleOption('Chicago').click();
        miTrendAnalysis.getAddFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 0);
        expect(miTrendAnalysis.getFilterRuleOptions('Geography').count()).toBe(0);

        miTrendAnalysis.getRemoveFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 0);
        miTrendAnalysis.getFilterRuleOption('Category').click();
        miTrendAnalysis.clickFilterRuleDropdown(0, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testCategory).click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 0);
        miTrendAnalysis.getFilterRuleOption('Category').click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.newTestCategory).click();
        miTrendAnalysis.getAddFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(2, 0);
        expect(miTrendAnalysis.getFilterRuleOptions('Category').count()).toBe(0);
        miTrendAnalysis.clickFilterRuleDropdown(2, 0);
        miTrendAnalysis.getRemoveFilterLink().click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 0);
        miTrendAnalysis.getFilterRuleOption('Geography').click();
        miTrendAnalysis.clickFilterRuleDropdown(1, 2);
        miTrendAnalysis.getFilterRuleOption(filterTestSettings.testGeography).click();
        miTrendAnalysis.clickFilterApplyButton();
      });

      firstGroupingOptions.forEach((firstGroupingValue, index) => { // loop over all values in first grouping dropdown
        describe(`widget and export tests for group by dropdown value "${firstGroupingValue}" and index ${index}`, () => {
          beforeAll(() => {
            if (index !== 0) {
              miTrendAnalysis.selectFirstGroupingOption(firstGroupingValue); // for non-default options, must manually select in dropdown
            }
          });

          // MI RT350, MI RT351, MI RT352
          it('when trend analysis widget has "year" selected in 2nd grouping dropdown, test user should see org index data in the chart', () => {
            expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(2);
            miTrendAnalysis.selectSecondGroupingOption('year', true);
            expect(miTrendAnalysis.getSecondGroupingDropdown().getText()).toMatch('Year');
            expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(4);
            miTrendAnalysis.selectSecondGroupingOption('year', false);
            expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(2);
            expect(miTrendAnalysis.getSecondGroupingDropdown().getText()).not.toMatch('Year');
          });

          // add'l check for MI RT351, MI RT352 ("chart renders successfully")
          it('should show the correct type of chart based on 1st grouping dropdown', () => {
            let expectedChartType = 'path'; // most options render a line chart
            if (index === 0 || index === 6) {
              expectedChartType = 'rect'; // "geography" and "period to date" options render bar chart
            }
            expect(miTrendAnalysis.getChartSeriesType()).toEqual(expectedChartType);
          });

          // MI RT354
          describe('CSV export', () => {
            const fileName = `${browser.params.downloadPath}/trend-analysis.csv`;
            it('should export a csv', () => {
              miTrendAnalysis.exportWidgetCsv(); // click export button in UI
              if (browser.params.localBrowser) {
                let folderContents;

                browser.driver.wait(() => {
                  // Wait until the file has been downloaded.
                  // We need to wait thus as otherwise protractor has a nasty habit of
                  // trying to do any following tests while the file is still being
                  // downloaded and hasn't been moved to its final location.
                  folderContents = fs.readdirSync(browser.params.downloadPath);
                  let returnValue = false;
                  folderContents.forEach(file => { // checks to make sure a CSV has been downloaded before proceeding
                    if (file.indexOf('.csv') === file.length - 4) { // checks for file ending in .csv
                      returnValue = true;
                    }
                  });
                  return returnValue;
                }, 30000).then(() => {
                  const csvText = fs.readFileSync(fileName, { encoding: 'utf8' });
                  // checks file content to make sure org, calendar, groupBy are correct
                  // can add additional test expectations based on business rules to further automate CSV regression testing!
                  expect(csvText).toMatch(`Organization: ${orgData.MSRetailOrg.name}`);
                  expect(csvText).toMatch(`Calendar: ${userData.testMiUser.calendar}`);
                  expect(csvText).toMatch(`Group By: ${firstGroupingValue}`);
                });
              }
            });

            afterAll(() => {
              if (browser.params.localBrowser) { // delete file to restore base state/avoid naming issues
                fs.unlinkSync(fileName);
                console.log(`deleting ${fileName}`);
              }
            });
          });
        });
      });
    });

    afterAll(done => {
      nav.logout();
      login.deleteUser(done, userId);
    });
  });
});
