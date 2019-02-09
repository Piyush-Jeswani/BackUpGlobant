const login = require('../../pages/login.js');
const userData = require('../../data/users.js');
const dateSelector = require('../../pages/components/time-period-picker.js');
const nav = require('../../pages/components/nav-header.js');
const miTrendSummary = require('../../pages/components/mi-trend-summary-widget.js');
const miTrendAnalysis = require('../../pages/components/mi-trend-analysis-widget.js');

// tests are disabled until there is a Market Intelligence is stable to test against.

xdescribe('Market intelligence tests for MI user w/o org index configured', () => {
  let userId;

  beforeAll(done => {
    login.getOrgUserWithToken(tokenAndId => {
      let token = tokenAndId.token;
      userId = tokenAndId.userId;
      browser.get(`#/${userData.testMiUser.defaultOrgId}/market-intelligence?dateRangeStart=` +
        `${dateSelector.getURLDate('week', true)}&dateRangeEnd=${dateSelector.getURLDate('week', false)}&token=${token}`);
      done();
    }, userData.testMiUser, false); // start suite by creating MI user w/o org index - sets up index check
  }); // covers API functionality for MI RT 322

  it('should navigate to MI page', () => {
    const pageName = element(by.className('mi-title')).element(by.className('title')).getText();
    expect(pageName).toEqual('Market Intelligence');
  });

  it('(fails until SA-3387 is resolved) date picker should appear', () => {
    browser.refresh(); // REMOVE ONCE SA-3387 IS RESOLVED
    const datePicker = dateSelector.getDatePicker();
    expect(datePicker.isPresent()).toBe(true);
  });

  // MI RT325
  it('test user should not see the org index in the trend summary widget', () => {
    expect(miTrendSummary.getOrgIndexSegments().count()).toBe(0);
  });

  // MI RT349
  it('when trend analysis widget has "year" selected in 2nd grouping dropdown, test user should not see org index data in the chart', () => {
    expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(1); // should start with 1 series
    miTrendAnalysis.selectSecondGroupingOption('year', true); // selecting "year" under "add grouping"
    expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(2); // should see an additional chart series
    miTrendAnalysis.selectSecondGroupingOption('year', false); // removing "year" grouping
    expect(miTrendAnalysis.getAllChartSeries().count()).toEqual(1); // should return to 1 series
  });

  afterAll(done => {
    nav.logout();
    login.deleteUser(done, userId);
  });
});
