const trafficSharedTestsMonday = require('../../shared-specs/traffic-shared-Monday.spec.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Traffic tab - Monday calendar:', () => {
  beforeAll(() => {
    login.go();
    login.loginAsMondayUser();
    nav.pickMSOrg();
    nav.navToMSOrgSite();
    tabNav.navToTrafficTab();
    dateSelector.clickYearButton();
  });

  describe('when selected reporting period is "year"', () => {
    trafficSharedTestsMonday.trafficSharedTestsMonday('year');
  });

  afterAll(() => {
    nav.logout();
  });
});
