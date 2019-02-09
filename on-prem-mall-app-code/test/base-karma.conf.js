'use strict';

// This array contains files that we have written
const projectFiles = [
  'src/app/shoppertrak.module.js',
  'src/app/main.controller.js',
  'src/app/main.controller.spec.js',
  'src/app/shoppertrak.constants.js',

  'src/l10n/translateProvider.js',
  'src/components/**/*.module.js',
  'src/app/**/*.module.js',

  'src/**/*.js',
  'src/**/*.!(module).js',
  'src/**/*.*.*.js'
];

const dependencies = [
  // dependencies
  'bower_components/jquery/dist/jquery.js',
  'bower_components/angular/angular.js',
  'bower_components/angular-mocks/angular-mocks.js',
  'bower_components/angular-animate/angular-animate.js',
  'bower_components/angular-touch/angular-touch.js',
  'bower_components/angular-sanitize/angular-sanitize.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js',
  'bower_components/moment/moment.js',
  'bower_components/angular-moment/angular-moment.js',
  'bower_components/bootstrap-daterangepicker/daterangepicker.js',
  'bower_components/angular-strap/dist/angular-strap.js',
  'bower_components/angular-strap/dist/angular-strap.tpl.js',
  'bower_components/angular-off-click/dist/angular-off-click.js',
  'bower_components/underscore/underscore.js',
  'bower_components/angular-underscore/angular-underscore.js',
  'bower_components/angular-local-storage/dist/angular-local-storage.js',
  'bower_components/jquery-ui/jquery-ui.js',
  'bower_components/angular-ui-sortable/sortable.js',
  'bower_components/chartist/dist/chartist.min.js',
  'bower_components/highcharts/highcharts.js',
  'bower_components/highcharts/highcharts-more.js',
  'bower_components/highcharts-ng/dist/highcharts-ng.js',
  'bower_components/FileSaver/FileSaver.js',
  'bower_components/leaflet/dist/leaflet.js',
  'bower_components/angular-http-batcher/dist/angular-http-batch.js',
  'bower_components/angular-translate/angular-translate.js',
  'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
  'bower_components/perfect-scrollbar/src/perfect-scrollbar.js',
  'bower_components/angular-perfect-scrollbar/src/angular-perfect-scrollbar.js',
  'bower_components/angular-data-table/release/dataTable.js',
  'bower_components/ng-file-upload/ng-file-upload.js',
  'bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.min.js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
  'bower_components/angularjs-dragula/dist/angular-dragula.js',
  'bower_components/angular-slugify/angular-slugify.js',
  'bower_components/ag-grid-enterprise/dist/ag-grid-enterprise.js',
  'bower_components/moment-timezone/builds/moment-timezone-with-data.js',
  'bower_components/angularjs-slider/dist/rzslider.js',
  'bower_components/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
  'bower_components/angular-aria/angular-aria.min.js',
  'bower_components/angular-messages/angular-messages.min.js',
  'bower_components/angular-material/angular-material.min.js',
  // mock file
  'test/mock/multi-location-kpi-fetcher.service.mock.js',

  // Other test data
  'test/fixture/**/*.json'
];

const babelPreprocessor = {
  options: {
    presets: ['env'],
    sourceMap: 'inline'
  },
  filename: function (file) {
    return file.originalPath.replace(/\.js$/, '.es5.js');
  },
  sourceFileName: function (file) {
    return file.originalPath;
  }
};

const getSettings = () => {
  return {
    projectFiles: projectFiles,
    dependencies: dependencies,
    babelPreprocessor: babelPreprocessor
  }
};

module.exports = {
  getSettings: getSettings
};
