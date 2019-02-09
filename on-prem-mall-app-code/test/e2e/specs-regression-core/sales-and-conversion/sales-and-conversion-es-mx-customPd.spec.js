const salesAndConversionSharedLangCustomPdTests = require('../../shared-specs/sales-and-conversion-shared-translations-customPd.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const tabNav = require('../../pages/components/tab-nav.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Translations in sales and conversion tab (custom date ranges):', () => {
  const locale = 'es_MX';

  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale, true);
      nav.pickMSOrg();
      nav.navToMSOrgSite();
      tabNav.navToSalesTab();
      done();
    } else {
      login.getTestLangUserToken(token => {
        browser.get(`#/${orgData.MSOrg.id}/${orgData.MSOrgSite.id}/sales-and-conversion?dateRangeStart=` +
          `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}` +
          `&token=${token}`);
        done();
      }, locale, true);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    salesAndConversionSharedLangCustomPdTests.salesAndConversionSharedLangCustomPdTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});
