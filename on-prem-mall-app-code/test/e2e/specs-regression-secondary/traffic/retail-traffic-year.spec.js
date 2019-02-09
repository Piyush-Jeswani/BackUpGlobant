const retailTrafficSharedTests = require('../../shared-specs/retail-traffic-shared.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Retail site traffic tab:', () => {
  beforeAll(done => {
    if (browser.params.indirectNav){
      login.go();
      login.loginAsSuperUser();
      nav.pickRetailOrg();
      nav.navToRetailOrgSite();
      tabNav.navToTrafficTab();
      dateSelector.clickYearButton();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('year', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('year', false)}&compareRange1Start=${dateSelector.getURLDate('year', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('year', false, 1)}&compareRange2Start=${dateSelector.getURLDate('year', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('year', false, 2)}`
        + `&token=${token}`);
        done();
      });
    }
  });

  describe('when selected reporting period is "year"', () => {
    retailTrafficSharedTests.retailTrafficSharedTests('year');
  });

  afterAll(() => {
    nav.logout();
  });
});
