const salesAndConversionSharedTestsMonday = require('../../shared-specs/sales-and-conversion-shared-Monday.spec.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Sales and conversion tab - Monday calendar:', () => {
  beforeAll(() => {
    login.go();
    login.loginAsMondayUser();
    nav.pickMSOrg();
    nav.navToMSOrgSite();
    tabNav.navToSalesTab();
    dateSelector.clickYearButton();
  });

  describe('when selected reporting period is "year"', () => {
    salesAndConversionSharedTestsMonday.salesAndConversionSharedTestsMonday('year');
  });

  afterAll(() => {
    nav.logout();
  });
});
