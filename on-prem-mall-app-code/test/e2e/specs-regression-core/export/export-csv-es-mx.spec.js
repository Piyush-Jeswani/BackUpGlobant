const exportCSVSharedLangTests = require('../../shared-specs/export-csv-shared-translations.spec');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

const locale = 'es_MX';

describe('Export CSV tab (translation tests)', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale);
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToTrafficTab();
      done();
    } else {
      login.getTestLangUserToken(token => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/traffic?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}` +
          `&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}&compareRange1End=` +
          `${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}` +
          `&token=${token}`);
        done();
      }, locale, false);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    exportCSVSharedLangTests.exportCSVSharedLangTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});
