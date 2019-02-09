const createUsers = require('../../shared-specs/create-users.spec.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const orgData = require('../../data/orgs.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const users = require('../../data/users');

describe('Org navigation', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsSuperUser();
      nav.pickSSOrg();
      tabNav.navToUsageOfAreasTab();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.MSRetailOrg.id}/${orgData.MSRetailSite.testSiteId}/traffic?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}`
          + `&token=${token}`);
        done();
      },users.orgSuperUser.userName);
    }
  });

  describe('Org Admin User Creation and usage', () => {
    createUsers.orgAdminUserCreationAndUsage();
  });

  afterAll(() => {
    nav.logout();
  });
});
