(function () {
  'use strict';

  angular.module('shopperTrak').
    config(['$translateProvider', function ($translateProvider) {
      $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/languages/',
        suffix: '.json'
      });
      $translateProvider.preferredLanguage('en_US');
      $translateProvider.useSanitizeValueStrategy('escape');
    }]);
})();
