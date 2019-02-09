const retailTrafficSharedTests = require('../../shared-specs/retail-traffic-shared.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Retail site traffic tab:', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickRetailOrg();
      nav.navToRetailOrgSite();
      tabNav.navToTrafficTab();
      dateSelector.clickMonthButton();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('month', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('month', false)}&compareRange1Start=${dateSelector.getURLDate('month', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('month', false, 1)}&compareRange2Start=${dateSelector.getURLDate('month', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('month', false, 2)}`
          + `&token=${token}`);
        done();
      });
    }
  });

  describe('when selected reporting period is "month"', () => {
    retailTrafficSharedTests.retailTrafficSharedTests('month');
  });

  afterAll(() => {
    nav.logout();
  });
});

