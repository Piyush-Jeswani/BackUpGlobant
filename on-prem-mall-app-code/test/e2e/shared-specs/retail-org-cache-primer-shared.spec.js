const dateSelector = require('../pages/components/time-period-picker.js');
const nav = require('../pages/components/nav-header.js');
const orgData = require('../data/orgs.js');
const filterPicker = require('../pages/components/filter-picker.js');

module.exports = {

  retailOrgSharedCachePrimer(timePeriod, primaryFilterCategory, primaryFilterValue, secondaryFilterCategory, secondaryFilterArray) {
    describe('Retail org cache primer (shared tests)', () => {
      // skipped until small html modification is deployed to prod
      // low risk since this user only has access to metroPCS org
      // it('should navigate to the correct org', () => {
      //   const title = nav.getSingleOrgName();
      //
      //   expect(title).toEqual(orgData.RetailCachedOrg.name);
      // });

      it('date picker should appear', () => {
        const datePicker = dateSelector.getDatePicker();
        expect(datePicker.isPresent()).toBe(true);
      });

      it('should select the correct date button', () => {
        let dateButton;

        if (timePeriod === 'week') {
          dateButton = dateSelector.getWeekButton();
        } else if (timePeriod === 'month') {
          dateButton = dateSelector.getMonthButton();
        } else if (timePeriod === 'year') {
          dateButton = dateSelector.getYearButton();
        }
        dateButton.then(button => {
          button.click();
          expect(button.getAttribute('class')).toMatch('active');
        });
      });

      describe(`select each combination of ${primaryFilterValue} and secondary filters`, () => {
        beforeAll(() => {
          filterPicker.openFilterMenu();
          // covers view for solitary primary tag, no secondary tag
          filterPicker.applyFilter(primaryFilterCategory, primaryFilterValue); // open the primary category (CHANNEL); select and apply the primary value
          filterPicker.toggleFilterCategory(secondaryFilterCategory); // open the secondary category (MARKET)
        });


        secondaryFilterArray.forEach(secondaryFilterValue => { // loop over correct array of secondary values
          it(secondaryFilterValue, () => {
            filterPicker.toggleFilter(secondaryFilterValue); // select secondary value
            filterPicker.getFilterMenuApplyBtn().click();
            filterPicker.toggleFilter(secondaryFilterValue); // unselect secondary value
          });
        });
      });
    });
  }
};
