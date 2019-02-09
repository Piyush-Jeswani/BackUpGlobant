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
    dateSelector.clickMonthButton();
  });

  describe('when selected reporting period is "month"', () => {
    trafficSharedTestsMonday.trafficSharedTestsMonday('month');
  });

  afterAll(() => {
    nav.logout();
  });
});
