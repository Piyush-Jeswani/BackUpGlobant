'use strict';

const fs = require('fs');
const chalk = require('chalk');
const gulp = require('gulp');
const gulpIstanbul = require('gulp-babel-istanbul');
const $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});
const iconfont = require('gulp-iconfont');
const svgmin = require('gulp-svgmin');
const gulpNgConfig = require('gulp-ng-config');
const b2v = require('buffer-to-vinyl');
const gulpif = require('gulp-if');
const insert = require('gulp-insert');
const htmlhint = require('gulp-htmlhint');
const ip = require('ip');
const merge = require('gulp-merge');
const gitRepo = require('git-repo-info')();
const argv = require('yargs').argv;
const runSequence = require('run-sequence');
const mkdirp = require('mkdirp');

const myIp = ip.address();
const configObject = require('../config/config.json');
const babel = require("gulp-babel");

function handleError(err) {
  console.error(err.toString());
  this.emit('end');
}

/**
 * Uniquely names files at the specified path at with the specified extension.
 * Used to give unique names for bundled js and css files, with the goal of busting
 * the client cache.
 *
 * @param {string} path - The path to the directory containing the files
 * @param {string} fileExtension The extension of the files to rename
 */
const revise = (path, fileExtension) => {
  return gulp.src([
    `dist/${path}/*.${fileExtension}`])
    .pipe($.rev())
    .pipe(gulp.dest(`dist/${path}`))
    .pipe($.rev.manifest({ path: 'manifest.json' }))
    .pipe(gulp.dest(`dist/${path}`));
};

/**
 * Replaces references to old file names with new file names in the dist/index.html file
 * Used after a file rename operation has been completed
 *
 * @param {string} manifestPath - The path to the manifest
 */
const rename = (manifestPath) => {
  let manifest = gulp.src(manifestPath);

  return gulp.src('dist/index.html')
  .pipe($.revReplace({ manifest: manifest}))
  .pipe(gulp.dest('dist'));
};

function createConfigModule(environment, overrides) {
  let input;

  if (overrides) {
    let newConfig = {};
    newConfig[environment] = Object.assign({}, configObject[environment], overrides[environment]);
    input = b2v.stream(
      new Buffer(JSON.stringify(newConfig)), 'config.js'
    );
  } else {
    input = gulp.src('config/config.json');
  }

  env.set(environment); // env instantiated globally (gulp node process) in gulpfile.js

  let options = {
    environment: environment,
    wrap: '/*eslint-disable */\n<%= module %> /*eslint-enable */\n'
  };

  options.constants = {
    applicationVersion : ''
  };

  // gitRepo.tag contains the first tag only, which will usually be the RC tag, but we can live with this
  if (gitRepo.tag !== undefined && gitRepo.tag !== null) {
    options.constants.applicationVersion = gitRepo.tag;
  }

  // Passing in a version argument will overwrite the gitRepo.tag
  if (argv.version !== undefined) {
    options.constants.applicationVersion = argv.version;
  }

  return input
    .pipe(gulpNgConfig('shopperTrak.config', options))
    .pipe(gulp.dest('src/components/common/'));
}

gulp.task('config', () => createConfigModule('production'));
gulp.task('config:local', () => createConfigModule('local'));
gulp.task('config:development', () => createConfigModule('development'));
gulp.task('config:test', () => createConfigModule('test'));
gulp.task('config:performance', () => createConfigModule('performance'));
gulp.task('config:staging', () => createConfigModule('staging'));
gulp.task('config:docker', () => createConfigModule('local', {
  'local': {
    'apiUrl': `http://${myIp}:3010/api/v1`
  }
}));

gulp.task('styles',  function () {
  return gulp.src('src/index.scss')
    .pipe(gulpif(IS_DEVELOPMENT || IS_LOCAL, insert.prepend('$is-development: true;')))
    .pipe(gulpif(IS_DEVELOPMENT || IS_LOCAL, $.sourcemaps.init()))
    .pipe($.sass({style: 'expanded'}))
    .on('error', handleError)
    .pipe($.autoprefixer())
    .pipe(gulpif(IS_DEVELOPMENT || IS_LOCAL, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp'))
    .pipe($.size());
});

gulp.task('js-instrument-coverage', ['scripts'], () => {
  return gulp.src(['src/{app,components}/**/*.js', '!src/{app,components}/**/*.spec.js'])
    .pipe(gulpIstanbul({
      includeUntested: true,
      coverageVariable: '__coverage__'
    }))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('create-coverage-folder', () => {
  mkdirp.sync('test/e2e/coverage-results');
});

gulp.task('scripts', ['eslint']);

gulp.task('eslint', () => {
  gulp.src(['src/{app,components}/**/*.js', '!src/{app,components}/**/*.spec.js'])
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.size());
});

gulp.task('lint-staged-files', (done) => require('staged-git-files')((err, results) => {
  if (err) throw err;

  let lintableJs = [];
  let lintableHtml = [];

  for (let stagedFile of results) {
    if (!stagedFile.status.match(/Modified|Added/)) continue;
    let fname = stagedFile.filename;
    if (!fname.startsWith('test/e2e') && fname.endsWith('.js') && !fname.endsWith('.spec.js')) lintableJs.push(fname);
    if (fname.endsWith('.html')) lintableHtml.push(fname);
  }

  let tasks = [];

  if (lintableJs.length) tasks.push(
    gulp.src(lintableJs)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError())
    .pipe($.size())
  );

  if (lintableHtml.length) tasks.push(
    gulp.src(lintableHtml)
    .pipe(htmlhint('.htmlhintrc'))
    .pipe(htmlhint.reporter('htmlhint-stylish'))
    .pipe(htmlhint.failReporter())
  );

  switch (tasks.length) {
    case 0: done(); return;
    case 1: return tasks[0];
    default: return merge(...tasks);
  }

}));

gulp.task('partials', ['htmlhint'], () =>
  gulp.src('src/{app,components}/**/*.html')
  .pipe($.minifyHtml({
    empty: true,
    spare: true,
    quotes: true
  }))
  .pipe($.ngHtml2js({
    moduleName: 'shopperTrak'
  }))
  .pipe(gulp.dest('.tmp'))
  .pipe($.size())
);

gulp.task('htmlhint', () =>
  gulp.src('src/**/*.html')
  .pipe(gulpif(IS_DEVELOPMENT || IS_LOCAL, htmlhint('.htmlhintrc')))
  .pipe(gulpif(IS_DEVELOPMENT || IS_LOCAL, htmlhint.reporter('htmlhint-stylish')))
);

gulp.task('revise-js-names', function() {
  return revise('scripts', 'js');
});

gulp.task('revise-css-names', function() {
  return revise('styles', 'css');
});

gulp.task('update-js-names', function() {
  return rename('dist/scripts/manifest.json');
});

gulp.task('update-css-names', function() {
  return rename('dist/styles/manifest.json');
});

gulp.task('clean-revisions', function () {
  var files = [
    'dist/scripts/vendor.js',
    'dist/scripts/app.js',
    'dist/scripts/manifest.json',
    'dist/styles/vendor.css',
    'dist/styles/app.css',
    'dist/styles/manifest.json',
   ];
  $.del(files);
});

gulp.task('transpile', () => {
  return gulp.src('src/{app,components,l10n}/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('.transpiled'));
});


gulp.task('html', ['styles', 'scripts', 'partials', 'transpile'], function () {
  let htmlFilter = $.filter('*.html', { restore: true });
  let jsFilter = $.filter('**/*.js', { restore: true });
  let cssFilter = $.filter('**/*.css', { restore: true });

  return gulp.src('src/*.html')
    .pipe(insert.prepend(`<!-- ${gitRepo.branch || ''} ${gitRepo.tag ? `${gitRepo.tag}` : ''} ${gitRepo.abbreviatedSha || ''} ${gitRepo.committerDate || '' }  -->`))
    .pipe($.inject(
      gulp.src('.tmp/{app,components}/**/*.js',{read: false}),
      {
        starttag: '<!-- inject:partials -->',
        addRootSlash: false,
        addPrefix: '../'
      }
    ))
    .pipe($.useref())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe($.uglify({
      preserveComments: $.uglifySaveLicense
    }))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.replace('bower_components/bootstrap-sass-official/assets/fonts/bootstrap', 'fonts'))
    .pipe($.csso())
    .pipe(cssFilter.restore)
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', () =>
  gulp.src('src/assets/images/**/*')
  .pipe($.cache($.imagemin({
    optimizationLevel: 3,
    progressive: true,
    interlaced: true
  })))
  .pipe(gulp.dest('dist/assets/images'))
  .pipe($.size())
);

gulp.task('translations', () =>
  gulp.src(['src/l10n/**/*.json'])
  .pipe($.jsonminify())
  .pipe(gulp.dest('dist/l10n'))
  .pipe($.size())
);

gulp.task('icons', () =>
  gulp.src(['src/assets/icons/*.svg'])
  .pipe(iconfont({
    fontName: 'shoppertrak-icons',
    formats: ['ttf', 'eot', 'woff', 'svg']
  }))
  .pipe(gulp.dest('.tmp/fonts/'))
  .pipe($.size())
);

gulp.task('icons:optimize', () =>
  gulp.src(['src/assets/icons/*.svg'])
  .pipe(svgmin())
  .pipe(gulp.dest('src/assets/icons'))
);

gulp.task('icons-wkhtmltopdf-workaround', ['icons'], () => {
  const warnPrefix = chalk.red('[icons-wkhtmltopdf-workaround] ');
  const ttfPath = process.env.INIT_CWD + '/.tmp/fonts/shoppertrak-icons.ttf';
  if (!fs.existsSync(ttfPath)) throw Error(warnPrefix + `Unable to open file '${ttfPath}'`);

  return gulp.src('src/components/common/_icons-wkhtmltopdf-override.template.txt')
    .pipe($.replace('$$B64HERE$$', fs.readFileSync(ttfPath, {}, (_) => _).toString('base64')))
    .pipe($.rename((p) => {
      p.basename = p.basename.replace('_','').replace('.template','');
      p.extname = '.css';
    }))
    .pipe(gulp.dest('.tmp'))
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', ['bootstrap-fonts', 'icons'], () =>
  gulp.src('.tmp/fonts/**/*')
  .pipe($.flatten())
  .pipe(gulp.dest('dist/fonts'))
  .pipe($.size())
);

gulp.task('bootstrap-fonts', function() {
  const bootstrapFilter = $.filter('**/*.{eot,ttf,woff,woff2}', { restore: true });
  return gulp.src('bower_components/bootstrap-sass-official/assets/fonts/bootstrap/**/*')
    .pipe(bootstrapFilter)
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('misc', () =>
  gulp.src('src/**/*.ico')
  .pipe(gulp.dest('dist'))
  .pipe($.size())
);

gulp.task('clean', function (done) {
  $.del(['.tmp', 'dist', 'test/e2e/coverage-results', '.transpiled'], done);
});

gulp.task('clean:config', function (done) {
  $.del([
    '.envrc',
    'src/components/common/config.js',
    'src/components/common/features-config.constants.js'
  ], done);
});

gulp.task('clearCache', function (done) {
  $.cache.clearAll(done);
});

gulp.task('build', function(callback) {
  runSequence('html',
              'revise-js-names',
              'revise-css-names',
              'update-js-names',
              'update-css-names',
               ['images',
               'translate',
               'translations',
               'icons',
               'icons-wkhtmltopdf-workaround',
               'fonts',
               'misc',
               'generate-test-data',
               'generate-features',
               'clean-revisions'], callback)
});
