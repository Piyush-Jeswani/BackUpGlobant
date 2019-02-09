const trafficSharedLangCustomPdTests = require('../../shared-specs/traffic-shared-translations-customPd.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Translations in traffic tab (custom date ranges):', () => {
  const locale = 'es_MX';

  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale, true);
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToTrafficTab();
      done();
    } else {
      login.getTestLangUserToken(token => { // shortened URL forces app to take compare period ranges from user settings
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}` +
          `&token=${token}`);
        done();
      }, locale, true);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    trafficSharedLangCustomPdTests.trafficSharedLangCustomPdTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});

