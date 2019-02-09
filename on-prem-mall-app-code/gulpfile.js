'use strict';
const env = global.env = require('./gulp/helpers/env.js')( __dirname + '/.envrc', Object.keys(require('./config/config.json')) );
/**
 * EnvHelper:
 * 1) Generates global constants (across a process) such as IS_DEVELOPMENT, IS_LOCAL, IS_STAGING, IS_PRODUCTION
 * 2) Stores environment name in `.envrc` and updates constants whenever set (e.g. 'gulp config:development' or env.set('development'))
 * 3) Allowed constants are checked from key names in `./config/config.json`
 */

const gulp = require('gulp');

require('require-dir')('./gulp');

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
