const visitorBehaviorSharedLangTests = require('../../shared-specs/visitor-behavior-shared-translations.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

const locale = 'es_MX';

describe('Translations in visitor behavior tab:', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale);
      nav.pickSSOrg();
      tabNav.navToVisitorBehaviorTab();
      done();
    } else {
      login.getTestLangUserToken(token => {
        browser.get(`#/${orgData.SSOrg.id}/${orgData.SSOrg.ssOrgSiteId}/visitor-behavior?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=` +
          `${dateSelector.getURLDate('week', true, 1)}&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=` +
          `${dateSelector.getURLDate('week', true, 2)}&compareRange2End=${dateSelector.getURLDate('week', false, 2)}` +
          `&token=${token}`);
        done();
      }, locale, false);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    visitorBehaviorSharedLangTests.visitorBehaviorSharedLangTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});

