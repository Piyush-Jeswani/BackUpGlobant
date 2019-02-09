const moment = require('moment');
const retailOrgSummarySharedLangTests = require('../../shared-specs/retail-org-summary-shared-translations.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const apiCall = require('../../pages/api-calls.js');
const users = require('../../data/users');

const locale = 'es_MX';

describe('Translations on retail org summary page:', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      login.go();
      login.loginAsTestLangUser(locale);
      nav.pickRetailOrg();
      done();
    } else {
      login.getToken(async (token) => {
        let response = await apiCall.createNewTag(token, users.testLanguageUsers.es_MX.tag1Name, users.testLanguageUsers.es_MX.tag1Value, users.testLanguageUsers.es_MX.orgId);
        console.log("response :: " + response);
        if (JSON.stringify(response).includes('StatusCodeError') == false) {
          let json = JSON.parse(response);
          let tagnames = json["result"][0]["custom_tags"];
          for (let key in tagnames) {
            if (tagnames[key]["name"] == users.testLanguageUsers.es_MX.tag1Name) {
              apiCall.specParams.tag1Id = tagnames[key]["_id"];
            }
          }
        }
      });
      login.getToken(async (token) => {
        let response, json;
        response = await apiCall.addSiteToTag(token, apiCall.specParams.tag1Id, users.testLanguageUsers.es_MX.orgId, users.testLanguageUsers.es_MX.tag1SiteId);
        json = JSON.stringify(response);
      });
      login.getTestLangUserToken(token => {
        browser.get(`#/${orgData.MSRetailOrg.id}/retail?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`);
        done();
      }, locale, false);
    }
  });

  describe('when user\'s language is Mexican Spanish', () => {
    retailOrgSummarySharedLangTests.retailOrgSummarySharedLangTests(locale);
  });

  afterAll(() => {
    nav.logout();
  });
});
