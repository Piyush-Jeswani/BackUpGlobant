const visitorBehaviorSharedLangCustomPdTests = require('../../shared-specs/visitor-behavior-shared-translations-customPd.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

const locale = 'es_MX';

describe('Translations in visitor behavior tab (custom date ranges):', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale, true);
      nav.pickSSOrg();
      tabNav.navToVisitorBehaviorTab();
      done();
    } else {
      login.getTestLangUserToken(token => {  // shortened URL forces app to take compare period ranges from user settings
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}` +
          `&token=${token}`);
        done();
      }, locale, true);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    visitorBehaviorSharedLangCustomPdTests.visitorBehaviorSharedLangCustomPdTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});

