var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
  directConnect: true,
  
  capabilities: {
    'browserName': 'chrome'
  },

  // suites:{
  //   smoke:['../smoke/*.js']  
  //   // regression:['../regression/*.js'],
  // },
 
  framework: 'jasmine',
  
  specs: ['../OnPrem/src/ControlPanel/tests/ON669.js'],
  // specs: ['../OnPrem/src/Stan/tests/ON94.js'],
 
  // chromeOptions: {
  //   args: ['allow-file-access-from-files'],
  //   prefs: {
  //     'download': {
  //       'prompt_for_download': false,
  //       'default_directory': 'Downloads'
  //     }
  //   }

  // },
  jasmineNodeOpts: {
    defaultTimeoutInterval: 500000,
    showColors:true
  },
  allScriptsTimeout: 240000,
  getPageTimeout: 500000,

  // params:{
  //   login:{
  //     email:'test',
  //     pass:'test'
  //   }
  // },

  // npm run protractor --parameters.login.email=piyush.jeswani@globant.com

  onPrepare: function() {
    jasmine.getEnv().addReporter(
      new Jasmine2HtmlReporter({
        savePath: 'target_temp/screenshots'
      })
    );
 }

};
