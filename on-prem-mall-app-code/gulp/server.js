#!/usr/bin/env node
'use strict';

const gulp = require('gulp');
const util = require('util');
const browserSync = require('browser-sync');
const middleware = require('./proxy');

let bs;

function createBrowserSyncServer(baseDir, extraOptions) {
  let options = {
      startPath: '/index.html',
      server: {
          baseDir: baseDir,
          middleware: middleware,
          routes: baseDir.toString().indexOf('src') === -1 ? null : {
            '/bower_components': 'bower_components'
          }
      },
      browser: 'default',
      ghostMode: false
  };

  Object.assign(options, extraOptions);

  bs = browserSync.init(options);
}

gulp.task('serve', ['watch'], () => {
  createBrowserSyncServer(['src', '.tmp'],{
    files: [
      'src/assets/images/**/*',
      'src/*.html',
      'src/{app,components}/**/*.html',
      'src/{app,components}/**/*.js',
      '!src/{app,components}/**/*.spec.js',
      {
        match: [
          '.tmp/*.css',
          '.tmp/{app,components}/**/*.css'
        ],
        fn: function(event, file) {
          // Hot load CSS etc
          bs.reload(file);
        }
      },
    ]
  });
});

gulp.task('serve:transpiled', ['copy-and-transpile', 'watch'], () => {
  createTransBrowserSyncServer(['.transpiled'],{
    files: [
      '.transpiled/assets/images/**/*',
      '.transpiled/*.html',
      '.transpiled/{app,components}/**/*.html',
      '.transpiled/{app,components}/**/*.js',
      '!.transpiled/{app,components}/**/*.spec.js',
      {
        match: [
          '.tmp/*.css',
          '.tmp/{app,components}/**/*.css'
        ],
        fn: function(event, file) {
          // Hot load CSS etc
          bs.reload(file);
        }
      },
    ]
  });
});

gulp.task('copy-and-transpile',[ 'transpile'], () => {
  return gulp.src([
    'src/index.html',
    '.tmp/index.css',
    '.tmp/{fonts}/**/*.*',
    'src/{app,components,l10n,assets}/**/*.*',
    '!src/{app,components,l10n}/**/*.js'
  ])
  .pipe(gulp.dest('.transpiled'))
});

function createTransBrowserSyncServer(baseDir, extraOptions) {
  let options = {
      startPath: '/index.html',
      server: {
          baseDir: baseDir,
          middleware: middleware,
          routes: {
            '/bower_components': 'bower_components'
          }
      },
      browser: 'default',
      ghostMode: false
  };

  Object.assign(options, extraOptions);

  bs = browserSync.init(options);
}

gulp.task('serve:dist', ['build'], () => {
  createBrowserSyncServer('dist');
});

gulp.task('serve:relative-paths', ['build'], () => {
  createBrowserSyncServer('dist',{
    startPath: '/mall-app/dist/index.html',
    server: {
      baseDir: '../',
      directory:true
    }
  });
});

gulp.task('serve:e2e', ['create-coverage-folder', 'js-instrument-coverage', 'icons', 'styles'], () => {
    createBrowserSyncServer(['.tmp', 'src'],{
      files: [
        'src/assets/images/**/*',
        'src/*.html',
        'src/{app,components}/**/*.html',
        '!src/{app,components}/**/*.js',
        '.tmp/{app,components}/**/*.js',
        '.tmp/*.css',
        '.tmp/{app,components}/**/*.css'
      ]
    });
});

gulp.task('serve:e2e-dist', ['build', 'watch'], () => {
  createBrowserSyncServer(
    'dist', {
    notify: false,
    browser: []
  });
});
