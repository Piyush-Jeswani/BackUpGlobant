'use strict';

const gulp = require('gulp');
const karma = require('karma');
const path = require('path');

const karmaConfigPath = path.resolve('test/karma.conf.js');
const karmaChromeConfigPath = path.resolve('test/chrome/karma.conf.js');

gulp.task('test', function(done) {
  const karmaServer = new karma.Server({
    configFile: karmaConfigPath,
    singleRun: true
  }, function(exitCode) {
    done();
    process.exit(exitCode);
  }).start();
});

gulp.task('test:debug', function(done) {
  const karmaServer = new karma.Server({
    configFile: karmaConfigPath,
    singleRun: true,
    logLevel: 'config.LOG_DEBUG'
  }, function(exitCode) {
    done();
    process.exit(exitCode);
  }).start();
});

gulp.task('test:watch', function(done) {
  const karmaServer = new karma.Server({
    configFile: karmaConfigPath,
    autoWatch: true
  }, function(exitCode) {
    done();
    process.exit(exitCode);
  }).start();
});

gulp.task('test-chrome', function(done) {
  const karmaServer = new karma.Server({
    configFile: karmaChromeConfigPath,
    singleRun: true
  }, function(exitCode) {
    done();
    process.exit(exitCode);
  }).start();
});

gulp.task('test-chrome:watch', function(done) {
  const karmaServer = new karma.Server({
    configFile: karmaChromeConfigPath,
    autoWatch: true
  }, function(exitCode) {
    done();
    process.exit(exitCode);
  }).start();
});

gulp.task('generate-test-data', function() {
  require(path.resolve('test/fixture/_generate-data.js'));
});
