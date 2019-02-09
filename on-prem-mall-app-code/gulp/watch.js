'use strict';

const gulp = require('gulp');

gulp.task('watch', ['icons', 'styles'] ,function () {
  gulp.watch('src/assets/icons/**/*', ['icons', 'styles']);
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch([
    'src/{app,components}/**/*.js',
    '!src/{app,components}/**/*.spec.js'
  ], ['scripts']);
  gulp.watch('src/assets/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});
