'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const gulpNgConfig = require('gulp-ng-config');
const b2v = require('buffer-to-vinyl');
const configObject = require('../config/features-config.json');

const teamcityFlags = ['allFeaturesOn'];

let pipeConfigToNgFeature = (containerConfig) => {
  let input = b2v.stream(
    new Buffer(JSON.stringify(containerConfig)), 'features-config.constants.js'
  );

  return input
    .pipe(gulpNgConfig('shopperTrak.features', {
      wrap: '/*eslint-disable */\n<%= module %> /*eslint-enable */\n'
    }))
    .pipe(gulp.dest('src/components/common/'));
}

let handleAllFeaturesOn = () => {
  console.log('enabling all features per environment rules');
  const enabled = true;
  let features = configObject.featuresConfig;

  Object.keys(features).forEach( function(key) {
    features[key] = enabled;
  });

  features.allFeaturesOn = true;

  let containerConfig = {
    featuresConfig : features
  };

  return pipeConfigToNgFeature(containerConfig)
};

let generateFeatureConfig = (enable)  => {
  let args = Object.keys(argv);

  if(args.length > 2 && typeof enable !== 'boolean') {

    // The build server receives params here, so we need to set this to false rather than throw
    enable = false;
  }

  let featuresToEnable = { };

  args.forEach((key) => {
    if(key !== '$0' && key !== '_' && !teamcityFlags.includes(key)) {
      featuresToEnable[key] = enable;
    }
  });

  let newConfig = Object.assign({}, configObject.featuresConfig, featuresToEnable);

  let containerConfig = {
    featuresConfig : newConfig
  };

  return pipeConfigToNgFeature(containerConfig);
};

gulp.task('enable-all-features', handleAllFeaturesOn);

gulp.task('generate-features', () => {
  if (argv['allFeaturesOn']) {
    handleAllFeaturesOn();
    return;
  }
  generateFeatureConfig();
});

gulp.task('enable-feature', () => {
  generateFeatureConfig(true)
});

gulp.task('disable-feature', () => {
  generateFeatureConfig(false)
});
