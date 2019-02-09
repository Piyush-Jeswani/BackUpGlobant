const visitorBehaviorSharedTests = require('../../shared-specs/visitor-behavior-shared.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Visitor behavior tab', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickSSOrg();
      tabNav.navToVisitorBehaviorTab();
      dateSelector.clickMonthButton();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=` +
          `${dateSelector.getURLDate('month', true)}&dateRangeEnd=${dateSelector.getURLDate('month', false)}&compareRange1Start=` +
          `${dateSelector.getURLDate('month', true, 1)}&compareRange1End=${dateSelector.getURLDate('month', false, 1)}&compareRange2Start=` +
          `${dateSelector.getURLDate('month', true, 2)}&compareRange2End=${dateSelector.getURLDate('month', false, 2)}&token=${token}`);
        done();
      });
    }
  });

  describe('when selected reporting period is "month"',  () => {
    visitorBehaviorSharedTests.visitorBehaviorSharedTests('month');
  });

  afterAll(() => {
    nav.logout();
  });
});
