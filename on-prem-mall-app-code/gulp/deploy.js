'use strict';

const gulp = require('gulp');
const cloudfront = require('gulp-invalidate-cloudfront');
const awspublish = require('gulp-awspublish');
const rename = require('gulp-rename');
const argv = require('yargs').argv;

let headers = {};

let invalidationBatch = {
    CallerReference: (new Date()).toString(),
    Paths: {
        Quantity: 1,
        Items: ['/*']
    }
};


function deployBranchWithConfig(bucket, branch, _config) {
  var config = _config[0] === ':'?  _config.substr(1) : _config;

  // No cloudfront distId supplied to invalidate. Feature branches
  // are served & accessed directly from AWS s3 bucket `strdc-dev`.
  var publisher = awspublish.create({
    params: {
      Bucket: bucket,
      ACL:    'public-read' // TODO: should our test environments be public-read? if not, how to make it vpn only?
    }
  });


  gulp.src('dist/**')
    .pipe(rename(function (path) {
      path.dirname = branch + '/' + config + '/' + path.dirname;
    }))
    .pipe(awspublish.gzip())
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(awspublish.reporter());
}

function cleanConfigBranch(bucket, branch, config) {
   // No cloudfront distId supplied to invalidate. Feature branches
    // are served & accessed directly from AWS s3 bucket `strdc-dev`.
    var publisher = awspublish.create({
      params: {
        Bucket: bucket,
        ACL:    'public-read'
      }
    });

    gulp.src('noapp/**')
      .pipe(rename(function (path) {
        path.dirname = branch + '/' + config + '/' + path.dirname;
      }))
      .pipe(awspublish.gzip())
      .pipe(publisher.publish(headers, { force: true }))
      .pipe(awspublish.reporter());
}

function deploy(bucket, distId) {
    var publisher = awspublish.create({
        params: {
            Bucket: bucket,
            ACL:    'public-read'
        }
    });

  if (distId) {
    gulp.src('dist/**')
      .pipe(awspublish.gzip())
      .pipe(publisher.publish(headers))
      .pipe(awspublish.reporter())
      .pipe(
        cloudfront(
          invalidationBatch,
          { distributionId: distId }
        )
      );
  }
}


gulp.task('deploy:staging', function() {
    deploy('stlabs-dev-mall-web', 'E1XXOK2ITTWE1N');
});

gulp.task('deploy:performance', function() {
  deploy('strdc-perf', 'E3PJID1CSZVC8A');
});

gulp.task('deploy:test', () => {
    // This will generally be used when deploying a feature branch to s3 bucket `strdc-dev`.
    var branch = argv.branch || '_untagged_';
    var config = argv.config || '_none_';
    deployBranchWithConfig('strdc-dev', branch, config);
});


gulp.task('clean-branch', function() {
  var branch = argv.branch;
  if(!branch) {
    //nothing to see here
    return;
  }

  cleanConfigBranch('strdc-dev', branch, 'development');
  cleanConfigBranch('strdc-dev', branch, 'local');
  cleanConfigBranch('strdc-dev', branch, 'test');
  cleanConfigBranch('strdc-dev', branch, 'staging');
  // cleanConfigBranch('strdc-perf', branch, 'performance');

});
gulp.task('deploy:production', function() {
    deploy('stlabs-prod-mall-web', 'ENGTJW0E8SN8T');
});
