const utils = require('./e2e/pages/common-utils/protractor-utils');
// controls which set of e2e protractor specs will run.  Default is full regression suite.
const suite = process.env.E2E_SUITE || 'full_regression';
// toggles coverage metrics, which can sometimes interfere with e2e runs on teamcity
const isCoverageEnabled = process.env.E2E_COVERAGE_ENABLED === 'true';
// Local Chrome-based configuration file.
exports.config = {
  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    // 'shardTestFiles': true,
    // 'maxInstances' : 3,
    'chromeOptions': {
      // Set download path and avoid prompting for download even though
      // this is already the default on Chrome but for completeness
      prefs: {
        'download': {
          'prompt_for_download': false,
          'default_directory': __dirname + '/e2e/downloads'
        },
      },
    },
  },
  // allows flexibility in which e2e protractor specs to run
  suites: {
    'core_regression':'e2e/specs-regression-core/**/*.js',
    'full_regression':'e2e/specs-regression*/**/*.js',
    'metro_pcs_cache_priming':'e2e/specs-cache-priming/metro-pcs/**/*.js',
    'smoke_tests':'e2e/specs-smoke/**/*.js'},
  suite,
  directConnect: true,
  baseUrl: 'http://localhost:3000/index.html',  //use localHost if batching
  // baseUrl: 'https://analytics-staging.shoppertrak.com',
  //baseUrl: 'https://analytics.shoppertrak.com',
  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 2400000,
    //isVerbose: true
    print: function() {}
  },
  framework: 'jasmine2',
  //directConnect:true,
  allScriptsTimeout: 240000000,
  getPageTimeout: 50000,
  onPrepare: () => { return utils.onPrepareHandler(jasmine, undefined, isCoverageEnabled); },
  onComplete: () => { return utils.onCompleteHandler(isCoverageEnabled); },
  params: {
    //indirectNav: true
    downloadPath:  __dirname + '/e2e/downloads',
    localBrowser: true
  },
  //debugInfoEnabled for $compileProvider
  debugInfoEnabled:true,

  //batchEnabled
  batchEnabled:true
};
