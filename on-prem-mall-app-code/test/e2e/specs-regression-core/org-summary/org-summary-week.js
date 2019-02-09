const orgSummarySharedTests = require('../../shared-specs/org-summary-shared.spec.js');
const orgData = require('../../data/orgs.js');
const login = require('../../pages/login.js');
const nav = require('../../pages/components/nav-header.js');
const dateSelector = require('../../pages/components/time-period-picker.js');

describe('Org navigation', () => {
  beforeAll(done => {
    if (browser.params.indirectNav) {
      nav.pickMSOrg();
      done();
    } else {
      login.getToken(token => {
        browser.get(`#/${orgData.MSOrg.id}/summary?dateRangeStart=${dateSelector.getURLDate('week', true)}` +
          `&dateRangeEnd=${dateSelector.getURLDate('week', false)}&compareRange1Start=${dateSelector.getURLDate('week', true, 1)}` +
          `&compareRange1End=${dateSelector.getURLDate('week', false, 1)}&compareRange2Start=${dateSelector.getURLDate('week', true, 2)}` +
          `&compareRange2End=${dateSelector.getURLDate('week', false, 2)}&token=${token}`);
        done();
      });
    }
  });

  describe('when selected reporting period is "week"', () => {
    orgSummarySharedTests.orgSummarySharedTests('week');
  });

  afterAll(() => {
    nav.logout();
  });
});
