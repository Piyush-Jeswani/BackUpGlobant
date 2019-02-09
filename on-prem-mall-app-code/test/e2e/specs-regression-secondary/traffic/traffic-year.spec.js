
const trafficSharedTests = require('../../shared-specs/traffic-shared.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Traffic tab:', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToTrafficTab();
      dateSelector.clickYearButton();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=${dateSelector.getURLDate('year', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('year', false)}&compareRange1Start=${dateSelector.getURLDate('year', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('year', false, 1)}&compareRange2Start=${dateSelector.getURLDate('year', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('year', false, 2)}&token=${token}`);
        done();
      });
    }
  });

  describe('when selected reporting period is "year"', () => {
    trafficSharedTests.trafficSharedTests('year');
  });

  afterAll(() => {
    nav.logout();
  });
});
