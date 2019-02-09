'use strict';

const baseConfig = require('../base-karma.conf');

module.exports = function(config) {
  const baseSettings = baseConfig.getSettings();

  let karmaConfiguration = {
    basePath : '../..',

    frameworks: ['jasmine'],

    autoWatch : false,

    files : baseSettings.dependencies,

    browsers : ['Chrome_with_debugging'],

    customLaunchers: {
      Chrome_with_debugging: {
        base: 'Chrome',
        flags: [ '--remote-debugging-port=9333' ]
      }
    },

    debugInfoEnabled:true,

    batchEnabled:true,

    plugins : [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-ng-json2js-preprocessor',
      'karma-coverage',
      'karma-babel-preprocessor'
    ],

    preprocessors: {
      '**/*.json': ['ng-json2js'],
      'src/**/!(*spec).js': 'coverage'
    },

    babelPreprocessor: baseSettings.babelPreprocessor,

    reporters: [
      'progress', 'coverage'
    ],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    ngJson2JsPreprocessor: {
      /*
        creates new ng module (based on name) from .json files
        e.g. '/test/fixture/example.json'
        creates
          http://localhost:9876/base/test/fixture/example.json.js
        which contains:
          angular.module('served/example.json', []).constant('served/example', { data: 'example data' });
        To use this in your tests:
          var myData = angular.injector(['ng', 'served/examples.json']).get('served/examples').data;
      */

      // strip this from the file path
      stripPrefix: 'test/fixture/',
      // prepend this to the path
      prependPrefix: 'served/'
    }
  };

  karmaConfiguration.files = karmaConfiguration.files.concat(baseSettings.projectFiles);

  baseSettings.projectFiles.forEach(function(projectFile) {
    karmaConfiguration.preprocessors[projectFile] = ['babel'];
  });

  config.set(karmaConfiguration);
};
