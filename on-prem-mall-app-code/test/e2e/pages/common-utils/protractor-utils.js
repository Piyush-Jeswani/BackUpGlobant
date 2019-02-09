/* global angular _ */

const jasmineReporters = require('jasmine-reporters');
const SpecReporter = require('jasmine-spec-reporter');
const istanbul = require('istanbul');
const collector = new istanbul.Collector();
const collectionPromises = [];
const coverageResultsPath = `${__dirname}/../../coverage-results`;

function buildElementArrayFinderFromPromise(promiseOfElementFinders) {
  const getPromise = () => {
    return promiseOfElementFinders;
  };
  return new protractor.ElementArrayFinder(protractor, getPromise);
}

function onPrepareCiHandler(jasmine, screenSize, isCoverageEnabled) {
  // add teamcity jasmine spec reporter
  const teamCityReporter = new jasmineReporters.TeamCityReporter({
    savePath: '..',
    consolidateAll: false,
    displayStacktrace: 'all'
  });
  jasmine.getEnv().addReporter(teamCityReporter);

  return onPrepareHandlerCommon(jasmine, screenSize, isCoverageEnabled);
}

function onPrepareHandler(jasmine, screenSize, isCoverageEnabled) {
  // add jasmine spec reporter
  const reporter = new SpecReporter({ displayStacktrace: 'all' });
  jasmine.getEnv().addReporter(reporter);

  return onPrepareHandlerCommon(jasmine, screenSize, isCoverageEnabled);
}

function onCompleteHandler(isCoverageEnabled) {
  if (isCoverageEnabled) {
    return Promise.all(collectionPromises).then(() => {
      istanbul.Report.create('lcov', {
        dir: `${coverageResultsPath}/lcov`
      }).writeReport(collector, true);
    });
  }
}

function onPrepareHandlerCommon(jasmine, screenSize = 'full', isCoverageEnabled) {
  // always add coverage reporter
  console.log('coverage enabled: ', isCoverageEnabled);
  if (isCoverageEnabled) {
    jasmine.getEnv().addReporter({
      specDone(spec) {
        if (spec.status !== 'failed' && spec.status !== 'disabled') {
          collectionPromises.push(browser.driver.executeScript('return __coverage__;').then(coverageResults => {
            collector.add(coverageResults);
          }));
        }
      }
    });
  }
  let width = 1200;
  let height = 1000;  // full screen defaults
  if (screenSize === 'mobile') {
    width = 350;
    height = 550;
  }
  browser.manage().window().setSize(width, height);

  // todo: investigate removing functionality below when upgraded to protractor v3 (Jira LFR-38)
  // Disable animations so e2e tests run more quickly
  const disableNgAnimate = () => {
    angular.module('disableNgAnimate', []).run(['$animate', $animate => {
      $animate.enabled(false);
    }]);
  };
  browser.addMockModule('disableNgAnimate', disableNgAnimate);

  const disableCssAnimate = () => {
    angular.module('disableCssAnimate', []).run(() => {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '* {' +
        '-webkit-transition: none !important;' +
        '-moz-transition: none !important;' +
        '-o-transition: none !important;' +
        '-ms-transition: none !important;' +
        'transition: none !important;' +
        '}';
      document.getElementsByTagName('head')[0].appendChild(style);
    });
  };
  browser.addMockModule('disableCssAnimate', disableCssAnimate);

  const debounceRightNow = () => {
    angular.module('debounceRightNow', []).run(
      () => {
        _.debounce = callback => {
          return callback;
        };
      });
  };
  browser.addMockModule('debounceRightNow', debounceRightNow);

  addHelperMethods();
}

function addHelperMethods() {
  // ManagedPromise.asElementArrayFinder
  protractor.promise.Promise.prototype.asElementArrayFinder =
    function asElementArrayFinder() {
      return buildElementArrayFinderFromPromise(this);
    };

  // ElementArrayFinder.getTextLowerCase
  protractor.ElementArrayFinder.prototype.getTextLowerCase =
    function getTextArrayLowerCase() {
      return this.getText().then(getTextResult => {
        // assumes getTextResult is an array
        if (getTextResult == null) {
          return getTextResult;
        }

        return getTextResult.map(singleElementText => {
          return singleElementText.toLowerCase();
        });
      });
    };

  // ElementFinder.getTextLowerCase
  protractor.ElementFinder.prototype.getTextLowerCase =
    function getTextLowerCase() {
      return this.getText().then(getTextResult => {
        if (getTextResult == null) {
          return getTextResult;
        }

        return getTextResult.toLowerCase();
      });
    };
}

module.exports = {
  onPrepareHandler,
  onPrepareCiHandler,
  onCompleteHandler
};
