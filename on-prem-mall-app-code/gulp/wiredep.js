'use strict';

const gulp = require('gulp');

// inject bower components
gulp.task('wiredep', function () {
  let wiredep = require('wiredep').stream;

  return gulp.src('src/index.html')
    .pipe(gulp.dest('src'));
});
