'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync');

// Downloads the selenium webdriver
gulp.task('webdriver-update', $.protractor.webdriver_update);

gulp.task('webdriver-standalone', $.protractor.webdriver_standalone);

gulp.task('protractor-only', ['webdriver-update', 'wiredep'], function (done) {
    startProtractor('test/protractor.conf.js', done);
});

function startProtractor(configFilepath, done) {
    const testFiles = [
        'test/e2e/specs/**/*.js'
    ];

    gulp.src(testFiles)
        .pipe($.protractor.protractor({
            configFile: configFilepath
        }))
        .on('error', function (err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        })
        .on('end', function () {
            // Close browser sync server
            browserSync.exit();
            done();
        });
}


gulp.task('protractor', ['serve:e2e', 'protractor-only']);
gulp.task('protractor:src', ['serve:e2e', 'protractor-only']);
gulp.task('protractor:dist', ['serve:e2e-dist', 'protractor-only']);
